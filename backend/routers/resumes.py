from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session as DBSession

from backend.database import get_db
from backend.models.user import User
from backend.models.resume import Resume
from backend.schemas.resume import ResumeSaveRequest, ResumeOut
from backend.dependencies import get_current_user

router = APIRouter(prefix="/api/resumes", tags=["Resumes"])


@router.post("/save", response_model=ResumeOut)
def save_resume(
    req: ResumeSaveRequest,
    user: User = Depends(get_current_user),
    db: DBSession = Depends(get_db)
):
    """
    Saves a parsed resume profile for the authenticated user into PostgreSQL.
    """
    resume = Resume(
        user_id=user.id,
        filename=req.filename,
        file_size=req.fileSize or "",
        raw_text=req.rawText or "",
        extracted_skills=req.extractedSkills,
        education=req.education,
        experience=req.experience,
        projects=req.projects,
        certifications=req.certifications,
        parsed_data=req.parsedData,
        ats_score=req.atsScore or 0,
        resume_score=req.resumeScore or 0,
        match_rank=req.matchRank or "",
    )
    db.add(resume)
    db.commit()
    db.refresh(resume)

    return ResumeOut(
        id=resume.id,
        userId=resume.user_id,
        filename=resume.filename,
        fileSize=resume.file_size or "",
        extractedSkills=resume.extracted_skills,
        education=resume.education,
        experience=resume.experience,
        parsedData=resume.parsed_data,
        atsScore=resume.ats_score or 0,
        resumeScore=resume.resume_score or 0,
        matchRank=resume.match_rank or "",
        uploadedAt=resume.uploaded_at.isoformat() if resume.uploaded_at else "",
    )


@router.get("/latest")
def get_latest_resume(
    user: User = Depends(get_current_user),
    db: DBSession = Depends(get_db)
):
    """
    Retrieves the authenticated user's latest saved resume from PostgreSQL.
    """
    resume = db.query(Resume).filter(
        Resume.user_id == user.id
    ).order_by(Resume.uploaded_at.desc()).first()

    if not resume:
        return {"success": True, "resume": None}

    return {
        "success": True,
        "resume": ResumeOut(
            id=resume.id,
            userId=resume.user_id,
            filename=resume.filename,
            fileSize=resume.file_size or "",
            extractedSkills=resume.extracted_skills,
            education=resume.education,
            experience=resume.experience,
            parsedData=resume.parsed_data,
            atsScore=resume.ats_score or 0,
            resumeScore=resume.resume_score or 0,
            matchRank=resume.match_rank or "",
            uploadedAt=resume.uploaded_at.isoformat() if resume.uploaded_at else "",
        )
    }
