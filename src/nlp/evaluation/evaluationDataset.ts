import { QuestionEvaluationBenchmark, EssentialConcept } from './types';
import { EngineeringDepartment } from '../types';
import { STOP_WORDS } from '../textPreprocessor';

/**
 * Comprehensive Evaluation Benchmarks for all supported technical interview questions.
 * Contains essential concepts, accepted alternative phrasing, common misconceptions,
 * rubrics, and labeled reference example answers across all 8 branches.
 */
export const EVALUATION_BENCHMARK_DATASET: Record<string, QuestionEvaluationBenchmark> = {
  // =========================================================================
  // COMPUTER SCIENCE & ENGINEERING (CSE)
  // =========================================================================
  'cs_rest_01': {
    questionId: 'cs_rest_01',
    department: 'Computer Science & Engineering',
    subject: 'Web Technologies & Backend',
    difficulty: 'Beginner',
    expectedAnswer: 'Idempotence means making multiple identical requests has the same side-effect on server state as making a single request. GET, HEAD, and OPTIONS are safe and idempotent. PUT and DELETE are idempotent because repeating PUT with the same payload results in the identical resource state, and deleting a resource twice leaves it deleted. In contrast, POST is non-idempotent because multiple calls create multiple distinct resources. PATCH is generally non-idempotent unless designed carefully.',
    essentialConcepts: [
      {
        id: 'idempotence_definition',
        name: 'Definition of Idempotence',
        description: 'Multiple identical requests leave server state identical to a single request',
        keyPhrases: ['same side effect', 'identical server state', 'multiple requests have same effect', 'same result whether called once or many times', 'no additional side effects', 'same final system state', 'same outcome', 'same outcome when invoked repeatedly'],
        synonyms: ['repeatable without side effects', 'state invariant on repetition', 'subsequent requests produce identical state', 'network retries do not corrupt system state', 'produce the same outcome when invoked repeatedly'],
        weight: 1.0,
      },
      {
        id: 'idempotent_methods',
        name: 'Idempotent HTTP Methods (GET, PUT, DELETE)',
        description: 'Identifies that GET, PUT, and DELETE are idempotent',
        keyPhrases: ['get is idempotent', 'put is idempotent', 'delete is idempotent', 'put and delete are idempotent', 'get, put, delete', 'put or delete', 'put or removing an account with delete'],
        synonyms: ['get put delete are repeatable', 'retrieval updating deleting are idempotent', 'put or delete results in same final system state'],
        weight: 1.0,
      },
      {
        id: 'non_idempotent_post',
        name: 'POST Non-Idempotence',
        description: 'Identifies that POST creates new distinct resources on each invocation',
        keyPhrases: ['post is not idempotent', 'post creates multiple resources', 'post is non-idempotent', 'each post creates a new record', 'strictly non-idempotent', 'post creates a new transaction'],
        synonyms: ['post adds duplicate items', 'multiple post calls create multiple entries', 'submitting with post creates new transaction'],
        weight: 1.0,
      }
    ],
    supportingConcepts: [
      {
        id: 'safe_methods',
        name: 'Safe vs Idempotent',
        description: 'Safe methods like GET do not modify server state at all',
        keyPhrases: ['safe methods', 'get does not modify state', 'read only'],
      },
      {
        id: 'patch_semantics',
        name: 'PATCH Idempotence Nuance',
        description: 'PATCH can be non-idempotent if performing relative operations like increments',
        keyPhrases: ['patch can be non-idempotent', 'partial update', 'relative increment'],
      }
    ],
    acceptedAlternatives: [
      {
        targetConceptId: 'idempotence_definition',
        phrasingPattern: 'f(f(x)) = f(x)',
        explanation: 'Mathematical formulation of idempotency function application accepted.',
      },
      {
        targetConceptId: 'idempotence_definition',
        phrasingPattern: 'f(x) = f(f(x))',
        explanation: 'Mathematical formulation of idempotency function application accepted.',
      },
      {
        targetConceptId: 'idempotence_definition',
        phrasingPattern: 'network retries do not corrupt system state',
        explanation: 'Pragmatic distributed retry phrasing accepted.',
      },
      {
        targetConceptId: 'idempotence_definition',
        phrasingPattern: 'retrying the request does not change the database state again',
        explanation: 'Pragmatic distributed retry phrasing accepted.',
      }
    ],
    commonMisconceptions: [
      {
        id: 'post_is_idempotent',
        triggerPhrases: ['post is idempotent', 'post method is idempotent'],
        description: 'Claimed POST is idempotent',
        penaltyPoints: 20,
        whyIncorrect: 'POST creates a new distinct subordinate resource on every call, making it strictly non-idempotent.',
      },
      {
        id: 'delete_not_idempotent',
        triggerPhrases: ['delete is not idempotent', 'delete is non-idempotent'],
        description: 'Claimed DELETE is not idempotent',
        penaltyPoints: 15,
        whyIncorrect: 'DELETE is idempotent by HTTP RFC specification because deleting an already-deleted resource leaves the server resource in the same non-existent state (returning 404/204).',
      }
    ],
    scoringRubric: {
      technicalCorrectnessWeight: 0.40,
      essentialCoverageWeight: 0.30,
      relevanceSemanticWeight: 0.20,
      reasoningWeight: 0.10,
    },
    exampleAnswers: [
      {
        type: 'correct',
        answerText: 'An idempotent HTTP method means that calling the endpoint multiple times with the exact same payload produces the exact same server state as calling it once. GET, PUT, and DELETE are idempotent. PUT replaces the entire resource so calling it 5 times leaves the resource identical. DELETE is idempotent because after deleting, repeating DELETE leaves the item gone. POST is not idempotent because repeating it inserts multiple duplicate records.',
        expectedScoreRange: [90, 100],
        expectedBand: '85–100: Strong, Technically Correct Answer',
        explanation: 'Accurately defines idempotency, categorizes GET/PUT/DELETE, and explains why POST is non-idempotent.',
      },
      {
        type: 'alternative-phrasing',
        answerText: 'In API architecture, idempotency ensures that network retries do not corrupt system state. Repeating the operation has no additional side effects: f(x) = f(f(x)). For instance, updating user profile via PUT or removing an account with DELETE results in the same final system state regardless of retry count. Conversely, submitting an order with POST creates a new transaction each time.',
        expectedScoreRange: [85, 95],
        expectedBand: '85–100: Strong, Technically Correct Answer',
        explanation: 'Uses unique mathematical and retry-oriented vocabulary while conveying complete technical correctness.',
      },
      {
        type: 'partially-correct',
        answerText: 'GET and PUT are idempotent because they fetch or update data without creating new records. POST creates new things.',
        expectedScoreRange: [48, 60],
        expectedBand: '45–64: Partially Correct',
        explanation: 'Correctly mentions GET/PUT/POST but omits DELETE, does not formalize the definition of idempotency, and is brief.',
      },
      {
        type: 'misconception',
        answerText: 'All HTTP methods are idempotent in REST APIs including POST, GET, and PUT, because they all return HTTP status codes like 200 OK.',
        expectedScoreRange: [15, 30],
        expectedBand: '21–44: Limited Understanding',
        explanation: 'Contains severe misconception that POST is idempotent and confuses HTTP response status codes with server-side state idempotence.',
      },
      {
        type: 'incorrect',
        answerText: 'REST APIs communicate with databases using JSON envelopes over internet sockets to render HTML pages.',
        expectedScoreRange: [0, 15],
        expectedBand: '0–20: Incorrect or Irrelevant',
        explanation: 'Off-topic general web description that fails to answer the question about idempotency.',
      }
    ]
  },

  'cs_mysql_01': {
    questionId: 'cs_mysql_01',
    department: 'Computer Science & Engineering',
    subject: 'Database Management Systems',
    difficulty: 'Intermediate',
    expectedAnswer: 'InnoDB uses B+Tree indexing where leaf nodes contain clustered data (primary key) or secondary index pointers. A query with WHERE age > 25 ORDER BY created_at causes a filesort because a range condition (age > 25) prevents subsequent columns in a composite index from being accessed in pre-sorted order, forcing the query optimizer to sort matching rows in a memory buffer (sort_buffer_size) or temporary disk files.',
    essentialConcepts: [
      {
        id: 'btree_structure',
        name: 'B+Tree Index Mechanics',
        description: 'InnoDB organizes tables in B+Tree structures with clustered and secondary indexes',
        keyPhrases: ['b+tree', 'btree', 'clustered index', 'leaf nodes', 'secondary index'],
        synonyms: ['balanced tree', 'index tree', 'leaf pointers'],
        weight: 1.0,
      },
      {
        id: 'range_prevents_order',
        name: 'Range Filter Blocks Index Sort Order',
        description: 'Range inequality (> 25) breaks leftmost index order for subsequent sorting column',
        keyPhrases: ['range condition prevents ordering', 'range filter', 'leftmost prefix', 'age > 25 stops sorting'],
        synonyms: ['inequality operator disrupts index order', 'range scan breaks sort order'],
        weight: 1.0,
      },
      {
        id: 'filesort_explanation',
        name: 'Filesort in Memory/Disk',
        description: 'Filesort sorts rows in memory buffer or disk rather than using index ordering',
        keyPhrases: ['filesort', 'sort buffer', 'sort_buffer_size', 'temporary sort in memory or disk'],
        synonyms: ['sorting outside of index', 'manual sorting in ram', 'extra filesort'],
        weight: 1.0,
      }
    ],
    supportingConcepts: [
      {
        id: 'composite_index',
        name: 'Composite Index Strategy',
        description: 'Creating composite index (created_at, age) or tuning query design',
        keyPhrases: ['composite index', 'index(age, created_at)', 'explain plan'],
      }
    ],
    acceptedAlternatives: [
      {
        targetConceptId: 'filesort_explanation',
        phrasingPattern: 'mysql has to perform an out-of-index sort pass using quicksort',
        explanation: 'Accepted algorithmic explanation of filesort quicksort pass.',
      }
    ],
    commonMisconceptions: [
      {
        id: 'filesort_means_text_file',
        triggerPhrases: ['filesort means writing to text file', 'filesort means it creates a text file on windows'],
        description: 'Belief that filesort creates external text files',
        penaltyPoints: 15,
        whyIncorrect: 'Filesort is MySQL internal nomenclature for sorting records without using the index tree order; it typically occurs in RAM (sort_buffer_size) and only touches disk if buffer overflows.',
      }
    ],
    scoringRubric: {
      technicalCorrectnessWeight: 0.40,
      essentialCoverageWeight: 0.30,
      relevanceSemanticWeight: 0.20,
      reasoningWeight: 0.10,
    },
    exampleAnswers: [
      {
        type: 'correct',
        answerText: 'In InnoDB, indexes are structured as balanced B+Trees where leaf nodes maintain sorted keys. In the query WHERE age > 25 ORDER BY created_at, the range comparison on age means matching index records are scattered across multiple branch ranges. Because of the leftmost prefix rule, MySQL cannot scan the index in sequential created_at order, so it extracts the matching rows into sort_buffer_size and performs an internal filesort pass.',
        expectedScoreRange: [88, 98],
        expectedBand: '85–100: Strong, Technically Correct Answer',
        explanation: 'Accurately connects B+Tree leaves, range operators breaking sorted order, and memory filesort mechanism.',
      },
      {
        type: 'partially-correct',
        answerText: 'B-Trees store data sorted. When you do age > 25, MySQL does a range scan and cannot use the index for created_at, so it uses filesort.',
        expectedScoreRange: [50, 62],
        expectedBand: '45–64: Partially Correct',
        explanation: 'Mentions range scan and filesort but lacks explanation of B+Tree leaf structure and sort buffer mechanics.',
      },
      {
        type: 'incorrect',
        answerText: 'Filesort happens when MySQL cannot connect to the database hard drive so it stores tables in memory caches.',
        expectedScoreRange: [0, 15],
        expectedBand: '0–20: Incorrect or Irrelevant',
        explanation: 'Completely erroneous description of database storage and file I/O.',
      }
    ]
  },

  'cs_coding_twosum_01': {
    questionId: 'cs_coding_twosum_01',
    department: 'Computer Science & Engineering',
    subject: 'Data Structures & Algorithms',
    difficulty: 'Beginner',
    expectedAnswer: 'Use a single-pass Hash Map storing (number -> index). As we iterate through nums, for each element num at index i, compute complement = target - num. If complement is already in the map, return [map.get(complement), i]. Otherwise insert num with index i into the map. Time complexity is O(n) and auxiliary space complexity is O(n).',
    essentialConcepts: [
      {
        id: 'hash_map_lookup',
        name: 'Hash Map Auxiliary Storage',
        description: 'Using Hash Map/Dictionary to achieve O(1) complement lookup',
        keyPhrases: ['hash map', 'hashmap', 'dictionary', 'hash table', 'map'],
        synonyms: ['associative array', 'key value lookup', 'unordered_map'],
        weight: 1.0,
      },
      {
        id: 'complement_calculation',
        name: 'Target Complement Calculation',
        description: 'Calculating complement = target - current_element',
        keyPhrases: ['target - num', 'complement', 'target - current', 'difference target'],
        synonyms: ['remainder target minus value', 'delta calculation'],
        weight: 1.0,
      },
      {
        id: 'complexity_linear',
        name: 'O(n) Time and Space Complexity',
        description: 'Single-pass linear time O(n) and auxiliary space O(n)',
        keyPhrases: ['o(n) time', 'linear time', 'o(n) space', 'single pass'],
        synonyms: ['linear complexity', 'time complexity o(n)'],
        weight: 1.0,
      }
    ],
    supportingConcepts: [
      {
        id: 'two_pointer_tradeoff',
        name: 'Two Pointer on Sorted Array Tradeoff',
        description: 'Sorting array takes O(n log n) but reduces space to O(1)',
        keyPhrases: ['two pointer', 'sorted array', 'o(n log n)'],
      }
    ],
    acceptedAlternatives: [
      {
        targetConceptId: 'hash_map_lookup',
        phrasingPattern: 'store visited numbers in an associative lookup table to check the delta in constant time',
        explanation: 'Accepted algorithmic phrasing for hash map lookup.',
      }
    ],
    commonMisconceptions: [
      {
        id: 'nested_loops_optimal',
        triggerPhrases: ['nested for loops are o(n)', 'two loops give o(n)'],
        description: 'Claimed nested brute-force loops achieve O(n)',
        penaltyPoints: 20,
        whyIncorrect: 'Nested loops checking all pairs (nums[i] + nums[j] == target) run in quadratic O(n^2) time, which violates the O(n) requirement.',
      }
    ],
    scoringRubric: {
      technicalCorrectnessWeight: 0.40,
      essentialCoverageWeight: 0.30,
      relevanceSemanticWeight: 0.20,
      reasoningWeight: 0.10,
    },
    exampleAnswers: [
      {
        type: 'correct',
        answerText: 'We maintain a hash map where keys are numbers seen and values are their array indices. In one pass through the list, we calculate complement = target - nums[i]. If complement is in our map, we immediately return [map[complement], i]. Otherwise we store nums[i] -> i. This solves the problem in O(n) linear time and O(n) auxiliary memory.',
        expectedScoreRange: [90, 100],
        expectedBand: '85–100: Strong, Technically Correct Answer',
        explanation: 'Complete and optimal explanation of Two Sum.',
      },
      {
        type: 'partially-correct',
        answerText: 'We can loop through the array and check if target minus current element exists in a hashmap to return the indices.',
        expectedScoreRange: [55, 68],
        expectedBand: '45–64: Partially Correct',
        explanation: 'Identifies hashmap and complement subtraction, but omits time/space complexity and duplicate index handling.',
      },
      {
        type: 'misconception',
        answerText: 'Run two nested for loops from 0 to n and check if nums[i] + nums[j] == target. Since there are only two loops, the time complexity is O(n).',
        expectedScoreRange: [20, 35],
        expectedBand: '21–44: Limited Understanding',
        explanation: 'Explains brute force O(n^2) algorithm while falsely claiming it is O(n).',
      }
    ]
  },

  // =========================================================================
  // ELECTRONICS & COMMUNICATION ENGINEERING (ECE)
  // =========================================================================
  'ece_opamp_diagram_01': {
    questionId: 'ece_opamp_diagram_01',
    department: 'Electronics & Communication Engineering',
    subject: 'Analog Circuits & Instrumentation',
    difficulty: 'Beginner',
    expectedAnswer: 'In the inverting amplifier circuit with Vin = 0.4V, Rin = 10kΩ, and Rf = 100kΩ: Closed loop voltage gain Av = -Rf / Rin = -100k / 10k = -10. Output voltage Vout = Av * Vin = -10 * 0.4V = -4.0V. The non-inverting terminal is connected to ground (0V). Due to infinite open-loop gain and negative feedback through Rf, the op-amp drives the inverting terminal to 0V as well, creating a Virtual Ground that draws no current into the high-impedance input terminals.',
    essentialConcepts: [
      {
        id: 'gain_calculation',
        name: 'Gain Formula (Av = -Rf / Rin = -10)',
        description: 'Calculates closed loop voltage gain Av = -10',
        keyPhrases: ['-rf / rin', '-10', 'gain of -10', 'av = -10', '-100k / 10k'],
        synonyms: ['inverting gain equals minus ten', 'closed loop amplification factor is -10'],
        weight: 1.0,
      },
      {
        id: 'vout_calculation',
        name: 'Output Voltage (Vout = -4.0V)',
        description: 'Calculates Vout = -4.0V for Vin = 0.4V',
        keyPhrases: ['-4v', '-4.0v', 'output is -4 volts', 'vout = -4'],
        synonyms: ['minus 4 volts', 'negative 4 volts'],
        weight: 1.0,
      },
      {
        id: 'virtual_ground_concept',
        name: 'Virtual Ground at Inverting Terminal',
        description: 'Negative feedback forces inverting terminal to ground potential (0V)',
        keyPhrases: ['virtual ground', 'inverting terminal is at 0v', 'virtual earth', 'negative feedback drives inverting pin to 0v'],
        synonyms: ['zero potential at node', '0v virtual reference'],
        weight: 1.0,
      }
    ],
    supportingConcepts: [
      {
        id: 'infinite_input_impedance',
        name: 'Infinite Input Impedance',
        description: 'Zero input bias current flows into op-amp internal stages',
        keyPhrases: ['infinite input impedance', 'no current enters opamp', 'zero bias current'],
      }
    ],
    acceptedAlternatives: [
      {
        targetConceptId: 'virtual_ground_concept',
        phrasingPattern: 'because the non-inverting input is grounded, feedback loop keeps difference v+ - v- at zero',
        explanation: 'Accepted alternative derivation of virtual ground via differential voltage nulling.',
      }
    ],
    commonMisconceptions: [
      {
        id: 'positive_gain_inverting',
        triggerPhrases: ['gain is +10', 'vout is +4v', 'vout is 4v'],
        description: 'Omitted negative inversion sign on gain or output voltage',
        penaltyPoints: 15,
        whyIncorrect: 'In an inverting amplifier configuration, output signal is 180° out of phase with input, requiring a negative sign: Av = -Rf/Rin = -10 and Vout = -4.0V.',
      },
      {
        id: 'virtual_ground_carries_ground_current',
        triggerPhrases: ['virtual ground connects directly to physical earth to sink current'],
        description: 'Confused virtual ground with physical earth ground',
        penaltyPoints: 15,
        whyIncorrect: 'Virtual ground is an equipotential node held at 0V by negative feedback; no current flows from it into ground.',
      }
    ],
    scoringRubric: {
      technicalCorrectnessWeight: 0.40,
      essentialCoverageWeight: 0.30,
      relevanceSemanticWeight: 0.20,
      reasoningWeight: 0.10,
    },
    exampleAnswers: [
      {
        type: 'correct',
        answerText: 'For this inverting amplifier, the gain is Av = -Rf / Rin = -100kΩ / 10kΩ = -10. With Vin = 0.4V, the output voltage Vout = Av * Vin = -10 * 0.4V = -4.0V. The non-inverting pin is connected to ground (0V). Because the ideal op-amp has infinite open loop gain and negative feedback, the differential voltage (V+ - V-) is forced to zero, making the inverting input a virtual ground at 0V without drawing current.',
        expectedScoreRange: [90, 100],
        expectedBand: '85–100: Strong, Technically Correct Answer',
        explanation: 'Accurate calculations (-10 gain, -4.0V output) and clear explanation of virtual ground mechanism.',
      },
      {
        type: 'partially-correct',
        answerText: 'Gain is -10 and Vout is -4V. The inverting terminal is at 0V.',
        expectedScoreRange: [55, 65],
        expectedBand: '45–64: Partially Correct',
        explanation: 'Calculations are correct, but answer is very brief and fails to explain the role of negative feedback in establishing virtual ground.',
      },
      {
        type: 'misconception',
        answerText: 'The voltage gain is Av = Rf / Rin = 100k / 10k = 10, so output voltage is 4.0V. The inverting terminal is physically connected to ground.',
        expectedScoreRange: [25, 40],
        expectedBand: '21–44: Limited Understanding',
        explanation: 'Lost negative inversion sign (+10 gain, +4V) and erroneously claimed inverting terminal is physically grounded.',
      }
    ]
  },

  // =========================================================================
  // ELECTRICAL & ELECTRONICS ENGINEERING (EEE)
  // =========================================================================
  'eee_buck_converter_diagram_02': {
    questionId: 'eee_buck_converter_diagram_02',
    department: 'Electrical & Electronics Engineering',
    subject: 'Power Electronics & Drives',
    difficulty: 'Intermediate',
    expectedAnswer: 'In Continuous Conduction Mode (CCM), the average output voltage of a buck converter is Vout = D * Vin = 0.25 * 48V = 12.0V. When the power MOSFET switch S1 turns off, the inductor current cannot change instantaneously. The inductor voltage polarity flips, forward-biasing the freewheeling diode D1 to provide a continuous closed loop for inductor discharge through the load, maintaining continuous load current.',
    essentialConcepts: [
      {
        id: 'buck_voltage_calc',
        name: 'Output Voltage Calculation (Vout = D * Vin = 12V)',
        description: 'Computes Vout = 0.25 * 48V = 12.0V',
        keyPhrases: ['vout = d * vin', '12v', '12.0v', '0.25 * 48', 'step down to 12v'],
        synonyms: ['output voltage is 12 volts', 'converts 48v to 12v'],
        weight: 1.0,
      },
      {
        id: 'freewheeling_diode_purpose',
        name: 'Freewheeling Diode Discharge Loop',
        description: 'Diode D1 conducts when switch is off, maintaining inductor current flow',
        keyPhrases: ['freewheeling diode provides path', 'inductor current continuity', 'discharges through d1', 'diode conducts when switch turns off', 'freewheeling diode conducts', 'discharging stored inductor'],
        synonyms: ['circulates inductor current during off state', 'freewheel path for magnetic energy', 'freewheeling diode allows discharge'],
        weight: 1.0,
      },
      {
        id: 'volt_second_balance',
        name: 'Inductor Volt-Second Balance in CCM',
        description: 'Steady state requires average inductor voltage across period to be zero',
        keyPhrases: ['volt-second balance', 'continuous conduction mode', 'inductor stores energy during on-state', 'ccm'],
        synonyms: ['volt second equilibrium', 'net inductor flux balance'],
        weight: 1.0,
      }
    ],
    supportingConcepts: [
      {
        id: 'output_filter',
        name: 'LC Low-Pass Filter Ripple Attenuation',
        description: 'Inductor L and Capacitor C smooth triangular ripple',
        keyPhrases: ['lc filter', 'output ripple', 'capacitor smooths voltage'],
      }
    ],
    acceptedAlternatives: [
      {
        targetConceptId: 'freewheeling_diode_purpose',
        phrasingPattern: 'diode prevents inductive voltage spikes by clamping the switch node when mosfet opens',
        explanation: 'Accepted transient protection description of freewheeling diode.',
      }
    ],
    commonMisconceptions: [
      {
        id: 'buck_steps_up_voltage',
        triggerPhrases: ['buck converter steps up voltage', 'vout = vin / d'],
        description: 'Claimed buck converter boosts voltage',
        penaltyPoints: 20,
        whyIncorrect: 'Buck converter is strictly a step-down DC-DC converter with output Vout = D * Vin <= Vin. Boost converters step up voltage.',
      }
    ],
    scoringRubric: {
      technicalCorrectnessWeight: 0.40,
      essentialCoverageWeight: 0.30,
      relevanceSemanticWeight: 0.20,
      reasoningWeight: 0.10,
    },
    exampleAnswers: [
      {
        type: 'correct',
        answerText: 'In Continuous Conduction Mode, output voltage is governed by Vout = D * Vin = 0.25 * 48V = 12.0V. When MOSFET S1 is ON, diode D1 is reverse biased and inductor L charges. When S1 turns off, inductor current cannot drop to zero immediately. The inductor polarity reverses, forward biasing the freewheeling diode D1 to keep load current flowing continuously through the LC filter.',
        expectedScoreRange: [88, 100],
        expectedBand: '85–100: Strong, Technically Correct Answer',
        explanation: 'Full mathematical calculation and thorough explanation of freewheeling current loop.',
      },
      {
        type: 'partially-correct',
        answerText: 'Vout is 12V because duty cycle is 25%. Diode D1 is for freewheeling when the switch opens.',
        expectedScoreRange: [48, 60],
        expectedBand: '45–64: Partially Correct',
        explanation: 'Gives the correct numerical value but lacks detail on inductor continuity, polarity reversal, and CCM dynamics.',
      },
      {
        type: 'misconception',
        answerText: 'Buck converter steps up voltage from 48V to 192V using formula Vout = Vin / (1 - D). The diode boosts the power.',
        expectedScoreRange: [10, 25],
        expectedBand: '0–20: Incorrect or Irrelevant',
        explanation: 'Confused Buck converter with Boost converter and used incorrect formula.',
      }
    ]
  },

  // =========================================================================
  // CIVIL ENGINEERING
  // =========================================================================
  'ce_bmd_diagram_01': {
    questionId: 'ce_bmd_diagram_01',
    department: 'Civil Engineering',
    subject: 'Structural Engineering & Mechanics',
    difficulty: 'Beginner',
    expectedAnswer: 'For span L = 6m and center load W = 20kN: Support reactions Ra = Rb = W / 2 = 10 kN due to symmetry. Maximum shear force Vmax = 10 kN. Maximum bending moment Mmax = (W * L) / 4 = (20 * 6) / 4 = 30.0 kNm at mid-span. The mathematical relationship is dM/dx = V (the derivative of bending moment with respect to span position equals shear force). Maximum bending moment occurs where shear force equals zero or changes sign.',
    essentialConcepts: [
      {
        id: 'reaction_and_shear_calc',
        name: 'Reactions Ra = Rb = 10kN & Vmax = 10kN',
        description: 'Computes support reactions Ra = Rb = 10 kN',
        keyPhrases: ['ra = 10 kn', 'rb = 10 kn', 'reactions are 10kn', 'vmax = 10 kn', '10 kn'],
        synonyms: ['both reactions equal ten kilonewtons', 'half the load on each support'],
        weight: 1.0,
      },
      {
        id: 'moment_calc',
        name: 'Max Bending Moment (Mmax = 30 kNm)',
        description: 'Computes Mmax = (W*L)/4 = 30 kNm at mid-span',
        keyPhrases: ['30 knm', '30 kn-m', '(w * l) / 4 = 30', 'maximum moment is 30'],
        synonyms: ['thirty kilonewton meters', 'wl/4 equals 30'],
        weight: 1.0,
      },
      {
        id: 'sfd_bmd_differential_relation',
        name: 'Relationship dM/dx = V (Zero Shear = Peak Moment)',
        description: 'Derivative of bending moment is shear force; peak moment occurs at zero shear',
        keyPhrases: ['dm/dx = v', 'shear is derivative of moment', 'moment maximum where shear is zero', 'shear changes sign'],
        synonyms: ['rate of change of moment is shear force', 'slope of bmd equals shear'],
        weight: 1.0,
      }
    ],
    supportingConcepts: [
      {
        id: 'moment_diagram_shape',
        name: 'Triangular BMD Shape',
        description: 'Point load creates triangular bending moment profile and step SFD profile',
        keyPhrases: ['triangular bmd', 'step sfd', 'linear moment distribution'],
      }
    ],
    acceptedAlternatives: [
      {
        targetConceptId: 'sfd_bmd_differential_relation',
        phrasingPattern: 'the area under the shear force diagram gives the bending moment',
        explanation: 'Accepted integral formulation (M = ∫ V dx).',
      }
    ],
    commonMisconceptions: [
      {
        id: 'moment_wl_over_8_point_load',
        triggerPhrases: ['mmax = wl/8 for point load', 'moment is wl^2/8 = 22.5'],
        description: 'Used UDL moment formula (wL^2/8) for concentrated point load',
        penaltyPoints: 15,
        whyIncorrect: 'WL^2/8 applies to Uniformly Distributed Loads (UDL). A central concentrated point load produces maximum bending moment of WL/4 = 30 kNm.',
      }
    ],
    scoringRubric: {
      technicalCorrectnessWeight: 0.40,
      essentialCoverageWeight: 0.30,
      relevanceSemanticWeight: 0.20,
      reasoningWeight: 0.10,
    },
    exampleAnswers: [
      {
        type: 'correct',
        answerText: 'Due to symmetry, support reactions are Ra = Rb = 20 kN / 2 = 10 kN, so maximum shear force is 10 kN. The maximum bending moment occurs at mid-span: Mmax = (W * L) / 4 = (20 * 6) / 4 = 30 kNm. The fundamental relation is dM/dx = V, which means the slope of the Bending Moment Diagram equals the shear force value, and maximum moment occurs where shear force crosses zero.',
        expectedScoreRange: [90, 100],
        expectedBand: '85–100: Strong, Technically Correct Answer',
        explanation: 'Accurate values (10 kN reactions, 30 kNm moment) and sound differential calculus explanation.',
      },
      {
        type: 'partially-correct',
        answerText: 'Reactions are 10 kN each. Max moment is 30 kNm. Bending moment is highest at center.',
        expectedScoreRange: [50, 62],
        expectedBand: '45–64: Partially Correct',
        explanation: 'Correct numerical answers, but lacks explanation of dM/dx = V or the SFD-BMD mathematical relationship.',
      },
      {
        type: 'misconception',
        answerText: 'Reactions are 10 kN. Max bending moment is calculated using M = wL^2/8 = 22.5 kNm. The shear force is unrelated to moment.',
        expectedScoreRange: [25, 38],
        expectedBand: '21–44: Limited Understanding',
        explanation: 'Used UDL formula instead of point load formula and incorrectly claimed shear is unrelated to moment.',
      }
    ]
  },

  // =========================================================================
  // MECHANICAL ENGINEERING
  // =========================================================================
  'me_otto_diagram_01': {
    questionId: 'me_otto_diagram_01',
    department: 'Mechanical Engineering',
    subject: 'Thermodynamics & IC Engines',
    difficulty: 'Beginner',
    expectedAnswer: 'The four processes of the Air-Standard Otto Cycle are: 1-2 Isentropic compression, 2-3 Constant volume heat addition (spark combustion), 3-4 Isentropic expansion (power stroke), and 4-1 Constant volume heat rejection (exhaust). Thermal efficiency is derived as η = 1 - 1 / r^(γ-1) where r = V1/V2 is compression ratio and γ is heat capacity ratio. Petrol engine compression ratio is limited to around 10:1 to prevent premature auto-ignition (knocking or engine detonation).',
    essentialConcepts: [
      {
        id: 'four_processes',
        name: 'Four Thermodynamic Processes',
        description: 'Identifies 1-2 isentropic compression, 2-3 constant volume addition, 3-4 isentropic expansion, 4-1 constant volume rejection',
        keyPhrases: ['isentropic compression', 'constant volume heat addition', 'isentropic expansion', 'constant volume heat rejection'],
        synonyms: ['adiabatic compression and expansion with isochoric heat addition', 'reversible adiabatic and constant volume'],
        weight: 1.0,
      },
      {
        id: 'efficiency_formula',
        name: 'Otto Thermal Efficiency Formula',
        description: 'States or derives η = 1 - 1 / r^(γ-1)',
        keyPhrases: ['1 - 1 / r^(γ-1)', '1 - (1 / r^(gamma - 1))', 'efficiency depends on compression ratio'],
        synonyms: ['one minus one over r to gamma minus one', 'eta = 1 - r^(1-gamma)'],
        weight: 1.0,
      },
      {
        id: 'knocking_limitation',
        name: 'Knocking / Pre-Ignition Limitation on Compression Ratio',
        description: 'Explains compression ratio is capped at ~10:1 to avoid auto-ignition/knocking in petrol',
        keyPhrases: ['knocking', 'detonation', 'auto-ignition', 'premature ignition', 'pre-ignition'],
        synonyms: ['engine pinging', 'uncontrolled fuel detonation at high pressure'],
        weight: 1.0,
      }
    ],
    supportingConcepts: [
      {
        id: 'clearance_volume',
        name: 'Swept and Clearance Volume',
        description: 'Compression ratio r = (Vs + Vc) / Vc',
        keyPhrases: ['clearance volume', 'swept volume', 'v1 / v2'],
      }
    ],
    acceptedAlternatives: [
      {
        targetConceptId: 'knocking_limitation',
        phrasingPattern: 'higher compression ratio raises temperature above the octane self-ignition threshold before spark fires',
        explanation: 'Accepted chemical thermodynamics formulation of spark knock.',
      }
    ],
    commonMisconceptions: [
      {
        id: 'constant_pressure_otto',
        triggerPhrases: ['otto cycle has constant pressure heat addition', 'otto cycle heat addition at constant pressure'],
        description: 'Confused Otto cycle with Diesel cycle (constant pressure addition)',
        penaltyPoints: 20,
        whyIncorrect: 'Otto cycle models spark-ignition with instantaneous constant-volume (isochoric) combustion. Diesel cycle has constant-pressure heat addition.',
      }
    ],
    scoringRubric: {
      technicalCorrectnessWeight: 0.40,
      essentialCoverageWeight: 0.30,
      relevanceSemanticWeight: 0.20,
      reasoningWeight: 0.10,
    },
    exampleAnswers: [
      {
        type: 'correct',
        answerText: 'The Otto cycle consists of 4 processes: 1-2 isentropic compression of air-fuel charge, 2-3 constant volume heat addition from spark ignition, 3-4 isentropic expansion (power stroke), and 4-1 constant volume heat rejection to exhaust. Efficiency is η = 1 - (1 / r^(γ-1)). Compression ratio in petrol engines cannot exceed ~10:1 or 11:1 because high compression temperatures cause the fuel to auto-ignite prematurely before the spark plug fires, causing destructive engine knocking.',
        expectedScoreRange: [90, 100],
        expectedBand: '85–100: Strong, Technically Correct Answer',
        explanation: 'Accurate process descriptions, correct formula, and clear thermodynamics of engine knock.',
      },
      {
        type: 'partially-correct',
        answerText: 'Processes are compression, combustion at constant volume, expansion, and exhaust. Efficiency is based on compression ratio r. Petrol engines limit r to 10 to avoid knocking.',
        expectedScoreRange: [52, 65],
        expectedBand: '45–64: Partially Correct',
        explanation: 'Covers main points in colloquial terms, but omits isentropic/adiabatic technical terminology and full mathematical formula.',
      },
      {
        type: 'misconception',
        answerText: 'Otto cycle has constant pressure heat addition where fuel injectors spray diesel into cylinder. Compression ratio is limited to 10 because pistons would break from mechanical force.',
        expectedScoreRange: [15, 30],
        expectedBand: '21–44: Limited Understanding',
        explanation: 'Confused Otto cycle with Diesel cycle and missed thermodynamic auto-ignition knocking cause.',
      }
    ]
  },

  // =========================================================================
  // AUTOMOBILE ENGINEERING
  // =========================================================================
  'ae_abs_diagram_01': {
    questionId: 'ae_abs_diagram_01',
    department: 'Automobile Engineering',
    subject: 'Automotive Chassis & Braking Systems',
    difficulty: 'Intermediate',
    expectedAnswer: 'The ABS Modulator operates in three cycling phases: 1) Pressure Apply (master cylinder pressure fed to caliper), 2) Pressure Hold (inlet solenoid closes when wheel deceleration exceeds threshold), and 3) Pressure Dump (outlet solenoid opens to release fluid into accumulator, scavenged by return pump). Wheel Speed Sensors monitor pulse frequency to calculate wheel slip ratio. Wheel lockup eliminates lateral tire cornering stiffness, causing loss of steerability and vehicle spin.',
    essentialConcepts: [
      {
        id: 'modulator_three_phases',
        name: 'Three ABS Modulator Phases (Apply, Hold, Dump)',
        description: 'Explains pressure apply, pressure hold, and pressure dump phases',
        keyPhrases: ['pressure apply', 'pressure hold', 'pressure dump', 'inlet and outlet solenoid valves', 'three phases'],
        synonyms: ['apply hold dump cycles', 'solenoid modulation states'],
        weight: 1.0,
      },
      {
        id: 'wheel_speed_sensing',
        name: 'Wheel Speed Sensor (WSS) Deceleration Detection',
        description: 'Sensors track wheel rotational deceleration and slip threshold in real time',
        keyPhrases: ['wheel speed sensor', 'wss', 'detects deceleration', 'slip ratio', 'pulse frequency'],
        synonyms: ['hall effect sensor detects wheel stop', 'tone ring pulse rate'],
        weight: 1.0,
      },
      {
        id: 'steering_lateral_stability',
        name: 'Loss of Lateral Cornering Force on Lockup',
        description: 'Locked wheels cannot generate lateral force, causing complete loss of steering control',
        keyPhrases: ['loss of steering', 'lateral force', 'cornering stiffness drops to zero', 'skidding prevents steering'],
        synonyms: ['cannot steer when tires slide', 'loss of directional stability'],
        weight: 1.0,
      }
    ],
    supportingConcepts: [
      {
        id: 'optimal_slip_ratio',
        name: 'Optimal Braking Slip Ratio (15-20%)',
        description: 'Peak tire friction coefficient occurs at 15-20% slip ratio',
        keyPhrases: ['15-20% slip', 'optimal slip ratio', 'peak friction coefficient'],
      }
    ],
    acceptedAlternatives: [
      {
        targetConceptId: 'steering_lateral_stability',
        phrasingPattern: 'when wheels lock the friction circle is consumed entirely by longitudinal braking leaving zero lateral force for turning',
        explanation: 'Accepted Kamm friction circle formulation of tire cornering limits.',
      }
    ],
    commonMisconceptions: [
      {
        id: 'abs_guarantees_shorter_stopping_distance',
        triggerPhrases: ['abs always guarantees shorter stopping distance on all surfaces'],
        description: 'Claimed ABS always stops shorter on every surface',
        penaltyPoints: 10,
        whyIncorrect: 'On loose gravel or snow, a locked sliding wheel plows material and may stop shorter; ABS is designed primarily for steerability and directional stability.',
      }
    ],
    scoringRubric: {
      technicalCorrectnessWeight: 0.40,
      essentialCoverageWeight: 0.30,
      relevanceSemanticWeight: 0.20,
      reasoningWeight: 0.10,
    },
    exampleAnswers: [
      {
        type: 'correct',
        answerText: 'ABS continuously modulates hydraulic pressure in three stages: Pressure Apply (fluid flows to caliper), Pressure Hold (solenoid closes to maintain constant caliper force), and Pressure Dump (outlet valve opens to relieve pressure into an accumulator when wheel lockup is imminent, with the return pump pumping fluid back). Wheel Speed Sensors send pulse signals to the ECU to calculate slip. If a wheel locks up, lateral friction drops to zero according to the friction circle, making it impossible for the driver to steer.',
        expectedScoreRange: [90, 100],
        expectedBand: '85–100: Strong, Technically Correct Answer',
        explanation: 'Covers all three modulator phases, sensor pulse rate calculation, and friction circle loss of lateral control.',
      },
      {
        type: 'partially-correct',
        answerText: 'ABS pumps the brakes really fast using solenoids so wheels do not lock. When wheels lock you slide and cannot steer.',
        expectedScoreRange: [45, 58],
        expectedBand: '45–64: Partially Correct',
        explanation: 'Captures general principle and steerability loss, but omits the three explicit phases (Apply, Hold, Dump) and speed sensor mechanics.',
      },
      {
        type: 'incorrect',
        answerText: 'ABS activates the electronic parking brake when the car crashes into obstacles to deploy airbags.',
        expectedScoreRange: [0, 15],
        expectedBand: '0–20: Incorrect or Irrelevant',
        explanation: 'Confused ABS with autonomous emergency braking and airbag restraint systems.',
      }
    ]
  },

  // =========================================================================
  // DATA SCIENCE & MACHINE LEARNING ENGINEERING
  // =========================================================================
  'ds_bias_variance_01': {
    questionId: 'ds_bias_variance_01',
    department: 'Data Science & Machine Learning Engineering',
    subject: 'Machine Learning Theory & Statistics',
    difficulty: 'Intermediate',
    expectedAnswer: 'Total model error decomposes into Bias^2 + Variance + Irreducible error. High bias leads to underfitting due to overly simplistic assumptions, resulting in high training and test error. High variance causes overfitting by memorizing noise in the training set, causing low training error but poor generalization on test data. L1 (Lasso) regularization adds a penalty proportional to the absolute values of the weights (lambda * sum(|w|)), which shrinks weights and drives less important coefficients strictly to zero for sparse feature selection. L2 (Ridge) regularization adds a squared magnitude penalty (lambda * sum(w^2)), which shrinks weights smoothly toward zero without setting them exactly to zero.',
    essentialConcepts: [
      {
        id: 'bias_underfitting',
        name: 'Bias & Underfitting',
        description: 'High bias represents model oversimplification leading to underfitting on both train and test data',
        keyPhrases: ['high bias', 'underfitting', 'oversimplified model', 'high train and test error', 'bias causes underfitting', 'high bias results in underfitting'],
        synonyms: ['bias variance tradeoff', 'model underfits due to high bias', 'oversimplified assumptions'],
        weight: 1.0,
      },
      {
        id: 'variance_overfitting',
        name: 'Variance & Overfitting',
        description: 'High variance indicates sensitivity to training noise leading to poor test generalization',
        keyPhrases: ['high variance', 'overfitting', 'memorizing noise', 'poor generalization', 'variance causes overfitting', 'high variance results in overfitting', 'learning training set noise'],
        synonyms: ['high variance leads to overfitting', 'overfitting on training set'],
        weight: 1.0,
      },
      {
        id: 'l1_lasso_sparsity',
        name: 'L1 (Lasso) Regularization & Sparsity',
        description: 'L1 regularization drives weights strictly to zero producing sparse feature selection',
        keyPhrases: ['l1 regularization', 'lasso', 'absolute weights', 'drives weights to zero', 'sparse feature selection', 'sparsity', 'coefficients strictly to zero'],
        synonyms: ['l1 penalty produces zero coefficients', 'lasso performs feature selection', 'l1 lasso'],
        weight: 1.0,
      },
      {
        id: 'l2_ridge_shrinkage',
        name: 'L2 (Ridge) Regularization & Weight Decay',
        description: 'L2 regularization adds squared weight penalty shrinking coefficients smoothly without zeroing them',
        keyPhrases: ['l2 regularization', 'ridge', 'squared weights', 'shrinks weights toward zero', 'weight decay', 'smooth shrinkage', 'shrinks weights smoothly', 'l2 ridge'],
        synonyms: ['l2 penalty shrinks coefficients', 'ridge regression weight decay'],
        weight: 1.0,
      }
    ],
    supportingConcepts: [
      {
        id: 'error_decomposition',
        name: 'Error Decomposition Equation',
        description: 'Error = Bias^2 + Variance + Irreducible error',
        keyPhrases: ['irreducible error', 'error decomposition', 'bias squared plus variance'],
      }
    ],
    acceptedAlternatives: [
      {
        targetConceptId: 'l1_lasso_sparsity',
        phrasingPattern: 'manhattan norm penalty creates diamond constraint corners',
        explanation: 'Geometric explanation of L1 Lasso diamond contours accepted.',
      }
    ],
    commonMisconceptions: [
      {
        id: 'l2_causes_sparsity',
        triggerPhrases: ['l2 sets weights to zero', 'ridge drives coefficients to zero'],
        description: 'Claimed L2 Ridge creates sparse features by zeroing weights',
        penaltyPoints: 20,
        whyIncorrect: 'L2 Ridge penalty shrinks weights asymptotically toward zero but never drives them exactly to zero. Only L1 Lasso forces weights to zero.',
      }
    ],
    scoringRubric: {
      technicalCorrectnessWeight: 0.40,
      essentialCoverageWeight: 0.30,
      relevanceSemanticWeight: 0.20,
      reasoningWeight: 0.10,
    },
    exampleAnswers: [
      {
        type: 'correct',
        answerText: 'High bias results in underfitting from oversimplified assumptions, whereas high variance results in overfitting by learning training set noise. L1 Lasso regularization drives non-essential coefficients strictly to zero for sparse feature selection, while L2 Ridge shrinks weights smoothly.',
        expectedScoreRange: [85, 95],
        expectedBand: '85–100: Strong, Technically Correct Answer',
        explanation: 'Clearly articulates bias/variance and distinguishes L1 sparsity from L2 shrinkage.',
      }
    ]
  },

  // =========================================================================
  // CIVIL ENGINEERING
  // =========================================================================
  'ce_concrete_01': {
    questionId: 'ce_concrete_01',
    department: 'Civil Engineering',
    subject: 'Structural Analysis & RCC Design',
    difficulty: 'Intermediate',
    expectedAnswer: 'According to IS 456, in an under-reinforced beam, the steel reinforcement percentage is less than the limiting value (pt < pt_lim). Consequently, the tensile steel reaches its yield stress before the compressive concrete reaches its ultimate strain. This ensures ductile failure with warning through visible cracking and deflection. In contrast, in an over-reinforced section (pt > pt_lim), concrete crushes first in brittle compression without warning, which is hazardous and prohibited by IS 456.',
    essentialConcepts: [
      {
        id: 'under_reinforced_ductile',
        name: 'Under-Reinforced Section & Ductile Yielding',
        description: 'Steel yields before concrete crushes, providing visible deflection warning and ductile failure',
        keyPhrases: ['under-reinforced', 'steel yields first', 'ductile failure', 'warning before failure', 'visible deflection', 'crack warning', 'ductile mode'],
        synonyms: ['tension failure', 'steel reaches yield stress first', 'visible crack deflection warning'],
        weight: 1.0,
      },
      {
        id: 'over_reinforced_brittle',
        name: 'Over-Reinforced Section & Brittle Crushing',
        description: 'Concrete crushes suddenly before steel yields, leading to sudden catastrophic brittle failure',
        keyPhrases: ['over-reinforced', 'concrete crushes first', 'brittle failure', 'sudden collapse', 'failure without warning', 'concrete crush first'],
        synonyms: ['compression failure', 'concrete reaches ultimate strain first', 'brittle compression failure'],
        weight: 1.0,
      },
      {
        id: 'is456_limiting_ratio',
        name: 'IS 456 Limiting Steel Reinforcement Ratio',
        description: 'IS 456 limits steel ratio to ensure all designs fail in ductile under-reinforced mode',
        keyPhrases: ['is 456', 'limiting percentage', 'neutral axis depth', 'xu lim', 'balanced section'],
        synonyms: ['indian standard 456', 'code provisions', 'limiting value'],
        weight: 1.0,
      }
    ],
    supportingConcepts: [
      {
        id: 'neutral_axis_depth',
        name: 'Neutral Axis Depth Comparison',
        description: 'xu < xu_max for under-reinforced; xu > xu_max for over-reinforced',
        keyPhrases: ['neutral axis', 'xu', 'xu_max', 'depth of neutral axis'],
      }
    ],
    acceptedAlternatives: [],
    commonMisconceptions: [
      {
        id: 'over_reinforced_is_safer',
        triggerPhrases: ['over reinforced is safer', 'over reinforced gives warning'],
        description: 'Claimed over-reinforced beams are safer',
        penaltyPoints: 25,
        whyIncorrect: 'Over-reinforced beams fail in explosive brittle compression without warning. IS 456 strictly mandates under-reinforced design.',
      }
    ],
    scoringRubric: {
      technicalCorrectnessWeight: 0.40,
      essentialCoverageWeight: 0.30,
      relevanceSemanticWeight: 0.20,
      reasoningWeight: 0.10,
    },
    exampleAnswers: []
  }
};

/**
 * Helper to retrieve benchmark evaluation criteria for any question ID,
 * with dynamic synthesized fallback if a specific custom question is passed.
 */
export function getQuestionEvaluationBenchmark(
  questionId: string,
  fallbackQuestionText?: string,
  department: EngineeringDepartment = 'Computer Science & Engineering',
  subject: string = 'Core Technical Domain',
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced' = 'Intermediate',
  keywords?: string[],
  idealAnswerPoints?: string[]
): QuestionEvaluationBenchmark {
  const existing = EVALUATION_BENCHMARK_DATASET[questionId];
  if (existing) {
    return existing;
  }

  // Synthesize dynamic essential concepts from idealAnswerPoints if provided
  const essentialConcepts: EssentialConcept[] = (idealAnswerPoints && idealAnswerPoints.length > 0)
    ? idealAnswerPoints.map((point, idx) => {
        const rawTokens = point.toLowerCase().match(/[a-z0-9_+#.-]+/g) || [];
        const contentTokens = rawTokens
          .map((t) => t.replace(/^[^a-z0-9_+#]+|[^a-z0-9_+#]+$/gi, ''))
          .filter((t) => t.length > 2 && !STOP_WORDS.has(t));
        return {
          id: `concept_${idx + 1}`,
          name: point.length > 45 ? point.slice(0, 42) + '...' : point,
          description: point,
          keyPhrases: [point.toLowerCase(), ...contentTokens.slice(0, 5)],
          synonyms: contentTokens.slice(0, 4),
          weight: 1.0,
        };
      })
    : [
        {
          id: 'core_principles',
          name: 'Foundational Principles & Theory',
          description: 'Demonstrates comprehension of fundamental engineering principles and governing laws',
          keyPhrases: keywords && keywords.length > 0 ? keywords.slice(0, 5) : ['architecture', 'principle', 'mechanism', 'standard', 'design'],
          synonyms: keywords && keywords.length > 2 ? keywords.slice(2, 6) : ['theoretical basis', 'underlying principle', 'system design'],
          weight: 1.0,
        },
        {
          id: 'operational_nuances',
          name: 'Technical Implementation & Trade-offs',
          description: 'Explains trade-offs, constraints, equations, or failure modes',
          keyPhrases: ['trade-off', 'constraint', 'efficiency', 'performance', 'safety'],
          synonyms: ['practical constraints', 'system limitations', 'engineering analysis'],
          weight: 1.0,
        }
      ];

  // Generate robust synthesized benchmark for dataset questions without dedicated entry
  return {
    questionId,
    department,
    subject,
    difficulty,
    expectedAnswer: fallbackQuestionText || 'Technical engineering response covering system architecture, core equations, boundary conditions, and real-world trade-offs.',
    essentialConcepts,
    supportingConcepts: [
      {
        id: 'industry_standards',
        name: 'Industry Code & Standards',
        description: 'References applicable IEEE, ASME, IS, or RFC industry standards',
        keyPhrases: ['rfc', 'ieee', 'asme', 'is code', 'standard specification'],
      }
    ],
    acceptedAlternatives: [],
    commonMisconceptions: [],
    scoringRubric: {
      technicalCorrectnessWeight: 0.40,
      essentialCoverageWeight: 0.30,
      relevanceSemanticWeight: 0.20,
      reasoningWeight: 0.10,
    },
    exampleAnswers: [
      {
        type: 'correct',
        answerText: fallbackQuestionText || 'Detailed technical response articulating trade-offs, equations, and engineering constraints.',
        expectedScoreRange: [85, 95],
        expectedBand: '85–100: Strong, Technically Correct Answer',
        explanation: 'Satisfies core technical benchmark.',
      }
    ]
  };
}
