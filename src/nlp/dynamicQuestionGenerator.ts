import { 
  DatasetQuestion, 
  ExtractedResumeNLP, 
  EngineeringDepartment, 
  QuestionType,
  CodingProblem,
  QuestionHistoryEntry
} from './types';
import { DEPARTMENT_QUESTION_POOLS } from './departmentQuestionPools';
import { isQuestionDuplicate } from './duplicatePrevention';

/**
 * CareerCurve AI — Intelligent Resume-Based Technical Question Generator
 * 
 * Automatically generates customized, department-aware engineering interview questions
 * based on the student's actual resume skills, projects, internships, certifications,
 * and core engineering curriculum topics across all 7 supported engineering branches:
 * 1. Computer Science & Engineering (CSE)
 * 2. Information Technology (IT)
 * 3. Electronics & Communication Engineering (ECE)
 * 4. Electrical & Electronics Engineering (EEE)
 * 5. Mechanical Engineering
 * 6. Civil Engineering
 * 7. Automobile Engineering
 */

// =============================================================================
// 1. PROJECT-BASED QUESTION BUILDERS
// =============================================================================

export function generateProjectQuestions(
  projects: { title: string; description: string; technologies: string[] }[],
  department: EngineeringDepartment,
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced'
): DatasetQuestion[] {
  if (!projects || projects.length === 0) return [];

  const questions: DatasetQuestion[] = [];

  projects.forEach((proj, idx) => {
    const title = proj.title || `Capstone Project ${idx + 1}`;
    const primaryTech = proj.technologies && proj.technologies.length > 0
      ? proj.technologies[0]
      : 'the selected technology stack';
    const allTechs = proj.technologies && proj.technologies.length > 0
      ? proj.technologies.join(', ')
      : 'engineering frameworks';

    // Question 1: Problem statement, tech selection & architecture
    questions.push({
      id: `proj_arch_${idx}_${Date.now()}`,
      department,
      subject: 'Engineering Capstone Architecture',
      topic: 'Project Architecture & Design',
      subtopic: 'Problem Analysis & Tech Selection',
      skill: primaryTech,
      difficulty,
      questionSource: 'project',
      associatedProjectName: title,
      questionType: 'project-based',
      question: `In your resume project "${title}", what specific problem does the project solve? Why did you select ${primaryTech} over alternative technologies, and what is the overall system architecture?`,
      keywords: [
        'architecture',
        'problem statement',
        primaryTech.toLowerCase(),
        'design',
        'trade-offs',
        'database',
        'components'
      ],
      followUpTemplates: [
        `If the user concurrency or data volume of "${title}" increased by 10x, what would be the primary performance bottleneck in your architecture?`,
        `How did you isolate client-side rendering from backend persistence in "${title}"?`
      ],
      idealAnswerPoints: [
        `Clear articulation of the real-world engineering problem addressed by "${title}"`,
        `Technical rationale for choosing ${primaryTech} (e.g. performance, ecosystem, reliability, learning curve)`,
        'High-level architectural flow (client tier, application logic, data persistence layer)',
        'Understanding of design constraints, data flow, and separation of concerns'
      ],
      explanation: `Tests project technical ownership, architectural reasoning, and justification for using ${primaryTech}.`,
      learningExplanation: `A strong engineering project answer follows the STAR/Architecture pattern: State the specific user/system problem, explain why ${primaryTech} was chosen over alternatives based on technical trade-offs, sketch the data flow from input to persistence, and identify the primary architectural boundary.`,
      whatToStudyNext: `System Design Fundamentals: Client-server architecture, API contracts, and database schema normalization for ${primaryTech}.`,
      recommendedPracticeQuestion: `Draft an architectural block diagram for "${title}" outlining data schemas, API routes, and external dependencies.`
    });

    // Question 2: Individual contribution, challenges & testing
    questions.push({
      id: `proj_contrib_${idx}_${Date.now()}`,
      department,
      subject: 'Project Implementation & Quality',
      topic: 'Individual Contribution & Debugging',
      subtopic: 'Challenges & Testing Methodology',
      skill: 'Software Engineering Practices',
      difficulty: difficulty === 'Beginner' ? 'Intermediate' : difficulty,
      questionSource: 'project',
      associatedProjectName: title,
      questionType: 'problem-solving',
      question: `Regarding "${title}" (${allTechs}): What was your specific individual contribution? What was the most difficult technical bug or challenge you encountered, and how did you test and verify the solution?`,
      keywords: [
        'contribution',
        'challenge',
        'debugging',
        'testing',
        'unit tests',
        'edge cases',
        'verification'
      ],
      followUpTemplates: [
        `What automated or manual test cases did you execute before considering "${title}" complete?`,
        `If you were to rewrite "${title}" today, what architectural or algorithmic improvements would you implement?`
      ],
      idealAnswerPoints: [
        'Clear demarcation of personal responsibility vs team/template code',
        'Precise description of a genuine technical issue (e.g. race condition, state sync, SQL constraint, API latency)',
        'Systematic root cause analysis and resolution steps taken',
        'Testing strategy: unit testing, integration testing, boundary checks, or validation'
      ],
      explanation: `Evaluates hands-on troubleshooting, genuine project contribution, and quality assurance mindset.`,
      learningExplanation: `Interviewers ask about challenges to distinguish genuine project work from copy-pasted tutorials. Clearly explain the symptom, the debugging technique you used (logs, breakpoints, profiler), the root cause, the fix, and how your test suite verified the fix without regressions.`,
      whatToStudyNext: `Debugging & Automated Testing: Writing unit tests, mocking dependencies, and automated regression testing.`,
      recommendedPracticeQuestion: `Write a test plan covering 5 critical edge cases for the main module of "${title}".`
    });
  });

  return questions;
}

// =============================================================================
// 2. INTERNSHIP-BASED QUESTION BUILDERS
// =============================================================================

export function generateInternshipQuestions(
  internships: { company: string; role: string; duration?: string; description?: string }[],
  department: EngineeringDepartment,
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced'
): DatasetQuestion[] {
  if (!internships || internships.length === 0) return [];

  const questions: DatasetQuestion[] = [];

  internships.forEach((intern, idx) => {
    const company = intern.company || `Organization ${idx + 1}`;
    const role = intern.role || 'Engineering Intern';

    questions.push({
      id: `intern_exp_${idx}_${Date.now()}`,
      department,
      subject: 'Industrial Engineering Practice',
      topic: 'Practical Industry Experience',
      subtopic: 'Production Workflow & Responsibilities',
      skill: 'Industry Best Practices',
      difficulty,
      questionSource: 'internship',
      associatedInternshipCompany: company,
      questionType: 'scenario',
      question: `During your internship at ${company} as a ${role}, what were your primary day-to-day engineering responsibilities? Describe a practical task you delivered and how you ensured code quality and standards.`,
      keywords: [
        'responsibilities',
        'workflow',
        'code review',
        'git',
        'production',
        'standards',
        'deliverables',
        'team'
      ],
      followUpTemplates: [
        `How did your internship at ${company} handle change management, code reviews, and production releases?`,
        `What was the biggest technical difference between academic assignments and working on the codebase at ${company}?`
      ],
      idealAnswerPoints: [
        `Specific overview of role, team structure, and engineering tasks at ${company}`,
        'Description of feature, bug fix, analysis, or design implemented',
        'Adherence to engineering standards: version control, code reviews, documentation, CI/CD',
        'Impact of your work on the project or team deliverables'
      ],
      explanation: `Validates practical industry exposure, teamwork, engineering workflows, and professional accountability.`,
      learningExplanation: `Focus on tangible deliverables: what tool or feature you built, the constraints you operated under, how you collaborated with senior engineers or mentors, and the development workflow (Git branching, code reviews, testing) you practiced.`,
      whatToStudyNext: `Software Engineering Lifecycle (SDLC): Agile/Scrum ceremonies, code review guidelines, and CI/CD pipelines.`,
      recommendedPracticeQuestion: `Prepare a 2-minute concise STAR walkthrough of your primary technical milestone at ${company}.`
    });
  });

  return questions;
}

// =============================================================================
// 3. CERTIFICATION-BASED QUESTION BUILDERS
// =============================================================================

export function generateCertificationQuestions(
  certifications: { name: string; issuer?: string; topic?: string }[],
  department: EngineeringDepartment,
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced'
): DatasetQuestion[] {
  if (!certifications || certifications.length === 0) return [];

  const questions: DatasetQuestion[] = [];

  certifications.forEach((cert, idx) => {
    const certName = cert.name || 'Technical Certification';
    const issuer = cert.issuer ? ` from ${cert.issuer}` : '';

    questions.push({
      id: `cert_verify_${idx}_${Date.now()}`,
      department,
      subject: 'Certified Technical Competencies',
      topic: 'Certification Core Fundamentals',
      subtopic: 'Practical Application of Certified Skills',
      skill: certName,
      difficulty,
      questionSource: 'certification',
      associatedCertificationName: certName,
      questionType: 'conceptual',
      question: `You have listed the certification "${certName}"${issuer}. What were the key core concepts covered in this curriculum, and how have you applied those concepts practically in your projects or coding?`,
      keywords: [
        'certification',
        'core concepts',
        'practical application',
        'principles',
        'fundamentals',
        'implementation'
      ],
      followUpTemplates: [
        `What is the most misunderstood concept in the subject matter of "${certName}", and how do you explain it correctly?`,
        `How do you keep your understanding of ${certName} updated as industry tooling evolves?`
      ],
      idealAnswerPoints: [
        `Clear summary of the theoretical foundation covered by "${certName}"`,
        'Demonstration of practical depth rather than superficial certificate memorization',
        'Concrete example of applying certified methodologies to a project, lab, or code repository',
        'Understanding of edge cases, trade-offs, and standard architectural practices in that domain'
      ],
      explanation: `Tests practical comprehension of certified subject matter without assuming automatic mastery from credentials.`,
      learningExplanation: `Listing a certification invites examiners to verify whether you retained deep conceptual and practical knowledge. Always be ready to explain the foundational syllabus, why those concepts matter in production, and how you experimented with them firsthand.`,
      whatToStudyNext: `Hands-on labs and practical problem-solving for topics covered under "${certName}".`,
      recommendedPracticeQuestion: `Summarize the top 3 core architectural principles emphasized in "${certName}" with code examples.`
    });
  });

  return questions;
}

// =============================================================================
// 4. STRUCTURED QUESTION GENERATOR FOR RESUME SKILLS
// Covers Python, JavaScript, SQL/MySQL, Flask, React, Git, Java, C++, Docker, etc.
// =============================================================================

export function getSkillSpecificQuestions(
  skillName: string,
  department: EngineeringDepartment,
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced'
): DatasetQuestion[] {
  const normSkill = skillName.toLowerCase();
  const questions: DatasetQuestion[] = [];

  // ---------------------------------------------------------------------------
  // PYTHON QUESTIONS (Section 2 of prompt)
  // ---------------------------------------------------------------------------
  if (normSkill.includes('python')) {
    questions.push(
      {
        id: 'py_data_types_01',
        department: 'Computer Science & Engineering',
        subject: 'Python Programming',
        topic: 'Python Core & Concurrency',
        subtopic: 'Data Types & Mutability',
        skill: 'Python',
        difficulty: 'Beginner',
        questionSource: 'resume-skill',
        questionType: 'conceptual',
        question: 'Explain Python data types. What is the fundamental difference between mutable and immutable types, and how does Python manage variables in memory?',
        keywords: ['int', 'float', 'str', 'list', 'tuple', 'set', 'dict', 'mutable', 'immutable', 'id', 'memory'],
        followUpTemplates: [
          'What happens when you pass a mutable list into a function in Python? How can you prevent unexpected side effects?',
          'Why are dictionary keys required to be hashable and immutable in Python?'
        ],
        idealAnswerPoints: [
          'Standard built-in types: numeric (int, float, complex), sequence (str, list, tuple), mapping (dict), set (set, frozenset), boolean (bool)',
          'Mutable objects (list, dict, set) can be modified in-place without changing their memory id()',
          'Immutable objects (int, float, str, tuple, frozenset) cannot be modified after creation; operations return a new object in memory',
          'Python uses reference passing: variables hold references to objects in heap memory'
        ],
        explanation: 'Core Python foundational topic testing understanding of data structures, mutability, and memory references.',
        learningExplanation: 'In Python, everything is an object. Mutable types like lists and dictionaries can have their contents altered without altering their object identity id(x). Immutable types like strings and tuples cannot; attempting to alter them allocates a new object in memory. Dictionary keys must be immutable because hashing relies on fixed values.',
        whatToStudyNext: 'Python Memory Management: Object references, garbage collection, and shallow vs deep copy.',
        recommendedPracticeQuestion: 'Write a short Python snippet demonstrating how default mutable arguments in functions (def fn(arr=[])) can cause unexpected bugs.'
      },
      {
        id: 'py_collections_diff_02',
        department: 'Computer Science & Engineering',
        subject: 'Python Programming',
        topic: 'Python Core & Concurrency',
        subtopic: 'Built-in Collections',
        skill: 'Python',
        difficulty: 'Beginner',
        questionSource: 'resume-skill',
        questionType: 'conceptual',
        question: 'Explain the differences between list, tuple, set, and dictionary in Python regarding ordering, mutability, duplicate handling, and lookup time complexity.',
        keywords: ['list', 'tuple', 'set', 'dictionary', 'ordered', 'mutable', 'hash', 'lookup', 'o(1)', 'o(n)'],
        followUpTemplates: [
          'Under what circumstances would you choose a tuple over a list for storing data in a web application?',
          'How does Python set lookup achieve O(1) average time complexity?'
        ],
        idealAnswerPoints: [
          'List: Ordered, mutable, allows duplicates, indexed by integers. O(n) search, O(1) append.',
          'Tuple: Ordered, immutable, allows duplicates, indexed by integers. Faster and hashable.',
          'Set: Unordered (or insertion-ordered in recent versions), mutable, UNIQUE values only, hash-based O(1) average lookup.',
          'Dictionary: Key-value mapping, keys must be unique and hashable, mutable, O(1) average key lookup.'
        ],
        explanation: 'Tests precision in choosing the correct Python collection data structure for optimal performance.',
        learningExplanation: 'Lists are general-purpose dynamic arrays. Tuples represent fixed heterogeneous records and are memory-efficient. Sets implement mathematical set operations and guarantee uniqueness in O(1) average time. Dictionaries map unique keys to values using hash tables.',
        whatToStudyNext: 'Python collections module: defaultdict, Counter, deque, and OrderedDict.',
        recommendedPracticeQuestion: 'Implement a function that uses a set to remove duplicate items from a list while preserving original insertion order.'
      },
      {
        id: 'py_decorators_exceptions_03',
        department: 'Computer Science & Engineering',
        subject: 'Python Programming',
        topic: 'Python Core & Concurrency',
        subtopic: 'Decorators & Error Handling',
        skill: 'Python',
        difficulty: 'Intermediate',
        questionSource: 'resume-skill',
        questionType: 'conceptual',
        question: 'Explain how decorators work in Python and how exception handling is structured with try, except, else, and finally blocks.',
        keywords: ['decorator', 'wrapper', 'functools.wraps', 'first-class functions', 'try', 'except', 'else', 'finally'],
        followUpTemplates: [
          'Why should you use @functools.wraps when writing custom decorators?',
          'When does the else block execute in a Python try-except construct?'
        ],
        idealAnswerPoints: [
          'Decorators take a function as an argument, wrap its behavior with inner wrapper(*args, **kwargs), and return the wrapped function',
          'Decorators rely on Python first-class functions and closures',
          '@functools.wraps preserves original function metadata (__name__, __doc__)',
          'try executes dangerous code, except catches specified exceptions, else runs if NO exception occurred, finally always runs (resource cleanup)'
        ],
        explanation: 'Evaluates advanced functional constructs and production exception handling practices in Python.',
        learningExplanation: 'Decorators are syntactic sugar for fn = decorator(fn). They wrap behavior (such as logging, timing, authentication) around functions without modifying their source code. In exception handling, else runs only when no errors occur, while finally guarantees cleanup (like closing files or DB connections) regardless of exceptions.',
        whatToStudyNext: 'Parameterized decorators, context managers (with statement, __enter__, __exit__), and custom exception classes.',
        recommendedPracticeQuestion: 'Write a Python decorator @time_it that measures and prints the execution time of any function in milliseconds.'
      },
      {
        id: 'py_duplicates_coding_04',
        department: 'Computer Science & Engineering',
        subject: 'Python Programming',
        topic: 'Python Core & Concurrency',
        subtopic: 'Algorithms & Coding',
        skill: 'Python',
        difficulty: 'Intermediate',
        questionSource: 'resume-skill',
        questionType: 'coding',
        question: 'Write a Python program to find and return all duplicate elements in an array or list. Optimize for O(n) time complexity.',
        keywords: ['duplicates', 'python', 'array', 'set', 'hashmap', 'frequency', 'o(n)'],
        followUpTemplates: [
          'How does your solution handle memory when the input array contains 1,000,000 integers with few duplicates?',
          'Can you solve this without extra space if elements are bounded between 1 and n?'
        ],
        idealAnswerPoints: [
          'Iterate through the array maintaining a seen set and a duplicates set or frequency Counter',
          'If element is already in seen, add it to duplicates',
          'Add element to seen',
          'Return list of duplicates in O(n) time and O(n) auxiliary space'
        ],
        explanation: 'Practical coding assessment testing hash table tracking, duplicate detection, and time-space trade-offs.',
        codingProblem: {
          title: 'Find Duplicate Elements',
          description: 'Given a list of integers `nums`, find and return all numbers that appear more than once in the list.\n\nReturn the duplicates in ascending order.',
          defaultLanguage: 'python',
          starterCodes: {
            python: `def find_duplicates(nums):
    # TODO: Return all duplicate elements in O(n) time
    seen = set()
    duplicates = set()
    for num in nums:
        if num in seen:
            duplicates.add(num)
        else:
            seen.add(num)
    return sorted(list(duplicates))`,
            javascript: `function findDuplicates(nums) {
  const seen = new Set();
  const duplicates = new Set();
  for (const num of nums) {
    if (seen.has(num)) {
      duplicates.add(num);
    } else {
      seen.add(num);
    }
  }
  return Array.from(duplicates).sort((a, b) => a - b);
}`,
            cpp: `#include <vector>
#include <unordered_set>
#include <algorithm>

std::vector<int> findDuplicates(const std::vector<int>& nums) {
    std::unordered_set<int> seen;
    std::unordered_set<int> duplicates;
    for (int num : nums) {
        if (seen.find(num) != seen.end()) {
            duplicates.insert(num);
        } else {
            seen.insert(num);
        }
    }
    std::vector<int> result(duplicates.begin(), duplicates.end());
    std::sort(result.begin(), result.end());
    return result;
}`,
            java: `import java.util.*;

public class Solution {
    public List<Integer> findDuplicates(int[] nums) {
        Set<Integer> seen = new HashSet<>();
        Set<Integer> duplicates = new TreeSet<>();
        for (int num : nums) {
            if (!seen.add(num)) {
                duplicates.add(num);
            }
        }
        return new ArrayList<>(duplicates);
    }
}`
          },
          testCases: [
            {
              id: 'tc1',
              input: '[4, 3, 2, 7, 8, 2, 3, 1]',
              expectedOutput: '[2,3]',
              explanation: '2 and 3 appear twice in the array.'
            },
            {
              id: 'tc2',
              input: '[1, 1, 2]',
              expectedOutput: '[1]',
              explanation: '1 appears twice.'
            },
            {
              id: 'tc3',
              input: '[1]',
              expectedOutput: '[]',
              explanation: 'No duplicates exist.'
            }
          ]
        },
        learningExplanation: 'Tracking elements with a hash set allows membership checks in O(1) average time. As you iterate through the list, if an element already exists in the "seen" set, add it to your "duplicates" set. Total runtime is O(n), avoiding the slow O(n^2) nested loop.',
        whatToStudyNext: 'In-place cyclic sort and bit manipulation for O(1) extra space duplicate detection.',
        recommendedPracticeQuestion: 'Find duplicates in an array of size n containing elements from 1 to n in O(n) time and O(1) extra space.'
      },
      {
        id: 'py_oop_concepts_05',
        department: 'Computer Science & Engineering',
        subject: 'Python Programming',
        topic: 'Python Core & Concurrency',
        subtopic: 'Object-Oriented Programming',
        skill: 'Python',
        difficulty: 'Intermediate',
        questionSource: 'resume-skill',
        questionType: 'conceptual',
        question: 'Explain the four core principles of Object-Oriented Programming (OOP) in Python: Encapsulation, Abstraction, Inheritance, and Polymorphism, with practical code examples.',
        keywords: ['oop', 'encapsulation', 'inheritance', 'polymorphism', 'abstraction', '__init__', 'class', 'self', 'super'],
        followUpTemplates: [
          'How does Python implement private attributes? Does Python enforce strict encapsulation like Java or C++?',
          'What is Method Resolution Order (MRO) in Python multiple inheritance, and how does C3 linearization work?'
        ],
        idealAnswerPoints: [
          'Encapsulation: Bundling data and methods inside classes; using name mangling (_private, __very_private)',
          'Abstraction: Hiding complex internal logic; using abc module (ABC, @abstractmethod)',
          'Inheritance: Subclasses inheriting properties and methods from parent class via class Dog(Animal): using super().__init__()',
          'Polymorphism: Different classes responding to the same method interface (duck typing: "if it quacks like a duck")'
        ],
        explanation: 'Evaluates solid understanding of software design, code reusability, and Python OOP conventions.',
        learningExplanation: 'Python supports OOP with flexible duck typing. Encapsulation is by convention (_protected) or name mangling (__private). Abstraction is enforced via the abc.ABC class. Inheritance enables code reuse with super(). Polymorphism means different objects can be treated identically through common method signatures.',
        whatToStudyNext: 'Dunder/Magic methods (__str__, __repr__, __len__, __iter__), classmethod vs staticmethod, and dataclasses.',
        recommendedPracticeQuestion: 'Create an abstract BaseRepository class using abc.ABC with abstract methods save() and find_by_id(), and implement a ConcreteSqlRepository.'
      }
    );
  }

  // ---------------------------------------------------------------------------
  // JAVASCRIPT QUESTIONS (Section 2 of prompt)
  // ---------------------------------------------------------------------------
  if (normSkill.includes('javascript') || normSkill === 'js') {
    questions.push(
      {
        id: 'js_variables_01',
        department: 'Computer Science & Engineering',
        subject: 'Web Technologies',
        topic: 'Frontend & Web Engineering',
        subtopic: 'Core JavaScript Execution',
        skill: 'JavaScript',
        difficulty: 'Beginner',
        questionSource: 'resume-skill',
        questionType: 'conceptual',
        question: 'Explain the differences between let, const, and var in JavaScript regarding scope, hoisting, and re-assignment. What is the Temporal Dead Zone (TDZ)?',
        keywords: ['var', 'let', 'const', 'scope', 'hoisting', 'temporal dead zone', 'block scope', 'function scope'],
        followUpTemplates: [
          'Can the contents of a const object or array be modified in JavaScript? Why or why not?',
          'Why did ES6 introduce block scoping instead of relying solely on function scoping with var?'
        ],
        idealAnswerPoints: [
          'var is function-scoped (or globally scoped), hoisted to top initialized as undefined, allows re-declaration and re-assignment',
          'let is block-scoped ({ }), hoisted but uninitialized (in TDZ until declaration), allows re-assignment but no re-declaration in same scope',
          'const is block-scoped, in TDZ until declared, requires immediate assignment and cannot be re-assigned (though object properties remain mutable)',
          'Temporal Dead Zone: Time between entering scope and variable declaration where accessing variable throws ReferenceError'
        ],
        explanation: 'Foundational JavaScript interview question testing scoping, hoisting mechanics, and modern ES6 standards.',
        learningExplanation: 'var causes subtle bugs because it leaks outside of loops and if-blocks to the surrounding function, and hoisting initializes it to undefined. Modern JavaScript uses const by default and let only when re-assignment is required. Both let and const are hoisted into the Temporal Dead Zone, preventing access before their definition line.',
        whatToStudyNext: 'JavaScript Execution Context, Lexical Environment, and Call Stack mechanics.',
        recommendedPracticeQuestion: 'Explain what console.log(a); var a = 10; and console.log(b); let b = 10; output, and why.'
      },
      {
        id: 'js_closures_promises_02',
        department: 'Computer Science & Engineering',
        subject: 'Web Technologies',
        topic: 'Frontend & Web Engineering',
        subtopic: 'Asynchronous JavaScript',
        skill: 'JavaScript',
        difficulty: 'Intermediate',
        questionSource: 'resume-skill',
        questionType: 'conceptual',
        question: 'Explain closures and promises in JavaScript. How does a closure retain access to outer scope variables, and what are the three states of a Promise?',
        keywords: ['closure', 'lexical scope', 'promise', 'pending', 'fulfilled', 'rejected', 'microtask', 'then', 'catch'],
        followUpTemplates: [
          'Give a practical real-world example of using a closure in web development (e.g. data privacy, memoization, debounce).',
          'How does Promise.all() differ from Promise.allSettled() when one of the promises rejects?'
        ],
        idealAnswerPoints: [
          'Closure: A function bundled together with references to its surrounding lexical environment; inner functions retain access to outer function variables even after outer function returns',
          'Use cases for closures: Data hiding/private variables, function factories, debouncing/throttling, memoization',
          'Promise: An object representing the eventual completion (or failure) of an asynchronous operation and its resulting value',
          'Three Promise states: pending (initial), fulfilled (succeeded with value via resolve), rejected (failed with error via reject)',
          'Chaining via .then(), .catch(), .finally() in the Microtask queue'
        ],
        explanation: 'Evaluates understanding of lexical scoping and modern asynchronous management in JavaScript.',
        learningExplanation: 'A closure is created every time a function is created, retaining references to its parent lexical environment. Promises replace callback hell by providing a standardized state machine (pending -> fulfilled/rejected) that queues fulfillment callbacks in the Microtask queue.',
        whatToStudyNext: 'The JavaScript Event Loop: MacroTask Queue vs Microtask Queue, Promise combinators (race, any).',
        recommendedPracticeQuestion: 'Write a custom createCounter(start) function using a closure that exposes increment(), decrement(), and getValue() methods.'
      },
      {
        id: 'js_async_await_03',
        department: 'Computer Science & Engineering',
        subject: 'Web Technologies',
        topic: 'Frontend & Web Engineering',
        subtopic: 'Asynchronous JavaScript',
        skill: 'JavaScript',
        difficulty: 'Intermediate',
        questionSource: 'resume-skill',
        questionType: 'conceptual',
        question: 'Explain async/await in JavaScript. How does it simplify asynchronous code compared to promise chains, and how do you handle errors properly with try...catch?',
        keywords: ['async', 'await', 'promise', 'try', 'catch', 'non-blocking', 'event loop', 'microtask'],
        followUpTemplates: [
          'What happens if you forget to use await inside an async function? What is returned?',
          'How can you run two independent async API requests in parallel using async/await?'
        ],
        idealAnswerPoints: [
          'async marks a function as asynchronous and automatically wraps its return value in a Promise',
          'await pauses the execution of the async function non-blockingly until the awaited Promise settles',
          'Replaces verbose .then().catch() chains with clean, readable synchronous-looking control flow',
          'Errors are caught using standard try...catch blocks; unhandled rejections bubble up',
          'Parallel execution using await Promise.all([fetchA(), fetchB()]) instead of sequential awaits'
        ],
        explanation: 'Evaluates asynchronous architecture, clean error handling, and parallel execution optimization.',
        learningExplanation: 'async/await is built on top of Promises and Generators. While await halts the async function, it does NOT block the JavaScript main thread or event loop. Parallel execution with Promise.all() is critical to avoid sequential network latency waterfalls.',
        whatToStudyNext: 'Error propagation in async functions, AbortController for canceling fetch requests.',
        recommendedPracticeQuestion: 'Refactor a nested 3-level .then() promise chain into clean async/await with robust try...catch error logging.'
      },
      {
        id: 'js_dom_events_04',
        department: 'Computer Science & Engineering',
        subject: 'Web Technologies',
        topic: 'Frontend & Web Engineering',
        subtopic: 'DOM Manipulation & Events',
        skill: 'JavaScript',
        difficulty: 'Beginner',
        questionSource: 'resume-skill',
        questionType: 'conceptual',
        question: 'Explain event handling and the Document Object Model (DOM) in JavaScript. What is event bubbling, event capturing, and how does event delegation improve performance?',
        keywords: ['dom', 'event bubbling', 'event capturing', 'event delegation', 'addeventlistener', 'stoppropagation', 'target'],
        followUpTemplates: [
          'What is the difference between event.target and event.currentTarget?',
          'Why is event delegation beneficial when rendering a dynamic list of 1,000 items?'
        ],
        idealAnswerPoints: [
          'DOM is the tree-like programmatic representation of HTML elements in memory',
          'Event phases: Capturing (down from window to target), Target phase, Bubbling (up from target back to window)',
          'Event delegation attaches a single event listener to a common parent element, leveraging bubbling to handle events for all current and future child elements via e.target',
          'Performance benefit: Conserves memory by avoiding hundreds of individual event listeners on dynamic list nodes',
          'e.stopPropagation() stops event traversal; e.preventDefault() cancels browser default action'
        ],
        explanation: 'Tests core browser runtime fundamentals, event architecture, and performance optimization.',
        learningExplanation: 'Event delegation is a core frontend design pattern. Instead of attaching onclick to 500 table rows, you attach a single listener to the parent <table> or <tbody> and inspect event.target. Matches with bubbling save significant browser memory.',
        whatToStudyNext: 'Web APIs: MutationObserver, IntersectionObserver, and RequestAnimationFrame.',
        recommendedPracticeQuestion: 'Write a vanilla JavaScript script that implements event delegation on a <ul> to delete any clicked <li> item.'
      }
    );
  }

  // ---------------------------------------------------------------------------
  // SQL AND MYSQL QUESTIONS (Section 2 of prompt)
  // ---------------------------------------------------------------------------
  if (normSkill.includes('sql') || normSkill.includes('mysql') || normSkill.includes('postgres') || normSkill.includes('database')) {
    questions.push(
      {
        id: 'sql_keys_01',
        department: 'Computer Science & Engineering',
        subject: 'Database Management Systems',
        topic: 'Database Systems',
        subtopic: 'Relational Integrity & Schema Design',
        skill: 'SQL',
        difficulty: 'Beginner',
        questionSource: 'resume-skill',
        questionType: 'conceptual',
        question: 'Explain the difference between a primary key, unique key, and foreign key in relational databases. What is referential integrity?',
        keywords: ['primary key', 'foreign key', 'unique key', 'null', 'referential integrity', 'cascade', 'constraint'],
        followUpTemplates: [
          'Can a table have multiple foreign keys? Can a foreign key column contain NULL values?',
          'What happens during ON DELETE CASCADE vs ON DELETE RESTRICT in SQL foreign keys?'
        ],
        idealAnswerPoints: [
          'Primary Key: Uniquely identifies each row in a table. Must contain unique values and CANNOT be NULL. Only one primary key per table.',
          'Unique Key: Enforces uniqueness across a column, but CAN accept one or more NULL values (depending on RDBMS). Multiple unique keys allowed.',
          'Foreign Key: A column (or set of columns) that references the primary key of another table, establishing a parent-child relationship.',
          'Referential Integrity: Ensures child records cannot reference non-existent parent rows; enforced via constraints (CASCADE, SET NULL, RESTRICT).'
        ],
        explanation: 'Foundational relational database question on schema design, data constraints, and relationship integrity.',
        learningExplanation: 'Primary keys guarantee row identity and automatically create clustered indexes. Foreign keys prevent orphan records and maintain relational consistency across tables. ON DELETE CASCADE automatically cleans up child records when a parent record is deleted.',
        whatToStudyNext: 'Composite primary keys, surrogate vs natural keys, and self-referencing foreign keys.',
        recommendedPracticeQuestion: 'Write a CREATE TABLE statement for an Orders table linking to Customers with a foreign key and ON DELETE CASCADE.'
      },
      {
        id: 'sql_joins_02',
        department: 'Computer Science & Engineering',
        subject: 'Database Management Systems',
        topic: 'Database Systems',
        subtopic: 'Relational Joins & Set Operations',
        skill: 'SQL',
        difficulty: 'Intermediate',
        questionSource: 'resume-skill',
        questionType: 'sql',
        question: 'Explain SQL joins with examples. What is the difference between INNER JOIN, LEFT JOIN, RIGHT JOIN, and FULL OUTER JOIN?',
        keywords: ['inner join', 'left join', 'right join', 'full outer join', 'on', 'null', 'cartesian product'],
        followUpTemplates: [
          'How do you write a query to find all customers who have NEVER placed an order using a LEFT JOIN?',
          'What is a CROSS JOIN, and when can it cause severe database server memory exhaustion?'
        ],
        idealAnswerPoints: [
          'INNER JOIN: Returns only rows where there is a matching key in both tables.',
          'LEFT JOIN (LEFT OUTER JOIN): Returns all rows from the left table, plus matched rows from the right table; unmatched right fields are NULL.',
          'RIGHT JOIN: Returns all rows from the right table, plus matched rows from the left table.',
          'FULL OUTER JOIN: Returns all rows when there is a match in either left or right table; unmatched columns on either side are filled with NULL.'
        ],
        explanation: 'Core database querying topic assessing set theory and multi-table data extraction.',
        learningExplanation: 'INNER JOIN finds the intersection. LEFT JOIN preserves all left table records regardless of whether a match exists on the right. Filtering for "WHERE right_table.id IS NULL" after a LEFT JOIN is the standard pattern to find missing relationships.',
        whatToStudyNext: 'JOIN optimization: Hash joins vs nested loop joins vs merge joins, and indexing join foreign keys.',
        recommendedPracticeQuestion: 'Write an SQL query to list Employee names and their Department names, including employees without a department.'
      },
      {
        id: 'sql_groupby_having_03',
        department: 'Computer Science & Engineering',
        subject: 'Database Management Systems',
        topic: 'Database Systems',
        subtopic: 'Aggregation & Filtering',
        skill: 'SQL',
        difficulty: 'Intermediate',
        questionSource: 'resume-skill',
        questionType: 'sql',
        question: 'Explain GROUP BY and HAVING in SQL. What is the difference between WHERE and HAVING, and what are the standard aggregate functions?',
        keywords: ['group by', 'having', 'where', 'count', 'sum', 'avg', 'min', 'max', 'aggregation'],
        followUpTemplates: [
          'Can you use an aggregate function like SUM(amount) inside a WHERE clause? Why or why not?',
          'What is the logical query processing order between FROM, WHERE, GROUP BY, HAVING, and SELECT?'
        ],
        idealAnswerPoints: [
          'GROUP BY collapses multiple rows sharing identical values in specified columns into summary rows',
          'Standard aggregate functions: COUNT(), SUM(), AVG(), MIN(), MAX()',
          'WHERE filters individual rows BEFORE aggregation occurs; cannot evaluate aggregate functions',
          'HAVING filters aggregated groups AFTER GROUP BY execution; evaluates conditions on aggregate calculations (e.g. HAVING COUNT(*) > 5)',
          'Logical execution order: FROM -> WHERE -> GROUP BY -> HAVING -> SELECT -> ORDER BY'
        ],
        explanation: 'Evaluates SQL query formulation, execution order, and aggregation mechanics.',
        learningExplanation: 'WHERE filters raw rows before grouping. HAVING filters the grouped rows produced by aggregate functions. You cannot write "WHERE COUNT(*) > 2" because the count does not exist until grouping has completed.',
        whatToStudyNext: 'Window functions in SQL: ROW_NUMBER(), RANK(), DENSE_RANK(), and PARTITION BY.',
        recommendedPracticeQuestion: 'Write an SQL query to find departments where the average employee salary is greater than $75,000.'
      },
      {
        id: 'sql_normalization_indexes_04',
        department: 'Computer Science & Engineering',
        subject: 'Database Management Systems',
        topic: 'Database Systems',
        subtopic: 'Normalization & Index Optimization',
        skill: 'SQL',
        difficulty: 'Intermediate',
        questionSource: 'resume-skill',
        questionType: 'conceptual',
        question: 'Explain database normalization (1NF, 2NF, 3NF) and indexes (Clustered vs Non-Clustered). Why does indexing improve SELECT speed but slow down INSERT/UPDATE operations?',
        keywords: ['normalization', '1nf', '2nf', '3nf', 'b-tree', 'clustered index', 'non-clustered index', 'insert', 'update'],
        followUpTemplates: [
          'When would a database architect intentionally denormalize a database schema in production?',
          'How does a B-Tree index structure enable O(log n) search operations?'
        ],
        idealAnswerPoints: [
          '1NF: Atomic values, unique column names, unique rows.',
          '2NF: Must be in 1NF and have no partial dependencies (all non-key attributes fully dependent on entire composite primary key).',
          '3NF: Must be in 2NF and have no transitive dependencies (non-key attribute depending on another non-key attribute).',
          'Clustered Index: Sorts and stores the actual data rows in the table; only one clustered index per table (typically the primary key).',
          'Non-Clustered Index: Separate B-Tree structure storing index keys with pointers to the data rows; multiple allowed.',
          'Trade-off: Speeds up reads (SELECT) by avoiding full table scans; slows down writes (INSERT, UPDATE, DELETE) because index B-Trees must be rebalanced.'
        ],
        explanation: 'Tests database architecture, anomaly prevention, B-Tree data structures, and production performance trade-offs.',
        learningExplanation: 'Normalization minimizes data redundancy and update anomalies. Indexes (primarily B-Trees) reduce lookups from O(n) table scans to O(log n) tree traversals. However, every write operation must also update and rebalance the index tree, adding overhead.',
        whatToStudyNext: 'Composite indexes, covering indexes, EXPLAIN / query execution plans, and Boyce-Codd Normal Form (BCNF).',
        recommendedPracticeQuestion: 'Identify the transitive dependency in an Employees table containing (emp_id, emp_name, dept_id, dept_name) and decompose it into 3NF.'
      },
      {
        id: 'sql_transactions_acid_05',
        department: 'Computer Science & Engineering',
        subject: 'Database Management Systems',
        topic: 'Database Systems',
        subtopic: 'Transaction Processing & ACID Properties',
        skill: 'SQL',
        difficulty: 'Advanced',
        questionSource: 'resume-skill',
        questionType: 'conceptual',
        question: 'Explain database transactions and ACID properties: Atomicity, Consistency, Isolation, and Durability. What are transaction isolation levels and concurrency anomalies (Dirty Read, Non-Repeatable Read, Phantom Read)?',
        keywords: ['acid', 'atomicity', 'consistency', 'isolation', 'durability', 'dirty read', 'phantom read', 'serializable'],
        followUpTemplates: [
          'How does a database recover committed transactions if a power failure occurs immediately after a commit?',
          'What is the performance trade-off between READ COMMITTED and SERIALIZABLE isolation levels?'
        ],
        idealAnswerPoints: [
          'Atomicity: All-or-nothing execution; if any statement fails, the entire transaction rolls back.',
          'Consistency: Transactions bring the database from one valid state to another, satisfying all constraints.',
          'Isolation: Concurrent transactions execute independently without interfering with each other.',
          'Durability: Once a transaction commits, changes are permanently recorded in non-volatile storage (via WAL / redo log).',
          'Concurrency anomalies: Dirty Read (reading uncommitted data), Non-Repeatable Read (rereading same row yields different data), Phantom Read (new rows inserted by another transaction).',
          'Isolation levels: Read Uncommitted, Read Committed, Repeatable Read, Serializable.'
        ],
        explanation: 'Advanced database engineering topic testing concurrency control, recovery mechanisms, and ACID consistency.',
        learningExplanation: 'ACID properties ensure enterprise reliability. In banking, transferring $100 requires debiting account A and crediting account B atomically. Write-Ahead Logging (WAL) ensures durability. Higher isolation levels (Serializable) prevent anomalies like phantom reads through two-phase locking or MVCC at the cost of concurrency throughput.',
        whatToStudyNext: 'Multi-Version Concurrency Control (MVCC), Write-Ahead Logging (WAL), and distributed transactions (2PC).',
        recommendedPracticeQuestion: 'Explain how PostgreSQL or MySQL uses MVCC to allow concurrent reads and writes without blocking table locks.'
      }
    );
  }

  // ---------------------------------------------------------------------------
  // FLASK QUESTIONS (Section 2 of prompt)
  // ---------------------------------------------------------------------------
  if (normSkill.includes('flask')) {
    questions.push(
      {
        id: 'flask_routing_http_01',
        department: 'Computer Science & Engineering',
        subject: 'Web Technologies',
        topic: 'Backend Web & API Architecture',
        subtopic: 'Flask Routing & Methods',
        skill: 'Flask',
        difficulty: 'Beginner',
        questionSource: 'resume-skill',
        questionType: 'conceptual',
        question: 'Explain routing and HTTP methods in Flask. How do you define dynamic URL parameters and restrict endpoints to specific methods like GET and POST?',
        keywords: ['flask', '@app.route', 'http methods', 'get', 'post', 'dynamic routes', 'url_for'],
        followUpTemplates: [
          'How does Flask parse URL path converters like <int:user_id> vs <string:username>?',
          'What happens when a client sends a POST request to an endpoint defined with methods=["GET"]?'
        ],
        idealAnswerPoints: [
          'Flask uses @app.route("/path", methods=["GET", "POST"]) decorator to map URLs to Python view functions',
          'Dynamic parameters defined with <converter:variable_name>, e.g. <int:id>',
          'Built-in converters: string, int, float, path, uuid',
          'If an unpermitted method is called, Flask automatically returns 405 Method Not Allowed'
        ],
        explanation: 'Tests basic web routing and HTTP request mapping in the Flask microframework.',
        learningExplanation: 'In Flask, @app.route() binds URLs to view functions. By default, routes only accept GET requests. Adding methods=["GET", "POST"] allows multi-method endpoints. Converters like <int:id> automatically validate types and pass typed arguments to view functions.',
        whatToStudyNext: 'Flask Blueprints for modular application structuring and url_for() dynamic generation.',
        recommendedPracticeQuestion: 'Write a Flask route /api/users/<int:user_id> that accepts both GET (fetch user) and PUT (update user) requests.'
      },
      {
        id: 'flask_rest_apis_02',
        department: 'Computer Science & Engineering',
        subject: 'Web Technologies',
        topic: 'Backend Web & API Architecture',
        subtopic: 'REST API & Request Handling',
        skill: 'Flask',
        difficulty: 'Intermediate',
        questionSource: 'resume-skill',
        questionType: 'conceptual',
        question: 'Explain how request and response handling, JSON serialization, and database connectivity (e.g. SQLAlchemy) work in Flask REST APIs.',
        keywords: ['flask', 'request', 'jsonify', 'request.get_json()', 'sqlalchemy', 'status code', 'orm'],
        followUpTemplates: [
          'What is the difference between request.form, request.args, and request.get_json() in Flask?',
          'How does Flask-SQLAlchemy manage database sessions and prevent connection pool exhaustion?'
        ],
        idealAnswerPoints: [
          'request object: request.args (query params), request.form (form data), request.get_json() (JSON payloads)',
          'jsonify() serializes Python dictionaries/lists to JSON responses and sets header Content-Type: application/json',
          'Returning HTTP status codes: return jsonify(data), 200 or 201 Created or 400 Bad Request',
          'Database connectivity via Flask-SQLAlchemy: db.session.add(), db.session.commit(), db.session.rollback() on errors'
        ],
        explanation: 'Evaluates production REST API design, request parsing, and ORM persistence in Python backend services.',
        learningExplanation: 'Flask relies on thread-local request contexts. To build a REST API, parse incoming JSON with request.get_json(silent=True), validate inputs, execute database queries using SQLAlchemy ORM sessions, and return jsonify(result), status_code. Ensure try...finally blocks rollback transactions on exceptions.',
        whatToStudyNext: 'Flask Application Factory pattern, JWT authentication in Flask, and database migrations with Flask-Migrate.',
        recommendedPracticeQuestion: 'Implement a Flask REST endpoint POST /api/items that validates JSON payload {"name": str, "price": float} and returns 201 or 400.'
      }
    );
  }

  // ---------------------------------------------------------------------------
  // REACT QUESTIONS (Section 2 of prompt)
  // ---------------------------------------------------------------------------
  if (normSkill.includes('react')) {
    questions.push(
      {
        id: 'react_props_state_01',
        department: 'Computer Science & Engineering',
        subject: 'Frontend Engineering',
        topic: 'Frontend & Web Engineering',
        subtopic: 'React Components & State',
        skill: 'React',
        difficulty: 'Beginner',
        questionSource: 'resume-skill',
        questionType: 'conceptual',
        question: 'Explain components, props, and state in React. What is unidirectional data flow, and why should state never be mutated directly?',
        keywords: ['props', 'state', 'components', 'immutability', 're-render', 'unidirectional', 'virtual dom'],
        followUpTemplates: [
          'What happens if you mutate state directly like state.count = 5 instead of calling setCount(5)?',
          'How do you pass data from a child component back up to a parent component in React?'
        ],
        idealAnswerPoints: [
          'Components: Reusable, self-contained building blocks of UI returning JSX',
          'Props: Read-only inputs passed from parent to child components (immutable to the receiver)',
          'State: Internal, mutable data managed by the component that triggers re-rendering when updated',
          'Unidirectional Data Flow: Data flows downwards from parent to child via props; events flow upwards via callback functions',
          'Direct mutation bypasses React reconciliation diffing algorithm, preventing the component from re-rendering'
        ],
        explanation: 'Core React architectural principles testing component hierarchy and state management fundamentals.',
        learningExplanation: 'React components are pure functions with respect to their props. State represents dynamic data. Because React relies on shallow object comparison (Object.is) to schedule Virtual DOM diffs and re-renders, direct state mutations fail to trigger UI updates. Always update state with setter functions or immutable copies.',
        whatToStudyNext: 'React Reconciliation and the Fiber architecture.',
        recommendedPracticeQuestion: 'Write a React component with an input field where typing updates local state and displays the text in real time.'
      },
      {
        id: 'react_hooks_lifecycle_02',
        department: 'Computer Science & Engineering',
        subject: 'Frontend Engineering',
        topic: 'Frontend & Web Engineering',
        subtopic: 'Hooks & API Integration',
        skill: 'React',
        difficulty: 'Intermediate',
        questionSource: 'resume-skill',
        questionType: 'conceptual',
        question: 'Explain the useState and useEffect hooks in React. How does the dependency array control execution, how do you handle cleanup, and how do you integrate backend APIs?',
        keywords: ['usestate', 'useeffect', 'dependency array', 'cleanup function', 'api integration', 'fetch', 'unmount'],
        followUpTemplates: [
          'What causes an infinite loop in useEffect, and how do you prevent it?',
          'Why must cleanup functions be returned from useEffect when setting up event listeners or timers?'
        ],
        idealAnswerPoints: [
          'useState: Declares a state variable [value, setValue] = useState(initial)',
          'useEffect: Performs side effects (data fetching, DOM listeners, timers, subscriptions)',
          'Dependency array: [] runs once on mount; [dep] runs on mount and when dep changes; omitted runs on every render',
          'Cleanup function: Returned from useEffect to cancel network requests, remove event listeners, or clear timers on unmount',
          'API integration: Call fetch/axios inside useEffect with loading and error states, handling race conditions'
        ],
        explanation: 'Evaluates practical frontend development skills, hook lifecycle mechanics, and asynchronous API handling.',
        learningExplanation: 'useEffect manages side effects in functional components. A common bug is missing dependencies or causing infinite loops by updating a state variable that is also listed in the dependency array. The return () => {} cleanup function prevents memory leaks when components unmount.',
        whatToStudyNext: 'Advanced React Hooks: useCallback, useMemo, useRef, and custom hooks.',
        recommendedPracticeQuestion: 'Write a React hook or component that fetches user data from /api/users, displaying Loading, Error, or Data states.'
      }
    );
  }

  // ---------------------------------------------------------------------------
  // GIT QUESTIONS (Section 2 of prompt)
  // ---------------------------------------------------------------------------
  if (normSkill.includes('git')) {
    questions.push(
      {
        id: 'git_workflow_01',
        department: 'Computer Science & Engineering',
        subject: 'Software Engineering',
        topic: 'Software Engineering Practices',
        subtopic: 'Version Control Workflows',
        skill: 'Git',
        difficulty: 'Beginner',
        questionSource: 'resume-skill',
        questionType: 'conceptual',
        question: 'Explain the core Git commands: commit, push, pull, branch, and merge. What is the difference between git fetch and git pull?',
        keywords: ['commit', 'push', 'pull', 'branch', 'merge', 'fetch', 'working directory', 'staging area', 'remote'],
        followUpTemplates: [
          'What is the difference between git merge and git rebase?',
          'What are Git detached HEAD states, and how do they occur?'
        ],
        idealAnswerPoints: [
          'commit: Records staged snapshots to local repository history with a commit message',
          'push: Uploads local branch commits to a remote repository (e.g. GitHub)',
          'fetch: Downloads new commits/branches from remote to local without modifying working files',
          'pull: Combines git fetch + git merge, downloading remote changes and immediately merging them into active branch',
          'branch: Creates an independent pointer to a commit for feature development',
          'merge: Combines histories of two branches together'
        ],
        explanation: 'Fundamental version control commands essential for every engineering team.',
        learningExplanation: 'Git operates across 3 local trees: Working Directory -> Staging Area (Index) -> Local Repository (HEAD). git fetch updates remote-tracking branches safely. git pull immediately merges remote changes into your local branch, which may cause unexpected merge commits.',
        whatToStudyNext: 'Interactive Git Rebase (git rebase -i), squashing commits, and Git cherry-pick.',
        recommendedPracticeQuestion: 'Explain step-by-step commands to create a feature branch, make a commit, push to remote, and open a PR.'
      },
      {
        id: 'git_merge_conflicts_02',
        department: 'Computer Science & Engineering',
        subject: 'Software Engineering',
        topic: 'Software Engineering Practices',
        subtopic: 'Conflict Resolution & Best Practices',
        skill: 'Git',
        difficulty: 'Intermediate',
        questionSource: 'resume-skill',
        questionType: 'practical',
        question: 'Explain what causes a Git merge conflict and describe the exact step-by-step process to resolve it without losing team changes.',
        keywords: ['merge conflict', 'conflict markers', '<<<<<<<', '=======', '>>>>>>>', 'git status', 'git add', 'commit'],
        followUpTemplates: [
          'How can teams minimize the frequency of merge conflicts in continuous integration workflows?',
          'What is git stash and how is it used when switching branches with uncommitted work?'
        ],
        idealAnswerPoints: [
          'Cause: When two branches modify the same line of code differently, or one branch deletes a file that another modified',
          'Git pauses merge and inserts conflict markers: <<<<<<< HEAD (current branch), =======, >>>>>>> feature_branch (incoming changes)',
          'Resolution steps: Run git status to identify conflicted files, open files and inspect conflict markers',
          'Edit lines to desired combined code, remove conflict marker lines entirely',
          'Stage resolved files with git add <filename>',
          'Complete merge with git commit (or git merge --continue)'
        ],
        explanation: 'Tests real-world collaborative version control troubleshooting and conflict resolution.',
        learningExplanation: 'Merge conflicts are normal in collaborative engineering. When automatic three-way merge fails, Git marks the ambiguous lines with <<<<<<< HEAD and >>>>>>> branch. You resolve by manually reconciling the code, removing markers, staging the file, and committing the merge.',
        whatToStudyNext: 'Git Hooks, trunk-based development vs GitFlow, and git rerere (reuse recorded resolution).',
        recommendedPracticeQuestion: 'Walk through how you would resolve a merge conflict in package.json or requirements.txt where both branches added different libraries.'
      }
    );
  }

  // ---------------------------------------------------------------------------
  // JAVA QUESTIONS
  // ---------------------------------------------------------------------------
  if (normSkill.includes('java') && !normSkill.includes('javascript')) {
    questions.push(
      {
        id: 'java_jvm_gc_01',
        department: 'Computer Science & Engineering',
        subject: 'Java Programming & JVM',
        topic: 'Programming Languages',
        subtopic: 'JVM Architecture & Memory Management',
        skill: 'Java',
        difficulty: 'Intermediate',
        questionSource: 'resume-skill',
        questionType: 'conceptual',
        question: 'Explain JVM memory architecture (Heap, Stack, Metaspace, Program Counter). How does Garbage Collection identify unreachable objects, and how does Java HashMap handle hash collisions?',
        keywords: ['java', 'jvm', 'heap', 'stack', 'garbage collection', 'hashmap', 'collision', 'red-black tree'],
        followUpTemplates: [
          'What is the difference between equals() and hashCode() contracts in Java?',
          'Why did Java 8 switch HashMap buckets from linked lists to balanced Red-Black Trees when length exceeds 8?'
        ],
        idealAnswerPoints: [
          'Heap: Shared memory holding all object instances; Stack: Thread-local memory holding method frames, local primitive variables, and references',
          'Metaspace: Stores class metadata, bytecode, and static variables outside the heap in native memory',
          'Garbage Collection: Uses Generational Hypothesis (Young Generation: Eden/Survivor, Old Generation); identifies live objects via GC Roots reachability analysis',
          'HashMap Collisions: Uses separate chaining with buckets; if a bucket exceeds 8 entries (TREEIFY_THRESHOLD), it converts from singly linked list to Red-Black Tree, reducing lookup from O(n) to O(log n)'
        ],
        explanation: 'Core Java platform architecture testing JVM memory management, collections, and algorithms.',
        learningExplanation: 'Understanding the JVM is crucial for avoiding OutOfMemoryErrors and memory leaks. HashMaps store entries in buckets indexed by hash(key) & (n-1). When keys collide, chaining stores multiple items in the same bucket.',
        whatToStudyNext: 'Java Concurrency (synchronized, volatile, ReentrantLock, ExecutorService).',
        recommendedPracticeQuestion: 'Implement a thread-safe singleton pattern in Java using Double-Checked Locking.'
      }
    );
  }

  // ---------------------------------------------------------------------------
  // C / C++ QUESTIONS
  // ---------------------------------------------------------------------------
  if (normSkill.includes('c++') || normSkill.includes('cpp') || normSkill === 'c' || normSkill.includes('c programming')) {
    questions.push(
      {
        id: 'cpp_pointers_virtual_01',
        department: 'Computer Science & Engineering',
        subject: 'C / C++ Systems Programming',
        topic: 'Programming Languages',
        subtopic: 'Pointers, RAII & Polymorphism',
        skill: 'C++',
        difficulty: 'Intermediate',
        questionSource: 'resume-skill',
        questionType: 'conceptual',
        question: 'Explain the difference between stack and heap memory allocation in C/C++. How do virtual functions achieve runtime polymorphism through the vtable and vptr, and why must base class destructors be declared virtual?',
        keywords: ['c++', 'pointers', 'virtual function', 'vtable', 'vptr', 'polymorphism', 'raii', 'destructor'],
        followUpTemplates: [
          'What happens if a base class destructor is NOT virtual when deleting a derived object via a base class pointer?',
          'How do modern C++ smart pointers (std::unique_ptr and std::shared_ptr) prevent memory leaks?'
        ],
        idealAnswerPoints: [
          'Stack: Fast, automated allocation/deallocation on function entry/exit; Heap: Manual dynamic memory managed via malloc/free or new/delete',
          'Virtual Table (vtable): Compiler creates an array of function pointers for classes with virtual methods; each object instance stores a hidden vptr pointer to its class vtable',
          'Runtime Polymorphism: Invoking ptr->method() dereferences vptr to look up the overriding derived function pointer at runtime',
          'Virtual Destructor: Guarantees that deleting a derived object through a base pointer invokes the derived destructor first, then the base destructor, avoiding resource leaks'
        ],
        explanation: 'Standard systems programming assessment on memory lifecycle, polymorphism mechanics, and object destruction.',
        learningExplanation: 'In C++, non-virtual method calls are resolved at compile time (early binding). Virtual methods use a hidden vtable pointer inside the object to resolve calls dynamically at runtime (late binding). Non-virtual base destructors cause undefined behavior and leaks.',
        whatToStudyNext: 'C++ Move Semantics, rvalue references (&&), and std::move.',
        recommendedPracticeQuestion: 'Write a minimal C++ class demonstrating RAII with a custom resource management wrapper.'
      }
    );
  }

  // ---------------------------------------------------------------------------
  // PHP QUESTIONS
  // ---------------------------------------------------------------------------
  if (normSkill.includes('php')) {
    questions.push(
      {
        id: 'php_web_security_01',
        department: 'Computer Science & Engineering',
        subject: 'PHP Web Development',
        topic: 'Programming Languages',
        subtopic: 'Web Scripting & SQL Injection Defense',
        skill: 'PHP',
        difficulty: 'Beginner',
        questionSource: 'resume-skill',
        questionType: 'conceptual',
        question: 'Explain the request lifecycle in PHP. How does PDO (PHP Data Objects) with prepared statements protect web applications from SQL Injection, and what is the difference between $_GET, $_POST, and $_SESSION?',
        keywords: ['php', 'pdo', 'sql injection', 'prepared statements', 'session', 'superglobals', 'web security'],
        followUpTemplates: [
          'Why does parameter binding in PDO ensure user input is never interpreted as executable SQL syntax?',
          'How does PHP manage session persistence across stateless HTTP requests using session cookies?'
        ],
        idealAnswerPoints: [
          'PHP Request Lifecycle: Web server (Apache/Nginx via PHP-FPM) initiates PHP interpreter, executes script from top to bottom, sends output buffer to client, and terminates script memory',
          'Superglobals: $_GET parses URL query parameters; $_POST receives HTTP request body (form/json); $_SESSION maintains user session state across requests backed by server session files',
          'PDO Prepared Statements: Separates SQL query structure from data values; database engine pre-compiles SQL template, treating bound parameters strictly as literal values and completely neutralizing SQL Injection attacks'
        ],
        explanation: 'Tests web backend fundamentals, server-side request parsing, and database security practices.',
        learningExplanation: 'SQL Injection happens when raw user input is concatenated directly into query strings. PDO prepared statements pre-compile the SQL query on the database server before parameters are bound, guaranteeing user strings can never alter the query logic.',
        whatToStudyNext: 'CSRF token protection in PHP forms, and modern PHP frameworks (Laravel / Symfony).',
        recommendedPracticeQuestion: 'Write a secure PHP script utilizing PDO with prepared statements to authenticate a user with password_verify().'
      }
    );
  }

  // ---------------------------------------------------------------------------
  // NUMPY & PANDAS (Data Science & Scientific Computing)
  // ---------------------------------------------------------------------------
  if (normSkill.includes('numpy') || normSkill.includes('pandas')) {
    questions.push(
      {
        id: 'numpy_pandas_data_wrangling_01',
        department: 'Computer Science & Engineering',
        subject: 'Data Science & Scientific Computing',
        topic: 'Scientific Computing',
        subtopic: 'Array Broadcasting & DataFrame Vectorization',
        skill: normSkill.includes('pandas') ? 'Pandas' : 'NumPy',
        difficulty: 'Intermediate',
        questionSource: 'resume-skill',
        questionType: 'conceptual',
        question: 'Explain NumPy Array Broadcasting and why vectorized operations are orders of magnitude faster than Python for-loops. In Pandas, how do you handle missing data (dropna vs fillna), and what is the difference between loc and iloc?',
        keywords: ['numpy', 'pandas', 'broadcasting', 'vectorization', 'loc vs iloc', 'dataframe', 'missing data'],
        followUpTemplates: [
          'What are the two compatibility rules that allow two NumPy arrays of different shapes to be broadcast together?',
          'Why should you avoid iterating over Pandas DataFrame rows with iterrows() in production code?'
        ],
        idealAnswerPoints: [
          'Vectorization: Executes array operations via compiled C/Fortran loops with SIMD vector CPU instructions and contiguous memory cache locality, eliminating Python interpreter overhead',
          'Broadcasting Rules: Compares array dimensions from right to left; dimensions are compatible if they are equal or one of them is 1',
          'Pandas loc vs iloc: loc performs label-based indexing (e.g. df.loc[\'row_label\', \'column_name\']); iloc performs integer position-based indexing (e.g. df.iloc[0:5, 0:2])',
          'Missing Data: dropna() removes rows/columns with nulls; fillna() imputes missing values with statistical measures (mean, median, forward-fill)'
        ],
        explanation: 'Essential data science library questions assessing memory layout, vector operations, and data frame manipulation.',
        learningExplanation: 'Python loops introduce huge per-iteration overhead. NumPy arrays are contiguous blocks of memory where math is executed directly in optimized C libraries. Broadcasting enables operations across differing array shapes without copying data in memory.',
        whatToStudyNext: 'Pandas groupby aggregation pipelines and memory optimization using categorical dtypes.',
        recommendedPracticeQuestion: 'Write a Pandas expression to normalize numeric columns using min-max scaling across grouped categories.'
      }
    );
  }

  // ---------------------------------------------------------------------------
  // AI / ML / NEURAL NETWORKS / LLMS
  // ---------------------------------------------------------------------------
  if (normSkill.includes('machine learning') || normSkill.includes('deep learning') || normSkill.includes('neural') || normSkill.includes('llm') || normSkill.includes('nlp') || normSkill.includes('tensorflow') || normSkill.includes('pytorch')) {
    questions.push(
      {
        id: 'aiml_transformers_llm_01',
        department: 'Computer Science & Engineering',
        subject: 'Artificial Intelligence & Deep Learning',
        topic: 'Machine Learning & AI',
        subtopic: 'Transformer Architecture & Attention',
        skill: 'Artificial Intelligence',
        difficulty: 'Advanced',
        questionSource: 'resume-skill',
        questionType: 'conceptual',
        question: 'Explain the Self-Attention mechanism in Transformer architectures: Attention(Q, K, V) = softmax(Q * K^T / sqrt(d_k)) * V. Why is the scaling factor sqrt(d_k) necessary, and what is the difference between encoder-only (BERT), decoder-only (GPT), and encoder-decoder (T5) models?',
        keywords: ['transformer', 'self-attention', 'query key value', 'softmax', 'bert', 'gpt', 'llm', 'generative ai'],
        followUpTemplates: [
          'Why do Transformers require Positional Encodings since they process tokens in parallel rather than sequentially like RNNs?',
          'What is the difference between pre-training and fine-tuning (e.g. LoRA / instruction tuning) in modern Large Language Models?'
        ],
        idealAnswerPoints: [
          'Self-Attention: Maps queries Q and keys K to compute attention score weights via dot product, normalized by softmax, and computes weighted sum of value vectors V',
          'Scaling Factor sqrt(d_k): For large embedding dimensions d_k, dot products grow large in magnitude, pushing softmax into regions with extremely small gradients (vanishing gradients); dividing by sqrt(d_k) stabilizes gradients',
          'Architectures: Encoder-only (BERT - bidirectional, ideal for classification/NER); Decoder-only (GPT - causal masked autoregressive, ideal for text generation); Encoder-Decoder (T5 - ideal for translation/summarization)'
        ],
        explanation: 'Modern AI/ML assessment on deep learning Transformer mechanics, attention equations, and LLM foundations.',
        learningExplanation: 'Unlike RNNs that process tokens one by one, Transformers compute pairwise attention between all tokens in parallel. Scaling by sqrt(d_k) prevents the softmax function from saturating, which would stall gradient updates during backpropagation.',
        whatToStudyNext: 'Retrieval Augmented Generation (RAG), vector embeddings, and quantization (4-bit/8-bit).',
        recommendedPracticeQuestion: 'Walk through how causal masking in GPT prevents tokens from attending to future tokens during training.'
      }
    );
  }

  return questions;
}

// =============================================================================
// 5. CORE ENGINEERING CURRICULUM QUESTIONS BY DEPARTMENT
// Guarantees solid questions for CSE, IT, ECE, EEE, Mechanical, Civil, Automobile
// =============================================================================

export function getCurriculumFoundationalQuestions(
  department: EngineeringDepartment,
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced'
): DatasetQuestion[] {
  const list: DatasetQuestion[] = [];

  // Load curated department questions from pool
  const pool = DEPARTMENT_QUESTION_POOLS[department];
  if (pool && pool.length > 0) {
    list.push(...pool);
  }

  switch (department) {
    // -------------------------------------------------------------------------
    // ECE (Section 4 of prompt)
    // -------------------------------------------------------------------------
    case 'Electronics & Communication Engineering':
      list.push(
        {
          id: 'ece_digital_logic_01',
          department: 'Electronics & Communication Engineering',
          subject: 'Digital Electronics & VLSI',
          topic: 'Digital System Design & VLSI',
          subtopic: 'Sequential Circuits & Timing',
          skill: 'Digital Electronics',
          difficulty: 'Beginner',
          questionSource: 'curriculum-foundational',
          questionType: 'conceptual',
          question: 'Explain the difference between combinational and sequential logic circuits. What are setup time and hold time in digital flip-flops, and what happens if timing constraints are violated?',
          keywords: ['combinational', 'sequential', 'flip-flop', 'latch', 'setup time', 'hold time', 'metastability', 'clock'],
          followUpTemplates: [
            'What is metastability in digital circuits, and how do multi-stage synchronizers mitigate it?',
            'How does a D flip-flop differ fundamentally from a D latch regarding clock triggering?'
          ],
          idealAnswerPoints: [
            'Combinational circuits: Output depends strictly on current inputs (no memory; e.g. multiplexers, adders)',
            'Sequential circuits: Output depends on current inputs and past states (contains memory elements like flip-flops, registers)',
            'Setup Time: Minimum time data input must remain stable BEFORE the active clock edge',
            'Hold Time: Minimum time data input must remain stable AFTER the active clock edge',
            'Violation leads to metastability: Output enters indeterminate oscillating state between 0 and 1, causing logic failure'
          ],
          explanation: 'Core digital electronics foundation testing synchronous design and timing constraints.',
          learningExplanation: 'Setup and hold times are fundamental to all synchronous digital design (FPGA, ASIC, CPU). If data changes inside the setup/hold aperture around a clock edge, the flip-flop can become metastable, taking an unpredictable amount of time to settle to a valid logic level.',
          whatToStudyNext: 'Static Timing Analysis (STA), clock skew, and clock jitter.',
          recommendedPracticeQuestion: 'Calculate maximum clock frequency given T_setup = 2ns, T_clk-q = 3ns, and combinational delay T_comb = 5ns.'
        },
        {
          id: 'ece_embedded_c_02',
          department: 'Electronics & Communication Engineering',
          subject: 'Embedded Systems',
          topic: 'Embedded Systems & Firmware',
          subtopic: 'Microcontrollers & Registers',
          skill: 'Embedded C',
          difficulty: 'Intermediate',
          questionSource: 'curriculum-foundational',
          questionType: 'conceptual',
          question: 'Explain the purpose of the volatile keyword in Embedded C programming. How do microcontrollers handle hardware interrupts via the Interrupt Service Routine (ISR)?',
          keywords: ['volatile', 'embedded c', 'isr', 'interrupt', 'register', 'compiler optimization', 'hardware'],
          followUpTemplates: [
            'Why should you avoid calling printf(), malloc(), or using long delays inside an ISR?',
            'What is the difference between polling and interrupt-driven I/O in embedded microcontrollers?'
          ],
          idealAnswerPoints: [
            'volatile tells compiler that variable value can change unexpectedly outside of the immediate program code (e.g. by hardware register or ISR)',
            'Prevents compiler from aggressively caching variable in a CPU register or optimizing reads away in loops (while(!flag))',
            'Hardware Interrupt: Hardware signal pauses main CPU program flow, saves context on stack, and branches to vector table',
            'ISR execution: Must be extremely short and deterministic; sets flags or places data into ring buffers for main loop processing'
          ],
          explanation: 'Essential embedded firmware topic assessing microcontroller architecture and memory handling.',
          learningExplanation: 'Without volatile, an optimizing compiler sees a variable that never changes inside a while(flag == 0) loop and turns it into an infinite loop by caching flag in a CPU register. volatile forces memory reads every time. ISRs must be minimal to avoid starving other interrupts.',
          whatToStudyNext: 'ARM Cortex-M NVIC (Nested Vectored Interrupt Controller) priorities and DMA (Direct Memory Access).',
          recommendedPracticeQuestion: 'Write an Embedded C snippet configuring a volatile pointer to read from a memory-mapped GPIO register.'
        },
        {
          id: 'ece_communication_dsp_03',
          department: 'Electronics & Communication Engineering',
          subject: 'Signals & Communication Systems',
          topic: 'Signal Processing & Systems',
          subtopic: 'Sampling & Modulation',
          skill: 'Communication Systems',
          difficulty: 'Intermediate',
          questionSource: 'curriculum-foundational',
          questionType: 'conceptual',
          question: 'State the Nyquist-Shannon Sampling Theorem. What is aliasing, and how do anti-aliasing low-pass filters prevent signal distortion during analog-to-digital conversion (ADC)?',
          keywords: ['nyquist', 'sampling theorem', 'aliasing', 'fs >= 2fm', 'adc', 'low-pass filter', 'dsp'],
          followUpTemplates: [
            'What is the difference between analog modulation (AM, FM) and digital modulation (BPSK, QAM)?',
            'How does the Fast Fourier Transform (FFT) reduce time complexity compared to the Discrete Fourier Transform (DFT)?'
          ],
          idealAnswerPoints: [
            'Nyquist Theorem: Continuous-time band-limited signal can be perfectly reconstructed if sampling rate fs >= 2 * fmax',
            'Aliasing: Signal frequency distortion where frequencies above fs/2 fold back into the baseband spectrum as false lower frequencies',
            'Anti-aliasing filter: Analog low-pass filter placed before ADC to attenuate all frequencies exceeding the Nyquist limit (fs/2)'
          ],
          explanation: 'Tests core signal processing and communication systems fundamentals.',
          learningExplanation: 'Sampling below 2*fmax folds higher frequencies back into the audible/usable band, permanently destroying signal integrity. An analog anti-aliasing filter cuts off frequencies above Nyquist prior to sampling to ensure clean digitization.',
          whatToStudyNext: 'Digital filter design: FIR vs IIR filters, and constellation diagrams in QAM.',
          recommendedPracticeQuestion: 'If a human voice signal has maximum frequency component of 3.4 kHz, calculate the minimum theoretical Nyquist sampling rate.'
        }
      );
      break;

    // -------------------------------------------------------------------------
    // EEE (Section 4 of prompt)
    // -------------------------------------------------------------------------
    case 'Electrical & Electronics Engineering':
      list.push(
        {
          id: 'eee_machines_01',
          department: 'Electrical & Electronics Engineering',
          subject: 'Electrical Machines',
          topic: 'Electric Machines & Drives',
          subtopic: 'Transformers & Induction Motors',
          skill: 'Electrical Machines',
          difficulty: 'Beginner',
          questionSource: 'curriculum-foundational',
          questionType: 'conceptual',
          question: 'Explain the working principle of a transformer and why transformers operate on AC but cannot operate on steady DC. What are core losses (hysteresis and eddy current) and copper losses?',
          keywords: ['transformer', 'faraday', 'mutual induction', 'ac vs dc', 'eddy current', 'hysteresis', 'copper losses', 'efficiency'],
          followUpTemplates: [
            'What would happen if a primary winding of a transformer is connected to a DC supply of rated voltage?',
            'Explain the torque-slip characteristics of a 3-phase squirrel cage induction motor.'
          ],
          idealAnswerPoints: [
            'Operates on Faraday law of electromagnetic induction and mutual induction between primary and secondary windings',
            'Requires changing magnetic flux (dPhi/dt); steady DC produces constant flux (dPhi/dt = 0), inducing zero secondary voltage',
            'Applying steady DC causes high current in primary winding (limited only by low winding resistance), causing burnout',
            'Core losses: Hysteresis loss (reversal of magnetic domains) + Eddy current loss (induced circulating currents in laminations)',
            'Copper losses (I^2 * R): Ohmic heating losses in the windings; varies with load'
          ],
          explanation: 'Fundamental electrical machinery question testing electromagnetic principles and losses.',
          learningExplanation: 'Transformers transfer energy magnetically. AC creates a continually alternating magnetic flux that induces EMF in both coils. DC creates static flux, meaning no EMF is induced in the secondary and the primary winding draws massive burning current due to near-zero DC impedance.',
          whatToStudyNext: 'Equivalent circuit of a transformer, open-circuit & short-circuit tests, and VFD motor control.',
          recommendedPracticeQuestion: 'Calculate transformer efficiency given rated kVA = 100 kVA at 0.8 power factor, iron loss = 1 kW, and full-load copper loss = 1.5 kW.'
        },
        {
          id: 'eee_power_electronics_02',
          department: 'Electrical & Electronics Engineering',
          subject: 'Power Electronics & Drives',
          topic: 'Converters & Inverters',
          subtopic: 'DC-DC Converters & Switching',
          skill: 'Power Electronics',
          difficulty: 'Intermediate',
          questionSource: 'curriculum-foundational',
          questionType: 'conceptual',
          question: 'Explain the working of a Buck converter (Step-Down DC-DC converter). How does the duty cycle D determine output voltage, and why are inductors and capacitors essential in switching converters?',
          keywords: ['buck converter', 'duty cycle', 'step down', 'inductor', 'capacitor', 'pwm', 'mosfet', 'ripple'],
          followUpTemplates: [
            'What is the continuous conduction mode (CCM) vs discontinuous conduction mode (DCM) in switching converters?',
            'How does a full-bridge inverter convert DC into AC using Pulse Width Modulation (PWM)?'
          ],
          idealAnswerPoints: [
            'Buck converter steps down DC voltage efficiently using a fast semiconductor switch (MOSFET/IGBT), diode, inductor, and filter capacitor',
            'Relationship in CCM: Vout = D * Vin, where duty cycle D = Ton / (Ton + Toff) (0 <= D <= 1)',
            'Inductor stores energy in magnetic field during Ton and releases energy to load through freewheeling diode during Toff',
            'Capacitor filters voltage ripple to provide smooth DC output'
          ],
          explanation: 'Evaluates solid state power conversion, PWM control, and energy storage element dynamics.',
          learningExplanation: 'Linear regulators burn excess voltage as heat (inefficient). Buck converters switch on/off at high frequency (kHz) and use an LC low-pass filter to average the chopped voltage with 90%+ efficiency, governed by Vout = D * Vin.',
          whatToStudyNext: 'Boost and Buck-Boost topologies, Flyback isolated converters, and IGBT thermal management.',
          recommendedPracticeQuestion: 'Calculate output voltage of a Buck converter with input 24V, switching frequency 50kHz, and duty cycle D = 0.35.'
        },
        {
          id: 'eee_power_systems_control_03',
          department: 'Electrical & Electronics Engineering',
          subject: 'Power Systems & Control',
          topic: 'Power Generation & Transmission',
          subtopic: 'Stability & Faults',
          skill: 'Power Systems',
          difficulty: 'Intermediate',
          questionSource: 'curriculum-foundational',
          questionType: 'conceptual',
          question: 'Explain the different types of symmetrical and unsymmetrical faults in electrical power systems. What is the role of protective relays and circuit breakers in isolating faults?',
          keywords: ['symmetrical fault', 'unsymmetrical fault', 'line to ground', 'three-phase fault', 'relay', 'circuit breaker', 'protection'],
          followUpTemplates: [
            'Why is a 3-phase symmetrical fault the most severe even though Single Line-to-Ground (L-G) is the most frequent?',
            'Explain how a PID controller stabilizes closed-loop feedback systems using Bode plots.'
          ],
          idealAnswerPoints: [
            'Symmetrical fault: 3-phase fault (L-L-L, L-L-L-G); currents remain balanced; most severe fault with highest short-circuit current',
            'Unsymmetrical faults: Single Line-to-Ground (L-G, ~70% of occurrences), Line-to-Line (L-L), Double Line-to-Ground (L-L-G)',
            'Analyzed using Symmetrical Components (positive, negative, zero sequence networks)',
            'Relays sense abnormal currents/voltages and trip signals to circuit breakers',
            'Circuit breakers interrupt short-circuit fault current and extinguish the arc within cycles'
          ],
          explanation: 'Core power engineering topic covering grid resilience, fault analysis, and protection systems.',
          learningExplanation: 'Faults occur due to lightning, insulation breakdown, or equipment failure. Symmetrical components simplify unsymmetrical fault analysis. Protective relays detect overcurrents and command circuit breakers to mechanically open contacts and quench arcs.',
          whatToStudyNext: 'Per-unit system calculations, swing equation, and transient grid stability.',
          recommendedPracticeQuestion: 'Explain why zero-sequence current can only flow in power systems with a grounded neutral.'
        }
      );
      break;

    // -------------------------------------------------------------------------
    // MECHANICAL (Section 4 of prompt)
    // -------------------------------------------------------------------------
    case 'Mechanical Engineering':
      list.push(
        {
          id: 'mech_thermo_01',
          department: 'Mechanical Engineering',
          subject: 'Thermal Engineering',
          topic: 'Thermal & Energy Systems',
          subtopic: 'Thermodynamics & Cycles',
          skill: 'Thermodynamics',
          difficulty: 'Beginner',
          questionSource: 'curriculum-foundational',
          questionType: 'conceptual',
          question: 'State the First and Second Laws of Thermodynamics. What is the significance of the Carnot cycle, and why is 100% thermal efficiency impossible for a heat engine?',
          keywords: ['first law', 'second law', 'carnot cycle', 'kelvin-planck', 'entropy', 'efficiency', 'heat engine', 'thermal'],
          followUpTemplates: [
            'What is the difference between an Otto cycle (petrol) and a Diesel cycle regarding combustion heat addition?',
            'Explain the concept of entropy and why it must increase in irreversible spontaneous processes.'
          ],
          idealAnswerPoints: [
            'First Law: Conservation of energy (Delta U = Q - W); energy cannot be created or destroyed',
            'Second Law (Kelvin-Planck statement): Impossible to construct a heat engine operating in a cycle that absorbs heat from a single reservoir and produces an equivalent amount of work',
            'Second Law (Clausius statement): Impossible to transfer heat from a colder body to a hotter body without external work',
            'Carnot cycle: Reversible theoretical benchmark with maximum possible efficiency: eta = 1 - (Tc / Th)',
            '100% efficiency requires heat sink at absolute zero (Tc = 0 K), which is physically unattainable'
          ],
          explanation: 'Universal mechanical engineering foundation in thermal thermodynamics and power generation.',
          learningExplanation: 'The first law tracks energy quantity; the second law dictates energy quality and direction. The Kelvin-Planck statement guarantees that every heat engine must reject waste heat to a low-temperature sink, bounding maximum efficiency by the Carnot limit.',
          whatToStudyNext: 'Rankine steam power cycles, reheat and regenerative feed heating, and refrigeration vapor compression.',
          recommendedPracticeQuestion: 'Calculate Carnot efficiency of a power plant operating between boiler temperature 550 C and condenser temperature 40 C.'
        },
        {
          id: 'mech_fluid_02',
          department: 'Mechanical Engineering',
          subject: 'Fluid Mechanics',
          topic: 'Fluid Systems & Hydraulics',
          subtopic: 'Flow Regimes & Bernoulli',
          skill: 'Fluid Mechanics',
          difficulty: 'Intermediate',
          questionSource: 'curriculum-foundational',
          questionType: 'conceptual',
          question: 'Explain Bernoulli equation and its underlying assumptions. What is the Reynolds number, and how does it differentiate laminar flow from turbulent flow in pipes?',
          keywords: ['bernoulli', 'reynolds number', 'laminar', 'turbulent', 'incompressible', 'inviscid', 'viscosity', 'pipe flow'],
          followUpTemplates: [
            'What causes major and minor head losses in piping systems according to the Darcy-Weisbach equation?',
            'Explain how a Venturi meter measures volumetric flow rate using Bernoulli principle.'
          ],
          idealAnswerPoints: [
            'Bernoulli Equation: P/rho*g + v^2/2g + z = Constant (Pressure head + Velocity head + Elevation head = Total head)',
            'Assumptions: Steady flow, incompressible fluid, frictionless/inviscid (no viscous losses), flow along a streamline',
            'Reynolds number: Re = (rho * v * D) / mu = Inertial forces / Viscous forces',
            'Internal pipe flow: Re < 2000 is laminar (smooth parallel streamlines); 2000 < Re < 4000 is transitional; Re > 4000 is turbulent (chaotic mixing)'
          ],
          explanation: 'Fundamental fluid dynamics assessing conservation of energy and flow regime characterization.',
          learningExplanation: 'Bernoulli equates mechanical energy along streamlines. For real viscous fluids, friction dissipates energy as head loss (hf). The Reynolds number nondimensionalizes flow, dictating whether viscous damping stabilizes the flow (laminar) or inertial eddies dominate (turbulent).',
          whatToStudyNext: 'Navier-Stokes equations, boundary layer separation, and pump cavitation (NPSH).',
          recommendedPracticeQuestion: 'Calculate Reynolds number for water (rho=1000 kg/m3, mu=0.001 Pa.s) flowing at 2 m/s through a 0.05m diameter pipe.'
        },
        {
          id: 'mech_manufacturing_cad_03',
          department: 'Mechanical Engineering',
          subject: 'Manufacturing & Machine Design',
          topic: 'Manufacturing Processes',
          subtopic: 'Machining, Casting & CAD/CAM',
          skill: 'Manufacturing',
          difficulty: 'Intermediate',
          questionSource: 'curriculum-foundational',
          questionType: 'conceptual',
          question: 'Explain the principles of CNC machining and G-codes/M-codes. What is the difference between traditional subtractive manufacturing (milling/turning) and additive manufacturing (3D printing)?',
          keywords: ['cnc', 'g-code', 'm-code', 'milling', 'turning', 'subtractive', 'additive', '3d printing', 'manufacturing'],
          followUpTemplates: [
            'What is the difference between G00 (rapid positioning) and G01 (linear feed interpolation) in CNC programming?',
            'Explain stress concentration factors and how fillets reduce fatigue failure in mechanical shaft design.'
          ],
          idealAnswerPoints: [
            'CNC (Computer Numerical Control): Automated machine tools guided by programmed alphanumeric instructions',
            'G-codes: Geometric and motion commands (G00 rapid travel, G01 linear cut, G02/G03 circular interpolation)',
            'M-codes: Machine miscellaneous commands (M03 spindle start, M05 spindle stop, M08 coolant on, M30 program end)',
            'Subtractive: Cutting away bulk material via single/multi-point cutting tools (lathe, mill); high strength, waste material',
            'Additive: Building components layer-by-layer from 3D CAD data; excellent for complex internal geometries, less waste'
          ],
          explanation: 'Evaluates modern production engineering, CAD/CAM integration, and manufacturing process selection.',
          learningExplanation: 'G-codes control tool kinematics while M-codes control auxiliary machine functions. Subtractive machining yields high surface finish and structural integrity. Additive manufacturing excels in rapid prototyping and lightweight topological optimization.',
          whatToStudyNext: 'Geometric Dimensioning and Tolerancing (GD&T) datums, and Finite Element Analysis (FEA) mesh convergence.',
          recommendedPracticeQuestion: 'Write a basic 5-line G-code program to position tool at (0,0,5), start spindle clockwise at 1500 RPM, and linear feed cut to (50,0,-2).'
        }
      );
      break;

    // -------------------------------------------------------------------------
    // CIVIL (Section 4 of prompt)
    // -------------------------------------------------------------------------
    case 'Civil Engineering':
      list.push(
        {
          id: 'civil_structures_01',
          department: 'Civil Engineering',
          subject: 'Structural Engineering',
          topic: 'Structural Analysis & Design',
          subtopic: 'Beams, Frames & Limit State',
          skill: 'Structural Engineering',
          difficulty: 'Beginner',
          questionSource: 'curriculum-foundational',
          questionType: 'conceptual',
          question: 'Explain Shear Force and Bending Moment in simply supported beams. What is a point of contraflexure, and what are the principles of Limit State Design (LSM)?',
          keywords: ['shear force', 'bending moment', 'sfd', 'bmd', 'point of contraflexure', 'limit state', 'is 456', 'factor of safety'],
          followUpTemplates: [
            'Where does maximum bending moment occur in a simply supported beam with uniformly distributed load (UDL)?',
            'What is the difference between Limit State of Collapse and Limit State of Serviceability in concrete structures?'
          ],
          idealAnswerPoints: [
            'Shear Force (SF): Algebraic sum of all vertical forces acting on either side of a beam section',
            'Bending Moment (BM): Algebraic sum of moments of all forces about that section; maximum where SF passes through zero',
            'Point of Contraflexure: Point along the beam axis where bending moment changes sign from positive (sagging) to negative (hogging)',
            'Limit State Method (LSM): Modern probabilistic structural design method applying partial safety factors for loads (e.g. 1.5) and material strengths (1.15 steel, 1.5 concrete)'
          ],
          explanation: 'Core structural analysis testing beam behavior, equilibrium equations, and design codes.',
          learningExplanation: 'SFD and BMD determine the required concrete depth and steel reinforcement. The point of contraflexure represents zero bending moment. Limit state design balances safety against collapse (ultimate strength) and serviceability (deflection and crack width limits).',
          whatToStudyNext: 'Moment Distribution Method, slope deflection equations, and seismic shear wall design using ETABS.',
          recommendedPracticeQuestion: 'Calculate the maximum bending moment for a simply supported beam of span L = 6m subjected to a UDL of w = 20 kN/m.'
        },
        {
          id: 'civil_concrete_materials_02',
          department: 'Civil Engineering',
          subject: 'Concrete Technology & Materials',
          topic: 'Reinforced Concrete Design',
          subtopic: 'Concrete Mix & Testing',
          skill: 'Concrete Technology',
          difficulty: 'Intermediate',
          questionSource: 'curriculum-foundational',
          questionType: 'conceptual',
          question: 'Explain the importance of the Water-Cement Ratio in concrete technology according to Abram law. What is the Slump Test, and how do admixtures modify workability?',
          keywords: ['water-cement ratio', 'abrams law', 'compressive strength', 'slump test', 'workability', 'superplasticizer', 'curing'],
          followUpTemplates: [
            'What causes segregation and bleeding in freshly mixed concrete, and how do you prevent them?',
            'Why is 28-day moist curing essential for achieving characteristic compressive strength in concrete?'
          ],
          idealAnswerPoints: [
            'Abram law: Compressive strength of fully compacted concrete is inversely proportional to water-cement ratio (w/c)',
            'Lower w/c ratio yields higher strength and durability, but reduces workability',
            'Slump test measures consistency and workability (true slump, shear slump, collapse slump) using a standard frustum cone',
            'Superplasticizers/water reducers disperse cement grains electrostatically, increasing workability without adding excess water'
          ],
          explanation: 'Evaluates materials engineering, field testing methodology, and concrete mix optimization.',
          learningExplanation: 'Excess water evaporates leaving porous capillary voids that degrade compressive strength and increase permeability to corrosion. Superplasticizers enable low w/c ratios (0.35 - 0.45) while maintaining pumpable workability.',
          whatToStudyNext: 'Concrete mix design IS 10262, non-destructive testing (Rebound hammer, UPV), and durability in marine environments.',
          recommendedPracticeQuestion: 'Explain what concrete grade M25 means (characteristic strength) and calculate target mean strength using standard deviation.'
        },
        {
          id: 'civil_geotech_survey_03',
          department: 'Civil Engineering',
          subject: 'Geotechnical & Surveying',
          topic: 'Geotechnical Engineering',
          subtopic: 'Soil Bearing Capacity & Surveying',
          skill: 'Geotechnical Engineering',
          difficulty: 'Intermediate',
          questionSource: 'curriculum-foundational',
          questionType: 'conceptual',
          question: 'Explain Terzaghi Bearing Capacity theory for shallow foundations. In surveying, how does a Total Station measure electronic distance (EDM) and coordinates (X, Y, Z)?',
          keywords: ['terzaghi', 'bearing capacity', 'shallow foundation', 'soil shear', 'total station', 'edm', 'surveying', 'leveling'],
          followUpTemplates: [
            'What is the difference between general shear failure, local shear failure, and punching shear failure in soils?',
            'How does closed traverse balancing work using Bowditch rule?'
          ],
          idealAnswerPoints: [
            'Terzaghi equation: qu = c*Nc + gamma*D*Nq + 0.5*gamma*B*Ngamma (Cohesion + Surcharge depth + Footing width)',
            'Bearing capacity depends on soil cohesion c, unit weight gamma, footing dimensions B and D, and dimensionless factors Nc, Nq, Ngamma based on friction angle phi',
            'Total Station: Combines electronic theodolite (horizontal/vertical angles) and EDM (infrared laser phase shift for slope distance) with onboard microprocessor',
            'Automatically calculates 3D Cartesian coordinates (Northing, Easting, Elevation) via trigonometry'
          ],
          explanation: 'Combines foundation soil mechanics with modern digital geospatial surveying instrumentation.',
          learningExplanation: 'Terzaghi formula models failure wedges beneath a strip footing. A Total Station replaces traditional theodolites and chains by pulsing modulated infrared signals to a retroreflector prism to calculate millimeter-accurate coordinates.',
          whatToStudyNext: 'Standard Penetration Test (SPT), soil settlement analysis, and GIS integration.',
          recommendedPracticeQuestion: 'Calculate ultimate bearing capacity of a strip footing in pure cohesive clay (c = 40 kN/m2, phi = 0, Nc = 5.7).'
        }
      );
      break;

    // -------------------------------------------------------------------------
    // AUTOMOBILE (Section 4 of prompt)
    // -------------------------------------------------------------------------
    case 'Automobile Engineering':
      list.push(
        {
          id: 'auto_ic_engines_01',
          department: 'Automobile Engineering',
          subject: 'Automotive Powertrain',
          topic: 'Internal Combustion Engines',
          subtopic: '4-Stroke Cycles & Injection',
          skill: 'IC Engines',
          difficulty: 'Beginner',
          questionSource: 'curriculum-foundational',
          questionType: 'conceptual',
          question: 'Explain the 4-stroke cycle (Suction, Compression, Power, Exhaust) in Spark Ignition (SI) and Compression Ignition (CI) engines. What is the purpose of Valve Overlap in the Valve Timing Diagram?',
          keywords: ['4-stroke', 'si engine', 'ci engine', 'otto', 'diesel', 'valve timing', 'valve overlap', 'injection'],
          followUpTemplates: [
            'Why do diesel (CI) engines operate at higher compression ratios (16:1 - 22:1) compared to petrol (SI) engines (8:1 - 12:1)?',
            'What is Common Rail Direct Injection (CRDi) in modern automotive diesel engines?'
          ],
          idealAnswerPoints: [
            '4 strokes: Suction (piston moves down, draws charge), Compression (piston moves up, compresses charge), Power (combustion drives piston down), Exhaust (piston pushes burnt gases out)',
            'SI uses petrol + air mixture ignited by spark plug; CI compresses air only, injecting diesel that auto-ignites from high air temperature',
            'Valve Overlap: Period when both inlet valve and exhaust valve remain simultaneously open near Top Dead Center (TDC)',
            'Benefits of overlap: Incoming fresh charge scavenges remaining exhaust gases and cools the combustion chamber'
          ],
          explanation: 'Core internal combustion engine kinematics, fuel ignition mechanisms, and gas exchange dynamics.',
          learningExplanation: 'In SI engines, compression ratio is limited by knocking/pre-ignition. In CI engines, only air is compressed, permitting high compression ratios that trigger spontaneous combustion upon fuel atomization. Valve overlap utilizes exhaust gas inertia to draw in fresh charge.',
          whatToStudyNext: 'Turbochargers with intercoolers, variable valve timing (VVT), and Euro 6 / BS6 emissions aftertreatment (SCR, DPF).',
          recommendedPracticeQuestion: 'Sketch a simplified valve timing diagram for a 4-stroke petrol engine showing IVO, IVC, EVO, and EVC.'
        },
        {
          id: 'auto_transmission_diff_02',
          department: 'Automobile Engineering',
          subject: 'Automotive Drivetrain',
          topic: 'Automotive Drivetrain',
          subtopic: 'Gearbox & Differentials',
          skill: 'Transmission Systems',
          difficulty: 'Intermediate',
          questionSource: 'curriculum-foundational',
          questionType: 'conceptual',
          question: 'Explain the working of a mechanical Differential in automotive drivetrains. Why is a differential necessary when a vehicle negotiates a turn, and what is a Limited Slip Differential (LSD)?',
          keywords: ['differential', 'drivetrain', 'pinion', 'crown wheel', 'sun gear', 'turning radius', 'lsd', 'traction'],
          followUpTemplates: [
            'What is the drawback of an open differential when one wheel is on ice and the other is on dry pavement?',
            'How does a Continuously Variable Transmission (CVT) achieve infinite gear ratios compared to a stepped manual gearbox?'
          ],
          idealAnswerPoints: [
            'When negotiating a turn, the outside wheel traverses a larger radius arc than the inside wheel and must rotate faster',
            'Differential splits propeller shaft torque evenly between drive axles while permitting them to rotate at different speeds',
            'Key components: Crown wheel, drive pinion, differential cage, spider pinion gears, and side sun gears',
            'Open differential drawback: Directs all torque to the wheel with least traction (spins on ice while dry wheel gets zero drive)',
            'Limited Slip Differential (LSD): Uses clutches or helical gears to lock axles partially, transferring torque to the wheel with traction'
          ],
          explanation: 'Evaluates drivetrain kinematics, torque distribution, and vehicle handling mechanics.',
          learningExplanation: 'Without a differential, both drive wheels would be locked at equal speeds, forcing the inner tire to scrub and slip across the road during cornering. LSDs solve the open differential zero-traction flaw by mechanically locking wheels under slip.',
          whatToStudyNext: 'Dual-clutch transmissions (DCT), epicyclic planetary gear sets, and torque-vectoring electronic differentials.',
          recommendedPracticeQuestion: 'Calculate the speed of the outer wheel if crown wheel rotates at 600 RPM and the inner wheel rotates at 500 RPM.'
        },
        {
          id: 'auto_ev_brakes_03',
          department: 'Automobile Engineering',
          subject: 'EV & Active Chassis Systems',
          topic: 'Electric Vehicles & Energy Storage',
          subtopic: 'EV Powertrain & ABS',
          skill: 'Electric Vehicles & ABS',
          difficulty: 'Intermediate',
          questionSource: 'curriculum-foundational',
          questionType: 'conceptual',
          question: 'Explain the working of an Anti-lock Braking System (ABS) and regenerative braking in Electric Vehicles (EV). How does the Battery Management System (BMS) protect lithium-ion battery packs?',
          keywords: ['abs', 'hydraulic modulator', 'wheel speed sensor', 'regenerative braking', 'ev', 'bms', 'traction inverter'],
          followUpTemplates: [
            'How does ABS modulate brake fluid pressure to maintain steering control during panic braking?',
            'What is cell balancing in a Lithium-ion Battery Management System, and why is thermal runaway dangerous?'
          ],
          idealAnswerPoints: [
            'ABS: Prevents wheel lock-up during severe braking using wheel speed sensors, electronic control unit (ECU), and hydraulic modulator valves (apply, hold, release cycles)',
            'Maintains steering control and minimizes braking distance on slippery surfaces',
            'Regenerative braking: Traction electric motor operates as a generator during deceleration, converting kinetic energy into electrical energy stored in the battery',
            'BMS (Battery Management System): Monitors individual cell voltages, state of charge (SoC), state of health (SoH), temperature, performs active/passive cell balancing, and prevents overcharging/overdischarging'
          ],
          explanation: 'Modern automotive safety and electric vehicle powertrain engineering assessment.',
          learningExplanation: 'A locked skidding tire loses directional steering stability. ABS pulses hydraulic calipers up to 15 times/sec to maintain optimal slip ratio (~15-20%). In EVs, the traction motor reverses torque to generate electricity before hydraulic friction brakes engage. BMS prevents catastrophic thermal runaway.',
          whatToStudyNext: 'Permanent Magnet Synchronous Motors (PMSM) vs Induction traction motors, and Electronic Stability Control (ESC).',
          recommendedPracticeQuestion: 'Explain why passive cell balancing in a battery pack uses shunt resistors to dissipate excess voltage as heat.'
        }
      );
      break;

    // -------------------------------------------------------------------------
    // CSE / IT (Default)
    // -------------------------------------------------------------------------
    default:
      const effectiveDept: EngineeringDepartment = department === 'Information Technology'
        ? 'Information Technology'
        : 'Computer Science & Engineering';

      list.push(
        {
          id: `${effectiveDept === 'Information Technology' ? 'it' : 'cs'}_dsa_trees_01`,
          department: effectiveDept,
          subject: 'Data Structures & Algorithms',
          topic: 'Core Computer Science',
          subtopic: 'Trees, Graphs & Binary Search',
          skill: 'Data Structures',
          difficulty: 'Intermediate',
          questionSource: 'curriculum-foundational',
          questionType: 'conceptual',
          question: 'Explain the difference between a Binary Search Tree (BST) and a self-balancing AVL/Red-Black Tree. What is the worst-case time complexity of an un-balanced BST, and how does balancing prevent degradation?',
          keywords: ['bst', 'binary search tree', 'avl', 'red-black tree', 'o(log n)', 'o(n)', 'rotations', 'height'],
          followUpTemplates: [
            'What are left and right tree rotations, and how do they rebalance an AVL tree in O(1) time?',
            'Why does the Java HashMap implementation switch from linked lists to Red-Black Trees when a bucket exceeds 8 nodes?'
          ],
          idealAnswerPoints: [
            'BST property: Left child < parent <= right child',
            'Unbalanced BST worst-case: O(n) lookup time when inserted in sorted order (degenerates into a linked list)',
            'AVL Tree: Strictly balanced where height difference between left and right subtrees (balance factor) is at most 1; guarantees O(log n) search',
            'Red-Black Tree: Loosely balanced using node colors (red/black) and black-height constraints; fewer rotations during frequent inserts/deletes'
          ],
          explanation: 'Core computer science assessment on tree traversal, time complexity, and balancing rotations.',
          learningExplanation: 'A standard BST degrades to O(n) if items are inserted sequentially. Self-balancing trees (AVL and Red-Black) maintain height at O(log n) through local pointer rotations, ensuring fast predictable operations.',
          whatToStudyNext: 'Tries for string prefix search, and B-Trees for database disk block indexing.',
          recommendedPracticeQuestion: 'Walk through an AVL tree insertion of [10, 20, 30] and demonstrate the Left-Left (LL) rotation.'
        },
        {
          id: `${effectiveDept === 'Information Technology' ? 'it' : 'cs'}_networks_protocols_02`,
          department: effectiveDept,
          subject: 'Computer Networks',
          topic: 'Networking & Protocols',
          subtopic: 'TCP/IP & Web Protocols',
          skill: 'Computer Networks',
          difficulty: 'Intermediate',
          questionSource: 'curriculum-foundational',
          questionType: 'conceptual',
          question: 'Explain the TCP 3-Way Handshake (SYN, SYN-ACK, ACK) and 4-Way Connection Termination. How does TCP guarantee reliability compared to UDP?',
          keywords: ['tcp', 'udp', '3-way handshake', 'syn', 'ack', 'flow control', 'congestion control', 'reliability'],
          followUpTemplates: [
            'What is the difference between TCP Flow Control (Sliding Window) and Congestion Control (Slow Start, Congestion Avoidance)?',
            'Why does DNS or video streaming prefer UDP over TCP?'
          ],
          idealAnswerPoints: [
            'TCP 3-Way Handshake: Client sends SYN -> Server responds SYN-ACK -> Client sends ACK; establishes sequence numbers',
            'Termination: 4-Way handshake (FIN -> ACK -> FIN -> ACK) allowing bidirectional half-close',
            'TCP Reliability: Sequence numbers, cumulative acknowledgments, retransmission timeouts (RTO), and checksums',
            'UDP: Connectionless, lightweight, zero retransmissions or handshakes, prioritizing low latency over reliability'
          ],
          explanation: 'Standard networking foundation testing transport layer protocols and transmission mechanics.',
          learningExplanation: 'TCP provides an ordered, reliable byte stream over an unreliable IP network through explicit handshakes, sequence numbers, and sliding-window flow control. UDP omits guarantees for minimal overhead.',
          whatToStudyNext: 'TLS/HTTPS handshake, HTTP/2 multiplexing, and HTTP/3 QUIC protocol over UDP.',
          recommendedPracticeQuestion: 'Explain what happens under the hood in the network when you type https://www.google.com in a web browser.'
        }
      );
      break;
  }

  return list;
}

// =============================================================================
// 6. MAIN ORCHESTRATOR: MATCH & ASSEMBLE TECHNICAL QUESTIONS
// =============================================================================

export function assembleTechnicalQuestions(
  extractedNLP: ExtractedResumeNLP,
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced',
  questionCount: number = 4
): DatasetQuestion[] {
  const department = extractedNLP.effectiveDepartment;
  const assembled: DatasetQuestion[] = [];
  const seenQuestionSignatures = new Set<string>();

  function addQuestion(q: DatasetQuestion): boolean {
    const signature = `${q.skill.toLowerCase()}:${q.question.toLowerCase().slice(0, 40)}`;
    if (seenQuestionSignatures.has(signature)) return false;
    seenQuestionSignatures.add(signature);
    assembled.push(q);
    return true;
  }

  // PASS 1: Generate questions for actual skills in resume
  // (Python, JavaScript, SQL, Flask, React, Git, etc.)
  for (const skill of extractedNLP.extractedSkills) {
    const skillQs = getSkillSpecificQuestions(skill, department, difficulty);
    for (const q of skillQs) {
      if (assembled.length >= questionCount) break;
      addQuestion(q);
    }
  }

  // PASS 2: Add Project-based questions if projects exist
  if (assembled.length < questionCount && extractedNLP.projectsList?.length > 0) {
    const projQs = generateProjectQuestions(extractedNLP.projectsList, department, difficulty);
    for (const q of projQs) {
      if (assembled.length >= questionCount) break;
      addQuestion(q);
    }
  }

  // PASS 3: Add Internship-based questions if internships exist
  if (assembled.length < questionCount && extractedNLP.internshipsList?.length > 0) {
    const internQs = generateInternshipQuestions(extractedNLP.internshipsList, department, difficulty);
    for (const q of internQs) {
      if (assembled.length >= questionCount) break;
      addQuestion(q);
    }
  }

  // PASS 4: Add Certification-based questions if certifications exist
  if (assembled.length < questionCount && extractedNLP.certificationsList?.length > 0) {
    const certQs = generateCertificationQuestions(extractedNLP.certificationsList, department, difficulty);
    for (const q of certQs) {
      if (assembled.length >= questionCount) break;
      addQuestion(q);
    }
  }

  // PASS 5: Complete question set with Department Core Curriculum questions
  if (assembled.length < questionCount) {
    const foundationalQs = getCurriculumFoundationalQuestions(department, difficulty);
    for (const q of foundationalQs) {
      if (assembled.length >= questionCount) break;
      addQuestion(q);
    }
  }

  return assembled;
}

// =============================================================================
// 7. DYNAMIC QUESTION SYNTHESIZER FOR ARBITRARY OR NICHE SKILLS
// =============================================================================

export function synthesizeDynamicQuestion(
  topicOrSkill: string,
  department: EngineeringDepartment,
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced',
  seedIndex: number = 1
): DatasetQuestion {
  const cleanSkill = topicOrSkill.trim();
  const safeId = `synth_${department.slice(0, 4).toLowerCase()}_${cleanSkill.replace(/\W+/g, '_').toLowerCase()}_s${seedIndex}_${Math.floor(Math.random() * 10000)}`;

  // Determine realistic question subtopics based on department and skill
  let subtopic = 'Engineering Architecture & Trade-offs';
  let questionType: QuestionType = 'practical';
  let question = `When designing an engineering system utilizing ${cleanSkill}, what are the primary architectural trade-offs, scalability constraints, and failure modes you must anticipate? Explain how you test and verify system reliability under peak load conditions.`;
  let idealAnswerPoints = [
    `Detailed explanation of how ${cleanSkill} integrates into the broader ${department} system architecture`,
    'Identification of primary performance bottlenecks (e.g. latency, thermal dissipation, memory constraints, bandwidth)',
    'Practical failure recovery strategies: graceful degradation, fault isolation, and logging telemetry',
    'Verification methodologies: unit testing, boundary analysis, or simulation modeling'
  ];
  let referenceAnswer = `In a production ${department} setup, utilizing ${cleanSkill} requires balancing throughput, resource utilization, and reliability. First, isolate critical paths with monitoring; second, implement timeouts and retries with backoff; third, test edge cases under simulated high-load conditions.`;
  let exampleSolution = `// Production Implementation Guideline for ${cleanSkill}:\n// 1. Validate inputs and enforce contract boundary constraints\n// 2. Encapsulate resource lifecycle with deterministic cleanup\n// 3. Monitor metrics: latency, error rate, and throughput\n`;

  if (department === 'Computer Science & Engineering' || department === 'Information Technology') {
    if (seedIndex % 2 === 0) {
      questionType = 'problem-solving';
      question = `In the context of ${cleanSkill}, describe a common production bug, memory leak, or concurrency issue. What root-cause analysis techniques would you employ, and what architectural pattern prevents this bug from recurring?`;
      subtopic = 'Debugging, Root-Cause Analysis & Concurrency';
    } else {
      questionType = 'conceptual';
      question = `Explain the internal working and core performance characteristics of ${cleanSkill}. How does it manage state or persistence, and what are its asymptotic time and space complexities during high-throughput operations?`;
      subtopic = 'Internal Mechanics & Algorithmic Complexity';
    }
  } else if (department === 'Electronics & Communication Engineering') {
    questionType = 'practical';
    question = `Regarding ${cleanSkill} in embedded and electronic design: How do you handle signal integrity, power distribution network (PDN) impedance, and thermal dissipation on a multi-layer board? What test instrumentation would you use to measure transient noise?`;
    subtopic = 'Signal Integrity & Hardware Testing';
    exampleSolution = `Oscilloscope setup with 50-ohm termination, differential active probe at IC power pins, checking ripple V_pp < 50mV under dynamic load step.`;
  } else if (department === 'Mechanical Engineering') {
    questionType = 'practical';
    question = `In mechanical design utilizing ${cleanSkill}: How do you perform stress analysis and account for dynamic fatigue loading? What safety factor would you apply, and how do manufacturing tolerances (GD&T) influence physical assembly?`;
    subtopic = 'Stress Analysis & Manufacturing Tolerances';
    exampleSolution = `Apply Von Mises distortion energy theory for ductile components. Determine endurance limit Se = 0.5 * Sut * ka * kb * kc. Ensure safety factor n = Se / sigma_a >= 1.5.`;
  } else if (department === 'Civil Engineering') {
    questionType = 'practical';
    question = `For structural and construction engineering projects involving ${cleanSkill}: What limit state criteria and building code provisions govern structural stability? How do you assess environmental durability and soil-structure interaction?`;
    subtopic = 'Structural Stability & Code Compliance';
    exampleSolution = `Check Limit State of Collapse (flexure, shear, compression) with material factors gamma_c = 1.5, gamma_s = 1.15, and verify Limit State of Serviceability (deflection < span/250, crack width < 0.3mm).`;
  } else if (department === 'Electrical & Electronics Engineering') {
    questionType = 'practical';
    question = `In electrical power and drive applications of ${cleanSkill}: How do you optimize efficiency, mitigate harmonic distortion (THD), and protect switches or motor windings against transient overvoltage spikes?`;
    subtopic = 'Harmonics, Protection & Efficiency';
    exampleSolution = `Install passive LC or active power filters to maintain THD < 5% per IEEE 519. Utilize snubber circuits and TVS diodes across power switches to clamp dV/dt inductive kickback.`;
  } else if (department === 'Automobile Engineering') {
    questionType = 'practical';
    question = `In automotive powertrain and chassis systems involving ${cleanSkill}: How do you balance dynamic handling, fuel/battery efficiency, and passenger safety under extreme operating environments?`;
    subtopic = 'Vehicle Dynamics & Powertrain Integration';
    exampleSolution = `Utilize CAN bus telemetry at 500 kbps to coordinate traction motor torque requests, regenerative braking blending, and electronic stability control (ESC).`;
  }

  return {
    id: safeId,
    department,
    subject: `${department} Professional Practice`,
    topic: 'Continuous Technical Practice',
    subtopic,
    skill: cleanSkill,
    difficulty,
    questionSource: 'resume-skill',
    questionType,
    question,
    keywords: [cleanSkill.toLowerCase(), 'trade-offs', 'architecture', 'efficiency', 'reliability', 'design'],
    followUpTemplates: [
      `What automated testing or diagnostic telemetry would you establish to detect degradation in ${cleanSkill}?`,
      `If you had to scale ${cleanSkill} for a 10x larger operational capacity, what would you redesign first?`
    ],
    idealAnswerPoints,
    explanation: `Assesses practical engineering judgment, design trade-offs, and failure prevention in ${cleanSkill}.`,
    learningExplanation: `Mastery of ${cleanSkill} requires understanding its limitations, fault recovery strategies, and operational parameters in real engineering systems.`,
    whatToStudyNext: `Advanced system design, boundary stress testing, and industry standards for ${cleanSkill}.`,
    recommendedPracticeQuestion: `Draft an engineering calculation or architecture flow diagram for ${cleanSkill}.`,
    referenceAnswer,
    exampleSolution
  };
}

// =============================================================================
// 8. PRACTICE SET ENGINE: EXACTLY 4 BALANCED, UNIQUE QUESTIONS PER SET
// =============================================================================

export function generateSetOfFourQuestions(
  extractedNLP: ExtractedResumeNLP,
  history: QuestionHistoryEntry[],
  setNumber: number,
  targetDifficulty: 'Beginner' | 'Intermediate' | 'Advanced'
): DatasetQuestion[] {
  const department = extractedNLP.effectiveDepartment;
  const selectedSet: DatasetQuestion[] = [];

  // Helper to test if a question is duplicate
  const tryAddQuestion = (q: DatasetQuestion): boolean => {
    if (!q) return false;
    const dupCheck = isQuestionDuplicate(q, history, selectedSet);
    if (!dupCheck.isDuplicate) {
      selectedSet.push(q);
      return true;
    }
    return false;
  };

  // 1. Gather all potential candidate sources
  // A. Curated Department Pool
  const departmentPool = [...(DEPARTMENT_QUESTION_POOLS[department] || [])];
  
  // B. Curriculum Foundational Questions
  const foundationalPool = getCurriculumFoundationalQuestions(department, targetDifficulty);

  // C. Skill Specific Questions for candidate's extracted skills
  const resumeSkillPool: DatasetQuestion[] = [];
  for (const sk of extractedNLP.extractedSkills) {
    const sQs = getSkillSpecificQuestions(sk, department, targetDifficulty);
    resumeSkillPool.push(...sQs);
  }

  // D. Project Questions
  const projectPool = extractedNLP.projectsList?.length > 0
    ? generateProjectQuestions(extractedNLP.projectsList, department, targetDifficulty)
    : [];

  // E. Internship Questions
  const internshipPool = extractedNLP.internshipsList?.length > 0
    ? generateInternshipQuestions(extractedNLP.internshipsList, department, targetDifficulty)
    : [];

  // F. Certification Questions
  const certPool = extractedNLP.certificationsList?.length > 0
    ? generateCertificationQuestions(extractedNLP.certificationsList, department, targetDifficulty)
    : [];

  // ---------------------------------------------------------------------------
  // BALANCED DISTRIBUTION (Requirement 6 of Prompt):
  // Slot 1: Coding Problem OR Practical Numerical / Calculation / Troubleshooting
  // Slot 2: SQL / Circuit / System Architecture / Design Scenario
  // Slot 3: Department Core Fundamental (DSA, OS, Networks, VLSI, Thermo, Structures)
  // Slot 4: Resume-driven Skill / Project / Internship / Certification / AI-ML
  // ---------------------------------------------------------------------------

  // --- SLOT 1: Coding / Algorithm / Practical Numerical ---
  const slot1Candidates = [
    ...departmentPool.filter(q => q.questionType === 'coding' || q.questionType === 'practical'),
    ...resumeSkillPool.filter(q => q.questionType === 'coding' || q.questionType === 'practical'),
    ...foundationalPool.filter(q => q.questionType === 'coding' || q.questionType === 'practical')
  ];
  // Rotate candidate index based on setNumber
  const slot1Offset = (setNumber - 1) % Math.max(1, slot1Candidates.length);
  const orderedSlot1 = [...slot1Candidates.slice(slot1Offset), ...slot1Candidates.slice(0, slot1Offset)];

  for (const cand of orderedSlot1) {
    if (selectedSet.length >= 1) break;
    tryAddQuestion(cand);
  }

  // Fallback for Slot 1 if empty
  if (selectedSet.length === 0 && slot1Candidates.length > 0) {
    for (const cand of slot1Candidates) {
      if (tryAddQuestion(cand)) break;
    }
  }

  // --- SLOT 2: SQL / Circuits / System Architecture / Database ---
  const slot2Candidates = [
    ...departmentPool.filter(q => q.questionType === 'sql' || q.topic.includes('Database') || q.topic.includes('Circuit') || q.topic.includes('Powertrain') || q.topic.includes('Manufacturing')),
    ...resumeSkillPool.filter(q => q.topic.includes('Database') || q.topic.includes('Circuit') || q.questionType === 'sql'),
    ...foundationalPool.filter(q => q.topic.includes('Database') || q.topic.includes('Power') || q.topic.includes('Thermodynamics'))
  ];
  const slot2Offset = (setNumber - 1) % Math.max(1, slot2Candidates.length);
  const orderedSlot2 = [...slot2Candidates.slice(slot2Offset), ...slot2Candidates.slice(0, slot2Offset)];

  for (const cand of orderedSlot2) {
    if (selectedSet.length >= 2) break;
    tryAddQuestion(cand);
  }

  // --- SLOT 3: Department Core Subject Fundamentals ---
  const slot3Candidates = [
    ...foundationalPool.filter(q => q.questionSource === 'curriculum-foundational' || q.topic.includes('Core')),
    ...departmentPool,
    ...resumeSkillPool
  ];
  const slot3Offset = ((setNumber - 1) * 2) % Math.max(1, slot3Candidates.length);
  const orderedSlot3 = [...slot3Candidates.slice(slot3Offset), ...slot3Candidates.slice(0, slot3Offset)];

  for (const cand of orderedSlot3) {
    if (selectedSet.length >= 3) break;
    tryAddQuestion(cand);
  }

  // --- SLOT 4: Resume Skills / Projects / Internships / Certifications / AI-ML ---
  const slot4Candidates = [
    ...projectPool,
    ...internshipPool,
    ...certPool,
    ...resumeSkillPool,
    ...departmentPool
  ];
  const slot4Offset = (setNumber - 1) % Math.max(1, slot4Candidates.length);
  const orderedSlot4 = [...slot4Candidates.slice(slot4Offset), ...slot4Candidates.slice(0, slot4Offset)];

  for (const cand of orderedSlot4) {
    if (selectedSet.length >= 4) break;
    tryAddQuestion(cand);
  }

  // --- PASS 2: If we still have fewer than 4 questions, sweep all pools ---
  const allAvailable = [
    ...departmentPool,
    ...resumeSkillPool,
    ...foundationalPool,
    ...projectPool,
    ...internshipPool,
    ...certPool
  ];

  for (const cand of allAvailable) {
    if (selectedSet.length >= 4) break;
    tryAddQuestion(cand);
  }

  // --- PASS 3: Dynamic Synthesis Guarantee ---
  // If the question pool ran low or all questions were exhausted by prior sets,
  // dynamically synthesize high-quality, validated, non-duplicate questions
  let synthCounter = 1;
  const candidateTopics = [
    ...extractedNLP.extractedSkills,
    'Core Engineering System Design',
    'Performance Optimization & Testing',
    'Failure Mode Analysis & Safety',
    'Modern Tooling & Frameworks',
    'Algorithm Design & Concurrency'
  ];

  while (selectedSet.length < 4) {
    const topicToSynth = candidateTopics[(setNumber + synthCounter) % candidateTopics.length];
    const syntheticQ = synthesizeDynamicQuestion(topicToSynth, department, targetDifficulty, setNumber * 10 + synthCounter);
    
    // Check duplicate just in case
    if (!tryAddQuestion(syntheticQ)) {
      // Force unique ID if collision
      syntheticQ.id = `${syntheticQ.id}_uniq_${synthCounter}`;
      syntheticQ.question = `[Set ${setNumber} Practice] ${syntheticQ.question}`;
      selectedSet.push(syntheticQ);
    }
    synthCounter++;
  }

  return selectedSet.slice(0, 4);
}
