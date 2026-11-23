import React from 'react';
import { ParsedResume, InterviewSession, AptitudeResult } from '../types';
import { 
  Award, 
  Printer, 
  CheckCircle2, 
  TrendingUp, 
  AlertCircle, 
  FileText, 
  Sparkles,
  BookOpen,
  Database,
  Code2,
  Cpu,
  Layers,
  ChevronRight,
  ArrowRight,
  RotateCcw,
  Mic,
  MessageSquare
} from 'lucide-react';

interface FinalReportProps {
  parsedResume: ParsedResume | null;
  interviewSessions: InterviewSession[];
  aptitudeResults: AptitudeResult[];
  onNavigate: (tab: string) => void;
}

export const FinalReport: React.FC<FinalReportProps> = ({
  parsedResume,
  interviewSessions,
  aptitudeResults,
  onNavigate,
}) => {
  const lastSession = interviewSessions[0];
  const lastAptitude = aptitudeResults[0];

  const isNonTech = parsedResume?.classification?.educationalCategory === 'non_technical' || parsedResume?.classification?.isTechnical === false;

  const commSession = interviewSessions.find(s => s.type === 'communication');
  const techSession = interviewSessions.find(s => s.type === 'technical') || (lastSession?.type === 'technical' ? lastSession : null);

  const techScore = techSession ? techSession.technicalScore : (lastSession?.technicalScore || 82);
  const commScore = commSession?.communicationScorecardSummary?.overallCommunicationScore 
    || commSession?.communicationScore 
    || (lastSession?.type === 'communication' ? (lastSession.communicationScorecardSummary?.overallCommunicationScore || 85) : 85);
  const hrScore = lastSession ? lastSession.hrScore : 85;
  const aptScore = lastAptitude ? lastAptitude.scorePercentage : 88;
  const atsScore = parsedResume ? parsedResume.atsScore : 90;

  const overallReadiness = Math.round(
    isNonTech
      ? (atsScore * 0.2) + (commScore * 0.3) + (hrScore * 0.25) + (aptScore * 0.25)
      : (atsScore * 0.2) + (techScore * 0.3) + (hrScore * 0.25) + (aptScore * 0.25)
  );

  const handlePrint = () => {
    window.print();
  };

  // Extract all strengths & improvement tips across answered questions
  const collectedStrengths: string[] = [];
  const collectedImprovements: string[] = [];
  const assessedQuestions = (!isNonTech && techSession) ? (techSession.answers || []) : [];

  assessedQuestions.forEach((ans) => {
    ans.aiFeedback?.strengths?.forEach((s) => {
      if (!collectedStrengths.includes(s)) collectedStrengths.push(s);
    });
    ans.aiFeedback?.improvements?.forEach((imp) => {
      if (!collectedImprovements.includes(imp)) collectedImprovements.push(imp);
    });
  });

  if (commSession?.communicationScorecardSummary) {
    commSession.communicationScorecardSummary.strengths?.forEach((s) => {
      if (!collectedStrengths.includes(s)) collectedStrengths.push(s);
    });
    commSession.communicationScorecardSummary.improvements?.forEach((imp) => {
      if (!collectedImprovements.includes(imp)) collectedImprovements.push(imp);
    });
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in print:p-0 print:max-w-none">
      {/* Printable Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6 print:border-black">
        <div>
          <div className="flex items-center space-x-2 text-indigo-400 font-semibold text-xs mb-1 print:text-black">
            <Sparkles className="w-4 h-4" />
            <span>CareerCurve Placement Evaluation Report</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight print:text-black">
            AI Interview Scorecard & Readiness Report
          </h1>
          <p className="text-xs text-slate-400 mt-1 print:text-gray-700 font-mono">
            Candidate: <strong className="text-indigo-300 print:text-black">{parsedResume?.fullName || 'Candidate'}</strong> • Extracted Domain: <strong className="text-emerald-400">{parsedResume?.department || 'Engineering'}</strong>
          </p>
        </div>

        <div className="flex items-center space-x-2 self-start sm:self-auto print:hidden">
          <button
            type="button"
            onClick={() => onNavigate('feedback')}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/25 transition-all flex items-center space-x-2 cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span>Complete My Interview Journey</span>
          </button>
          <button
            type="button"
            onClick={() => onNavigate('interview')}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-all flex items-center space-x-1.5 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>New Mock Interview</span>
          </button>
          <button
            type="button"
            onClick={handlePrint}
            className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg transition-all flex items-center space-x-2 cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Print / Export PDF</span>
          </button>
        </div>
      </div>

      {/* Main Readiness Score Banner */}
      <div className="p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-indigo-500/30 text-center space-y-4 shadow-2xl print:bg-white print:border-black print:text-black">
        <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto shadow-xl print:border-black">
          <Award className="w-8 h-8" />
        </div>

        <div>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest print:text-gray-600">Final Interview Readiness Percentage</p>
          <p className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 font-mono mt-1 print:text-black">
            {overallReadiness}% Readied
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-slate-800/80 max-w-3xl mx-auto print:border-black">
          <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 print:bg-gray-100 print:border-gray-300">
            <p className="text-[10px] text-slate-400 print:text-gray-600">
              {isNonTech ? 'Speaking Communication' : 'Technical Depth'}
            </p>
            <p className="text-xl font-bold text-blue-400 font-mono print:text-black">
              {isNonTech ? `${commScore}%` : `${techScore}%`}
            </p>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 print:bg-gray-100 print:border-gray-300">
            <p className="text-[10px] text-slate-400 print:text-gray-600">HR Behaviour</p>
            <p className="text-xl font-bold text-purple-400 font-mono print:text-black">{hrScore}%</p>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 print:bg-gray-100 print:border-gray-300">
            <p className="text-[10px] text-slate-400 print:text-gray-600">Aptitude Score</p>
            <p className="text-xl font-bold text-amber-400 font-mono print:text-black">{aptScore}%</p>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 print:bg-gray-100 print:border-gray-300">
            <p className="text-[10px] text-slate-400 print:text-gray-600">ATS Resume Score</p>
            <p className="text-xl font-bold text-emerald-400 font-mono print:text-black">{atsScore}%</p>
          </div>
        </div>
      </div>

      {/* Face-to-Face Communication Round Breakdown (if completed) */}
      {commSession?.communicationScorecardSummary && (
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-5 print:bg-gray-50 print:border-gray-300 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
            <div className="flex items-center space-x-2">
              <Mic className="w-5 h-5 text-indigo-400" />
              <h2 className="text-base font-extrabold text-white print:text-black">
                Face-to-Face Communication Round Breakdown
              </h2>
            </div>
            <div className="flex items-center space-x-2 text-xs font-mono">
              <span className="px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/30">
                Pacing: {commSession.communicationScorecardSummary.wordsPerMinute} WPM
              </span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
                Score: {commSession.communicationScorecardSummary.overallCommunicationScore}%
              </span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3">
            <div>
              <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">Speaking Topic:</span>
              <p className="text-sm font-bold text-indigo-300 mt-0.5">{commSession.communicationScorecardSummary.topicTitle}</p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-800/60">
              {commSession.communicationScorecardSummary.metricsBreakdown?.map((m, idx) => (
                <div key={idx} className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
                  <p className="text-[10px] text-slate-400 truncate">{m.metric}</p>
                  <p className="text-base font-bold text-white font-mono">{m.score}/100</p>
                </div>
              ))}
            </div>

            {commSession.communicationScorecardSummary.speechSummary && (
              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-850 text-slate-300 text-xs">
                <span className="text-slate-400 font-bold block text-[10px] uppercase">Speech Summary & Articulation:</span>
                <p className="mt-1 leading-relaxed text-slate-300">{commSession.communicationScorecardSummary.speechSummary}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Technical Round Specific Performance Breakdown (if session completed and candidate is technical) */}
      {!isNonTech && techSession && assessedQuestions.length > 0 && (
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-5 print:bg-gray-50 print:border-gray-300 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
            <div className="flex items-center space-x-2">
              <Cpu className="w-5 h-5 text-indigo-400" />
              <h2 className="text-base font-extrabold text-white print:text-black">
                Technical Interview Round Breakdown
              </h2>
            </div>
            <div className="flex items-center space-x-2 text-xs font-mono">
              <span className="px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/30">
                Difficulty: {lastSession.difficulty}
              </span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
                {assessedQuestions.length} Questions Evaluated
              </span>
            </div>
          </div>

          {/* Question by Question Detailed Evaluation */}
          <div className="space-y-4">
            {assessedQuestions.map((qAns, idx) => (
              <div
                key={qAns.questionId || idx}
                className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2.5 text-xs print:bg-white print:border-gray-300"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-bold text-indigo-300 text-xs font-mono">
                    #{idx + 1}. {qAns.questionText}
                  </span>
                  {qAns.aiFeedback && (
                    <div className="flex items-center space-x-2 font-mono text-[10px]">
                      <span className="text-blue-400">Tech: {qAns.aiFeedback.technicalAccuracyScore}%</span>
                      <span className="text-purple-400">Comm: {qAns.aiFeedback.communicationScore}%</span>
                      <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-emerald-400 font-bold">
                        {qAns.aiFeedback.overallRating}
                      </span>
                    </div>
                  )}
                </div>

                {/* Candidate Answer */}
                <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-850 space-y-1 text-slate-300 font-mono text-[11px] whitespace-pre-wrap leading-relaxed">
                  <span className="text-slate-500 block text-[10px] uppercase font-bold tracking-wider">Candidate Response:</span>
                  {qAns.userAnswer}
                </div>

                {/* Feedback items */}
                {qAns.aiFeedback && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                    {qAns.aiFeedback.strengths && qAns.aiFeedback.strengths.length > 0 && (
                      <div className="space-y-1">
                        <span className="text-emerald-400 font-bold text-[10px] uppercase tracking-wider">Strengths:</span>
                        <ul className="list-disc list-inside text-slate-300 text-[11px] space-y-0.5">
                          {qAns.aiFeedback.strengths.map((s, si) => (
                            <li key={si}>{s}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {qAns.aiFeedback.improvements && qAns.aiFeedback.improvements.length > 0 && (
                      <div className="space-y-1">
                        <span className="text-amber-400 font-bold text-[10px] uppercase tracking-wider">Suggested Additions:</span>
                        <ul className="list-disc list-inside text-slate-300 text-[11px] space-y-0.5">
                          {qAns.aiFeedback.improvements.map((imp, ii) => (
                            <li key={ii}>{imp}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Strengths & Areas for Improvement */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-3 print:bg-gray-50 print:border-gray-300">
          <h3 className="text-sm font-bold text-white flex items-center space-x-2 border-b border-slate-800 pb-3 print:text-black">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Key Candidate Strengths</span>
          </h3>
          <ul className="space-y-2 text-xs text-slate-300 print:text-black">
            {collectedStrengths.length > 0 ? (
              collectedStrengths.slice(0, 5).map((str, idx) => (
                <li key={idx} className="flex items-start space-x-2">
                  <span className="text-emerald-400 font-bold">•</span>
                  <span>{str}</span>
                </li>
              ))
            ) : isNonTech ? (
              <>
                <li className="flex items-start space-x-2">
                  <span className="text-emerald-400 font-bold">•</span>
                  <span>Strong alignment with core {parsedResume?.department || 'discipline'} fundamentals and business communication.</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-emerald-400 font-bold">•</span>
                  <span>Articulate verbal fluency, professional vocabulary, and clear thought organization.</span>
                </li>
              </>
            ) : (
              <>
                <li className="flex items-start space-x-2">
                  <span className="text-emerald-400 font-bold">•</span>
                  <span>Strong alignment with core department technical fundamentals ({parsedResume?.department || 'Engineering'}).</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-emerald-400 font-bold">•</span>
                  <span>High WebRTC presence and simulated technical engagement.</span>
                </li>
              </>
            )}
          </ul>
        </div>

        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-3 print:bg-gray-50 print:border-gray-300">
          <h3 className="text-sm font-bold text-white flex items-center space-x-2 border-b border-slate-800 pb-3 print:text-black">
            <AlertCircle className="w-4 h-4 text-amber-400" />
            <span>Recommended Study & Practice Topics</span>
          </h3>
          <ul className="space-y-2 text-xs text-slate-300 print:text-black">
            {collectedImprovements.length > 0 ? (
              collectedImprovements.slice(0, 5).map((imp, idx) => (
                <li key={idx} className="flex items-start space-x-2">
                  <span className="text-amber-400 font-bold">•</span>
                  <span>{imp}</span>
                </li>
              ))
            ) : isNonTech ? (
              <>
                <li className="flex items-start space-x-2">
                  <span className="text-amber-400 font-bold">•</span>
                  <span>Incorporate more quantifiable metrics and business impact data into behavioral responses.</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-amber-400 font-bold">•</span>
                  <span>Structure communication responses systematically using the STAR framework.</span>
                </li>
              </>
            ) : (
              <>
                <li className="flex items-start space-x-2">
                  <span className="text-amber-400 font-bold">•</span>
                  <span>Elaborate with deeper practical calculations and engineering standards during technical answers.</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-amber-400 font-bold">•</span>
                  <span>Review edge case boundary conditions and time/space complexity analysis.</span>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>

      {/* Final Step: Complete Interview Journey CTA */}
      <div className="p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950/80 to-slate-900 border border-indigo-500/40 shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 print:hidden">
        <div className="space-y-1">
          <div className="flex items-center space-x-2 text-indigo-400 font-bold text-xs uppercase tracking-wider">
            <Sparkles className="w-4 h-4" />
            <span>Final Phase Ahead</span>
          </div>
          <h3 className="text-xl font-extrabold text-white tracking-tight">
            Ready to Complete Your Mock Interview Journey?
          </h3>
          <p className="text-xs text-slate-300 max-w-xl leading-relaxed">
            Share your experience, report any challenges you faced, and generate your personalized 7-Day Action Plan & Performance Roadmap.
          </p>
        </div>

        <button
          type="button"
          onClick={() => onNavigate('feedback')}
          className="w-full md:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-extrabold text-sm shadow-xl shadow-indigo-600/30 transition-all flex items-center justify-center space-x-2 flex-shrink-0 cursor-pointer"
        >
          <span>Complete My Interview Journey</span>
          <ArrowRight className="w-4 h-4 ml-1" />
        </button>
      </div>
    </div>
  );
};
