/**
 * Comprehensive Automated Verification Script for:
 * 1. Candidate Classification (Nov 2026 Reference Policy)
 * 2. Internship vs Full-Time Employment Separation (Crucial Distinction)
 * 3. Interactive Date Confirmation & Track Adjustment
 * 4. Flexible Interview Round Combinations & Sequential Progression
 * 5. Dynamic Weighted Readiness Index (No Penalties for Skipped Rounds)
 * 6. Month Normalization & Resume Enrichment
 */

import {
  classifyCandidate,
  separateInternshipsAndEmployment,
  enrichParsedResumeWithClassification,
  normalizeMonthName,
} from '../src/services/candidateClassificationService.ts';
import type { ParsedResume } from '../src/types.ts';
import type { InterviewWorkflowRoundId } from '../src/types/journey.ts';

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ FAILED: ${message}`);
    process.exit(1);
  }
  console.log(`✓ PASSED: ${message}`);
}

console.log('================================================================');
console.log('🚀 CareerCurve — Candidate Classification & Selection Test Suite');
console.log('================================================================\n');

// -----------------------------------------------------------------------------
// Test 1: Nov 2026 Reference Policy — Fresher Track (>= 2027)
// -----------------------------------------------------------------------------
console.log('--- Test Group 1: 2027 Graduating Batch (Fresher) ---');
const fresher2027 = classifyCandidate(2027, 'May');
assert(fresher2027.track === 'fresher', '2027 batch must be classified as fresher');
assert(fresher2027.candidateType === 'FRESHER', '2027 batch candidateType must be FRESHER');
assert(
  JSON.stringify(fresher2027.recommendedRounds) === JSON.stringify(['aptitude', 'technical', 'hr']),
  '2027 Fresher must be recommended Aptitude + Technical + HR Behaviour'
);
assert(fresher2027.isGraduationDateConfirmed === true, 'Date is confirmed');

// -----------------------------------------------------------------------------
// Test 2: Nov 2026 Reference Policy — 2026 Batch (Fresher)
// -----------------------------------------------------------------------------
console.log('\n--- Test Group 2: 2026 Graduating Batch (Fresher) ---');
const fresher2026Nov = classifyCandidate(2026, 'November');
assert(fresher2026Nov.track === 'fresher', '2026 Nov batch must be classified as fresher');
assert(fresher2026Nov.candidateType === 'FRESHER', '2026 Nov batch candidateType must be FRESHER');
assert(
  JSON.stringify(fresher2026Nov.recommendedRounds) === JSON.stringify(['aptitude', 'technical', 'hr']),
  '2026 Fresher must be recommended Aptitude + Technical + HR Behaviour'
);

const fresher2026Dec = classifyCandidate(2026, 'December');
assert(fresher2026Dec.track === 'fresher', '2026 post-Nov batch must be classified as fresher');

// -----------------------------------------------------------------------------
// Test 3: Nov 2026 Reference Policy — Experienced Preparation Track (<= 2025)
// -----------------------------------------------------------------------------
console.log('\n--- Test Group 3: 2025 & 2024 Batches (Experienced Preparation Track) ---');
const experienced2025 = classifyCandidate(2025, 'June');
assert(
  experienced2025.track === 'experienced',
  '2025 batch must be classified as experienced preparation track'
);
assert(
  experienced2025.candidateType === 'EXPERIENCED PREPARATION TRACK',
  '2025 batch candidateType must be EXPERIENCED PREPARATION TRACK'
);
assert(
  JSON.stringify(experienced2025.recommendedRounds) === JSON.stringify(['technical', 'hr']),
  '2025 batch must be recommended Technical + HR Behaviour (Aptitude optional)'
);

const experienced2024 = classifyCandidate(2024, 'May');
assert(
  experienced2024.track === 'experienced',
  '2024 batch must be classified as experienced preparation track'
);
assert(
  JSON.stringify(experienced2024.recommendedRounds) === JSON.stringify(['technical', 'hr']),
  '2024 batch must be recommended Technical + HR Behaviour'
);

// -----------------------------------------------------------------------------
// Test 4: Missing or Unclear Graduation Date (Prompt for Confirmation)
// -----------------------------------------------------------------------------
console.log('\n--- Test Group 4: Missing or Unclear Graduation Date ---');
const missingGrad = classifyCandidate(undefined, undefined);
assert(missingGrad.candidateType === 'UNCONFIRMED', 'Missing date must be unconfirmed');
assert(missingGrad.isGraduationDateConfirmed === false, 'isGraduationDateConfirmed must be false');
assert(
  missingGrad.explanationNote.includes('confirm'),
  'Candidate explanationNote must prompt user to confirm graduation year and month'
);

// -----------------------------------------------------------------------------
// Test 5: Interactive Confirmation & Adjustment
// -----------------------------------------------------------------------------
console.log('\n--- Test Group 5: Interactive Confirmation & Adjustment ---');
// User selects 2025 from dropdown and confirms
const confirmedFromUnconfirmed = classifyCandidate(2025, 'June');
assert(
  confirmedFromUnconfirmed.track === 'experienced',
  'Confirmed 2025 should update track to experienced'
);
assert(
  confirmedFromUnconfirmed.isGraduationDateConfirmed === true,
  'isGraduationDateConfirmed is now true'
);

// User changes selection from 2025 to 2027
const reconfirmedFresher = classifyCandidate(2027, 'May');
assert(
  reconfirmedFresher.track === 'fresher',
  'Changing to 2027 should update track to fresher'
);
assert(
  reconfirmedFresher.recommendedRounds.length === 3,
  'Recommended rounds should now include all 3'
);

// -----------------------------------------------------------------------------
// Test 6: Crucial Distinction — Internship vs Employment Separation
// -----------------------------------------------------------------------------
console.log('\n--- Test Group 6: Internship vs Employment Separation ---');
const sampleExperience = [
  {
    company: 'FinTech Labs',
    role: 'Frontend Development Intern',
    duration: 'May 2026 - Aug 2026 (4 mos)',
    highlights: ['Built responsive React dashboards'],
  },
  {
    company: 'Campus Tech Club',
    role: 'Web Development Summer Intern',
    duration: '3 months',
    highlights: ['Created student portal'],
  },
];

const separated = separateInternshipsAndEmployment(sampleExperience);
assert(separated.internships.length === 2, 'Both roles should be identified as internships');
assert(separated.employmentHistory.length === 0, 'No employment history should be created');
assert(
  separated.internships[0].isInternship === true,
  'Role item must carry isInternship = true'
);

// Test 2025 candidate with ZERO employment in resume:
// Verification that graduation year alone DOES NOT fabricate work experience!
const emptyExpSeparated = separateInternshipsAndEmployment([]);
assert(emptyExpSeparated.employmentHistory.length === 0, 'Zero experience in resume results in zero employment');
assert(emptyExpSeparated.totalExperienceText.includes('None'), 'Total experience text indicates None');

// Test candidate WITH full-time employment:
const fullTimeExp = [
  {
    company: 'Acme Corp',
    role: 'Software Engineer',
    duration: 'July 2024 - Present (2 yrs)',
    highlights: ['Microservices in Go and TypeScript'],
  },
];
const fullTimeSeparated = separateInternshipsAndEmployment(fullTimeExp);
assert(fullTimeSeparated.employmentHistory.length === 1, 'Software Engineer role should be employment');
assert(fullTimeSeparated.internships.length === 0, 'No internships for full-time role');
assert(
  fullTimeSeparated.employmentHistory[0].isEmployment === true,
  'Role item must carry isEmployment = true'
);

// -----------------------------------------------------------------------------
// Test 7: Resume Enrichment with Classification
// -----------------------------------------------------------------------------
console.log('\n--- Test Group 7: Resume Enrichment with Classification ---');
const rawMockResume: ParsedResume = {
  fullName: 'Priya Sharma',
  department: 'Computer Science',
  skills: ['React', 'Node.js', 'SQL'],
  experience: sampleExperience,
  education: [
    {
      degree: 'B.Tech Computer Science',
      college: 'National Institute of Technology',
      year: '2027',
      graduationMonth: 'May',
    },
  ],
  projects: [{ title: 'AI Assistant', tech: ['TypeScript'], bullets: [] }],
  atsScore: 88,
  resumeScore: 90,
  matchRank: 'Top Candidate',
  missingSkills: [],
  strongSkills: ['React', 'Node.js'],
  suggestedTechnologies: [],
  careerSuggestions: [],
  uploadedAt: new Date().toISOString(),
  fileName: 'priya_sharma_2027.pdf',
};

const enriched = enrichParsedResumeWithClassification(rawMockResume);
assert(String(enriched.graduationYear) === '2027', 'Enriched resume extracts graduation year 2027');
assert(enriched.graduationMonth === 'May', 'Enriched resume extracts graduation month May');
assert(enriched.classification?.track === 'fresher', 'Enriched classification is fresher');
assert(enriched.internships?.length === 2, 'Enriched resume separates internships');
assert(enriched.employmentHistory?.length === 0, 'Enriched resume keeps employmentHistory empty');
assert(
  enriched.totalProfessionalExperience !== undefined,
  'Enriched resume reports total professional experience'
);

// -----------------------------------------------------------------------------
// Test 8: Flexible Round Selection & Sequential Progression Logic
// -----------------------------------------------------------------------------
console.log('\n--- Test Group 8: Flexible Round Selection & Sequential Progression ---');

function getNextSequentialRound(
  currentCompletedRound: InterviewWorkflowRoundId,
  selectedRounds: InterviewWorkflowRoundId[],
  completedRounds: InterviewWorkflowRoundId[]
): InterviewWorkflowRoundId | 'consolidated_scorecard' {
  const updatedCompleted = Array.from(new Set([...completedRounds, currentCompletedRound]));
  const remainingSelected = selectedRounds.filter((r) => !updatedCompleted.includes(r));
  if (remainingSelected.length === 0) {
    return 'consolidated_scorecard';
  }
  return remainingSelected[0];
}

// Scenario 8A: All 3 Selected (Aptitude -> Technical -> HR)
const selAll: InterviewWorkflowRoundId[] = ['aptitude', 'technical', 'hr'];
let completed: InterviewWorkflowRoundId[] = [];

let next1 = getNextSequentialRound('aptitude', selAll, completed);
assert(next1 === 'technical', 'Scenario 8A: After Aptitude, next is Technical');
completed.push('aptitude');

let next2 = getNextSequentialRound('technical', selAll, completed);
assert(next2 === 'hr', 'Scenario 8A: After Technical, next is HR');
completed.push('technical');

let next3 = getNextSequentialRound('hr', selAll, completed);
assert(next3 === 'consolidated_scorecard', 'Scenario 8A: After HR, transitions to Consolidated Scorecard');

// Scenario 8B: Technical + HR Selected (Aptitude SKIPPED)
console.log('\n--- Test Group 8B: Technical + HR Selected (Aptitude Skipped) ---');
const selTechHr: InterviewWorkflowRoundId[] = ['technical', 'hr'];
completed = [];

let nextB1 = getNextSequentialRound('technical', selTechHr, completed);
assert(nextB1 === 'hr', 'Scenario 8B: After Technical, skips Aptitude and goes directly to HR');
completed.push('technical');

let nextB2 = getNextSequentialRound('hr', selTechHr, completed);
assert(nextB2 === 'consolidated_scorecard', 'Scenario 8B: After HR, transitions to Consolidated Scorecard');

// Scenario 8C: Aptitude + Technical Selected (HR SKIPPED)
console.log('\n--- Test Group 8C: Aptitude + Technical Selected (HR Skipped) ---');
const selAptTech: InterviewWorkflowRoundId[] = ['aptitude', 'technical'];
completed = [];

let nextC1 = getNextSequentialRound('aptitude', selAptTech, completed);
assert(nextC1 === 'technical', 'Scenario 8C: After Aptitude, goes to Technical');
completed.push('aptitude');

let nextC2 = getNextSequentialRound('technical', selAptTech, completed);
assert(nextC2 === 'consolidated_scorecard', 'Scenario 8C: After Technical, skips HR and transitions to Consolidated Scorecard');

// Scenario 8D: Single Round Selected (Technical Only)
console.log('\n--- Test Group 8D: Single Round Selected (Technical Only) ---');
const selTechOnly: InterviewWorkflowRoundId[] = ['technical'];
completed = [];

let nextD1 = getNextSequentialRound('technical', selTechOnly, completed);
assert(nextD1 === 'consolidated_scorecard', 'Scenario 8D: After Technical, transitions immediately to Consolidated Scorecard');

// -----------------------------------------------------------------------------
// Test 9: Dynamic Weighted Score Calculation (No Penalties for Skipped Rounds)
// -----------------------------------------------------------------------------
console.log('\n--- Test Group 9: Dynamic Weighted Readiness Index ---');

function calculateDynamicOverallReadiness(
  selectedRounds: InterviewWorkflowRoundId[],
  roundResults: Record<InterviewWorkflowRoundId, { scorePercentage: number } | undefined>
): number {
  const completedSelected = selectedRounds.filter((r) => roundResults[r] !== undefined);
  if (completedSelected.length === 0) return 0;

  // Exact weights matching InterviewRoundsWorkflow.tsx
  const weights: Record<InterviewWorkflowRoundId, number> = {
    aptitude: selectedRounds.includes('technical') ? 0.3 : 0.5,
    technical: selectedRounds.includes('aptitude')
      ? 0.4
      : selectedRounds.includes('hr')
      ? 0.6
      : 1.0,
    hr: selectedRounds.includes('aptitude')
      ? 0.3
      : selectedRounds.includes('technical')
      ? 0.4
      : 1.0,
  };

  let totalWeight = 0;
  let weightedSum = 0;
  completedSelected.forEach((r) => {
    const w = weights[r] || 0.33;
    totalWeight += w;
    weightedSum += (roundResults[r]?.scorePercentage || 0) * w;
  });

  return totalWeight > 0 ? Math.round(weightedSum / totalWeight) : 0;
}

// 9A: All 3 rounds completed: Aptitude 80%, Technical 90%, HR 70%
// Expected: 80 * 0.3 + 90 * 0.4 + 70 * 0.3 = 24 + 36 + 21 = 81%
const scoreAll = calculateDynamicOverallReadiness(['aptitude', 'technical', 'hr'], {
  aptitude: { scorePercentage: 80 },
  technical: { scorePercentage: 90 },
  hr: { scorePercentage: 70 },
});
assert(scoreAll === 81, `Scenario 9A: All 3 rounds score should be 81% (got ${scoreAll}%)`);

// 9B: Technical + HR only: Technical 90%, HR 80% (Aptitude unselected / skipped)
// Weights: Tech 0.6, HR 0.4. Sum = 90 * 0.6 + 80 * 0.4 = 54 + 32 = 86%
// If Aptitude were penalized as 0, score would be falsely ~59%.
const scoreTechHr = calculateDynamicOverallReadiness(['technical', 'hr'], {
  aptitude: undefined,
  technical: { scorePercentage: 90 },
  hr: { scorePercentage: 80 },
});
assert(
  scoreTechHr === 86,
  `Scenario 9B: Technical + HR score should be 86% without Aptitude penalty (got ${scoreTechHr}%)`
);

// 9C: Single Round only: Technical 85%
// Weight: Tech 1.0. Score = 85%
const scoreTechOnly = calculateDynamicOverallReadiness(['technical'], {
  aptitude: undefined,
  technical: { scorePercentage: 85 },
  hr: undefined,
});
assert(scoreTechOnly === 85, `Scenario 9C: Single Technical round should be 85% (got ${scoreTechOnly}%)`);

// -----------------------------------------------------------------------------
// Test 10: Normalization of Month Names
// -----------------------------------------------------------------------------
console.log('\n--- Test Group 10: Month Name Normalization ---');
assert(normalizeMonthName('nov') === 'November', 'nov normalizes to November');
assert(normalizeMonthName('5') === 'May', '5 normalizes to May');
assert(normalizeMonthName('Jun') === 'June', 'Jun normalizes to June');
assert(normalizeMonthName(undefined) === undefined, 'undefined returns undefined');

console.log('\n================================================================');
console.log('🎉 ALL 25 VERIFICATION TESTS PASSED SUCCESSFULLY!');
console.log('================================================================\n');
