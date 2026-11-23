import { DatasetQuestion, QuestionHistoryEntry } from './types';
import { normalizeText, preprocessDocument } from './textPreprocessor';

/**
 * Normalizes question text for strict duplicate detection:
 * converts to lowercase, strips punctuation, and normalizes spacing.
 */
export function normalizeForDuplicateCheck(text: string): string {
  if (!text) return '';
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Tokenizes text into stemmed keywords excluding common stop words
 */
export function tokenizeForDuplicateCheck(text: string): Set<string> {
  const pre = preprocessDocument(text);
  return new Set(pre.stemmedTokens);
}

/**
 * Calculates Jaccard token similarity between two token sets:
 * |A ∩ B| / |A ∪ B|
 */
export function calculateJaccardSimilarity(setA: Set<string>, setB: Set<string>): number {
  if (setA.size === 0 && setB.size === 0) return 1.0;
  if (setA.size === 0 || setB.size === 0) return 0.0;

  let intersectionCount = 0;
  for (const token of setA) {
    if (setB.has(token)) {
      intersectionCount++;
    }
  }

  const unionCount = setA.size + setB.size - intersectionCount;
  return unionCount === 0 ? 0 : intersectionCount / unionCount;
}

/**
 * Checks whether a candidate question is duplicate against previous question history
 * or other questions in the same practice set.
 */
export function isQuestionDuplicate(
  candidate: DatasetQuestion,
  history: QuestionHistoryEntry[],
  currentSetQuestions: DatasetQuestion[] = []
): { isDuplicate: boolean; reason?: string } {
  // 1. Exact ID check against history
  for (const h of history) {
    if (h.questionId === candidate.id) {
      return { isDuplicate: true, reason: `Exact ID match with previously asked question (${candidate.id}).` };
    }
  }

  // 2. Exact ID check against current set
  for (const q of currentSetQuestions) {
    if (q.id === candidate.id) {
      return { isDuplicate: true, reason: `Exact ID match with question in current set (${candidate.id}).` };
    }
  }

  const normCandidate = normalizeForDuplicateCheck(candidate.question);
  const candTokens = tokenizeForDuplicateCheck(candidate.question);

  // 3. Normalized text match against history
  for (const h of history) {
    if (h.normalizedText === normCandidate) {
      return { isDuplicate: true, reason: `Exact normalized text match with history question "${h.questionId}".` };
    }
  }

  // 4. Normalized text match against current set
  for (const q of currentSetQuestions) {
    if (normalizeForDuplicateCheck(q.question) === normCandidate) {
      return { isDuplicate: true, reason: `Exact normalized text match in current set.` };
    }
  }

  // 5. Jaccard token overlap against history (threshold 0.58 to catch reworded questions)
  for (const h of history) {
    const histTokens = tokenizeForDuplicateCheck(h.questionText);
    const jaccard = calculateJaccardSimilarity(candTokens, histTokens);
    if (jaccard >= 0.58) {
      return {
        isDuplicate: true,
        reason: `Semantic overlap (${Math.round(jaccard * 100)}%) with prior question "${h.questionId}".`,
      };
    }
  }

  // 6. Jaccard token overlap against current set
  for (const q of currentSetQuestions) {
    const qTokens = tokenizeForDuplicateCheck(q.question);
    const jaccard = calculateJaccardSimilarity(candTokens, qTokens);
    if (jaccard >= 0.58) {
      return {
        isDuplicate: true,
        reason: `Semantic overlap (${Math.round(jaccard * 100)}%) with question in active set.`,
      };
    }
  }

  // 7. Coding Problem Title check
  if (candidate.codingProblem?.title) {
    const candTitle = candidate.codingProblem.title.toLowerCase().trim();
    for (const h of history) {
      if (h.questionType === 'coding' && h.questionText.toLowerCase().includes(candTitle)) {
        return { isDuplicate: true, reason: `Coding challenge "${candidate.codingProblem.title}" already completed.` };
      }
    }
    for (const q of currentSetQuestions) {
      if (q.codingProblem?.title && q.codingProblem.title.toLowerCase().trim() === candTitle) {
        return { isDuplicate: true, reason: `Same coding challenge "${candidate.codingProblem.title}" in active set.` };
      }
    }
  }

  // 8. Intraset Skill Diversity: Never duplicate the same skill in the same set of 4 questions
  if (currentSetQuestions.length > 0 && currentSetQuestions.length < 4) {
    const candidateSkill = candidate.skill.toLowerCase().trim();
    const hasSameSkillInSet = currentSetQuestions.some(
      (q) => q.skill.toLowerCase().trim() === candidateSkill
    );
    if (hasSameSkillInSet) {
      return { isDuplicate: true, reason: `Skill "${candidate.skill}" is already being tested in this set.` };
    }
  }

  return { isDuplicate: false };
}
