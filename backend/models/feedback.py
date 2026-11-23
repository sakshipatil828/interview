import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Float, Text, JSON, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from backend.database import Base


def utcnow():
    return datetime.now(timezone.utc)


class FinalScorecard(Base):
    __tablename__ = "final_scorecards"

    id = Column(String(64), primary_key=True, default=lambda: f"sc_{uuid.uuid4().hex[:12]}")
    interview_session_id = Column(String(64), ForeignKey("interview_sessions.id", ondelete="CASCADE"), index=True, nullable=False)
    user_id = Column(String(64), ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False)

    round_scores = Column(JSON, nullable=False)  # {"aptitude": 85, "technical": 90, "hr": 88}
    overall_score = Column(Float, nullable=False, default=0.0)
    strengths = Column(JSON, nullable=False)  # List of strengths
    weaknesses = Column(JSON, nullable=False)  # List of weaknesses
    recommendations = Column(JSON, nullable=False)  # Recommendations and 7-day plan
    
    created_at = Column(DateTime(timezone=True), default=utcnow, nullable=False)

    interview_session = relationship("InterviewSession", back_populates="final_scorecard")


class ExperienceFeedback(Base):
    __tablename__ = "experience_feedback"

    id = Column(String(64), primary_key=True, default=lambda: f"fb_{uuid.uuid4().hex[:12]}")
    interview_session_id = Column(String(64), ForeignKey("interview_sessions.id", ondelete="CASCADE"), index=True, nullable=False)
    user_id = Column(String(64), ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False)

    user_feedback = Column(Text, nullable=False)
    difficulty_rating = Column(String(64), nullable=False)  # e.g. "Too Easy", "Just Right", "Challenging"
    confidence_rating = Column(String(64), nullable=False)  # e.g. "Very Confident", "Moderate", "Needs Practice"
    improvement_goals = Column(JSON, nullable=False)  # Target skills / focus areas
    rating = Column(Float, nullable=True, default=5.0)

    submitted_at = Column(DateTime(timezone=True), default=utcnow, nullable=False)

    interview_session = relationship("InterviewSession", back_populates="experience_feedback")
