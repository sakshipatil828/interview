import { DatasetQuestion } from './types';

/**
 * Structured, editable Technical Interview Question Dataset.
 * Categorized by department, topic, subtopic, skill, difficulty, and question type,
 * with keywords, follow-up templates, coding challenges, and interactive technical SVG diagrams.
 */
export const TECHNICAL_QUESTION_DATASET: DatasetQuestion[] = [
  // =========================================================================
  // 1. COMPUTER SCIENCE & ENGINEERING (CSE)
  // =========================================================================
  {
    id: 'cs_coding_twosum_01',
    department: 'Computer Science & Engineering',
    subject: 'Data Structures & Algorithms',
    topic: 'Core Computer Science',
    subtopic: 'Hash Maps & Array Manipulation',
    skill: 'Data Structures',
    difficulty: 'Beginner',
    questionType: 'coding',
    question: 'Implement the Two Sum algorithm: Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target in O(n) time complexity.',
    keywords: ['data structures', 'algorithms', 'two sum', 'hashmap', 'dictionary', 'array', 'complexity', 'indices'],
    followUpTemplates: [
      'How does your hash map solution prevent duplicate index usage when nums contains duplicate values (e.g. [3, 3] target 6)?',
      'What are the memory trade-offs between this one-pass hash map approach and a two-pointer approach on a sorted array?'
    ],
    idealAnswerPoints: [
      'Maintain an auxiliary hash map (value -> index) while iterating through nums',
      'For each element x at index i, compute complement = target - x',
      'If complement exists in the map, return [map.get(complement), i]',
      'Time complexity is O(n) single pass; Space complexity is O(n) auxiliary map'
    ],
    explanation: 'Fundamental algorithmic problem testing array lookup optimization and hash table usage.',
    codingProblem: {
      title: 'Two Sum Problem',
      description: 'Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to `target`.\n\nYou may assume each input has exactly one solution, and you may not use the same element twice. Return the answer in any order.',
      defaultLanguage: 'javascript',
      starterCodes: {
        javascript: `function twoSum(nums, target) {
  // TODO: Return indices [i, j] in O(n) time
  const map = new Map();
  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];
    if (map.has(complement)) {
      return [map.get(complement), i];
    }
    map.set(nums[i], i);
  }
  return [];
}`,
        python: `def two_sum(nums, target):
    # TODO: Return indices in O(n) time using dictionary
    seen = {}
    for i, num in enumerate(nums):
        complement = target - num
        if complement in seen:
            return [seen[complement], i]
        seen[num] = i
    return []`,
        cpp: `#include <vector>
#include <unordered_map>

std::vector<int> twoSum(std::vector<int>& nums, int target) {
    std::unordered_map<int, int> seen;
    for (int i = 0; i < nums.size(); ++i) {
        int complement = target - nums[i];
        if (seen.find(complement) != seen.end()) {
            return {seen[complement], i};
        }
        seen[nums[i]] = i;
    }
    return {};
}`,
        java: `import java.util.HashMap;

public class Solution {
    public int[] twoSum(int[] nums, int target) {
        HashMap<Integer, Integer> map = new HashMap<>();
        for (int i = 0; i < nums.length; i++) {
            int complement = target - nums[i];
            if (map.containsKey(complement)) {
                return new int[] { map.get(complement), i };
            }
            map.put(nums[i], i);
        }
        return new int[0];
    }
}`
      },
      testCases: [
        {
          id: 'tc1',
          input: '[2, 7, 11, 15], 9',
          expectedOutput: '[0,1]',
          explanation: 'nums[0] + nums[1] == 2 + 7 == 9'
        },
        {
          id: 'tc2',
          input: '[3, 2, 4], 6',
          expectedOutput: '[1,2]',
          explanation: 'nums[1] + nums[2] == 2 + 4 == 6'
        }
      ],
      expectedTimeComplexity: 'O(n)',
      expectedSpaceComplexity: 'O(n)',
      hints: [
        'Can we use a hash map to look up if the required difference (target - current) has already been seen in O(1) time?',
        'Populate the map as you iterate through the list so you do not use the same index twice.'
      ]
    }
  },
  {
    id: 'cs_coding_valid_parens_02',
    department: 'Computer Science & Engineering',
    subject: 'Data Structures & Algorithms',
    topic: 'Core Computer Science',
    subtopic: 'Stack Data Structures & String Parsing',
    skill: 'Data Structures',
    difficulty: 'Intermediate',
    questionType: 'coding',
    question: 'Write a function to determine if an input string containing characters "(", ")", "{", "}", "[" and "]" is valid. Brackets must close in the correct order and match open brackets.',
    keywords: ['data structures', 'algorithms', 'stack', 'parentheses', 'validation', 'lifo', 'parsing'],
    followUpTemplates: [
      'How does your stack implementation handle edge cases such as strings starting with closing brackets or having odd lengths?',
      'If the string is 100MB in size and streamed via network, how would you optimize memory usage?'
    ],
    idealAnswerPoints: [
      'Use a Last-In-First-Out (LIFO) stack to store expected closing characters or open characters',
      'Early return false if string length is odd',
      'Push matching bracket when encountering opening bracket; pop and compare upon closing bracket',
      'Valid only if stack is completely empty at the end'
    ],
    explanation: 'Classic stack evaluation verifying understanding of recursive grammar parsing and LIFO semantics.',
    codingProblem: {
      title: 'Valid Parentheses Parser',
      description: 'Given a string `s` containing just the characters `(`, `)`, `{`, `}`, `[` and `]`, determine if the input string is valid.\n\nOpen brackets must be closed by the same type of brackets and in the correct order.',
      defaultLanguage: 'javascript',
      starterCodes: {
        javascript: `function isValid(s) {
  if (s.length % 2 !== 0) return false;
  const stack = [];
  const map = { ')': '(', '}': '{', ']': '[' };
  for (let char of s) {
    if (char === '(' || char === '{' || char === '[') {
      stack.push(char);
    } else {
      if (stack.pop() !== map[char]) return false;
    }
  }
  return stack.length === 0;
}`,
        python: `def is_valid(s: str) -> bool:
    if len(s) % 2 != 0:
        return False
    stack = []
    mapping = {')': '(', '}': '{', ']': '['}
    for char in s:
        if char in mapping.values():
            stack.append(char)
        elif char in mapping:
            if not stack or stack.pop() != mapping[char]:
                return False
    return len(stack) == 0`,
        cpp: `#include <string>
#include <stack>
#include <unordered_map>

bool isValid(std::string s) {
    if (s.length() % 2 != 0) return false;
    std::stack<char> st;
    for (char c : s) {
        if (c == '(' || c == '{' || c == '[') st.push(c);
        else {
            if (st.empty()) return false;
            char top = st.top(); st.pop();
            if (c == ')' && top != '(') return false;
            if (c == '}' && top != '{') return false;
            if (c == ']' && top != '[') return false;
        }
    }
    return st.empty();
}`,
        java: `import java.util.Stack;

public class Solution {
    public boolean isValid(String s) {
        if (s.length() % 2 != 0) return false;
        Stack<Character> stack = new Stack<>();
        for (char c : s.toCharArray()) {
            if (c == '(') stack.push(')');
            else if (c == '{') stack.push('}');
            else if (c == '[') stack.push(']');
            else if (stack.isEmpty() || stack.pop() != c) return false;
        }
        return stack.isEmpty();
    }
}`
      },
      testCases: [
        {
          id: 'tc1',
          input: '"()[]{}"',
          expectedOutput: 'true',
          explanation: 'All brackets match in correct order'
        },
        {
          id: 'tc2',
          input: '"(]"',
          expectedOutput: 'false',
          explanation: 'Round bracket cannot be closed by square bracket'
        }
      ],
      expectedTimeComplexity: 'O(n)',
      expectedSpaceComplexity: 'O(n)',
      hints: [
        'A Last-In-First-Out (Stack) structure matches the innermost closed bracket first.',
        'If the stack is non-empty at the end of the string, unclosed brackets remain.'
      ]
    }
  },
  {
    id: 'cs_flask_01',
    department: 'Computer Science & Engineering',
    subject: 'Web Technologies & Backend',
    topic: 'Backend Web & API Architecture',
    subtopic: 'Microframeworks & Routing',
    skill: 'Flask',
    difficulty: 'Intermediate',
    questionType: 'project-based',
    question: 'How do you structure a production RESTful API in Flask using Blueprints and Application Factories, and how do you handle centralized exception handling?',
    keywords: ['flask', 'blueprint', 'factory', 'rest', 'api', 'error', 'handler', 'jsonify', 'status', 'app', 'routes'],
    followUpTemplates: [
      'In your Flask project, how did you manage database session lifecycles and connection pooling with SQLAlchemy under high concurrency?',
      'How does Flask WSGI execution compare to ASGI frameworks like FastAPI when handling asynchronous I/O-bound requests?'
    ],
    idealAnswerPoints: [
      'Application factory pattern creates app instances dynamically, easing unit testing and config switching',
      'Blueprints organize endpoints into modular route packages (e.g. auth, api_v1, users)',
      'Custom error handlers registered via @app.errorhandler() or Blueprint.errorhandler() returning uniform JSON envelopes',
      'Separation of config environments (Development, Testing, Production)'
    ],
    explanation: 'Evaluates architectural knowledge of Flask microframework beyond simple single-file scripts.'
  },
  {
    id: 'cs_rest_01',
    department: 'Computer Science & Engineering',
    subject: 'Web Technologies & Backend',
    topic: 'Backend Web & API Architecture',
    subtopic: 'RESTful Protocols & HTTP',
    skill: 'REST APIs',
    difficulty: 'Beginner',
    questionType: 'conceptual',
    question: 'Explain the difference between idempotent and non-idempotent HTTP methods in REST APIs. Which methods (GET, POST, PUT, DELETE, PATCH) are idempotent and why?',
    keywords: ['rest', 'api', 'idempotent', 'http', 'get', 'post', 'put', 'delete', 'patch', 'safe'],
    followUpTemplates: [
      'If a network timeout occurs during a payment POST request, how do you enforce idempotency on the server using Idempotency Keys?',
      'When would you choose PATCH over PUT when modifying relational resources?'
    ],
    idealAnswerPoints: [
      'Idempotence means making multiple identical requests has the same side-effect on server state as making a single request',
      'GET, HEAD, OPTIONS are safe and idempotent',
      'PUT and DELETE are idempotent because repeating PUT with identical payload yields same resource state, and deleting twice leaves resource gone',
      'POST is NOT idempotent because multiple calls create multiple distinct resources',
      'PATCH is generally non-idempotent unless designed carefully'
    ],
    explanation: 'Core API design principle testing comprehension of HTTP semantics and distributed state safety.'
  },
  {
    id: 'cs_mysql_01',
    department: 'Computer Science & Engineering',
    subject: 'Database Management Systems',
    topic: 'Database Systems',
    subtopic: 'Relational SQL & Indexing',
    skill: 'MySQL',
    difficulty: 'Intermediate',
    questionType: 'practical',
    question: 'How do B-Tree indexes work in MySQL (InnoDB), and why does a query using "SELECT * WHERE age > 25 ORDER BY created_at" sometimes cause a filesort instead of using an index?',
    keywords: ['mysql', 'innodb', 'btree', 'index', 'composite', 'filesort', 'explain', 'query', 'execution', 'order by'],
    followUpTemplates: [
      'How do you design a composite index (age, created_at) to avoid filesort and satisfy both filtering and sorting?',
      'What is the difference between a Clustered Index and a Secondary Non-Clustered Index in InnoDB storage engine?'
    ],
    idealAnswerPoints: [
      'InnoDB primary key is clustered; secondary indexes store secondary key + primary key pointer in a balanced B+Tree',
      'Composite indexes follow the Leftmost Prefix Rule',
      'A range condition on the first column (age > 25) prevents subsequent columns in the index from being used for ordered scanning, forcing the optimizer into a filesort',
      'Using EXPLAIN helps verify if type is range, ref, or index, and inspect Extra: Using filesort'
    ],
    explanation: 'Diagnostic database knowledge distinguishing basic SQL query writers from production engineers.'
  },
  {
    id: 'cs_docker_01',
    department: 'Computer Science & Engineering',
    subject: 'DevOps & Systems',
    topic: 'DevOps & Cloud Systems',
    subtopic: 'Containerization & Isolation',
    skill: 'Docker',
    difficulty: 'Beginner',
    questionType: 'practical',
    question: 'What is the architectural difference between a Docker container and a Virtual Machine? How do Linux Namespaces and cgroups enable container isolation?',
    keywords: ['docker', 'container', 'virtual machine', 'cgroups', 'namespaces', 'isolation', 'hypervisor', 'kernel'],
    followUpTemplates: [
      'How do multi-stage Docker builds reduce production image size and eliminate build-time security vulnerabilities?',
      'What is the difference between Docker bridge networking and host networking?'
    ],
    idealAnswerPoints: [
      'VMs virtualize hardware via Hypervisor and run a full guest OS with separate kernel',
      'Docker containers share the host Linux kernel and isolate processes using kernel features',
      'Namespaces isolate view (PID, NET, MNT, IPC, UTS); cgroups restrict resource usage (CPU, memory, disk I/O)'
    ],
    explanation: 'Infrastructure and containerization fundamentals.'
  },
  {
    id: 'cs_sysdesign_01',
    department: 'Computer Science & Engineering',
    subject: 'System Architecture',
    topic: 'Distributed Systems',
    subtopic: 'Scalability & Load Balancing',
    skill: 'System Design',
    difficulty: 'Advanced',
    questionType: 'scenario',
    question: 'Design a scalable URL shortening service (like Bitly) handling 100M new URLs per month and 1B reads per month. How do you design ID generation, caching, and database storage?',
    keywords: ['system design', 'scalability', 'url shortener', 'base62', 'cache', 'redis', 'nosql', 'sharding', 'hashing'],
    followUpTemplates: [
      'How would you handle cache eviction and cache stampede when an ultra-viral link is accessed simultaneously by millions?',
      'Compare Base62 encoding of an auto-incrementing integer counter vs MD5/SHA256 hashing with collision resolution.'
    ],
    idealAnswerPoints: [
      'Capacity planning: 100M writes/mo ≈ 40 writes/sec, 1B reads/mo ≈ 400 reads/sec (read-heavy system)',
      'Storage requirement: 100M * 500 bytes ≈ 50GB/mo',
      'Base62 encoding provides 62^7 ≈ 3.5 trillion unique short URLs using a 7-character string',
      'Redis LRU caching layer caches top 20% viral URLs to serve 80% read traffic directly from RAM'
    ],
    explanation: 'High-level architectural problem assessing distributed scaling, capacity planning, and caching.'
  },

  // =========================================================================
  // 2. INFORMATION TECHNOLOGY (IT)
  // =========================================================================
  {
    id: 'it_cloud_01',
    department: 'Information Technology',
    subject: 'Cloud Infrastructure & Networking',
    topic: 'Cloud Computing & Infrastructure',
    subtopic: 'AWS, Azure & Virtualization',
    skill: 'Cloud Architecture',
    difficulty: 'Intermediate',
    questionType: 'problem-solving',
    question: 'Design a highly available 3-tier web application architecture across two AWS Availability Zones. How do you configure public vs private subnets, NAT Gateways, and ALB SSL termination?',
    keywords: ['cloud', 'aws', 'vpc', 'subnet', 'nat gateway', 'alb', 'load balancer', 'availability zone', 'security group'],
    followUpTemplates: [
      'Why should database instances (RDS) never be placed in public subnets, and how does a Bastion Host or SSM Session Manager provide secure admin access?',
      'How do AWS Auto Scaling Groups use target tracking scaling policies with Application Load Balancer request counts?'
    ],
    idealAnswerPoints: [
      'VPC partitioned across 2 Availability Zones with public and private subnets in each AZ',
      'Public subnets host Internet-facing Application Load Balancer and NAT Gateways',
      'Private subnets host application EC2/ECS instances with route tables pointing to NAT Gateways for outbound internet',
      'Isolated private subnets host Multi-AZ RDS relational database with replication across AZs',
      'Security group chaining ensures DB only accepts traffic from application security groups on port 5432/3306'
    ],
    explanation: 'Tests enterprise cloud infrastructure patterns, network isolation, and high availability design.'
  },
  {
    id: 'it_networking_01',
    department: 'Information Technology',
    subject: 'Computer Networks',
    topic: 'Networking & Protocols',
    subtopic: 'TCP/IP, OSI Model & Routing',
    skill: 'Computer Networks',
    difficulty: 'Beginner',
    questionType: 'conceptual',
    question: 'Explain what happens during the TCP Three-Way Handshake (SYN, SYN-ACK, ACK) and Four-Way Teardown (FIN, ACK, FIN, ACK). Why does TCP maintain a TIME_WAIT state?',
    keywords: ['computer networks', 'tcp', 'three way handshake', 'syn', 'ack', 'fin', 'time_wait', 'osi', 'transport layer'],
    followUpTemplates: [
      'What is a SYN Flood attack, and how do SYN Cookies mitigate connection queue exhaustion at the operating system level?',
      'Compare TCP Flow Control (Sliding Window) with TCP Congestion Control (Slow Start, Congestion Avoidance, Fast Retransmit).'
    ],
    idealAnswerPoints: [
      'Client sends SYN with initial sequence number (ISN_c)',
      'Server responds with SYN-ACK with its own sequence number (ISN_s) and ACK (ISN_c + 1)',
      'Client replies with ACK (ISN_s + 1), completing full-duplex socket establishment',
      'TIME_WAIT lasts 2 * MSL (Maximum Segment Lifetime) to ensure delayed packets clear network and final ACK reaches peer'
    ],
    explanation: 'Core transport layer network protocol fundamentals.'
  },
  {
    id: 'it_cybersec_01',
    department: 'Information Technology',
    subject: 'Information & Network Security',
    topic: 'Information & Network Security',
    subtopic: 'Cryptography, Firewalls & OWASP',
    skill: 'Cybersecurity',
    difficulty: 'Intermediate',
    questionType: 'scenario',
    question: 'How do you prevent Cross-Site Scripting (XSS) and Cross-Site Request Forgery (CSRF) in modern single-page applications? Compare SameSite cookie attributes with JWT tokens in Authorization headers.',
    keywords: ['cybersecurity', 'owasp', 'xss', 'csrf', 'samesite', 'jwt', 'tokens', 'http-only', 'csp'],
    followUpTemplates: [
      'Why is storing sensitive JWT tokens in localStorage vulnerable to stored/DOM XSS, and how do HttpOnly + Secure cookies protect them?',
      'How does Content Security Policy (CSP) restrict inline script execution and unauthorized external script fetching?'
    ],
    idealAnswerPoints: [
      'XSS: Attacker injects malicious JavaScript executed in user browser; prevented via context-aware output encoding, React JSX escaping, and strict CSP',
      'CSRF: Unauthorized commands transmitted from a trusted user; prevented via Anti-CSRF synchronization tokens and SameSite=Lax/Strict cookie flags',
      'HttpOnly cookies prevent JavaScript document.cookie access, protecting session tokens from XSS exfiltration'
    ],
    explanation: 'Application security concepts essential for web and enterprise systems.'
  },
  {
    id: 'it_linux_01',
    department: 'Information Technology',
    subject: 'Operating Systems & Administration',
    topic: 'Operating Systems & Shell',
    subtopic: 'Bash Scripting & Process Management',
    skill: 'Linux Administration',
    difficulty: 'Intermediate',
    questionType: 'practical',
    question: 'In Linux system administration, a production server reports 100% CPU utilization and high load average. How do you triage the issue using top/htop, vmstat, and iostat, and how do you differentiate CPU-bound from I/O-wait bottlenecks?',
    keywords: ['linux', 'sysadmin', 'load average', 'top', 'vmstat', 'iostat', 'iowait', 'process', 'cpu', 'bash'],
    followUpTemplates: [
      'If vmstat shows high "b" (blocked processes) and high "%wa" in top, what storage subsystem diagnostic steps would you execute?',
      'How do systemd units manage service restarts, resource limits (MemoryMax, CPUQuota), and journal logging?'
    ],
    idealAnswerPoints: [
      'Load average represents the number of runnable and uninterruptible (D state) processes queued for CPU or disk',
      'Check top / htop: %us (user CPU), %sy (system kernel CPU), %wa (I/O wait)',
      'High %wa indicates storage/disk I/O saturation, confirmed with iostat -xz 1 inspecting %util and await times',
      'vmstat 1 verifies swapping (si/so) and context switches (cs); lsof / fuser identifies processes holding files'
    ],
    explanation: 'Hands-on server troubleshooting and performance diagnostics.'
  },

  // =========================================================================
  // 3. ELECTRONICS & COMMUNICATION ENGINEERING (ECE)
  // =========================================================================
  {
    id: 'ece_opamp_diagram_01',
    department: 'Electronics & Communication Engineering',
    subject: 'Analog Circuits & Instrumentation',
    topic: 'Signal Processing & Systems',
    subtopic: 'Operational Amplifiers & Feedback',
    skill: 'Digital Signal Processing',
    difficulty: 'Beginner',
    questionType: 'diagram-based',
    question: 'Refer to the Inverting Op-Amp Circuit diagram shown below. Calculate the closed-loop voltage gain (Av) and output voltage (Vout) for an input Vin = 0.4V with Rin = 10kΩ and Rf = 100kΩ. What is the significance of the virtual ground at the inverting terminal?',
    keywords: ['op-amp', 'inverting amplifier', 'gain', 'virtual ground', 'feedback', 'operational amplifier', 'analog circuits'],
    followUpTemplates: [
      'If the op-amp has dual supplies of ±12V, what happens if the input voltage Vin is increased to 2.0V?',
      'How does the finite Open-Loop Gain (Aol = 100,000) and Gain-Bandwidth Product (GBW = 1MHz) limit the maximum frequency of amplification?'
    ],
    idealAnswerPoints: [
      'Ideal op-amp assumptions: Infinite input impedance (zero input bias current), infinite open-loop gain',
      'Non-inverting terminal (+) is grounded (0V), creating a Virtual Ground (0V) at inverting terminal (-) due to negative feedback',
      'Current through Rin: I = Vin / Rin = 0.4V / 10kΩ = 40μA',
      'All current flows through feedback resistor: Vout = -I * Rf = -(Rf / Rin) * Vin = -(100k / 10k) * 0.4V = -4.0V',
      'Closed loop gain Av = -Rf / Rin = -10'
    ],
    explanation: 'Fundamental operational amplifier analysis testing circuit equations, negative feedback, and virtual ground concept.',
    diagram: {
      type: 'circuit',
      title: 'Inverting Operational Amplifier Schematic',
      caption: 'Standard closed-loop inverting amplifier with negative feedback loop Rf and input resistor Rin.',
      specs: {
        'Rin (Input Resistor)': '10 kΩ',
        'Rf (Feedback Resistor)': '100 kΩ',
        'Supply Rails': '±15 V DC',
        'Target Vin': '0.4 V DC'
      },
      technicalNotes: [
        'Terminal 2 (Inverting Input): Virtual Ground at 0V potential.',
        'Terminal 3 (Non-Inverting Input): Connected directly to Common Ground (0V).',
        'Rf provides negative feedback stabilizing closed-loop gain Av = -Rf / Rin.'
      ],
      svgContent: `<svg viewBox="0 0 540 240" width="100%" height="220" xmlns="http://www.w3.org/2000/svg">
        <rect width="540" height="240" fill="#0b1120" rx="12"/>
        <line x1="40" y1="90" x2="110" y2="90" stroke="#60a5fa" stroke-width="3"/>
        <circle cx="40" cy="90" r="4" fill="#60a5fa"/>
        <text x="35" y="75" fill="#93c5fd" font-family="monospace" font-size="12" font-weight="bold">Vin</text>
        
        <!-- Rin Resistor -->
        <rect x="110" y="80" width="60" height="20" fill="#1e293b" stroke="#38bdf8" stroke-width="2"/>
        <text x="122" y="95" fill="#f8fafc" font-family="monospace" font-size="11" font-weight="bold">Rin=10k</text>
        
        <line x1="170" y1="90" x2="240" y2="90" stroke="#60a5fa" stroke-width="3"/>
        <circle cx="210" cy="90" r="5" fill="#38bdf8"/>
        
        <!-- Op-Amp Triangle -->
        <polygon points="240,60 240,160 340,110" fill="#1e293b" stroke="#818cf8" stroke-width="3"/>
        
        <!-- Inverting (-) and Non-Inverting (+) -->
        <text x="248" y="95" fill="#ef4444" font-family="monospace" font-size="16" font-weight="bold">-</text>
        <text x="248" y="135" fill="#10b981" font-family="monospace" font-size="16" font-weight="bold">+</text>
        
        <!-- Ground on Non-Inverting -->
        <line x1="210" y1="130" x2="240" y2="130" stroke="#60a5fa" stroke-width="3"/>
        <line x1="210" y1="130" x2="210" y2="160" stroke="#60a5fa" stroke-width="3"/>
        <line x1="195" y1="160" x2="225" y2="160" stroke="#64748b" stroke-width="3"/>
        <line x1="200" y1="166" x2="220" y2="166" stroke="#64748b" stroke-width="2"/>
        <line x1="205" y1="172" x2="215" y2="172" stroke="#64748b" stroke-width="2"/>
        <text x="160" y="170" fill="#94a3b8" font-family="monospace" font-size="10">GND (0V)</text>
        
        <!-- Feedback Loop Rf -->
        <line x1="210" y1="90" x2="210" y2="35" stroke="#60a5fa" stroke-width="3"/>
        <line x1="210" y1="35" x2="250" y2="35" stroke="#60a5fa" stroke-width="3"/>
        <rect x="250" y="25" width="70" height="20" fill="#1e293b" stroke="#fbbf24" stroke-width="2"/>
        <text x="260" y="40" fill="#fde047" font-family="monospace" font-size="11" font-weight="bold">Rf=100k</text>
        <line x1="320" y1="35" x2="380" y2="35" stroke="#60a5fa" stroke-width="3"/>
        <line x1="380" y1="35" x2="380" y2="110" stroke="#60a5fa" stroke-width="3"/>
        
        <!-- Output -->
        <line x1="340" y1="110" x2="480" y2="110" stroke="#34d399" stroke-width="3"/>
        <circle cx="380" cy="110" r="5" fill="#34d399"/>
        <circle cx="480" cy="110" r="4" fill="#34d399"/>
        <text x="440" y="95" fill="#6ee7b7" font-family="monospace" font-size="13" font-weight="bold">Vout = -4.0V</text>
        
        <!-- Node annotations -->
        <text x="180" y="115" fill="#fca5a5" font-family="monospace" font-size="10">Virtual GND</text>
        <text x="260" y="195" fill="#a5b4fc" font-family="sans-serif" font-size="11">Av = -Rf / Rin = -100k / 10k = -10</text>
      </svg>`
    }
  },
  {
    id: 'ece_timing_waveform_02',
    department: 'Electronics & Communication Engineering',
    subject: 'Digital System Design & VLSI',
    topic: 'Semiconductor & VLSI',
    subtopic: 'CMOS Inverters & Setup/Hold Timing',
    skill: 'VLSI Design',
    difficulty: 'Intermediate',
    questionType: 'diagram-based',
    question: 'Examine the Flip-Flop Setup and Hold Timing Waveform shown below. Define Setup Time (Tsetup) and Hold Time (Thold). What causes a setup time violation at higher clock frequencies, and what happens to flip-flop output Q when metastability occurs?',
    keywords: ['vlsi', 'setup time', 'hold time', 'timing closure', 'metastability', 'flip-flop', 'clock skew', 'digital electronics'],
    followUpTemplates: [
      'How does Clock Skew (Tskew = Tclk2 - Tclk1) alleviate setup time but worsen hold time in sequential digital pipelines?',
      'Can hold time violations be fixed by lowering the clock frequency? If not, how are they fixed during physical design?'
    ],
    idealAnswerPoints: [
      'Setup time (Tsetup) is the minimum time data D must be stable before the active clock edge',
      'Hold time (Thold) is the minimum time data D must remain stable after the active clock edge',
      'At higher clock frequencies (smaller Tclk), maximum combinational delay Tcomb_max violates Tclk >= Tcq + Tcomb_max + Tsetup - Tskew',
      'Metastability occurs when D transitions inside the setup/hold aperture window, causing output Q to oscillate or hover between logic levels for an indeterminate duration',
      'Hold violations cannot be fixed by lowering frequency because hold timing is independent of clock period (fixed by inserting delay buffers)'
    ],
    explanation: 'Critical VLSI digital timing analysis assessing timing closure, path margins, and flip-flop metastability.',
    diagram: {
      type: 'waveform',
      title: 'D Flip-Flop Setup & Hold Timing Aperture',
      caption: 'Temporal requirement window around the active clock rising edge.',
      specs: {
        'Clock Frequency': '500 MHz (T = 2.0 ns)',
        'Required Tsetup': '250 ps',
        'Required Thold': '150 ps',
        'Metastable Risk Window': '±100 ps around clock transition'
      },
      technicalNotes: [
        'Data line D must not toggle during the shaded blue aperture window.',
        'Tcq is the propagation delay from active clock edge to valid output Q.',
        'Setup violations are fixed by pipeline registers or reducing combinational logic.'
      ],
      svgContent: `<svg viewBox="0 0 540 220" width="100%" height="200" xmlns="http://www.w3.org/2000/svg">
        <rect width="540" height="220" fill="#0b1120" rx="12"/>
        
        <!-- Timeline grid lines -->
        <line x1="260" y1="20" x2="260" y2="190" stroke="#f43f5e" stroke-dasharray="4" stroke-width="2"/>
        <text x="264" y="32" fill="#fda4af" font-family="monospace" font-size="10">Active Clock Edge</text>
        
        <!-- Setup window shaded -->
        <rect x="180" y="40" width="80" height="140" fill="#6366f1" fill-opacity="0.15"/>
        <rect x="260" y="40" width="60" height="140" fill="#10b981" fill-opacity="0.15"/>
        
        <!-- CLOCK Waveform -->
        <text x="20" y="70" fill="#94a3b8" font-family="monospace" font-size="12" font-weight="bold">CLK</text>
        <path d="M 60,80 L 140,80 L 140,50 L 220,50 L 220,80 L 260,80 L 260,50 L 340,50 L 340,80 L 420,80 L 420,50 L 500,50" 
              fill="none" stroke="#38bdf8" stroke-width="3"/>
              
        <!-- DATA (D) Waveform -->
        <text x="20" y="125" fill="#94a3b8" font-family="monospace" font-size="12" font-weight="bold">DATA (D)</text>
        <path d="M 60,135 L 170,135 L 180,105 L 340,105 L 350,135 L 500,135" 
              fill="none" stroke="#f59e0b" stroke-width="3"/>
              
        <!-- OUTPUT (Q) Waveform -->
        <text x="20" y="175" fill="#94a3b8" font-family="monospace" font-size="12" font-weight="bold">OUT (Q)</text>
        <path d="M 60,180 L 290,180 L 295,155 L 500,155" 
              fill="none" stroke="#10b981" stroke-width="3"/>
              
        <!-- Annotations -->
        <line x1="180" y1="100" x2="260" y2="100" stroke="#818cf8" stroke-width="2"/>
        <text x="195" y="95" fill="#c7d2fe" font-family="monospace" font-size="11" font-weight="bold">← Tsetup →</text>
        
        <line x1="260" y1="100" x2="320" y2="100" stroke="#34d399" stroke-width="2"/>
        <text x="268" y="95" fill="#a7f3d0" font-family="monospace" font-size="11" font-weight="bold">←Thold→</text>
        
        <line x1="260" y1="170" x2="295" y2="170" stroke="#f43f5e" stroke-width="2"/>
        <text x="300" y="172" fill="#fca5a5" font-family="monospace" font-size="10">Tcq delay</text>
      </svg>`
    }
  },
  {
    id: 'ece_verilog_01',
    department: 'Electronics & Communication Engineering',
    subject: 'Digital System Design & VLSI',
    topic: 'Digital System Design & VLSI',
    subtopic: 'RTL Modeling & FSM Synthesis',
    skill: 'Verilog HDL',
    difficulty: 'Intermediate',
    questionType: 'practical',
    question: 'Explain the critical differences between blocking assignments (=) and non-blocking assignments (<=) in Verilog HDL. What race conditions occur in sequential always @(posedge clk) blocks when using blocking assignments?',
    keywords: ['verilog', 'blocking', 'non-blocking', 'race condition', 'rtl', 'synthesis', 'simulation', 'fsm'],
    followUpTemplates: [
      'In a Moore vs Mealy Finite State Machine (FSM), which model reacts faster to input changes and why does Mealy FSM output have potential combinational glitches?',
      'How does unintentional latch inference occur in Verilog combinational always @(*) blocks?'
    ],
    idealAnswerPoints: [
      'Blocking assignments (=) evaluate and update immediately in sequential order within the procedural block',
      'Non-blocking assignments (<=) evaluate right-hand side expressions concurrently at time step start and schedule updates for the end of time step (NBA region)',
      'Sequential logic (flip-flops) must use non-blocking assignments (<=) to prevent simulation race conditions between chained registers',
      'Combinational logic (multiplexers, adders) must use blocking assignments (=)'
    ],
    explanation: 'Hardware description language synthesis semantics and simulation race avoidance.'
  },

  // =========================================================================
  // 4. ELECTRICAL & ELECTRONICS ENGINEERING (EEE)
  // =========================================================================
  {
    id: 'eee_transformer_diagram_01',
    department: 'Electrical & Electronics Engineering',
    subject: 'Electrical Machines & Transformers',
    topic: 'Electric Machines & Drives',
    subtopic: 'Transformers, Induction Motors & Alternators',
    skill: 'Electrical Machines',
    difficulty: 'Intermediate',
    questionType: 'diagram-based',
    question: 'Review the Single-Phase Transformer Equivalent Circuit diagram referred to the primary winding. Identify the roles of Rc and Xm in the shunt branch. How are parameters (Rc, Xm) determined from the Open Circuit (OC) test, and (Req, Xeq) determined from the Short Circuit (SC) test?',
    keywords: ['transformer', 'equivalent circuit', 'open circuit test', 'short circuit test', 'core loss', 'leakage reactance', 'magnetizing', 'electrical machines'],
    followUpTemplates: [
      'Why is the Open Circuit (OC) test conducted at rated voltage on the Low Voltage (LV) winding while the High Voltage (HV) side remains open?',
      'Explain how Transformer Voltage Regulation varies with lagging, unity, and leading power factor loads.'
    ],
    idealAnswerPoints: [
      'Rc represents core loss resistance (eddy current and hysteresis losses in the magnetic core laminations)',
      'Xm represents magnetizing reactance required to establish mutual flux in the ferromagnetic core',
      'Open Circuit test: rated voltage applied to LV winding with HV open; measures no-load current Io and no-load power Po to calculate Rc and Xm',
      'Short Circuit test: low voltage applied to HV winding with LV short-circuited; rated current flows to measure copper losses Psc and find series parameters Req and Xeq',
      'R2 and X2 are referred to primary by multiplying with turns ratio squared: R2\' = R2 / k^2'
    ],
    explanation: 'Core electrical machines analysis verifying equivalent circuit modeling and experimental test procedures.',
    diagram: {
      type: 'circuit',
      title: 'Single-Phase Transformer Equivalent Circuit (Referred to Primary)',
      caption: 'Exact equivalent circuit showing series winding impedances and parallel shunt magnetizing branch.',
      specs: {
        'Rated Voltage': '2300V / 230V, 50 Hz',
        'Rated Power': '50 kVA',
        'Turns Ratio k': 'N2 / N1 = 0.1',
        'Core Shunt Branch': 'Rc (Loss) || Xm (Magnetizing)'
      },
      technicalNotes: [
        'R1, X1: Primary winding resistance and leakage reactance.',
        'Rc, Xm: Core shunt excitation branch accounting for iron losses and flux establishment.',
        'R2\', X2\': Secondary winding impedance referred to primary side.'
      ],
      svgContent: `<svg viewBox="0 0 540 240" width="100%" height="220" xmlns="http://www.w3.org/2000/svg">
        <rect width="540" height="240" fill="#0b1120" rx="12"/>
        
        <!-- Input Terminal V1 -->
        <circle cx="35" cy="50" r="4" fill="#38bdf8"/>
        <circle cx="35" cy="190" r="4" fill="#38bdf8"/>
        <text x="25" y="40" fill="#38bdf8" font-family="monospace" font-size="12" font-weight="bold">+ V1</text>
        <text x="25" y="210" fill="#38bdf8" font-family="monospace" font-size="12" font-weight="bold">-</text>
        
        <!-- Primary Series Impedance R1 & X1 -->
        <line x1="35" y1="50" x2="80" y2="50" stroke="#60a5fa" stroke-width="3"/>
        <rect x="80" y="42" width="45" height="16" fill="#1e293b" stroke="#38bdf8" stroke-width="2"/>
        <text x="92" y="54" fill="#f8fafc" font-family="monospace" font-size="10">R1</text>
        
        <line x1="125" y1="50" x2="145" y2="50" stroke="#60a5fa" stroke-width="3"/>
        <!-- Inductor X1 coils -->
        <path d="M 145,50 Q 155,35 165,50 Q 175,35 185,50 Q 195,35 205,50" fill="none" stroke="#fbbf24" stroke-width="3"/>
        <text x="170" y="30" fill="#fde047" font-family="monospace" font-size="10">jX1</text>
        
        <!-- Shunt Branch Node -->
        <line x1="205" y1="50" x2="260" y2="50" stroke="#60a5fa" stroke-width="3"/>
        <circle cx="260" cy="50" r="4" fill="#60a5fa"/>
        
        <!-- Shunt Rc & Xm -->
        <line x1="260" y1="50" x2="260" y2="80" stroke="#60a5fa" stroke-width="2"/>
        <line x1="230" y1="80" x2="290" y2="80" stroke="#60a5fa" stroke-width="2"/>
        
        <!-- Rc branch -->
        <line x1="230" y1="80" x2="230" y2="100" stroke="#60a5fa" stroke-width="2"/>
        <rect x="220" y="100" width="20" height="35" fill="#1e293b" stroke="#f87171" stroke-width="2"/>
        <text x="218" y="150" fill="#fca5a5" font-family="monospace" font-size="9">Rc (Core)</text>
        <line x1="230" y1="135" x2="230" y2="170" stroke="#60a5fa" stroke-width="2"/>
        
        <!-- Xm branch -->
        <line x1="290" y1="80" x2="290" y2="100" stroke="#60a5fa" stroke-width="2"/>
        <path d="M 290,100 Q 305,107 290,115 Q 305,122 290,130 Q 305,137 290,145" fill="none" stroke="#fbbf24" stroke-width="2"/>
        <text x="282" y="160" fill="#fde047" font-family="monospace" font-size="9">jXm (Mag)</text>
        <line x1="290" y1="145" x2="290" y2="170" stroke="#60a5fa" stroke-width="2"/>
        
        <line x1="230" y1="170" x2="290" y2="170" stroke="#60a5fa" stroke-width="2"/>
        <line x1="260" y1="170" x2="260" y2="190" stroke="#60a5fa" stroke-width="2"/>
        <circle cx="260" cy="190" r="4" fill="#60a5fa"/>
        
        <!-- Secondary Referred R2' and X2' -->
        <line x1="260" y1="50" x2="330" y2="50" stroke="#60a5fa" stroke-width="3"/>
        <rect x="330" y="42" width="45" height="16" fill="#1e293b" stroke="#38bdf8" stroke-width="2"/>
        <text x="342" y="54" fill="#f8fafc" font-family="monospace" font-size="10">R2'</text>
        
        <line x1="375" y1="50" x2="395" y2="50" stroke="#60a5fa" stroke-width="3"/>
        <path d="M 395,50 Q 405,35 415,50 Q 425,35 435,50 Q 445,35 455,50" fill="none" stroke="#fbbf24" stroke-width="3"/>
        <text x="415" y="30" fill="#fde047" font-family="monospace" font-size="10">jX2'</text>
        
        <!-- Output Load ZL' -->
        <line x1="455" y1="50" x2="495" y2="50" stroke="#60a5fa" stroke-width="3"/>
        <rect x="485" y="90" width="20" height="50" fill="#1e293b" stroke="#34d399" stroke-width="2"/>
        <text x="475" y="155" fill="#6ee7b7" font-family="monospace" font-size="9">ZL' (Load)</text>
        <line x1="495" y1="50" x2="495" y2="90" stroke="#60a5fa" stroke-width="2"/>
        <line x1="495" y1="140" x2="495" y2="190" stroke="#60a5fa" stroke-width="2"/>
        
        <!-- Bottom Common Return -->
        <line x1="35" y1="190" x2="495" y2="190" stroke="#60a5fa" stroke-width="3"/>
        
        <text x="140" y="220" fill="#94a3b8" font-family="monospace" font-size="11">Exact Model: Vo = V2' + I2'(R2' + jX2')</text>
      </svg>`
    }
  },
  {
    id: 'eee_buck_converter_diagram_02',
    department: 'Electrical & Electronics Engineering',
    subject: 'Power Electronics & Drives',
    topic: 'Converters & Inverters',
    subtopic: 'Buck-Boost, Rectifiers & IGBT Switching',
    skill: 'Power Electronics',
    difficulty: 'Intermediate',
    questionType: 'diagram-based',
    question: 'Analyze the DC-DC Buck Converter circuit diagram below. For an input voltage Vin = 48V, switching duty cycle D = 0.25, and switching frequency fs = 50 kHz in Continuous Conduction Mode (CCM): calculate the average output voltage (Vout). What is the purpose of the freewheeling diode D1 when the MOSFET switch turns off?',
    keywords: ['power electronics', 'buck converter', 'duty cycle', 'ccm', 'freewheeling diode', 'inductor', 'dc-dc converter', 'switching'],
    followUpTemplates: [
      'What design condition governs the boundary between Continuous Conduction Mode (CCM) and Discontinuous Conduction Mode (DCM) for minimum load current I_min?',
      'How do you size the output capacitor C to limit peak-to-peak output voltage ripple to less than 1%?'
    ],
    idealAnswerPoints: [
      'In ideal CCM, average output voltage Vout = D * Vin = 0.25 * 48V = 12.0V',
      'When MOSFET switch is ON: Diode D1 is reverse-biased; input supplies current to inductor L and load, charging inductor magnetic field (vL = Vin - Vout)',
      'When MOSFET switch turns OFF: Inductor current cannot change instantaneously; inductor polarity reverses, forward-biasing freewheeling diode D1 to maintain continuous load current loop',
      'Inductor Volt-Second Balance in steady state ensures net inductor voltage over one switching period is zero: (Vin - Vout)*DT = Vout*(1 - D)T'
    ],
    explanation: 'Fundamental step-down power electronics topology and steady-state switching dynamics.',
    diagram: {
      type: 'circuit',
      title: 'DC-DC Buck Step-Down Converter Topology',
      caption: 'Non-isolated buck converter circuit operating in continuous conduction mode (CCM).',
      specs: {
        'Input Voltage Vin': '48 V DC',
        'Duty Cycle D': '0.25 (25%)',
        'Switching Freq fs': '50 kHz (T = 20 μs)',
        'Calculated Vout': '12.0 V DC'
      },
      technicalNotes: [
        'S1: High-side power MOSFET switch controlled by PWM gate driver.',
        'D1: Ultrafast / Schottky freewheeling diode conducting during (1-D)T interval.',
        'L, C: Low-pass LC filter smoothing output voltage ripple.'
      ],
      svgContent: `<svg viewBox="0 0 540 230" width="100%" height="210" xmlns="http://www.w3.org/2000/svg">
        <rect width="540" height="230" fill="#0b1120" rx="12"/>
        
        <!-- Input DC Voltage -->
        <circle cx="40" cy="50" r="4" fill="#38bdf8"/>
        <circle cx="40" cy="180" r="4" fill="#38bdf8"/>
        <text x="25" y="40" fill="#38bdf8" font-family="monospace" font-size="12" font-weight="bold">+ Vin=48V</text>
        <text x="30" y="200" fill="#38bdf8" font-family="monospace" font-size="12" font-weight="bold">-</text>
        
        <!-- MOSFET Switch S1 -->
        <line x1="40" y1="50" x2="110" y2="50" stroke="#60a5fa" stroke-width="3"/>
        <rect x="110" y="35" width="55" height="30" fill="#1e293b" stroke="#818cf8" stroke-width="2"/>
        <text x="120" y="54" fill="#c7d2fe" font-family="monospace" font-size="11" font-weight="bold">S1 (SW)</text>
        <line x1="165" y1="50" x2="220" y2="50" stroke="#60a5fa" stroke-width="3"/>
        <circle cx="220" cy="50" r="5" fill="#38bdf8"/>
        
        <!-- Freewheeling Diode D1 -->
        <line x1="220" y1="50" x2="220" y2="90" stroke="#60a5fa" stroke-width="3"/>
        <polygon points="210,130 230,130 220,105" fill="#1e293b" stroke="#f43f5e" stroke-width="2"/>
        <line x1="210" y1="105" x2="230" y2="105" stroke="#f43f5e" stroke-width="2"/>
        <text x="235" y="125" fill="#fda4af" font-family="monospace" font-size="11">D1 (Diode)</text>
        <line x1="220" y1="130" x2="220" y2="180" stroke="#60a5fa" stroke-width="3"/>
        <circle cx="220" cy="180" r="4" fill="#60a5fa"/>
        
        <!-- Filter Inductor L -->
        <line x1="220" y1="50" x2="260" y2="50" stroke="#60a5fa" stroke-width="3"/>
        <path d="M 260,50 Q 275,30 290,50 Q 305,30 320,50 Q 335,30 350,50" fill="none" stroke="#fbbf24" stroke-width="3"/>
        <text x="290" y="25" fill="#fde047" font-family="monospace" font-size="11" font-weight="bold">L (Inductor)</text>
        
        <!-- Capacitor C & Load R -->
        <line x1="350" y1="50" x2="420" y2="50" stroke="#60a5fa" stroke-width="3"/>
        <circle cx="420" cy="50" r="4" fill="#60a5fa"/>
        
        <!-- Capacitor C -->
        <line x1="420" y1="50" x2="420" y2="100" stroke="#60a5fa" stroke-width="2"/>
        <line x1="405" y1="100" x2="435" y2="100" stroke="#38bdf8" stroke-width="3"/>
        <line x1="405" y1="110" x2="435" y2="110" stroke="#38bdf8" stroke-width="3"/>
        <line x1="420" y1="110" x2="420" y2="180" stroke="#60a5fa" stroke-width="2"/>
        <text x="438" y="110" fill="#93c5fd" font-family="monospace" font-size="11">C</text>
        <circle cx="420" cy="180" r="4" fill="#60a5fa"/>
        
        <!-- Load R -->
        <line x1="420" y1="50" x2="480" y2="50" stroke="#60a5fa" stroke-width="3"/>
        <rect x="472" y="90" width="16" height="45" fill="#1e293b" stroke="#34d399" stroke-width="2"/>
        <line x1="480" y1="50" x2="480" y2="90" stroke="#60a5fa" stroke-width="2"/>
        <line x1="480" y1="135" x2="480" y2="180" stroke="#60a5fa" stroke-width="2"/>
        <text x="495" y="115" fill="#6ee7b7" font-family="monospace" font-size="11">R_Load</text>
        
        <!-- Output Voltage indicator -->
        <circle cx="510" cy="50" r="4" fill="#34d399"/>
        <circle cx="510" cy="180" r="4" fill="#34d399"/>
        <text x="490" y="35" fill="#34d399" font-family="monospace" font-size="12" font-weight="bold">+ Vout=12V</text>
        
        <!-- Ground / Common return -->
        <line x1="40" y1="180" x2="510" y2="180" stroke="#60a5fa" stroke-width="3"/>
        <text x="170" y="215" fill="#a5b4fc" font-family="sans-serif" font-size="11">Vout = D · Vin = 0.25 × 48V = 12.0 V</text>
      </svg>`
    }
  },
  {
    id: 'eee_powersys_01',
    department: 'Electrical & Electronics Engineering',
    subject: 'Power Systems & Grid Engineering',
    topic: 'Power Generation & Transmission',
    subtopic: 'Load Flow, Fault Analysis & Grid Stability',
    skill: 'Power Systems',
    difficulty: 'Advanced',
    questionType: 'problem-solving',
    question: 'Compare symmetrical faults (3-phase short circuit) with unsymmetrical faults (single line-to-ground SLG, double line-to-ground DLG). Why is the single line-to-ground fault typically the most common, and how do symmetrical components (positive, negative, zero sequence) simplify fault analysis?',
    keywords: ['power systems', 'fault analysis', 'symmetrical components', 'zero sequence', 'single line to ground', 'grid', 'protection'],
    followUpTemplates: [
      'Why is zero-sequence current unable to flow in an ungrounded delta-connected transformer winding?',
      'How do distance relays (Mho relay) prevent false tripping during stable power swings on high-voltage transmission lines?'
    ],
    idealAnswerPoints: [
      'Single Line-to-Ground (SLG) fault constitutes > 70% of all grid faults due to lightning, tree contact, and insulator flashover',
      'Fortescue theorem decomposes unbalance into three balanced sets: Positive (abc), Negative (acb), and Zero sequence (in-phase)',
      'For SLG fault: sequence networks are connected in series (Ia1 = Ia2 = Ia0)',
      'Zero sequence requires a physical ground return path; absent in delta or ungrounded wye systems'
    ],
    explanation: 'Core power systems engineering testing symmetrical components and fault calculations.'
  },

  // =========================================================================
  // 5. CIVIL ENGINEERING
  // =========================================================================
  {
    id: 'ce_bmd_diagram_01',
    department: 'Civil Engineering',
    subject: 'Structural Engineering & Mechanics',
    topic: 'Structural Analysis & Design',
    subtopic: 'Truss & Space Frame Analysis',
    skill: 'STAAD.Pro',
    difficulty: 'Beginner',
    questionType: 'diagram-based',
    question: 'Refer to the Simply Supported Beam with Center Point Load diagram below. For span L = 6 m and point load W = 20 kN applied at mid-span: calculate the support reactions (Ra, Rb), maximum shear force (Vmax), and maximum bending moment (Mmax). What is the mathematical relationship between the Shear Force Diagram (SFD) and Bending Moment Diagram (BMD)?',
    keywords: ['civil', 'bending moment', 'shear force', 'bmd', 'sfd', 'simply supported beam', 'structural analysis', 'mechanics of materials'],
    followUpTemplates: [
      'If the concentrated point load W is replaced by a uniformly distributed load (UDL) of w = 5 kN/m over the entire span, what shape does the BMD become and what is the maximum bending moment formula?',
      'At what cross-section location is the bending moment maximum, and why is the shear force zero at that exact point?'
    ],
    idealAnswerPoints: [
      'Symmetric loading: Support reactions Ra = Rb = W / 2 = 20 kN / 2 = 10 kN',
      'Shear Force Diagram (SFD): Constant +10 kN from x = 0 to 3 m; steps down by 20 kN to -10 kN from x = 3 m to 6 m',
      'Maximum Bending Moment: Mmax = (W * L) / 4 = (20 kN * 6 m) / 4 = 30.0 kNm at center',
      'Fundamental differential relationship: dM/dx = V (rate of change of bending moment equals shear force); thus BMD slope equals shear force, and bending moment is maximized where shear force changes sign (V = 0)'
    ],
    explanation: 'Cornerstone structural analysis concept required for all civil engineering and structural design roles.',
    diagram: {
      type: 'structural',
      title: 'Simply Supported Beam Shear Force & Bending Moment Diagrams',
      caption: 'Beam with central concentrated load showing SFD step and BMD triangular distribution.',
      specs: {
        'Beam Span (L)': '6.0 meters',
        'Central Load (W)': '20 kN at midspan (x = 3m)',
        'Support Reactions': 'Ra = 10 kN, Rb = 10 kN',
        'Maximum Bending Moment': '30.0 kN·m at x = 3.0m'
      },
      technicalNotes: [
        'SFD steps abruptly by -W (-20 kN) directly under the concentrated load point.',
        'BMD reaches maximum where SFD passes through zero line (x = L/2).',
        'BMD profile consists of linear straight lines for point loads.'
      ],
      svgContent: `<svg viewBox="0 0 540 260" width="100%" height="240" xmlns="http://www.w3.org/2000/svg">
        <rect width="540" height="260" fill="#0b1120" rx="12"/>
        
        <!-- Beam Span -->
        <text x="25" y="45" fill="#cbd5e1" font-family="monospace" font-size="11" font-weight="bold">BEAM (L=6m)</text>
        <line x1="120" y1="45" x2="460" y2="45" stroke="#94a3b8" stroke-width="6"/>
        
        <!-- Supports Pin (A) and Roller (B) -->
        <polygon points="120,48 110,65 130,65" fill="#64748b"/>
        <line x1="105" y1="65" x2="135" y2="65" stroke="#64748b" stroke-width="2"/>
        <text x="100" y="80" fill="#94a3b8" font-family="monospace" font-size="10">Ra=10kN</text>
        
        <polygon points="460,48 450,65 470,65" fill="#64748b"/>
        <circle cx="455" cy="68" r="3" fill="#64748b"/>
        <circle cx="465" cy="68" r="3" fill="#64748b"/>
        <text x="445" y="80" fill="#94a3b8" font-family="monospace" font-size="10">Rb=10kN</text>
        
        <!-- Load W = 20kN at center -->
        <line x1="290" y1="15" x2="290" y2="42" stroke="#ef4444" stroke-width="3"/>
        <polygon points="290,45 285,35 295,35" fill="#ef4444"/>
        <text x="265" y="12" fill="#f87171" font-family="monospace" font-size="11" font-weight="bold">W = 20 kN</text>
        
        <!-- SFD Section -->
        <text x="25" y="120" fill="#38bdf8" font-family="monospace" font-size="11" font-weight="bold">SFD</text>
        <line x1="120" y1="120" x2="460" y2="120" stroke="#475569" stroke-dasharray="3" stroke-width="1"/>
        <path d="M 120,120 L 120,95 L 290,95 L 290,145 L 460,145 L 460,120" fill="none" stroke="#38bdf8" stroke-width="2.5"/>
        <rect x="120" y="95" width="170" height="25" fill="#38bdf8" fill-opacity="0.15"/>
        <rect x="290" y="120" width="170" height="25" fill="#f43f5e" fill-opacity="0.15"/>
        <text x="195" y="112" fill="#7dd3fc" font-family="monospace" font-size="10">+10 kN</text>
        <text x="365" y="137" fill="#fda4af" font-family="monospace" font-size="10">-10 kN</text>
        
        <!-- BMD Section -->
        <text x="25" y="210" fill="#34d399" font-family="monospace" font-size="11" font-weight="bold">BMD</text>
        <line x1="120" y1="230" x2="460" y2="230" stroke="#475569" stroke-dasharray="3" stroke-width="1"/>
        <polygon points="120,230 290,175 460,230" fill="#10b981" fill-opacity="0.15"/>
        <path d="M 120,230 L 290,175 L 460,230" fill="none" stroke="#34d399" stroke-width="3"/>
        <text x="260" y="170" fill="#6ee7b7" font-family="monospace" font-size="11" font-weight="bold">Mmax = 30 kNm</text>
        <text x="295" y="190" fill="#a7f3d0" font-family="monospace" font-size="10">(W·L)/4</text>
      </svg>`
    }
  },
  {
    id: 'ce_concrete_01',
    department: 'Civil Engineering',
    subject: 'Concrete Technology & Structural Design',
    topic: 'Reinforced Concrete Design',
    subtopic: 'Limit State Method & IS 456',
    skill: 'Concrete Design',
    difficulty: 'Intermediate',
    questionType: 'problem-solving',
    question: 'In Reinforced Concrete Design (IS 456:2000), explain the Limit State of Collapse in flexure. Differentiate between Under-Reinforced, Balanced, and Over-Reinforced beam sections. Why does IS 456 strictly discourage over-reinforced concrete beams?',
    keywords: ['is 456', 'concrete design', 'under-reinforced', 'over-reinforced', 'neutral axis', 'ductility', 'limit state', 'brittle failure'],
    followUpTemplates: [
      'What is the formula for the limiting neutral axis depth ratio (xu_max / d) for Fe 415 and Fe 500 grade reinforcement bars?',
      'Why does IS 456 adopt partial safety factor γm = 1.5 for concrete and γm = 1.15 for steel?'
    ],
    idealAnswerPoints: [
      'Balanced section: Concrete reaches ultimate strain 0.0035 simultaneously with steel yielding (strain >= 0.87fy/Es + 0.002)',
      'Under-reinforced section (xu < xu_max): Steel yields before concrete crushes, providing ample deflection and visible cracking warning prior to collapse (ductile failure mode)',
      'Over-reinforced section (xu > xu_max): Concrete crushes explosively without steel yielding, causing sudden brittle catastrophic failure without advance warning',
      'IS 456 restricts moment capacity to limiting value Mu_lim to force ductile failure'
    ],
    explanation: 'Crucial structural safety principles governing reinforced concrete codes of practice.'
  },
  {
    id: 'ce_soil_01',
    department: 'Civil Engineering',
    subject: 'Geotechnical Engineering & Foundation',
    topic: 'Geotechnical Engineering',
    subtopic: 'Bearing Capacity & Foundation Sizing',
    skill: 'Soil Mechanics',
    difficulty: 'Intermediate',
    questionType: 'practical',
    question: 'How do you determine the safe bearing capacity (SBC) of soil using Terzaghi Bearing Capacity Equation for shallow strip and isolated footing foundations? Explain the physical meaning of cohesion (c), surcharge (q), and unit weight (γ) terms.',
    keywords: ['soil mechanics', 'geotechnical', 'bearing capacity', 'terzaghi', 'cohesion', 'surcharge', 'spt', 'foundation'],
    followUpTemplates: [
      'How does a high groundwater table rising to the ground surface affect soil bearing capacity and effective stress?',
      'Explain how Standard Penetration Test (SPT) N-values are corrected for overburden pressure (CN) and dilatancy (η) in saturated fine sands.'
    ],
    idealAnswerPoints: [
      'Terzaghi equation for strip footing: qu = c*Nc + q*Nq + 0.5*γ*B*Nγ',
      'c*Nc term represents shear resistance contribution from soil cohesion',
      'q*Nq term represents surcharge contribution from soil overburden above foundation depth Df (q = γ * Df)',
      '0.5*γ*B*Nγ term represents shear resistance from soil weight in the shear failure zone beneath footing width B',
      'Safe bearing capacity SBC = (qu - q)/FOS + q, typically using Factor of Safety FOS = 2.5 to 3.0'
    ],
    explanation: 'Essential geotechnical foundation sizing theory and site investigation analysis.'
  },

  // =========================================================================
  // 6. MECHANICAL ENGINEERING
  // =========================================================================
  {
    id: 'me_otto_diagram_01',
    department: 'Mechanical Engineering',
    subject: 'Thermodynamics & IC Engines',
    topic: 'Thermal & Energy Systems',
    subtopic: 'Thermodynamic Cycles & Efficiency',
    skill: 'Thermodynamics',
    difficulty: 'Beginner',
    questionType: 'diagram-based',
    question: 'Analyze the Air Standard Otto Cycle P-V and T-s Indicator Diagram below. Identify the four thermodynamic processes (1-2, 2-3, 3-4, 4-1). Derive the thermal efficiency formula η = 1 - (1 / r^(γ-1)) in terms of compression ratio r, and explain why compression ratio in petrol engines is limited to ~10:1.',
    keywords: ['thermodynamics', 'otto cycle', 'pv diagram', 'compression ratio', 'thermal efficiency', 'isentropic', 'autoignition', 'knocking'],
    followUpTemplates: [
      'What is engine knocking / detonation in spark-ignition engines, and how do higher octane fuel ratings prevent pre-ignition?',
      'Compare Otto Cycle thermal efficiency with Diesel Cycle and Dual Cycle for the same compression ratio and heat input.'
    ],
    idealAnswerPoints: [
      'Process 1-2: Reversible isentropic (adiabatic) compression of air-fuel mixture (s1 = s2)',
      'Process 2-3: Constant volume (isochoric) heat addition from spark combustion (Q_in = m*Cv*(T3 - T2))',
      'Process 3-4: Reversible isentropic expansion / power stroke (s3 = s4)',
      'Process 4-1: Constant volume heat rejection to exhaust (Q_out = m*Cv*(T4 - T1))',
      'Thermal efficiency η = 1 - (Q_out / Q_in) = 1 - 1 / r^(γ - 1)',
      'Compression ratio in petrol engines is restricted to 9:1 - 11:1 to prevent premature auto-ignition (knocking/detonation)'
    ],
    explanation: 'Fundamental applied thermodynamics assessment for automotive and thermal engineering.',
    diagram: {
      type: 'engine',
      title: 'Air Standard Otto Cycle (P-V Indicator Diagram)',
      caption: 'Idealized 4-process cycle modeling spark-ignition internal combustion engines.',
      specs: {
        'Compression Ratio r': 'V1 / V2 = 8.5 : 1',
        'Specific Heat Ratio γ': '1.4 (for air)',
        'Theoretical Efficiency': 'η ≈ 57.5%',
        'Heat Addition': 'Constant Volume (2 → 3)'
      },
      technicalNotes: [
        'V2 = Clearance Volume (Vc); V1 = Total Cylinder Volume (Vc + Vs).',
        'Area enclosed by 1-2-3-4 represents net indicated work output per cycle.',
        '1-2 and 3-4 are reversible adiabatic curves governed by P·V^γ = constant.'
      ],
      svgContent: `<svg viewBox="0 0 540 260" width="100%" height="240" xmlns="http://www.w3.org/2000/svg">
        <rect width="540" height="260" fill="#0b1120" rx="12"/>
        
        <!-- P-V Axes -->
        <line x1="70" y1="210" x2="500" y2="210" stroke="#94a3b8" stroke-width="2"/>
        <line x1="70" y1="210" x2="70" y2="20" stroke="#94a3b8" stroke-width="2"/>
        <text x="475" y="230" fill="#94a3b8" font-family="monospace" font-size="12" font-weight="bold">Volume (V)</text>
        <text x="20" y="30" fill="#94a3b8" font-family="monospace" font-size="12" font-weight="bold">Pressure (P)</text>
        
        <!-- Volume limits V2 (Vc) and V1 (V1) -->
        <line x1="160" y1="210" x2="160" y2="40" stroke="#475569" stroke-dasharray="3"/>
        <text x="145" y="228" fill="#64748b" font-family="monospace" font-size="10">V2 (Vc)</text>
        
        <line x1="420" y1="210" x2="420" y2="40" stroke="#475569" stroke-dasharray="3"/>
        <text x="405" y="228" fill="#64748b" font-family="monospace" font-size="10">V1 (Total)</text>
        
        <!-- Enclosed Cycle Shading -->
        <path d="M 420,185 Q 260,165 160,110 L 160,45 Q 280,75 420,135 Z" fill="#6366f1" fill-opacity="0.15"/>
        
        <!-- Process 1 -> 2 Isentropic Compression -->
        <path d="M 420,185 Q 260,165 160,110" fill="none" stroke="#38bdf8" stroke-width="3"/>
        <circle cx="420" cy="185" r="5" fill="#38bdf8"/>
        <circle cx="160" cy="110" r="5" fill="#38bdf8"/>
        <text x="430" y="190" fill="#93c5fd" font-family="monospace" font-size="12" font-weight="bold">1</text>
        <text x="140" y="115" fill="#93c5fd" font-family="monospace" font-size="12" font-weight="bold">2</text>
        
        <!-- Process 2 -> 3 Constant Volume Heat Addition (Qin) -->
        <line x1="160" y1="110" x2="160" y2="45" stroke="#ef4444" stroke-width="3.5"/>
        <circle cx="160" cy="45" r="5" fill="#ef4444"/>
        <text x="140" y="45" fill="#f87171" font-family="monospace" font-size="12" font-weight="bold">3</text>
        <text x="90" y="75" fill="#f87171" font-family="monospace" font-size="10" font-weight="bold">Qin (Spark)</text>
        
        <!-- Process 3 -> 4 Isentropic Expansion (Power) -->
        <path d="M 160,45 Q 280,75 420,135" fill="none" stroke="#10b981" stroke-width="3"/>
        <circle cx="420" cy="135" r="5" fill="#10b981"/>
        <text x="430" y="140" fill="#6ee7b7" font-family="monospace" font-size="12" font-weight="bold">4</text>
        <text x="290" y="75" fill="#6ee7b7" font-family="monospace" font-size="10">Power Stroke (Expansion)</text>
        
        <!-- Process 4 -> 1 Constant Volume Heat Rejection (Qout) -->
        <line x1="420" y1="135" x2="420" y2="185" stroke="#f59e0b" stroke-width="3.5"/>
        <text x="435" y="165" fill="#fde047" font-family="monospace" font-size="10">Qout (Exhaust)</text>
        
        <text x="210" y="145" fill="#c7d2fe" font-family="monospace" font-size="11" font-weight="bold">Indicated Work = ∮ P dV</text>
      </svg>`
    }
  },
  {
    id: 'me_ansys_01',
    department: 'Mechanical Engineering',
    subject: 'Finite Element Analysis & Design',
    topic: 'Finite Element Analysis',
    subtopic: 'Structural Stress & Meshing',
    skill: 'ANSYS FEA',
    difficulty: 'Intermediate',
    questionType: 'project-based',
    question: 'How do you conduct a Mesh Convergence Study in ANSYS FEA to verify numerical results? Explain the Von Mises stress failure criterion and when it is valid compared to Maximum Principal Stress theory (Rankine).',
    keywords: ['ansys', 'fea', 'mesh convergence', 'von mises', 'finite element analysis', 'stress concentration', 'h-method', 'p-method'],
    followUpTemplates: [
      'What causes Artificial Stress Singularities at sharp internal re-entrant corners during FEA, and how do you resolve them using physical fillet radii?',
      'When performing modal dynamic analysis, what is the significance of Participation Factor and Cumulative Mass Fraction?'
    ],
    idealAnswerPoints: [
      'Mesh convergence: iteratively refine element size (h-method) or increase polynomial order (p-method) until critical result (e.g. max Von Mises stress) changes by less than 2-5%',
      'Von Mises Yield Criterion is based on Distortion Energy Theory, predicting yielding in ductile materials (steels, aluminum) when octahedral shear stress exceeds yield limit',
      'Maximum Principal Stress Theory (Rankine) is applicable for brittle materials (cast iron, glass) which fail in normal tensile cleavage rather than shear yielding',
      'Singularities at sharp corners yield infinite theoretical stress with element refinement; real geometry requires fillet radius'
    ],
    explanation: 'Core mechanical simulation practices separating basic software operators from analytical engineers.'
  },
  {
    id: 'me_solidworks_01',
    department: 'Mechanical Engineering',
    subject: 'Computer Aided Design (CAD)',
    topic: 'Parametric CAD & Machine Design',
    subtopic: 'Part Modeling & Assemblies',
    skill: 'SolidWorks',
    difficulty: 'Beginner',
    questionType: 'practical',
    question: 'In SolidWorks parametric modeling, explain the difference between Top-Down Assembly design and Bottom-Up Assembly design. How do you resolve rebuild errors caused by Circular References / In-Context relations?',
    keywords: ['solidworks', 'cad', 'top-down', 'bottom-up', 'in-context', 'mates', 'parametric', 'assembly'],
    followUpTemplates: [
      'How do Geometric Dimensioning and Tolerancing (GD&T) Feature Control Frames communicate Position, Runout, and Concentricity relative to primary/secondary datums?',
      'What is the difference between a flexible subassembly and a rigid subassembly when modeling linkages?'
    ],
    idealAnswerPoints: [
      'Bottom-Up: parts modeled independently in separate part files and joined in assembly file via mates (standard components, fasteners)',
      'Top-Down: parts modeled directly within assembly context referencing adjacent part geometry, allowing automatic dimensional updates when master sketch changes',
      'Circular References occur when Part A references Part B while Part B simultaneously depends on Part A',
      'Resolved by locking in-context references, isolating master skeleton sketches, or breaking external references before production release'
    ],
    explanation: 'CAD methodology and engineering change management.'
  },

  // =========================================================================
  // 7. AUTOMOBILE ENGINEERING
  // =========================================================================
  {
    id: 'ae_abs_diagram_01',
    department: 'Automobile Engineering',
    subject: 'Automotive Chassis & Braking Systems',
    topic: 'Chassis & Active Safety',
    subtopic: 'Hydraulic Disc/Drum & Anti-Lock Braking',
    skill: 'Braking & ABS',
    difficulty: 'Intermediate',
    questionType: 'diagram-based',
    question: 'Refer to the Hydraulic Anti-Lock Braking System (ABS) Schematic below. Explain the three operational phases of the ABS Modulator Valve (Pressure Apply, Pressure Hold, Pressure Dump). How do Wheel Speed Sensors (WSS) detect incipient wheel lockup, and why does wheel lockup cause vehicle directional instability?',
    keywords: ['automobile', 'abs', 'anti-lock braking', 'modulator', 'wheel speed sensor', 'hydraulic brake', 'braking distance', 'vehicle dynamics'],
    followUpTemplates: [
      'What is Braking Slip Ratio (λ = (V_vehicle - V_wheel) / V_vehicle), and at what optimal slip percentage (typically 15-20%) is peak tire friction coefficient achieved?',
      'How does Electronic Stability Control (ESC) build upon the ABS hydraulic unit by adding yaw rate sensors and steering angle sensors to counter understeer and oversteer?'
    ],
    idealAnswerPoints: [
      'Wheel Speed Sensors (WSS Hall effect / inductive) transmit wheel rotational pulse frequency to ABS Electronic Control Unit (ECU)',
      'When rapid wheel deceleration indicates incipient lockup: ECU enters ABS modulation cycle (15-20 times per second)',
      'Pressure Hold Phase: Solenoid inlet valve closes to prevent master cylinder from applying further hydraulic pressure to caliper',
      'Pressure Dump Phase: Solenoid outlet valve opens, releasing fluid into low-pressure accumulator, powered back by hydraulic return pump',
      'Pressure Apply Phase: Fluid reapplied to restore deceleration torque',
      'Locked wheels eliminate lateral cornering tire stiffness, causing vehicle spinout and inability to steer'
    ],
    explanation: 'Automotive chassis safety systems combining hydraulics, sensors, and vehicle stability physics.',
    diagram: {
      type: 'schematic',
      title: 'Automotive Anti-Lock Braking (ABS) Hydraulic & Electronic Loop',
      caption: 'Closed-loop feedback between wheel speed sensor, ABS ECU, and electro-hydraulic modulator.',
      specs: {
        'Hydraulic Pressure': '100 - 180 bar',
        'Modulation Frequency': '15 - 20 cycles/second',
        'Target Slip Ratio': '15% - 20% optimal friction',
        'Sensor Type': 'Hall Effect Active Wheel Speed Sensor'
      },
      technicalNotes: [
        'Tandem Master Cylinder supplies hydraulic pressure initiated by driver foot pedal.',
        'ABS ECU calculates wheel deceleration and slip threshold in real time.',
        'Hydraulic Return Pump scavenges dumped brake fluid back into the primary circuit.'
      ],
      svgContent: `<svg viewBox="0 0 540 250" width="100%" height="230" xmlns="http://www.w3.org/2000/svg">
        <rect width="540" height="250" fill="#0b1120" rx="12"/>
        
        <!-- Brake Pedal & Master Cylinder -->
        <path d="M 40,80 L 60,80 L 70,50" fill="none" stroke="#94a3b8" stroke-width="4"/>
        <rect x="70" y="65" width="60" height="30" fill="#1e293b" stroke="#38bdf8" stroke-width="2"/>
        <text x="75" y="85" fill="#f8fafc" font-family="monospace" font-size="10">Master Cyl</text>
        <text x="35" y="45" fill="#94a3b8" font-family="monospace" font-size="10">Pedal</text>
        
        <!-- Hydraulic line to ABS Modulator -->
        <line x1="130" y1="80" x2="190" y2="80" stroke="#38bdf8" stroke-width="3"/>
        
        <!-- ABS Hydraulic Modulator Block -->
        <rect x="190" y="45" width="160" height="120" fill="#1e293b" stroke="#6366f1" stroke-width="2.5" rx="8"/>
        <text x="210" y="68" fill="#a5b4fc" font-family="monospace" font-size="11" font-weight="bold">ABS Modulator</text>
        
        <!-- Internal Solenoid Valves -->
        <rect x="210" y="85" width="45" height="25" fill="#0f172a" stroke="#fbbf24" stroke-width="1.5"/>
        <text x="215" y="102" fill="#fde047" font-family="monospace" font-size="9">Inlet Vlv</text>
        
        <rect x="280" y="85" width="45" height="25" fill="#0f172a" stroke="#f43f5e" stroke-width="1.5"/>
        <text x="283" y="102" fill="#fda4af" font-family="monospace" font-size="9">Outlet Vlv</text>
        
        <!-- Return Pump -->
        <circle cx="270" cy="135" r="14" fill="#0f172a" stroke="#34d399" stroke-width="2"/>
        <text x="257" y="139" fill="#6ee7b7" font-family="monospace" font-size="9">Pump</text>
        
        <!-- Hydraulic Line to Wheel Caliper -->
        <line x1="350" y1="95" x2="430" y2="95" stroke="#38bdf8" stroke-width="3"/>
        
        <!-- Brake Caliper & Wheel Disc -->
        <circle cx="460" cy="120" r="35" fill="#1e293b" stroke="#94a3b8" stroke-width="3"/>
        <circle cx="460" cy="120" r="15" fill="#0f172a" stroke="#64748b" stroke-width="2"/>
        <rect x="420" y="80" width="25" height="35" fill="#ef4444" stroke="#f87171" stroke-width="2" rx="4"/>
        <text x="423" y="130" fill="#fca5a5" font-family="monospace" font-size="9">Disc</text>
        
        <!-- Wheel Speed Sensor (WSS) -->
        <rect x="475" y="145" width="30" height="15" fill="#10b981" stroke="#34d399" stroke-width="1.5" rx="3"/>
        <text x="480" y="156" fill="#064e3b" font-family="monospace" font-size="9" font-weight="bold">WSS</text>
        
        <!-- ABS Electronic Control Unit (ECU) -->
        <rect x="190" y="185" width="160" height="45" fill="#0f172a" stroke="#38bdf8" stroke-width="2" rx="6"/>
        <text x="220" y="212" fill="#38bdf8" font-family="monospace" font-size="11" font-weight="bold">ABS ECU (Micro)</text>
        
        <!-- Signal from WSS to ECU -->
        <path d="M 490,160 L 490,205 L 350,205" fill="none" stroke="#10b981" stroke-dasharray="4" stroke-width="2"/>
        <text x="390" y="220" fill="#34d399" font-family="monospace" font-size="9">WSS Speed Pulse</text>
        
        <!-- Control line from ECU to Modulator -->
        <line x1="270" y1="185" x2="270" y2="165" stroke="#f59e0b" stroke-width="2"/>
      </svg>`
    }
  },
  {
    id: 'ae_ev_powertrain_diagram_02',
    department: 'Automobile Engineering',
    subject: 'Electric Vehicles & Powertrains',
    topic: 'Electric Vehicles & Energy Storage',
    subtopic: 'Battery Management (BMS), Traction Motors & Inverters',
    skill: 'EV Powertrain',
    difficulty: 'Intermediate',
    questionType: 'diagram-based',
    question: 'Examine the Electric Vehicle (EV) Powertrain Architecture diagram below. Follow the energy flow from High-Voltage Battery Pack through Inverter to Permanent Magnet Synchronous Motor (PMSM). What key functions does the Battery Management System (BMS) perform (Cell Balancing, State of Charge SoC, Thermal Management), and how does Regenerative Braking return energy to the battery?',
    keywords: ['electric vehicle', 'ev', 'bms', 'battery management', 'inverter', 'pmsm', 'traction motor', 'regenerative braking', 'soc'],
    followUpTemplates: [
      'Compare Passive Cell Balancing (resistor bleed) against Active Cell Balancing (capacitive/inductive charge shuttling) in EV battery efficiency.',
      'What causes Thermal Runaway in Lithium-ion cells (NMC vs LFP chemistry), and what active liquid cooling safeguards are deployed?'
    ],
    idealAnswerPoints: [
      'High Voltage Pack (400V/800V DC) supplies energy to 3-Phase Traction Inverter via DC link contactors',
      'Inverter converts DC into variable-frequency, variable-voltage 3-Phase AC to drive PMSM motor using Field Oriented Control (FOC)',
      'BMS monitors individual cell voltages, pack temperature, and computes State of Charge (SoC) using Coulomb Counting and Kalman Filtering',
      'Cell Balancing equalizes state of charge across series cells to prevent individual cell overcharging or overdischarging',
      'Regenerative Braking: vehicle kinetic energy drives PMSM as an AC generator; inverter bridge acts as synchronous boost rectifier returning DC charging current into battery pack'
    ],
    explanation: 'Modern automotive electrification and EV powertrain engineering analysis.',
    diagram: {
      type: 'schematic',
      title: 'Full Electric Vehicle (EV) Powertrain Architecture',
      caption: 'High-voltage energy distribution from Li-ion pack through inverter to e-axle traction motor.',
      specs: {
        'Battery Pack Voltage': '400V DC (Nominal)',
        'Motor Type': 'Permanent Magnet Synchronous (PMSM)',
        'Inverter Topology': '3-Phase IGBT / SiC MOSFET Bridge',
        'Energy Recovery': 'Regenerative Braking (~25% urban range recapture)'
      },
      technicalNotes: [
        'BMS provides safety disconnect via high-voltage pyrofuse and contactors.',
        'Single-speed reduction gearbox (typically 9:1 ratio) replaces multi-gear transmission.',
        'Thermal liquid coolant loops regulate battery, inverter, and traction motor temperatures.'
      ],
      svgContent: `<svg viewBox="0 0 540 240" width="100%" height="220" xmlns="http://www.w3.org/2000/svg">
        <rect width="540" height="240" fill="#0b1120" rx="12"/>
        
        <!-- Battery Pack Block -->
        <rect x="30" y="50" width="110" height="110" fill="#1e293b" stroke="#10b981" stroke-width="2.5" rx="8"/>
        <text x="42" y="75" fill="#34d399" font-family="monospace" font-size="11" font-weight="bold">Li-Ion Pack</text>
        <text x="50" y="95" fill="#6ee7b7" font-family="monospace" font-size="10">400V DC</text>
        
        <!-- BMS Module inside Battery -->
        <rect x="42" y="110" width="86" height="35" fill="#0f172a" stroke="#38bdf8" stroke-width="1.5" rx="4"/>
        <text x="52" y="132" fill="#93c5fd" font-family="monospace" font-size="10" font-weight="bold">BMS (Safety)</text>
        
        <!-- DC Bus Lines -->
        <line x1="140" y1="85" x2="200" y2="85" stroke="#ef4444" stroke-width="3"/>
        <line x1="140" y1="115" x2="200" y2="115" stroke="#38bdf8" stroke-width="3"/>
        <text x="145" y="78" fill="#f87171" font-family="monospace" font-size="9">HV DC (+)</text>
        <text x="145" y="130" fill="#93c5fd" font-family="monospace" font-size="9">HV DC (-)</text>
        
        <!-- Inverter / Motor Controller -->
        <rect x="200" y="55" width="110" height="90" fill="#1e293b" stroke="#818cf8" stroke-width="2.5" rx="8"/>
        <text x="215" y="80" fill="#c7d2fe" font-family="monospace" font-size="11" font-weight="bold">Traction</text>
        <text x="220" y="98" fill="#c7d2fe" font-family="monospace" font-size="11" font-weight="bold">Inverter</text>
        <text x="215" y="125" fill="#fbbf24" font-family="monospace" font-size="9">DC → 3-Phase AC</text>
        
        <!-- 3-Phase AC Lines -->
        <line x1="310" y1="80" x2="365" y2="80" stroke="#f59e0b" stroke-width="2.5"/>
        <line x1="310" y1="100" x2="365" y2="100" stroke="#f59e0b" stroke-width="2.5"/>
        <line x1="310" y1="120" x2="365" y2="120" stroke="#f59e0b" stroke-width="2.5"/>
        <text x="320" y="70" fill="#fde047" font-family="monospace" font-size="9">U, V, W</text>
        
        <!-- Electric Traction Motor (PMSM) -->
        <circle cx="410" cy="100" r="42" fill="#1e293b" stroke="#38bdf8" stroke-width="3"/>
        <text x="390" y="95" fill="#f8fafc" font-family="monospace" font-size="11" font-weight="bold">PMSM</text>
        <text x="382" y="112" fill="#93c5fd" font-family="monospace" font-size="10">e-Motor</text>
        
        <!-- Mechanical Driveshaft & Wheels -->
        <line x1="452" y1="100" x2="490" y2="100" stroke="#94a3b8" stroke-width="6"/>
        <rect x="490" y="60" width="22" height="80" fill="#0f172a" stroke="#64748b" stroke-width="3" rx="4"/>
        <text x="475" y="50" fill="#94a3b8" font-family="monospace" font-size="10">Wheel / Axle</text>
        
        <!-- Bi-directional energy flow labels -->
        <text x="140" y="190" fill="#34d399" font-family="monospace" font-size="10">← ── Regenerative Braking Energy Return ── ←</text>
        <text x="140" y="210" fill="#38bdf8" font-family="monospace" font-size="10">→ ── Forward Propulsion Traction Drive ── →</text>
      </svg>`
    }
  },
  {
    id: 'ae_transmission_01',
    department: 'Automobile Engineering',
    subject: 'Automotive Transmission Systems',
    topic: 'Automotive Drivetrain',
    subtopic: 'Gearbox, Differential & Clutches',
    skill: 'Transmission Systems',
    difficulty: 'Intermediate',
    questionType: 'problem-solving',
    question: 'How does an Open Differential divide torque equally between driven wheels while allowing speed differentiation during cornering? What is the role of the Epicyclic (Planetary) Gearset in automatic transmissions?',
    keywords: ['differential', 'gearbox', 'transmission', 'torque', 'epicyclic', 'planetary gears', 'clutch', 'drivetrain'],
    followUpTemplates: [
      'What happens when one drive wheel hits ice in a vehicle equipped with an open differential vs a Limited Slip Differential (LSD) or Electronic Differential Lock (EDL)?',
      'Explain the working principle of a Torque Converter and why a lock-up clutch is engaged at highway cruising speeds.'
    ],
    idealAnswerPoints: [
      'Open differential uses bevel pinions and sun gears; delivers equal torque (50/50 split) to both half-shafts while allowing different wheel speeds: (N_left + N_right) / 2 = N_crown_wheel',
      'If one wheel loses traction on ice, torque delivered to both wheels is limited to the traction limit of the slipping wheel, causing loss of drive',
      'Limited Slip Differential (LSD) uses clutch packs or Torsen worm gears to bias torque to the wheel with higher traction',
      'Planetary gear sets achieve multiple gear ratios without disengaging gears by holding the sun gear, ring gear, or carrier'
    ],
    explanation: 'Core powertrain driveline engineering mechanics.'
  },

  // =========================================================================
  // 8. DATA SCIENCE & MACHINE LEARNING ENGINEERING
  // =========================================================================
  {
    id: 'ds_bias_variance_01',
    department: 'Data Science & Machine Learning Engineering',
    subject: 'Machine Learning Theory & Statistics',
    topic: 'Statistical & Predictive Modeling',
    subtopic: 'Supervised Algorithms & Regularization',
    skill: 'Machine Learning',
    difficulty: 'Intermediate',
    questionType: 'conceptual',
    question: 'How do you detect and mitigate the Bias-Variance tradeoff in supervised learning? Explain mathematically how L1 (Lasso) and L2 (Ridge) regularizations affect feature weights.',
    keywords: ['machine learning', 'bias', 'variance', 'overfitting', 'regularization', 'lasso', 'ridge', 'l1', 'l2'],
    followUpTemplates: [
      'In an imbalanced classification problem with 99:1 class ratio, why is accuracy misleading and which metrics (PR-AUC, F1, Cost Matrix) do you choose?',
      'When would you prefer tree-based gradient boosting (XGBoost) over deep neural networks on tabular datasets?'
    ],
    idealAnswerPoints: [
      'Total error = Bias^2 + Variance + Irreducible error',
      'High bias (underfitting): high train and test error; fix with more complex model or more features',
      'High variance (overfitting): low train error, high test error; fix with regularization, cross-validation, dropout',
      'L2 adds λ∑w^2, smoothly shrinking weights toward zero; L1 adds λ∑|w|, driving weights to strictly zero for feature sparsity'
    ],
    explanation: 'Core machine learning modeling theory and generalization optimization.'
  },
  {
    id: 'ds_spark_01',
    department: 'Data Science & Machine Learning Engineering',
    subject: 'Distributed Data Systems',
    topic: 'Big Data & Distributed Computing',
    subtopic: 'PySpark & Distributed Shuffles',
    skill: 'Apache Spark',
    difficulty: 'Advanced',
    questionType: 'problem-solving',
    question: 'In Apache Spark, explain the difference between Narrow and Wide dependencies. What causes data skew during distributed joins, and how do you resolve it in production?',
    keywords: ['spark', 'pyspark', 'narrow', 'wide', 'shuffle', 'skew', 'partition', 'broadcast join', 'salting'],
    followUpTemplates: [
      'How does Spark Catalyst Optimizer leverage Adaptive Query Execution (AQE) to coalesce shuffle partitions dynamically?',
      'Compare Broadcast Hash Joins against Sort-Merge Joins in memory consumption and network I/O.'
    ],
    idealAnswerPoints: [
      'Narrow dependencies (map, filter): partitions processed locally on worker without network shuffle',
      'Wide dependencies (groupByKey, join): require shuffling data across cluster network, creating stage boundary',
      'Data skew occurs when one join key holds disproportionate records, creating straggler tasks',
      'Resolved via Broadcast Join (for small tables) or Key Salting (adding random prefix/suffix to distribute skewed keys)'
    ],
    explanation: 'Distributed big data architecture and cluster query optimization.'
  },
  {
    id: 'ds_mlops_01',
    department: 'Data Science & Machine Learning Engineering',
    subject: 'MLOps & Model Lifecycle',
    topic: 'Production Machine Learning',
    subtopic: 'Model Serving & Drift Detection',
    skill: 'MLOps',
    difficulty: 'Advanced',
    questionType: 'scenario',
    question: 'How do you distinguish between Data Drift (Covariate Shift) and Concept Drift in production ML? Design an automated monitoring architecture to detect drift and trigger retraining.',
    keywords: ['mlops', 'drift', 'concept drift', 'data drift', 'monitoring', 'retraining', 'ks test', 'psi', 'mlflow'],
    followUpTemplates: [
      'What statistical tests (Kolmogorov-Smirnov, Population Stability Index, Wasserstein Distance) do you run on streaming inferences?',
      'How do Shadow Deployments and Canary Releases protect production systems when rolling out updated ML models?'
    ],
    idealAnswerPoints: [
      'Data Drift: input feature distribution P(X) changes while P(Y|X) remains constant',
      'Concept Drift: relationship between features and target P(Y|X) shifts over time',
      'Monitoring pipeline: Kafka stream logs inferences -> worker computes daily KS-test / PSI against baseline -> triggers alert if PSI > 0.2',
      'Retraining pipeline: pull latest labeled ground truth -> train candidate model -> champion vs challenger test -> automated artifact registration'
    ],
    explanation: 'Production machine learning reliability, drift monitoring, and continuous deployment.'
  }
];
