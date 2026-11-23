import React, { useState, useEffect, useRef } from 'react';
import { 
  User, 
  ParsedResume, 
  InterviewSession, 
  CandidateTrack, 
  EducationalBackgroundCategory,
  CommunicationScorecardSummary,
  CommunicationTopicResult
} from '../types';
import { InterviewerAvatar } from './InterviewerAvatar';
import { WebcamFeed, EnvironmentMetrics } from './WebcamFeed';
import { speechService } from '../services/speechService';
import { 
  generateCommunicationTopics, 
  evaluateCommunicationSpeech 
} from '../nlp/communication/communicationEngine';
import { CommunicationTopic, CommunicationEvaluationResult } from '../nlp/communication/types';
import { HRInterviewState } from '../nlp/hr/types';
import { 
  Mic, 
  MicOff, 
  Video, 
  VideoOff, 
  Play, 
  Square, 
  RotateCcw, 
  Check, 
  ArrowRight, 
  Sparkles, 
  Award, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Volume2, 
  Sliders, 
  Layers, 
  BookOpen, 
  MessageSquare,
  HelpCircle,
  Lightbulb,
  TrendingUp,
  BrainCircuit,
  UserCheck
} from 'lucide-react';

interface CommunicationInterviewModuleProps {
  user?: User;
  parsedResume: ParsedResume | null;
  profileDepartment?: string;
  educationalCategory?: string;
  discipline?: string;
  experienceLevel?: string;
  difficulty?: 'Beginner' | 'Intermediate' | 'Advanced';
  onCompleteInterview?: (session: InterviewSession) => void;
  onContinueNextRound?: () => void;
  nextRoundTitle?: string;
  onNavigate?: (tab: string) => void;
}

export const CommunicationInterviewModule: React.FC<CommunicationInterviewModuleProps> = ({
  user,
  parsedResume,
  profileDepartment,
  educationalCategory: propEducationalCategory,
  discipline: propDiscipline,
  experienceLevel: propExperienceLevel,
  difficulty = 'Intermediate',
  onCompleteInterview,
  onContinueNextRound,
  nextRoundTitle,
  onNavigate,
}) => {
  // Classification facts with user-override priority
  const candidateClassification = parsedResume?.classification;
  const userSelectedCategory = parsedResume?.userSelectedCategory || candidateClassification?.userSelectedCategory || null;
  const isNonTech = userSelectedCategory === 'non_technical' || 
    propEducationalCategory === 'non_technical' || 
    candidateClassification?.educationalCategory === 'non_technical' || 
    candidateClassification?.isTechnical === false;

  const track: CandidateTrack = candidateClassification?.track || (propExperienceLevel === 'experienced' ? 'experienced' : 'fresher');
  const rawDiscipline = propDiscipline || candidateClassification?.discipline || parsedResume?.department || profileDepartment || '';
  
  const discipline = isNonTech
    ? (rawDiscipline && !/computer science|engineering|cse|ece|mech|civil|electrical|general studies/i.test(rawDiscipline) ? rawDiscipline : 'Commerce')
    : (rawDiscipline || 'Computer Science & Engineering');

  const educationalCategory: EducationalBackgroundCategory = isNonTech ? 'non_technical' : 'technical';
  const candidateName = parsedResume?.fullName ? parsedResume.fullName.split(' ')[0] : (user?.name ? user.name.split(' ')[0] : 'Candidate');

  // Topics State
  const [topics, setTopics] = useState<CommunicationTopic[]>([]);
  const [currentTopicIdx, setCurrentTopicIdx] = useState<number>(0);

  // Flow State
  const [sessionPhase, setSessionPhase] = useState<'SETUP' | 'PREP' | 'SPEAKING' | 'FOLLOW_UP' | 'REVIEW_TOPIC' | 'SCORECARD'>('SETUP');
  const [avatarState, setAvatarState] = useState<HRInterviewState>('READY');

  // Timers
  const [prepTimeLeft, setPrepTimeLeft] = useState<number>(20);
  const [speakingTimeLeft, setSpeakingTimeLeft] = useState<number>(90);
  const [speakingDurationSeconds, setSpeakingDurationSeconds] = useState<number>(0);

  // Audio / Speech Recognition State
  const [isMicListening, setIsMicListening] = useState<boolean>(false);
  const [isCameraActive, setIsCameraActive] = useState<boolean>(true);
  const [currentTranscript, setCurrentTranscript] = useState<string>('');
  const [followUpAnswerText, setFollowUpAnswerText] = useState<string>('');
  const [isFollowUpAnswering, setIsFollowUpAnswering] = useState<boolean>(false);
  const [isAiSpeaking, setIsAiSpeaking] = useState<boolean>(false);
  const [speechError, setSpeechError] = useState<string | null>(null);

  // Evaluation & Results History
  const [topicEvaluations, setTopicEvaluations] = useState<CommunicationEvaluationResult[]>([]);
  const [completedResults, setCompletedResults] = useState<CommunicationTopicResult[]>([]);
  const [finalScorecard, setFinalScorecard] = useState<CommunicationScorecardSummary | null>(null);

  // Refs for timers & cleanup
  const prepTimerRef = useRef<any>(null);
  const speakingTimerRef = useRef<any>(null);
  const isSubmittingRef = useRef<boolean>(false);

  // Initialize topics on mount or when resume changes
  useEffect(() => {
    const generated = generateCommunicationTopics(parsedResume, track, discipline, 4, educationalCategory);
    setTopics(generated);
    setCurrentTopicIdx(0);
    setTopicEvaluations([]);
    setCompletedResults([]);
    setFinalScorecard(null);
  }, [parsedResume?.fullName, parsedResume?.fileName, parsedResume?.uploadedAt, track, discipline, educationalCategory, userSelectedCategory]);

  // Clean up timers & speech on unmount
  useEffect(() => {
    return () => {
      clearInterval(prepTimerRef.current);
      clearInterval(speakingTimerRef.current);
      speechService.terminateAll();
    };
  }, []);

  // -------------------------------------------------------------------------
  // START SESSION FROM SETUP
  // -------------------------------------------------------------------------
  const handleStartSession = async () => {
    if (topics.length === 0) {
      const generated = generateCommunicationTopics(parsedResume, track, discipline, 4, educationalCategory);
      setTopics(generated);
    }
    setCurrentTopicIdx(0);
    startTopicFlow(0);
  };

  const startTopicFlow = async (topicIdx: number) => {
    const currentTopic = topics[topicIdx];
    if (!currentTopic) return;

    // Reset topic states
    setCurrentTranscript('');
    setFollowUpAnswerText('');
    setIsFollowUpAnswering(false);
    setSpeechError(null);
    setSpeakingDurationSeconds(0);
    setPrepTimeLeft(currentTopic.prepTimeSeconds || 20);
    setSpeakingTimeLeft(currentTopic.speakingTimeSeconds || 90);
    setSessionPhase('PREP');
    setAvatarState('ASKING_QUESTION');

    // AI introduces the topic aloud
    setIsAiSpeaking(true);
    const speechPrompt = `Topic number ${topicIdx + 1}: ${currentTopic.title}. ${currentTopic.promptText}`;
    await speechService.speakText(speechPrompt);
    setIsAiSpeaking(false);
    setAvatarState('READY');

    // Start 20s preparation countdown
    clearInterval(prepTimerRef.current);
    prepTimerRef.current = setInterval(() => {
      setPrepTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(prepTimerRef.current);
          handleBeginSpeaking();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // -------------------------------------------------------------------------
  // BEGIN SPEAKING (Transition from Prep to Speaking)
  // -------------------------------------------------------------------------
  const handleBeginSpeaking = () => {
    clearInterval(prepTimerRef.current);
    setSessionPhase('SPEAKING');
    setAvatarState('LISTENING_TO_STUDENT');
    startMicrophoneCapture();

    // Start speaking countdown timer
    clearInterval(speakingTimerRef.current);
    speakingTimerRef.current = setInterval(() => {
      setSpeakingDurationSeconds((s) => s + 1);
      setSpeakingTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(speakingTimerRef.current);
          handleStopSpeaking();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // -------------------------------------------------------------------------
  // MICROPHONE CONTROLS
  // -------------------------------------------------------------------------
  const startMicrophoneCapture = () => {
    setSpeechError(null);
    setIsMicListening(true);
    speechService.startListening({
      onTranscriptChange: (transcriptText) => {
        if (isFollowUpAnswering) {
          setFollowUpAnswerText(transcriptText);
        } else {
          setCurrentTranscript(transcriptText);
        }
      },
      onListeningStart: () => setIsMicListening(true),
      onListeningEnd: () => setIsMicListening(false),
      onError: (err, isDenied) => {
        if (isDenied) {
          setSpeechError('Microphone permission was denied. You can type your response directly in the text box below.');
        } else {
          setSpeechError('Speech recognition paused. You can speak again or type your answer.');
        }
        setIsMicListening(false);
      }
    });
  };

  const handleStopSpeaking = () => {
    speechService.stopListening();
    setIsMicListening(false);
    clearInterval(speakingTimerRef.current);
    setAvatarState('READY');
  };

  const handleRetrySpeech = () => {
    speechService.stopListening();
    setIsMicListening(false);
    clearInterval(speakingTimerRef.current);
    const cur = topics[currentTopicIdx];
    setCurrentTranscript('');
    setSpeakingDurationSeconds(0);
    setSpeakingTimeLeft(cur?.speakingTimeSeconds || 90);
    setSpeechError(null);
    handleBeginSpeaking();
  };

  // -------------------------------------------------------------------------
  // SUBMIT CURRENT TOPIC RESPONSE
  // -------------------------------------------------------------------------
  const handleSubmitTopicResponse = async () => {
    if (isSubmittingRef.current) return;
    isSubmittingRef.current = true;

    handleStopSpeaking();
    setAvatarState('EVALUATING_ANSWER');

    const currentTopic = topics[currentTopicIdx];
    const finalSpeechText = currentTranscript.trim() || '(Candidate gave a brief response)';
    const duration = Math.max(10, speakingDurationSeconds);

    // Evaluate speech
    const evalResult = evaluateCommunicationSpeech(currentTopic, finalSpeechText, duration, discipline);
    const updatedEvals = [...topicEvaluations, evalResult];
    setTopicEvaluations(updatedEvals);

    // If follow-up exists and not answered yet, prompt follow-up
    if (!isFollowUpAnswering && evalResult.followUpQuestion) {
      setSessionPhase('FOLLOW_UP');
      setIsFollowUpAnswering(true);
      setAvatarState('GIVING_FEEDBACK');

      setIsAiSpeaking(true);
      const followUpSpeech = `Thank you, ${candidateName}. Here is a quick follow-up: ${evalResult.followUpQuestion}`;
      await speechService.speakText(followUpSpeech);
      setIsAiSpeaking(false);
      setAvatarState('READY');

      // Start capture for follow-up
      startMicrophoneCapture();
      isSubmittingRef.current = false;
      return;
    }

    // Record Topic Result
    const topicResult: CommunicationTopicResult = {
      topicId: currentTopic.id,
      topicTitle: currentTopic.title,
      category: currentTopic.category,
      candidateSpeech: finalSpeechText,
      followUpQuestion: evalResult.followUpQuestion,
      candidateFollowUpAnswer: followUpAnswerText.trim() || undefined,
      timeSpentSeconds: duration,
      overallScore: evalResult.overallScore,
      metrics: evalResult.metrics,
      strengths: evalResult.strengths,
      improvements: evalResult.areasToImprove,
      feedbackNotes: evalResult.areasToImprove[0] || 'Good overall response.'
    };

    const newCompletedResults = [...completedResults, topicResult];
    setCompletedResults(newCompletedResults);

    // Check if more topics remain
    if (currentTopicIdx < topics.length - 1) {
      const nextIdx = currentTopicIdx + 1;
      setCurrentTopicIdx(nextIdx);
      isSubmittingRef.current = false;
      startTopicFlow(nextIdx);
    } else {
      // Compile final scorecard
      compileFinalScorecard(newCompletedResults, updatedEvals);
      isSubmittingRef.current = false;
    }
  };

  // -------------------------------------------------------------------------
  // COMPILE FINAL SCORECARD
  // -------------------------------------------------------------------------
  const compileFinalScorecard = (
    results: CommunicationTopicResult[],
    evals: CommunicationEvaluationResult[]
  ) => {
    const totalAttempted = results.length;
    const avgScore = totalAttempted > 0
      ? Math.round(results.reduce((acc, r) => acc + r.overallScore, 0) / totalAttempted)
      : 75;

    // Calculate average metrics
    const avgMetrics = results.reduce(
      (acc, r) => ({
        fluency: acc.fluency + r.metrics.fluency,
        grammar: acc.grammar + r.metrics.grammar,
        vocabulary: acc.vocabulary + r.metrics.vocabulary,
        clarity: acc.clarity + r.metrics.clarity,
        topicUnderstanding: acc.topicUnderstanding + r.metrics.topicUnderstanding,
        logicalOrganization: acc.logicalOrganization + r.metrics.logicalOrganization,
        relevance: acc.relevance + r.metrics.relevance,
        abilityToExplainIdeas: acc.abilityToExplainIdeas + r.metrics.abilityToExplainIdeas,
      }),
      {
        fluency: 0,
        grammar: 0,
        vocabulary: 0,
        clarity: 0,
        topicUnderstanding: 0,
        logicalOrganization: 0,
        relevance: 0,
        abilityToExplainIdeas: 0
      }
    );

    const safeDivider = Math.max(1, totalAttempted);
    const finalMetrics = {
      fluency: Math.round(avgMetrics.fluency / safeDivider),
      grammar: Math.round(avgMetrics.grammar / safeDivider),
      vocabulary: Math.round(avgMetrics.vocabulary / safeDivider),
      clarity: Math.round(avgMetrics.clarity / safeDivider),
      topicUnderstanding: Math.round(avgMetrics.topicUnderstanding / safeDivider),
      logicalOrganization: Math.round(avgMetrics.logicalOrganization / safeDivider),
      relevance: Math.round(avgMetrics.relevance / safeDivider),
      abilityToExplainIdeas: Math.round(avgMetrics.abilityToExplainIdeas / safeDivider),
    };

    const combinedStrengths = Array.from(new Set(evals.flatMap(e => e.strengths)));
    const combinedImprovements = Array.from(new Set(evals.flatMap(e => e.areasToImprove)));
    const domainAdvice = evals[0]?.domainSpecificAdvice || [];

    const scorecard: CommunicationScorecardSummary = {
      candidateName,
      discipline,
      educationalCategory,
      track,
      totalTopicsAttempted: totalAttempted,
      overallCommunicationScore: avgScore,
      averageMetrics: finalMetrics,
      strengths: combinedStrengths.slice(0, 5),
      areasToImprove: combinedImprovements.slice(0, 5),
      domainSpecificAdvice: domainAdvice,
      topicResults: results
    };

    setFinalScorecard(scorecard);
    setSessionPhase('SCORECARD');
    setAvatarState('COMPLETED');

    // Notify parent module / interview session persistence
    if (onCompleteInterview) {
      const interviewSession: InterviewSession = {
        id: `comm_${Date.now()}`,
        type: 'communication',
        date: new Date().toISOString(),
        difficulty: 'Intermediate',
        answers: [],
        technicalScore: 0,
        hrScore: 0,
        aptitudeScore: 0,
        communicationScore: avgScore,
        overallScore: avgScore,
        readinessPercentage: avgScore,
        completed: true,
        communicationScorecardSummary: scorecard
      };
      onCompleteInterview(interviewSession);
    }
  };

  // =========================================================================
  // VIEW 1: SETUP SCREEN
  // =========================================================================
  if (sessionPhase === 'SETUP') {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
        {/* Header */}
        <div className="border-b border-slate-800 pb-6">
          <div className="flex items-center space-x-2 text-indigo-400 font-semibold text-xs mb-1">
            <Sparkles className="w-4 h-4" />
            <span>Face-to-Face AI Communication Practice</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Professional Communication Interview Round
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Real-time conversational speaking simulation with live camera framing, vocal transcription, and 8-dimension NLP speech feedback.
          </p>
        </div>

        {/* Candidate Profile Context Banner */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm ${
              educationalCategory === 'technical'
                ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30'
                : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
            }`}>
              {educationalCategory === 'technical' ? 'TECH' : 'BIZ'}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <p className="text-sm font-bold text-white">{candidateName}</p>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${
                  educationalCategory === 'technical'
                    ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30'
                    : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                }`}>
                  {educationalCategory === 'technical' ? 'Technical Candidate' : 'Non-Technical Candidate'}
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700 uppercase font-mono">
                  {track}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Discipline: <strong className="text-white">{discipline}</strong>
                {parsedResume?.jobTitle && (
                  <> • Profile: <strong className="text-teal-300">{parsedResume.jobTitle}</strong></>
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 text-xs text-slate-300 bg-slate-950 px-3 py-2 rounded-xl border border-slate-800 font-mono">
            <span>Topics Planned: {topics.length}</span>
          </div>
        </div>

        {/* Device Consent & Check Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-white font-bold text-sm">
                <Video className="w-4 h-4 text-indigo-400" />
                <span>Webcam & Framing Guidance</span>
              </div>
              <span className="text-[10px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded-full font-bold">
                Framing Only
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Camera preview is used solely for realistic face-to-face simulation and framing assistance. Camera appearance does <strong>not</strong> influence communication scores.
            </p>
            <div className="pt-2 flex items-center justify-between text-xs text-slate-300">
              <span>Preview Feed:</span>
              <button
                type="button"
                onClick={() => setIsCameraActive((v) => !v)}
                className="text-indigo-400 hover:text-indigo-300 text-xs font-semibold cursor-pointer"
              >
                {isCameraActive ? 'Disable Camera' : 'Enable Camera'}
              </button>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-white font-bold text-sm">
                <Mic className="w-4 h-4 text-purple-400" />
                <span>Microphone & Speech Transcription</span>
              </div>
              <span className="text-[10px] text-purple-400 bg-purple-500/10 border border-purple-500/30 px-2 py-0.5 rounded-full font-bold">
                Speech to Text
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Spoken words are transcribed into live editable text. You can speak naturally, and also edit or type your answer before submitting.
            </p>
            <div className="pt-2 text-xs text-emerald-400 flex items-center space-x-1.5 font-semibold">
              <Check className="w-3.5 h-3.5" />
              <span>STT Engine Ready</span>
            </div>
          </div>
        </div>

        {/* Speaking Topics Preview */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <h2 className="text-sm font-extrabold text-white flex items-center space-x-2 border-b border-slate-800 pb-3">
            <Layers className="w-4 h-4 text-indigo-400" />
            <span>Curated Speaking Topics for Your Profile</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {topics.map((t, idx) => (
              <div key={t.id} className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold text-indigo-400">Topic {idx + 1}</span>
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 uppercase font-mono">
                    {t.speakingTimeSeconds}s
                  </span>
                </div>
                <p className="text-xs font-bold text-white">{t.title}</p>
                <p className="text-[11px] text-slate-400 line-clamp-3 leading-relaxed">
                  {t.promptText}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Start Button */}
        <div className="flex items-center justify-end space-x-3 pt-2">
          {onNavigate && (
            <button
              type="button"
              onClick={() => onNavigate('interview')}
              className="px-4 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-colors cursor-pointer"
            >
              Cancel
            </button>
          )}
          <button
            type="button"
            onClick={handleStartSession}
            className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-extrabold text-xs shadow-lg shadow-indigo-600/30 transition-all flex items-center space-x-2 cursor-pointer"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>Begin Communication Practice</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  // =========================================================================
  // VIEW 2: ACTIVE SPEAKING INTERACTION (PREP / SPEAKING / FOLLOW_UP)
  // =========================================================================
  const currentTopic = topics[currentTopicIdx] || topics[0];

  if (sessionPhase === 'PREP' || sessionPhase === 'SPEAKING' || sessionPhase === 'FOLLOW_UP') {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 animate-fade-in">
        {/* Top Status Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-md">
          <div className="flex items-center space-x-3">
            <span className="px-3 py-1.5 rounded-xl bg-indigo-600/20 text-indigo-300 font-mono text-xs font-bold border border-indigo-500/30">
              Topic {currentTopicIdx + 1} of {topics.length}
            </span>
            <span className="text-xs text-slate-300 font-bold hidden sm:inline">
              {currentTopic?.title}
            </span>
          </div>

          <div className="flex items-center space-x-3">
            {sessionPhase === 'PREP' ? (
              <div className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-mono font-bold animate-pulse">
                <Clock className="w-3.5 h-3.5" />
                <span>Prep Time: {prepTimeLeft}s</span>
              </div>
            ) : (
              <div className={`flex items-center space-x-2 px-3 py-1.5 rounded-xl font-mono text-xs font-bold border ${
                speakingTimeLeft < 20
                  ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 animate-pulse'
                  : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
              }`}>
                <Clock className="w-3.5 h-3.5" />
                <span>Speaking Timer: {speakingTimeLeft}s</span>
              </div>
            )}

            {isMicListening && (
              <span className="flex items-center space-x-1.5 text-xs text-purple-400 bg-purple-500/10 border border-purple-500/20 px-2.5 py-1 rounded-lg">
                <span className="w-2 h-2 rounded-full bg-purple-400 animate-ping" />
                <span>Listening</span>
              </span>
            )}
          </div>
        </div>

        {/* Center Grid: AI Avatar & Candidate Camera */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left: AI Communication Coach Avatar */}
          <div className="flex flex-col space-y-4">
            <InterviewerAvatar
              state={avatarState}
              interviewerName="Elena Vance"
              interviewerRole="Senior Communication & Talent Coach"
            />

            {/* Prompt Box */}
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-mono font-bold text-indigo-400">Speaking Prompt</span>
                {sessionPhase === 'PREP' && (
                  <button
                    type="button"
                    onClick={handleBeginSpeaking}
                    className="text-[11px] font-bold text-amber-400 hover:text-amber-300 flex items-center space-x-1 cursor-pointer"
                  >
                    <span>Skip Prep & Speak Now</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
              <p className="text-sm font-semibold text-white leading-relaxed">
                {isFollowUpAnswering ? currentTopic?.exampleFollowUp : currentTopic?.promptText}
              </p>
            </div>
          </div>

          {/* Right: Candidate Camera & Live Speech Output */}
          <div className="flex flex-col space-y-4">
            {/* Webcam Live Frame */}
            {isCameraActive ? (
              <div className="rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 aspect-video relative shadow-lg">
                <WebcamFeed compact={true} />
                <div className="absolute top-3 left-3 px-2 py-1 rounded-lg bg-slate-900/80 backdrop-blur-md text-[10px] text-slate-300 border border-slate-700/60 font-mono">
                  Candidate Camera Preview
                </div>
              </div>
            ) : (
              <div className="rounded-2xl border border-slate-800 bg-slate-950 aspect-video flex flex-col items-center justify-center text-slate-500 space-y-2">
                <VideoOff className="w-8 h-8" />
                <span className="text-xs">Camera is disabled</span>
              </div>
            )}

            {/* Speech-to-Text Editable Area */}
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-300 flex items-center space-x-1.5">
                  <Mic className="w-3.5 h-3.5 text-purple-400" />
                  <span>Your Spoken Response (Live Editable)</span>
                </span>
                <span className="text-[11px] font-mono text-slate-400">
                  Words: {currentTranscript.trim().split(/\s+/).filter(Boolean).length}
                </span>
              </div>

              <textarea
                rows={5}
                value={isFollowUpAnswering ? followUpAnswerText : currentTranscript}
                onChange={(e) => {
                  if (isFollowUpAnswering) setFollowUpAnswerText(e.target.value);
                  else setCurrentTranscript(e.target.value);
                }}
                placeholder={
                  sessionPhase === 'PREP'
                    ? 'Preparation time active... Take a breath and organize your main points. Speaking will start automatically.'
                    : 'Speak naturally into your microphone... Your speech will appear here automatically. You can also type or edit.'
                }
                className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs focus:border-indigo-500 focus:outline-none resize-none leading-relaxed"
              />

              {speechError && (
                <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-300 text-[11px] flex items-center space-x-1.5">
                  <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>{speechError}</span>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-1">
                <div className="flex items-center space-x-2">
                  {sessionPhase !== 'PREP' && (
                    <>
                      {isMicListening ? (
                        <button
                          type="button"
                          onClick={handleStopSpeaking}
                          className="px-3 py-2 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 text-xs font-bold flex items-center space-x-1.5 cursor-pointer"
                        >
                          <Square className="w-3 h-3 fill-current" />
                          <span>Pause Mic</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={startMicrophoneCapture}
                          className="px-3 py-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-xs font-bold flex items-center space-x-1.5 cursor-pointer"
                        >
                          <Mic className="w-3.5 h-3.5" />
                          <span>Resume Mic</span>
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={handleRetrySpeech}
                        className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-semibold flex items-center space-x-1 cursor-pointer"
                      >
                        <RotateCcw className="w-3 h-3" />
                        <span>Retry</span>
                      </button>
                    </>
                  )}
                </div>

                <button
                  type="button"
                  onClick={handleSubmitTopicResponse}
                  disabled={sessionPhase === 'PREP'}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs shadow-md transition-all flex items-center space-x-1.5 cursor-pointer disabled:opacity-50"
                >
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                  <span>{isFollowUpAnswering ? 'Submit Follow-Up & Next' : 'Submit Response'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // VIEW 3: COMPREHENSIVE SCORECARD
  // =========================================================================
  if (sessionPhase === 'SCORECARD' && finalScorecard) {
    const metrics = finalScorecard.averageMetrics;
    const metricItems = [
      { key: 'fluency', label: 'Fluency & Pacing', val: metrics.fluency, color: 'from-blue-500 to-indigo-500' },
      { key: 'grammar', label: 'Grammar & Structure', val: metrics.grammar, color: 'from-indigo-500 to-purple-500' },
      { key: 'vocabulary', label: 'Vocabulary Richness', val: metrics.vocabulary, color: 'from-purple-500 to-pink-500' },
      { key: 'clarity', label: 'Articulation & Clarity', val: metrics.clarity, color: 'from-emerald-500 to-teal-500' },
      { key: 'topicUnderstanding', label: 'Topic Understanding', val: metrics.topicUnderstanding, color: 'from-amber-500 to-orange-500' },
      { key: 'logicalOrganization', label: 'Logical Organization', val: metrics.logicalOrganization, color: 'from-cyan-500 to-blue-500' },
      { key: 'relevance', label: 'Relevance to Prompt', val: metrics.relevance, color: 'from-violet-500 to-indigo-500' },
      { key: 'abilityToExplainIdeas', label: 'Ability to Explain Ideas', val: metrics.abilityToExplainIdeas, color: 'from-rose-500 to-amber-500' },
    ];

    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
        {/* Header */}
        <div className="border-b border-slate-800 pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-emerald-400 font-semibold text-xs mb-1">
              <CheckCircle2 className="w-4 h-4" />
              <span>Assessment Completed</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Communication Round Performance Scorecard
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Multi-dimensional conversational speech analysis benchmarked against corporate communication standards.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            {onContinueNextRound && (
              <button
                type="button"
                onClick={onContinueNextRound}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-xs shadow-lg transition-all flex items-center space-x-1.5 cursor-pointer"
              >
                <span>Continue to {nextRoundTitle || 'Next Round'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Top Summary Banner */}
        <div className="p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center space-x-5">
            <div className="w-20 h-20 rounded-2xl bg-indigo-600/20 border border-indigo-500/40 flex flex-col items-center justify-center text-center shadow-lg">
              <span className="text-3xl font-extrabold text-white">{finalScorecard.overallCommunicationScore}</span>
              <span className="text-[10px] text-indigo-300 font-mono font-bold">OUT OF 100</span>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-lg font-bold text-white">{candidateName}</h2>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  {finalScorecard.overallCommunicationScore >= 80 ? 'Proficient Communicator' : 'Competent Speaker'}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Discipline: <strong className="text-white">{discipline}</strong> • Track: <strong className="text-slate-300 capitalize">{track}</strong>
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Evaluated purely on verbal content, logic, and acoustic delivery. Zero camera bias.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="text-center p-3 rounded-xl bg-slate-950 border border-slate-800">
              <p className="text-[10px] text-slate-400 uppercase font-mono">Topics Completed</p>
              <p className="text-base font-bold text-white mt-0.5">{finalScorecard.totalTopicsAttempted}</p>
            </div>
            <div className="text-center p-3 rounded-xl bg-slate-950 border border-slate-800">
              <p className="text-[10px] text-slate-400 uppercase font-mono">Category</p>
              <p className="text-xs font-bold text-indigo-300 mt-0.5 uppercase">
                {educationalCategory === 'technical' ? 'Technical' : 'Non-Technical'}
              </p>
            </div>
          </div>
        </div>

        {/* 8 Core Metrics Grid */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <h2 className="text-sm font-extrabold text-white flex items-center space-x-2 border-b border-slate-800 pb-3">
            <Sliders className="w-4 h-4 text-indigo-400" />
            <span>Eight-Dimension Communication Diagnostic Breakdown</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {metricItems.map((m) => (
              <div key={m.key} className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-slate-300">{m.label}</span>
                  <span className="font-mono text-white font-bold">{m.val}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className={`h-full bg-gradient-to-r ${m.color} rounded-full transition-all duration-700`}
                    style={{ width: `${m.val}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Strengths & Improvement Opportunities */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
            <h3 className="text-xs font-extrabold text-emerald-400 uppercase tracking-wider flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>Identified Communication Strengths</span>
            </h3>
            <ul className="space-y-2 text-xs text-slate-300">
              {finalScorecard.strengths.map((s, idx) => (
                <li key={idx} className="flex items-start space-x-2">
                  <span className="text-emerald-400 mt-0.5 font-bold">✓</span>
                  <span className="leading-relaxed">{s}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
            <h3 className="text-xs font-extrabold text-amber-400 uppercase tracking-wider flex items-center space-x-2">
              <Lightbulb className="w-4 h-4" />
              <span>Actionable Coaching Opportunities</span>
            </h3>
            <ul className="space-y-2 text-xs text-slate-300">
              {finalScorecard.areasToImprove.map((imp, idx) => (
                <li key={idx} className="flex items-start space-x-2">
                  <span className="text-amber-400 mt-0.5 font-bold">→</span>
                  <span className="leading-relaxed">{imp}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Domain-Specific Practical Advice */}
        {finalScorecard.domainSpecificAdvice.length > 0 && (
          <div className="p-6 rounded-2xl bg-indigo-950/20 border border-indigo-500/30 space-y-3">
            <h3 className="text-xs font-extrabold text-indigo-300 uppercase tracking-wider flex items-center space-x-2">
              <BookOpen className="w-4 h-4" />
              <span>Domain-Specific Advice for {discipline}</span>
            </h3>
            <ul className="space-y-2 text-xs text-slate-300">
              {finalScorecard.domainSpecificAdvice.map((adv, idx) => (
                <li key={idx} className="flex items-start space-x-2">
                  <span className="text-indigo-400 mt-0.5 font-bold">•</span>
                  <span className="leading-relaxed">{adv}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Topic-by-Topic Speech Transcript Review */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <h2 className="text-sm font-extrabold text-white flex items-center space-x-2 border-b border-slate-800 pb-3">
            <MessageSquare className="w-4 h-4 text-purple-400" />
            <span>Spoken Topic Transcripts and Follow-Up History</span>
          </h2>

          <div className="space-y-4">
            {finalScorecard.topicResults.map((r, idx) => (
              <div key={r.topicId} className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white">
                    Topic {idx + 1}: {r.topicTitle}
                  </span>
                  <span className="text-xs font-mono font-bold text-indigo-400">
                    Score: {r.overallScore}%
                  </span>
                </div>
                <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800 text-xs text-slate-300 leading-relaxed font-sans">
                  <strong>Candidate Speech:</strong> "{r.candidateSpeech}"
                </div>
                {r.followUpQuestion && (
                  <div className="p-3 rounded-lg bg-indigo-950/30 border border-indigo-500/20 text-xs space-y-1">
                    <p className="font-semibold text-indigo-300">AI Follow-Up Question:</p>
                    <p className="text-slate-300">"{r.followUpQuestion}"</p>
                    {r.candidateFollowUpAnswer && (
                      <p className="text-slate-400 pt-1">
                        <strong>Follow-Up Answer:</strong> "{r.candidateFollowUpAnswer}"
                      </p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Navigation Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-800">
          <button
            type="button"
            onClick={handleStartSession}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-colors cursor-pointer"
          >
            Practice Again with New Topics
          </button>

          <div className="flex items-center space-x-3 w-full sm:w-auto justify-end">
            {onNavigate && (
              <button
                type="button"
                onClick={() => onNavigate('interview')}
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-md cursor-pointer"
              >
                Return to Interview Journey
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return null;
};
