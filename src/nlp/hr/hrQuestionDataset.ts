/**
 * CareerCurve AI HR Personal Interview Module
 * Comprehensive HR Question Dataset across 13 core competencies with rubrics,
 * expected concepts, STAR framework indicators, and resume-aware question builders.
 */

import { HRDatasetQuestion } from './types';
import { ParsedResume } from '../../types';
import { generateSevenMainHRQuestions, SEVEN_MAIN_HR_QUESTIONS } from './hrSevenQuestionEngine';

export { generateSevenMainHRQuestions, SEVEN_MAIN_HR_QUESTIONS };

export const HR_QUESTION_DATASET: HRDatasetQuestion[] = [
  // =========================================================================
  // 1. TELL ME ABOUT YOURSELF / SELF INTRODUCTION
  // =========================================================================
  {
    id: 'hr_intro_01',
    category: 'self_introduction',
    categoryDisplayName: 'Personal Introduction & Background',
    question: "Hello! Welcome to your HR interview. Let's begin. Could you please tell me about yourself and your academic journey?",
    difficulty: 'Beginner',
    style: 'Friendly',
    expectedConcepts: [
      'Academic background and branch',
      'Key technical interests or practical focus',
      'Notable academic or practical milestone',
      'Career motivation and what drives you'
    ],
    keywords: ['engineering', 'college', 'degree', 'projects', 'interest', 'journey', 'skills', 'experience', 'passionate'],
    rubric: { relevanceWeight: 0.35, completenessWeight: 0.25, clarityWeight: 0.20, evidenceWeight: 0.20 },
    exampleStrongAnswer: "I am a final-year engineering student with a deep passion for problem solving and software architecture. Over the last four years, I've focused on building scalable web applications and exploring distributed systems, culminating in a capstone project that handles real-time data streaming. Outside academics, I enjoy participating in technical hackathons and collaborating in cross-functional teams, which has taught me how to communicate technical concepts clearly and deliver under tight deadlines.",
    exampleWeakAnswer: "My name is John. I was born in Delhi. I like cricket and movies. I am doing engineering because my parents suggested it.",
    followUpTemplates: [
      "You mentioned your interest in {detected_entity}. What was the most technically demanding challenge you encountered while working in that area?",
      "How did your academic experiences at your university prepare you for transitioning into a high-paced industry role?"
    ],
    starFrameworkApplicable: false,
    isResumeAware: true,
    resumeFieldToInterpolate: 'department',
  },
  {
    id: 'hr_intro_02',
    category: 'self_introduction',
    categoryDisplayName: 'Personal Introduction & Executive Pitch',
    question: "Walk me through your resume in two minutes, highlighting the defining technical milestones that shaped your engineering career.",
    difficulty: 'Intermediate',
    style: 'Professional',
    expectedConcepts: [
      'Chronological or thematic narrative',
      'Key projects and internships',
      'Value delivered and skills gained',
      'Target career trajectory'
    ],
    keywords: ['milestones', 'capstone', 'internship', 'architecture', 'technologies', 'leadership', 'skills', 'growth'],
    rubric: { relevanceWeight: 0.35, completenessWeight: 0.30, clarityWeight: 0.20, evidenceWeight: 0.15 },
    exampleStrongAnswer: "My journey began with strong fundamentals in algorithms and computer systems. During my second year, I built an end-to-end data processing tool that catalyzed my interest in back-end engineering. Last summer, I interned as an associate developer where I optimized query performance by 30%, which taught me how engineering decisions impact production reliability. Today, I'm eager to bring that blend of algorithmic rigor and practical execution to your engineering team.",
    exampleWeakAnswer: "Well, you have my resume there. First I did high school, then college, took several classes, and now I'm looking for any job.",
    followUpTemplates: [
      "Which of those milestones had the steepest learning curve for you, and how did you overcome it?",
      "Looking at that progression, what is the next major engineering skill you are actively working to master?"
    ],
    starFrameworkApplicable: false,
    isResumeAware: true,
    resumeFieldToInterpolate: 'department',
  },

  // =========================================================================
  // 2. STRENGTHS AND WEAKNESSES
  // =========================================================================
  {
    id: 'hr_strengths_01',
    category: 'strengths_weaknesses',
    categoryDisplayName: 'Strengths & Self-Awareness',
    question: "What would you consider your single greatest technical or personal strength, and what is one genuine area of development you are actively working on?",
    difficulty: 'Beginner',
    style: 'Friendly',
    expectedConcepts: [
      'Clear identifiable strength with brief example',
      'Honest, non-cliché weakness',
      'Concrete corrective actions taken',
      'Self-reflection and growth mindset'
    ],
    keywords: ['strength', 'weakness', 'improvement', 'learning', 'habits', 'active', 'progress', 'discipline', 'feedback'],
    rubric: { relevanceWeight: 0.30, completenessWeight: 0.30, clarityWeight: 0.20, evidenceWeight: 0.20 },
    exampleStrongAnswer: "My greatest strength is my structured approach to debugging and root-cause analysis—when an unfamiliar bug occurs, I trace logs methodically rather than guessing. An area I am actively improving is public presentation and speaking in large executive forums. To address this, I started leading sprint retrospectives and joined technical discussion circles, which has significantly increased my confidence and clarity.",
    exampleWeakAnswer: "My weakness is that I work too hard and I'm a perfectionist. My strength is that I'm good at everything.",
    followUpTemplates: [
      "Can you give an example where that strength directly helped your team avoid a critical project delay?",
      "How do you evaluate whether your effort to improve that development area is yielding real progress?"
    ],
    starFrameworkApplicable: false,
  },
  {
    id: 'hr_strengths_02',
    category: 'strengths_weaknesses',
    categoryDisplayName: 'Constructive Criticism & Feedback',
    question: "Tell me about a time you received constructive criticism from a mentor or peer. How did you react and what changes did you implement?",
    difficulty: 'Intermediate',
    style: 'Professional',
    expectedConcepts: [
      'Specific feedback received without defensiveness',
      'Emotional maturity and openness',
      'Tangible behavioral or technical modification',
      'Long-term outcome of the change'
    ],
    keywords: ['criticism', 'feedback', 'mentor', 'peer', 'code review', 'reaction', 'adapted', 'improved', 'growth'],
    rubric: { relevanceWeight: 0.35, completenessWeight: 0.25, clarityWeight: 0.20, evidenceWeight: 0.20 },
    exampleStrongAnswer: "During a code review for our campus portal project, a senior teammate pointed out that while my code functioned properly, my commit history was disorganized and functions lacked clear modular boundaries. Initially, I felt self-conscious, but I quickly realized how maintainability impacts everyone. I read our style guide, adopted atomic commits, and refactored the module. At the next review, my mentor praised the readability of my pull requests.",
    exampleWeakAnswer: "People rarely criticize me because I make sure my work is perfect. Once someone didn't understand my code, but that was their issue.",
    followUpTemplates: [
      "How do you currently provide constructive feedback to your own peers when you review their work?",
      "What system do you use now to proactively catch similar blind spots before someone else points them out?"
    ],
    starFrameworkApplicable: true,
  },

  // =========================================================================
  // 3. CAREER GOALS & ASPIRATIONS
  // =========================================================================
  {
    id: 'hr_goals_01',
    category: 'career_goals',
    categoryDisplayName: 'Career Aspirations & Growth',
    question: "Where do you see yourself professionally in the next three to five years, and how does this role fit into that vision?",
    difficulty: 'Beginner',
    style: 'Friendly',
    expectedConcepts: [
      'Realistic short-to-medium term trajectory',
      'Depth of domain knowledge mastery',
      'Desire to mentor or take architectural ownership',
      'Alignment with organization goals'
    ],
    keywords: ['years', 'goals', 'growth', 'mastery', 'senior', 'mentor', 'architecture', 'impact', 'future'],
    rubric: { relevanceWeight: 0.35, completenessWeight: 0.25, clarityWeight: 0.20, evidenceWeight: 0.20 },
    exampleStrongAnswer: "In the next three years, my goal is to establish deep technical mastery in engineering scalable back-end systems and cloud infrastructure. By year five, I want to step into technical leadership—leading architecture design reviews, mentoring incoming junior engineers, and driving cross-team technical initiatives. This role is the ideal foundation because your engineering team tackles high-concurrency systems at scale.",
    exampleWeakAnswer: "In five years, I hope to be the CEO or manager so I don't have to write code anymore.",
    followUpTemplates: [
      "What specific engineering skills do you plan to acquire during your first 90 days to set yourself on that path?",
      "If technology trends shift dramatically over the next few years, how adaptable are your career plans?"
    ],
    starFrameworkApplicable: false,
  },

  // =========================================================================
  // 4. WHY SHOULD WE HIRE YOU?
  // =========================================================================
  {
    id: 'hr_why_hire_01',
    category: 'why_hire_you',
    categoryDisplayName: 'Value Proposition & Differentiators',
    question: "With many qualified engineering candidates applying for this position, what unique value or mindset do you bring that sets you apart?",
    difficulty: 'Intermediate',
    style: 'Professional',
    expectedConcepts: [
      'Combination of technical skill and execution grit',
      'Fast learner and problem solver',
      'Strong team orientation and communication',
      'Enthusiasm for building real impact'
    ],
    keywords: ['value', 'unique', 'differentiator', 'mindset', 'fast learner', 'ownership', 'grit', 'collaboration', 'results'],
    rubric: { relevanceWeight: 0.35, completenessWeight: 0.25, clarityWeight: 0.20, evidenceWeight: 0.20 },
    exampleStrongAnswer: "What sets me apart is my ability to bridge strong foundational engineering with relentless execution. Many candidates know the theory, but I take pride in taking end-to-end ownership—from architecture and testing to documentation and deployment. When production edge cases occur, I don't stop at a temporary fix; I investigate the root cause to ensure it never happens again.",
    exampleWeakAnswer: "You should hire me because I have high marks and I really need this job.",
    followUpTemplates: [
      "Can you give an example of a project where taking that end-to-end ownership made a measurable difference?",
      "How do you maintain that standard of rigor when faced with strict launch deadlines?"
    ],
    starFrameworkApplicable: false,
  },

  // =========================================================================
  // 5. WHY DO YOU WANT THIS ROLE / COMPANY?
  // =========================================================================
  {
    id: 'hr_why_role_01',
    category: 'why_this_role',
    categoryDisplayName: 'Company Motivation & Alignment',
    question: "What specifically motivated you to apply for our company, and what excites you about the problems we are solving?",
    difficulty: 'Beginner',
    style: 'Friendly',
    expectedConcepts: [
      'Knowledge of company domain or engineering challenges',
      'Genuine connection to product or mission',
      'Desire to contribute to meaningful user impact'
    ],
    keywords: ['company', 'mission', 'product', 'culture', 'scale', 'impact', 'motivation', 'excited', 'solving'],
    rubric: { relevanceWeight: 0.40, completenessWeight: 0.25, clarityWeight: 0.20, evidenceWeight: 0.15 },
    exampleStrongAnswer: "I've been closely following how your platform handles millions of concurrent interactions with sub-second response times. As someone fascinated by distributed data pipelines, the prospect of contributing to high-availability architecture directly aligns with what I love doing. Beyond the tech stack, your culture of engineering transparency and continuous learning makes this the environment where I know I can do my best work.",
    exampleWeakAnswer: "I applied because I saw your job opening on LinkedIn and the salary package looked good.",
    followUpTemplates: [
      "Which specific feature or service in our product do you think has the most room for engineering enhancement?",
      "How do your personal core values align with our team's mission?"
    ],
    starFrameworkApplicable: false,
  },

  // =========================================================================
  // 6. TEAMWORK AND CONFLICT RESOLUTION (STAR FRAMEWORK)
  // =========================================================================
  {
    id: 'hr_teamwork_01',
    category: 'teamwork_conflict',
    categoryDisplayName: 'Collaboration & Conflict Resolution',
    question: "Describe a situation where you had a significant technical disagreement with a teammate. How did you handle the situation and reach alignment?",
    difficulty: 'Intermediate',
    style: 'Professional',
    expectedConcepts: [
      'Situation: Context of team and technical decision',
      'Task: The conflicting perspectives',
      'Action: Objective data gathering, benchmarking, respectful communication',
      'Result: Consensus reached, project outcome, maintained relationship'
    ],
    keywords: ['disagreement', 'conflict', 'teammate', 'benchmark', 'data', 'consensus', 'compromise', 'respect', 'resolution'],
    rubric: { relevanceWeight: 0.30, completenessWeight: 0.30, clarityWeight: 0.20, evidenceWeight: 0.20 },
    exampleStrongAnswer: "During our semester database design, a teammate wanted to use MongoDB for flexibility, while I advocated PostgreSQL because our data schema had strictly relational ACID transaction requirements. Instead of arguing opinion, I proposed we build a proof-of-concept benchmark testing 10,000 concurrent records. The benchmark demonstrated that PostgreSQL gave 40% faster join queries and prevented orphan records. My teammate agreed with the data, and we finished the project ahead of schedule.",
    exampleWeakAnswer: "I had a fight with a teammate who didn't know what they were doing. I went over their head and told the professor so they had to listen to me.",
    followUpTemplates: [
      "What if the benchmark had shown inconclusive results? How would you have made the trade-off decision then?",
      "How did that experience influence how you approach architectural debates with peers now?"
    ],
    starFrameworkApplicable: true,
  },

  // =========================================================================
  // 7. LEADERSHIP AND PROBLEM SOLVING (STAR FRAMEWORK)
  // =========================================================================
  {
    id: 'hr_leadership_01',
    category: 'leadership_problem_solving',
    categoryDisplayName: 'Initiative & Leadership',
    question: "Tell me about a time you had to step up and take leadership of a project or initiative when things were unstructured or falling behind.",
    difficulty: 'Intermediate',
    style: 'Professional',
    expectedConcepts: [
      'Situation: The unstructured problem or team stagnation',
      'Task: What needed to be achieved',
      'Action: Organizing roadmap, delegating based on strengths, unblocking teammates',
      'Result: Timely delivery, elevated team morale, quantifiable success'
    ],
    keywords: ['initiative', 'leadership', 'delegation', 'unblocked', 'roadmap', 'ownership', 'organized', 'delivered', 'result'],
    rubric: { relevanceWeight: 0.30, completenessWeight: 0.30, clarityWeight: 0.20, evidenceWeight: 0.20 },
    exampleStrongAnswer: "In a 36-hour hackathon, our team hit a roadblock at the 20-hour mark when our front-end and back-end APIs were completely out of sync, and morale dropped. I stepped up, called a 15-minute sync, and documented a mock OpenAPI contract so both sides could develop independently without blocking each other. I also redistributed remaining tasks based on each person's core strengths. We integrated seamlessly in the final hour and placed in the top three teams.",
    exampleWeakAnswer: "I was the leader because nobody else wanted to do anything, so I ended up doing the whole project myself while they took credit.",
    followUpTemplates: [
      "How did you ensure every teammate felt valued and heard rather than micromanaged?",
      "What was your key takeaway regarding leadership during high-pressure crises?"
    ],
    starFrameworkApplicable: true,
  },

  // =========================================================================
  // 8. HANDLING FAILURE AND RESILIENCE (STAR FRAMEWORK)
  // =========================================================================
  {
    id: 'hr_failure_01',
    category: 'handling_failure',
    categoryDisplayName: 'Resilience & Learning from Mistakes',
    question: "Can you share an instance where a project or plan did not go as expected or failed completely? What went wrong and what did you learn?",
    difficulty: 'Advanced',
    style: 'Challenging',
    expectedConcepts: [
      'Situation: Real setback or technical failure',
      'Task: The intended outcome',
      'Action: Accepting ownership without making excuses, investigating root cause',
      'Result: Concrete lesson learned and preventative safeguards instituted'
    ],
    keywords: ['failure', 'mistake', 'setback', 'ownership', 'root cause', 'safeguard', 'lesson', 'resilience', 'prevented'],
    rubric: { relevanceWeight: 0.30, completenessWeight: 0.30, clarityWeight: 0.20, evidenceWeight: 0.20 },
    exampleStrongAnswer: "In our first web deployment, I pushed an unindexed migration directly to our cloud database right before a team demo. The database CPU spiked to 100%, causing queries to time out during the presentation. It was embarrassing, but I took full ownership, rolled back the migration, and analyzed the slow query log. I learned never to push schema updates without staging load tests and indexing. Since then, I always integrate automated staging checks.",
    exampleWeakAnswer: "I haven't really had any failures. Whenever something goes wrong, it's usually because third-party APIs were down.",
    followUpTemplates: [
      "How did you communicate the failure to your stakeholders or professors in that moment?",
      "How has that experience shaped your risk-management strategy for production deployments?"
    ],
    starFrameworkApplicable: true,
  },

  // =========================================================================
  // 9. TIME MANAGEMENT & PRESSURE
  // =========================================================================
  {
    id: 'hr_time_01',
    category: 'time_management',
    categoryDisplayName: 'Time Management & Stress Handling',
    question: "How do you prioritize competing deadlines when multiple urgent tasks demand your attention simultaneously?",
    difficulty: 'Beginner',
    style: 'Friendly',
    expectedConcepts: [
      'Prioritization frameworks (Eisenhower matrix, impact vs effort)',
      'Communication with stakeholders early',
      'Breaking work into manageable milestones',
      'Maintaining composure and code quality'
    ],
    keywords: ['prioritize', 'deadline', 'urgent', 'urgent vs important', 'communication', 'milestones', 'pressure', 'calm'],
    rubric: { relevanceWeight: 0.35, completenessWeight: 0.25, clarityWeight: 0.20, evidenceWeight: 0.20 },
    exampleStrongAnswer: "When faced with competing priorities, I categorize tasks by urgency and business impact rather than reacting to whoever pinged me last. I proactively communicate with stakeholders immediately if deadlines are at risk, negotiating scope before quality is compromised. Breaking large deliverables into discrete 2-hour milestones keeps me focused and ensures steady, verifiable progress without burnout.",
    exampleWeakAnswer: "I just drink coffee and stay up all night until everything is finished.",
    followUpTemplates: [
      "Have you ever had to say 'no' to a request because it conflicted with a top priority? How did you frame it?",
      "What tools or productivity systems do you rely on daily to manage your task backlog?"
    ],
    starFrameworkApplicable: false,
  },

  // =========================================================================
  // 10. ADAPTABILITY & FAST LEARNING
  // =========================================================================
  {
    id: 'hr_adaptability_01',
    category: 'adaptability',
    categoryDisplayName: 'Agility & Learning Curve',
    question: "Tell me about a time you had to learn an entirely new technology, tool, or framework on very short notice to accomplish a project.",
    difficulty: 'Intermediate',
    style: 'Professional',
    expectedConcepts: [
      'Situation: Sudden requirement for unfamiliar tech stack',
      'Task: Project requirement and tight timeframe',
      'Action: Structured learning method (official docs, building tiny prototypes, asking smart questions)',
      'Result: Successful integration and mastery gained'
    ],
    keywords: ['new technology', 'framework', 'short notice', 'fast learner', 'documentation', 'prototype', 'adapted', 'success'],
    rubric: { relevanceWeight: 0.30, completenessWeight: 0.30, clarityWeight: 0.20, evidenceWeight: 0.20 },
    exampleStrongAnswer: "For a hackathon, our client required a Dockerized microservice architecture using Go, a language I had never written before. With only 48 hours, I spent the first four hours reading the official Go tour and building a small CRUD endpoint to understand goroutines and channels. By noon, I was able to write our payment webhook handler. We deployed successfully, and Go is now one of my favorite languages for concurrency.",
    exampleWeakAnswer: "I don't like switching technologies because I prefer sticking to what I already know.",
    followUpTemplates: [
      "What is your general methodology when reading technical documentation for the first time?",
      "How do you evaluate whether a new framework is ready for production vs just experimental hype?"
    ],
    starFrameworkApplicable: true,
  },

  // =========================================================================
  // 11. PROJECT CONTRIBUTION & RESUME OWNERSHIP (RESUME-AWARE)
  // =========================================================================
  {
    id: 'hr_project_01',
    category: 'project_contribution',
    categoryDisplayName: 'Project Deep-Dive & Ownership',
    question: "Looking at your resume, you highlighted your engineering projects. Can you describe the project you are most proud of, your individual contribution, and the quantifiable outcome?",
    difficulty: 'Intermediate',
    style: 'Professional',
    expectedConcepts: [
      'Clear project premise and architectural design',
      'Exact individual contribution vs team effort',
      'Quantifiable metrics (speedup, users, accuracy, reduced latency)',
      'Engineering challenges solved'
    ],
    keywords: ['project', 'contribution', 'architecture', 'metrics', 'impact', 'technologies', 'ownership', 'built', 'outcome'],
    rubric: { relevanceWeight: 0.35, completenessWeight: 0.30, clarityWeight: 0.20, evidenceWeight: 0.15 },
    exampleStrongAnswer: "The project I'm most proud of is our capstone platform. While my team handled UI styling, I took full responsibility for the data ingest engine and database queries. I architected asynchronous queues with Redis to buffer incoming payloads, which decreased endpoint response latency from 680ms to under 120ms under heavy stress tests. Seeing the system maintain stability with zero memory leaks was incredibly rewarding.",
    exampleWeakAnswer: "Our project was a website. We worked together as a team and got a good grade from our professor.",
    followUpTemplates: [
      "You specifically mentioned utilizing {detected_entity} in this project. What was the most demanding edge case or performance bottleneck you resolved while working with it?",
      "If you had another two months to refactor that system, what architectural component would you redesign first?"
    ],
    starFrameworkApplicable: true,
    isResumeAware: true,
    resumeFieldToInterpolate: 'project',
  },

  // =========================================================================
  // 12. SALARY EXPECTATIONS & WORK CULTURE
  // =========================================================================
  {
    id: 'hr_salary_01',
    category: 'salary_work_culture',
    categoryDisplayName: 'Professional Standards & Culture Fit',
    question: "What kind of team culture enables you to perform at your best, and what are your expectations regarding professional growth and compensation?",
    difficulty: 'Beginner',
    style: 'Professional',
    expectedConcepts: [
      'Culture of psychological safety, high standards, and open feedback',
      'Focus on skill growth, mentorship, and impactful work',
      'Professional, competitive industry-aligned compensation perspective'
    ],
    keywords: ['culture', 'growth', 'mentorship', 'feedback', 'compensation', 'competitive', 'standards', 'supportive'],
    rubric: { relevanceWeight: 0.35, completenessWeight: 0.25, clarityWeight: 0.20, evidenceWeight: 0.20 },
    exampleStrongAnswer: "I thrive in cultures that combine high technical standards with psychological safety—where teammates debate ideas openly without ego and celebrate collective wins. In terms of growth, I value having accessible mentors and clear performance metrics. For compensation, I trust that your organization offers competitive packages aligned with industry standards for graduate software engineers.",
    exampleWeakAnswer: "I just want whatever pays the most money and has minimal work so I can relax.",
    followUpTemplates: [
      "How do you contribute to creating that supportive environment for teammates around you?",
      "How do you prefer to receive feedback from your engineering manager?"
    ],
    starFrameworkApplicable: false,
  },

  // =========================================================================
  // 13. QUESTIONS FOR THE INTERVIEWER
  // =========================================================================
  {
    id: 'hr_candidate_q_01',
    category: 'candidate_questions',
    categoryDisplayName: 'Curiosity & Engagement',
    question: "We have reached the end of our formal questions. Do you have any thoughtful questions for me regarding our engineering team, culture, or technology roadmap?",
    difficulty: 'Beginner',
    style: 'Friendly',
    expectedConcepts: [
      'Thoughtful curiosity about real engineering challenges',
      'Questions about team culture, mentorship, or deployment cycles',
      'Active listening and engagement'
    ],
    keywords: ['questions', 'roadmap', 'team', 'culture', 'deployment', 'engineering', 'mentorship', 'challenges', 'day in the life'],
    rubric: { relevanceWeight: 0.40, completenessWeight: 0.30, clarityWeight: 0.20, evidenceWeight: 0.10 },
    exampleStrongAnswer: "Yes, thank you! I'd love to know: what does a typical sprint deployment cycle look like for an associate engineer on your team, and what is one major technical challenge your team is planning to solve in the next two quarters?",
    exampleWeakAnswer: "No, I don't have any questions. How soon will I know if I got the job?",
    followUpTemplates: [
      "That's a great question! What excites you most about participating in that kind of deployment cycle?"
    ],
    starFrameworkApplicable: false,
  },

  // =========================================================================
  // 14. ETHICAL DECISIONS & PROFESSIONAL BEHAVIOR
  // =========================================================================
  {
    id: 'hr_ethics_01',
    category: 'ethics_professional_behavior',
    categoryDisplayName: 'Ethics & Professional Integrity',
    question: "Can you describe a situation where you faced an ethical dilemma or had to uphold integrity in an academic or technical project? How did you handle it?",
    difficulty: 'Intermediate',
    style: 'Professional',
    expectedConcepts: [
      'Clear identification of the ethical dilemma or integrity challenge',
      'Principled reasoning and adherence to professional standards',
      'Action taken to uphold honesty or software quality',
      'Positive outcome or lesson in accountability'
    ],
    keywords: ['integrity', 'ethics', 'dilemma', 'honest', 'standard', 'data', 'security', 'responsibility', 'transparency'],
    rubric: { relevanceWeight: 0.35, completenessWeight: 0.25, clarityWeight: 0.20, evidenceWeight: 0.20 },
    exampleStrongAnswer: "During a collaborative data-analytics project, we noticed that an outlier dataset was distorting our accuracy metrics, and one teammate suggested filtering it out without disclosure to present higher benchmark scores. I explained that concealing genuine anomalies creates technical debt and risks invalidating real-world usage. Instead, I proposed analyzing why the anomaly occurred and documented both scenarios transparently in our report. Our professor commended our thoroughness and ethical transparency.",
    exampleWeakAnswer: "I have never faced any ethical issues. I always follow rules so there's nothing to talk about.",
    followUpTemplates: [
      "If a stakeholder insisted on skipping data validation checks to launch faster, how would you navigate that conversation?",
      "How do you maintain software integrity and data privacy when working with third-party APIs or libraries?"
    ],
    starFrameworkApplicable: true,
  },
  {
    id: 'hr_ethics_02',
    category: 'ethics_professional_behavior',
    categoryDisplayName: 'Professional Accountability & Standards',
    question: "If you discovered a critical security vulnerability or data exposure in a production feature shortly before a major release, how would you respond?",
    difficulty: 'Advanced',
    style: 'Challenging',
    expectedConcepts: [
      'Immediate risk evaluation and escalation protocol',
      'Transparent communication with leads and stakeholders',
      'Actionable mitigation or patch proposal',
      'Commitment to user trust over short-term release optics'
    ],
    keywords: ['vulnerability', 'security', 'production', 'escalation', 'patch', 'mitigation', 'risk', 'trust', 'stakeholders'],
    rubric: { relevanceWeight: 0.35, completenessWeight: 0.30, clarityWeight: 0.20, evidenceWeight: 0.15 },
    exampleStrongAnswer: "I would immediately isolate the vulnerability, gauge its severity, and reproduce it in a staging environment to document the exact vector. I would promptly inform the engineering lead and release manager with empirical evidence, proposing a prioritized patch or a temporary feature toggle to unblock safe deployment without compromising user data. Protecting user trust and production reliability must always take precedence over vanity deadlines.",
    exampleWeakAnswer: "I would just ignore it until someone else reports it, or let the security team handle it after launch.",
    followUpTemplates: [
      "How do you balance rapid delivery cycles with rigorous automated security testing in your workflow?",
      "What steps do you take in your personal code reviews to catch potential security vulnerabilities before QA?"
    ],
    starFrameworkApplicable: true,
  },

  // =========================================================================
  // 15. MOTIVATION & COMPANY FIT
  // =========================================================================
  {
    id: 'hr_motivation_01',
    category: 'motivation_company_fit',
    categoryDisplayName: 'Motivation & Cultural Alignment',
    question: "What genuinely motivates you to do your best engineering work every day, and what kind of team culture brings out your highest performance?",
    difficulty: 'Beginner',
    style: 'Friendly',
    expectedConcepts: [
      'Intrinsic drivers: problem solving, customer impact, craftsmanship',
      'Appreciation for collaborative, transparent, and blameless cultures',
      'Self-driven initiative and commitment to craftsmanship'
    ],
    keywords: ['motivation', 'culture', 'craftsmanship', 'impact', 'collaboration', 'curiosity', 'growth', 'teamwork', 'learning'],
    rubric: { relevanceWeight: 0.35, completenessWeight: 0.25, clarityWeight: 0.20, evidenceWeight: 0.20 },
    exampleStrongAnswer: "What motivates me most is knowing that the code I write solves real problems for end users while remaining clean and maintainable for my teammates. I thrive in an engineering culture that values open design discussions, constructive peer reviews, and psychological safety where questions are welcomed. When engineers feel supported to explore new ideas and hold each other to high technical standards, the entire team succeeds.",
    exampleWeakAnswer: "Money and job stability motivate me. I just want a regular 9 to 5 where I get told what to code.",
    followUpTemplates: [
      "Can you give an example of a project where that intrinsic motivation drove you to go above and beyond the baseline requirements?",
      "How do you stay motivated during repetitive or less glamorous development tasks like documentation or bug fixes?"
    ],
    starFrameworkApplicable: false,
  },

  // =========================================================================
  // 16. FUTURE GOALS & LEARNING PLANS
  // =========================================================================
  {
    id: 'hr_future_01',
    category: 'future_goals_learning',
    categoryDisplayName: 'Future Goals & Continuous Learning',
    question: "Where do you envision yourself professionally three to five years from now, and what deliberate steps or learning plans are you pursuing to reach that milestone?",
    difficulty: 'Intermediate',
    style: 'Professional',
    expectedConcepts: [
      'Clear, realistic 3-5 year technical roadmap',
      'Intent to develop specialized technical mastery or systems architecture',
      'Continuous learning strategy: projects, open source, documentation',
      'Contribution to team success and mentoring'
    ],
    keywords: ['future', 'roadmap', 'learning', 'specialization', 'architecture', 'mentoring', 'goals', 'milestones', 'growth'],
    rubric: { relevanceWeight: 0.35, completenessWeight: 0.25, clarityWeight: 0.20, evidenceWeight: 0.20 },
    exampleStrongAnswer: "In three to five years, I aim to develop deep domain expertise in distributed systems and cloud architecture, growing into a dependable senior engineer who designs resilient infrastructure and mentors incoming developers. To achieve this, I consistently study production post-mortems from top engineering companies, build hands-on architectural prototypes, and contribute to open-source developer tooling.",
    exampleWeakAnswer: "In five years I want to be a manager or director so I don't have to code anymore.",
    followUpTemplates: [
      "Which emerging technology or paradigm do you believe will have the greatest impact on software engineering over the next five years?",
      "How do you prioritize what to learn next given how fast new frameworks and AI tools appear?"
    ],
    starFrameworkApplicable: false,
  },

  // =========================================================================
  // 17. HANDLING MISTAKES & CHALLENGES (ADDITIONAL DEEP-DIVE)
  // =========================================================================
  {
    id: 'hr_mistakes_01',
    category: 'handling_failure',
    categoryDisplayName: 'Mistakes, Challenges & Accountability',
    question: "Tell me about a specific technical mistake or poor assumption you made in a past project. How did you identify it, how did you fix it, and what did it teach you?",
    difficulty: 'Intermediate',
    style: 'Professional',
    expectedConcepts: [
      'Honest ownership of a genuine mistake without blaming others',
      'Systematic identification and root-cause analysis',
      'Prompt remediation and testing',
      'Lasting preventative measures adopted'
    ],
    keywords: ['mistake', 'assumption', 'failure', 'ownership', 'root cause', 'fix', 'lesson', 'learned', 'testing', 'debugging'],
    rubric: { relevanceWeight: 0.35, completenessWeight: 0.25, clarityWeight: 0.20, evidenceWeight: 0.20 },
    exampleStrongAnswer: "Early in my task queue project, I assumed database connection pooling would scale automatically with incoming requests. Under simulated load tests, the pool exhausted and connections timed out. Instead of making excuses, I profiled the connection lifecycle, realized idle connections weren't being released promptly, and reconfigured our pool with explicit keep-alives and backoff retry logic. It taught me never to assume third-party defaults are production-ready without empirical load testing.",
    exampleWeakAnswer: "I don't really make mistakes in my code. Once a teammate pushed a bug, but I told them to fix it.",
    followUpTemplates: [
      "What guardrails or automated tests did you add to ensure that specific failure mode never recurred?",
      "How do you share lessons from your past mistakes with teammates so the whole group benefits?"
    ],
    starFrameworkApplicable: true,
  },

  // =========================================================================
  // 18. TIME MANAGEMENT & DEADLINES (ADDITIONAL DEEP-DIVE)
  // =========================================================================
  {
    id: 'hr_time_02',
    category: 'time_management',
    categoryDisplayName: 'Prioritization & Competing Deadlines',
    question: "Describe a situation where you had multiple urgent technical tasks or exams competing for your time. How did you prioritize and ensure quality deliverables?",
    difficulty: 'Beginner',
    style: 'Friendly',
    expectedConcepts: [
      'Prioritization framework (e.g. impact vs urgency, milestone breakdown)',
      'Clear timeboxing and elimination of non-essential distractions',
      'Proactive communication with team members or professors',
      'Successful delivery without burnout or quality degradation'
    ],
    keywords: ['prioritization', 'deadlines', 'timeboxing', 'competing', 'deliverables', 'organization', 'focus', 'communication'],
    rubric: { relevanceWeight: 0.35, completenessWeight: 0.25, clarityWeight: 0.20, evidenceWeight: 0.20 },
    exampleStrongAnswer: "Last semester, our capstone final sprint coincided directly with mid-term exams. I mapped out all deliverables by dependency and estimated effort, broke our capstone backlog into discrete 2-hour modules, and communicated our revised milestone timeline to our faculty advisor. By timeboxing coding in the mornings and exam prep in the evenings, I completed the project sprint two days before the deadline and maintained a strong academic record.",
    exampleWeakAnswer: "I stayed up all night for three days straight and drank energy drinks. It was chaotic but somehow worked.",
    followUpTemplates: [
      "When a sudden unplanned emergency occurs in a sprint, what is your immediate triage process?",
      "How do you communicate with stakeholders if you realize a deadline is at risk despite your best efforts?"
    ],
    starFrameworkApplicable: true,
  }
];

/**
 * Builds a dynamic, resume-aware question tailored to the authenticated candidate.
 * Strictly uses the current candidate's parsed resume data without leaking any other user's records.
 */
export function buildResumeAwareQuestion(
  baseQuestion: HRDatasetQuestion,
  parsedResume: ParsedResume | null
): string {
  if (!baseQuestion.isResumeAware || !parsedResume) {
    return baseQuestion.question;
  }

  // 1. If question is about project contribution
  if (baseQuestion.resumeFieldToInterpolate === 'project' && parsedResume.projects && parsedResume.projects.length > 0) {
    const topProject = parsedResume.projects[0];
    const techSnippet = topProject.technologies && topProject.technologies.length > 0
      ? ` using ${topProject.technologies.slice(0, 3).join(', ')}`
      : '';
    return `In your resume, you highlighted your project "${topProject.title}"${techSnippet}. Could you walk me through your specific individual role in that project, the technical obstacles you overcame, and the measurable results you achieved?`;
  }

  // 2. If question is about self-introduction / department
  if (baseQuestion.resumeFieldToInterpolate === 'department' && parsedResume.department) {
    const rawCollege = parsedResume.education?.[0]?.college || (parsedResume.education?.[0] as any)?.institution;
    const collegeSnippet = rawCollege ? ` at ${rawCollege}` : '';
    const nameGreeting = parsedResume.fullName ? ` ${parsedResume.fullName}` : '';
    if (baseQuestion.difficulty === 'Intermediate') {
      return `Welcome${nameGreeting}! Looking at your background in ${parsedResume.department}${collegeSnippet}, could you walk me through your journey in two minutes, highlighting the defining technical milestones that shaped your engineering career?`;
    }
    return `Hello and welcome${nameGreeting}! To kick off our HR interview, could you please introduce yourself, sharing what inspired you to pursue ${parsedResume.department}${collegeSnippet} and how that shapes your engineering goals?`;
  }

  return baseQuestion.question;
}

/**
 * Generates an interview question sequence based on candidate configuration,
 * target duration, difficulty, and resume.
 */
export function selectInterviewQuestions(
  config: {
    type: string;
    difficulty: string;
    durationMinutes: number;
    style: string;
  },
  parsedResume: ParsedResume | null
): { question: HRDatasetQuestion; personalizedText: string }[] {
  // Determine target question count based on duration (approx 2 mins per question + buffer)
  let count = 4;
  if (config.durationMinutes === 5) count = 3;
  else if (config.durationMinutes === 10) count = 5;
  else if (config.durationMinutes === 15) count = 7;

  // Curated category progression for a natural interview
  const categoryOrder = [
    'self_introduction',
    'project_contribution',
    'strengths_weaknesses',
    'teamwork_conflict',
    'leadership_problem_solving',
    'handling_failure',
    'time_management',
    'ethics_professional_behavior',
    'motivation_company_fit',
    'future_goals_learning',
    'career_goals',
    'why_hire_you',
    'candidate_questions'
  ];

  const selected: { question: HRDatasetQuestion; personalizedText: string }[] = [];
  const usedCategories = new Set<string>();

  for (const cat of categoryOrder) {
    if (selected.length >= count) break;
    const candidates = HR_QUESTION_DATASET.filter((q) => q.category === cat);
    if (candidates.length > 0) {
      // Pick matching difficulty if available, else first
      const matched = candidates.find((q) => q.difficulty === config.difficulty) || candidates[0];
      const personalizedText = buildResumeAwareQuestion(matched, parsedResume);
      selected.push({ question: matched, personalizedText });
      usedCategories.add(cat);
    }
  }

  // If still need questions, fill from remaining dataset
  if (selected.length < count) {
    for (const q of HR_QUESTION_DATASET) {
      if (selected.length >= count) break;
      if (!usedCategories.has(q.category)) {
        selected.push({
          question: q,
          personalizedText: buildResumeAwareQuestion(q, parsedResume)
        });
        usedCategories.add(q.category);
      }
    }
  }

  return selected;
}
