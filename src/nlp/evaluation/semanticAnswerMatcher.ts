import { PreprocessedAnswer, preprocessAnswer } from './answerPreprocessor';
import { AlternativeExplanation } from './types';
import { stemToken } from '../textPreprocessor';

export interface SemanticMatchResult {
  similarityScore: number;            // 0.0 to 1.0
  tfidfCosineScore: number;           // 0.0 to 1.0
  propositionScore: number;           // 0.0 to 1.0
  alternativeMatched: boolean;
  alternativeExplanationText?: string;
  isOffTopic: boolean;
  matchedConcepts: string[];
  explanation: string;
}

// Technical domain synonym dictionary for semantic paraphrasing
const TECHNICAL_SYNONYM_GROUPS: string[][] = [
  ['idempotent', 'repeatable', 'same effect', 'no extra side effect', 'identical server state', 'multiple identical requests', 'system state', 'network retries', 'side effects', 'no additional side effects'],
  ['safe method', 'read only', 'does not modify state', 'non mutating'],
  ['b-tree', 'balanced tree', 'btree index', 'clustered index', 'hierarchical tree'],
  ['filesort', 'memory sort', 'disk sort', 'unindexed sort', 'sorting without index'],
  ['virtual ground', 'zero potential', '0v potential', 'ground potential at inverting pin', 'zero volts'],
  ['negative feedback', 'closed loop stabilization', 'degenerative feedback', 'attenuates gain'],
  ['setup time', 'data arrival margin', 'clock setup aperture', 'prior to active edge'],
  ['hold time', 'data hold margin', 'post clock edge stability', 'after clock trigger'],
  ['metastability', 'indeterminate voltage', 'intermediate logic state', 'oscillation', 'timing violation state'],
  ['open circuit test', 'no load test', 'core loss measurement', 'iron loss test', 'rated voltage lv test'],
  ['short circuit test', 'copper loss measurement', 'impedance test', 'rated current test'],
  ['buck converter', 'step down converter', 'step-down dc-dc', 'voltage reducer', 'chopper'],
  ['duty cycle', 'pulse width ratio', 'on time fraction', 'conduction ratio'],
  ['simply supported', 'pin and roller', 'two point support', 'statically determinate beam'],
  ['bending moment', 'internal flexural torque', 'beam bending moment', 'moment of resistance'],
  ['shear force', 'transverse shear', 'vertical shear', 'shear load'],
  ['under-reinforced', 'ductile failure', 'steel yields first', 'visible deflection warning', 'tension controlled'],
  ['over-reinforced', 'brittle failure', 'concrete crushes first', 'sudden collapse', 'compression controlled'],
  ['bearing capacity', 'allowable soil pressure', 'foundation support limit', 'terzaghi shear resistance'],
  ['otto cycle', 'spark ignition cycle', 'petrol engine cycle', 'constant volume combustion cycle'],
  ['knocking', 'detonation', 'pre-ignition', 'autoignition', 'engine ping'],
  ['abs', 'anti lock braking', 'skid prevention', 'wheel lockup prevention', 'active brake modulation'],
  ['slip ratio', 'wheel slip', 'tire skid factor', 'relative speed difference'],
  ['bms', 'battery management', 'pack protection', 'cell monitoring', 'soc estimation'],
  ['regenerative braking', 'energy recovery', 'kinetic recapture', 'motor as generator', 'regen'],
  ['bias variance', 'overfitting underfitting', 'generalization error', 'model capacity tradeoff'],
  ['l1 regularization', 'lasso', 'sparse weights', 'feature selection penalty', 'manhattan norm'],
  ['l2 regularization', 'ridge', 'weight decay', 'euclidean penalty', 'shrinkage'],
  ['data drift', 'covariate shift', 'input distribution change', 'feature drift'],
  ['concept drift', 'target relationship change', 'p(y|x) shift', 'ground truth evolution']
];

/**
 * Computes semantic similarity between candidate answer and benchmark expected answer
 * using sublinear TF-IDF vectors, proposition overlap, synonym expansion, and alternative phrasings.
 */
export function matchSemanticAnswer(
  candidate: PreprocessedAnswer,
  expectedAnswerText: string,
  acceptedAlternatives: AlternativeExplanation[] = []
): SemanticMatchResult {
  if (candidate.wordCount < 2) {
    return {
      similarityScore: 0,
      tfidfCosineScore: 0,
      propositionScore: 0,
      alternativeMatched: false,
      isOffTopic: true,
      matchedConcepts: [],
      explanation: 'No substantive answer provided.',
    };
  }

  const expectedPre = preprocessAnswer(expectedAnswerText);

  // 1. Check for explicit accepted alternative explanations
  let alternativeMatched = false;
  let alternativeExplanationText: string | undefined;

  for (const alt of acceptedAlternatives) {
    const pattern = alt.phrasingPattern.toLowerCase();
    if (candidate.normalizedText.includes(pattern)) {
      alternativeMatched = true;
      alternativeExplanationText = alt.explanation;
      break;
    }
  }

  // 2. Compute TF-IDF Cosine Similarity
  const allTokens = [...expectedPre.stemmedTokens, ...candidate.stemmedTokens];
  const uniqueVocab = Array.from(new Set(allTokens));

  const tfCand: Record<string, number> = {};
  const tfExp: Record<string, number> = {};

  for (const t of candidate.stemmedTokens) tfCand[t] = (tfCand[t] || 0) + 1;
  for (const t of expectedPre.stemmedTokens) tfExp[t] = (tfExp[t] || 0) + 1;

  let dotProduct = 0;
  let magCandSq = 0;
  let magExpSq = 0;

  for (const term of uniqueVocab) {
    const c = tfCand[term] || 0;
    const e = tfExp[term] || 0;
    // Sublinear term frequency scaling
    const wC = c > 0 ? 1.0 + Math.log(c) : 0;
    const wE = e > 0 ? 1.0 + Math.log(e) : 0;
    dotProduct += wC * wE;
    magCandSq += wC * wC;
    magExpSq += wE * wE;
  }

  const tfidfCosineScore = (magCandSq > 0 && magExpSq > 0)
    ? Math.min(1.0, dotProduct / (Math.sqrt(magCandSq) * Math.sqrt(magExpSq)))
    : 0;

  // 3. Synonym Group semantic expansion
  let synonymGroupHits = 0;
  const matchedConcepts: string[] = [];

  for (const group of TECHNICAL_SYNONYM_GROUPS) {
    const expectedHasGroup = group.some((term) => expectedPre.normalizedText.includes(term.toLowerCase()));
    if (expectedHasGroup) {
      const candidateHasGroup = group.some((term) => candidate.normalizedText.includes(term.toLowerCase()));
      if (candidateHasGroup) {
        synonymGroupHits++;
        matchedConcepts.push(group[0]);
      }
    }
  }

  // 4. Proposition / Clause semantic overlap
  let clauseOverlapCount = 0;
  const expectedClauses = expectedPre.clauses.filter((c) => c.split(/\s+/).length >= 4);

  for (const expClause of expectedClauses) {
    const expPreClause = preprocessAnswer(expClause);
    const expStems = new Set(expPreClause.stemmedTokens);
    if (expStems.size === 0) continue;

    let bestClauseOverlap = 0;
    for (const candClause of candidate.clauses) {
      const candPreClause = preprocessAnswer(candClause);
      let hits = 0;
      for (const t of candPreClause.stemmedTokens) {
        if (expStems.has(t)) hits++;
      }
      const overlap = hits / expStems.size;
      if (overlap > bestClauseOverlap) bestClauseOverlap = overlap;
    }

    if (bestClauseOverlap >= 0.35) {
      clauseOverlapCount++;
    }
  }

  const propositionScore = expectedClauses.length > 0
    ? Math.min(1.0, clauseOverlapCount / expectedClauses.length)
    : tfidfCosineScore;

  // 5. Blended Semantic Similarity Calculation
  let similarityScore = (tfidfCosineScore * 0.45) + (propositionScore * 0.40) + (Math.min(1.0, synonymGroupHits * 0.15) * 0.15);

  if (alternativeMatched) {
    similarityScore = Math.max(similarityScore, 0.85);
  }

  // Check off-topic condition (near zero overlap with both raw text and synonym groups)
  const isOffTopic = tfidfCosineScore < 0.10 && propositionScore < 0.10 && synonymGroupHits === 0;

  let explanation = '';
  if (isOffTopic) {
    explanation = 'The candidate response shows virtually no semantic alignment with the technical question topic.';
  } else if (alternativeMatched) {
    explanation = `Matched recognized alternative formulation: ${alternativeExplanationText || 'Valid conceptual equivalence detected.'}`;
  } else if (similarityScore >= 0.75) {
    explanation = 'Strong semantic alignment with expected technical principles.';
  } else if (similarityScore >= 0.45) {
    explanation = 'Moderate semantic alignment with core concepts.';
  } else {
    explanation = 'Limited semantic alignment; misses several key technical propositions.';
  }

  return {
    similarityScore: Math.round(similarityScore * 100) / 100,
    tfidfCosineScore: Math.round(tfidfCosineScore * 100) / 100,
    propositionScore: Math.round(propositionScore * 100) / 100,
    alternativeMatched,
    alternativeExplanationText,
    isOffTopic,
    matchedConcepts,
    explanation,
  };
}
