import React, { useState } from 'react';
import { ParsedResume } from '../types';
import { EngineeringDepartment } from '../nlp/types';
import { 
  Cpu, 
  UserCheck, 
  BrainCircuit, 
  Sparkles, 
  ArrowRight, 
  Sliders, 
  CheckCircle2, 
  AlertCircle, 
  FileText, 
  GraduationCap, 
  Briefcase, 
  FolderGit2, 
  Wrench, 
  UploadCloud,
  Compass,
  Building,
  Target
} from 'lucide-react';

interface InterviewSelectionProps {
  parsedResume: ParsedResume | null;
  selectedRound: 'technical' | 'hr' | 'aptitude';
  setSelectedRound: (round: 'technical' | 'hr' | 'aptitude') => void;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  setDifficulty: (diff: 'Beginner' | 'Intermediate' | 'Advanced') => void;
  targetDepartment?: EngineeringDepartment;
  setTargetDepartment?: (dept: EngineeringDepartment) => void;
  onStartSession: () => void;
  onNavigate: (tab: string) => void;
}

export const InterviewSelection: React.FC<InterviewSelectionProps> = ({
  parsedResume,
  selectedRound,
  setSelectedRound,
  difficulty,
  setDifficulty,
  targetDepartment,
  setTargetDepartment,
  onStartSession,
  onNavigate,
}) => {
  const [missingResumeError, setMissingResumeError] = useState(false);

  const options = [
    {
      id: 'technical' as const,
      title: 'Technical Interview Round',
      subtitle: parsedResume ? `NLP Matched to ${parsedResume.department}` : 'Resume & Branch Technical Q&A',
      description: `Deterministic NLP & TF-IDF question matching mapped directly to your extracted resume skills (${parsedResume?.rawSkillsList?.slice(0, 3).join(', ') || 'Domain Tools'}), verified projects, and selected difficulty.`,
      icon: Cpu,
      color: 'from-blue-600 to-indigo-600',
      badge: 'NLP Match Engine',
    },
    {
      id: 'hr' as const,
      title: 'AI HR Voice Interview Round',
      subtitle: 'Virtual Recruiter • Live Voice & STAR',
      description: 'Two-way interactive voice interview with AI Recruiter Sarah Chen. Automatic speech synthesis (TTS), live microphone speech recognition (STT), filler-word counter, speaking pace (WPM), and STAR-method behavioral scoring.',
      icon: UserCheck,
      color: 'from-indigo-600 to-purple-600',
      badge: 'Live Voice & Audio NLP',
    },
    {
      id: 'aptitude' as const,
      title: 'Aptitude & Logic Test',
      subtitle: 'Quantitative, Logical & Core CS',
      description: 'Timed MCQs with step-by-step solution explanations and single-submit score calculation (no auto-restart loops).',
      icon: BrainCircuit,
      color: 'from-emerald-600 to-teal-600',
      badge: 'Screening Round',
    },
  ];

  const handleStart = () => {
    if (!parsedResume && selectedRound !== 'aptitude') {
      setMissingResumeError(true);
      return;
    }
    setMissingResumeError(false);
    onStartSession();
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-semibold mb-3">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Interactive AI Interview Hub</span>
        </div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">Personalized Interview Setup</h1>
        <p className="text-sm text-slate-400 mt-2">
          Configure your mock interview session tailored directly to your detected resume facts, domain skills, and target difficulty.
        </p>
      </div>

      {/* Warning if no parsed resume is detected */}
      {!parsedResume && (
        <div className="p-6 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-200 space-y-3 animate-fade-in">
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-bold text-amber-300">No Resume Parsed Yet</h3>
              <p className="text-xs text-amber-200/90 mt-1 leading-relaxed">
                The CareerCurve AI Interviewer generates adaptive questions based on your actual candidate name, department, extracted technical skills, and capstone projects. Please upload or parse a resume first to unlock personalized interviews.
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-3 pt-2">
            <button
              type="button"
              onClick={() => onNavigate('resume')}
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-all shadow-md flex items-center space-x-1.5 cursor-pointer"
            >
              <UploadCloud className="w-3.5 h-3.5" />
              <span>Go to Resume Parser</span>
              <ArrowRight className="w-3.5 h-3.5 ml-0.5" />
            </button>
          </div>
        </div>
      )}

      {/* Detected Resume Information Summary Card */}
      {parsedResume && (
        <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950/70 to-slate-900 border border-indigo-500/30 space-y-4 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-300 flex items-center justify-center font-bold text-base">
                {parsedResume.fullName?.charAt(0) || 'C'}
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h2 className="text-lg font-extrabold text-white">{parsedResume.fullName || 'Candidate Profile'}</h2>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-semibold">
                    ✓ Resume Connected
                  </span>
                </div>
                <p className="text-xs text-indigo-300 font-medium">
                  {parsedResume.jobTitle || `${parsedResume.department} Specialist`} • <strong className="text-emerald-400">{parsedResume.department}</strong>
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
                <p className="text-slate-400 italic">Engineering Degree in {parsedResume.department}</p>
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
                <p className="text-slate-400 italic">{parsedResume.department} Domain Project Implementation</p>
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
              {(parsedResume.rawSkillsList || [parsedResume.department]).slice(0, 10).map((skill, sIdx) => (
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

      {/* Missing Resume Error Alert on Start Attempt */}
      {missingResumeError && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center justify-between gap-3 animate-shake">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
            <span>Cannot start interview without resume information. Please parse your resume first.</span>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('resume')}
            className="px-3 py-1.5 rounded-lg bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs cursor-pointer flex-shrink-0"
          >
            Go to Resume Parser
          </button>
        </div>
      )}

      {/* Target Engineering Department Selector */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
          <div className="flex items-center space-x-2 text-xs font-bold text-white">
            <Target className="w-4 h-4 text-indigo-400" />
            <span>Target Interview Department:</span>
          </div>
          {parsedResume && (
            <div className="flex items-center space-x-2 text-[11px]">
              <span className="text-slate-400">Extracted from Resume:</span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 font-semibold font-mono">
                {parsedResume.department}
              </span>
            </div>
          )}
        </div>

        <p className="text-[11px] text-slate-400 leading-relaxed">
          Select your target engineering branch for the interview. Your questions will be matched from this department, while your resume projects and technical skills determine the specific topics, coding problems, and diagram analysis.
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
          {[
            { id: 'Computer Science & Engineering', label: 'Computer Science (CSE)', icon: '💻' },
            { id: 'Information Technology', label: 'Information Tech (IT)', icon: '🌐' },
            { id: 'Electronics & Communication Engineering', label: 'Electronics (ECE)', icon: '📡' },
            { id: 'Electrical & Electronics Engineering', label: 'Electrical (EEE)', icon: '⚡' },
            { id: 'Civil Engineering', label: 'Civil Engineering', icon: '🏗️' },
            { id: 'Mechanical Engineering', label: 'Mechanical Eng', icon: '⚙️' },
            { id: 'Automobile Engineering', label: 'Automobile Eng', icon: '🚗' },
            { id: 'Data Science & Machine Learning Engineering', label: 'Data Science & ML', icon: '📊' },
          ].map((dept) => {
            const isSelected = targetDepartment === dept.id || (!targetDepartment && parsedResume?.department?.toLowerCase().includes(dept.id.toLowerCase().split(' ')[0]));
            return (
              <button
                key={dept.id}
                type="button"
                onClick={() => setTargetDepartment?.(dept.id as EngineeringDepartment)}
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

      {/* Interview Round Type Selection Cards (Exactly 3 Main Practice Modules) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {options.map((opt) => {
          const Icon = opt.icon;
          const isSelected = selectedRound === opt.id;
          return (
            <div
              key={opt.id}
              onClick={() => setSelectedRound(opt.id)}
              className={`p-6 rounded-2xl border transition-all cursor-pointer relative overflow-hidden ${
                isSelected
                  ? 'bg-slate-900 border-indigo-500 ring-2 ring-indigo-500/30 shadow-2xl scale-[1.01]'
                  : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${opt.color} flex items-center justify-center text-white shadow-md`}>
                  <Icon className="w-6 h-6" />
                </div>

                <div className="flex items-center space-x-2">
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-950 text-slate-400 border border-slate-800 font-mono">
                    {opt.badge}
                  </span>
                  {isSelected && (
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">
                      <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-indigo-400" />
                      Selected
                    </span>
                  )}
                </div>
              </div>

              <h3 className="text-xl font-bold text-white mb-1">{opt.title}</h3>
              <p className="text-xs font-semibold text-indigo-400 mb-3">{opt.subtitle}</p>
              <p className="text-xs text-slate-400 leading-relaxed">{opt.description}</p>
            </div>
          );
        })}
      </div>

      {/* Functional Start Interview Button */}
      <div className="text-center pt-4">
        <button
          type="button"
          onClick={handleStart}
          className="px-10 py-4 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold text-base shadow-xl shadow-indigo-600/25 transition-all hover:scale-105 inline-flex items-center space-x-3 cursor-pointer"
        >
          <span>Start Interview ({selectedRound.toUpperCase()})</span>
          <ArrowRight className="w-5 h-5" />
        </button>
        <p className="text-[11px] text-slate-500 mt-2">
          {parsedResume ? `Personalized for ${parsedResume.fullName} (${parsedResume.department})` : 'Resume required for technical questions'}
        </p>
      </div>
    </div>
  );
};
