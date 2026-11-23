import { 
  selectInterviewQuestions, 
  HR_QUESTION_DATASET 
} from '../src/nlp/hr/hrQuestionDataset';
import { evaluateHRAnswer } from '../src/nlp/hr/hrAnswerEvaluator';
import { HRInterviewConfig } from '../src/nlp/hr/types';
import { ParsedResume } from '../src/types';

async function runTestSuite() {
  console.log('================================================================');
  console.log('CAREERCURVE AI HR VOICE INTERVIEW: COMPREHENSIVE TEST SUITE');
  console.log('================================================================\n');

  // Mock Candidate Resume
  const mockResume: ParsedResume = {
    fullName: 'Aarav Patel',
    jobTitle: 'Software Engineer',
    email: 'aarav.patel@example.edu',
    phone: '+91 98765 43210',
    github: 'https://github.com/aaravpatel',
    linkedin: 'https://linkedin.com/in/aaravpatel',
    department: 'Computer Science & Engineering',
    summary: 'Motivated full-stack software engineer with expertise in distributed microservices and real-time streaming.',
    rawSkillsList: ['React', 'TypeScript', 'Node.js', 'Docker', 'PostgreSQL', 'Redis', 'Kubernetes'],
    skills: [],
    education: [
      {
        college: 'National Institute of Technology',
        degree: 'B.Tech',
        branch: 'Computer Science & Engineering',
        graduationYear: '2024',
        cgpa: '8.8 CGPA'
      }
    ],
    experience: [
      {
        role: 'Full Stack Engineering Intern',
        company: 'Apex Cloud Solutions',
        duration: '6 Months',
        description: 'Built high-throughput telemetry pipelines and migrated monolithic endpoints to microservices.'
      }
    ],
    projects: [
      {
        title: 'Distributed Log Aggregator',
        technologies: ['Node.js', 'Redis', 'Docker'],
        description: 'Engineered a real-time log ingestion pipeline processing 25,000 events/sec with fault tolerance.'
      }
    ],
    certifications: [],
    languages: ['English', 'Hindi'],
    interests: ['Distributed Systems', 'Cloud Native'],
    atsScore: 92,
    resumeScore: 89,
    matchRank: 'Top 5%',
    missingSkills: [],
    strongSkills: ['Node.js', 'Redis', 'Docker'],
    suggestedTechnologies: [],
    careerSuggestions: [],
    uploadedAt: new Date().toISOString(),
    fileName: 'aarav_patel_resume.pdf'
  };

  const mockConfig: HRInterviewConfig = {
    type: 'HR Personal Interview',
    difficulty: 'Intermediate',
    durationMinutes: 10,
    language: 'en-US',
    style: 'Professional',
    answerTimeLimitSeconds: 90
  };

  let allTestsPassed = true;

  // TEST 1: Question Selection & Resume Personalization
  console.log('----------------------------------------------------------------');
  console.log('TEST 1: Question Selection & Resume Personalization');
  console.log('----------------------------------------------------------------');

  const selectedQuestions = selectInterviewQuestions(mockConfig, mockResume);
  console.log(`✓ Selected ${selectedQuestions.length} questions for a 10-minute interview.`);

  if (selectedQuestions.length !== 5) {
    console.error(`❌ Expected 5 questions, got ${selectedQuestions.length}`);
    allTestsPassed = false;
  } else {
    console.log('✓ Question count matches interview config (5 questions for 10 mins).');
  }

  // Check resume personalization
  const introQ = selectedQuestions.find(q => q.question.category === 'self_introduction');
  const projectQ = selectedQuestions.find(q => q.question.category === 'project_contribution');

  if (introQ && introQ.personalizedText.includes('Aarav')) {
    console.log(`✓ Self-introduction personalized with candidate name: "${introQ.personalizedText}"`);
  } else {
    console.error(`❌ Self-introduction question missing candidate name. Got: "${introQ?.personalizedText}"`);
    allTestsPassed = false;
  }

  if (projectQ && projectQ.personalizedText.includes('Distributed Log Aggregator')) {
    console.log(`✓ Project question personalized with candidate project: "${projectQ.personalizedText}"`);
  } else {
    console.error(`❌ Project question missing candidate project. Got: "${projectQ?.personalizedText}"`);
    allTestsPassed = false;
  }

  // TEST 2: High-Scoring STAR Method Answer
  console.log('\n----------------------------------------------------------------');
  console.log('TEST 2: STAR Framework NLP Answer Evaluation (Strong Response)');
  console.log('----------------------------------------------------------------');

  const conflictQuestion = HR_QUESTION_DATASET.find(q => q.id === 'hr_teamwork_01')!;

  const strongStarAnswer = 
    'At Apex Cloud Solutions during my internship, our team faced a critical disagreement on whether to build a Redis cache or shard our PostgreSQL database directly because latency was spiking under peak traffic. ' +
    'As the engineer leading the benchmarking subtask, my objective was to resolve the architectural conflict objectively without derailing our sprint deadline. ' +
    'I took initiative to run an isolated Apache JMeter benchmark comparing both architectures against identical simulated workloads, documented the latency profiles in a concise RFC document, and facilitated a 30-minute cross-team review. ' +
    'As a result, the team unanimously adopted the Redis caching strategy, which slashed endpoint latency by 68% and delivered the sprint 2 days ahead of schedule, saving $8,000 monthly in cloud infrastructure.';

  const strongEvaluation = await evaluateHRAnswer(
    conflictQuestion,
    strongStarAnswer,
    68 // 68 seconds duration
  );

  console.log(`- Overall Score: ${strongEvaluation.overallScore}/100`);
  console.log(`- Rating Band: ${strongEvaluation.ratingBand}`);
  console.log(`- Relevance: ${strongEvaluation.relevanceScore}/100`);
  console.log(`- Clarity: ${strongEvaluation.clarityScore}/100`);
  console.log(`- Structure (STAR Mastery): ${strongEvaluation.structureScore}/100`);
  console.log(`- WPM: ${strongEvaluation.communicationMetrics.wordsPerMinute}`);
  console.log(`- Fillers Detected: ${strongEvaluation.communicationMetrics.fillerWordsCount}`);
  console.log(`- STAR Components: S=${strongEvaluation.starAnalysis?.hasSituation}, T=${strongEvaluation.starAnalysis?.hasTask}, A=${strongEvaluation.starAnalysis?.hasAction}, R=${strongEvaluation.starAnalysis?.hasResult}`);
  console.log(`- Contextual Follow-Up: "${strongEvaluation.followUpQuestion}"`);

  if (strongEvaluation.overallScore < 80) {
    console.error(`❌ Expected score >= 80 for strong STAR answer, got ${strongEvaluation.overallScore}`);
    allTestsPassed = false;
  } else {
    console.log('✓ High score granted for comprehensive STAR answer.');
  }

  if (!strongEvaluation.starAnalysis?.hasSituation || !strongEvaluation.starAnalysis?.hasTask || 
      !strongEvaluation.starAnalysis?.hasAction || !strongEvaluation.starAnalysis?.hasResult) {
    console.error('❌ STAR components not fully detected for comprehensive answer.');
    allTestsPassed = false;
  } else {
    console.log('✓ All 4 STAR components (Situation, Task, Action, Result) detected correctly.');
  }

  // TEST 3: Weak Answer with High Filler Count and Missing STAR
  console.log('\n----------------------------------------------------------------');
  console.log('TEST 3: Weak Answer Evaluation (Excessive Fillers & Low Structure)');
  console.log('----------------------------------------------------------------');

  const weakAnswer = 
    'Um, so basically, like, I was working with someone, you know, and like, we had an argument or whatever. ' +
    'And, uh, actually, I just kind of told them that, like, my idea was better, um, so yeah, we kind of did it and it was okay.';

  const weakEvaluation = await evaluateHRAnswer(
    conflictQuestion,
    weakAnswer,
    20
  );

  console.log(`- Overall Score: ${weakEvaluation.overallScore}/100`);
  console.log(`- Rating Band: ${weakEvaluation.ratingBand}`);
  console.log(`- Fillers Detected: ${weakEvaluation.communicationMetrics.fillerWordsCount}`);
  console.log(`- Structure Score: ${weakEvaluation.structureScore}/100`);
  console.log(`- Areas to Improve:`, weakEvaluation.areasToImprove);

  if (weakEvaluation.communicationMetrics.fillerWordsCount < 4) {
    console.error(`❌ Expected >= 4 filler words, detected ${weakEvaluation.communicationMetrics.fillerWordsCount}`);
    allTestsPassed = false;
  } else {
    console.log(`✓ Detected ${weakEvaluation.communicationMetrics.fillerWordsCount} filler words accurately.`);
  }

  if (weakEvaluation.overallScore >= 70) {
    console.error(`❌ Expected score < 70 for weak unstructured answer, got ${weakEvaluation.overallScore}`);
    allTestsPassed = false;
  } else {
    console.log('✓ Appropriately penalized unstructured and filler-heavy answer.');
  }

  // TEST 4: Adaptive Contextual Follow-Up Entity Extraction
  console.log('\n----------------------------------------------------------------');
  console.log('TEST 4: Adaptive Follow-Up Question Entity Detection');
  console.log('----------------------------------------------------------------');

  const projectQuestion = HR_QUESTION_DATASET.find(q => q.id === 'hr_project_01')!;
  const candidateProjectAnswer = 
    'In my Distributed Log Aggregator project, I containerized the services using Docker and orchestrated message ingestion with Redis queues to handle high-velocity telemetry logs. ' +
    'When we encountered connection spikes, I configured connection pooling and cluster replication in PostgreSQL to prevent data loss.';

  const projectEvaluation = await evaluateHRAnswer(
    projectQuestion,
    candidateProjectAnswer,
    55
  );

  console.log(`- Candidate Answer Entities Mentioned: Docker, Redis, PostgreSQL`);
  console.log(`- Generated Follow-Up: "${projectEvaluation.followUpQuestion}"`);

  const entitiesPresentInFollowUp = 
    projectEvaluation.followUpQuestion.toLowerCase().includes('docker') ||
    projectEvaluation.followUpQuestion.toLowerCase().includes('redis') ||
    projectEvaluation.followUpQuestion.toLowerCase().includes('postgresql');

  if (!entitiesPresentInFollowUp) {
    console.error('❌ Follow-up question failed to adapt to candidate entities.');
    allTestsPassed = false;
  } else {
    console.log('✓ Adaptive follow-up successfully grounded in candidate response context.');
  }

  // TEST 5: Question Styles & Difficulty Adaptability
  console.log('\n----------------------------------------------------------------');
  console.log('TEST 5: Question Styles & Difficulty Adaptability');
  console.log('----------------------------------------------------------------');

  const styles: ('Friendly' | 'Professional' | 'Challenging')[] = ['Friendly', 'Professional', 'Challenging'];
  for (const style of styles) {
    const cfg: HRInterviewConfig = { ...mockConfig, style };
    const questions = selectInterviewQuestions(cfg, mockResume);
    console.log(`✓ Style "${style}": Generated ${questions.length} questions successfully.`);
  }

  console.log('\n================================================================');
  if (allTestsPassed) {
    console.log('🎉 ALL HR VOICE INTERVIEW MODULE TESTS PASSED SUCCESSFULLY!');
  } else {
    console.log('❌ SOME TESTS FAILED. CHECK OUTPUT ABOVE.');
    process.exit(1);
  }
  console.log('================================================================\n');
}

runTestSuite().catch(err => {
  console.error('Unhandled test suite error:', err);
  process.exit(1);
});
