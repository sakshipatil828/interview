/**
 * CareerCurve AI Interview Preparation Platform
 * Types for Interview Experience & Improvement Feedback Module
 */

export type ExperienceRating = 'Excellent' | 'Good' | 'Average' | 'Difficult' | 'Very difficult';

export type ChallengingPhase = 
  | 'HR Interview'
  | 'Technical Interview'
  | 'Aptitude Test'
  | 'Resume-Based Questions'
  | 'Voice and Communication'
  | 'Time Management';

export type BiggestDifficultyOption = 
  | 'I was nervous while answering.'
  | 'I could not explain my thoughts clearly.'
  | 'I did not know some technical answers.'
  | 'I struggled with aptitude questions.'
  | 'I could not finish answers within the time limit.'
  | 'I had difficulty understanding the questions.'
  | 'Other';

export type ImprovementGoalOption =
  | 'Communication skills'
  | 'Technical knowledge'
  | 'Aptitude and logical reasoning'
  | 'Confidence and nervousness management'
  | 'Answer structure'
  | 'Speaking fluency'
  | 'Time management'
  | 'Resume explanation'
  | 'Other';

export interface StudentInterviewFeedback {
  id: string;
  userId: string;
  submittedAt: string;
  experienceRating: ExperienceRating;
  mostChallengingPhase: ChallengingPhase;
  biggestDifficulty: string; // Predefined or custom
  biggestDifficultyCustom?: string;
  confidenceRating: number; // 1 to 5
  improvementGoals: string[]; // Selected areas
  improvementGoalCustom?: string;
  mostHelpfulPart?: string;
  suggestionsForImprovement?: string;
  voiceTranscript?: string; // Captured via speech recognition
  voiceTranscriptIncluded: boolean;
}

export interface DayExercise {
  day: number; // 1 to 7
  title: string;
  duration: string; // e.g. "20 mins"
  phaseTag: 'Technical' | 'HR Voice' | 'Aptitude' | 'Communication' | 'Mindset';
  taskDescription: string;
  measurableGoal: string;
  completed: boolean;
  completedAt?: string;
}

export interface ImprovementPriority {
  rank: number; // 1, 2, 3
  skill: string;
  reason: string;
  recommendedAction: string;
}

export interface ProgressGoal {
  metric: string;
  currentBenchmark: string;
  targetBenchmark: string;
  howToMeasure: string;
}

export interface NextPracticeRecommendation {
  recommendedPhase: 'technical' | 'hr' | 'aptitude' | 'resume';
  title: string;
  badge: string;
  reason: string;
  keyTopicsToFocus: string[];
}

export interface PersonalizedImprovementPlan {
  id: string;
  userId: string;
  feedbackId: string;
  createdAt: string;
  updatedAt: string;
  
  // Section A: My Interview Experience
  experienceSummary: string;
  
  // Section B: My Main Challenges
  mainChallenges: string;
  
  // Section C: My Performance Insights
  performanceInsights: {
    isScorecardAvailable: boolean;
    analysisMode: 'real_history_and_feedback' | 'self_reported_only';
    objectiveScores: {
      technical?: number;
      hr?: number;
      aptitude?: number;
      ats?: number;
      overallReadiness?: number;
    };
    weakestMeasuredAreas: string[];
    confidenceMismatchAnalysis: string;
    fillerWordsDetected?: number;
    wpmAverage?: number;
  };
  
  // Section D: My Strengths
  demonstratedStrengths: string[];
  
  // Section E: My Improvement Priorities (Top 3)
  topPriorities: ImprovementPriority[];
  
  // Section F: My 7-Day Improvement Plan
  sevenDayPlan: DayExercise[];
  
  // Section G: My Next Practice Session
  nextPracticeSession: NextPracticeRecommendation;
  
  // Section H: My Progress Goals
  progressGoals: ProgressGoal[];
  
  // Personal notes & custom targets
  personalNotes: string;
  
  // Real future comparison when subsequent interview happens
  comparisonWithPrevious?: {
    hasComparison: boolean;
    previousSessionDate?: string;
    scoreDelta?: number;
    note?: string;
  };
}
