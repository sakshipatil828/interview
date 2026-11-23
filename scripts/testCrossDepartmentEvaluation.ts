import { TECHNICAL_QUESTION_DATASET } from '../src/nlp/questionDataset';
import { evaluateAnswerNLP } from '../src/nlp/nlpQuestionMatcher';

console.log('================================================================');
console.log('CAREERCURVE AI: CROSS-DEPARTMENT ANSWER EVALUATION TESTS');
console.log('================================================================\n');

const testCases = [
  {
    department: 'Civil Engineering',
    questionId: 'ce_concrete_01',
    name: 'IS 456 Under-Reinforced vs Over-Reinforced Beams',
    answer: 'In RCC design according to IS 456, an under-reinforced beam has steel percentage less than limiting percentage, so steel yields first giving visible crack deflection warning before failure, ensuring ductile mode. An over-reinforced section has concrete crush first in sudden brittle compression failure without warning, which is hazardous.',
    expectedMinScore: 80,
  },
  {
    department: 'Electrical & Electronics Engineering (EEE)',
    questionId: 'eee_buck_converter_diagram_02',
    name: 'Buck Converter Continuous Conduction Mode',
    answer: 'A buck converter steps down DC input voltage to a lower output voltage based on duty cycle D = Vout / Vin. In continuous conduction mode, the inductor current never falls to zero during the switching cycle, maintaining volt-second balance across L. When the MOSFET switch opens, the freewheeling diode conducts, discharging stored inductor magnetic energy continuously through the output filter capacitor into the load.',
    expectedMinScore: 80,
  },
  {
    department: 'Mechanical Engineering',
    questionId: 'me_otto_diagram_01',
    name: 'Otto Cycle Thermal Efficiency & Knocking',
    answer: 'The four processes of the ideal Otto cycle are isentropic compression, constant volume heat addition, isentropic expansion, and constant volume heat rejection. Thermal efficiency increases with compression ratio r according to efficiency = 1 - (1 / r^(gamma-1)). However, raising compression ratio excessively causes high end-gas temperature and pressure, leading to auto-ignition and engine knocking.',
    expectedMinScore: 80,
  },
  {
    department: 'Data Science & Machine Learning',
    questionId: 'ds_bias_variance_01',
    name: 'Bias-Variance Tradeoff & Regularization',
    answer: 'High bias results in underfitting from oversimplified assumptions, whereas high variance results in overfitting by learning training set noise. L1 Lasso regularization drives non-essential coefficients strictly to zero for sparse feature selection, while L2 Ridge shrinks weights smoothly.',
    expectedMinScore: 80,
  }
];

let allPassed = true;

for (const tc of testCases) {
  const q = TECHNICAL_QUESTION_DATASET.find(x => x.id === tc.questionId);
  if (!q) {
    console.error(`Question ${tc.questionId} not found in dataset!`);
    continue;
  }

  const result = evaluateAnswerNLP(q, tc.answer);
  console.log(`[${tc.department}] ${tc.name}`);
  console.log(`- Final Score: ${result.technicalAccuracyScore} / 100 (${result.overallRating})`);
  console.log(`- Concepts Mastered: ${result.keywordCoverage?.found.join(', ') || 'None'}`);
  console.log(`- Missing Concepts: ${result.keywordCoverage?.missing.join(', ') || 'None'}`);
  console.log(`- Misconceptions: ${result.misconceptionsDetected?.length || 0}`);
  
  if (result.technicalAccuracyScore >= tc.expectedMinScore) {
    console.log(`>>> PASS: Score ${result.technicalAccuracyScore} >= ${tc.expectedMinScore}\n`);
  } else {
    console.log(`>>> FAIL: Score ${result.technicalAccuracyScore} < ${tc.expectedMinScore}\n`);
    allPassed = false;
  }
}

if (allPassed) {
  console.log('ALL CROSS-DEPARTMENT EVALUATION TESTS PASSED!');
} else {
  console.log('SOME TESTS FAILED.');
}
