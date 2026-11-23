import { TECHNICAL_QUESTION_DATASET } from '../src/nlp/questionDataset';
import { evaluateAnswerNLP } from '../src/nlp/nlpQuestionMatcher';

console.log('================================================================');
console.log('CAREERCURVE AI TECHNICAL INTERVIEW: NLP ANSWER EVALUATION TESTS');
console.log('================================================================\n');

// Find cs_rest_01 in the question dataset
const restQuestion = TECHNICAL_QUESTION_DATASET.find((q) => q.id === 'cs_rest_01');
if (!restQuestion) {
  console.error('Error: cs_rest_01 question not found in dataset!');
  process.exit(1);
}

const testCases = [
  {
    name: 'Scenario 1: Correct Answer with Different Phrasing & Vocabulary',
    description: 'Uses unique engineering phrasing ("system state", "network retries", "f(f(x)) = f(x)", "duplicate records") rather than copying the benchmark textbook answer word-for-word.',
    answer: 'In API architecture, idempotency ensures that network retries do not corrupt system state. Repeating the operation has no additional side effects: f(x) = f(f(x)). For instance, updating a user profile via PUT or removing an account with DELETE results in the same final system state regardless of retry count. In contrast, submitting an order with POST creates a new transaction each time and is strictly non-idempotent.',
    expectedMinScore: 80,
    expectedMaxScore: 100,
    expectedBand: '85–100: Strong, Technically Correct Answer',
  },
  {
    name: 'Scenario 2: Partially Correct Answer with Omitted Concepts',
    description: 'Mentions GET and PUT being idempotent, but omits DELETE entirely and lacks detail on why POST creates duplicate resources.',
    answer: 'Idempotent HTTP methods produce the same outcome when invoked repeatedly. For example GET and PUT are idempotent because fetching or updating yields the same data.',
    expectedMinScore: 40,
    expectedMaxScore: 65,
    expectedBand: '45–64: Partially Correct',
  },
  {
    name: 'Scenario 3: Keyword Repetition Explaining the Wrong Concept (Keyword Stuffing)',
    description: 'Includes multiple matching keywords ("http", "rest", "api", "idempotent", "post", "safe") but makes the false claim that POST is idempotent.',
    answer: 'HTTP REST API methods are idempotent. POST is an idempotent HTTP REST method because POST is safe and idempotent. Calling POST multiple times is idempotent in REST APIs.',
    expectedMinScore: 0,
    expectedMaxScore: 40,
    expectedBand: '21–44: Limited Understanding',
  },
  {
    name: 'Scenario 4: Completely Unrelated Answer (Off-Topic / Nonsense)',
    description: 'Candidate submits a cooking recipe completely unrelated to HTTP methods or REST APIs.',
    answer: 'I love making homemade pepperoni pizza with mozzarella cheese and tomato sauce in a wood fired oven on weekends with friends.',
    expectedMinScore: 0,
    expectedMaxScore: 20,
    expectedBand: '0–20: Incorrect or Irrelevant',
  },
  {
    name: 'Scenario 5: Mixed Answer (Valid Concepts Alongside Serious Misconception)',
    description: 'Correctly defines idempotence and explains GET/PUT, but commits the common error of claiming DELETE is non-idempotent because of HTTP 404 status.',
    answer: 'Idempotence means multiple identical requests leave the server in the same state. GET is safe and idempotent, and PUT replaces the entire resource. However, DELETE is not idempotent because when you delete something a second time you get a 404 error instead of 200.',
    expectedMinScore: 40,
    expectedMaxScore: 70,
    expectedBand: '45–64: Partially Correct',
  },
];

let allPassed = true;

for (let i = 0; i < testCases.length; i++) {
  const tc = testCases[i];
  console.log(`----------------------------------------------------------------`);
  console.log(`TEST ${i + 1}: ${tc.name}`);
  console.log(`Description: ${tc.description}`);
  console.log(`Answer:\n  "${tc.answer}"\n`);

  const result = evaluateAnswerNLP(restQuestion, tc.answer);

  console.log(`RESULTS:`);
  console.log(`- Final Score: ${result.technicalAccuracyScore} / 100`);
  console.log(`- Evaluation Band: "${result.evaluationBand}"`);
  console.log(`- Rubric Breakdown:`);
  if (result.rubricBreakdown) {
    console.log(`    * Technical Correctness (40%): ${result.rubricBreakdown.technicalCorrectness.weightedPoints} / 40 (${result.rubricBreakdown.technicalCorrectness.score}%)`);
    console.log(`    * Essential Concepts (30%):    ${result.rubricBreakdown.essentialCoverage.weightedPoints} / 30 (${result.rubricBreakdown.essentialCoverage.score}%)`);
    console.log(`    * Relevance & Semantic (20%):   ${result.rubricBreakdown.relevanceSemantic.weightedPoints} / 20 (${result.rubricBreakdown.relevanceSemantic.score}%)`);
    console.log(`    * Reasoning & Clarity (10%):   ${result.rubricBreakdown.reasoningAndClarity.weightedPoints} / 10 (${result.rubricBreakdown.reasoningAndClarity.score}%)`);
  }
  console.log(`- Concepts Mastered: ${result.keywordCoverage?.found?.join(', ') || 'None'}`);
  console.log(`- Missing Concepts:  ${result.keywordCoverage?.missing?.join(', ') || 'None'}`);

  if (result.misconceptionsDetected && result.misconceptionsDetected.length > 0) {
    console.log(`- Misconceptions Detected (${result.misconceptionsDetected.length}):`);
    for (const m of result.misconceptionsDetected) {
      console.log(`    ! [Deduction -${m.penaltyPoints} pts] ${m.description}: ${m.whyIncorrect}`);
    }
  } else {
    console.log(`- Misconceptions Detected: None`);
  }

  console.log(`- Strengths: ${result.strengths?.join('; ') || 'None'}`);
  console.log(`- Improvements: ${result.improvements?.join('; ') || 'None'}`);

  // Assertions
  const score = result.technicalAccuracyScore;
  const isScoreInRange = score >= tc.expectedMinScore && score <= tc.expectedMaxScore;
  if (isScoreInRange) {
    console.log(`\n>>> PASS: Score ${score} is within expected range [${tc.expectedMinScore}, ${tc.expectedMaxScore}].`);
  } else {
    console.log(`\n>>> FAIL: Score ${score} outside expected range [${tc.expectedMinScore}, ${tc.expectedMaxScore}].`);
    allPassed = false;
  }
}

console.log('\n================================================================');
if (allPassed) {
  console.log('ALL 5 EVALUATION TEST SCENARIOS PASSED SUCCESSFULLY!');
} else {
  console.log('SOME TEST SCENARIOS FAILED OR NEEDED TUNING.');
}
console.log('================================================================\n');
