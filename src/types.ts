/**
 * Types definition for CareerCurve - AI-Powered Interview Preparation Platform
 */

export interface User {
  id: string;
  name: string; // full_name
  email: string;
  phone?: string;
  college?: string;
  degree?: string;
  department?: string;
  semester?: string;
  graduationYear?: string;
  linkedin?: string;
  github?: string;
  targetRole?: string;
  avatar?: string;
  verified: boolean; // email_verified
  onboardingCompleted: boolean;
  createdAt: string;
  token?: string;
}

export interface EducationItem {
  degree: string;
  branch: string; // e.g. Civil Engineering, Mechanical Engineering, Computer Science, ECE
  college: string;
  graduationYear: string;
  graduationMonth?: string;
  year?: string;
  cgpa?: string;
}

export interface ProjectItem {
  title: string;
  description: string;
  technologies: string[];
  link?: string;
}

export interface ExperienceItem {
  company: string;
  role: string;
  duration: string;
  description: string;
  isInternship?: boolean;
  isEmployment?: boolean;
}

export type CandidateTrack = 'fresher' | 'experienced';
export type EducationalBackgroundCategory = 'technical' | 'non_technical';

export interface CandidateClassification {
  track: CandidateTrack;
  candidateType: 'FRESHER' | 'EXPERIENCED PREPARATION TRACK' | 'UNCONFIRMED';
  isFresher: boolean;
  educationalCategory: EducationalBackgroundCategory;
  discipline: string;
  isTechnical: boolean;
  userSelectedCategory?: 'technical' | 'non_technical' | null;
  isUserConfirmed?: boolean;
  graduationBatch: string;
  graduationMonth?: string;
  graduationDateFormatted?: string;
  isGraduationDateConfirmed: boolean;
  recommendedPreparation: string;
  recommendedRounds: ('aptitude' | 'technical' | 'hr' | 'communication')[];
  optionalRounds?: ('aptitude' | 'technical' | 'hr' | 'communication')[];
  totalYearsOfExperience?: string;
  hasEmploymentHistory: boolean;
  explanationNote?: string;
}

export interface CommunicationMetricBreakdown {
  fluency: number; // 0-100
  grammar: number; // 0-100
  vocabulary: number; // 0-100
  clarity: number; // 0-100
  topicUnderstanding: number; // 0-100
  logicalOrganization: number; // 0-100
  relevance: number; // 0-100
  abilityToExplainIdeas: number; // 0-100
}

export interface CommunicationTopicResult {
  topicId: string;
  topicTitle: string;
  category: string;
  candidateSpeech: string;
  followUpQuestion?: string;
  candidateFollowUpAnswer?: string;
  timeSpentSeconds: number;
  overallScore: number;
  metrics: CommunicationMetricBreakdown;
  strengths: string[];
  improvements: string[];
  feedbackNotes: string;
}

export interface CommunicationScorecardSummary {
  candidateName: string;
  discipline: string;
  educationalCategory: EducationalBackgroundCategory;
  track: CandidateTrack;
  totalTopicsAttempted: number;
  topicsEvaluated?: number;
  overallCommunicationScore: number; // 0-100
  averageMetrics: CommunicationMetricBreakdown;
  metrics?: CommunicationMetricBreakdown;
  strengths: string[];
  areasToImprove: string[];
  improvements?: string[];
  overallFeedback?: string;
  speechSummary?: string;
  speechPaceWpm?: number;
  wordsPerMinute?: number;
  fillerWordCount?: number;
  domainSpecificAdvice: string[];
  domainTailoredAdvice?: string[];
  topicTitle?: string;
  metricsBreakdown?: { metric: string; score: number }[];
  topicResults: CommunicationTopicResult[];
}

export interface CertificationItem {
  name: string;
  issuer: string;
  year?: string;
}

export interface SkillCategory {
  category: string; // e.g., 'Programming Languages', 'Civil Structural Analysis', 'CAD Software', 'Soft Skills'
  skills: { name: string; level: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert' }[];
}

export interface ParsedResume {
  fullName: string;
  jobTitle: string;
  email: string;
  phone: string;
  github: string;
  linkedin: string;
  summary: string;
  education: EducationItem[];
  department: string; // e.g., 'Civil Engineering', 'Electronics & Communication', 'Mechanical', 'Computer Science'
  skills: SkillCategory[];
  rawSkillsList: string[];
  projects: ProjectItem[];
  experience: ExperienceItem[];
  certifications: CertificationItem[];
  languages: string[];
  interests: string[];
  // Candidate track classification and explicit graduation facts
  graduationYear?: string;
  graduationMonth?: string;
  isGraduationDateConfirmed?: boolean;
  userSelectedCategory?: 'technical' | 'non_technical' | null;
  classification?: CandidateClassification;
  internships?: ExperienceItem[];
  employmentHistory?: ExperienceItem[];
  totalProfessionalExperience?: string;
  // Analytics generated dynamically
  atsScore: number;
  resumeScore: number;
  matchRank: string; // e.g., 'Top 12% Applicant Pool', 'Strong Technical Match'
  missingSkills: string[];
  strongSkills: string[];
  suggestedTechnologies: string[];
  careerSuggestions: string[];
  uploadedAt: string;
  fileName: string;
  fileSize?: string;
  extractedText?: string;
}

export interface Question {
  id: string;
  type: 'technical' | 'hr' | 'aptitude';
  question: string;
  category: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  options?: string[]; // for aptitude MCQs
  correctAnswer?: number; // index for MCQ
  explanation?: string;
  wrongExplanations?: Record<number, string>;
  learningTip?: string;
}

export interface InterviewAnswer {
  questionId: string;
  questionText: string;
  userAnswer: string;
  isSkipped?: boolean;
  questionSkill?: string;
  questionTopic?: string;
  questionDifficulty?: 'Beginner' | 'Intermediate' | 'Advanced';
  questionSource?: 'resume-skill' | 'project' | 'internship' | 'certification' | 'curriculum-foundational';
  learningExplanation?: string;
  referenceAnswer?: string;
  exampleSolution?: string;
  importantConcepts?: string[];
  aiFeedback?: {
    technicalAccuracyScore: number;
    communicationScore: number;
    relevanceScore: number;
    overallRating: string;
    strengths: string[];
    improvements: string[];
    sampleIdealAnswer: string;
    followUpQuestion?: string;
    evaluationMistakeExplanation?: string;
    studyRecommendation?: string;
    practiceQuestion?: string;
  };
  timeTakenSeconds: number;
  eyeContactScore?: number;
  confidenceScore?: number;
}

export interface SkillPerformanceItem {
  skill: string;
  source: 'resume-skill' | 'project' | 'internship' | 'certification' | 'curriculum-foundational';
  performance: 'Strong' | 'Good' | 'Needs Improvement' | 'Weak';
  score: number;
  questionsAttempted: number;
  weakMistake?: string;
  correctExplanation?: string;
  whatToStudyNext?: string;
  recommendedPracticeQuestion?: string;
}

export interface WeakSkillRemediation {
  skill: string;
  whatWasAnsweredIncorrectly: string;
  correctExplanation: string;
  whatToStudyNext: string;
  recommendedPracticeQuestion: string;
}

export interface TechnicalScorecardSummary {
  totalQuestions: number;
  answeredQuestions: number;
  correctAnswers: number;
  partiallyCorrectAnswers: number;
  incorrectAnswers: number;
  skippedQuestions: number;
  overallTechnicalScore: number;
  difficultyWise: {
    beginner: { attempted: number; avgScore: number };
    intermediate: { attempted: number; avgScore: number };
    advanced: { attempted: number; avgScore: number };
  };
  skillPerformance: SkillPerformanceItem[];
  strengths: string[];
  weaknesses: string[];
  recommendedImprovements: string[];
  weakSkillsRemediation: WeakSkillRemediation[];
}

export interface InterviewSession {
  id: string;
  type: 'technical' | 'hr' | 'mixed' | 'aptitude' | 'communication' | 'comprehensive';
  date: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  answers: InterviewAnswer[];
  technicalScore: number;
  hrScore: number;
  aptitudeScore: number;
  communicationScore?: number;
  overallScore: number;
  readinessPercentage: number;
  completed: boolean;
  technicalScorecardSummary?: TechnicalScorecardSummary;
  communicationScorecardSummary?: CommunicationScorecardSummary;
}

export interface AptitudePerformanceFeedback {
  accuracyPercentage: number;
  strongTopics: string[];
  weakTopics: string[];
  suggestedPracticeAreas: string[];
  difficultyAnalysis: string;
  improvementSuggestions: string[];
}

export interface AptitudeResult {
  id: string;
  testName: string;
  date: string;
  totalQuestions: number;
  correctCount: number;
  wrongCount: number;
  unansweredCount: number;
  scorePercentage: number;
  categoryBreakdown: Record<string, { correct: number; total: number }>;
  timeTakenMinutes: number;
  userAnswers: Record<string, number>;
  questions: Question[];
  feedback: AptitudePerformanceFeedback;
  improvementDelta?: number;
}

export interface AptitudeProgressState {
  currentIdx: number;
  userAnswers: Record<string, number>;
  timeLeft: number;
  isSubmitted: boolean;
  activeTestName: string;
  resultData: AptitudeResult | null;
  savedAt?: string;
}

export * from './types/feedback';
export * from './types/journey';
