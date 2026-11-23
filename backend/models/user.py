import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey, Index
from sqlalchemy.orm import relationship
from backend.database import Base


def utcnow():
    return datetime.now(timezone.utc)


class User(Base):
    __tablename__ = "users"

    id = Column(String(64), primary_key=True, default=lambda: f"usr_{uuid.uuid4().hex[:12]}")
    name = Column(String(120), nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    role = Column(String(32), default="user", nullable=False, index=True)  # "user" or "admin"
    status = Column(String(32), default="active", nullable=False)  # "active", "suspended"
    
    # Candidate profile attributes
    phone = Column(String(64), nullable=True, default="")
    college = Column(String(255), nullable=True, default="University Institute of Technology")
    degree = Column(String(120), nullable=True, default="B.Tech")
    department = Column(String(120), nullable=True, default="Computer Science & Engineering")
    semester = Column(String(64), nullable=True, default="Semester 7")
    graduation_year = Column(String(32), nullable=True, default="2026")
    linkedin = Column(String(255), nullable=True, default="")
    github = Column(String(255), nullable=True, default="")
    
    created_at = Column(DateTime(timezone=True), default=utcnow, nullable=False)
    updated_at = Column(DateTime(timezone=True), default=utcnow, onupdate=utcnow)

    # Relationships
    sessions = relationship("Session", back_populates="user", cascade="all, delete-orphan")
    resumes = relationship("Resume", back_populates="user", cascade="all, delete-orphan")
    interview_sessions = relationship("InterviewSession", back_populates="user", cascade="all, delete-orphan")


class Session(Base):
    __tablename__ = "sessions"

    id = Column(String(128), primary_key=True)  # Secure opaque session token
    user_id = Column(String(64), ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False)
    created_at = Column(DateTime(timezone=True), default=utcnow, nullable=False)
    expires_at = Column(DateTime(timezone=True), nullable=False, index=True)
    is_revoked = Column(Boolean, default=False, nullable=False, index=True)
    user_agent = Column(String(255), nullable=True)
    ip_address = Column(String(64), nullable=True)

    user = relationship("User", back_populates="sessions")

    __table_args__ = (
        Index("idx_session_lookup", "id", "is_revoked", "expires_at"),
    )
