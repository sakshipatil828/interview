/**
 * CareerCurve AI — Frontend-Only Sequential Interview Workflow
 * 
 * Implements the 3-Stage Sequential Progression:
 * Step 1: Aptitude Round -> Step 2: Technical Round -> Step 3: HR Behaviour Round -> Final Overall Report
 * 
 * Features:
 * - 3 side-by-side round cards on desktop, stacked on mobile
 * - Strict sequential locking: Technical locked until Aptitude completes; HR locked until Technical completes
 * - Visible Progress Tracker consistent with Campus Placement Progression Roadmap
 * - Dynamic difficulty selection (Beginner, Intermediate, Advanced) across all rounds
 * - Reusable round result review without forcing re-taking
 * - Clear inter-round transition buttons ("Continue to Technical Round", "Continue to HR Behaviour Round")
 * - Final Overall Report calculating actual weighted scores, strengths, weaknesses, and recommendations
 * - User-scoped persistence via browser storage
 */

import React, { useState, useEffect } from 'react';
import { 
  User, 
  ParsedResume, 
  InterviewSession, 
  AptitudeResult,
  InterviewJourneyConfig,
  InterviewJourneyState,
  InterviewRoundId,
  RoundResultSummary,
  CandidateDepartmentOption,
  TargetRoleOption
} from '../types';
import { EngineeringDepartment } from '../nlp/types';
import { 
  getUserInterviewJourney, 
  saveUserInterviewJourney, 
  clearUserInterviewJourney 
} from '../services/authStorageService';
import { AptitudeModule } from './AptitudeModule';
import { TechnicalInterviewModule } from './TechnicalInterviewModule';
import { CommunicationInterviewModule } from './CommunicationInterviewModule';
import { HRVoiceInterviewModule } from './HRVoiceInterviewModule';
import { InterviewFeedbackModule } from './InterviewFeedbackModule';
import { 
  BrainCircuit, 
  Cpu, 
  UserCheck, 
  MessageSquare,
  Compass, 
  Sparkles, 
  CheckCircle2, 
  Clock, 
  ArrowRight, 
  AlertCircle, 
  Sliders, 
  Target, 
  GraduationCap, 
  Check, 
  Play, 
  Award, 
  TrendingUp, 
  RotateCcw, 
  Eye, 
  Lock, 
  Unlock, 
  FileText, 
  Wrench, 
  UploadCloud, 
  Printer, 
  Briefcase,
  CheckCheck,
  AlertTriangle,
  SlidersHorizontal,
  Layers
} from 'lucide-react';

interface InterviewRoundsWorkflowProps {
  user: User;
  parsedResume: ParsedResume | null;
  interviewSessions: InterviewSession[];
  aptitudeResults: AptitudeResult[];
  onCompleteInterviewSession: (session: InterviewSession) => void;
  onCompleteAptitudeResult: (result: AptitudeResult) => void;
  onNavigate: (tab: string, round?: 'technical' | 'hr' | 'aptitude' | 'communication') => void;
}

function getRoundTitle(r: InterviewRoundId): string {
  switch (r) {
    case 'aptitude': return 'Aptitude Round';
    case 'technical': return 'Technical Round';
    case 'communication': return 'Communication Round';
    case 'hr': return 'HR Behaviour Round';
    default: return 'Interview Round';
  }
}

// Maps candidate department option to EngineeringDepartment for technical NLP engine
function mapToEngineeringDepartment(dept: CandidateDepartmentOption): EngineeringDepartment {
  switch (dept) {
    case 'CSE':
    case 'ISE':
      return 'Computer Science & Engineering';
    case 'AI & ML':
      return 'Data Science & Machine Learning Engineering';
    case 'ECE':
      return 'Electronics & Communication Engineering';
    case 'EEE':
      return 'Electrical & Electronics Engineering';
    case 'Mechanical':
      return 'Mechanical Engineering';
    case 'Civil':
      return 'Civil Engineering';
    default:
      return 'Computer Science & Engineering';
  }
}

// Default skill sets by department and role if no resume has been uploaded yet
function getDefaultSkillsForProfile(dept: CandidateDepartmentOption, role: TargetRoleOption): string[] {
  const commonWeb = ['JavaScript', 'TypeScript', 'React', 'Node.js', 'SQL', 'Git', 'REST APIs'];
  const commonAI = ['Python', 'Machine Learning', 'TensorFlow', 'PyTorch', 'Data Analysis', 'Pandas', 'SQL'];
  const commonECE = ['Embedded C', 'VLSI', 'Verilog', 'Digital Electronics', 'Microcontrollers', 'MATLAB'];
  const commonEEE = ['Power Systems', 'Circuit Analysis', 'Control Systems', 'Electrical Machines', 'MATLAB'];
  const commonMech = ['AutoCAD', 'SolidWorks', 'Thermodynamics', 'Fluid Mechanics', 'ANSYS', 'Manufacturing'];
  const commonCivil = ['AutoCAD', 'Structural Analysis', 'Concrete Technology', 'ETABS', 'Surveying', 'STAAD.Pro'];

  if (role === 'AI/ML Engineer' || role === 'Data Analyst') {
    return commonAI;
  }
  switch (dept) {
    case 'ECE': return commonECE;
    case 'EEE': return commonEEE;
    case 'Mechanical': return commonMech;
    case 'Civil': return commonCivil;
    default: return commonWeb;
  }
}

export const InterviewRoundsWorkflow: React.FC<InterviewRoundsWorkflowProps> = ({
  user,
  parsedResume,
  interviewSessions,
  aptitudeResults,
  onCompleteInterviewSession,
  onCompleteAptitudeResult,
  onNavigate,
}) => {
  // ---------------------------------------------------------------------------
  // 1. CONFIGURATION & PREFERENCES STATE
  // ---------------------------------------------------------------------------
  const getInitialDept = (): CandidateDepartmentOption => {
    const isNonTechCand = parsedResume?.userSelectedCategory === 'non_technical' || 
      parsedResume?.classification?.educationalCategory === 'non_technical' || 
      parsedResume?.classification?.isTechnical === false;

    // Respect parsed resume and classification FIRST over stale user registration defaults
    const raw = (parsedResume?.classification?.discipline || parsedResume?.department || user?.department || '').toLowerCase();
    if (raw.includes('commerce') || raw.includes('b.com') || raw.includes('bcom') || raw.includes('accounting') || raw.includes('finance')) return 'Commerce';
    if (raw.includes('business admin') || raw.includes('management') || raw.includes('bba') || raw.includes('mba')) return 'Business Administration';
    if (raw.includes('business analytics') || raw.includes('analytics')) return 'Business Analytics';
    if (raw.includes('arts') || raw.includes('humanities') || raw.includes('english') || raw.includes('literature')) return 'Arts & Humanities';
    if (raw.includes('customer service') || raw.includes('customer support') || raw.includes('office admin')) return 'Commerce';
    if (raw.includes('electronics') || raw.includes('ece')) return 'ECE';
    if (raw.includes('electrical') || raw.includes('eee')) return 'EEE';
    if (raw.includes('civil')) return 'Civil';
    if (raw.includes('mechanical') || raw.includes('automobile')) return 'Mechanical';
    if (raw.includes('data') || raw.includes('machine learning') || raw.includes('ai')) return 'AI & ML';
    if (raw.includes('information') || raw.includes('ise')) return 'ISE';
    if (isNonTechCand) return 'Commerce';
    return 'CSE';
  };

  const getInitialRole = (): TargetRoleOption => {
    const isNonTechCand = parsedResume?.userSelectedCategory === 'non_technical' || 
      parsedResume?.classification?.educationalCategory === 'non_technical' || 
      parsedResume?.classification?.isTechnical === false;

    const raw = (parsedResume?.jobTitle || '').toLowerCase();
    if (raw.includes('customer support') || raw.includes('office admin') || raw.includes('customer service') || raw.includes('client support')) {
      return 'Customer Support / Office Administration' as any;
    }
    if (raw.includes('financial') || raw.includes('accounting')) return 'Financial Analyst';
    if (raw.includes('business analyst')) return 'Business Analyst';
    if (raw.includes('marketing')) return 'Marketing Executive';
    if (raw.includes('hr') || raw.includes('human resource')) return 'HR Specialist';
    if (raw.includes('data analyst')) return 'Data Analyst';
    if (raw.includes('machine learning') || raw.includes('ai')) return 'AI/ML Engineer';
    if (raw.includes('full-stack') || raw.includes('fullstack')) return 'Full-Stack Developer';
    if (raw.includes('software')) return 'Software Developer';
    if (isNonTechCand) return 'Customer Support / Office Administration' as any;
    return 'Full-Stack Developer';
  };

  const [department, setDepartment] = useState<CandidateDepartmentOption>(getInitialDept());
  const [targetRole, setTargetRole] = useState<TargetRoleOption>(getInitialRole());
  const [difficulty, setDifficulty] = useState<'Beginner' | 'Intermediate' | 'Advanced'>('Intermediate');

  // Synchronize department and targetRole when parsedResume updates (prevents stale initial state)
  useEffect(() => {
    if (parsedResume) {
      setDepartment(getInitialDept());
      setTargetRole(getInitialRole());
    }
  }, [
    parsedResume?.fullName, 
    parsedResume?.fileName, 
    parsedResume?.department, 
    parsedResume?.jobTitle, 
    parsedResume?.classification?.discipline,
    parsedResume?.userSelectedCategory
  ]);

  // Active round in execution ('aptitude' | 'technical' | 'hr' | null)
  const [activeExecutingRound, setActiveExecutingRound] = useState<InterviewRoundId | null>(null);

  // When reviewing an individual saved scorecard without retaking
  const [reviewingRoundId, setReviewingRoundId] = useState<InterviewRoundId | null>(null);

  // Dedicated view state for the Consolidated Final Report
  const [showConsolidatedReport, setShowConsolidatedReport] = useState<boolean>(false);

  // Modal dialog state for journey restart confirmation
  const [showResetConfirmModal, setShowResetConfirmModal] = useState<boolean>(false);
  const [retakeTargetRound, setRetakeTargetRound] = useState<InterviewRoundId | null>(null);

  // ---------------------------------------------------------------------------
  // 2. WORKFLOW / JOURNEY STATE (Restored from User-Scoped Storage)
  // ---------------------------------------------------------------------------
  const [journeyState, setJourneyState] = useState<InterviewJourneyState | null>(null);

  useEffect(() => {
    if (user?.id) {
      const saved = getUserInterviewJourney(user.id);
      let journeyToUse = saved;

      // Sync and preserve existing completed round results if available in session history
      const existingCompleted = saved?.completedRounds ? [...saved.completedRounds] : [];
      const existingResults = saved?.roundResults ? { ...saved.roundResults } : {};

      if (aptitudeResults && aptitudeResults.length > 0 && !existingCompleted.includes('aptitude')) {
        const latestApt = aptitudeResults[0];
        existingCompleted.push('aptitude');
        existingResults.aptitude = {
          roundId: 'aptitude',
          roundTitle: 'Round 1: Aptitude Test',
          scorePercentage: latestApt.scorePercentage,
          completedAt: latestApt.date || new Date().toISOString(),
          summaryFeedback: `Scored ${latestApt.scorePercentage}% with ${latestApt.correctCount} correct out of ${latestApt.totalQuestions} questions.`,
          strengths: latestApt.feedback?.strongTopics?.length ? latestApt.feedback.strongTopics : ['Quantitative Reasoning', 'Logical Problem Solving'],
          improvements: latestApt.feedback?.weakTopics?.length ? latestApt.feedback.weakTopics : ['Time Efficiency', 'Complex Formula Application'],
          rawSessionId: latestApt.id,
          metrics: {
            correctCount: latestApt.correctCount,
            totalQuestions: latestApt.totalQuestions,
            timeTakenMinutes: latestApt.timeTakenMinutes,
          },
        };
      }

      if (interviewSessions && interviewSessions.length > 0) {
        const techSession = interviewSessions.find((s) => s.type === 'technical');
        if (techSession && !existingCompleted.includes('technical')) {
          existingCompleted.push('technical');
          const tScore = techSession.technicalScore || techSession.overallScore || 85;
          existingResults.technical = {
            roundId: 'technical',
            roundTitle: 'Round 2: Technical Interview',
            scorePercentage: tScore,
            completedAt: techSession.date || new Date().toISOString(),
            summaryFeedback: `Demonstrated technical domain knowledge with an evaluated score of ${tScore}%.`,
            strengths: ['Core Engineering Fundamentals', 'Algorithmic Problem-Solving'],
            improvements: ['Edge-case Handling', 'Architecture Scalability'],
            rawSessionId: techSession.id,
            metrics: {
              totalQuestions: techSession.answers?.length || 5,
              ratingBand: tScore >= 85 ? 'Exceptional' : tScore >= 70 ? 'Proficient' : 'Developing',
            },
          };
        }

        const hrSession = interviewSessions.find((s) => s.type === 'hr');
        if (hrSession && !existingCompleted.includes('hr')) {
          existingCompleted.push('hr');
          const hScore = hrSession.hrScore || hrSession.overallScore || 88;
          existingResults.hr = {
            roundId: 'hr',
            roundTitle: 'Round 3: HR Behaviour Interview',
            scorePercentage: hScore,
            completedAt: hrSession.date || new Date().toISOString(),
            summaryFeedback: `Completed live conversational behavioral interview with STAR score of ${hScore}%.`,
            strengths: ['STAR Structured Delivery', 'Professional Tone & Confidence'],
            improvements: ['Speech Pacing Consistency', 'Concise Impact Quantification'],
            rawSessionId: hrSession.id,
            metrics: {
              totalQuestions: hrSession.answers?.length || 4,
              ratingBand: hScore >= 85 ? 'Exceptional' : hScore >= 70 ? 'Proficient' : 'Developing',
            },
          };
        }

        const commSession = interviewSessions.find((s) => s.type === 'communication');
        if (commSession && !existingCompleted.includes('communication')) {
          existingCompleted.push('communication');
          const cScore = commSession.communicationScore || commSession.overallScore || 85;
          existingResults.communication = {
            roundId: 'communication',
            roundTitle: 'Round 2: Communication Round',
            scorePercentage: cScore,
            completedAt: commSession.date || new Date().toISOString(),
            summaryFeedback: commSession.communicationScorecardSummary?.overallFeedback || `Completed face-to-face AI speaking session with evaluated score of ${cScore}%.`,
            strengths: commSession.communicationScorecardSummary?.strengths || ['Professional Articulation', 'Logical Thought Flow'],
            improvements: commSession.communicationScorecardSummary?.improvements || ['Reduce Filler Words', 'Enhance Elaboration'],
            rawSessionId: commSession.id,
            metrics: {
              totalQuestions: commSession.communicationScorecardSummary?.topicsEvaluated || 2,
              ratingBand: cScore >= 85 ? 'Exceptional' : cScore >= 70 ? 'Proficient' : 'Developing',
            },
            communicationScorecard: commSession.communicationScorecardSummary,
          };
        }
      }

      if (!journeyToUse && existingCompleted.length > 0) {
        journeyToUse = {
          id: `journey_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
          userId: user.id,
          config: {
            candidateName: user.name || parsedResume?.fullName || 'Candidate',
            email: user.email || parsedResume?.email || 'candidate@careercurve.ai',
            department,
            targetRole,
            difficulty,
            mode: 'Assessment Mode',
            aptitudeDurationMinutes: 10,
            technicalDurationMinutes: 15,
            hrDurationMinutes: 10,
            communicationDurationMinutes: 15,
            selectedRounds: existingCompleted as InterviewRoundId[],
          },
          status: existingCompleted.length >= 2 ? 'completed' : 'in_progress',
          activeRoundIndex: 0,
          currentPhase: 'form',
          completedRounds: existingCompleted,
          roundResults: existingResults,
          startedAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        saveUserInterviewJourney(user.id, journeyToUse);
      } else if (journeyToUse && existingCompleted.length > (journeyToUse.completedRounds?.length || 0)) {
        journeyToUse = {
          ...journeyToUse,
          completedRounds: Array.from(new Set([...(journeyToUse.completedRounds || []), ...existingCompleted])),
          roundResults: { ...journeyToUse.roundResults, ...existingResults },
          updatedAt: new Date().toISOString(),
        };
        saveUserInterviewJourney(user.id, journeyToUse);
      }

      if (journeyToUse) {
        setJourneyState(journeyToUse);
        if (journeyToUse.config?.difficulty) {
          setDifficulty(journeyToUse.config.difficulty);
        }
        if (journeyToUse.config?.department) {
          setDepartment(journeyToUse.config.department);
        }
        if (journeyToUse.config?.targetRole) {
          setTargetRole(journeyToUse.config.targetRole);
        }
      }
    }
  }, [user?.id, aptitudeResults, interviewSessions]);

  // Candidate classification from resume
  const candidateClassification = parsedResume?.classification;
  
  // Authoritative candidate background
  const userSelectedCategory: 'technical' | 'non_technical' | null = 
    parsedResume?.userSelectedCategory ||
    journeyState?.config?.userSelectedCategory ||
    candidateClassification?.userSelectedCategory ||
    null;

  const isNonTech = userSelectedCategory === 'non_technical' || (!userSelectedCategory && candidateClassification?.isTechnical === false);
  const isFresher = candidateClassification?.track === 'fresher';

  // Strict Matrix Allowed Rounds:
  // Non-Tech: exactly ['aptitude', 'communication', 'hr'] (Technical round strictly omitted)
  // Tech: ['aptitude', 'technical', 'hr', 'communication']
  const allowedRounds: InterviewRoundId[] = isNonTech
    ? ['aptitude', 'communication', 'hr']
    : ['aptitude', 'technical', 'hr', 'communication'];

  const defaultTrackRounds: InterviewRoundId[] = isNonTech
    ? ['aptitude', 'communication', 'hr']
    : ['aptitude', 'technical', 'hr'];

  // Active selected rounds for this candidate's journey (strictly filtered to allowedRounds)
  const rawSelectedRounds = journeyState?.config?.selectedRounds?.filter((r) => allowedRounds.includes(r));
  const activeSelectedRounds: InterviewRoundId[] = rawSelectedRounds && rawSelectedRounds.length > 0
    ? rawSelectedRounds
    : defaultTrackRounds;

  const handleSwitchBackground = (newCat: 'technical' | 'non_technical') => {
    const targetSelected: InterviewRoundId[] = newCat === 'non_technical'
      ? ['aptitude', 'communication', 'hr']
      : ['aptitude', 'technical', 'hr'];

    if (parsedResume) {
      parsedResume.userSelectedCategory = newCat;
      if (parsedResume.classification) {
        parsedResume.classification.userSelectedCategory = newCat;
        parsedResume.classification.isTechnical = newCat === 'technical';
        parsedResume.classification.educationalCategory = newCat;
        parsedResume.classification.isUserConfirmed = true;
      }
    }

    const base = getOrCreateJourneyState();
    persistJourneyUpdate({
      ...base,
      config: {
        ...base.config,
        userSelectedCategory: newCat,
        educationalCategory: newCat,
        selectedRounds: targetSelected,
      },
      updatedAt: new Date().toISOString(),
    });
  };

  // Derived completed rounds and round results
  const completedRounds: InterviewRoundId[] = journeyState?.completedRounds || [];
  const roundResults = journeyState?.roundResults || {};

  const isAptitudeCompleted = completedRounds.includes('aptitude');
  const isTechnicalCompleted = completedRounds.includes('technical');
  const isCommunicationCompleted = completedRounds.includes('communication');
  const isHRCompleted = completedRounds.includes('hr');

  // Check if all rounds selected by the candidate are completed
  const isAllSelectedRoundsCompleted = activeSelectedRounds.length > 0 &&
    activeSelectedRounds.every((r) => completedRounds.includes(r));

  // Determine current active stage based on remaining uncompleted selected rounds
  const uncompletedSelected = activeSelectedRounds.filter((r) => !completedRounds.includes(r));
  const currentActiveStage: 'aptitude' | 'technical' | 'communication' | 'hr' | 'report' = uncompletedSelected.length > 0
    ? uncompletedSelected[0]
    : 'report';

  const handleToggleWorkflowRound = (roundId: InterviewRoundId) => {
    if (!allowedRounds.includes(roundId)) {
      console.warn(`Round ${roundId} is not permitted for candidate profile`);
      return;
    }
    const currentList = activeSelectedRounds;
    let nextList: InterviewRoundId[];
    if (currentList.includes(roundId)) {
      if (currentList.length <= 1) return; // Keep at least 1 round
      nextList = currentList.filter((r) => r !== roundId);
    } else {
      const raw = [...currentList, roundId];
      nextList = allowedRounds.filter((r) => raw.includes(r));
    }
    const base = getOrCreateJourneyState();
    persistJourneyUpdate({
      ...base,
      config: {
        ...base.config,
        selectedRounds: nextList,
      },
      updatedAt: new Date().toISOString(),
    });
  };

  // ---------------------------------------------------------------------------
  // 3. PERSISTENCE HELPER
  // ---------------------------------------------------------------------------
  const persistJourneyUpdate = (updatedState: InterviewJourneyState) => {
    setJourneyState(updatedState);
    if (user?.id) {
      saveUserInterviewJourney(user.id, updatedState);
    }
  };

  const getOrCreateJourneyState = (): InterviewJourneyState => {
    if (journeyState) return journeyState;
    const initialConfig: InterviewJourneyConfig = {
      candidateName: user.name || parsedResume?.fullName || 'Candidate',
      email: user.email || parsedResume?.email || 'candidate@careercurve.ai',
      department,
      targetRole,
      difficulty,
      mode: 'Assessment Mode',
      aptitudeDurationMinutes: 10,
      technicalDurationMinutes: 15,
      hrDurationMinutes: 10,
      communicationDurationMinutes: 15,
      selectedRounds: defaultTrackRounds,
    };

    return {
      id: `journey_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      userId: user.id,
      config: initialConfig,
      status: 'in_progress',
      activeRoundIndex: 0,
      currentPhase: 'form',
      completedRounds: [],
      roundResults: {},
      startedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  };

  // ---------------------------------------------------------------------------
  // 4. ROUND LAUNCH & NAVIGATION CONTROLS (Independent & Sequential)
  // ---------------------------------------------------------------------------
  const handleStartRound = (roundId: InterviewRoundId) => {
    if (!parsedResume || !candidateClassification) {
      onNavigate('resume');
      return;
    }
    if (!allowedRounds.includes(roundId)) {
      console.warn(`Round ${roundId} is not permitted for candidate profile`);
      return;
    }
    const baseJourney = getOrCreateJourneyState();
    const updatedJourney: InterviewJourneyState = {
      ...baseJourney,
      config: {
        ...baseJourney.config,
        difficulty,
        department,
        targetRole,
      },
      status: 'in_progress',
      activeRoundIndex: roundId === 'aptitude' ? 0 : roundId === 'technical' ? 1 : 2,
      currentPhase: 'round_active',
      updatedAt: new Date().toISOString(),
    };

    persistJourneyUpdate(updatedJourney);
    setActiveExecutingRound(roundId);
    setReviewingRoundId(null);
    setShowConsolidatedReport(false);
  };

  const handleViewScorecard = (roundId: InterviewRoundId) => {
    setReviewingRoundId(roundId);
    setActiveExecutingRound(null);
    setShowConsolidatedReport(false);
  };

  const handleReturnToSetup = () => {
    setActiveExecutingRound(null);
    setReviewingRoundId(null);
    setShowConsolidatedReport(false);
    if (journeyState) {
      persistJourneyUpdate({
        ...journeyState,
        currentPhase: 'form',
        updatedAt: new Date().toISOString(),
      });
    }
  };

  // ---------------------------------------------------------------------------
  // 5. ROUND COMPLETION HANDLERS
  // ---------------------------------------------------------------------------
  const handleAptitudeCompleted = (res: AptitudeResult) => {
    onCompleteAptitudeResult(res);
    const baseJourney = getOrCreateJourneyState();

    const summary: RoundResultSummary = {
      roundId: 'aptitude',
      roundTitle: 'Round 1: Aptitude Test',
      scorePercentage: res.scorePercentage,
      completedAt: new Date().toISOString(),
      summaryFeedback: `Scored ${res.scorePercentage}% with ${res.correctCount} correct out of ${res.totalQuestions} questions in ${res.timeTakenMinutes} minutes.`,
      strengths: res.feedback?.strongTopics?.length ? res.feedback.strongTopics : ['Quantitative Reasoning', 'Logical Problem Solving'],
      improvements: res.feedback?.weakTopics?.length ? res.feedback.weakTopics : ['Time Efficiency', 'Complex Formula Application'],
      rawSessionId: res.id,
      metrics: {
        correctCount: res.correctCount,
        totalQuestions: res.totalQuestions,
        timeTakenMinutes: res.timeTakenMinutes,
      },
    };

    const nextCompleted = Array.from(new Set([...baseJourney.completedRounds, 'aptitude' as InterviewRoundId]));
    const updatedJourney: InterviewJourneyState = {
      ...baseJourney,
      completedRounds: nextCompleted,
      roundResults: {
        ...baseJourney.roundResults,
        aptitude: summary,
      },
      currentPhase: 'round_result',
      updatedAt: new Date().toISOString(),
    };

    persistJourneyUpdate(updatedJourney);
  };

  const handleTechnicalCompleted = (session: InterviewSession) => {
    onCompleteInterviewSession(session);
    const baseJourney = getOrCreateJourneyState();

    const score = session.technicalScore || session.overallScore || 85;
    const strengths = session.answers
      .filter((a) => (a.aiFeedback?.technicalAccuracyScore || 0) >= 70)
      .flatMap((a) => a.aiFeedback?.strengths || [])
      .slice(0, 3);
    const improvements = session.answers
      .flatMap((a) => a.aiFeedback?.improvements || [])
      .slice(0, 3);

    const summary: RoundResultSummary = {
      roundId: 'technical',
      roundTitle: 'Round 2: Technical Interview',
      scorePercentage: score,
      completedAt: new Date().toISOString(),
      summaryFeedback: `Demonstrated technical domain knowledge in ${department} with an evaluated score of ${score}%. Completed ${session.answers.length} technical questions (${session.technicalScorecardSummary?.answeredQuestions || session.answers.length} answered, ${session.technicalScorecardSummary?.skippedQuestions || 0} skipped).`,
      strengths: session.technicalScorecardSummary?.strengths || (strengths.length > 0 ? strengths : ['Core Engineering Fundamentals', 'Algorithmic Problem-Solving']),
      improvements: session.technicalScorecardSummary?.recommendedImprovements || (improvements.length > 0 ? improvements : ['Edge-case Handling', 'Architecture Scalability']),
      rawSessionId: session.id,
      metrics: {
        totalQuestions: session.answers.length,
        ratingBand: score >= 85 ? 'Exceptional' : score >= 70 ? 'Proficient' : 'Developing',
      },
      technicalScorecard: session.technicalScorecardSummary,
    };

    const nextCompleted = Array.from(new Set([...baseJourney.completedRounds, 'technical' as InterviewRoundId]));
    const updatedJourney: InterviewJourneyState = {
      ...baseJourney,
      completedRounds: nextCompleted,
      roundResults: {
        ...baseJourney.roundResults,
        technical: summary,
      },
      currentPhase: 'round_result',
      updatedAt: new Date().toISOString(),
    };

    persistJourneyUpdate(updatedJourney);
    setActiveExecutingRound(null);
    setReviewingRoundId('technical');
  };

  const handleCommunicationCompleted = (session: InterviewSession) => {
    onCompleteInterviewSession(session);
    const baseJourney = getOrCreateJourneyState();

    const score = session.communicationScore || session.overallScore || 85;
    const summary: RoundResultSummary = {
      roundId: 'communication',
      roundTitle: isNonTech ? 'Round 2: Communication Round' : 'Face-to-Face Communication Round',
      scorePercentage: score,
      completedAt: new Date().toISOString(),
      summaryFeedback: session.communicationScorecardSummary?.overallFeedback || `Completed face-to-face AI speaking session with evaluated score of ${score}%.`,
      strengths: session.communicationScorecardSummary?.strengths || ['Professional Articulation', 'Logical Thought Flow'],
      improvements: session.communicationScorecardSummary?.improvements || ['Reduce Filler Words', 'Enhance Elaboration'],
      rawSessionId: session.id,
      metrics: {
        totalQuestions: session.communicationScorecardSummary?.topicsEvaluated || 2,
        ratingBand: score >= 85 ? 'Exceptional' : score >= 70 ? 'Proficient' : 'Developing',
      },
      communicationScorecard: session.communicationScorecardSummary,
    };

    const nextCompleted = Array.from(new Set([...baseJourney.completedRounds, 'communication' as InterviewRoundId]));
    const updatedJourney: InterviewJourneyState = {
      ...baseJourney,
      completedRounds: nextCompleted,
      roundResults: {
        ...baseJourney.roundResults,
        communication: summary,
      },
      currentPhase: 'round_result',
      updatedAt: new Date().toISOString(),
    };

    persistJourneyUpdate(updatedJourney);
    setActiveExecutingRound(null);
    setReviewingRoundId('communication');
  };

  const handleHRCompleted = (session: InterviewSession) => {
    onCompleteInterviewSession(session);
    const baseJourney = getOrCreateJourneyState();

    const score = session.hrScore || session.overallScore || 88;
    const strengths = session.answers
      .filter((a) => (a.aiFeedback?.communicationScore || 0) >= 75)
      .flatMap((a) => a.aiFeedback?.strengths || [])
      .slice(0, 3);
    const improvements = session.answers
      .flatMap((a) => a.aiFeedback?.improvements || [])
      .slice(0, 3);

    const summary: RoundResultSummary = {
      roundId: 'hr',
      roundTitle: 'Round 3: HR Behaviour Interview',
      scorePercentage: score,
      completedAt: new Date().toISOString(),
      summaryFeedback: `Completed live conversational behavioral interview with AI Recruiter Sarah Chen. Articulated situational scenarios with a STAR score of ${score}%.`,
      strengths: strengths.length > 0 ? strengths : ['STAR Structured Delivery', 'Professional Tone & Confidence'],
      improvements: improvements.length > 0 ? improvements : ['Speech Pacing Consistency', 'Concise Impact Quantification'],
      rawSessionId: session.id,
      metrics: {
        totalQuestions: session.answers.length,
        ratingBand: score >= 85 ? 'Exceptional' : score >= 70 ? 'Proficient' : 'Developing',
      },
    };

    const nextCompleted = Array.from(new Set([...baseJourney.completedRounds, 'hr' as InterviewRoundId]));
    const updatedJourney: InterviewJourneyState = {
      ...baseJourney,
      completedRounds: nextCompleted,
      roundResults: {
        ...baseJourney.roundResults,
        hr: summary,
      },
      currentPhase: 'round_result',
      updatedAt: new Date().toISOString(),
    };

    persistJourneyUpdate(updatedJourney);
  };

  // Continue to Next Round from Result View — Dynamically skips unselected rounds!
  const handleProceedToNextRound = () => {
    const currentJourney = journeyState || (user?.id ? getUserInterviewJourney(user.id) : null);
    const completed = currentJourney?.completedRounds || completedRounds;
    const activeSelected = currentJourney?.config?.selectedRounds || activeSelectedRounds;

    // Filter remaining uncompleted selected rounds in canonical sequence
    const remainingUncompleted = activeSelected.filter((r) => !completed.includes(r));

    if (remainingUncompleted.length > 0) {
      // Transition directly to the next selected round
      const nextRound = remainingUncompleted[0];
      handleStartRound(nextRound);
    } else {
      // All selected rounds have been completed! Unlock Consolidated Scorecard
      const base = currentJourney || getOrCreateJourneyState();
      persistJourneyUpdate({
        ...base,
        status: 'completed',
        currentPhase: 'consolidated_scorecard',
        updatedAt: new Date().toISOString(),
      });
      setActiveExecutingRound(null);
      setReviewingRoundId(null);
      setShowConsolidatedReport(true);
    }
  };

  // ---------------------------------------------------------------------------
  // 6. JOURNEY RESTART & RETAKE CONTROLS
  // ---------------------------------------------------------------------------
  const handleConfirmResetJourney = () => {
    if (user?.id) {
      clearUserInterviewJourney(user.id);
    }
    setJourneyState(null);
    setActiveExecutingRound(null);
    setReviewingRoundId(null);
    setShowConsolidatedReport(false);
    setShowResetConfirmModal(false);
  };

  const handleConfirmRetakeRound = () => {
    if (!retakeTargetRound || !journeyState) return;

    // Reset this specific round and downstream dependent rounds
    const roundsToRemove: InterviewRoundId[] = [retakeTargetRound];
    if (retakeTargetRound === 'aptitude') {
      roundsToRemove.push('technical', 'communication', 'hr');
    } else if (retakeTargetRound === 'technical') {
      roundsToRemove.push('hr');
    } else if (retakeTargetRound === 'communication') {
      roundsToRemove.push('hr');
    }

    const updatedCompleted = journeyState.completedRounds.filter((r) => !roundsToRemove.includes(r));
    const updatedResults = { ...journeyState.roundResults };
    roundsToRemove.forEach((r) => {
      delete updatedResults[r];
    });

    const targetRoundToStart = retakeTargetRound;
    setRetakeTargetRound(null);

    const updatedJourney: InterviewJourneyState = {
      ...journeyState,
      completedRounds: updatedCompleted,
      roundResults: updatedResults,
      currentPhase: 'form',
      updatedAt: new Date().toISOString(),
    };

    persistJourneyUpdate(updatedJourney);
    handleStartRound(targetRoundToStart);
  };

  // Helper to construct effective resume profile for technical module
  const getEffectiveResume = (): ParsedResume => {
    if (parsedResume) return parsedResume;

    const mappedDept = mapToEngineeringDepartment(department);
    return {
      fullName: user.name || 'Candidate',
      jobTitle: targetRole,
      email: user.email || 'candidate@careercurve.ai',
      phone: user.phone || '',
      github: user.github || '',
      linkedin: user.linkedin || '',
      summary: `Pre-placement engineering candidate in ${department} preparing for ${targetRole} opportunities.`,
      education: [
        {
          degree: user.degree || 'B.Tech',
          branch: mappedDept,
          college: user.college || 'Engineering Institute of Technology',
          graduationYear: user.graduationYear || '2026',
        },
      ],
      department: mappedDept,
      skills: [],
      rawSkillsList: getDefaultSkillsForProfile(department, targetRole),
      projects: [],
      experience: [],
      certifications: [],
      languages: ['English'],
      interests: ['Software Engineering', 'System Architecture'],
      atsScore: 82,
      resumeScore: 85,
      matchRank: 'Interview Ready Candidate',
      missingSkills: [],
      strongSkills: [],
      suggestedTechnologies: [],
      careerSuggestions: [],
      uploadedAt: new Date().toISOString(),
      fileName: 'System Candidate Profile',
    };
  };

  // ===========================================================================
  // VIEW: VISIBLE PROGRESS TRACKER (Section 4 & Section 5)
  // Consistent with Campus Placement Progression Roadmap
  // ===========================================================================
  const renderProgressTracker = () => {
    const roundStageConfig: Record<InterviewRoundId, { title: string; subtitle: (sel: boolean) => string; icon: any }> = {
      aptitude: {
        title: 'Aptitude Round',
        subtitle: (sel) => sel ? 'MCQ & Quantitative Logic' : 'Optional / Not Selected',
        icon: BrainCircuit,
      },
      technical: {
        title: 'Technical Round',
        subtitle: (sel) => sel ? 'Resume NLP & Coding' : 'Optional / Not Selected',
        icon: Cpu,
      },
      communication: {
        title: 'Communication Round',
        subtitle: (sel) => sel ? (isNonTech ? 'Face-to-Face AI Speaking' : 'Speaking Practice') : 'Optional / Not Selected',
        icon: MessageSquare,
      },
      hr: {
        title: 'HR Behaviour Round',
        subtitle: (sel) => sel ? 'Live Voice & STAR' : 'Optional / Not Selected',
        icon: UserCheck,
      },
    };

    const stages = [
      ...allowedRounds.map((roundId, idx) => {
        const isSel = activeSelectedRounds.includes(roundId);
        const isComp = completedRounds.includes(roundId);
        const isAct = currentActiveStage === roundId || activeExecutingRound === roundId;
        const cfg = roundStageConfig[roundId];
        return {
          id: roundId,
          stepNumber: String(idx + 1),
          title: cfg.title,
          subtitle: cfg.subtitle(isSel),
          icon: cfg.icon,
          isSelected: isSel,
          isCompleted: isComp,
          isActive: isAct,
          score: roundResults[roundId]?.scorePercentage,
          statusText: isComp
            ? 'Completed'
            : isAct
            ? 'In Progress'
            : isSel
            ? 'Selected'
            : 'Optional',
        };
      }),
      {
        id: 'report' as const,
        stepNumber: '★',
        title: 'Overall Report',
        subtitle: 'Consolidated AI Scorecard',
        icon: Award,
        isSelected: true,
        isCompleted: isAllSelectedRoundsCompleted,
        isActive: isAllSelectedRoundsCompleted && showConsolidatedReport,
        score: isAllSelectedRoundsCompleted
          ? (() => {
              let totalWeight = 0;
              let weightedSum = 0;
              activeSelectedRounds.forEach((r) => {
                const w = 1;
                totalWeight += w;
                weightedSum += (roundResults[r]?.scorePercentage || 0) * w;
              });
              return totalWeight > 0 ? Math.round(weightedSum / totalWeight) : 0;
            })()
          : undefined,
        statusText: isAllSelectedRoundsCompleted ? 'Ready' : 'Pending',
      },
    ];

    return (
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30 flex items-center justify-center">
              <Compass className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-white">Campus Placement Progression Roadmap</h3>
              <p className="text-[11px] text-slate-400">
                {activeSelectedRounds.length === 3
                  ? 'Complete all three sequential stages to unlock your Consolidated AI Scorecard and Final Readiness Report.'
                  : `Complete your ${activeSelectedRounds.length} selected interview stage${activeSelectedRounds.length > 1 ? 's' : ''} to unlock your Consolidated AI Scorecard and Final Readiness Report.`}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 self-start sm:self-auto">
            {completedRounds.length > 0 && (
              <button
                type="button"
                onClick={() => setShowResetConfirmModal(true)}
                className="text-[11px] font-semibold text-slate-400 hover:text-rose-400 px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 transition-colors flex items-center space-x-1 cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset Journey</span>
              </button>
            )}
          </div>
        </div>

        {/* Dynamic Connected Stages */}
        <div className={`grid grid-cols-1 sm:grid-cols-2 ${stages.length === 3 ? 'lg:grid-cols-3' : stages.length === 5 ? 'lg:grid-cols-5' : 'lg:grid-cols-4'} gap-3 pt-1`}>
          {stages.map((stage) => {
            const Icon = stage.icon;
            return (
              <div
                key={stage.id}
                className={`p-3.5 rounded-2xl border transition-all flex items-start space-x-3 ${
                  stage.isCompleted
                    ? 'bg-emerald-950/20 border-emerald-500/40 text-emerald-300 shadow-sm'
                    : stage.isActive
                    ? 'bg-purple-950/25 border-purple-500 ring-2 ring-purple-500/50 text-white shadow-lg animate-pulse'
                    : stage.isSelected
                    ? 'bg-slate-950/80 border-slate-800 text-slate-300'
                    : 'bg-slate-950/40 border-slate-800/50 text-slate-500 opacity-60'
                }`}
              >
                {/* Stage Icon / Number Badge */}
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs flex-shrink-0 ${
                    stage.isCompleted
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : stage.isActive
                      ? 'bg-purple-600 text-white shadow-md'
                      : stage.isSelected
                      ? 'bg-slate-800 text-slate-300 border border-slate-700'
                      : 'bg-slate-900 text-slate-600 border border-slate-800'
                  }`}
                >
                  {stage.isCompleted ? (
                    <Check className="w-4 h-4 stroke-[3]" />
                  ) : (
                    <span>{stage.stepNumber}</span>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold truncate text-white">{stage.title}</p>
                    {stage.score !== undefined && (
                      <span className="text-[11px] font-mono font-extrabold text-emerald-400 ml-1">
                        {stage.score}%
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-slate-400 truncate mt-0.5">{stage.subtitle}</p>

                  <div className="mt-2">
                    {stage.isCompleted ? (
                      <span className="inline-flex items-center text-[10px] font-bold text-emerald-400">
                        <CheckCircle2 className="w-3 h-3 mr-1 text-emerald-400" />
                        Completed
                      </span>
                    ) : stage.isActive ? (
                      <span className="inline-flex items-center text-[10px] font-bold text-purple-300">
                        <span className="w-1.5 h-1.5 rounded-full bg-purple-400 mr-1.5 animate-ping" />
                        In Progress
                      </span>
                    ) : (
                      <span className="inline-flex items-center text-[10px] font-medium text-slate-400">
                        <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${stage.isSelected ? 'bg-slate-500' : 'bg-slate-700'}`} />
                        {stage.statusText}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // ===========================================================================
  // VIEW: RESET / RETAKE CONFIRMATION MODAL
  // ===========================================================================
  const renderConfirmationModals = () => {
    return (
      <>
        {showResetConfirmModal && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 max-w-md w-full space-y-4 shadow-2xl animate-fade-in">
              <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-400 border border-rose-500/20 flex items-center justify-center mx-auto">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div className="text-center">
                <h3 className="text-base font-bold text-white">Reset Mock Interview Journey?</h3>
                <p className="text-xs text-slate-300 leading-relaxed mt-1.5">
                  This will reset your round progression and completed scores across Aptitude, Technical, and HR Behaviour rounds. Your student profile and parsed resume will be preserved.
                </p>
              </div>
              <div className="flex items-center justify-end space-x-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setShowResetConfirmModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmResetJourney}
                  className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-md shadow-rose-600/20 transition-all cursor-pointer"
                >
                  Yes, Reset Journey
                </button>
              </div>
            </div>
          </div>
        )}

        {retakeTargetRound && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 max-w-md w-full space-y-4 shadow-2xl animate-fade-in">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center mx-auto">
                <RotateCcw className="w-6 h-6" />
              </div>
              <div className="text-center">
                <h3 className="text-base font-bold text-white">
                  Retake {retakeTargetRound === 'aptitude' ? 'Aptitude' : retakeTargetRound === 'technical' ? 'Technical' : 'HR Behaviour'} Round?
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed mt-1.5">
                  Retaking this round will reset its saved score and require completing it again.
                </p>
              </div>
              <div className="flex items-center justify-end space-x-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setRetakeTargetRound(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmRetakeRound}
                  className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold shadow-md shadow-amber-600/20 transition-all cursor-pointer"
                >
                  Confirm Retake
                </button>
              </div>
            </div>
          </div>
        )}
      </>
    );
  };

  // ===========================================================================
  // SUB-VIEW 1: ACTIVE ROUND EXECUTION
  // ===========================================================================
  if (activeExecutingRound === 'aptitude') {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-4">
        <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-900 border border-slate-800">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Round 1 of 3
            </span>
            <span className="text-xs font-bold text-white">Aptitude Interview Round ({difficulty})</span>
          </div>
          <button
            type="button"
            onClick={handleReturnToSetup}
            className="text-xs font-bold text-slate-400 hover:text-white px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 transition-colors cursor-pointer"
          >
            ← Back to Setup
          </button>
        </div>

        <AptitudeModule
          userId={user.id}
          aptitudeHistory={aptitudeResults}
          journeyConfig={{
            difficulty,
            durationMinutes: 10,
            mode: 'Assessment Mode',
            educationalCategory: isNonTech ? 'non_technical' : 'technical',
          }}
          onCompleteAptitude={handleAptitudeCompleted}
          onContinueNextRound={handleProceedToNextRound}
          nextRoundTitle={isNonTech ? "Communication Round" : "Technical Round"}
          onNavigate={(tab) => onNavigate(tab)}
        />
      </div>
    );
  }

  if (activeExecutingRound === 'technical') {
    const effectiveResume = getEffectiveResume();
    const mappedDept = mapToEngineeringDepartment(department);

    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-4">
        <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-900 border border-slate-800">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              Round 2 of 3
            </span>
            <span className="text-xs font-bold text-white">Technical Interview Round ({department} • {difficulty})</span>
          </div>
          <button
            type="button"
            onClick={handleReturnToSetup}
            className="text-xs font-bold text-slate-400 hover:text-white px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 transition-colors cursor-pointer"
          >
            ← Back to Setup
          </button>
        </div>

        <TechnicalInterviewModule
          parsedResume={effectiveResume}
          profileDepartment={department}
          targetDepartment={mappedDept}
          difficulty={difficulty}
          targetRole={targetRole}
          durationMinutes={15}
          onCompleteInterview={handleTechnicalCompleted}
          onContinueNextRound={() => {
            setActiveExecutingRound(null);
            setReviewingRoundId('technical');
          }}
          nextRoundTitle="HR Behaviour Round"
          onNavigate={(tab) => onNavigate(tab)}
        />
      </div>
    );
  }

  if (activeExecutingRound === 'communication') {
    const effectiveResume = getEffectiveResume();

    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-4">
        <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-900 border border-slate-800">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-teal-500/10 text-teal-400 border border-teal-500/20">
              {isNonTech
                ? `Round ${allowedRounds.indexOf('communication') + 1} of ${allowedRounds.length}`
                : 'Communication Speaking Round'}
            </span>
            <span className="text-xs font-bold text-white">
              Face-to-Face Communication Round ({isNonTech ? (candidateClassification?.discipline || 'Non-Technical') : department} • {difficulty})
            </span>
          </div>
          <button
            type="button"
            onClick={handleReturnToSetup}
            className="text-xs font-bold text-slate-400 hover:text-white px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 transition-colors cursor-pointer"
          >
            ← Back to Setup
          </button>
        </div>

        <CommunicationInterviewModule
          parsedResume={effectiveResume}
          educationalCategory={isNonTech ? 'non_technical' : 'technical'}
          discipline={candidateClassification?.discipline || department}
          experienceLevel={candidateClassification?.track === 'experienced' ? 'experienced' : 'fresher'}
          difficulty={difficulty}
          onCompleteInterview={handleCommunicationCompleted}
          onContinueNextRound={handleProceedToNextRound}
          onNavigate={(tab) => onNavigate(tab)}
        />
      </div>
    );
  }

  if (activeExecutingRound === 'hr') {
    const effectiveResume = getEffectiveResume();

    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-4">
        <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-900 border border-slate-800">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-purple-500/10 text-purple-400 border border-purple-500/20">
              Round {allowedRounds.indexOf('hr') + 1} of {allowedRounds.length}
            </span>
            <span className="text-xs font-bold text-white">HR Behaviour Interview Round ({difficulty})</span>
          </div>
          <button
            type="button"
            onClick={handleReturnToSetup}
            className="text-xs font-bold text-slate-400 hover:text-white px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 transition-colors cursor-pointer"
          >
            ← Back to Setup
          </button>
        </div>

        <HRVoiceInterviewModule
          parsedResume={effectiveResume}
          profileDepartment={isNonTech ? (candidateClassification?.discipline || 'Commerce') : department}
          initialConfig={{
            difficulty,
            durationMinutes: 10,
            type: 'HR Personal Interview',
            style: 'Professional',
          }}
          onCompleteInterview={handleHRCompleted}
          onContinueNextRound={handleProceedToNextRound}
          nextRoundTitle="Final Overall Report"
          onNavigate={(tab) => onNavigate(tab)}
          onBackToRounds={handleReturnToSetup}
          onBackToSetup={handleReturnToSetup}
        />
      </div>
    );
  }

  // ===========================================================================
  // SUB-VIEW 2: INDIVIDUAL SAVED SCORECARD REVIEW (Section 6)
  // Shows saved results without forcing user to repeat interview
  // ===========================================================================
  if (reviewingRoundId) {
    const res = roundResults[reviewingRoundId];
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 animate-fade-in">
        {renderProgressTracker()}

        <div className="p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto shadow-lg">
            <Award className="w-8 h-8" />
          </div>

          <div>
            <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold mb-2">
              <Check className="w-3.5 h-3.5" />
              <span>Verified Scorecard Result</span>
            </div>
            <h2 className="text-2xl font-extrabold text-white">
              {res?.roundTitle || `${reviewingRoundId.toUpperCase()} Scorecard`}
            </h2>
            <p className="text-xs text-slate-400 mt-1 max-w-lg mx-auto">
              {res?.summaryFeedback}
            </p>
          </div>

          {/* Actual Evaluated Score */}
          <div className="inline-block p-6 rounded-2xl bg-slate-950 border border-slate-800 shadow-inner">
            <p className="text-xs uppercase font-bold text-slate-400">Evaluated Score</p>
            <p className="text-5xl font-black text-emerald-400 font-mono mt-1">
              {res?.scorePercentage || 0}%
            </p>
          </div>

          {/* Comprehensive Technical Scorecard Summary (Section 8) */}
          {res?.technicalScorecard && (
            <div className="space-y-6 text-left max-w-3xl mx-auto pt-2">
              {/* Question Attempt & Accuracy Audit Badges */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 text-center text-xs">
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <p className="text-[10px] text-slate-400 uppercase font-semibold">Total Questions</p>
                  <p className="text-xl font-extrabold text-white font-mono mt-1">{res.technicalScorecard.totalQuestions}</p>
                </div>
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <p className="text-[10px] text-indigo-400 uppercase font-semibold">Answered</p>
                  <p className="text-xl font-extrabold text-indigo-300 font-mono mt-1">{res.technicalScorecard.answeredQuestions}</p>
                </div>
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <p className="text-[10px] text-emerald-400 uppercase font-semibold">Correct (≥80%)</p>
                  <p className="text-xl font-extrabold text-emerald-400 font-mono mt-1">{res.technicalScorecard.correctAnswers}</p>
                </div>
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <p className="text-[10px] text-blue-400 uppercase font-semibold">Partial (40-79%)</p>
                  <p className="text-xl font-extrabold text-blue-400 font-mono mt-1">{res.technicalScorecard.partiallyCorrectAnswers}</p>
                </div>
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <p className="text-[10px] text-rose-400 uppercase font-semibold">Incorrect (&lt;40%)</p>
                  <p className="text-xl font-extrabold text-rose-400 font-mono mt-1">{res.technicalScorecard.incorrectAnswers}</p>
                </div>
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <p className="text-[10px] text-amber-400 uppercase font-semibold">Skipped (0 pts)</p>
                  <p className="text-xl font-extrabold text-amber-400 font-mono mt-1">{res.technicalScorecard.skippedQuestions}</p>
                </div>
              </div>

              {/* Difficulty-Wise Breakdown */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                <span className="font-bold text-slate-300 uppercase tracking-wider text-[11px] flex items-center space-x-1.5">
                  <SlidersHorizontal className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Difficulty-Wise Performance</span>
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex justify-between items-center">
                    <div>
                      <p className="text-slate-400 text-[11px]">Beginner Tier</p>
                      <p className="text-slate-500 text-[10px]">{res.technicalScorecard.difficultyWise.beginner.attempted} question(s)</p>
                    </div>
                    <span className="text-sm font-bold font-mono text-emerald-400">
                      {res.technicalScorecard.difficultyWise.beginner.attempted > 0 ? `${res.technicalScorecard.difficultyWise.beginner.avgScore}%` : 'N/A'}
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex justify-between items-center">
                    <div>
                      <p className="text-slate-400 text-[11px]">Intermediate Tier</p>
                      <p className="text-slate-500 text-[10px]">{res.technicalScorecard.difficultyWise.intermediate.attempted} question(s)</p>
                    </div>
                    <span className="text-sm font-bold font-mono text-blue-400">
                      {res.technicalScorecard.difficultyWise.intermediate.attempted > 0 ? `${res.technicalScorecard.difficultyWise.intermediate.avgScore}%` : 'N/A'}
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex justify-between items-center">
                    <div>
                      <p className="text-slate-400 text-[11px]">Advanced Tier</p>
                      <p className="text-slate-500 text-[10px]">{res.technicalScorecard.difficultyWise.advanced.attempted} question(s)</p>
                    </div>
                    <span className="text-sm font-bold font-mono text-purple-400">
                      {res.technicalScorecard.difficultyWise.advanced.attempted > 0 ? `${res.technicalScorecard.difficultyWise.advanced.avgScore}%` : 'N/A'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Skill Performance Table */}
              {res.technicalScorecard.skillPerformance.length > 0 && (
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                  <span className="font-bold text-slate-300 uppercase tracking-wider text-[11px] flex items-center space-x-1.5">
                    <Layers className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Skill Performance Table</span>
                  </span>
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left border-collapse">
                      <thead>
                        <tr className="border-b border-slate-800 text-slate-400 text-[11px]">
                          <th className="py-2.5 px-3 font-semibold">Skill / Topic</th>
                          <th className="py-2.5 px-3 font-semibold">Source</th>
                          <th className="py-2.5 px-3 font-semibold text-center">Score</th>
                          <th className="py-2.5 px-3 font-semibold text-right">Performance</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60 font-sans">
                        {res.technicalScorecard.skillPerformance.map((item, idx) => (
                          <tr key={idx} className="hover:bg-slate-900/50">
                            <td className="py-2.5 px-3 font-semibold text-slate-200">
                              {item.skill}
                            </td>
                            <td className="py-2.5 px-3 text-slate-400 font-mono text-[10px]">
                              {item.source === 'resume-skill' ? 'Resume Skills' :
                               item.source === 'project' ? 'Resume Project' :
                               item.source === 'internship' ? 'Internship' :
                               item.source === 'certification' ? 'Certification' : 'Curriculum Core'}
                            </td>
                            <td className="py-2.5 px-3 text-center font-mono font-bold text-slate-300">
                              {item.score}%
                            </td>
                            <td className="py-2.5 px-3 text-right">
                              <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono border ${
                                item.performance === 'Strong'
                                  ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                                  : item.performance === 'Good'
                                  ? 'bg-blue-500/10 text-blue-300 border-blue-500/30'
                                  : item.performance === 'Needs Improvement'
                                  ? 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                                  : 'bg-rose-500/10 text-rose-300 border-rose-500/30'
                              }`}>
                                {item.performance}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Weak Skills Remediation Plan (Section 8: what answered incorrectly, correct explanation, what to study, practice question) */}
              {res.technicalScorecard.weakSkillsRemediation.length > 0 && (
                <div className="p-5 rounded-2xl bg-slate-950 border border-amber-500/30 space-y-4">
                  <div className="flex items-center space-x-2 text-amber-400 font-bold text-xs uppercase tracking-wider">
                    <AlertCircle className="w-4 h-4 text-amber-400" />
                    <span>Targeted Improvement & Remediation Plan</span>
                  </div>
                  <div className="space-y-4">
                    {res.technicalScorecard.weakSkillsRemediation.map((rem, remIdx) => (
                      <div key={remIdx} className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2.5 text-xs">
                        <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                          <span className="font-bold text-white text-sm">{rem.skill}</span>
                          <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[10px] font-mono font-bold">Needs Focus</span>
                        </div>
                        <div className="space-y-1.5 text-slate-300">
                          <p className="text-[11px] text-rose-300 leading-relaxed">
                            <strong className="text-rose-400 font-semibold">Identified Mistake / Gap:</strong> {rem.whatWasAnsweredIncorrectly}
                          </p>
                          <p className="text-[11px] text-emerald-300 leading-relaxed">
                            <strong className="text-emerald-400 font-semibold">Correct Explanation:</strong> {rem.correctExplanation}
                          </p>
                          <p className="text-[11px] text-blue-300 leading-relaxed">
                            <strong className="text-blue-400 font-semibold">What to Study Next:</strong> {rem.whatToStudyNext}
                          </p>
                          <p className="text-[11px] text-purple-300 leading-relaxed">
                            <strong className="text-purple-400 font-semibold">Recommended Practice Question:</strong> {rem.recommendedPracticeQuestion}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Comprehensive Communication Scorecard Summary */}
          {res?.communicationScorecard && (
            <div className="space-y-6 text-left max-w-3xl mx-auto pt-2">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <p className="text-[10px] text-slate-400 uppercase font-semibold">Speaking Pace</p>
                  <p className="text-xl font-extrabold text-teal-400 font-mono mt-1">{res.communicationScorecard.speechPaceWpm} WPM</p>
                </div>
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <p className="text-[10px] text-slate-400 uppercase font-semibold">Filler Words</p>
                  <p className="text-xl font-extrabold text-indigo-300 font-mono mt-1">{res.communicationScorecard.fillerWordCount}</p>
                </div>
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <p className="text-[10px] text-slate-400 uppercase font-semibold">Topics Evaluated</p>
                  <p className="text-xl font-extrabold text-emerald-400 font-mono mt-1">{res.communicationScorecard.topicsEvaluated}</p>
                </div>
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <p className="text-[10px] text-slate-400 uppercase font-semibold">Camera Telemetry</p>
                  <p className="text-xs font-bold text-slate-300 mt-2 font-mono">Framing Only (0% Bias)</p>
                </div>
              </div>

              {/* 8 Communication Criteria Breakdown */}
              {res.communicationScorecard.metrics && (
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                  <span className="font-bold text-slate-300 uppercase tracking-wider text-[11px] flex items-center space-x-1.5">
                    <MessageSquare className="w-3.5 h-3.5 text-teal-400" />
                    <span>8 Core Evaluation Criteria</span>
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                    {Object.entries(res.communicationScorecard.metrics).map(([k, v]) => (
                      <div key={k} className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                        <p className="text-[10px] text-slate-400 capitalize">{k.replace(/([A-Z])/g, ' $1')}</p>
                        <p className="text-sm font-bold text-teal-300 font-mono mt-1">{v as number}%</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Domain-Tailored Advice */}
              {res.communicationScorecard.domainTailoredAdvice && (
                <div className="p-4 rounded-xl bg-teal-500/10 border border-teal-500/20 text-xs text-teal-200">
                  <p className="font-bold text-teal-300 mb-1">Domain Communication Advice</p>
                  <p>{res.communicationScorecard.domainTailoredAdvice}</p>
                </div>
              )}
            </div>
          )}

          {/* Strengths & Suggested Polish Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left max-w-xl mx-auto text-xs">
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <span className="font-bold text-emerald-400 uppercase tracking-wider text-[10px] flex items-center space-x-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Demonstrated Strengths</span>
              </span>
              <ul className="space-y-1 text-slate-300">
                {(res?.strengths || ['Strong conceptual grasp']).map((s, idx) => (
                  <li key={idx} className="flex items-start space-x-1.5">
                    <span className="text-emerald-400">•</span>
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <span className="font-bold text-amber-400 uppercase tracking-wider text-[10px] flex items-center space-x-1">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>Areas to Polish</span>
              </span>
              <ul className="space-y-1 text-slate-300">
                {(res?.improvements || ['Maintain timed pacing']).map((imp, idx) => (
                  <li key={idx} className="flex items-start space-x-1.5">
                    <span className="text-amber-400">•</span>
                    <span>{imp}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Navigation Action Buttons */}
          <div className="pt-4 flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={handleReturnToSetup}
              className="px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition-colors cursor-pointer"
            >
              ← Back to Interview Setup
            </button>

            {(() => {
              const remainingSelected = activeSelectedRounds.filter(
                (r) => r !== reviewingRoundId && !completedRounds.includes(r)
              );
              const nextRound = remainingSelected[0];
              if (nextRound) {
                const nextLabel = getRoundTitle(nextRound);
                const nextColor =
                  nextRound === 'technical'
                    ? 'bg-indigo-600 hover:bg-indigo-500'
                    : nextRound === 'communication'
                    ? 'bg-teal-600 hover:bg-teal-500'
                    : 'bg-purple-600 hover:bg-purple-500';
                return (
                  <button
                    type="button"
                    onClick={() => handleStartRound(nextRound)}
                    className={`px-7 py-3 rounded-xl ${nextColor} text-white font-bold text-xs shadow-lg transition-all flex items-center space-x-1.5 cursor-pointer`}
                  >
                    <span>Continue to {nextLabel}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                );
              }
              if (isAllSelectedRoundsCompleted) {
                return (
                  <button
                    type="button"
                    onClick={() => {
                      setReviewingRoundId(null);
                      persistJourneyUpdate({
                        ...getOrCreateJourneyState(),
                        currentPhase: 'consolidated_scorecard',
                        updatedAt: new Date().toISOString(),
                      });
                      setShowConsolidatedReport(true);
                    }}
                    className="px-7 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-indigo-600 text-white font-bold text-xs shadow-lg transition-all flex items-center space-x-1.5 cursor-pointer"
                  >
                    <span>View Final Overall Report</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                );
              }
              return null;
            })()}
          </div>
        </div>
      </div>
    );
  }

  // ===========================================================================
  // SUB-VIEW 3: FINAL OVERALL REPORT (Section 3 & Section 6)
  // Shows individual scores, overall readiness, strengths, weaknesses, and recommendations
  // ===========================================================================
  if (showConsolidatedReport) {
    const aptScore = roundResults.aptitude?.scorePercentage || 0;
    const techScore = roundResults.technical?.scorePercentage || 0;
    const commScore = roundResults.communication?.scorePercentage || 0;
    const hrScore = roundResults.hr?.scorePercentage || 0;

    const activeSelected = journeyState?.config?.selectedRounds || activeSelectedRounds;
    const completedSelected = activeSelected.filter((r) => completedRounds.includes(r));

    const weights: Record<InterviewRoundId, number> = {
      aptitude: 30,
      technical: 40,
      communication: 30,
      hr: 30,
    };

    let totalWeight = 0;
    let rawWeightedSum = 0;
    completedSelected.forEach((r) => {
      const score = roundResults[r]?.scorePercentage || 0;
      const w = weights[r] || 30;
      rawWeightedSum += score * w;
      totalWeight += w;
    });

    const weightedOverallScore = totalWeight > 0 ? Math.round(rawWeightedSum / totalWeight) : 0;

    const allStrengths = Array.from(
      new Set([
        ...(roundResults.aptitude?.strengths || []),
        ...(roundResults.technical?.strengths || []),
        ...(roundResults.communication?.strengths || []),
        ...(roundResults.hr?.strengths || []),
      ])
    ).slice(0, 5);

    const allImprovements = Array.from(
      new Set([
        ...(roundResults.aptitude?.improvements || []),
        ...(roundResults.technical?.improvements || []),
        ...(roundResults.communication?.improvements || []),
        ...(roundResults.hr?.improvements || []),
      ])
    ).slice(0, 5);

    const ratingBand = weightedOverallScore >= 85
      ? 'Exceptional — Top Tier Campus Placement Candidate'
      : weightedOverallScore >= 70
      ? 'Proficient — Strong Fundamentals, Ready with Minor Polish'
      : 'Developing — Recommend Structured Multi-Round Practice';

    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 animate-fade-in print:p-0 print:max-w-none">
        {renderConfirmationModals()}
        {renderProgressTracker()}

        <div className="p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl space-y-8 print:bg-white print:text-black">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6 print:border-black">
            <div>
              <div className="flex items-center space-x-2 text-indigo-400 font-semibold text-xs mb-1 print:text-black">
                <Sparkles className="w-4 h-4" />
                <span>CareerCurve Placement Evaluation Report</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight print:text-black">
                AI Interview Scorecard & Final Readiness Report
              </h1>
              <p className="text-xs text-slate-400 mt-1 print:text-gray-700 font-mono">
                Candidate: <strong className="text-indigo-300 print:text-black">{user.name || 'Candidate'}</strong> • Track: <strong className="text-teal-400">{isNonTech ? 'Non-Technical Track' : 'Technical Track'}</strong> • Department: <strong className="text-emerald-400">{isNonTech ? (candidateClassification?.discipline || department) : department}</strong> • Completed Rounds: <strong className="text-indigo-300">{completedSelected.length} of {activeSelected.length}</strong>
              </p>
            </div>

            <div className="flex items-center space-x-2 print:hidden">
              <button
                type="button"
                onClick={() => window.print()}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors flex items-center space-x-1.5 cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print / PDF</span>
              </button>
              <button
                type="button"
                onClick={handleReturnToSetup}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors cursor-pointer"
              >
                ← Back to Setup
              </button>
            </div>
          </div>

          {/* Overall Weighted Placement Score Banner */}
          <div className="p-8 rounded-3xl bg-gradient-to-r from-slate-950 via-indigo-950/70 to-slate-950 border border-indigo-500/30 text-center space-y-3 shadow-inner">
            <p className="text-xs uppercase font-bold tracking-widest text-slate-400">Overall Placement Readiness Index</p>
            <p className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-indigo-400 font-mono">
              {weightedOverallScore}%
            </p>
            <div className="inline-flex items-center space-x-1.5 px-3.5 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold">
              <Award className="w-4 h-4 text-amber-400" />
              <span>{ratingBand}</span>
            </div>
          </div>

          {/* Individual Round Scores Grid */}
          <div className={`grid gap-5 ${
            allowedRounds.length === 2
              ? 'grid-cols-1 md:grid-cols-2'
              : allowedRounds.length === 3
              ? 'grid-cols-1 md:grid-cols-3'
              : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'
          }`}>
            {/* Round 1: Aptitude (Only if candidate profile includes Aptitude) */}
            {allowedRounds.includes('aptitude') && (
              <div className={`p-5 rounded-2xl border space-y-3 ${
                activeSelected.includes('aptitude')
                  ? 'bg-slate-950 border-slate-800'
                  : 'bg-slate-950/40 border-slate-900 opacity-60'
              }`}>
                <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                  <span className="text-xs font-bold text-emerald-400 flex items-center space-x-1.5">
                    <BrainCircuit className="w-4 h-4" />
                    <span>Round {allowedRounds.indexOf('aptitude') + 1}: Aptitude Round</span>
                  </span>
                  {activeSelected.includes('aptitude') && isAptitudeCompleted ? (
                    <span className="text-sm font-mono font-extrabold text-emerald-400">{aptScore}%</span>
                  ) : !activeSelected.includes('aptitude') ? (
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-800">Optional / Skipped</span>
                  ) : (
                    <span className="text-[10px] font-mono text-amber-400">Pending</span>
                  )}
                </div>
                <p className="text-xs text-slate-300 leading-relaxed min-h-[48px]">
                  {activeSelected.includes('aptitude')
                    ? roundResults.aptitude?.summaryFeedback || 'Completed timed quantitative and logical assessment.'
                    : 'Aptitude round was optional and excluded from this evaluation journey.'}
                </p>
                {isAptitudeCompleted && (
                  <button
                    type="button"
                    onClick={() => handleViewScorecard('aptitude')}
                    className="w-full py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-emerald-400 border border-slate-800 text-xs font-bold transition-colors flex items-center justify-center space-x-1 cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Review Aptitude Details</span>
                  </button>
                )}
              </div>
            )}

            {/* If Non-Technical: Render Communication Round */}
            {isNonTech ? (
              allowedRounds.includes('communication') && (
                <div className={`p-5 rounded-2xl border space-y-3 ${
                  activeSelected.includes('communication')
                    ? 'bg-slate-950 border-slate-800'
                    : 'bg-slate-950/40 border-slate-900 opacity-60'
                }`}>
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                    <span className="text-xs font-bold text-teal-400 flex items-center space-x-1.5">
                      <MessageSquare className="w-4 h-4" />
                      <span>Round {allowedRounds.indexOf('communication') + 1}: Communication Round</span>
                    </span>
                    {activeSelected.includes('communication') && isCommunicationCompleted ? (
                      <span className="text-sm font-mono font-extrabold text-teal-400">{commScore}%</span>
                    ) : !activeSelected.includes('communication') ? (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-800">Optional / Skipped</span>
                    ) : (
                      <span className="text-[10px] font-mono text-amber-400">Pending</span>
                    )}
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed min-h-[48px]">
                    {activeSelected.includes('communication')
                      ? roundResults.communication?.summaryFeedback || 'Completed face-to-face AI speaking session with NLP fluency evaluation.'
                      : 'Communication round was excluded from this practice session.'}
                  </p>
                  {isCommunicationCompleted && (
                    <button
                      type="button"
                      onClick={() => handleViewScorecard('communication')}
                      className="w-full py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-teal-300 border border-slate-800 text-xs font-bold transition-colors flex items-center justify-center space-x-1 cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Review Communication Details</span>
                    </button>
                  )}
                </div>
              )
            ) : (
              /* If Technical: Render Technical Round */
              allowedRounds.includes('technical') && (
                <div className={`p-5 rounded-2xl border space-y-3 ${
                  activeSelected.includes('technical')
                    ? 'bg-slate-950 border-slate-800'
                    : 'bg-slate-950/40 border-slate-900 opacity-60'
                }`}>
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                    <span className="text-xs font-bold text-indigo-400 flex items-center space-x-1.5">
                      <Cpu className="w-4 h-4" />
                      <span>Round {allowedRounds.indexOf('technical') + 1}: Technical Round</span>
                    </span>
                    {activeSelected.includes('technical') && isTechnicalCompleted ? (
                      <span className="text-sm font-mono font-extrabold text-indigo-400">{techScore}%</span>
                    ) : !activeSelected.includes('technical') ? (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-800">Optional / Skipped</span>
                    ) : (
                      <span className="text-[10px] font-mono text-amber-400">Pending</span>
                    )}
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed min-h-[48px]">
                    {activeSelected.includes('technical')
                      ? roundResults.technical?.summaryFeedback || 'Demonstrated department domain knowledge and coding logic.'
                      : 'Technical round was excluded from this practice session.'}
                  </p>
                  {isTechnicalCompleted && (
                    <button
                      type="button"
                      onClick={() => handleViewScorecard('technical')}
                      className="w-full py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-indigo-300 border border-slate-800 text-xs font-bold transition-colors flex items-center justify-center space-x-1 cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Review Technical Details</span>
                    </button>
                  )}
                </div>
              )
            )}

            {/* HR Behaviour Round */}
            {allowedRounds.includes('hr') && (
              <div className={`p-5 rounded-2xl border space-y-3 ${
                activeSelected.includes('hr')
                  ? 'bg-slate-950 border-slate-800'
                  : 'bg-slate-950/40 border-slate-900 opacity-60'
              }`}>
                <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                  <span className="text-xs font-bold text-purple-400 flex items-center space-x-1.5">
                    <UserCheck className="w-4 h-4" />
                    <span>Round {allowedRounds.indexOf('hr') + 1}: HR Behaviour Round</span>
                  </span>
                  {activeSelected.includes('hr') && isHRCompleted ? (
                    <span className="text-sm font-mono font-extrabold text-purple-400">{hrScore}%</span>
                  ) : !activeSelected.includes('hr') ? (
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-800">Optional / Skipped</span>
                  ) : (
                    <span className="text-[10px] font-mono text-amber-400">Pending</span>
                  )}
                </div>
                <p className="text-xs text-slate-300 leading-relaxed min-h-[48px]">
                  {activeSelected.includes('hr')
                    ? roundResults.hr?.summaryFeedback || 'Completed live conversational STAR evaluation with AI Recruiter.'
                    : 'HR Behaviour round was excluded from this practice session.'}
                </p>
                {isHRCompleted && (
                  <button
                    type="button"
                    onClick={() => handleViewScorecard('hr')}
                    className="w-full py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-purple-300 border border-slate-800 text-xs font-bold transition-colors flex items-center justify-center space-x-1 cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Review HR Details</span>
                  </button>
                )}
              </div>
            )}

            {/* Optional Round for Technical Track: Communication Round */}
            {!isNonTech && allowedRounds.includes('communication') && activeSelected.includes('communication') && (
              <div className={`p-5 rounded-2xl border space-y-3 ${
                activeSelected.includes('communication')
                  ? 'bg-slate-950 border-slate-800'
                  : 'bg-slate-950/40 border-slate-900 opacity-60'
              }`}>
                <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                  <span className="text-xs font-bold text-teal-400 flex items-center space-x-1.5">
                    <MessageSquare className="w-4 h-4" />
                    <span>Optional Communication Round</span>
                  </span>
                  {activeSelected.includes('communication') && isCommunicationCompleted ? (
                    <span className="text-sm font-mono font-extrabold text-teal-400">{commScore}%</span>
                  ) : !activeSelected.includes('communication') ? (
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-800">Optional / Skipped</span>
                  ) : (
                    <span className="text-[10px] font-mono text-amber-400">Pending</span>
                  )}
                </div>
                <p className="text-xs text-slate-300 leading-relaxed min-h-[48px]">
                  {activeSelected.includes('communication')
                    ? roundResults.communication?.summaryFeedback || 'Completed face-to-face AI speaking session with NLP fluency evaluation.'
                    : 'Communication round was excluded from this practice session.'}
                </p>
                {isCommunicationCompleted && (
                  <button
                    type="button"
                    onClick={() => handleViewScorecard('communication')}
                    className="w-full py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-teal-300 border border-slate-800 text-xs font-bold transition-colors flex items-center justify-center space-x-1 cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Review Communication Details</span>
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Aggregated Strengths & Missed Concepts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
            <div className="p-5 rounded-2xl bg-slate-950 border border-emerald-500/20 space-y-3">
              <span className="font-bold text-emerald-400 uppercase tracking-wider text-[11px] flex items-center space-x-1.5">
                <CheckCheck className="w-4 h-4" />
                <span>Candidate Strengths Across All Rounds</span>
              </span>
              <ul className="space-y-2 text-slate-300">
                {allStrengths.length > 0 ? (
                  allStrengths.map((s, idx) => (
                    <li key={idx} className="flex items-start space-x-2">
                      <span className="text-emerald-400 font-bold">•</span>
                      <span>{s}</span>
                    </li>
                  ))
                ) : (
                  <li className="text-slate-400 italic">Core placement competence demonstrated</li>
                )}
              </ul>
            </div>

            <div className="p-5 rounded-2xl bg-slate-950 border border-amber-500/20 space-y-3">
              <span className="font-bold text-amber-400 uppercase tracking-wider text-[11px] flex items-center space-x-1.5">
                <TrendingUp className="w-4 h-4" />
                <span>Priority Focus Areas & Missed Concepts</span>
              </span>
              <ul className="space-y-2 text-slate-300">
                {allImprovements.length > 0 ? (
                  allImprovements.map((imp, idx) => (
                    <li key={idx} className="flex items-start space-x-2">
                      <span className="text-amber-400 font-bold">•</span>
                      <span>{imp}</span>
                    </li>
                  ))
                ) : (
                  <li className="text-slate-400 italic">Maintain consistent timed delivery and concise STAR answers</li>
                )}
              </ul>
            </div>
          </div>

          {/* Action Buttons: Return to Setup or Complete Journey */}
          <div className="text-center pt-4 border-t border-slate-800 print:hidden space-y-4">
            <div className="flex flex-wrap items-center justify-center gap-3">
              <button
                type="button"
                onClick={handleReturnToSetup}
                className="px-6 py-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs border border-slate-700 transition-colors flex items-center space-x-2 cursor-pointer shadow-md"
              >
                <span>← Back to Interview Setup</span>
              </button>
              <button
                type="button"
                onClick={() => onNavigate('feedback')}
                className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-600 hover:from-emerald-500 hover:to-indigo-500 text-white font-extrabold text-sm shadow-xl shadow-emerald-600/30 transition-all hover:scale-105 inline-flex items-center space-x-2.5 cursor-pointer"
              >
                <Award className="w-5 h-5 fill-current" />
                <span>Complete My Interview Journey</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-slate-400">
              Submit your candidate experience feedback and generate your personalized 7-Day Improvement Plan.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ===========================================================================
  // MAIN VIEW: PERSONALIZED INTERVIEW SETUP (Section 2, 3, 4, 7)
  // Displays the round cards and visible progress tracker
  // ===========================================================================
  if (!parsedResume || !candidateClassification) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8 animate-fade-in">
        {renderConfirmationModals()}

        {/* Page Title & Header */}
        <div className="text-center max-w-2xl mx-auto">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Interactive AI Interview Hub</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Interview Preparation Setup</h1>
          <p className="text-sm text-slate-400 mt-2 leading-relaxed">
            CareerCurve generates tailored interview tracks based on your verified degree, domain specialisation, and professional experience.
          </p>
        </div>

        {/* Mandatory Resume Analysis Card */}
        <div className="p-8 rounded-3xl bg-gradient-to-b from-slate-900 via-indigo-950/40 to-slate-900 border border-indigo-500/30 text-center space-y-6 shadow-2xl">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-indigo-600/20 border border-indigo-500/40 text-indigo-400 flex items-center justify-center shadow-lg">
            <UploadCloud className="w-8 h-8" />
          </div>
          <div className="max-w-lg mx-auto space-y-2">
            <h2 className="text-xl font-bold text-white">Mandatory Resume Analysis Required</h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              To ensure you receive the exact right interview rounds (Technical Coding vs. Communication vs. HR Behaviour), CareerCurve first analyzes your uploaded resume before generating questions.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto text-left text-xs">
            <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1.5">
              <span className="font-bold text-indigo-300">Engineering & Tech Candidates</span>
              <p className="text-slate-400 leading-relaxed">
                CSE, IT, ECE, EEE, Mechanical, Civil — includes Aptitude (for freshers), Resume-Driven Technical Coding, and HR Behaviour.
              </p>
            </div>
            <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1.5">
              <span className="font-bold text-teal-300">Non-Technical Candidates</span>
              <p className="text-slate-400 leading-relaxed">
                Commerce, BBA, Arts, Customer Service, Sales, HR — includes Communication and HR Behaviour rounds (Technical is strictly omitted).
              </p>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="button"
              onClick={() => onNavigate('resume')}
              className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 text-white font-extrabold text-sm shadow-xl shadow-indigo-600/30 transition-all hover:scale-105 inline-flex items-center space-x-2.5 cursor-pointer"
            >
              <UploadCloud className="w-5 h-5" />
              <span>Upload Resume to Unlock Interview Rounds</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      {renderConfirmationModals()}

      {/* Page Title & Header */}
      <div className="text-center max-w-2xl mx-auto">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-semibold mb-3">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Interactive AI Interview Hub</span>
        </div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">Personalized Interview Setup</h1>
        <p className="text-sm text-slate-400 mt-2 leading-relaxed">
          Configure your mock interview session tailored directly to your detected resume facts, domain skills, and target difficulty.
        </p>
      </div>

      {/* Professional Progress Indicator at the Top (Requirement 5) */}
      {renderProgressTracker()}

      {/* Detected Resume Information Summary Card */}
      {parsedResume && (
        <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950/70 to-slate-900 border border-indigo-500/30 space-y-4 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-300 flex items-center justify-center font-bold text-base">
                {parsedResume.fullName?.charAt(0) || user.name?.charAt(0) || 'C'}
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h2 className="text-lg font-extrabold text-white">{parsedResume.fullName || user.name || 'Candidate Profile'}</h2>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-semibold">
                    ✓ Resume Connected
                  </span>
                </div>
                <p className="text-xs text-indigo-300 font-medium">
                  {parsedResume.jobTitle || `${department} Specialist`} • <strong className="text-emerald-400">{department}</strong>
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2 text-[11px] text-slate-400 font-mono">
              <FileText className="w-3.5 h-3.5 text-indigo-400" />
              <span>{parsedResume.fileName || 'Uploaded Resume'}</span>
            </div>
          </div>

          {/* Education & Experience Highlights */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800/80 space-y-1">
              <p className="font-semibold text-slate-400 flex items-center space-x-1.5 text-[11px]">
                <GraduationCap className="w-3.5 h-3.5 text-indigo-400" />
                <span>Detected Education & Credentials</span>
              </p>
              {parsedResume.education && parsedResume.education.length > 0 ? (
                <p className="text-slate-200 font-medium pt-0.5">
                  {parsedResume.education[0].degree} • {parsedResume.education[0].college}
                  {parsedResume.education[0].cgpa && <span className="text-emerald-400 ml-1.5 font-mono">({parsedResume.education[0].cgpa})</span>}
                </p>
              ) : (
                <p className="text-slate-400 italic">Engineering Degree in {department}</p>
              )}
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800/80 space-y-1">
              <p className="font-semibold text-slate-400 flex items-center space-x-1.5 text-[11px]">
                <Briefcase className="w-3.5 h-3.5 text-indigo-400" />
                <span>Relevant Experience & Projects</span>
              </p>
              {parsedResume.experience && parsedResume.experience.length > 0 ? (
                <p className="text-slate-200 font-medium pt-0.5">
                  {parsedResume.experience[0].role} at {parsedResume.experience[0].company} ({parsedResume.experience[0].duration})
                </p>
              ) : parsedResume.projects && parsedResume.projects.length > 0 ? (
                <p className="text-slate-200 font-medium pt-0.5">
                  Capstone: {parsedResume.projects[0].title}
                </p>
              ) : (
                <p className="text-slate-400 italic">{department} Project Implementation</p>
              )}
            </div>
          </div>

          {/* Detected Skills Preconfigured */}
          <div className="space-y-2 pt-1">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-300 flex items-center space-x-1.5">
                <Wrench className="w-3.5 h-3.5 text-indigo-400" />
                <span>Preconfigured Interview Skills (Extracted from Resume):</span>
              </span>
              <span className="text-[10px] text-indigo-300 font-mono">
                {parsedResume.rawSkillsList?.length || 0} Skills Active
              </span>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {(parsedResume.rawSkillsList || [department]).slice(0, 10).map((skill, sIdx) => (
                <span
                  key={sIdx}
                  className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-[11px] font-semibold text-slate-200 flex items-center space-x-1"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  <span>{skill}</span>
                </span>
              ))}
              {parsedResume.rawSkillsList && parsedResume.rawSkillsList.length > 10 && (
                <span className="px-2 py-1 rounded-lg bg-slate-950 text-slate-400 border border-slate-800 text-[10px] font-mono">
                  +{parsedResume.rawSkillsList.length - 10} more
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Target Engineering Department Selector */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
          <div className="flex items-center space-x-2 text-xs font-bold text-white">
            <Target className="w-4 h-4 text-indigo-400" />
            <span>Target Interview Department:</span>
          </div>
          <div className="flex items-center space-x-2 text-[11px]">
            <span className="text-slate-400">Current Selection:</span>
            <span className="px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/30 font-semibold font-mono">
              {department}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
          {[
            { id: 'CSE', label: 'Computer Science (CSE)', icon: '💻' },
            { id: 'ISE', label: 'Information Science (ISE)', icon: '🌐' },
            { id: 'ECE', label: 'Electronics (ECE)', icon: '📡' },
            { id: 'EEE', label: 'Electrical (EEE)', icon: '⚡' },
            { id: 'Civil', label: 'Civil Engineering', icon: '🏗️' },
            { id: 'Mechanical', label: 'Mechanical Eng', icon: '⚙️' },
            { id: 'AI & ML', label: 'Data Science & ML', icon: '📊' },
            { id: 'Other', label: 'Other Engineering', icon: '🎯' },
          ].map((dept) => {
            const isSelected = department === dept.id;
            return (
              <button
                key={dept.id}
                type="button"
                onClick={() => setDepartment(dept.id as CandidateDepartmentOption)}
                className={`p-2.5 rounded-xl text-left border text-xs transition-all cursor-pointer flex items-center space-x-2 ${
                  isSelected
                    ? 'bg-indigo-600/20 border-indigo-500 text-white shadow-md font-bold ring-1 ring-indigo-500/50'
                    : 'bg-slate-950/70 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                }`}
              >
                <span className="text-sm">{dept.icon}</span>
                <span className="truncate text-[11px]">{dept.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Difficulty Level Selector */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 max-w-2xl mx-auto">
        <div className="flex items-center space-x-2 text-xs font-bold text-slate-300">
          <Sliders className="w-4 h-4 text-indigo-400" />
          <span>Select Challenge Level:</span>
        </div>

        <div className="flex items-center space-x-2">
          {(['Beginner', 'Intermediate', 'Advanced'] as const).map((level) => (
            <button
              key={level}
              type="button"
              onClick={() => setDifficulty(level)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                difficulty === level
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              {level}
            </button>
          ))}
        </div>
      </div>

      {/* =====================================================================
          CANDIDATE CLASSIFICATION & FLEXIBLE ROUND SELECTION BANNER (Section 1 & 2)
          ===================================================================== */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div className="flex items-center space-x-2.5">
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
              candidateClassification?.track === 'fresher'
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                : 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30'
            }`}>
              <Award className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-white">
                Candidate Track: {candidateClassification?.candidateType || 'Placement Preparation'}
              </h3>
              <p className="text-[11px] text-slate-400">
                Graduation Batch: <strong className="text-white">{candidateClassification?.graduationDateFormatted || user.graduationYear || '2026'}</strong> • Recommended Track: <strong className="text-emerald-400">{candidateClassification?.recommendedPreparation || 'All 3 Rounds'}</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-extrabold border ${
              candidateClassification?.track === 'fresher'
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                : 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40'
            }`}>
              {candidateClassification?.track === 'fresher' ? '🌱 Fresher Track' : '💼 Experienced Preparation Track'}
            </span>
          </div>
        </div>

        {/* Flexible Round Selector Control */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold text-slate-300">Selected Rounds:</span>
            <div className="flex flex-wrap gap-1.5">
              {allowedRounds.map((rId) => {
                const isSelected = activeSelectedRounds.includes(rId);
                const isRecommended = defaultTrackRounds.includes(rId);
                const label = getRoundTitle(rId);
                const roundIdx = allowedRounds.indexOf(rId) + 1;
                return (
                  <button
                    key={rId}
                    type="button"
                    onClick={() => handleToggleWorkflowRound(rId)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer flex items-center space-x-1.5 ${
                      isSelected
                        ? 'bg-indigo-600/30 border-indigo-500 text-white shadow-sm'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <span>{isSelected ? '✓' : '+'}</span>
                    <span>{roundIdx}. {label}</span>
                    <span className="text-[10px] opacity-75 font-mono">({isRecommended ? 'Recommended' : 'Optional'})</span>
                  </button>
                );
              })}
            </div>
          </div>

          <span className="text-[11px] text-slate-400 font-mono self-start sm:self-auto">
            {activeSelectedRounds.length} round{activeSelectedRounds.length === 1 ? '' : 's'} active • {completedRounds.length} completed
          </span>
        </div>
      </div>

      {/* EDUCATIONAL TRACK SWITCHER / CONFIRMATION BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-slate-900/90 border border-slate-800">
        <div className="flex items-center space-x-2.5">
          <span className={`px-2.5 py-1 rounded-full text-xs font-extrabold border ${
            isNonTech
              ? 'bg-teal-500/20 text-teal-300 border-teal-500/40'
              : 'bg-blue-500/20 text-blue-300 border-blue-500/40'
          }`}>
            {isNonTech ? '🏛️ Non-Technical Track' : '⚡ Technical Track'}
          </span>
          <p className="text-xs text-slate-300">
            {isNonTech
              ? 'Rounds: Aptitude + Communication + HR Behaviour (Technical Round Strictly Omitted)'
              : 'Rounds: Aptitude + Technical Interview + HR Behaviour'}
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-[11px] text-slate-400">Background:</span>
          <button
            type="button"
            onClick={() => handleSwitchBackground(isNonTech ? 'technical' : 'non_technical')}
            className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors cursor-pointer"
          >
            Switch to {isNonTech ? 'Technical Student' : 'Non-Technical Student'}
          </button>
        </div>
      </div>

      {/* =====================================================================
          INTERVIEW ROUND CARDS (Data-driven by Candidate Track)
          For Non-Technical: Aptitude + Communication + HR (Technical omitted)
          For Technical: Aptitude + Technical + HR (+ Optional Communication)
          ===================================================================== */}
      <div className={`grid gap-6 ${
        isNonTech
          ? 'grid-cols-1 md:grid-cols-3'
          : 'grid-cols-1 md:grid-cols-3 lg:grid-cols-4'
      }`}>
        {/* CARD 1 — APTITUDE INTERVIEW ROUND */}
        {allowedRounds.includes('aptitude') && (
        <div className={`p-6 rounded-2xl border transition-all relative overflow-hidden flex flex-col justify-between ${
          isAptitudeCompleted
            ? 'bg-slate-900/90 border-emerald-500/40 shadow-xl'
            : currentActiveStage === 'aptitude'
            ? 'bg-slate-900 border-indigo-500 ring-2 ring-indigo-500/30 shadow-2xl'
            : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
        }`}>
          <div>
            {/* Header / Badges */}
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 flex items-center justify-center text-white shadow-md">
                <BrainCircuit className="w-6 h-6" />
              </div>

              <div className="flex items-center space-x-2">
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-950 text-slate-400 border border-slate-800 font-mono">
                  Round {allowedRounds.indexOf('aptitude') + 1}
                </span>
                {!activeSelectedRounds.includes('aptitude') && !isAptitudeCompleted ? (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-800 text-slate-400 border border-slate-700">
                    Optional
                  </span>
                ) : isAptitudeCompleted ? (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                    <CheckCircle2 className="w-3 h-3 mr-1 text-emerald-400" />
                    {roundResults.aptitude?.scorePercentage}%
                  </span>
                ) : (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                    Selected
                  </span>
                )}
              </div>
            </div>

            <h3 className="text-xl font-bold text-white mb-1">Aptitude Interview Round</h3>
            <p className="text-xs font-semibold text-emerald-400 mb-3">Quantitative, Logical & Verbal Ability</p>

            <ul className="text-xs text-slate-300 space-y-2 mb-6 leading-relaxed">
              <li className="flex items-start space-x-2">
                <span className="text-emerald-400 font-bold">•</span>
                <span>Quantitative aptitude (percentages, ratios, time & work, profit & loss)</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-emerald-400 font-bold">•</span>
                <span>Logical reasoning & number series deduction</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-emerald-400 font-bold">•</span>
                <span>Verbal ability & comprehension exercises</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-emerald-400 font-bold">•</span>
                <span>Selected challenge level: <strong className="text-indigo-300">{difficulty}</strong></span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-emerald-400 font-bold">•</span>
                <span>Timed questions, answer selection, navigation, and submission</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-emerald-400 font-bold">•</span>
                <span>Final scorecard with correct answers, explanations, strengths, and weaknesses</span>
              </li>
            </ul>
          </div>

          {/* Action Button */}
          <div className="pt-2">
            {isAptitudeCompleted ? (
              <div className="space-y-2.5">
                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => handleViewScorecard('aptitude')}
                    className="flex-1 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-400 font-bold text-xs border border-slate-700 transition-colors flex items-center justify-center space-x-1.5 cursor-pointer shadow-md"
                  >
                    <Eye className="w-4 h-4" />
                    <span>View Scorecard ({roundResults.aptitude?.scorePercentage}%)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setRetakeTargetRound('aptitude')}
                    title="Retake Aptitude Round"
                    className="p-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white border border-slate-700 transition-colors cursor-pointer"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                </div>
                {(() => {
                  const remainingSelected = activeSelectedRounds.filter(
                    (r) => r !== 'aptitude' && !completedRounds.includes(r)
                  );
                  const nextR = remainingSelected[0];
                  if (nextR) {
                    const roundLabel = getRoundTitle(nextR);
                    return (
                      <button
                        type="button"
                        onClick={() => handleStartRound(nextR)}
                        className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold text-xs shadow-md shadow-indigo-600/25 transition-all flex items-center justify-center space-x-1.5 cursor-pointer"
                      >
                        <span>Continue to {roundLabel}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    );
                  }
                  return (
                    <button
                      type="button"
                      onClick={() => setShowConsolidatedReport(true)}
                      className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-600 hover:from-emerald-500 hover:to-indigo-500 text-white font-bold text-xs shadow-md shadow-emerald-600/25 transition-all flex items-center justify-center space-x-1.5 cursor-pointer"
                    >
                      <span>View Consolidated Scorecard</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  );
                })()}
              </div>
            ) : (
              <button
                type="button"
                onClick={() => {
                  if (!activeSelectedRounds.includes('aptitude')) {
                    handleToggleWorkflowRound('aptitude');
                  }
                  handleStartRound('aptitude');
                }}
                className={`w-full py-3.5 rounded-xl font-bold text-xs shadow-lg transition-all flex items-center justify-center space-x-2 cursor-pointer ${
                  activeSelectedRounds.includes('aptitude')
                    ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-emerald-600/20'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
                }`}
              >
                <span>{activeSelectedRounds.includes('aptitude') ? 'Start Aptitude Round' : 'Include & Start Aptitude'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
        )}

        {/* CARD 2: IF TECHNICAL TRACK -> TECHNICAL INTERVIEW; IF NON-TECHNICAL -> FACE-TO-FACE COMMUNICATION */}
        {!isNonTech ? (
          /* TECHNICAL INTERVIEW ROUND */
          <div className={`p-6 rounded-2xl border transition-all relative overflow-hidden flex flex-col justify-between ${
            isTechnicalCompleted
              ? 'bg-slate-900/90 border-indigo-500/40 shadow-xl'
              : currentActiveStage === 'technical'
              ? 'bg-slate-900 border-indigo-500 ring-2 ring-indigo-500/30 shadow-2xl'
              : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
          }`}>
            <div>
              {/* Header / Badges */}
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-md bg-gradient-to-r from-blue-600 to-indigo-600">
                  <Cpu className="w-6 h-6" />
                </div>

                <div className="flex items-center space-x-2">
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-950 text-slate-400 border border-slate-800 font-mono">
                    Round {allowedRounds.indexOf('technical') + 1}
                  </span>
                  {!activeSelectedRounds.includes('technical') && !isTechnicalCompleted ? (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-800 text-slate-400 border border-slate-700">
                      Optional
                    </span>
                  ) : isTechnicalCompleted ? (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">
                      <CheckCircle2 className="w-3 h-3 mr-1 text-indigo-400" />
                      {roundResults.technical?.scorePercentage}%
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">
                      Selected
                    </span>
                  )}
                </div>
              </div>

              <h3 className="text-xl font-bold text-white mb-1">Technical Interview Round</h3>
              <p className="text-xs font-semibold text-indigo-400 mb-3">Resume-Aware NLP & Coding Workspace</p>

              <ul className="text-xs text-slate-300 space-y-2 mb-6 leading-relaxed">
                <li className="flex items-start space-x-2">
                  <span className="text-indigo-400 font-bold">•</span>
                  <span>Generate questions from actual uploaded resume skills and projects</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-indigo-400 font-bold">•</span>
                  <span>Programming, data structures, DBMS, SQL, APIs and department topics (<strong className="text-emerald-400">{department}</strong>)</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-indigo-400 font-bold">•</span>
                  <span>In-browser code editor, language selector, test cases and technical evaluation</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-indigo-400 font-bold">•</span>
                  <span>Selected challenge level: <strong className="text-indigo-300">{difficulty}</strong></span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-indigo-400 font-bold">•</span>
                  <span>NLP-based question selection and semantic answer evaluation</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-indigo-400 font-bold">•</span>
                  <span>Final technical scorecard and improvement recommendations</span>
                </li>
              </ul>
            </div>

            {/* Action Button */}
            <div className="pt-2">
              {isTechnicalCompleted ? (
                <div className="space-y-2.5">
                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={() => handleViewScorecard('technical')}
                      className="flex-1 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-indigo-300 font-bold text-xs border border-slate-700 transition-colors flex items-center justify-center space-x-1.5 cursor-pointer shadow-md"
                    >
                      <Eye className="w-4 h-4" />
                      <span>View Scorecard ({roundResults.technical?.scorePercentage}%)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setRetakeTargetRound('technical')}
                      title="Retake Technical Round"
                      className="p-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white border border-slate-700 transition-colors cursor-pointer"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </button>
                  </div>
                  {(() => {
                    const remainingSelected = activeSelectedRounds.filter(
                      (r) => r !== 'technical' && !completedRounds.includes(r)
                    );
                    const nextR = remainingSelected[0];
                    if (nextR) {
                      const roundLabel = getRoundTitle(nextR);
                      return (
                        <button
                          type="button"
                          onClick={() => handleStartRound(nextR)}
                          className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 text-white font-bold text-xs shadow-md shadow-purple-600/25 transition-all flex items-center justify-center space-x-1.5 cursor-pointer"
                        >
                          <span>Continue to {roundLabel}</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      );
                    }
                    return (
                      <button
                        type="button"
                        onClick={() => setShowConsolidatedReport(true)}
                        className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-600 hover:from-emerald-500 hover:to-indigo-500 text-white font-bold text-xs shadow-md shadow-emerald-600/25 transition-all flex items-center justify-center space-x-1.5 cursor-pointer"
                      >
                        <span>View Consolidated Scorecard</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    );
                  })()}
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    if (!activeSelectedRounds.includes('technical')) {
                      handleToggleWorkflowRound('technical');
                    }
                    handleStartRound('technical');
                  }}
                  className={`w-full py-3.5 rounded-xl font-bold text-xs shadow-lg transition-all flex items-center justify-center space-x-2 cursor-pointer ${
                    activeSelectedRounds.includes('technical')
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-indigo-600/20'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
                  }`}
                >
                  <span>{activeSelectedRounds.includes('technical') ? 'Start Technical Round' : 'Include & Start Technical'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        ) : (
          /* FACE-TO-FACE COMMUNICATION ROUND FOR NON-TECHNICAL CANDIDATE */
          <div className={`p-6 rounded-2xl border transition-all relative overflow-hidden flex flex-col justify-between ${
            isCommunicationCompleted
              ? 'bg-slate-900/90 border-teal-500/40 shadow-xl'
              : currentActiveStage === 'communication'
              ? 'bg-slate-900 border-teal-500 ring-2 ring-teal-500/30 shadow-2xl'
              : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
          }`}>
            <div>
              {/* Header / Badges */}
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-md bg-gradient-to-r from-teal-600 to-cyan-600">
                  <MessageSquare className="w-6 h-6" />
                </div>

                <div className="flex items-center space-x-2">
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-950 text-slate-400 border border-slate-800 font-mono">
                    Round {allowedRounds.indexOf('communication') + 1}
                  </span>
                  {!activeSelectedRounds.includes('communication') && !isCommunicationCompleted ? (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-800 text-slate-400 border border-slate-700">
                      Optional
                    </span>
                  ) : isCommunicationCompleted ? (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-teal-500/20 text-teal-300 border border-teal-500/40">
                      <CheckCircle2 className="w-3 h-3 mr-1 text-teal-400" />
                      {roundResults.communication?.scorePercentage}%
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-teal-500/20 text-teal-300 border border-teal-500/40">
                      Selected
                    </span>
                  )}
                </div>
              </div>

              <h3 className="text-xl font-bold text-white mb-1">Communication Round</h3>
              <p className="text-xs font-semibold text-teal-400 mb-3">Face-to-Face AI Speaking Coach</p>

              <ul className="text-xs text-slate-300 space-y-2 mb-6 leading-relaxed">
                <li className="flex items-start space-x-2">
                  <span className="text-teal-400 font-bold">•</span>
                  <span>20s topic preparation countdown, 90s speaking response timer</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-teal-400 font-bold">•</span>
                  <span>Domain-specific topics tailored to <strong className="text-emerald-400">{candidateClassification?.discipline || 'Commerce / Management / Arts'}</strong></span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-teal-400 font-bold">•</span>
                  <span>Camera presence & framing guidance (strictly zero score bias)</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-teal-400 font-bold">•</span>
                  <span>Live speech recognition (STT) and editable answer review</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-teal-400 font-bold">•</span>
                  <span>Evaluates Fluency, Grammar, Vocabulary, Clarity, Organization & Topic Understanding</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-teal-400 font-bold">•</span>
                  <span>Speaking pace (WPM), filler word count & domain advice</span>
                </li>
              </ul>
            </div>

            {/* Action Button */}
            <div className="pt-2">
              {isCommunicationCompleted ? (
                <div className="space-y-2.5">
                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={() => handleViewScorecard('communication')}
                      className="flex-1 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-teal-300 font-bold text-xs border border-slate-700 transition-colors flex items-center justify-center space-x-1.5 cursor-pointer shadow-md"
                    >
                      <Eye className="w-4 h-4" />
                      <span>View Scorecard ({roundResults.communication?.scorePercentage}%)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setRetakeTargetRound('communication')}
                      title="Retake Communication Round"
                      className="p-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white border border-slate-700 transition-colors cursor-pointer"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </button>
                  </div>
                  {(() => {
                    const remainingSelected = activeSelectedRounds.filter(
                      (r) => r !== 'communication' && !completedRounds.includes(r)
                    );
                    const nextR = remainingSelected[0];
                    if (nextR) {
                      const roundLabel = getRoundTitle(nextR);
                      return (
                        <button
                          type="button"
                          onClick={() => handleStartRound(nextR)}
                          className="w-full py-3 rounded-xl bg-gradient-to-r from-teal-600 via-indigo-600 to-purple-600 hover:from-teal-500 hover:to-purple-500 text-white font-bold text-xs shadow-md shadow-teal-600/25 transition-all flex items-center justify-center space-x-1.5 cursor-pointer"
                        >
                          <span>Continue to {roundLabel}</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      );
                    }
                    return (
                      <button
                        type="button"
                        onClick={() => setShowConsolidatedReport(true)}
                        className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-600 hover:from-emerald-500 hover:to-indigo-500 text-white font-bold text-xs shadow-md shadow-emerald-600/25 transition-all flex items-center justify-center space-x-1.5 cursor-pointer"
                      >
                        <span>View Consolidated Scorecard</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    );
                  })()}
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    if (!activeSelectedRounds.includes('communication')) {
                      handleToggleWorkflowRound('communication');
                    }
                    handleStartRound('communication');
                  }}
                  className={`w-full py-3.5 rounded-xl font-bold text-xs shadow-lg transition-all flex items-center justify-center space-x-2 cursor-pointer ${
                    activeSelectedRounds.includes('communication')
                      ? 'bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-500 hover:to-cyan-500 text-white shadow-teal-600/20'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
                  }`}
                >
                  <span>{activeSelectedRounds.includes('communication') ? 'Start Communication Round' : 'Include & Start Communication'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        )}

        {/* CARD 3 — HR BEHAVIOUR INTERVIEW ROUND */}
        {allowedRounds.includes('hr') && (
        <div className={`p-6 rounded-2xl border transition-all relative overflow-hidden flex flex-col justify-between ${
          isHRCompleted
            ? 'bg-slate-900/90 border-purple-500/40 shadow-xl'
            : currentActiveStage === 'hr'
            ? 'bg-slate-900 border-purple-500 ring-2 ring-purple-500/30 shadow-2xl'
            : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
        }`}>
          <div>
            {/* Header / Badges */}
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-md bg-gradient-to-r from-indigo-600 to-purple-600">
                <UserCheck className="w-6 h-6" />
              </div>

              <div className="flex items-center space-x-2">
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-950 text-slate-400 border border-slate-800 font-mono">
                  Round {allowedRounds.indexOf('hr') + 1}
                </span>
                {!activeSelectedRounds.includes('hr') && !isHRCompleted ? (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-800 text-slate-400 border border-slate-700">
                    Optional
                  </span>
                ) : isHRCompleted ? (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/40">
                    <CheckCircle2 className="w-3 h-3 mr-1 text-purple-400" />
                    {roundResults.hr?.scorePercentage}%
                  </span>
                ) : (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/40">
                    Selected
                  </span>
                )}
              </div>
            </div>

            <h3 className="text-xl font-bold text-white mb-1">HR Behaviour Interview Round</h3>
            <p className="text-xs font-semibold text-purple-400 mb-3">Virtual Recruiter • Live Voice & STAR</p>

            <ul className="text-xs text-slate-300 space-y-2 mb-6 leading-relaxed">
              <li className="flex items-start space-x-2">
                <span className="text-purple-400 font-bold">•</span>
                <span>Resume-based personal and situational interview questions</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-purple-400 font-bold">•</span>
                <span>Two-way AI voice interaction with virtual recruiter Sarah Chen</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-purple-400 font-bold">•</span>
                <span>Automatic interviewer questions using text-to-speech (TTS)</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-purple-400 font-bold">•</span>
                <span>Candidate speech recognition (STT) and editable answers</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-purple-400 font-bold">•</span>
                <span>Communication evaluation and STAR-method structured scoring</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-purple-400 font-bold">•</span>
                <span>Preserve live camera presence and single-person monitoring</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-purple-400 font-bold">•</span>
                <span>Final HR scorecard with actionable feedback & speaking pace (WPM)</span>
              </li>
            </ul>
          </div>

          {/* Action Button */}
          <div className="pt-2">
            {isHRCompleted ? (
              <div className="space-y-2.5">
                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => handleViewScorecard('hr')}
                    className="flex-1 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-purple-300 font-bold text-xs border border-slate-700 transition-colors flex items-center justify-center space-x-1.5 cursor-pointer shadow-md"
                  >
                    <Eye className="w-4 h-4" />
                    <span>View Scorecard ({roundResults.hr?.scorePercentage}%)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setRetakeTargetRound('hr')}
                    title="Retake HR Behaviour Round"
                    className="p-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white border border-slate-700 transition-colors cursor-pointer"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                </div>
                {(() => {
                  const remainingSelected = activeSelectedRounds.filter(
                    (r) => r !== 'hr' && !completedRounds.includes(r)
                  );
                  const nextR = remainingSelected[0];
                  if (nextR) {
                    const roundLabel = getRoundTitle(nextR);
                    return (
                      <button
                        type="button"
                        onClick={() => handleStartRound(nextR)}
                        className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs shadow-md shadow-purple-600/25 transition-all flex items-center justify-center space-x-1.5 cursor-pointer"
                      >
                        <span>Continue to {roundLabel}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    );
                  }
                  return (
                    <button
                      type="button"
                      onClick={() => setShowConsolidatedReport(true)}
                      className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-600 hover:from-emerald-500 hover:to-indigo-500 text-white font-bold text-xs shadow-md shadow-emerald-600/25 transition-all flex items-center justify-center space-x-1.5 cursor-pointer"
                    >
                      <span>View Final Overall Report</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  );
                })()}
              </div>
            ) : (
              <button
                type="button"
                onClick={() => {
                  if (!activeSelectedRounds.includes('hr')) {
                    handleToggleWorkflowRound('hr');
                  }
                  handleStartRound('hr');
                }}
                className={`w-full py-3.5 rounded-xl font-bold text-xs shadow-lg transition-all flex items-center justify-center space-x-2 cursor-pointer ${
                  activeSelectedRounds.includes('hr')
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-purple-600/20'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
                }`}
              >
                <span>{activeSelectedRounds.includes('hr') ? 'Start HR Behaviour Round' : 'Include & Start HR'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
        )}

        {/* CARD 4: OPTIONAL COMMUNICATION ROUND FOR TECHNICAL TRACK */}
        {!isNonTech && allowedRounds.includes('communication') && (
          <div className={`p-6 rounded-2xl border transition-all relative overflow-hidden flex flex-col justify-between ${
            isCommunicationCompleted
              ? 'bg-slate-900/90 border-teal-500/40 shadow-xl'
              : currentActiveStage === 'communication'
              ? 'bg-slate-900 border-teal-500 ring-2 ring-teal-500/30 shadow-2xl'
              : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
          }`}>
            <div>
              {/* Header / Badges */}
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-md bg-gradient-to-r from-teal-600 to-cyan-600">
                  <MessageSquare className="w-6 h-6" />
                </div>

                <div className="flex items-center space-x-2">
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-950 text-slate-400 border border-slate-800 font-mono">
                    Optional
                  </span>
                  {!activeSelectedRounds.includes('communication') && !isCommunicationCompleted ? (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-800 text-slate-400 border border-slate-700">
                      Optional
                    </span>
                  ) : isCommunicationCompleted ? (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-teal-500/20 text-teal-300 border border-teal-500/40">
                      <CheckCircle2 className="w-3 h-3 mr-1 text-teal-400" />
                      {roundResults.communication?.scorePercentage}%
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-teal-500/20 text-teal-300 border border-teal-500/40">
                      Selected
                    </span>
                  )}
                </div>
              </div>

              <h3 className="text-xl font-bold text-white mb-1">Communication Round</h3>
              <p className="text-xs font-semibold text-teal-400 mb-3">AI Speaking Coach (All Branches)</p>

              <ul className="text-xs text-slate-300 space-y-2 mb-6 leading-relaxed">
                <li className="flex items-start space-x-2">
                  <span className="text-teal-400 font-bold">•</span>
                  <span>Face-to-face AI speaking session with video camera framing</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-teal-400 font-bold">•</span>
                  <span>Technical & non-technical topics, 20s prep, 90s response</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-teal-400 font-bold">•</span>
                  <span>Evaluates fluency, vocabulary, grammar, idea structure</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-teal-400 font-bold">•</span>
                  <span>Zero camera score bias: scores derived 100% from speech NLP</span>
                </li>
              </ul>
            </div>

            {/* Action Button */}
            <div className="pt-2">
              {isCommunicationCompleted ? (
                <div className="space-y-2.5">
                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={() => handleViewScorecard('communication')}
                      className="flex-1 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-teal-300 font-bold text-xs border border-slate-700 transition-colors flex items-center justify-center space-x-1.5 cursor-pointer shadow-md"
                    >
                      <Eye className="w-4 h-4" />
                      <span>View Scorecard ({roundResults.communication?.scorePercentage}%)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setRetakeTargetRound('communication')}
                      title="Retake Communication Round"
                      className="p-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white border border-slate-700 transition-colors cursor-pointer"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </button>
                  </div>
                  {(() => {
                    const remainingSelected = activeSelectedRounds.filter(
                      (r) => r !== 'communication' && !completedRounds.includes(r)
                    );
                    const nextR = remainingSelected[0];
                    if (nextR) {
                      const roundLabel = getRoundTitle(nextR);
                      return (
                        <button
                          type="button"
                          onClick={() => handleStartRound(nextR)}
                          className="w-full py-3 rounded-xl bg-gradient-to-r from-teal-600 via-indigo-600 to-purple-600 hover:from-teal-500 hover:to-purple-500 text-white font-bold text-xs shadow-md shadow-teal-600/25 transition-all flex items-center justify-center space-x-1.5 cursor-pointer"
                        >
                          <span>Continue to {roundLabel}</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      );
                    }
                    return (
                      <button
                        type="button"
                        onClick={() => setShowConsolidatedReport(true)}
                        className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-600 hover:from-emerald-500 hover:to-indigo-500 text-white font-bold text-xs shadow-md shadow-emerald-600/25 transition-all flex items-center justify-center space-x-1.5 cursor-pointer"
                      >
                        <span>View Consolidated Scorecard</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    );
                  })()}
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    if (!activeSelectedRounds.includes('communication')) {
                      handleToggleWorkflowRound('communication');
                    }
                    handleStartRound('communication');
                  }}
                  className={`w-full py-3.5 rounded-xl font-bold text-xs shadow-lg transition-all flex items-center justify-center space-x-2 cursor-pointer ${
                    activeSelectedRounds.includes('communication')
                      ? 'bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-500 hover:to-cyan-500 text-white shadow-teal-600/20'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
                  }`}
                >
                  <span>{activeSelectedRounds.includes('communication') ? 'Start Communication Round' : 'Include & Start Communication'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Completion View Overall Report Launcher */}
      {isAllSelectedRoundsCompleted && (
        <div className="p-8 rounded-3xl bg-gradient-to-r from-emerald-950/40 via-indigo-950/40 to-purple-950/40 border border-emerald-500/40 text-center space-y-4 shadow-2xl animate-fade-in">
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto shadow-lg">
            <Award className="w-9 h-9" />
          </div>
          <div>
            <h2 className="text-2xl font-extrabold text-white">
              {activeSelectedRounds.length === 3
                ? 'All Three Interview Rounds Completed!'
                : `All ${activeSelectedRounds.length} Selected Interview Rounds Completed!`}
            </h2>
            <p className="text-xs text-slate-300 mt-1 max-w-lg mx-auto">
              Your completed {activeSelectedRounds.map(r => r === 'aptitude' ? `Aptitude (${roundResults.aptitude?.scorePercentage || 0}%)` : r === 'technical' ? `Technical (${roundResults.technical?.scorePercentage || 0}%)` : `HR Behaviour (${roundResults.hr?.scorePercentage || 0}%)`).join(', ')} assessments have been compiled into your placement readiness scorecard.
            </p>
          </div>
          <div>
            <button
              type="button"
              onClick={() => {
                setShowConsolidatedReport(true);
              }}
              className="px-10 py-4 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-600 hover:from-emerald-500 hover:to-indigo-500 text-white font-extrabold text-base shadow-xl shadow-emerald-600/30 transition-all hover:scale-105 inline-flex items-center space-x-3 cursor-pointer"
            >
              <Award className="w-5 h-5 fill-current" />
              <span>View Final Overall Report & Scorecard</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
