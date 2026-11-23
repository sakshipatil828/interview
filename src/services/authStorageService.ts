import { supabase } from '../lib/supabaseClient';
/**
 * CareerCurve AI Interview Preparation Platform
 * Client Authentication & User Data Isolation Storage Service
 * 
 * NOTICE:
 * This module provides development-only client authentication and namespaced storage
 * for local UI testing and development phases.
 * Private user records must be migrated behind a future production backend with authorization checks.
 * Passwords are never stored in plaintext (hashed using Web Crypto API SHA-256 with salt).
 */

import { 
  User, 
  ParsedResume, 
  InterviewSession, 
  AptitudeResult,
  StudentInterviewFeedback,
  PersonalizedImprovementPlan,
  InterviewJourneyState
} from '../types';

export interface StoredUserAccount {
  id: string; // Unique, stable user ID e.g. "usr_1712345678_a1b2c"
  name: string;
  email: string; // Normalized: lowercase and trimmed
  phone?: string;
  college?: string;
  degree?: string;
  department?: string;
  semester?: string;
  graduationYear?: string;
  linkedin?: string;
  github?: string;
  passwordSalt: string;
  passwordHash: string; // Salted SHA-256 hash
  createdAt: string;
  verified: boolean;
  onboardingCompleted: boolean;
}

export interface ActiveSession {
  userId: string;
  token: string;
  createdAt: string;
}

export interface RegistrationInput {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone?: string;
  college?: string;
  degree?: string;
  department?: string;
  semester?: string;
  graduationYear?: string;
  linkedin?: string;
  github?: string;
}

// Storage Key Constants
const STORAGE_KEYS = {
  REGISTERED_USERS: 'careercurve:registered_users',
  ACTIVE_SESSION: 'careercurve:session',
  LEGACY_USER: 'careercurve_user',
  LEGACY_TOKEN: 'careercurve_auth_token',
  LEGACY_RESUME: 'careercurve_resume',
  LEGACY_APTITUDE_HISTORY: 'careercurve_aptitude_history',
  LEGACY_APTITUDE_PROGRESS: 'careercurve_aptitude_progress',
};

// User-Specific Storage Key Helpers
export const getUserStorageKeys = (userId: string) => ({
  resume: `careercurve:user:${userId}:resume`,
  skills: `careercurve:user:${userId}:skills`,
  interviews: `careercurve:user:${userId}:interviews`,
  aptitudeHistory: `careercurve:user:${userId}:aptitude_history`,
  aptitudeProgress: `careercurve:user:${userId}:aptitude_progress`,
  scorecard: `careercurve:user:${userId}:scorecard`,
  profile: `careercurve:user:${userId}:profile`,
  feedback: `careercurve:user:${userId}:feedback`,
  improvementPlan: `careercurve:user:${userId}:improvement_plan`,
  journey: `careercurve:user:${userId}:journey`,
  hrMockProgress: `careercurve:user:${userId}:hr_mock_progress`,
});

/**
 * Normalizes email addresses consistently (lowercase, trimmed).
 */
export function normalizeEmail(email: string): string {
  if (!email || typeof email !== 'string') return '';
  return email.trim().toLowerCase();
}

/**
 * Computes a salted SHA-256 password hash using standard Web Crypto API.
 * Never stores or outputs plaintext passwords.
 */
export async function hashPasswordClient(password: string, salt: string): Promise<string> {
  if (typeof crypto !== 'undefined' && crypto?.subtle) {
    try {
      const encoder = new TextEncoder();
      const data = encoder.encode(`${salt}__careercurve_salt__${password}`);
      const hashBuffer = await crypto.subtle.digest('SHA-256', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
    } catch {
      // fallback to sync hash if crypto.subtle fails
    }
  }

  // Pure deterministic fallback for environments without crypto.subtle
  let hash = 0;
  const str = `${salt}__careercurve_salt__${password}`;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return `dev_h_${Math.abs(hash).toString(16).padStart(12, '0')}`;
}

/**
 * Verifies a password against the stored salt and hash.
 */
export async function verifyPasswordClient(password: string, salt: string, storedHash: string): Promise<boolean> {
  if (!password || !salt || !storedHash) return false;
  const computed = await hashPasswordClient(password, salt);
  return computed === storedHash;
}

/**
 * Converts internal user record to public safe user object without credentials.
 */
export function toSafeUser(record: StoredUserAccount, token?: string): User {
  return {
    id: record.id,
    name: record.name,
    email: record.email,
    phone: record.phone || '',
    college: record.college || '',
    degree: record.degree || '',
    department: record.department || '',
    semester: record.semester || '',
    graduationYear: record.graduationYear || '',
    linkedin: record.linkedin || '',
    github: record.github || '',
    verified: record.verified,
    onboardingCompleted: record.onboardingCompleted,
    createdAt: record.createdAt,
    token: token || `token_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
  };
}

/**
 * Retrieves all registered user accounts from localStorage.
 */
export function getRegisteredAccounts(): StoredUserAccount[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.REGISTERED_USERS);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/**
 * Saves the registered user accounts list to localStorage.
 */
function saveRegisteredAccounts(accounts: StoredUserAccount[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.REGISTERED_USERS, JSON.stringify(accounts));
  } catch (err) {
    console.error('Failed to save registered accounts:', err);
  }
}

/**
 * Sets the active authenticated session.
 */
export function setActiveSession(userId: string, token?: string): void {
  const session: ActiveSession = {
    userId,
    token: token || `token_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
    createdAt: new Date().toISOString(),
  };
  try {
    localStorage.setItem(STORAGE_KEYS.ACTIVE_SESSION, JSON.stringify(session));
  } catch {}
}

/**
 * Gets the current active session.
 */
export function getActiveSession(): ActiveSession | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ACTIVE_SESSION);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

/**
 * Clears the active session and removes legacy session markers.
 */
export function clearActiveSession(): void {
  try {
    localStorage.removeItem(STORAGE_KEYS.ACTIVE_SESSION);
    localStorage.removeItem(STORAGE_KEYS.LEGACY_USER);
    localStorage.removeItem(STORAGE_KEYS.LEGACY_TOKEN);
  } catch {}
}

/**
 * Restores the currently authenticated user if a valid session exists.
 * Returns null if no active session or invalid session.
 */
export function restoreAuthenticatedUser(): User | null {
  const session = getActiveSession();
  if (!session || !session.userId) {
    // Check fallback legacy user if it exists and syncs to a registered account
    try {
      const legRaw = localStorage.getItem(STORAGE_KEYS.LEGACY_USER);
      if (legRaw) {
        const legUser: User = JSON.parse(legRaw);
        if (legUser && legUser.id && legUser.email) {
          const accounts = getRegisteredAccounts();
          const cleanEmail = normalizeEmail(legUser.email);
          const found = accounts.find((a) => a.id === legUser.id || a.email === cleanEmail);
          if (found) {
            setActiveSession(found.id, legUser.token);
            return toSafeUser(found, legUser.token);
          }
        }
      }
    } catch {}
    return null;
  }

  const accounts = getRegisteredAccounts();
  const found = accounts.find((a) => a.id === session.userId);
  if (!found) {
    clearActiveSession();
    return null;
  }

  return toSafeUser(found, session.token);
}

export async function requestPasswordReset(emailInput: string): Promise<{
  success: boolean;
  error?: string;
}> {
  const email = normalizeEmail(emailInput);
  if (!email) {
    return { success: false, error: 'Please enter a valid email address.' };
  }

  const { error } = await supabase.auth.resetPasswordForEmail(email);
  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true };
}

/**
 * Registers a new candidate account.
 * Rejects duplicate registered emails.
 * Generates a stable unique user ID.
 * Initializes an empty resume state for genuine new accounts.
 */

export async function registerCandidateAccount(input: RegistrationInput): Promise<{
  success: boolean;
  user?: User;
  error?: string;
  requiresEmailConfirmation?: boolean;
}> {
  if (!input.fullName.trim()) {
    return { success: false, error: 'Please enter your full name.' };
  }

  const email = normalizeEmail(input.email);

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { success: false, error: 'Please enter a valid email address.' };
  }

  if (input.password.length < 6) {
    return { success: false, error: 'Password must be at least 6 characters long.' };
  }

  if (input.password !== input.confirmPassword) {
    return { success: false, error: 'Passwords do not match.' };
  }

  const profile = {
    full_name: input.fullName.trim(),
    phone: (input.phone || '').trim(),
    college: (input.college || '').trim(),
    degree: (input.degree || '').trim(),
    department: (input.department || '').trim(),
    semester: (input.semester || '').trim(),
    graduation_year: (input.graduationYear || '').trim(),
    linkedin: (input.linkedin || '').trim(),
    github: (input.github || '').trim(),
  };

  const { data, error } = await supabase.auth.signUp({
    email,
    password: input.password,
    options: {
      data: profile,
    },
  });

  if (error) {
    return { success: false, error: error.message };
  }

  if (!data.user) {
    return { success: false, error: 'Supabase did not return a user account.' };
  }

  const requiresEmailConfirmation = !data.session;

  const user: User = {
    id: data.user.id,
    name: profile.full_name,
    email: data.user.email || email,
    phone: profile.phone,
    college: profile.college,
    degree: profile.degree,
    department: profile.department,
    semester: profile.semester,
    graduationYear: profile.graduation_year,
    linkedin: profile.linkedin,
    github: profile.github,
    verified: !!data.user.email_confirmed_at,
    onboardingCompleted: false,
    createdAt: data.user.created_at || new Date().toISOString(),
    token: data.session?.access_token || '',
  };

  if (data.session) {
    setActiveSession(data.user.id, data.session.access_token);
    try {
      localStorage.setItem(STORAGE_KEYS.LEGACY_USER, JSON.stringify(user));
      localStorage.setItem(STORAGE_KEYS.LEGACY_TOKEN, data.session.access_token);
    } catch {
      // Authentication still works if optional local caching fails.
    }
  }

  return {
    success: true,
    user,
    requiresEmailConfirmation,
  };
}

/**
 * Logs in an existing candidate account through Supabase Auth.
 */
export async function loginCandidateAccount(
  emailInput: string,
  passwordInput: string
): Promise<{
  success: boolean;
  user?: User;
  error?: string;
}> {
  const email = normalizeEmail(emailInput);

  if (!email) {
    return { success: false, error: 'Please enter your email.' };
  }

  if (!passwordInput) {
    return { success: false, error: 'Please enter your password.' };
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password: passwordInput,
  });

  if (error) {
    console.error('Supabase login error:', {
      message: error.message,
      code: error.code,
      status: error.status,
    });

    return {
      success: false,
      error: error.message,
    };
  }

  if (!data.user || !data.session) {
    return {
      success: false,
      error: 'Login failed: Supabase did not return an active session.',
    };
  }

  const authUser = data.user;
  const metadata = authUser.user_metadata || {};

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select(
      'full_name, phone, college, degree, department, semester, graduation_year, linkedin, github'
    )
    .eq('id', authUser.id)
    .maybeSingle();

  if (profileError) {
    console.error('Could not load profile:', profileError.message);
  }

  const user: User = {
    id: authUser.id,
    name: profile?.full_name || metadata.full_name || '',
    email: authUser.email || email,
    phone: profile?.phone || metadata.phone || '',
    college: profile?.college || metadata.college || '',
    degree: profile?.degree || metadata.degree || '',
    department: profile?.department || metadata.department || '',
    semester: profile?.semester || metadata.semester || '',
    graduationYear:
      profile?.graduation_year || metadata.graduation_year || '',
    linkedin: profile?.linkedin || metadata.linkedin || '',
    github: profile?.github || metadata.github || '',
    verified: !!authUser.email_confirmed_at,
    onboardingCompleted: false,
    createdAt: authUser.created_at || new Date().toISOString(),
    token: data.session.access_token,
  };

  setActiveSession(authUser.id, data.session.access_token);

  try {
    localStorage.setItem(STORAGE_KEYS.LEGACY_USER, JSON.stringify(user));
    localStorage.setItem(STORAGE_KEYS.LEGACY_TOKEN, data.session.access_token);
  } catch {
    // Optional cache only.
  }

  return { success: true, user };
}

/**
 * Logs out the candidate: informs server to invalidate session & clear cookie,
 * and clears client local state.
 */
export async function logoutCandidateAccount(): Promise<void> {
  try {
    await fetch('/api/auth/logout', {
      method: 'POST',
      credentials: 'include',
    });
  } catch {}
  clearActiveSession();
}

/**
 * Restores user session by validating with the server (using HttpOnly cookie).
 * If valid, returns the authenticated user.
 * If server is offline, falls back to client session.
 */
export async function restoreSessionWithServer(): Promise<User | null> {
  try {
    const res = await fetch('/api/auth/me', {
      credentials: 'include',
    });
    if (res.ok) {
      const data = await res.json();
      if (data.success && data.user) {
        setActiveSession(data.user.id, data.user.token);
        return data.user;
      }
    } else if (res.status === 401) {
      // Session expired or invalidated on server
      clearActiveSession();
      return null;
    }
  } catch {
    // Server offline: fallback to client session
  }
  return restoreAuthenticatedUser();
}

/**
 * Resets user password for forgot password flow.
 */
export async function resetPasswordClient(
  emailInput: string,
  newPasswordInput: string
): Promise<{ success: boolean; error?: string }> {
  const cleanEmail = normalizeEmail(emailInput);
  const accounts = getRegisteredAccounts();
  const idx = accounts.findIndex((a) => a.email === cleanEmail);

  if (idx === -1) {
    return { success: false, error: 'No registered student account found with this email.' };
  }

  const salt = `salt_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
  const passwordHash = await hashPasswordClient(newPasswordInput, salt);

  accounts[idx].passwordSalt = salt;
  accounts[idx].passwordHash = passwordHash;
  saveRegisteredAccounts(accounts);

  return { success: true };
}

// =========================================================================
// USER-ISOLATED DATA PERSISTENCE METHODS
// =========================================================================

/**
 * Retrieves the parsed resume belonging strictly to the specified userId.
 * Returns null if no resume has been uploaded for this user.
 */
export function getUserResume(userId?: string | null): ParsedResume | null {
  if (!userId) return null;
  const key = getUserStorageKeys(userId).resume;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === 'object' && parsed.fullName) {
      return parsed as ParsedResume;
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Saves a parsed resume strictly associated with the specified userId.
 */
export function saveUserResume(userId: string, resume: ParsedResume): void {
  if (!userId || !resume) return;
  const key = getUserStorageKeys(userId).resume;
  try {
    localStorage.setItem(key, JSON.stringify(resume));
    // Also save extracted skills separately for quick taxonomy matching
    if (resume.rawSkillsList) {
      const skillsKey = getUserStorageKeys(userId).skills;
      localStorage.setItem(skillsKey, JSON.stringify(resume.rawSkillsList));
    }
  } catch (err) {
    console.error('Failed to save user resume:', err);
  }
}

/**
 * Clears the resume strictly belonging to the specified userId.
 */
export function clearUserResume(userId?: string | null): void {
  if (!userId) return;
  const keys = getUserStorageKeys(userId);
  try {
    localStorage.removeItem(keys.resume);
    localStorage.removeItem(keys.skills);
  } catch {}
}

/**
 * Retrieves interview session history strictly belonging to the specified userId.
 */
export function getUserInterviews(userId?: string | null): InterviewSession[] {
  if (!userId) return [];
  const key = getUserStorageKeys(userId).interviews;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as InterviewSession[]) : [];
  } catch {
    return [];
  }
}

/**
 * Saves interview session history strictly associated with the specified userId.
 */
export function saveUserInterview(userId: string, session: InterviewSession): void {
  if (!userId || !session) return;
  const key = getUserStorageKeys(userId).interviews;
  try {
    const existing = getUserInterviews(userId);
    const updated = [session, ...existing.filter((s) => s.id !== session.id)];
    localStorage.setItem(key, JSON.stringify(updated));
  } catch (err) {
    console.error('Failed to save user interview session:', err);
  }
}

/**
 * Retrieves aptitude test history strictly belonging to the specified userId.
 */
export function getUserAptitudeHistory(userId?: string | null): AptitudeResult[] {
  if (!userId) return [];
  const key = getUserStorageKeys(userId).aptitudeHistory;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as AptitudeResult[]) : [];
  } catch {
    return [];
  }
}

/**
 * Saves aptitude test result strictly associated with the specified userId.
 */
export function saveUserAptitudeResult(userId: string, result: AptitudeResult): void {
  if (!userId || !result) return;
  const key = getUserStorageKeys(userId).aptitudeHistory;
  try {
    const existing = getUserAptitudeHistory(userId);
    const updated = [result, ...existing.filter((item) => item.id !== result.id)];
    localStorage.setItem(key, JSON.stringify(updated));
  } catch (err) {
    console.error('Failed to save user aptitude result:', err);
  }
}

/**
 * Retrieves in-progress aptitude test state strictly for the specified userId.
 */
export function getUserAptitudeProgress(userId?: string | null): any | null {
  if (!userId) return null;
  const key = getUserStorageKeys(userId).aptitudeProgress;
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

/**
 * Saves in-progress aptitude test state strictly for the specified userId.
 */
export function saveUserAptitudeProgress(userId: string, progress: any): void {
  if (!userId || !progress) return;
  const key = getUserStorageKeys(userId).aptitudeProgress;
  try {
    localStorage.setItem(key, JSON.stringify(progress));
  } catch {}
}

/**
 * Clears in-progress aptitude test state for the specified userId.
 */
export function clearUserAptitudeProgress(userId?: string | null): void {
  if (!userId) return;
  const key = getUserStorageKeys(userId).aptitudeProgress;
  try {
    localStorage.removeItem(key);
  } catch {}
}

/**
 * Purges any legacy unscoped localStorage items to prevent accidental cross-account leakage.
 */
export function purgeLegacyUnscopedStorage(): void {
  try {
    localStorage.removeItem(STORAGE_KEYS.LEGACY_RESUME);
    localStorage.removeItem(STORAGE_KEYS.LEGACY_APTITUDE_PROGRESS);
  } catch {}
}

/**
 * Retrieves submitted interview feedback strictly for the specified userId.
 */
export function getUserFeedback(userId?: string | null): StudentInterviewFeedback | null {
  if (!userId) return null;
  const key = getUserStorageKeys(userId).feedback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

/**
 * Saves submitted interview feedback strictly for the specified userId.
 */
export function saveUserFeedback(userId: string, feedback: StudentInterviewFeedback): void {
  if (!userId || !feedback) return;
  const key = getUserStorageKeys(userId).feedback;
  try {
    localStorage.setItem(key, JSON.stringify(feedback));
  } catch {}
}

/**
 * Clears interview feedback for the specified userId.
 */
export function clearUserFeedback(userId?: string | null): void {
  if (!userId) return;
  const key = getUserStorageKeys(userId).feedback;
  try {
    localStorage.removeItem(key);
  } catch {}
}

/**
 * Retrieves personalized improvement plan strictly for the specified userId.
 */
export function getUserImprovementPlan(userId?: string | null): PersonalizedImprovementPlan | null {
  if (!userId) return null;
  const key = getUserStorageKeys(userId).improvementPlan;
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

/**
 * Saves personalized improvement plan strictly for the specified userId.
 */
export function saveUserImprovementPlan(userId: string, plan: PersonalizedImprovementPlan): void {
  if (!userId || !plan) return;
  const key = getUserStorageKeys(userId).improvementPlan;
  try {
    localStorage.setItem(key, JSON.stringify(plan));
  } catch {}
}

/**
 * Toggles a daily task completion status within the user's saved 7-day improvement plan.
 */
export function toggleImprovementPlanTask(
  userId: string,
  dayNumber: number,
  completed: boolean
): PersonalizedImprovementPlan | null {
  if (!userId) return null;
  const currentPlan = getUserImprovementPlan(userId);
  if (!currentPlan) return null;

  const updatedPlan: PersonalizedImprovementPlan = {
    ...currentPlan,
    updatedAt: new Date().toISOString(),
    sevenDayPlan: currentPlan.sevenDayPlan.map((item) => {
      if (item.day === dayNumber) {
        return {
          ...item,
          completed,
          completedAt: completed ? new Date().toISOString() : undefined,
        };
      }
      return item;
    }),
  };

  saveUserImprovementPlan(userId, updatedPlan);
  return updatedPlan;
}

/**
 * Updates personal notes within the user's saved improvement plan.
 */
export function updateImprovementPlanNotes(
  userId: string,
  notes: string
): PersonalizedImprovementPlan | null {
  if (!userId) return null;
  const currentPlan = getUserImprovementPlan(userId);
  if (!currentPlan) return null;

  const updatedPlan: PersonalizedImprovementPlan = {
    ...currentPlan,
    updatedAt: new Date().toISOString(),
    personalNotes: notes,
  };

  saveUserImprovementPlan(userId, updatedPlan);
  return updatedPlan;
}

/**
 * Clears the user's improvement plan.
 */
export function clearUserImprovementPlan(userId?: string | null): void {
  if (!userId) return;
  const key = getUserStorageKeys(userId).improvementPlan;
  try {
    localStorage.removeItem(key);
  } catch {}
}

/**
 * Retrieves the user's active or latest Interview Journey state.
 */
export function getUserInterviewJourney(userId?: string | null): InterviewJourneyState | null {
  if (!userId) return null;
  const key = getUserStorageKeys(userId).journey;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

/**
 * Saves the user's Interview Journey state strictly scoped to userId.
 */
export function saveUserInterviewJourney(userId: string, journey: InterviewJourneyState): void {
  if (!userId || !journey) return;
  const key = getUserStorageKeys(userId).journey;
  try {
    localStorage.setItem(key, JSON.stringify(journey));
  } catch (err) {
    console.error('Failed to save user interview journey:', err);
  }
}

/**
 * Clears the user's active Interview Journey state.
 */
export function clearUserInterviewJourney(userId?: string | null): void {
  if (!userId) return;
  const key = getUserStorageKeys(userId).journey;
  try {
    localStorage.removeItem(key);
  } catch {}
}

export interface HRMockProgressRecord {
  completedQuestionIds: string[];
  viewedAnswerIds: string[];
  practiceSpeechRecordings: Record<string, {
    transcript: string;
    score: number;
    feedback: string;
    timestamp: string;
  }>;
  targetCompany?: string;
  updatedAt: string;
}

/**
 * Retrieves the user's HR Mock Preparation progress (studied questions, speech practices, etc.)
 * Strictly kept separate from live Practice Interview session scorecards.
 */
export function getUserHRMockProgress(userId?: string | null): HRMockProgressRecord | null {
  const key = userId ? getUserStorageKeys(userId).hrMockProgress : 'careercurve:anonymous:hr_mock_progress';
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

/**
 * Saves the user's HR Mock Preparation progress.
 */
export function saveUserHRMockProgress(userId: string | undefined | null, progress: HRMockProgressRecord): void {
  const key = userId ? getUserStorageKeys(userId).hrMockProgress : 'careercurve:anonymous:hr_mock_progress';
  try {
    localStorage.setItem(key, JSON.stringify(progress));
  } catch (err) {
    console.error('Failed to save HR mock progress:', err);
  }
}

/**
 * Clears the user's HR Mock Preparation progress.
 */
export function clearUserHRMockProgress(userId?: string | null): void {
  const key = userId ? getUserStorageKeys(userId).hrMockProgress : 'careercurve:anonymous:hr_mock_progress';
  try {
    localStorage.removeItem(key);
  } catch {}
}

