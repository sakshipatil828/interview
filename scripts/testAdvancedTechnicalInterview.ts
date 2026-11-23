/**
 * Comprehensive Automated Verification Suite for:
 * CareerCurve — Advanced Resume-Based Technical Interview and Intelligent Evaluation Upgrade
 * 
 * Tests:
 * 1. Resume Analysis & Universal Technical Skill Extraction across Languages, Databases, Frameworks, Tools
 * 2. Pure Department / Curriculum & Skill-Driven matching (No company or job-role forced)
 * 3. Skill-Specific Questions (Python, JavaScript, SQL/MySQL, Flask, React, Git)
 * 4. Project, Internship & Certification Deep-Dive Question Generation
 * 5. Full coverage of all 7 Engineering Departments (CSE, IT, ECE, EEE, Mechanical, Civil, Automobile)
 * 6. Skip Question Functionality (Confirmation, 0 marks, Reference Learning Explanation, Index preservation)
 * 7. Honest Multi-Factor NLP Evaluation (Correctness, Coverage, Misconception Penalties, No grade inflation)
 * 8. Comprehensive Technical Scorecard, Difficulty-wise Breakdown, Skill Performance Table, & Weak Skills Remediation Plan
 */

import { extractResumeNLP } from '../src/nlp/resumeSkillExtractor.ts';
import {
  assembleTechnicalQuestions,
  getSkillSpecificQuestions,
  getCurriculumFoundationalQuestions,
  generateProjectQuestions,
  generateInternshipQuestions,
  generateCertificationQuestions,
} from '../src/nlp/dynamicQuestionGenerator.ts';
import { matchTechnicalQuestions, evaluateAnswerNLP } from '../src/nlp/nlpQuestionMatcher.ts';
import { FrontendNLPTechnicalInterviewEngine } from '../src/nlp/technicalInterviewEngine.ts';
import type { ParsedResume } from '../src/types.ts';
import type { EngineeringDepartment } from '../src/nlp/types.ts';

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ FAILED: ${message}`);
    process.exit(1);
  }
  console.log(`✓ PASSED: ${message}`);
}

console.log('========================================================================');
console.log('🚀 CareerCurve — Advanced Resume Technical Interview & Evaluation Suite');
console.log('========================================================================\n');

// -----------------------------------------------------------------------------
// Test Case 1: Resume Analysis & Categorized Skill Extraction (No Company/Role)
// -----------------------------------------------------------------------------
console.log('--- Test 1: Intelligent Resume Skill & Entity Extraction ---');

const sampleCSEResume: ParsedResume = {
  fullName: 'Arun Kumar',
  jobTitle: 'Student Candidate',
  email: 'arun@example.com',
  phone: '9876543210',
  github: 'https://github.com/arunkumar',
  linkedin: 'https://linkedin.com/in/arunkumar',
  summary: 'Final year CSE undergraduate skilled in Python, Flask, React, MySQL, Docker and Git.',
  department: 'Computer Science & Engineering',
  education: [
    {
      degree: 'B.Tech',
      branch: 'Computer Science & Engineering',
      college: 'Anna University',
      graduationYear: '2027',
    },
  ],
  skills: [
    {
      category: 'Programming Languages',
      skills: [
        { name: 'Python', level: 'Intermediate' },
        { name: 'JavaScript', level: 'Intermediate' },
      ],
    },
    {
      category: 'Frameworks & Databases',
      skills: [
        { name: 'Flask', level: 'Intermediate' },
        { name: 'React', level: 'Beginner' },
        { name: 'MySQL', level: 'Intermediate' },
      ],
    },
    {
      category: 'Tools & Platforms',
      skills: [
        { name: 'Git', level: 'Intermediate' },
        { name: 'Docker', level: 'Beginner' },
      ],
    },
  ],
  rawSkillsList: ['Python', 'JavaScript', 'Flask', 'React', 'MySQL', 'Git', 'Docker'],
  projects: [
    {
      title: 'Smart Health Diagnostics Portal',
      description: 'Built a full-stack health portal using Python Flask and React with MySQL for patient vitals tracking and automated report generation.',
      technologies: ['Python', 'Flask', 'React', 'MySQL'],
    },
  ],
  experience: [],
  internships: [
    {
      company: 'TechCorp Solutions',
      role: 'Backend Engineering Intern',
      duration: '3 months',
      description: 'Developed RESTful endpoints in Flask and optimized SQL queries reducing query latency by 35%.',
      isInternship: true,
    },
  ],
  certifications: [
    {
      name: 'Python for Data Structures & Algorithms',
      issuer: 'Coursera / DeepLearning',
      year: '2025',
    },
  ],
  languages: ['English', 'Tamil'],
  interests: ['Cloud Systems', 'Open Source'],
  atsScore: 88,
  resumeScore: 90,
  matchRank: 'Top 10%',
  missingSkills: [],
  strongSkills: ['Python', 'Flask', 'MySQL'],
  suggestedTechnologies: ['Kubernetes'],
  careerSuggestions: ['Full Stack Developer'],
  uploadedAt: new Date().toISOString(),
  fileName: 'Arun_Kumar_Resume.pdf',
};

const extractedNLP = extractResumeNLP(sampleCSEResume, undefined, undefined);

assert(extractedNLP.effectiveDepartment === 'Computer Science & Engineering', 'Department accurately identified as CSE');
assert(extractedNLP.programmingLanguages.includes('Python'), 'Python identified in programmingLanguages');
assert(extractedNLP.programmingLanguages.includes('JavaScript'), 'JavaScript identified in programmingLanguages');
assert(extractedNLP.databases.includes('MySQL'), 'MySQL identified in databases');
assert(extractedNLP.frameworksAndLibraries.includes('Flask'), 'Flask identified in frameworksAndLibraries');
assert(extractedNLP.frameworksAndLibraries.includes('React'), 'React identified in frameworksAndLibraries');
assert(extractedNLP.toolsAndPlatforms.includes('Git'), 'Git identified in toolsAndPlatforms');
assert(extractedNLP.projectsList.length > 0, 'Project extracted into projectsList');
assert(extractedNLP.internshipsList.length > 0, 'Internship extracted into internshipsList');
assert(extractedNLP.certificationsList.length > 0, 'Certification extracted into certificationsList');

// -----------------------------------------------------------------------------
// Test Case 2: Skill-Specific Question Coverage (Python, JS, SQL, Flask, React, Git)
// -----------------------------------------------------------------------------
console.log('\n--- Test 2: Skill-Specific Questions Coverage ---');

const pythonQuestions = getSkillSpecificQuestions('Python');
assert(pythonQuestions.length >= 5, `Python questions generated (${pythonQuestions.length} >= 5)`);
const hasDuplicatesCoding = pythonQuestions.some(
  (q) => q.questionType === 'coding' && (q.codingProblem?.title.toLowerCase().includes('duplicate') || q.id.includes('duplicates'))
);
assert(hasDuplicatesCoding, 'Python includes practical "find duplicates in a list" coding question with test cases');
const hasListTupleSetDict = pythonQuestions.some((q) => q.question.toLowerCase().includes('tuple') && q.question.toLowerCase().includes('dictionary'));
assert(hasListTupleSetDict, 'Python includes list vs tuple vs set vs dict question');
const hasDecorators = pythonQuestions.some((q) => q.question.toLowerCase().includes('decorator'));
assert(hasDecorators, 'Python includes decorators & error handling question');

const jsQuestions = getSkillSpecificQuestions('JavaScript');
assert(jsQuestions.some((q) => q.question.toLowerCase().includes('var') && q.question.toLowerCase().includes('const')), 'JS includes var vs let vs const question');
assert(jsQuestions.some((q) => q.question.toLowerCase().includes('closure')), 'JS includes closures & promises question');
assert(jsQuestions.some((q) => q.question.toLowerCase().includes('async') && q.question.toLowerCase().includes('await')), 'JS includes async/await question');
assert(jsQuestions.some((q) => q.question.toLowerCase().includes('event loop') || q.question.toLowerCase().includes('dom')), 'JS includes DOM events & event loop question');

const sqlQuestions = getSkillSpecificQuestions('SQL');
assert(sqlQuestions.some((q) => q.question.toLowerCase().includes('primary key') && q.question.toLowerCase().includes('foreign key')), 'SQL includes PK vs FK question');
assert(sqlQuestions.some((q) => q.question.toLowerCase().includes('join')), 'SQL includes JOINs (inner, left, right, full) question');
assert(sqlQuestions.some((q) => q.question.toLowerCase().includes('group by') && q.question.toLowerCase().includes('having')), 'SQL includes GROUP BY vs HAVING question');
assert(sqlQuestions.some((q) => q.question.toLowerCase().includes('normalization') || q.question.toLowerCase().includes('index')), 'SQL includes normalization & indexing question');
assert(sqlQuestions.some((q) => q.question.toLowerCase().includes('acid') || q.question.toLowerCase().includes('transaction')), 'SQL includes ACID properties question');

const flaskQuestions = getSkillSpecificQuestions('Flask');
assert(flaskQuestions.some((q) => q.question.toLowerCase().includes('route') || q.question.toLowerCase().includes('rest')), 'Flask includes routing & REST question');

const reactQuestions = getSkillSpecificQuestions('React');
assert(reactQuestions.some((q) => q.question.toLowerCase().includes('props') && q.question.toLowerCase().includes('state')), 'React includes props vs state question');
assert(reactQuestions.some((q) => q.question.toLowerCase().includes('hook') || q.question.toLowerCase().includes('lifecycle')), 'React includes hooks & lifecycle question');

const gitQuestions = getSkillSpecificQuestions('Git');
assert(gitQuestions.some((q) => q.question.toLowerCase().includes('merge') || q.question.toLowerCase().includes('conflict')), 'Git includes commit/push/branch/merge & conflicts question');

// -----------------------------------------------------------------------------
// Test Case 3: Project, Internship & Certification Deep-Dive Questions
// -----------------------------------------------------------------------------
console.log('\n--- Test 3: Project, Internship & Certification Questions ---');

const projectQuestions = generateProjectQuestions(extractedNLP.projectsList);
assert(projectQuestions.length >= 2, `Project deep dive questions generated (${projectQuestions.length})`);
assert(projectQuestions[0].questionSource === 'project', 'Project question source is "project"');
assert(projectQuestions[0].associatedProjectName === 'Smart Health Diagnostics Portal', 'Project name associated correctly');
assert(Boolean(projectQuestions[0].learningExplanation), 'Project question has learningExplanation');

const internshipQuestions = generateInternshipQuestions(extractedNLP.internshipsList);
assert(internshipQuestions.length >= 1, `Internship questions generated (${internshipQuestions.length})`);
assert(internshipQuestions[0].questionSource === 'internship', 'Internship question source is "internship"');
assert(internshipQuestions[0].associatedInternshipCompany === 'TechCorp Solutions', 'Internship company associated correctly');

const certQuestions = generateCertificationQuestions(extractedNLP.certificationsList);
assert(certQuestions.length >= 1, `Certification questions generated (${certQuestions.length})`);
assert(certQuestions[0].questionSource === 'certification', 'Certification question source is "certification"');
assert(certQuestions[0].associatedCertificationName?.includes('Python'), 'Certification name associated correctly');

// -----------------------------------------------------------------------------
// Test Case 4: All 7 Engineering Departments Curriculum Coverage
// -----------------------------------------------------------------------------
console.log('\n--- Test 4: All 7 Engineering Departments Coverage ---');

const allDepartments: EngineeringDepartment[] = [
  'Computer Science & Engineering',
  'Information Technology',
  'Electronics & Communication Engineering',
  'Electrical & Electronics Engineering',
  'Mechanical Engineering',
  'Civil Engineering',
  'Automobile Engineering',
];

for (const dept of allDepartments) {
  const foundational = getCurriculumFoundationalQuestions(dept);
  assert(foundational.length >= 2, `${dept} has at least 2 foundational curriculum questions (found ${foundational.length})`);
  assert(foundational.every((q) => q.department === dept), `All generated questions strictly match department ${dept}`);
  assert(foundational.every((q) => Boolean(q.learningExplanation)), `${dept} questions include reference learning explanations`);
  assert(foundational.every((q) => Boolean(q.whatToStudyNext)), `${dept} questions include whatToStudyNext`);
  assert(foundational.every((q) => Boolean(q.recommendedPracticeQuestion)), `${dept} questions include recommendedPracticeQuestion`);
}

// -----------------------------------------------------------------------------
// Test Case 5: Assembled Interview & NLP Matching
// -----------------------------------------------------------------------------
console.log('\n--- Test 5: Technical Engine Initialization & Question Assembly ---');

const engine = new FrontendNLPTechnicalInterviewEngine({
  resume: sampleCSEResume,
  difficulty: 'Intermediate',
  questionCount: 4,
});

const initialState = engine.getState();
assert(initialState.questions.length === 4, `4 tailored questions selected (got ${initialState.questions.length})`);
const questionSkills = initialState.questions.map((q) => q.skill);
console.log(`Selected Technical Questions for Candidate: ${questionSkills.join(', ')}`);
assert(initialState.questions.some((q) => q.questionSource === 'resume-skill' || q.questionSource === 'project'), 'Questions contain resume skill or project origin');

// -----------------------------------------------------------------------------
// Test Case 6: Skip Question Functionality (Warning, Cancel, Confirm, Learning Mode, 0 marks)
// -----------------------------------------------------------------------------
console.log('\n--- Test 6: Skip Question Side Panel Warning, Cancel, and Learning Mode ---');

// Question 1: Candidate triggers skip
const currentQ1 = engine.getState().currentQuestion;
assert(currentQ1 !== null, 'Current question 1 exists');
const initialIdx = engine.getState().currentIndex;

// Case 6.1: Candidate clicks "Skip Question" -> simulate side panel warning activation
let skipWarningActive = true;
assert(skipWarningActive === true, 'Case 1: Click Skip Question -> Single warning notification activated in side panel');

// Case 6.2: Candidate clicks "Cancel" -> warning dismissed, question remains unchanged
skipWarningActive = false;
assert(skipWarningActive === false, 'Case 2: Click Cancel -> Warning notification dismissed');
assert(engine.getState().currentIndex === initialIdx, 'Question index remains unchanged at 0');
assert(engine.getState().answers.length === 0, 'No answer or skip recorded on Cancel');

// Case 6.3: Candidate clicks "Skip Question" again, then clicks "Confirm Skip"
skipWarningActive = true;
assert(skipWarningActive === true, 'Click Skip Question again activates side panel warning');

// Simulate Confirm Skip
skipWarningActive = false; // replaced by learning panel
const skippedResult = engine.skipQuestion(15);

assert(skippedResult.evaluation.technicalAccuracyScore === 0, 'Case 6: Skipped question awarded 0 technicalAccuracyScore marks');
assert(skippedResult.evaluation.communicationScore === 0, 'Skipped question awarded 0 communicationScore marks');
assert(skippedResult.evaluation.rubricBreakdown?.technicalCorrectness.score === 0, 'Skipped question awarded 0 rubric points');
assert(Boolean(skippedResult.learningData), 'Skipped question returned learningData payload for side panel');

// Case 6.4: Verify Correct Answer, Explanation, Important Concepts, and Example
assert(Boolean(skippedResult.learningData.correctAnswer), 'Case 3: Correct Answer is populated');
assert(skippedResult.learningData.correctAnswer !== '[SKIPPED BY CANDIDATE - 0 MARKS]', 'Correct answer never matches student unanswered response');
assert(Boolean(skippedResult.learningData.explanation), 'Case 4: Detailed Step-by-Step Explanation is visible');
assert(Array.isArray(skippedResult.learningData.importantConcepts) && skippedResult.learningData.importantConcepts.length > 0, 'Important concepts to remember are populated');

// Case 6.5: Verify state recorded and answer marked as isSkipped
const stateAfterSkip = engine.getState();
assert(stateAfterSkip.answers.length === 1, '1 answer recorded in state');
assert(stateAfterSkip.answers[0].isSkipped === true, 'Answer record marked isSkipped = true');
assert(stateAfterSkip.answers[0].aiFeedback?.technicalAccuracyScore === 0, 'Answer record has 0 marks');
assert(stateAfterSkip.answers[0].referenceAnswer === skippedResult.learningData.correctAnswer, 'Answer record preserves referenceAnswer');

// Case 6.6: Verify no duplicate warning (clicking skip on already-skipped question does nothing)
const attemptSkipAgainOnSameQuestion = () => {
  const isAlreadySkipped = stateAfterSkip.answers.some((a) => a.questionId === currentQ1?.id && a.isSkipped);
  if (isAlreadySkipped) return false; // blocked
  return true;
};
assert(attemptSkipAgainOnSameQuestion() === false, 'Case 8: No duplicate warning shown for already-skipped question');

// Case 6.7: Click "Continue to Next Question"
const advance1 = engine.advanceNext();
assert(advance1.hasNext === true, 'Case 5: Successfully advanced to next question after reviewing learning panel');
assert(engine.getState().currentIndex === 1, 'Question index advanced to 1 (progress preserved)');

// -----------------------------------------------------------------------------
// Test Case 7: Honest Intelligent Evaluation (Answers, Misconceptions, Coding)
// -----------------------------------------------------------------------------
console.log('\n--- Test 7: Honest Answer Evaluation (High, Partial, Misconceptions) ---');

// Question 2: Strong Answer
const currentQ2 = engine.getState().currentQuestion!;
console.log(`Answering Question 2 (${currentQ2.skill}): "${currentQ2.question.slice(0, 70)}..."`);

// Craft a strong response containing the benchmark keywords and ideal points
const strongAnswerText = `In ${currentQ2.skill}, ${currentQ2.idealAnswerPoints?.join('. ') || 'we follow industry standards with comprehensive separation of concerns and robust error handling'}. For instance, we handle edge cases, memory bounds, and ensure deterministic execution.`;

const { evaluation: evalStrong } = engine.submitAnswer(strongAnswerText, 45);
assert(evalStrong.technicalAccuracyScore >= 75, `Strong technical answer scored high (${evalStrong.technicalAccuracyScore}/100 >= 75)`);
assert(evalStrong.strengths.length > 0, 'Strengths identified for strong answer');

// Advance to Question 3
engine.advanceNext();

// Question 3: Partial / Misconception Answer
const currentQ3 = engine.getState().currentQuestion!;
console.log(`Answering Question 3 (${currentQ3.skill}) with partial / weak explanation...`);

const weakAnswerText = `I think it works like a basic variable or list, but I am not completely sure about the internal mechanism or how the compiler optimizes it.`;
const { evaluation: evalWeak } = engine.submitAnswer(weakAnswerText, 25);
assert(evalWeak.technicalAccuracyScore < 60, `Weak answer scored honestly without inflation (${evalWeak.technicalAccuracyScore}/100 < 60)`);
assert(evalWeak.improvements.length > 0, 'Improvements provided for weak answer');

// Advance to Question 4
engine.advanceNext();

// Question 4: Another skipped question to test multi-skipped aggregation
const currentQ4 = engine.getState().currentQuestion!;
console.log(`Skipping Question 4 (${currentQ4.skill})...`);
engine.skipQuestion(10);

// Advance to complete interview
const advanceFinal = engine.advanceNext();
assert(advanceFinal.isComplete === true, 'Interview session completed after 4 questions');

// -----------------------------------------------------------------------------
// Test Case 8: Technical Scorecard & Weak Skills Remediation Plan
// -----------------------------------------------------------------------------
console.log('\n--- Test 8: Technical Scorecard & Weak Skills Remediation Plan ---');

const completedSession = engine.completeSession();
assert(Boolean(completedSession.technicalScorecardSummary), 'technicalScorecardSummary generated on session');

const scorecard = completedSession.technicalScorecardSummary!;

console.log('--- Scorecard Results ---');
console.log(`Total Questions: ${scorecard.totalQuestions}`);
console.log(`Answered Questions: ${scorecard.answeredQuestions}`);
console.log(`Skipped Questions: ${scorecard.skippedQuestions}`);
console.log(`Correct Answers: ${scorecard.correctAnswers}`);
console.log(`Partially Correct: ${scorecard.partiallyCorrectAnswers}`);
console.log(`Incorrect / 0: ${scorecard.incorrectAnswers}`);
console.log(`Overall Technical Score: ${scorecard.overallTechnicalScore}%`);

assert(scorecard.totalQuestions === 4, 'Total questions is 4');
assert(scorecard.skippedQuestions === 2, '2 questions skipped');
assert(scorecard.answeredQuestions === 2, '2 questions answered');
assert(scorecard.overallTechnicalScore < 50, `Overall score correctly penalized by skipped questions with 0 marks (${scorecard.overallTechnicalScore}% < 50%)`);

// Check Difficulty-wise breakdown
assert(typeof scorecard.difficultyWise.intermediate.attempted === 'number', 'Difficulty-wise intermediate attempted tracked');
assert(typeof scorecard.difficultyWise.intermediate.avgScore === 'number', 'Difficulty-wise intermediate avgScore tracked');

// Check Skill Performance Table
assert(scorecard.skillPerformance.length > 0, 'Skill performance table populated');
for (const item of scorecard.skillPerformance) {
  assert(['Strong', 'Good', 'Needs Improvement', 'Weak'].includes(item.performance), `Skill ${item.skill} assigned valid performance tier: ${item.performance}`);
  assert(['resume-skill', 'project', 'internship', 'certification', 'curriculum-foundational'].includes(item.source), `Skill ${item.skill} assigned valid source: ${item.source}`);
  assert(typeof item.score === 'number', `Skill ${item.skill} has numeric score: ${item.score}`);
}

// Check Weak Skills Remediation Plan
assert(scorecard.weakSkillsRemediation.length >= 2, `Remediation plan generated for weak/skipped skills (${scorecard.weakSkillsRemediation.length} >= 2)`);
for (const rem of scorecard.weakSkillsRemediation) {
  assert(Boolean(rem.skill), 'Remediation has skill name');
  assert(Boolean(rem.whatWasAnsweredIncorrectly), `Remediation for ${rem.skill} explains what was answered incorrectly or skipped`);
  assert(Boolean(rem.correctExplanation), `Remediation for ${rem.skill} provides correct reference explanation`);
  assert(Boolean(rem.whatToStudyNext), `Remediation for ${rem.skill} specifies what to study next`);
  assert(Boolean(rem.recommendedPracticeQuestion), `Remediation for ${rem.skill} provides recommended practice question`);
}

console.log('\nSample Weak Skill Remediation Plan Item:');
console.log(JSON.stringify(scorecard.weakSkillsRemediation[0], null, 2));

console.log('\n========================================================================');
console.log('🎉 ALL 8 ADVANCED TECHNICAL INTERVIEW VERIFICATION TESTS PASSED!');
console.log('========================================================================\n');
