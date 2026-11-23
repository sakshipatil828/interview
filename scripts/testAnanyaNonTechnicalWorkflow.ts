// Automated test suite for CareerCurve Non-Technical B.Com & Ananya Sharma workflow
import { PRESET_RESUME_TEXTS } from '../src/data/sampleData.js';
import { 
  classifyCandidate, 
  enrichParsedResumeWithClassification 
} from '../src/services/candidateClassificationService.js';
import { generateCommunicationTopics } from '../src/nlp/communication/communicationEngine.js';
import { generateSevenMainHRQuestions } from '../src/nlp/hr/hrSevenQuestionEngine.js';

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✓ ${message}`);
    passed++;
  } else {
    console.error(`  ✗ FAIL: ${message}`);
    failed++;
  }
}

console.log('================================================================');
console.log('CAREERCURVE: VERIFYING ANANYA SHARMA B.COM NON-TECHNICAL WORKFLOW');
console.log('================================================================\n');

// 1. Verify Resume Preset Presence
console.log('--- Test 1: Preset Resume Content ---');
const ananyaText = PRESET_RESUME_TEXTS.ananyaSharmaBCom;
assert(!!ananyaText, 'PRESET_RESUME_TEXTS.ananyaSharmaBCom exists');
assert(/ananya sharma/i.test(ananyaText), 'Resume contains Ananya Sharma');
assert(/bachelor of commerce \(b\.com\)/i.test(ananyaText), 'Resume contains Bachelor of Commerce (B.Com)');
assert(/customer support\s*[/&]\s*office administration/i.test(ananyaText), 'Resume contains Customer Support / Office Administration');
assert(/customer feedback survey/i.test(ananyaText), 'Resume contains Customer Feedback Survey project');
assert(/ms office fundamentals/i.test(ananyaText), 'Resume contains MS Office Fundamentals');

// 2. Mock Parsed Resume from Heuristic / Local Extractor
console.log('\n--- Test 2: Heuristic Extraction & Candidate Classification ---');
const parsedResume = {
  fullName: 'Ananya Sharma',
  jobTitle: 'Customer Support / Office Administration',
  email: 'ananya.sharma@example.com',
  phone: '+91 98765 43210',
  department: 'Commerce',
  education: [
    {
      degree: 'Bachelor of Commerce (B.Com)',
      branch: 'Commerce',
      college: "St. Xavier's College",
      graduationYear: '2026',
      cgpa: '8.4 / 10.0'
    }
  ],
  graduationYear: '2026',
  isGraduationDateConfirmed: true,
  rawSkillsList: [
    'Customer communication',
    'Active listening',
    'MS Word',
    'Excel',
    'PowerPoint',
    'Google Workspace',
    'Email writing',
    'Data entry',
    'Document organization',
    'Teamwork',
    'Time management',
    'Problem solving',
    'Billing and record keeping'
  ],
  projects: [
    {
      title: 'Customer Feedback Survey using Excel',
      description: 'Analyzed customer feedback data using MS Excel to identify common service issues and improve support responsiveness.',
      technologies: ['MS Excel', 'Data entry', 'Customer communication']
    }
  ],
  experience: [
    {
      role: 'College Event Volunteer',
      company: 'Annual Cultural Fest',
      duration: '2025',
      description: 'Handled attendee registration, managed information desk, and resolved visitor queries.',
      isInternship: false,
      isEmployment: false
    }
  ],
  certifications: [
    {
      name: 'MS Office Fundamentals Certification',
      issuer: 'Microsoft / Skill Partner',
      year: '2024'
    }
  ]
};

// Test with default CSE profileDepartment from potential dirty cache/registration
const dirtyProfileDepartment = 'Computer Science and Engineering';
const classification = classifyCandidate(parsedResume, dirtyProfileDepartment);

console.log('Classification Output:', {
  isTechnical: classification.isTechnical,
  educationalCategory: classification.educationalCategory,
  discipline: classification.discipline,
  candidateType: classification.candidateType,
  recommendedRounds: classification.recommendedRounds,
});

assert(classification.isTechnical === false, 'Candidate is classified as Non-Technical (isTechnical === false)');
assert(classification.educationalCategory === 'non_technical', 'educationalCategory is non_technical');
assert(classification.discipline === 'Commerce', `Discipline is strictly "Commerce" (received: "${classification.discipline}")`);
assert(!classification.discipline.toLowerCase().includes('computer science'), 'Discipline does NOT contain "computer science"');
assert(!classification.discipline.toLowerCase().includes('engineering'), 'Discipline does NOT contain "engineering"');
assert(classification.candidateType === 'FRESHER', 'Candidate is classified as FRESHER (2026 graduate)');
assert(classification.recommendedRounds.includes('aptitude'), 'Recommended rounds include Aptitude');
assert(classification.recommendedRounds.includes('communication'), 'Recommended rounds include Communication');
assert(classification.recommendedRounds.includes('hr'), 'Recommended rounds include HR Behaviour');
assert(!classification.recommendedRounds.includes('technical'), 'Recommended rounds strictly EXCLUDE Technical round');

// 3. Enrich Parsed Resume
console.log('\n--- Test 3: Enriched Resume Integrity ---');
const enrichedResume = enrichParsedResumeWithClassification(parsedResume, dirtyProfileDepartment);
assert(enrichedResume.department === 'Commerce', `Enriched department is "Commerce" (received: "${enrichedResume.department}")`);
assert(enrichedResume.classification.discipline === 'Commerce', 'Enriched classification discipline is Commerce');
assert(enrichedResume.classification.isTechnical === false, 'Enriched classification is non-technical');

// 4. Communication Topics Generation
console.log('\n--- Test 4: Dynamic Communication Topics Generation ---');
const topics = generateCommunicationTopics(
  enrichedResume,
  'fresher',
  classification.discipline,
  4,
  'non_technical'
);

const allTopics = generateCommunicationTopics(
  enrichedResume,
  'fresher',
  classification.discipline,
  8,
  'non_technical'
);

console.log('Generated Topics (' + topics.length + '):');
topics.forEach((t, i) => console.log(`  ${i + 1}. [${t.category}] ${t.title}`));

assert(topics.length === 4, `Exactly 4 communication topics generated for active practice set (got ${topics.length})`);

// Ensure NON-TECHNICAL topics are present across the synthesized pool
const allTopicTitles = allTopics.map(t => t.title).join(' | ');
assert(/Customer Service/i.test(allTopicTitles), 'Topics include Customer Service & Satisfaction');
assert(/Angry Customer|Complaint/i.test(allTopicTitles), 'Topics include Handling Angry Customers & Complaints');
assert(/Workplace Communication|Email Writing/i.test(allTopicTitles), 'Topics include Workplace Communication & Professional Email Writing');
assert(/Excel|Office Administration|Data Entry/i.test(allTopicTitles), 'Topics include Excel in Business & Data Entry');
assert(/Feedback Survey/i.test(allTopicTitles), 'Topics dynamically include Customer Feedback Survey Project');

// Ensure NO technical topics leak
assert(!/Engineering Self-Introduction/i.test(allTopicTitles), 'STRICTLY NO "Engineering Self-Introduction" topic');
assert(!/Artificial Intelligence & Technology in Daily Life/i.test(allTopicTitles), 'STRICTLY NO "AI & Technology in Daily Life" topic');
assert(!/Software and Engineering Teams/i.test(allTopicTitles), 'STRICTLY NO "Collaboration in Software and Engineering Teams" topic');
assert(!/Code Quality|Debugging|System Architecture/i.test(allTopicTitles), 'STRICTLY NO engineering/coding topics');

// 5. HR 7 Questions Generation
console.log('\n--- Test 5: HR 7 Company-Style AI Questions ---');
const hrQuestions = generateSevenMainHRQuestions(enrichedResume, 'General Company');

console.log('Generated HR Questions:');
hrQuestions.forEach((q, i) => console.log(`  Q${i + 1}: ${q.personalizedText.slice(0, 100)}...`));

assert(hrQuestions.length === 7, 'Exactly 7 HR Questions generated');

const q1 = hrQuestions[0].personalizedText;
assert(!/engineering/i.test(q1), `Q1 does not contain "engineering" (received: "${q1}")`);
assert(/Commerce/i.test(q1), `Q1 mentions candidate academic background in Commerce`);

const allHRText = hrQuestions.map(q => q.personalizedText).join(' ');
assert(!/engineering capstone/i.test(allHRText), 'HR questions do not ask for "engineering capstone"');
assert(!/software engineer/i.test(allHRText), 'HR questions do not ask for "software engineer"');

console.log('\n================================================================');
console.log(`SUMMARY: ${passed} passed, ${failed} failed`);
console.log('================================================================\n');

if (failed > 0) {
  process.exit(1);
} else {
  console.log('ALL TESTS PASSED SUCCESSFULLY! ✓✓✓');
}
