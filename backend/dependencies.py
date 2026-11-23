from fastapi import Depends, HTTPException, status, Request
from sqlalchemy.orm import Session as DBSession

from backend.database import get_db
from backend.models.user import User, Session as SessionModel
from backend.security.session import extract_session_token, validate_session


def get_current_user_and_session(
    request: Request,
    db: DBSession = Depends(get_db)
) -> tuple[User, SessionModel]:
    """
    Validates the caller's server session.
    Extracts the opaque session token from HttpOnly cookie or Authorization header,
    looks it up in PostgreSQL, verifies expiration & revocation, and returns (user, session).
    """
    token = extract_session_token(request)
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Unauthorized. Please log in or create an account to access this feature."
        )

    user, session_record = validate_session(db, token)
    if not user or not session_record:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Unauthorized. Please log in or create an account to access this feature."
        )

    if user.status != "active":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is suspended. Please contact platform administration."
        )

    return user, session_record


def get_current_user(
    pair: tuple[User, SessionModel] = Depends(get_current_user_and_session)
) -> User:
    """Dependency that injects the verified current User."""
    return pair[0]


def get_current_admin(
    current_user: User = Depends(get_current_user)
) -> User:
    """
    Enforces that the authenticated user possesses the 'admin' role.
    Rejects ordinary users with 403 Forbidden.
    """
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Forbidden. Admin privileges required."
        )
    return current_user
