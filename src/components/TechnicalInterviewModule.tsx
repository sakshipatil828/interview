import React, { useState, useEffect, useRef } from 'react';
import { ParsedResume, InterviewAnswer, InterviewSession } from '../types';
import { WebcamFeed } from './WebcamFeed';
import { FrontendNLPTechnicalInterviewEngine } from '../nlp/technicalInterviewEngine';
import { 
  DatasetQuestion, 
  FollowUpQuestion, 
  NLPAnswerEvaluation, 
  MatchedQuestion, 
  EngineeringDepartment, 
  SupportedLanguage, 
  CodingExecutionResult,
  TopicMasteryRecord,
  SkippedQuestionLearningData,
  TechnicalPracticeSetSummary,
  SkillWiseProgressDashboardData,
  TechnicalSkillCategoryPerformance
} from '../nlp/types';
import { CodingWorkspace } from './CodingWorkspace';
import { DiagramViewer } from './DiagramViewer';
import { 
  Cpu, 
  Video, 
  Mic, 
  MicOff, 
  Volume2, 
  Send, 
  Sparkles, 
  CheckCircle2, 
  Clock, 
  RotateCcw, 
  ArrowRight, 
  BrainCircuit, 
  Award, 
  AlertCircle, 
  FileText, 
  HelpCircle, 
  Check, 
  ChevronRight, 
  Layers, 
  Terminal, 
  Info, 
  X, 
  Zap, 
  CornerDownRight, 
  SlidersHorizontal,
  Monitor,
  Share2,
  Code2,
  ShieldCheck,
  TrendingUp,
  Target,
  Maximize2
} from 'lucide-react';

interface TechnicalInterviewModuleProps {
  parsedResume: ParsedResume | null;
  profileDepartment?: string;
  targetDepartment?: EngineeringDepartment;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  targetRole?: string;
  durationMinutes?: number;
  onContinueNextRound?: () => void;
  nextRoundTitle?: string;
  onCompleteInterview: (session: InterviewSession) => void;
  onNavigate: (tab: string) => void;
}

export const TechnicalInterviewModule: React.FC<TechnicalInterviewModuleProps> = ({
  parsedResume,
  profileDepartment,
  targetDepartment,
  difficulty,
  targetRole,
  onContinueNextRound,
  nextRoundTitle,
  onCompleteInterview,
  onNavigate,
}) => {
  // NLP Engine instance
  const engineRef = useRef<FrontendNLPTechnicalInterviewEngine | null>(null);

  // Engine state mirror
  const [questions, setQuestions] = useState<DatasetQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [currentQuestion, setCurrentQuestion] = useState<DatasetQuestion | null>(null);
  const [answersList, setAnswersList] = useState<InterviewAnswer[]>([]);
  const [activeFollowUp, setActiveFollowUp] = useState<FollowUpQuestion | null>(null);
  const [isFollowUpActive, setIsFollowUpActive] = useState<boolean>(false);
  const [matchAudit, setMatchAudit] = useState<MatchedQuestion[]>([]);
  const [extractedSkills, setExtractedSkills] = useState<string[]>([]);
  const [effectiveDept, setEffectiveDept] = useState<string>('Computer Science & Engineering');
  const [determinerNote, setDeterminerNote] = useState<string>('');
  const [currentDifficulty, setCurrentDifficulty] = useState<'Beginner' | 'Intermediate' | 'Advanced'>(difficulty);
  const [difficultyNotice, setDifficultyNotice] = useState<string | null>(null);
  const [topicMastery, setTopicMastery] = useState<Record<string, TopicMasteryRecord>>({});

  // UI state
  const [answerText, setAnswerText] = useState<string>('');
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [submittingAnswer, setSubmittingAnswer] = useState<boolean>(false);
  const [lastEvaluation, setLastEvaluation] = useState<NLPAnswerEvaluation | null>(null);
  const [inputNotice, setInputNotice] = useState<string | null>(null);
  const [timeSpentSeconds, setTimeSpentSeconds] = useState<number>(0);
  const [showInspector, setShowInspector] = useState<boolean>(false);
  const [showRestartModal, setShowRestartModal] = useState<boolean>(false);
  const [showEndModal, setShowEndModal] = useState<boolean>(false);
  const [skipWarningActive, setSkipWarningActive] = useState<boolean>(false);
  const [isSkippedView, setIsSkippedView] = useState<boolean>(false);
  const [skippedLearningExplanation, setSkippedLearningExplanation] = useState<string | null>(null);
  const [skippedLearningData, setSkippedLearningData] = useState<SkippedQuestionLearningData | null>(null);

  // Continuous Practice Set Engine State (Requirements 4, 10 & 11)
  const [currentSetNumber, setCurrentSetNumber] = useState<number>(1);
  const [isSetCompleted, setIsSetCompleted] = useState<boolean>(false);
  const [currentSetSummary, setCurrentSetSummary] = useState<TechnicalPracticeSetSummary | null>(null);
  const [skillDashboard, setSkillDashboard] = useState<SkillWiseProgressDashboardData | null>(null);
  const [showDashboardModal, setShowDashboardModal] = useState<boolean>(false);

  // Screen sharing state
  const [screenStream, setScreenStream] = useState<MediaStream | null>(null);
  const [isScreenSharing, setIsScreenSharing] = useState<boolean>(false);
  const [screenShareError, setScreenShareError] = useState<string | null>(null);
  const screenVideoRef = useRef<HTMLVideoElement | null>(null);

  // Telemetry from webcam feed
  const [telemetry, setTelemetry] = useState({ eyeContact: 92, confidence: 90, emotion: 'Confident' });

  // Web Speech Recognition instance
  const [recognition, setRecognition] = useState<any>(null);

  // Initialize Speech Recognition
  useEffect(() => {
    if (typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const rec = new SpeechRecognition();
      rec.continuous = true;
      rec.interimResults = true;
      rec.lang = 'en-US';

      rec.onresult = (event: any) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        setAnswerText(transcript);
        setInputNotice(null);
      };

      rec.onerror = (err: any) => {
        console.warn('Speech recognition warning:', err);
        setIsRecording(false);
      };

      rec.onend = () => {
        setIsRecording(false);
      };

      setRecognition(rec);
    }
  }, []);

  // Initialize or reconfigure NLP Interview Engine
  useEffect(() => {
    const engine = new FrontendNLPTechnicalInterviewEngine({
      resume: parsedResume,
      profileDepartment,
      targetDepartment,
      difficulty,
      questionCount: 4,
    });
    engineRef.current = engine;

    const state = engine.getState();
    setQuestions(state.questions);
    setCurrentIndex(state.currentIndex);
    setCurrentQuestion(state.currentQuestion);
    setAnswersList(state.answers);
    setActiveFollowUp(state.activeFollowUp);
    setIsFollowUpActive(state.isFollowUpActive);
    setMatchAudit(state.matchAudit);
    setExtractedSkills(state.extractedNLP.extractedSkills);
    setEffectiveDept(state.extractedNLP.effectiveDepartment);
    setDeterminerNote(state.extractedNLP.departmentDeterminerNote);
    setCurrentDifficulty(state.difficulty);
    setTopicMastery(state.topicMastery);
    setCurrentSetNumber(state.currentSetNumber || 1);
    setIsSetCompleted(state.isSetCompleted || false);
    setCurrentSetSummary(state.currentSetSummary || null);
    setSkillDashboard(state.skillDashboard || null);

    setAnswerText('');
    setLastEvaluation(null);
    setSkipWarningActive(false);
    setIsSkippedView(false);
    setSkippedLearningExplanation(null);
    setSkippedLearningData(null);
    setTimeSpentSeconds(0);
    setDifficultyNotice(null);
  }, [parsedResume, profileDepartment, targetDepartment, difficulty]);

  // Handle screen video stream element attachment
  useEffect(() => {
    if (screenVideoRef.current && screenStream) {
      screenVideoRef.current.srcObject = screenStream;
    }
  }, [screenStream]);

  // Teardown screen stream on unmount
  useEffect(() => {
    return () => {
      if (screenStream) {
        screenStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [screenStream]);

  // Question active timer
  useEffect(() => {
    if (lastEvaluation) return;
    const timer = setInterval(() => {
      setTimeSpentSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [currentIndex, lastEvaluation, isFollowUpActive]);

  // Screen Sharing toggle handler
  const handleToggleScreenShare = async () => {
    if (isScreenSharing && screenStream) {
      screenStream.getTracks().forEach((track) => track.stop());
      setScreenStream(null);
      setIsScreenSharing(false);
      setScreenShareError(null);
    } else {
      try {
        setScreenShareError(null);
        const stream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: false,
        });

        setScreenStream(stream);
        setIsScreenSharing(true);

        stream.getVideoTracks()[0].onended = () => {
          setIsScreenSharing(false);
          setScreenStream(null);
        };
      } catch (err: any) {
        if (err.name !== 'NotAllowedError') {
          setScreenShareError('Screen sharing could not be started: ' + (err.message || 'Permission denied'));
        }
      }
    }
  };

  // Text-to-Speech audio reader
  const handleSpeakText = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.95;
      utterance.pitch = 1.0;
      window.speechSynthesis.speak(utterance);
    }
  };

  // Toggle voice recording
  const toggleMicRecording = () => {
    if (!recognition) {
      setInputNotice('Speech recognition is not supported in this browser. Please type your response below.');
      return;
    }

    if (isRecording) {
      recognition.stop();
      setIsRecording(false);
    } else {
      try {
        recognition.start();
        setIsRecording(true);
        setInputNotice(null);
      } catch (e) {
        console.warn('Speech recognition error:', e);
        setIsRecording(false);
      }
    }
  };

  // Submit Answer for local NLP evaluation
  const handleSubmitAnswer = () => {
    if (!answerText.trim()) {
      setInputNotice('Please provide a substantive technical answer via text, code, or microphone before submitting.');
      return;
    }
    setInputNotice(null);

    if (isRecording && recognition) {
      recognition.stop();
      setIsRecording(false);
    }

    setSubmittingAnswer(true);

    try {
      if (!engineRef.current) return;
      const { evaluation, followUp } = engineRef.current.submitAnswer(
        answerText,
        timeSpentSeconds,
        telemetry
      );

      const state = engineRef.current.getState();
      setAnswersList(state.answers);
      setLastEvaluation(evaluation);
      setActiveFollowUp(followUp);
      setCurrentDifficulty(state.difficulty);
      setTopicMastery(state.topicMastery);

      if (evaluation.difficultyAdjustment === 'promoted') {
        setDifficultyNotice(`🎉 Challenge Level Promoted to ${evaluation.adjustedDifficulty} based on strong technical accuracy (${evaluation.technicalAccuracyScore}%)!`);
      } else if (evaluation.difficultyAdjustment === 'demoted') {
        setDifficultyNotice(`Adaptive assistance: Challenge adjusted to ${evaluation.adjustedDifficulty} to reinforce core foundational principles.`);
      } else {
        setDifficultyNotice(null);
      }
    } catch (err) {
      console.error('Error submitting answer:', err);
    } finally {
      setSubmittingAnswer(false);
    }
  };

  // Submit solution from CodingWorkspace
  const handleCodingSolutionSubmit = (
    code: string,
    language: SupportedLanguage,
    result: CodingExecutionResult
  ) => {
    setSubmittingAnswer(true);
    setInputNotice(null);

    try {
      if (!engineRef.current) return;
      const { evaluation, followUp } = engineRef.current.submitCodingSolution(
        code,
        language,
        result,
        timeSpentSeconds
      );

      const state = engineRef.current.getState();
      setAnswersList(state.answers);
      setLastEvaluation(evaluation);
      setActiveFollowUp(followUp);
      setCurrentDifficulty(state.difficulty);
      setTopicMastery(state.topicMastery);

      if (evaluation.difficultyAdjustment === 'promoted') {
        setDifficultyNotice(`🎉 Challenge Level Promoted to ${evaluation.adjustedDifficulty} based on passed test cases!`);
      } else {
        setDifficultyNotice(null);
      }
    } catch (err) {
      console.error('Error submitting code solution:', err);
    } finally {
      setSubmittingAnswer(false);
    }
  };

  // Activate adaptive follow-up question
  const handleStartFollowUp = () => {
    if (!engineRef.current || !activeFollowUp) return;
    engineRef.current.activateFollowUp();
    setIsFollowUpActive(true);
    setLastEvaluation(null);
    setSkipWarningActive(false);
    setIsSkippedView(false);
    setSkippedLearningExplanation(null);
    setSkippedLearningData(null);
    setAnswerText('');
    setTimeSpentSeconds(0);
    setDifficultyNotice(null);
  };

  // Trigger skip question warning notification in side panel (Requirement 1 & 4)
  const handleRequestSkip = () => {
    // If question is already skipped, do not show warning again
    if (isSkippedView) return;
    setSkipWarningActive(true);
  };

  // Cancel skip warning - dismisses warning and leaves question untouched (Requirement 4)
  const handleCancelSkipWarning = () => {
    setSkipWarningActive(false);
  };

  // Confirm skip - marks 0 marks, shows correct answer and explanation in side panel (Requirement 2 & 3)
  const handleConfirmSkipQuestion = () => {
    if (!engineRef.current) return;
    setSkipWarningActive(false);
    if (isRecording && recognition) {
      recognition.stop();
      setIsRecording(false);
    }
    const { evaluation, learningExplanation, learningData } = engineRef.current.skipQuestion(timeSpentSeconds);
    const state = engineRef.current.getState();
    setAnswersList(state.answers);
    setLastEvaluation(evaluation);
    setIsSkippedView(true);
    setSkippedLearningExplanation(learningExplanation);
    setSkippedLearningData(learningData);
    setTopicMastery(state.topicMastery);
  };

  // Proceed to next question or conclude interview
  const handleProceedNext = () => {
    if (!engineRef.current) return;
    const { hasNext, nextQuestion, isComplete, isSetCompleted: setDone } = engineRef.current.advanceNext();

    const state = engineRef.current.getState();
    setAnswersList(state.answers);
    setTopicMastery(state.topicMastery);
    setSkillDashboard(state.skillDashboard || null);

    // If set of 4 has finished, display the Set Completed screen (Requirement 4)
    if (setDone) {
      setIsSetCompleted(true);
      setCurrentSetSummary(state.currentSetSummary);
      setLastEvaluation(null);
      setSkipWarningActive(false);
      setIsSkippedView(false);
      setSkippedLearningExplanation(null);
      setSkippedLearningData(null);
      return;
    }

    if (isComplete || !hasNext || !nextQuestion) {
      handleFinishInterview();
      return;
    }

    setCurrentIndex(state.currentIndex);
    setCurrentQuestion(nextQuestion);
    setIsFollowUpActive(false);
    setActiveFollowUp(null);
    setLastEvaluation(null);
    setSkipWarningActive(false);
    setIsSkippedView(false);
    setSkippedLearningExplanation(null);
    setSkippedLearningData(null);
    setAnswerText('');
    setTimeSpentSeconds(0);
    setDifficultyNotice(null);
  };

  // Start next 4 questions (Set 2: Q5-8, Set 3: Q9-12, etc.)
  const handleStartNextFourQuestions = () => {
    if (!engineRef.current) return;
    const { questions: updatedQuestions, setNumber, currentQuestion: newQ } = engineRef.current.startNextSet();
    const state = engineRef.current.getState();
    setQuestions(updatedQuestions);
    setCurrentSetNumber(setNumber);
    setCurrentIndex(state.currentIndex);
    setCurrentQuestion(newQ);
    setIsSetCompleted(false);
    setCurrentSetSummary(null);
    setLastEvaluation(null);
    setSkipWarningActive(false);
    setIsSkippedView(false);
    setSkippedLearningExplanation(null);
    setSkippedLearningData(null);
    setAnswerText('');
    setTimeSpentSeconds(0);
    setCurrentDifficulty(state.difficulty);
    setTopicMastery(state.topicMastery);
    setSkillDashboard(state.skillDashboard || null);
  };

  // Conclude interview and view final scorecard
  const handleFinishInterview = () => {
    if (!engineRef.current) return;
    const finalSession = engineRef.current.completeSession();
    onCompleteInterview(finalSession);
    if (onContinueNextRound) {
      onContinueNextRound();
    } else {
      onNavigate('report');
    }
  };

  // Restart Interview without losing resume
  const handleRestart = () => {
    if (!engineRef.current) return;
    const newState = engineRef.current.restartSession();
    setCurrentIndex(newState.currentIndex);
    setCurrentQuestion(newState.currentQuestion);
    setAnswersList([]);
    setIsFollowUpActive(false);
    setActiveFollowUp(null);
    setLastEvaluation(null);
    setSkipWarningActive(false);
    setIsSkippedView(false);
    setSkippedLearningExplanation(null);
    setSkippedLearningData(null);
    setAnswerText('');
    setTimeSpentSeconds(0);
    setDifficultyNotice(null);
    setCurrentDifficulty(newState.difficulty);
    setTopicMastery({});
    setShowRestartModal(false);
  };

  // Conclude interview early
  const handleEndEarly = () => {
    if (!engineRef.current) return;
    const finalSession = engineRef.current.completeSession();
    setShowEndModal(false);
    onCompleteInterview(finalSession);
    if (onContinueNextRound) {
      onContinueNextRound();
    } else {
      onNavigate('report');
    }
  };

  // Fallback view if no resume is uploaded
  if (!parsedResume) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 animate-fade-in space-y-6">
        <div className="p-8 rounded-3xl bg-slate-900 border border-slate-800 text-center space-y-5 shadow-2xl">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center mx-auto border border-amber-500/30">
            <AlertCircle className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-2xl font-extrabold text-white">No Resume Uploaded Yet</h2>
            <p className="text-sm text-slate-400 mt-2 max-w-lg mx-auto leading-relaxed">
              The NLP Question Matcher generates questions by analyzing the exact technical keywords, tools, and projects in your resume.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-left max-w-lg mx-auto text-xs space-y-2">
            <div className="flex items-center space-x-2 text-indigo-400 font-semibold">
              <Info className="w-4 h-4" />
              <span>How Question Matching Works</span>
            </div>
            <p className="text-slate-300">
              When you upload a resume (e.g. Computer Science with Python & Flask, Mechanical with AutoCAD & ANSYS, EEE with Transformers & Power Electronics, or Civil with STAAD.Pro), the system computes TF-IDF similarity vectors to select tailored questions without cross-department mixing.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => onNavigate('resume')}
              className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition-all shadow-lg shadow-indigo-600/25 flex items-center space-x-2 cursor-pointer"
            >
              <FileText className="w-4 h-4" />
              <span>Go to Resume Parser (Upload Resume)</span>
            </button>
            <button
              type="button"
              onClick={() => onNavigate('interview')}
              className="px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition-all border border-slate-700 cursor-pointer"
            >
              <span>Back to Selection</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  const currentDisplayQuestion = isFollowUpActive && activeFollowUp
    ? activeFollowUp.question
    : currentQuestion?.question || 'No question available';

  const currentDisplayTopic = isFollowUpActive && activeFollowUp
    ? activeFollowUp.topic
    : currentQuestion
    ? `${currentQuestion.topic} • ${currentQuestion.subtopic}`
    : 'Technical Domain';

  const currentDisplaySkill = isFollowUpActive && activeFollowUp
    ? currentQuestion?.skill || 'Technical Skills'
    : currentQuestion?.skill || 'Core Fundamentals';

  const progressPct = questions.length > 0 ? Math.round(((currentIndex + 1) / questions.length) * 100) : 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 animate-fade-in">
      {/* =========================================================================
          1. HEADER PANEL & DEPARTMENT EXPLANATION
      ========================================================================= */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950/70 to-slate-900 border border-slate-800 shadow-2xl relative overflow-hidden">
        {/* Glow accent */}
        <div className="absolute -top-24 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 relative z-10">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-xs font-semibold">
                <BrainCircuit className="w-3.5 h-3.5" />
                <span>Frontend NLP Engine Prototype</span>
              </span>
              <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-semibold">
                TF-IDF Cosine Match
              </span>
              <span className={`text-xs px-2.5 py-1 rounded-full font-mono font-semibold transition-all ${
                currentDifficulty === 'Advanced'
                  ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                  : currentDifficulty === 'Intermediate'
                  ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                  : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
              }`}>
                Active Level: {currentDifficulty}
              </span>
              {currentDifficulty !== difficulty && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-mono">
                  Adaptive Adjusted
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center space-x-3">
              <span>Technical Interview Round</span>
            </h1>

            {/* Department Source Explanation */}
            <div className="text-xs text-slate-300 flex flex-wrap items-center gap-x-2 gap-y-1 pt-1">
              <span>Candidate: <strong className="text-white">{parsedResume.fullName}</strong></span>
              <span className="text-slate-600">•</span>
              <span>
                Target Interview Department: <strong className="text-indigo-400">{effectiveDept}</strong>
              </span>
              <span className="text-slate-600">•</span>
              <span>
                Detected Resume Department: <span className="text-emerald-400 font-semibold">{parsedResume.department}</span>
              </span>
            </div>

            <p className="text-[11px] text-indigo-300/90 italic pt-0.5">
              💡 {determinerNote}
            </p>

            {/* Dynamic Difficulty Promotion/Demotion Banner */}
            {difficultyNotice && (
              <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center space-x-2 animate-fade-in mt-1">
                <TrendingUp className="w-4 h-4 text-amber-400 flex-shrink-0" />
                <span>{difficultyNotice}</span>
              </div>
            )}
          </div>

          {/* Controls: Screen Share, Inspector, Restart, End */}
          <div className="flex flex-wrap items-center gap-2 self-start lg:self-center">
            {/* Screen Share Button */}
            <button
              type="button"
              onClick={handleToggleScreenShare}
              className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-all cursor-pointer shadow-sm border ${
                isScreenSharing
                  ? 'bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border-rose-500/40 animate-pulse'
                  : 'bg-slate-950 hover:bg-slate-800 text-slate-300 border-slate-800'
              }`}
              title="Share entire screen or window for technical code explanation"
            >
              <Monitor className="w-3.5 h-3.5 text-indigo-400" />
              <span>{isScreenSharing ? 'Stop Screen Share' : 'Share Screen (Optional)'}</span>
            </button>

            <button
              type="button"
              onClick={() => setShowInspector(!showInspector)}
              className="px-3 py-2 rounded-xl bg-slate-950 hover:bg-slate-800 border border-indigo-500/30 text-indigo-300 text-xs font-semibold flex items-center space-x-1.5 transition-all cursor-pointer shadow-sm"
              title="Inspect NLP Cosine Similarity & TF-IDF vector matching details"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-indigo-400" />
              <span>NLP Inspector</span>
            </button>

            <button
              type="button"
              onClick={() => setShowRestartModal(true)}
              className="px-3 py-2 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 text-xs font-semibold flex items-center space-x-1.5 transition-all cursor-pointer"
              title="Restart session without losing uploaded resume"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
              <span>Restart</span>
            </button>

            <button
              type="button"
              onClick={() => setShowEndModal(true)}
              className="px-3 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-300 text-xs font-semibold flex items-center space-x-1.5 transition-all cursor-pointer"
            >
              <span>End Interview</span>
            </button>
          </div>
        </div>

        {/* Screen share error notice */}
        {screenShareError && (
          <div className="mt-3 p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
            <span>{screenShareError}</span>
          </div>
        )}

        {/* Extracted Skills Chips */}
        {extractedSkills.length > 0 && (
          <div className="mt-4 pt-4 border-t border-slate-800/80 flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] text-slate-400 font-semibold mr-1">Extracted Resume Skills:</span>
            {extractedSkills.map((skill, idx) => (
              <span
                key={idx}
                className="text-[11px] px-2.5 py-0.5 rounded-lg bg-slate-950 text-indigo-300 border border-slate-800 font-mono"
              >
                {skill}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* =========================================================================
          2. PROGRESS BAR & PRACTICE SET INDICATOR
      ========================================================================= */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2.5">
          <span className="px-2.5 py-1 rounded-lg bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-bold font-mono">
            Set {currentSetNumber}
          </span>
          <span className="text-xs font-bold text-white uppercase tracking-wider font-mono">
            Question {currentIndex + 1} of {questions.length}
            <span className="text-slate-400 font-normal ml-1.5">
              (Q{(currentIndex % 4) + 1} of 4 in Set {currentSetNumber})
            </span>
          </span>
          {isFollowUpActive && (
            <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 text-[10px] font-bold">
              Follow-Up Drill-Down Active
            </span>
          )}
          {currentQuestion?.questionType === 'coding' && (
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold flex items-center space-x-1">
              <Code2 className="w-3 h-3" />
              <span>In-Browser Coding</span>
            </span>
          )}
          {currentQuestion?.diagram && (
            <span className="px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 text-[10px] font-bold flex items-center space-x-1">
              <Layers className="w-3 h-3" />
              <span>Domain Diagram Analysis</span>
            </span>
          )}
          <div className="flex items-center space-x-1 text-slate-400 text-xs font-mono ml-auto sm:ml-0">
            <Clock className="w-3.5 h-3.5 text-indigo-400" />
            <span>{timeSpentSeconds}s</span>
          </div>
        </div>

        <div className="flex items-center space-x-3 w-full sm:w-auto">
          <button
            type="button"
            onClick={() => setShowDashboardModal(true)}
            className="px-3 py-1.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 text-xs font-bold flex items-center space-x-1.5 transition-colors cursor-pointer"
            title="View Skill-Wise Continuous Practice Dashboard"
          >
            <TrendingUp className="w-3.5 h-3.5 text-purple-400" />
            <span>Skill Dashboard</span>
          </button>

          <div className="w-full sm:w-44 bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800">
            <div
              className="bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 h-2 transition-all duration-300"
              style={{ width: `${progressPct}%` }}
            />
          </div>
          <span className="text-xs font-bold text-slate-400 font-mono">{progressPct}%</span>
        </div>
      </div>

      {/* =========================================================================
          3. MAIN INTERVIEW WORKSPACE: QUESTION & CANDIDATE RESPONSE
      ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Question Card & Answer Workspace (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {isSetCompleted ? (
            <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-indigo-500/30 space-y-6 shadow-2xl relative overflow-hidden animate-fade-in">
              <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
              
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
                <div className="space-y-1.5">
                  <div className="flex items-center space-x-2">
                    <span className="px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-bold tracking-wide uppercase">
                      Set {currentSetSummary?.setNumber || currentSetNumber} Completed
                    </span>
                    <span className="text-xs text-slate-400 font-mono">
                      4 of 4 Questions Evaluated
                    </span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-extrabold text-white">
                    Set {currentSetSummary?.setNumber || currentSetNumber} Completed — Ready for More Practice?
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                    You have finished this set of 4 questions. Your performance has been evaluated below. Continue with the next set of 4 questions to practice new concepts and department fundamentals without repeating questions!
                  </p>
                </div>

                <div className="flex items-center space-x-3 self-start sm:self-center">
                  <div className="px-4 py-3 rounded-2xl bg-slate-950 border border-slate-800 text-center">
                    <div className="text-[10px] uppercase font-bold text-slate-400">Set Score</div>
                    <div className="text-2xl font-black text-indigo-400">
                      {currentSetSummary?.setScore ?? 0}%
                    </div>
                  </div>
                  <div className="px-4 py-3 rounded-2xl bg-slate-950 border border-slate-800 text-center">
                    <div className="text-[10px] uppercase font-bold text-slate-400">Overall Score</div>
                    <div className="text-2xl font-black text-purple-400">
                      {skillDashboard?.overallTechnicalScore ?? currentSetSummary?.setScore ?? 0}%
                    </div>
                  </div>
                </div>
              </div>

              {/* 5 Metric Badges (Attempted, Correct, Partial, Incorrect, Skipped) */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-center">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Attempted</span>
                  <div className="text-lg font-black text-white">{currentSetSummary?.questionsAttempted ?? 4}</div>
                </div>
                <div className="p-3 rounded-xl bg-slate-950 border border-emerald-500/20 text-center">
                  <span className="text-[10px] font-bold text-emerald-400 uppercase">Correct</span>
                  <div className="text-lg font-black text-emerald-400">{currentSetSummary?.correctAnswers ?? 0}</div>
                </div>
                <div className="p-3 rounded-xl bg-slate-950 border border-blue-500/20 text-center">
                  <span className="text-[10px] font-bold text-blue-400 uppercase">Partially Correct</span>
                  <div className="text-lg font-black text-blue-400">{currentSetSummary?.partiallyCorrectAnswers ?? 0}</div>
                </div>
                <div className="p-3 rounded-xl bg-slate-950 border border-rose-500/20 text-center">
                  <span className="text-[10px] font-bold text-rose-400 uppercase">Incorrect</span>
                  <div className="text-lg font-black text-rose-400">{currentSetSummary?.incorrectAnswers ?? 0}</div>
                </div>
                <div className="p-3 rounded-xl bg-slate-950 border border-amber-500/20 text-center col-span-2 sm:col-span-1">
                  <span className="text-[10px] font-bold text-amber-400 uppercase">Skipped (0 pts)</span>
                  <div className="text-lg font-black text-amber-400">{currentSetSummary?.skippedQuestions ?? 0}</div>
                </div>
              </div>

              {/* Skills Tested in this Set */}
              <div className="space-y-2 bg-slate-950 p-4 rounded-2xl border border-slate-800">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-300 uppercase tracking-wide flex items-center space-x-1.5">
                    <Target className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Skills Tested in Set {currentSetSummary?.setNumber || currentSetNumber}</span>
                  </span>
                  <span className="text-[11px] text-slate-400">{currentSetSummary?.skillsTested?.length || 0} Skills</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {currentSetSummary?.skillsTested?.map((skill, sIdx) => (
                    <span key={sIdx} className="px-3 py-1 rounded-lg bg-indigo-500/10 border border-indigo-500/30 text-xs font-semibold text-indigo-300">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Improvement Recommendations for this set */}
              {currentSetSummary?.improvements && currentSetSummary.improvements.length > 0 && (
                <div className="space-y-2 bg-slate-950 p-4 rounded-2xl border border-amber-500/20">
                  <span className="text-xs font-bold text-amber-400 uppercase tracking-wide flex items-center space-x-1.5">
                    <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
                    <span>Targeted Improvement Recommendations</span>
                  </span>
                  <ul className="space-y-1.5">
                    {currentSetSummary.improvements.map((rec, rIdx) => (
                      <li key={rIdx} className="text-xs text-slate-300 flex items-start space-x-2">
                        <span className="text-amber-400 font-bold">•</span>
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Category Performance Breakdown Preview */}
              {skillDashboard && (
                <div className="space-y-2 bg-slate-950 p-4 rounded-2xl border border-slate-800">
                  <span className="text-xs font-bold text-slate-300 uppercase tracking-wide flex items-center space-x-1.5">
                    <TrendingUp className="w-3.5 h-3.5 text-purple-400" />
                    <span>Continuous Practice Skill Breakdown</span>
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                    {skillDashboard.codingPerformance && (
                      <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between text-xs">
                        <span className="text-slate-300 font-medium">Coding & Implementation</span>
                        <span className={`font-bold font-mono ${skillDashboard.codingPerformance.averageScore >= 70 ? 'text-emerald-400' : 'text-amber-400'}`}>
                          {skillDashboard.codingPerformance.averageScore}% ({skillDashboard.codingPerformance.status})
                        </span>
                      </div>
                    )}
                    {skillDashboard.sqlPerformance && (
                      <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between text-xs">
                        <span className="text-slate-300 font-medium">SQL & Database Systems</span>
                        <span className={`font-bold font-mono ${skillDashboard.sqlPerformance.averageScore >= 70 ? 'text-emerald-400' : 'text-amber-400'}`}>
                          {skillDashboard.sqlPerformance.averageScore}% ({skillDashboard.sqlPerformance.status})
                        </span>
                      </div>
                    )}
                    {skillDashboard.dsaPerformance && (
                      <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between text-xs">
                        <span className="text-slate-300 font-medium">Data Structures & Algos</span>
                        <span className={`font-bold font-mono ${skillDashboard.dsaPerformance.averageScore >= 70 ? 'text-emerald-400' : 'text-amber-400'}`}>
                          {skillDashboard.dsaPerformance.averageScore}% ({skillDashboard.dsaPerformance.status})
                        </span>
                      </div>
                    )}
                    {skillDashboard.aimlPerformance && (
                      <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between text-xs">
                        <span className="text-slate-300 font-medium">AI & Machine Learning</span>
                        <span className={`font-bold font-mono ${skillDashboard.aimlPerformance.averageScore >= 70 ? 'text-emerald-400' : 'text-amber-400'}`}>
                          {skillDashboard.aimlPerformance.averageScore}% ({skillDashboard.aimlPerformance.status})
                        </span>
                      </div>
                    )}
                    {skillDashboard.departmentCorePerformance && (
                      <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between text-xs">
                        <span className="text-slate-300 font-medium">Department Core Fundamentals</span>
                        <span className={`font-bold font-mono ${skillDashboard.departmentCorePerformance.averageScore >= 70 ? 'text-emerald-400' : 'text-amber-400'}`}>
                          {skillDashboard.departmentCorePerformance.averageScore}% ({skillDashboard.departmentCorePerformance.status})
                        </span>
                      </div>
                    )}
                    {skillDashboard.resumeSkillPerformance && (
                      <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between text-xs">
                        <span className="text-slate-300 font-medium">Resume Technologies</span>
                        <span className={`font-bold font-mono ${skillDashboard.resumeSkillPerformance.averageScore >= 70 ? 'text-emerald-400' : 'text-amber-400'}`}>
                          {skillDashboard.resumeSkillPerformance.averageScore}% ({skillDashboard.resumeSkillPerformance.status})
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Prominent Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleStartNextFourQuestions}
                  className="w-full sm:flex-1 py-4 px-6 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-extrabold text-sm shadow-xl shadow-indigo-600/30 transition-all flex items-center justify-center space-x-2 cursor-pointer transform hover:-translate-y-0.5"
                >
                  <Sparkles className="w-5 h-5 text-amber-300 animate-spin" style={{ animationDuration: '4s' }} />
                  <span>Start Next 4 Questions (Set {(currentSetSummary?.setNumber || currentSetNumber) + 1})</span>
                  <ArrowRight className="w-5 h-5 ml-1" />
                </button>

                <button
                  type="button"
                  onClick={handleFinishInterview}
                  className="w-full sm:w-auto py-4 px-5 rounded-2xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-bold text-xs transition-colors cursor-pointer flex items-center justify-center space-x-2"
                >
                  <Award className="w-4 h-4 text-purple-400" />
                  <span>Finish & View Scorecard</span>
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Active Question Card */}
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl relative">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-bold text-indigo-400 flex items-center space-x-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{isFollowUpActive ? 'ADAPTIVE FOLLOW-UP' : `QUESTION #${currentIndex + 1}`}</span>
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-950 text-slate-300 border border-slate-800 font-mono">
                  {currentDisplayTopic}
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-300 border border-indigo-500/30 font-semibold">
                  Skill: {currentDisplaySkill}
                </span>
              </div>

              <button
                type="button"
                onClick={() => handleSpeakText(currentDisplayQuestion)}
                className="px-2.5 py-1 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-semibold flex items-center space-x-1 cursor-pointer transition-colors"
                title="Listen to question via Text-to-Speech"
              >
                <Volume2 className="w-3.5 h-3.5" />
                <span>Listen</span>
              </button>
            </div>

            <h2 className="text-lg sm:text-xl font-extrabold text-white leading-relaxed">
              "{currentDisplayQuestion}"
            </h2>

            {/* Embedded Interactive Technical Diagram if present */}
            {!isFollowUpActive && currentQuestion?.diagram && (
              <DiagramViewer diagram={currentQuestion.diagram} questionTitle={currentQuestion.question} />
            )}

            {/* Why This Question Matched */}
            {!isFollowUpActive && currentQuestion && (
              <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80 text-xs space-y-1">
                <div className="flex items-center space-x-1.5 text-indigo-300 font-semibold text-[11px]">
                  <Zap className="w-3.5 h-3.5 text-amber-400" />
                  <span>NLP Relevance Match Rationale:</span>
                </div>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  {currentQuestion.explanation}
                </p>
              </div>
            )}
          </div>

          {/* Interactive In-Browser Coding Workspace (When question is coding challenge) */}
          {!isFollowUpActive && currentQuestion?.questionType === 'coding' && currentQuestion?.codingProblem && !lastEvaluation && !isSkippedView && (
            <CodingWorkspace
              problem={currentQuestion.codingProblem}
              onSubmitSolution={handleCodingSolutionSubmit}
              isSubmitting={submittingAnswer}
              onSkip={handleRequestSkip}
            />
          )}

          {/* Question Skipped Status Banner in Left Column */}
          {isSkippedView && (
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-fade-in shadow-lg">
              <div className="flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0" />
                <span className="font-medium text-slate-200">
                  Question marked as <strong className="text-amber-400">Skipped (0 marks)</strong>. View the Correct Answer, Step-by-Step Explanation, and Important Concepts in the side learning panel.
                </span>
              </div>
              <button
                type="button"
                onClick={handleProceedNext}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold text-xs shadow-md transition-all flex items-center space-x-1.5 cursor-pointer flex-shrink-0 self-start sm:self-auto"
              >
                <span>Continue to Next Question</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Candidate Evaluation Card (Visible after normal submission) */}
          {lastEvaluation && !isSkippedView ? (
            <div className="p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950/80 to-slate-900 border border-indigo-500/40 space-y-5 shadow-2xl animate-fade-in">
              <div className="flex flex-wrap items-center justify-between border-b border-slate-800 pb-3 gap-2">
                <div className="flex items-center space-x-2 text-xs font-bold text-emerald-400">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>NLP SEMANTIC ANSWER EVALUATION & RUBRIC</span>
                </div>
                <span className={`text-xs px-3 py-1 rounded-full font-bold font-mono border ${
                  lastEvaluation.technicalAccuracyScore >= 85
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                    : lastEvaluation.technicalAccuracyScore >= 65
                    ? 'bg-blue-500/20 text-blue-300 border-blue-500/30'
                    : lastEvaluation.technicalAccuracyScore >= 45
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                    : 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                }`}>
                  {lastEvaluation.evaluationBand || lastEvaluation.overallRating}
                </span>
              </div>

              {/* Overall Score & Multi-Factor Rubric Breakdown */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">Multi-Factor Rubric Score:</span>
                  <span className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 font-mono">
                    {lastEvaluation.technicalAccuracyScore} / 100
                  </span>
                </div>

                {lastEvaluation.rubricBreakdown && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
                    <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                      <p className="text-[10px] text-slate-400 font-medium">Correctness (40%)</p>
                      <p className="text-base font-extrabold text-blue-400 font-mono mt-0.5">
                        {lastEvaluation.rubricBreakdown.technicalCorrectness.weightedPoints} / {lastEvaluation.rubricBreakdown.technicalCorrectness.maxPoints} pts
                      </p>
                      <p className="text-[9px] text-slate-500 mt-0.5">{lastEvaluation.rubricBreakdown.technicalCorrectness.score}% grade</p>
                    </div>

                    <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                      <p className="text-[10px] text-slate-400 font-medium">Coverage (30%)</p>
                      <p className="text-base font-extrabold text-emerald-400 font-mono mt-0.5">
                        {lastEvaluation.rubricBreakdown.essentialCoverage.weightedPoints} / {lastEvaluation.rubricBreakdown.essentialCoverage.maxPoints} pts
                      </p>
                      <p className="text-[9px] text-slate-500 mt-0.5">{lastEvaluation.rubricBreakdown.essentialCoverage.score}% grade</p>
                    </div>

                    <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                      <p className="text-[10px] text-slate-400 font-medium">Semantic (20%)</p>
                      <p className="text-base font-extrabold text-purple-400 font-mono mt-0.5">
                        {lastEvaluation.rubricBreakdown.relevanceSemantic.weightedPoints} / {lastEvaluation.rubricBreakdown.relevanceSemantic.maxPoints} pts
                      </p>
                      <p className="text-[9px] text-slate-500 mt-0.5">{lastEvaluation.rubricBreakdown.relevanceSemantic.score}% grade</p>
                    </div>

                    <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                      <p className="text-[10px] text-slate-400 font-medium">Reasoning (10%)</p>
                      <p className="text-base font-extrabold text-amber-400 font-mono mt-0.5">
                        {lastEvaluation.rubricBreakdown.reasoningAndClarity.weightedPoints} / {lastEvaluation.rubricBreakdown.reasoningAndClarity.maxPoints} pts
                      </p>
                      <p className="text-[9px] text-slate-500 mt-0.5">{lastEvaluation.rubricBreakdown.reasoningAndClarity.score}% grade</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Misconception Penalties Callout (If any false claims were detected) */}
              {lastEvaluation.misconceptionsDetected && lastEvaluation.misconceptionsDetected.length > 0 && (
                <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/40 text-rose-200 text-xs space-y-2 animate-fade-in">
                  <div className="flex items-center space-x-2 text-rose-400 font-bold">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>Technical Mistake / Misconception Detected</span>
                  </div>
                  {lastEvaluation.misconceptionsDetected.map((p, pIdx) => (
                    <div key={pIdx} className="p-2.5 rounded-xl bg-slate-950/80 border border-rose-500/20 space-y-1">
                      <div className="flex items-center justify-between font-mono text-[11px]">
                        <span className="text-rose-300 font-bold">Statement: "{p.detectedSnippet}"</span>
                        <span className="text-rose-400 font-bold bg-rose-500/20 px-2 py-0.5 rounded">-{p.penaltyPoints} Points</span>
                      </div>
                      <p className="text-slate-300 text-[11px] leading-relaxed">
                        <strong>Why incorrect:</strong> {p.whyIncorrect}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {/* Coding execution result summary if applicable */}
              {lastEvaluation.codingResult && (
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-300 flex items-center space-x-1.5">
                      <Code2 className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Coding Solution Evaluation ({lastEvaluation.codingResult.language.toUpperCase()}):</span>
                    </span>
                    <span className="text-emerald-400 font-mono font-bold text-[11px]">
                      Passed {lastEvaluation.codingResult.passedCount}/{lastEvaluation.codingResult.totalCount} Test Cases
                    </span>
                  </div>
                  <div className="font-mono text-[11px] text-slate-400">
                    Complexity: Time <strong className="text-indigo-400">{lastEvaluation.codingResult.timeComplexityAnalysis}</strong> • Space <strong className="text-indigo-400">{lastEvaluation.codingResult.spaceComplexityAnalysis}</strong>
                  </div>
                </div>
              )}

              {/* Concepts Correctly Explained vs Missing */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                {/* Covered Concepts */}
                <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                  <p className="font-bold text-emerald-400 uppercase tracking-wider text-[10px] flex items-center space-x-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Concepts Correctly Explained</span>
                  </p>
                  {lastEvaluation.conceptsCorrect && lastEvaluation.conceptsCorrect.length > 0 ? (
                    <div className="space-y-1.5">
                      {lastEvaluation.conceptsCorrect.map((c, idx) => (
                        <div key={idx} className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 space-y-0.5">
                          <p className="font-bold text-emerald-300 text-[11px]">✓ {c.name}</p>
                          {c.isAlternativeMatch && (
                            <span className="text-[10px] text-indigo-300 font-mono italic block">
                              Accepted alternative formulation
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : lastEvaluation.keywordCoverage?.found.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {lastEvaluation.keywordCoverage.found.map((kw, idx) => (
                        <span key={idx} className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 text-[10px] font-mono">
                          ✓ {kw}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-slate-500 text-[11px] italic">No required concepts fully substantiated.</p>
                  )}
                </div>

                {/* Missing Concepts */}
                <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                  <p className="font-bold text-amber-400 uppercase tracking-wider text-[10px] flex items-center space-x-1.5">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>Missing / Omitted Concepts</span>
                  </p>
                  {lastEvaluation.conceptsMissing && lastEvaluation.conceptsMissing.length > 0 ? (
                    <div className="space-y-1.5">
                      {lastEvaluation.conceptsMissing.map((m, idx) => (
                        <div key={idx} className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20 space-y-0.5">
                          <p className="font-bold text-amber-300 text-[11px]">○ {m.name}</p>
                          <p className="text-[10px] text-slate-400 leading-tight">{m.description}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-emerald-400 text-[11px] font-semibold">All essential technical concepts were addressed!</p>
                  )}
                </div>
              </div>

              {/* Scoring Audit Log (Explaining points awarded/deducted) */}
              {lastEvaluation.scoringAuditExplanation && lastEvaluation.scoringAuditExplanation.length > 0 && (
                <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-[11px] space-y-1 font-mono text-slate-400">
                  <p className="font-bold text-indigo-300 uppercase tracking-wider text-[10px]">Scoring Audit Rationale:</p>
                  {lastEvaluation.scoringAuditExplanation.map((line, lIdx) => (
                    <p key={lIdx} className="leading-relaxed">
                      • {line}
                    </p>
                  ))}
                </div>
              )}

              {/* Benchmark Improved Answer */}
              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1 text-xs">
                <p className="font-bold text-indigo-300 text-[11px]">Recommended Benchmark Answer:</p>
                <p className="text-slate-300 italic text-[11px] leading-relaxed">
                  "{lastEvaluation.sampleIdealAnswer}"
                </p>
              </div>

              {/* Remediation Guidance: What to Study Next & Recommended Practice Question */}
              {(currentQuestion?.whatToStudyNext || currentQuestion?.recommendedPracticeQuestion || (lastEvaluation.topicsToPractice && lastEvaluation.topicsToPractice.length > 0)) && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1.5">
                    <span className="font-bold text-emerald-400 text-[11px] uppercase tracking-wider flex items-center space-x-1">
                      <TrendingUp className="w-3.5 h-3.5" />
                      <span>What to Study Next</span>
                    </span>
                    <p className="text-slate-300 text-xs">
                      {currentQuestion?.whatToStudyNext || `Review core documentation and advanced patterns for ${currentQuestion?.skill || currentQuestion?.topic}.`}
                    </p>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1.5">
                    <span className="font-bold text-purple-400 text-[11px] uppercase tracking-wider flex items-center space-x-1">
                      <Target className="w-3.5 h-3.5" />
                      <span>Recommended Practice Question</span>
                    </span>
                    <p className="text-slate-300 text-xs">
                      {currentQuestion?.recommendedPracticeQuestion || `Build a minimal prototype or solve practical exercises testing ${currentQuestion?.skill || currentQuestion?.topic}.`}
                    </p>
                  </div>
                </div>
              )}

              {/* Adaptive Follow-Up Callout if available and not yet active */}
              {activeFollowUp && !isFollowUpActive && (
                <div className="p-4 rounded-2xl bg-purple-500/10 border border-purple-500/30 space-y-2">
                  <div className="flex items-center space-x-1.5 text-xs font-bold text-purple-300">
                    <CornerDownRight className="w-4 h-4 text-purple-400" />
                    <span>Adaptive Follow-Up Available</span>
                  </div>
                  <p className="text-xs text-slate-300 font-medium">
                    "{activeFollowUp.question}"
                  </p>
                  <div className="pt-1 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={handleStartFollowUp}
                      className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition-all shadow-md cursor-pointer flex items-center space-x-1"
                    >
                      <span>Answer Follow-Up Question</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={handleProceedNext}
                      className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer"
                    >
                      <span>Skip to Next Question</span>
                    </button>
                  </div>
                </div>
              )}


              {/* Next Question / Finish Button */}
              {(!activeFollowUp || isFollowUpActive) && (
                <button
                  type="button"
                  onClick={handleProceedNext}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold text-xs sm:text-sm shadow-xl shadow-indigo-600/25 transition-all flex items-center justify-center space-x-2 cursor-pointer"
                >
                  <span>
                    {currentIndex + 1 >= questions.length
                      ? 'Complete Interview & View Final Report'
                      : 'Next Technical Question'}
                  </span>
                  <ArrowRight className="w-4 h-4 ml-1" />
                </button>
              )}
            </div>
          ) : (
            /* Standard Text/Voice Answer Input Controls (Visible for non-coding questions before submission) */
            (currentQuestion?.questionType !== 'coding' || isFollowUpActive) && !isSkippedView && (
              <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                    Your Technical Answer
                  </label>
                  <button
                    type="button"
                    onClick={toggleMicRecording}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer ${
                      isRecording
                        ? 'bg-rose-500 text-white animate-pulse'
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                    }`}
                  >
                    {isRecording ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5 text-indigo-400" />}
                    <span>{isRecording ? 'Stop Recording' : 'Voice Input (Mic)'}</span>
                  </button>
                </div>

                {inputNotice && (
                  <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center space-x-2 animate-fade-in">
                    <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0" />
                    <span>{inputNotice}</span>
                  </div>
                )}

                <textarea
                  rows={6}
                  value={answerText}
                  onChange={(e) => setAnswerText(e.target.value)}
                  placeholder="Type your technical response here, or click 'Voice Input (Mic)' to speak... Detail your step-by-step calculations, design trade-offs, engineering standards, or troubleshooting methods."
                  className="w-full p-4 rounded-2xl bg-slate-950 border border-slate-800 text-slate-200 text-sm focus:border-indigo-500 focus:outline-none resize-none leading-relaxed font-sans"
                />

                <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono">
                  <span>Words: {answerText.trim() ? answerText.trim().split(/\s+/).length : 0}</span>
                  <span>Recommended: 30-120 words</span>
                </div>

                {/* Action Buttons: Submit, Skip */}
                <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={handleSubmitAnswer}
                    disabled={submittingAnswer || !answerText.trim()}
                    className="w-full sm:flex-1 py-3.5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold text-xs sm:text-sm shadow-lg shadow-indigo-600/25 transition-all flex items-center justify-center space-x-2 disabled:opacity-50 cursor-pointer"
                  >
                    <span>Submit Answer & Evaluate</span>
                    <Send className="w-4 h-4 ml-1" />
                  </button>

                  <button
                    type="button"
                    onClick={handleRequestSkip}
                    className="w-full sm:w-auto px-5 py-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition-all border border-slate-700 cursor-pointer"
                  >
                    <span>Skip Question</span>
                  </button>
                </div>
              </div>
            )
          )}
            </>
          )}
        </div>

        {/* Right Column: WebRTC Feed, Screen Share Preview & Queue (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Warning Notification in Side Panel (Requirement 1 & 4) */}
          {skipWarningActive && (
            <div className="p-5 rounded-3xl bg-slate-900 border-2 border-amber-500/70 space-y-3.5 shadow-2xl animate-fade-in ring-4 ring-amber-500/10">
              <div className="flex items-center space-x-2 text-amber-400 font-bold text-sm">
                <AlertCircle className="w-5 h-5 flex-shrink-0 animate-pulse text-amber-400" />
                <span>Warning: Skipping this question!</span>
              </div>
              <p className="text-xs text-slate-200 leading-relaxed font-normal">
                Are you sure you want to skip this question? You will not receive marks for this question. The correct answer and explanation will be displayed so you can learn.
              </p>
              <div className="flex items-center space-x-2.5 pt-1">
                <button
                  type="button"
                  onClick={handleConfirmSkipQuestion}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs shadow-md shadow-amber-600/30 transition-all cursor-pointer"
                >
                  Confirm Skip
                </button>
                <button
                  type="button"
                  onClick={handleCancelSkipWarning}
                  className="py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs border border-slate-700 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Skipped Question — Learning Mode in Side Panel (Requirement 2 & 3) */}
          {!skipWarningActive && isSkippedView && skippedLearningData && (
            <div className="p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950/50 to-slate-900 border border-indigo-500/50 space-y-4 shadow-2xl animate-fade-in">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center space-x-2 text-indigo-300 font-bold text-xs">
                  <Sparkles className="w-4 h-4 text-indigo-400" />
                  <span>Skipped Question — Learning Mode</span>
                </div>
                <span className="text-[10px] px-2.5 py-0.5 rounded-full font-bold font-mono border bg-amber-500/20 text-amber-300 border-amber-500/30">
                  0 Marks Awarded
                </span>
              </div>

              {/* Question */}
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Question</span>
                <p className="text-xs text-slate-200 font-medium leading-relaxed bg-slate-950 p-3 rounded-xl border border-slate-800">
                  {skippedLearningData.questionText}
                </p>
              </div>

              {/* Correct Answer */}
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider flex items-center space-x-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Correct Answer</span>
                </span>
                <div className="text-xs text-slate-200 leading-relaxed bg-slate-950 p-3.5 rounded-xl border border-emerald-500/30 whitespace-pre-line font-sans">
                  {skippedLearningData.correctAnswer}
                </div>
              </div>

              {/* Step-by-Step Explanation */}
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-bold text-indigo-300 tracking-wider flex items-center space-x-1">
                  <Info className="w-3.5 h-3.5" />
                  <span>Explanation</span>
                </span>
                <p className="text-xs text-slate-300 leading-relaxed bg-slate-950 p-3.5 rounded-xl border border-slate-800 whitespace-pre-line">
                  {skippedLearningData.explanation}
                </p>
              </div>

              {/* Important Concepts */}
              {skippedLearningData.importantConcepts && skippedLearningData.importantConcepts.length > 0 && (
                <div className="space-y-1.5">
                  <span className="text-[10px] uppercase font-bold text-amber-400 tracking-wider flex items-center space-x-1">
                    <Target className="w-3.5 h-3.5" />
                    <span>Important Concepts</span>
                  </span>
                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1.5">
                    {skippedLearningData.importantConcepts.map((concept, cIdx) => (
                      <div key={cIdx} className="flex items-start space-x-1.5 text-xs text-slate-300">
                        <span className="text-amber-400 font-bold">•</span>
                        <span>{concept}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Practical Example or Code Solution (when relevant) */}
              {skippedLearningData.exampleSolution && (
                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-bold text-cyan-400 tracking-wider flex items-center space-x-1">
                    <Code2 className="w-3.5 h-3.5" />
                    <span>Example / Code Solution</span>
                  </span>
                  <div className="bg-slate-950 p-3 rounded-xl border border-cyan-500/30 font-mono text-xs text-cyan-200 whitespace-pre-line overflow-x-auto max-h-56 leading-relaxed">
                    {skippedLearningData.exampleSolution}
                  </div>
                </div>
              )}

              {/* Continue to Next Question Button */}
              <button
                type="button"
                onClick={handleProceedNext}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/25 transition-all flex items-center justify-center space-x-2 cursor-pointer mt-2"
              >
                <span>
                  {currentIndex + 1 >= questions.length
                    ? 'Complete Interview & View Final Report'
                    : 'Continue to Next Question'}
                </span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </button>
            </div>
          )}

          {/* Live Webcam & Screen Sharing Panel */}
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                <Video className="w-4 h-4 text-indigo-400" />
                <span>Candidate Live Webcam & Telemetry</span>
              </h3>
              {isScreenSharing && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold flex items-center space-x-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  <span>Screen Active</span>
                </span>
              )}
            </div>

            {/* Webcam stream */}
            <WebcamFeed
              onTelemetryUpdate={(stats) => setTelemetry(stats)}
              showOverlayCanvas={true}
            />

            {/* Live Screen Share Video Preview (if sharing screen) */}
            {isScreenSharing && (
              <div className="rounded-2xl border border-indigo-500/30 overflow-hidden bg-slate-950 p-2 space-y-1.5 animate-fade-in">
                <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono px-1">
                  <span className="flex items-center space-x-1.5 text-indigo-300">
                    <Monitor className="w-3.5 h-3.5" />
                    <span>Candidate Screen Sharing Stream</span>
                  </span>
                  <button
                    type="button"
                    onClick={handleToggleScreenShare}
                    className="text-rose-400 hover:text-rose-300 text-[10px] font-bold cursor-pointer"
                  >
                    Stop
                  </button>
                </div>
                <video
                  ref={screenVideoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-32 object-cover rounded-xl bg-black border border-slate-800"
                />
              </div>
            )}

            {/* Ethical AI Notice (Explicitly transparent, zero deception claims) */}
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 text-[11px] space-y-1 text-slate-400">
              <div className="flex items-center space-x-1.5 text-emerald-400 font-semibold text-[10px]">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Ethical AI & Privacy Transparency Notice</span>
              </div>
              <p className="leading-relaxed">
                Camera and screen previews operate strictly client-side for realistic mock practice. CareerCurve does <strong>not</strong> compute facial deception metrics, psychological profiles, or pseudo-scientific emotion assessments.
              </p>
            </div>
          </div>

          {/* Topic Mastery Tracking Panel */}
          {Object.keys(topicMastery).length > 0 && (
            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-3 shadow-xl animate-fade-in">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center justify-between">
                <span>Domain Topic Mastery</span>
                <span className="text-[10px] text-indigo-400 font-mono">{effectiveDept}</span>
              </h4>

              <div className="space-y-2">
                {Object.values(topicMastery).map((tm) => (
                  <div key={tm.topic} className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs flex items-center justify-between">
                    <div>
                      <p className="font-bold text-slate-200 text-[11px]">{tm.topic}</p>
                      <p className="text-[10px] text-slate-400 font-mono">{tm.questionsAttempted} Attempted</p>
                    </div>
                    <div className="text-right">
                      <span className={`font-mono font-bold text-xs ${
                        tm.averageScore >= 80 ? 'text-emerald-400' : tm.averageScore >= 65 ? 'text-blue-400' : 'text-amber-400'
                      }`}>
                        {tm.averageScore}%
                      </span>
                      {tm.needsPractice && (
                        <p className="text-[9px] text-amber-400 font-bold uppercase">Needs Practice</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Session Question Queue Progress Card */}
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-3 shadow-xl">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center justify-between">
              <span>Interview Questions Queue</span>
              <span className="text-[10px] text-indigo-400 font-mono">{effectiveDept}</span>
            </h4>

            <div className="space-y-2">
              {questions.map((q, idx) => {
                const isCurrent = idx === currentIndex;
                const answer = answersList.find((a) => a.questionId === q.id);
                const isSkipped = answer?.isSkipped;
                const isAnswered = Boolean(answer && !answer.isSkipped);

                return (
                  <div
                    key={q.id}
                    className={`p-3 rounded-xl border text-xs transition-all ${
                      isCurrent
                        ? 'bg-indigo-600/10 border-indigo-500/50 text-white'
                        : isSkipped
                        ? 'bg-slate-950/60 border-amber-500/30 text-slate-300'
                        : isAnswered
                        ? 'bg-slate-950/60 border-emerald-500/30 text-slate-300'
                        : 'bg-slate-950/40 border-slate-850 text-slate-500'
                    }`}
                  >
                    <div className="flex items-center justify-between font-mono text-[10px] mb-1">
                      <span className="font-bold">
                        {idx + 1}. {q.skill} {q.questionType === 'coding' ? '(Coding)' : q.diagram ? '(Diagram)' : ''}
                      </span>
                      {isAnswered && (
                        <span className="text-emerald-400 font-semibold flex items-center space-x-0.5">
                          <Check className="w-3 h-3" />
                          <span>Answered</span>
                        </span>
                      )}
                      {isSkipped && (
                        <span className="text-amber-400 font-semibold flex items-center space-x-0.5">
                          <span>Skipped (0 pts)</span>
                        </span>
                      )}
                      {isCurrent && !answer && (
                        <span className="text-indigo-400 font-semibold animate-pulse">Active</span>
                      )}
                    </div>
                    <p className="line-clamp-1 text-[11px] text-slate-400 font-normal">
                      {q.question}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================================
          4. NLP MATCH INSPECTOR DRAWER / MODAL
      ========================================================================= */}
      {showInspector && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-3xl w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="p-5 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center space-x-2 text-indigo-400 font-bold text-sm">
                <SlidersHorizontal className="w-4 h-4" />
                <span>NLP Question Matching Audit & TF-IDF Scores</span>
              </div>
              <button
                type="button"
                onClick={() => setShowInspector(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-5 text-xs text-slate-300">
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                <p className="font-bold text-white text-sm">Matching Rationale</p>
                <p className="text-slate-400 text-xs leading-relaxed">
                  The frontend NLP matcher calculated TF-IDF feature vectors for your resume (weighted heavily on extracted skills and project descriptions) and computed Cosine Similarity against all candidate questions in <strong className="text-emerald-400">{effectiveDept}</strong>.
                </p>
                <p className="text-[11px] text-indigo-300">
                  {determinerNote}
                </p>
              </div>

              <div>
                <p className="font-bold text-white uppercase tracking-wider text-[11px] mb-3">
                  Department Question Rankings ({effectiveDept}):
                </p>
                <div className="space-y-3">
                  {matchAudit.map((item, idx) => (
                    <div
                      key={item.question.id}
                      className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-indigo-300 text-xs">
                          #{idx + 1} {item.question.skill} ({item.question.topic})
                        </span>
                        <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-mono font-bold text-[10px]">
                          Similarity Score: {item.score}
                        </span>
                      </div>
                      <p className="text-slate-200 text-xs">"{item.question.question}"</p>
                      <p className="text-[11px] text-slate-400 italic">
                        {item.relevanceExplanation}
                      </p>
                      {item.matchedKeywords.length > 0 && (
                        <div className="flex flex-wrap gap-1 pt-1">
                          <span className="text-[10px] text-slate-500">Overlapping Terms:</span>
                          {item.matchedKeywords.map((kw, i) => (
                            <span key={i} className="px-1.5 py-0.2 rounded bg-slate-900 border border-slate-800 text-[10px] text-slate-400 font-mono">
                              {kw}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-slate-800 bg-slate-950 flex justify-end">
              <button
                type="button"
                onClick={() => setShowInspector(false)}
                className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold cursor-pointer"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Restart Modal */}
      {showRestartModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 max-w-md w-full space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-white">Restart Technical Interview?</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              This will reset the question index and answers for this round. Your uploaded resume ({parsedResume.fileName || 'Current Resume'}) and extracted technical skills will be preserved.
            </p>
            <div className="flex items-center justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setShowRestartModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleRestart}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold cursor-pointer"
              >
                Confirm Restart
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Skill-Wise Continuous Practice Dashboard Modal (Requirement 10) */}
      {showDashboardModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 max-w-2xl w-full space-y-6 shadow-2xl relative my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Skill-Wise Technical Practice Dashboard</h3>
                  <p className="text-xs text-slate-400">Continuous learning progress across completed sets for {effectiveDept}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowDashboardModal(false)}
                className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* High-Level Summary Stats */}
            <div className="grid grid-cols-3 gap-3">
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-center">
                <span className="text-[10px] uppercase font-bold text-slate-400">Sets Completed</span>
                <div className="text-2xl font-black text-indigo-400 mt-1">{skillDashboard?.totalSetsCompleted ?? 0}</div>
              </div>
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-center">
                <span className="text-[10px] uppercase font-bold text-slate-400">Questions Attempted</span>
                <div className="text-2xl font-black text-white mt-1">{skillDashboard?.totalQuestionsAttempted ?? 0}</div>
              </div>
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-center">
                <span className="text-[10px] uppercase font-bold text-slate-400">Overall Score</span>
                <div className="text-2xl font-black text-purple-400 mt-1">{skillDashboard?.overallTechnicalScore ?? 0}%</div>
              </div>
            </div>

            {/* Department & Resume Relevant Skill Categories */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Department & Resume Skill Performance</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {skillDashboard?.codingPerformance && (
                  <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="text-slate-200">Coding & Implementation</span>
                      <span className={skillDashboard.codingPerformance.averageScore >= 70 ? 'text-emerald-400' : 'text-amber-400'}>
                        {skillDashboard.codingPerformance.averageScore}%
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400 flex items-center justify-between">
                      <span>Status: {skillDashboard.codingPerformance.status}</span>
                      <span>{skillDashboard.codingPerformance.attemptedCount} attempted</span>
                    </div>
                  </div>
                )}
                {skillDashboard?.sqlPerformance && (
                  <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="text-slate-200">SQL & Database Systems</span>
                      <span className={skillDashboard.sqlPerformance.averageScore >= 70 ? 'text-emerald-400' : 'text-amber-400'}>
                        {skillDashboard.sqlPerformance.averageScore}%
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400 flex items-center justify-between">
                      <span>Status: {skillDashboard.sqlPerformance.status}</span>
                      <span>{skillDashboard.sqlPerformance.attemptedCount} attempted</span>
                    </div>
                  </div>
                )}
                {skillDashboard?.dsaPerformance && (
                  <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="text-slate-200">Data Structures & Algorithms</span>
                      <span className={skillDashboard.dsaPerformance.averageScore >= 70 ? 'text-emerald-400' : 'text-amber-400'}>
                        {skillDashboard.dsaPerformance.averageScore}%
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400 flex items-center justify-between">
                      <span>Status: {skillDashboard.dsaPerformance.status}</span>
                      <span>{skillDashboard.dsaPerformance.attemptedCount} attempted</span>
                    </div>
                  </div>
                )}
                {skillDashboard?.aimlPerformance && (
                  <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="text-slate-200">AI & Machine Learning</span>
                      <span className={skillDashboard.aimlPerformance.averageScore >= 70 ? 'text-emerald-400' : 'text-amber-400'}>
                        {skillDashboard.aimlPerformance.averageScore}%
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400 flex items-center justify-between">
                      <span>Status: {skillDashboard.aimlPerformance.status}</span>
                      <span>{skillDashboard.aimlPerformance.attemptedCount} attempted</span>
                    </div>
                  </div>
                )}
                {skillDashboard?.departmentCorePerformance && (
                  <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="text-slate-200">Department Core Engineering</span>
                      <span className={skillDashboard.departmentCorePerformance.averageScore >= 70 ? 'text-emerald-400' : 'text-amber-400'}>
                        {skillDashboard.departmentCorePerformance.averageScore}%
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400 flex items-center justify-between">
                      <span>Status: {skillDashboard.departmentCorePerformance.status}</span>
                      <span>{skillDashboard.departmentCorePerformance.attemptedCount} attempted</span>
                    </div>
                  </div>
                )}
                {skillDashboard?.resumeSkillPerformance && (
                  <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="text-slate-200">Resume Technologies & Projects</span>
                      <span className={skillDashboard.resumeSkillPerformance.averageScore >= 70 ? 'text-emerald-400' : 'text-amber-400'}>
                        {skillDashboard.resumeSkillPerformance.averageScore}%
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400 flex items-center justify-between">
                      <span>Status: {skillDashboard.resumeSkillPerformance.status}</span>
                      <span>{skillDashboard.resumeSkillPerformance.attemptedCount} attempted</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Strong and Weak Topics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-4 rounded-2xl bg-slate-950 border border-emerald-500/20 space-y-2">
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-wide flex items-center space-x-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Strong Topics</span>
                </span>
                {skillDashboard?.strongTopics && skillDashboard.strongTopics.length > 0 ? (
                  <ul className="space-y-1 text-xs text-slate-300">
                    {skillDashboard.strongTopics.map((top, tIdx) => (
                      <li key={tIdx} className="flex items-center space-x-1.5">
                        <span className="text-emerald-400 font-bold">•</span>
                        <span>{top}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs text-slate-500 italic">Complete practice sets to identify your strong skills.</p>
                )}
              </div>

              <div className="p-4 rounded-2xl bg-slate-950 border border-amber-500/20 space-y-2">
                <span className="text-xs font-bold text-amber-400 uppercase tracking-wide flex items-center space-x-1.5">
                  <AlertCircle className="w-4 h-4 text-amber-400" />
                  <span>Topics Needing Practice</span>
                </span>
                {skillDashboard?.weakTopics && skillDashboard.weakTopics.length > 0 ? (
                  <ul className="space-y-1 text-xs text-slate-300">
                    {skillDashboard.weakTopics.map((top, tIdx) => (
                      <li key={tIdx} className="flex items-center space-x-1.5">
                        <span className="text-amber-400 font-bold">•</span>
                        <span>{top}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs text-slate-500 italic">No low-scoring topics detected so far!</p>
                )}
              </div>
            </div>

            {/* Recommended Next Practice Topics */}
            {skillDashboard?.recommendedNextPracticeTopics && skillDashboard.recommendedNextPracticeTopics.length > 0 && (
              <div className="p-4 rounded-2xl bg-slate-950 border border-purple-500/30 space-y-2">
                <span className="text-xs font-bold text-purple-400 uppercase tracking-wide flex items-center space-x-1.5">
                  <Sparkles className="w-4 h-4 text-purple-400" />
                  <span>Recommended Next Practice Topics</span>
                </span>
                <div className="flex flex-wrap gap-2 pt-1">
                  {skillDashboard.recommendedNextPracticeTopics.map((topic, rIdx) => (
                    <span key={rIdx} className="px-3 py-1 rounded-xl bg-purple-500/10 border border-purple-500/30 text-xs font-semibold text-purple-300">
                      {topic}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-center justify-end space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setShowDashboardModal(false)}
                className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold cursor-pointer"
              >
                Close Dashboard
              </button>
            </div>
          </div>
        </div>
      )}

      {/* End Early Modal */}
      {showEndModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 max-w-md w-full space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-white">End Interview Early?</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Your answered questions ({answersList.length}) will be scored and compiled into your placement readiness scorecard.
            </p>
            <div className="flex items-center justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setShowEndModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold cursor-pointer"
              >
                Continue Interview
              </button>
              <button
                type="button"
                onClick={handleEndEarly}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold cursor-pointer"
              >
                End & View Scorecard
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
