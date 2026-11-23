import { 
  ParsedResume, 
  InterviewAnswer, 
  InterviewSession,
  SkillPerformanceItem,
  WeakSkillRemediation,
  TechnicalScorecardSummary
} from '../types';
import { 
  DatasetQuestion, 
  ExtractedResumeNLP, 
  MatchedQuestion, 
  FollowUpQuestion, 
  NLPAnswerEvaluation, 
  TechnicalInterviewEngineConfig, 
  TechnicalInterviewSessionState,
  SupportedLanguage,
  CodingExecutionResult,
  TopicMasteryRecord,
  SkippedQuestionLearningData,
  QuestionHistoryEntry,
  TechnicalPracticeSetSummary,
  SkillWiseProgressDashboardData,
  TechnicalSkillCategoryPerformance
} from './types';
import { extractResumeNLP } from './resumeSkillExtractor';
import { matchTechnicalQuestions, evaluateAnswerNLP, generateFollowUpQuestion } from './nlpQuestionMatcher';
import { generateSetOfFourQuestions } from './dynamicQuestionGenerator';
import { normalizeForDuplicateCheck } from './duplicatePrevention';

/**
 * Modular Interface for Technical Interview Providers.
 * Allows effortless future swapping with a Python FastAPI backend or fine-tuned LLM API
 * without rewriting the UI or frontend components.
 */
export interface ITechnicalInterviewEngine {
  initSession(config: TechnicalInterviewEngineConfig): TechnicalInterviewSessionState;
  submitAnswer(
    answerText: string, 
    timeSpentSeconds: number, 
    telemetry?: { eyeContact: number; confidence: number },
    codingResult?: CodingExecutionResult
  ): {
    evaluation: NLPAnswerEvaluation;
    followUp: FollowUpQuestion | null;
  };
  submitCodingSolution(
    code: string,
    language: SupportedLanguage,
    result: CodingExecutionResult,
    timeSpentSeconds: number
  ): {
    evaluation: NLPAnswerEvaluation;
    followUp: FollowUpQuestion | null;
  };
  skipQuestion(timeSpentSeconds: number): {
    evaluation: NLPAnswerEvaluation;
    learningExplanation: string;
    learningData: SkippedQuestionLearningData;
  };
  advanceNext(): { hasNext: boolean; nextQuestion: DatasetQuestion | null; isComplete: boolean; isSetCompleted?: boolean };
  startNextSet(): { questions: DatasetQuestion[]; setNumber: number; currentQuestion: DatasetQuestion | null };
  getSetSummary(setNumber?: number): TechnicalPracticeSetSummary | null;
  getSkillDashboard(): SkillWiseProgressDashboardData;
  clearPracticeHistory(): void;
  restartSession(): TechnicalInterviewSessionState;
  completeSession(): InterviewSession;
  getState(): TechnicalInterviewSessionState;
}

/**
 * Pure Frontend Deterministic NLP Technical Interview Engine
 * Prototype implementation using local TF-IDF, cosine similarity, and keyword matching.
 */
export class FrontendNLPTechnicalInterviewEngine implements ITechnicalInterviewEngine {
  private config: TechnicalInterviewEngineConfig;
  private state: TechnicalInterviewSessionState;

  constructor(config: TechnicalInterviewEngineConfig) {
    this.config = config;
    this.state = this.initSession(config);
  }

  /**
   * Initializes or resets the interview session
   */
  public initSession(config: TechnicalInterviewEngineConfig): TechnicalInterviewSessionState {
    this.config = config;

    // 1. Extract NLP features and map canonical skills from candidate resume
    const extractedNLP = extractResumeNLP(
      config.resume, 
      config.profileDepartment, 
      config.targetDepartment
    );

    // 2. Check for existing saved practice session in localStorage (Persistence Requirement 11)
    const storageKey = this.getPersistenceKeyForCandidate(extractedNLP, config.resume);
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        const saved = window.localStorage.getItem(storageKey);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed && Array.isArray(parsed.questions) && parsed.questions.length > 0 && Array.isArray(parsed.answers)) {
            const restoredState: TechnicalInterviewSessionState = {
              questions: parsed.questions,
              currentIndex: parsed.currentIndex || 0,
              currentQuestion: parsed.questions[parsed.currentIndex || 0] || null,
              answers: parsed.answers || [],
              activeFollowUp: null,
              isFollowUpActive: false,
              extractedNLP,
              difficulty: parsed.difficulty || config.difficulty,
              isComplete: parsed.isComplete || false,
              matchAudit: parsed.matchAudit || [],
              timeSpentSeconds: parsed.timeSpentSeconds || 0,
              topicMastery: parsed.topicMastery || {},
              codingSubmissions: parsed.codingSubmissions || {},
              currentSetNumber: parsed.currentSetNumber || Math.floor((parsed.currentIndex || 0) / 4) + 1,
              completedSets: parsed.completedSets || [],
              questionHistory: parsed.questionHistory || [],
              isSetCompleted: parsed.isSetCompleted || false,
              currentSetSummary: parsed.currentSetSummary || null,
            };
            restoredState.skillDashboard = this.computeSkillDashboard(restoredState.answers, restoredState.completedSets, restoredState.questions);
            this.state = restoredState;
            return this.state;
          }
        }
      } catch (err) {
        console.warn('Could not restore technical practice session:', err);
      }
    }

    // 3. Generate Set 1 (Questions 1 to 4) using department and resume analysis
    const initialSet = generateSetOfFourQuestions(extractedNLP, [], 1, config.difficulty);
    const { audit } = matchTechnicalQuestions(
      extractedNLP,
      config.difficulty,
      4
    );

    this.state = {
      questions: initialSet,
      currentIndex: 0,
      currentQuestion: initialSet.length > 0 ? initialSet[0] : null,
      answers: [],
      activeFollowUp: null,
      isFollowUpActive: false,
      extractedNLP,
      difficulty: config.difficulty,
      isComplete: false,
      matchAudit: audit,
      timeSpentSeconds: 0,
      topicMastery: {},
      codingSubmissions: {},
      currentSetNumber: 1,
      completedSets: [],
      questionHistory: [],
      isSetCompleted: false,
      currentSetSummary: null,
      skillDashboard: this.computeSkillDashboard([], [], initialSet),
    };

    this.persistState();
    return this.state;
  }

  /**
   * Submits candidate's answer to the active question with dynamic difficulty adjustment
   */
  public submitAnswer(
    answerText: string,
    timeSpentSeconds: number,
    telemetry: { eyeContact: number; confidence: number } = { eyeContact: 92, confidence: 90 },
    codingResult?: CodingExecutionResult
  ): { evaluation: NLPAnswerEvaluation; followUp: FollowUpQuestion | null } {
    const activeQ = this.state.isFollowUpActive && this.state.activeFollowUp
      ? {
          id: this.state.activeFollowUp.id,
          department: this.state.extractedNLP.effectiveDepartment,
          topic: this.state.activeFollowUp.topic,
          subtopic: 'Follow-up drill-down',
          skill: this.state.currentQuestion?.skill || 'Technical Skills',
          difficulty: this.state.difficulty,
          question: this.state.activeFollowUp.question,
          questionType: 'problem-solving' as const,
          keywords: this.state.activeFollowUp.triggerKeywords,
          followUpTemplates: [],
          idealAnswerPoints: [
            'Clear analysis of constraints, trade-offs, and boundary conditions',
            'Practical real-world implementation methodology',
          ],
          explanation: this.state.activeFollowUp.explanation,
        }
      : this.state.currentQuestion;

    if (!activeQ) {
      throw new Error('No active question in current interview state.');
    }

    // Evaluate answer with multi-factor NLP algorithm and benchmarks
    const evaluation = evaluateAnswerNLP(activeQ, answerText, codingResult);

    // Dynamic difficulty adjustment

    // Dynamic difficulty adjustment
    if (evaluation.adjustedDifficulty && evaluation.adjustedDifficulty !== this.state.difficulty) {
      this.state.difficulty = evaluation.adjustedDifficulty;
    }

    // Update Topic Mastery Tracking
    const topicKey = activeQ.topic || 'Core Engineering';
    const existingMastery = this.state.topicMastery[topicKey] || {
      topic: topicKey,
      department: activeQ.department,
      questionsAttempted: 0,
      averageScore: 0,
      needsPractice: false,
    };

    const newAttemptCount = existingMastery.questionsAttempted + 1;
    const newAvg = Math.round(
      (existingMastery.averageScore * existingMastery.questionsAttempted + evaluation.technicalAccuracyScore) / newAttemptCount
    );

    this.state.topicMastery[topicKey] = {
      topic: topicKey,
      department: activeQ.department,
      questionsAttempted: newAttemptCount,
      averageScore: newAvg,
      needsPractice: newAvg < 70,
    };

    // Form follow-up question if this was a primary question
    let followUp: FollowUpQuestion | null = null;
    if (!this.state.isFollowUpActive) {
      followUp = generateFollowUpQuestion(activeQ, answerText);
    }

    const mistakeExplanation = evaluation.misconceptionsDetected && evaluation.misconceptionsDetected.length > 0
      ? evaluation.misconceptionsDetected.map((m) => `${m.description}: ${m.whyIncorrect}`).join('. ')
      : (evaluation.technicalAccuracyScore < 75 && evaluation.improvements.length > 0 ? evaluation.improvements[0] : undefined);

    const studyRec = activeQ.whatToStudyNext || (evaluation.topicsToPractice && evaluation.topicsToPractice.length > 0 ? evaluation.topicsToPractice.join(', ') : evaluation.improvements[0]);
    const practiceQ = activeQ.recommendedPracticeQuestion || `Practice intermediate problem-solving on ${activeQ.skill} (${activeQ.topic}).`;

    const answerRecord: InterviewAnswer = {
      questionId: activeQ.id,
      questionText: activeQ.question,
      userAnswer: answerText,
      isSkipped: false,
      questionSkill: activeQ.skill,
      questionTopic: activeQ.topic,
      questionDifficulty: activeQ.difficulty,
      questionSource: (activeQ.questionSource as any) || 'resume-skill',
      learningExplanation: activeQ.learningExplanation || activeQ.explanation,
      aiFeedback: {
        technicalAccuracyScore: evaluation.technicalAccuracyScore,
        communicationScore: evaluation.communicationScore,
        relevanceScore: evaluation.relevanceScore,
        overallRating: evaluation.overallRating,
        strengths: evaluation.strengths,
        improvements: evaluation.improvements,
        sampleIdealAnswer: evaluation.sampleIdealAnswer,
        followUpQuestion: followUp?.question,
        evaluationMistakeExplanation: mistakeExplanation,
        studyRecommendation: studyRec,
        practiceQuestion: practiceQ,
      },
      timeTakenSeconds: timeSpentSeconds,
      eyeContactScore: telemetry.eyeContact,
      confidenceScore: telemetry.confidence,
    };

    this.state.answers = [...this.state.answers, answerRecord];
    this.state.activeFollowUp = followUp;

    // Record into question history (Strict duplicate prevention Requirement 5)
    const historyEntry: QuestionHistoryEntry = {
      questionId: activeQ.id,
      questionText: activeQ.question,
      normalizedText: normalizeForDuplicateCheck(activeQ.question),
      skill: activeQ.skill,
      topic: activeQ.topic,
      subtopic: activeQ.subtopic,
      department: activeQ.department,
      difficulty: activeQ.difficulty,
      questionType: activeQ.questionType,
      setNumber: this.state.currentSetNumber,
      completionStatus: 'answered',
      score: evaluation.technicalAccuracyScore,
      askedAtTimestamp: Date.now(),
    };
    this.state.questionHistory = [...this.state.questionHistory, historyEntry];
    this.persistState();

    return { evaluation, followUp };
  }

  /**
   * Skips active question, awards 0 marks, and records learning explanation
   */
  public skipQuestion(timeSpentSeconds: number): {
    evaluation: NLPAnswerEvaluation;
    learningExplanation: string;
    learningData: SkippedQuestionLearningData;
  } {
    const activeQ = this.state.isFollowUpActive && this.state.activeFollowUp
      ? {
          id: this.state.activeFollowUp.id,
          department: this.state.extractedNLP.effectiveDepartment,
          topic: this.state.activeFollowUp.topic,
          subtopic: 'Follow-up drill-down',
          skill: this.state.currentQuestion?.skill || 'Technical Skills',
          difficulty: this.state.difficulty,
          question: this.state.activeFollowUp.question,
          questionType: 'problem-solving' as const,
          keywords: this.state.activeFollowUp.triggerKeywords,
          followUpTemplates: [],
          idealAnswerPoints: [],
          explanation: this.state.activeFollowUp.explanation,
          learningExplanation: this.state.activeFollowUp.explanation,
          questionSource: 'resume-skill' as const,
          whatToStudyNext: `Review foundational concepts for ${this.state.currentQuestion?.skill || 'this topic'}`,
          recommendedPracticeQuestion: `Practice basic implementation of ${this.state.currentQuestion?.skill || 'this topic'}`,
        }
      : this.state.currentQuestion;

    if (!activeQ) {
      throw new Error('No active question in current interview state.');
    }

    const learningExplanation = activeQ.learningExplanation || activeQ.explanation || 'See technical documentation and fundamentals.';
    const whatToStudyNext = activeQ.whatToStudyNext || `Review core principles and syntax of ${activeQ.skill}.`;
    const recommendedPracticeQuestion = activeQ.recommendedPracticeQuestion || `Build a minimal prototype or solve a standard problem testing ${activeQ.skill}.`;

    const correctAnswer = activeQ.referenceAnswer
      || (activeQ.idealAnswerPoints && activeQ.idealAnswerPoints.length > 0
          ? activeQ.idealAnswerPoints.map((pt, i) => `${i + 1}. ${pt}`).join('\n\n')
          : activeQ.learningExplanation || activeQ.explanation || 'No reference answer recorded.');

    const explanation = activeQ.learningExplanation || activeQ.explanation || 'Step-by-step conceptual walkthrough.';

    const importantConcepts = (activeQ.idealAnswerPoints && activeQ.idealAnswerPoints.length > 0)
      ? activeQ.idealAnswerPoints
      : (activeQ.keywords && activeQ.keywords.length > 0 ? activeQ.keywords : [activeQ.skill, activeQ.topic]);

    const exampleSolution = activeQ.exampleSolution
      || (activeQ.codingProblem?.starterCodes
          ? activeQ.codingProblem.starterCodes[activeQ.codingProblem.defaultLanguage || 'python']
          : activeQ.practicalTask || (activeQ.recommendedPracticeQuestion ? `Example Scenario: ${activeQ.recommendedPracticeQuestion}` : undefined));

    const learningData: SkippedQuestionLearningData = {
      questionText: activeQ.question,
      correctAnswer,
      explanation,
      importantConcepts,
      exampleSolution,
    };

    const evaluation: NLPAnswerEvaluation = {
      technicalAccuracyScore: 0,
      communicationScore: 0,
      relevanceScore: 0,
      overallRating: 'Needs Practice',
      strengths: [],
      improvements: [
        'Question skipped by candidate — 0 marks awarded.',
        `Review the learning reference explanation below to understand ${activeQ.skill} thoroughly.`
      ],
      sampleIdealAnswer: correctAnswer,
      keywordCoverage: {
        found: [],
        missing: activeQ.keywords || [],
      },
      difficultyAdjustment: 'maintained',
      adjustedDifficulty: this.state.difficulty,
      topicsToPractice: [activeQ.topic || activeQ.skill],
      evaluationBand: '0–20: Incorrect or Irrelevant',
      rubricBreakdown: {
        technicalCorrectness: { score: 0, weight: 0.40, weightedPoints: 0, maxPoints: 40, explanation: 'Question skipped — 0 marks' },
        essentialCoverage: { score: 0, weight: 0.30, weightedPoints: 0, maxPoints: 30, explanation: 'Question skipped — 0 marks' },
        relevanceSemantic: { score: 0, weight: 0.20, weightedPoints: 0, maxPoints: 20, explanation: 'Question skipped — 0 marks' },
        reasoningAndClarity: { score: 0, weight: 0.10, weightedPoints: 0, maxPoints: 10, explanation: 'Question skipped — 0 marks' },
      },
      conceptsCorrect: [],
      conceptsMissing: (activeQ.idealAnswerPoints || []).map((p, pIdx) => ({
        id: `missing_${activeQ.id}_${pIdx}`,
        name: p,
        description: p,
        keyPhrases: [p],
        synonyms: [],
        weight: 1,
      })),
      misconceptionsDetected: [],
      scoringAuditExplanation: ['Candidate skipped this question. Zero marks awarded; reference learning explanation provided.'],
      evaluationMethodologyNotice: 'Deterministic evaluation: 0 marks for unattempted question.',
    };

    // Update Topic Mastery Tracking with 0 marks
    const topicKey = activeQ.topic || 'Core Engineering';
    const existingMastery = this.state.topicMastery[topicKey] || {
      topic: topicKey,
      department: activeQ.department,
      questionsAttempted: 0,
      averageScore: 0,
      needsPractice: true,
    };

    const newAttemptCount = existingMastery.questionsAttempted + 1;
    const newAvg = Math.round(
      (existingMastery.averageScore * existingMastery.questionsAttempted + 0) / newAttemptCount
    );

    this.state.topicMastery[topicKey] = {
      topic: topicKey,
      department: activeQ.department,
      questionsAttempted: newAttemptCount,
      averageScore: newAvg,
      needsPractice: true,
    };

    const answerRecord: InterviewAnswer = {
      questionId: activeQ.id,
      questionText: activeQ.question,
      userAnswer: '[SKIPPED BY CANDIDATE - 0 MARKS]',
      isSkipped: true,
      questionSkill: activeQ.skill,
      questionTopic: activeQ.topic,
      questionDifficulty: activeQ.difficulty,
      questionSource: (activeQ.questionSource as any) || 'resume-skill',
      learningExplanation,
      referenceAnswer: correctAnswer,
      exampleSolution,
      importantConcepts,
      aiFeedback: {
        technicalAccuracyScore: 0,
        communicationScore: 0,
        relevanceScore: 0,
        overallRating: 'Needs Practice',
        strengths: [],
        improvements: [
          'Question skipped by candidate (0/100).',
          `Study the learning explanation to master ${activeQ.skill}.`
        ],
        sampleIdealAnswer: correctAnswer,
        evaluationMistakeExplanation: 'Question was skipped without attempting. Fundamental concepts were not demonstrated.',
        studyRecommendation: whatToStudyNext,
        practiceQuestion: recommendedPracticeQuestion,
      },
      timeTakenSeconds: timeSpentSeconds,
      eyeContactScore: 0,
      confidenceScore: 0,
    };

    this.state.answers = [...this.state.answers, answerRecord];
    this.state.activeFollowUp = null;

    // Record into question history (Strict duplicate prevention Requirement 5)
    const historyEntry: QuestionHistoryEntry = {
      questionId: activeQ.id,
      questionText: activeQ.question,
      normalizedText: normalizeForDuplicateCheck(activeQ.question),
      skill: activeQ.skill,
      topic: activeQ.topic,
      subtopic: activeQ.subtopic,
      department: activeQ.department,
      difficulty: activeQ.difficulty,
      questionType: activeQ.questionType,
      setNumber: this.state.currentSetNumber,
      completionStatus: 'skipped',
      score: 0,
      askedAtTimestamp: Date.now(),
    };
    this.state.questionHistory = [...this.state.questionHistory, historyEntry];
    this.persistState();

    return { evaluation, learningExplanation, learningData };
  }

  /**
   * Submits coding solution directly from the CodingWorkspace
   */
  public submitCodingSolution(
    code: string,
    language: SupportedLanguage,
    result: CodingExecutionResult,
    timeSpentSeconds: number
  ): { evaluation: NLPAnswerEvaluation; followUp: FollowUpQuestion | null } {
    if (this.state.currentQuestion) {
      this.state.codingSubmissions[this.state.currentQuestion.id] = result;
    }

    const explanationText = `Code Solution (${language.toUpperCase()}):\n\`\`\`${language}\n${code}\n\`\`\`\n\nExecution Result: Passed ${result.passedCount}/${result.totalCount} test cases.\nAnalyzed Complexity: Time ${result.timeComplexityAnalysis || 'O(n)'}, Space ${result.spaceComplexityAnalysis || 'O(n)'}.`;

    return this.submitAnswer(explanationText, timeSpentSeconds, undefined, result);
  }

  /**
   * Activates the generated follow-up question in the session
   */
  public activateFollowUp(): boolean {
    if (this.state.activeFollowUp) {
      this.state.isFollowUpActive = true;
      return true;
    }
    return false;
  }

  /**
   * Advances to next question in active set or completes set of 4
   */
  public advanceNext(): { hasNext: boolean; nextQuestion: DatasetQuestion | null; isComplete: boolean; isSetCompleted?: boolean } {
    this.state.isFollowUpActive = false;
    this.state.activeFollowUp = null;

    const nextIdx = this.state.currentIndex + 1;
    const setEndIndex = this.state.currentSetNumber * 4;

    // Check if current set of 4 questions has completed
    if (nextIdx >= setEndIndex || nextIdx >= this.state.questions.length) {
      this.state.isSetCompleted = true;
      const summary = this.computeSetSummary(this.state.currentSetNumber);
      this.state.currentSetSummary = summary;

      const existingIdx = this.state.completedSets.findIndex((s) => s.setNumber === summary.setNumber);
      if (existingIdx >= 0) {
        this.state.completedSets[existingIdx] = summary;
      } else {
        this.state.completedSets.push(summary);
      }

      this.state.skillDashboard = this.computeSkillDashboard(this.state.answers, this.state.completedSets, this.state.questions);
      this.persistState();
      return { hasNext: false, nextQuestion: null, isComplete: false, isSetCompleted: true };
    }

    this.state.currentIndex = nextIdx;
    this.state.currentQuestion = this.state.questions[nextIdx];
    this.state.isSetCompleted = false;
    this.persistState();
    return { hasNext: true, nextQuestion: this.state.currentQuestion, isComplete: false, isSetCompleted: false };
  }

  /**
   * Starts the next set of four unique questions (Set 2: Q5-8, Set 3: Q9-12, etc.)
   */
  public startNextSet(): { questions: DatasetQuestion[]; setNumber: number; currentQuestion: DatasetQuestion | null } {
    // 1. Adaptive Difficulty adjustment based on last set's performance (Requirement 7)
    const lastSummary = this.state.currentSetSummary || this.state.completedSets[this.state.completedSets.length - 1];
    if (lastSummary) {
      if (lastSummary.setScore >= 80) {
        if (this.state.difficulty === 'Beginner') this.state.difficulty = 'Intermediate';
        else if (this.state.difficulty === 'Intermediate') this.state.difficulty = 'Advanced';
      } else if (lastSummary.setScore < 60) {
        if (this.state.difficulty === 'Advanced') this.state.difficulty = 'Intermediate';
        else if (this.state.difficulty === 'Intermediate') this.state.difficulty = 'Beginner';
      }
    }

    // 2. Increment set number
    const nextSetNumber = this.state.currentSetNumber + 1;
    this.state.currentSetNumber = nextSetNumber;

    // 3. Generate exactly 4 unique questions, strictly checking against history
    const nextFourQuestions = generateSetOfFourQuestions(
      this.state.extractedNLP,
      this.state.questionHistory,
      nextSetNumber,
      this.state.difficulty
    );

    // 4. Append to questions array
    this.state.questions = [...this.state.questions, ...nextFourQuestions];

    // 5. Update index
    const newIndex = (nextSetNumber - 1) * 4;
    this.state.currentIndex = newIndex;
    this.state.currentQuestion = this.state.questions[newIndex];
    this.state.isSetCompleted = false;
    this.state.currentSetSummary = null;

    this.persistState();
    return {
      questions: this.state.questions,
      setNumber: nextSetNumber,
      currentQuestion: this.state.currentQuestion,
    };
  }

  /**
   * Calculates comprehensive set performance metrics for practice review
   */
  public computeSetSummary(setNumber: number): TechnicalPracticeSetSummary {
    const startIndex = (setNumber - 1) * 4;
    const endIndex = startIndex + 4;
    const setAnswers = this.state.answers.slice(startIndex, endIndex);

    const questionsAttempted = setAnswers.length;
    const skippedQuestions = setAnswers.filter((a) => a.isSkipped).length;
    const correctAnswers = setAnswers.filter(
      (a) => !a.isSkipped && (a.aiFeedback?.technicalAccuracyScore ?? 0) >= 70
    ).length;
    const partiallyCorrectAnswers = setAnswers.filter(
      (a) => !a.isSkipped && (a.aiFeedback?.technicalAccuracyScore ?? 0) >= 30 && (a.aiFeedback?.technicalAccuracyScore ?? 0) < 70
    ).length;
    const incorrectAnswers = setAnswers.filter(
      (a) => !a.isSkipped && (a.aiFeedback?.technicalAccuracyScore ?? 0) < 30
    ).length;

    const totalScore = setAnswers.reduce((sum, a) => sum + (a.aiFeedback?.technicalAccuracyScore || 0), 0);
    const setScore = Math.round(totalScore / (questionsAttempted || 1));

    const skillsTested = Array.from(new Set(setAnswers.map((a) => a.questionSkill).filter(Boolean)));
    const topicsTested = Array.from(new Set(setAnswers.map((a) => a.questionTopic).filter(Boolean)));

    const strengths: string[] = [];
    const improvements: string[] = [];

    setAnswers.forEach((a) => {
      if ((a.aiFeedback?.technicalAccuracyScore || 0) >= 70) {
        if (a.aiFeedback?.strengths?.[0]) strengths.push(a.aiFeedback.strengths[0]);
      } else {
        if (a.aiFeedback?.improvements?.[0]) improvements.push(a.aiFeedback.improvements[0]);
      }
    });

    return {
      setNumber,
      questionIndices: [startIndex, startIndex + 1, startIndex + 2, startIndex + 3],
      questionsAttempted,
      correctAnswers,
      partiallyCorrectAnswers,
      incorrectAnswers,
      skippedQuestions,
      setScore,
      skillsTested,
      topicsTested,
      strengths: Array.from(new Set(strengths)).slice(0, 3),
      improvements: Array.from(new Set(improvements)).slice(0, 3),
    };
  }

  /**
   * Computes Skill-Wise Progress Dashboard across all practiced sets (Requirement 10)
   */
  public computeSkillDashboard(
    answers: InterviewAnswer[],
    completedSets: TechnicalPracticeSetSummary[],
    questionsPool: DatasetQuestion[] = []
  ): SkillWiseProgressDashboardData {
    const totalSetsCompleted = completedSets.length;
    const totalQuestionsAttempted = answers.length;
    const totalScore = answers.reduce((sum, a) => sum + (a.aiFeedback?.technicalAccuracyScore || 0), 0);
    const overallTechnicalScore = Math.round(totalScore / (totalQuestionsAttempted || 1));

    const allQuestions = questionsPool.length > 0 ? questionsPool : (this.state?.questions || []);

    const codingAnswers = answers.filter((a) => {
      const q = allQuestions.find((x) => x.id === a.questionId);
      return q?.questionType === 'coding' || a.userAnswer.includes('Code Solution') || a.questionSkill.toLowerCase().includes('algorithm') || a.questionSkill.toLowerCase().includes('data structure');
    });

    const sqlAnswers = answers.filter((a) => {
      const q = allQuestions.find((x) => x.id === a.questionId);
      return q?.questionType === 'sql' || a.questionTopic.toLowerCase().includes('database') || a.questionSkill.toLowerCase().includes('sql') || a.questionSkill.toLowerCase().includes('mysql') || a.questionSkill.toLowerCase().includes('postgres');
    });

    const dsaAnswers = answers.filter((a) => {
      return a.questionTopic.toLowerCase().includes('core computer science') || a.questionSkill.toLowerCase().includes('data structure') || a.questionSkill.toLowerCase().includes('algorithm');
    });

    const aimlAnswers = answers.filter((a) => {
      return a.questionTopic.toLowerCase().includes('machine learning') || a.questionSkill.toLowerCase().includes('scikit') || a.questionSkill.toLowerCase().includes('learning') || a.questionSkill.toLowerCase().includes('tensorflow') || a.questionSkill.toLowerCase().includes('pytorch');
    });

    const deptCoreAnswers = answers.filter((a) => {
      return a.questionSource === 'curriculum-foundational' || !a.questionSource;
    });

    const resumeSkillAnswers = answers.filter((a) => {
      return a.questionSource === 'resume-skill' || a.questionSource === 'project' || a.questionSource === 'internship' || a.questionSource === 'certification';
    });

    const buildCategoryPerf = (
      name: string,
      key: 'coding' | 'sql' | 'dsa' | 'aiml' | 'departmentCore' | 'resumeSkills',
      catAnswers: InterviewAnswer[]
    ): TechnicalSkillCategoryPerformance | undefined => {
      if (catAnswers.length === 0) return undefined;
      const sum = catAnswers.reduce((acc, curr) => acc + (curr.aiFeedback?.technicalAccuracyScore || 0), 0);
      const avg = Math.round(sum / catAnswers.length);
      const skills = Array.from(new Set(catAnswers.map((a) => a.questionSkill)));
      let status: 'Strong' | 'Needs Practice' | 'Developing' = 'Developing';
      if (avg >= 75) status = 'Strong';
      else if (avg < 60) status = 'Needs Practice';
      return {
        category: name,
        categoryKey: key,
        averageScore: avg,
        attemptedCount: catAnswers.length,
        status,
        skills,
      };
    };

    const strongTopics: string[] = [];
    const weakTopics: string[] = [];
    const topicScores = new Map<string, { total: number; count: number }>();

    answers.forEach((a) => {
      const topic = a.questionTopic || a.questionSkill || 'Engineering Topic';
      const curr = topicScores.get(topic) || { total: 0, count: 0 };
      curr.total += (a.aiFeedback?.technicalAccuracyScore || 0);
      curr.count += 1;
      topicScores.set(topic, curr);
    });

    topicScores.forEach((val, topic) => {
      const avg = Math.round(val.total / val.count);
      if (avg >= 75) strongTopics.push(topic);
      else weakTopics.push(topic);
    });

    const recommendedNextPracticeTopics = weakTopics.length > 0
      ? weakTopics.slice(0, 4)
      : ['System Architecture & Scalability', 'Production Debugging & Concurrency', 'Edge-Case Analysis', 'Comprehensive Engineering Integration'];

    return {
      totalSetsCompleted,
      totalQuestionsAttempted,
      overallTechnicalScore,
      codingPerformance: buildCategoryPerf('Coding & Practical Implementation', 'coding', codingAnswers),
      sqlPerformance: buildCategoryPerf('SQL & Database Systems', 'sql', sqlAnswers),
      dsaPerformance: buildCategoryPerf('Data Structures & Algorithms', 'dsa', dsaAnswers),
      aimlPerformance: buildCategoryPerf('Artificial Intelligence & Machine Learning', 'aiml', aimlAnswers),
      departmentCorePerformance: buildCategoryPerf('Department Core Engineering', 'departmentCore', deptCoreAnswers),
      resumeSkillPerformance: buildCategoryPerf('Resume Technologies & Projects', 'resumeSkills', resumeSkillAnswers),
      strongTopics,
      weakTopics,
      recommendedNextPracticeTopics,
    };
  }

  public getSetSummary(setNumber?: number): TechnicalPracticeSetSummary | null {
    const targetSet = setNumber || this.state.currentSetNumber;
    return this.state.completedSets.find((s) => s.setNumber === targetSet) || this.state.currentSetSummary || null;
  }

  public getSkillDashboard(): SkillWiseProgressDashboardData {
    return this.state.skillDashboard || this.computeSkillDashboard(this.state.answers, this.state.completedSets, this.state.questions);
  }

  private getPersistenceKeyForCandidate(extractedNLP: ExtractedResumeNLP, resume: ParsedResume | null): string {
    const candName = resume?.fullName || 'student';
    const dept = extractedNLP.effectiveDepartment || 'engineering';
    return `careercurve_practice_${encodeURIComponent(candName)}_${encodeURIComponent(dept)}`;
  }

  private persistState(): void {
    if (typeof window !== 'undefined' && window.localStorage && this.state?.extractedNLP) {
      try {
        const key = this.getPersistenceKeyForCandidate(this.state.extractedNLP, this.config.resume);
        const payload = {
          questions: this.state.questions,
          currentIndex: this.state.currentIndex,
          answers: this.state.answers,
          difficulty: this.state.difficulty,
          currentSetNumber: this.state.currentSetNumber,
          completedSets: this.state.completedSets,
          questionHistory: this.state.questionHistory,
          isSetCompleted: this.state.isSetCompleted,
          currentSetSummary: this.state.currentSetSummary,
          timeSpentSeconds: this.state.timeSpentSeconds,
          topicMastery: this.state.topicMastery,
          codingSubmissions: this.state.codingSubmissions,
        };
        window.localStorage.setItem(key, JSON.stringify(payload));
      } catch (err) {
        console.warn('Failed to persist technical practice state:', err);
      }
    }
  }

  public clearPracticeHistory(): void {
    if (typeof window !== 'undefined' && window.localStorage && this.state?.extractedNLP) {
      try {
        const key = this.getPersistenceKeyForCandidate(this.state.extractedNLP, this.config.resume);
        window.localStorage.removeItem(key);
      } catch (err) {
        console.warn('Failed to clear practice state:', err);
      }
    }
  }

  /**
   * Restarts the session cleanly without clearing original resume
   */
  public restartSession(): TechnicalInterviewSessionState {
    this.clearPracticeHistory();
    return this.initSession(this.config);
  }

  /**
   * Compiles the completed session into standard InterviewSession format with full honest scorecard
   */
  public completeSession(): InterviewSession {
    const answers = this.state.answers;
    const totalQuestions = answers.length;
    const skippedQuestions = answers.filter((a) => a.isSkipped).length;
    const answeredQuestions = answers.filter((a) => !a.isSkipped).length;
    const correctAnswers = answers.filter(
      (a) => !a.isSkipped && (a.aiFeedback?.technicalAccuracyScore ?? 0) >= 80
    ).length;
    const partiallyCorrectAnswers = answers.filter(
      (a) => !a.isSkipped && (a.aiFeedback?.technicalAccuracyScore ?? 0) >= 40 && (a.aiFeedback?.technicalAccuracyScore ?? 0) < 80
    ).length;
    const incorrectAnswers = answers.filter(
      (a) => !a.isSkipped && (a.aiFeedback?.technicalAccuracyScore ?? 0) < 40
    ).length;

    // Honest scoring: skipped questions contribute 0 marks, lowering the total average
    const totalTechScoreSum = answers.reduce(
      (acc, curr) => acc + (curr.aiFeedback?.technicalAccuracyScore || 0),
      0
    );
    const overallTechnicalScore = Math.round(totalTechScoreSum / (totalQuestions || 1));

    // Communication score across answered questions (defaulting to 0 if skipped)
    const totalCommScoreSum = answers.reduce(
      (acc, curr) => acc + (curr.isSkipped ? 0 : curr.aiFeedback?.communicationScore || 70),
      0
    );
    const avgComm = Math.round(totalCommScoreSum / (totalQuestions || 1));

    // Difficulty breakdown
    const diffMap: Record<string, { attempted: number; totalScore: number }> = {
      Beginner: { attempted: 0, totalScore: 0 },
      Intermediate: { attempted: 0, totalScore: 0 },
      Advanced: { attempted: 0, totalScore: 0 },
    };

    answers.forEach((ans) => {
      const diff = ans.questionDifficulty || this.state.difficulty || 'Intermediate';
      const key = diff in diffMap ? diff : 'Intermediate';
      diffMap[key].attempted += 1;
      diffMap[key].totalScore += (ans.aiFeedback?.technicalAccuracyScore || 0);
    });

    const difficultyWise = {
      beginner: {
        attempted: diffMap.Beginner.attempted,
        avgScore: diffMap.Beginner.attempted > 0 ? Math.round(diffMap.Beginner.totalScore / diffMap.Beginner.attempted) : 0,
      },
      intermediate: {
        attempted: diffMap.Intermediate.attempted,
        avgScore: diffMap.Intermediate.attempted > 0 ? Math.round(diffMap.Intermediate.totalScore / diffMap.Intermediate.attempted) : 0,
      },
      advanced: {
        attempted: diffMap.Advanced.attempted,
        avgScore: diffMap.Advanced.attempted > 0 ? Math.round(diffMap.Advanced.totalScore / diffMap.Advanced.attempted) : 0,
      },
    };

    // Skill Performance Analysis
    const skillGroups = new Map<string, InterviewAnswer[]>();
    answers.forEach((ans) => {
      const skillName = ans.questionSkill || ans.questionTopic || 'Core Technical';
      if (!skillGroups.has(skillName)) {
        skillGroups.set(skillName, []);
      }
      skillGroups.get(skillName)!.push(ans);
    });

    const skillPerformance: SkillPerformanceItem[] = [];
    const weakSkillsRemediation: WeakSkillRemediation[] = [];
    const strengths: string[] = [];
    const weaknesses: string[] = [];

    skillGroups.forEach((groupAns, skillName) => {
      const groupTotal = groupAns.reduce(
        (sum, a) => sum + (a.aiFeedback?.technicalAccuracyScore || 0),
        0
      );
      const score = Math.round(groupTotal / groupAns.length);
      const source = (groupAns[0].questionSource as any) || 'resume-skill';

      let performance: 'Strong' | 'Good' | 'Needs Improvement' | 'Weak' = 'Weak';
      if (score >= 80) performance = 'Strong';
      else if (score >= 60) performance = 'Good';
      else if (score >= 40) performance = 'Needs Improvement';
      else performance = 'Weak';

      const weakMistake = groupAns.find((a) => a.aiFeedback?.evaluationMistakeExplanation)?.aiFeedback?.evaluationMistakeExplanation
        || (groupAns.some((a) => a.isSkipped) ? 'Question was skipped without attempting.' : undefined);

      const correctExplanation = groupAns.find((a) => a.learningExplanation)?.learningExplanation
        || groupAns[0].aiFeedback?.sampleIdealAnswer;

      const whatToStudyNext = groupAns.find((a) => a.aiFeedback?.studyRecommendation)?.aiFeedback?.studyRecommendation
        || `Review comprehensive fundamentals of ${skillName}.`;

      const recommendedPracticeQuestion = groupAns.find((a) => a.aiFeedback?.practiceQuestion)?.aiFeedback?.practiceQuestion
        || `Solve an end-to-end practical exercise covering ${skillName}.`;

      skillPerformance.push({
        skill: skillName,
        source,
        performance,
        score,
        questionsAttempted: groupAns.length,
        weakMistake,
        correctExplanation,
        whatToStudyNext,
        recommendedPracticeQuestion,
      });

      if (performance === 'Strong' || performance === 'Good') {
        strengths.push(`${skillName}: ${performance} (${score}%) — demonstrated good technical grasp.`);
      } else {
        const reason = groupAns.some((a) => a.isSkipped)
          ? 'skipped during interview'
          : `scored ${score}% with gaps in technical depth`;
        weaknesses.push(`${skillName}: ${performance} (${score}%) — ${reason}.`);

        weakSkillsRemediation.push({
          skill: skillName,
          whatWasAnsweredIncorrectly: weakMistake || 'Concept incomplete or key technical points missing.',
          correctExplanation: correctExplanation || 'Refer to the comprehensive technical documentation.',
          whatToStudyNext,
          recommendedPracticeQuestion,
        });
      }
    });

    const recommendedImprovements: string[] = [];
    if (skippedQuestions > 0) {
      recommendedImprovements.push(`Attempt all questions: ${skippedQuestions} question(s) were skipped resulting in 0 marks.`);
    }
    if (weakSkillsRemediation.length > 0) {
      recommendedImprovements.push(`Prioritize study on identified weak areas: ${weakSkillsRemediation.map((r) => r.skill).join(', ')}.`);
    }
    if (difficultyWise.advanced.attempted > 0 && difficultyWise.advanced.avgScore < 70) {
      recommendedImprovements.push('Practice complex architectural and edge-case questions to improve Advanced tier scores.');
    }
    if (recommendedImprovements.length === 0) {
      recommendedImprovements.push('Maintain consistent coding practice and keep reviewing system design fundamentals.');
    }

    const technicalScorecardSummary: TechnicalScorecardSummary = {
      totalQuestions,
      answeredQuestions,
      correctAnswers,
      partiallyCorrectAnswers,
      incorrectAnswers,
      skippedQuestions,
      overallTechnicalScore,
      difficultyWise,
      skillPerformance,
      strengths: strengths.length > 0 ? strengths : ['Basic technical foundation established.'],
      weaknesses: weaknesses.length > 0 ? weaknesses : ['No critical technical weaknesses detected.'],
      recommendedImprovements,
      weakSkillsRemediation,
    };

    const sessionObj: InterviewSession = {
      id: `nlp_tech_session_${Date.now()}`,
      type: 'technical',
      date: new Date().toISOString(),
      difficulty: this.state.difficulty,
      answers,
      technicalScore: overallTechnicalScore,
      hrScore: avgComm,
      aptitudeScore: 88,
      overallScore: Math.round((overallTechnicalScore + avgComm) / 2),
      readinessPercentage: Math.round((overallTechnicalScore * 0.5 + avgComm * 0.3 + 88 * 0.2)),
      completed: true,
      technicalScorecardSummary,
    };

    return sessionObj;
  }

  /**
   * Returns current session snapshot
   */
  public getState(): TechnicalInterviewSessionState {
    return this.state;
  }
}
