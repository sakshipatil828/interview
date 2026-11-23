import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Integer, Text, JSON, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from backend.database import Base


def utcnow():
    return datetime.now(timezone.utc)


class Resume(Base):
    __tablename__ = "resumes"

    id = Column(String(64), primary_key=True, default=lambda: f"res_{uuid.uuid4().hex[:12]}")
    user_id = Column(String(64), ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False)
    filename = Column(String(255), nullable=False)
    file_size = Column(String(64), nullable=True, default="")
    raw_text = Column(Text, nullable=True)
    
    # Structured extracted sections
    extracted_skills = Column(JSON, nullable=True)
    education = Column(JSON, nullable=True)
    experience = Column(JSON, nullable=True)
    projects = Column(JSON, nullable=True)
    certifications = Column(JSON, nullable=True)
    parsed_data = Column(JSON, nullable=True)  # Full ParsedResume JSON
    
    ats_score = Column(Integer, nullable=True, default=0)
    resume_score = Column(Integer, nullable=True, default=0)
    match_rank = Column(String(120), nullable=True, default="")
    
    uploaded_at = Column(DateTime(timezone=True), default=utcnow, nullable=False)

    user = relationship("User", back_populates="resumes")
