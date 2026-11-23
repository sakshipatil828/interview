/**
 * CareerCurve AI Interview Preparation Platform
 * Automated Verification Suite for Interview Experience & Improvement Feedback Module
 */

import { 
  StudentInterviewFeedback, 
  PersonalizedImprovementPlan 
} from '../src/types/feedback';
import { 
  generateLocalImprovementPlan, 
  generatePersonalizedImprovementPlan 
} from '../src/services/feedbackAnalysisService';
import { 
  getUserFeedback, 
  saveUserFeedback, 
  clearUserFeedback, 
  getUserImprovementPlan, 
  saveUserImprovementPlan, 
  toggleImprovementPlanTask, 
  updateImprovementPlanNotes,
  getUserStorageKeys
} from '../src/services/authStorageService';
import { InterviewSession, AptitudeResult, ParsedResume } from '../src/types';

// Mock localStorage for node.js environment if not present
if (typeof localStorage === 'undefined' || !localStorage) {
  const store: Record<string, string> = {};
  (globalThis as any).localStorage = {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, val: string) => { store[key] = val; },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { Object.keys(store).forEach(k => delete store[k]); },
  };
}

console.log('================================================================');
console.log('CAREERCURVE AI: INTERVIEW EXPERIENCE & IMPROVEMENT FEEDBACK TESTS');
console.log('================================================================\n');

let allTestsPassed = true;

// Mock Candidate Resume
const mockResume: ParsedResume = {
  fullName: 'Priya Sharma',
  jobTitle: 'Software Engineer',
  email: 'priya.sharma@example.edu',
  phone: '+91 91234 56789',
  github: 'https://github.com/priyasharma',
  linkedin: 'https://linkedin.com/in/priyasharma',
  department: 'Computer Science & Engineering',
  summary: 'Backend engineer focused on distributed caching and REST API architecture.',
  rawSkillsList: ['Java', 'Spring Boot', 'Redis', 'PostgreSQL', 'Docker'],
  skills: [],
  education: [
    {
      college: 'Indian Institute of Information Technology',
      degree: 'B.Tech',
      branch: 'Computer Science',
      graduationYear: '2024',
      cgpa: '8.9'
    }
  ],
  experience: [],
  projects: [
    {
      title: 'High-Concurrency Ticket Booking System',
      technologies: ['Java', 'Spring Boot', 'Redis'],
      description: 'Engineered optimistic locking and distributed cache queues.'
    }
  ],
  certifications: [],
  languages: ['English', 'Hindi'],
  interests: ['System Architecture'],
  atsScore: 92,
  resumeScore: 90,
  matchRank: 'Top 5%',
  missingSkills: [],
  strongSkills: ['Java', 'Redis'],
  suggestedTechnologies: [],
  careerSuggestions: [],
  uploadedAt: new Date().toISOString(),
  fileName: 'priya_resume.pdf'
};

// ============================================================================
// TEST 1: User Data Isolation & Namespaced Storage
// ============================================================================
console.log('----------------------------------------------------------------');
console.log('TEST 1: User Data Isolation & Storage Scoping');
console.log('----------------------------------------------------------------');

const userAId = 'usr_test_user_a_101';
const userBId = 'usr_test_user_b_202';

const feedbackUserA: StudentInterviewFeedback = {
  id: 'fb_user_a_001',
  userId: userAId,
  submittedAt: new Date().toISOString(),
  experienceRating: 'Good',
  mostChallengingPhase: 'HR Interview',
  biggestDifficulty: 'I was nervous while answering.',
  confidenceRating: 3,
  improvementGoals: ['Confidence and nervousness management', 'Speaking fluency'],
  mostHelpfulPart: 'Sarah Chen AI Voice Interviewer',
  suggestionsForImprovement: 'Add more behavioral prompts',
  voiceTranscript: 'I found the timer slightly intimidating but the instant STAR feedback helped immensely.',
  voiceTranscriptIncluded: true,
};

const feedbackUserB: StudentInterviewFeedback = {
  id: 'fb_user_b_002',
  userId: userBId,
  submittedAt: new Date().toISOString(),
  experienceRating: 'Difficult',
  mostChallengingPhase: 'Technical Interview',
  biggestDifficulty: 'I did not know some technical answers.',
  confidenceRating: 2,
  improvementGoals: ['Technical knowledge'],
  voiceTranscriptIncluded: false,
};

saveUserFeedback(userAId, feedbackUserA);
saveUserFeedback(userBId, feedbackUserB);

const loadedUserA = getUserFeedback(userAId);
const loadedUserB = getUserFeedback(userBId);

if (loadedUserA?.id === 'fb_user_a_001' && loadedUserB?.id === 'fb_user_b_002') {
  console.log('✓ User A and User B feedback saved and retrieved under distinct scoped keys.');
} else {
  console.error('❌ User feedback retrieval failed or cross-account leakage detected.');
  allTestsPassed = false;
}

if (loadedUserA?.biggestDifficulty !== loadedUserB?.biggestDifficulty) {
  console.log('✓ User A and User B maintain completely isolated difficulty records.');
} else {
  console.error('❌ Data cross-contamination detected between User A and User B.');
  allTestsPassed = false;
}

// Clear User A and ensure User B is unpolluted
clearUserFeedback(userAId);
if (getUserFeedback(userAId) === null && getUserFeedback(userBId) !== null) {
  console.log('✓ Clearing User A feedback does NOT affect User B records.');
} else {
  console.error('❌ User clear operation leaked into other user account.');
  allTestsPassed = false;
}

// Re-save User A for subsequent tests
saveUserFeedback(userAId, feedbackUserA);

// ============================================================================
// TEST 2: Underestimated Competence (High Score vs. Low Self-Confidence)
// ============================================================================
console.log('\n----------------------------------------------------------------');
console.log('TEST 2: Underestimated Competence / Impostor Phenomenon Detection');
console.log('----------------------------------------------------------------');

// Student reports nervousness and confidence 2/5, but scored 88% and 86%!
const nervousNessFeedback: StudentInterviewFeedback = {
  id: 'fb_nervous_01',
  userId: userAId,
  submittedAt: new Date().toISOString(),
  experienceRating: 'Difficult',
  mostChallengingPhase: 'HR Interview',
  biggestDifficulty: 'I was nervous while answering.',
  confidenceRating: 2, // Low confidence
  improvementGoals: ['Confidence and nervousness management', 'Speaking fluency'],
  voiceTranscript: 'I was shaking during the first question because I feared messing up.',
  voiceTranscriptIncluded: true,
};

const strongMockSessions: InterviewSession[] = [
  {
    id: 'session_strong_01',
    type: 'hr',
    date: 'Oct 13, 2026',
    difficulty: 'Intermediate',
    answers: [],
    technicalScore: 88,
    hrScore: 86,
    aptitudeScore: 90,
    overallScore: 88, // Strong objective score!
    readinessPercentage: 88,
    completed: true,
  }
];

const planScenario1 = generateLocalImprovementPlan(
  nervousNessFeedback,
  strongMockSessions,
  [],
  mockResume,
  userAId
);

console.log('- Analysis Mode:', planScenario1.performanceInsights.analysisMode);
console.log('- Confidence Mismatch Analysis:');
console.log(`  "${planScenario1.performanceInsights.confidenceMismatchAnalysis}"`);
console.log('- Top Priority 1:', planScenario1.topPriorities[0]?.skill);
console.log('- Recommended Next Phase:', planScenario1.nextPracticeSession.title);

if (planScenario1.performanceInsights.confidenceMismatchAnalysis.includes('Underestimated Competence')) {
  console.log('✓ Correctly identified Underestimated Competence (nervousness despite strong objective score).');
} else {
  console.error('❌ Failed to detect confidence mismatch for nervous candidate with high score.');
  allTestsPassed = false;
}

// Ensure it didn't falsely label their technical knowledge as weak
if (!planScenario1.topPriorities[0]?.skill.toLowerCase().includes('technical knowledge is weak')) {
  console.log('✓ Appropriately focused on nervousness and delivery rather than falsely penalizing technical ability.');
} else {
  console.error('❌ Incorrectly labeled technical knowledge as weak.');
  allTestsPassed = false;
}

// ============================================================================
// TEST 3: Technical Knowledge Gap (High Confidence vs. Low Technical Score)
// ============================================================================
console.log('\n----------------------------------------------------------------');
console.log('TEST 3: Technical Knowledge Gap Detection');
console.log('----------------------------------------------------------------');

const overconfidentFeedback: StudentInterviewFeedback = {
  id: 'fb_overconf_02',
  userId: userAId,
  submittedAt: new Date().toISOString(),
  experienceRating: 'Good',
  mostChallengingPhase: 'Technical Interview',
  biggestDifficulty: 'I did not know some technical answers.',
  confidenceRating: 5, // High confidence!
  improvementGoals: ['Technical knowledge', 'Time management'],
  voiceTranscriptIncluded: false,
};

const weakTechMockSessions: InterviewSession[] = [
  {
    id: 'session_weak_tech_01',
    type: 'technical',
    date: 'Oct 13, 2026',
    difficulty: 'Intermediate',
    answers: [],
    technicalScore: 56, // Low technical score!
    hrScore: 84,
    aptitudeScore: 80,
    overallScore: 65,
    readinessPercentage: 65,
    completed: true,
  }
];

const planScenario2 = generateLocalImprovementPlan(
  overconfidentFeedback,
  weakTechMockSessions,
  [],
  mockResume,
  userAId
);

console.log('- Confidence Mismatch Analysis:');
console.log(`  "${planScenario2.performanceInsights.confidenceMismatchAnalysis}"`);
console.log('- Top Priority 1:', planScenario2.topPriorities[0]?.skill);
console.log('- Recommended Next Phase:', planScenario2.nextPracticeSession.title);

if (planScenario2.performanceInsights.confidenceMismatchAnalysis.includes('High Confidence with Objective Knowledge Gaps')) {
  console.log('✓ Correctly diagnosed high confidence with technical knowledge gap.');
} else {
  console.error('❌ Failed to diagnose overconfidence with weak technical score.');
  allTestsPassed = false;
}

if (planScenario2.nextPracticeSession.recommendedPhase === 'technical') {
  console.log('✓ Correctly recommended Technical Interview Round as the next priority session.');
} else {
  console.error(`❌ Expected recommended phase 'technical', got '${planScenario2.nextPracticeSession.recommendedPhase}'`);
  allTestsPassed = false;
}

// ============================================================================
// TEST 4: Self-Reported Fallback When No Interview History Exists
// ============================================================================
console.log('\n----------------------------------------------------------------');
console.log('TEST 4: Self-Reported Trajectory Fallback (No Scorecard Available)');
console.log('----------------------------------------------------------------');

const planScenario3 = generateLocalImprovementPlan(
  nervousNessFeedback,
  [], // No interview sessions
  [], // No aptitude results
  mockResume,
  userAId
);

console.log('- Scorecard Available:', planScenario3.performanceInsights.isScorecardAvailable);
console.log('- Analysis Mode:', planScenario3.performanceInsights.analysisMode);

if (!planScenario3.performanceInsights.isScorecardAvailable && 
    planScenario3.performanceInsights.analysisMode === 'self_reported_only') {
  console.log('✓ Correctly identified self_reported_only mode without fabricating nonexistent scores.');
} else {
  console.error('❌ Did not properly flag self_reported_only mode when interview history is absent.');
  allTestsPassed = false;
}

// ============================================================================
// TEST 5: 7-Day Plan Task Toggling & Notes Persistence
// ============================================================================
console.log('\n----------------------------------------------------------------');
console.log('TEST 5: 7-Day Plan Task Toggling & Notes Persistence');
console.log('----------------------------------------------------------------');

saveUserImprovementPlan(userAId, planScenario1);

// Initially Day 1 is false
let currentPlan = getUserImprovementPlan(userAId);
if (currentPlan?.sevenDayPlan[0].completed === false) {
  console.log('✓ Day 1 initially marked uncompleted.');
}

// Toggle Day 1 to true
const updatedPlan1 = toggleImprovementPlanTask(userAId, 1, true);
if (updatedPlan1?.sevenDayPlan[0].completed === true && updatedPlan1.sevenDayPlan[0].completedAt) {
  console.log('✓ Day 1 successfully marked completed with timestamp.');
} else {
  console.error('❌ Failed to toggle Day 1 to completed.');
  allTestsPassed = false;
}

// Verify persistence from disk
const reloadedPlan = getUserImprovementPlan(userAId);
if (reloadedPlan?.sevenDayPlan[0].completed === true) {
  console.log('✓ Day 1 completed state correctly persisted in localStorage.');
} else {
  console.error('❌ Completed task state failed to reload from localStorage.');
  allTestsPassed = false;
}

// Update personal notes
const testNotes = 'Target company: FinTech Cloud. Focus on Redis concurrency for tomorrow.';
updateImprovementPlanNotes(userAId, testNotes);

const reloadedWithNotes = getUserImprovementPlan(userAId);
if (reloadedWithNotes?.personalNotes === testNotes) {
  console.log('✓ Personal notes persisted and retrieved accurately.');
} else {
  console.error('❌ Personal notes persistence failed.');
  allTestsPassed = false;
}

// Verify Voice Transcript Integration
if (planScenario1.experienceSummary.includes('I was shaking during the first question')) {
  console.log('✓ Spoken voice transcript accurately incorporated into experience summary.');
} else {
  console.error('❌ Voice transcript omitted from experience summary.');
  allTestsPassed = false;
}

console.log('\n================================================================');
if (allTestsPassed) {
  console.log('🎉 ALL FEEDBACK & IMPROVEMENT PLAN TESTS PASSED WITH 100% SUCCESS!');
} else {
  console.log('❌ SOME TESTS FAILED. CHECK LOG OUTPUT ABOVE.');
  process.exit(1);
}
console.log('================================================================\n');
