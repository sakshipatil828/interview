/**
 * CareerCurve Authentication & User Isolation Test Suite
 * Validates scenarios A through I in an isolated mock browser environment.
 */

// Setup Mock localStorage for Node.js test runner
const storageMap = new Map<string, string>();
const mockLocalStorage = {
  getItem: (key: string) => (storageMap.has(key) ? storageMap.get(key)! : null),
  setItem: (key: string, value: string) => storageMap.set(key, String(value)),
  removeItem: (key: string) => storageMap.delete(key),
  clear: () => storageMap.clear(),
  get length() {
    return storageMap.size;
  },
  key: (index: number) => Array.from(storageMap.keys())[index] || null,
};

(global as any).localStorage = mockLocalStorage;

import {
  registerCandidateAccount,
  loginCandidateAccount,
  restoreAuthenticatedUser,
  clearActiveSession,
  getUserResume,
  saveUserResume,
  clearUserResume,
  getUserInterviews,
  saveUserInterview,
  getUserAptitudeHistory,
  saveUserAptitudeResult,
  getUserAptitudeProgress,
  saveUserAptitudeProgress,
  clearUserAptitudeProgress,
  purgeLegacyUnscopedStorage,
  normalizeEmail,
  getUserStorageKeys,
} from '../src/services/authStorageService';
import { ParsedResume, InterviewSession, AptitudeResult } from '../src/types';

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ ASSERTION FAILED: ${message}`);
    throw new Error(`Assertion failed: ${message}`);
  }
  console.log(`  ✓ ${message}`);
}

async function runTestSuite() {
  console.log('================================================================');
  console.log('🧪 RUNNING CAREERCURVE AUTHENTICATION & USER ISOLATION TEST SUITE');
  console.log('================================================================\n');

  // Purge any legacy global storage keys
  mockLocalStorage.setItem('careercurve_resume', JSON.stringify({ fullName: 'Leaked Legacy User' }));
  mockLocalStorage.setItem('careercurve_aptitude_progress', JSON.stringify({ leaked: true }));
  purgeLegacyUnscopedStorage();
  assert(mockLocalStorage.getItem('careercurve_resume') === null, 'Legacy unscoped careercurve_resume was purged');
  assert(mockLocalStorage.getItem('careercurve_aptitude_progress') === null, 'Legacy unscoped careercurve_aptitude_progress was purged');

  // -------------------------------------------------------------------------
  // TEST SCENARIO A: User A registers for the first time
  // Expected: Account is created, user is logged in, resume parser is empty
  // -------------------------------------------------------------------------
  console.log('\n--- Scenario A: User A registers for the first time ---');
  const regResultA = await registerCandidateAccount({
    fullName: 'Aditya Sharma',
    email: 'Aditya.Sharma@University.edu  ', // Test normalization
    password: 'Password123!',
    confirmPassword: 'Password123!',
    department: 'Computer Science & Engineering',
    degree: 'B.Tech',
    college: 'IIT Bombay',
  });

  assert(regResultA.success === true, 'User A registered successfully');
  assert(!!regResultA.user, 'User A returned safe user object');
  const userA = regResultA.user!;
  assert(userA.email === 'aditya.sharma@university.edu', 'Email was normalized (lowercase + trimmed)');
  assert(userA.id.startsWith('usr_'), 'Unique stable user ID assigned');

  // Check resume for User A is empty
  const initialResumeA = getUserResume(userA.id);
  assert(initialResumeA === null, 'User A resume is null (empty resume state)');

  // -------------------------------------------------------------------------
  // TEST SCENARIO B: User A uploads Resume A
  // Expected: Resume A is saved under User A ID and displayed across refreshes
  // -------------------------------------------------------------------------
  console.log('\n--- Scenario B: User A uploads Resume A ---');
  const resumeA: ParsedResume = {
    fullName: 'Aditya Sharma',
    department: 'Computer Science & Engineering',
    jobTitle: 'Full Stack Engineer',
    atsScore: 92,
    resumeScore: 90,
    rawSkillsList: ['Python', 'TypeScript', 'React', 'PostgreSQL', 'Docker'],
    education: [{ degree: 'B.Tech', branch: 'CSE', college: 'IIT Bombay', graduationYear: '2026' }],
    skills: [{ category: 'Core', skills: [{ name: 'React', level: 'Advanced' }] }],
    projects: [{ title: 'Cloud Platform', description: 'Distributed System', technologies: ['Docker', 'Go'] }],
    experience: [],
    certifications: [],
    languages: ['English'],
    missingSkills: [],
    strongSkills: ['React', 'Python'],
    suggestedTechnologies: [],
    careerSuggestions: [],
    uploadedAt: new Date().toISOString(),
    fileName: 'Aditya_Resume.pdf',
  };

  saveUserResume(userA.id, resumeA);
  const loadedResumeA = getUserResume(userA.id);
  assert(loadedResumeA !== null && loadedResumeA.fullName === 'Aditya Sharma', 'Resume A saved strictly under User A ID');
  assert(loadedResumeA?.atsScore === 92, 'ATS Score preserved');

  // Check that the key is namespaced
  const keysA = getUserStorageKeys(userA.id);
  assert(mockLocalStorage.getItem(keysA.resume) !== null, `Stored under scoped key: ${keysA.resume}`);

  // -------------------------------------------------------------------------
  // TEST SCENARIO C: User B registers on the same browser
  // Expected: User B profile is created, no resume is shown, none of User A data appears
  // -------------------------------------------------------------------------
  console.log('\n--- Scenario C: User B registers on same browser ---');
  const regResultB = await registerCandidateAccount({
    fullName: 'Priya Verma',
    email: 'priya.verma@college.ac.in',
    password: 'SecretPassword456!',
    confirmPassword: 'SecretPassword456!',
    department: 'Civil Engineering',
    degree: 'B.Tech',
    college: 'NIT Trichy',
  });

  assert(regResultB.success === true, 'User B registered successfully');
  const userB = regResultB.user!;
  assert(userB.id !== userA.id, 'User B has a distinct unique ID');

  // Verify User B sees NO resume (isolation check!)
  const resumeForUserB = getUserResume(userB.id);
  assert(resumeForUserB === null, 'User B has NO resume (User A resume does NOT leak to User B)');

  // Verify interviews and aptitude for User B are empty
  const interviewsB = getUserInterviews(userB.id);
  assert(interviewsB.length === 0, 'User B has 0 interview sessions');

  // -------------------------------------------------------------------------
  // TEST SCENARIO D: User B uploads Resume B; User A logs back in and sees Resume A
  // -------------------------------------------------------------------------
  console.log('\n--- Scenario D: User B uploads Resume B, User A maintains Resume A ---');
  const resumeB: ParsedResume = {
    fullName: 'Priya Verma',
    department: 'Civil Engineering',
    jobTitle: 'Structural Design Specialist',
    atsScore: 89,
    resumeScore: 88,
    rawSkillsList: ['AutoCAD', 'ETABS', 'STAAD.Pro', 'Concrete Design'],
    education: [{ degree: 'B.Tech', branch: 'Civil Engineering', college: 'NIT Trichy', graduationYear: '2026' }],
    skills: [{ category: 'Core', skills: [{ name: 'ETABS', level: 'Advanced' }] }],
    projects: [{ title: 'Seismic Analysis of High Rise', description: 'ETABS Simulation', technologies: ['ETABS'] }],
    experience: [],
    certifications: [],
    languages: ['English'],
    missingSkills: [],
    strongSkills: ['ETABS', 'STAAD.Pro'],
    suggestedTechnologies: [],
    careerSuggestions: [],
    uploadedAt: new Date().toISOString(),
    fileName: 'Priya_Civil_Resume.pdf',
  };

  saveUserResume(userB.id, resumeB);

  // Verify User B has Resume B
  const fetchedB = getUserResume(userB.id);
  assert(fetchedB?.fullName === 'Priya Verma', 'User B has Resume B');
  assert(fetchedB?.department === 'Civil Engineering', 'User B department is Civil');

  // Verify User A STILL has Resume A (NO cross-account overwriting!)
  const fetchedA = getUserResume(userA.id);
  assert(fetchedA?.fullName === 'Aditya Sharma', 'User A STILL has Resume A');
  assert(fetchedA?.department === 'Computer Science & Engineering', 'User A department is CSE');

  // -------------------------------------------------------------------------
  // TEST SCENARIO E: User A logs out and logs in again with original credentials
  // Expected: Login succeeds without re-registering, and User A resume is restored
  // -------------------------------------------------------------------------
  console.log('\n--- Scenario E: User A logs out and logs in again ---');
  clearActiveSession();
  assert(restoreAuthenticatedUser() === null, 'Active session cleared after logout');

  const loginResultA = await loginCandidateAccount('ADITYA.SHARMA@UNIVERSITY.EDU', 'Password123!');
  assert(loginResultA.success === true, 'User A logged in successfully without re-registering');
  assert(loginResultA.user?.id === userA.id, 'Logged in as original User A ID');

  const restoredResumeA = getUserResume(loginResultA.user?.id);
  assert(restoredResumeA?.fullName === 'Aditya Sharma', 'User A resume restored upon login');

  // -------------------------------------------------------------------------
  // TEST SCENARIO F: User enters the wrong password
  // Expected: Login fails with invalid-credentials error and access is denied
  // -------------------------------------------------------------------------
  console.log('\n--- Scenario F: Incorrect password rejected ---');
  const badLogin = await loginCandidateAccount('aditya.sharma@university.edu', 'WrongPassword999');
  assert(badLogin.success === false, 'Login failed with incorrect password');
  assert(badLogin.error === 'Invalid email or password.', 'Informative error returned');
  assert(badLogin.user === undefined, 'No user object returned on failed login');

  // Non-existent email
  const nonexistentLogin = await loginCandidateAccount('nobody@nowhere.com', 'SomePassword');
  assert(nonexistentLogin.success === false, 'Login failed for non-existent account');
  assert(nonexistentLogin.error === 'Invalid email or password.', 'Did not reveal account existence');

  // -------------------------------------------------------------------------
  // TEST SCENARIO G: Duplicate registration blocked
  // Expected: Registration is blocked with existing-account message
  // -------------------------------------------------------------------------
  console.log('\n--- Scenario G: Duplicate email registration blocked ---');
  const duplicateReg = await registerCandidateAccount({
    fullName: 'Imposter Aditya',
    email: 'aditya.sharma@university.edu',
    password: 'NewPassword123!',
    confirmPassword: 'NewPassword123!',
  });
  assert(duplicateReg.success === false, 'Duplicate email registration rejected');
  assert(
    duplicateReg.error === 'This email is already registered. Please log in instead.',
    'Clear existing-account error message provided'
  );

  // -------------------------------------------------------------------------
  // TEST SCENARIO H: Logout clears private session
  // Expected: Session cleared, active user null
  // -------------------------------------------------------------------------
  console.log('\n--- Scenario H: Logout clears private information ---');
  clearActiveSession();
  const sessionAfterLogout = restoreAuthenticatedUser();
  assert(sessionAfterLogout === null, 'Session completely cleared after logout');

  // -------------------------------------------------------------------------
  // TEST SCENARIO I: User with no resume opens app
  // Expected: Empty state returned, no crashing or leaked data
  // -------------------------------------------------------------------------
  console.log('\n--- Scenario I: Clean empty state for user with no resume ---');
  const regResultC = await registerCandidateAccount({
    fullName: 'Rohan Gupta',
    email: 'rohan.gupta@institute.edu',
    password: 'PasswordRohan123!',
    confirmPassword: 'PasswordRohan123!',
    department: 'Mechanical Engineering',
  });
  const userC = regResultC.user!;
  assert(getUserResume(userC.id) === null, 'User C has null resume');
  assert(getUserInterviews(userC.id).length === 0, 'User C has empty interview list');
  assert(getUserAptitudeHistory(userC.id).length === 0, 'User C has empty aptitude history');
  assert(getUserAptitudeProgress(userC.id) === null, 'User C has no aptitude progress');

  // Saving an interview session for User C
  const sessionC: InterviewSession = {
    id: 'int_session_c_1',
    date: 'Oct 13, 2026',
    department: 'Mechanical Engineering',
    difficulty: 'Intermediate',
    roundType: 'technical',
    technicalScore: 84,
    hrScore: 80,
    answers: [],
  };
  saveUserInterview(userC.id, sessionC);
  assert(getUserInterviews(userC.id).length === 1, 'User C has 1 saved interview');
  assert(getUserInterviews(userA.id).length === 0, 'User A interview list remains unpolluted (still 0)');

  console.log('\n================================================================');
  console.log('🎉 ALL TEST SCENARIOS (A THROUGH I) PASSED WITH 100% SUCCESS!');
  console.log('================================================================');
}

runTestSuite().catch((err) => {
  console.error('Test suite failed:', err);
  process.exit(1);
});
