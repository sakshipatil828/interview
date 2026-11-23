from typing import List, Optional, Any, Dict
from pydantic import BaseModel, Field


class FinalScorecardCreate(BaseModel):
    roundScores: Dict[str, Any]  # e.g. {"aptitude": 85, "technical": 90, "hr": 88}
    overallScore: float = Field(..., ge=0.0, le=100.0)
    strengths: List[str] = Field(default_factory=list)
    weaknesses: List[str] = Field(default_factory=list)
    recommendations: Any = Field(default_factory=list)


class FinalScorecardOut(BaseModel):
    id: str
    interviewSessionId: str
    userId: str
    roundScores: Dict[str, Any]
    overallScore: float
    strengths: List[str]
    weaknesses: List[str]
    recommendations: Any
    createdAt: str


class ExperienceFeedbackCreate(BaseModel):
    userFeedback: str = Field(..., min_length=3)
    difficultyRating: str
    confidenceRating: str
    improvementGoals: Any = Field(default_factory=list)
    rating: Optional[float] = 5.0


class ExperienceFeedbackOut(BaseModel):
    id: str
    interviewSessionId: str
    userId: str
    userFeedback: str
    difficultyRating: str
    confidenceRating: str
    improvementGoals: Any
    rating: Optional[float]
    submittedAt: str
