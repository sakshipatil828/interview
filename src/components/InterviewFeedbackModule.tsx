/**
 * CareerCurve AI Interview Preparation Platform
 * Final Session Module: Interview Experience & Improvement Feedback
 * 
 * Collects student reflections, optional voice feedback, synthesizes results
 * with actual interview telemetry, and manages an interactive 7-day practice plan.
 */

import React, { useState, useEffect } from 'react';
import { 
  User, 
  ParsedResume, 
  InterviewSession, 
  AptitudeResult,
  StudentInterviewFeedback,
  PersonalizedImprovementPlan,
  ExperienceRating,
  ChallengingPhase,
  BiggestDifficultyOption,
  ImprovementGoalOption
} from '../types';
import { 
  getUserFeedback, 
  saveUserFeedback, 
  getUserImprovementPlan, 
  saveUserImprovementPlan,
  toggleImprovementPlanTask,
  updateImprovementPlanNotes,
  clearUserFeedback,
  clearUserImprovementPlan
} from '../services/authStorageService';
import { generatePersonalizedImprovementPlan } from '../services/feedbackAnalysisService';
import { speechService } from '../services/speechService';
import { 
  Sparkles, 
  MessageSquare, 
  Mic, 
  MicOff, 
  CheckCircle2, 
  Star, 
  Target, 
  TrendingUp, 
  Calendar, 
  Clock, 
  ArrowRight, 
  RotateCcw, 
  FileText, 
  AlertCircle, 
  Award, 
  ShieldCheck, 
  Compass, 
  Check, 
  ExternalLink,
  ChevronRight,
  BookOpen,
  Trash2,
  Save,
  Volume2
} from 'lucide-react';

interface InterviewFeedbackModuleProps {
  user: User | null;
  parsedResume: ParsedResume | null;
  interviewSessions: InterviewSession[];
  aptitudeResults: AptitudeResult[];
  onNavigate: (tab: string) => void;
}

export const InterviewFeedbackModule: React.FC<InterviewFeedbackModuleProps> = ({
  user,
  parsedResume,
  interviewSessions,
  aptitudeResults,
  onNavigate,
}) => {
  // Active Tab/View inside Feedback module: 'form' | 'dashboard'
  const [viewState, setViewState] = useState<'form' | 'dashboard'>('form');

  // Form State
  const [experienceRating, setExperienceRating] = useState<ExperienceRating>('Good');
  const [mostChallengingPhase, setMostChallengingPhase] = useState<ChallengingPhase>('HR Interview');
  const [biggestDifficulty, setBiggestDifficulty] = useState<BiggestDifficultyOption>('I could not explain my thoughts clearly.');
  const [biggestDifficultyCustom, setBiggestDifficultyCustom] = useState('');
  const [confidenceRating, setConfidenceRating] = useState<number>(3);
  const [selectedGoals, setSelectedGoals] = useState<string[]>(['Communication skills', 'Answer structure']);
  const [customGoal, setCustomGoal] = useState('');
  const [mostHelpfulPart, setMostHelpfulPart] = useState('');
  const [suggestionsForImprovement, setSuggestionsForImprovement] = useState('');

  // Voice Feedback State
  const [isVoiceRecording, setIsVoiceRecording] = useState(false);
  const [voiceTranscript, setVoiceTranscript] = useState('');
  const [voiceTranscriptIncluded, setVoiceTranscriptIncluded] = useState(true);
  const [voiceErrorNotice, setVoiceErrorNotice] = useState<string | null>(null);

  // Analysis / Plan State
  const [improvementPlan, setImprovementPlan] = useState<PersonalizedImprovementPlan | null>(null);
  const [isGeneratingPlan, setIsGeneratingPlan] = useState(false);
  const [showCompletionBanner, setShowCompletionBanner] = useState(false);
  const [personalNotes, setPersonalNotes] = useState('');
  const [notesSaveNotice, setNotesSaveNotice] = useState(false);

  // Load existing feedback and improvement plan for this authenticated user
  useEffect(() => {
    if (user?.id) {
      const savedPlan = getUserImprovementPlan(user.id);
      const savedFeedback = getUserFeedback(user.id);

      if (savedPlan) {
        setImprovementPlan(savedPlan);
        setPersonalNotes(savedPlan.personalNotes || '');
        setViewState('dashboard');
      } else if (savedFeedback) {
        setExperienceRating(savedFeedback.experienceRating);
        setMostChallengingPhase(savedFeedback.mostChallengingPhase);
        setBiggestDifficulty(savedFeedback.biggestDifficulty as BiggestDifficultyOption);
        setBiggestDifficultyCustom(savedFeedback.biggestDifficultyCustom || '');
        setConfidenceRating(savedFeedback.confidenceRating);
        setSelectedGoals(savedFeedback.improvementGoals);
        setCustomGoal(savedFeedback.improvementGoalCustom || '');
        setMostHelpfulPart(savedFeedback.mostHelpfulPart || '');
        setSuggestionsForImprovement(savedFeedback.suggestionsForImprovement || '');
        setVoiceTranscript(savedFeedback.voiceTranscript || '');
        setVoiceTranscriptIncluded(savedFeedback.voiceTranscriptIncluded);
      }
    }
  }, [user?.id]);

  // Handle Voice Recording toggle
  const toggleVoiceRecording = async () => {
    if (isVoiceRecording) {
      speechService.stopListening();
      setIsVoiceRecording(false);
      return;
    }

    setVoiceErrorNotice(null);
    const started = await speechService.startListening({
      onListeningStart: () => {
        setIsVoiceRecording(true);
      },
      onTranscriptChange: (text) => {
        setVoiceTranscript((prev) => (prev ? `${prev} ${text}` : text));
      },
      onSilenceTimeout: () => {
        setIsVoiceRecording(false);
      },
      onError: (err) => {
        setIsVoiceRecording(false);
        setVoiceErrorNotice(`Voice input issue (${err}). You may type your feedback in the text box below.`);
      },
    });

    if (!started) {
      setVoiceErrorNotice('Voice recognition is not supported or microphone access was denied. You may type your thoughts below.');
    }
  };

  // Handle Goal Multi-select
  const toggleGoal = (goal: string) => {
    if (selectedGoals.includes(goal)) {
      if (selectedGoals.length > 1) {
        setSelectedGoals(selectedGoals.filter((g) => g !== goal));
      }
    } else {
      setSelectedGoals([...selectedGoals, goal]);
    }
  };

  // Form Submission
  const handleSubmitFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) return;

    setIsGeneratingPlan(true);

    const feedbackData: StudentInterviewFeedback = {
      id: `fb_${Date.now()}_${user.id.slice(-6)}`,
      userId: user.id,
      submittedAt: new Date().toISOString(),
      experienceRating,
      mostChallengingPhase,
      biggestDifficulty,
      biggestDifficultyCustom: biggestDifficulty === 'Other' ? biggestDifficultyCustom : undefined,
      confidenceRating,
      improvementGoals: selectedGoals,
      improvementGoalCustom: selectedGoals.includes('Other') ? customGoal : undefined,
      mostHelpfulPart: mostHelpfulPart.trim() || undefined,
      suggestionsForImprovement: suggestionsForImprovement.trim() || undefined,
      voiceTranscript: voiceTranscript.trim() || undefined,
      voiceTranscriptIncluded,
    };

    // Save strictly to user's isolated storage
    saveUserFeedback(user.id, feedbackData);

    // Generate personalized 7-day plan
    const generatedPlan = await generatePersonalizedImprovementPlan(
      feedbackData,
      interviewSessions,
      aptitudeResults,
      parsedResume,
      user.id
    );

    saveUserImprovementPlan(user.id, generatedPlan);
    setImprovementPlan(generatedPlan);
    setPersonalNotes(generatedPlan.personalNotes || '');
    setIsGeneratingPlan(false);
    setShowCompletionBanner(true);
    setViewState('dashboard');
  };

  // Task Toggle
  const handleToggleTask = (day: number, currentCompleted: boolean) => {
    if (!user?.id) return;
    const updated = toggleImprovementPlanTask(user.id, day, !currentCompleted);
    if (updated) {
      setImprovementPlan(updated);
    }
  };

  // Save Personal Notes
  const handleSaveNotes = () => {
    if (!user?.id) return;
    const updated = updateImprovementPlanNotes(user.id, personalNotes);
    if (updated) {
      setImprovementPlan(updated);
      setNotesSaveNotice(true);
      setTimeout(() => setNotesSaveNotice(false), 2500);
    }
  };

  // Reset / Clear Feedback
  const handleResetFeedback = () => {
    if (!user?.id) return;
    if (window.confirm('Are you sure you want to reset your feedback and generate a new plan? This will clear your current checklist progress.')) {
      clearUserFeedback(user.id);
      clearUserImprovementPlan(user.id);
      setImprovementPlan(null);
      setVoiceTranscript('');
      setViewState('form');
      setShowCompletionBanner(false);
    }
  };

  // Predefined options
  const experienceOptions: ExperienceRating[] = ['Excellent', 'Good', 'Average', 'Difficult', 'Very difficult'];
  const challengingPhaseOptions: ChallengingPhase[] = [
    'HR Interview',
    'Technical Interview',
    'Aptitude Test',
    'Resume-Based Questions',
    'Voice and Communication',
    'Time Management',
  ];
  const difficultyOptions: BiggestDifficultyOption[] = [
    'I was nervous while answering.',
    'I could not explain my thoughts clearly.',
    'I did not know some technical answers.',
    'I struggled with aptitude questions.',
    'I could not finish answers within the time limit.',
    'I had difficulty understanding the questions.',
    'Other',
  ];
  const goalOptions: ImprovementGoalOption[] = [
    'Communication skills',
    'Technical knowledge',
    'Aptitude and logical reasoning',
    'Confidence and nervousness management',
    'Answer structure',
    'Speaking fluency',
    'Time management',
    'Resume explanation',
    'Other',
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      {/* View Switcher Header if Plan exists */}
      {improvementPlan && (
        <div className="flex items-center justify-between bg-slate-900 p-4 rounded-2xl border border-slate-800">
          <div className="flex items-center space-x-2">
            <span className="text-xs text-slate-400">View Mode:</span>
            <button
              type="button"
              onClick={() => setViewState('dashboard')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                viewState === 'dashboard'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'bg-slate-800 text-slate-300 hover:text-white'
              }`}
            >
              My Improvement Plan
            </button>
            <button
              type="button"
              onClick={() => setViewState('form')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                viewState === 'form'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'bg-slate-800 text-slate-300 hover:text-white'
              }`}
            >
              Edit Feedback Responses
            </button>
          </div>

          <button
            type="button"
            onClick={handleResetFeedback}
            className="text-xs text-rose-400 hover:text-rose-300 flex items-center space-x-1 font-semibold transition-colors cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Reset & Retake</span>
          </button>
        </div>
      )}

      {/* Completion Banner (Shown upon plan creation) */}
      {showCompletionBanner && (
        <div className="p-6 rounded-3xl bg-gradient-to-r from-emerald-950/80 via-slate-900 to-indigo-950/80 border border-emerald-500/40 shadow-2xl space-y-4 animate-fade-in">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white tracking-tight">
                  Your interview journey is complete — your improvement journey starts now.
                </h2>
                <p className="text-xs text-emerald-300/90 mt-0.5">
                  Your self-reflection has been combined with your actual interview telemetry to produce your personalized 7-day roadmap.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setShowCompletionBanner(false)}
              className="text-slate-400 hover:text-white text-xs"
            >
              ✕
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => {
                setShowCompletionBanner(false);
                setViewState('dashboard');
              }}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition-all flex items-center space-x-2 cursor-pointer"
            >
              <Target className="w-4 h-4" />
              <span>View My Improvement Plan</span>
            </button>

            {improvementPlan?.nextPracticeSession && (
              <button
                type="button"
                onClick={() => onNavigate(improvementPlan.nextPracticeSession.recommendedPhase)}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-600/30 transition-all flex items-center space-x-2 cursor-pointer"
              >
                <TrendingUp className="w-4 h-4" />
                <span>Practise My Weakest Area ({improvementPlan.nextPracticeSession.title})</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => onNavigate('dashboard')}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-all flex items-center space-x-1.5 cursor-pointer"
            >
              <span>Return to Dashboard</span>
            </button>
          </div>
        </div>
      )}

      {/* =====================================================================
          VIEW 1: FEEDBACK QUESTIONNAIRE & VOICE INPUT
          ===================================================================== */}
      {viewState === 'form' && (
        <div className="space-y-8 animate-fade-in">
          {/* Section Header */}
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Final Interview Session</span>
            </div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">
              Interview Experience & Improvement Feedback
            </h1>
            <p className="text-sm text-slate-300 leading-relaxed">
              Congratulations on completing your mock interview journey! Before you finish, tell us about your experience. Your feedback will help us understand your challenges and create a personalized plan to improve your interview performance.
            </p>
          </div>

          <form onSubmit={handleSubmitFeedback} className="space-y-8">
            {/* Question 1: Overall Experience */}
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl">
              <label className="block text-sm font-bold text-white flex items-center space-x-2">
                <span className="w-6 h-6 rounded-lg bg-indigo-600/30 text-indigo-400 flex items-center justify-center text-xs font-mono">1</span>
                <span>How was your overall interview experience?</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                {experienceOptions.map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => setExperienceRating(opt)}
                    className={`p-3 rounded-xl text-xs font-semibold border text-center transition-all cursor-pointer ${
                      experienceRating === opt
                        ? 'bg-indigo-600/20 text-indigo-300 border-indigo-500 shadow-md shadow-indigo-500/10'
                        : 'bg-slate-950 text-slate-400 border-slate-800 hover:bg-slate-800/60 hover:text-slate-200'
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>

            {/* Question 2: Most Challenging Phase */}
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl">
              <label className="block text-sm font-bold text-white flex items-center space-x-2">
                <span className="w-6 h-6 rounded-lg bg-indigo-600/30 text-indigo-400 flex items-center justify-center text-xs font-mono">2</span>
                <span>Which phase did you find most challenging?</span>
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {challengingPhaseOptions.map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => setMostChallengingPhase(opt)}
                    className={`p-3.5 rounded-xl text-xs font-semibold border text-left transition-all cursor-pointer flex items-center justify-between ${
                      mostChallengingPhase === opt
                        ? 'bg-indigo-600/20 text-indigo-300 border-indigo-500 shadow-md'
                        : 'bg-slate-950 text-slate-400 border-slate-800 hover:bg-slate-800/60 hover:text-slate-200'
                    }`}
                  >
                    <span>{opt}</span>
                    {mostChallengingPhase === opt && <Check className="w-4 h-4 text-indigo-400 ml-2 flex-shrink-0" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Question 3: Biggest Difficulty Faced */}
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl">
              <label className="block text-sm font-bold text-white flex items-center space-x-2">
                <span className="w-6 h-6 rounded-lg bg-indigo-600/30 text-indigo-400 flex items-center justify-center text-xs font-mono">3</span>
                <span>What was the biggest difficulty you faced?</span>
              </label>
              <div className="space-y-2">
                {difficultyOptions.map((opt) => (
                  <label
                    key={opt}
                    className={`flex items-center space-x-3 p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                      biggestDifficulty === opt
                        ? 'bg-indigo-600/15 text-indigo-200 border-indigo-500/50'
                        : 'bg-slate-950 text-slate-400 border-slate-800 hover:bg-slate-800/50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="biggestDifficulty"
                      checked={biggestDifficulty === opt}
                      onChange={() => setBiggestDifficulty(opt)}
                      className="text-indigo-600 focus:ring-indigo-500"
                    />
                    <span>{opt}</span>
                  </label>
                ))}
              </div>

              {biggestDifficulty === 'Other' && (
                <div className="pt-2 animate-fade-in">
                  <input
                    type="text"
                    value={biggestDifficultyCustom}
                    onChange={(e) => setBiggestDifficultyCustom(e.target.value)}
                    placeholder="Describe the specific difficulty you experienced..."
                    className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:border-indigo-500 focus:outline-none"
                    required
                  />
                </div>
              )}
            </div>

            {/* Question 4: Self-Confidence Rating */}
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl">
              <div className="flex items-center justify-between">
                <label className="block text-sm font-bold text-white flex items-center space-x-2">
                  <span className="w-6 h-6 rounded-lg bg-indigo-600/30 text-indigo-400 flex items-center justify-center text-xs font-mono">4</span>
                  <span>How confident do you feel about attending a real interview?</span>
                </label>
                <span className="text-xs font-mono text-indigo-300 font-bold px-2 py-0.5 rounded bg-indigo-500/20 border border-indigo-500/30">
                  {confidenceRating} of 5
                </span>
              </div>
              <div className="flex items-center space-x-3">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setConfidenceRating(star)}
                    className="p-2 transition-transform hover:scale-110 cursor-pointer"
                  >
                    <Star
                      className={`w-7 h-7 ${
                        star <= confidenceRating
                          ? 'text-amber-400 fill-amber-400'
                          : 'text-slate-700 hover:text-slate-500'
                      }`}
                    />
                  </button>
                ))}
                <span className="text-xs text-slate-400 ml-2">
                  {confidenceRating === 1 && '(Very Low / Nervous)'}
                  {confidenceRating === 2 && '(Slightly Hesitant)'}
                  {confidenceRating === 3 && '(Moderate / Balanced)'}
                  {confidenceRating === 4 && '(Confident)'}
                  {confidenceRating === 5 && '(Highly Confident / Ready)'}
                </span>
              </div>
            </div>

            {/* Question 5: What would you most like to improve? */}
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl">
              <label className="block text-sm font-bold text-white flex items-center space-x-2">
                <span className="w-6 h-6 rounded-lg bg-indigo-600/30 text-indigo-400 flex items-center justify-center text-xs font-mono">5</span>
                <span>What would you most like to improve? (Select all that apply)</span>
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                {goalOptions.map((opt) => {
                  const isSelected = selectedGoals.includes(opt);
                  return (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => toggleGoal(opt)}
                      className={`p-3 rounded-xl text-xs font-semibold border text-left transition-all cursor-pointer flex items-center justify-between ${
                        isSelected
                          ? 'bg-indigo-600/20 text-indigo-300 border-indigo-500 shadow-sm'
                          : 'bg-slate-950 text-slate-400 border-slate-800 hover:bg-slate-800/60 hover:text-slate-200'
                      }`}
                    >
                      <span>{opt}</span>
                      {isSelected && <Check className="w-4 h-4 text-indigo-400 ml-1.5 flex-shrink-0" />}
                    </button>
                  );
                })}
              </div>

              {selectedGoals.includes('Other') && (
                <div className="pt-2 animate-fade-in">
                  <input
                    type="text"
                    value={customGoal}
                    onChange={(e) => setCustomGoal(e.target.value)}
                    placeholder="Specify other skill or area you want to develop..."
                    className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:border-indigo-500 focus:outline-none"
                  />
                </div>
              )}
            </div>

            {/* Question 6: Most Helpful Part (Optional) */}
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-3 shadow-xl">
              <label className="block text-sm font-bold text-white flex items-center justify-between">
                <span className="flex items-center space-x-2">
                  <span className="w-6 h-6 rounded-lg bg-indigo-600/30 text-indigo-400 flex items-center justify-center text-xs font-mono">6</span>
                  <span>Which part of the interview helped you the most?</span>
                </span>
                <span className="text-[11px] font-normal text-slate-500">Optional</span>
              </label>
              <textarea
                rows={2}
                value={mostHelpfulPart}
                onChange={(e) => setMostHelpfulPart(e.target.value)}
                placeholder="e.g. The real-time voice interview with Sarah, the instant STAR framework feedback, technical code reviews..."
                className="w-full p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:border-indigo-500 focus:outline-none leading-relaxed resize-none"
              />
            </div>

            {/* Question 7: Suggestions for Improvement (Optional) */}
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-3 shadow-xl">
              <label className="block text-sm font-bold text-white flex items-center justify-between">
                <span className="flex items-center space-x-2">
                  <span className="w-6 h-6 rounded-lg bg-indigo-600/30 text-indigo-400 flex items-center justify-center text-xs font-mono">7</span>
                  <span>What should CareerCurve AI improve in the future?</span>
                </span>
                <span className="text-[11px] font-normal text-slate-500">Optional</span>
              </label>
              <textarea
                rows={2}
                value={suggestionsForImprovement}
                onChange={(e) => setSuggestionsForImprovement(e.target.value)}
                placeholder="e.g. More questions on specific cloud frameworks, additional time limit controls..."
                className="w-full p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:border-indigo-500 focus:outline-none leading-relaxed resize-none"
              />
            </div>

            {/* SECTION 3: OPTIONAL VOICE FEEDBACK */}
            <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-indigo-500/30 space-y-4 shadow-xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                    <Volume2 className="w-4 h-4 text-indigo-400" />
                    <span>Optional: Give Feedback by Voice</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Speak naturally about your experience. Your audio is transcribed in your browser and will be combined with your feedback.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={toggleVoiceRecording}
                  className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 self-start sm:self-auto cursor-pointer ${
                    isVoiceRecording
                      ? 'bg-rose-500 hover:bg-rose-600 text-white animate-pulse'
                      : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/25'
                  }`}
                >
                  {isVoiceRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                  <span>{isVoiceRecording ? 'Stop Recording' : 'Start Voice Recording'}</span>
                </button>
              </div>

              {voiceErrorNotice && (
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0" />
                  <span>{voiceErrorNotice}</span>
                </div>
              )}

              {/* Spoken Transcript Review */}
              <div className="space-y-2">
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Spoken Transcript Review & Edit
                </label>
                <textarea
                  rows={3}
                  value={voiceTranscript}
                  onChange={(e) => setVoiceTranscript(e.target.value)}
                  placeholder="Your spoken feedback transcript will stream here in real time. You can freely edit or delete this before submitting..."
                  className="w-full p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:border-indigo-500 focus:outline-none leading-relaxed resize-none"
                />
              </div>

              {voiceTranscript && (
                <label className="flex items-center space-x-2.5 text-xs text-slate-300 cursor-pointer pt-1">
                  <input
                    type="checkbox"
                    checked={voiceTranscriptIncluded}
                    onChange={(e) => setVoiceTranscriptIncluded(e.target.checked)}
                    className="rounded text-indigo-600 focus:ring-indigo-500"
                  />
                  <span>Include this transcript in generating my personalized improvement plan</span>
                </label>
              )}
            </div>

            {/* Submit Button */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-800">
              <p className="text-xs text-slate-400">
                Data is isolated strictly to your account (<strong className="text-slate-300">{user?.email}</strong>).
              </p>

              <button
                type="submit"
                disabled={isGeneratingPlan}
                className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold text-sm shadow-xl shadow-indigo-600/30 transition-all flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-60"
              >
                {isGeneratingPlan ? (
                  <span>Synthesizing Telemetry & Generating Plan...</span>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Generate My Personalized Improvement Plan</span>
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* =====================================================================
          VIEW 2: IMPROVEMENT DASHBOARD & 7-DAY CHECKLIST
          ===================================================================== */}
      {viewState === 'dashboard' && improvementPlan && (
        <div className="space-y-8 animate-fade-in">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
            <div>
              <div className="flex items-center space-x-2 text-indigo-400 font-semibold text-xs mb-1">
                <Compass className="w-4 h-4" />
                <span>Personalized Performance Roadmap</span>
              </div>
              <h1 className="text-3xl font-extrabold text-white tracking-tight">
                My Improvement Dashboard & 7-Day Plan
              </h1>
              <p className="text-xs text-slate-400 mt-1">
                Candidate: <strong className="text-white">{parsedResume?.fullName || user?.name}</strong> • Analysis: <span className="text-emerald-400">{improvementPlan.performanceInsights.analysisMode === 'real_history_and_feedback' ? 'Grounded in Real Interview Telemetry' : 'Self-Reported Trajectory'}</span>
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={() => onNavigate('dashboard')}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-all cursor-pointer"
              >
                Dashboard
              </button>
              <button
                type="button"
                onClick={() => onNavigate(improvementPlan.nextPracticeSession.recommendedPhase)}
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/25 transition-all flex items-center space-x-2 cursor-pointer"
              >
                <TrendingUp className="w-4 h-4" />
                <span>Practise Recommended Round</span>
              </button>
            </div>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Overall Experience</span>
              <p className="text-lg font-black text-white">{experienceRating}</p>
              <span className="text-[10px] text-slate-500">Student Reflection</span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Self-Confidence</span>
              <p className="text-lg font-black text-amber-400 flex items-center space-x-1">
                <span>{confidenceRating} / 5</span>
                <Star className="w-4 h-4 fill-amber-400 inline" />
              </p>
              <span className="text-[10px] text-slate-500">Pre-Interview Assessment</span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Most Challenging</span>
              <p className="text-base font-bold text-rose-400 truncate">{mostChallengingPhase}</p>
              <span className="text-[10px] text-slate-500">Primary Friction Point</span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Plan Progress</span>
              <p className="text-lg font-black text-emerald-400">
                {improvementPlan.sevenDayPlan.filter((t) => t.completed).length} / 7 Days
              </p>
              <span className="text-[10px] text-slate-500">Daily Drills Completed</span>
            </div>
          </div>

          {/* Previous Session Comparison Card (If 2+ interviews taken) */}
          {improvementPlan.comparisonWithPrevious?.hasComparison && (
            <div className="p-5 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center space-x-3 text-indigo-200 text-xs">
              <TrendingUp className="w-5 h-5 text-indigo-400 flex-shrink-0" />
              <div>
                <strong className="text-white">Historical Benchmark Comparison:</strong>{' '}
                <span>{improvementPlan.comparisonWithPrevious.note}</span>
              </div>
            </div>
          )}

          {/* Section A & B: Experience & Challenges */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
              <h3 className="text-sm font-bold text-white flex items-center space-x-2 border-b border-slate-800 pb-3">
                <MessageSquare className="w-4 h-4 text-indigo-400" />
                <span>A. My Interview Experience</span>
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                {improvementPlan.experienceSummary}
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
              <h3 className="text-sm font-bold text-white flex items-center space-x-2 border-b border-slate-800 pb-3">
                <AlertCircle className="w-4 h-4 text-amber-400" />
                <span>B. My Main Challenges</span>
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                {improvementPlan.mainChallenges}
              </p>
            </div>
          </div>

          {/* Section C: Performance Insights & Confidence Mismatch */}
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center space-x-2 border-b border-slate-800 pb-3">
              <TrendingUp className="w-4 h-4 text-blue-400" />
              <span>C. My Performance Insights & Calibration</span>
            </h3>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 text-xs text-slate-300 leading-relaxed">
              {improvementPlan.performanceInsights.confidenceMismatchAnalysis}
            </div>

            {improvementPlan.performanceInsights.weakestMeasuredAreas.length > 0 && (
              <div className="space-y-2">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Targeted Weakest Measured Areas:
                </span>
                <div className="flex flex-wrap gap-2">
                  {improvementPlan.performanceInsights.weakestMeasuredAreas.map((w, idx) => (
                    <span key={idx} className="px-3 py-1 rounded-lg bg-rose-500/10 text-rose-300 border border-rose-500/30 text-xs font-semibold">
                      {w}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Section D: Demonstrated Strengths */}
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
            <h3 className="text-sm font-bold text-white flex items-center space-x-2 border-b border-slate-800 pb-3">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>D. Demonstrated Strengths Supported by Results</span>
            </h3>
            <ul className="space-y-2 text-xs text-slate-300">
              {improvementPlan.demonstratedStrengths.map((s, idx) => (
                <li key={idx} className="flex items-start space-x-2.5">
                  <span className="text-emerald-400 font-bold">•</span>
                  <span>{s}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Section E: Top 3 Improvement Priorities */}
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center space-x-2 border-b border-slate-800 pb-3">
              <Target className="w-4 h-4 text-purple-400" />
              <span>E. My Top 3 Improvement Priorities</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {improvementPlan.topPriorities.map((p) => (
                <div key={p.rank} className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2 relative overflow-hidden">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30 font-mono">
                      Priority #{p.rank}
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-white">{p.skill}</h4>
                  <p className="text-[11px] text-slate-400 leading-relaxed">{p.reason}</p>
                  <p className="text-[11px] text-purple-300/90 italic pt-1 border-t border-slate-900">
                    Action: {p.recommendedAction}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Section F: 7-Day Improvement Plan Checklist */}
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-6 shadow-2xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center space-x-2">
                  <Calendar className="w-5 h-5 text-indigo-400" />
                  <span>F. My 7-Day Action Plan</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Mark each daily exercise as complete. Your progress persists automatically in your account profile.
                </p>
              </div>

              <div className="flex items-center space-x-2 text-xs font-mono bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800 text-slate-300">
                <span>Progress:</span>
                <strong className="text-emerald-400">
                  {Math.round((improvementPlan.sevenDayPlan.filter((t) => t.completed).length / 7) * 100)}%
                </strong>
              </div>
            </div>

            <div className="space-y-3">
              {improvementPlan.sevenDayPlan.map((exercise) => (
                <div
                  key={exercise.day}
                  onClick={() => handleToggleTask(exercise.day, exercise.completed)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                    exercise.completed
                      ? 'bg-emerald-950/20 border-emerald-500/30 text-slate-300'
                      : 'bg-slate-950 border-slate-800 hover:border-slate-700 text-white'
                  }`}
                >
                  <div className="flex items-start space-x-3.5">
                    <div className={`w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors ${
                      exercise.completed
                        ? 'bg-emerald-500 text-slate-950'
                        : 'border border-slate-700 bg-slate-900 hover:border-indigo-500'
                    }`}>
                      {exercise.completed && <Check className="w-4 h-4 stroke-[3]" />}
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-black text-indigo-400 font-mono">
                          Day {exercise.day}
                        </span>
                        <h4 className={`text-xs font-bold ${exercise.completed ? 'line-through text-slate-400' : 'text-white'}`}>
                          {exercise.title}
                        </h4>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                          {exercise.phaseTag}
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed max-w-2xl">
                        {exercise.taskDescription}
                      </p>
                      <p className="text-[11px] text-emerald-400/90 font-mono">
                        Target: {exercise.measurableGoal}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 self-end sm:self-center text-xs text-slate-400 font-mono flex-shrink-0">
                    <Clock className="w-3.5 h-3.5 text-slate-500" />
                    <span>{exercise.duration}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section G: Recommended Next Session */}
          <div className="p-6 rounded-2xl bg-gradient-to-r from-indigo-950/80 via-slate-900 to-slate-900 border border-indigo-500/30 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  {improvementPlan.nextPracticeSession.badge}
                </span>
                <span className="text-xs text-indigo-400 font-bold">Recommended Next Interview</span>
              </div>
              <h3 className="text-xl font-bold text-white">
                {improvementPlan.nextPracticeSession.title}
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed max-w-2xl">
                {improvementPlan.nextPracticeSession.reason}
              </p>
              <div className="flex flex-wrap gap-2 pt-1">
                {improvementPlan.nextPracticeSession.keyTopicsToFocus.map((top, idx) => (
                  <span key={idx} className="text-[10px] px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-slate-300">
                    • {top}
                  </span>
                ))}
              </div>
            </div>

            <button
              type="button"
              onClick={() => onNavigate(improvementPlan.nextPracticeSession.recommendedPhase)}
              className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs shadow-xl shadow-indigo-600/30 transition-all flex items-center justify-center space-x-2 flex-shrink-0 cursor-pointer"
            >
              <span>Launch Practice Round</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </button>
          </div>

          {/* Section H: Progress Goals */}
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center space-x-2 border-b border-slate-800 pb-3">
              <Award className="w-4 h-4 text-emerald-400" />
              <span>H. Measurable Future Progress Goals</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              {improvementPlan.progressGoals.map((goal, idx) => (
                <div key={idx} className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    {goal.metric}
                  </span>
                  <div className="flex items-baseline justify-between">
                    <span className="text-xs text-slate-500">Cur: {goal.currentBenchmark}</span>
                    <span className="text-xs font-bold text-emerald-400">Goal: {goal.targetBenchmark}</span>
                  </div>
                  <p className="text-[10px] text-slate-400 leading-tight pt-1">
                    {goal.howToMeasure}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Personal Notes & Goals */}
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                <FileText className="w-4 h-4 text-indigo-400" />
                <span>My Personal Notes & Targets</span>
              </h3>
              <button
                type="button"
                onClick={handleSaveNotes}
                className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center space-x-1.5 transition-all cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save Notes</span>
              </button>
            </div>

            <textarea
              rows={3}
              value={personalNotes}
              onChange={(e) => setPersonalNotes(e.target.value)}
              placeholder="Record your own notes, mock dates, target companies, or breakthrough moments..."
              className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:border-indigo-500 focus:outline-none resize-none leading-relaxed"
            />

            {notesSaveNotice && (
              <p className="text-xs text-emerald-400 font-semibold animate-fade-in">
                ✓ Personal notes saved successfully!
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
