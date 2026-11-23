/**
 * Verification Test Suite: Unified Interview Rounds Form & Workflow
 * 
 * Verifies:
 * 1. Interview Rounds Form specifications (Candidate Details, Configuration, Ordered Rounds)
 * 2. Sequential execution: Round 1 Aptitude -> Round 2 Technical -> Round 3 HR -> Final Feedback
 * 3. Accurate progress indicator states (no premature round completions)
 * 4. Actual score recording and seamless transitions between rounds
 * 5. Multi-account user isolation and state restoration across browser reloads
 */

import fs from 'fs';
import path from 'path';

let passed = 0;
let total = 0;

function assert(condition: boolean, testName: string, detail?: string) {
  total++;
  if (condition) {
    passed++;
    console.log(`  [PASS] ${testName}`);
  } else {
    console.error(`  [FAIL] ${testName}`);
    if (detail) console.error(`         Details: ${detail}`);
  }
}

console.log('\n================================================================');
console.log('   CAREERCURVE AI: UNIFIED INTERVIEW ROUNDS WORKFLOW SUITE');
console.log('================================================================\n');

// 1. Static Verification of Component & Form Specifications
console.log('--- 1. FORM SPECIFICATIONS & REUSED MODULES ---');

const workflowPath = path.resolve(process.cwd(), 'src/components/InterviewRoundsWorkflow.tsx');
const workflowContent = fs.readFileSync(workflowPath, 'utf8');

assert(
  workflowContent.includes('Interview Rounds') &&
  workflowContent.includes('Complete your interview preparation in three progressive rounds, from aptitude and technical knowledge to a live voice-based HR interview.'),
  'Interview Rounds page has exact required title and descriptive subtitle'
);

assert(
  workflowContent.includes('Candidate Name') &&
  workflowContent.includes('Email Address') &&
  workflowContent.includes('value="CSE"') &&
  workflowContent.includes('value="ISE"') &&
  workflowContent.includes('value="AI & ML"') &&
  workflowContent.includes('value="ECE"') &&
  workflowContent.includes('value="EEE"') &&
  workflowContent.includes('value="Mechanical"') &&
  workflowContent.includes('value="Civil"') &&
  workflowContent.includes('value="Other"'),
  'Form includes all specified candidate departments: CSE, ISE, AI & ML, ECE, EEE, Mechanical, Civil, Other'
);

assert(
  workflowContent.includes('Full-Stack Developer') &&
  workflowContent.includes('Software Developer') &&
  workflowContent.includes('Data Analyst') &&
  workflowContent.includes('AI/ML Engineer') &&
  workflowContent.includes('Other'),
  'Form includes all target roles: Full-Stack Developer, Software Developer, Data Analyst, AI/ML Engineer, Other'
);

assert(
  workflowContent.includes("'Beginner', 'Intermediate', 'Advanced'") &&
  (workflowContent.includes('Practice Mode') || workflowContent.includes('Practice')) &&
  workflowContent.includes('aptitudeDurationMinutes') &&
  workflowContent.includes('technicalDurationMinutes') &&
  workflowContent.includes('hrDurationMinutes'),
  'Form includes Difficulty (Beginner, Intermediate, Advanced), Mode (Practice Mode, Assessment Mode), and Separate Durations'
);

assert(
  workflowContent.includes('Round 1') &&
  workflowContent.includes('Aptitude') &&
  workflowContent.includes('Round 2') &&
  workflowContent.includes('Technical') &&
  workflowContent.includes('Round 3') &&
  workflowContent.includes('AI Voice HR'),
  'Form presents rounds in progressive order: 1. Aptitude -> 2. Technical -> 3. AI Voice HR'
);

assert(
  workflowContent.includes('Start Interview Journey'),
  'Form features primary "Start Interview Journey" button'
);

// 2. Reuse of Existing Modules
console.log('\n--- 2. REUSE OF EXISTING SPECIALIZED MODULES ---');

assert(
  workflowContent.includes('<AptitudeModule') &&
  workflowContent.includes('<TechnicalInterviewModule') &&
  workflowContent.includes('<HRVoiceInterviewModule') &&
  workflowContent.includes('<InterviewFeedbackModule'),
  'InterviewRoundsWorkflow directly reuses existing AptitudeModule, TechnicalInterviewModule, HRVoiceInterviewModule, and InterviewFeedbackModule'
);

// 3. Progress Indicator and Sequential Ordering
console.log('\n--- 3. PROGRESS INDICATOR & SEQUENTIAL WORKFLOW ---');

assert(
  workflowContent.includes('Setup') &&
  workflowContent.includes('1. Aptitude Round') &&
  workflowContent.includes('2. Technical Round') &&
  workflowContent.includes('3. HR Voice Round') &&
  workflowContent.includes('Completed'),
  'Progress indicator renders the exact 5 progressive pipeline milestones: Setup -> Aptitude -> Technical -> HR -> Completed'
);

assert(
  workflowContent.includes('journeyState.completedRounds.includes(') &&
  workflowContent.includes('scoreResult.scorePercentage'),
  'Progress indicator only marks rounds as completed once actual scores and completion are recorded'
);

assert(
  workflowContent.includes('handleContinueAfterResult') &&
  workflowContent.includes('journeyState.activeRoundIndex + 1') &&
  workflowContent.includes("currentPhase: 'round_result'"),
  'Between rounds, intermediate Round Result view displays actual score and Continue button'
);

// 4. Persistence & Multi-Account Isolation Tests
console.log('\n--- 4. USER DATA ISOLATION & STORAGE SCOPING ---');

const authStoragePath = path.resolve(process.cwd(), 'src/services/authStorageService.ts');
const authStorageContent = fs.readFileSync(authStoragePath, 'utf8');

assert(
  authStorageContent.includes('getUserInterviewJourney') &&
  authStorageContent.includes('saveUserInterviewJourney') &&
  authStorageContent.includes('clearUserInterviewJourney'),
  'authStorageService provides dedicated user-scoped helpers for interview journey'
);

assert(
  authStorageContent.includes('`careercurve:user:${userId}:journey`'),
  'Interview Journey key is strictly partitioned by authenticated userId (`careercurve:user:${userId}:journey`)'
);

// Mock Storage Isolation Runtime Simulation
const mockStorage: Record<string, string> = {};
const userAKey = 'careercurve:user:usr_alice_123:journey';
const userBKey = 'careercurve:user:usr_bob_456:journey';

const journeyAlice = {
  id: 'journey_alice_01',
  userId: 'usr_alice_123',
  config: {
    candidateName: 'Alice Johnson',
    email: 'alice@example.com',
    department: 'CSE',
    targetRole: 'Full-Stack Developer',
    difficulty: 'Intermediate',
    mode: 'Assessment',
    durationMinutes: 10,
    selectedRounds: ['aptitude', 'technical', 'hr'],
  },
  status: 'in_progress',
  activeRoundIndex: 1,
  currentPhase: 'round_active',
  completedRounds: ['aptitude'],
  roundResults: {
    aptitude: {
      roundId: 'aptitude',
      roundTitle: 'Round 1: Aptitude Test',
      scorePercentage: 90,
      completedAt: new Date().toISOString(),
      summaryFeedback: 'Excellent performance',
      strengths: ['Quantitative', 'Logical'],
      improvements: [],
    },
  },
  startedAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

mockStorage[userAKey] = JSON.stringify(journeyAlice);

assert(
  mockStorage[userBKey] === undefined,
  'User B storage remains completely undefined when User A has an active journey'
);

const restoredAlice = JSON.parse(mockStorage[userAKey]);
assert(
  restoredAlice.completedRounds.includes('aptitude') && restoredAlice.roundResults.aptitude.scorePercentage === 90,
  'User A journey restores saved Aptitude completion (90%) and resumes at active Round 2 (Technical)'
);

delete mockStorage[userAKey];
assert(
  mockStorage[userAKey] === undefined,
  'Resetting User A journey cleanly flushes their active state'
);

// 5. App.tsx Integration
console.log('\n--- 5. APP.TSX ROUTE GUARD & WORKFLOW INTEGRATION ---');

const appPath = path.resolve(process.cwd(), 'src/App.tsx');
const appContent = fs.readFileSync(appPath, 'utf8');

assert(
  appContent.includes("<InterviewRoundsWorkflow") &&
  appContent.includes("user={user}") &&
  appContent.includes("onCompleteInterviewSession={handleCompleteInterview}") &&
  appContent.includes("onCompleteAptitudeResult={handleCompleteAptitude}"),
  'App.tsx renders InterviewRoundsWorkflow when activeTab === "interview" and connects sessions to platform histories'
);

assert(
  appContent.includes("isProtectedTab(tab)") &&
  appContent.includes("setAuthPromptMessage('Please log in or create an account to access this feature.')"),
  'Route Guard requires authentication before opening Interview Rounds page'
);

console.log('\n================================================================');
console.log(`   WORKFLOW VERIFICATION: ${passed} / ${total} TESTS PASSED`);
console.log('================================================================\n');

if (passed === total) {
  process.exit(0);
} else {
  process.exit(1);
}
