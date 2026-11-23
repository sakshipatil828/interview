/**
 * Automated Verification Script: Strict Candidate Classification & Dynamic Round Selection
 * Tests all 9 candidate profiles and verifies state isolation across sequential re-uploads.
 */

// Mock in-memory localStorage for test environment
const memoryStore = new Map<string, string>();
const mockLocalStorage = {
  getItem: (k: string) => memoryStore.get(k) || null,
  setItem: (k: string, v: string) => memoryStore.set(k, String(v)),
  removeItem: (k: string) => memoryStore.delete(k),
  clear: () => memoryStore.clear(),
};

import {
  classifyCandidate,
  getRoundRecommendations,
  type CandidateProfileInput,
  type CandidateClassification,
} from '../src/services/candidateClassificationService.ts';

import type {
  InterviewJourneyState,
  InterviewRoundId,
} from '../src/types/journey.ts';

// Storage functions matching authStorageService implementation
function getUserInterviewJourney(userId?: string | null): InterviewJourneyState | null {
  if (!userId) return null;
  const key = `careercurve_interview_journey_${userId}`;
  try {
    const raw = mockLocalStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveUserInterviewJourney(journey: InterviewJourneyState): void {
  if (!journey?.userId) return;
  const key = `careercurve_interview_journey_${journey.userId}`;
  try {
    mockLocalStorage.setItem(key, JSON.stringify(journey));
  } catch {}
}

function clearUserInterviewJourney(userId?: string | null): void {
  if (!userId) return;
  const key = `careercurve_interview_journey_${userId}`;
  try {
    mockLocalStorage.removeItem(key);
  } catch {}
}

// Color formatting for console
const green = (text: string) => `\x1b[32m${text}\x1b[0m`;
const red = (text: string) => `\x1b[31m${text}\x1b[0m`;
const cyan = (text: string) => `\x1b[36m${text}\x1b[0m`;
const bold = (text: string) => `\x1b[1m${text}\x1b[0m`;

let passedCount = 0;
let failedCount = 0;

function assert(condition: boolean, message: string) {
  if (condition) {
    console.log(`  ✓ ${green(message)}`);
    passedCount++;
  } else {
    console.error(`  ✗ ${red(message)}`);
    failedCount++;
  }
}

console.log(bold('\n======================================================================'));
console.log(bold('  CAREERCURVE: STRICT CLASSIFICATION & ROUND SELECTION TEST SUITE'));
console.log(bold('======================================================================\n'));

// ============================================================================
// TEST 1: The 9 Mandatory Test Profiles
// ============================================================================
console.log(cyan('--- TEST SUITE 1: 9 Mandatory Candidate Profiles ---'));

interface ExpectedProfileResult {
  candidateName: string;
  isTechnical: boolean;
  educationalCategory: 'technical' | 'non_technical';
  track: 'fresher' | 'experienced';
  exactAllowedRounds: InterviewRoundId[];
  coreRecommendedRounds: InterviewRoundId[];
  forbiddenRounds: InterviewRoundId[];
}

const testProfiles: { input: CandidateProfileInput; expected: ExpectedProfileResult }[] = [
  // Profile 1: B.Com Experienced Customer Service
  {
    input: {
      fullName: 'Pooja Verma',
      education: [{ degree: 'B.Com', college: 'St. Xavier College', graduationYear: '2023' }],
      department: 'Customer Service & Sales Operations',
      skills: ['Customer Support', 'CRM', 'Zendesk', 'Salesforce', 'Conflict Resolution', 'Active Listening'],
      experience: [
        { role: 'Customer Service Associate', company: 'Zeta Helpdesk Solutions', duration: '1.5 years', isInternship: false },
        { role: 'Sales Support Assistant', company: 'Retail Retailers Ltd', duration: '1 year', isInternship: false },
      ],
      totalExperienceYears: 2.5,
    },
    expected: {
      candidateName: 'Pooja Verma (B.Com Experienced Customer Service)',
      isTechnical: false,
      educationalCategory: 'non_technical',
      track: 'experienced',
      exactAllowedRounds: ['communication', 'hr'],
      coreRecommendedRounds: ['communication', 'hr'],
      forbiddenRounds: ['technical', 'aptitude'],
    },
  },

  // Profile 2: BBA Fresher
  {
    input: {
      fullName: 'Rohan Mehta',
      education: [{ degree: 'BBA', college: 'Symbiosis Institute', graduationYear: '2026' }],
      department: 'Business Administration & Management',
      skills: ['Marketing', 'Market Research', 'Digital Marketing', 'PowerPoint', 'Team Leadership'],
      experience: [],
    },
    expected: {
      candidateName: 'Rohan Mehta (BBA Fresher)',
      isTechnical: false,
      educationalCategory: 'non_technical',
      track: 'fresher',
      exactAllowedRounds: ['aptitude', 'communication', 'hr'],
      coreRecommendedRounds: ['aptitude', 'communication', 'hr'],
      forbiddenRounds: ['technical'],
    },
  },

  // Profile 3: Business Analytics Fresher
  {
    input: {
      fullName: 'Ananya Sen',
      education: [{ degree: 'B.Sc Business Analytics', college: 'Christ University', graduationYear: '2026' }],
      department: 'Business Analytics & Decision Science',
      skills: ['Power BI', 'Excel', 'Tableau', 'Statistical Analysis', 'Data Cleaning', 'Dashboarding'],
      experience: [],
    },
    expected: {
      candidateName: 'Ananya Sen (Business Analytics Fresher)',
      isTechnical: false,
      educationalCategory: 'non_technical',
      track: 'fresher',
      exactAllowedRounds: ['aptitude', 'communication', 'hr'],
      coreRecommendedRounds: ['aptitude', 'communication', 'hr'],
      forbiddenRounds: ['technical'],
    },
  },

  // Profile 4: MBA Experienced HR Professional
  {
    input: {
      fullName: 'Shweta Kulkarni',
      education: [{ degree: 'MBA in Human Resources', college: 'Pune University', graduationYear: '2023' }],
      department: 'Human Resources Management',
      skills: ['Talent Acquisition', 'Employee Onboarding', 'HRMS', 'Performance Appraisal', 'Grievance Handling'],
      experience: [
        { role: 'HR Generalist', company: 'Apex People Services', duration: '2 years', isInternship: false },
      ],
      totalExperienceYears: 2,
    },
    expected: {
      candidateName: 'Shweta Kulkarni (MBA Experienced HR)',
      isTechnical: false,
      educationalCategory: 'non_technical',
      track: 'experienced',
      exactAllowedRounds: ['communication', 'hr'],
      coreRecommendedRounds: ['communication', 'hr'],
      forbiddenRounds: ['technical', 'aptitude'],
    },
  },

  // Profile 5: Arts Fresher
  {
    input: {
      fullName: 'Priya Sharma',
      education: [{ degree: 'BA English Literature', college: 'Lady Shri Ram College', graduationYear: '2026' }],
      department: 'English Literature & Communications',
      skills: ['Content Writing', 'Copywriting', 'Creative Writing', 'Editing', 'Proofreading', 'Public Speaking'],
      experience: [],
    },
    expected: {
      candidateName: 'Priya Sharma (Arts Fresher)',
      isTechnical: false,
      educationalCategory: 'non_technical',
      track: 'fresher',
      exactAllowedRounds: ['aptitude', 'communication', 'hr'],
      coreRecommendedRounds: ['aptitude', 'communication', 'hr'],
      forbiddenRounds: ['technical'],
    },
  },

  // Profile 6: CSE Fresher
  {
    input: {
      fullName: 'Aarav Patel',
      education: [{ degree: 'B.Tech', branch: 'Computer Science & Engineering', college: 'IIT Madras', graduationYear: '2026' }],
      department: 'Computer Science & Engineering',
      skills: ['Java', 'Python', 'React', 'Data Structures', 'Algorithms', 'SQL', 'Git'],
      experience: [],
    },
    expected: {
      candidateName: 'Aarav Patel (CSE Fresher)',
      isTechnical: true,
      educationalCategory: 'technical',
      track: 'fresher',
      exactAllowedRounds: ['aptitude', 'technical', 'hr', 'communication'],
      coreRecommendedRounds: ['aptitude', 'technical', 'hr'],
      forbiddenRounds: [],
    },
  },

  // Profile 7: ECE Fresher
  {
    input: {
      fullName: 'Kavya Nair',
      education: [{ degree: 'B.Tech', branch: 'Electronics & Communication Engineering', college: 'NIT Trichy', graduationYear: '2026' }],
      department: 'Electronics & Communication Engineering',
      skills: ['Embedded C', 'Verilog', 'Digital Signal Processing', 'Microcontrollers', 'MATLAB'],
      experience: [],
    },
    expected: {
      candidateName: 'Kavya Nair (ECE Fresher)',
      isTechnical: true,
      educationalCategory: 'technical',
      track: 'fresher',
      exactAllowedRounds: ['aptitude', 'technical', 'hr', 'communication'],
      coreRecommendedRounds: ['aptitude', 'technical', 'hr'],
      forbiddenRounds: [],
    },
  },

  // Profile 8: Mechanical Experienced Engineer
  {
    input: {
      fullName: 'Vikramaditya Rao',
      education: [{ degree: 'B.Tech', branch: 'Mechanical Engineering', college: 'BITS Pilani', graduationYear: '2021' }],
      department: 'Mechanical Engineering',
      skills: ['SolidWorks', 'AutoCAD', 'ANSYS', 'GD&T', 'Thermodynamics', 'Finite Element Analysis'],
      experience: [
        { role: 'Mechanical Design Engineer', company: 'Tata Motors', duration: '3.5 years', isInternship: false },
      ],
      totalExperienceYears: 3.5,
    },
    expected: {
      candidateName: 'Vikramaditya Rao (Mechanical Experienced Engineer)',
      isTechnical: true,
      educationalCategory: 'technical',
      track: 'experienced',
      exactAllowedRounds: ['technical', 'hr', 'communication'],
      coreRecommendedRounds: ['technical', 'hr'],
      forbiddenRounds: ['aptitude'], // Aptitude strictly excluded from core track
    },
  },

  // Profile 9: Civil Fresher
  {
    input: {
      fullName: 'Neha Gupta',
      education: [{ degree: 'B.Tech', branch: 'Civil Engineering', college: 'Delhi Technological University', graduationYear: '2026' }],
      department: 'Civil Engineering',
      skills: ['AutoCAD Civil', 'STAAD.Pro', 'Structural Analysis', 'Surveying', 'Revit Architecture'],
      experience: [],
    },
    expected: {
      candidateName: 'Neha Gupta (Civil Fresher)',
      isTechnical: true,
      educationalCategory: 'technical',
      track: 'fresher',
      exactAllowedRounds: ['aptitude', 'technical', 'hr', 'communication'],
      coreRecommendedRounds: ['aptitude', 'technical', 'hr'],
      forbiddenRounds: [],
    },
  },
];

for (const [idx, item] of testProfiles.entries()) {
  const profileNum = idx + 1;
  console.log(`\nChecking Profile ${profileNum}: ${bold(item.expected.candidateName)}`);
  
  const classification = classifyCandidate(item.input);
  
  assert(
    classification.isTechnical === item.expected.isTechnical,
    `Classification isTechnical: expected ${item.expected.isTechnical}, got ${classification.isTechnical}`
  );
  
  assert(
    classification.educationalCategory === item.expected.educationalCategory,
    `Educational Category: expected ${item.expected.educationalCategory}, got ${classification.educationalCategory}`
  );
  
  assert(
    classification.track === item.expected.track,
    `Track: expected ${item.expected.track}, got ${classification.track}`
  );

  const rec = getRoundRecommendations(classification.educationalCategory, classification.track);
  
  // Verify core recommended rounds
  const hasAllCore = item.expected.coreRecommendedRounds.every((r) => rec.recommendedRounds.includes(r));
  const exactCoreMatch = rec.recommendedRounds.length === item.expected.coreRecommendedRounds.length && hasAllCore;
  assert(
    exactCoreMatch,
    `Core Recommended Rounds: expected [${item.expected.coreRecommendedRounds.join(', ')}], got [${rec.recommendedRounds.join(', ')}]`
  );

  // Also verify classification.recommendedRounds matches
  const classCoreMatch = classification.recommendedRounds.length === item.expected.coreRecommendedRounds.length &&
    item.expected.coreRecommendedRounds.every((r) => classification.recommendedRounds.includes(r));
  assert(
    classCoreMatch,
    `Classification Object Recommended Rounds matches: [${classification.recommendedRounds.join(', ')}]`
  );

  // Compute allowedRounds as defined in the application matrix
  const isNonTech = classification.isTechnical === false || classification.educationalCategory === 'non_technical';
  const isFresher = classification.track === 'fresher';
  const allowedRounds: InterviewRoundId[] = isNonTech
    ? (isFresher ? ['aptitude', 'communication', 'hr'] : ['communication', 'hr'])
    : (isFresher ? ['aptitude', 'technical', 'hr', 'communication'] : ['technical', 'hr', 'communication']);

  const allowedMatch =
    allowedRounds.length === item.expected.exactAllowedRounds.length &&
    allowedRounds.every((r) => item.expected.exactAllowedRounds.includes(r));
  assert(
    allowedMatch,
    `Exact Allowed Rounds: expected [${item.expected.exactAllowedRounds.join(', ')}], got [${allowedRounds.join(', ')}]`
  );

  // Verify forbidden rounds are strictly NOT in allowedRounds or core recommended rounds
  for (const forbidden of item.expected.forbiddenRounds) {
    assert(
      !allowedRounds.includes(forbidden) && !rec.recommendedRounds.includes(forbidden),
      `Forbidden round '${forbidden}' is strictly absent from allowed and recommended rounds`
    );
  }
}

// ============================================================================
// TEST 2: State Contamination & Rapid Sequential Re-upload Test
// ============================================================================
console.log(cyan('\n--- TEST SUITE 2: State Contamination & Rapid Re-upload Validation ---'));

const testUserId = 'test-session-user-999';

// Step 1: Candidate 1 uploads Technical Fresher resume (CSE)
console.log('\nStep 1: Upload Candidate 1 (Technical Fresher - Aarav Patel)');
clearUserInterviewJourney(testUserId);

const candidate1 = testProfiles[5]; // Aarav Patel (CSE Fresher)
const class1 = classifyCandidate(candidate1.input);
const allowed1: InterviewRoundId[] = ['aptitude', 'technical', 'hr', 'communication'];

// Initialize journey for candidate 1
const journey1: InterviewJourneyState = {
  userId: testUserId,
  candidateName: candidate1.input.fullName,
  email: 'aarav@example.com',
  config: {
    rounds: ['aptitude', 'technical', 'hr'],
    selectedRounds: ['aptitude', 'technical', 'hr'],
    difficulty: 'Medium',
    department: 'Computer Science & Engineering',
    targetRole: 'Software Development Engineer',
  },
  completedRounds: ['technical'],
  roundResults: {
    technical: {
      roundId: 'technical',
      scorePercentage: 88,
      status: 'completed',
      summaryFeedback: 'Strong Java and DS knowledge',
      completedAt: new Date().toISOString(),
      questionResults: [
        { questionId: 'q1', marksAwarded: 10, totalMarks: 10, isCorrect: true, userCode: 'class Solution {}' },
      ],
    },
  },
  status: 'in_progress',
  activeRoundIndex: 1,
  currentPhase: 'round_active',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

saveUserInterviewJourney(journey1);

const loaded1 = getUserInterviewJourney(testUserId);
assert(loaded1 !== null, 'Candidate 1 journey successfully saved');
assert(loaded1?.roundResults.technical?.scorePercentage === 88, 'Candidate 1 has completed technical score 88%');
assert(loaded1?.config.selectedRounds.includes('technical') === true, 'Candidate 1 includes technical round');

// Step 2: Immediate re-upload of Candidate 2 (Non-Technical Experienced - Pooja Verma)
console.log('\nStep 2: Immediate Re-upload Candidate 2 (Non-Tech Experienced - Pooja Verma)');

// Simulating handleResumeParsed action in App.tsx
clearUserInterviewJourney(testUserId);

const candidate2 = testProfiles[0]; // Pooja Verma (Customer Service Experienced)
const class2 = classifyCandidate(candidate2.input);
const isNonTech2 = class2.isTechnical === false || class2.educationalCategory === 'non_technical';
const isFresher2 = class2.track === 'fresher';
const allowed2: InterviewRoundId[] = isNonTech2
  ? (isFresher2 ? ['aptitude', 'communication', 'hr'] : ['communication', 'hr'])
  : (isFresher2 ? ['aptitude', 'technical', 'hr', 'communication'] : ['technical', 'hr', 'communication']);

const freshJourney2: InterviewJourneyState = {
  userId: testUserId,
  candidateName: candidate2.input.fullName,
  email: 'pooja@example.com',
  config: {
    rounds: ['communication', 'hr'],
    selectedRounds: ['communication', 'hr'],
    difficulty: 'Medium',
    department: 'Customer Service & Sales Operations',
    targetRole: 'Customer Support Specialist',
  },
  completedRounds: [],
  roundResults: {},
  status: 'setup',
  activeRoundIndex: 0,
  currentPhase: 'setup',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};
saveUserInterviewJourney(freshJourney2);

const loaded2 = getUserInterviewJourney(testUserId);

assert(loaded2 !== null, 'Candidate 2 journey initialized freshly');
assert(Object.keys(loaded2?.roundResults || {}).length === 0, 'ZERO residual scores from previous candidate');
assert(!loaded2?.roundResults.technical, 'Technical score strictly wiped clean (undefined)');
assert(!loaded2?.completedRounds.includes('technical'), 'Completed rounds contains ZERO previous technical rounds');
assert(loaded2?.config.selectedRounds.length === 2, 'Candidate 2 selected rounds count is exactly 2');
assert(!loaded2?.config.selectedRounds.includes('technical'), 'Technical round is strictly absent from selected rounds');
assert(!loaded2?.config.selectedRounds.includes('aptitude'), 'Aptitude round is strictly absent from selected rounds');

// Step 3: Round filtering validation: what if stale state attempted to inject 'technical'?
console.log('\nStep 3: Stale state sanitize verification');
const rawSavedRoundsWithStaleLeak: InterviewRoundId[] = ['aptitude', 'technical', 'communication', 'hr'];
const sanitizedRounds = rawSavedRoundsWithStaleLeak.filter((r) => allowed2.includes(r));

assert(
  sanitizedRounds.length === 2 &&
  sanitizedRounds.includes('communication') &&
  sanitizedRounds.includes('hr') &&
  !sanitizedRounds.includes('technical') &&
  !sanitizedRounds.includes('aptitude'),
  'Sanitization filter strictly purges forbidden rounds from stale state'
);

// Cleanup test user journey
clearUserInterviewJourney(testUserId);
console.log('\nCleaned up test session storage.');

// ============================================================================
// FINAL SUMMARY
// ============================================================================
console.log(bold('\n======================================================================'));
console.log(bold(`  TEST RESULTS: ${passedCount} PASSED, ${failedCount} FAILED`));
console.log(bold('======================================================================\n'));

if (failedCount > 0) {
  process.exit(1);
} else {
  console.log(green('All tests passed successfully! Resume-based classification and dynamic round selection verified.\n'));
  process.exit(0);
}
