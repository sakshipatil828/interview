import { PreprocessedAnswer } from './answerPreprocessor';
import { CommonMisconception, MisconceptionPenalty } from './types';

export interface MisconceptionDetectionResult {
  hasMisconceptions: boolean;
  totalPenaltyPoints: number;
  penalties: MisconceptionPenalty[];
  explanations: string[];
}

/**
 * Scans candidate answer for common misconceptions and incorrect technical claims.
 * Deduces points with explicit educational explanations.
 */
export function detectMisconceptions(
  candidate: PreprocessedAnswer,
  commonMisconceptions: CommonMisconception[] = []
): MisconceptionDetectionResult {
  const penalties: MisconceptionPenalty[] = [];
  const explanations: string[] = [];
  let totalPenaltyPoints = 0;

  if (candidate.wordCount < 2 || commonMisconceptions.length === 0) {
    return {
      hasMisconceptions: false,
      totalPenaltyPoints: 0,
      penalties: [],
      explanations: [],
    };
  }

  const norm = candidate.normalizedText;

  for (const misc of commonMisconceptions) {
    let triggered = false;
    let snippet = '';

    // 1. Check custom regex pattern if provided
    if (misc.pattern) {
      try {
        const regex = new RegExp(misc.pattern, 'i');
        const match = norm.match(regex);
        if (match) {
          triggered = true;
          snippet = match[0];
        }
      } catch (err) {
        // Pattern fallback to phrase list
      }
    }

    // 2. Check trigger phrases
    if (!triggered) {
      for (const phrase of misc.triggerPhrases) {
        const cleanPhrase = phrase.toLowerCase();
        if (norm.includes(cleanPhrase)) {
          triggered = true;
          snippet = phrase;
          break;
        }

        // Flexible token sequence check (allows 0-2 filler words, guarding against negation like 'not'/'non')
        const words = cleanPhrase.split(/\s+/).filter(Boolean);
        if (words.length >= 2) {
          const escaped = words.map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
          const patternStr = escaped.join('\\s+(?:(?!not|non|never|isn\'t)[a-z0-9_]+\\s+){0,2}');
          try {
            const flexRegex = new RegExp(`\\b${patternStr}\\b`, 'i');
            const match = norm.match(flexRegex);
            if (match) {
              triggered = true;
              snippet = match[0];
              break;
            }
          } catch (err) {
            // ignore regex fallback
          }
        }
      }
    }

    if (triggered) {
      const penaltyPts = misc.penaltyPoints || 15;
      totalPenaltyPoints += penaltyPts;

      const penaltyRecord: MisconceptionPenalty = {
        misconceptionId: misc.id,
        description: misc.description,
        penaltyPoints: penaltyPts,
        detectedSnippet: snippet,
        whyIncorrect: misc.whyIncorrect,
      };

      penalties.push(penaltyRecord);
      explanations.push(`Penalty -${penaltyPts} pts: Stated "${snippet}". ${misc.whyIncorrect}`);
    }
  }

  return {
    hasMisconceptions: penalties.length > 0,
    totalPenaltyPoints,
    penalties,
    explanations,
  };
}
