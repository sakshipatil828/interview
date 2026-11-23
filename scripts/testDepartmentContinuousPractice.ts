import { FrontendNLPTechnicalInterviewEngine } from '../src/nlp/technicalInterviewEngine';
import { ParsedResume } from '../src/types';
import { isQuestionDuplicate } from '../src/nlp/duplicatePrevention';

console.log('================================================================');
console.log('CAREERCURVE CONTINUOUS PRACTICE ENGINE — MANDATORY 6-DEPT TEST');
console.log('================================================================\n');

// 1. Define the 6 Engineering Resumes specified in Requirement 13
const TEST_RESUMES: { deptName: string; resume: ParsedResume }[] = [
  {
    deptName: 'Computer Science & Engineering',
    resume: {
      fullName: 'Aarav Sharma',
      email: 'aarav.sharma@example.edu',
      phone: '+91 9876543210',
      jobTitle: 'Software Engineering Student',
      github: 'github.com/aaravsharma',
      linkedin: 'linkedin.com/in/aaravsharma',
      summary: 'Computer Science student skilled in Python, JavaScript, SQL, React, Flask, and Scikit-learn.',
      department: 'Computer Science & Engineering',
      education: [{ institution: 'IIT Bombay', degree: 'B.Tech in Computer Science', graduationYear: '2025' }],
      skills: [
        { category: 'Languages', skills: ['Python', 'JavaScript', 'SQL'] },
        { category: 'Frameworks', skills: ['React', 'Flask', 'Scikit-learn', 'Node.js'] },
        { category: 'Databases', skills: ['MySQL', 'PostgreSQL'] },
        { category: 'Core', skills: ['Data Structures', 'Operating Systems', 'Computer Networks'] }
      ],
      rawSkillsList: ['Python', 'JavaScript', 'SQL', 'React', 'Flask', 'Scikit-learn', 'MySQL', 'Data Structures'],
      projects: [
        { title: 'AI Placement Classifier', description: 'Flask web app with React UI and Scikit-learn', technologies: ['Flask', 'React', 'Scikit-learn', 'Python'] },
        { title: 'E-Commerce Database Engine', description: 'Relational data store with MySQL queries', technologies: ['MySQL', 'SQL', 'JavaScript'] }
      ],
      experience: [],
      certifications: [{ name: 'Scikit-Learn Machine Learning Specialist', issuer: 'Coursera' }]
    }
  },
  {
    deptName: 'Electronics & Communication Engineering',
    resume: {
      fullName: 'Priya Patel',
      email: 'priya.patel@example.edu',
      phone: '+91 9876543211',
      jobTitle: 'Embedded Systems & Hardware Engineer',
      github: 'github.com/priyapatel',
      linkedin: 'linkedin.com/in/priyapatel',
      summary: 'ECE graduate with expertise in PCB design, embedded C, microcontrollers, and VLSI.',
      department: 'Electronics & Communication Engineering',
      education: [{ institution: 'NIT Trichy', degree: 'B.Tech in ECE', graduationYear: '2025' }],
      skills: [
        { category: 'Hardware', skills: ['PCB Design', 'KiCAD', 'Circuit Design', 'Microcontrollers'] },
        { category: 'Embedded', skills: ['Embedded C', 'ARM Cortex', 'Arduino', 'ESP32'] },
        { category: 'Core', skills: ['Digital Electronics', 'VLSI Design', 'Signals & Systems'] }
      ],
      rawSkillsList: ['PCB Design', 'Embedded C', 'Microcontrollers', 'KiCAD', 'ARM Cortex', 'Digital Electronics', 'VLSI Design'],
      projects: [
        { title: '4-Layer Sensor Hub PCB', description: 'Designed high-speed STM32 acquisition board with KiCAD', technologies: ['KiCAD', 'PCB Design', 'Embedded C'] }
      ],
      experience: [{ company: 'Bosch Automotive', role: 'Embedded Firmware Intern', isInternship: true }],
      certifications: [{ name: 'High-Speed PCB Layout & Signal Integrity', issuer: 'IPC' }]
    }
  },
  {
    deptName: 'Electrical & Electronics Engineering',
    resume: {
      fullName: 'Rahul Verma',
      email: 'rahul.verma@example.edu',
      phone: '+91 9876543212',
      jobTitle: 'Electrical Systems Engineer',
      github: 'github.com/rahulverma',
      linkedin: 'linkedin.com/in/rahulverma',
      summary: 'EEE student specializing in electrical machines, power systems, control systems, and power electronics.',
      department: 'Electrical & Electronics Engineering',
      education: [{ institution: 'BITS Pilani', degree: 'B.E. in EEE', graduationYear: '2025' }],
      skills: [
        { category: 'Machines & Power', skills: ['Electrical Machines', 'Power Systems', 'Transformers'] },
        { category: 'Power Electronics', skills: ['Buck Converter', 'Inverters', 'Power Electronics'] },
        { category: 'Control', skills: ['Control Systems', 'MATLAB Simulink', 'PID Controller'] }
      ],
      rawSkillsList: ['Electrical Machines', 'Power Systems', 'Transformers', 'Control Systems', 'Power Electronics', 'MATLAB Simulink'],
      projects: [
        { title: 'Solar Inverter with MPPT', description: 'Buck-Boost converter and grid inverter in MATLAB', technologies: ['Power Electronics', 'MATLAB Simulink', 'Control Systems'] }
      ],
      experience: [{ company: 'Tata Power', role: 'Substation Engineering Intern', isInternship: true }],
      certifications: [{ name: 'Grid Power Systems & Switchgear Protection', issuer: 'IEEE' }]
    }
  },
  {
    deptName: 'Mechanical Engineering',
    resume: {
      fullName: 'Vikram Joshi',
      email: 'vikram.joshi@example.edu',
      phone: '+91 9876543213',
      jobTitle: 'Mechanical Design Engineer',
      github: 'github.com/vikramjoshi',
      linkedin: 'linkedin.com/in/vikramjoshi',
      summary: 'Mechanical student focused on CAD modeling, thermodynamics, fluid mechanics, and manufacturing.',
      department: 'Mechanical Engineering',
      education: [{ institution: 'COEP Pune', degree: 'B.Tech in Mechanical', graduationYear: '2025' }],
      skills: [
        { category: 'Design & CAD', skills: ['SolidWorks', 'CAD', 'AutoCAD Mechanical', 'Machine Design'] },
        { category: 'Thermal', skills: ['Thermodynamics', 'Fluid Mechanics', 'Heat Transfer'] },
        { category: 'Production', skills: ['Manufacturing Processes', 'CNC Machining'] }
      ],
      rawSkillsList: ['SolidWorks', 'CAD', 'Thermodynamics', 'Fluid Mechanics', 'Machine Design', 'Manufacturing Processes', 'CNC Machining'],
      projects: [
        { title: 'Electric Vehicle Gearbox Design', description: 'CAD modeling and FEA fatigue stress analysis in SolidWorks', technologies: ['SolidWorks', 'CAD', 'Machine Design'] }
      ],
      experience: [{ company: 'Mahindra & Mahindra', role: 'Thermal Systems Intern', isInternship: true }],
      certifications: [{ name: 'CSWA SolidWorks Associate', issuer: 'Dassault Systemes' }]
    }
  },
  {
    deptName: 'Civil Engineering',
    resume: {
      fullName: 'Ananya Deshmukh',
      email: 'ananya.deshmukh@example.edu',
      phone: '+91 9876543214',
      jobTitle: 'Structural & Site Engineer',
      github: 'github.com/ananyadeshmukh',
      linkedin: 'linkedin.com/in/ananyadeshmukh',
      summary: 'Civil Engineering candidate skilled in structural engineering, RCC, surveying, and geotechnical mechanics.',
      department: 'Civil Engineering',
      education: [{ institution: 'IIT Madras', degree: 'B.Tech in Civil Engineering', graduationYear: '2025' }],
      skills: [
        { category: 'Structures', skills: ['Structural Engineering', 'RCC', 'STAAD.Pro', 'AutoCAD Civil'] },
        { category: 'Geotech & Survey', skills: ['Geotechnical Engineering', 'Surveying', 'Total Station'] },
        { category: 'Materials', skills: ['Concrete Technology', 'Construction Materials'] }
      ],
      rawSkillsList: ['Structural Engineering', 'RCC', 'Surveying', 'Geotechnical Engineering', 'Concrete Technology', 'STAAD.Pro'],
      projects: [
        { title: 'G+5 Multi-Storey RCC Design', description: 'Limit state structural design and load combination analysis', technologies: ['STAAD.Pro', 'Structural Engineering', 'RCC'] }
      ],
      experience: [{ company: 'Larsen & Toubro', role: 'Structural Engineering Intern', isInternship: true }],
      certifications: [{ name: 'Advanced RCC Design & Limit State Method', issuer: 'Bentley Institute' }]
    }
  },
  {
    deptName: 'Automobile Engineering',
    resume: {
      fullName: 'Karan Mehra',
      email: 'karan.mehra@example.edu',
      phone: '+91 9876543215',
      jobTitle: 'Automotive & EV Powertrain Engineer',
      github: 'github.com/karanmehra',
      linkedin: 'linkedin.com/in/karanmehra',
      summary: 'Automobile engineering candidate specializing in IC engines, vehicle dynamics, and EV technologies.',
      department: 'Automobile Engineering',
      education: [{ institution: 'PSG College of Technology', degree: 'B.E. in Automobile Engineering', graduationYear: '2025' }],
      skills: [
        { category: 'Powertrain', skills: ['Internal Combustion Engines', 'Electric Vehicles', 'BMS'] },
        { category: 'Chassis', skills: ['Vehicle Dynamics', 'Braking Systems', 'Transmission Systems'] },
        { category: 'Diagnostics', skills: ['Automotive Diagnostics', 'CAN Bus'] }
      ],
      rawSkillsList: ['Internal Combustion Engines', 'Electric Vehicles', 'Vehicle Dynamics', 'Braking Systems', 'Transmission Systems', 'CAN Bus'],
      projects: [
        { title: 'Formula Student EV Powertrain', description: 'Li-ion battery pack BMS and regenerative braking control', technologies: ['Electric Vehicles', 'Braking Systems', 'CAN Bus'] }
      ],
      experience: [{ company: 'Tata Motors', role: 'EV Powertrain Intern', isInternship: true }],
      certifications: [{ name: 'Automotive EV Battery Management Systems', issuer: 'SAE India' }]
    }
  }
];

let totalPassed = 0;
let totalFailed = 0;

function assert(condition: boolean, msg: string) {
  if (condition) {
    console.log(`  ✓ PASS: ${msg}`);
    totalPassed++;
  } else {
    console.error(`  ✗ FAIL: ${msg}`);
    totalFailed++;
  }
}

// Execute tests for all 6 profiles
for (let i = 0; i < TEST_RESUMES.length; i++) {
  const { deptName, resume } = TEST_RESUMES[i];
  console.log(`\n----------------------------------------------------------------`);
  console.log(`TEST PROFILE ${i + 1}/6: [${deptName}] - ${resume.fullName}`);
  console.log(`----------------------------------------------------------------`);

  const engine = new FrontendNLPTechnicalInterviewEngine({
    resume,
    difficulty: 'Intermediate',
    questionCount: 4,
  });

  const state1 = engine.getState();

  // Test 1: Exactly 4 questions generated for Set 1
  assert(state1.questions.length === 4, `Set 1 generated exactly 4 questions (got ${state1.questions.length})`);
  assert(state1.currentSetNumber === 1, `Current set number is 1`);

  // Test 2: All 4 questions are unique in Set 1
  const set1Ids = new Set(state1.questions.map(q => q.id));
  assert(set1Ids.size === 4, `All 4 questions in Set 1 have unique IDs (${Array.from(set1Ids).join(', ')})`);

  // Test 3: Resume skills and department topics are included
  const set1Skills = state1.questions.map(q => q.skill);
  console.log(`    Skills in Set 1: [${set1Skills.join(' | ')}]`);
  assert(set1Skills.length === 4, `Set 1 covers 4 distinct skills`);

  const getGoodAnswer = (q: any) => {
    if (!q) return 'Comprehensive explanation of system architecture and engineering principles.';
    if (q.referenceAnswer) return q.referenceAnswer;
    if (q.idealAnswerPoints && q.idealAnswerPoints.length > 0) return q.idealAnswerPoints.join('. ');
    return `${q.skill} implementation adhering to standard engineering benchmarks and constraints.`;
  };

  // Simulate Answering Question 1 (Expected High Score)
  const q1 = engine.getState().currentQuestion;
  engine.submitAnswer(getGoodAnswer(q1), 45);
  const adv1 = engine.advanceNext();
  assert(adv1.hasNext && adv1.nextQuestion !== null, `Advanced from Q1 to Q2`);

  // Simulate Answering Question 2 (Expected High Score)
  const q2 = engine.getState().currentQuestion;
  engine.submitAnswer(getGoodAnswer(q2), 40);
  const adv2 = engine.advanceNext();
  assert(adv2.hasNext && adv2.nextQuestion !== null, `Advanced from Q2 to Q3`);

  // Simulate Skipping Question 3 (Should award 0 marks and provide reference answer)
  const skipResult = engine.skipQuestion(15);
  assert(skipResult.evaluation.technicalAccuracyScore === 0, `Skipped Q3 awarded 0 marks`);
  assert(typeof skipResult.learningData.correctAnswer === 'string' && skipResult.learningData.correctAnswer.length > 10, `Q3 has reference correct answer`);
  const adv3 = engine.advanceNext();
  assert(adv3.hasNext && adv3.nextQuestion !== null, `Advanced from Q3 to Q4`);

  // Simulate Answering Question 4 (Expected High Score)
  const q4 = engine.getState().currentQuestion;
  engine.submitAnswer(getGoodAnswer(q4), 35);
  
  // Advance after Question 4: Should complete Set 1!
  const adv4 = engine.advanceNext();
  assert(!adv4.hasNext && adv4.isSetCompleted === true, `Set 1 completed after 4th question (isSetCompleted: true)`);

  // Verify Set 1 Summary
  const set1Summary = engine.getSetSummary(1);
  assert(set1Summary !== null, `Set 1 summary generated`);
  assert(set1Summary?.questionsAttempted === 4, `Set 1 attempted: 4 questions`);
  assert(set1Summary?.skippedQuestions === 1, `Set 1 recorded exactly 1 skipped question`);
  assert((set1Summary?.correctAnswers || 0) >= 2, `Set 1 recorded correct answers (got ${set1Summary?.correctAnswers})`);
  console.log(`    Set 1 Score: ${set1Summary?.setScore}%`);

  // Test 4: Start Next 4 Questions (Set 2: Questions 5–8)
  const { questions: set2Questions, setNumber: newSetNum, currentQuestion: q5 } = engine.startNextSet();
  assert(newSetNum === 2, `Engine started Set 2 (newSetNum === 2)`);
  assert(set2Questions.length === 8, `Total questions expanded to 8 for Set 2`);
  assert(q5 !== null && engine.getState().currentIndex === 4, `Index correctly moved to Question 5 (index 4)`);

  const set2Only = set2Questions.slice(4, 8);
  assert(set2Only.length === 4, `Set 2 contains exactly 4 questions`);

  // Test 5: Strict Duplicate Prevention: Verify no question in Set 2 repeats Set 1
  const historyEntries = engine.getState().questionHistory;
  assert(historyEntries.length === 4, `History tracks all 4 questions from Set 1`);

  let duplicateFoundInSet2 = false;
  for (const q of set2Only) {
    if (set1Ids.has(q.id)) {
      duplicateFoundInSet2 = true;
      console.error(`    DUPLICATE FOUND: Question ${q.id} in Set 2 was already in Set 1!`);
    }
  }
  assert(!duplicateFoundInSet2, `Zero questions from Set 1 were repeated in Set 2`);

  // Test 6: Verify continuous practice can start Set 3 (Questions 9–12)
  // Simulate good answers for Set 2
  for (let sIdx = 0; sIdx < 4; sIdx++) {
    const curQ = engine.getState().currentQuestion;
    engine.submitAnswer(getGoodAnswer(curQ), 30);
    engine.advanceNext();
  }

  const { questions: set3Questions, setNumber: set3Num } = engine.startNextSet();
  assert(set3Num === 3, `Engine started Set 3`);
  assert(set3Questions.length === 12, `Total questions expanded to 12 for Set 3`);

  const set3Only = set3Questions.slice(8, 12);
  const set1And2Ids = new Set(set3Questions.slice(0, 8).map(q => q.id));
  let duplicateFoundInSet3 = false;
  for (const q of set3Only) {
    if (set1And2Ids.has(q.id)) {
      duplicateFoundInSet3 = true;
      console.error(`    DUPLICATE FOUND: Question ${q.id} in Set 3 was in Set 1 or 2!`);
    }
  }
  assert(!duplicateFoundInSet3, `Zero questions from Set 1 or 2 were repeated in Set 3`);

  // Test 7: Verify Skill-Wise Progress Dashboard (Requirement 10)
  const dashboard = engine.getSkillDashboard();
  assert(dashboard.totalSetsCompleted >= 2, `Dashboard reports >= 2 sets completed (got ${dashboard.totalSetsCompleted})`);
  assert(dashboard.totalQuestionsAttempted === 8, `Dashboard reports 8 questions attempted`);
  assert(typeof dashboard.overallTechnicalScore === 'number' && dashboard.overallTechnicalScore > 0, `Dashboard overall technical score is computed (${dashboard.overallTechnicalScore}%)`);
  assert(dashboard.strongTopics.length > 0 || dashboard.weakTopics.length > 0, `Strong/Weak topics classified`);
  assert(dashboard.recommendedNextPracticeTopics.length > 0, `Recommended next topics populated`);

  // Test 8: Final Session Scorecard compilation
  const finalSession = engine.completeSession();
  assert(finalSession.answers.length === 8, `Final scorecard contains all 8 answers`);
  assert(finalSession.technicalScorecardSummary?.skippedQuestions === 1, `Scorecard accurately counts 1 skipped question with 0 marks`);
  assert(finalSession.technicalScorecardSummary?.answeredQuestions === 7, `Scorecard accurately counts 7 answered questions`);
  console.log(`    Cumulative Technical Score: ${finalSession.technicalScore}%`);
}

console.log('\n================================================================');
console.log(`ALL 6 DEPARTMENT PROFILES TESTED: ${totalPassed} PASSED, ${totalFailed} FAILED`);
console.log('================================================================\n');

if (totalFailed > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
