/**
 * Type definitions for Unified Interview Rounds Journey Workflow
 */

export type InterviewRoundId = 'aptitude' | 'technical' | 'hr' | 'communication';

export type CandidateDepartmentOption =
  | 'CSE'
  | 'ISE'
  | 'AI & ML'
  | 'ECE'
  | 'EEE'
  | 'Mechanical'
  | 'Civil'
  | 'Commerce'
  | 'Business Administration'
  | 'Business Analytics'
  | 'Arts & Humanities'
  | 'Other';

export type TargetRoleOption =
  | 'Full-Stack Developer'
  | 'Software Developer'
  | 'Data Analyst'
  | 'AI/ML Engineer'
  | 'Business Analyst'
  | 'Financial Analyst'
  | 'Marketing Executive'
  | 'HR Specialist'
  | 'Management Trainee'
  | 'Other';

export interface InterviewJourneyConfig {
  candidateName: string;
  email: string;
  department: CandidateDepartmentOption;
  targetRole: TargetRoleOption;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  mode: 'Practice Mode' | 'Assessment Mode' | 'Practice' | 'Assessment';
  aptitudeDurationMinutes: 5 | 10 | 15;
  technicalDurationMinutes: 10 | 15 | 20;
  hrDurationMinutes: 5 | 10 | 15;
  communicationDurationMinutes?: 5 | 10 | 15;
  durationMinutes?: number; // legacy backward compatibility
  selectedRounds: InterviewRoundId[];
  candidateTrack?: 'fresher' | 'experienced';
  candidateType?: string;
  educationalCategory?: 'technical' | 'non_technical';
  userSelectedCategory?: 'technical' | 'non_technical' | null;
  discipline?: string;
}

export interface RoundResultSummary {
  roundId: InterviewRoundId;
  roundTitle: string;
  scorePercentage: number;
  completedAt: string;
  summaryFeedback: string;
  strengths: string[];
  improvements: string[];
  rawSessionId?: string;
  technicalScorecard?: import('../types').TechnicalScorecardSummary;
  communicationScorecard?: import('../types').CommunicationScorecardSummary;
  metrics?: {
    correctCount?: number;
    totalQuestions?: number;
    timeTakenMinutes?: number;
    wpm?: number;
    fillerWords?: number;
    ratingBand?: string;
  };
}

export interface InterviewJourneyState {
  id: string;
  userId: string;
  config: InterviewJourneyConfig;
  status: 'setup' | 'in_progress' | 'completed' | 'cancelled';
  activeRoundIndex: number; // index into config.selectedRounds
  currentPhase: 'form' | 'round_active' | 'round_result' | 'consolidated_scorecard' | 'final_feedback';
  completedRounds: InterviewRoundId[];
  roundResults: Partial<Record<InterviewRoundId, RoundResultSummary>>;
  startedAt: string;
  updatedAt: string;
}
