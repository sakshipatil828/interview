"""001_initial_schema

Revision ID: 001_initial_schema
Revises: 
Create Date: 2026-10-13 18:40:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

revision: str = '001_initial_schema'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # 1. users table
    op.create_table(
        'users',
        sa.Column('id', sa.String(length=64), primary_key=True),
        sa.Column('name', sa.String(length=120), nullable=False),
        sa.Column('email', sa.String(length=255), nullable=False),
        sa.Column('password_hash', sa.String(length=255), nullable=False),
        sa.Column('role', sa.String(length=32), nullable=False, server_default='user'),
        sa.Column('status', sa.String(length=32), nullable=False, server_default='active'),
        sa.Column('phone', sa.String(length=64), nullable=True, server_default=''),
        sa.Column('college', sa.String(length=255), nullable=True),
        sa.Column('degree', sa.String(length=120), nullable=True),
        sa.Column('department', sa.String(length=120), nullable=True),
        sa.Column('semester', sa.String(length=64), nullable=True),
        sa.Column('graduation_year', sa.String(length=32), nullable=True),
        sa.Column('linkedin', sa.String(length=255), nullable=True, server_default=''),
        sa.Column('github', sa.String(length=255), nullable=True, server_default=''),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
    )
    op.create_index('ix_users_email', 'users', ['email'], unique=True)
    op.create_index('ix_users_role', 'users', ['role'])

    # 2. sessions table
    op.create_table(
        'sessions',
        sa.Column('id', sa.String(length=128), primary_key=True),
        sa.Column('user_id', sa.String(length=64), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('expires_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('is_revoked', sa.Boolean(), nullable=False, server_default=sa.text('false')),
        sa.Column('user_agent', sa.String(length=255), nullable=True),
        sa.Column('ip_address', sa.String(length=64), nullable=True),
    )
    op.create_index('ix_sessions_user_id', 'sessions', ['user_id'])
    op.create_index('ix_sessions_expires_at', 'sessions', ['expires_at'])
    op.create_index('ix_sessions_is_revoked', 'sessions', ['is_revoked'])
    op.create_index('idx_session_lookup', 'sessions', ['id', 'is_revoked', 'expires_at'])

    # 3. resumes table
    op.create_table(
        'resumes',
        sa.Column('id', sa.String(length=64), primary_key=True),
        sa.Column('user_id', sa.String(length=64), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False),
        sa.Column('filename', sa.String(length=255), nullable=False),
        sa.Column('file_size', sa.String(length=64), nullable=True),
        sa.Column('raw_text', sa.Text(), nullable=True),
        sa.Column('extracted_skills', sa.JSON(), nullable=True),
        sa.Column('education', sa.JSON(), nullable=True),
        sa.Column('experience', sa.JSON(), nullable=True),
        sa.Column('projects', sa.JSON(), nullable=True),
        sa.Column('certifications', sa.JSON(), nullable=True),
        sa.Column('parsed_data', sa.JSON(), nullable=True),
        sa.Column('ats_score', sa.Integer(), nullable=True, server_default='0'),
        sa.Column('resume_score', sa.Integer(), nullable=True, server_default='0'),
        sa.Column('match_rank', sa.String(length=120), nullable=True),
        sa.Column('uploaded_at', sa.DateTime(timezone=True), nullable=False),
    )
    op.create_index('ix_resumes_user_id', 'resumes', ['user_id'])

    # 4. interview_sessions table
    op.create_table(
        'interview_sessions',
        sa.Column('id', sa.String(length=64), primary_key=True),
        sa.Column('user_id', sa.String(length=64), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False),
        sa.Column('target_role', sa.String(length=120), nullable=False),
        sa.Column('branch', sa.String(length=120), nullable=False),
        sa.Column('selected_rounds', sa.JSON(), nullable=False),
        sa.Column('difficulty', sa.String(length=64), nullable=False, server_default='Intermediate'),
        sa.Column('mode', sa.String(length=64), nullable=False, server_default='practice'),
        sa.Column('status', sa.String(length=64), nullable=False, server_default='in_progress'),
        sa.Column('current_round', sa.String(length=64), nullable=True),
        sa.Column('started_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('completed_at', sa.DateTime(timezone=True), nullable=True),
    )
    op.create_index('ix_interview_sessions_user_id', 'interview_sessions', ['user_id'])
    op.create_index('ix_interview_sessions_status', 'interview_sessions', ['status'])

    # 5. aptitude_results table
    op.create_table(
        'aptitude_results',
        sa.Column('id', sa.String(length=64), primary_key=True),
        sa.Column('interview_session_id', sa.String(length=64), sa.ForeignKey('interview_sessions.id', ondelete='CASCADE'), nullable=False),
        sa.Column('user_id', sa.String(length=64), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False),
        sa.Column('answers', sa.JSON(), nullable=False),
        sa.Column('score', sa.Float(), nullable=False, server_default='0.0'),
        sa.Column('accuracy', sa.Float(), nullable=False, server_default='0.0'),
        sa.Column('total_questions', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('correct_answers', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('time_spent_seconds', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('completed_at', sa.DateTime(timezone=True), nullable=False),
    )
    op.create_index('ix_aptitude_results_session', 'aptitude_results', ['interview_session_id'])
    op.create_index('ix_aptitude_results_user', 'aptitude_results', ['user_id'])

    # 6. technical_results table
    op.create_table(
        'technical_results',
        sa.Column('id', sa.String(length=64), primary_key=True),
        sa.Column('interview_session_id', sa.String(length=64), sa.ForeignKey('interview_sessions.id', ondelete='CASCADE'), nullable=False),
        sa.Column('user_id', sa.String(length=64), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False),
        sa.Column('questions', sa.JSON(), nullable=False),
        sa.Column('answers', sa.JSON(), nullable=False),
        sa.Column('evaluation', sa.JSON(), nullable=False),
        sa.Column('score', sa.Float(), nullable=False, server_default='0.0'),
        sa.Column('feedback', sa.Text(), nullable=True),
        sa.Column('completed_at', sa.DateTime(timezone=True), nullable=False),
    )
    op.create_index('ix_technical_results_session', 'technical_results', ['interview_session_id'])
    op.create_index('ix_technical_results_user', 'technical_results', ['user_id'])

    # 7. hr_voice_results table
    op.create_table(
        'hr_voice_results',
        sa.Column('id', sa.String(length=64), primary_key=True),
        sa.Column('interview_session_id', sa.String(length=64), sa.ForeignKey('interview_sessions.id', ondelete='CASCADE'), nullable=False),
        sa.Column('user_id', sa.String(length=64), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False),
        sa.Column('transcript', sa.JSON(), nullable=True),
        sa.Column('answers', sa.JSON(), nullable=False),
        sa.Column('score', sa.Float(), nullable=False, server_default='0.0'),
        sa.Column('feedback', sa.Text(), nullable=True),
        sa.Column('metrics', sa.JSON(), nullable=True),
        sa.Column('completed_at', sa.DateTime(timezone=True), nullable=False),
    )
    op.create_index('ix_hr_voice_results_session', 'hr_voice_results', ['interview_session_id'])
    op.create_index('ix_hr_voice_results_user', 'hr_voice_results', ['user_id'])

    # 8. final_scorecards table
    op.create_table(
        'final_scorecards',
        sa.Column('id', sa.String(length=64), primary_key=True),
        sa.Column('interview_session_id', sa.String(length=64), sa.ForeignKey('interview_sessions.id', ondelete='CASCADE'), nullable=False),
        sa.Column('user_id', sa.String(length=64), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False),
        sa.Column('round_scores', sa.JSON(), nullable=False),
        sa.Column('overall_score', sa.Float(), nullable=False, server_default='0.0'),
        sa.Column('strengths', sa.JSON(), nullable=False),
        sa.Column('weaknesses', sa.JSON(), nullable=False),
        sa.Column('recommendations', sa.JSON(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
    )
    op.create_index('ix_final_scorecards_session', 'final_scorecards', ['interview_session_id'])
    op.create_index('ix_final_scorecards_user', 'final_scorecards', ['user_id'])

    # 9. experience_feedback table
    op.create_table(
        'experience_feedback',
        sa.Column('id', sa.String(length=64), primary_key=True),
        sa.Column('interview_session_id', sa.String(length=64), sa.ForeignKey('interview_sessions.id', ondelete='CASCADE'), nullable=False),
        sa.Column('user_id', sa.String(length=64), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False),
        sa.Column('user_feedback', sa.Text(), nullable=False),
        sa.Column('difficulty_rating', sa.String(length=64), nullable=False),
        sa.Column('confidence_rating', sa.String(length=64), nullable=False),
        sa.Column('improvement_goals', sa.JSON(), nullable=False),
        sa.Column('rating', sa.Float(), nullable=True, server_default='5.0'),
        sa.Column('submitted_at', sa.DateTime(timezone=True), nullable=False),
    )
    op.create_index('ix_experience_feedback_session', 'experience_feedback', ['interview_session_id'])
    op.create_index('ix_experience_feedback_user', 'experience_feedback', ['user_id'])


def downgrade() -> None:
    op.drop_table('experience_feedback')
    op.drop_table('final_scorecards')
    op.drop_table('hr_voice_results')
    op.drop_table('technical_results')
    op.drop_table('aptitude_results')
    op.drop_table('interview_sessions')
    op.drop_table('resumes')
    op.drop_table('sessions')
    op.drop_table('users')
