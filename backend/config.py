import os
from typing import List
from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    PROJECT_NAME: str = "CareerCurve AI Interview Preparation Platform"
    ENVIRONMENT: str = Field(default="development", description="Environment: development, staging, production")
    
    # Database Settings - PostgreSQL by default
    DATABASE_URL: str = Field(
        default="postgresql+psycopg://postgres:postgres@localhost:5432/careercurve",
        description="PostgreSQL database connection URL (e.g. postgresql+psycopg://user:pass@host:port/dbname)"
    )
    DB_ECHO: bool = False
    
    # Authentication & Session Security
    SECRET_KEY: str = Field(
        default="careercurve_default_development_secret_key_change_in_production_2026",
        description="Cryptographic secret key for session signing and hashing"
    )
    SESSION_COOKIE_NAME: str = "careercurve_session"
    SESSION_MAX_AGE_SECONDS: int = 7 * 24 * 60 * 60  # 7 days
    COOKIE_SAMESITE: str = "lax"  # lax for browser navigation compatibility
    COOKIE_SECURE: bool = False  # Overridden in production over HTTPS
    COOKIE_PATH: str = "/"
    
    # CORS Trusted Origins
    CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ]
    
    # CSRF Protection
    CSRF_HEADER_NAME: str = "x-csrf-token"
    CSRF_COOKIE_NAME: str = "careercurve_csrf"
    
    # Admin Seed Defaults
    INITIAL_ADMIN_EMAIL: str = "admin@careercurve.ai"
    INITIAL_ADMIN_NAME: str = "CareerCurve System Administrator"
    
    model_config = SettingsConfigDict(
        env_file=os.path.join(os.path.dirname(os.path.dirname(__file__)), ".env"),
        env_file_encoding="utf-8",
        extra="ignore"
    )

    def is_production(self) -> bool:
        return self.ENVIRONMENT.lower() in ("production", "prod")

    def get_cookie_secure(self) -> bool:
        # In production, cookies MUST be Secure
        if self.is_production():
            return True
        return self.COOKIE_SECURE


settings = Settings()
