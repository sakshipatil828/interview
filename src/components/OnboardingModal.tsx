import React, { useState } from 'react';
import { 
  Sparkles, 
  FileText, 
  Cpu, 
  Video, 
  Award, 
  CheckCircle2, 
  ArrowRight, 
  ChevronRight,
  BrainCircuit
} from 'lucide-react';

interface OnboardingModalProps {
  isOpen: boolean;
  onComplete: () => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({
  isOpen,
  onComplete,
}) => {
  const [currentStep, setCurrentStep] = useState(0);

  if (!isOpen) return null;

  const steps = [
    {
      title: 'Welcome to CareerCurve',
      description: 'Your AI-powered interview preparation portal. Practice technical rounds, HR behavioral questions, and aptitude tests in one place.',
      icon: Sparkles,
      color: 'from-blue-500 to-indigo-500',
    },
    {
      title: 'Step 1: Upload Your Resume',
      description: 'Upload your PDF or DOCX file. Gemini AI reads actual resume facts to extract your exact field of study and skills.',
      icon: FileText,
      color: 'from-cyan-500 to-blue-500',
    },
    {
      title: 'Step 2: Department Skill Extraction',
      description: 'Whether Civil, Mechanical, ECE, CS, or Data Science, CareerCurve analyzes exact technical tools, software, and projects without assumptions.',
      icon: Cpu,
      color: 'from-indigo-500 to-purple-500',
    },
    {
      title: 'Step 3: Interactive Mock Rounds',
      description: 'Choose between Technical Interview, HR Interview, Aptitude MCQs, or Full Placement Drive with customized difficulty levels.',
      icon: BrainCircuit,
      color: 'from-purple-500 to-pink-500',
    },
    {
      title: 'Step 4: WebRTC Camera Analytics',
      description: 'Real-time eye-contact monitoring, facial emotion tracking, and speech pitch confidence analysis during live mock sessions.',
      icon: Video,
      color: 'from-amber-500 to-orange-500',
    },
    {
      title: 'Step 5: AI Performance Scorecard',
      description: 'Receive overall interview readiness scores, technical breakdown, strengths, weaknesses, and exportable PDF reports.',
      icon: Award,
      color: 'from-emerald-500 to-teal-500',
    },
  ];

  const current = steps[currentStep];
  const Icon = current.icon;

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl overflow-hidden text-center">
        {/* Progress Indicator */}
        <div className="flex justify-center space-x-1.5 mb-8">
          {steps.map((_, idx) => (
            <div
              key={idx}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                idx === currentStep
                  ? 'w-8 bg-indigo-500'
                  : idx < currentStep
                  ? 'w-3 bg-emerald-400'
                  : 'w-3 bg-slate-800'
              }`}
            />
          ))}
        </div>

        <div className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${current.color} flex items-center justify-center text-white mx-auto mb-6 shadow-xl`}>
          <Icon className="w-8 h-8" />
        </div>

        <h3 className="text-2xl font-extrabold text-white mb-3">{current.title}</h3>
        <p className="text-sm text-slate-300 leading-relaxed mb-8 max-w-md mx-auto">
          {current.description}
        </p>

        <div className="flex items-center justify-between pt-4 border-t border-slate-800">
          <button
            onClick={onComplete}
            className="text-xs text-slate-400 hover:text-slate-200 font-medium px-3 py-2 rounded-lg hover:bg-slate-800 transition-colors"
          >
            Skip Tutorial
          </button>

          <button
            onClick={handleNext}
            className="flex items-center space-x-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold text-sm shadow-md shadow-indigo-600/25 transition-all hover:scale-105"
          >
            <span>{currentStep === steps.length - 1 ? 'Start Practicing' : 'Next Step'}</span>
            {currentStep === steps.length - 1 ? (
              <CheckCircle2 className="w-4 h-4 ml-1" />
            ) : (
              <ChevronRight className="w-4 h-4 ml-1" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
