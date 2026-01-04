from pwdlib import PasswordHash
import secrets

password_hash = PasswordHash.recommended()


def hash_password(password: str) -> str:
    """Hash a plain-text password using Argon2."""
    return password_hash.hash(password)


def verify_password(password: str, hashed: str) -> bool:
    """Verify a plain-text password against a stored Argon2 hash."""
    return password_hash.verify(password, hashed)


def create_session_token() -> str:
    """Generate a secure random session token."""
    return secrets.token_urlsafe(32)
