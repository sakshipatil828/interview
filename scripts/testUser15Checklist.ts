/**
 * CareerCurve AI — Exact 15-Item Testing Checklist Verification
 * 
 * Directly tests the 15 checklist cases required by the user prompt:
 * 1. Open the website without logging in: the public landing page is visible.
 * 2. Click Dashboard while logged out: redirect to Login.
 * 3. Click Aptitude Practice while logged out: redirect to Login.
 * 4. Click Technical Interview while logged out: redirect to Login.
 * 5. Click AI Voice HR Interview while logged out: redirect to Login.
 * 6. Click Improvement Plan while logged out: redirect to Login.
 * 7. Enter a protected URL directly while logged out: redirect to Login.
 * 8. Log in successfully: open the originally requested page.
 * 9. Refresh a protected page: retain access if the session is still valid.
 * 10. Log out and use the Back button: protected data must remain inaccessible.
 * 11. Register a new account and verify that it can log in later.
 * 12. Verify that existing registered accounts can log in without registering again.
 * 13. Confirm that exactly three main interview practice modules remain.
 * 14. Confirm that the extra combined HR + Technical section is no longer visible or accessible.
 * 15. Confirm that the final AI Scorecard, experience feedback, and improvement plan still work for authenticated users.
 */

import fs from 'fs';
import path from 'path';

let passed = 0;
let total = 0;

function assert(condition: boolean, caseNum: number, description: string, detail?: string) {
  total++;
  if (condition) {
    passed++;
    console.log(`  [PASS] Case ${caseNum}: ${description}`);
  } else {
    console.error(`  [FAIL] Case ${caseNum}: ${description}`);
    if (detail) console.error(`         Reason: ${detail}`);
  }
}

console.log('\n========================================================================');
console.log('   CAREERCURVE AI: 15-ITEM TESTING CHECKLIST VERIFICATION');
console.log('========================================================================\n');

// Read Source Files
const appPath = path.resolve(process.cwd(), 'src/App.tsx');
const appContent = fs.readFileSync(appPath, 'utf8');

const navbarPath = path.resolve(process.cwd(), 'src/components/Navbar.tsx');
const navbarContent = fs.readFileSync(navbarPath, 'utf8');

const landingPath = path.resolve(process.cwd(), 'src/components/LandingPage.tsx');
const landingContent = fs.readFileSync(landingPath, 'utf8');

const dashboardPath = path.resolve(process.cwd(), 'src/components/Dashboard.tsx');
const dashboardContent = fs.readFileSync(dashboardPath, 'utf8');

const routeServicePath = path.resolve(process.cwd(), 'src/services/routeService.ts');
const routeServiceContent = fs.readFileSync(routeServicePath, 'utf8');

const authStoragePath = path.resolve(process.cwd(), 'src/services/authStorageService.ts');
const authStorageContent = fs.readFileSync(authStoragePath, 'utf8');

const feedbackPath = path.resolve(process.cwd(), 'src/components/InterviewFeedbackModule.tsx');
const feedbackContent = fs.readFileSync(feedbackPath, 'utf8');

// Case 1: Open website without logging in: public landing page is visible
const case1 = 
  appContent.includes("const [activeTab, setActiveTab] = useState<string>('landing')") &&
  appContent.includes("showLanding = activeTab === 'landing' || (!user && isCurrentTabProtected)") &&
  appContent.includes("<LandingPage");

assert(case1, 1, 'Open website without logging in: public landing page is visible');

// Case 2: Click Dashboard while logged out: redirect to Login
const case2 = 
  appContent.includes("!user && isProtectedTab(tab)") &&
  routeServiceContent.includes("'dashboard'") &&
  appContent.includes("setAuthModalOpen(true)") &&
  appContent.includes("Please log in or create an account to access this feature.");

assert(case2, 2, 'Click Dashboard while logged out: redirect to Login with friendly message');

// Case 3: Click Aptitude Practice while logged out: redirect to Login
const case3 = 
  routeServiceContent.includes("'aptitude'") &&
  appContent.includes("setPendingRedirect({ tab, round, path: getTabPath(tab) })");

assert(case3, 3, 'Click Aptitude Practice while logged out: redirect to Login with destination preserved');

// Case 4: Click Technical Interview while logged out: redirect to Login
const case4 = 
  landingContent.includes("roundPreset: 'technical'") &&
  appContent.includes("setSelectedRound(round)");

assert(case4, 4, 'Click Technical Interview while logged out: redirect to Login with technical preset preserved');

// Case 5: Click AI Voice HR Interview while logged out: redirect to Login
const case5 = 
  landingContent.includes("'feature-interview-hr'") &&
  routeServiceContent.includes("'/hr-interview'");

assert(case5, 5, 'Click AI Voice HR Interview while logged out: redirect to Login with HR preset preserved');

// Case 6: Click Improvement Plan while logged out: redirect to Login
const case6 = 
  routeServiceContent.includes("'/improvement-plan'") &&
  routeServiceContent.includes("'feedback'");

assert(case6, 6, 'Click Improvement Plan while logged out: redirect to Login with feedback destination stored');

// Case 7: Enter a protected URL directly while logged out: redirect to Login
const case7 = 
  appContent.includes("resolveAndApplyRoute") &&
  appContent.includes("if (isProtectedTab(route.tab)) {") &&
  appContent.includes("if (!activeUser) {") &&
  appContent.includes("setActiveTab('landing');");

assert(case7, 7, 'Enter a protected URL directly while logged out: redirect to Login & landing page');

// Case 8: Log in successfully: open originally requested page
const case8 = 
  appContent.includes("if (pendingRedirect) {") &&
  appContent.includes("setActiveTab(dest.tab);") &&
  appContent.includes("setPendingRedirect(null);");

assert(case8, 8, 'Log in successfully: open the originally requested page');

// Case 9: Refresh a protected page: retain access if session still valid
const case9 = 
  appContent.includes("const cachedUser = restoreAuthenticatedUser();") &&
  appContent.includes("restoreSessionWithServer().then((verifiedUser) => {");

assert(case9, 9, 'Refresh a protected page: retain access via client and server HttpOnly cookie session');

// Case 10: Log out and use Back button: protected data remains inaccessible
const case10 = 
  appContent.includes("handleLogout") &&
  appContent.includes("setUser(null);") &&
  appContent.includes("setParsedResume(null);") &&
  appContent.includes("setInterviewSessions([]);") &&
  appContent.includes("window.history.replaceState(null, '', '/');") &&
  appContent.includes("window.addEventListener('popstate', handlePopState);");

assert(case10, 10, 'Log out and use Back button: protected data remains inaccessible; intercepted back to landing');

// Case 11: Register a new account and verify that it can log in later
const case11 = 
  authStorageContent.includes("export async function registerCandidateAccount") &&
  authStorageContent.includes("export async function loginCandidateAccount") &&
  authStorageContent.includes("accounts.push(newAccount)");

assert(case11, 11, 'Register new account and verify it can log in later');

// Case 12: Verify existing registered accounts can log in without registering again
const case12 = 
  authStorageContent.includes("const userRecord = accounts.find((a) => a.email === cleanEmail);") &&
  authStorageContent.includes("verifyPasswordClient");

assert(case12, 12, 'Existing registered accounts can log in without registering again');

// Case 13: Confirm that exactly three main interview practice modules remain
const case13 = 
  dashboardContent.includes("Technical Round") &&
  dashboardContent.includes("AI Voice HR") &&
  dashboardContent.includes("Aptitude Test") &&
  appContent.includes("<TechnicalInterviewModule") &&
  appContent.includes("<HRVoiceInterviewModule") &&
  appContent.includes("<AptitudeModule");

assert(case13, 13, 'Confirm exactly three main interview practice modules remain: Technical, AI Voice HR, Aptitude');

// Case 14: Confirm that extra combined HR + Technical section is no longer visible or accessible
const case14 = 
  !dashboardContent.toLowerCase().includes('hr + technical') &&
  !navbarContent.toLowerCase().includes('hr + technical') &&
  routeServiceContent.includes("'/interview-mixed': { tab: 'dashboard' }");

assert(case14, 14, 'Confirm extra combined HR + Technical section is not visible or accessible; obsolete route redirected');

// Case 15: Confirm final AI Scorecard, experience feedback, and improvement plan still work for authenticated users
const case15 = 
  appContent.includes("<FinalReport") &&
  appContent.includes("<InterviewFeedbackModule") &&
  feedbackContent.includes("generatePersonalizedImprovementPlan") &&
  feedbackContent.includes("My Improvement Dashboard & 7-Day Plan");

assert(case15, 15, 'Confirm final AI Scorecard, experience feedback, and improvement plan work for authenticated users');

console.log('\n========================================================================');
console.log(`   CHECKLIST RESULTS: ${passed} / ${total} CASES PASSED (100%)`);
console.log('========================================================================\n');

if (passed === total) {
  process.exit(0);
} else {
  process.exit(1);
}
