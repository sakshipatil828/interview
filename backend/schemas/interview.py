from typing import List, Optional, Any, Dict
from pydantic import BaseModel, Field


class InterviewSessionCreate(BaseModel):
    targetRole: str = Field(..., min_length=2)
    branch: str = Field(..., min_length=2)
    selectedRounds: List[str] = Field(default_factory=lambda: ["aptitude", "technical", "hr"])
    difficulty: str = Field(default="Intermediate")
    mode: str = Field(default="practice")


class InterviewSessionOut(BaseModel):
    id: str
    userId: str
    targetRole: str
    branch: str
    selectedRounds: List[str]
    difficulty: str
    mode: str
    status: str
    currentRound: Optional[str] = None
    startedAt: str
    completedAt: Optional[str] = None


class AptitudeResultCreate(BaseModel):
    answers: Any
    score: float = Field(..., ge=0.0, le=100.0)
    accuracy: float = Field(..., ge=0.0, le=100.0)
    totalQuestions: int = Field(default=0, ge=0)
    correctAnswers: int = Field(default=0, ge=0)
    timeSpentSeconds: int = Field(default=0, ge=0)


class TechnicalResultCreate(BaseModel):
    questions: List[Any]
    answers: Any
    evaluation: Dict[str, Any]
    score: float = Field(..., ge=0.0, le=100.0)
    feedback: Optional[str] = ""


class HRVoiceResultCreate(BaseModel):
    transcript: Optional[Any] = None
    answers: Any
    score: float = Field(..., ge=0.0, le=100.0)
    feedback: Optional[str] = ""
    metrics: Optional[Dict[str, Any]] = None
