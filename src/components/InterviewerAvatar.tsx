/**
 * CareerCurve Virtual AI HR Interviewer Avatar Component
 * Displays a professional virtual interviewer with live state-reactive
 * animations (speaking waveform, listening beacon, cognitive thinking glow).
 */

import React from 'react';
import { HRInterviewState } from '../nlp/hr/types';
import { Volume2, Mic, Sparkles, BrainCircuit, CheckCircle2, UserCheck } from 'lucide-react';

interface InterviewerAvatarProps {
  state: HRInterviewState;
  interviewerName?: string;
  interviewerRole?: string;
  isMuted?: boolean;
}

export const InterviewerAvatar: React.FC<InterviewerAvatarProps> = ({
  state,
  interviewerName = 'Sarah Chen',
  interviewerRole = 'Senior Talent Acquisition & HR Lead',
  isMuted = false,
}) => {
  const isSpeaking = state === 'ASKING_QUESTION' || state === 'GIVING_FEEDBACK' || state === 'SPEAKING_FEEDBACK_OR_FOLLOW_UP';
  const isListening = state === 'WAITING_FOR_ANSWER' || state === 'LISTENING_TO_STUDENT' || state === 'TRANSCRIBING';
  const isEvaluating = state === 'PROCESSING_ANSWER' || state === 'EVALUATING_ANSWER';

  return (
    <div className="relative flex flex-col items-center text-center p-6 rounded-3xl bg-gradient-to-b from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800 shadow-2xl overflow-hidden">
      {/* Background ambient lighting based on state */}
      <div
        className={`absolute inset-0 transition-opacity duration-700 pointer-events-none ${
          isSpeaking
            ? 'bg-gradient-to-t from-indigo-600/15 via-purple-600/10 to-transparent opacity-100'
            : isListening
            ? 'bg-gradient-to-t from-emerald-600/15 via-teal-600/10 to-transparent opacity-100'
            : isEvaluating
            ? 'bg-gradient-to-t from-amber-600/15 via-orange-600/10 to-transparent opacity-100'
            : 'opacity-30'
        }`}
      />

      {/* Avatar Container with Animated Rings */}
      <div className="relative my-4 flex items-center justify-center">
        {/* Pulsing soundwave rings when AI is speaking */}
        {isSpeaking && (
          <>
            <div className="absolute w-36 h-36 rounded-full bg-indigo-500/20 animate-ping opacity-75" />
            <div className="absolute w-44 h-44 rounded-full border border-indigo-500/30 animate-pulse" />
          </>
        )}

        {/* Listening radar pulse when candidate is speaking */}
        {isListening && (
          <>
            <div className="absolute w-36 h-36 rounded-full bg-emerald-500/20 animate-ping opacity-60" />
            <div className="absolute w-44 h-44 rounded-full border-2 border-emerald-400/40 animate-pulse" />
          </>
        )}

        {/* Cognitive thinking ring when evaluating */}
        {isEvaluating && (
          <div className="absolute w-36 h-36 rounded-full border-2 border-dashed border-amber-400/60 animate-spin" />
        )}

        {/* Main Avatar Centerpiece */}
        <div
          className={`relative z-10 w-28 h-28 rounded-3xl p-1.5 transition-all duration-300 shadow-2xl ${
            isSpeaking
              ? 'bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 ring-4 ring-indigo-500/40 scale-105'
              : isListening
              ? 'bg-gradient-to-tr from-emerald-500 via-teal-500 to-cyan-500 ring-4 ring-emerald-500/40 scale-105'
              : isEvaluating
              ? 'bg-gradient-to-tr from-amber-500 via-orange-500 to-yellow-500 ring-4 ring-amber-500/40'
              : 'bg-slate-800 ring-2 ring-slate-700'
          }`}
        >
          <div className="w-full h-full rounded-[22px] bg-slate-950 flex flex-col items-center justify-center overflow-hidden relative">
            {/* Virtual Interviewer Illustration / Portrait */}
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-700 via-indigo-900 to-slate-900 flex items-center justify-center text-white shadow-inner relative">
              <UserCheck className="w-9 h-9 text-indigo-300" />
              {/* Live Status indicator mini-badge */}
              <div
                className={`absolute -top-1 -right-1 w-4 h-4 rounded-full border-2 border-slate-950 flex items-center justify-center ${
                  isSpeaking
                    ? 'bg-indigo-400 animate-pulse'
                    : isListening
                    ? 'bg-emerald-400 animate-pulse'
                    : isEvaluating
                    ? 'bg-amber-400 animate-ping'
                    : 'bg-slate-500'
                }`}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Speaking Waveform Visualization */}
      <div className="h-6 flex items-center justify-center space-x-1.5 my-2">
        {isSpeaking ? (
          <>
            {[40, 75, 100, 60, 90, 45, 80, 60, 95, 50, 70].map((height, i) => (
              <span
                key={i}
                className="w-1 rounded-full bg-gradient-to-t from-indigo-500 to-purple-400 animate-pulse"
                style={{
                  height: `${height}%`,
                  animationDuration: `${0.4 + (i % 4) * 0.2}s`,
                  animationDelay: `${i * 0.08}s`,
                }}
              />
            ))}
          </>
        ) : isListening ? (
          <div className="flex items-center space-x-2 text-emerald-400 text-xs font-semibold animate-pulse">
            <Mic className="w-3.5 h-3.5 text-emerald-400" />
            <span>Listening to your response...</span>
          </div>
        ) : isEvaluating ? (
          <div className="flex items-center space-x-2 text-amber-400 text-xs font-semibold">
            <BrainCircuit className="w-3.5 h-3.5 animate-spin text-amber-400" />
            <span>Evaluating answer & STAR framework...</span>
          </div>
        ) : (
          <span className="text-[11px] text-slate-500 font-medium">Ready to begin</span>
        )}
      </div>

      {/* Interviewer Metadata */}
      <div className="mt-1 space-y-0.5">
        <div className="flex items-center justify-center space-x-1.5">
          <h3 className="text-base font-extrabold text-white">{interviewerName}</h3>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold">
            AI Recruiter
          </span>
        </div>
        <p className="text-xs text-slate-400">{interviewerRole}</p>
      </div>

      {/* Live State Capsule */}
      <div className="mt-4">
        {isSpeaking && (
          <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 animate-fade-in">
            <Volume2 className="w-3.5 h-3.5 text-indigo-400" />
            <span>{isMuted ? 'Speaking (Muted)' : 'Speaking Question...'}</span>
          </span>
        )}
        {isListening && (
          <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 animate-fade-in">
            <Mic className="w-3.5 h-3.5 text-emerald-400" />
            <span>Microphone Active • Speak Naturally</span>
          </span>
        )}
        {isEvaluating && (
          <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-fade-in">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Semantic Evaluation in Progress</span>
          </span>
        )}
        {state === 'READY' && (
          <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-800 text-slate-300 border border-slate-700">
            <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400" />
            <span>Interview Configured & Ready</span>
          </span>
        )}
        {state === 'COMPLETED' && (
          <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Interview Successfully Completed</span>
          </span>
        )}
      </div>
    </div>
  );
};
