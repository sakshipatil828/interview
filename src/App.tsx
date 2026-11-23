import React, { useState, useEffect } from 'react';
import { 
  User, 
  ParsedResume, 
  InterviewSession, 
  AptitudeResult,
  InterviewRoundId,
  InterviewJourneyState 
} from './types';
import { AlertCircle } from 'lucide-react';
import { Navbar } from './components/Navbar';
import { LandingPage } from './components/LandingPage';
import { AuthModal } from './components/AuthModal';
import { OnboardingModal } from './components/OnboardingModal';
import { Dashboard } from './components/Dashboard';
import { ResumeModule } from './components/ResumeModule';
import { InterviewSelection } from './components/InterviewSelection';
import { AIInterviewModule } from './components/AIInterviewModule';
import { InterviewRoundsWorkflow } from './components/InterviewRoundsWorkflow';
import { TechnicalInterviewModule } from './components/TechnicalInterviewModule';
import { CommunicationInterviewModule } from './components/CommunicationInterviewModule';
import { HRVoiceInterviewModule } from './components/HRVoiceInterviewModule';
import { AptitudeModule } from './components/AptitudeModule';
import { FacialVoiceAnalysisDesign } from './components/FacialVoiceAnalysisDesign';
import { FinalReport } from './components/FinalReport';
import { InterviewFeedbackModule } from './components/InterviewFeedbackModule';
import { ProjectDocs } from './components/ProjectDocs';
import { EngineeringDepartment } from './nlp/types';
import {
  restoreAuthenticatedUser,
  restoreSessionWithServer,
  logoutCandidateAccount,
  clearActiveSession,
  getUserResume,
  saveUserResume,
  clearUserResume,
  getUserInterviews,
  saveUserInterview,
  getUserAptitudeHistory,
  saveUserAptitudeResult,
  purgeLegacyUnscopedStorage,
  getUserInterviewJourney,
  saveUserInterviewJourney,
  clearUserInterviewJourney
} from './services/authStorageService';
import {
  parseCurrentRoute,
  getTabPath,
  isProtectedTab,
  PROTECTED_TABS,
  InterviewRoundType
} from './services/routeService';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('landing');

  // User Authentication State
  const [user, setUser] = useState<User | null>(null);
  const [authModalOpen, setAuthModalOpen] = useState<boolean>(false);
  const [authInitialMode, setAuthInitialMode] = useState<'login' | 'register'>('login');
  const [authPromptMessage, setAuthPromptMessage] = useState<string | null>(null);
  const [pendingRedirect, setPendingRedirect] = useState<{ tab: string; round?: InterviewRoundType; path?: string } | null>(null);
  const [showOnboarding, setShowOnboarding] = useState<boolean>(false);

  // Resume State - Dynamic, strictly scoped per authenticated user
  const [parsedResume, setParsedResume] = useState<ParsedResume | null>(null);

  // Interview & Aptitude Session Histories
  const [interviewSessions, setInterviewSessions] = useState<InterviewSession[]>([]);
  const [aptitudeResults, setAptitudeResults] = useState<AptitudeResult[]>([]);

  // Active Session Config (Strictly three main practice rounds: technical, hr, aptitude)
  const [interviewSubState, setInterviewSubState] = useState<'selection' | 'active'>('selection');
  const [selectedRound, setSelectedRound] = useState<'technical' | 'hr' | 'aptitude' | 'communication'>('technical');
  const [standaloneRound, setStandaloneRound] = useState<'technical' | 'hr' | 'communication' | null>(null);
  const [difficulty, setDifficulty] = useState<'Beginner' | 'Intermediate' | 'Advanced'>('Intermediate');
  const [targetDepartment, setTargetDepartment] = useState<EngineeringDepartment | undefined>(undefined);

  // Centralized Route Guard: handles tab navigation, authenticates protected views, preserves destination
  const handleTabChange = (tab: string, round?: InterviewRoundType) => {
    if (!user && isProtectedTab(tab)) {
      setPendingRedirect({ tab, round, path: getTabPath(tab) });
      setAuthPromptMessage('Please log in or create an account to access this feature.');
      setAuthInitialMode('login');
      setAuthModalOpen(true);
      return;
    }
    setAuthPromptMessage(null);
    if (tab === 'interview') {
      if (round === 'technical' || round === 'hr' || round === 'communication') {
        setStandaloneRound(round);
        setSelectedRound(round);
      } else {
        setStandaloneRound(null);
      }
    } else {
      setStandaloneRound(null);
    }
    if (round) {
      setSelectedRound(round);
    }
    setActiveTab(tab);
    const canonicalPath = getTabPath(tab);
    if (typeof window !== 'undefined') {
      window.history.pushState({ tab, round }, '', canonicalPath);
    }
    if (tab === 'interview') setInterviewSubState('selection');
  };

  // Load saved session, restore cookie session, and handle direct URL entry / popstate guard
  useEffect(() => {
    // 1. Purge legacy unscoped storage items to prevent cross-account leakage
    purgeLegacyUnscopedStorage();

    // 2. Synchronous fast restore from client cache
    const cachedUser = restoreAuthenticatedUser();
    if (cachedUser) {
      setUser(cachedUser);
      setParsedResume(getUserResume(cachedUser.id));
      setInterviewSessions(getUserInterviews(cachedUser.id));
      setAptitudeResults(getUserAptitudeHistory(cachedUser.id));
    } else {
      setUser(null);
      setParsedResume(null);
      setInterviewSessions([]);
      setAptitudeResults([]);
    }

    // 3. Asynchronously verify / restore server-managed HttpOnly session cookie
    restoreSessionWithServer().then((verifiedUser) => {
      if (verifiedUser) {
        setUser(verifiedUser);
        setParsedResume(getUserResume(verifiedUser.id));
        setInterviewSessions(getUserInterviews(verifiedUser.id));
        setAptitudeResults(getUserAptitudeHistory(verifiedUser.id));
      }
    });

    // 4. Resolve URL route (canonical pathname or hash) and enforce guard
    const resolveAndApplyRoute = () => {
      const route = parseCurrentRoute();
      const activeUser = restoreAuthenticatedUser();

      // Case A: /login or /register
      if (route.isLogin || route.isRegister) {
        if (activeUser) {
          setActiveTab('dashboard');
          if (typeof window !== 'undefined') {
            window.history.replaceState({ tab: 'dashboard' }, '', '/dashboard');
          }
        } else {
          setActiveTab('landing');
          setAuthInitialMode(route.isRegister ? 'register' : 'login');
          setAuthPromptMessage(null);
          setAuthModalOpen(true);
          if (typeof window !== 'undefined') {
            window.history.replaceState(null, '', '/');
          }
        }
        return;
      }

      // Case B: Protected tab
      if (isProtectedTab(route.tab)) {
        if (!activeUser) {
          setPendingRedirect({ tab: route.tab, round: route.round, path: route.path });
          setAuthPromptMessage('Please log in or create an account to access this feature.');
          setAuthInitialMode('login');
          setAuthModalOpen(true);
          setActiveTab('landing');
          if (typeof window !== 'undefined') {
            window.history.replaceState(null, '', '/');
          }
          return;
        }

        if (route.tab === 'interview') {
          if (route.round === 'technical' || route.round === 'hr' || route.round === 'communication') {
            setStandaloneRound(route.round);
            setSelectedRound(route.round);
          } else {
            setStandaloneRound(null);
          }
        } else {
          setStandaloneRound(null);
        }

        setActiveTab(route.tab);
        if (route.round) setSelectedRound(route.round);
        if (route.tab === 'interview') setInterviewSubState('selection');
        if (typeof window !== 'undefined') {
          window.history.replaceState({ tab: route.tab, round: route.round }, '', route.path || getTabPath(route.tab));
        }
        return;
      }

      // Case C: Public Landing
      setActiveTab('landing');
      if (typeof window !== 'undefined' && window.location.pathname !== '/' && !window.location.hash) {
        window.history.replaceState(null, '', '/');
      }
    };

    resolveAndApplyRoute();

    // 5. Intercept browser back/forward buttons (popstate and hashchange)
    const handlePopState = () => {
      resolveAndApplyRoute();
    };

    window.addEventListener('popstate', handlePopState);
    window.addEventListener('hashchange', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('hashchange', handlePopState);
    };
  }, []);

  const handleOpenAuth = (mode: 'login' | 'register' = 'login', message?: string | null) => {
    setAuthPromptMessage(message || null);
    setAuthInitialMode(mode);
    setAuthModalOpen(true);
  };

  const handleAuthSuccess = (loggedUser: User) => {
    setUser(loggedUser);

    // Strictly load THIS authenticated user's isolated records
    const userResume = getUserResume(loggedUser.id);
    setParsedResume(userResume); // clean null if new account without resume

    const userInterviews = getUserInterviews(loggedUser.id);
    setInterviewSessions(userInterviews);

    const userAptitude = getUserAptitudeHistory(loggedUser.id);
    setAptitudeResults(userAptitude);

    // Clear prompt notice
    setAuthPromptMessage(null);

    // Automatically navigate to pending destination if one was requested before auth
    if (pendingRedirect) {
      const dest = pendingRedirect;
      setPendingRedirect(null);
      if (dest.tab === 'interview') {
        if (dest.round === 'technical' || dest.round === 'hr' || dest.round === 'communication') {
          setStandaloneRound(dest.round);
          setSelectedRound(dest.round);
        } else {
          setStandaloneRound(null);
        }
      } else {
        setStandaloneRound(null);
      }
      if (dest.round) {
        setSelectedRound(dest.round);
      }
      setActiveTab(dest.tab);
      const targetPath = dest.path || getTabPath(dest.tab);
      if (typeof window !== 'undefined') {
        window.history.replaceState({ tab: dest.tab, round: dest.round }, '', targetPath);
      }
      if (dest.tab === 'interview') setInterviewSubState('selection');
      return;
    }

    // Default flow: guided onboarding for first-time user, else dashboard
    if (!loggedUser.onboardingCompleted) {
      setShowOnboarding(true);
      setActiveTab('dashboard');
      if (typeof window !== 'undefined') {
        window.history.replaceState({ tab: 'dashboard' }, '', '/dashboard');
      }
    } else {
      setActiveTab('dashboard');
      if (typeof window !== 'undefined') {
        window.history.replaceState({ tab: 'dashboard' }, '', '/dashboard');
      }
    }
  };

  const handleOnboardingComplete = () => {
    setShowOnboarding(false);
    if (user) {
      const updatedUser = { ...user, onboardingCompleted: true };
      setUser(updatedUser);
    }
    setActiveTab('dashboard');
    if (typeof window !== 'undefined') {
      window.history.replaceState({ tab: 'dashboard' }, '', '/dashboard');
    }
  };

  const handleLogout = async () => {
    // 1. Invalidate session on server (clears HttpOnly cookie) & clear client session
    await logoutCandidateAccount();

    // 2. Clear all in-memory React states belonging to the logged-out user
    setUser(null);
    setParsedResume(null);
    setInterviewSessions([]);
    setAptitudeResults([]);
    setPendingRedirect(null);
    setAuthPromptMessage(null);
    setStandaloneRound(null);

    // 3. Reset active interview sub-state
    setInterviewSubState('selection');

    // 4. Return to landing page and wipe URL history to prevent browser back-button bypass
    setActiveTab('landing');
    if (typeof window !== 'undefined') {
      window.history.replaceState(null, '', '/');
    }
  };

  const handleResumeParsed = (resume: ParsedResume) => {
    setParsedResume(resume);
    if (user?.id) {
      saveUserResume(user.id, resume);
      // Zero State Contamination: Invalidate previous resume journey, scores, and round selections
      clearUserInterviewJourney(user.id);

      const isNonTech = resume.classification?.isTechnical === false || resume.classification?.educationalCategory === 'non_technical';
      const isFresher = resume.classification?.track === 'fresher';

      const recRounds: InterviewRoundId[] = resume.classification?.recommendedRounds && resume.classification.recommendedRounds.length > 0
        ? resume.classification.recommendedRounds
        : (isNonTech
            ? (isFresher ? ['aptitude', 'communication', 'hr'] : ['communication', 'hr'])
            : (isFresher ? ['aptitude', 'technical', 'hr'] : ['technical', 'hr']));

      const freshJourney: InterviewJourneyState = {
        id: `journey_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        userId: user.id,
        config: {
          candidateName: resume.fullName || user.name || 'Candidate',
          email: resume.email || user.email || 'candidate@careercurve.ai',
          department: (resume.department || user.department || 'General') as any,
          targetRole: (resume.jobTitle || 'Target Role') as any,
          difficulty: 'Intermediate',
          mode: 'Assessment Mode',
          aptitudeDurationMinutes: 10,
          technicalDurationMinutes: 15,
          hrDurationMinutes: 10,
          communicationDurationMinutes: 15,
          candidateTrack: resume.classification?.track,
          candidateType: resume.classification?.candidateType,
          selectedRounds: recRounds,
        },
        status: 'in_progress',
        activeRoundIndex: 0,
        currentPhase: 'form',
        completedRounds: [],
        roundResults: {},
        startedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      saveUserInterviewJourney(user.id, freshJourney);
    }
  };

  const handleClearResume = () => {
    setParsedResume(null);
    if (user?.id) {
      clearUserResume(user.id);
      clearUserInterviewJourney(user.id);
    }
  };

  const handleStartSession = () => {
    if (selectedRound === 'aptitude') {
      handleTabChange('aptitude');
    } else {
      setInterviewSubState('active');
    }
  };

  const handleCompleteInterview = (session: InterviewSession) => {
    setInterviewSessions((prev) => [session, ...prev]);
    if (user?.id) {
      saveUserInterview(user.id, session);
    }
    setInterviewSubState('selection');
  };

  const handleCompleteAptitude = (res: AptitudeResult) => {
    setAptitudeResults((prev) => {
      const updated = [res, ...prev.filter((item) => item.id !== res.id)];
      return updated;
    });

    if (user?.id) {
      saveUserAptitudeResult(user.id, res);
    }

    fetch('/api/aptitude/history', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ result: res, userId: user?.id }),
    }).catch(() => {});
  };

  // Render guard: if an unauthenticated user somehow attempts to access a protected tab, render LandingPage
  const isCurrentTabProtected = isProtectedTab(activeTab);
  const showLanding = activeTab === 'landing' || (!user && isCurrentTabProtected);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans antialiased">
      {/* Primary Header Navbar */}
      <Navbar
        user={user}
        activeTab={activeTab}
        setActiveTab={(tab) => handleTabChange(tab)}
        parsedResume={parsedResume}
        onLogout={handleLogout}
        onOpenAuth={() => handleOpenAuth('login')}
      />

      {/* Student Welcome & Setup Progress Bar Banner (For Authenticated Students) */}
      {user && activeTab !== 'landing' && activeTab !== 'docs' && (
        <div className="bg-slate-900/90 border-b border-slate-800 text-slate-200 py-3.5 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-sm font-extrabold text-white">Welcome, {user.name}! 👋</span>
                {user.verified && (
                  <span className="inline-flex items-center text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-semibold">
                    ✓ Verified Student
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {user.college ? `${user.college} • ` : ''}{user.degree || 'B.Tech'} {user.department ? `in ${user.department}` : ''} {user.graduationYear ? `(${user.graduationYear})` : ''}
              </p>
            </div>

            {/* Preparation Roadmap Progress Tracker */}
            <div className="flex items-center space-x-1.5 sm:space-x-3 text-xs overflow-x-auto py-1 scrollbar-none">
              <div className={`flex items-center space-x-1 px-2.5 py-1 rounded-lg border ${
                user ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' : 'bg-slate-800 text-slate-400 border-slate-700'
              }`}>
                <span className="font-bold">1. Profile</span>
                <span className="text-[10px]">✓</span>
              </div>

              <span className="text-slate-600">→</span>

              <div className={`flex items-center space-x-1 px-2.5 py-1 rounded-lg border ${
                parsedResume ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' : 'bg-indigo-500/10 text-indigo-300 border-indigo-500/30 animate-pulse'
              }`}>
                <span className="font-bold">2. Resume</span>
                <span className="text-[10px]">{parsedResume ? '✓' : 'Pending'}</span>
              </div>

              <span className="text-slate-600">→</span>

              <div className={`flex items-center space-x-1 px-2.5 py-1 rounded-lg border ${
                parsedResume ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' : 'bg-slate-800 text-slate-500 border-slate-700'
              }`}>
                <span className="font-bold">3. Skills</span>
                <span className="text-[10px]">{parsedResume ? '✓' : 'Hold'}</span>
              </div>

              <span className="text-slate-600">→</span>

              <div className={`flex items-center space-x-1 px-2.5 py-1 rounded-lg border ${
                (aptitudeResults.length > 0 || interviewSessions.length > 0) ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' : 'bg-slate-800 text-slate-400 border-slate-700'
              }`}>
                <span className="font-bold">4. Practice</span>
                <span className="text-[10px]">{(aptitudeResults.length > 0 || interviewSessions.length > 0) ? '✓' : 'Ready'}</span>
              </div>

              <span className="text-slate-600">→</span>

              <div className={`flex items-center space-x-1 px-2.5 py-1 rounded-lg border ${
                interviewSessions.length > 0 ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' : 'bg-slate-800 text-slate-400 border-slate-700'
              }`}>
                <span className="font-bold">5. Feedback</span>
                <span className="text-[10px]">{interviewSessions.length > 0 ? '✓' : 'Pending'}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Views Container with Route Protection */}
      <main className="pb-16">
        {showLanding && (
          <LandingPage
            onGetStarted={() => {
              if (user) {
                handleTabChange('dashboard');
              } else {
                handleOpenAuth('register');
              }
            }}
            onOpenAuth={(mode) => handleOpenAuth(mode)}
            onSelectFeature={(featTab, roundPreset) => {
              handleTabChange(featTab, roundPreset);
            }}
          />
        )}

        {user && activeTab === 'dashboard' && (
          <Dashboard
            user={user}
            parsedResume={parsedResume}
            interviewSessions={interviewSessions}
            aptitudeResults={aptitudeResults}
            onNavigate={(tab, round) => handleTabChange(tab, round)}
          />
        )}

        {user && activeTab === 'resume' && (
          <ResumeModule
            user={user}
            parsedResume={parsedResume}
            onResumeParsed={handleResumeParsed}
            onClearResume={handleClearResume}
            onStartInterview={(rounds) => {
              setStandaloneRound(null);
              if (rounds && user?.id) {
                const currentJourney = getUserInterviewJourney(user.id);
                const userSelectedCategory = parsedResume?.userSelectedCategory || parsedResume?.classification?.userSelectedCategory || null;
                const educationalCategory = userSelectedCategory || parsedResume?.classification?.educationalCategory || 'technical';
                if (currentJourney) {
                  saveUserInterviewJourney(user.id, {
                    ...currentJourney,
                    config: {
                      ...currentJourney.config,
                      selectedRounds: rounds,
                      userSelectedCategory,
                      educationalCategory,
                    },
                    updatedAt: new Date().toISOString(),
                  });
                }
              }
              handleTabChange('interview');
            }}
          />
        )}

        {user && activeTab === 'interview' && !standaloneRound && (
          <InterviewRoundsWorkflow
            user={user}
            parsedResume={parsedResume}
            interviewSessions={interviewSessions}
            aptitudeResults={aptitudeResults}
            onCompleteInterviewSession={handleCompleteInterview}
            onCompleteAptitudeResult={handleCompleteAptitude}
            onNavigate={(tab, round) => handleTabChange(tab, round)}
          />
        )}

        {user && activeTab === 'interview' && standaloneRound === 'technical' && (
          parsedResume?.classification?.isTechnical === false ? (
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center space-y-4 animate-fade-in">
              <div className="p-6 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-200 max-w-xl mx-auto space-y-3">
                <AlertCircle className="w-8 h-8 text-amber-400 mx-auto" />
                <h3 className="text-base font-bold text-white">Technical Round Not Applicable</h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Based on your resume classification ({parsedResume.classification.discipline} • Non-Technical Track), Technical Round is strictly omitted. Your track is optimized for Communication and HR Behaviour.
                </p>
                <div className="pt-2 flex justify-center space-x-3">
                  <button
                    type="button"
                    onClick={() => setStandaloneRound('communication')}
                    className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs cursor-pointer shadow-md"
                  >
                    Go to Communication Round
                  </button>
                  <button
                    type="button"
                    onClick={() => setStandaloneRound(null)}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs cursor-pointer"
                  >
                    Return to Workflow
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-md">
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-bold text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-2.5 py-1 rounded-lg">
                    Standalone Practice Mode
                  </span>
                  <span className="text-xs text-slate-300 font-semibold">
                    Technical Interview Round
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setStandaloneRound(null)}
                  className="text-xs font-bold text-indigo-300 hover:text-indigo-200 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700/80 border border-slate-700 transition-colors cursor-pointer self-start sm:self-auto"
                >
                  ← Switch to Full 3-Round Journey
                </button>
              </div>
              <TechnicalInterviewModule
                parsedResume={parsedResume}
                profileDepartment={user.department}
                targetDepartment={user.department as EngineeringDepartment}
                difficulty={difficulty}
                onCompleteInterview={handleCompleteInterview}
                onNavigate={(tab) => handleTabChange(tab)}
              />
            </div>
          )
        )}

        {user && activeTab === 'interview' && standaloneRound === 'hr' && (
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-md">
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold text-purple-400 bg-purple-500/10 border border-purple-500/20 px-2.5 py-1 rounded-lg">
                  Standalone Practice Mode
                </span>
                <span className="text-xs text-slate-300 font-semibold">
                  AI Voice HR Interview Round
                </span>
              </div>
              <button
                type="button"
                onClick={() => setStandaloneRound(null)}
                className="text-xs font-bold text-purple-300 hover:text-purple-200 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700/80 border border-slate-700 transition-colors cursor-pointer self-start sm:self-auto"
              >
                ← Switch to Full 3-Round Journey
              </button>
            </div>
            <HRVoiceInterviewModule
              parsedResume={parsedResume}
              profileDepartment={user.department}
              onCompleteInterview={handleCompleteInterview}
              onNavigate={(tab) => handleTabChange(tab)}
              onBackToRounds={() => setStandaloneRound(null)}
              onBackToSetup={() => setStandaloneRound(null)}
            />
          </div>
        )}

        {user && activeTab === 'interview' && standaloneRound === 'communication' && (
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-md">
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold text-teal-400 bg-teal-500/10 border border-teal-500/20 px-2.5 py-1 rounded-lg">
                  Standalone Practice Mode
                </span>
                <span className="text-xs text-slate-300 font-semibold">
                  Face-to-Face AI Communication Speaking Round
                </span>
              </div>
              <button
                type="button"
                onClick={() => setStandaloneRound(null)}
                className="text-xs font-bold text-teal-300 hover:text-teal-200 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700/80 border border-slate-700 transition-colors cursor-pointer self-start sm:self-auto"
              >
                ← Switch to Full Journey
              </button>
            </div>
            <CommunicationInterviewModule
              parsedResume={parsedResume}
              educationalCategory={parsedResume?.classification?.isTechnical === false ? 'non_technical' : 'technical'}
              discipline={parsedResume?.classification?.discipline || user.department}
              experienceLevel={parsedResume?.classification?.track === 'experienced' ? 'experienced' : 'fresher'}
              difficulty={difficulty}
              onCompleteInterview={handleCompleteInterview}
              onNavigate={(tab) => handleTabChange(tab)}
            />
          </div>
        )}

        {user && activeTab === 'aptitude' && (
          <AptitudeModule
            userId={user?.id}
            aptitudeHistory={aptitudeResults}
            onCompleteAptitude={handleCompleteAptitude}
            onNavigate={(tab) => handleTabChange(tab)}
          />
        )}

        {user && activeTab === 'telemetry' && <FacialVoiceAnalysisDesign />}

        {user && activeTab === 'report' && (
          <FinalReport
            parsedResume={parsedResume}
            interviewSessions={interviewSessions}
            aptitudeResults={aptitudeResults}
            onNavigate={(tab) => handleTabChange(tab)}
          />
        )}

        {user && activeTab === 'feedback' && (
          <InterviewFeedbackModule
            user={user}
            parsedResume={parsedResume}
            interviewSessions={interviewSessions}
            aptitudeResults={aptitudeResults}
            onNavigate={(tab) => handleTabChange(tab)}
          />
        )}

        {user && activeTab === 'docs' && <ProjectDocs />}
      </main>

      {/* Authentication Modal with Friendly Notice & Redirect Support */}
      <AuthModal
        isOpen={authModalOpen}
        initialMode={authInitialMode}
        promptMessage={authPromptMessage}
        onClose={() => {
          setAuthModalOpen(false);
          setAuthPromptMessage(null);
        }}
        onAuthSuccess={handleAuthSuccess}
      />

      {/* Guided Onboarding Tutorial Modal */}
      <OnboardingModal
        isOpen={showOnboarding}
        onComplete={handleOnboardingComplete}
      />
    </div>
  );
}
