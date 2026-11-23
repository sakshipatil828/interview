from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status, Response
from pydantic import BaseModel
from sqlalchemy.orm import Session as DBSession

from backend.database import get_db
from backend.models.user import User, Session as SessionModel
from backend.models.resume import Resume
from backend.models.interview import InterviewSession, AptitudeResult, TechnicalResult, HRVoiceResult
from backend.models.feedback import FinalScorecard, ExperienceFeedback
from backend.schemas.auth import UserOut
from backend.dependencies import get_current_user, get_current_user_and_session
from backend.security.session import clear_session_cookie

router = APIRouter(prefix="/api/users", tags=["User Profile & Data Management"])


class ProfileUpdateRequest(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    college: Optional[str] = None
    degree: Optional[str] = None
    department: Optional[str] = None
    semester: Optional[str] = None
    graduationYear: Optional[str] = None
    linkedin: Optional[str] = None
    github: Optional[str] = None


@router.get("/me", response_model=UserOut)
def get_profile(user: User = Depends(get_current_user)):
    """Returns the authenticated user's profile."""
    return UserOut(
        id=user.id,
        name=user.name,
        email=user.email,
        role=user.role,
        status=user.status,
        phone=user.phone or "",
        college=user.college or "",
        degree=user.degree or "",
        department=user.department or "",
        semester=user.semester or "",
        graduationYear=user.graduation_year or "",
        linkedin=user.linkedin or "",
        github=user.github or "",
        createdAt=user.created_at.isoformat() if user.created_at else "",
    )


@router.patch("/me", response_model=UserOut)
def update_profile(
    req: ProfileUpdateRequest,
    user: User = Depends(get_current_user),
    db: DBSession = Depends(get_db)
):
    """Updates the authenticated user's candidate profile details."""
    if req.name is not None and req.name.strip():
        user.name = req.name.strip()
    if req.phone is not None:
        user.phone = req.phone.strip()
    if req.college is not None:
        user.college = req.college.strip()
    if req.degree is not None:
        user.degree = req.degree.strip()
    if req.department is not None:
        user.department = req.department.strip()
    if req.semester is not None:
        user.semester = req.semester.strip()
    if req.graduationYear is not None:
        user.graduation_year = req.graduationYear.strip()
    if req.linkedin is not None:
        user.linkedin = req.linkedin.strip()
    if req.github is not None:
        user.github = req.github.strip()

    db.commit()
    db.refresh(user)
    return UserOut(
        id=user.id,
        name=user.name,
        email=user.email,
        role=user.role,
        status=user.status,
        phone=user.phone or "",
        college=user.college or "",
        degree=user.degree or "",
        department=user.department or "",
        semester=user.semester or "",
        graduationYear=user.graduation_year or "",
        linkedin=user.linkedin or "",
        github=user.github or "",
        createdAt=user.created_at.isoformat() if user.created_at else "",
    )


@router.delete("/me/data")
def delete_user_interview_data(
    user: User = Depends(get_current_user),
    db: DBSession = Depends(get_db)
):
    """
    User Privacy & Data Deletion:
    Permanently wipes all interview attempts, results, resumes, and scorecards
    belonging to the current user, while preserving the user account.
    """
    user_id = user.id
    
    # Cascade delete interview sessions (which cascade deletes round results, scorecards, feedback)
    db.query(InterviewSession).filter(InterviewSession.user_id == user_id).delete(synchronize_session=False)
    # Delete uploaded resumes
    db.query(Resume).filter(Resume.user_id == user_id).delete(synchronize_session=False)
    
    db.commit()
    return {
        "success": True,
        "message": "All interview records, results, resumes, and scorecards for your account have been permanently deleted."
    }


@router.delete("/me")
def delete_account(
    response: Response,
    pair: tuple[User, SessionModel] = Depends(get_current_user_and_session),
    db: DBSession = Depends(get_db)
):
    """
    Permanently deletes user account and all associated sessions, resumes, and interview data.
    """
    user, _ = pair
    db.delete(user)
    db.commit()
    clear_session_cookie(response)
    return {
        "success": True,
        "message": "Your account and all associated records have been permanently removed."
    }
