import re
from argon2 import PasswordHasher
from argon2.exceptions import VerifyMismatchError, VerificationError

ph = PasswordHasher(
    time_cost=3,
    memory_cost=65536,
    parallelism=4,
    hash_len=32,
    salt_len=16
)


def hash_password(password: str) -> str:
    """Hashes a password securely using Argon2id."""
    return ph.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verifies a plain password against an Argon2 hash (with legacy fallback support)."""
    if not hashed_password:
        return False
    try:
        return ph.verify(hashed_password, plain_password)
    except (VerifyMismatchError, VerificationError):
        # Check if legacy pbkdf2 hash format "salt:hash"
        if ":" in hashed_password and not hashed_password.startswith("$"):
            try:
                import hashlib
                salt, stored_hash = hashed_password.split(":", 1)
                calculated = hashlib.pbkdf2_hmac("sha512", plain_password.encode(), salt.encode(), 10000).hex()
                return calculated == stored_hash
            except Exception:
                return False
        return False


def validate_password_strength(password: str) -> tuple[bool, str]:
    """
    Validates password requirements:
    - At least 8 characters
    - Must contain at least one letter and at least one digit or special symbol
    """
    if not password or len(password) < 8:
        return False, "Password must be at least 8 characters long."
    if not re.search(r"[A-Za-z]", password):
        return False, "Password must contain at least one letter."
    if not re.search(r"[\d\W_]", password):
        return False, "Password must contain at least one digit or special character."
    return True, ""
