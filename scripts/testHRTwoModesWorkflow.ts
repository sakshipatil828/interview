/**
 * Automated Verification Suite: HR Two Modes (Mock Preparation & Practice Preparation)
 * Tests generation, domain relevance, target company adaptation, speech evaluation,
 * and storage isolation for Technical and Non-Technical candidates.
 */

import { generateHRMockQuestions, evaluateMockSpeechAnswer, HRMockQuestion } from '../src/nlp/hr/hrMockPreparationEngine';
import { generateSevenMainHRQuestions, SEVEN_MAIN_HR_QUESTIONS } from '../src/nlp/hr/hrSevenQuestionEngine';
import { ParsedResume } from '../src/types';
import { getUserHRMockProgress, saveUserHRMockProgress, clearUserHRMockProgress, HRMockProgressRecord } from '../src/services/authStorageService';

// In-memory localStorage mock for node execution
const memoryStorage: Record<string, string> = {};
(globalThis as any).localStorage = {
  getItem: (k: string) => memoryStorage[k] || null,
  setItem: (k: string, v: string) => { memoryStorage[k] = v; },
  removeItem: (k: string) => { delete memoryStorage[k]; },
  clear: () => { Object.keys(memoryStorage).forEach(k => delete memoryStorage[k]); }
};

let passedTests = 0;
let totalTests = 0;

function assert(condition: boolean, msg: string) {
  totalTests++;
  if (condition) {
    console.log(`  ✓ PASS: ${msg}`);
    passedTests++;
  } else {
    console.error(`  ✗ FAIL: ${msg}`);
    throw new Error(`Assertion failed: ${msg}`);
  }
}

console.log('================================================================');
console.log('TEST SUITE: CareerCurve HR Two Modes Verification');
console.log('================================================================\n');

// -----------------------------------------------------------------------------
// 1. Technical Fresher Candidate (B.Tech Computer Science)
// -----------------------------------------------------------------------------
console.log('TEST 1: Technical Fresher Candidate (B.Tech CSE)');
const techFresherResume: ParsedResume = {
  fullName: 'Rahul Sharma',
  email: 'rahul.sharma@example.com',
  phone: '+91 9876543210',
  department: 'Computer Science and Engineering',
  education: [
    {
      degree: 'B.Tech Computer Science and Engineering',
      institution: 'National Institute of Technology',
      graduationYear: '2024',
      cgpa: '8.8'
    }
  ],
  skills: [
    { name: 'Python', category: 'Programming Languages' },
    { name: 'React', category: 'Frameworks' },
    { name: 'PostgreSQL', category: 'Databases' },
    { name: 'Docker', category: 'Tools' }
  ],
  rawSkillsList: ['Python', 'React', 'PostgreSQL', 'Docker', 'REST APIs'],
  projects: [
    {
      title: 'Cloud-Native Task Analytics Engine',
      description: 'Distributed microservice built with Python and FastAPI for real-time task load metrics.',
      technologies: ['Python', 'FastAPI', 'Docker', 'PostgreSQL']
    }
  ],
  certifications: [{ name: 'AWS Certified Cloud Practitioner', issuer: 'Amazon Web Services', year: '2023' }],
  internships: [],
  employmentHistory: [],
  userSelectedCategory: 'technical',
  classification: {
    track: 'fresher',
    candidateType: 'FRESHER',
    isFresher: true,
    educationalCategory: 'technical',
    discipline: 'Computer Science and Engineering',
    isTechnical: true,
    userSelectedCategory: 'technical',
    graduationBatch: '2024',
    isGraduationDateConfirmed: true,
    recommendedPreparation: 'Technical Engineering Track',
    recommendedRounds: ['aptitude', 'technical', 'hr']
  },
  atsScore: 88,
  resumeScore: 90,
  matchRank: 'Top 10%',
  missingSkills: [],
  strongSkills: ['Python', 'React'],
  suggestedTechnologies: ['Kubernetes'],
  careerSuggestions: ['Software Engineer'],
  uploadedAt: new Date().toISOString(),
  fileName: 'rahul_sharma_tech.pdf'
};

const techMockQuestions = generateHRMockQuestions(techFresherResume, 'Google', false, false);
assert(techMockQuestions.length >= 8, `Technical Fresher generated ${techMockQuestions.length} mock questions (expected >= 8)`);

// Verify core required questions exist
const techQ1 = techMockQuestions.find(q => q.id === 'mock_q1_self_intro');
assert(Boolean(techQ1), 'Technical Fresher includes "Tell me about yourself" question');
assert(techQ1!.questionText.includes('engineering journey') || techQ1!.questionText.includes('engineering'), 'Q1 references engineering for technical candidate');
assert(techQ1!.fresherExample.includes('Rahul') && techQ1!.fresherExample.includes('B.Tech'), 'Q1 fresher sample answer references candidate degree and name');
assert(techQ1!.whyInterviewerAsks.length > 30, 'Q1 has detailed why-interviewer-asks recruiter intent');
assert(techQ1!.importantPoints.length >= 3, 'Q1 includes structured key points checklist');
assert(techQ1!.commonMistakes.length >= 3, 'Q1 includes common mistakes to avoid');
assert(techQ1!.tipsForImproving.length >= 2, 'Q1 includes verbal delivery tips');

// Verify technical domain question exists
const techDomainQ = techMockQuestions.find(q => q.id === 'mock_q6_technical_project' || q.category === 'domain');
assert(Boolean(techDomainQ), 'Technical candidate includes domain-specific project architecture question');
assert(techDomainQ!.questionText.includes('Cloud-Native Task Analytics Engine') || techDomainQ!.questionText.includes('technical'), 'Domain question personalized with technical project');

// -----------------------------------------------------------------------------
// 2. Non-Technical Candidate (B.Com Customer Support / Office Admin)
// -----------------------------------------------------------------------------
console.log('\nTEST 2: Non-Technical Fresher Candidate (B.Com / Customer Support)');
const nonTechResume: ParsedResume = {
  fullName: 'Ananya Sharma',
  email: 'ananya.sharma@example.com',
  phone: '+91 9876543211',
  department: 'Bachelor of Commerce (B.Com)',
  education: [
    {
      degree: 'Bachelor of Commerce (B.Com)',
      institution: 'Delhi University',
      graduationYear: '2024',
      cgpa: '8.4'
    }
  ],
  skills: [
    { name: 'Customer Communication', category: 'Interpersonal' },
    { name: 'MS Excel', category: 'Tools' },
    { name: 'Office Administration', category: 'Operations' },
    { name: 'Billing & Invoicing', category: 'Finance' }
  ],
  rawSkillsList: ['Customer Communication', 'MS Excel', 'Active Listening', 'Email Writing', 'Billing'],
  projects: [
    {
      title: 'Customer Satisfaction Survey and Feedback Analysis',
      description: 'Conducted survey for 200 retail consumers and created spreadsheet models in MS Excel.',
      technologies: ['MS Excel', 'Google Forms', 'Data Organization']
    }
  ],
  certifications: [{ name: 'Certified Office Administration Specialist', issuer: 'National Skills Council', year: '2023' }],
  internships: [],
  employmentHistory: [],
  userSelectedCategory: 'non_technical',
  classification: {
    track: 'fresher',
    candidateType: 'FRESHER',
    isFresher: true,
    educationalCategory: 'non_technical',
    discipline: 'Commerce & Accounting',
    isTechnical: false,
    userSelectedCategory: 'non_technical',
    graduationBatch: '2024',
    isGraduationDateConfirmed: true,
    recommendedPreparation: 'Non-Technical Career Track',
    recommendedRounds: ['aptitude', 'communication', 'hr']
  },
  atsScore: 84,
  resumeScore: 86,
  matchRank: 'Top 15%',
  missingSkills: [],
  strongSkills: ['Customer Communication', 'MS Excel'],
  suggestedTechnologies: [],
  careerSuggestions: ['Customer Support Specialist', 'Operations Executive'],
  uploadedAt: new Date().toISOString(),
  fileName: 'ananya_bcom.pdf'
};

const nonTechMockQuestions = generateHRMockQuestions(nonTechResume, 'Deloitte', true, false);
assert(nonTechMockQuestions.length >= 8, `Non-Technical candidate generated ${nonTechMockQuestions.length} mock questions`);

const nonTechQ1 = nonTechMockQuestions.find(q => q.id === 'mock_q1_self_intro');
assert(Boolean(nonTechQ1), 'Non-technical candidate includes "Tell me about yourself"');
assert(!nonTechQ1!.questionText.includes('engineering journey'), 'Non-technical Q1 strictly omits engineering phrasing');
assert(nonTechQ1!.questionText.includes('professional journey'), 'Non-technical Q1 uses professional phrasing');
assert(nonTechQ1!.fresherExample.includes('Commerce') || nonTechQ1!.fresherExample.includes('B.Com'), 'Non-technical sample answer reflects commerce/operations background');

// Verify non-tech domain question exists
const nonTechDomainQ = nonTechMockQuestions.find(q => q.id === 'mock_q6_customer_handling');
assert(Boolean(nonTechDomainQ), 'Non-technical candidate includes customer handling & de-escalation question');
assert(nonTechDomainQ!.questionText.includes('customer') || nonTechDomainQ!.questionText.includes('client'), 'Non-technical question focuses on customer/client interactions');
assert(nonTechDomainQ!.structureFramework.includes('L.A.S.T.') || nonTechDomainQ!.structureFramework.includes('STAR'), 'Customer handling incorporates service frameworks');

// Verify Practice Preparation Questions for Non-Tech
const nonTechPracticeQuestions = generateSevenMainHRQuestions(nonTechResume, 'Deloitte', 'Intermediate');
assert(nonTechPracticeQuestions.length === 7, `Non-technical Practice Preparation generates exactly 7 questions`);
assert(!nonTechPracticeQuestions[0].personalizedText.includes('engineering'), 'Non-technical Practice Q1 does not mention engineering');
assert(nonTechPracticeQuestions[0].personalizedText.includes('Commerce'), 'Non-technical Practice Q1 mentions Commerce');

// -----------------------------------------------------------------------------
// 3. Experienced Candidate Adaptation
// -----------------------------------------------------------------------------
console.log('\nTEST 3: Experienced Candidate Adaptation');
const techExpResume: ParsedResume = {
  ...techFresherResume,
  employmentHistory: [
    {
      company: 'Infosys Ltd',
      role: 'Senior Software Engineer',
      duration: '2.5 years',
      description: 'Architected distributed backend APIs and led sprint execution for payments squad.'
    }
  ],
  classification: {
    ...techFresherResume.classification!,
    track: 'experienced',
    candidateType: 'EXPERIENCED PREPARATION TRACK',
    isFresher: false
  }
};

const expMockQuestions = generateHRMockQuestions(techExpResume, 'Microsoft', false, true);
const expQ1 = expMockQuestions.find(q => q.id === 'mock_q1_self_intro');
assert(expQ1!.experiencedExample.includes('software engineer with over 2 years') || expQ1!.experiencedExample.includes('professional industry experience'), 'Experienced sample answer includes professional industry experience');

// -----------------------------------------------------------------------------
// 4. Target Company Adaptation
// -----------------------------------------------------------------------------
console.log('\nTEST 4: Target Company Adaptation');
const googleMockQ4 = techMockQuestions.find(q => q.id === 'mock_q4_company_interest');
assert(googleMockQ4!.questionText.includes('Google'), 'Question 4 is customized for Google');
assert(googleMockQ4!.importantPoints[0].includes('Google'), 'Important points mention Google');
assert(googleMockQ4!.fresherExample.includes('Google'), 'Fresher sample answer mentions Google');

const genericMock = generateHRMockQuestions(techFresherResume, '', false, false);
const genericQ4 = genericMock.find(q => q.id === 'mock_q4_company_interest');
assert(genericQ4!.questionText.includes('our company') || genericQ4!.questionText.includes('our organization'), 'General company defaults cleanly without undefined/null strings');

// -----------------------------------------------------------------------------
// 5. Speech Answer Evaluation Engine (NLP)
// -----------------------------------------------------------------------------
console.log('\nTEST 5: Speech Answer Evaluation Engine');

const strongAnswer = "To answer your question, my greatest strength is analytical root-cause debugging. During our semester capstone project, when our database pool hung under load, I set up request tracing and isolated high latency to unindexed foreign keys. I refactored the queries with indexing, which boosted system throughput by 55%. A weakness I identified earlier was hesitating to delegate tasks, but I have adopted daily stand-up check-ins to communicate milestones early.";
const evalResult = evaluateMockSpeechAnswer(techMockQuestions[2], strongAnswer, false);

assert(evalResult.score >= 70, `Strong answer received score ${evalResult.score} (expected >= 70)`);
assert(evalResult.hasOpening && evalResult.hasEvidenceOrExample && evalResult.hasConclusion, 'Strong answer correctly identified opening, evidence/example, and conclusion structure');
assert(evalResult.matchedKeywords.length >= 2, `Matched keywords count: ${evalResult.matchedKeywords.length}`);
assert(evalResult.actionableSuggestions.length >= 1, 'Provides actionable suggestions');

const weakAnswer = "I know Python and I work hard.";
const weakEval = evaluateMockSpeechAnswer(techMockQuestions[0], weakAnswer, false);
assert(weakEval.score < 50, `Weak answer received low score ${weakEval.score} (expected < 50)`);
assert(weakEval.overallRating === 'Needs Practice', `Weak answer rated as ${weakEval.overallRating}`);
assert(weakEval.feedback.length > 20, 'Weak answer has constructive feedback');

// -----------------------------------------------------------------------------
// 6. Auth Storage Isolation (Mock Progress vs Practice Sessions)
// -----------------------------------------------------------------------------
console.log('\nTEST 6: Storage Isolation');
const testUserId = 'test_user_777';
clearUserHRMockProgress(testUserId);

const initialProgress = getUserHRMockProgress(testUserId);
assert(initialProgress === null, 'Initial mock progress is null when cleared');

const sampleProgress: HRMockProgressRecord = {
  completedQuestionIds: ['mock_q1_self_intro', 'mock_q2_why_hire'],
  viewedAnswerIds: ['mock_q1_self_intro'],
  practiceSpeechRecordings: {
    'mock_q1_self_intro': {
      transcript: strongAnswer,
      score: 85,
      feedback: 'Excellent response with clear structure',
      timestamp: new Date().toISOString()
    }
  },
  targetCompany: 'Google',
  updatedAt: new Date().toISOString()
};

saveUserHRMockProgress(testUserId, sampleProgress);
const retrievedProgress = getUserHRMockProgress(testUserId);
assert(retrievedProgress.completedQuestionIds.length === 2, 'Retrieved mock progress contains 2 completed questions');
assert(retrievedProgress.targetCompany === 'Google', 'Retrieved mock progress contains target company');
assert(retrievedProgress.practiceSpeechRecordings['mock_q1_self_intro'].score === 85, 'Retrieved recorded speech practice score');

// Ensure mock progress is NOT stored in official interview session keys
const rawSessions = localStorage.getItem(`careercurve:user:${testUserId}:sessions`);
assert(!rawSessions || !rawSessions.includes('mock_q1_self_intro'), 'Mock progress does not write fake completed interview sessions into official session storage');

console.log('\n================================================================');
console.log(`ALL TESTS PASSED: ${passedTests}/${totalTests}`);
console.log('================================================================');
