import secrets
from datetime import datetime, timedelta, timezone
from typing import Optional, Tuple
from fastapi import Response, Request
from sqlalchemy.orm import Session as DBSession

from backend.config import settings
from backend.models.user import Session as SessionModel, User


def utcnow() -> datetime:
    return datetime.now(timezone.utc)


def generate_opaque_session_token() -> str:
    """Generates a cryptographically random 48-byte URL-safe opaque token."""
    return f"cc_sess_{secrets.token_urlsafe(36)}"


def create_user_session(
    db: DBSession,
    user_id: str,
    user_agent: Optional[str] = None,
    ip_address: Optional[str] = None
) -> Tuple[str, SessionModel]:
    """
    Creates an opaque session token, persists the session in PostgreSQL,
    and returns (token, session_record).
    """
    token = generate_opaque_session_token()
    now = utcnow()
    expires_at = now + timedelta(seconds=settings.SESSION_MAX_AGE_SECONDS)

    session_record = SessionModel(
        id=token,
        user_id=user_id,
        created_at=now,
        expires_at=expires_at,
        is_revoked=False,
        user_agent=user_agent[:255] if user_agent else None,
        ip_address=ip_address[:64] if ip_address else None,
    )
    db.add(session_record)
    db.commit()
    db.refresh(session_record)
    return token, session_record


def validate_session(
    db: DBSession,
    token: str
) -> Tuple[Optional[User], Optional[SessionModel]]:
    """
    Validates a session token against PostgreSQL:
    - Verifies token existence
    - Verifies is_revoked == False
    - Verifies expires_at > now
    - Slides the expiration window on active sessions
    Returns (user, session_record) or (None, None).
    """
    if not token or not isinstance(token, str):
        return None, None

    clean_token = token.strip()
    session_record = db.query(SessionModel).filter(
        SessionModel.id == clean_token
    ).first()

    if not session_record:
        return None, None

    if session_record.is_revoked:
        return None, None

    now = utcnow()
    # Normalize expires_at timezone if naive
    expires_at = session_record.expires_at
    if expires_at.tzinfo is None:
        expires_at = expires_at.replace(tzinfo=timezone.utc)

    if now > expires_at:
        # Session expired: mark revoked
        session_record.is_revoked = True
        db.commit()
        return None, None

    # Slide expiration window for active session
    session_record.expires_at = now + timedelta(seconds=settings.SESSION_MAX_AGE_SECONDS)
    db.commit()

    user = db.query(User).filter(User.id == session_record.user_id).first()
    if not user or user.status != "active":
        return None, None

    return user, session_record


def revoke_session(db: DBSession, token: str) -> bool:
    """Marks a session as revoked in the database."""
    if not token:
        return False
    session_record = db.query(SessionModel).filter(SessionModel.id == token.strip()).first()
    if session_record:
        session_record.is_revoked = True
        db.commit()
        return True
    return False


def revoke_all_user_sessions(db: DBSession, user_id: str) -> int:
    """Revokes all active sessions for a user (e.g. on password change or delete)."""
    count = db.query(SessionModel).filter(
        SessionModel.user_id == user_id,
        SessionModel.is_revoked == False
    ).update({"is_revoked": True})
    db.commit()
    return count


def set_session_cookie(response: Response, token: str) -> None:
    """Sets the secure HttpOnly cookie on the response."""
    response.set_cookie(
        key=settings.SESSION_COOKIE_NAME,
        value=token,
        max_age=settings.SESSION_MAX_AGE_SECONDS,
        expires=settings.SESSION_MAX_AGE_SECONDS,
        path=settings.COOKIE_PATH,
        httponly=True,
        secure=settings.get_cookie_secure(),
        samesite=settings.COOKIE_SAMESITE,
    )


def clear_session_cookie(response: Response) -> None:
    """Clears the session cookie on logout."""
    response.delete_cookie(
        key=settings.SESSION_COOKIE_NAME,
        path=settings.COOKIE_PATH,
        httponly=True,
        secure=settings.get_cookie_secure(),
        samesite=settings.COOKIE_SAMESITE,
    )


def extract_session_token(request: Request) -> Optional[str]:
    """
    Extracts session token prioritizing the HttpOnly cookie,
    with Authorization: Bearer fallback for programmatic/API clients.
    """
    token = request.cookies.get(settings.SESSION_COOKIE_NAME)
    if not token:
        auth_header = request.headers.get("authorization")
        if auth_header and auth_header.startswith("Bearer "):
            token = auth_header[7:].strip()
    return token
