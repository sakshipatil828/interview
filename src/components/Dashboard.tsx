import React, { useState, useEffect } from 'react';
import { User, ParsedResume, InterviewSession, AptitudeResult, PersonalizedImprovementPlan } from '../types';
import { getUserImprovementPlan } from '../services/authStorageService';
import { 
  FileText, 
  Cpu, 
  UserCheck, 
  BrainCircuit, 
  Video, 
  Award, 
  CheckCircle2, 
  Clock, 
  TrendingUp, 
  Sparkles, 
  ArrowUpRight,
  ShieldCheck,
  AlertCircle,
  BarChart3,
  Calendar,
  Compass,
  ArrowRight
} from 'lucide-react';

interface DashboardProps {
  user: User | null;
  parsedResume: ParsedResume | null;
  interviewSessions: InterviewSession[];
  aptitudeResults: AptitudeResult[];
  onNavigate: (tab: string, round?: 'technical' | 'hr' | 'aptitude') => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  user,
  parsedResume,
  interviewSessions,
  aptitudeResults,
  onNavigate,
}) => {
  const [userPlan, setUserPlan] = useState<PersonalizedImprovementPlan | null>(null);

  useEffect(() => {
    if (user?.id) {
      setUserPlan(getUserImprovementPlan(user.id));
    }
  }, [user?.id]);
  // Calculate average scores & aptitude metrics
  const lastSession = interviewSessions[0];
  const lastAptitude = aptitudeResults[0];

  const resumeScore = parsedResume ? parsedResume.resumeScore : 0;
  const atsScore = parsedResume ? parsedResume.atsScore : 0;
  const techScore = lastSession ? lastSession.technicalScore : (parsedResume ? 82 : 0);
  const hrScore = lastSession ? lastSession.hrScore : (parsedResume ? 85 : 0);

  // Aptitude specific dashboard statistics
  const latestAptitudeScore = lastAptitude ? lastAptitude.scorePercentage : 0;
  const bestAptitudeScore = aptitudeResults.length > 0 ? Math.max(...aptitudeResults.map((a) => a.scorePercentage)) : 0;
  const totalAptitudeTests = aptitudeResults.length;
  const aptImprovement = lastAptitude?.improvementDelta || 0;

  const aptScoreForIndex = lastAptitude ? lastAptitude.scorePercentage : (parsedResume ? 88 : 0);

  const overallReadiness = Math.round(
    (resumeScore * 0.25) + (techScore * 0.3) + (hrScore * 0.25) + (aptScoreForIndex * 0.2)
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      {/* Welcome Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950/80 to-slate-900 border border-indigo-500/30 shadow-2xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center space-x-2 text-indigo-400 font-semibold text-xs mb-2">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              <span>Candidate Placement Portal</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
              Welcome, {user?.name || ''}! 👋
            </h1>
            <p className="mt-2 text-sm text-slate-300 max-w-2xl">
              {parsedResume ? (
                <span>
                  Resume loaded for <strong className="text-indigo-300">{parsedResume.fullName}</strong> ({parsedResume.department}).
                  Your current AI placement readiness index is <strong className="text-emerald-400">{overallReadiness}%</strong>.
                </span>
              ) : (
                <span>
                  Upload your engineering resume to unlock branch-tailored AI mock rounds, ATS evaluation, and WebRTC telemetry feedback.
                </span>
              )}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {!parsedResume ? (
              <button
                onClick={() => onNavigate('resume')}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold text-sm shadow-lg shadow-indigo-600/25 transition-all flex items-center space-x-2"
              >
                <FileText className="w-4 h-4" />
                <span>Upload Resume Now</span>
              </button>
            ) : (
              <button
                onClick={() => onNavigate('interview')}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold text-sm shadow-lg shadow-emerald-600/25 transition-all flex items-center space-x-2"
              >
                <Video className="w-4 h-4" />
                <span>Start AI Mock Interview</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 7-Day Improvement Plan Banner if active */}
      {userPlan && (
        <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950/60 to-slate-900 border border-indigo-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl">
          <div className="flex items-center space-x-3.5">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center flex-shrink-0">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-sm font-bold text-white">Active 7-Day Improvement Plan</h3>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  {userPlan.sevenDayPlan.filter((t) => t.completed).length} / 7 Completed
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Recommended Next Phase: <strong className="text-indigo-300">{userPlan.nextPracticeSession.title}</strong> • Top Priority: <span className="text-slate-400">{userPlan.topPriorities[0]?.skill}</span>
              </p>
            </div>
          </div>

          <button
            onClick={() => onNavigate('feedback')}
            className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/25 transition-all flex items-center space-x-1.5 cursor-pointer self-end md:self-auto"
          >
            <span>Open 7-Day Checklist</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Main Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Candidate Resume Summary Card */}
        <div className="lg:col-span-1 p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <h2 className="text-base font-bold text-white flex items-center space-x-2">
              <FileText className="w-5 h-5 text-indigo-400" />
              <span>Resume Profile</span>
            </h2>
            {parsedResume ? (
              <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                Extracted
              </span>
            ) : (
              <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <AlertCircle className="w-3.5 h-3.5 mr-1" />
                Not Uploaded
              </span>
            )}
          </div>

          {parsedResume ? (
            <div className="space-y-4">
              <div>
                <p className="text-xs text-slate-400">Candidate Name</p>
                <p className="text-sm font-bold text-white">{parsedResume.fullName || 'Not Available in Uploaded Resume'}</p>
              </div>

              <div>
                <p className="text-xs text-slate-400">Department / Branch</p>
                <p className="text-sm font-semibold text-indigo-300">{parsedResume.department || 'Not Available in Uploaded Resume'}</p>
              </div>

              <div>
                <p className="text-xs text-slate-400">Degree & Institution</p>
                <p className="text-xs font-medium text-slate-200">
                  {parsedResume.education?.[0] ? (
                    `${parsedResume.education[0].degree} — ${parsedResume.education[0].college} (${parsedResume.education[0].graduationYear})`
                  ) : (
                    'Not Available in Uploaded Resume'
                  )}
                </p>
              </div>

              <div>
                <p className="text-xs text-slate-400 mb-1.5">Extracted Top Skills</p>
                <div className="flex flex-wrap gap-1.5">
                  {parsedResume.rawSkillsList && parsedResume.rawSkillsList.length > 0 ? (
                    parsedResume.rawSkillsList.slice(0, 6).map((skill, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-200 text-[11px] font-medium border border-slate-700/60"
                      >
                        {skill}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-slate-500 italic">No technical skills detected</span>
                  )}
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => onNavigate('resume')}
                  className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700/80 text-xs font-semibold text-indigo-300 border border-slate-700 transition-colors flex items-center justify-center space-x-1"
                >
                  <span>View Full Resume Analysis</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 space-y-4">
              <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 mx-auto">
                <FileText className="w-6 h-6" />
              </div>
              <p className="text-xs text-slate-400">
                No resume parsed yet. Upload your PDF or DOCX file to see your extracted profile.
              </p>
              <button
                onClick={() => onNavigate('resume')}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md transition-all"
              >
                Go to Resume Upload
              </button>
            </div>
          )}
        </div>

        {/* Performance & Readiness Scorecard */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <h2 className="text-base font-bold text-white flex items-center space-x-2">
              <BarChart3 className="w-5 h-5 text-indigo-400" />
              <span>Interview Readiness Scorecard</span>
            </h2>
            <span className="text-xs text-slate-400 font-mono">Live Multi-Metric Index</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 text-center">
              <p className="text-xs text-slate-400 mb-1">Overall Index</p>
              <p className="text-3xl font-extrabold text-emerald-400 font-mono">{overallReadiness}%</p>
              <p className="text-[10px] text-slate-500 mt-1">Weighted Readiness</p>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 text-center">
              <p className="text-xs text-slate-400 mb-1">ATS Resume Score</p>
              <p className="text-3xl font-extrabold text-blue-400 font-mono">{atsScore}%</p>
              <p className="text-[10px] text-slate-500 mt-1">Keywords & ATS Match</p>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 text-center">
              <p className="text-xs text-slate-400 mb-1">Latest Aptitude</p>
              <p className="text-3xl font-extrabold text-amber-400 font-mono">{latestAptitudeScore}%</p>
              <p className="text-[10px] text-slate-500 mt-1">Recent Assessment</p>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 text-center">
              <p className="text-xs text-slate-400 mb-1">Best Aptitude</p>
              <p className="text-3xl font-extrabold text-purple-400 font-mono">{bestAptitudeScore}%</p>
              <p className="text-[10px] text-slate-500 mt-1">{totalAptitudeTests} Tests Completed</p>
            </div>
          </div>

          {/* Quick Action Module Launchers (Dedicated to the 3 Practice Modules + ATS Resume & Scorecard) */}
          <div className="pt-2">
            <p className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3">Launch Preparation Modules</p>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              <button
                onClick={() => onNavigate('resume')}
                className="p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-indigo-500/50 transition-all text-left group"
              >
                <FileText className="w-5 h-5 text-blue-400 mb-2 group-hover:scale-110 transition-transform" />
                <p className="text-xs font-bold text-white">ATS Resume</p>
                <p className="text-[10px] text-slate-400">Extract skills & ATS score</p>
              </button>

              <button
                onClick={() => onNavigate('interview', 'technical')}
                className="p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-indigo-500/50 transition-all text-left group"
              >
                <Cpu className="w-5 h-5 text-indigo-400 mb-2 group-hover:scale-110 transition-transform" />
                <p className="text-xs font-bold text-white">Technical Round</p>
                <p className="text-[10px] text-slate-400">Resume-aware NLP Q&A</p>
              </button>

              <button
                onClick={() => onNavigate('interview', 'hr')}
                className="p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-indigo-500/50 transition-all text-left group"
              >
                <UserCheck className="w-5 h-5 text-purple-400 mb-2 group-hover:scale-110 transition-transform" />
                <p className="text-xs font-bold text-white">AI Voice HR</p>
                <p className="text-[10px] text-slate-400">Real-time voice behavioral</p>
              </button>

              <button
                onClick={() => onNavigate('aptitude')}
                className="p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-indigo-500/50 transition-all text-left group"
              >
                <BrainCircuit className="w-5 h-5 text-emerald-400 mb-2 group-hover:scale-110 transition-transform" />
                <p className="text-xs font-bold text-white">Aptitude Test</p>
                <p className="text-[10px] text-slate-400">Timed MCQ practice</p>
              </button>

              <button
                onClick={() => onNavigate('report')}
                className="p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-indigo-500/50 transition-all text-left group"
              >
                <Award className="w-5 h-5 text-rose-400 mb-2 group-hover:scale-110 transition-transform" />
                <p className="text-xs font-bold text-white">AI Scorecard</p>
                <p className="text-[10px] text-slate-400">Print final PDF report</p>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
