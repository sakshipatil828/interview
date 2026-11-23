/**
 * Centralized Route & URL Navigation Service
 * 
 * Handles URL parsing, canonical route generation, protected tab enforcement,
 * and direct URL deep-linking support for both pathname and hash formats.
 */

export type InterviewRoundType = 'technical' | 'hr' | 'aptitude' | 'communication';

export interface RouteResolution {
  tab: string;
  round?: InterviewRoundType;
  path: string;
  isLogin?: boolean;
  isRegister?: boolean;
}

// All protected tabs that require an authenticated user session
export const PROTECTED_TABS: string[] = [
  'dashboard',
  'resume',
  'interview',
  'communication',
  'aptitude',
  'telemetry',
  'report',
  'feedback',
  'docs',
];

// Tab ID to Canonical Path mapping
export const TAB_PATHS: Record<string, string> = {
  landing: '/',
  dashboard: '/dashboard',
  resume: '/resume-parser',
  interview: '/ai-interview',
  communication: '/communication',
  aptitude: '/aptitude',
  telemetry: '/vision-audio',
  report: '/scorecard',
  feedback: '/improvement-plan',
  docs: '/project-docs',
};

// Path aliases to internal tab IDs
const PATH_ALIASES: Record<string, { tab: string; round?: InterviewRoundType }> = {
  '/': { tab: 'landing' },
  '/home': { tab: 'landing' },
  '/landing': { tab: 'landing' },
  '/dashboard': { tab: 'dashboard' },
  '/resume-parser': { tab: 'resume' },
  '/resume': { tab: 'resume' },
  '/aptitude': { tab: 'aptitude' },
  '/aptitude-test': { tab: 'aptitude' },
  '/ai-interview': { tab: 'interview' },
  '/interview': { tab: 'interview' },
  '/interview-rounds': { tab: 'interview' },
  '/rounds': { tab: 'interview' },
  '/technical-interview': { tab: 'interview', round: 'technical' },
  '/hr-interview': { tab: 'interview', round: 'hr' },
  '/communication': { tab: 'interview', round: 'communication' },
  '/communication-round': { tab: 'interview', round: 'communication' },
  '/communication-interview': { tab: 'interview', round: 'communication' },
  // Obsolete combined interview paths redirected to dashboard
  '/interview-mixed': { tab: 'dashboard' },
  '/combined-interview': { tab: 'dashboard' },
  '/hr-technical': { tab: 'dashboard' },
  '/technical-hr': { tab: 'dashboard' },
  '/mixed-interview': { tab: 'dashboard' },
  '/vision-audio': { tab: 'telemetry' },
  '/telemetry': { tab: 'telemetry' },
  '/vision': { tab: 'telemetry' },
  '/scorecard': { tab: 'report' },
  '/report': { tab: 'report' },
  '/improvement-plan': { tab: 'feedback' },
  '/feedback': { tab: 'feedback' },
  '/plan': { tab: 'feedback' },
  '/project-docs': { tab: 'docs' },
  '/docs': { tab: 'docs' },
};

/**
 * Returns canonical browser path for a tab ID.
 */
export function getTabPath(tab: string): string {
  return TAB_PATHS[tab] || '/';
}

/**
 * Checks if a tab ID is protected by the authentication guard.
 */
export function isProtectedTab(tab: string): boolean {
  return PROTECTED_TABS.includes(tab);
}

/**
 * Parses the current browser window location (pathname and hash) into a RouteResolution.
 */
export function parseCurrentRoute(): RouteResolution {
  if (typeof window === 'undefined') {
    return { tab: 'landing', path: '/' };
  }

  // 1. Check pathname (normalized to lowercase without trailing slashes)
  const pathname = window.location.pathname.toLowerCase().replace(/\/+$/, '') || '/';

  // Direct auth action paths
  if (pathname === '/login') {
    return { tab: 'landing', path: '/', isLogin: true };
  }
  if (pathname === '/register' || pathname === '/signup') {
    return { tab: 'landing', path: '/', isRegister: true };
  }

  // 2. Check hash (if used e.g. #/improvement-plan or #improvement-plan)
  const rawHash = window.location.hash.toLowerCase().replace(/^#\/?/, '').replace(/\/+$/, '');
  const hashPath = rawHash ? `/${rawHash}` : '';

  if (hashPath === '/login') {
    return { tab: 'landing', path: '/', isLogin: true };
  }
  if (hashPath === '/register' || hashPath === '/signup') {
    return { tab: 'landing', path: '/', isRegister: true };
  }

  // Try matching pathname first
  const pathMatch = PATH_ALIASES[pathname];
  if (pathMatch && pathname !== '/') {
    return {
      tab: pathMatch.tab,
      round: pathMatch.round,
      path: pathname,
    };
  }

  // Try matching hash next
  if (hashPath) {
    const hashMatch = PATH_ALIASES[hashPath];
    if (hashMatch) {
      return {
        tab: hashMatch.tab,
        round: hashMatch.round,
        path: hashPath,
      };
    }
  }

  // Fallback to landing route
  return { tab: 'landing', path: '/' };
}
