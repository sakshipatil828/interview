import { PreprocessedAnswer } from './answerPreprocessor';
import { EssentialConcept, SupportingConcept, AlternativeExplanation, ConceptCoverageResult } from './types';
import { stemToken, STOP_WORDS } from '../textPreprocessor';

export interface ConceptCoverageAnalysis {
  essentialCoverageRatio: number;      // 0.0 to 1.0
  coveredConcepts: ConceptCoverageResult[];
  missingConcepts: EssentialConcept[];
  supportingConceptsCovered: string[];
  totalEssentialCount: number;
  coveredEssentialCount: number;
}

/**
 * Evaluates candidate answer for essential and supporting technical concepts,
 * verifying synonyms, alternative explanations, and negation safeguards.
 */
export function evaluateConceptCoverage(
  candidate: PreprocessedAnswer,
  essentialConcepts: EssentialConcept[],
  supportingConcepts: SupportingConcept[] = [],
  acceptedAlternatives: AlternativeExplanation[] = []
): ConceptCoverageAnalysis {
  if (essentialConcepts.length === 0) {
    return {
      essentialCoverageRatio: 1.0,
      coveredConcepts: [],
      missingConcepts: [],
      supportingConceptsCovered: [],
      totalEssentialCount: 0,
      coveredEssentialCount: 0,
    };
  }

  const coveredConcepts: ConceptCoverageResult[] = [];
  const missingConcepts: EssentialConcept[] = [];
  let weightedPointsEarned = 0;
  let totalWeightPossible = 0;

  for (const concept of essentialConcepts) {
    totalWeightPossible += concept.weight || 1.0;
    let isCovered = false;
    let isPartial = false;
    let evidenceSnippet: string | undefined;
    let isAlternativeMatch = false;

    // 1. Check accepted alternatives targeting this concept
    for (const alt of acceptedAlternatives) {
      if (alt.targetConceptId === concept.id) {
        const pattern = alt.phrasingPattern.toLowerCase();
        const candNorm = candidate.normalizedText.replace(/[\s\(\)=]+/g, ' ');
        const patNorm = pattern.replace(/[\s\(\)=]+/g, ' ');
        if (candidate.normalizedText.includes(pattern) || (patNorm.trim().length > 3 && candNorm.includes(patNorm.trim()))) {
          isCovered = true;
          isAlternativeMatch = true;
          evidenceSnippet = `Alternative match: "${alt.phrasingPattern}"`;
          break;
        }
      }
    }

    // 2. Check primary keyPhrases
    if (!isCovered) {
      for (const phrase of concept.keyPhrases) {
        const cleanPhrase = phrase.toLowerCase();
        const rawPhraseTokens = cleanPhrase.match(/[a-z0-9_+#.-]+/g) || [];
        const contentTokens = rawPhraseTokens
          .map((t) => t.replace(/^[^a-z0-9_+#]+|[^a-z0-9_+#]+$/gi, ''))
          .filter((t) => t.length > 1 && !STOP_WORDS.has(t));
        const phraseStems = (contentTokens.length > 0 ? contentTokens : rawPhraseTokens).map(stemToken);

        // Check if full phrase exists directly in text
        if (candidate.normalizedText.includes(cleanPhrase)) {
          isCovered = true;
          evidenceSnippet = `Key phrase match: "${phrase}"`;
          break;
        }

        // Check token / stem set overlap
        if (phraseStems.length > 1) {
          const matchedStems = phraseStems.filter((s) => candidate.stemSet.has(s));
          if (matchedStems.length === phraseStems.length) {
            isCovered = true;
            evidenceSnippet = `Stem combination: "${phrase}"`;
            break;
          } else if (matchedStems.length >= Math.ceil(phraseStems.length * 0.65)) {
            isPartial = true;
            evidenceSnippet = `Partial concept match: "${phrase}"`;
          }
        } else if (phraseStems.length === 1 && candidate.stemSet.has(phraseStems[0])) {
          isCovered = true;
          evidenceSnippet = `Key term match: "${phrase}"`;
          break;
        }
      }
    }

    // 3. Check synonyms if not yet covered
    if (!isCovered && concept.synonyms) {
      for (const syn of concept.synonyms) {
        const cleanSyn = syn.toLowerCase();
        if (candidate.normalizedText.includes(cleanSyn)) {
          isCovered = true;
          isAlternativeMatch = true;
          evidenceSnippet = `Synonym match: "${syn}"`;
          break;
        }
        // Also check content stem overlap for synonyms
        const synTokens = cleanSyn.match(/[a-z0-9_+#.-]+/g) || [];
        const synContent = synTokens
          .map((t) => t.replace(/^[^a-z0-9_+#]+|[^a-z0-9_+#]+$/gi, ''))
          .filter((t) => t.length > 1 && !STOP_WORDS.has(t));
        const synStems = (synContent.length > 0 ? synContent : synTokens).map(stemToken);
        if (synStems.length > 1 && synStems.every((s) => candidate.stemSet.has(s))) {
          isCovered = true;
          isAlternativeMatch = true;
          evidenceSnippet = `Synonym stems match: "${syn}"`;
          break;
        }
      }
    }

    if (isCovered) {
      weightedPointsEarned += concept.weight || 1.0;
      coveredConcepts.push({
        conceptId: concept.id,
        name: concept.name,
        isCovered: true,
        isPartial: false,
        evidenceSnippet,
        isAlternativeMatch,
        explanation: `Demonstrated understanding of ${concept.name}.`,
      });
    } else if (isPartial) {
      weightedPointsEarned += (concept.weight || 1.0) * 0.5;
      coveredConcepts.push({
        conceptId: concept.id,
        name: concept.name,
        isCovered: false,
        isPartial: true,
        evidenceSnippet,
        isAlternativeMatch: false,
        explanation: `Partially referenced ${concept.name}; needs fuller technical explanation.`,
      });
      missingConcepts.push(concept);
    } else {
      missingConcepts.push(concept);
    }
  }

  // 4. Check supporting concepts
  const supportingCovered: string[] = [];
  for (const sup of supportingConcepts) {
    let hit = false;
    for (const phrase of sup.keyPhrases) {
      if (candidate.normalizedText.includes(phrase.toLowerCase())) {
        hit = true;
        break;
      }
    }
    if (hit) {
      supportingCovered.push(sup.name);
    }
  }

  const essentialCoverageRatio = totalWeightPossible > 0
    ? Math.min(1.0, weightedPointsEarned / totalWeightPossible)
    : 1.0;

  return {
    essentialCoverageRatio: Math.round(essentialCoverageRatio * 100) / 100,
    coveredConcepts,
    missingConcepts,
    supportingConceptsCovered: supportingCovered,
    totalEssentialCount: essentialConcepts.length,
    coveredEssentialCount: coveredConcepts.filter((c) => c.isCovered).length,
  };
}
