import hmac
import hashlib
import secrets
from fastapi import Request, HTTPException, status, Response
from backend.config import settings


def generate_csrf_token() -> str:
    """Generates an opaque cryptographically random CSRF token."""
    return secrets.token_hex(24)


def set_csrf_cookie(response: Response, csrf_token: str) -> None:
    """Sets a readable CSRF cookie so the frontend SPA can send it back in a header."""
    response.set_cookie(
        key=settings.CSRF_COOKIE_NAME,
        value=csrf_token,
        max_age=settings.SESSION_MAX_AGE_SECONDS,
        path="/",
        httponly=False,  # Accessible to JavaScript for header attachment
        secure=settings.get_cookie_secure(),
        samesite=settings.COOKIE_SAMESITE,
    )


def verify_csrf_token(request: Request) -> bool:
    """
    Validates CSRF for state-changing requests.
    Exempts safe HTTP methods (GET, HEAD, OPTIONS).
    Accepts:
    1. Matching x-csrf-token header against CSRF cookie.
    2. Valid custom standard AJAX headers (e.g. X-Requested-With: XMLHttpRequest).
    """
    if not settings.CSRF_PROTECTION:
        return True

    if request.method in ("GET", "HEAD", "OPTIONS"):
        return True

    # Exempt public authentication entry points
    exempt_paths = [
        "/api/auth/register",
        "/api/auth/login",
        "/api/auth/csrf",
    ]
    if any(request.url.path.startswith(p) for p in exempt_paths):
        return True

    # 1. Custom header check (browser CORS blocks cross-origin custom headers)
    custom_requested_with = request.headers.get("x-requested-with")
    if custom_requested_with and custom_requested_with.lower() in ("xmlhttprequest", "careercurve-app"):
        return True

    # 2. Token header vs cookie comparison
    header_token = request.headers.get(settings.CSRF_HEADER_NAME)
    cookie_token = request.cookies.get(settings.CSRF_COOKIE_NAME)

    if header_token and cookie_token:
        if hmac.compare_digest(header_token, cookie_token):
            return True

    # If neither passed on state-changing request
    raise HTTPException(
        status_code=status.HTTP_403_FORBIDDEN,
        detail="CSRF validation failed: Missing or invalid CSRF token header."
    )
