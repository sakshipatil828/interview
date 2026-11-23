import { DatasetQuestion, ExtractedResumeNLP, MatchedQuestion, FollowUpQuestion, EngineeringDepartment, NLPAnswerEvaluation } from './types';
import { TECHNICAL_QUESTION_DATASET } from './questionDataset';
import { preprocessDocument, stemToken, normalizeText } from './textPreprocessor';
import { assembleTechnicalQuestions } from './dynamicQuestionGenerator';

/**
 * Builds vocabulary and computes Inverse Document Frequency (IDF) table
 */
function buildIdfTable(documents: string[][]): Record<string, number> {
  const docCount = documents.length;
  const df: Record<string, number> = {};

  for (const doc of documents) {
    const uniqueTokens = new Set(doc);
    for (const token of uniqueTokens) {
      df[token] = (df[token] || 0) + 1;
    }
  }

  const idf: Record<string, number> = {};
  for (const [token, count] of Object.entries(df)) {
    // Smoothed IDF formula
    idf[token] = Math.log((docCount + 1) / (count + 1)) + 1.0;
  }

  return idf;
}

/**
 * Converts a token array with optional term weights into a normalized TF-IDF vector
 */
function computeTfIdfVector(
  tokens: string[],
  weights: Record<string, number> = {},
  idfTable: Record<string, number>
): Record<string, number> {
  const tf: Record<string, number> = {};
  for (const token of tokens) {
    const w = weights[token] || 1.0;
    tf[token] = (tf[token] || 0) + w;
  }

  const vector: Record<string, number> = {};
  let sumSquares = 0;

  for (const [token, freq] of Object.entries(tf)) {
    const idf = idfTable[token] || 1.0;
    // Sublinear term frequency scaling
    const tfScaled = 1.0 + Math.log(freq);
    const val = tfScaled * idf;
    vector[token] = val;
    sumSquares += val * val;
  }

  // L2 Euclidean vector normalization
  const magnitude = Math.sqrt(sumSquares);
  if (magnitude > 0) {
    for (const token of Object.keys(vector)) {
      vector[token] = vector[token] / magnitude;
    }
  }

  return vector;
}

/**
 * Computes Cosine Similarity between two L2-normalized sparse vectors
 */
function cosineSimilarity(vecA: Record<string, number>, vecB: Record<string, number>): number {
  let dotProduct = 0;
  // Iterate through smaller vector
  const [small, large] = Object.keys(vecA).length <= Object.keys(vecB).length ? [vecA, vecB] : [vecB, vecA];

  for (const [term, valA] of Object.entries(small)) {
    const valB = large[term];
    if (valB !== undefined) {
      dotProduct += valA * valB;
    }
  }

  return Math.max(0, Math.min(1.0, dotProduct));
}

/**
 * Constructs candidate resume document representation with weighted sections
 */
function buildCandidateTokens(extracted: ExtractedResumeNLP): { tokens: string[]; weights: Record<string, number> } {
  const tokens: string[] = [];
  const weights: Record<string, number> = {};

  // 1. Raw normalized tokens from summary & descriptions (weight 1.0)
  const basePre = preprocessDocument(extracted.normalizedText);
  for (const t of basePre.stemmedTokens) {
    tokens.push(t);
  }

  // 2. Extracted skills - heavy boost (weight 3.5)
  for (const skill of extracted.extractedSkills) {
    const p = preprocessDocument(skill);
    for (const t of p.stemmedTokens) {
      tokens.push(t);
      weights[t] = Math.max(weights[t] || 1.0, 3.5);
    }
  }

  // 3. Project technologies and project titles - high boost (weight 3.0)
  for (const tech of extracted.projectTechnologies) {
    const p = preprocessDocument(tech);
    for (const t of p.stemmedTokens) {
      tokens.push(t);
      weights[t] = Math.max(weights[t] || 1.0, 3.0);
    }
  }

  for (const title of extracted.projectTitles) {
    const p = preprocessDocument(title);
    for (const t of p.stemmedTokens) {
      tokens.push(t);
      weights[t] = Math.max(weights[t] || 1.0, 2.5);
    }
  }

  // 4. Experience roles (weight 2.0)
  for (const role of extracted.experienceRoles) {
    const p = preprocessDocument(role);
    for (const t of p.stemmedTokens) {
      tokens.push(t);
      weights[t] = Math.max(weights[t] || 1.0, 2.0);
    }
  }

  return { tokens, weights };
}

/**
 * Constructs question document representation with weighted keywords & skills
 */
function buildQuestionTokens(q: DatasetQuestion): { tokens: string[]; weights: Record<string, number> } {
  const tokens: string[] = [];
  const weights: Record<string, number> = {};

  // Question text (weight 1.0)
  const qPre = preprocessDocument(q.question);
  for (const t of qPre.stemmedTokens) {
    tokens.push(t);
  }

  // Primary skill (weight 3.5)
  const skillPre = preprocessDocument(q.skill);
  for (const t of skillPre.stemmedTokens) {
    tokens.push(t);
    weights[t] = Math.max(weights[t] || 1.0, 3.5);
  }

  // Keywords (weight 2.5)
  for (const kw of q.keywords) {
    const kwPre = preprocessDocument(kw);
    for (const t of kwPre.stemmedTokens) {
      tokens.push(t);
      weights[t] = Math.max(weights[t] || 1.0, 2.5);
    }
  }

  // Topic and Subtopic (weight 2.0)
  const topicPre = preprocessDocument(`${q.topic} ${q.subtopic}`);
  for (const t of topicPre.stemmedTokens) {
    tokens.push(t);
    weights[t] = Math.max(weights[t] || 1.0, 2.0);
  }

  return { tokens, weights };
}

/**
 * Matches, scores, and selects diverse technical questions based on NLP similarity
 */
export function matchTechnicalQuestions(
  extracted: ExtractedResumeNLP,
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced',
  targetCount: number = 4
): { selectedQuestions: DatasetQuestion[]; audit: MatchedQuestion[] } {
  const targetDept = extracted.effectiveDepartment;

  // 1. Generate resume-driven questions tailored to actual skills, projects, internships & certifications
  const dynamicResumeQuestions = assembleTechnicalQuestions(extracted, difficulty, targetCount * 2);

  // 2. Filter dataset questions by candidate's effective department
  const deptQuestions = TECHNICAL_QUESTION_DATASET.filter((q) => q.department === targetDept);

  // Combined candidate pool: dynamic resume questions prioritized first, then department questions
  const combinedMap = new Map<string, DatasetQuestion>();
  dynamicResumeQuestions.forEach((q) => combinedMap.set(q.id, q));
  deptQuestions.forEach((q) => {
    if (!combinedMap.has(q.id)) {
      combinedMap.set(q.id, q);
    }
  });

  const candidatePool = Array.from(combinedMap.values());

  // 3. Prepare corpus documents for TF-IDF calculation
  const candidateTokensData = buildCandidateTokens(extracted);
  const questionTokensList = candidatePool.map((q) => buildQuestionTokens(q));

  const allCorpusDocs: string[][] = [
    candidateTokensData.tokens,
    ...questionTokensList.map((qt) => qt.tokens)
  ];

  const idfTable = buildIdfTable(allCorpusDocs);

  // Vectorize candidate resume
  const candidateVector = computeTfIdfVector(candidateTokensData.tokens, candidateTokensData.weights, idfTable);

  // 4. Compute cosine similarity & relevance bonuses for each question
  const scoredQuestions: MatchedQuestion[] = candidatePool.map((q, idx) => {
    const qTokenData = questionTokensList[idx];
    const qVector = computeTfIdfVector(qTokenData.tokens, qTokenData.weights, idfTable);
    let score = cosineSimilarity(candidateVector, qVector);

    // Exact skill match bonus
    const skillNorm = q.skill.toLowerCase();
    const hasExactSkill = extracted.extractedSkills.some(
      (s) => s.toLowerCase() === skillNorm || skillNorm.includes(s.toLowerCase()) || s.toLowerCase().includes(skillNorm)
    );
    if (hasExactSkill) {
      score += 0.35;
    }

    // Project technology match bonus
    const isProjectMatched = q.questionSource === 'project' || extracted.projectTechnologies.some(
      (pt) => pt.toLowerCase() === skillNorm || skillNorm.includes(pt.toLowerCase())
    );
    if (isProjectMatched) {
      score += 0.30;
    }

    // Internship / Certification match bonus
    if (q.questionSource === 'internship') {
      score += 0.28;
    } else if (q.questionSource === 'certification') {
      score += 0.26;
    }

    // Difficulty weighting
    if (q.difficulty === difficulty) {
      score *= 1.25;
    } else if (
      (difficulty === 'Intermediate') ||
      (difficulty === 'Beginner' && q.difficulty === 'Intermediate') ||
      (difficulty === 'Advanced' && q.difficulty === 'Intermediate')
    ) {
      score *= 1.05;
    } else {
      score *= 0.85;
    }

    // Find overlapping keywords for audit explanation
    const qTerms = new Set(qTokenData.tokens);
    const matchedKeywords = Array.from(new Set(candidateTokensData.tokens.filter((t) => qTerms.has(t))));

    let relevanceExplanation = '';
    if (q.questionSource === 'project') {
      relevanceExplanation = `Directly generated from your resume project: "${q.associatedProjectName || q.skill}".`;
    } else if (q.questionSource === 'internship') {
      relevanceExplanation = `Directly generated from your internship experience at: "${q.associatedInternshipCompany || 'Host Organization'}".`;
    } else if (q.questionSource === 'certification') {
      relevanceExplanation = `Directly generated from your resume certification: "${q.associatedCertificationName || q.skill}".`;
    } else if (hasExactSkill) {
      relevanceExplanation = `Direct match to your extracted resume skill: "${q.skill}" (${q.topic}).`;
    } else if (isProjectMatched) {
      relevanceExplanation = `Matched to technologies referenced in your resume projects: "${q.skill}".`;
    } else if (matchedKeywords.length > 0) {
      relevanceExplanation = `NLP TF-IDF keyword overlap on domain terms: [${matchedKeywords.slice(0, 3).join(', ')}].`;
    } else {
      relevanceExplanation = `Core foundational curriculum topic for ${targetDept} at ${q.difficulty} level.`;
    }

    return {
      question: {
        ...q,
        relevanceScore: Math.round(score * 100) / 100,
      },
      score: Math.round(score * 100) / 100,
      matchedKeywords: matchedKeywords.slice(0, 6),
      matchedSkill: q.skill,
      relevanceExplanation,
      isProjectMatched,
    };
  });

  // Sort candidate questions descending by similarity score
  scoredQuestions.sort((a, b) => b.score - a.score);

  // 5. Select top diverse questions (Diversity / Topic Clustering to avoid duplicate questions on same skill)
  const selected: DatasetQuestion[] = [];
  const selectedTopics = new Set<string>();
  const selectedSkills = new Set<string>();

  // Pass 1: Greedily pick top-scoring questions with unique topics and skills
  for (const item of scoredQuestions) {
    if (selected.length >= targetCount) break;

    const topicKey = `${item.question.topic}:${item.question.subtopic}`;
    if (!selectedTopics.has(topicKey) && !selectedSkills.has(item.question.skill)) {
      selected.push(item.question);
      selectedTopics.add(topicKey);
      selectedSkills.add(item.question.skill);
    }
  }

  // Pass 2: If we still need more questions, allow same topic with different skills or project questions
  if (selected.length < targetCount) {
    for (const item of scoredQuestions) {
      if (selected.length >= targetCount) break;
      if (!selected.some((q) => q.id === item.question.id)) {
        selected.push(item.question);
      }
    }
  }

  return {
    selectedQuestions: selected,
    audit: scoredQuestions,
  };
}

import { getQuestionEvaluationBenchmark } from './evaluation/evaluationDataset';
import { scoreAnswer } from './evaluation/answerScoringEngine';

/**
 * Evaluates candidate answer using the multi-factor NLP Semantic Scoring Engine,
 * analyzing technical correctness, concept coverage, semantic alignment, and misconceptions.
 */
export function evaluateAnswerNLP(
  question: DatasetQuestion,
  answerText: string,
  codingResult?: import('./types').CodingExecutionResult
): NLPAnswerEvaluation {
  // Retrieve comprehensive evaluation benchmark with rubrics and misconceptions
  const benchmark = getQuestionEvaluationBenchmark(
    question.id,
    question.idealAnswerPoints?.join('. ') || question.question,
    question.department,
    question.topic,
    question.difficulty,
    question.keywords,
    question.idealAnswerPoints
  );

  // Score candidate response using NLP rubric
  const evalResult = scoreAnswer(answerText, benchmark, codingResult);

  // Extract covered and missing concept names
  const foundConcepts = evalResult.conceptsCorrect
    .filter((c) => c.isCovered)
    .map((c) => c.name);

  const missingConcepts = evalResult.conceptsMissing.map((m) => m.name);

  return {
    technicalAccuracyScore: evalResult.finalScore,
    communicationScore: evalResult.rubricBreakdown.reasoningAndClarity.score,
    relevanceScore: evalResult.rubricBreakdown.relevanceSemantic.score,
    overallRating: evalResult.bandLabel,
    strengths: evalResult.strengths,
    improvements: evalResult.improvements,
    sampleIdealAnswer: evalResult.sampleIdealAnswer,
    keywordCoverage: {
      found: foundConcepts,
      missing: missingConcepts,
    },
    difficultyAdjustment: evalResult.difficultyAdjustment,
    adjustedDifficulty: evalResult.adjustedDifficulty,
    topicsToPractice: evalResult.topicsToPractice,
    evaluationBand: evalResult.band,
    rubricBreakdown: evalResult.rubricBreakdown,
    conceptsCorrect: evalResult.conceptsCorrect,
    conceptsMissing: evalResult.conceptsMissing,
    misconceptionsDetected: evalResult.misconceptionsDetected,
    scoringAuditExplanation: evalResult.scoringAuditExplanation,
    evaluationMethodologyNotice: evalResult.evaluationMethodologyNotice,
  };
}

/**
 * Generates an adaptive follow-up question based on candidate answer and question templates
 */
export function generateFollowUpQuestion(
  question: DatasetQuestion,
  answerText: string
): FollowUpQuestion | null {
  if (!question.followUpTemplates || question.followUpTemplates.length === 0) {
    return null;
  }

  const normAnswer = normalizeText(answerText);
  const pre = preprocessDocument(answerText);
  const words = pre.rawTokens;

  // Select appropriate template
  const templateIdx = words.length % question.followUpTemplates.length;
  const template = question.followUpTemplates[templateIdx];

  const matchedKeywords = question.keywords.filter((k) => normAnswer.includes(k.toLowerCase()));

  return {
    id: `followup_${question.id}_${Date.now()}`,
    parentQuestionId: question.id,
    question: template,
    topic: `Adaptive Follow-up: ${question.subtopic}`,
    templateUsed: template,
    triggerKeywords: matchedKeywords,
    explanation: `Follow-up deep dive targeting your previous answer on ${question.skill} (${question.topic}).`,
  };
}
