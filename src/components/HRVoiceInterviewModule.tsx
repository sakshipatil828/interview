/**
 * CareerCurve Real-Time Voice-Based AI HR Personal Interview Module
 * Implements interactive two-way virtual interview, Web Speech synthesis & recognition,
 * NLP answer evaluation, STAR behavioral framework analysis, time-limited countdowns,
 * filler word tracking, and adaptive contextual follow-ups.
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ParsedResume, InterviewSession, InterviewAnswer } from '../types';
import { 
  HRInterviewConfig, 
  HRInterviewState, 
  HRDatasetQuestion, 
  HREvaluationResult, 
  HRInterviewSessionReport,
  EnvironmentDisruptionCategory,
  EnvironmentEventLogItem,
  EnvironmentMonitoringState,
  InterruptedHRInterviewReport,
  HRFollowUpRecord,
  HRSatisfactionEvaluation
} from '../nlp/hr/types';
import { selectInterviewQuestions } from '../nlp/hr/hrQuestionDataset';
import { 
  generateSevenMainHRQuestions, 
  SEVEN_MAIN_HR_QUESTIONS, 
  evaluateHRSatisfaction, 
  getInterviewClosingStatement, 
  handleCandidateQuestionInteraction 
} from '../nlp/hr/hrSevenQuestionEngine';
import { evaluateHRAnswer } from '../nlp/hr/hrAnswerEvaluator';
import { speechService } from '../services/speechService';
import { personDetectionService } from '../services/personDetectionService';
import { InterviewerAvatar } from './InterviewerAvatar';
import { WebcamFeed } from './WebcamFeed';
import type { EnvironmentMetrics } from './WebcamFeed';
import { HRMockPreparationModule } from './HRMockPreparationModule';
import {
  detectLightingChange,
  detectAdditionalPerson,
  handleExtraPersonIncident,
  buildInterruptedReport,
  saveEnvironmentEventLog,
  formatElapsedDuration,
  ExtraPersonEventTracker,
  MAX_WARNINGS,
  SUSTAINED_PERSON_THRESHOLD_MS,
  CONFIRMATION_FRAMES_REQUIRED,
  COOLDOWN_MS,
  EXACT_PERSON_WARNING_1,
  EXACT_PERSON_WARNING_2,
  EXACT_PERSON_WARNING_3,
  TERMINATION_TITLE,
  getWarningMessage,
  DEFAULT_MONITOR_CONFIG,
  EXACT_WARNING_MESSAGE,
} from '../utils/interviewEnvironmentMonitor';
import { getActiveSession } from '../services/authStorageService';

import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Play,
  Pause,
  RotateCcw,
  Square,
  Sparkles,
  CheckCircle2,
  Clock,
  Award,
  AlertCircle,
  HelpCircle,
  TrendingUp,
  MessageSquare,
  ShieldCheck,
  ShieldAlert,
  Zap,
  ArrowRight,
  ChevronRight,
  Sliders,
  FileText,
  Send,
  RefreshCw,
  Video,
  Check,
  X,
  EyeOff,
  Radio,
  BookOpen,
  MessagesSquare,
  ArrowLeft,
  GraduationCap,
  Building2,
  User,
  Briefcase
} from 'lucide-react';

interface HRVoiceInterviewModuleProps {
  parsedResume: ParsedResume | null;
  profileDepartment?: string;
  initialConfig?: Partial<HRInterviewConfig>;
  onContinueNextRound?: () => void;
  nextRoundTitle?: string;
  onCompleteInterview: (session: InterviewSession) => void;
  onNavigate: (tab: string) => void;
  targetCompany?: string;
  initialMode?: 'SELECTION' | 'MOCK' | 'PRACTICE';
  onBackToRounds?: () => void;
  onBackToSetup?: () => void;
}

export const HRVoiceInterviewModule: React.FC<HRVoiceInterviewModuleProps> = ({
  parsedResume,
  profileDepartment,
  initialConfig,
  onContinueNextRound,
  nextRoundTitle,
  onCompleteInterview,
  onNavigate,
  targetCompany: propTargetCompany,
  initialMode,
  onBackToRounds,
  onBackToSetup,
}) => {
  // 1. INTERVIEW PREPARATION MODE: SELECTION | MOCK | PRACTICE
  const [hrMode, setHrMode] = useState<'SELECTION' | 'MOCK' | 'PRACTICE'>(initialMode || 'SELECTION');

  // 1b. INTERVIEW CONFIGURATION STATE
  const [config, setConfig] = useState<HRInterviewConfig>({
    type: initialConfig?.type || 'HR Personal Interview',
    difficulty: initialConfig?.difficulty || 'Intermediate',
    durationMinutes: initialConfig?.durationMinutes || 10,
    language: initialConfig?.language || 'English',
    style: initialConfig?.style || 'Professional',
    answerTimeLimitSeconds: initialConfig?.answerTimeLimitSeconds || 300,
    targetCompany: initialConfig?.targetCompany || propTargetCompany || '',
  });
  const [targetCompany, setTargetCompany] = useState<string>(initialConfig?.targetCompany || propTargetCompany || '');

  // 2. STATE MACHINE
  const [interviewState, setInterviewState] = useState<HRInterviewState>('SETUP');
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);

  // 3. QUESTIONS & NAVIGATION — SEVEN CANONICAL COMPANY HR QUESTIONS
  const [interviewQuestions, setInterviewQuestions] = useState<{
    question: HRDatasetQuestion;
    personalizedText: string;
    progressTitle?: string;
    shortTitle?: string;
  }[]>([]);
  const [mainQuestionIdx, setMainQuestionIdx] = useState<number>(0);
  const [followUpCount, setFollowUpCount] = useState<number>(0);
  const [followUpHistory, setFollowUpHistory] = useState<HRFollowUpRecord[]>([]);
  const [currentIdx, setCurrentIdx] = useState<number>(0); // Kept for backwards compatibility
  const [activeQuestionText, setActiveQuestionText] = useState<string>('');
  const [isAnsweringFollowUp, setIsAnsweringFollowUp] = useState<boolean>(false);
  const [totalTimeElapsedSeconds, setTotalTimeElapsedSeconds] = useState<number>(0);

  // 4. CANDIDATE VOICE RESPONSE, TRANSCRIPTION & EDITABLE ANSWER
  const [currentTranscript, setCurrentTranscript] = useState<string>('');
  const [candidateAnswer, setCandidateAnswer] = useState<string>('');
  const [speechStatus, setSpeechStatus] = useState<'idle' | 'listening' | 'transcribing' | 'paused' | 'error'>('idle');
  const [isTtsPaused, setIsTtsPaused] = useState<boolean>(false);
  const [permissionError, setPermissionError] = useState<string | null>(null);

  // 4b. ENVIRONMENT MONITORING & DISRUPTION HANDLING STATE
  const [hasEnvironmentConsent, setHasEnvironmentConsent] = useState<boolean>(true);
  const [interruptedReport, setInterruptedReport] = useState<InterruptedHRInterviewReport | null>(null);
  const [monitoringState, setMonitoringState] = useState<EnvironmentMonitoringState>({
    isEnabled: true,
    isConsented: true,
    status: 'normal',
    warningCount: 0,
    maxWarnings: 3,
    events: [],
    activeWarning: null,
    cameraStatus: 'Active',
    micStatus: 'Idle',
    monitoringMode: 'Active',
    personModelStatus: 'uninitialized',
    personCount: 1,
    isPersonDetectionAvailable: false,
  });

  // Tracking refs for environment monitoring, debouncing, and disruption state (5-second intervals, 3 warnings)
  const extraPersonTrackerRef = useRef<ExtraPersonEventTracker>(new ExtraPersonEventTracker(3, 5000, 2, 0));
  const [isWarningPaused, setIsWarningPaused] = useState<boolean>(false);
  const [activeWarningMessage, setActiveWarningMessage] = useState<string | null>(null);
  const [activeWarningTitle, setActiveWarningTitle] = useState<string | null>(null);
  const [multiPersonDuration, setMultiPersonDuration] = useState<number>(0);
  const absenceTimerStartRef = useRef<number | null>(null);
  const obscuredTimerStartRef = useRef<number | null>(null);
  const lightingDropTimerStartRef = useRef<number | null>(null);
  const personDetectionTimerStartRef = useRef<number | null>(null);
  const baselineLuminanceRef = useRef<number>(1000);
  const repeatWindowExpiryTimeRef = useRef<number>(0);
  const extraPersonFrameCountRef = useRef<number>(0);
  const extraPersonCooldownExpiryRef = useRef<number>(0);
  const hasExtraPersonLeftRef = useRef<boolean>(true);
  const warningCountRef = useRef<number>(0);
  const isInterruptedRef = useRef<boolean>(false);
  const activeWarningRef = useRef<EnvironmentEventLogItem | null>(null);
  const [cameraAccessError, setCameraAccessError] = useState<string | null>(null);
  const [showSavedAnswersModal, setShowSavedAnswersModal] = useState<boolean>(false);

  // 5. TIMERS & ANSWER TIMING (Supports 5-10 minutes with explicit extensions)
  const [questionTimeLeft, setQuestionTimeLeft] = useState<number>(initialConfig?.answerTimeLimitSeconds || 300);
  const [totalTimeLeft, setTotalTimeLeft] = useState<number>(600); // in seconds
  const [questionElapsedSeconds, setQuestionElapsedSeconds] = useState<number>(0);
  const [showAnswerTimeExtension, setShowAnswerTimeExtension] = useState<boolean>(false);
  const isSubmittingRef = useRef<boolean>(false);

  // 6. EVALUATIONS & RESULTS
  const [evaluations, setEvaluations] = useState<HREvaluationResult[]>([]);
  const [currentFeedback, setCurrentFeedback] = useState<HREvaluationResult | null>(null);
  const [sessionReport, setSessionReport] = useState<HRInterviewSessionReport | null>(null);

  // 7. TELEMETRY
  const [telemetry, setTelemetry] = useState({ eyeContact: 92, confidence: 90, emotion: 'Engaged' });
  const handleTelemetryUpdate = useCallback((stats: { eyeContact: number; confidence: number; emotion: string }) => {
    setTelemetry(stats);
  }, []);

  const handleExtendAnswerTime = useCallback((extraSeconds = 120) => {
    setQuestionTimeLeft(extraSeconds);
    setShowAnswerTimeExtension(false);
  }, []);

  // Cleanup audio & recognition when unmounting or completing
  useEffect(() => {
    return () => {
      speechService.terminateAll();
    };
  }, []);

  // Sync mute state with speechService
  const toggleMute = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    speechService.setMuted(nextMuted);
  };

  // -------------------------------------------------------------------------
  // OVERALL INTERVIEW COUNTDOWN TIMER
  // -------------------------------------------------------------------------
  useEffect(() => {
    if (
      interviewState === 'SETUP' || 
      interviewState === 'COMPLETED' || 
      interviewState === 'INTERRUPTED' || 
      isPaused || 
      isWarningPaused
    ) return;

    const timer = setInterval(() => {
      setTotalTimeElapsedSeconds((prev) => prev + 1);
      setTotalTimeLeft((prev) => Math.max(0, prev - 1));
    }, 1000);

    return () => clearInterval(timer);
  }, [interviewState, isPaused, isWarningPaused]);

  // -------------------------------------------------------------------------
  // PER-QUESTION ANSWER COUNTDOWN TIMER
  // -------------------------------------------------------------------------
  useEffect(() => {
    if (
      interviewState !== 'WAITING_FOR_ANSWER' &&
      interviewState !== 'LISTENING_TO_STUDENT' &&
      interviewState !== 'TRANSCRIBING'
    )
      return;
    if (isPaused || isWarningPaused || showAnswerTimeExtension) return;

    const timer = setInterval(() => {
      setQuestionElapsedSeconds((prev) => prev + 1);
      setQuestionTimeLeft((prev) => {
        if (prev <= 1) {
          // Time limit reached: pause timer and offer explicit extension (+2 mins) or submit prompt
          clearInterval(timer);
          setShowAnswerTimeExtension(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [interviewState, isPaused, isWarningPaused, showAnswerTimeExtension]);

  // -------------------------------------------------------------------------
  // ENVIRONMENT DISRUPTION & WARNING POLICY ENGINE
  // -------------------------------------------------------------------------
  // STRICT RULE: Darkness, shadows, lighting changes, camera exposure, or background color
  // must NEVER trigger a warning or terminate the interview!
  const triggerDisruptionIncident = useCallback((
    category?: EnvironmentDisruptionCategory,
    categoryLabel?: string,
    description?: string,
    detectedPersonCount = 1
  ) => {
    // Disabled: Environment warning popup and automatic pause/interruption logic removed.
    return;
  }, []);

  // Backward compatibility alias for extra-person tests & direct triggers
  const triggerExtraPersonIncident = useCallback((detectedPersonCount: number) => {
    const observation = extraPersonTrackerRef.current.processObservation(detectedPersonCount, Date.now());
    if (observation.eventTriggered && observation.incident) {
      const incident = observation.incident;
      const newCount = incident.nextWarningCount;
      const eventItem: EnvironmentEventLogItem = {
        id: `person_warn_${Date.now()}`,
        timestamp: new Date().toLocaleTimeString('en-US', { hour12: false }),
        category: 'POSSIBLE_ADDITIONAL_PERSON',
        categoryLabel: incident.warningLabel,
        description: incident.warningMessage,
        severity: 'warning',
      };
      setActiveWarningMessage(incident.warningMessage);
      setActiveWarningTitle(incident.warningLabel);

      if (incident.shouldPauseCamera || newCount >= 3) {
        setIsWarningPaused(true);
        setIsPaused(true);
        try {
          speechService.pauseSpeaking();
          speechService.stopListening();
        } catch {}
      }

      setMonitoringState((prev) => ({
        ...prev,
        status: newCount >= 3 ? 'interrupted' : 'warning',
        warningCount: newCount,
        cameraStatus: newCount >= 3 ? 'Paused — Warning Limit Reached' : prev.cameraStatus,
        events: [eventItem, ...prev.events].slice(0, 50),
        activeWarning: eventItem,
        personCount: detectedPersonCount,
      }));
    }
  }, []);

  const handleEnvironmentMetrics = useCallback((metrics: EnvironmentMetrics) => {
    if (interviewState === 'SETUP' || interviewState === 'COMPLETED' || isInterruptedRef.current) {
      return;
    }

    // Hardware camera access errors are handled gracefully as notices, NEVER as environmental misconduct
    if (metrics.errorType !== null || !metrics.isLive) {
      if (metrics.errorType !== null) {
        setCameraAccessError(metrics.errorType);
      }
    } else {
      setCameraAccessError(null);
    }

    const camStatus = metrics.isCameraOff
      ? 'Off'
      : isWarningPaused
      ? 'Paused — Warning Limit Reached'
      : isPaused
      ? 'Paused'
      : metrics.errorType !== null
      ? 'Error'
      : metrics.isLive
      ? 'Active'
      : 'Inactive';

    // Query person-detection service status
    const modelStatus = metrics.personModelStatus || personDetectionService.getStatus();
    const isModelAvailable = metrics.isPersonDetectionAvailable ?? personDetectionService.isReady();

    // Person Detection Check
    const personCheck = detectAdditionalPerson();
    const currentCount = metrics.personCount !== undefined && metrics.personCount !== null
      ? metrics.personCount
      : (personCheck.isAvailable ? personCheck.personCount : 1);

    // Multi-person detection processing through tracker:
    // Only runs when interview active, camera is live, no hardware errors, and not already paused by warning
    if (
      metrics.isLive &&
      !metrics.isCameraOff &&
      metrics.errorType === null &&
      isModelAvailable &&
      !isWarningPaused
    ) {
      const observation = extraPersonTrackerRef.current.processObservation(currentCount, Date.now());
      setMultiPersonDuration(observation.currentDurationSeconds);

      if (observation.eventTriggered && observation.incident) {
        const incident = observation.incident;
        const newWarningCount = incident.nextWarningCount;

        const eventItem: EnvironmentEventLogItem = {
          id: `person_warn_${Date.now()}`,
          timestamp: new Date().toLocaleTimeString('en-US', { hour12: false }),
          category: 'POSSIBLE_ADDITIONAL_PERSON',
          categoryLabel: incident.warningLabel,
          description: incident.warningMessage,
          severity: 'warning',
        };

        try {
          const session = getActiveSession();
          saveEnvironmentEventLog(session?.userId, eventItem);
        } catch {}

        setActiveWarningMessage(incident.warningMessage);
        setActiveWarningTitle(incident.warningLabel);

        if (incident.shouldPauseCamera || newWarningCount >= 3) {
          setIsWarningPaused(true);
          setIsPaused(true);
          try {
            speechService.pauseSpeaking();
            speechService.stopListening();
          } catch {}
        }

        setMonitoringState((prev) => ({
          ...prev,
          status: newWarningCount >= 3 ? 'interrupted' : 'warning',
          warningCount: newWarningCount,
          cameraStatus: newWarningCount >= 3 ? 'Paused — Warning Limit Reached' : camStatus,
          events: [eventItem, ...prev.events].slice(0, 50),
          activeWarning: eventItem,
          personCount: currentCount,
          personModelStatus: modelStatus,
          isPersonDetectionAvailable: isModelAvailable,
        }));
        return;
      } else {
        // When face count is 0 or 1, hide active warning banner immediately
        if (currentCount <= 1 && !isWarningPaused) {
          if (activeWarningMessage) {
            setActiveWarningMessage(null);
            setActiveWarningTitle(null);
          }
        }
      }
    } else {
      setMultiPersonDuration(0);
      if (!isWarningPaused && activeWarningMessage) {
        setActiveWarningMessage(null);
        setActiveWarningTitle(null);
      }
    }

    setMonitoringState((prev) => {
      const nextCameraStatus = isWarningPaused
        ? 'Paused — Warning Limit Reached'
        : isPaused
        ? 'Paused'
        : camStatus;

      const nextStatus = isWarningPaused || prev.warningCount >= 3
        ? 'interrupted'
        : (currentCount >= 2 && activeWarningMessage)
        ? 'warning'
        : 'normal';

      if (
        prev.cameraStatus === nextCameraStatus &&
        prev.personCount === currentCount &&
        prev.personModelStatus === modelStatus &&
        prev.isPersonDetectionAvailable === isModelAvailable &&
        prev.status === nextStatus
      ) {
        return prev;
      }
      return {
        ...prev,
        status: nextStatus,
        cameraStatus: nextCameraStatus,
        personCount: currentCount,
        personModelStatus: modelStatus,
        isPersonDetectionAvailable: isModelAvailable,
      };
    });
  }, [interviewState, isPaused, isWarningPaused]);

  const handleAcknowledgeWarning = useCallback(() => {
    setIsPaused(false);
    setActiveWarningMessage(null);
    setActiveWarningTitle(null);
    extraPersonTrackerRef.current.acknowledgeWarning(Date.now());
  }, []);

  const handleDismissWarning = useCallback(() => {
    setActiveWarningMessage(null);
    setActiveWarningTitle(null);
    extraPersonTrackerRef.current.acknowledgeWarning(Date.now());
  }, []);

  const handleResumeFromWarningPause = useCallback(() => {
    // Resume camera and interview progression under single-person compliance
    extraPersonTrackerRef.current.resumeCameraAndInterview(true, Date.now());
    setMultiPersonDuration(0);
    setIsWarningPaused(false);
    setIsPaused(false);
    setActiveWarningMessage(null);
    setActiveWarningTitle(null);

    const resumeEvent: EnvironmentEventLogItem = {
      id: `resume_${Date.now()}`,
      timestamp: new Date().toLocaleTimeString('en-US', { hour12: false }),
      category: 'POSSIBLE_ADDITIONAL_PERSON',
      categoryLabel: 'Camera & Interview Resumed',
      description: 'Candidate resumed camera and interview under single-person compliance policy.',
      severity: 'info' as any,
    };

    try {
      const session = getActiveSession();
      saveEnvironmentEventLog(session?.userId, resumeEvent);
    } catch {}

    setMonitoringState((prev) => ({
      ...prev,
      status: 'normal',
      warningCount: 0,
      cameraStatus: 'Active',
      events: [resumeEvent, ...prev.events].slice(0, 50),
      activeWarning: null,
    }));

    if (interviewState === 'LISTENING_TO_STUDENT' || interviewState === 'WAITING_FOR_ANSWER') {
      try {
        speechService.resumeSpeaking();
      } catch {}
    }
  }, [interviewState]);

  // -------------------------------------------------------------------------
  // START INTERVIEW SESSION
  // -------------------------------------------------------------------------
  const handleStartInterview = () => {
    speechService.terminateAll();
    setPermissionError(null);
    extraPersonTrackerRef.current.reset();
    personDetectionService.reset();
    setMultiPersonDuration(0);
    setIsWarningPaused(false);
    setActiveWarningMessage(null);
    setActiveWarningTitle(null);
    extraPersonCooldownExpiryRef.current = 0;
    extraPersonFrameCountRef.current = 0;
    personDetectionTimerStartRef.current = null;
    hasExtraPersonLeftRef.current = true;
    setCameraAccessError(null);
    setShowSavedAnswersModal(false);
    warningCountRef.current = 0;
    isInterruptedRef.current = false;
    isSubmittingRef.current = false;
    setShowAnswerTimeExtension(false);
    activeWarningRef.current = null;
    setInterruptedReport(null);

    setMonitoringState({
      isEnabled: true,
      isConsented: hasEnvironmentConsent,
      status: 'normal',
      warningCount: 0,
      maxWarnings: MAX_WARNINGS,
      events: [],
      activeWarning: null,
      cameraStatus: 'Active',
      micStatus: 'Idle',
      monitoringMode: 'Active',
      personModelStatus: personDetectionService.getStatus(),
      personCount: 1,
      isPersonDetectionAvailable: personDetectionService.isReady(),
    });

    // Generate the Seven Canonical Company HR Questions personalized with actual resume & company
    const questionsList = generateSevenMainHRQuestions(parsedResume, targetCompany, config.difficulty);
    setInterviewQuestions(questionsList);
    setMainQuestionIdx(0);
    setCurrentIdx(0);
    setFollowUpCount(0);
    setFollowUpHistory([]);
    setTotalTimeElapsedSeconds(0);
    setEvaluations([]);
    setCurrentFeedback(null);
    setSessionReport(null);
    setIsAnsweringFollowUp(false);

    const totalSeconds = config.durationMinutes * 60;
    setTotalTimeLeft(totalSeconds);
    setQuestionTimeLeft(config.answerTimeLimitSeconds);
    setQuestionElapsedSeconds(0);
    setIsPaused(false);

    if (questionsList.length === 0) return;

    const firstQ = questionsList[0].personalizedText;
    setActiveQuestionText(firstQ);
    setInterviewState('READY');

    // Automatically transition to speaking the first question
    setTimeout(() => {
      askQuestionAutomatically(firstQ);
    }, 600);
  };

  // -------------------------------------------------------------------------
  // AUTOMATIC QUESTION DELIVERY VIA SPEECH SYNTHESIS
  // -------------------------------------------------------------------------
  const askQuestionAutomatically = async (textToSpeak: string) => {
    speechService.terminateAll();
    isSubmittingRef.current = false;
    setShowAnswerTimeExtension(false);
    setInterviewState('ASKING_QUESTION');
    setCurrentTranscript('');
    setCandidateAnswer('');
    setQuestionTimeLeft(config.answerTimeLimitSeconds);
    setQuestionElapsedSeconds(0);
    setCurrentFeedback(null);
    setIsTtsPaused(false);

    setMonitoringState((prev) => ({ ...prev, micStatus: 'Idle' }));

    // AI automatically speaks the question once using SpeechSynthesis
    await speechService.speakText(textToSpeak, {
      rate: 0.95,
      pitch: 1.0,
      onStart: () => {
        setInterviewState('ASKING_QUESTION');
      },
      onEnd: () => {
        // AI finishes speaking! Stop speaking completely and wait for candidate answer
        speechService.stopSpeaking();
        startStudentListening();
      },
      onError: () => {
        speechService.stopSpeaking();
        startStudentListening();
      },
    });
  };

  // -------------------------------------------------------------------------
  // ACTIVATE STUDENT VOICE RECORDING / LISTENING (WAITING FOR ANSWER)
  // -------------------------------------------------------------------------
  const startStudentListening = async () => {
    speechService.stopSpeaking();
    setInterviewState('WAITING_FOR_ANSWER');
    setSpeechStatus('listening');
    setPermissionError(null);

    setMonitoringState((prev) => ({
      ...prev,
      micStatus: 'Listening',
    }));

    const started = await speechService.startListening({
      onListeningStart: () => {
        setInterviewState('WAITING_FOR_ANSWER');
        setSpeechStatus('listening');
        setMonitoringState((prev) => ({ ...prev, micStatus: 'Listening' }));
      },
      onTranscriptChange: (text) => {
        setCurrentTranscript(text);
        setCandidateAnswer(text);
        setInterviewState('WAITING_FOR_ANSWER');
        setSpeechStatus('transcribing');
        setMonitoringState((prev) => ({ ...prev, micStatus: 'Transcribing' }));
      },
      onSilenceTimeout: () => {
        // Candidate maintains complete control to pause, think, and submit explicitly
      },
      onError: (errMsg, isDenied) => {
        setSpeechStatus('error');
        if (isDenied) {
          setPermissionError('Microphone access was denied. You can type your answer directly in the box below without penalty.');
          setMonitoringState((prev) => ({ ...prev, micStatus: 'Denied' }));
        } else {
          setPermissionError(errMsg);
          setMonitoringState((prev) => ({ ...prev, micStatus: 'Unavailable' }));
        }
      },
      onListeningEnd: () => {
        setSpeechStatus('paused');
        setMonitoringState((prev) => ({
          ...prev,
          micStatus: prev.micStatus === 'Denied' ? 'Denied' : prev.micStatus === 'Unavailable' ? 'Unavailable' : 'Idle',
        }));
      },
    });

    if (!started && !speechService.isSpeechRecognitionSupported()) {
      setSpeechStatus('error');
      setPermissionError('Speech recognition is not supported in this browser. Please type your answer directly in the box below.');
      setMonitoringState((prev) => ({ ...prev, micStatus: 'Unavailable' }));
    }
  };

  const handleToggleVoiceInput = () => {
    if (speechService.isListening()) {
      speechService.stopListening();
      setSpeechStatus('paused');
      setMonitoringState((prev) => ({ ...prev, micStatus: 'Idle' }));
    } else {
      startStudentListening();
    }
  };

  const handleAnswerNow = () => {
    speechService.stopSpeaking();
    setIsTtsPaused(false);
    startStudentListening();
  };

  const handleToggleTtsPause = () => {
    if (isTtsPaused) {
      setIsTtsPaused(false);
      speechService.resumeSpeaking();
    } else {
      setIsTtsPaused(true);
      speechService.pauseSpeaking();
    }
  };

  // -------------------------------------------------------------------------
  // SUBMIT & EVALUATE ANSWER WITH INTELLIGENT FOLLOW-UP & SATISFACTION LOGIC
  // -------------------------------------------------------------------------
  const handleSubmitCurrentAnswer = async (isTimedOut = false) => {
    if (interviewState === 'INTERRUPTED' || isInterruptedRef.current || interviewState === 'PROCESSING_ANSWER' || isSubmittingRef.current) return;
    isSubmittingRef.current = true;
    setShowAnswerTimeExtension(false);

    // Immediately stop listening so background audio doesn't interfere
    speechService.terminateAll();
    setInterviewState('PROCESSING_ANSWER');
    setSpeechStatus('idle');
    setMonitoringState((prev) => ({ ...prev, micStatus: 'Idle' }));

    const finalAnswerText = candidateAnswer.trim();
    const effectiveText = finalAnswerText || (isTimedOut ? '(Candidate ran out of time before answering)' : 'No answer provided.');

    const effectiveMainIdx = mainQuestionIdx;
    const currentQDef = SEVEN_MAIN_HR_QUESTIONS[effectiveMainIdx];
    const currentQItem = interviewQuestions[effectiveMainIdx]?.question;

    if (!currentQDef || !currentQItem) {
      isSubmittingRef.current = false;
      return;
    }

    // 1. Evaluate Satisfaction & Missing Points
    const satisfaction = evaluateHRSatisfaction(
      currentQDef,
      effectiveText,
      followUpCount,
      parsedResume,
      targetCompany
    );

    // CASE 1: Incomplete / Needs Follow-Up AND followUpCount < 2 AND not satisfied
    if (!satisfaction.isSatisfied && followUpCount < 2 && satisfaction.followUpQuestion) {
      const newRecord: HRFollowUpRecord = {
        followUpNumber: followUpCount + 1,
        followUpQuestion: satisfaction.followUpQuestion,
        candidateAnswer: effectiveText,
        evaluationNotes: satisfaction.missingElements.join('; '),
        timestamp: new Date().toLocaleTimeString('en-US', { hour12: false })
      };
      setFollowUpHistory((prev) => [...prev, newRecord]);
      const nextFollowUpNum = followUpCount + 1;
      setFollowUpCount(nextFollowUpNum);
      setIsAnsweringFollowUp(true);
      setActiveQuestionText(satisfaction.followUpQuestion);
      setCandidateAnswer('');
      setCurrentTranscript('');
      setQuestionTimeLeft(config.answerTimeLimitSeconds);
      setQuestionElapsedSeconds(0);

      // AI asks the follow-up question naturally via TTS
      setInterviewState('ASKING_QUESTION');
      await speechService.speakText(satisfaction.followUpQuestion, {
        onStart: () => setInterviewState('ASKING_QUESTION'),
        onEnd: () => {
          speechService.stopSpeaking();
          startStudentListening();
          isSubmittingRef.current = false;
        },
        onError: () => {
          speechService.stopSpeaking();
          startStudentListening();
          isSubmittingRef.current = false;
        }
      });
      return;
    }

    // CASE 2: Satisfied OR followUpCount >= 2 OR Question 7 concluded
    // Synthesize full candidate text across initial and any follow-ups for comprehensive evaluation
    const fullCandidateText = followUpHistory.length > 0
      ? `${followUpHistory.map((h, i) => `[Initial Answer ${i + 1}]: ${h.candidateAnswer}`).join(' ')} [Final Answer]: ${effectiveText}`
      : effectiveText;

    const evalResult = await evaluateHRAnswer(currentQItem, fullCandidateText, questionElapsedSeconds, parsedResume);
    evalResult.followUpRecords = [...followUpHistory];
    evalResult.mainQuestionIndex = effectiveMainIdx;
    evalResult.satisfactionStatus = followUpCount > 0 ? (satisfaction.isSatisfied ? 'satisfied_after_followup' : 'progressed_after_limit') : 'complete';

    // Update evaluations array
    const updatedEvaluations = [...evaluations];
    if (updatedEvaluations.length > effectiveMainIdx) {
      updatedEvaluations[effectiveMainIdx] = evalResult;
    } else {
      updatedEvaluations.push(evalResult);
    }
    setEvaluations(updatedEvaluations);

    // If Question 7 (final question) is completed:
    if (effectiveMainIdx >= 6) {
      setInterviewState('GIVING_FEEDBACK');
      // If candidate asked an authentic question in Q7, answer it first
      if (satisfaction.acknowledgmentSpeech) {
        await speechService.speakText(satisfaction.acknowledgmentSpeech);
      }
      // Deliver professional closing statement
      const candidateFirstName = parsedResume?.fullName ? parsedResume.fullName.split(' ')[0] : 'Candidate';
      const closingStatement = getInterviewClosingStatement(candidateFirstName, targetCompany);
      await speechService.speakText(closingStatement);
      isSubmittingRef.current = false;
      handleFinishInterview(updatedEvaluations);
      return;
    }

    // Transition naturally: AI acknowledges answer and introduces next question
    setInterviewState('GIVING_FEEDBACK');
    await speechService.speakText(satisfaction.acknowledgmentSpeech);

    // Advance to next main question (0 -> 1 -> 2 -> 3 -> 4 -> 5 -> 6)
    const nextIdx = effectiveMainIdx + 1;
    setMainQuestionIdx(nextIdx);
    setCurrentIdx(nextIdx);
    setFollowUpCount(0);
    setFollowUpHistory([]);
    setIsAnsweringFollowUp(false);
    setCandidateAnswer('');
    setCurrentTranscript('');

    const nextQ = interviewQuestions[nextIdx]?.personalizedText || SEVEN_MAIN_HR_QUESTIONS[nextIdx]?.baseQuestion;
    setActiveQuestionText(nextQ);
    askQuestionAutomatically(nextQ);
    isSubmittingRef.current = false;
  };

  // -------------------------------------------------------------------------
  // RETRY SAME QUESTION (Practice Revised Answer)
  // -------------------------------------------------------------------------
  const handleRetryCurrentQuestion = () => {
    speechService.terminateAll();
    isSubmittingRef.current = false;
    setShowAnswerTimeExtension(false);
    setCurrentFeedback(null);
    setCurrentTranscript('');
    setCandidateAnswer('');
    setQuestionTimeLeft(config.answerTimeLimitSeconds);
    setQuestionElapsedSeconds(0);
    setIsTtsPaused(false);
    startStudentListening();
  };

  // -------------------------------------------------------------------------
  // PROGRESS TO NEXT QUESTION OR FINISH
  // -------------------------------------------------------------------------
  const handleProceedToNextQuestion = () => {
    if (interviewState === 'INTERRUPTED' || isInterruptedRef.current) return;
    speechService.terminateAll();
    isSubmittingRef.current = false;
    setShowAnswerTimeExtension(false);
    setCurrentFeedback(null);
    setIsAnsweringFollowUp(false);
    setFollowUpCount(0);
    setFollowUpHistory([]);

    if (mainQuestionIdx < interviewQuestions.length - 1) {
      const nextIndex = mainQuestionIdx + 1;
      setMainQuestionIdx(nextIndex);
      setCurrentIdx(nextIndex);
      const nextQText = interviewQuestions[nextIndex].personalizedText;
      setActiveQuestionText(nextQText);
      askQuestionAutomatically(nextQText);
    } else {
      handleFinishInterview();
    }
  };

  // -------------------------------------------------------------------------
  // REPEAT QUESTION
  // -------------------------------------------------------------------------
  const handleRepeatQuestion = () => {
    speechService.terminateAll();
    askQuestionAutomatically(activeQuestionText);
  };

  // -------------------------------------------------------------------------
  // PAUSE / RESUME INTERVIEW
  // -------------------------------------------------------------------------
  const handleTogglePause = () => {
    if (isPaused) {
      setIsPaused(false);
      speechService.resumeSpeaking();
      if (interviewState === 'LISTENING_TO_STUDENT' || interviewState === 'TRANSCRIBING') {
        startStudentListening();
      }
    } else {
      setIsPaused(true);
      speechService.pauseSpeaking();
      speechService.stopListening();
    }
  };

  // -------------------------------------------------------------------------
  // CLEAR / RETRY ANSWER
  // -------------------------------------------------------------------------
  const handleRetryAnswer = () => {
    speechService.stopListening();
    setCurrentTranscript('');
    setCandidateAnswer('');
    setQuestionTimeLeft(config.answerTimeLimitSeconds);
    setQuestionElapsedSeconds(0);
    startStudentListening();
  };

  const handleRetakeRound = () => {
    speechService.terminateAll();
    extraPersonCooldownExpiryRef.current = 0;
    extraPersonFrameCountRef.current = 0;
    personDetectionTimerStartRef.current = null;
    hasExtraPersonLeftRef.current = true;
    setCameraAccessError(null);
    setShowSavedAnswersModal(false);
    warningCountRef.current = 0;
    isInterruptedRef.current = false;
    isSubmittingRef.current = false;
    setShowAnswerTimeExtension(false);
    activeWarningRef.current = null;
    setInterruptedReport(null);
    setEvaluations([]);
    setMainQuestionIdx(0);
    setCurrentIdx(0);
    setFollowUpCount(0);
    setFollowUpHistory([]);
    setInterviewState('SETUP');
  };

  const handleReturnToSetup = () => {
    speechService.terminateAll();
    onNavigate('interview_rounds');
  };

  // -------------------------------------------------------------------------
  // FINISH & COMPILE HR SCORECARD REPORT
  // -------------------------------------------------------------------------
  const handleFinishInterview = (completedEvaluations?: HREvaluationResult[]) => {
    speechService.terminateAll();
    setInterviewState('COMPLETED');

    const evals = (completedEvaluations && completedEvaluations.length > 0) ? completedEvaluations : evaluations;
    const totalEvaluations = evals.length;
    const avgScore = totalEvaluations > 0
      ? Math.round(evals.reduce((acc, e) => acc + e.overallScore, 0) / totalEvaluations)
      : 80;
    const avgCommScore = totalEvaluations > 0
      ? Math.round(evals.reduce((acc, e) => acc + e.clarityScore, 0) / totalEvaluations)
      : 82;
    const avgRelevanceScore = totalEvaluations > 0
      ? Math.round(evals.reduce((acc, e) => acc + e.relevanceScore, 0) / totalEvaluations)
      : 84;
    const avgQualityScore = totalEvaluations > 0
      ? Math.round(evals.reduce((acc, e) => acc + e.qualityScore, 0) / totalEvaluations)
      : 80;
    const avgStructureScore = totalEvaluations > 0
      ? Math.round(evals.reduce((acc, e) => acc + e.structureScore, 0) / totalEvaluations)
      : 78;

    const totalFillers = evals.reduce((acc, e) => acc + (e.communicationMetrics?.fillerWordsCount || 0), 0);
    const avgWpm = totalEvaluations > 0
      ? Math.round(evals.reduce((acc, e) => acc + (e.communicationMetrics?.wordsPerMinute || 135), 0) / totalEvaluations)
      : 135;

    // Identify strongest and weakest answers
    const sorted = [...evals].sort((a, b) => b.overallScore - a.overallScore);
    const strongestAnswers = sorted.slice(0, 2).map((e) => ({
      question: e.questionText,
      score: e.overallScore,
      why: e.strengths[0] || 'Structured delivery with clear relevance.',
    }));
    const weakestAnswers = sorted.slice(-2).reverse().map((e) => ({
      question: e.questionText,
      score: e.overallScore,
      why: e.areasToImprove[0] || 'Needs deeper concrete examples.',
    }));

    // Personalized improvement plan
    const improvementPlan = [
      'Structure technical and behavioral stories using the STAR methodology: specify Situation, Task, your personal Action, and quantifiable Result.',
      `Reduce verbal filler words (detected ${totalFillers} instances in this session) by substituting a deliberate 1-second pause.`,
      `Maintain your optimal speaking pace around 130–150 WPM (your average was ~${avgWpm} WPM).`,
      'Explicitly reference quantifiable metrics and technologies from your resume when answering behavioural and technical questions.'
    ];

    const report: HRInterviewSessionReport = {
      sessionId: `hr_session_${Date.now()}`,
      candidateId: parsedResume?.email || 'authenticated_student',
      candidateName: parsedResume?.fullName || 'Candidate',
      date: new Date().toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
      config,
      totalQuestionsAsked: totalEvaluations,
      overallScore: avgScore,
      communicationScore: avgCommScore,
      relevanceScore: avgRelevanceScore,
      clarityScore: avgQualityScore,
      starMasteryScore: avgStructureScore,
      timeManagementScore: 90,
      totalFillerWords: totalFillers,
      averageWpm: avgWpm,
      strongestAnswers,
      weakestAnswers,
      questionEvaluations: evals,
      personalizedImprovementPlan: improvementPlan,
      recommendedPracticeTopics: [
        'STAR Method Structuring',
        'Executive Elevator Pitch Delivery',
        'Constructive Feedback Reactions',
        'Conflict Resolution Metrics'
      ]
    };

    setSessionReport(report);

    // Save to user history via onCompleteInterview callback
    const sessionObj: InterviewSession = {
      id: report.sessionId,
      type: 'hr',
      date: report.date,
      difficulty: config.difficulty,
      answers: evals.map((e, idx) => ({
        questionId: e.questionId,
        questionText: e.questionText,
        userAnswer: e.userAnswerText,
        timeTakenSeconds: e.communicationMetrics?.durationSeconds || 60,
        aiFeedback: {
          technicalAccuracyScore: e.relevanceScore,
          communicationScore: e.clarityScore,
          relevanceScore: e.relevanceScore,
          overallRating: e.ratingBand,
          strengths: e.strengths,
          improvements: e.areasToImprove,
          sampleIdealAnswer: e.suggestedImprovedAnswer,
          followUpQuestion: e.followUpQuestion,
        },
      })),
      technicalScore: 85,
      hrScore: avgScore,
      aptitudeScore: 88,
      overallScore: avgScore,
      readinessPercentage: avgScore,
      completed: true,
    };

    try {
      onCompleteInterview(sessionObj);
    } catch {}
  };

  const formatSeconds = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  // Candidate track & discipline derivation
  const candidateClassification = parsedResume?.classification;
  const isNonTech = candidateClassification?.educationalCategory === 'non_technical' ||
    parsedResume?.userSelectedCategory === 'non_technical' ||
    candidateClassification?.userSelectedCategory === 'non_technical' ||
    candidateClassification?.isTechnical === false ||
    /(commerce|b\.?com|bba|mba|business|management|finance|accounting|marketing|human resource|hr|arts|humanities|english|customer service|customer support)/i.test(
      parsedResume?.department || profileDepartment || ''
    );

  const displayDiscipline = isNonTech
    ? (candidateClassification?.discipline && !/computer science|engineering/i.test(candidateClassification.discipline)
        ? candidateClassification.discipline
        : (profileDepartment && !/computer science|engineering/i.test(profileDepartment) ? profileDepartment : 'Commerce & Management'))
    : (profileDepartment || parsedResume?.department || 'Computer Science and Engineering');

  const handleBackToRounds = () => {
    if (onBackToRounds) {
      onBackToRounds();
    } else if (onBackToSetup) {
      onBackToSetup();
    } else {
      onNavigate('interview');
    }
  };

  // =========================================================================
  // VIEW 0: HR INTERVIEW MODE SELECTION (Mock Preparation vs Practice Preparation)
  // =========================================================================
  if (hrMode === 'SELECTION') {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
        {/* Top Navigation & Status Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <button
            type="button"
            onClick={handleBackToRounds}
            className="inline-flex items-center space-x-2 text-xs font-semibold text-slate-400 hover:text-white px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-colors self-start cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>← Back to Interview Rounds</span>
          </button>

          <div className="flex flex-wrap items-center gap-2">
            <span className={`inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${
              isNonTech 
                ? 'bg-amber-500/10 text-amber-300 border-amber-500/30' 
                : 'bg-indigo-500/10 text-indigo-300 border-indigo-500/30'
            }`}>
              <GraduationCap className="w-3.5 h-3.5" />
              <span>{isNonTech ? 'Non-Technical Track' : 'Technical Track'}</span>
            </span>

            <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-slate-800/80 text-slate-300 border border-slate-700/60 text-xs font-medium">
              <span>{displayDiscipline}</span>
            </span>

            {parsedResume?.fullName && (
              <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 text-xs font-medium">
                <Check className="w-3 h-3" />
                <span>{parsedResume.fullName}</span>
              </span>
            )}
          </div>
        </div>

        {/* Header Banner */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>HR Behaviour Interview Round</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Choose Your HR Interview Mode
          </h1>

          <p className="text-sm sm:text-base text-slate-400">
            Select how you would like to prepare today. Master common HR questions with structured sample answers first, or test your skills in a live two-way AI interview.
          </p>
        </div>

        {/* Two Selection Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-2">
          {/* OPTION 1: MOCK PREPARATION */}
          <div className="rounded-3xl bg-slate-900/90 border border-slate-800 hover:border-indigo-500/60 transition-all duration-300 p-7 flex flex-col justify-between shadow-2xl relative overflow-hidden group hover:shadow-indigo-500/10">
            <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none group-hover:bg-indigo-600/20 transition-all duration-500" />

            <div className="space-y-6 relative z-10">
              {/* Card Header */}
              <div className="flex items-start justify-between gap-4">
                <div className="w-14 h-14 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 flex items-center justify-center shadow-inner">
                  <BookOpen className="w-7 h-7 text-indigo-400" />
                </div>
                <span className="px-3 py-1 rounded-full text-[11px] font-semibold font-mono uppercase tracking-wider bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
                  Self-Paced Learning
                </span>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-white tracking-tight">
                  Mock Preparation
                </h2>
                <p className="text-sm text-slate-300 mt-2 leading-relaxed">
                  Learn how to answer common company HR interview questions before attending a real-time practice interview.
                </p>
              </div>

              {/* Feature Checklist */}
              <div className="space-y-3 pt-2 border-t border-slate-800/80">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Included Features:
                </p>
                <ul className="space-y-2.5 text-xs text-slate-300">
                  <li className="flex items-start space-x-2.5">
                    <CheckCircle2 className="w-4 h-4 text-indigo-400 flex-shrink-0 mt-0.5" />
                    <span>Display common HR interview questions.</span>
                  </li>
                  <li className="flex items-start space-x-2.5">
                    <CheckCircle2 className="w-4 h-4 text-indigo-400 flex-shrink-0 mt-0.5" />
                    <span>Show suggested professional answers.</span>
                  </li>
                  <li className="flex items-start space-x-2.5">
                    <CheckCircle2 className="w-4 h-4 text-indigo-400 flex-shrink-0 mt-0.5" />
                    <span>Explain how to structure an effective answer.</span>
                  </li>
                  <li className="flex items-start space-x-2.5">
                    <CheckCircle2 className="w-4 h-4 text-indigo-400 flex-shrink-0 mt-0.5" />
                    <span>Highlight key points that HR interviewers look for.</span>
                  </li>
                  <li className="flex items-start space-x-2.5">
                    <CheckCircle2 className="w-4 h-4 text-indigo-400 flex-shrink-0 mt-0.5" />
                    <span>Show what HR interviewers look for in each question.</span>
                  </li>
                  <li className="flex items-start space-x-2.5">
                    <CheckCircle2 className="w-4 h-4 text-indigo-400 flex-shrink-0 mt-0.5" />
                    <span>Highlight common mistakes candidates make.</span>
                  </li>
                  <li className="flex items-start space-x-2.5">
                    <CheckCircle2 className="w-4 h-4 text-indigo-400 flex-shrink-0 mt-0.5" />
                    <span>Include tips for improving speaking and writing skills.</span>
                  </li>
                  <li className="flex items-start space-x-2.5">
                    <CheckCircle2 className="w-4 h-4 text-indigo-400 flex-shrink-0 mt-0.5" />
                    <span>Allow students to practice speaking or writing answers with immediate feedback.</span>
                  </li>
                  <li className="flex items-start space-x-2.5">
                    <CheckCircle2 className="w-4 h-4 text-indigo-400 flex-shrink-0 mt-0.5" />
                    <span>Mark questions as completed after practicing.</span>
                  </li>
                  <li className="flex items-start space-x-2.5">
                    <CheckCircle2 className="w-4 h-4 text-indigo-400 flex-shrink-0 mt-0.5" />
                    <span>Target company customization.</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* CTA Button */}
            <div className="pt-8 relative z-10">
              <button
                type="button"
                onClick={() => setHrMode('MOCK')}
                className="w-full py-4 px-6 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-xl shadow-indigo-600/30 transition-all hover:scale-[1.02] flex items-center justify-center space-x-2.5 cursor-pointer"
              >
                <BookOpen className="w-4 h-4" />
                <span>Start Mock Preparation</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <p className="text-[11px] text-center text-slate-400 mt-2.5">
                Self-paced preparation • Study sample answers • No score penalties
              </p>
            </div>
          </div>

          {/* OPTION 2: PRACTICE PREPARATION */}
          <div className="rounded-3xl bg-slate-900/90 border border-slate-800 hover:border-purple-500/60 transition-all duration-300 p-7 flex flex-col justify-between shadow-2xl relative overflow-hidden group hover:shadow-purple-500/10">
            <div className="absolute top-0 right-0 w-48 h-48 bg-purple-600/10 rounded-full blur-3xl pointer-events-none group-hover:bg-purple-600/20 transition-all duration-500" />

            <div className="space-y-6 relative z-10">
              {/* Card Header */}
              <div className="flex items-start justify-between gap-4">
                <div className="w-14 h-14 rounded-2xl bg-purple-600/20 border border-purple-500/30 text-purple-400 flex items-center justify-center shadow-inner">
                  <MessagesSquare className="w-7 h-7 text-purple-400" />
                </div>
                <span className="px-3 py-1 rounded-full text-[11px] font-semibold font-mono uppercase tracking-wider bg-purple-500/15 text-purple-300 border border-purple-500/30">
                  Live Spoken AI Simulation
                </span>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-white tracking-tight">
                  Practice Preparation
                </h2>
                <p className="text-sm text-slate-300 mt-2 leading-relaxed">
                  Attend a live AI-powered HR interview and improve your performance through realistic practice.
                </p>
              </div>

              {/* Feature Checklist */}
              <div className="space-y-3 pt-2 border-t border-slate-800/80">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Included Features:
                </p>
                <ul className="space-y-2.5 text-xs text-slate-300">
                  <li className="flex items-start space-x-2.5">
                    <CheckCircle2 className="w-4 h-4 text-purple-400 flex-shrink-0 mt-0.5" />
                    <span>Spoken questions by AI interviewer.</span>
                  </li>
                  <li className="flex items-start space-x-2.5">
                    <CheckCircle2 className="w-4 h-4 text-purple-400 flex-shrink-0 mt-0.5" />
                    <span>Speech recognition and spoken answers.</span>
                  </li>
                  <li className="flex items-start space-x-2.5">
                    <CheckCircle2 className="w-4 h-4 text-purple-400 flex-shrink-0 mt-0.5" />
                    <span>Natural conversation flow with relevant follow-up questions.</span>
                  </li>
                  <li className="flex items-start space-x-2.5">
                    <CheckCircle2 className="w-4 h-4 text-purple-400 flex-shrink-0 mt-0.5" />
                    <span>Real-time environment monitoring (camera, lighting, presence).</span>
                  </li>
                  <li className="flex items-start space-x-2.5">
                    <CheckCircle2 className="w-4 h-4 text-purple-400 flex-shrink-0 mt-0.5" />
                    <span>Time-limited responses with optional extensions.</span>
                  </li>
                  <li className="flex items-start space-x-2.5">
                    <CheckCircle2 className="w-4 h-4 text-purple-400 flex-shrink-0 mt-0.5" />
                    <span>Comprehensive scorecard and improvement plan at the end.</span>
                  </li>
                  <li className="flex items-start space-x-2.5">
                    <CheckCircle2 className="w-4 h-4 text-purple-400 flex-shrink-0 mt-0.5" />
                    <span>Target company customization.</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* CTA Button */}
            <div className="pt-8 relative z-10">
              <button
                type="button"
                onClick={() => setHrMode('PRACTICE')}
                className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-bold text-sm shadow-xl shadow-purple-600/30 transition-all hover:scale-[1.02] flex items-center justify-center space-x-2.5 cursor-pointer"
              >
                <MessagesSquare className="w-4 h-4" />
                <span>Start Practice Preparation</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <p className="text-[11px] text-center text-slate-400 mt-2.5">
                Full AI interview simulation • Real-time scoring • Generates official round report
              </p>
            </div>
          </div>
        </div>

        {/* Helpful Recommendation Note */}
        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 text-slate-400 text-xs flex items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <span className="text-lg">💡</span>
            <p>
              <strong className="text-slate-200">Recommended Preparation Flow:</strong> We recommend completing <span className="text-indigo-400 font-semibold">Mock Preparation</span> to study sample answers and practice speaking freely before starting the time-limited <span className="text-purple-400 font-semibold">Practice Preparation</span> round.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // VIEW 0.5: HR MOCK PREPARATION WORKBENCH
  // =========================================================================
  if (hrMode === 'MOCK') {
    return (
      <HRMockPreparationModule
        parsedResume={parsedResume}
        profileDepartment={profileDepartment}
        targetCompany={targetCompany}
        onBackToModeSelection={() => setHrMode('SELECTION')}
        onSwitchToPractice={() => setHrMode('PRACTICE')}
      />
    );
  }

  // =========================================================================
  // VIEW 1: PRE-FLIGHT HR INTERVIEW SETUP (PRACTICE PREPARATION)
  // =========================================================================
  if (interviewState === 'SETUP') {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
        {/* Navigation & Mode Bar */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <button
            type="button"
            onClick={() => setHrMode('SELECTION')}
            className="inline-flex items-center space-x-2 text-xs font-semibold text-slate-400 hover:text-white px-3.5 py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>← Back to Mode Selection</span>
          </button>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-semibold">
            <MessagesSquare className="w-3.5 h-3.5" />
            <span>Mode: Practice Preparation (Live AI Interview)</span>
          </div>
        </div>

        {/* Header */}
        <div className="text-center max-w-2xl mx-auto">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Interactive Real-Time Voice HR Interview</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            AI HR Personal Interview Setup
          </h1>
          <p className="text-sm text-slate-400 mt-2">
            Experience a realistic two-way spoken interview. The AI interviewer speaks questions automatically, listens to your voice, and generates NLP feedback with STAR scoring.
          </p>
        </div>

        {/* Resume Awareness Badge */}
        {parsedResume ? (
          <div className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-between gap-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-600/20 text-indigo-300 flex items-center justify-center font-bold text-sm">
                <FileText className="w-5 h-5 text-indigo-400" />
              </div>
              <div>
                <p className="text-xs font-bold text-white">
                  Resume-Aware HR Interview Ready for <span className="text-indigo-300">{parsedResume.fullName}</span>
                </p>
                <p className="text-[11px] text-slate-300">
                  {isNonTech ? 'Discipline / Field: ' : 'Engineering Branch: '}
                  <strong className="text-emerald-400">{displayDiscipline}</strong> • {parsedResume.projects?.length || 0} Projects Connected
                </p>
              </div>
            </div>
            <span className="text-[10px] px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-semibold font-mono hidden sm:inline">
              ✓ Personalized Q&A
            </span>
          </div>
        ) : (
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between gap-4">
            <div className="flex items-center space-x-3">
              <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0" />
              <div>
                <p className="text-xs font-bold text-amber-300">General HR Interview Mode</p>
                <p className="text-[11px] text-slate-300">
                  No resume is currently uploaded. Uploading your resume in the Resume Parser will unlock personalized questions on your capstone projects.
                </p>
              </div>
            </div>
            <button
              onClick={() => onNavigate('resume')}
              className="px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-bold"
            >
              Upload Resume
            </button>
          </div>
        )}

        {/* Target Company Selection (Optional) */}
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-indigo-400" />
                <span>Target Company (Optional)</span>
              </h3>
              <p className="text-[11px] text-slate-400">
                Specify a company to tailor Question 4 and company-specific follow-ups, or leave blank for a general professional interview.
              </p>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono self-start sm:self-auto">
              Not Compulsory
            </span>
          </div>

          <div className="space-y-3">
            <input
              type="text"
              value={targetCompany}
              onChange={(e) => {
                setTargetCompany(e.target.value);
                setConfig({ ...config, targetCompany: e.target.value });
              }}
              placeholder="e.g. Google, TCS, Infosys, Tata Motors, L&T, Microsoft (or leave empty for General)..."
              className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
            <div className="flex flex-wrap items-center gap-1.5 text-xs">
              <span className="text-[11px] text-slate-400 mr-1">Quick Select:</span>
              {['General / Any Company', 'Google', 'Microsoft', 'Amazon', 'TCS', 'Infosys', 'Tata Motors', 'L&T'].map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => {
                    const val = c.startsWith('General') ? '' : c;
                    setTargetCompany(val);
                    setConfig({ ...config, targetCompany: val });
                  }}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition-all cursor-pointer ${
                    (c.startsWith('General') && !targetCompany) || targetCompany.toLowerCase() === c.toLowerCase()
                      ? 'bg-indigo-600/30 border-indigo-500 text-indigo-200'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 7-Question Structure Preview Card */}
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center">
                <Award className="w-4 h-4 text-indigo-400" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Company-Style 7 Main HR Interview Questions</h3>
                <p className="text-[11px] text-slate-400">Questions are spoken one-by-one with natural two-way voice interaction and intelligent follow-ups</p>
              </div>
            </div>
            <span className="text-[10px] px-2.5 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 font-mono font-bold">
              7 Sequential Questions
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 text-xs">
            {SEVEN_MAIN_HR_QUESTIONS.map((q) => (
              <div key={q.index} className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 flex items-start space-x-2.5">
                <span className="w-5 h-5 rounded-md bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 font-mono font-bold text-[10px] flex items-center justify-center flex-shrink-0 mt-0.5">
                  {q.index + 1}
                </span>
                <div className="min-w-0">
                  <p className="font-bold text-slate-200 truncate">{q.shortTitle}</p>
                  <p className="text-[10px] text-slate-400 line-clamp-1">{q.expectedConcepts[0]}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Configuration Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl">
          {/* 1. Interview Type */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
              Interview Track
            </label>
            <div className="grid grid-cols-1 gap-2">
              {(['HR Personal Interview', 'Behavioral Interview', 'Communication Practice'] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setConfig({ ...config, type: t })}
                  className={`p-3 rounded-xl text-left border text-xs transition-all flex items-center justify-between ${
                    config.type === t
                      ? 'bg-indigo-600/20 border-indigo-500 text-white font-bold ring-1 ring-indigo-500/50'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <span>{t}</span>
                  {config.type === t && <CheckCircle2 className="w-4 h-4 text-indigo-400" />}
                </button>
              ))}
            </div>
          </div>

          {/* 2. Difficulty & Style */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                Challenge Level
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['Beginner', 'Intermediate', 'Advanced'] as const).map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setConfig({ ...config, difficulty: d })}
                    className={`py-2.5 rounded-xl text-xs font-bold transition-all ${
                      config.difficulty === d
                        ? 'bg-indigo-600 text-white shadow-md'
                        : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-slate-200'
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                Interviewer Persona & Tone
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['Friendly', 'Professional', 'Challenging'] as const).map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setConfig({ ...config, style: s })}
                    className={`py-2.5 rounded-xl text-xs font-bold transition-all ${
                      config.style === s
                        ? 'bg-purple-600 text-white shadow-md'
                        : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-slate-200'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 3. Duration */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
              Interview Duration
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[5, 10, 15].map((mins) => (
                <button
                  key={mins}
                  type="button"
                  onClick={() => setConfig({ ...config, durationMinutes: mins as 5 | 10 | 15 })}
                  className={`p-3 rounded-xl text-center border text-xs transition-all ${
                    config.durationMinutes === mins
                      ? 'bg-emerald-600/20 border-emerald-500 text-emerald-200 font-bold ring-1 ring-emerald-500/50'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <p className="font-extrabold text-base">{mins} Mins</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">{mins === 5 ? '3 Questions' : mins === 10 ? '5 Questions' : '7 Questions'}</p>
                </button>
              ))}
            </div>
          </div>

          {/* 4. Language & Answer Limit */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
              Answer Time Limit Per Question
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { sec: 180, label: '3 Mins', sub: 'Standard' },
                { sec: 300, label: '5 Mins', sub: 'Recommended' },
                { sec: 600, label: '10 Mins', sub: 'Extended' }
              ].map(({ sec, label, sub }) => (
                <button
                  key={sec}
                  type="button"
                  onClick={() => setConfig({ ...config, answerTimeLimitSeconds: sec })}
                  className={`p-3 rounded-xl text-center border text-xs transition-all ${
                    config.answerTimeLimitSeconds === sec
                      ? 'bg-indigo-600/20 border-indigo-500 text-indigo-200 font-bold ring-1 ring-indigo-500/50'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <p className="font-extrabold text-base">{label}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">{sub} ({Math.round(sec / 60)}m)</p>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Environment Monitoring & Fair Assessment Policy Disclosure */}
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
            <div className="flex items-center space-x-2.5">
              <div className="w-9 h-9 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5 text-indigo-400" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Interview Environment Monitoring & Fair Assessment Policy</h3>
                <p className="text-[11px] text-slate-400">Automated client-side environment verification for campus interview integrity</p>
              </div>
            </div>
            <span className="text-[10px] font-mono font-bold px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
              Client-Side Local Only
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
            <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800/80 space-y-1">
              <div className="flex items-center space-x-1.5 text-indigo-400 font-bold text-[11px]">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Zero Server Uploads</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Video feeds, frame data, and audio streams are processed entirely within your browser. Nothing is recorded or uploaded to remote servers.
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800/80 space-y-1">
              <div className="flex items-center space-x-1.5 text-amber-400 font-bold text-[11px]">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>1-Warning Disruption Policy</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                If sustained absence or camera obstruction (&gt; 5 seconds) occurs, you receive 1 non-punitive warning and the timer pauses so you can adjust.
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800/80 space-y-1">
              <div className="flex items-center space-x-1.5 text-emerald-400 font-bold text-[11px]">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Objective & Fair</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                The system monitors hardware and visibility signals only. We never claim to detect emotions, deception, or make subjective inferences.
              </p>
            </div>
          </div>

          {/* Consent Toggle */}
          <div className="p-3.5 rounded-2xl bg-indigo-950/20 border border-indigo-500/30 flex items-center justify-between gap-4">
            <label className="flex items-center space-x-3 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={hasEnvironmentConsent}
                onChange={(e) => setHasEnvironmentConsent(e.target.checked)}
                className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-700 bg-slate-900 cursor-pointer"
              />
              <span className="text-xs font-semibold text-slate-200">
                I acknowledge and consent to client-side interview environment monitoring for this round.
              </span>
            </label>
            <span className="text-[10px] text-indigo-300 font-mono hidden sm:inline">Transparent Policy</span>
          </div>
        </div>

        {/* Start Button */}
        <div className="text-center pt-2">
          <button
            type="button"
            onClick={handleStartInterview}
            className="px-10 py-4 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold text-base shadow-xl shadow-indigo-600/25 transition-all hover:scale-105 inline-flex items-center space-x-3 cursor-pointer"
          >
            <Play className="w-5 h-5 fill-white" />
            <span>Start HR Interview</span>
            <ArrowRight className="w-5 h-5" />
          </button>
          <p className="text-[11px] text-slate-400 mt-2">
            Microphone access will be requested when your answer begins. You can also type your answer at any point.
          </p>
        </div>
      </div>
    );
  }

  // =========================================================================
  // VIEW 1.5: INTERRUPTED HR INTERVIEW SCREEN
  // =========================================================================
  if (interviewState === 'INTERRUPTED') {
    const elapsedFormatted = interruptedReport?.elapsedDuration || formatElapsedDuration(Math.max(0, (config.durationMinutes * 60) - totalTimeLeft));
    const preservedCount = evaluations.length;
    const preservedStatusText = interruptedReport?.preservedAnswersStatus || (preservedCount > 0 ? `Saved (${preservedCount} preserved)` : 'None submitted');

    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 animate-fade-in">
        {/* Interrupted Banner */}
        <div className="p-8 rounded-3xl bg-slate-900 border border-rose-500/30 text-center space-y-5 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-500 via-rose-500 to-red-600" />
          <div className="w-16 h-16 rounded-2xl bg-rose-500/10 text-rose-400 border border-rose-500/30 flex items-center justify-center mx-auto shadow-lg">
            <ShieldAlert className="w-8 h-8" />
          </div>

          <div>
            <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs font-bold mb-2">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>3-Warning Rule Enforced</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
              HR Practice Interview Ended — Repeated Extra-Person Detection.
            </h1>
            <p className="text-xs text-rose-300/90 font-medium max-w-xl mx-auto mt-1">
              HR Behaviour Interview Interrupted
            </p>
            <p className="text-xs text-slate-300 max-w-xl mx-auto mt-2 leading-relaxed">
              In accordance with CareerCurve's 3-Warning Rule, this practice interview was automatically ended following 3 warnings and a 4th confirmed extra-person detection in your camera view.
            </p>
          </div>

          {/* Section 3 Required: Termination Incident Summary Card */}
          <div className="p-5 rounded-2xl bg-slate-950/90 border border-slate-800 text-left space-y-3 shadow-inner">
            <div className="text-xs font-bold text-slate-300 uppercase tracking-wider pb-1 border-b border-slate-800/80 flex items-center justify-between">
              <span>Termination Incident Summary</span>
              <span className="text-[10px] text-amber-400 font-mono font-semibold">Policy: 3-Warning Rule</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="space-y-0.5">
                <span className="text-slate-400 block text-[11px]">Reason:</span>
                <span className="text-white font-semibold">
                  {interruptedReport?.reason || 'HR Practice Interview Ended — Repeated Extra-Person Detection.'}
                </span>
              </div>
              <div className="space-y-0.5">
                <span className="text-slate-400 block text-[11px]">Warning count:</span>
                <span className="text-amber-400 font-mono font-bold">3 of 3</span>
              </div>
              <div className="space-y-0.5">
                <span className="text-slate-400 block text-[11px]">Repeat incident:</span>
                <span className="text-rose-300 font-semibold">
                  {interruptedReport?.repeatIncident || 'Fourth confirmed extra-person event after 3 warnings'}
                </span>
              </div>
              <div className="space-y-0.5">
                <span className="text-slate-400 block text-[11px]">Interview duration:</span>
                <span className="text-indigo-300 font-mono font-bold">
                  {elapsedFormatted}
                </span>
              </div>
              <div className="space-y-0.5">
                <span className="text-slate-400 block text-[11px]">Questions completed:</span>
                <span className="text-white font-mono font-bold">
                  {interruptedReport?.completedAnswersCount ?? evaluations.length}
                </span>
              </div>
              <div className="space-y-0.5">
                <span className="text-slate-400 block text-[11px]">Submitted answers preserved:</span>
                <span className="text-emerald-400 font-semibold">
                  {preservedStatusText}
                </span>
              </div>
            </div>
          </div>

          {/* Policy Disclosure Note */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-left space-y-2 text-xs">
            <div className="flex items-center space-x-2 text-indigo-400 font-bold">
              <ShieldCheck className="w-4 h-4" />
              <span>Assessment Fairness & Integrity Notice</span>
            </div>
            <p className="text-slate-300 leading-relaxed">
              Extra-person monitoring is conducted solely to ensure single-candidate practice integrity. Dark lighting, brightness changes, shadows, and camera exposure are completely excluded and never trigger warnings. Evaluated responses prior to disruption have been fully preserved.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => setShowSavedAnswersModal(true)}
              className="px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-indigo-300 hover:text-white font-bold text-xs border border-indigo-500/30 transition-all flex items-center space-x-2 cursor-pointer shadow-md"
            >
              <FileText className="w-4 h-4" />
              <span>Review Saved Answers ({evaluations.length})</span>
            </button>
            <button
              type="button"
              onClick={handleRetakeRound}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-purple-600/25 transition-all flex items-center space-x-2 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Retake HR Behaviour Round</span>
            </button>
            <button
              type="button"
              onClick={handleReturnToSetup}
              className="px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs border border-slate-700 transition-all flex items-center space-x-2 cursor-pointer"
            >
              <ArrowRight className="w-4 h-4 rotate-180" />
              <span>Return to Interview Setup</span>
            </button>
          </div>
        </div>

        {/* Logged Disruption Events Table */}
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4 text-amber-400" />
              <h3 className="text-sm font-bold text-white">Recorded Disruption Events ({monitoringState.events.length})</h3>
            </div>
            <span className="text-[10px] text-slate-400 font-mono">3-Warning Rule Policy</span>
          </div>

          <div className="space-y-2.5">
            {monitoringState.events.map((evt, idx) => (
              <div
                key={evt.id || idx}
                className={`p-3.5 rounded-2xl border flex items-start space-x-3 text-xs ${
                  evt.severity === 'interruption'
                    ? 'bg-rose-950/20 border-rose-500/30 text-rose-200'
                    : 'bg-amber-950/20 border-amber-500/30 text-amber-200'
                }`}
              >
                <div className={`w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 font-bold text-[11px] ${
                  evt.severity === 'interruption' ? 'bg-rose-500/20 text-rose-300' : 'bg-amber-500/20 text-amber-300'
                }`}>
                  {idx + 1}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white">
                      {evt.severity === 'interruption' ? 'Fourth Detection (Practice Interview Ended)' : evt.categoryLabel}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">{evt.timestamp}</span>
                  </div>
                  <p className="text-[11px] text-slate-300 mt-0.5">{evt.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Preserved Evaluated Questions */}
        {evaluations.length > 0 ? (
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <Award className="w-5 h-5 text-indigo-400" />
                <h3 className="text-sm font-bold text-white">Preserved Evaluations Prior to Interruption ({evaluations.length})</h3>
              </div>
              <span className="text-[10px] text-emerald-400 font-bold font-mono">Scores Saved</span>
            </div>

            <div className="space-y-3">
              {evaluations.map((evalItem, idx) => (
                <div key={idx} className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white">Question {idx + 1}: {evalItem.questionText}</span>
                    <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-mono font-bold text-[10px]">
                      {evalItem.overallScore}% ({evalItem.ratingBand})
                    </span>
                  </div>
                  <p className="text-slate-400 italic text-[11px] line-clamp-2">"{evalItem.userAnswerText}"</p>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="p-4 rounded-2xl bg-slate-900/50 border border-slate-800 text-center text-xs text-slate-400">
            No answers were evaluated prior to the interruption. You can retake the round whenever you are ready.
          </div>
        )}

        {/* Saved Answers Review Modal */}
        {showSavedAnswersModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
            <div className="max-w-3xl w-full bg-slate-900 border border-indigo-500/30 rounded-3xl p-6 space-y-5 shadow-2xl max-h-[85vh] overflow-y-auto">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center space-x-2.5">
                  <Award className="w-5 h-5 text-indigo-400" />
                  <h3 className="text-base font-bold text-white">Review Saved HR Interview Answers</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setShowSavedAnswersModal(false)}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {evaluations.length === 0 ? (
                <p className="text-xs text-slate-400 py-6 text-center">
                  No answers were evaluated prior to the interview interruption.
                </p>
              ) : (
                <div className="space-y-4">
                  {evaluations.map((evalItem, idx) => (
                    <div key={idx} className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-indigo-300">Question {idx + 1}: {evalItem.questionText}</span>
                        <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-mono font-bold text-[11px]">
                          {evalItem.overallScore}% ({evalItem.ratingBand})
                        </span>
                      </div>
                      <div className="p-3 rounded-xl bg-slate-900 border border-slate-800/80 text-slate-300 italic">
                        "{evalItem.userAnswerText}"
                      </div>
                      <div className="text-[11px] text-slate-400">
                        <strong className="text-slate-300">Evaluation Feedback: </strong>
                        {evalItem.explanation}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={() => setShowSavedAnswersModal(false)}
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs cursor-pointer shadow-md"
                >
                  Close Review
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // =========================================================================
  // VIEW 2: ACTIVE TWO-WAY SPOKEN INTERVIEW SCREEN
  // =========================================================================
  if (interviewState !== 'COMPLETED') {
    const isAiSpeaking = interviewState === 'ASKING_QUESTION' || interviewState === 'GIVING_FEEDBACK' || interviewState === 'SPEAKING_FEEDBACK_OR_FOLLOW_UP';
    const isCandidateListening = interviewState === 'WAITING_FOR_ANSWER' || interviewState === 'LISTENING_TO_STUDENT' || interviewState === 'TRANSCRIBING';
    const isEvaluating = interviewState === 'PROCESSING_ANSWER' || interviewState === 'EVALUATING_ANSWER';

    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 animate-fade-in relative">
        {/* Top Control Bar with Timers & Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-lg">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="px-3 py-1.5 rounded-xl bg-indigo-600/20 text-indigo-300 font-mono text-xs font-bold border border-indigo-500/30">
              Question {mainQuestionIdx + 1} of 7 — {SEVEN_MAIN_HR_QUESTIONS[mainQuestionIdx]?.shortTitle || 'Introduction'}
            </span>
            {followUpCount > 0 && (
              <span className="px-2.5 py-1 rounded-lg bg-purple-500/20 text-purple-300 font-mono text-[11px] font-bold border border-purple-500/40 animate-pulse">
                Follow-Up {followUpCount} of 2
              </span>
            )}
            <span className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-[11px] font-mono text-slate-300">
              Completed: {mainQuestionIdx}/7
            </span>
            <span className={`px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold border ${
              isAiSpeaking
                ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40'
                : isCandidateListening
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 animate-pulse'
                : isEvaluating
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                : 'bg-slate-950 text-slate-300 border-slate-800'
            }`}>
              {isAiSpeaking ? 'AI Speaking' : isCandidateListening ? '● Mic Listening' : isEvaluating ? 'Analyzing...' : 'Ready'}
            </span>
            {targetCompany && (
              <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-[11px] font-semibold hidden lg:inline">
                Target: {targetCompany}
              </span>
            )}
          </div>

          <div className="flex items-center space-x-3">
            {/* Answer countdown */}
            <div
              className={`flex items-center space-x-2 px-3 py-1.5 rounded-xl border text-xs font-mono font-bold ${
                questionTimeLeft <= 15
                  ? 'bg-rose-500/10 border-rose-500/40 text-rose-400 animate-pulse'
                  : 'bg-slate-950 border-slate-800 text-amber-400'
              }`}
              title="Answer time remaining"
            >
              <Clock className="w-4 h-4" />
              <span>Answer: {formatSeconds(questionTimeLeft)}</span>
            </div>

            {/* Total Interview Time Elapsed */}
            <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-slate-300" title="Interview elapsed time">
              <span>Time: {formatSeconds(totalTimeElapsedSeconds)}</span>
            </div>

            {/* Pause / Resume Interview Timer & Audio */}
            <button
              onClick={handleTogglePause}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
              title={isPaused ? 'Resume interview' : 'Pause interview'}
            >
              {isPaused ? <Play className="w-4 h-4 text-emerald-400" /> : <Pause className="w-4 h-4" />}
            </button>

            {/* Repeat Question */}
            <button
              onClick={handleRepeatQuestion}
              disabled={isEvaluating}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors disabled:opacity-40 cursor-pointer"
              title="Repeat current question aloud"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            {/* Pause / Resume Spoken Question Audio */}
            {isAiSpeaking && (
              <button
                onClick={handleToggleTtsPause}
                className="p-2 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 hover:text-white border border-indigo-500/30 transition-colors cursor-pointer"
                title={isTtsPaused ? 'Resume question speech' : 'Pause question speech'}
              >
                {isTtsPaused ? <Play className="w-4 h-4 text-emerald-400" /> : <Pause className="w-4 h-4 text-indigo-300" />}
              </button>
            )}

            {/* Mute AI Voice */}
            <button
              onClick={toggleMute}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
              title={isMuted ? 'Unmute AI voice' : 'Mute AI voice'}
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
            </button>

            {/* End Interview */}
            <button
              onClick={() => handleFinishInterview()}
              className="px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-bold transition-colors cursor-pointer"
              title="End interview and view report"
            >
              End Interview
            </button>
          </div>
        </div>

        {/* Camera Access Troubleshooting Banner (Access Notice, not Misconduct) */}
        {cameraAccessError && (
          <div className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-200 text-xs flex items-center justify-between gap-3 shadow-md">
            <div className="flex items-center space-x-2.5">
              <Video className="w-5 h-5 text-indigo-400 flex-shrink-0" />
              <div>
                <span className="font-bold text-indigo-300">Camera Access Notice: </span>
                <span>Camera feed is currently unavailable ({cameraAccessError}). Please verify camera permissions in your browser. This is an access notice, not a policy warning.</span>
              </div>
            </div>
          </div>
        )}

        {/* Prominent Warning 1 & 2 Alert Banner */}
        {activeWarningMessage && !isWarningPaused && (
          <div className="mb-4 p-4 rounded-2xl bg-amber-950/70 border-2 border-amber-500/60 shadow-2xl flex items-start justify-between gap-4 animate-in fade-in slide-in-from-top-2">
            <div className="flex items-start space-x-3">
              <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 flex-shrink-0 mt-0.5">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-1 flex items-center space-x-2">
                  <span>{activeWarningTitle || `Warning ${monitoringState.warningCount}/3`}</span>
                  <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px]">Policy Notice</span>
                </div>
                <p className="text-sm font-semibold text-white leading-relaxed">
                  {activeWarningMessage}
                </p>
                <p className="text-xs text-amber-200/80 mt-1">
                  CareerCurve single-candidate policy: only one person is permitted in the camera view during the interview.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleDismissWarning}
              className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-all shadow-md cursor-pointer flex-shrink-0"
            >
              I Understand
            </button>
          </div>
        )}

        {/* Warning 3 / Pause Limit Reached Modal */}
        {isWarningPaused && (
          <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
            <div className="max-w-lg w-full bg-slate-900 border-2 border-amber-500/80 rounded-3xl p-6 shadow-2xl space-y-5 animate-in zoom-in-95">
              <div className="flex items-center space-x-3">
                <div className="p-3 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400">
                  <AlertCircle className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Camera & Interview Paused</h3>
                  <p className="text-xs font-mono font-semibold text-amber-400">Warning Limit Reached (3/3)</p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                <p className="text-sm font-bold text-amber-300 leading-relaxed">
                  {activeWarningMessage || "Warning 3 of 3: Final warning. Multiple people have been detected. Your camera and interview will now be paused."}
                </p>
                <p className="text-xs text-slate-300 leading-relaxed">
                  In accordance with CareerCurve interview policy, your camera hardware stream and interview progression have been paused because multiple people were detected three times.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-emerald-950/30 border border-emerald-500/30 text-xs text-emerald-300 space-y-1">
                <div className="flex items-center space-x-1.5 font-bold text-emerald-400">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Your Interview Data Is Safe</span>
                </div>
                <p className="text-slate-300">
                  All your answered questions ({evaluations.length}), evaluations, timer progress, and resume details are preserved.
                </p>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
                <button
                  type="button"
                  onClick={handleResumeFromWarningPause}
                  className="w-full py-3 px-5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm transition-all shadow-lg shadow-indigo-600/30 flex items-center justify-center space-x-2 cursor-pointer"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Resume Camera & Interview</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Main Split Panel: Virtual Interviewer (Left) & Student Audio Desk (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* LEFT: Virtual Interviewer Panel (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            <InterviewerAvatar
              state={interviewState}
              interviewerName="Sarah Chen"
              interviewerRole="Senior HR Recruiter & Placement Lead"
              isMuted={isMuted}
            />

            {/* Candidate Live Webcam & Telemetry */}
            {/* Candidate Video Feed Section */}
            <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 space-y-3 shadow-xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                <span className="text-xs font-bold text-slate-200 flex items-center space-x-1.5">
                  <Video className="w-4 h-4 text-indigo-400" />
                  <span>Candidate Live Webcam</span>
                </span>
                <span className="text-[10px] text-slate-400 font-mono">Behavioral Preview</span>
              </div>
              <WebcamFeed
                showOverlayCanvas={true}
                compact={true}
                onTelemetryUpdate={handleTelemetryUpdate}
                onEnvironmentMetrics={handleEnvironmentMetrics}
                isPausedByPolicy={isWarningPaused}
                pausedMessage={activeWarningMessage || undefined}
                onResumeCamera={handleResumeFromWarningPause}
              />
              {activeWarningMessage && !isWarningPaused && (
                <div className="p-3 rounded-2xl bg-amber-950/80 border border-amber-500/60 text-xs text-amber-200 flex items-start space-x-2.5 shadow-xl animate-pulse">
                  <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-amber-300 block">{activeWarningTitle || `Warning ${monitoringState.warningCount}/3`}</span>
                    <span className="text-[11px] text-white leading-relaxed">{activeWarningMessage}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Compact Environment Status Panel */}
            <div className="p-4 rounded-3xl bg-slate-900 border border-slate-800 space-y-3 shadow-xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                <div className="flex items-center space-x-2">
                  <ShieldCheck className="w-4 h-4 text-indigo-400" />
                  <span className="text-xs font-bold text-white">Environment Monitor</span>
                </div>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono border ${
                  isWarningPaused || monitoringState.warningCount >= 3
                    ? 'bg-rose-500/10 border-rose-500/30 text-rose-400 animate-pulse'
                    : (activeWarningMessage && monitoringState.personCount >= 2)
                    ? 'bg-amber-500/10 border-amber-500/30 text-amber-300 animate-pulse'
                    : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                }`}>
                  {isWarningPaused || monitoringState.warningCount >= 3
                    ? `✖ Paused (${monitoringState.warningCount}/3)`
                    : (activeWarningMessage && monitoringState.personCount >= 2)
                    ? `▲ Warning (${monitoringState.warningCount}/3)`
                    : '● Normal'}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800/80 flex items-center justify-between">
                  <span className="text-slate-400">Camera</span>
                  <span className={`font-semibold ${
                    isWarningPaused
                      ? 'text-amber-400 font-mono text-[10px]'
                      : isPaused
                      ? 'text-amber-400'
                      : monitoringState.cameraStatus === 'Active'
                      ? 'text-emerald-400'
                      : monitoringState.cameraStatus === 'Off'
                      ? 'text-slate-400'
                      : 'text-rose-400'
                  }`}>
                    {isWarningPaused
                      ? 'Paused — Warning Limit Reached'
                      : isPaused
                      ? 'Paused'
                      : monitoringState.cameraStatus === 'Off'
                      ? 'Off'
                      : monitoringState.cameraStatus}
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800/80 flex items-center justify-between">
                  <span className="text-slate-400">Microphone</span>
                  <span className={`font-semibold ${
                    permissionError || monitoringState.micStatus === 'Denied'
                      ? 'text-rose-400'
                      : monitoringState.micStatus === 'Unavailable' || speechStatus === 'error'
                      ? 'text-amber-400'
                      : speechStatus === 'listening' || speechStatus === 'transcribing' || interviewState === 'LISTENING_TO_STUDENT'
                      ? 'text-emerald-400 animate-pulse'
                      : 'text-slate-300'
                  }`}>
                    {permissionError || monitoringState.micStatus === 'Denied'
                      ? 'Denied'
                      : monitoringState.micStatus === 'Unavailable' || speechStatus === 'error'
                      ? 'Unavailable'
                      : (speechStatus === 'listening' || speechStatus === 'transcribing' || interviewState === 'LISTENING_TO_STUDENT')
                      ? 'Active'
                      : 'Idle'}
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800/80 flex items-center justify-between">
                  <span className="text-slate-400">Monitor Status</span>
                  <span className={`font-semibold ${isPaused || isWarningPaused ? 'text-amber-400' : 'text-emerald-400'}`}>
                    {isPaused || isWarningPaused ? 'Paused' : 'Active'}
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800/80 flex items-center justify-between">
                  <span className="text-slate-400">Warning Count</span>
                  <span className={`font-semibold font-mono ${monitoringState.warningCount > 0 ? 'text-amber-400' : 'text-slate-300'}`}>
                    {monitoringState.warningCount}/3
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800/80 flex items-center justify-between">
                  <span className="text-slate-400">Multiple-Person Duration</span>
                  <span className={`font-semibold font-mono ${multiPersonDuration > 0 ? 'text-amber-400 animate-pulse' : 'text-slate-400'}`}>
                    {multiPersonDuration}s
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800/80 flex items-center justify-between col-span-2">
                  <span className="text-slate-400">Person Detection</span>
                  <span className={`font-mono text-[10px] flex items-center space-x-1.5 ${
                    !monitoringState.isPersonDetectionAvailable && monitoringState.personModelStatus !== 'ready'
                      ? 'text-slate-400'
                      : monitoringState.personCount >= 2
                      ? 'text-amber-400 font-bold'
                      : monitoringState.personCount === 0
                      ? 'text-slate-400'
                      : 'text-emerald-400 font-semibold'
                  }`}>
                    {!monitoringState.isPersonDetectionAvailable && monitoringState.personModelStatus !== 'ready' ? (
                      <span>Detection Unavailable</span>
                    ) : monitoringState.personCount >= 2 ? (
                      <>
                        <AlertCircle className="w-3.5 h-3.5 text-amber-400 animate-pulse flex-shrink-0" />
                        <span>Multiple People ({monitoringState.personCount} detected)</span>
                      </>
                    ) : monitoringState.personCount === 0 ? (
                      <span>No Person</span>
                    ) : (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                        <span>Single Person</span>
                      </>
                    )}
                  </span>
                </div>

                {cameraAccessError && (
                  <div className="p-2.5 rounded-xl bg-rose-950/40 border border-rose-500/30 text-[11px] text-rose-300 col-span-2">
                    <span className="font-semibold text-rose-200">Camera Notice: </span>
                    Camera access error ({cameraAccessError}). Please check webcam permissions. Hardware/permission errors are never treated as extra-person warnings.
                  </div>
                )}

                {monitoringState.events.length > 0 && (
                  <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800/80 flex items-center justify-between col-span-2">
                    <span className="text-slate-400">Recent Incident</span>
                    <span className="font-semibold text-amber-400 text-[10px] truncate max-w-[200px]" title={monitoringState.events[0].categoryLabel}>
                      {monitoringState.events[0].categoryLabel}
                    </span>
                  </div>
                )}
              </div>

              {/* Disruption Events Log List */}
              <div className="pt-1 border-t border-slate-800/60">
                <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1.5">
                  <span>Disruption Events ({monitoringState.events.length})</span>
                  <span>Local Browser Only</span>
                </div>
                {monitoringState.events.length === 0 ? (
                  <p className="text-[10px] text-slate-500 italic">No disruptions detected. Optimal interview environment.</p>
                ) : (
                  <div className="max-h-24 overflow-y-auto space-y-1 pr-1">
                    {monitoringState.events.map((evt) => (
                      <div key={evt.id} className="text-[10px] p-1.5 rounded-lg bg-slate-950 border border-slate-800/80 flex items-start space-x-1.5">
                        <span className="text-slate-400 font-mono flex-shrink-0">[{evt.timestamp}]</span>
                        <span className={evt.severity === 'warning' ? 'text-amber-400 font-bold flex-shrink-0' : 'text-rose-400 font-bold flex-shrink-0'}>
                          {evt.categoryLabel}:
                        </span>
                        <span className="text-slate-300 truncate">{evt.description}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* RIGHT: Live Question & Student Voice Desk (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            {/* Active Question Box */}
            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider flex items-center space-x-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>
                    {isAnsweringFollowUp ? 'Adaptive Follow-Up Question' : 'HR Question Prompt'}
                  </span>
                </span>
                {isAiSpeaking && (
                  <div className="flex items-center space-x-2">
                    <span className="text-[11px] text-indigo-300 font-mono animate-pulse flex items-center space-x-1">
                      <Volume2 className="w-3.5 h-3.5 text-indigo-400" />
                      <span>{isTtsPaused ? 'Question audio paused' : 'Speaking question aloud...'}</span>
                    </span>
                    <button
                      type="button"
                      onClick={handleAnswerNow}
                      className="px-2.5 py-1 rounded-lg bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-200 border border-indigo-500/40 text-[10px] font-bold transition-all cursor-pointer"
                      title="Interrupt audio and start speaking immediately"
                    >
                      Answer Now
                    </button>
                  </div>
                )}
              </div>

              {activeWarningMessage && !isWarningPaused && (
                <div className="p-3.5 rounded-2xl bg-amber-950/80 border-2 border-amber-500/70 text-xs text-amber-200 flex items-start space-x-2.5 shadow-xl animate-pulse">
                  <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-amber-300 block">{activeWarningTitle || `Warning ${monitoringState.warningCount}/3`}</span>
                    <span className="text-[11px] text-white leading-relaxed">{activeWarningMessage}</span>
                  </div>
                </div>
              )}

              <h2 className="text-lg sm:text-xl font-extrabold text-white leading-relaxed">
                "{activeQuestionText}"
              </h2>

              {/* TTS Controls Bar on Question */}
              <div className="flex items-center space-x-2 pt-1 border-t border-slate-800/60">
                <button
                  type="button"
                  onClick={handleRepeatQuestion}
                  disabled={isEvaluating}
                  className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-300 text-xs font-semibold flex items-center space-x-1.5 transition-colors disabled:opacity-40 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Repeat Question</span>
                </button>
                {isAiSpeaking && (
                  <button
                    type="button"
                    onClick={handleToggleTtsPause}
                    className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-300 text-xs font-semibold flex items-center space-x-1.5 transition-colors cursor-pointer"
                  >
                    {isTtsPaused ? (
                      <>
                        <Play className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Resume Speech</span>
                      </>
                    ) : (
                      <>
                        <Pause className="w-3.5 h-3.5 text-amber-400" />
                        <span>Pause Speech</span>
                      </>
                    )}
                  </button>
                )}
                <button
                  type="button"
                  onClick={toggleMute}
                  className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-300 text-xs font-semibold flex items-center space-x-1.5 transition-colors cursor-pointer"
                >
                  {isMuted ? (
                    <>
                      <VolumeX className="w-3.5 h-3.5 text-rose-400" />
                      <span>Unmute Voice</span>
                    </>
                  ) : (
                    <>
                      <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Mute Voice</span>
                    </>
                  )}
                </button>
              </div>

              {isPaused && !monitoringState.activeWarning && (
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>Interview is paused. Click the Play button in the top bar to resume.</span>
                </div>
              )}
            </div>

            {/* Permission or Error Warning if Microphone Denied */}
            {permissionError && (
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-start space-x-2.5 animate-fade-in shadow-lg">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-amber-400" />
                <div className="space-y-2 flex-1">
                  <p className="font-bold text-amber-300">Microphone / Audio Notice:</p>
                  <p className="text-slate-300 leading-relaxed">
                    {permissionError.includes('denied')
                      ? 'Microphone access was denied in your browser settings. You can type your answer directly in the box below and click "Submit Answer" at any time without penalty.'
                      : `${permissionError}. You can type your answer directly in the box below without penalty.`}
                  </p>
                  <div className="pt-1 flex items-center space-x-3">
                    <button
                      type="button"
                      onClick={startStudentListening}
                      className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs inline-flex items-center space-x-1.5 transition-all shadow-md cursor-pointer"
                    >
                      <Mic className="w-3.5 h-3.5" />
                      <span>Retry Microphone</span>
                    </button>
                    <span className="text-[11px] text-slate-400">Or type freely in the text box below</span>
                  </div>
                </div>
              </div>
            )}

            {/* Answer Time Limit Reached Banner (Explicit Extension or Submit prompt) */}
            {showAnswerTimeExtension && (
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/40 text-amber-200 text-xs space-y-3 animate-fade-in shadow-xl">
                <div className="flex items-start space-x-2.5">
                  <Clock className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-white text-sm">Answer Time Limit Reached</p>
                    <p className="text-slate-300 text-xs mt-0.5 leading-relaxed">
                      You have reached the allotted response window. Your drafted response is fully preserved. Would you like an explicit 2-minute extension to conclude, or submit your answer now?
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2 pt-1 pl-7">
                  <button
                    type="button"
                    onClick={() => handleExtendAnswerTime(120)}
                    className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md transition-all flex items-center space-x-1.5 cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Extend +2 Minutes</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowAnswerTimeExtension(false);
                      handleSubmitCurrentAnswer(false);
                    }}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-all flex items-center space-x-1.5 cursor-pointer"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Submit Answer Now</span>
                  </button>
                </div>
              </div>
            )}

            {/* Candidate Response Desk with Live Transcription & Editable Textarea */}
            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                <div className="flex items-center space-x-2">
                  <Mic className={`w-4 h-4 ${isCandidateListening ? 'text-emerald-400 animate-pulse' : 'text-slate-400'}`} />
                  <span className="text-xs font-bold text-white">Your Spoken & Editable Response</span>
                </div>

                <div className="flex items-center space-x-2">
                  {/* Status Indicator Badge */}
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono border ${
                    isCandidateListening
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 animate-pulse'
                      : isAiSpeaking
                      ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-300'
                      : permissionError
                      ? 'bg-amber-500/10 border-amber-500/30 text-amber-300'
                      : 'bg-slate-800 border-slate-700 text-slate-300'
                  }`}>
                    {isCandidateListening ? '● Mic Listening' : isAiSpeaking ? 'AI Speaking' : 'Ready / Review'}
                  </span>
                </div>
              </div>

              {/* Editable Answer Text Area Populated Automatically by Speech Recognition */}
              <div className="space-y-2">
                <div className="relative">
                  <textarea
                    rows={6}
                    value={candidateAnswer}
                    onChange={(e) => setCandidateAnswer(e.target.value)}
                    placeholder="Your spoken words will appear here in real-time as you speak. You can edit, refine, or type directly in this box at any time..."
                    className={`w-full p-4 rounded-2xl bg-slate-950 border text-sm leading-relaxed focus:outline-none transition-all resize-y ${
                      isCandidateListening
                        ? 'border-emerald-500/50 text-white ring-1 ring-emerald-500/30'
                        : 'border-slate-800 text-slate-200 focus:border-indigo-500'
                    }`}
                  />
                  {isCandidateListening && (
                    <div className="absolute top-3 right-3 flex items-center space-x-1 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-mono font-bold">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping inline-block" />
                      <span>Live Mic</span>
                    </div>
                  )}
                </div>

                {/* Helper row with words count and guidance */}
                <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-400 px-1">
                  <p className="flex items-center space-x-1">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Spoken words stream automatically into this box. Edit or type freely before submitting.</span>
                  </p>
                  <span className="font-mono text-slate-300 font-semibold">
                    {candidateAnswer.trim() ? candidateAnswer.trim().split(/\s+/).length : 0} words
                  </span>
                </div>
              </div>

              {/* Candidate Action Buttons */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-800/60">
                <div className="flex items-center space-x-2">
                  {/* Start / Stop Voice toggle */}
                  <button
                    type="button"
                    onClick={handleToggleVoiceInput}
                    disabled={isEvaluating}
                    className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-colors cursor-pointer disabled:opacity-40 ${
                      isCandidateListening
                        ? 'bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 border border-amber-500/30'
                        : 'bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30'
                    }`}
                  >
                    {isCandidateListening ? (
                      <>
                        <MicOff className="w-3.5 h-3.5 text-amber-400" />
                        <span>Stop Voice (Review Answer)</span>
                      </>
                    ) : (
                      <>
                        <Mic className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Start Voice Input</span>
                      </>
                    )}
                  </button>

                  {/* Clear & Retry Answer */}
                  <button
                    type="button"
                    onClick={handleRetryAnswer}
                    disabled={isEvaluating}
                    className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center space-x-1.5 transition-colors disabled:opacity-40 cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Clear & Retry</span>
                  </button>
                </div>

                {/* Submit Answer */}
                <button
                  type="button"
                  onClick={() => handleSubmitCurrentAnswer(false)}
                  disabled={isEvaluating || !candidateAnswer.trim()}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/25 transition-all flex items-center space-x-2 disabled:opacity-40 cursor-pointer"
                >
                  {isEvaluating ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Evaluating Answer...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Submit Answer</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Live Interview Context Banner when answering a follow-up */}
            {isAnsweringFollowUp && followUpHistory.length > 0 && (
              <div className="p-4 rounded-2xl bg-purple-950/40 border border-purple-500/40 space-y-2.5 text-xs animate-fade-in shadow-xl">
                <div className="flex items-center space-x-2 text-purple-300 font-bold">
                  <Sparkles className="w-4 h-4 text-purple-400" />
                  <span>AI Recruiter Clarification • Follow-Up {followUpCount} of 2</span>
                </div>
                <p className="text-slate-300 text-[11px] leading-relaxed">
                  The interviewer is asking you to elaborate on your previous answer. Speak or type your follow-up answer in the box above and click "Submit Answer".
                </p>
                <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Your Initial Response:</span>
                  <p className="text-slate-300 italic text-[11px] line-clamp-2">
                    "{followUpHistory[followUpHistory.length - 1]?.candidateAnswer}"
                  </p>
                </div>
              </div>
            )}

            {/* General Conversational Guidance Bar */}
            {!isAnsweringFollowUp && (
              <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 text-xs text-slate-400 flex items-center justify-between gap-3 shadow-md">
                <div className="flex items-center space-x-2.5">
                  <Sparkles className="w-4 h-4 text-indigo-400 flex-shrink-0" />
                  <span>
                    Realistic Company-Style Spoken Interview • Speak naturally into your microphone or type your response. When ready, click <strong>"Submit Answer"</strong>.
                  </span>
                </div>
                <span className="text-[10px] font-mono text-slate-500 hidden sm:inline">2-Way Natural Voice</span>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // VIEW 3: FINAL COMPREHENSIVE HR INTERVIEW SCORECARD
  // =========================================================================
  if (!sessionReport) return null;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      {/* Top Banner */}
      <div className="p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-indigo-500/30 text-center space-y-5 shadow-2xl">
        <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto shadow-xl">
          <Award className="w-8 h-8" />
        </div>

        <div>
          <h1 className="text-3xl font-extrabold text-white">HR Personal Interview Completed</h1>
          <p className="text-xs text-indigo-300 font-mono mt-1">
            Candidate: <strong>{sessionReport.candidateName}</strong> • {sessionReport.date}
          </p>
        </div>

        {/* Highlight Score Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl mx-auto pt-2">
          <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 text-center">
            <p className="text-[10px] uppercase font-bold text-slate-400">Overall HR Score</p>
            <p className="text-3xl font-extrabold text-emerald-400 font-mono mt-1">{sessionReport.overallScore}%</p>
          </div>
          <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 text-center">
            <p className="text-[10px] uppercase font-bold text-slate-400">Communication & Clarity</p>
            <p className="text-3xl font-extrabold text-blue-400 font-mono mt-1">{sessionReport.communicationScore}%</p>
          </div>
          <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 text-center">
            <p className="text-[10px] uppercase font-bold text-slate-400">STAR Mastery</p>
            <p className="text-3xl font-extrabold text-purple-400 font-mono mt-1">{sessionReport.starMasteryScore}%</p>
          </div>
          <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 text-center">
            <p className="text-[10px] uppercase font-bold text-slate-400">Speaking Pace</p>
            <p className="text-3xl font-extrabold text-amber-400 font-mono mt-1">{sessionReport.averageWpm} <span className="text-xs text-slate-400">WPM</span></p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-4 flex flex-wrap items-center justify-center gap-4">
          {onContinueNextRound && (
            <button
              type="button"
              onClick={onContinueNextRound}
              className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-600 hover:from-emerald-500 hover:to-indigo-500 text-white font-extrabold text-xs shadow-xl shadow-emerald-600/20 transition-all flex items-center space-x-2 animate-pulse hover:scale-105 cursor-pointer"
            >
              <span>{nextRoundTitle || 'Proceed to Final Experience & Improvement Feedback'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}

          <button
            type="button"
            onClick={() => setInterviewState('SETUP')}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg transition-all flex items-center space-x-2 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Practice Another HR Round</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setInterviewState('SETUP');
              setHrMode('MOCK');
            }}
            className="px-6 py-3 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-200 font-bold text-xs border border-indigo-500/40 transition-all flex items-center space-x-2 cursor-pointer"
          >
            <BookOpen className="w-4 h-4 text-indigo-400" />
            <span>Review Mock Preparation</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setInterviewState('SETUP');
              setHrMode('SELECTION');
            }}
            className="px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs border border-slate-700 transition-all flex items-center space-x-2 cursor-pointer"
          >
            <span>Change HR Mode</span>
          </button>
          <button
            type="button"
            onClick={() => onNavigate('dashboard')}
            className="px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs border border-slate-700 transition-all flex items-center space-x-2"
          >
            <span>Return to Dashboard</span>
          </button>
          <button
            type="button"
            onClick={() => onNavigate('report')}
            className="px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-indigo-300 font-bold text-xs border border-slate-700 transition-all flex items-center space-x-2"
          >
            <span>View Full AI Scorecard</span>
          </button>
        </div>
      </div>

      {/* Communication Coaching & Filler Word Breakdown */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl">
        <h3 className="text-base font-extrabold text-white flex items-center space-x-2 border-b border-slate-800 pb-3">
          <TrendingUp className="w-5 h-5 text-indigo-400" />
          <span>Verbal Communication & Speech Analytics</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
            <p className="font-bold text-slate-400">Filler Words Tracked</p>
            <p className="text-2xl font-extrabold text-amber-400 font-mono">{sessionReport.totalFillerWords}</p>
            <p className="text-[11px] text-slate-400">Instances of "um", "uh", "actually", "like"</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
            <p className="font-bold text-slate-400">Average Pacing</p>
            <p className="text-2xl font-extrabold text-blue-400 font-mono">{sessionReport.averageWpm} WPM</p>
            <p className="text-[11px] text-slate-400">Optimal target range is 125–155 WPM</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
            <p className="font-bold text-slate-400">Tone & Executive Presence</p>
            <p className="text-2xl font-extrabold text-emerald-400 font-mono">Professional</p>
            <p className="text-[11px] text-slate-400">Clear structured thought formulation</p>
          </div>
        </div>
      </div>

      {/* Personalized Improvement Plan */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl">
        <h3 className="text-base font-extrabold text-white flex items-center space-x-2 border-b border-slate-800 pb-3">
          <ShieldCheck className="w-5 h-5 text-indigo-400" />
          <span>Personalized Action Plan for HR Rounds</span>
        </h3>

        <ul className="space-y-2.5 text-xs text-slate-300">
          {sessionReport.personalizedImprovementPlan.map((planItem, idx) => (
            <li key={idx} className="flex items-start space-x-2.5 p-3 rounded-xl bg-slate-950 border border-slate-800/80">
              <span className="w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-300 font-bold flex items-center justify-center flex-shrink-0 text-[10px]">
                {idx + 1}
              </span>
              <span className="leading-relaxed">{planItem}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* 7 Main Questions Performance Overview Table */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl">
        <h3 className="text-base font-extrabold text-white flex items-center space-x-2 border-b border-slate-800 pb-3">
          <Award className="w-5 h-5 text-indigo-400" />
          <span>Seven Main HR Question Performance Audit</span>
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 text-[11px] uppercase tracking-wider">
                <th className="pb-3 font-bold"># Area</th>
                <th className="pb-3 font-bold">Main HR Question</th>
                <th className="pb-3 font-bold text-center">Follow-Ups</th>
                <th className="pb-3 font-bold text-center">Score</th>
                <th className="pb-3 font-bold text-right">Rating Band</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {sessionReport.questionEvaluations.map((item, idx) => {
                const qDef = SEVEN_MAIN_HR_QUESTIONS[idx];
                const followUpsCount = item.followUpRecords?.length || 0;
                return (
                  <tr key={idx} className="hover:bg-slate-950/40 transition-colors">
                    <td className="py-3 font-bold text-indigo-300 font-sans">
                      Q{idx + 1}: {qDef?.shortTitle || `Question ${idx + 1}`}
                    </td>
                    <td className="py-3 text-slate-300 font-sans max-w-xs truncate" title={item.questionText}>
                      {item.questionText}
                    </td>
                    <td className="py-3 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        followUpsCount > 0 ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' : 'bg-slate-800 text-slate-400'
                      }`}>
                        {followUpsCount > 0 ? `${followUpsCount} Asked` : 'Direct'}
                      </span>
                    </td>
                    <td className="py-3 text-center font-bold text-white">
                      {item.overallScore}%
                    </td>
                    <td className="py-3 text-right">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        item.overallScore >= 85
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : item.overallScore >= 70
                          ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                          : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      }`}>
                        {item.ratingBand}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Question-by-Question Detailed Review */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-5 shadow-xl">
        <h3 className="text-base font-extrabold text-white flex items-center space-x-2 border-b border-slate-800 pb-3">
          <HelpCircle className="w-5 h-5 text-indigo-400" />
          <span>Question-by-Question Transcripts & Evaluation Breakdown ({sessionReport.questionEvaluations.length})</span>
        </h3>

        <div className="space-y-4">
          {sessionReport.questionEvaluations.map((item, idx) => (
            <div key={idx} className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3 text-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-850 pb-2">
                <span className="font-bold text-white text-sm">
                  #{idx + 1}. {item.questionText}
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-mono font-bold self-start sm:self-auto">
                  Score: {item.overallScore}% ({item.ratingBand})
                </span>
              </div>

              {/* Student spoken transcript */}
              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-slate-200 font-mono text-[11px] whitespace-pre-wrap leading-relaxed">
                <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider mb-1">Your Spoken Answer:</span>
                "{item.userAnswerText}"
              </div>

              {/* Follow-Up History if Asked */}
              {item.followUpRecords && item.followUpRecords.length > 0 && (
                <div className="p-3 rounded-xl bg-purple-950/25 border border-purple-500/30 space-y-2">
                  <span className="text-purple-300 font-bold block text-[10px] uppercase tracking-wider">
                    Follow-Up Clarifications ({item.followUpRecords.length} asked):
                  </span>
                  {item.followUpRecords.map((fur, fIdx) => (
                    <div key={fIdx} className="space-y-1 pl-2.5 border-l-2 border-purple-500/40">
                      <p className="text-purple-200 font-semibold text-[11px]">Follow-Up {fur.followUpNumber}: "{fur.followUpQuestion}"</p>
                      <p className="text-slate-300 italic text-[11px]">Response: "{fur.candidateAnswer}"</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Strengths & Improvements */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div className="space-y-1">
                  <span className="text-emerald-400 font-bold uppercase tracking-wider text-[10px]">Strengths:</span>
                  <ul className="list-disc list-inside text-slate-300 space-y-0.5">
                    {item.strengths.map((s, i) => (
                      <li key={i}>{s}</li>
                    ))}
                  </ul>
                </div>

                <div className="space-y-1">
                  <span className="text-amber-400 font-bold uppercase tracking-wider text-[10px]">Coaching Tip:</span>
                  <ul className="list-disc list-inside text-slate-300 space-y-0.5">
                    {item.areasToImprove.map((tip, i) => (
                      <li key={i}>{tip}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Ideal Answer Suggestion */}
              {item.suggestedImprovedAnswer && (
                <div className="p-3 rounded-xl bg-indigo-950/20 border border-indigo-500/20 text-indigo-200 space-y-1 mt-2">
                  <span className="text-indigo-300 font-bold block text-[10px] uppercase tracking-wider">Suggested High-Scoring Response:</span>
                  <p className="leading-relaxed text-slate-300 text-[11px] italic">
                    "{item.suggestedImprovedAnswer}"
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
