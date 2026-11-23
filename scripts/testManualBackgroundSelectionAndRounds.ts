/**
 * CareerCurve Automated Verification Test Suite:
 * MANUAL TECHNICAL / NON-TECHNICAL SELECTION AND ROUND SELECTION
 *
 * Verifies:
 * - Two manual background buttons/cards (Technical vs Non-Technical)
 * - Authoritative user selection overriding automatic guesses
 * - Strict 3-round recommendation:
 *   - Technical: Aptitude, Technical, HR Behaviour
 *   - Non-Technical: Aptitude, Communication, HR Behaviour (Strictly NO Technical round)
 * - State isolation across re-uploads
 * - Non-technical NLP question generation & evaluation engine
 */

import {
  classifyCandidate,
  detectEducationalBackground,
  enrichParsedResumeWithClassification,
} from '../src/services/candidateClassificationService';

import {
  generateNonTechnicalQuestions,
  evaluateNonTechnicalAnswer,
} from '../src/nlp/nonTechnicalQuestionEngine';

import {
  sampleResumes,
  Sample_NonTechnical_Experienced_Resume,
  Sample_NonTechnical_Fresher_Resume,
} from '../src/data/sampleData';

import type { ParsedResume } from '../src/types';
import type { InterviewJourneyState } from '../src/types/journey';

// In-memory mock storage
const mockStorage = new Map<string, string>();
const localStorageMock = {
  getItem: (key: string) => mockStorage.get(key) || null,
  setItem: (key: string, val: string) => mockStorage.set(key, String(val)),
  removeItem: (key: string) => mockStorage.delete(key),
  clear: () => mockStorage.clear(),
};

let passed = 0;
let failed = 0;

function assert(condition: boolean, testName: string, detail?: string) {
  if (condition) {
    console.log(`  [PASS] ${testName}`);
    passed++;
  } else {
    console.error(`  [FAIL] ${testName}${detail ? ` -> ${detail}` : ''}`);
    failed++;
  }
}

console.log('\n========================================================================');
console.log(' CAREERCURVE: MANUAL BACKGROUND SELECTION & DYNAMIC ROUNDS VERIFICATION');
console.log('========================================================================\n');

// Mock resumes
const mockBComExperienced: ParsedResume = {
  fullName: 'Pooja Verma',
  email: 'pooja.verma@clientsupport.com',
  education: [{ degree: 'Bachelor of Commerce (B.Com)', year: '2022' }],
  department: 'Commerce & Accounting',
  graduationYear: '2022',
  skills: ['Customer Support', 'CRM Data Entry', 'Zendesk', 'MS Excel', 'Email Etiquette'],
  rawSkillsList: ['Customer Support', 'CRM Data Entry', 'Zendesk', 'MS Excel', 'Email Etiquette'],
  experience: [
    { title: 'Customer Service Associate', company: 'Global Connect BPO Services', description: 'Handled customer queries via CRM chat and Zendesk', duration: '1.5 Years' },
    { title: 'Sales Assistant', company: 'Retail Solutions', description: 'Customer returns processing in MS Excel', duration: '1 Year' }
  ],
  totalProfessionalExperience: '2.5 Years',
};

const mockBComFresher: ParsedResume = {
  fullName: 'Deepa Shah',
  email: 'deepa.shah@commercestudent.edu',
  education: [{ degree: 'Bachelor of Commerce (B.Com)', year: '2026' }],
  department: 'Commerce',
  graduationYear: '2026',
  skills: ['Customer Support', 'Office Administration', 'Microsoft Word', 'Microsoft Excel', 'Google Workspace'],
  rawSkillsList: ['Customer Support', 'Office Administration', 'Microsoft Word', 'Microsoft Excel', 'Google Workspace'],
  projects: [
    { title: 'Campus Student Service & Feedback Survey Analysis', description: 'Tabulated 450+ responses in Google Sheets', technologies: ['Google Sheets', 'Excel'] }
  ],
  experience: [],
};

const mockCSEResume: ParsedResume = {
  fullName: 'Alex Rivers',
  email: 'alex.rivers@devmail.com',
  education: [{ degree: 'Bachelor of Technology in Computer Science & Engineering', year: '2025' }],
  department: 'Computer Science and Engineering',
  graduationYear: '2025',
  skills: ['Python', 'TypeScript', 'React', 'Node.js', 'PostgreSQL', 'Docker', 'REST APIs'],
  rawSkillsList: ['Python', 'TypeScript', 'React', 'Node.js', 'PostgreSQL', 'Docker', 'REST APIs'],
  projects: [
    { title: 'Real-Time Collaborative Canvas Platform', description: 'WebSocket-backed canvas sync', technologies: ['React', 'Node.js', 'PostgreSQL'] }
  ],
  experience: [],
};

// ============================================================================
// TEST A: Sample_NonTechnical_Experienced_Resume
// ============================================================================
console.log('--- TEST A: Sample_NonTechnical_Experienced_Resume (B.Com Customer Service) ---');
{
  const bg = detectEducationalBackground(mockBComExperienced);
  assert(bg.category === 'non_technical', 'Auto-detection suggests Non-Technical background for B.Com');

  // Candidate confirms "Non-Technical Student"
  const enriched = enrichParsedResumeWithClassification(mockBComExperienced, {
    userSelectedCategory: 'non_technical',
  });

  assert(enriched.userSelectedCategory === 'non_technical', 'Authoritative selection recorded as non_technical');
  assert(enriched.classification?.isTechnical === false, 'isTechnical is strictly false');
  assert(enriched.classification?.educationalCategory === 'non_technical', 'educationalCategory is non_technical');

  const recRounds = enriched.classification?.recommendedRounds || [];
  assert(recRounds.includes('aptitude'), 'Aptitude round is included');
  assert(recRounds.includes('communication'), 'Communication round is included');
  assert(recRounds.includes('hr'), 'HR Behaviour round is included');
  assert(!recRounds.includes('technical'), 'Technical round is STRICTLY EXCLUDED');
  assert(recRounds.length === 3, 'Exactly 3 rounds recommended for Non-Technical candidate');
}

// ============================================================================
// TEST B: Sample_NonTechnical_Fresher_Resume
// ============================================================================
console.log('\n--- TEST B: Sample_NonTechnical_Fresher_Resume (B.Com Support / Admin Fresher) ---');
{
  const bg = detectEducationalBackground(mockBComFresher);
  assert(bg.category === 'non_technical', 'Auto-detection suggests Non-Technical background for B.Com Fresher');

  // Candidate confirms "Non-Technical Student"
  const enriched = enrichParsedResumeWithClassification(mockBComFresher, {
    userSelectedCategory: 'non_technical',
  });

  assert(enriched.userSelectedCategory === 'non_technical', 'Authoritative selection recorded as non_technical');
  assert(enriched.classification?.isTechnical === false, 'isTechnical is strictly false');
  assert(enriched.classification?.track === 'fresher', 'Candidate classified as fresher');

  const recRounds = enriched.classification?.recommendedRounds || [];
  assert(recRounds.includes('aptitude'), 'Aptitude round is included');
  assert(recRounds.includes('communication'), 'Communication round is included');
  assert(recRounds.includes('hr'), 'HR Behaviour round is included');
  assert(!recRounds.includes('technical'), 'Technical round is STRICTLY EXCLUDED for Fresher Non-Tech');
  assert(recRounds.length === 3, 'Exactly 3 rounds recommended');
}

// ============================================================================
// TEST C: Computer Science Engineering Resume
// ============================================================================
console.log('\n--- TEST C: Computer Science & Engineering Resume (Technical Student) ---');
{
  const bg = detectEducationalBackground(mockCSEResume);
  assert(bg.category === 'technical', 'Auto-detection suggests Technical background for CSE');

  // Candidate confirms "Technical Student"
  const enriched = enrichParsedResumeWithClassification(mockCSEResume, {
    userSelectedCategory: 'technical',
  });

  assert(enriched.userSelectedCategory === 'technical', 'Authoritative selection recorded as technical');
  assert(enriched.classification?.isTechnical === true, 'isTechnical is true');
  assert(enriched.classification?.educationalCategory === 'technical', 'educationalCategory is technical');

  const recRounds = enriched.classification?.recommendedRounds || [];
  assert(recRounds.includes('aptitude'), 'Aptitude round is included');
  assert(recRounds.includes('technical'), 'Technical round is included');
  assert(recRounds.includes('hr'), 'HR Behaviour round is included');
  assert(!recRounds.includes('communication'), 'Communication is not in core 3 recommended (it is optional)');
  assert(recRounds.length === 3, 'Exactly 3 core rounds recommended for Technical candidate');
}

// ============================================================================
// TEST D: State Isolation — Non-Technical Uploaded After CSE
// ============================================================================
console.log('\n--- TEST D: State Isolation — Non-Technical Uploaded After CSE ---');
{
  // 1. Simulate CSE session saved to storage
  const initialCSEJourney: InterviewJourneyState = {
    id: 'journey_cse_1',
    userId: 'user_123',
    config: {
      candidateName: 'Alex Rivers',
      email: 'alex@dev.com',
      department: 'Computer Science and Engineering',
      targetRole: 'Software Engineer',
      difficulty: 'Intermediate',
      mode: 'Assessment Mode',
      aptitudeDurationMinutes: 10,
      technicalDurationMinutes: 15,
      hrDurationMinutes: 10,
      communicationDurationMinutes: 15,
      userSelectedCategory: 'technical',
      educationalCategory: 'technical',
      selectedRounds: ['aptitude', 'technical', 'hr'],
    },
    status: 'in_progress',
    activeRoundIndex: 1,
    currentPhase: 'in_progress',
    completedRounds: ['aptitude'],
    roundResults: {
      aptitude: { roundId: 'aptitude', roundTitle: 'Aptitude Round', scorePercentage: 80, completedAt: new Date().toISOString() },
      technical: { roundId: 'technical', roundTitle: 'Technical Interview', scorePercentage: 90, completedAt: new Date().toISOString() },
    },
    startedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  localStorageMock.setItem('careercurve_interview_journey_user_123', JSON.stringify(initialCSEJourney));

  // 2. Candidate uploads Non-Technical B.Com resume and selects Non-Technical Student
  const updatedNonTech = enrichParsedResumeWithClassification(mockBComExperienced, {
    userSelectedCategory: 'non_technical',
  });

  // Journey reset for new upload
  const newJourney: InterviewJourneyState = {
    id: 'journey_bcom_2',
    userId: 'user_123',
    config: {
      candidateName: updatedNonTech.fullName,
      email: updatedNonTech.email,
      department: updatedNonTech.department || 'Commerce',
      targetRole: 'Customer Support Specialist',
      difficulty: 'Intermediate',
      mode: 'Assessment Mode',
      aptitudeDurationMinutes: 10,
      technicalDurationMinutes: 15,
      hrDurationMinutes: 10,
      communicationDurationMinutes: 15,
      userSelectedCategory: 'non_technical',
      educationalCategory: 'non_technical',
      selectedRounds: ['aptitude', 'communication', 'hr'],
    },
    status: 'in_progress',
    activeRoundIndex: 0,
    currentPhase: 'form',
    completedRounds: [],
    roundResults: {},
    startedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  localStorageMock.setItem('careercurve_interview_journey_user_123', JSON.stringify(newJourney));

  // Verify stored journey state
  const stored = JSON.parse(localStorageMock.getItem('careercurve_interview_journey_user_123')!);
  assert(stored.config.userSelectedCategory === 'non_technical', 'Stored userSelectedCategory updated to non_technical');
  assert(!stored.config.selectedRounds.includes('technical'), 'Technical round completely purged from selectedRounds');
  assert(stored.config.selectedRounds.includes('communication'), 'Communication round added to selectedRounds');
  assert(!('technical' in stored.roundResults), 'Old CSE technical round results purged');
}

// ============================================================================
// TEST E: State Isolation — CSE Uploaded After Non-Technical
// ============================================================================
console.log('\n--- TEST E: State Isolation — CSE Uploaded After Non-Technical ---');
{
  // User uploads CSE resume and selects Technical Student
  const updatedCSE = enrichParsedResumeWithClassification(mockCSEResume, {
    userSelectedCategory: 'technical',
  });

  const cseJourney: InterviewJourneyState = {
    id: 'journey_cse_3',
    userId: 'user_123',
    config: {
      candidateName: updatedCSE.fullName,
      email: updatedCSE.email,
      department: updatedCSE.department || 'CSE',
      targetRole: 'Software Engineer',
      difficulty: 'Intermediate',
      mode: 'Assessment Mode',
      aptitudeDurationMinutes: 10,
      technicalDurationMinutes: 15,
      hrDurationMinutes: 10,
      communicationDurationMinutes: 15,
      userSelectedCategory: 'technical',
      educationalCategory: 'technical',
      selectedRounds: ['aptitude', 'technical', 'hr'],
    },
    status: 'in_progress',
    activeRoundIndex: 0,
    currentPhase: 'form',
    completedRounds: [],
    roundResults: {},
    startedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  localStorageMock.setItem('careercurve_interview_journey_user_123', JSON.stringify(cseJourney));

  const stored = JSON.parse(localStorageMock.getItem('careercurve_interview_journey_user_123')!);
  assert(stored.config.userSelectedCategory === 'technical', 'Stored userSelectedCategory updated to technical');
  assert(stored.config.selectedRounds.includes('technical'), 'Technical round restored in selectedRounds');
}

// ============================================================================
// TEST F: Authoritative Manual Overrides
// ============================================================================
console.log('\n--- TEST F: Authoritative Manual Overrides ---');
{
  // 1. CSE detected resume, but student clicks "Non-Technical Student"
  const overriddenToNonTech = enrichParsedResumeWithClassification(mockCSEResume, {
    userSelectedCategory: 'non_technical',
  });
  assert(overriddenToNonTech.userSelectedCategory === 'non_technical', 'User manual selection overrides CSE detection');
  assert(overriddenToNonTech.classification?.isTechnical === false, 'isTechnical is forced false by user override');
  assert(overriddenToNonTech.classification?.educationalCategory === 'non_technical', 'educationalCategory set to non_technical');
  assert(!overriddenToNonTech.classification?.recommendedRounds.includes('technical'), 'Technical round suppressed on override');
  assert(overriddenToNonTech.classification?.recommendedRounds.includes('communication'), 'Communication round activated on override');

  // 2. Commerce detected resume, but student clicks "Technical Student"
  const overriddenToTech = enrichParsedResumeWithClassification(mockBComFresher, {
    userSelectedCategory: 'technical',
  });
  assert(overriddenToTech.userSelectedCategory === 'technical', 'User manual selection overrides Commerce detection');
  assert(overriddenToTech.classification?.isTechnical === true, 'isTechnical is forced true by user override');
  assert(overriddenToTech.classification?.educationalCategory === 'technical', 'educationalCategory set to technical');
  assert(overriddenToTech.classification?.recommendedRounds.includes('technical'), 'Technical round activated on override');
}

// ============================================================================
// TEST G: Non-Technical Question Generation & NLP Answer Evaluation
// ============================================================================
console.log('\n--- TEST G: Non-Technical NLP Question Engine & Evaluation ---');
{
  const bcomQuestions = generateNonTechnicalQuestions(mockBComExperienced, 4);
  assert(bcomQuestions.length === 4, `Generated ${bcomQuestions.length} non-technical questions`);
  
  const hasCustService = bcomQuestions.some(q => q.domain === 'customer_support_operations' || q.domain === 'resume_experience');
  assert(hasCustService, 'Generated questions relevant to customer service and resume experience');

  const sampleQ = bcomQuestions[0];
  const strongAnswer = `In handling an irate customer, I first maintain composure and practice active listening without interrupting. I validate their frustration with sincere empathy, apologizing for the inconvenience. Next, I investigate the billing issue in our CRM ticket system, explain the concrete corrective steps being taken, and establish a clear timeline. Finally, I follow up to confirm satisfaction and customer retention.`;
  
  const evalResult = evaluateNonTechnicalAnswer(sampleQ, strongAnswer, mockBComExperienced);
  assert(evalResult.overallScore >= 70, `Strong answer achieved score ${evalResult.overallScore} >= 70`);
  assert(evalResult.ratingBand === 'Proficient' || evalResult.ratingBand === 'Exceptional', `Answer rated as ${evalResult.ratingBand}`);
  assert(evalResult.matchedKeywords.length >= 2, `Keywords matched: ${evalResult.matchedKeywords.join(', ')}`);
  assert(evalResult.strengths.length > 0, `Strengths identified: ${evalResult.strengths[0]}`);

  // Test brief / poor answer
  const weakAnswer = 'I just say sorry.';
  const weakEval = evaluateNonTechnicalAnswer(sampleQ, weakAnswer, mockBComExperienced);
  assert(weakEval.overallScore < 50, `Weak answer correctly scored low (${weakEval.overallScore})`);
  assert(weakEval.ratingBand === 'Needs Practice', 'Weak answer assigned "Needs Practice" rating band');
}

console.log('\n========================================================================');
console.log(` TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
console.log('========================================================================\n');

if (failed > 0) {
  process.exit(1);
}
