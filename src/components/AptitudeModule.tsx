import React, { useState, useEffect, useRef } from 'react';
import { Question, AptitudeResult, AptitudeProgressState } from '../types';
import { SAMPLE_APTITUDE_QUESTIONS } from '../data/sampleData';
import { 
  getUserAptitudeProgress, 
  saveUserAptitudeProgress, 
  clearUserAptitudeProgress 
} from '../services/authStorageService';
import { 
  BrainCircuit, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Award, 
  ArrowRight, 
  RotateCcw, 
  LayoutDashboard,
  HelpCircle,
  History,
  TrendingUp,
  BarChart2,
  BookOpen,
  Lightbulb,
  Check,
  AlertTriangle,
  Play,
  Sparkles,
  ChevronRight,
  Target,
  Zap,
  ArrowUpRight,
  ArrowDownRight,
  Eye
} from 'lucide-react';

interface AptitudeModuleProps {
  userId?: string;
  aptitudeHistory?: AptitudeResult[];
  journeyConfig?: {
    difficulty?: 'Beginner' | 'Intermediate' | 'Advanced';
    durationMinutes?: number;
    mode?: 'Practice' | 'Assessment' | 'Practice Mode' | 'Assessment Mode';
    educationalCategory?: 'technical' | 'non_technical';
    discipline?: string;
  };
  onContinueNextRound?: () => void;
  nextRoundTitle?: string;
  onCompleteAptitude: (result: AptitudeResult) => void;
  onNavigate: (tab: string) => void;
}

export const AptitudeModule: React.FC<AptitudeModuleProps> = ({
  userId,
  aptitudeHistory = [],
  journeyConfig,
  onContinueNextRound,
  nextRoundTitle,
  onCompleteAptitude,
  onNavigate,
}) => {
  const getFilteredQuestions = (): Question[] => {
    let pool = SAMPLE_APTITUDE_QUESTIONS;
    if (journeyConfig?.educationalCategory === 'non_technical') {
      pool = pool.filter((q) => q.category !== 'Core Computer Fundamentals');
    }
    const diff = journeyConfig?.difficulty;
    if (!diff) return pool;
    const matching = pool.filter((q) => q.difficulty === diff);
    const others = pool.filter((q) => q.difficulty !== diff);
    return [...matching, ...others];
  };

  const [questions, setQuestions] = useState<Question[]>(getFilteredQuestions);

  useEffect(() => {
    setQuestions(getFilteredQuestions());
  }, [journeyConfig?.difficulty, journeyConfig?.educationalCategory]);
  
  // Navigation sub-tab inside Aptitude Module ('test' or 'history')
  const [activeSubTab, setActiveSubTab] = useState<'test' | 'history'>('test');

  // Test State
  const initialDurationSeconds = (journeyConfig?.durationMinutes || 10) * 60;
  const [currentIdx, setCurrentIdx] = useState<number>(0);
  const [userAnswers, setUserAnswers] = useState<Record<string, number>>({});
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [resultData, setResultData] = useState<AptitudeResult | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(initialDurationSeconds);
  const [activeTestName, setActiveTestName] = useState<string>(`Placement Aptitude Test #${aptitudeHistory.length + 1}`);

  // Selected history attempt for detailed inspection modal/view
  const [selectedHistoryItem, setSelectedHistoryItem] = useState<AptitudeResult | null>(null);

  // Restore active test progress scoped to userId on mount or when userId changes
  useEffect(() => {
    let loaded = false;
    if (userId) {
      try {
        const p: AptitudeProgressState | null = getUserAptitudeProgress(userId);
        if (p && !p.isSubmitted && p.timeLeft > 0) {
          setCurrentIdx(p.currentIdx || 0);
          setUserAnswers(p.userAnswers || {});
          setTimeLeft(p.timeLeft);
          setActiveTestName(p.activeTestName || `Placement Aptitude Test #${aptitudeHistory.length + 1}`);
          setIsSubmitted(false);
          setResultData(null);
          loaded = true;
        } else if (p && p.isSubmitted && p.resultData) {
          setIsSubmitted(true);
          setResultData(p.resultData);
          loaded = true;
        }
      } catch (e) {
        console.warn('Failed to parse user progress', e);
      }
    }

    if (!loaded && userId) {
      fetch(`/api/aptitude/progress?userId=${userId}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.progress) {
            const p: AptitudeProgressState = data.progress;
            if (!p.isSubmitted && p.timeLeft > 0) {
              setCurrentIdx(p.currentIdx || 0);
              setUserAnswers(p.userAnswers || {});
              setTimeLeft(p.timeLeft);
              setActiveTestName(p.activeTestName || `Placement Aptitude Test #${aptitudeHistory.length + 1}`);
              setIsSubmitted(false);
            } else if (p.isSubmitted && p.resultData) {
              setIsSubmitted(true);
              setResultData(p.resultData);
            }
          }
        })
        .catch(() => {});
    }
  }, [userId]);

  // Timer Effect
  useEffect(() => {
    if (isSubmitted || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleAutoSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isSubmitted, timeLeft, userAnswers]);

  // Sync state changes to user-isolated localStorage & server
  useEffect(() => {
    if (isSubmitted || !userId) return;

    const progressState: AptitudeProgressState = {
      currentIdx,
      userAnswers,
      timeLeft,
      isSubmitted: false,
      activeTestName,
      resultData: null,
      savedAt: new Date().toISOString()
    };

    saveUserAptitudeProgress(userId, progressState);

    // Debounce post to backend
    const handler = setTimeout(() => {
      fetch('/api/aptitude/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ progress: progressState, userId })
      }).catch(() => {});
    }, 1000);

    return () => clearTimeout(handler);
  }, [currentIdx, userAnswers, timeLeft, isSubmitted, activeTestName, userId]);

  const handleSelectOption = (qId: string, optionIdx: number) => {
    if (isSubmitted) return;
    setUserAnswers((prev) => ({ ...prev, [qId]: optionIdx }));
  };

  const calculateResultData = (): AptitudeResult => {
    let correctCount = 0;
    let wrongCount = 0;
    let unansweredCount = 0;
    const catMap: Record<string, { correct: number; total: number }> = {};

    questions.forEach((q) => {
      if (!catMap[q.category]) {
        catMap[q.category] = { correct: 0, total: 0 };
      }
      catMap[q.category].total += 1;

      const userAns = userAnswers[q.id];
      if (userAns === undefined) {
        unansweredCount += 1;
      } else if (userAns === q.correctAnswer) {
        correctCount += 1;
        catMap[q.category].correct += 1;
      } else {
        wrongCount += 1;
      }
    });

    const totalQ = questions.length;
    const scorePct = Math.round((correctCount / totalQ) * 100);
    const timeTakenMin = Math.max(1, Math.round((600 - timeLeft) / 60));

    // Calculate strong and weak topics
    const strongTopics: string[] = [];
    const weakTopics: string[] = [];

    Object.entries(catMap).forEach(([cat, stats]) => {
      const pct = stats.total > 0 ? (stats.correct / stats.total) * 100 : 0;
      if (pct >= 60) {
        strongTopics.push(cat);
      } else {
        weakTopics.push(cat);
      }
    });

    if (strongTopics.length === 0) strongTopics.push('Basic Logic & Reasoning');
    if (weakTopics.length === 0) weakTopics.push('High-Speed Timed Calculations');

    // Improvement compared to previous test
    let improvementDelta = 0;
    if (aptitudeHistory.length > 0) {
      const lastAttempt = aptitudeHistory[0];
      improvementDelta = scorePct - lastAttempt.scorePercentage;
    }

    const res: AptitudeResult = {
      id: `apt_res_${Date.now()}`,
      testName: activeTestName,
      date: new Date().toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
      totalQuestions: totalQ,
      correctCount,
      wrongCount,
      unansweredCount,
      scorePercentage: scorePct,
      categoryBreakdown: catMap,
      timeTakenMinutes: timeTakenMin,
      userAnswers: { ...userAnswers },
      questions: [...questions],
      improvementDelta,
      feedback: {
        accuracyPercentage: Math.round((correctCount / Math.max(1, correctCount + wrongCount)) * 100),
        strongTopics,
        weakTopics,
        suggestedPracticeAreas: weakTopics.map((t) => `Practice ${t} problem sets`),
        difficultyAnalysis: `Overall accuracy of ${scorePct}% across ${totalQ} questions in ${timeTakenMin} minutes.`,
        improvementSuggestions: [
          'Master speed shortcuts for quantitative time and train distance formulas.',
          'Double check verbal synonym & grammatical subject-verb agreement rules.',
          'Review binary search tree O(log n) vs O(n) worst case time complexity distinctions.'
        ]
      }
    };

    return res;
  };

  const handleAutoSubmit = () => {
    if (isSubmitted) return;
    const res = calculateResultData();
    setResultData(res);
    setIsSubmitted(true);
    onCompleteAptitude(res);

    // Clear active progress
    if (userId) {
      clearUserAptitudeProgress(userId);
    }
    fetch(`/api/aptitude/progress?userId=${userId || ''}`, { method: 'DELETE' }).catch(() => {});
  };

  const handleSubmitQuiz = () => {
    if (isSubmitted) return;
    const res = calculateResultData();
    setResultData(res);
    setIsSubmitted(true);
    onCompleteAptitude(res);

    // Clear active progress
    if (userId) {
      clearUserAptitudeProgress(userId);
    }
    fetch(`/api/aptitude/progress?userId=${userId || ''}`, { method: 'DELETE' }).catch(() => {});
  };

  const handleStartNewTest = () => {
    setIsSubmitted(false);
    setResultData(null);
    setCurrentIdx(0);
    setUserAnswers({});
    setTimeLeft(600);
    setActiveTestName(`Placement Aptitude Test #${aptitudeHistory.length + 1}`);
    setSelectedHistoryItem(null);
    setActiveSubTab('test');

    if (userId) {
      clearUserAptitudeProgress(userId);
    }
    fetch(`/api/aptitude/progress?userId=${userId || ''}`, { method: 'DELETE' }).catch(() => {});
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Analytics helper calculations for history
  const historyList = aptitudeHistory;
  const totalTestsCount = historyList.length;
  const avgScore = totalTestsCount > 0 ? Math.round(historyList.reduce((acc, h) => acc + h.scorePercentage, 0) / totalTestsCount) : 0;
  const highestScore = totalTestsCount > 0 ? Math.max(...historyList.map((h) => h.scorePercentage)) : 0;
  const lowestScore = totalTestsCount > 0 ? Math.min(...historyList.map((h) => h.scorePercentage)) : 0;
  const latestImprovement = historyList.length > 0 ? (historyList[0].improvementDelta || 0) : 0;

  const currentQ = questions[currentIdx];

  // Render question answer review list
  const renderQuestionReview = (targetQuestions: Question[], targetAnswers: Record<string, number>) => {
    return (
      <div className="space-y-4">
        {targetQuestions.map((q, idx) => {
          const userAnsIdx = targetAnswers[q.id];
          const isAnswered = userAnsIdx !== undefined;
          const isCorrect = isAnswered && userAnsIdx === q.correctAnswer;
          const userChoiceText = isAnswered && q.options ? q.options[userAnsIdx] : 'Not Answered';
          const correctChoiceText = q.options ? q.options[q.correctAnswer!] : '';

          return (
            <div 
              key={q.id} 
              className={`p-5 sm:p-6 rounded-2xl border transition-all ${
                !isAnswered
                  ? 'bg-slate-900/90 border-slate-800'
                  : isCorrect
                  ? 'bg-emerald-950/20 border-emerald-500/30'
                  : 'bg-rose-950/20 border-rose-500/30'
              }`}
            >
              {/* Question Header & Status */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 pb-3 border-b border-slate-800/80">
                <div className="flex items-center space-x-2">
                  <span className="w-6 h-6 rounded-lg bg-slate-800 text-indigo-400 font-mono text-xs font-bold flex items-center justify-center">
                    {idx + 1}
                  </span>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                    {q.category}
                  </span>
                  <span className="text-[10px] uppercase font-bold text-slate-400">
                    {q.difficulty}
                  </span>
                </div>

                <div>
                  {!isAnswered ? (
                    <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                      <AlertTriangle className="w-3.5 h-3.5 mr-1" />
                      Unanswered
                    </span>
                  ) : isCorrect ? (
                    <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                      Correct Answer
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                      <XCircle className="w-3.5 h-3.5 mr-1" />
                      Incorrect Choice
                    </span>
                  )}
                </div>
              </div>

              {/* Question Statement */}
              <p className="text-sm sm:text-base font-bold text-white mb-4">
                {q.question}
              </p>

              {/* Options Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4">
                {q.options?.map((opt, optIdx) => {
                  const isUserSelection = userAnsIdx === optIdx;
                  const isCorrectOption = q.correctAnswer === optIdx;

                  let optClass = 'bg-slate-950 border-slate-800 text-slate-300';
                  if (isCorrectOption) {
                    optClass = 'bg-emerald-950/60 border-emerald-500 text-emerald-200 font-bold';
                  } else if (isUserSelection && !isCorrectOption) {
                    optClass = 'bg-rose-950/60 border-rose-500 text-rose-200 font-bold';
                  }

                  return (
                    <div 
                      key={optIdx} 
                      className={`p-3 rounded-xl border text-xs flex items-center justify-between ${optClass}`}
                    >
                      <div className="flex items-center space-x-2">
                        <span className="font-mono text-slate-400 font-bold">
                          {String.fromCharCode(65 + optIdx)}.
                        </span>
                        <span>{opt}</span>
                      </div>

                      {isCorrectOption && (
                        <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded">
                          Correct Option
                        </span>
                      )}
                      {isUserSelection && !isCorrectOption && (
                        <span className="text-[10px] font-bold text-rose-400 bg-rose-500/20 px-2 py-0.5 rounded">
                          Your Choice
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Explanations & Learning Tips */}
              <div className="space-y-2 text-xs">
                {/* Correct Solution Explanation */}
                <div className="p-3.5 rounded-xl bg-indigo-950/30 border border-indigo-500/20 text-indigo-200 space-y-1">
                  <div className="flex items-center space-x-1.5 text-indigo-300 font-bold">
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span>Why the Correct Answer is Right:</span>
                  </div>
                  <p className="leading-relaxed text-slate-300 pl-5">
                    {q.explanation}
                  </p>
                </div>

                {/* Wrong Explanation if applicable */}
                {isAnswered && !isCorrect && q.wrongExplanations?.[userAnsIdx] && (
                  <div className="p-3.5 rounded-xl bg-rose-950/20 border border-rose-500/20 text-rose-200 space-y-1">
                    <div className="flex items-center space-x-1.5 text-rose-300 font-bold">
                      <XCircle className="w-4 h-4 text-rose-400" />
                      <span>Why Your Selection ({q.options?.[userAnsIdx]}) was Wrong:</span>
                    </div>
                    <p className="leading-relaxed text-slate-300 pl-5">
                      {q.wrongExplanations[userAnsIdx]}
                    </p>
                  </div>
                )}

                {/* Practical Learning Tip */}
                {q.learningTip && (
                  <div className="p-3 rounded-xl bg-amber-950/20 border border-amber-500/20 text-amber-200 flex items-start space-x-2">
                    <Lightbulb className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-amber-300">Improvement Tip: </span>
                      <span className="text-slate-300">{q.learningTip}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      {/* Module Header & Sub-Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center space-x-2 text-purple-400 font-semibold text-xs mb-1">
            <BrainCircuit className="w-4 h-4" />
            <span>Placement Aptitude & Logic Engine</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Aptitude & Technical Assessment
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Quantitative, Logical Reasoning, Verbal Ability & Core Computer Science Fundamentals.
          </p>
        </div>

        {/* Sub-Tab Selector: Test vs History */}
        <div className="flex items-center space-x-2 bg-slate-900 border border-slate-800 p-1 rounded-xl self-start md:self-auto">
          <button
            onClick={() => {
              setSelectedHistoryItem(null);
              setActiveSubTab('test');
            }}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeSubTab === 'test' && !selectedHistoryItem
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <BrainCircuit className="w-4 h-4" />
            <span>{isSubmitted ? 'Test Scorecard' : 'Active Practice Test'}</span>
          </button>

          <button
            onClick={() => setActiveSubTab('history')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeSubTab === 'history' || selectedHistoryItem
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <History className="w-4 h-4" />
            <span>Test History & Analytics ({totalTestsCount})</span>
          </button>
        </div>
      </div>

      {/* VIEW MODE 1: ACTIVE QUIZ VIEW */}
      {activeSubTab === 'test' && !selectedHistoryItem && !isSubmitted && (
        <div className="space-y-6">
          {/* Top Timer Bar & Progress Indicator */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-lg">
            <div className="flex items-center space-x-3">
              <span className="px-2.5 py-1 rounded-lg bg-indigo-600/20 text-indigo-400 font-mono text-xs font-bold border border-indigo-500/30">
                Question {currentIdx + 1} / {questions.length}
              </span>
              <span className="text-xs font-semibold text-slate-300">
                Category: <strong className="text-indigo-300">{currentQ.category}</strong>
              </span>
            </div>

            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2 bg-slate-950 border border-slate-800 px-4 py-2 rounded-xl text-amber-400 font-mono font-bold text-sm">
                <Clock className="w-4 h-4 text-amber-400 animate-pulse" />
                <span>Timer: {formatTime(timeLeft)}</span>
              </div>

              <button
                onClick={handleStartNewTest}
                title="Restart Test"
                className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors text-xs flex items-center space-x-1"
              >
                <RotateCcw className="w-4 h-4" />
                <span className="hidden sm:inline">Reset</span>
              </button>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-slate-900 h-2.5 rounded-full overflow-hidden border border-slate-800">
            <div
              className="bg-gradient-to-r from-indigo-500 to-purple-500 h-2.5 transition-all duration-300 rounded-full"
              style={{ width: `${((currentIdx + 1) / questions.length) * 100}%` }}
            />
          </div>

          {/* Active Question Card */}
          <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 space-y-6 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">
                {currentQ.difficulty} Difficulty
              </span>
              <span className="text-xs text-slate-400 font-mono">
                Answered {Object.keys(userAnswers).length} of {questions.length}
              </span>
            </div>

            <h3 className="text-base sm:text-lg font-bold text-white leading-relaxed">
              {currentIdx + 1}. {currentQ.question}
            </h3>

            {/* Options List */}
            <div className="space-y-3">
              {currentQ.options?.map((opt, optIdx) => {
                const isSelected = userAnswers[currentQ.id] === optIdx;
                return (
                  <button
                    key={optIdx}
                    onClick={() => handleSelectOption(currentQ.id, optIdx)}
                    className={`w-full p-4 rounded-2xl text-left text-sm font-medium transition-all flex items-center justify-between ${
                      isSelected
                        ? 'bg-indigo-600/25 border-2 border-indigo-500 text-indigo-100 shadow-md shadow-indigo-600/10'
                        : 'bg-slate-950 hover:bg-slate-800/80 border border-slate-800 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <span className={`w-7 h-7 rounded-xl border flex items-center justify-center text-xs font-bold ${
                        isSelected ? 'border-indigo-400 bg-indigo-600 text-white' : 'border-slate-800 bg-slate-900 text-slate-400'
                      }`}>
                        {String.fromCharCode(65 + optIdx)}
                      </span>
                      <span>{opt}</span>
                    </div>

                    {isSelected && (
                      <CheckCircle2 className="w-5 h-5 text-indigo-400" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Question Navigation Buttons */}
          <div className="flex items-center justify-between pt-2">
            <button
              onClick={() => setCurrentIdx((prev) => Math.max(0, prev - 1))}
              disabled={currentIdx === 0}
              className="px-5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-bold text-slate-300 hover:text-white disabled:opacity-40 transition-colors"
            >
              Previous Question
            </button>

            <div className="flex items-center space-x-3">
              {currentIdx < questions.length - 1 ? (
                <button
                  onClick={() => setCurrentIdx((prev) => Math.min(questions.length - 1, prev + 1))}
                  className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md transition-all"
                >
                  Next Question
                </button>
              ) : (
                <button
                  onClick={handleSubmitQuiz}
                  className="px-8 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-sm font-bold shadow-lg shadow-emerald-600/25 transition-all flex items-center space-x-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Submit Assessment</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* VIEW MODE 2: RECENT SUBMISSION RESULTS & DETAILED REVIEW */}
      {activeSubTab === 'test' && !selectedHistoryItem && isSubmitted && resultData && (
        <div className="space-y-8 animate-fade-in">
          {/* Main Scorecard Banner */}
          <div className="p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-indigo-500/30 text-center space-y-6 shadow-2xl relative overflow-hidden">
            <div className="w-16 h-16 rounded-2xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center mx-auto shadow-xl">
              <Award className="w-8 h-8" />
            </div>

            <div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white">Assessment Completed</h2>
              <p className="text-xs text-indigo-300 font-mono mt-1">{resultData.testName} • {resultData.date}</p>
            </div>

            {/* Metric Highlights */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 max-w-3xl mx-auto pt-2">
              <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800">
                <p className="text-[10px] uppercase font-bold text-slate-400">Score</p>
                <p className="text-3xl font-extrabold text-emerald-400 font-mono mt-1">{resultData.scorePercentage}%</p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800">
                <p className="text-[10px] uppercase font-bold text-slate-400">Correct</p>
                <p className="text-3xl font-extrabold text-blue-400 font-mono mt-1">{resultData.correctCount} / {resultData.totalQuestions}</p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800">
                <p className="text-[10px] uppercase font-bold text-slate-400">Wrong</p>
                <p className="text-3xl font-extrabold text-rose-400 font-mono mt-1">{resultData.wrongCount}</p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800">
                <p className="text-[10px] uppercase font-bold text-slate-400">Unanswered</p>
                <p className="text-3xl font-extrabold text-amber-400 font-mono mt-1">{resultData.unansweredCount}</p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 col-span-2 sm:col-span-1">
                <p className="text-[10px] uppercase font-bold text-slate-400">Time Taken</p>
                <p className="text-3xl font-extrabold text-purple-400 font-mono mt-1">{resultData.timeTakenMinutes}m</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-4 flex flex-wrap items-center justify-center gap-4">
              {onContinueNextRound && (
                <button
                  type="button"
                  onClick={onContinueNextRound}
                  className="px-8 py-3 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-600 hover:from-emerald-500 hover:to-indigo-500 text-white font-extrabold text-xs shadow-xl shadow-emerald-600/20 transition-all flex items-center space-x-2 animate-pulse hover:scale-105 cursor-pointer"
                >
                  <span>{nextRoundTitle?.startsWith('Continue') ? nextRoundTitle : `Continue to ${nextRoundTitle || 'Technical Round'}`}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}

              <button
                onClick={handleStartNewTest}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg transition-all flex items-center space-x-2"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Take Another Practice Test</span>
              </button>

              <button
                onClick={() => setActiveSubTab('history')}
                className="px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700/80 text-slate-200 font-bold text-xs border border-slate-700 transition-all flex items-center space-x-2"
              >
                <History className="w-4 h-4" />
                <span>View Historical Attempts</span>
              </button>

              <button
                onClick={() => onNavigate('dashboard')}
                className="px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700/80 text-slate-200 font-bold text-xs border border-slate-700 transition-all flex items-center space-x-2"
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>Return to Dashboard</span>
              </button>
            </div>
          </div>

          {/* AI Performance Feedback Summary */}
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-6">
            <h3 className="text-base font-bold text-white flex items-center space-x-2 border-b border-slate-800 pb-3">
              <Zap className="w-5 h-5 text-indigo-400" />
              <span>AI Performance Analysis & Topic Breakdown</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Strong & Weak Topics */}
              <div className="space-y-4">
                <div>
                  <p className="text-xs font-bold text-emerald-400 flex items-center space-x-1.5 mb-2">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Strong Topics Identified</span>
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {resultData.feedback.strongTopics.map((topic, i) => (
                      <span key={i} className="px-3 py-1 rounded-lg bg-emerald-500/10 text-emerald-300 text-xs font-semibold border border-emerald-500/20">
                        {topic}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-xs font-bold text-rose-400 flex items-center space-x-1.5 mb-2">
                    <AlertTriangle className="w-4 h-4" />
                    <span>Topics Needing Practice</span>
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {resultData.feedback.weakTopics.map((topic, i) => (
                      <span key={i} className="px-3 py-1 rounded-lg bg-rose-500/10 text-rose-300 text-xs font-semibold border border-rose-500/20">
                        {topic}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Actionable Suggestions */}
              <div className="space-y-3">
                <p className="text-xs font-bold text-amber-400 flex items-center space-x-1.5">
                  <Lightbulb className="w-4 h-4" />
                  <span>Key Action Items for Improvement</span>
                </p>
                <ul className="space-y-2 text-xs text-slate-300">
                  {resultData.feedback.improvementSuggestions.map((item, i) => (
                    <li key={i} className="flex items-start space-x-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 flex-shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Detailed Question Review List */}
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-6">
            <h3 className="text-base font-bold text-white flex items-center space-x-2 border-b border-slate-800 pb-3">
              <HelpCircle className="w-5 h-5 text-indigo-400" />
              <span>Full Question Review & Solutions ({resultData.questions.length})</span>
            </h3>

            {renderQuestionReview(resultData.questions, resultData.userAnswers)}
          </div>
        </div>
      )}

      {/* VIEW MODE 3: HISTORY & ANALYTICS VIEW OR SPECIFIC ATTEMPT REVIEW */}
      {(activeSubTab === 'history' || selectedHistoryItem) && (
        <div className="space-y-8 animate-fade-in">
          {/* If a specific historical item is selected for review */}
          {selectedHistoryItem ? (
            <div className="space-y-6">
              <div className="flex items-center justify-between bg-slate-900 border border-slate-800 p-4 rounded-2xl">
                <div>
                  <h2 className="text-lg font-bold text-white">
                    Reviewing Historical Attempt: <span className="text-indigo-400">{selectedHistoryItem.testName}</span>
                  </h2>
                  <p className="text-xs text-slate-400">Date: {selectedHistoryItem.date} • Score: {selectedHistoryItem.scorePercentage}%</p>
                </div>

                <button
                  onClick={() => setSelectedHistoryItem(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 border border-slate-700 transition-colors"
                >
                  ← Back to History List
                </button>
              </div>

              {/* Detailed Review for selected attempt */}
              <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-6">
                {renderQuestionReview(
                  selectedHistoryItem.questions || SAMPLE_APTITUDE_QUESTIONS,
                  selectedHistoryItem.userAnswers || {}
                )}
              </div>
            </div>
          ) : (
            /* Main History Analytics Dashboard */
            <div className="space-y-8">
              {/* Analytics Summary Stats Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 text-center">
                  <p className="text-xs text-slate-400 font-medium">Total Attempts</p>
                  <p className="text-3xl font-extrabold text-white font-mono mt-1">{totalTestsCount}</p>
                </div>

                <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 text-center">
                  <p className="text-xs text-slate-400 font-medium">Average Score</p>
                  <p className="text-3xl font-extrabold text-indigo-400 font-mono mt-1">{avgScore}%</p>
                </div>

                <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 text-center">
                  <p className="text-xs text-slate-400 font-medium">Highest Score</p>
                  <p className="text-3xl font-extrabold text-emerald-400 font-mono mt-1">{highestScore}%</p>
                </div>

                <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 text-center">
                  <p className="text-xs text-slate-400 font-medium">Recent Trend</p>
                  <p className={`text-3xl font-extrabold font-mono mt-1 flex items-center justify-center ${
                    latestImprovement >= 0 ? 'text-emerald-400' : 'text-rose-400'
                  }`}>
                    {latestImprovement >= 0 ? '+' : ''}{latestImprovement}%
                  </p>
                </div>
              </div>

              {/* Visual SVG Trend Graph */}
              {historyList.length > 0 && (
                <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                      <TrendingUp className="w-4 h-4 text-indigo-400" />
                      <span>Performance Improvement Trend</span>
                    </h3>
                    <span className="text-xs text-slate-400 font-mono">Scores over time</span>
                  </div>

                  <div className="h-40 w-full flex items-end space-x-4 pt-4 px-2">
                    {historyList.slice().reverse().map((attempt, idx) => {
                      const heightPct = Math.max(15, attempt.scorePercentage);
                      return (
                        <div key={attempt.id} className="flex-1 flex flex-col items-center group relative">
                          {/* Tooltip on hover */}
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-10 bg-slate-950 text-xs font-bold text-indigo-300 px-2 py-1 rounded border border-indigo-500/30 whitespace-nowrap z-20 pointer-events-none">
                            {attempt.testName}: {attempt.scorePercentage}%
                          </div>

                          <span className="text-[10px] font-bold text-slate-300 mb-1">{attempt.scorePercentage}%</span>
                          <div 
                            className="w-full max-w-[32px] bg-gradient-to-t from-indigo-600 to-purple-500 rounded-t-lg transition-all group-hover:brightness-125"
                            style={{ height: `${heightPct}%` }}
                          />
                          <span className="text-[9px] text-slate-500 font-mono mt-1 truncate max-w-full">
                            #{historyList.length - idx}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Saved Attempts Table / List */}
              <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                  <h3 className="text-base font-bold text-white flex items-center space-x-2">
                    <History className="w-5 h-5 text-indigo-400" />
                    <span>Completed Aptitude Attempts</span>
                  </h3>

                  <button
                    onClick={handleStartNewTest}
                    className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md transition-all flex items-center space-x-1"
                  >
                    <Play className="w-3.5 h-3.5" />
                    <span>Start New Practice Test</span>
                  </button>
                </div>

                {historyList.length === 0 ? (
                  <div className="text-center py-12 space-y-4">
                    <div className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center text-slate-400 mx-auto">
                      <BrainCircuit className="w-6 h-6" />
                    </div>
                    <p className="text-xs text-slate-400">No aptitude attempts logged yet.</p>
                    <button
                      onClick={handleStartNewTest}
                      className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md transition-all"
                    >
                      Take First Aptitude Assessment
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {historyList.map((item, idx) => {
                      const delta = item.improvementDelta || 0;
                      return (
                        <div 
                          key={item.id}
                          className="p-4 rounded-2xl bg-slate-950 border border-slate-800 hover:border-slate-700 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                        >
                          <div className="space-y-1">
                            <div className="flex items-center space-x-2">
                              <span className="font-bold text-sm text-white">{item.testName}</span>
                              {delta !== 0 && (
                                <span className={`inline-flex items-center text-[10px] font-bold px-1.5 py-0.5 rounded ${
                                  delta > 0 
                                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                                    : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                                }`}>
                                  {delta > 0 ? <ArrowUpRight className="w-3 h-3 mr-0.5" /> : <ArrowDownRight className="w-3 h-3 mr-0.5" />}
                                  {delta > 0 ? `+${delta}%` : `${delta}%`}
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-slate-400 font-mono">
                              Date: {item.date} • Time Taken: {item.timeTakenMinutes} min
                            </p>
                          </div>

                          <div className="flex items-center space-x-6">
                            <div className="text-right">
                              <p className="text-xs text-slate-400">Score</p>
                              <p className="text-xl font-extrabold text-emerald-400 font-mono">
                                {item.scorePercentage}%
                              </p>
                              <p className="text-[10px] text-slate-500 font-mono">
                                {item.correctCount}/{item.totalQuestions} Correct
                              </p>
                            </div>

                            <button
                              onClick={() => setSelectedHistoryItem(item)}
                              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-indigo-300 border border-slate-700 transition-colors flex items-center space-x-1"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>Review Details</span>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
