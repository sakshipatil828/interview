import { EvaluatorOutput } from './types';
import { FollowUpQuestion } from '../types';

export interface FeedbackSummaryCard {
  headline: string;
  scoreDisplay: string;
  bandBadge: string;
  summaryText: string;
  rubricSummaryLines: { category: string; scoreText: string; note: string }[];
  conceptsMasteredList: string[];
  conceptsMissedList: string[];
  penaltiesList: { phrase: string; reason: string; pts: number }[];
  recommendedAnswer: string;
  nextStepsAdvice: string;
}

/**
 * Generates structured, educational candidate feedback from evaluator output.
 */
export function generateFeedbackSummary(
  output: EvaluatorOutput,
  questionSkill: string,
  questionTopic: string
): FeedbackSummaryCard {
  const breakdown = output.rubricBreakdown;

  const rubricLines = [
    {
      category: 'Technical Correctness (40%)',
      scoreText: `${breakdown.technicalCorrectness.score}/100 (${breakdown.technicalCorrectness.weightedPoints}/${breakdown.technicalCorrectness.maxPoints} pts)`,
      note: breakdown.technicalCorrectness.explanation,
    },
    {
      category: 'Concept Coverage (30%)',
      scoreText: `${breakdown.essentialCoverage.score}/100 (${breakdown.essentialCoverage.weightedPoints}/${breakdown.essentialCoverage.maxPoints} pts)`,
      note: breakdown.essentialCoverage.explanation,
    },
    {
      category: 'Relevance & Alignment (20%)',
      scoreText: `${breakdown.relevanceSemantic.score}/100 (${breakdown.relevanceSemantic.weightedPoints}/${breakdown.relevanceSemantic.maxPoints} pts)`,
      note: breakdown.relevanceSemantic.explanation,
    },
    {
      category: 'Reasoning & Clarity (10%)',
      scoreText: `${breakdown.reasoningAndClarity.score}/100 (${breakdown.reasoningAndClarity.weightedPoints}/${breakdown.reasoningAndClarity.maxPoints} pts)`,
      note: breakdown.reasoningAndClarity.explanation,
    },
  ];

  const mastered = output.conceptsCorrect
    .filter((c) => c.isCovered)
    .map((c) => `${c.name}${c.isAlternativeMatch ? ' [Alternative phrasing accepted]' : ''}`);

  const missed = output.conceptsMissing.map((m) => `${m.name}: ${m.description}`);

  const penalties = output.misconceptionsDetected.map((p) => ({
    phrase: p.detectedSnippet,
    reason: p.whyIncorrect,
    pts: p.penaltyPoints,
  }));

  let nextStepsAdvice = '';
  if (output.finalScore >= 85) {
    nextStepsAdvice = `Excellent technical grasp of ${questionSkill}. Ready for advanced system-level architectural drills.`;
  } else if (output.finalScore >= 65) {
    nextStepsAdvice = `Solid understanding of ${questionSkill}. Focus on elaborating boundary conditions and industry standards.`;
  } else if (output.finalScore >= 45) {
    nextStepsAdvice = `Partial credit awarded for valid concepts. Review missing core principles and operational mechanisms.`;
  } else {
    nextStepsAdvice = `Recommend foundational review of ${questionTopic} before attempting mock interview again.`;
  }

  return {
    headline: `Technical Assessment: ${output.bandLabel}`,
    scoreDisplay: `${output.finalScore}/100`,
    bandBadge: output.band,
    summaryText: `Your answer was evaluated using CareerCurve's multi-factor NLP rubric (Technical Correctness, Concept Coverage, Semantic Meaning, and Reasoning).`,
    rubricSummaryLines: rubricLines,
    conceptsMasteredList: mastered,
    conceptsMissedList: missed,
    penaltiesList: penalties,
    recommendedAnswer: output.suggestedImprovedAnswer,
    nextStepsAdvice,
  };
}
