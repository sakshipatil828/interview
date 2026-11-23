import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  BookOpen, 
  CheckCircle2, 
  Circle, 
  Mic, 
  MicOff, 
  RotateCcw, 
  Sparkles, 
  ArrowRight, 
  ArrowLeft, 
  Building2, 
  HelpCircle, 
  AlertTriangle, 
  Lightbulb, 
  Award, 
  User, 
  Briefcase, 
  Volume2, 
  Check, 
  Play,
  Flame,
  Clock,
  Layers,
  MessagesSquare
} from 'lucide-react';
import { ParsedResume } from '../types';
import { 
  generateHRMockQuestions, 
  HRMockQuestion, 
  evaluateMockSpeechAnswer, 
  MockSpeechEvaluationResult 
} from '../nlp/hr/hrMockPreparationEngine';
import { 
  getUserHRMockProgress, 
  saveUserHRMockProgress, 
  HRMockProgressRecord 
} from '../services/authStorageService';
import { speechService } from '../services/speechService';

interface HRMockPreparationModuleProps {
  parsedResume: ParsedResume | null;
  profileDepartment?: string;
  targetCompany?: string;
  onBackToModeSelection: () => void;
  onSwitchToPractice: () => void;
  userId?: string | null;
}

export const HRMockPreparationModule: React.FC<HRMockPreparationModuleProps> = ({
  parsedResume,
  profileDepartment,
  targetCompany: initialCompany = '',
  onBackToModeSelection,
  onSwitchToPractice,
  userId
}) => {
  // Target company state
  const [selectedCompany, setSelectedCompany] = useState<string>(initialCompany);
  const [companyInput, setCompanyInput] = useState<string>(initialCompany);

  // Background resolution
  const candidateClassification = parsedResume?.classification;
  const rawDept = parsedResume?.department || profileDepartment || '';
  const isNonTech = useMemo(() => {
    return (
      candidateClassification?.educationalCategory === 'non_technical' ||
      parsedResume?.userSelectedCategory === 'non_technical' ||
      candidateClassification?.userSelectedCategory === 'non_technical' ||
      candidateClassification?.isTechnical === false ||
      /(commerce|b\.?com|bba|mba|business|management|finance|accounting|marketing|human resource|hr|arts|humanities|english|customer service|customer support)/i.test(rawDept)
    );
  }, [candidateClassification, parsedResume, rawDept]);

  const isExperienced = useMemo(() => {
    return (
      candidateClassification?.track === 'experienced' ||
      Boolean(parsedResume?.employmentHistory && parsedResume.employmentHistory.length > 0)
    );
  }, [candidateClassification, parsedResume]);

  // Generate personalized mock questions
  const mockQuestions = useMemo(() => {
    return generateHRMockQuestions(parsedResume, selectedCompany, isNonTech, isExperienced);
  }, [parsedResume, selectedCompany, isNonTech, isExperienced]);

  // Selected question index
  const [activeIdx, setActiveIdx] = useState<number>(0);
  const activeQuestion: HRMockQuestion = mockQuestions[activeIdx] || mockQuestions[0];

  // Active answer tab: 'fresher' | 'experienced'
  const [exampleTab, setExampleTab] = useState<'fresher' | 'experienced'>(
    isExperienced ? 'experienced' : 'fresher'
  );

  // Storage state: completed questions and practice records
  const [completedIds, setCompletedIds] = useState<string[]>([]);
  const [viewedIds, setViewedIds] = useState<string[]>([]);
  const [practiceRecords, setPracticeRecords] = useState<Record<string, {
    transcript: string;
    score: number;
    feedback: string;
    timestamp: string;
  }>>({});

  // Active speaking practice state
  const [practiceInput, setPracticeInput] = useState<string>('');
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [evaluationResult, setEvaluationResult] = useState<MockSpeechEvaluationResult | null>(null);
  const [isSpeakingExample, setIsSpeakingExample] = useState<boolean>(false);
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string>('all');

  // Load saved progress from user storage
  useEffect(() => {
    const saved = getUserHRMockProgress(userId);
    if (saved) {
      if (Array.isArray(saved.completedQuestionIds)) setCompletedIds(saved.completedQuestionIds);
      if (Array.isArray(saved.viewedAnswerIds)) setViewedIds(saved.viewedAnswerIds);
      if (saved.practiceSpeechRecordings) setPracticeRecords(saved.practiceSpeechRecordings);
      if (saved.targetCompany && !selectedCompany) {
        setSelectedCompany(saved.targetCompany);
        setCompanyInput(saved.targetCompany);
      }
    }
  }, [userId]);

  // Mark current question as viewed
  useEffect(() => {
    if (activeQuestion && !viewedIds.includes(activeQuestion.id)) {
      const updated = [...viewedIds, activeQuestion.id];
      setViewedIds(updated);
      saveUserHRMockProgress(userId, {
        completedQuestionIds: completedIds,
        viewedAnswerIds: updated,
        practiceSpeechRecordings: practiceRecords,
        targetCompany: selectedCompany,
        updatedAt: new Date().toISOString()
      });
    }

    // Load any existing practice response for this question
    if (activeQuestion && practiceRecords[activeQuestion.id]) {
      const rec = practiceRecords[activeQuestion.id];
      setPracticeInput(rec.transcript);
      const evalRes = evaluateMockSpeechAnswer(activeQuestion, rec.transcript, isNonTech);
      setEvaluationResult(evalRes);
    } else {
      setPracticeInput('');
      setEvaluationResult(null);
    }

    // Stop TTS if speaking previous answer
    if (speechService.isSpeaking()) {
      speechService.stopSpeaking();
      setIsSpeakingExample(false);
    }
  }, [activeIdx, activeQuestion?.id]);

  // Toggle question completion
  const handleToggleComplete = (qId: string) => {
    let updated: string[];
    if (completedIds.includes(qId)) {
      updated = completedIds.filter((id) => id !== qId);
    } else {
      updated = [...completedIds, qId];
    }
    setCompletedIds(updated);
    saveUserHRMockProgress(userId, {
      completedQuestionIds: updated,
      viewedAnswerIds: viewedIds,
      practiceSpeechRecordings: practiceRecords,
      targetCompany: selectedCompany,
      updatedAt: new Date().toISOString()
    });
  };

  // Toggle speech recording using browser speech recognition
  const handleToggleRecording = () => {
    if (isRecording) {
      speechService.stopListening();
      setIsRecording(false);
      return;
    }

    setEvaluationResult(null);
    setIsRecording(true);

    speechService.startListening({
      onTranscriptChange: (transcript, isFinal) => {
        setPracticeInput(transcript);
        if (isFinal) {
          setIsRecording(false);
          handleAnalyzeAnswer(transcript);
        }
      },
      onError: (error) => {
        console.warn('Speech recording notice:', error);
        setIsRecording(false);
      }
    });
  };

  // Analyze the candidate's typed or spoken answer
  const handleAnalyzeAnswer = (textToAnalyze?: string) => {
    const text = textToAnalyze !== undefined ? textToAnalyze : practiceInput;
    if (!text || text.trim().length < 5) return;

    const result = evaluateMockSpeechAnswer(activeQuestion, text, isNonTech);
    setEvaluationResult(result);

    // Save practice record
    const updatedRecords = {
      ...practiceRecords,
      [activeQuestion.id]: {
        transcript: text.trim(),
        score: result.score,
        feedback: result.feedback,
        timestamp: new Date().toISOString()
      }
    };
    setPracticeRecords(updatedRecords);

    // Automatically mark question as completed if score is good
    let updatedCompleted = [...completedIds];
    if (result.score >= 70 && !updatedCompleted.includes(activeQuestion.id)) {
      updatedCompleted.push(activeQuestion.id);
      setCompletedIds(updatedCompleted);
    }

    saveUserHRMockProgress(userId, {
      completedQuestionIds: updatedCompleted,
      viewedAnswerIds: viewedIds,
      practiceSpeechRecordings: updatedRecords,
      targetCompany: selectedCompany,
      updatedAt: new Date().toISOString()
    });
  };

  // Play / Speak example answer via TTS
  const handleSpeakExample = async (exampleText: string) => {
    if (isSpeakingExample) {
      speechService.stopSpeaking();
      setIsSpeakingExample(false);
      return;
    }
    setIsSpeakingExample(true);
    await speechService.speakText(exampleText);
    setIsSpeakingExample(false);
  };

  // Apply custom target company
  const handleApplyCompany = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = companyInput.trim();
    setSelectedCompany(clean);
    saveUserHRMockProgress(userId, {
      completedQuestionIds: completedIds,
      viewedAnswerIds: viewedIds,
      practiceSpeechRecordings: practiceRecords,
      targetCompany: clean,
      updatedAt: new Date().toISOString()
    });
  };

  // Progress calculations
  const totalQuestions = mockQuestions.length;
  const completedCount = completedIds.length;
  const progressPercent = Math.round((completedCount / totalQuestions) * 100);

  // Filter questions
  const filteredQuestions = useMemo(() => {
    if (activeCategoryFilter === 'all') return mockQuestions;
    return mockQuestions.filter((q) => q.category === activeCategoryFilter);
  }, [mockQuestions, activeCategoryFilter]);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 animate-fade-in font-sans">
      {/* TOP NAVIGATION & MODE BANNER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl">
        <div className="flex items-center space-x-3">
          <button
            type="button"
            onClick={onBackToModeSelection}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer flex items-center space-x-1.5 text-xs font-bold"
            title="Return to Mode Selection"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Mode Selection</span>
          </button>
          <div className="h-4 w-px bg-slate-800 hidden sm:block" />
          <div className="flex items-center space-x-2">
            <span className="w-7 h-7 rounded-lg bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center">
              <BookOpen className="w-3.5 h-3.5" />
            </span>
            <div>
              <p className="text-xs font-bold text-white flex items-center space-x-1.5">
                <span>HR Mock Preparation Mode</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-mono">
                  {isNonTech ? 'Non-Technical Track' : 'Technical Track'}
                </span>
              </p>
              <p className="text-[10px] text-slate-400">
                Learn recruiter intent, frameworks, and study professional sample answers
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-3 self-end sm:self-auto">
          <button
            type="button"
            onClick={onSwitchToPractice}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-purple-600/20 transition-all flex items-center space-x-2 cursor-pointer"
          >
            <MessagesSquare className="w-3.5 h-3.5" />
            <span>Start Practice Interview</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* TARGET COMPANY SELECTOR & PROGRESS TRACKER */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Progress Card */}
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col justify-between space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">Mock Study Progress</p>
            <span className="text-xs font-bold text-indigo-400 font-mono">{progressPercent}% Mastered</span>
          </div>
          <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800">
            <div 
              className="bg-gradient-to-r from-indigo-500 to-emerald-400 h-2 rounded-full transition-all duration-500" 
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <p className="text-[10px] text-slate-400 flex items-center justify-between">
            <span>{completedCount} of {totalQuestions} Questions Mastered</span>
            <span>{Object.keys(practiceRecords).length} Answers Recorded</span>
          </p>
        </div>

        {/* Company Customizer */}
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 md:col-span-2 flex flex-col justify-between space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-mono text-slate-400 uppercase tracking-wider flex items-center space-x-1.5">
              <Building2 className="w-3.5 h-3.5 text-indigo-400" />
              <span>Personalize for Target Company</span>
            </p>
            {selectedCompany && (
              <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold">
                Active: {selectedCompany}
              </span>
            )}
          </div>
          <form onSubmit={handleApplyCompany} className="flex items-center gap-2">
            <input
              type="text"
              value={companyInput}
              onChange={(e) => setCompanyInput(e.target.value)}
              placeholder="e.g. Google, Amazon, Deloitte, TCS, Microsoft..."
              className="flex-1 px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
            <button
              type="submit"
              className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-colors cursor-pointer"
            >
              Apply
            </button>
            {selectedCompany && (
              <button
                type="button"
                onClick={() => { setSelectedCompany(''); setCompanyInput(''); }}
                className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 text-xs font-medium cursor-pointer"
              >
                Clear
              </button>
            )}
          </form>
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[10px] text-slate-500">Quick presets:</span>
            {['Google', 'Amazon', 'Deloitte', 'TCS', 'Infosys'].map((comp) => (
              <button
                key={comp}
                type="button"
                onClick={() => { setSelectedCompany(comp); setCompanyInput(comp); }}
                className={`text-[10px] px-2 py-0.5 rounded-md border transition-colors cursor-pointer ${
                  selectedCompany === comp
                    ? 'bg-indigo-500/20 border-indigo-500 text-indigo-300 font-bold'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {comp}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* CATEGORY FILTER TABS */}
      <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 text-xs">
        {[
          { key: 'all', label: 'All Questions' },
          { key: 'core', label: 'Core Foundation' },
          { key: 'company', label: 'Company Fit' },
          { key: 'domain', label: isNonTech ? 'Customer & Operations' : 'Technical & Architecture' },
          { key: 'behavioral', label: 'Teamwork & Challenges' }
        ].map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveCategoryFilter(tab.key)}
            className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all cursor-pointer ${
              activeCategoryFilter === tab.key
                ? 'bg-indigo-600 text-white shadow-md'
                : 'bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* MAIN TWO-COLUMN WORKBENCH */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: QUESTION LIST */}
        <div className="lg:col-span-4 space-y-2">
          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <span className="font-bold text-white uppercase text-[10px] tracking-wider font-mono">Mock Questions ({filteredQuestions.length})</span>
            <span>Click to study</span>
          </div>

          <div className="space-y-2 max-h-[700px] overflow-y-auto pr-1">
            {filteredQuestions.map((q) => {
              const isSelected = q.id === activeQuestion?.id;
              const isDone = completedIds.includes(q.id);
              const hasPracticed = Boolean(practiceRecords[q.id]);

              return (
                <button
                  key={q.id}
                  type="button"
                  onClick={() => setActiveIdx(mockQuestions.findIndex((item) => item.id === q.id))}
                  className={`w-full text-left p-3.5 rounded-2xl border transition-all cursor-pointer flex items-start space-x-3 ${
                    isSelected
                      ? 'bg-indigo-600/15 border-indigo-500/80 ring-1 ring-indigo-500/40 shadow-lg'
                      : 'bg-slate-900/90 hover:bg-slate-900 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="mt-0.5 flex-shrink-0">
                    {isDone ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    ) : hasPracticed ? (
                      <Flame className="w-4 h-4 text-indigo-400" />
                    ) : (
                      <Circle className="w-4 h-4 text-slate-600" />
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center space-x-1.5">
                      <span className="text-[10px] font-mono text-indigo-400 font-bold">Q{q.index + 1}</span>
                      <span className="text-[10px] text-slate-400 truncate">• {q.categoryLabel}</span>
                    </div>
                    <p className={`text-xs font-bold mt-0.5 truncate ${isSelected ? 'text-white' : 'text-slate-200'}`}>
                      {q.title}
                    </p>
                    <div className="flex items-center space-x-2 mt-1.5">
                      {isDone && (
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 font-mono font-bold">
                          ✓ Mastered
                        </span>
                      )}
                      {hasPracticed && (
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-300 font-mono font-bold">
                          🎙️ Practised ({practiceRecords[q.id].score}%)
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* RIGHT COLUMN: QUESTION MASTER DETAIL */}
        <div className="lg:col-span-8 space-y-5">
          {/* Question Header Card */}
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
              <div className="flex items-center space-x-2">
                <span className="px-2.5 py-1 rounded-lg bg-indigo-500/20 text-indigo-300 text-xs font-mono font-bold border border-indigo-500/30">
                  Question {activeQuestion.index + 1} of {totalQuestions}
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 text-xs font-medium">
                  {activeQuestion.categoryLabel}
                </span>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => handleToggleComplete(activeQuestion.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer ${
                    completedIds.includes(activeQuestion.id)
                      ? 'bg-emerald-600/20 border border-emerald-500/40 text-emerald-300 hover:bg-emerald-600/30'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
                  }`}
                >
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                  <span>{completedIds.includes(activeQuestion.id) ? 'Mastered' : 'Mark as Mastered'}</span>
                </button>
              </div>
            </div>

            <div>
              <h2 className="text-xl font-extrabold text-white leading-snug tracking-tight">
                {activeQuestion.questionText}
              </h2>
              <div className="flex items-center space-x-2 mt-2 text-xs text-indigo-400 font-medium">
                <Layers className="w-3.5 h-3.5" />
                <span>Recommended Framework: <strong>{activeQuestion.structureFramework}</strong></span>
              </div>
            </div>
          </div>

          {/* 1. WHY THE INTERVIEWER ASKS IT */}
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
            <div className="flex items-center space-x-2 text-indigo-400 text-xs font-bold uppercase tracking-wider">
              <HelpCircle className="w-4 h-4" />
              <span>Why the Interviewer Asks It</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed font-sans">
              {activeQuestion.whyInterviewerAsks}
            </p>
          </div>

          {/* 2. IMPORTANT POINTS TO INCLUDE */}
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
            <div className="flex items-center space-x-2 text-emerald-400 text-xs font-bold uppercase tracking-wider">
              <CheckCircle2 className="w-4 h-4" />
              <span>Important Points to Include in Your Answer</span>
            </div>
            <ul className="space-y-2 text-xs text-slate-300">
              {activeQuestion.importantPoints.map((pt, pIdx) => (
                <li key={pIdx} className="flex items-start space-x-2.5">
                  <span className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-300 flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5">
                    {pIdx + 1}
                  </span>
                  <span className="leading-relaxed">{pt}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* 3. SUGGESTED PROFESSIONAL EXAMPLE ANSWERS */}
          <div className="p-6 rounded-2xl bg-gradient-to-b from-slate-900 via-slate-900 to-indigo-950/20 border border-indigo-500/30 shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2 text-xs font-bold text-white uppercase tracking-wider">
                <Sparkles className="w-4 h-4 text-indigo-400" />
                <span>Suggested Professional Example Answers</span>
              </div>

              {/* Fresher vs Experienced Tabs */}
              <div className="flex items-center p-1 rounded-xl bg-slate-950 border border-slate-800 text-xs">
                <button
                  type="button"
                  onClick={() => setExampleTab('fresher')}
                  className={`px-3 py-1 rounded-lg font-bold transition-all flex items-center space-x-1.5 cursor-pointer ${
                    exampleTab === 'fresher'
                      ? 'bg-emerald-600 text-white shadow'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <User className="w-3 h-3" />
                  <span>🌱 Fresher Example</span>
                </button>
                <button
                  type="button"
                  onClick={() => setExampleTab('experienced')}
                  className={`px-3 py-1 rounded-lg font-bold transition-all flex items-center space-x-1.5 cursor-pointer ${
                    exampleTab === 'experienced'
                      ? 'bg-indigo-600 text-white shadow'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Briefcase className="w-3 h-3" />
                  <span>💼 Experienced Example</span>
                </button>
              </div>
            </div>

            {/* Example Answer Content */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 space-y-3 relative">
              <div className="flex items-center justify-between text-[11px] text-slate-400 border-b border-slate-800/60 pb-2">
                <span className="font-mono text-indigo-400">
                  {exampleTab === 'fresher' ? 'Tailored for College Grads & Early-Career' : 'Tailored for 1+ Years Workplace Experience'}
                </span>
                <button
                  type="button"
                  onClick={() => handleSpeakExample(exampleTab === 'fresher' ? activeQuestion.fresherExample : activeQuestion.experiencedExample)}
                  className="text-xs text-indigo-400 hover:text-indigo-300 font-bold flex items-center space-x-1 cursor-pointer"
                  title="Listen to spoken delivery"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                  <span>{isSpeakingExample ? 'Stop Audio' : 'Listen via Voice'}</span>
                </button>
              </div>

              <blockquote className="text-xs text-slate-200 leading-relaxed italic font-sans border-l-2 border-indigo-500 pl-3.5 py-1">
                "{exampleTab === 'fresher' ? activeQuestion.fresherExample : activeQuestion.experiencedExample}"
              </blockquote>

              <p className="text-[10px] text-slate-400 font-mono">
                ⚠️ Note: This sample answer is provided as a learning reference to help you structure your own answer. Do not memorize it verbatim.
              </p>
            </div>
          </div>

          {/* 4. COMMON MISTAKES TO AVOID & TIPS FOR IMPROVEMENT */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Common Mistakes */}
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2.5">
              <div className="flex items-center space-x-2 text-rose-400 text-xs font-bold uppercase tracking-wider">
                <AlertTriangle className="w-4 h-4" />
                <span>Common Mistakes to Avoid</span>
              </div>
              <ul className="space-y-2 text-xs text-slate-300">
                {activeQuestion.commonMistakes.map((mis, mIdx) => (
                  <li key={mIdx} className="flex items-start space-x-2 text-[11px] leading-relaxed">
                    <span className="text-rose-400 font-bold">✕</span>
                    <span>{mis}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Tips for Improving */}
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2.5">
              <div className="flex items-center space-x-2 text-amber-400 text-xs font-bold uppercase tracking-wider">
                <Lightbulb className="w-4 h-4" />
                <span>Tips for Improving Your Answer</span>
              </div>
              <ul className="space-y-2 text-xs text-slate-300">
                {activeQuestion.tipsForImproving.map((tip, tIdx) => (
                  <li key={tIdx} className="flex items-start space-x-2 text-[11px] leading-relaxed">
                    <span className="text-amber-400 font-bold">✓</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* 5. INTERACTIVE SPEAKING PRACTICE WITH NLP EVALUATION */}
          <div className="p-6 rounded-3xl bg-slate-900 border border-indigo-500/30 shadow-2xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-sm font-extrabold text-white flex items-center space-x-2">
                  <Mic className="w-4 h-4 text-indigo-400" />
                  <span>Interactive Speaking Practice & Self-Assessment</span>
                </h3>
                <p className="text-[11px] text-slate-400">
                  Speak into your microphone or type your answer to receive instant feedback on pacing, key concepts, and structure.
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={handleToggleRecording}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-all cursor-pointer ${
                    isRecording
                      ? 'bg-rose-600 hover:bg-rose-500 text-white animate-pulse shadow-lg shadow-rose-600/30'
                      : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-md'
                  }`}
                >
                  {isRecording ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
                  <span>{isRecording ? 'Stop Recording' : 'Speak Answer'}</span>
                </button>
              </div>
            </div>

            {/* Textarea for candidate answer */}
            <div className="space-y-2">
              <textarea
                value={practiceInput}
                onChange={(e) => setPracticeInput(e.target.value)}
                placeholder="Click 'Speak Answer' to record with your microphone, or type your practice response here..."
                rows={4}
                className="w-full p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 leading-relaxed font-sans"
              />

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <span className="text-[10px] text-slate-500">
                  {practiceInput.trim().split(/\s+/).filter(Boolean).length} words • Recommended sweet spot: 90–160 words
                </span>

                <div className="flex items-center space-x-2">
                  {practiceInput && (
                    <button
                      type="button"
                      onClick={() => { setPracticeInput(''); setEvaluationResult(null); }}
                      className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 text-xs font-medium cursor-pointer"
                    >
                      Clear
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => handleAnalyzeAnswer()}
                    disabled={practiceInput.trim().length < 5}
                    className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-bold transition-all shadow-md cursor-pointer flex items-center space-x-1.5"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Analyze My Answer</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Instant NLP Evaluation Output */}
            {evaluationResult && (
              <div className="p-4 rounded-2xl bg-slate-950 border border-emerald-500/30 space-y-3 animate-fade-in">
                <div className="flex items-center justify-between border-b border-slate-800/80 pb-2.5">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-bold text-white">Mock Speaking Evaluation</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold font-mono ${
                      evaluationResult.overallRating === 'Exceptional' ? 'bg-emerald-500/20 text-emerald-300' :
                      evaluationResult.overallRating === 'Interview Ready' ? 'bg-indigo-500/20 text-indigo-300' :
                      'bg-amber-500/20 text-amber-300'
                    }`}>
                      {evaluationResult.overallRating}
                    </span>
                  </div>
                  <span className="text-xs font-bold text-emerald-400 font-mono">
                    Score: {evaluationResult.score}/100
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
                  <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                    <p className="text-[10px] text-slate-400">Word Count</p>
                    <p className="font-bold text-white">{evaluationResult.wordCount} words</p>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                    <p className="text-[10px] text-slate-400">Est. Duration</p>
                    <p className="font-bold text-white">~{evaluationResult.estimatedSpeakingSeconds}s</p>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                    <p className="text-[10px] text-slate-400">Keywords Matched</p>
                    <p className="font-bold text-indigo-400">{evaluationResult.matchedKeywords.length}</p>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                    <p className="text-[10px] text-slate-400">Pacing</p>
                    <p className="font-bold text-emerald-400">{evaluationResult.speakingPaceRating}</p>
                  </div>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">
                  {evaluationResult.feedback}
                </p>

                {evaluationResult.actionableSuggestions.length > 0 && (
                  <div className="space-y-1 pt-1 border-t border-slate-800/60">
                    <p className="text-[10px] font-mono text-amber-400 uppercase">Improvement Suggestions:</p>
                    <ul className="space-y-1 text-xs text-slate-300">
                      {evaluationResult.actionableSuggestions.map((sug, sIdx) => (
                        <li key={sIdx} className="flex items-center space-x-1.5 text-[11px]">
                          <span className="text-amber-400">•</span>
                          <span>{sug}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* BOTTOM PAGINATION & SWITCH TO PRACTICE */}
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => setActiveIdx((prev) => Math.max(0, prev - 1))}
              disabled={activeIdx === 0}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-300 text-xs font-bold transition-colors cursor-pointer flex items-center space-x-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Previous Question</span>
            </button>

            <span className="text-xs text-slate-400 font-mono">
              Question {activeIdx + 1} of {totalQuestions}
            </span>

            {activeIdx < totalQuestions - 1 ? (
              <button
                type="button"
                onClick={() => setActiveIdx((prev) => Math.min(totalQuestions - 1, prev + 1))}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-colors cursor-pointer flex items-center space-x-1.5"
              >
                <span>Next Question</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                type="button"
                onClick={onSwitchToPractice}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold transition-all shadow-md cursor-pointer flex items-center space-x-1.5"
              >
                <MessagesSquare className="w-3.5 h-3.5" />
                <span>Ready for Practice Interview</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
