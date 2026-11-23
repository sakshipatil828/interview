import { PreprocessedAnswer, preprocessAnswer } from './answerPreprocessor';
import { matchSemanticAnswer, SemanticMatchResult } from './semanticAnswerMatcher';
import { evaluateConceptCoverage, ConceptCoverageAnalysis } from './technicalConceptCoverage';
import { detectMisconceptions, MisconceptionDetectionResult } from './misconceptionDetector';
import { 
  QuestionEvaluationBenchmark, 
  EvaluatorOutput, 
  EvaluationBand, 
  RubricBreakdown, 
  RubricCategoryScore 
} from './types';
import { CodingExecutionResult } from '../types';

/**
 * Maps numeric score (0 to 100) to standard interpretation band
 */
export function getEvaluationBand(score: number): { band: EvaluationBand; label: string } {
  if (score >= 85) {
    return { band: '85–100: Strong, Technically Correct Answer', label: 'Strong, Technically Correct Answer' };
  }
  if (score >= 65) {
    return { band: '65–84: Mostly Correct', label: 'Mostly Correct' };
  }
  if (score >= 45) {
    return { band: '45–64: Partially Correct', label: 'Partially Correct' };
  }
  if (score >= 21) {
    return { band: '21–44: Limited Understanding', label: 'Limited Understanding' };
  }
  return { band: '0–20: Incorrect or Irrelevant', label: 'Incorrect or Irrelevant' };
}

/**
 * Pure NLP Semantic Answer Scoring Engine.
 * Evaluates technical correctness, concept coverage, semantic alignment, and reasoning
 * without requiring exact sentence matching or inflating scores.
 */
export function scoreAnswer(
  rawAnswerText: string,
  benchmark: QuestionEvaluationBenchmark,
  codingResult?: CodingExecutionResult
): EvaluatorOutput {
  // 1. Preprocess candidate answer
  const preprocessed = preprocessAnswer(rawAnswerText);
  const rubric = benchmark.scoringRubric || {
    technicalCorrectnessWeight: 0.40,
    essentialCoverageWeight: 0.30,
    relevanceSemanticWeight: 0.20,
    reasoningWeight: 0.10,
  };

  const auditLog: string[] = [];
  const strengths: string[] = [];
  const improvements: string[] = [];

  // Special handling for completely empty responses
  if (preprocessed.wordCount === 0 && !codingResult) {
    const zeroBreakdown: RubricBreakdown = {
      technicalCorrectness: { score: 0, weight: rubric.technicalCorrectnessWeight, weightedPoints: 0, maxPoints: rubric.technicalCorrectnessWeight * 100, explanation: 'No answer submitted.' },
      essentialCoverage: { score: 0, weight: rubric.essentialCoverageWeight, weightedPoints: 0, maxPoints: rubric.essentialCoverageWeight * 100, explanation: 'Zero concepts addressed.' },
      relevanceSemantic: { score: 0, weight: rubric.relevanceSemanticWeight, weightedPoints: 0, maxPoints: rubric.relevanceSemanticWeight * 100, explanation: 'No content to analyze.' },
      reasoningAndClarity: { score: 0, weight: rubric.reasoningWeight, weightedPoints: 0, maxPoints: rubric.reasoningWeight * 100, explanation: 'No explanation provided.' },
    };

    return {
      finalScore: 0,
      band: '0–20: Incorrect or Irrelevant',
      bandLabel: 'Incorrect or Irrelevant',
      rubricBreakdown: zeroBreakdown,
      conceptsCorrect: [],
      conceptsMissing: benchmark.essentialConcepts,
      supportingConceptsCovered: [],
      misconceptionsDetected: [],
      strengths: [],
      improvements: ['Submit a detailed technical response addressing the core question principles.'],
      sampleIdealAnswer: benchmark.expectedAnswer,
      suggestedImprovedAnswer: benchmark.expectedAnswer,
      scoringAuditExplanation: ['0 points awarded: empty submission.'],
      difficultyAdjustment: 'demoted',
      topicsToPractice: [`${benchmark.subject}: Core Principles`],
      evaluationMethodologyNotice: 'Scored via Deterministic NLP Semantic Concept Engine using explicit engineering rubrics.',
    };
  }

  // 2. Evaluate Semantic Meaning & Proposition Overlap
  const semanticMatch: SemanticMatchResult = matchSemanticAnswer(
    preprocessed,
    benchmark.expectedAnswer,
    benchmark.acceptedAlternatives
  );

  // 3. Evaluate Technical Essential & Supporting Concepts
  const conceptAnalysis: ConceptCoverageAnalysis = evaluateConceptCoverage(
    preprocessed,
    benchmark.essentialConcepts,
    benchmark.supportingConcepts,
    benchmark.acceptedAlternatives
  );

  // 4. Detect Misconceptions & Contradictions
  const misconceptionAnalysis: MisconceptionDetectionResult = detectMisconceptions(
    preprocessed,
    benchmark.commonMisconceptions
  );

  // 5. Evaluate Coding Task if code was submitted
  if (codingResult) {
    const passRate = codingResult.passedCount / (codingResult.totalCount || 1);
    auditLog.push(`Coding execution: Passed ${codingResult.passedCount}/${codingResult.totalCount} test cases (${Math.round(passRate * 100)}%).`);
    if (codingResult.timeComplexityAnalysis) {
      auditLog.push(`Detected algorithmic complexity: ${codingResult.timeComplexityAnalysis}.`);
    }
  }

  // =========================================================================
  // CALCULATE RUBRIC CATEGORIES
  // =========================================================================

  // A. Essential Concept Coverage (0 to 100)
  const coverageScore = Math.round(conceptAnalysis.essentialCoverageRatio * 100);
  const coverageWeighted = Math.round(coverageScore * rubric.essentialCoverageWeight);
  auditLog.push(
    `Concept Coverage (${Math.round(rubric.essentialCoverageWeight * 100)}% weight): Covered ${conceptAnalysis.coveredEssentialCount}/${conceptAnalysis.totalEssentialCount} essential concepts (${coverageScore}% -> ${coverageWeighted} pts).`
  );

  // B. Relevance & Semantic Alignment (0 to 100)
  let semanticScore = Math.round(semanticMatch.similarityScore * 100);
  if (semanticMatch.isOffTopic) {
    semanticScore = 0;
    auditLog.push(`Semantic Alignment: Detected off-topic or irrelevant submission (0 pts).`);
  } else {
    auditLog.push(
      `Semantic Alignment (${Math.round(rubric.relevanceSemanticWeight * 100)}% weight): Similarity ${semanticScore}% (TF-IDF: ${Math.round(semanticMatch.tfidfCosineScore * 100)}%, Propositions: ${Math.round(semanticMatch.propositionScore * 100)}%) -> ${Math.round(semanticScore * rubric.relevanceSemanticWeight)} pts.`
    );
  }
  const semanticWeighted = Math.round(semanticScore * rubric.relevanceSemanticWeight);

  // C. Explanation & Reasoning Depth (0 to 100)
  // Evaluates logical connectors, length adequacy, and structured thought
  let reasoningScore = 40; // baseline for answering
  if (preprocessed.wordCount >= 35) reasoningScore += 25;
  else if (preprocessed.wordCount >= 20) reasoningScore += 15;
  else if (preprocessed.wordCount < 10) reasoningScore -= 20;

  if (preprocessed.reasoningConnectorCount >= 2) reasoningScore += 25;
  else if (preprocessed.reasoningConnectorCount === 1) reasoningScore += 15;

  if (conceptAnalysis.supportingConceptsCovered.length > 0) reasoningScore += 10;
  if (semanticMatch.isOffTopic) reasoningScore = 0;

  reasoningScore = Math.max(0, Math.min(100, reasoningScore));
  const reasoningWeighted = Math.round(reasoningScore * rubric.reasoningWeight);
  auditLog.push(
    `Reasoning & Clarity (${Math.round(rubric.reasoningWeight * 100)}% weight): Word count ${preprocessed.wordCount}, ${preprocessed.reasoningConnectorCount} reasoning connectors -> ${reasoningScore}% (${reasoningWeighted} pts).`
  );

  // D. Technical Correctness (0 to 100)
  // Base correctness is derived from concept accuracy and semantic precision, then penalized by misconceptions
  let correctnessScore = 0;
  if (codingResult) {
    const testRate = codingResult.passedCount / (codingResult.totalCount || 1);
    correctnessScore = Math.round(testRate * 100);
  } else if (!semanticMatch.isOffTopic) {
    // Correctness correlates with valid concepts covered and penalizes contradictions
    const validRatio = conceptAnalysis.essentialCoverageRatio;
    correctnessScore = Math.round(validRatio * 85 + (semanticMatch.similarityScore >= 0.5 ? 15 : 0));
  }

  // Deduct misconception penalties directly from correctness
  if (misconceptionAnalysis.hasMisconceptions) {
    const penaltyTotal = misconceptionAnalysis.totalPenaltyPoints;
    correctnessScore = Math.max(0, correctnessScore - penaltyTotal);
    for (const expl of misconceptionAnalysis.explanations) {
      auditLog.push(`[PENALTY] ${expl}`);
    }
  }

  correctnessScore = Math.max(0, Math.min(100, correctnessScore));
  const correctnessWeighted = Math.round(correctnessScore * rubric.technicalCorrectnessWeight);
  auditLog.push(
    `Technical Correctness (${Math.round(rubric.technicalCorrectnessWeight * 100)}% weight): Score ${correctnessScore}% -> ${correctnessWeighted} pts.`
  );

  // =========================================================================
  // FINAL SCORE & INTERPRETATION BAND
  // =========================================================================
  let rawTotalScore = correctnessWeighted + coverageWeighted + semanticWeighted + reasoningWeighted;

  // Off-topic penalty: if candidate wrote something completely unrelated, hard cap at 10
  if (semanticMatch.isOffTopic && conceptAnalysis.coveredEssentialCount === 0) {
    rawTotalScore = Math.min(10, rawTotalScore);
  }

  const finalScore = Math.max(0, Math.min(100, Math.round(rawTotalScore)));
  const { band, label: bandLabel } = getEvaluationBand(finalScore);

  auditLog.push(`Final Score: ${finalScore}/100 (${band})`);

  // Build strengths
  for (const c of conceptAnalysis.coveredConcepts) {
    if (c.isCovered) {
      strengths.push(`Accurately addressed: ${c.name}${c.isAlternativeMatch ? ' (accepted equivalent formulation)' : ''}.`);
    }
  }
  if (conceptAnalysis.supportingConceptsCovered.length > 0) {
    strengths.push(`Demonstrated depth on supporting topics: [${conceptAnalysis.supportingConceptsCovered.join(', ')}].`);
  }
  if (preprocessed.reasoningConnectorCount >= 2) {
    strengths.push('Articulated logical cause-and-effect reasoning with clear connectors.');
  }
  if (strengths.length === 0 && finalScore > 20) {
    strengths.push('Provided an introductory answer to the technical question.');
  }

  // Build improvements
  for (const mc of conceptAnalysis.missingConcepts) {
    improvements.push(`Missing key concept: ${mc.name} — ${mc.description}.`);
  }
  for (const p of misconceptionAnalysis.penalties) {
    improvements.push(`Correction needed: "${p.detectedSnippet}" is technically inaccurate. ${p.whyIncorrect}`);
  }
  if (preprocessed.wordCount < 25 && finalScore < 85) {
    improvements.push('Expand response with specific operational parameters, boundary conditions, and design trade-offs.');
  }

  // Difficulty adjustment
  let difficultyAdjustment: 'promoted' | 'demoted' | 'maintained' = 'maintained';
  let adjustedDifficulty = benchmark.difficulty;

  if (finalScore >= 85) {
    if (benchmark.difficulty === 'Beginner') {
      difficultyAdjustment = 'promoted';
      adjustedDifficulty = 'Intermediate';
    } else if (benchmark.difficulty === 'Intermediate') {
      difficultyAdjustment = 'promoted';
      adjustedDifficulty = 'Advanced';
    }
  } else if (finalScore < 45) {
    if (benchmark.difficulty === 'Advanced') {
      difficultyAdjustment = 'demoted';
      adjustedDifficulty = 'Intermediate';
    } else if (benchmark.difficulty === 'Intermediate') {
      difficultyAdjustment = 'demoted';
      adjustedDifficulty = 'Beginner';
    }
  }

  // Topics to practice
  const topicsToPractice: string[] = [];
  if (conceptAnalysis.missingConcepts.length > 0) {
    topicsToPractice.push(`${benchmark.subject}: ${conceptAnalysis.missingConcepts[0].name}`);
  }
  if (misconceptionAnalysis.hasMisconceptions) {
    topicsToPractice.push(`${benchmark.subject}: Common Misconceptions & Pitfalls`);
  }

  const rubricBreakdown: RubricBreakdown = {
    technicalCorrectness: {
      score: correctnessScore,
      weight: rubric.technicalCorrectnessWeight,
      weightedPoints: correctnessWeighted,
      maxPoints: rubric.technicalCorrectnessWeight * 100,
      explanation: misconceptionAnalysis.hasMisconceptions
        ? `Score reduced due to ${misconceptionAnalysis.penalties.length} technical inaccuracy/misconception.`
        : 'Assessed against factual engineering criteria.',
    },
    essentialCoverage: {
      score: coverageScore,
      weight: rubric.essentialCoverageWeight,
      weightedPoints: coverageWeighted,
      maxPoints: rubric.essentialCoverageWeight * 100,
      explanation: `Covered ${conceptAnalysis.coveredEssentialCount} of ${conceptAnalysis.totalEssentialCount} required concepts.`,
    },
    relevanceSemantic: {
      score: semanticScore,
      weight: rubric.relevanceSemanticWeight,
      weightedPoints: semanticWeighted,
      maxPoints: rubric.relevanceSemanticWeight * 100,
      explanation: semanticMatch.isOffTopic
        ? 'Response does not align with the question domain.'
        : `Semantic similarity ${semanticScore}% using vector and proposition alignment.`,
    },
    reasoningAndClarity: {
      score: reasoningScore,
      weight: rubric.reasoningWeight,
      weightedPoints: reasoningWeighted,
      maxPoints: rubric.reasoningWeight * 100,
      explanation: `Evaluated ${preprocessed.wordCount} words with ${preprocessed.reasoningConnectorCount} logical connectors.`,
    },
  };

  return {
    finalScore,
    band,
    bandLabel,
    rubricBreakdown,
    conceptsCorrect: conceptAnalysis.coveredConcepts,
    conceptsMissing: conceptAnalysis.missingConcepts,
    supportingConceptsCovered: conceptAnalysis.supportingConceptsCovered,
    misconceptionsDetected: misconceptionAnalysis.penalties,
    strengths,
    improvements,
    sampleIdealAnswer: benchmark.expectedAnswer,
    suggestedImprovedAnswer: benchmark.expectedAnswer,
    scoringAuditExplanation: auditLog,
    difficultyAdjustment,
    adjustedDifficulty,
    codingResult,
    topicsToPractice,
    evaluationMethodologyNotice: 'Evaluated using Multi-Factor NLP Semantic Engine (Correctness 40%, Concepts 30%, Semantic 20%, Reasoning 10%).',
  };
}
