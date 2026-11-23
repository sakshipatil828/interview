import { Question, InterviewAnswer, InterviewSession } from '../types';

export type EngineeringDepartment =
  | 'Computer Science & Engineering'
  | 'Information Technology'
  | 'Electronics & Communication Engineering'
  | 'Electrical & Electronics Engineering'
  | 'Mechanical Engineering'
  | 'Civil Engineering'
  | 'Automobile Engineering'
  | 'Data Science & Machine Learning Engineering';

export type QuestionType =
  | 'conceptual'
  | 'project-based'
  | 'practical'
  | 'problem-solving'
  | 'scenario'
  | 'coding'
  | 'sql'
  | 'output-prediction'
  | 'debugging'
  | 'diagram-based';

export interface TestCase {
  id: string;
  input: string;
  expectedOutput: string;
  explanation?: string;
  isHidden?: boolean;
}

export type SupportedLanguage = 'javascript' | 'python' | 'cpp' | 'java';

export interface CodingProblem {
  title: string;
  description: string;
  defaultLanguage: SupportedLanguage;
  starterCodes: Record<SupportedLanguage, string>;
  testCases: TestCase[];
  expectedTimeComplexity?: string;
  expectedSpaceComplexity?: string;
  hints?: string[];
}

export interface DiagramData {
  type: 'circuit' | 'waveform' | 'schematic' | 'cad' | 'power-grid' | 'engine' | 'structural';
  title: string;
  caption: string;
  svgContent: string;
  technicalNotes?: string[];
  specs?: Record<string, string>;
}

export interface DatasetQuestion {
  id: string;
  department: EngineeringDepartment;
  subject?: string;
  topic: string;
  subtopic: string;
  skill: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  question: string;
  questionType: QuestionType;
  keywords: string[];
  followUpTemplates: string[];
  idealAnswerPoints: string[];
  explanation: string;
  relevanceScore?: number;
  practicalTask?: string;
  evaluationCriteria?: string[];
  codingProblem?: CodingProblem;
  diagram?: DiagramData;
  questionSource?: 'resume-skill' | 'project' | 'internship' | 'certification' | 'curriculum-foundational';
  associatedProjectName?: string;
  associatedCertificationName?: string;
  associatedInternshipCompany?: string;
  learningExplanation?: string;
  recommendedPracticeQuestion?: string;
  whatToStudyNext?: string;
  referenceAnswer?: string;
  exampleSolution?: string;
}

export interface SkippedQuestionLearningData {
  questionText: string;
  correctAnswer: string;
  explanation: string;
  importantConcepts: string[];
  exampleSolution?: string;
}

export interface MatchedQuestion {
  question: DatasetQuestion;
  score: number;
  matchedKeywords: string[];
  matchedSkill: string;
  relevanceExplanation: string;
  isProjectMatched: boolean;
}

export interface FollowUpQuestion {
  id: string;
  parentQuestionId: string;
  question: string;
  topic: string;
  templateUsed: string;
  triggerKeywords: string[];
  explanation: string;
}

export interface SkillTopicMapping {
  skill: string;
  topic: string;
  subtopic: string;
  department: EngineeringDepartment;
  aliases: string[];
}

export interface ExtractedResumeNLP {
  normalizedText: string;
  extractedSkills: string[];
  skillTopicMap: { skill: string; topic: string; subtopic: string; category?: string }[];
  projectTechnologies: string[];
  projectTitles: string[];
  projectsList: { title: string; description: string; technologies: string[] }[];
  internshipsList: { company: string; role: string; duration?: string; description?: string }[];
  certificationsList: { name: string; issuer?: string; topic?: string }[];
  experienceRoles: string[];
  programmingLanguages: string[];
  databases: string[];
  frameworksAndLibraries: string[];
  toolsAndPlatforms: string[];
  aiAndMlTechnologies: string[];
  engineeringTools: string[];
  detectedDepartment: EngineeringDepartment;
  profileDepartment?: string;
  effectiveDepartment: EngineeringDepartment;
  departmentDeterminerNote: string;
  topNgrams: string[];
  termFrequencies: Record<string, number>;
}

export interface CodingExecutionResult {
  code: string;
  language: SupportedLanguage;
  passedCount: number;
  totalCount: number;
  testCaseResults: {
    testCaseId: string;
    passed: boolean;
    actualOutput: string;
    expectedOutput: string;
  }[];
  consoleOutput: string;
  executionMode: 'client-simulated' | 'client-js-eval';
  timeComplexityAnalysis?: string;
  spaceComplexityAnalysis?: string;
}

export interface NLPAnswerEvaluation {
  technicalAccuracyScore: number;
  communicationScore: number;
  relevanceScore: number;
  overallRating: string;
  strengths: string[];
  improvements: string[];
  sampleIdealAnswer: string;
  keywordCoverage: {
    found: string[];
    missing: string[];
  };
  followUpQuestion?: FollowUpQuestion;
  difficultyAdjustment?: 'promoted' | 'demoted' | 'maintained';
  adjustedDifficulty?: 'Beginner' | 'Intermediate' | 'Advanced';
  codingResult?: CodingExecutionResult;
  topicsToPractice?: string[];
  evaluationBand?: import('./evaluation/types').EvaluationBand;
  rubricBreakdown?: import('./evaluation/types').RubricBreakdown;
  conceptsCorrect?: import('./evaluation/types').ConceptCoverageResult[];
  conceptsMissing?: import('./evaluation/types').EssentialConcept[];
  misconceptionsDetected?: import('./evaluation/types').MisconceptionPenalty[];
  scoringAuditExplanation?: string[];
  evaluationMethodologyNotice?: string;
}

export interface QuestionHistoryEntry {
  questionId: string;
  questionText: string;
  normalizedText: string;
  skill: string;
  topic: string;
  subtopic?: string;
  department: EngineeringDepartment;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  questionType: QuestionType;
  setNumber: number;
  completionStatus: 'answered' | 'skipped' | 'pending';
  score?: number;
  askedAtTimestamp: number;
}

export interface TechnicalPracticeSetSummary {
  setNumber: number;
  questionIndices: number[];
  questionsAttempted: number;
  correctAnswers: number;
  partiallyCorrectAnswers: number;
  incorrectAnswers: number;
  skippedQuestions: number;
  setScore: number;
  skillsTested: string[];
  topicsTested: string[];
  improvements: string[];
  strengths: string[];
}

export interface TechnicalSkillCategoryPerformance {
  category: string;
  categoryKey: 'coding' | 'sql' | 'dsa' | 'aiml' | 'departmentCore' | 'resumeSkills';
  averageScore: number;
  attemptedCount: number;
  status: 'Strong' | 'Needs Practice' | 'Developing';
  skills: string[];
}

export interface SkillWiseProgressDashboardData {
  totalSetsCompleted: number;
  totalQuestionsAttempted: number;
  overallTechnicalScore: number;
  codingPerformance?: TechnicalSkillCategoryPerformance;
  sqlPerformance?: TechnicalSkillCategoryPerformance;
  dsaPerformance?: TechnicalSkillCategoryPerformance;
  aimlPerformance?: TechnicalSkillCategoryPerformance;
  departmentCorePerformance?: TechnicalSkillCategoryPerformance;
  resumeSkillPerformance?: TechnicalSkillCategoryPerformance;
  strongTopics: string[];
  weakTopics: string[];
  recommendedNextPracticeTopics: string[];
}

export interface TechnicalInterviewEngineConfig {
  resume: import('../types').ParsedResume | null;
  profileDepartment?: string;
  targetDepartment?: EngineeringDepartment;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  questionCount?: number;
}

export interface TopicMasteryRecord {
  topic: string;
  department: EngineeringDepartment;
  questionsAttempted: number;
  averageScore: number;
  needsPractice: boolean;
}

export interface TechnicalInterviewSessionState {
  questions: DatasetQuestion[];
  currentIndex: number;
  currentQuestion: DatasetQuestion | null;
  answers: InterviewAnswer[];
  activeFollowUp: FollowUpQuestion | null;
  isFollowUpActive: boolean;
  extractedNLP: ExtractedResumeNLP;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  isComplete: boolean;
  matchAudit: MatchedQuestion[];
  timeSpentSeconds: number;
  topicMastery: Record<string, TopicMasteryRecord>;
  codingSubmissions: Record<string, CodingExecutionResult>;
  currentSetNumber: number;
  completedSets: TechnicalPracticeSetSummary[];
  questionHistory: QuestionHistoryEntry[];
  isSetCompleted: boolean;
  currentSetSummary: TechnicalPracticeSetSummary | null;
  skillDashboard?: SkillWiseProgressDashboardData;
}

