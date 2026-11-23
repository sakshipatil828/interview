from datetime import datetime, timezone
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session as DBSession

from backend.database import get_db
from backend.models.user import User
from backend.models.interview import InterviewSession
from backend.schemas.interview import InterviewSessionCreate, InterviewSessionOut
from backend.dependencies import get_current_user

router = APIRouter(prefix="/api/interviews", tags=["Interview Journeys"])


def session_to_out(sess: InterviewSession) -> InterviewSessionOut:
    return InterviewSessionOut(
        id=sess.id,
        userId=sess.user_id,
        targetRole=sess.target_role,
        branch=sess.branch,
        selectedRounds=sess.selected_rounds or [],
        difficulty=sess.difficulty,
        mode=sess.mode,
        status=sess.status,
        currentRound=sess.current_round,
        startedAt=sess.started_at.isoformat() if sess.started_at else "",
        completedAt=sess.completed_at.isoformat() if sess.completed_at else None,
    )


@router.post("/sessions", response_model=InterviewSessionOut, status_code=status.HTTP_201_CREATED)
def create_interview_session(
    req: InterviewSessionCreate,
    user: User = Depends(get_current_user),
    db: DBSession = Depends(get_db)
):
    """
    Initializes a new interview journey session in PostgreSQL for the authenticated user.
    """
    initial_round = req.selectedRounds[0] if req.selectedRounds else "aptitude"
    sess = InterviewSession(
        user_id=user.id,
        target_role=req.targetRole,
        branch=req.branch,
        selected_rounds=req.selectedRounds,
        difficulty=req.difficulty,
        mode=req.mode,
        status="in_progress",
        current_round=initial_round,
    )
    db.add(sess)
    db.commit()
    db.refresh(sess)
    return session_to_out(sess)


@router.get("/sessions", response_model=List[InterviewSessionOut])
def list_user_interview_sessions(
    user: User = Depends(get_current_user),
    db: DBSession = Depends(get_db)
):
    """
    Lists all interview sessions belonging strictly to the authenticated user.
    """
    sessions = db.query(InterviewSession).filter(
        InterviewSession.user_id == user.id
    ).order_by(InterviewSession.started_at.desc()).all()

    return [session_to_out(s) for s in sessions]


@router.get("/sessions/{session_id}")
def get_interview_session_detail(
    session_id: str,
    user: User = Depends(get_current_user),
    db: DBSession = Depends(get_db)
):
    """
    Fetches full interview session details and round results,
    enforcing that the session belongs to the authenticated user.
    """
    sess = db.query(InterviewSession).filter(
        InterviewSession.id == session_id
    ).first()

    if not sess:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Interview session not found."
        )

    # Data Isolation Guard
    if sess.user_id != user.id and user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Forbidden. You do not have permission to view another candidate's interview session."
        )

    apt = sess.aptitude_result
    tech = sess.technical_result
    hr = sess.hr_voice_result
    card = sess.final_scorecard
    fb = sess.experience_feedback

    return {
        "success": True,
        "session": session_to_out(sess),
        "results": {
            "aptitude": {
                "score": apt.score,
                "accuracy": apt.accuracy,
                "totalQuestions": apt.total_questions,
                "correctAnswers": apt.correct_answers,
                "timeSpentSeconds": apt.time_spent_seconds,
                "answers": apt.answers,
                "completedAt": apt.completed_at.isoformat() if apt.completed_at else None,
            } if apt else None,
            "technical": {
                "score": tech.score,
                "questions": tech.questions,
                "answers": tech.answers,
                "evaluation": tech.evaluation,
                "feedback": tech.feedback,
                "completedAt": tech.completed_at.isoformat() if tech.completed_at else None,
            } if tech else None,
            "hrVoice": {
                "score": hr.score,
                "answers": hr.answers,
                "feedback": hr.feedback,
                "transcript": hr.transcript,
                "metrics": hr.metrics,
                "completedAt": hr.completed_at.isoformat() if hr.completed_at else None,
            } if hr else None,
            "scorecard": {
                "roundScores": card.round_scores,
                "overallScore": card.overall_score,
                "strengths": card.strengths,
                "weaknesses": card.weaknesses,
                "recommendations": card.recommendations,
                "createdAt": card.created_at.isoformat() if card.created_at else None,
            } if card else None,
            "feedback": {
                "userFeedback": fb.user_feedback,
                "difficultyRating": fb.difficulty_rating,
                "confidenceRating": fb.confidence_rating,
                "improvementGoals": fb.improvement_goals,
                "rating": fb.rating,
                "submittedAt": fb.submitted_at.isoformat() if fb.submitted_at else None,
            } if fb else None,
        }
    }
