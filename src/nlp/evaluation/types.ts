import { EngineeringDepartment, SupportedLanguage, CodingExecutionResult, FollowUpQuestion } from '../types';

export type EvaluationBand =
  | '0–20: Incorrect or Irrelevant'
  | '21–44: Limited Understanding'
  | '45–64: Partially Correct'
  | '65–84: Mostly Correct'
  | '85–100: Strong, Technically Correct Answer';

export interface ScoringRubric {
  technicalCorrectnessWeight: number; // e.g., 0.40
  essentialCoverageWeight: number;    // e.g., 0.30
  relevanceSemanticWeight: number;    // e.g., 0.20
  reasoningWeight: number;            // e.g., 0.10
}

export interface EssentialConcept {
  id: string;
  name: string;
  description: string;
  keyPhrases: string[];               // Primary indicator phrases
  synonyms: string[];                 // Alternative terms/synonyms
  weight: number;                     // Relative importance (e.g. 1.0)
}

export interface SupportingConcept {
  id: string;
  name: string;
  description: string;
  keyPhrases: string[];
  synonyms?: string[];
}

export interface AlternativeExplanation {
  targetConceptId: string;
  phrasingPattern: string;            // Regex or substring pattern
  explanation: string;
}

export interface CommonMisconception {
  id: string;
  triggerPhrases: string[];           // Phrases signaling the misconception
  pattern?: string;                   // Optional regex pattern
  description: string;
  penaltyPoints: number;              // Dedicated point deduction (e.g. 15, 20)
  whyIncorrect: string;               // Educational explanation
}

export interface LabeledExampleAnswer {
  type: 'correct' | 'partially-correct' | 'incorrect' | 'alternative-phrasing' | 'misconception';
  answerText: string;
  expectedScoreRange: [number, number]; // [min, max]
  expectedBand: EvaluationBand;
  explanation: string;
}

export interface QuestionEvaluationBenchmark {
  questionId: string;
  department: EngineeringDepartment;
  subject: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  expectedAnswer: string;
  essentialConcepts: EssentialConcept[];
  supportingConcepts: SupportingConcept[];
  acceptedAlternatives: AlternativeExplanation[];
  commonMisconceptions: CommonMisconception[];
  scoringRubric: ScoringRubric;
  exampleAnswers: LabeledExampleAnswer[];
}

export interface ConceptCoverageResult {
  conceptId: string;
  name: string;
  isCovered: boolean;
  isPartial: boolean;
  evidenceSnippet?: string;
  isAlternativeMatch: boolean;
  explanation: string;
}

export interface MisconceptionPenalty {
  misconceptionId: string;
  description: string;
  penaltyPoints: number;
  detectedSnippet: string;
  whyIncorrect: string;
}

export interface RubricCategoryScore {
  score: number;       // 0 to 100 within category
  weight: number;      // e.g. 0.40
  weightedPoints: number; // score * weight
  maxPoints: number;   // weight * 100
  explanation: string;
}

export interface RubricBreakdown {
  technicalCorrectness: RubricCategoryScore;
  essentialCoverage: RubricCategoryScore;
  relevanceSemantic: RubricCategoryScore;
  reasoningAndClarity: RubricCategoryScore;
}

export interface EvaluatorOutput {
  finalScore: number;                 // 0 to 100 calculated from rubric
  band: EvaluationBand;
  bandLabel: string;                  // Short label: "Partially Correct", etc.
  rubricBreakdown: RubricBreakdown;
  conceptsCorrect: ConceptCoverageResult[];
  conceptsMissing: EssentialConcept[];
  supportingConceptsCovered: string[];
  misconceptionsDetected: MisconceptionPenalty[];
  strengths: string[];
  improvements: string[];
  sampleIdealAnswer: string;
  suggestedImprovedAnswer: string;
  scoringAuditExplanation: string[];  // Detailed rationale for score additions/deductions
  followUpQuestion?: FollowUpQuestion;
  difficultyAdjustment?: 'promoted' | 'demoted' | 'maintained';
  adjustedDifficulty?: 'Beginner' | 'Intermediate' | 'Advanced';
  codingResult?: CodingExecutionResult;
  topicsToPractice?: string[];
  evaluationMethodologyNotice: string;
}
