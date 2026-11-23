import { DatasetQuestion, EngineeringDepartment } from './types';

/**
 * Curated Department-Specific Technical Question Dataset
 * Comprehensive question bank covering all 7 engineering departments:
 * 1. Computer Science & Engineering (CSE)
 * 2. Information Technology (IT)
 * 3. Electronics & Communication Engineering (ECE)
 * 4. Electrical & Electronics Engineering (EEE)
 * 5. Mechanical Engineering
 * 6. Civil Engineering
 * 7. Automobile Engineering
 */
export const DEPARTMENT_QUESTION_POOLS: Record<EngineeringDepartment, DatasetQuestion[]> = {
  // ===========================================================================
  // 1. COMPUTER SCIENCE & ENGINEERING (CSE)
  // ===========================================================================
  'Computer Science & Engineering': [
    // --- Coding / DSA Problems ---
    {
      id: 'cse_dsa_valid_parentheses_01',
      department: 'Computer Science & Engineering',
      subject: 'Data Structures & Algorithms',
      topic: 'Core Computer Science',
      subtopic: 'Stacks & String Parsing',
      skill: 'Data Structures',
      difficulty: 'Beginner',
      questionType: 'coding',
      question: 'Implement an algorithm to determine if an input string containing characters \'(\', \')\', \'{\', \'}\', \'[\' and \']\' is valid. Brackets must close in the correct order and match corresponding types.',
      keywords: ['stack', 'parentheses', 'brackets', 'o(n)', 'lifo', 'parsing', 'data structures'],
      followUpTemplates: [
        'How would you adapt this algorithm if the string also contains arithmetic expressions like "(a + [b * c])"?',
        'What is the worst-case space complexity if all brackets are opening brackets (e.g. "((((((")?'
      ],
      idealAnswerPoints: [
        'Initialize an empty stack to track unmatched opening brackets',
        'Map each closing bracket to its corresponding opening bracket',
        'For each character: if opening, push to stack; if closing, pop from stack and check matching type',
        'Return true if and only if stack is empty after iterating through entire string',
        'Time Complexity: O(n) linear pass; Space Complexity: O(n) auxiliary stack'
      ],
      explanation: 'Classic stack evaluation testing LIFO order, bracket balance, and linear time complexity.',
      learningExplanation: 'Stacks enforce Last-In-First-Out (LIFO). When you see an opening bracket, push it. When you see a closing bracket, it MUST match the most recently opened bracket on top of the stack. If the stack is empty when a closing bracket arrives, or doesn\'t match, it is invalid.',
      whatToStudyNext: 'Monotonic stack problems (e.g. Next Greater Element, Daily Temperatures).',
      recommendedPracticeQuestion: 'Implement Min-Stack supporting push, pop, top, and retrieving the minimum element in O(1) time.',
      referenceAnswer: 'Use a stack: push opening brackets; for closing brackets, check if stack is non-empty and top matches; return stack.isEmpty() at the end.',
      exampleSolution: `function isValid(s) {\n  const stack = [];\n  const map = { ')': '(', '}': '{', ']': '[' };\n  for (const char of s) {\n    if (char in map) {\n      if (stack.length === 0 || stack.pop() !== map[char]) return false;\n    } else {\n      stack.push(char);\n    }\n  }\n  return stack.length === 0;\n}`,
      codingProblem: {
        title: 'Valid Parentheses',
        description: 'Given a string `s` containing just the characters `(`, `)`, `{`, `}`, `[` and `]`, determine if the input string is valid.\n\nAn input string is valid if open brackets are closed by the same type of brackets in the correct order.',
        defaultLanguage: 'javascript',
        starterCodes: {
          javascript: `function isValid(s) {\n  // TODO: Implement O(n) stack solution\n  const stack = [];\n  const pairs = { ')': '(', '}': '{', ']': '[' };\n  for (let c of s) {\n    if (c in pairs) {\n      if (stack.pop() !== pairs[c]) return false;\n    } else {\n      stack.push(c);\n    }\n  }\n  return stack.length === 0;\n}`,
          python: `def is_valid(s: str) -> bool:\n    # TODO: Implement stack validation\n    stack = []\n    mapping = {")": "(", "}": "{", "]": "["}\n    for char in s:\n        if char in mapping:\n            top = stack.pop() if stack else '#'\n            if mapping[char] != top:\n                return False\n        else:\n            stack.append(char)\n    return not stack`,
          cpp: `#include <string>\n#include <stack>\n\nbool isValid(std::string s) {\n    std::stack<char> st;\n    for (char c : s) {\n        if (c == '(' || c == '{' || c == '[') st.push(c);\n        else {\n            if (st.empty()) return false;\n            char top = st.top(); st.pop();\n            if (c == ')' && top != '(') return false;\n            if (c == '}' && top != '{') return false;\n            if (c == ']' && top != '[') return false;\n        }\n    }\n    return st.empty();\n}`,
          java: `import java.util.Stack;\n\npublic class Solution {\n    public boolean isValid(String s) {\n        Stack<Character> stack = new Stack<>();\n        for (char c : s.toCharArray()) {\n            if (c == '(' || c == '{' || c == '[') stack.push(c);\n            else {\n                if (stack.isEmpty()) return false;\n                char top = stack.pop();\n                if (c == ')' && top != '(') return false;\n                if (c == '}' && top != '{') return false;\n                if (c == ']' && top != '[') return false;\n            }\n        }\n        return stack.isEmpty();\n    }\n}`
        },
        testCases: [
          { id: 'tc1', input: '"()"', expectedOutput: 'true', explanation: 'Matching simple parentheses' },
          { id: 'tc2', input: '"()[]{}"', expectedOutput: 'true', explanation: 'All pairs properly closed' },
          { id: 'tc3', input: '"(]"', expectedOutput: 'false', explanation: 'Mismatched types' },
          { id: 'tc4', input: '"([)]"', expectedOutput: 'false', explanation: 'Wrong closing order' }
        ]
      }
    },
    {
      id: 'cse_dsa_reverse_linkedlist_02',
      department: 'Computer Science & Engineering',
      subject: 'Data Structures & Algorithms',
      topic: 'Core Computer Science',
      subtopic: 'Pointers & Singly Linked Lists',
      skill: 'Data Structures',
      difficulty: 'Intermediate',
      questionType: 'coding',
      question: 'Given the head of a singly linked list, reverse the list in-place in O(n) time and O(1) auxiliary space, and return the new head.',
      keywords: ['linked list', 'pointers', 'in-place', 'reverse', 'o(1) space', 'o(n) time'],
      followUpTemplates: [
        'How would you implement this recursively, and what would be the call stack space complexity?',
        'How do you detect if a linked list contains a cycle before attempting to reverse it?'
      ],
      idealAnswerPoints: [
        'Initialize three pointers: prev = null, curr = head, next = null',
        'Iterate while curr !== null: store next = curr.next, redirect curr.next = prev, advance prev = curr, advance curr = next',
        'Return prev as the new head of the reversed list',
        'Guarantees O(n) time complexity and strictly O(1) auxiliary space'
      ],
      explanation: 'Standard pointer manipulation challenge verifying reference management without memory leaks.',
      learningExplanation: 'Reversing a linked list requires breaking existing forward pointers and pointing them backward. We must cache curr.next before mutating curr.next = prev, otherwise we lose reference to the remainder of the list.',
      whatToStudyNext: 'Floyd\'s Cycle Detection (Tortoise and Hare algorithm) and reversing linked lists in k-group.',
      recommendedPracticeQuestion: 'Reverse a linked list from position m to n in one single pass.',
      referenceAnswer: 'Three-pointer method: prev = null, curr = head. In a while loop, cache next = curr.next, set curr.next = prev, shift prev = curr and curr = next. Return prev.',
      exampleSolution: `class ListNode {\n  constructor(val, next = null) { this.val = val; this.next = next; }\n}\nfunction reverseList(head) {\n  let prev = null, curr = head;\n  while (curr) {\n    let nxt = curr.next;\n    curr.next = prev;\n    prev = curr;\n    curr = nxt;\n  }\n  return prev;\n}`
    },

    // --- SQL & Database Queries ---
    {
      id: 'cse_sql_groupby_having_03',
      department: 'Computer Science & Engineering',
      subject: 'Database Systems & SQL',
      topic: 'Database Systems',
      subtopic: 'Aggregations & Group Filtering',
      skill: 'SQL',
      difficulty: 'Intermediate',
      questionType: 'sql',
      question: 'Write a SQL query on an `employees(id, name, department_id, salary)` table to find all `department_id`s that have more than 5 employees and an average salary strictly greater than $60,000. Explain the execution order difference between WHERE and HAVING.',
      keywords: ['sql', 'group by', 'having', 'aggregate', 'avg', 'count', 'where vs having', 'filtering'],
      followUpTemplates: [
        'Why can you NOT use aggregate functions like COUNT() or AVG() inside a WHERE clause?',
        'How does the database engine utilize an index on (department_id, salary) to optimize this aggregation?'
      ],
      idealAnswerPoints: [
        'SQL Query: SELECT department_id, COUNT(*) AS emp_count, AVG(salary) AS avg_sal FROM employees GROUP BY department_id HAVING COUNT(*) > 5 AND AVG(salary) > 60000;',
        'Execution Order: FROM -> WHERE (filters individual rows before grouping) -> GROUP BY (aggregates rows into buckets) -> HAVING (filters aggregated groups) -> SELECT -> ORDER BY',
        'WHERE filters base row tuples; HAVING filters post-aggregation group metrics'
      ],
      explanation: 'Tests precision in SQL aggregate grouping, filtering phases, and database query engine execution order.',
      learningExplanation: 'WHERE filters rows before they are grouped; hence it cannot reference aggregate values like AVG(). GROUP BY collates remaining rows into summary buckets. HAVING evaluates conditions on those summary buckets.',
      whatToStudyNext: 'SQL Window Functions (ROW_NUMBER(), RANK(), DENSE_RANK()) and Common Table Expressions (WITH).',
      recommendedPracticeQuestion: 'Write a query to find the 2nd highest salary in each department using DENSE_RANK().',
      referenceAnswer: 'SELECT department_id FROM employees GROUP BY department_id HAVING COUNT(*) > 5 AND AVG(salary) > 60000;',
      exampleSolution: `SELECT department_id, COUNT(*) AS total_staff, ROUND(AVG(salary), 2) AS average_salary\nFROM employees\nGROUP BY department_id\nHAVING COUNT(*) > 5 AND AVG(salary) > 60000;`
    },
    {
      id: 'cse_sql_joins_acid_04',
      department: 'Computer Science & Engineering',
      subject: 'Database Systems & SQL',
      topic: 'Database Systems',
      subtopic: 'Joins, Indexing & ACID Transactions',
      skill: 'MySQL',
      difficulty: 'Intermediate',
      questionType: 'conceptual',
      question: 'Explain the difference between INNER JOIN, LEFT JOIN, and FULL OUTER JOIN. How do B-Tree indexes accelerate SQL lookups, and what are the ACID properties in database transactions?',
      keywords: ['inner join', 'left join', 'b-tree index', 'acid', 'atomicity', 'consistency', 'isolation', 'durability'],
      followUpTemplates: [
        'What are composite indexes, and how does the leftmost prefix rule affect their query coverage?',
        'What is a phantom read, and which SQL transaction isolation level prevents it?'
      ],
      idealAnswerPoints: [
        'INNER JOIN: Returns rows with matching keys in both tables',
        'LEFT JOIN: Returns all rows from left table, with matching right table rows or NULL',
        'FULL OUTER JOIN: Returns all rows when there is a match in either left or right table',
        'B-Tree Index: Self-balancing multi-way tree providing O(log n) lookups, range scans, and ordered traversal',
        'ACID Properties: Atomicity (all or nothing), Consistency (preserves invariants), Isolation (concurrent independence), Durability (persisted on disk)'
      ],
      explanation: 'Evaluates relational database principles, indexing data structures, and transactional guarantees.',
      learningExplanation: 'B-Tree indexes keep keys sorted on disk pages, allowing logarithmic binary search instead of full table scans (O(n)). ACID guarantees ensure financial and critical business transactions cannot corrupt data during crashes.',
      whatToStudyNext: 'Transaction isolation levels: Read Uncommitted, Read Committed, Repeatable Read, and Serializable.',
      recommendedPracticeQuestion: 'Explain when an index scan can become slower than a sequential scan.'
    },

    // --- Web Development & APIs ---
    {
      id: 'cse_web_rest_apis_05',
      department: 'Computer Science & Engineering',
      subject: 'Web Technologies & APIs',
      topic: 'Backend Web & API Architecture',
      subtopic: 'REST Principles & HTTP Protocols',
      skill: 'REST APIs',
      difficulty: 'Intermediate',
      questionType: 'conceptual',
      question: 'Explain the core architectural constraints of REST APIs. What is the difference between GET, POST, PUT, PATCH, and DELETE? Which methods are idempotent, and what do HTTP status codes 200, 201, 400, 401, 403, 404, and 500 indicate?',
      keywords: ['rest', 'http methods', 'idempotent', 'get', 'post', 'put', 'patch', 'status codes', 'api design'],
      followUpTemplates: [
        'Why is PUT considered idempotent while POST is not idempotent?',
        'What is the architectural difference between 401 Unauthorized and 403 Forbidden?'
      ],
      idealAnswerPoints: [
        'REST Constraints: Statelessness, Client-Server separation, Uniform Interface, Cacheability, Layered System',
        'HTTP Methods: GET (read), POST (create new), PUT (replace entire resource), PATCH (partial update), DELETE (remove)',
        'Idempotence: Executing identical request multiple times yields the same state (GET, PUT, DELETE are idempotent; POST is NOT)',
        'Status Codes: 200 OK, 201 Created, 400 Bad Request, 401 Unauthorized (missing auth), 403 Forbidden (authenticated but no permission), 404 Not Found, 500 Server Error'
      ],
      explanation: 'Tests mastery of modern API communication standards, HTTP semantics, and security status codes.',
      learningExplanation: 'Idempotency means f(f(x)) = f(x). If a network timeout occurs during a PUT or DELETE, the client can safely retry. For POST, retrying could create duplicate records unless idempotent tokens are utilized.',
      whatToStudyNext: 'JWT authentication, CORS preflight requests (OPTIONS), and API rate limiting.',
      recommendedPracticeQuestion: 'Design a RESTful API contract for an e-commerce order management system.'
    },

    // --- AI / ML / Libraries ---
    {
      id: 'cse_aiml_supervised_eval_06',
      department: 'Computer Science & Engineering',
      subject: 'Artificial Intelligence & Machine Learning',
      topic: 'Machine Learning & AI',
      subtopic: 'Model Evaluation & Overfitting',
      skill: 'Scikit-learn',
      difficulty: 'Intermediate',
      questionType: 'conceptual',
      question: 'Explain the difference between Precision, Recall, and F1-Score in binary classification. In what real-world scenarios would you prioritize Precision over Recall (and vice versa)? How do you detect and mitigate overfitting in machine learning models?',
      keywords: ['precision', 'recall', 'f1-score', 'confusion matrix', 'overfitting', 'regularization', 'cross-validation'],
      followUpTemplates: [
        'How does k-fold cross-validation give a more realistic assessment than a single train-test split?',
        'What does an ROC-AUC curve represent, and how is it interpreted when classes are heavily imbalanced?'
      ],
      idealAnswerPoints: [
        'Precision = TP / (TP + FP): Proportion of predicted positives that were actually positive',
        'Recall = TP / (TP + FN): Proportion of actual positives captured by the model',
        'F1-Score = 2 * (Precision * Recall) / (Precision + Recall): Harmonic mean balancing both',
        'Prioritize Precision: Spam filtering (avoid labeling valid emails as spam) or search results',
        'Prioritize Recall: Medical diagnosis or cancer detection (never miss a true disease case)',
        'Mitigate Overfitting: Cross-validation, regularization (L1/L2), pruning/dropout, simplifying model complexity, gathering more data'
      ],
      explanation: 'Core machine learning competency testing metrics selection, confusion matrix interpretation, and overfitting mitigation.',
      learningExplanation: 'Accuracy is misleading on imbalanced datasets (e.g. 99% non-fraud). Precision measures prediction accuracy; Recall measures detection completeness. Harmonic mean F1 penalizes extreme imbalances between the two.',
      whatToStudyNext: 'Hyperparameter tuning with GridSearchCV/RandomizedSearchCV, and ensemble gradient boosting (XGBoost).',
      recommendedPracticeQuestion: 'Write a Python snippet with Scikit-learn using cross_val_score and classification_report on a train/test pipeline.'
    },

    // --- Core CS: Operating Systems ---
    {
      id: 'cse_os_virtual_memory_07',
      department: 'Computer Science & Engineering',
      subject: 'Operating Systems',
      topic: 'Core Computer Science',
      subtopic: 'Virtual Memory & Page Faults',
      skill: 'Operating Systems',
      difficulty: 'Intermediate',
      questionType: 'conceptual',
      question: 'Explain how Virtual Memory and Paging work in modern Operating Systems. What happens step-by-step when a Page Fault occurs, and what is Thrashing?',
      keywords: ['virtual memory', 'paging', 'page table', 'tlb', 'page fault', 'mmu', 'thrashing', 'swap space'],
      followUpTemplates: [
        'How does the Translation Lookaside Buffer (TLB) accelerate virtual-to-physical address translation?',
        'What is the difference between preemptive and non-preemptive CPU scheduling algorithms?'
      ],
      idealAnswerPoints: [
        'Virtual Memory maps process virtual address space to physical RAM using pages and page tables managed by MMU',
        'Page Fault Sequence: CPU accesses virtual address not in RAM -> MMU triggers page fault trap -> OS takes control -> OS finds free physical frame (or evicts victim page using LRU) -> disk I/O reads page into RAM -> updates Page Table & TLB -> restarts faulting instruction',
        'Thrashing: OS spends more time swapping pages between disk and RAM than executing actual CPU instructions due to overcommitted memory'
      ],
      explanation: 'Examines core system architecture, memory virtualization, and hardware-OS interaction.',
      learningExplanation: 'Virtual memory isolates processes and gives each process the illusion of continuous contiguous memory. When a page is absent from RAM, hardware interrupts the CPU and the OS disk driver fetches it synchronously.',
      whatToStudyNext: 'Deadlock detection with Banker\'s Algorithm, and inter-process communication (IPC) via shared memory and pipes.',
      recommendedPracticeQuestion: 'Calculate effective memory access time given TLB access time of 10ns, memory access of 100ns, and 90% TLB hit ratio.'
    },

    // --- Core CS: Computer Networks ---
    {
      id: 'cse_networks_dns_http_08',
      department: 'Computer Science & Engineering',
      subject: 'Computer Networks',
      topic: 'Networking & Protocols',
      subtopic: 'DNS & Application Layer Protocols',
      skill: 'Computer Networks',
      difficulty: 'Intermediate',
      questionType: 'conceptual',
      question: 'Explain what happens from the moment a user types "https://www.google.com" into a browser until the webpage renders. Detail the DNS lookup, TLS/SSL handshake, HTTP request/response, and browser rendering process.',
      keywords: ['dns', 'tls handshake', 'tcp handshake', 'http', 'https', 'dom', 'rendering engine', 'arp'],
      followUpTemplates: [
        'How does asymmetric encryption establish symmetric session keys during the TLS handshake?',
        'What advantages does HTTP/2 multiplexing provide over HTTP/1.1 head-of-line blocking?'
      ],
      idealAnswerPoints: [
        '1. Browser checks local DNS cache, OS cache, router cache, and queries Recursive DNS Resolver -> Root -> TLD (.com) -> Authoritative server to resolve IP address',
        '2. TCP 3-way handshake (SYN, SYN-ACK, ACK) on port 443',
        '3. TLS Handshake: Client Hello -> Server Hello + Certificate -> Key Exchange (ECDHE/RSA) -> symmetric AES session keys established',
        '4. Browser sends HTTP GET request; Server processes and returns HTML response with status code 200',
        '5. Browser parses HTML into DOM tree, CSS into CSSOM tree, combines them into Render Tree, computes layout, and paints pixels'
      ],
      explanation: 'End-to-end full-stack systems question integrating networks, security, protocols, and browser rendering engines.',
      learningExplanation: 'This classic systems question tests whether a student understands how the entire software and networking stack fits together: DNS resolution, TCP reliability, cryptographic handshakes, and front-end browser painting pipelines.',
      whatToStudyNext: 'Content Delivery Networks (CDNs), WebSocket protocol for bidirectional communication, and QUIC (HTTP/3).',
      recommendedPracticeQuestion: 'Diagram the cryptographic steps of an ECDHE TLS 1.3 handshake.'
    }
  ],

  // ===========================================================================
  // 2. INFORMATION TECHNOLOGY (IT)
  // ===========================================================================
  'Information Technology': [
    {
      id: 'it_cloud_iaas_paas_01',
      department: 'Information Technology',
      subject: 'Cloud Computing & Infrastructure',
      topic: 'Cloud Architecture & DevOps',
      subtopic: 'Service Models & Virtualization',
      skill: 'Cloud Computing',
      difficulty: 'Intermediate',
      questionType: 'conceptual',
      question: 'Explain the differences between IaaS, PaaS, SaaS, and Serverless (FaaS) in Cloud Computing. When designing a scalable web application, under what criteria would you choose AWS Lambda/FaaS over containerized ECS/Kubernetes?',
      keywords: ['iaas', 'paas', 'saas', 'serverless', 'faas', 'aws lambda', 'kubernetes', 'scalability', 'cloud'],
      followUpTemplates: [
        'What is the cold start problem in serverless functions, and how can it be mitigated?',
        'How do AWS Availability Zones (AZs) and Multi-Region deployments provide disaster recovery and high availability?'
      ],
      idealAnswerPoints: [
        'IaaS (EC2): Full VM control, manage OS and runtime; PaaS (Elastic Beanstalk, Heroku): Managed platform, developer supplies code; SaaS: Turnkey applications (Gmail)',
        'Serverless / FaaS (AWS Lambda): Event-driven, auto-scales to zero, zero server provisioning, pay strictly per millisecond executed',
        'Choose FaaS for: Sporadic workloads, event processing (S3 uploads, webhooks), low operational maintenance, bursty traffic',
        'Choose Containers (K8s/ECS) for: Long-running microservices, complex state, low latency (no cold starts), predictable high throughput'
      ],
      explanation: 'Tests cloud infrastructure decision-making, cost trade-offs, and architecture design.',
      learningExplanation: 'Cloud service models trade control for abstraction. Serverless eliminates infrastructure management and idle costs, but suffers from cold starts and execution timeout limits. Containers provide consistency and lower unit costs at steady high volume.',
      whatToStudyNext: 'Infrastructure as Code (Terraform) and cloud networking (VPC, subnets, route tables, security groups).',
      recommendedPracticeQuestion: 'Design an event-driven thumbnail generation architecture using S3, Lambda, and DynamoDB.'
    },
    {
      id: 'it_security_oauth_jwt_02',
      department: 'Information Technology',
      subject: 'Cybersecurity & Authentication',
      topic: 'Cybersecurity & Authentication',
      subtopic: 'Token-based Auth & Protocols',
      skill: 'Cybersecurity',
      difficulty: 'Intermediate',
      questionType: 'conceptual',
      question: 'Explain how JSON Web Tokens (JWT) work. What are its three segments (Header, Payload, Signature)? What is the difference between authentication and authorization, and how does OAuth 2.0 handle delegated access?',
      keywords: ['jwt', 'oauth 2.0', 'authentication', 'authorization', 'signature', 'base64', 'tokens', 'security'],
      followUpTemplates: [
        'Why should you NEVER store sensitive passwords or credit card numbers in a JWT payload?',
        'How does a server invalidate a JWT before its expiration time if the secret key is not changed?'
      ],
      idealAnswerPoints: [
        'JWT Segments: Header (algorithm & token type), Payload (claims/user data - base64 encoded, readable by anyone), Signature (HMACSHA256(header + payload, secret))',
        'Authentication: Verifies identity ("Who are you?"); Authorization: Verifies permissions ("What are you allowed to do?")',
        'OAuth 2.0: Delegated authorization framework where user grants third-party application limited access without sharing credentials, issuing an Access Token via Authorization Code Grant',
        'Security rule: Signature ensures token integrity; payload is NOT encrypted unless JWE is utilized'
      ],
      explanation: 'Evaluates production authentication standards, token structures, and identity federation.',
      learningExplanation: 'JWTs are signed, not encrypted by default. Anyone can decode the Base64 payload. The signature verifies the token was created by your server and was not tampered with in transit.',
      whatToStudyNext: 'Refresh token rotation strategies, CSRF prevention with HttpOnly cookies, and Role-Based Access Control (RBAC).',
      recommendedPracticeQuestion: 'Walk through the 4 steps of the OAuth 2.0 Authorization Code flow with PKCE.'
    },
    {
      id: 'it_devops_docker_k8s_03',
      department: 'Information Technology',
      subject: 'DevOps & Systems Engineering',
      topic: 'DevOps & Software Tools',
      subtopic: 'Containerization & Orchestration',
      skill: 'Docker',
      difficulty: 'Intermediate',
      questionType: 'conceptual',
      question: 'Explain how Docker containers differ from traditional Virtual Machines (VMs) regarding kernel sharing and resource overhead. In Kubernetes, what is a Pod, and what is the role of the Kubelet, API Server, and Ingress Controller?',
      keywords: ['docker', 'containers', 'virtual machines', 'cgroups', 'namespaces', 'kubernetes', 'pod', 'kubelet', 'ingress'],
      followUpTemplates: [
        'How do Linux namespaces and cgroups provide process isolation and resource limits in Docker?',
        'What is a Blue-Green deployment, and how does Kubernetes Service switching achieve zero-downtime releases?'
      ],
      idealAnswerPoints: [
        'Docker vs VM: VMs include a full guest OS running on a Hypervisor (heavyweight, minutes to boot); Docker shares the host OS kernel and isolates processes via Linux namespaces and cgroups (lightweight, megabytes in size, boots in milliseconds)',
        'Kubernetes Pod: The smallest deployable computing unit, encapsulating one or more containers sharing network and storage',
        'Kubelet: Agent running on each worker node ensuring containers described in PodSpecs are running and healthy',
        'API Server: Central control plane entry point that exposes the K8s HTTP API and stores state in etcd',
        'Ingress: Manages external HTTP/HTTPS routing into internal cluster Services'
      ],
      explanation: 'Validates modern DevOps fundamentals, container runtimes, and cluster orchestration architectures.',
      learningExplanation: 'Containers achieve isolation by virtualizing the OS kernel rather than the underlying hardware. Kubernetes automates scheduling, health checking, auto-scaling, and rolling updates for distributed container clusters.',
      whatToStudyNext: 'CI/CD pipeline construction with GitHub Actions, Helm chart templating, and Prometheus/Grafana monitoring.',
      recommendedPracticeQuestion: 'Write a multi-stage Dockerfile that compiles a Node.js/Go app and copies only the binary to an alpine image.'
    },
    {
      id: 'it_db_nosql_cap_04',
      department: 'Information Technology',
      subject: 'Database Systems',
      topic: 'Database Systems',
      subtopic: 'NoSQL & Distributed Systems',
      skill: 'MongoDB',
      difficulty: 'Intermediate',
      questionType: 'conceptual',
      question: 'State the CAP Theorem for distributed data stores. Why can a distributed database only guarantee at most two of Consistency, Availability, and Partition Tolerance? Compare SQL (relational) vs NoSQL (Document/Key-Value) design trade-offs.',
      keywords: ['cap theorem', 'consistency', 'availability', 'partition tolerance', 'nosql', 'mongodb', 'sharding', 'acid vs base'],
      followUpTemplates: [
        'How does MongoDB handle network partitions in a Replica Set when the Primary node becomes unreachable?',
        'What is the difference between vertical scaling (Scale-Up) and horizontal scaling (Scale-Out)?'
      ],
      idealAnswerPoints: [
        'CAP Theorem: In the presence of a network partition (P), a distributed system must choose between Consistency (C - every read returns the most recent write) or Availability (A - every non-failing node returns a response)',
        'Network partitions are inevitable in real-world distributed networks; hence systems are either CP (e.g. MongoDB, HBase) or AP (e.g. Cassandra, DynamoDB)',
        'SQL vs NoSQL: SQL guarantees strong schema, ACID transactions, complex joins, vertical scaling; NoSQL provides flexible schema, high write throughput, seamless horizontal sharding, BASE consistency'
      ],
      explanation: 'Assesses distributed database theory, consensus under partition failures, and architecture selection.',
      learningExplanation: 'When network cables break between data centers (Partition), you must either reject requests to prevent stale reads (CP), or allow nodes to respond with potentially outdated data (AP). There is no third option.',
      whatToStudyNext: 'Distributed consensus algorithms (Raft, Paxos) and database sharding partition keys.',
      recommendedPracticeQuestion: 'Explain eventual consistency and how vector clocks or read repairs resolve conflicting writes.'
    }
  ],

  // ===========================================================================
  // 3. ELECTRONICS & COMMUNICATION ENGINEERING (ECE)
  // ===========================================================================
  'Electronics & Communication Engineering': [
    {
      id: 'ece_pcb_design_layout_01',
      department: 'Electronics & Communication Engineering',
      subject: 'Circuit Design & PCB Engineering',
      topic: 'Circuit Design & Hardware Troubleshooting',
      subtopic: 'PCB Layout & Signal Integrity',
      skill: 'PCB Design',
      difficulty: 'Intermediate',
      questionType: 'practical',
      question: 'Explain the critical design rules for high-speed PCB layout. Why are continuous ground reference planes essential, where should decoupling capacitors be positioned relative to IC power pins, and how do you prevent Electromagnetic Interference (EMI) and crosstalk?',
      keywords: ['pcb design', 'ground plane', 'decoupling capacitor', 'trace impedance', 'emi', 'crosstalk', 'signal integrity', 'kicad'],
      followUpTemplates: [
        'Why does a split or void in a ground plane directly beneath a high-speed signal trace cause severe EMI emissions?',
        'How is differential pair trace impedance (e.g. 90-ohm USB, 100-ohm Ethernet) calculated and maintained during routing?'
      ],
      idealAnswerPoints: [
        'Continuous Ground Plane: High-frequency return currents travel directly beneath the signal trace along the path of lowest inductance; voids force return currents to loop around, creating dipole antennas and EMI',
        'Decoupling Capacitors: Must be placed as close as physically possible to IC VDD/GND pins with minimal trace length and low-inductance vias directly to planes to absorb transient switching noise',
        'EMI & Crosstalk Mitigation: Maintain 3W trace separation rule, avoid 90-degree trace corners (use 45-degree or curved bends), isolate sensitive analog circuits from noisy digital switching regulators, and stitch ground planes with vias'
      ],
      explanation: 'Essential practical hardware competency testing PCB layout, signal integrity, and EMI/EMC compliance.',
      learningExplanation: 'At high frequencies, current does not follow the path of least resistance—it follows the path of least inductance directly under the signal line. Any gap in the reference plane forces current into wide loops that radiate RF noise and cause signal degradation.',
      whatToStudyNext: '4-layer PCB stackup design (Signal-GND-Power-Signal) and controlled trace impedance calculation (Microstrip vs Stripline).',
      recommendedPracticeQuestion: 'Sketch the placement of bulk and ceramic decoupling capacitors for an STM32/ESP32 microcontroller power rail.'
    },
    {
      id: 'ece_circuits_opamp_02',
      department: 'Electronics & Communication Engineering',
      subject: 'Analog Electronics & Circuits',
      topic: 'Analog & Digital Electronics',
      subtopic: 'Operational Amplifiers & Feedback',
      skill: 'Analog Electronics',
      difficulty: 'Intermediate',
      questionType: 'conceptual',
      question: 'Explain the concept of Virtual Ground in an inverting operational amplifier (Op-Amp) circuit. What are the ideal characteristics of an Op-Amp (input impedance, output impedance, open-loop gain, bandwidth, CMRR), and how do real op-amps differ?',
      keywords: ['op-amp', 'virtual ground', 'inverting amplifier', 'input impedance', 'open-loop gain', 'cmrr', 'slew rate', 'feedback'],
      followUpTemplates: [
        'What is Slew Rate, and how does it limit the maximum undistorted output frequency of an op-amp circuit?',
        'How does Common Mode Rejection Ratio (CMRR) enable differential instrumentation amplifiers to eliminate noise in ECG/sensor circuits?'
      ],
      idealAnswerPoints: [
        'Virtual Ground Concept: In negative feedback, huge open-loop gain (A -> infinity) drives the differential voltage (V+ - V-) towards zero. If non-inverting terminal V+ is tied to physical ground (0V), inverting terminal V- is held at 0V virtual ground without drawing current',
        'Ideal Characteristics: Input Impedance Zin = infinity, Output Impedance Zout = 0, Open-loop gain Aol = infinity, Bandwidth = infinity, Offset voltage = 0, CMRR = infinity',
        'Real Op-Amp Constraints: Finite gain (~10^5 to 10^6), input bias current, non-zero offset voltage, finite bandwidth (Gain-Bandwidth Product), and finite slew rate'
      ],
      explanation: 'Foundational analog electronics topic testing operational amplifier analysis, feedback theory, and practical limitations.',
      learningExplanation: 'Negative feedback forces the amplifier to continuously adjust its output until the two input pins are at equal voltage. If one pin is grounded, the other becomes a virtual ground, serving as an ideal summing node for currents.',
      whatToStudyNext: 'Active filter design (Sallen-Key low-pass/high-pass) and Instrumentation Amplifiers.',
      recommendedPracticeQuestion: 'Calculate closed-loop gain and output voltage of an inverting op-amp with Rin = 10k, Rf = 100k, and Vin = 0.5V.'
    },
    {
      id: 'ece_micro_arm_esp_03',
      department: 'Electronics & Communication Engineering',
      subject: 'Microcontrollers & Embedded Systems',
      topic: 'Embedded Systems & Firmware',
      subtopic: 'ARM Cortex & Communication Protocols',
      skill: 'Microcontrollers',
      difficulty: 'Intermediate',
      questionType: 'conceptual',
      question: 'Compare UART, SPI, and I2C serial communication protocols regarding wire count, master-slave architecture, transmission speed, duplex capability, and clock synchronization. When would you select I2C over SPI in an embedded IoT sensor system?',
      keywords: ['uart', 'spi', 'i2c', 'serial protocols', 'master-slave', 'pull-up resistors', 'baud rate', 'embedded'],
      followUpTemplates: [
        'Why are pull-up resistors strictly required on I2C SDA and SCL lines (open-drain architecture)?',
        'How does SPI manage multiple slave devices using Chip Select (CS/SS) lines?'
      ],
      idealAnswerPoints: [
        'UART: Asynchronous (no clock wire), point-to-point (2 wires: TX, RX), full duplex, configurable baud rate',
        'SPI: Synchronous, Master-Slave, 4 wires (MOSI, MISO, SCK, CS), full duplex, very high speed (10–50+ MHz), individual CS per slave',
        'I2C: Synchronous, Multi-master multi-slave, 2 wires (SDA, SCL open-drain with pull-ups), half duplex, moderate speed (100kHz, 400kHz, 3.4MHz), 7-bit/10-bit software addressing',
        'Choose I2C over SPI: When GPIO pin count is limited on microcontroller and connecting multiple low-bandwidth sensors on the same 2-wire bus'
      ],
      explanation: 'Fundamental embedded protocols assessment evaluating hardware interfacing and microcontroller bus architectures.',
      learningExplanation: 'SPI is blazingly fast and simple but consumes a dedicated Chip Select pin for every additional peripheral. I2C requires only two shared wires for up to 127 devices using address bytes, making it ideal for compact board layouts.',
      whatToStudyNext: 'DMA (Direct Memory Access) transfers over SPI/I2C and CAN Bus differential signaling.',
      recommendedPracticeQuestion: 'Calculate appropriate pull-up resistor values for a 400kHz I2C bus with 200pF bus capacitance.'
    },
    {
      id: 'ece_vlsi_sta_verilog_04',
      department: 'Electronics & Communication Engineering',
      subject: 'VLSI Design & Digital Systems',
      topic: 'Digital System Design & VLSI',
      subtopic: 'Static Timing Analysis & Verilog HDL',
      skill: 'VLSI Design',
      difficulty: 'Advanced',
      questionType: 'conceptual',
      question: 'Explain Static Timing Analysis (STA) in digital VLSI design. Define Setup Slack and Hold Slack mathematically. How does clock skew affect setup time vs hold time, and why can hold time violations NOT be solved by reducing the clock frequency?',
      keywords: ['vlsi', 'static timing analysis', 'setup slack', 'hold slack', 'clock skew', 'verilog', 'fpga', 'asic'],
      followUpTemplates: [
        'How do physical design engineers fix hold time violations during post-layout optimization (e.g. inserting delay buffers)?',
        'What is the difference between blocking (=) and non-blocking (<=) assignments in Verilog procedural blocks?'
      ],
      idealAnswerPoints: [
        'Setup Constraint: T_launch + T_clk-q + T_comb_max <= T_capture + T_period - T_setup. Setup Slack = (Required Time) - (Arrival Time)',
        'Hold Constraint: T_launch + T_clk-q + T_comb_min >= T_capture + T_hold. Hold Slack = (Arrival Time) - (Required Time)',
        'Clock Frequency independence: The clock period T_period appears ONLY in the setup equation, NOT in the hold equation! Hold violations depend purely on shortest path delay between flip-flops and clock skew',
        'If data arrives too fast before capture hold time closes, slowing down the clock does not fix the issue—delay buffers must be inserted on the data path'
      ],
      explanation: 'Advanced VLSI and ASIC/FPGA timing question analyzing semiconductor design constraints and timing closures.',
      learningExplanation: 'Setup time ensures data arrives before the clock edge; if violated, you can simply run the chip at a slower clock. Hold time ensures data does not blow through too fast and overwrite previous data before the current clock edge latches it; it is clock-speed independent and fatal if unfixed.',
      whatToStudyNext: 'Clock Tree Synthesis (CTS), jitter analysis, and synthesis of Verilog Moore vs Mealy FSMs.',
      recommendedPracticeQuestion: 'Write a Verilog HDL module implementing a synchronous 4-bit gray code counter with active-low reset.'
    }
  ],

  // ===========================================================================
  // 4. ELECTRICAL & ELECTRONICS ENGINEERING (EEE)
  // ===========================================================================
  'Electrical & Electronics Engineering': [
    {
      id: 'eee_machines_induction_01',
      department: 'Electrical & Electronics Engineering',
      subject: 'Electrical Machines',
      topic: 'Electrical Machines & Transformers',
      subtopic: 'Three-Phase Induction Motors',
      skill: 'Electrical Machines',
      difficulty: 'Intermediate',
      questionType: 'conceptual',
      question: 'Explain the working principle of a 3-phase Induction Motor. What is slip (s), why can an induction motor never run at synchronous speed (Ns), and sketch the Torque-Speed characteristic curve indicating starting torque and maximum breakdown torque.',
      keywords: ['induction motor', 'slip', 'synchronous speed', 'rotating magnetic field', 'breakdown torque', 'stator', 'rotor'],
      followUpTemplates: [
        'What happens to motor torque and current if the mechanical load increases on the shaft?',
        'How does a Variable Frequency Drive (VFD) maintain constant V/f ratio to control induction motor speed without saturating the magnetic core?'
      ],
      idealAnswerPoints: [
        'Operating Principle: 3-phase balanced stator currents produce a Rotating Magnetic Field (RMF) spinning at Ns = 120*f / P; RMF cuts stationary rotor conductors, inducing EMF and rotor currents by Faraday\'s law; Lorentz force produces rotor torque in direction of RMF by Lenz\'s law',
        'Slip: s = (Ns - N) / Ns. If motor reached synchronous speed (N = Ns), relative velocity between RMF and rotor would be zero -> zero induced EMF -> zero rotor current -> zero torque -> motor immediately slows down',
        'Torque-Speed Curve: Starting torque at s=1; torque rises to maximum (breakdown torque) at critical slip s_max = R2 / X2; drops to 0 at s=0'
      ],
      explanation: 'Fundamental electrical machinery topic examining electromechanical energy conversion, magnetic fields, and torque dynamics.',
      learningExplanation: 'Induction motors are inherently asynchronous. Torque requires induced rotor currents, which strictly require relative motion (slip) between the rotating stator field and the physical rotor.',
      whatToStudyNext: 'Star-Delta starters, auto-transformer starting, and equivalent circuit parameter estimation.',
      recommendedPracticeQuestion: 'A 4-pole, 50 Hz 3-phase induction motor runs at 1440 RPM. Calculate synchronous speed and percentage slip.'
    },
    {
      id: 'eee_power_electronics_converters_02',
      department: 'Electrical & Electronics Engineering',
      subject: 'Power Electronics',
      topic: 'Power Electronics & Drives',
      subtopic: 'DC-DC Converters & PWM Switching',
      skill: 'Power Electronics',
      difficulty: 'Intermediate',
      questionType: 'conceptual',
      question: 'Explain the operation of a Buck Converter and a Boost Converter in Continuous Conduction Mode (CCM). Derive the voltage conversion ratio as a function of duty cycle (D) for both, and explain the role of the inductor, diode, and capacitor filter.',
      keywords: ['buck converter', 'boost converter', 'duty cycle', 'continuous conduction mode', 'inductor volt-second balance', 'pwm', 'mosfet'],
      followUpTemplates: [
        'What is inductor volt-second balance, and how does it guarantee steady-state converter operation?',
        'What is the difference between an insulated gate bipolar transistor (IGBT) and a power MOSFET regarding switching speed and voltage rating?'
      ],
      idealAnswerPoints: [
        'Buck Converter: Step-down DC-DC converter. When switch ON: inductor stores energy, diode reverse biased. When switch OFF: inductor discharges via freewheeling diode. Output Vout = D * Vin (where D = Ton / T, 0 <= D <= 1)',
        'Boost Converter: Step-up DC-DC converter. When switch ON: inductor charges to ground. When switch OFF: inductor voltage adds in series with input source through diode to output. Output Vout = Vin / (1 - D)',
        'Inductor Volt-Second Balance: Net inductor voltage over a full switching period in steady state must be zero (integral of V_L dt = 0), preventing inductor saturation'
      ],
      explanation: 'Core power electronics subject assessing switched-mode power supplies, duty cycle analysis, and energy storage.',
      learningExplanation: 'Switched-mode power supplies achieve >90% efficiency compared to dissipative linear regulators. High-frequency PWM switches an inductor between charging and discharging phases to step voltage up or down with minimal heat losses.',
      whatToStudyNext: 'Inverter topologies (H-bridge, SPWM), and gate driver bootstrap circuit design.',
      recommendedPracticeQuestion: 'Design a Buck converter stepping 24V down to 5V at 2A with maximum 10% inductor ripple current at 100kHz.'
    },
    {
      id: 'eee_power_systems_faults_03',
      department: 'Electrical & Electronics Engineering',
      subject: 'Power Systems & Protection',
      topic: 'Power Systems & Grid Engineering',
      subtopic: 'Fault Analysis & Transmission',
      skill: 'Power Systems',
      difficulty: 'Advanced',
      questionType: 'conceptual',
      question: 'Compare symmetrical (3-phase balanced) and asymmetrical (Line-to-Ground, Line-to-Line, Double Line-to-Ground) faults in power systems. Explain how Symmetrical Components (positive, negative, and zero sequence networks) are used to analyze unbalanced faults.',
      keywords: ['fault analysis', 'symmetrical components', 'line-to-ground fault', 'zero sequence', 'protective relays', 'circuit breakers'],
      followUpTemplates: [
        'Which fault type is statistically the most common in overhead transmission lines, and which fault type is the most severe?',
        'How does transformer winding configuration (e.g. Delta-Star with grounded neutral) affect the path of zero-sequence fault currents?'
      ],
      idealAnswerPoints: [
        'Symmetrical Fault (3-Phase L-L-L): System remains balanced; current in all 3 phases is equal in magnitude and shifted by 120 degrees; most severe mechanically, but rarest (~5%)',
        'Asymmetrical Faults: Line-to-Ground (L-G) is most common (~70% due to lightning, tree contact), L-L (~15%), D-L-G (~10%)',
        'Fortescue\'s Symmetrical Components: Any unbalanced 3-phase system can be decomposed into 3 balanced sets: Positive Sequence (same phase sequence ABC), Negative Sequence (reversed sequence ACB), and Zero Sequence (identical magnitude and phase angle)',
        'L-G fault analysis: Connect positive, negative, and zero sequence networks in series to compute fault currents'
      ],
      explanation: 'Examines high-voltage grid stability, fault protection, and matrix network modeling.',
      learningExplanation: 'Unbalanced faults introduce complex coupled differential equations across phases. Fortescue symmetrical components decouple the 3 phases into 3 independent sequence circuits, transforming unsolvable power system networks into straightforward linear analysis.',
      whatToStudyNext: 'Distance protection relays (Mho, Quadrilateral), and Buchholz relay for transformer internal gas detection.',
      recommendedPracticeQuestion: 'Draw the symmetrical component sequence network connection diagram for a single Line-to-Ground fault.'
    },
    {
      id: 'eee_control_systems_pid_04',
      department: 'Electrical & Electronics Engineering',
      subject: 'Control Systems',
      topic: 'Control Systems & Instrumentation',
      subtopic: 'PID Controllers & Stability',
      skill: 'Control Systems',
      difficulty: 'Intermediate',
      questionType: 'conceptual',
      question: 'Explain the roles of the Proportional (P), Integral (I), and Derivative (D) terms in a closed-loop PID controller. How does each term impact system rise time, overshoot, steady-state error, and stability? State the Routh-Hurwitz stability criterion.',
      keywords: ['pid controller', 'proportional', 'integral', 'derivative', 'steady-state error', 'overshoot', 'routh-hurwitz', 'transfer function'],
      followUpTemplates: [
        'Why does introducing integral action eliminate steady-state error, but often reduce relative stability and increase overshoot?',
        'How do Bode plots and Gain Margin / Phase Margin quantify closed-loop system robustness?'
      ],
      idealAnswerPoints: [
        'Proportional (P): Output is proportional to current error e(t); increases rise time and response speed, but cannot eliminate steady-state error on its own and high gain causes oscillations',
        'Integral (I): Integrates past error over time; increases system type, strictly drives steady-state error to zero, but adds phase lag and can destabilize the loop or cause windup',
        'Derivative (D): Predicts future error trend based on derivative de(t)/dt; provides damping, reduces overshoot, but amplifies high-frequency sensor noise',
        'Routh-Hurwitz Criterion: Necessary and sufficient condition for stability: all coefficients of the characteristic equation must be positive and all elements in the first column of the Routh array must have the same sign (zero sign changes)'
      ],
      explanation: 'Evaluates classical feedback control, transient response tuning, and polynomial stability criteria.',
      learningExplanation: 'P acts on present error, I acts on accumulated past error (guaranteeing zero offset), and D acts on predicted future error (damping oscillations). Tuning is the art of balancing response speed against stability margin.',
      whatToStudyNext: 'Ziegler-Nichols tuning methods and Root Locus graphical design.',
      recommendedPracticeQuestion: 'Using Routh-Hurwitz, determine the range of controller gain K for stability given s^3 + 3s^2 + 3s + 1 + K = 0.'
    }
  ],

  // ===========================================================================
  // 5. MECHANICAL ENGINEERING
  // ===========================================================================
  'Mechanical Engineering': [
    {
      id: 'mech_thermo_cycles_01',
      department: 'Mechanical Engineering',
      subject: 'Thermodynamics & Heat Engines',
      topic: 'Thermodynamics & Fluid Mechanics',
      subtopic: 'Power Cycles & Efficiency',
      skill: 'Thermodynamics',
      difficulty: 'Intermediate',
      questionType: 'conceptual',
      question: 'Compare the Otto cycle, Diesel cycle, and Dual combustion cycle. Sketch their P-v and T-s diagrams, and state which cycle has higher thermal efficiency for: (a) Same compression ratio and heat input, and (b) Same maximum pressure and temperature.',
      keywords: ['otto cycle', 'diesel cycle', 'dual cycle', 'compression ratio', 'p-v diagram', 't-s diagram', 'thermal efficiency', 'thermodynamics'],
      followUpTemplates: [
        'Why can real diesel engines achieve higher overall thermal efficiency than petrol (Otto) engines in practice despite Otto having higher theoretical efficiency at equal compression ratios?',
        'What is the physical significance of the Second Law of Thermodynamics (Kelvin-Planck vs Clausius statements)?'
      ],
      idealAnswerPoints: [
        'Otto Cycle: Constant volume heat addition and heat rejection (spark ignition / petrol engines)',
        'Diesel Cycle: Constant pressure heat addition and constant volume heat rejection (compression ignition / diesel engines)',
        'Condition (a) Same compression ratio & heat input: Otto Cycle has higher thermal efficiency (eta_Otto > eta_Dual > eta_Diesel) because heat is added at highest temperature at top dead center',
        'Condition (b) Same maximum pressure & maximum temperature: Diesel Cycle has higher thermal efficiency (eta_Diesel > eta_Dual > eta_Otto)',
        'Real-world: Diesel engines operate at much higher compression ratios (16:1 to 22:1 vs 8:1 to 11:1 for petrol) without knocking, achieving superior practical fuel efficiency'
      ],
      explanation: 'Core mechanical engineering thermodynamics examining air standard cycles, efficiency bounds, and combustion physics.',
      learningExplanation: 'In theoretical thermodynamics at identical compression ratios, adding heat at constant volume (Otto) generates higher peak temperatures and pressures than constant pressure (Diesel). However, petrol engines are knock-limited to ~10:1 compression ratio, while diesel engines can exceed 20:1, yielding higher real-world efficiency.',
      whatToStudyNext: 'Rankine cycle reheat and regeneration for thermal power plants, and Brayton cycle for gas turbines.',
      recommendedPracticeQuestion: 'Derive the thermal efficiency formula for the ideal air standard Otto cycle in terms of compression ratio r and adiabatic index gamma.'
    },
    {
      id: 'mech_fluid_bernoulli_pipe_02',
      department: 'Mechanical Engineering',
      subject: 'Fluid Mechanics',
      topic: 'Thermodynamics & Fluid Mechanics',
      subtopic: 'Bernoulli Equation & Pipe Flow',
      skill: 'Fluid Mechanics',
      difficulty: 'Intermediate',
      questionType: 'practical',
      question: 'State Bernoulli\'s equation and explain the assumptions required for it to hold. How do you calculate major head loss using the Darcy-Weisbach equation in laminar vs turbulent pipe flow? How does the Reynolds number govern flow regime transitions?',
      keywords: ['bernoulli', 'fluid mechanics', 'darcy-weisbach', 'reynolds number', 'laminar', 'turbulent', 'head loss', 'friction factor'],
      followUpTemplates: [
        'What is the Moody chart, and how does relative pipe roughness (epsilon/D) determine friction factor in fully rough turbulent flow?',
        'What is water hammer in industrial piping systems, and how do surge tanks alleviate high-pressure shockwaves?'
      ],
      idealAnswerPoints: [
        'Bernoulli Equation: P/gamma + v^2/(2g) + z = constant along a streamline (Pressure head + Velocity head + Elevation head)',
        'Assumptions: Incompressible fluid, non-viscous (frictionless), steady flow, flow along a streamline, no shaft work or heat exchange',
        'Reynolds Number: Re = rho * v * D / mu. For pipe flow: Re < 2300 is laminar; 2300 < Re < 4000 is transitional; Re > 4000 is turbulent',
        'Darcy-Weisbach Equation: h_f = f * (L/D) * (v^2 / 2g). For laminar flow, friction factor f = 64 / Re (independent of pipe roughness). For turbulent flow, f is determined via Colebrook-White or Moody chart'
      ],
      explanation: 'Tests fluid dynamics principles, conservation of energy along streamlines, and viscous pipe flow losses.',
      learningExplanation: 'Bernoulli represents conservation of mechanical energy for an ideal fluid. In real viscous pipes, shear stresses dissipate energy into heat, requiring the Darcy-Weisbach head loss term to be added to the energy balance.',
      whatToStudyNext: 'Boundary layer separation, drag and lift on immersed bodies, and Navier-Stokes equations.',
      recommendedPracticeQuestion: 'Calculate head loss over a 100m long, 0.1m diameter pipe with water flowing at 2 m/s assuming friction factor f = 0.02.'
    },
    {
      id: 'mech_design_stress_fatigue_03',
      department: 'Mechanical Engineering',
      subject: 'Machine Design & Materials',
      topic: 'CAD, CAM & Manufacturing',
      subtopic: 'Fatigue & Failure Theories',
      skill: 'Machine Design',
      difficulty: 'Advanced',
      questionType: 'conceptual',
      question: 'Explain the difference between static yield failure and fatigue failure in mechanical components. What is an S-N curve and the Endurance Limit? Compare the Soderberg, Goodman, and Gerber criteria for designing components subjected to fluctuating cyclic stresses.',
      keywords: ['machine design', 'fatigue', 's-n curve', 'endurance limit', 'goodman criterion', 'soderberg', 'stress concentration', 'solidworks'],
      followUpTemplates: [
        'Why do sharp internal corners or keyways drastically reduce fatigue life, and how do stress concentration notch sensitivity factors account for this?',
        'Which failure theory (Maximum Shear Stress / Tresca vs Distortion Energy / Von Mises) is preferred for ductile materials under multi-axial static loading, and why?'
      ],
      idealAnswerPoints: [
        'Static Failure: Occurs when applied stress exceeds yield strength (ductile) or ultimate strength (brittle) under monotonic load',
        'Fatigue Failure: Progressive structural damage that occurs under cyclic fluctuating stresses below static yield strength; initiates as microcracks at stress concentrations and propagates to catastrophic sudden brittle fracture',
        'S-N Curve & Endurance Limit: Endurance limit (Se) is the stress amplitude below which ferrous materials can endure infinite cycles (10^7+) without failing',
        'Cyclic Failure Criteria: Relate mean stress (sigma_m) and alternating stress (sigma_a). Soderberg (uses Yield strength, most conservative), Goodman (uses Ultimate strength, standard for ductile design), Gerber (parabolic relationship, matches experimental data closest)'
      ],
      explanation: 'Evaluates structural machine design, cyclic fatigue limits, and component reliability engineering.',
      learningExplanation: 'Over 80% of real mechanical failures are fatigue failures. Even if a shaft never reaches yield stress, repeated rotations under bending loads propagate cracks from microscopic flaws until the remaining cross-section shears abruptly.',
      whatToStudyNext: 'Shaft design under combined torsion and bending according to ASME code, and rolling element bearing L10 life calculation.',
      recommendedPracticeQuestion: 'Construct a modified Goodman diagram for a steel shaft subjected to bending stress fluctuating between 100 MPa and 300 MPa.'
    },
    {
      id: 'mech_manufacturing_casting_cnc_04',
      department: 'Mechanical Engineering',
      subject: 'Manufacturing Processes & CAM',
      topic: 'CAD, CAM & Manufacturing',
      subtopic: 'Casting, Machining & CNC G-Codes',
      skill: 'Manufacturing Processes',
      difficulty: 'Intermediate',
      questionType: 'practical',
      question: 'Explain the casting process and the essential elements of a gating system (pouring basin, sprue, runner, ingates, riser). What are common casting defects like shrinkage cavities and blowholes, and how does Chvorinov\'s rule guide riser design? Explain G-codes G00, G01, G02, and G03 in CNC programming.',
      keywords: ['casting', 'gating system', 'riser', 'chvorinov rule', 'cnc', 'g-code', 'manufacturing', 'machining'],
      followUpTemplates: [
        'Why must the solidification time of the riser be strictly greater than the solidification time of the casting section it feeds?',
        'What is Geometric Dimensioning and Tolerancing (GD&T), and what does True Position with Maximum Material Condition (MMC) signify on an engineering drawing?'
      ],
      idealAnswerPoints: [
        'Gating System: Delivers molten metal smoothly into the mold cavity without turbulence or air aspiration; Sprue accelerates flow, runner distributes, ingates enter cavity, Riser supplies molten metal to compensate for liquid shrinkage during cooling',
        'Chvorinov\'s Rule: Solidification Time t = B * (V / A)^n (where V is volume, A is surface area, n ~ 2). Riser must have smaller (A/V) ratio than casting so it solidifies last',
        'Casting Defects: Shrinkage cavity (insufficient feeding from riser), Blowholes (entrapped gas/moisture in sand mold)',
        'CNC G-Codes: G00 (Rapid linear positioning at maximum feed rate, non-cutting), G01 (Linear cutting feed at specified feed rate F), G02 (Circular interpolation clockwise), G03 (Circular interpolation counter-clockwise)'
      ],
      explanation: 'Assesses production engineering, foundry metallurgy, and automated computer numerical control machining.',
      learningExplanation: 'Chvorinov\'s rule proves that cooling rate is governed by surface area per unit volume. A sphere or stubby cylinder cools slowest, making it the ideal geometry for a riser to feed hot metal into cooling parts.',
      whatToStudyNext: 'Merchant\'s circle for orthogonal metal cutting forces, and Taylor\'s tool life equation V * T^n = C.',
      recommendedPracticeQuestion: 'Write a CNC G-code program snippet to mill a 50mm x 50mm square contour with 5mm corner fillets.'
    }
  ],

  // ===========================================================================
  // 6. CIVIL ENGINEERING
  // ===========================================================================
  'Civil Engineering': [
    {
      id: 'civil_structures_sfd_bmd_01',
      department: 'Civil Engineering',
      subject: 'Structural Analysis',
      topic: 'Structural Analysis & Design',
      subtopic: 'Shear Force & Bending Moment Diagrams',
      skill: 'Structural Engineering',
      difficulty: 'Intermediate',
      questionType: 'practical',
      question: 'Explain how to construct the Shear Force Diagram (SFD) and Bending Moment Diagram (BMD) for a simply supported beam with an overhang carrying a uniformly distributed load (UDL) and a concentrated point load. What is the Point of Contraflexure, and what is the mathematical relationship between shear force and bending moment?',
      keywords: ['structural engineering', 'sfd', 'bmd', 'point of contraflexure', 'udl', 'bending moment', 'shear force', 'staad.pro'],
      followUpTemplates: [
        'At what point on a beam does the maximum bending moment occur with respect to the shear force diagram?',
        'How does an indeterminate structure (e.g. continuous beam) differ from a determinate structure regarding temperature changes and support settlement?'
      ],
      idealAnswerPoints: [
        'Mathematical Relationship: dV/dx = -w(x) (rate of change of shear force equals negative distributed load), and dM/dx = V(x) (rate of change of bending moment equals shear force)',
        'Maximum Bending Moment: Occurs where shear force crosses zero (V = 0) or changes sign',
        'Point of Contraflexure: The location along the beam where the bending moment changes sign (from sagging/positive to hogging/negative); at this point, M = 0 and curvature changes direction',
        'Construction sequence: 1. Calculate support reactions using static equilibrium (sum Fx = 0, sum Fy = 0, sum M = 0); 2. Draw SFD across segments; 3. Locate zero-shear points; 4. Integrate SFD area to plot BMD'
      ],
      explanation: 'Foundational civil and structural mechanics topic testing equilibrium, internal beam forces, and beam behavior under loads.',
      learningExplanation: 'The derivative relationship dM/dx = V proves that where shear force equals zero, the bending moment is at an extreme value (local maximum or minimum). Knowing points of contraflexure is critical because tensile steel reinforcement must switch from bottom to top of the beam.',
      whatToStudyNext: 'Moment Distribution Method (Hardy Cross) and slope-deflection equations for continuous beams.',
      recommendedPracticeQuestion: 'For a simply supported beam of span 6m carrying a UDL of 10 kN/m over its entire length, calculate maximum bending moment and draw SFD/BMD.'
    },
    {
      id: 'civil_concrete_rcc_lsm_02',
      department: 'Civil Engineering',
      subject: 'RCC & Concrete Technology',
      topic: 'Structural Analysis & Design',
      subtopic: 'Limit State Design & Mix Proportions',
      skill: 'Concrete Technology',
      difficulty: 'Intermediate',
      questionType: 'conceptual',
      question: 'Compare the Limit State Method (LSM) and the Working Stress Method (WSM) in Reinforced Concrete (RCC) design. Explain the difference between under-reinforced, balanced, and over-reinforced beam sections. Why do building codes strictly require beams to be designed as under-reinforced?',
      keywords: ['rcc', 'limit state method', 'working stress method', 'under-reinforced', 'over-reinforced', 'concrete technology', 'ductile failure', 'brittle failure'],
      followUpTemplates: [
        'What is Abrams\' Law relating water-cement ratio to the 28-day compressive strength of concrete?',
        'What is the Slump Test, and how does workability affect concrete compaction and durability?'
      ],
      idealAnswerPoints: [
        'LSM vs WSM: WSM assumes linear elastic behavior with a single factor of safety applied to material strength under service loads; LSM accounts for actual non-linear plastic stress-strain behavior at ultimate loads using partial safety factors for materials (gamma_c=1.5, gamma_s=1.15) and loads',
        'Under-Reinforced Section: Steel yields before concrete reaches its ultimate crushing strain (0.0035); characterized by large cracks and significant deflection giving warning prior to collapse (ductile failure)',
        'Over-Reinforced Section: Concrete crushes suddenly in compression before steel yields; causes sudden, catastrophic explosive collapse without warning (brittle failure)',
        'Building codes (IS 456, ACI 318, Eurocode 2) mandate under-reinforced design to guarantee occupant safety and evacuation warning'
      ],
      explanation: 'Core RCC design principle testing failure modes, ductility, safety factors, and material non-linearity.',
      learningExplanation: 'Over-reinforced beams sound stronger because they have more steel, but they are dangerous death traps. Concrete fails in brittle explosion without warning. Under-reinforced beams guarantee steel yields first, giving dramatic visible sagging warnings before failure.',
      whatToStudyNext: 'Shear reinforcement design (stirrups) and development length (bond stress) in reinforced concrete beams.',
      recommendedPracticeQuestion: 'Calculate the limiting depth of neutral axis (x_u,max) for Fe 415 and Fe 500 grade steel in limit state design.'
    },
    {
      id: 'civil_geotech_terzaghi_soil_03',
      department: 'Civil Engineering',
      subject: 'Geotechnical & Foundation Engineering',
      topic: 'Geotechnical & Transportation Engineering',
      subtopic: 'Soil Bearing Capacity & Classification',
      skill: 'Geotechnical Engineering',
      difficulty: 'Intermediate',
      questionType: 'conceptual',
      question: 'State Terzaghi\'s bearing capacity equation for a shallow continuous strip foundation. Explain the three components of bearing capacity (cohesion, surcharge, and soil weight) and their bearing capacity factors (Nc, Nq, Ngamma). How does the presence of a shallow groundwater table affect ultimate bearing capacity?',
      keywords: ['geotechnical engineering', 'terzaghi', 'bearing capacity', 'shallow foundation', 'groundwater table', 'soil mechanics', 'settlement'],
      followUpTemplates: [
        'What is the difference between General Shear Failure, Local Shear Failure, and Punching Shear Failure in soils?',
        'Explain the Standard Proctor Compaction test and the relationship between Optimum Moisture Content (OMC) and Maximum Dry Density (MDD).'
      ],
      idealAnswerPoints: [
        'Terzaghi Equation: q_ult = c * Nc + q * Nq + 0.5 * gamma * B * Ngamma (where c = soil cohesion, q = gamma * Df surcharge, B = footing width, gamma = soil unit weight)',
        'Three Components: 1. c*Nc (cohesive shear resistance of soil along failure surface); 2. q*Nq (surcharge overburden pressure at foundation depth Df); 3. 0.5*gamma*B*Ngamma (frictional shear resistance of soil wedge beneath footing)',
        'Groundwater Table Effect: If water table rises to ground surface or foundation level, buoyant submerged unit weight (gamma_sub = gamma_sat - gamma_w ~ 0.5*gamma) must be used, which reduces ultimate bearing capacity by approximately 50%'
      ],
      explanation: 'Evaluates foundation soil mechanics, shear failure zones, and environmental groundwater impacts on bearing safety.',
      learningExplanation: 'Water reduces the effective stress in soil through pore water uplift pressure. When the water table reaches the footing base, effective soil weight is cut roughly in half, slashing the soil\'s load-bearing capability.',
      whatToStudyNext: 'Primary consolidation settlement calculation using Terzaghi\'s 1D consolidation theory, and deep pile foundation capacity.',
      recommendedPracticeQuestion: 'Calculate ultimate bearing capacity of a 2m wide strip footing at depth 1.5m in sand with gamma=18 kN/m3, phi=35 deg, Nq=33.3, Ngamma=41.4.'
    },
    {
      id: 'civil_surveying_total_station_04',
      department: 'Civil Engineering',
      subject: 'Surveying & Transportation',
      topic: 'Geotechnical & Transportation Engineering',
      subtopic: 'Total Station Surveying & Highway Geometry',
      skill: 'Surveying',
      difficulty: 'Intermediate',
      questionType: 'practical',
      question: 'Explain how an Electronic Total Station operates, integrating electronic theodolite angle measurements with Electronic Distance Measurement (EDM). In highway geometric design, define Superelevation (e), and derive the equilibrium equation balancing centrifugal force on a horizontal curve.',
      keywords: ['surveying', 'total station', 'edm', 'superelevation', 'horizontal curve', 'highway engineering', 'transportation'],
      followUpTemplates: [
        'What is a closed traverse, and how does Bowditch\'s (Compass) rule balance latitude and departure closing errors?',
        'What is the difference between flexible asphalt pavements and rigid concrete pavements regarding load distribution mechanisms?'
      ],
      idealAnswerPoints: [
        'Total Station: Combines digital theodolite (measures horizontal and vertical angles via digital rotary encoders) with infrared/laser EDM (calculates slope distance via light wave phase shift or time-of-flight) and an onboard microprocessor; automatically computes 3D coordinates (X, Y, Z / Northing, Easting, Elevation)',
        'Superelevation Concept: Inward transverse tilt given to highway cross-section on horizontal curves to counteract outward centrifugal force acting on vehicles',
        'Equilibrium Derivation: Centrifugal force F = m*v^2 / R resisted by component of gravity (W * sin theta ~ W * e) and lateral tire friction (f * W). Equilibrium equation: e + f = v^2 / (g * R) (or in practical highway units: e + f = V^2 / (127 * R))'
      ],
      explanation: 'Tests geospatial surveying instrumentation and transportation engineering highway geometry.',
      learningExplanation: 'Vehicles traveling around curves experience outward lateral acceleration. Tilting the outer roadway edge (superelevation) uses a component of the vehicle\'s own gravitational weight to balance centrifugal force, preventing rollover and skidding.',
      whatToStudyNext: 'Transition spiral curve design, stopping sight distance (SSD), and GIS spatial analysis.',
      recommendedPracticeQuestion: 'Design the superelevation required for a highway horizontal curve of radius 300m for a design speed of 80 km/h with f = 0.15.'
    }
  ],

  // ===========================================================================
  // 7. AUTOMOBILE ENGINEERING
  // ===========================================================================
  'Automobile Engineering': [
    {
      id: 'auto_ic_engine_four_stroke_01',
      department: 'Automobile Engineering',
      subject: 'IC Engines & Powertrain',
      topic: 'IC Engines & Powertrain Systems',
      subtopic: 'Engine Thermodynamics & Valve Timing',
      skill: 'Internal Combustion Engines',
      difficulty: 'Intermediate',
      questionType: 'conceptual',
      question: 'Explain the four strokes of an internal combustion engine (Suction, Compression, Power/Expansion, Exhaust). What is Valve Overlap, and why do intake and exhaust valves open before and close after Dead Centers in real engine Valve Timing Diagrams? Compare Turbocharging vs Supercharging.',
      keywords: ['ic engines', 'four stroke', 'valve timing', 'valve overlap', 'turbocharger', 'supercharger', 'powertrain', 'automotive'],
      followUpTemplates: [
        'What causes engine knocking/detonation in Spark Ignition (petrol) engines vs Compression Ignition (diesel) engines?',
        'How does variable valve timing (VVT / VTEC) optimize low-end torque and high-RPM power output?'
      ],
      idealAnswerPoints: [
        'Four Strokes: 1. Suction (piston moves TDC to BDC, intake valve open, draws air/fuel); 2. Compression (both valves closed, piston moves BDC to TDC); 3. Power (spark/injection ignites mixture, high pressure expands driving piston BDC); 4. Exhaust (exhaust valve opens, piston moves TDC expelling burned gases)',
        'Valve Overlap: Period at end of exhaust stroke and beginning of suction stroke where BOTH intake and exhaust valves are open simultaneously; uses outgoing exhaust momentum (scavenging) to draw fresh charge into cylinder',
        'Turbocharger vs Supercharger: Turbocharger is driven by waste exhaust gas turbine (free energy, but suffers from turbo lag); Supercharger is driven mechanically by engine crankshaft via belt (instant boost, but parasitical engine power loss)'
      ],
      explanation: 'Core automotive powertrain assessment on thermal engine cycles, breathing dynamics, and forced induction.',
      learningExplanation: 'Valves take physical time to open and close, and incoming air has inertia. Opening the intake valve before TDC (Valve Lead) and keeping it open after BDC (Valve Lag) maximizes cylinder volumetric efficiency at high RPM.',
      whatToStudyNext: 'Common Rail Direct Injection (CRDI) fuel delivery, and selective catalytic reduction (SCR) for NOx emission reduction.',
      recommendedPracticeQuestion: 'Sketch a practical valve timing diagram for a 4-stroke high-speed petrol engine showing IVO, IVC, EVO, and EVC angles.'
    },
    {
      id: 'auto_ev_battery_bms_02',
      department: 'Automobile Engineering',
      subject: 'Electric Vehicles & Hybrid Systems',
      topic: 'Electric Vehicles & Powertrain',
      subtopic: 'Battery Management Systems (BMS)',
      skill: 'Electric Vehicles',
      difficulty: 'Intermediate',
      questionType: 'conceptual',
      question: 'Explain the primary architecture and functions of a Battery Management System (BMS) in an Electric Vehicle. What is the difference between State of Charge (SoC) and State of Health (SoH)? Why is cell balancing (passive vs active) essential, and how does the thermal management system prevent Thermal Runaway?',
      keywords: ['electric vehicles', 'bms', 'soc', 'soh', 'cell balancing', 'thermal runaway', 'lithium-ion', 'battery pack'],
      followUpTemplates: [
        'What is Coulomb counting, and why must it be combined with Open Circuit Voltage (OCV) estimation for accurate SoC tracking?',
        'How does regenerative braking convert vehicle kinetic energy back into battery chemical energy via the traction inverter?'
      ],
      idealAnswerPoints: [
        'BMS Functions: Real-time cell voltage and current monitoring, temperature telemetry, State of Charge (SoC - available battery fuel %), State of Health (SoH - capacity retention over lifecycle), safety protection against overvoltage, undervoltage, and overcurrent',
        'Cell Balancing: Manufacturing differences cause cells in a series string to charge/discharge at slightly different rates. Passive balancing bleeds excess energy from highest cells as heat through resistors; Active balancing uses capacitive/inductive converters to transfer energy from high cells to lower cells',
        'Thermal Runaway: Exothermic self-sustaining chain reaction triggered when cell internal temperature exceeds safe threshold (~80°C - 150°C), breaking down SEI layer and releasing oxygen, causing smoke and fire. Liquid cooling plates circulate glycol coolant to maintain pack within 20°C - 35°C window'
      ],
      explanation: 'Critical EV competency testing electrochemical storage management, lifecycle estimation, and high-voltage safety.',
      learningExplanation: 'In a series battery pack, the entire pack is only as strong as its weakest cell. Without cell balancing, the weakest cell hits cutoff voltage earliest, prematurely ending charging or discharging and degrading the vehicle range.',
      whatToStudyNext: 'Permanent Magnet Synchronous Motor (PMSM) vs AC Induction Motor for EV traction, and DC fast charging protocols (CCS2).',
      recommendedPracticeQuestion: 'Explain why lithium plating occurs during sub-zero ambient temperature fast charging.'
    },
    {
      id: 'auto_dynamics_braking_abs_03',
      department: 'Automobile Engineering',
      subject: 'Vehicle Dynamics & Chassis Systems',
      topic: 'Chassis, Suspension & Braking',
      subtopic: 'Anti-lock Braking System (ABS) & Dynamics',
      skill: 'Braking Systems',
      difficulty: 'Intermediate',
      questionType: 'practical',
      question: 'Explain the operation of an Anti-lock Braking System (ABS). What is tire slip ratio (lambda), and how does ABS modulate hydraulic brake fluid pressure between pressure apply, hold, and release to prevent wheel lockup? Explain understeer vs oversteer during high-speed cornering.',
      keywords: ['abs', 'braking systems', 'slip ratio', 'wheel lockup', 'hydraulic modulator', 'understeer', 'oversteer', 'vehicle dynamics'],
      followUpTemplates: [
        'Why does a locked wheel lose directional steerability according to the friction circle (Kamm\'s circle)?',
        'What is Electronic Stability Program (ESP), and how does it selectively brake individual wheels to correct yaw moments?'
      ],
      idealAnswerPoints: [
        'ABS Working: Wheel speed sensors monitor angular deceleration. If a wheel approaches lockup (slip ratio exceeding ~15-20%), the ABS Hydraulic Electronic Control Unit (HECU) rapidly pulses solenoid valves (Release -> Hold -> Apply at 15-20 times per second)',
        'Tire Slip Ratio: lambda = (V_vehicle - r * omega) / V_vehicle. Peak longitudinal braking friction occurs around 15% to 20% slip; at 100% slip (locked wheel), kinetic friction drops and lateral cornering force drops to ZERO',
        'Directional Control: ABS prevents 100% lockup, preserving lateral cornering grip so the driver can steer around obstacles during panic stops',
        'Understeer: Front wheels lose grip first; vehicle pushes straight ahead ("plows"). Oversteer: Rear wheels lose grip first; vehicle tail slides out ("fishtailing")'
      ],
      explanation: 'Evaluates active chassis safety systems, tire-road tribology, and dynamic vehicle handling stability.',
      learningExplanation: 'Kamm\'s circle proves a tire has a finite total friction budget shared between braking and steering. A locked wheel consumes 100% of available traction in longitudinal sliding, leaving zero lateral traction for steering.',
      whatToStudyNext: 'MacPherson strut vs Double Wishbone suspension kinematics, and regenerative-friction brake blending.',
      recommendedPracticeQuestion: 'Calculate theoretical stopping distance for a 1500 kg vehicle traveling at 100 km/h on dry asphalt with coefficient of friction mu = 0.8.'
    },
    {
      id: 'auto_drivetrain_differential_04',
      department: 'Automobile Engineering',
      subject: 'Automotive Transmission Systems',
      topic: 'Drivetrain & Transmission',
      subtopic: 'Differential & Manual/Auto Transmissions',
      skill: 'Transmission Systems',
      difficulty: 'Intermediate',
      questionType: 'conceptual',
      question: 'Explain the working of an open mechanical Differential in automotive drivetrains. Why must drive wheels rotate at different speeds when cornering? What is the main drawback of an open differential when one wheel loses traction (e.g. on ice or mud), and how does a Limited-Slip Differential (LSD) solve this?',
      keywords: ['differential', 'drivetrain', 'limited-slip differential', 'lsd', 'transmission', 'sun gears', 'planetary gears', 'torque'],
      followUpTemplates: [
        'What is the difference between a torque-converter automatic transmission, dual-clutch transmission (DCT), and Continuously Variable Transmission (CVT)?',
        'How does a vehicle clutch transfer torque via friction, and what causes clutch slippage?'
      ],
      idealAnswerPoints: [
        'Differential Purpose: When turning a corner, the outer wheel travels along a larger arc radius than the inner wheel and must rotate faster; the differential allows input torque to split while letting axles rotate at differing angular speeds: (omega_left + omega_right) / 2 = omega_ring_gear',
        'Open Differential Drawback: An open differential always splits torque 50:50 between the two wheels. If one wheel is on frictionless ice (0 torque), the other wheel receives only 0 torque—the wheel on ice spins uselessly while the vehicle stays stranded',
        'Limited-Slip Differential (LSD): Uses multi-plate friction clutches, Torsen worm gears, or viscous couplings to lock the two axles together when a speed differential is detected, transferring torque to the wheel with high traction'
      ],
      explanation: 'Tests automotive drivetrain kinematics, planetary gearing, and torque distribution mechanics.',
      learningExplanation: 'Without a differential, both drive wheels would be locked at equal speeds, causing extreme tire scrubbing, axle windup, and uncontrollable understeer on turns. Open differentials distribute equal torque, so zero grip on one side immobilizes both wheels.',
      whatToStudyNext: 'Epicyclic gear train torque ratios, and CAN bus vehicle diagnostic messaging (OBD-II).',
      recommendedPracticeQuestion: 'Explain how an automotive torque converter achieves torque multiplication using stator redirector blades.'
    }
  ],

  // Default mapping for Data Science & Machine Learning Engineering
  'Data Science & Machine Learning Engineering': [
    {
      id: 'ds_ml_bias_variance_01',
      department: 'Data Science & Machine Learning Engineering',
      subject: 'Machine Learning',
      topic: 'Machine Learning & Model Optimization',
      subtopic: 'Generalization & Error Decomposition',
      skill: 'Machine Learning',
      difficulty: 'Intermediate',
      questionType: 'conceptual',
      question: 'Decompose expected prediction error into Bias, Variance, and Irreducible Noise. How do L1 (Lasso) and L2 (Ridge) regularization mathematically modify loss functions to prevent overfitting, and why does L1 produce sparse feature weights?',
      keywords: ['bias-variance tradeoff', 'l1 regularization', 'l2 regularization', 'lasso', 'ridge', 'sparsity', 'machine learning'],
      followUpTemplates: [
        'Under what circumstances would you choose ElasticNet over pure Lasso or Ridge?',
        'Why is feature standardization (StandardScaler) strictly required before fitting regularized linear models?'
      ],
      idealAnswerPoints: [
        'Error Decomposition: E[(y - f(x))^2] = Bias^2 + Variance + Irreducible Error (sigma^2)',
        'High Bias: Model too simple (underfitting); High Variance: Model fits noise (overfitting)',
        'L2 (Ridge): Adds lambda * sum(w_i^2); shrinks weights smoothly towards zero without setting them to exact zero',
        'L1 (Lasso): Adds lambda * sum(|w_i|); diamond-shaped constraint intersects loss contours at axes where w_i = 0, inducing strict parameter sparsity for feature selection'
      ],
      explanation: 'Fundamental ML statistical learning theory assessing regularization geometry and generalization error.',
      learningExplanation: 'L2 penalizes large weights proportionally, pulling them in smoothly. L1 penalizes weights at a constant rate sign(w), driving less important features strictly to zero and serving as built-in feature selection.',
      whatToStudyNext: 'Cross-validation strategies and Gradient Boosted Decision Trees (XGBoost/LightGBM).',
      recommendedPracticeQuestion: 'Write Scikit-learn pipeline code utilizing StandardScaler, RidgeCV, and cross_val_score.'
    }
  ]
};
