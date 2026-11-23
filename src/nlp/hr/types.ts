/**
 * CareerCurve AI HR Personal Interview Module
 * Domain types, configuration interfaces, and evaluation structures.
 */

import { ParsedResume } from '../../types';

export type HRQuestionCategory =
  | 'self_introduction'
  | 'strengths_weaknesses'
  | 'career_goals'
  | 'why_hire_you'
  | 'why_this_role'
  | 'teamwork_conflict'
  | 'leadership_problem_solving'
  | 'handling_failure'
  | 'time_management'
  | 'adaptability'
  | 'project_contribution'
  | 'salary_work_culture'
  | 'ethics_professional_behavior'
  | 'motivation_company_fit'
  | 'future_goals_learning'
  | 'candidate_questions';

export type HRQuestionStyle = 'Friendly' | 'Professional' | 'Challenging';
export type HRDifficulty = 'Beginner' | 'Intermediate' | 'Advanced';
export type HRInterviewType = 'HR Personal Interview' | 'Behavioral Interview' | 'Communication Practice';

export type HRInterviewState =
  | 'SETUP'
  | 'READY'
  | 'ASKING_QUESTION'
  | 'WAITING_FOR_ANSWER'
  | 'PROCESSING_ANSWER'
  | 'GIVING_FEEDBACK'
  | 'READY_FOR_NEXT_QUESTION'
  | 'LISTENING_TO_STUDENT'
  | 'TRANSCRIBING'
  | 'EVALUATING_ANSWER'
  | 'SPEAKING_FEEDBACK_OR_FOLLOW_UP'
  | 'NEXT_QUESTION'
  | 'COMPLETED'
  | 'INTERRUPTED';

export interface HRInterviewConfig {
  type: HRInterviewType;
  difficulty: HRDifficulty;
  durationMinutes: 5 | 10 | 15;
  language: string;
  style: HRQuestionStyle;
  answerTimeLimitSeconds: number; // e.g., 90
  targetCompany?: string; // Optional target company (e.g. "Google", "TCS", "Infosys", "Tata Motors", or general)
}

export interface HRFollowUpRecord {
  followUpNumber: number; // 1 or 2
  followUpQuestion: string;
  candidateAnswer: string;
  evaluationNotes?: string;
  timestamp: string;
}

export interface HRSatisfactionEvaluation {
  isSatisfied: boolean;
  score: number; // 0-100
  relevanceScore: number;
  completenessScore: number;
  clarityScore: number;
  missingElements: string[];
  followUpQuestion?: string;
  acknowledgmentSpeech: string;
  isMaxFollowUpsReached: boolean;
  satisfactionReason: string;
}

export interface CandidateQuestionResponse {
  category: 'mentorship' | 'tech_stack' | 'culture' | 'growth' | 'general' | 'none';
  detectedIntent: string;
  aiAnswer: string;
  followUpPrompt: string;
  isConcluding: boolean;
}

export interface HRDatasetQuestion {
  id: string;
  category: HRQuestionCategory;
  categoryDisplayName: string;
  question: string;
  difficulty: HRDifficulty;
  style: HRQuestionStyle;
  expectedConcepts: string[];
  keywords: string[];
  rubric: {
    relevanceWeight: number;    // e.g. 0.35
    completenessWeight: number; // e.g. 0.25
    clarityWeight: number;      // e.g. 0.20
    evidenceWeight: number;     // e.g. 0.20
  };
  exampleStrongAnswer: string;
  exampleWeakAnswer: string;
  followUpTemplates: string[];
  starFrameworkApplicable: boolean;
  isResumeAware?: boolean;
  resumeFieldToInterpolate?: 'project' | 'college' | 'department' | 'degree' | 'skill';
}

export interface STARAnalysis {
  hasSituation: boolean;
  situationSnippet?: string;
  hasTask: boolean;
  taskSnippet?: string;
  hasAction: boolean;
  actionSnippet?: string;
  hasResult: boolean;
  resultSnippet?: string;
  starScore: number; // 0-100
  feedback: string;
}

export interface CommunicationMetrics {
  totalWords: number;
  durationSeconds: number;
  wordsPerMinute: number;
  fillerWordsCount: number;
  fillerWordsList: { word: string; count: number }[];
  redundancyCount: number;
  sentenceClarityScore: number; // 0-100
  coachingTips: string[];
}

export type HighlightLabel = 'Correct' | 'Needs improvement' | 'Off-topic' | 'Missing from your answer';

export interface HighlightedIssue {
  text: string;
  label: HighlightLabel;
  reason: string;
  correctedExample?: string;
}

export interface ResumeBasedFeedback {
  whatDidWell: string[];
  whatIsMissing: string[];
  offTopicAnalysis: { snippet: string; explanation: string }[];
  mistakesIdentified: { statement: string; issue: string; correctedExample: string }[];
  howToImproveWithResume: string[];
  highlightedIssues: HighlightedIssue[];
  suggestedAnswerUsingResume: string;
}

export interface HREvaluationResult {
  questionId: string;
  questionText: string;
  userAnswerText: string;
  relevanceScore: number; // 0-100
  qualityScore: number; // 0-100
  clarityScore: number; // 0-100
  structureScore: number; // 0-100
  overallScore: number; // 0-100
  completenessScore: number; // 0-100 (Answer completeness percentage)
  ratingBand: 'Exceptional' | 'Strong Answer' | 'Satisfactory' | 'Needs Improvement';
  conceptCoverage: { concept: string; covered: boolean }[];
  starAnalysis?: STARAnalysis;
  communicationMetrics: CommunicationMetrics;
  strengths: string[];
  areasToImprove: string[];
  suggestedImprovedAnswer: string;
  explanation: string;
  followUpQuestion?: string;
  nextAction: 'ask_follow_up' | 'next_question' | 'deep_dive' | 'encourage_and_move_on';
  resumeFeedback?: ResumeBasedFeedback;
  followUpRecords?: HRFollowUpRecord[];
  mainQuestionIndex?: number;
  satisfactionStatus?: 'complete' | 'satisfied_after_followup' | 'progressed_after_limit';
}

export interface HRInterviewSessionReport {
  sessionId: string;
  candidateId: string;
  candidateName: string;
  date: string;
  config: HRInterviewConfig;
  totalQuestionsAsked: number;
  overallScore: number;
  communicationScore: number;
  relevanceScore: number;
  clarityScore: number;
  starMasteryScore: number;
  timeManagementScore: number;
  totalFillerWords: number;
  averageWpm: number;
  strongestAnswers: { question: string; score: number; why: string }[];
  weakestAnswers: { question: string; score: number; why: string }[];
  questionEvaluations: HREvaluationResult[];
  personalizedImprovementPlan: string[];
  recommendedPracticeTopics: string[];
}

export type EnvironmentDisruptionCategory =
  | 'CAMERA_DISCONNECTED'
  | 'CAMERA_OBSCURED'
  | 'PROLONGED_ABSENCE_FROM_VIEW'
  | 'SIGNIFICANT_LIGHTING_CHANGE'
  | 'POSSIBLE_ADDITIONAL_PERSON'
  | 'MANUAL_CAMERA_OFF';

export interface EnvironmentEventLogItem {
  id: string;
  timestamp: string;
  category: EnvironmentDisruptionCategory;
  categoryLabel: string;
  description: string;
  severity: 'warning' | 'interruption';
  resolvedAt?: string;
}

export type EnvironmentStatusState = 'normal' | 'warning' | 'interrupted';

export interface EnvironmentMonitoringState {
  isEnabled: boolean;
  isConsented: boolean;
  status: EnvironmentStatusState;
  warningCount: number; // 0, 1, 2, 3
  maxWarnings: number; // 3
  events: EnvironmentEventLogItem[];
  activeWarning: EnvironmentEventLogItem | null;
  cameraStatus: 'Active' | 'Inactive' | 'Obscured' | 'Disconnected' | 'Off' | 'Error' | 'Paused' | 'Paused — Warning Limit Reached';
  micStatus: 'Listening' | 'Transcribing' | 'Idle' | 'Muted' | 'Denied' | 'Unavailable' | 'Off' | 'Active';
  monitoringMode: 'Active' | 'Paused' | 'Interrupted';
  personModelStatus?: 'uninitialized' | 'loading' | 'ready' | 'unsupported' | 'error';
  personCount?: number;
  isPersonDetectionAvailable?: boolean;
}

export interface InterruptedHRInterviewReport {
  sessionId: string;
  candidateName: string;
  interruptedAt: string;
  reason: string;
  warningCount: number;
  repeatIncident?: string;
  elapsedDuration?: string;
  completedAnswersCount: number;
  evaluatedAnswers: HREvaluationResult[];
  preservedAnswersStatus?: string;
  events: EnvironmentEventLogItem[];
  status: 'interrupted';
}


