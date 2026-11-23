import React from 'react';
import { 
  Sparkles, 
  FileCheck, 
  Cpu, 
  UserCheck, 
  BrainCircuit, 
  Video, 
  Award, 
  ArrowRight, 
  CheckCircle, 
  Star,
  Zap,
  TrendingUp,
  ShieldCheck,
  ChevronRight,
  Compass,
  BookOpen,
  LayoutDashboard
} from 'lucide-react';

interface LandingPageProps {
  onGetStarted: () => void;
  onOpenAuth: (mode?: 'login' | 'register') => void;
  onSelectFeature: (featureTab: string, roundPreset?: 'technical' | 'hr' | 'aptitude') => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onGetStarted,
  onOpenAuth,
  onSelectFeature,
}) => {
  const features = [
    {
      id: 'feature-resume',
      tab: 'resume',
      roundPreset: undefined,
      title: 'AI-Powered Resume Analysis',
      tagline: 'Deep ATS & Domain Skill Extraction',
      description: 'Upload your PDF/DOCX resume. Gemini AI extracts exact branch skills (Civil, Mechanical, ECE, CS, Data Science & AI), calculates ATS score, and suggests missing technologies.',
      icon: FileCheck,
      color: 'from-blue-500 to-cyan-500',
    },
    {
      id: 'feature-interview-tech',
      tab: 'interview',
      roundPreset: 'technical' as const,
      title: 'Adaptive AI Technical Interview',
      tagline: 'Tailored Questions & Follow-ups',
      description: 'Generates real-time domain questions based exclusively on your resume content with speech-to-text, TTS audio playback, and intelligent follow-ups.',
      icon: Cpu,
      color: 'from-indigo-500 to-purple-500',
    },
    {
      id: 'feature-interview-hr',
      tab: 'interview',
      roundPreset: 'hr' as const,
      title: 'AI Voice-Based HR Interview',
      tagline: 'Behavioral & Situational Voice Practice',
      description: 'Master self-introductions, leadership scenarios, conflict resolution, and career aspirations with instant live speech-to-text and AI voice interaction.',
      icon: UserCheck,
      color: 'from-purple-500 to-pink-500',
    },
    {
      id: 'feature-aptitude',
      tab: 'aptitude',
      title: 'Aptitude & Logical Assessment',
      tagline: 'Timed Tests with Explanations',
      description: 'Timed MCQs covering Quantitative, Logical Reasoning, Verbal Ability, and Core Fundamentals with detailed step-by-step solution breakdowns.',
      icon: BrainCircuit,
      color: 'from-emerald-500 to-teal-500',
    },
    {
      id: 'feature-telemetry',
      tab: 'telemetry',
      title: 'WebRTC Vision & Audio Analytics',
      tagline: 'Live Webcam Gaze & Pitch Telemetry',
      description: 'Real-time eye-contact monitoring, facial expression emotion detection, and vocal pitch confidence analysis during mock sessions.',
      icon: Video,
      color: 'from-amber-500 to-orange-500',
    },
    {
      id: 'feature-report',
      tab: 'report',
      title: 'Comprehensive AI Scorecard',
      tagline: 'Placement Readiness & Printable PDF',
      description: 'Generates overall interview readiness score %, category breakdowns, key strengths, weaknesses, and personalized learning roadmaps.',
      icon: Award,
      color: 'from-rose-500 to-red-500',
    },
    {
      id: 'feature-dashboard',
      tab: 'dashboard',
      title: 'Candidate Preparation Dashboard',
      tagline: 'Unified Progress & Metrics',
      description: 'Track your placement readiness index, multi-metric performance breakdowns, assessment history, and launch personalized practice sessions.',
      icon: LayoutDashboard,
      color: 'from-blue-600 to-indigo-600',
    },
    {
      id: 'feature-feedback',
      tab: 'feedback',
      title: 'Personalized Improvement Plan',
      tagline: '7-Day Targeted Growth Roadmap',
      description: 'Post-interview diagnostics, actionable daily checklist, gap analysis, and tailored guidance designed to overcome interview hurdles.',
      icon: Compass,
      color: 'from-purple-600 to-pink-600',
    },
    {
      id: 'feature-docs',
      tab: 'docs',
      title: 'Project Documentation',
      tagline: 'System Architecture & Specs',
      description: 'Review system design documentation, multi-branch question generation algorithms, scoring rubrics, and technical specifications.',
      icon: BookOpen,
      color: 'from-cyan-500 to-blue-500',
    },
  ];

  const testimonials = [
    {
      name: 'Rohan Verma',
      role: 'Placed at Tata Consultancy Services (TCS)',
      branch: 'Civil Engineering',
      content: 'CareerCurve analyzed my Civil resume and asked specific questions on ETABS structural design and concrete IS codes. The webcam eye contact feedback helped me stay confident during my campus interview!',
      rating: 5,
    },
    {
      name: 'Priya Sundaram',
      role: 'Placed at Texas Instruments',
      branch: 'ECE Graduate',
      content: 'The ECE question generator asked real Embedded C and Verilog timing questions based on my capstone project. The detailed AI feedback scorecard gave me the exact confidence boost I needed.',
      rating: 5,
    },
    {
      name: 'Aniket Kulkarni',
      role: 'Placed at Infosys',
      branch: 'Mechanical Engineering',
      content: 'The Aptitude test engine with step-by-step solutions combined with HR STAR method mock rounds prepared me for the entire recruitment drive in one place.',
      rating: 5,
    },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-indigo-500 selection:text-white">
      {/* Background Decorative Glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[600px] pointer-events-none overflow-hidden">
        <div className="absolute -top-40 left-1/4 w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[120px]" />
        <div className="absolute top-20 right-1/4 w-[400px] h-[400px] bg-purple-600/20 rounded-full blur-[120px]" />
        <div className="absolute top-60 left-1/3 w-[300px] h-[300px] bg-indigo-600/15 rounded-full blur-[100px]" />
      </div>

      {/* Hero Section */}
      <section className="relative pt-12 pb-20 md:pt-20 md:pb-28 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-semibold mb-8 animate-fade-in">
          <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
          <span>Final Year Project • AI Interview Preparation System</span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
        </div>

        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white max-w-5xl mx-auto leading-[1.15]">
          Practice Smarter. Interview Better.{' '}
          <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-400 bg-clip-text text-transparent">
            Get Hired.
          </span>
        </h1>

        <p className="mt-6 text-lg sm:text-xl text-slate-300 max-w-3xl mx-auto font-normal leading-relaxed">
          CareerCurve is an end-to-end intelligent interview platform powered by Google Gemini AI.
          Extract resume skills dynamically across Civil, Mechanical, ECE, CS, and Data Science, practice live WebRTC mock rounds, and receive real-time placement readiness scorecards.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={onGetStarted}
            className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-semibold text-base shadow-lg shadow-indigo-500/25 transition-all hover:scale-[1.02] flex items-center justify-center space-x-2 group"
          >
            <span>Get Started Free</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
          <button
            onClick={() => onOpenAuth('login')}
            className="w-full sm:w-auto px-8 py-4 rounded-xl bg-slate-900 border border-slate-700/80 hover:bg-slate-800 text-slate-200 font-semibold text-base transition-all hover:border-slate-600"
          >
            Log In Account
          </button>
        </div>

        {/* Hero Interactive Preview Card */}
        <div className="mt-16 max-w-5xl mx-auto rounded-2xl bg-slate-900/90 border border-slate-800/80 p-4 sm:p-6 shadow-2xl backdrop-blur-xl relative overflow-hidden text-left">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-6">
            <div className="flex items-center space-x-2">
              <span className="w-3 h-3 rounded-full bg-rose-500" />
              <span className="w-3 h-3 rounded-full bg-amber-500" />
              <span className="w-3 h-3 rounded-full bg-emerald-500" />
              <span className="text-xs font-mono text-slate-400 ml-2">CareerCurve Mock AI Portal</span>
            </div>
            <div className="flex items-center space-x-2 text-xs text-emerald-400 font-mono bg-emerald-500/10 px-2.5 py-1 rounded-md border border-emerald-500/20">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>WebRTC Vision Stream Active</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-4">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                <div className="flex items-center justify-between text-xs text-indigo-400 font-semibold mb-2">
                  <span>AI TECHNICAL QUESTION #1</span>
                  <span className="px-2 py-0.5 rounded bg-indigo-500/20 border border-indigo-500/30">ETABS / Civil Design</span>
                </div>
                <p className="text-sm font-medium text-slate-200">
                  "How do you execute seismic load distribution calculations on a multi-story building according to IS 1893 guidelines in ETABS?"
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                <div className="text-xs text-slate-400 font-mono mb-2 flex items-center justify-between">
                  <span>Candidate Response (Speech-to-Text)</span>
                  <span className="text-emerald-400">Recording Audio...</span>
                </div>
                <p className="text-xs text-slate-300 italic">
                  "I define response spectrum parameters in ETABS, verify story drift ratios against code limits, and assign mass source factors..."
                </p>
              </div>
            </div>

            <div className="space-y-3 p-4 rounded-xl bg-slate-950 border border-slate-800">
              <div className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Live AI Telemetry</div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Eye Contact %:</span>
                <span className="font-mono text-emerald-400 font-bold">94% Stable</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Detected Emotion:</span>
                <span className="font-mono text-indigo-300 font-bold">Confident</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Speech Cadence:</span>
                <span className="font-mono text-blue-400 font-bold">142 WPM</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">ATS Match Score:</span>
                <span className="font-mono text-purple-400 font-bold">92 / 100</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Features Grid */}
      <section className="py-20 bg-slate-900/50 border-y border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-2">Platform Capabilities</h2>
            <h3 className="text-3xl sm:text-4xl font-extrabold text-white">
              Everything You Need for Campus Placements & Off-Campus Hiring
            </h3>
            <p className="mt-4 text-slate-400 text-base">
              A complete end-to-end preparation suite built specifically for engineering and technical students.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.id}
                  onClick={() => onSelectFeature(feature.tab, feature.roundPreset)}
                  className="group relative p-8 rounded-2xl bg-slate-900 border border-slate-800/80 hover:border-indigo-500/50 transition-all cursor-pointer hover:-translate-y-1 shadow-lg hover:shadow-indigo-500/10"
                >
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${feature.color} flex items-center justify-center text-white mb-6 shadow-md group-hover:scale-110 transition-transform`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <h4 className="text-xl font-bold text-white mb-1 group-hover:text-indigo-300 transition-colors">
                    {feature.title}
                  </h4>
                  <p className="text-xs font-semibold text-indigo-400 mb-3">{feature.tagline}</p>
                  <p className="text-sm text-slate-400 leading-relaxed mb-6">
                    {feature.description}
                  </p>
                  <div className="flex items-center text-xs font-semibold text-indigo-400 group-hover:text-indigo-300">
                    <span>Explore Module</span>
                    <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Why Choose CareerCurve */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-semibold mb-4">
              <Zap className="w-3.5 h-3.5" />
              <span>Multi-Branch Architecture</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white leading-tight">
              Why CareerCurve Stands Out for Technical Interviews
            </h2>
            <p className="mt-4 text-slate-300 text-base leading-relaxed">
              Most interview platforms assume all candidates are generic software developers. CareerCurve detects your exact branch from your uploaded resume—whether Civil, Mechanical, ECE, CS, or Data Science & Machine Learning—and adapts questions accordingly.
            </p>

            <div className="mt-8 space-y-4">
              {[
                'Zero Fake Demo Data: Extracts actual facts from uploaded PDF/DOCX resumes',
                'Branch-Specific Question Sets: ETABS, ANSYS, Verilog, PyTorch/Spark, or System Design',
                'WebRTC Camera & Audio Analysis: Real webcam feed with eye contact % telemetry',
                'Single-Submit Aptitude Tests: No infinite restart loops or lost test scores',
                'Printable AI Scorecards: PDF exportable performance reports for faculty submissions'
              ].map((item, idx) => (
                <div key={idx} className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <span className="text-sm font-medium text-slate-200">{item}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="p-8 rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 shadow-2xl relative">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-6">Placement Readiness Overview</div>
            
            <div className="space-y-6">
              <div>
                <div className="flex justify-between text-sm font-semibold mb-2">
                  <span className="text-slate-300">ATS Resume Compatibility</span>
                  <span className="text-blue-400 font-mono">92%</span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden">
                  <div className="bg-gradient-to-r from-blue-500 to-indigo-500 h-2.5 rounded-full w-[92%]" />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-sm font-semibold mb-2">
                  <span className="text-slate-300">Technical Depth Rating</span>
                  <span className="text-purple-400 font-mono">88%</span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden">
                  <div className="bg-gradient-to-r from-purple-500 to-pink-500 h-2.5 rounded-full w-[88%]" />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-sm font-semibold mb-2">
                  <span className="text-slate-300">WebRTC Gaze & Vocal Pitch Stability</span>
                  <span className="text-emerald-400 font-mono">95%</span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden">
                  <div className="bg-gradient-to-r from-emerald-500 to-teal-500 h-2.5 rounded-full w-[95%]" />
                </div>
              </div>
            </div>

            <div className="mt-8 p-4 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400">Calculated Final Placement Index</p>
                <p className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">
                  91.6% Readied
                </p>
              </div>
              <Award className="w-10 h-10 text-emerald-400" />
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-slate-900/40 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-2">Success Stories</h2>
            <h3 className="text-3xl font-extrabold text-white">Student Testimonials</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((item, idx) => (
              <div key={idx} className="p-6 rounded-2xl bg-slate-900 border border-slate-800/80 flex flex-col justify-between">
                <div>
                  <div className="flex items-center space-x-1 mb-4 text-amber-400">
                    {[...Array(item.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400" />
                    ))}
                  </div>
                  <p className="text-sm text-slate-300 italic mb-6">"{item.content}"</p>
                </div>
                <div className="border-t border-slate-800/80 pt-4">
                  <p className="font-bold text-slate-100 text-sm">{item.name}</p>
                  <p className="text-xs text-indigo-400 font-medium">{item.role}</p>
                  <p className="text-[11px] text-slate-400">{item.branch}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action Banner */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-gradient-to-r from-blue-900/60 via-indigo-900/60 to-purple-900/60 border border-indigo-500/30 p-8 sm:p-12 text-center relative overflow-hidden shadow-2xl">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4">
            Ready to Master Your Technical & HR Interviews?
          </h2>
          <p className="text-slate-300 max-w-2xl mx-auto text-base mb-8">
            Upload your resume now to get instant ATS skill extraction, domain-specific AI questions, and live webcam interview practice.
          </p>
          <button
            onClick={onGetStarted}
            className="px-8 py-4 rounded-xl bg-white text-slate-950 font-bold text-base hover:bg-slate-100 transition-all shadow-xl hover:scale-[1.02]"
          >
            Launch Interview Portal Now
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-10 bg-slate-950 text-slate-400 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-indigo-400" />
            <span className="font-bold text-slate-200">CareerCurve</span>
            <span>— AI-Powered Interview Preparation Platform</span>
          </div>
          <p>© 2026 CareerCurve Final Year Project. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};
