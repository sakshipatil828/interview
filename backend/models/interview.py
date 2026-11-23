import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Integer, Float, Text, JSON, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from backend.database import Base


def utcnow():
    return datetime.now(timezone.utc)


class InterviewSession(Base):
    __tablename__ = "interview_sessions"

    id = Column(String(64), primary_key=True, default=lambda: f"isess_{uuid.uuid4().hex[:12]}")
    user_id = Column(String(64), ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False)
    
    target_role = Column(String(120), nullable=False)
    branch = Column(String(120), nullable=False)
    selected_rounds = Column(JSON, nullable=False)  # e.g. ["aptitude", "technical", "hr"]
    difficulty = Column(String(64), nullable=False, default="Intermediate")
    mode = Column(String(64), nullable=False, default="practice")
    status = Column(String(64), nullable=False, default="in_progress", index=True)  # in_progress, completed, abandoned
    
    current_round = Column(String(64), nullable=True, default="aptitude")
    started_at = Column(DateTime(timezone=True), default=utcnow, nullable=False)
    completed_at = Column(DateTime(timezone=True), nullable=True)

    user = relationship("User", back_populates="interview_sessions")
    aptitude_result = relationship("AptitudeResult", back_populates="interview_session", uselist=False, cascade="all, delete-orphan")
    technical_result = relationship("TechnicalResult", back_populates="interview_session", uselist=False, cascade="all, delete-orphan")
    hr_voice_result = relationship("HRVoiceResult", back_populates="interview_session", uselist=False, cascade="all, delete-orphan")
    final_scorecard = relationship("FinalScorecard", back_populates="interview_session", uselist=False, cascade="all, delete-orphan")
    experience_feedback = relationship("ExperienceFeedback", back_populates="interview_session", uselist=False, cascade="all, delete-orphan")


class AptitudeResult(Base):
    __tablename__ = "aptitude_results"

    id = Column(String(64), primary_key=True, default=lambda: f"apt_{uuid.uuid4().hex[:12]}")
    interview_session_id = Column(String(64), ForeignKey("interview_sessions.id", ondelete="CASCADE"), index=True, nullable=False)
    user_id = Column(String(64), ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False)

    answers = Column(JSON, nullable=False)  # User answers & question states
    score = Column(Float, nullable=False, default=0.0)
    accuracy = Column(Float, nullable=False, default=0.0)
    total_questions = Column(Integer, nullable=False, default=0)
    correct_answers = Column(Integer, nullable=False, default=0)
    time_spent_seconds = Column(Integer, nullable=False, default=0)
    
    completed_at = Column(DateTime(timezone=True), default=utcnow, nullable=False)

    interview_session = relationship("InterviewSession", back_populates="aptitude_result")


class TechnicalResult(Base):
    __tablename__ = "technical_results"

    id = Column(String(64), primary_key=True, default=lambda: f"tech_{uuid.uuid4().hex[:12]}")
    interview_session_id = Column(String(64), ForeignKey("interview_sessions.id", ondelete="CASCADE"), index=True, nullable=False)
    user_id = Column(String(64), ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False)

    questions = Column(JSON, nullable=False)
    answers = Column(JSON, nullable=False)
    evaluation = Column(JSON, nullable=False)
    score = Column(Float, nullable=False, default=0.0)
    feedback = Column(Text, nullable=True)

    completed_at = Column(DateTime(timezone=True), default=utcnow, nullable=False)

    interview_session = relationship("InterviewSession", back_populates="technical_result")


class HRVoiceResult(Base):
    __tablename__ = "hr_voice_results"

    id = Column(String(64), primary_key=True, default=lambda: f"hr_{uuid.uuid4().hex[:12]}")
    interview_session_id = Column(String(64), ForeignKey("interview_sessions.id", ondelete="CASCADE"), index=True, nullable=False)
    user_id = Column(String(64), ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False)

    transcript = Column(JSON, nullable=True)  # Where user consented
    answers = Column(JSON, nullable=False)
    score = Column(Float, nullable=False, default=0.0)
    feedback = Column(Text, nullable=True)
    metrics = Column(JSON, nullable=True)  # Speech pace, filler words, clarity

    completed_at = Column(DateTime(timezone=True), default=utcnow, nullable=False)

    interview_session = relationship("InterviewSession", back_populates="hr_voice_result")
