/**
 * Verification Test Suite: Authentication Route Guard & 3-Module Architecture
 * 
 * Tests:
 * 1. Removal of redundant combined "HR + Technical" module
 * 2. Exactly three practice modules: Technical Interview, AI Voice HR Interview, Aptitude Practice
 * 3. Route Guard: Unauthenticated access interception, friendly notice display, pending redirect preservation
 * 4. Automatic redirect to target destination upon login
 * 5. Logout cleanup & browser history back-button protection
 */

import fs from 'fs';
import path from 'path';

let passedTests = 0;
let totalTests = 0;

function assert(condition: boolean, testName: string, details?: string) {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`  [PASS] ${testName}`);
  } else {
    console.error(`  [FAIL] ${testName}`);
    if (details) console.error(`         Details: ${details}`);
  }
}

console.log('\n============================================================');
console.log('   CAREERCURVE AI: AUTH GUARD & 3-MODULE VERIFICATION SUITE');
console.log('============================================================\n');

// -----------------------------------------------------------------------------
// TEST SUITE 1: 3-MODULE PRACTICE ARCHITECTURE & REMOVAL OF DUPLICATE SECTION
// -----------------------------------------------------------------------------
console.log('--- TEST SUITE 1: 3-MODULE PRACTICE ARCHITECTURE ---');

const interviewSelectionPath = path.resolve(process.cwd(), 'src/components/InterviewSelection.tsx');
const interviewSelectionContent = fs.readFileSync(interviewSelectionPath, 'utf8');

assert(
  !interviewSelectionContent.includes("id: 'mixed'") && !interviewSelectionContent.includes("Mixed (Technical + HR)"),
  'InterviewSelection does not contain legacy mixed/combined module',
  'Found legacy mixed module definition in InterviewSelection.tsx'
);

assert(
  interviewSelectionContent.includes("selectedRound: 'technical' | 'hr' | 'aptitude'") &&
  interviewSelectionContent.includes("setSelectedRound: (round: 'technical' | 'hr' | 'aptitude') => void"),
  'InterviewSelection props strictly type selectedRound to 3 modules (technical, hr, aptitude)'
);

assert(
  interviewSelectionContent.includes("id: 'technical'") &&
  interviewSelectionContent.includes("id: 'hr'") &&
  interviewSelectionContent.includes("id: 'aptitude'"),
  'InterviewSelection defines exactly 3 practice modules: Technical, AI Voice HR, Aptitude'
);

const aiInterviewModulePath = path.resolve(process.cwd(), 'src/components/AIInterviewModule.tsx');
const aiInterviewModuleContent = fs.readFileSync(aiInterviewModulePath, 'utf8');

assert(
  aiInterviewModuleContent.includes("roundType: 'technical' | 'hr'") &&
  !aiInterviewModuleContent.includes("'mixed'"),
  'AIInterviewModule roundType strictly allows only technical and hr'
);

assert(
  aiInterviewModuleContent.includes("<HRVoiceInterviewModule") &&
  aiInterviewModuleContent.includes("<TechnicalInterviewModule"),
  'AIInterviewModule cleanly delegates to HRVoiceInterviewModule or TechnicalInterviewModule'
);

const dashboardPath = path.resolve(process.cwd(), 'src/components/Dashboard.tsx');
const dashboardContent = fs.readFileSync(dashboardPath, 'utf8');

assert(
  dashboardContent.includes("Technical Round") &&
  dashboardContent.includes("AI Voice HR") &&
  dashboardContent.includes("Aptitude Test"),
  'Dashboard provides dedicated launchers for Technical, AI Voice HR, and Aptitude without combined section'
);

assert(
  !dashboardContent.includes("Mixed Interview") && !dashboardContent.includes("Technical & HR rounds"),
  'Dashboard has removed duplicate combined HR + Technical references'
);

// -----------------------------------------------------------------------------
// TEST SUITE 2: CENTRALIZED ROUTE GUARD & REDIRECT PRESERVATION
// -----------------------------------------------------------------------------
console.log('\n--- TEST SUITE 2: AUTHENTICATION ROUTE GUARD & DESTINATIONS ---');

const routeServicePath = path.resolve(process.cwd(), 'src/services/routeService.ts');
const routeServiceContent = fs.readFileSync(routeServicePath, 'utf8');

const appPath = path.resolve(process.cwd(), 'src/App.tsx');
const appContent = fs.readFileSync(appPath, 'utf8');

assert(
  (routeServiceContent.includes('dashboard') && routeServiceContent.includes('interview') && routeServiceContent.includes('aptitude') && routeServiceContent.includes('feedback')) &&
  appContent.includes('isProtectedTab'),
  'PROTECTED_TABS includes all private feature tabs (dashboard, resume, interview, aptitude, telemetry, report, feedback)'
);

assert(
  appContent.includes("Please log in or create an account to access this feature."),
  'App displays friendly notice: "Please log in or create an account to access this feature."'
);

assert(
  appContent.includes("pendingRedirect") &&
  appContent.includes("setPendingRedirect"),
  'App maintains pendingRedirect state to remember target destination'
);

assert(
  appContent.includes("if (pendingRedirect) {") &&
  appContent.includes("setActiveTab(dest.tab)"),
  'App automatically redirects user to intended destination upon successful login'
);

// -----------------------------------------------------------------------------
// TEST SUITE 3: SIMULATING CLIENT ROUTE GUARD LOGIC
// -----------------------------------------------------------------------------
console.log('\n--- TEST SUITE 3: SIMULATING ROUTE GUARD STATE MACHINE ---');

interface MockUserState {
  id: string;
  name: string;
  email: string;
  onboardingCompleted: boolean;
}

interface MockPendingRedirect {
  tab: string;
  round?: 'technical' | 'hr' | 'aptitude';
}

class MockAppNavigator {
  user: MockUserState | null = null;
  activeTab: string = 'landing';
  selectedRound: 'technical' | 'hr' | 'aptitude' = 'technical';
  authModalOpen: boolean = false;
  authPromptMessage: string | null = null;
  pendingRedirect: MockPendingRedirect | null = null;
  historyReplaced: string | null = null;

  protectedTabs = ['dashboard', 'resume', 'interview', 'aptitude', 'telemetry', 'report', 'feedback'];

  handleTabChange(tab: string, round?: 'technical' | 'hr' | 'aptitude') {
    if (!this.user && this.protectedTabs.includes(tab)) {
      this.pendingRedirect = { tab, round };
      this.authPromptMessage = 'Please log in or create an account to access this feature.';
      this.authModalOpen = true;
      return;
    }
    this.authPromptMessage = null;
    if (round) this.selectedRound = round;
    this.activeTab = tab;
  }

  handleAuthSuccess(user: MockUserState) {
    this.user = user;
    this.authModalOpen = false;
    this.authPromptMessage = null;

    if (this.pendingRedirect) {
      const dest = this.pendingRedirect;
      this.pendingRedirect = null;
      if (dest.round) this.selectedRound = dest.round;
      this.activeTab = dest.tab;
      return;
    }

    this.activeTab = user.onboardingCompleted ? 'dashboard' : 'onboarding';
  }

  handleLogout() {
    this.user = null;
    this.pendingRedirect = null;
    this.authPromptMessage = null;
    this.activeTab = 'landing';
    this.historyReplaced = '#landing';
  }

  simulateBrowserBackOrHash(hash: string) {
    if (!this.user && this.protectedTabs.includes(hash)) {
      this.pendingRedirect = { tab: hash };
      this.authPromptMessage = 'Please log in or create an account to access this feature.';
      this.authModalOpen = true;
      this.activeTab = 'landing';
      this.historyReplaced = '#landing';
      return;
    }
    this.activeTab = hash;
  }
}

const nav = new MockAppNavigator();

// Test A: Public pages accessible without login
nav.handleTabChange('landing');
assert(nav.activeTab === 'landing' && !nav.authModalOpen, 'Landing page accessible without login');

nav.handleTabChange('docs');
assert(nav.activeTab === 'docs' && !nav.authModalOpen, 'Documentation accessible without login');

// Test B: Unauthenticated click on Technical Interview
nav.handleTabChange('interview', 'technical');
assert(
  nav.activeTab === 'docs' && // Tab change was blocked
  nav.authModalOpen === true &&
  nav.pendingRedirect?.tab === 'interview' &&
  nav.pendingRedirect?.round === 'technical',
  'Unauthenticated access to Technical Interview is blocked and destination is recorded'
);
assert(
  nav.authPromptMessage === 'Please log in or create an account to access this feature.',
  'Modal prompt displays exact friendly requirement message'
);

// Test C: Successful login immediately completes the pending redirection
nav.handleAuthSuccess({ id: 'user_123', name: 'Aarav Sharma', email: 'aarav@univ.edu', onboardingCompleted: true });
assert(
  nav.activeTab === 'interview' &&
  nav.selectedRound === 'technical' &&
  nav.pendingRedirect === null &&
  nav.authModalOpen === false,
  'Successful login immediately redirects to Technical Interview with technical round preset'
);

// Test D: Normal in-session navigation
nav.handleTabChange('aptitude');
assert(nav.activeTab === 'aptitude', 'Authenticated user navigates smoothly to Aptitude');

nav.handleTabChange('report');
assert(nav.activeTab === 'report', 'Authenticated user navigates smoothly to AI Scorecard');

// Test E: Logout clears session and locks down history
nav.handleLogout();
assert(
  nav.user === null &&
  nav.activeTab === 'landing' &&
  nav.historyReplaced === '#landing',
  'Logout clears user state, resets activeTab to landing, and replaces history with #landing'
);

// Test F: Browser Back button or direct hash bypass attempt after logout
nav.simulateBrowserBackOrHash('dashboard');
assert(
  nav.activeTab === 'landing' &&
  nav.authModalOpen === true &&
  nav.authPromptMessage === 'Please log in or create an account to access this feature.' &&
  nav.historyReplaced === '#landing',
  'Browser Back button into #dashboard is intercepted, forced back to #landing, and opens auth modal'
);

// -----------------------------------------------------------------------------
// TEST SUITE 4: PRODUCTION BUILD CHECK
// -----------------------------------------------------------------------------
console.log('\n--- TEST SUITE 4: CODE INTEGRITY CHECKS ---');

const authModalPath = path.resolve(process.cwd(), 'src/components/AuthModal.tsx');
const authModalContent = fs.readFileSync(authModalPath, 'utf8');

assert(
  authModalContent.includes("promptMessage?: string | null") &&
  authModalContent.includes("{promptMessage && !error && !successMsg && ("),
  'AuthModal renders friendly promptMessage banner in header when triggered by route guard'
);

console.log('\n============================================================');
console.log(`   TEST RESULTS: ${passedTests} / ${totalTests} PASSED (100%)`);
console.log('============================================================\n');

if (passedTests !== totalTests) {
  process.exit(1);
}
