import logging
from fastapi import APIRouter, Depends, HTTPException, status, Response, Request
from sqlalchemy.orm import Session as DBSession

from backend.database import get_db
from backend.models.user import User, Session as SessionModel
from backend.schemas.auth import RegisterRequest, LoginRequest, UserOut, AuthResponse
from backend.security.hashing import hash_password, verify_password, validate_password_strength
from backend.security.session import (
    create_user_session,
    revoke_session,
    set_session_cookie,
    clear_session_cookie,
    extract_session_token,
)
from backend.security.csrf import generate_csrf_token, set_csrf_cookie
from backend.dependencies import get_current_user_and_session, get_current_user

logger = logging.getLogger("careercurve.auth")
router = APIRouter(prefix="/api/auth", tags=["Authentication"])


def user_to_safe_out(user: User, token: str = None) -> UserOut:
    """Converts a database User model into safe UserOut schema, omitting secrets."""
    created_str = user.created_at.isoformat() if user.created_at else ""
    return UserOut(
        id=user.id,
        name=user.name,
        email=user.email,
        role=user.role,
        status=user.status,
        phone=user.phone or "",
        college=user.college or "",
        degree=user.degree or "",
        department=user.department or "",
        semester=user.semester or "",
        graduationYear=user.graduation_year or "",
        linkedin=user.linkedin or "",
        github=user.github or "",
        createdAt=created_str,
        token=token,
    )


@router.post("/register", response_model=AuthResponse, status_code=status.HTTP_201_CREATED)
def register(
    req: RegisterRequest,
    response: Response,
    request: Request,
    db: DBSession = Depends(get_db)
):
    """
    Registers a new student account in PostgreSQL:
    - Validates email format and uniqueness.
    - Enforces password strength rules.
    - Hashes password using Argon2id.
    - Creates server session and sets HttpOnly cookie.
    """
    # 1. Validate password match
    if req.password != req.confirmPassword:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Passwords do not match."
        )

    # 2. Validate password strength
    valid_pwd, pwd_error = validate_password_strength(req.password)
    if not valid_pwd:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=pwd_error
        )

    # 3. Check duplicate email (case-insensitive)
    clean_email = req.email.strip().lower()
    existing_user = db.query(User).filter(User.email == clean_email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This email address is already registered. Please log in or use another email."
        )

    # 4. Hash password with Argon2
    hashed_pwd = hash_password(req.password)

    # 5. Persist user in PostgreSQL
    new_user = User(
        name=req.fullName.strip(),
        email=clean_email,
        password_hash=hashed_pwd,
        role="user",
        status="active",
        phone=req.phone.strip() if req.phone else "",
        college=req.college.strip() if req.college else "University Institute of Technology",
        degree=req.degree.strip() if req.degree else "B.Tech",
        department=req.department.strip() if req.department else "Computer Science & Engineering",
        semester=req.semester.strip() if req.semester else "Semester 7",
        graduation_year=req.graduationYear.strip() if req.graduationYear else "2026",
        linkedin=req.linkedin.strip() if req.linkedin else "",
        github=req.github.strip() if req.github else "",
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    # 6. Establish server session and set HttpOnly cookie
    user_agent = request.headers.get("user-agent")
    client_ip = request.client.host if request.client else None
    token, _ = create_user_session(db, new_user.id, user_agent, client_ip)
    set_session_cookie(response, token)

    # Set CSRF cookie for subsequent requests
    csrf_tok = generate_csrf_token()
    set_csrf_cookie(response, csrf_tok)

    logger.info(f"User registered successfully: {new_user.id} ({new_user.email})")
    return AuthResponse(
        success=True,
        message="Registration successful! Welcome to CareerCurve AI.",
        user=user_to_safe_out(new_user, token),
    )


@router.post("/login", response_model=AuthResponse)
def login(
    req: LoginRequest,
    response: Response,
    request: Request,
    db: DBSession = Depends(get_db)
):
    """
    Authenticates a user against PostgreSQL:
    - Verifies Argon2 password hash.
    - Creates server session in database.
    - Sets HttpOnly session cookie.
    """
    clean_email = req.email.strip().lower()
    user = db.query(User).filter(User.email == clean_email).first()

    if not user or not verify_password(req.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password."
        )

    if user.status != "active":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Your account has been suspended. Please contact administrator."
        )

    user_agent = request.headers.get("user-agent")
    client_ip = request.client.host if request.client else None
    token, _ = create_user_session(db, user.id, user_agent, client_ip)
    set_session_cookie(response, token)

    # Issue fresh CSRF cookie
    csrf_tok = generate_csrf_token()
    set_csrf_cookie(response, csrf_tok)

    logger.info(f"User logged in: {user.id} ({user.email})")
    return AuthResponse(
        success=True,
        message="Sign in successful.",
        user=user_to_safe_out(user, token),
    )


@router.post("/logout")
def logout(
    response: Response,
    request: Request,
    db: DBSession = Depends(get_db)
):
    """
    Revokes the current server session in PostgreSQL and clears the session cookie.
    """
    token = extract_session_token(request)
    if token:
        revoke_session(db, token)

    clear_session_cookie(response)
    return {
        "success": True,
        "message": "Logged out successfully. Session invalidated."
    }


@router.get("/me")
def get_me(
    pair: tuple[User, SessionModel] = Depends(get_current_user_and_session)
):
    """
    Validates current session from cookie and returns safe user profile.
    """
    user, session_record = pair
    return {
        "success": True,
        "user": user_to_safe_out(user, session_record.id),
    }


@router.get("/csrf")
def get_csrf(response: Response):
    """
    Issues a fresh CSRF token and sets the CSRF cookie.
    """
    csrf_tok = generate_csrf_token()
    set_csrf_cookie(response, csrf_tok)
    return {
        "success": True,
        "csrfToken": csrf_tok
    }
