import React, { useState, useEffect } from 'react';
import type { User } from '../types';
import {
  normalizeEmail,
  registerCandidateAccount,
  loginCandidateAccount,
  requestPasswordReset,
} from '../services/authStorageService';
import {
  X,
  Mail,
  Lock,
  User as UserIcon,
  Eye,
  EyeOff,
  Sparkles,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  ArrowLeft,
  Phone,
  Building,
  GraduationCap,
  BookOpen,
  Calendar,
} from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  initialMode?: 'login' | 'register';
  promptMessage?: string | null;
  onClose: () => void;
  onAuthSuccess: (user: User) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  initialMode = 'login',
  promptMessage,
  onClose,
  onAuthSuccess,
}) => {
  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>(
    initialMode
  );

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Login fields
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Registration fields
  const [fullName, setFullName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [college, setCollege] = useState('');
  const [degree, setDegree] = useState('B.Tech');
  const [department, setDepartment] = useState(
    'Computer Science & Engineering'
  );
  const [semester, setSemester] = useState('Semester 7');
  const [graduationYear, setGraduationYear] = useState('2027');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');

  // Forgot-password request field
  const [forgotEmail, setForgotEmail] = useState('');

  useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
      setError('');
      setSuccessMsg('');
    }
  }, [initialMode, isOpen]);

  if (!isOpen) return null;

  const validateEmail = (email: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

  // 1. Login
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    const cleanEmail = normalizeEmail(loginEmail);

    if (!cleanEmail || !validateEmail(cleanEmail)) {
      setError('Please enter a valid email address.');
      return;
    }

    if (!loginPassword) {
      setError('Please enter your password.');
      return;
    }

    setLoading(true);

    try {
      const result = await loginCandidateAccount(cleanEmail, loginPassword);

      if (result.success && result.user) {
        onAuthSuccess(result.user);
        onClose();
      } else {
        setError(result.error || 'Invalid email or password.');
      }
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : 'Unable to log in. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  // 2. Registration
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!fullName.trim()) {
      setError('Please enter your full name.');
      return;
    }

    const cleanEmail = normalizeEmail(regEmail);

    if (!cleanEmail || !validateEmail(cleanEmail)) {
      setError('Please enter a valid email address.');
      return;
    }

    if (!phone.trim()) {
      setError('Please enter your mobile number.');
      return;
    }

    if (!college.trim()) {
      setError('Please enter your college/university name.');
      return;
    }

    if (!degree.trim() || !department.trim()) {
      setError('Please select your degree and department.');
      return;
    }

    if (!semester.trim() || !graduationYear.trim()) {
      setError('Please select your semester and graduation year.');
      return;
    }

    if (regPassword.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (regPassword !== regConfirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);

    try {
      const result = await registerCandidateAccount({
        fullName: fullName.trim(),
        email: cleanEmail,
        password: regPassword,
        confirmPassword: regConfirmPassword,
        phone: phone.trim(),
        college: college.trim(),
        degree: degree.trim(),
        department: department.trim(),
        semester: semester.trim(),
        graduationYear: graduationYear.trim(),
      });

      if (!result.success) {
        setError(result.error || 'Failed to create account.');
        return;
      }

      // If Supabase requires email confirmation, wait for confirmation.
      if (result.requiresEmailConfirmation) {
        setLoginEmail(cleanEmail);
        setLoginPassword('');
        setMode('login');
        setSuccessMsg(
          'Your account has been created. Please check your email and confirm your account before logging in.'
        );
        return;
      }

      if (result.user) {
        onAuthSuccess(result.user);
        onClose();
      } else {
        setError(
          'Your account was created, but a session was not returned. Please confirm your email if required, then log in.'
        );
      }
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to create account. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  // 3. Send a real Supabase password-reset email
  const handleForgotRequestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    const cleanEmail = normalizeEmail(forgotEmail);

    if (!cleanEmail || !validateEmail(cleanEmail)) {
      setError('Please enter a valid email address.');
      return;
    }

    setLoading(true);

    try {
      const result = await requestPasswordReset(cleanEmail);

      if (!result.success) {
        setError(
          result.error || 'Could not send the password-reset email.'
        );
        return;
      }

      setSuccessMsg(
        'If an account exists for this email, a password-reset link will be sent. Check your inbox and spam folder, then open the link to choose a new password.'
      );
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : 'Unable to request a password reset. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden grid grid-cols-1 md:grid-cols-2 my-8">
        {/* Close Button */}
        <button
          onClick={onClose}
          type="button"
          aria-label="Close"
          className="absolute top-4 right-4 z-20 p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-full transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* LEFT PANEL */}
        <div className="p-8 bg-gradient-to-br from-indigo-950 via-slate-900 to-purple-950 hidden md:flex flex-col justify-between border-r border-slate-800/80">
          <div>
            <div className="flex items-center space-x-2 text-indigo-400 font-bold mb-6">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-purple-600 flex items-center justify-center text-white shadow-lg">
                <Sparkles className="w-5 h-5" />
              </div>
              <span className="text-2xl font-extrabold text-white tracking-tight">
                CareerCurve
              </span>
            </div>

            <h3 className="text-2xl font-extrabold text-white leading-tight mb-3">
              AI Adaptive Placement System
            </h3>

            <p className="text-xs text-slate-300 leading-relaxed mb-6">
              Prepare for placements with AI-assisted resume analysis,
              technical mock interviews, behavioral practice, and aptitude
              assessments.
            </p>

            <div className="space-y-3.5 pt-2">
              {[
                'Tailored technical questions by domain and resume',
                'STAR method HR behavioral practice',
                'Timed aptitude and logical reasoning tests',
                'Interview feedback to help improve performance',
              ].map((benefit, idx) => (
                <div
                  key={idx}
                  className="flex items-start space-x-2.5 text-xs text-slate-200"
                >
                  <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <span>{benefit}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-6 border-t border-slate-800/80 space-y-2 text-[11px] text-slate-400">
            <div className="flex items-center justify-between">
              <span>CareerCurve Student Account</span>
              <span className="font-mono text-emerald-400">
                Supabase Auth
              </span>
            </div>
            <p className="text-[10px] text-slate-400 leading-normal">
              Authentication is managed by Supabase. Account profile access
              is controlled by database permissions.
            </p>
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div className="p-6 sm:p-8 flex flex-col justify-center max-h-[85vh] overflow-y-auto">
          {/* Login / Register Tabs */}
          {(mode === 'login' || mode === 'register') && (
            <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-6">
              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setError('');
                  setSuccessMsg('');
                }}
                className={`text-sm sm:text-base font-bold pb-1 transition-colors relative ${
                  mode === 'login'
                    ? 'text-white'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Log In Account
                {mode === 'login' && (
                  <span className="absolute bottom-0 left-0 w-full h-0.5 bg-indigo-500 rounded-full" />
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  setMode('register');
                  setError('');
                  setSuccessMsg('');
                }}
                className={`text-sm sm:text-base font-bold pb-1 transition-colors relative ${
                  mode === 'register'
                    ? 'text-white'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Create Account
                {mode === 'register' && (
                  <span className="absolute bottom-0 left-0 w-full h-0.5 bg-indigo-500 rounded-full" />
                )}
              </button>
            </div>
          )}

          {/* Protected Feature Notice */}
          {promptMessage && !error && !successMsg && (
            <div className="mb-4 p-3.5 rounded-xl bg-indigo-500/15 border border-indigo-500/40 text-indigo-200 text-xs flex items-start space-x-2.5 animate-fade-in">
              <Sparkles className="w-4 h-4 text-indigo-400 flex-shrink-0 mt-0.5" />
              <span className="font-medium leading-relaxed">
                {promptMessage}
              </span>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div
              role="alert"
              className="mb-4 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start space-x-2 animate-fade-in"
            >
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Success Message */}
          {successMsg && (
            <div
              role="status"
              className="mb-4 p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-start space-x-2 animate-fade-in"
            >
              <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* MODE 1: LOGIN */}
          {mode === 'login' && (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <h2 className="text-xl font-extrabold text-white">
                  Welcome to CareerCurve
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Log in to continue your personalized interview preparation.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input
                    type="email"
                    required
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="name@company.com"
                    autoComplete="email"
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs focus:border-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-slate-300">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setForgotEmail(loginEmail);
                      setMode('forgot');
                      setError('');
                      setSuccessMsg('');
                    }}
                    className="text-xs text-indigo-400 hover:underline font-medium"
                  >
                    Forgot Password?
                  </button>
                </div>

                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    className="w-full pl-9 pr-10 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs focus:border-indigo-500 focus:outline-none"
                  />
                  <button
                    type="button"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-slate-500 hover:text-slate-300"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 mt-2 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/25 transition-all flex items-center justify-center space-x-2 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span>Logging In...</span>
                ) : (
                  <>
                    <span>Log In</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="pt-2 text-center text-xs text-slate-400">
                <span>Don't have an account? </span>
                <button
                  type="button"
                  onClick={() => {
                    setMode('register');
                    setError('');
                    setSuccessMsg('');
                  }}
                  className="text-indigo-400 hover:underline font-bold"
                >
                  Create Account
                </button>
              </div>
            </form>
          )}

          {/* MODE 2: REGISTRATION */}
          {mode === 'register' && (
            <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
              <div>
                <h2 className="text-xl font-extrabold text-white">
                  Create Account
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Sign up for free and start your CareerCurve placement
                  preparation.
                </p>
              </div>

              <div className="space-y-3">
                {/* Full Name */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Full Name *
                  </label>
                  <div className="relative">
                    <UserIcon className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Your full name"
                      autoComplete="name"
                      className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs focus:border-indigo-500 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Email and Phone */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Email *
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                      <input
                        type="email"
                        required
                        value={regEmail}
                        onChange={(e) => setRegEmail(e.target.value)}
                        placeholder="you@example.com"
                        autoComplete="email"
                        className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs focus:border-indigo-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Mobile Number *
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                      <input
                        type="tel"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+91 98765 43210"
                        autoComplete="tel"
                        className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs focus:border-indigo-500 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* College */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    College / University *
                  </label>
                  <div className="relative">
                    <Building className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                    <input
                      type="text"
                      required
                      value={college}
                      onChange={(e) => setCollege(e.target.value)}
                      placeholder="Your college or university"
                      className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs focus:border-indigo-500 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Degree and Department */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Degree *
                    </label>
                    <div className="relative">
                      <GraduationCap className="w-4 h-4 text-slate-500 absolute left-3 top-3 z-10 pointer-events-none" />
                      <select
                        required
                        value={degree}
                        onChange={(e) => setDegree(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs focus:border-indigo-500 focus:outline-none appearance-none"
                      >
                        <option value="B.Tech">B.Tech</option>
                        <option value="B.E.">B.E.</option>
                        <option value="M.Tech">M.Tech</option>
                        <option value="BCA">BCA</option>
                        <option value="MCA">MCA</option>
                        <option value="B.Sc">B.Sc</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Department / Branch *
                    </label>
                    <div className="relative">
                      <BookOpen className="w-4 h-4 text-slate-500 absolute left-3 top-3 z-10 pointer-events-none" />
                      <select
                        required
                        value={department}
                        onChange={(e) => setDepartment(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs focus:border-indigo-500 focus:outline-none appearance-none"
                      >
                        <option value="Computer Science & Engineering">
                          Computer Science & Engineering
                        </option>
                        <option value="Data Science & Artificial Intelligence">
                          Data Science & Artificial Intelligence
                        </option>
                        <option value="Data Engineering & Analytics">
                          Data Engineering & Analytics
                        </option>
                        <option value="Information Technology">
                          Information Technology
                        </option>
                        <option value="Electronics & Communication">
                          Electronics & Communication
                        </option>
                        <option value="Electrical Engineering">
                          Electrical Engineering
                        </option>
                        <option value="Mechanical Engineering">
                          Mechanical Engineering
                        </option>
                        <option value="Civil Engineering">
                          Civil Engineering
                        </option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Semester and Graduation Year */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Current Semester *
                    </label>
                    <div className="relative">
                      <BookOpen className="w-4 h-4 text-slate-500 absolute left-3 top-3 z-10 pointer-events-none" />
                      <select
                        required
                        value={semester}
                        onChange={(e) => setSemester(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs focus:border-indigo-500 focus:outline-none appearance-none"
                      >
                        {[1, 2, 3, 4, 5, 6, 7, 8].map((number) => (
                          <option key={number} value={`Semester ${number}`}>
                            Semester {number}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Graduation Year *
                    </label>
                    <div className="relative">
                      <Calendar className="w-4 h-4 text-slate-500 absolute left-3 top-3 z-10 pointer-events-none" />
                      <select
                        required
                        value={graduationYear}
                        onChange={(e) => setGraduationYear(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs focus:border-indigo-500 focus:outline-none appearance-none"
                      >
                        {[2024, 2025, 2026, 2027, 2028, 2029, 2030].map(
                          (year) => (
                            <option key={year} value={String(year)}>
                              {year}
                            </option>
                          )
                        )}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Password and Confirm Password */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Password *
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        minLength={6}
                        value={regPassword}
                        onChange={(e) => setRegPassword(e.target.value)}
                        placeholder="At least 6 characters"
                        autoComplete="new-password"
                        className="w-full pl-9 pr-10 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs focus:border-indigo-500 focus:outline-none"
                      />
                      <button
                        type="button"
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-2.5 text-slate-500 hover:text-slate-300"
                      >
                        {showPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Confirm Password *
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        required
                        minLength={6}
                        value={regConfirmPassword}
                        onChange={(e) => setRegConfirmPassword(e.target.value)}
                        placeholder="Repeat password"
                        autoComplete="new-password"
                        className="w-full pl-9 pr-10 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs focus:border-indigo-500 focus:outline-none"
                      />
                      <button
                        type="button"
                        aria-label={
                          showConfirmPassword
                            ? 'Hide confirm password'
                            : 'Show confirm password'
                        }
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                        className="absolute right-3 top-2.5 text-slate-500 hover:text-slate-300"
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 mt-2 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/25 transition-all flex items-center justify-center space-x-2 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span>Creating Account...</span>
                ) : (
                  <>
                    <span>Create CareerCurve Account</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="pt-2 text-center text-xs text-slate-400">
                <span>Already have an account? </span>
                <button
                  type="button"
                  onClick={() => {
                    setMode('login');
                    setError('');
                    setSuccessMsg('');
                  }}
                  className="text-indigo-400 hover:underline font-bold"
                >
                  Log In
                </button>
              </div>
            </form>
          )}

          {/* MODE 3: FORGOT PASSWORD */}
          {mode === 'forgot' && (
            <div className="space-y-4 animate-fade-in">
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  aria-label="Back to login"
                  onClick={() => {
                    setMode('login');
                    setError('');
                    setSuccessMsg('');
                  }}
                  className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>

                <div>
                  <h3 className="text-xl font-extrabold text-white">
                    Reset Password
                  </h3>
                  <p className="text-xs text-slate-400">
                    We’ll email you a secure password-reset link.
                  </p>
                </div>
              </div>

              <form
                onSubmit={handleForgotRequestSubmit}
                className="space-y-4"
              >
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                    <input
                      type="email"
                      required
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      placeholder="you@example.com"
                      autoComplete="email"
                      className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs focus:border-indigo-500 focus:outline-none"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {loading ? 'Sending Reset Link...' : 'Send Password Reset Link'}
                </button>

                <p className="text-[11px] text-slate-400 leading-relaxed">
                  For your security, this form does not reveal whether an
                  account exists. If you have an account, check your email for
                  the reset link.
                </p>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};