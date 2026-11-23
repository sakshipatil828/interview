from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session as DBSession

from backend.database import get_db
from backend.models.user import User
from backend.models.interview import InterviewSession, AptitudeResult, TechnicalResult, HRVoiceResult
from backend.models.feedback import FinalScorecard, ExperienceFeedback
from backend.schemas.interview import (
    AptitudeResultCreate,
    TechnicalResultCreate,
    HRVoiceResultCreate,
)
from backend.schemas.feedback import (
    FinalScorecardCreate,
    FinalScorecardOut,
    ExperienceFeedbackCreate,
    ExperienceFeedbackOut,
)
from backend.dependencies import get_current_user

router = APIRouter(prefix="/api/interviews", tags=["Interview Results & Feedback"])


def utcnow():
    return datetime.now(timezone.utc)


def verify_session_ownership(db: DBSession, session_id: str, user_id: str) -> InterviewSession:
    sess = db.query(InterviewSession).filter(InterviewSession.id == session_id).first()
    if not sess:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Interview session not found."
        )
    if sess.user_id != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Forbidden. You cannot submit results for another user's interview."
        )
    return sess


@router.post("/sessions/{session_id}/aptitude")
def submit_aptitude_result(
    session_id: str,
    req: AptitudeResultCreate,
    user: User = Depends(get_current_user),
    db: DBSession = Depends(get_db)
):
    """Saves Aptitude Round results under the interview session."""
    sess = verify_session_ownership(db, session_id, user.id)

    apt = db.query(AptitudeResult).filter(
        AptitudeResult.interview_session_id == session_id
    ).first()

    if not apt:
        apt = AptitudeResult(
            interview_session_id=session_id,
            user_id=user.id,
            answers=req.answers,
            score=req.score,
            accuracy=req.accuracy,
            total_questions=req.totalQuestions,
            correct_answers=req.correctAnswers,
            time_spent_seconds=req.timeSpentSeconds,
        )
        db.add(apt)
    else:
        apt.answers = req.answers
        apt.score = req.score
        apt.accuracy = req.accuracy
        apt.total_questions = req.totalQuestions
        apt.correct_answers = req.correctAnswers
        apt.time_spent_seconds = req.timeSpentSeconds
        apt.completed_at = utcnow()

    sess.current_round = "technical"
    db.commit()
    db.refresh(apt)
    return {"success": True, "message": "Aptitude results saved successfully", "resultId": apt.id}


@router.post("/sessions/{session_id}/technical")
def submit_technical_result(
    session_id: str,
    req: TechnicalResultCreate,
    user: User = Depends(get_current_user),
    db: DBSession = Depends(get_db)
):
    """Saves Technical Interview Round results under the interview session."""
    sess = verify_session_ownership(db, session_id, user.id)

    tech = db.query(TechnicalResult).filter(
        TechnicalResult.interview_session_id == session_id
    ).first()

    if not tech:
        tech = TechnicalResult(
            interview_session_id=session_id,
            user_id=user.id,
            questions=req.questions,
            answers=req.answers,
            evaluation=req.evaluation,
            score=req.score,
            feedback=req.feedback or "",
        )
        db.add(tech)
    else:
        tech.questions = req.questions
        tech.answers = req.answers
        tech.evaluation = req.evaluation
        tech.score = req.score
        tech.feedback = req.feedback or ""
        tech.completed_at = utcnow()

    sess.current_round = "hr"
    db.commit()
    db.refresh(tech)
    return {"success": True, "message": "Technical interview results saved successfully", "resultId": tech.id}


@router.post("/sessions/{session_id}/hr-voice")
def submit_hr_voice_result(
    session_id: str,
    req: HRVoiceResultCreate,
    user: User = Depends(get_current_user),
    db: DBSession = Depends(get_db)
):
    """Saves AI Voice HR Interview Round results under the interview session."""
    sess = verify_session_ownership(db, session_id, user.id)

    hr = db.query(HRVoiceResult).filter(
        HRVoiceResult.interview_session_id == session_id
    ).first()

    if not hr:
        hr = HRVoiceResult(
            interview_session_id=session_id,
            user_id=user.id,
            transcript=req.transcript,
            answers=req.answers,
            score=req.score,
            feedback=req.feedback or "",
            metrics=req.metrics,
        )
        db.add(hr)
    else:
        hr.transcript = req.transcript
        hr.answers = req.answers
        hr.score = req.score
        hr.feedback = req.feedback or ""
        hr.metrics = req.metrics
        hr.completed_at = utcnow()

    sess.current_round = "scorecard"
    db.commit()
    db.refresh(hr)
    return {"success": True, "message": "HR voice interview results saved successfully", "resultId": hr.id}


@router.post("/sessions/{session_id}/scorecard", response_model=FinalScorecardOut)
def submit_final_scorecard(
    session_id: str,
    req: FinalScorecardCreate,
    user: User = Depends(get_current_user),
    db: DBSession = Depends(get_db)
):
    """Saves Consolidated Final Scorecard across all interview rounds."""
    verify_session_ownership(db, session_id, user.id)

    card = db.query(FinalScorecard).filter(
        FinalScorecard.interview_session_id == session_id
    ).first()

    if not card:
        card = FinalScorecard(
            interview_session_id=session_id,
            user_id=user.id,
            round_scores=req.roundScores,
            overall_score=req.overallScore,
            strengths=req.strengths,
            weaknesses=req.weaknesses,
            recommendations=req.recommendations,
        )
        db.add(card)
    else:
        card.round_scores = req.roundScores
        card.overall_score = req.overallScore
        card.strengths = req.strengths
        card.weaknesses = req.weaknesses
        card.recommendations = req.recommendations

    db.commit()
    db.refresh(card)
    return FinalScorecardOut(
        id=card.id,
        interviewSessionId=card.interview_session_id,
        userId=card.user_id,
        roundScores=card.round_scores,
        overallScore=card.overall_score,
        strengths=card.strengths,
        weaknesses=card.weaknesses,
        recommendations=card.recommendations,
        createdAt=card.created_at.isoformat() if card.created_at else "",
    )


@router.post("/sessions/{session_id}/feedback", response_model=ExperienceFeedbackOut)
def submit_experience_feedback(
    session_id: str,
    req: ExperienceFeedbackCreate,
    user: User = Depends(get_current_user),
    db: DBSession = Depends(get_db)
):
    """
    Saves Final Student Experience & Improvement Feedback,
    and marks the interview journey completed in PostgreSQL.
    """
    sess = verify_session_ownership(db, session_id, user.id)

    fb = db.query(ExperienceFeedback).filter(
        ExperienceFeedback.interview_session_id == session_id
    ).first()

    if not fb:
        fb = ExperienceFeedback(
            interview_session_id=session_id,
            user_id=user.id,
            user_feedback=req.userFeedback,
            difficulty_rating=req.difficultyRating,
            confidence_rating=req.confidenceRating,
            improvement_goals=req.improvementGoals,
            rating=req.rating or 5.0,
        )
        db.add(fb)
    else:
        fb.user_feedback = req.userFeedback
        fb.difficulty_rating = req.difficultyRating
        fb.confidence_rating = req.confidenceRating
        fb.improvement_goals = req.improvementGoals
        fb.rating = req.rating or 5.0
        fb.submitted_at = utcnow()

    # Mark entire journey session completed
    sess.status = "completed"
    sess.completed_at = utcnow()

    db.commit()
    db.refresh(fb)
    return ExperienceFeedbackOut(
        id=fb.id,
        interviewSessionId=fb.interview_session_id,
        userId=fb.user_id,
        userFeedback=fb.user_feedback,
        difficultyRating=fb.difficulty_rating,
        confidenceRating=fb.confidence_rating,
        improvementGoals=fb.improvement_goals,
        rating=fb.rating,
        submittedAt=fb.submitted_at.isoformat() if fb.submitted_at else "",
    )


@router.get("/history")
def get_user_interview_history(
    user: User = Depends(get_current_user),
    db: DBSession = Depends(get_db)
):
    """
    Fetches completed interview records strictly for the authenticated user.
    """
    sessions = db.query(InterviewSession).filter(
        InterviewSession.user_id == user.id
    ).order_by(InterviewSession.started_at.desc()).all()

    history_items = []
    for s in sessions:
        card = s.final_scorecard
        history_items.append({
            "sessionId": s.id,
            "targetRole": s.target_role,
            "branch": s.branch,
            "difficulty": s.difficulty,
            "status": s.status,
            "startedAt": s.started_at.isoformat() if s.started_at else "",
            "completedAt": s.completed_at.isoformat() if s.completed_at else None,
            "overallScore": card.overall_score if card else None,
            "roundScores": card.round_scores if card else None,
        })

    return {"success": True, "history": history_items}
