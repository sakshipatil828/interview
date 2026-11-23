import {
  generateSevenMainHRQuestions,
  evaluateHRSatisfaction,
  handleCandidateQuestionInteraction,
  getInterviewClosingStatement,
  normalizeDepartment,
  SEVEN_MAIN_HR_QUESTIONS
} from '../src/nlp/hr/hrSevenQuestionEngine';
import { ParsedResume } from '../src/types';
import { evaluateHRAnswerLocally } from '../src/nlp/hr/hrAnswerEvaluator';
import { HRFollowUpRecord } from '../src/nlp/hr/types';

async function runTestSuite() {
console.log('================================================================');
console.log('CAREERCURVE REALISTIC COMPANY-STYLE 7-QUESTION HR INTERVIEW TEST');
console.log('================================================================\n');

let totalTests = 0;
let passedTests = 0;

function assert(condition: boolean, testName: string, detail?: string) {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`  [PASS] ${testName}`);
  } else {
    console.error(`  [FAIL] ${testName} ${detail ? `- ${detail}` : ''}`);
  }
}

// -----------------------------------------------------------------------------
// Test 1: Exactly 7 Canonical Questions in Dataset & Engine
// -----------------------------------------------------------------------------
console.log('\n--- SUITE 1: 7 CANONICAL QUESTION STRUCTURE ---');

assert(
  SEVEN_MAIN_HR_QUESTIONS.length === 7,
  'Dataset defines exactly 7 canonical HR question definitions',
  `Found ${SEVEN_MAIN_HR_QUESTIONS.length}`
);

const expectedTitles = [
  'Introduction',
  'Why should we hire you?',
  'Strengths and weaknesses',
  'Company interest',
  'Five-year goals',
  'challenge',
  'questions'
];

expectedTitles.forEach((keyword, idx) => {
  const qDef = SEVEN_MAIN_HR_QUESTIONS[idx];
  assert(
    !!qDef && (qDef.shortTitle.toLowerCase().includes(keyword.toLowerCase()) || qDef.progressTitle.toLowerCase().includes(keyword.toLowerCase())),
    `Question #${idx + 1} matches "${keyword}"`,
    `Found: ${qDef?.shortTitle} (${qDef?.progressTitle})`
  );
  assert(
    !!qDef?.expectedConcepts && qDef.expectedConcepts.length >= 3,
    `Question #${idx + 1} has defined expected evaluation concepts (${qDef?.expectedConcepts?.length})`
  );
  assert(
    !!qDef?.exampleStrongAnswer && qDef.exampleStrongAnswer.length > 50,
    `Question #${idx + 1} has comprehensive strong answer guide`
  );
});

// -----------------------------------------------------------------------------
// Test 2: Department & Company Personalization
// -----------------------------------------------------------------------------
console.log('\n--- SUITE 2: RESUME & COMPANY PERSONALIZATION ---');

const sampleCSEResume: ParsedResume = {
  fullName: 'Aditya Verma',
  email: 'aditya@example.com',
  phone: '9876543210',
  jobTitle: 'Software Engineering Graduate',
  summary: 'CSE student with expertise in React, Node.js, and Machine Learning.',
  department: 'Computer Science and Engineering',
  education: [{ institution: 'Anna University', degree: 'B.E. CSE', graduationYear: '2025' }],
  skills: [
    { category: 'Languages', skills: ['Python', 'TypeScript', 'SQL'] },
    { category: 'Frameworks', skills: ['React', 'Node.js', 'Express'] }
  ],
  rawSkillsList: ['Python', 'TypeScript', 'SQL', 'React', 'Node.js'],
  projects: [
    {
      title: 'Autonomous Drone Navigation System',
      description: 'Used computer vision and Node.js backend for telemetry tracking',
      technologies: ['Python', 'OpenCV', 'Node.js']
    }
  ],
  experience: [],
  certifications: [{ name: 'AWS Cloud Practitioner', issuer: 'Amazon' }]
};

const cseQuestionsWithCompany = generateSevenMainHRQuestions(sampleCSEResume, 'Google');
assert(
  cseQuestionsWithCompany.length === 7,
  'generateSevenMainHRQuestions produces exactly 7 questions for CSE candidate with company',
  `Length: ${cseQuestionsWithCompany.length}`
);

// Verify candidate name or department in Q1
const q1Text = cseQuestionsWithCompany[0].personalizedText;
assert(
  q1Text.includes('Aditya') || q1Text.includes('Computer Science'),
  'Q1 personalizes with candidate name or department',
  `Q1: ${q1Text}`
);

// Verify project title in Q1
assert(
  q1Text.includes('Autonomous Drone Navigation System'),
  'Q1 incorporates actual project from resume',
  `Q1: ${q1Text}`
);

// Verify company name in Q4
const q4Text = cseQuestionsWithCompany[3].personalizedText;
assert(
  q4Text.includes('Google'),
  'Q4 personalizes with target company "Google"',
  `Q4: ${q4Text}`
);

// Verify general mode fallback when no company specified
const cseQuestionsGeneral = generateSevenMainHRQuestions(sampleCSEResume, undefined);
const q4GeneralText = cseQuestionsGeneral[3].personalizedText;
assert(
  q4GeneralText.includes('organization') || q4GeneralText.includes('company') || q4GeneralText.includes('culture'),
  'Q4 falls back to general professional phrasing when target company is omitted',
  `Q4: ${q4GeneralText}`
);

// Multi-Department Verification (ECE, Mechanical, Civil)
const depts = [
  { dept: 'Electronics and Communication Engineering', expectedNorm: 'Electronics & Communication Engineering' },
  { dept: 'Mechanical Engineering', expectedNorm: 'Mechanical Engineering' },
  { dept: 'Civil Engineering', expectedNorm: 'Civil Engineering' }
];

depts.forEach(d => {
  const norm = normalizeDepartment(d.dept);
  assert(norm === d.expectedNorm, `Department normalizer maps "${d.dept}" to "${d.expectedNorm}"`);
  
  const testResume: ParsedResume = {
    ...sampleCSEResume,
    fullName: `Test ${d.expectedNorm} Candidate`,
    department: d.dept
  };
  const qs = generateSevenMainHRQuestions(testResume, 'Tata Motors');
  assert(
    qs.length === 7 && qs[3].personalizedText.includes('Tata Motors'),
    `Generated 7 customized questions for ${d.expectedNorm} targeting Tata Motors`
  );
});

// -----------------------------------------------------------------------------
// Test 3: Intelligent Answer Completeness & Follow-Up Logic
// -----------------------------------------------------------------------------
console.log('\n--- SUITE 3: SATISFACTION EVALUATION & FOLLOW-UP SYNTHESIS ---');

// Case 3A: Very short / shallow answer on Q1
const shallowQ1Answer = 'I am Aditya, a student. I know some programming.';
const q1Eval = evaluateHRSatisfaction(SEVEN_MAIN_HR_QUESTIONS[0], shallowQ1Answer, 0, sampleCSEResume, 'Google');

assert(
  q1Eval.isSatisfied === false,
  'Shallow Q1 answer is marked not satisfied',
  `Status: ${q1Eval.isSatisfied}, Score: ${q1Eval.score}`
);
assert(
  !!q1Eval.followUpQuestion && q1Eval.followUpQuestion.length > 10,
  'Follow-up question is generated for shallow Q1 answer',
  `Follow-up: ${q1Eval.followUpQuestion}`
);
assert(
  q1Eval.missingElements.length > 0,
  'Missing elements identified (e.g. project details, background depth)',
  `Missing: ${q1Eval.missingElements.join(', ')}`
);

// Case 3B: Follow-up cap at 2: when followUpCount is already 2, must transition without infinite loop
const q1EvalAtCap = evaluateHRSatisfaction(SEVEN_MAIN_HR_QUESTIONS[0], shallowQ1Answer, 2, sampleCSEResume, 'Google');
assert(
  q1EvalAtCap.isSatisfied === true || q1EvalAtCap.followUpQuestion === undefined,
  'At follow-up cap (2), engine stops asking follow-ups to avoid candidate exhaustion',
  `isSatisfied: ${q1EvalAtCap.isSatisfied}, followUpQuestion: ${q1EvalAtCap.followUpQuestion}`
);

// Case 3C: Comprehensive answer on Q1
const comprehensiveQ1Answer = `
Hello, thank you for having me. My name is Aditya Verma and I recently graduated with a B.E. in Computer Science and Engineering from Anna University. 
Throughout my academic journey, I built a strong foundation in core software engineering, data structures, and full-stack development with Python, TypeScript, and React. 
One of my key accomplishments was designing an Autonomous Drone Navigation System, where I developed real-time telemetry processing using Node.js and OpenCV. 
Beyond academics, I achieved AWS Cloud Practitioner certification and led our university coding club hackathon. 
I am eager to apply my technical and collaborative skills to build scalable software solutions.
`.trim();

const q1EvalComp = evaluateHRSatisfaction(SEVEN_MAIN_HR_QUESTIONS[0], comprehensiveQ1Answer, 0, sampleCSEResume, 'Google');
assert(
  q1EvalComp.isSatisfied === true,
  'Comprehensive Q1 answer meets satisfaction criteria on first attempt',
  `isSatisfied: ${q1EvalComp.isSatisfied}, score: ${q1EvalComp.score}`
);

// Case 3D: Q6 STAR Method validation
const incompleteQ6Answer = 'In my final year project, the drone was not communicating with the server properly.';
const q6EvalIncomplete = evaluateHRSatisfaction(SEVEN_MAIN_HR_QUESTIONS[5], incompleteQ6Answer, 0, sampleCSEResume, 'Google');
assert(
  q6EvalIncomplete.isSatisfied === false,
  'Q6 answer with only Situation and missing Action/Result triggers follow-up',
  `Follow-up: ${q6EvalIncomplete.followUpQuestion}`
);
assert(
  q6EvalIncomplete.missingElements.some(m => m.toLowerCase().includes('action') || m.toLowerCase().includes('resolution') || m.toLowerCase().includes('result')),
  'Q6 evaluation specifically notes missing Action or Result/Resolution',
  `Missing elements: ${q6EvalIncomplete.missingElements.join(', ')}`
);

const completeQ6Answer = `
During the development of our Autonomous Drone Navigation system, we encountered a critical challenge where high-frequency telemetry data overwhelmed our WebSocket server, causing packet drops. 
My task was to stabilize the communication channel without losing positional accuracy. 
I took the initiative to profile the network bottlenecks, implemented client-side data throttling with a rolling buffer, and batch-streamed coordinates every 50 milliseconds. 
As a result, we reduced server CPU utilization by 42% and achieved zero dropped packets during flight tests, allowing our team to complete the demonstration smoothly.
`.trim();

const q6EvalComplete = evaluateHRSatisfaction(SEVEN_MAIN_HR_QUESTIONS[5], completeQ6Answer, 0, sampleCSEResume, 'Google');
assert(
  q6EvalComplete.isSatisfied === true,
  'Complete STAR Q6 answer with Situation, Task, Action, and measurable Result is satisfied',
  `Score: ${q6EvalComplete.score}, missing: ${q6EvalComplete.missingElements.length}`
);

// -----------------------------------------------------------------------------
// Test 4: Question 7 Candidate Q&A Handling
// -----------------------------------------------------------------------------
console.log('\n--- SUITE 4: QUESTION 7 CANDIDATE Q&A INTERACTIONS ---');

// Mentorship query
const mentorReply = handleCandidateQuestionInteraction('What kind of mentorship or training is available for freshers?', 'Google');
assert(
  mentorReply.category === 'mentorship',
  'Recognizes mentorship and onboarding query',
  `Category: ${mentorReply.category}`
);
assert(
  mentorReply.aiAnswer.toLowerCase().includes('mentor') || mentorReply.aiAnswer.toLowerCase().includes('onboarding'),
  'Provides corporate answer regarding mentorship and guidance'
);

// Tech stack query
const techReply = handleCandidateQuestionInteraction('What technologies and engineering practices does your team use?', 'Google');
assert(
  techReply.category === 'tech_stack',
  'Recognizes tech stack and engineering practices query',
  `Category: ${techReply.category}`
);

// Culture query
const cultureReply = handleCandidateQuestionInteraction('Could you tell me about the team work culture and collaboration?', 'Google');
assert(
  cultureReply.category === 'culture',
  'Recognizes team culture and work environment query',
  `Category: ${cultureReply.category}`
);

// Growth / advancement query
const growthReply = handleCandidateQuestionInteraction('What does the career progression path look like for this position?', 'Google');
assert(
  growthReply.category === 'growth',
  'Recognizes career advancement and progression query',
  `Category: ${growthReply.category}`
);

// No questions scenario
const noQReply = handleCandidateQuestionInteraction('No, I do not have any questions at this moment. Everything was clear.', 'Google');
assert(
  noQReply.category === 'none',
  'Recognizes polite candidate statement with no questions asked',
  `Category: ${noQReply.category}`
);

// -----------------------------------------------------------------------------
// Test 5: Professional Closing Statement
// -----------------------------------------------------------------------------
console.log('\n--- SUITE 5: INTERVIEW CLOSING STATEMENT ---');

const closingStmt = getInterviewClosingStatement('Aditya', 'Google');
assert(
  closingStmt.includes('Aditya') && closingStmt.includes('Google'),
  'Closing statement includes candidate name and target company',
  `Closing: ${closingStmt}`
);
assert(
  closingStmt.toLowerCase().includes('next steps') || closingStmt.toLowerCase().includes('review'),
  'Closing statement provides transparent expectations for next steps'
);

// -----------------------------------------------------------------------------
// Test 6: Final Answer Evaluation Integration
// -----------------------------------------------------------------------------
console.log('\n--- SUITE 6: OVERALL EVALUATOR INTEGRATION ---');

const comprehensiveEval = await evaluateHRAnswerLocally(
  cseQuestionsWithCompany[0].question,
  comprehensiveQ1Answer,
  45,
  sampleCSEResume
);

assert(
  comprehensiveEval.overallScore >= 70,
  'Comprehensive answer achieves strong overall score',
  `Overall score: ${comprehensiveEval.overallScore}`
);
assert(
  comprehensiveEval.explanation.length > 0 && comprehensiveEval.strengths.length > 0,
  'Evaluation returns constructive feedback, strengths, and actionable improvement tips'
);

// -----------------------------------------------------------------------------
// SUMMARY
// -----------------------------------------------------------------------------
console.log('\n================================================================');
console.log(`TOTAL TESTS: ${totalTests} | PASSED: ${passedTests} | FAILED: ${totalTests - passedTests}`);
console.log('================================================================');

if (passedTests === totalTests) {
  console.log('\n>> SUCCESS: ALL REALISTIC HR INTERVIEW TESTS PASSED! <<\n');
  process.exit(0);
} else {
  console.error('\n>> FAILURE: SOME TESTS FAILED! <<\n');
  process.exit(1);
}
}

runTestSuite().catch(err => {
  console.error('Test suite failed with unexpected error:', err);
  process.exit(1);
});
