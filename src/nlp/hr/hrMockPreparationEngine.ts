/**
 * CareerCurve HR Mock Preparation Engine
 * 
 * Generates comprehensive HR mock interview questions, why-interviewer-asks rationales,
 * key points to include, fresher and experienced sample answers, common mistakes to avoid,
 * and delivery/speaking tips for BOTH Technical and Non-Technical candidates.
 */

import { ParsedResume } from '../../types';
import { normalizeDepartment } from './hrSevenQuestionEngine';

export interface HRMockQuestion {
  id: string;
  index: number;
  category: 'core' | 'resume' | 'domain' | 'behavioral' | 'company';
  categoryLabel: string;
  title: string;
  questionText: string;
  whyInterviewerAsks: string;
  importantPoints: string[];
  fresherExample: string;
  experiencedExample: string;
  commonMistakes: string[];
  tipsForImproving: string[];
  structureFramework: string;
  expectedKeywords: string[];
}

export interface MockSpeechEvaluationResult {
  wordCount: number;
  estimatedSpeakingSeconds: number;
  speakingPaceRating: 'Too Brief' | 'Good Pace' | 'Slightly Rushed' | 'Comprehensive';
  matchedKeywords: string[];
  missingKeyConcepts: string[];
  hasOpening: boolean;
  hasEvidenceOrExample: boolean;
  hasConclusion: boolean;
  score: number;
  overallRating: 'Needs Practice' | 'Good Foundation' | 'Interview Ready' | 'Exceptional';
  feedback: string;
  actionableSuggestions: string[];
}

/**
 * Builds a comprehensive, personalized list of 8-9 Mock Preparation HR questions
 * tailored to candidate background (technical vs non-technical, fresher vs experienced,
 * specific resume skills, projects, certifications, and target company).
 */
export function generateHRMockQuestions(
  parsedResume: ParsedResume | null,
  targetCompany?: string,
  isNonTechOverride?: boolean,
  isExperiencedOverride?: boolean
): HRMockQuestion[] {
  const candidateName = parsedResume?.fullName ? parsedResume.fullName.split(' ')[0] : 'Candidate';
  const rawDept = parsedResume?.department || '';
  const normalizedDept = normalizeDepartment(rawDept);

  const candidateClassification = parsedResume?.classification;
  const isNonTech = isNonTechOverride ?? (
    candidateClassification?.educationalCategory === 'non_technical' ||
    parsedResume?.userSelectedCategory === 'non_technical' ||
    candidateClassification?.userSelectedCategory === 'non_technical' ||
    candidateClassification?.isTechnical === false ||
    /(commerce|b\.?com|bba|mba|business|management|finance|accounting|marketing|human resource|hr|arts|humanities|english|customer service|customer support)/i.test(rawDept)
  );

  const isExperienced = isExperiencedOverride ?? (
    candidateClassification?.track === 'experienced' ||
    Boolean(parsedResume?.employmentHistory && parsedResume.employmentHistory.length > 0)
  );

  const degree = parsedResume?.education?.[0]?.degree || (isNonTech ? 'Bachelor of Commerce (B.Com)' : 'Bachelor of Technology (B.Tech)');
  const college = parsedResume?.education?.[0]?.college || (parsedResume?.education?.[0] as any)?.institution || 'your university';
  const primaryProject = parsedResume?.projects?.[0];
  const projectTitle = primaryProject?.title || (isNonTech ? 'Customer Feedback Survey using Excel' : 'Web & Mobile Application Capstone');
  const primarySkill = parsedResume?.rawSkillsList?.[0] || (isNonTech ? 'Customer communication & MS Excel' : 'Python & React');
  const company = targetCompany && targetCompany.trim() && targetCompany.trim().toLowerCase() !== 'general' && targetCompany.trim().toLowerCase() !== 'general company'
    ? targetCompany.trim()
    : 'your organization';

  const questions: HRMockQuestion[] = [];

  // =========================================================================
  // 1. TELL ME ABOUT YOURSELF
  // =========================================================================
  questions.push({
    id: 'mock_q1_self_intro',
    index: 0,
    category: 'core',
    categoryLabel: 'Core Foundation',
    title: 'Tell me about yourself',
    questionText: isNonTech
      ? `Could you please tell me about yourself—including your educational background in ${normalizedDept}, core skills, practical projects like "${projectTitle}", and what motivates you in your professional journey?`
      : `Could you please tell me about yourself—including your educational background in ${normalizedDept}, core technical skills, hands-on projects like "${projectTitle}", and what motivates you in your engineering journey?`,
    whyInterviewerAsks: `Interviewers use this opener to evaluate your communication clarity, poise, executive presence, and ability to summarize complex personal history concisely. They want to see if your educational trajectory and practical projects naturally connect with the role you are applying for.`,
    importantPoints: [
      `Present: Your current status (degree in ${degree} from ${college}) and immediate core strengths.`,
      `Past: Hands-on evidence—practical coursework, your work on "${projectTitle}", or internship responsibilities.`,
      `Skills: Concrete proficiencies such as ${primarySkill} and your professional problem-solving mindset.`,
      `Future: Why you are passionate about this specific domain and why this interview is the logical next step.`
    ],
    fresherExample: isNonTech
      ? `Hello, my name is ${candidateName}. I am graduating with a ${degree} from ${college}. Throughout my academic journey, I have developed strong proficiencies in ${primarySkill}, document filing, and business email correspondence. A major highlight was my project "${projectTitle}", where I analyzed survey data using MS Excel and formulated concrete recommendations to improve customer satisfaction. Outside of coursework, I volunteered at college events coordinating attendee helpdesks, which strengthened my active listening and crisis de-escalation skills. I am excited to begin my career in an operations and customer-focused team where I can deliver reliable, organized support.`
      : `Hello, my name is ${candidateName}. I am a final-year engineering student completing my ${degree} in ${normalizedDept} at ${college}. My technical focus centers on full-stack development and data structures, with strong proficiency in ${primarySkill} and relational databases. A key milestone in my degree was building "${projectTitle}", where I designed the database schema, engineered RESTful API endpoints, and optimized page load latency by 35%. I actively contribute to coding hackathons and peer code reviews, which taught me the value of clean, maintainable architecture. I am eager to join a forward-thinking engineering team where I can solve challenging software problems at scale.`,
    experiencedExample: isNonTech
      ? `Hello, I'm ${candidateName}. I bring over 2 years of professional domain experience in business operations and customer support. In my recent role, I managed daily client correspondence, resolved high-priority CRM escalation tickets, and streamlined spreadsheet tracking using MS Excel, which reduced recurring processing errors by 22%. My background in ${degree} provided me with a rigorous foundation in commercial workflows and compliance. I am now looking to transition into a growing team where I can take ownership of larger client accounts and optimize daily operational efficiency.`
      : `Hello, I'm ${candidateName}. I am a software engineer with over 2 years of professional industry experience specializing in scalable backend systems and distributed services. At my previous company, I led the migration of legacy synchronous endpoints to asynchronous event queues using Docker and Redis, improving system throughput by 45% during peak loads. I also actively mentored junior developers and championed automated unit test coverage across our sprint deliverables. I am excited about this opportunity because your team works on high-availability distributed systems, where my experience in system reliability and clean code can make an immediate impact.`,
    commonMistakes: [
      `Reciting your resume chronologically line by line starting from high school.`,
      `Focusing solely on personal hobbies or family background rather than professional competencies.`,
      `Rambling beyond 2 minutes without a cohesive beginning, middle, and end.`,
      `Failing to connect your academic achievements or past projects to the job opportunity.`
    ],
    tipsForImproving: [
      `Use the "Present → Past → Future" framework for a crisp 90-second delivery.`,
      `Highlight 1 specific project or achievement with measurable numbers rather than just listing course names.`,
      `Maintain warm eye contact with the camera and speak with a confident, measured pace (around 120-140 WPM).`
    ],
    structureFramework: 'Present (Current status & degree) → Past (Key project & skills) → Future (Career alignment)',
    expectedKeywords: ['background', 'degree', 'project', 'skills', 'experience', 'learn', 'contribute', 'motivated']
  });

  // =========================================================================
  // 2. WHY SHOULD WE HIRE YOU?
  // =========================================================================
  questions.push({
    id: 'mock_q2_why_hire_you',
    index: 1,
    category: 'core',
    categoryLabel: 'Core Foundation',
    title: 'Why should we hire you?',
    questionText: `With many qualified candidates applying to ${company}, why should we hire you? What unique blend of domain skills, practical project experience, and problem-solving mindset do you bring?`,
    whyInterviewerAsks: `The recruiter is evaluating your value proposition and self-confidence. They want to know whether you understand their organizational needs and whether you can clearly articulate what distinguishes your work ethic and practical competencies from other applicants.`,
    importantPoints: [
      `Direct Match: Match your exact skills (${primarySkill}) directly with the job deliverables.`,
      `Execution Evidence: Point to concrete evidence from "${projectTitle}" or internships where you delivered results.`,
      `Grit & Adaptability: Emphasize your rapid learning curve and willingness to tackle unglamorous, necessary tasks.`,
      `Team Chemistry: Demonstrate that you are low-ego, coachable, and reliable under tight deadlines.`
    ],
    fresherExample: isNonTech
      ? `You should hire me because I offer a dependable combination of thorough domain knowledge in ${normalizedDept}, proven attention to detail, and a genuine passion for customer satisfaction. In my project "${projectTitle}", I didn't just collect data—I spent extra hours verifying each spreadsheet entry to ensure 100% data integrity before presenting recommendations. I communicate clearly, learn internal CRM tools rapidly, and approach every workplace challenge with patience and empathy. You can rely on me to uphold high standards from day one.`
      : `You should hire me because I combine solid theoretical foundations in ${normalizedDept} with proven, practical implementation skills. In my project "${projectTitle}", when our team hit unexpected performance bottlenecks, I took ownership of profiling the code, refactoring queries, and delivering a 35% speedup ahead of schedule. I don't just write code that works; I write clean, documented code that my teammates can easily maintain. I learn emerging tech stacks rapidly and bring tireless energy to solving difficult engineering problems.`,
    experiencedExample: isNonTech
      ? `You should hire me because I bring battle-tested operational discipline and client relationship skills. In my past role, I handled over 50 client inquiries daily while maintaining a 96% customer satisfaction rating and zero SLA breaches. Because of my commercial background in ${normalizedDept}, I understand how administrative precision directly impacts overall business profitability. I will hit the ground running with minimal handholding and proactively find ways to improve workflow efficiency.`
      : `You should hire me because I bridge the gap between architectural vision and disciplined production delivery. In my previous role, I consistently delivered sprint commitments on time while maintaining 90%+ automated test coverage and leading our blameless post-mortem reviews. I bring hands-on expertise in ${primarySkill}, a proven track record of reducing system downtime, and a passion for mentoring newer team members. I will immediately elevate your team's velocity and code quality.`,
    commonMistakes: [
      `Giving generic answers like "Because I am a hard worker" or "Because I need a job."`,
      `Sounding arrogant or claiming you are better than all other candidates.`,
      `Reciting skills without providing a single concrete example or evidence of execution.`,
      `Focusing on what the company can do for you rather than the value you deliver to them.`
    ],
    tipsForImproving: [
      `Structure your response with: 1. Core Competency → 2. Practical Proof Metric → 3. Cultural Add.`,
      `Use action verbs: "architected", "refactored", "tabulated", "de-escalated", "streamlined".`,
      `Conclude with enthusiasm for contributing to ${company}'s operational benchmarks.`
    ],
    structureFramework: 'Core Competency → Practical Proof Example → Team & Cultural Fit',
    expectedKeywords: ['skills', 'projects', 'value', 'contribute', 'problem solving', 'results', 'ownership', 'reliable']
  });

  // =========================================================================
  // 3. STRENGTHS AND WEAKNESSES
  // =========================================================================
  questions.push({
    id: 'mock_q3_strengths_weaknesses',
    index: 2,
    category: 'core',
    categoryLabel: 'Core Foundation',
    title: 'What are your strengths and weaknesses?',
    questionText: `Self-awareness and a willingness to grow are crucial for any successful professional. What would you say are your greatest strengths, and what is one genuine weakness you have identified and are actively working to improve?`,
    whyInterviewerAsks: `Recruiters ask this to test your emotional intelligence, honesty, and capacity for self-reflection. They want to verify that you don't use cliché dodge answers ("I'm a perfectionist") and that you actively take responsibility for personal and professional development.`,
    importantPoints: [
      `Strength: Choose a tangible professional strength relevant to the role (e.g. root-cause debugging, empathetic active listening, organized documentation).`,
      `Strength Evidence: Briefly illustrate when this strength prevented an error or solved a real dilemma.`,
      `Weakness: Select a real, non-fatal area of growth (e.g. public speaking, over-committing early, hesitation to delegate).`,
      `Active Remedy: Detail the exact corrective measures, habits, or courses you are currently practicing.`
    ],
    fresherExample: isNonTech
      ? `My greatest strength is my empathetic active listening and meticulous document organization. In customer support and administration, taking time to hear the customer out completely before responding prevents misunderstandings and calms tensions immediately. A genuine weakness I identified earlier was hesitating to say "no" or clarify priorities when multiple team members asked for assistance simultaneously. To improve, I started maintaining an organized priority task board and learned to communicate transparently with peers: "I am currently completing an urgent record verification; can I address your inquiry at 2 PM?" This has helped me safeguard quality without disappointing colleagues.`
      : `My greatest strength is my methodical approach to root-cause debugging. When a build fails or tests crash, I resist the urge to randomly change code; instead, I analyze logs, reproduce the issue in an isolated test harness, and pinpoint the exact failure. A genuine weakness I recognized was a tendency to spend too long attempting to solve complex bottlenecks entirely on my own before reaching out for guidance. To overcome this, I now follow a "30-minute rule": if I cannot make measurable diagnostic progress on a blocker within 30 minutes, I document my reproduction steps and consult senior peers. This has accelerated my team velocity significantly.`,
    experiencedExample: isNonTech
      ? `My core strength is process optimization and stakeholder communication. I excel at looking at messy operational spreadsheets or customer ticketing queues and standardizing them into efficient, error-free workflows. An area I have been actively working to improve is public presentation in front of executive audiences. While I am completely comfortable in 1-on-1 and team discussions, presenting quarterly metrics to senior leadership initially made me nervous. To tackle this, I enrolled in structured business communication workshops and volunteered to lead our weekly team debriefs, which has significantly built my delivery confidence.`
      : `My greatest strength is system resilience design and performance optimization under pressure. I anticipate edge cases early in the design phase, which prevents costly production bugs down the line. A genuine weakness I identified as I moved into senior roles was finding it difficult to delegate technical tasks that I knew I could write quickly myself. To address this, I adopted a mentorship mindset—breaking tasks down into well-defined Jira user stories, pairing with junior engineers, and focusing my time on code review feedback. This empowered our team to grow while freeing me to focus on architectural roadmaps.`,
    commonMistakes: [
      `Using humblebrags as weaknesses: "My weakness is that I work too hard / I am a perfectionist."`,
      `Mentioning a critical disqualifying flaw: "I am always late to meetings" or "I hate working with people."`,
      `Listing 5 strengths without providing evidence for any of them.`,
      `Mentioning a weakness without explaining what steps you are actively taking to overcome it.`
    ],
    tipsForImproving: [
      `Spend 40% of your time on your strength and 60% on your weakness + active growth solution.`,
      `Frame your weakness as an "area of active development" with tangible tools/routines you use daily.`,
      `Keep your tone authentic, humble, and forward-looking.`
    ],
    structureFramework: 'Tangible Strength + Proof → Genuine Weakness → Concrete Action Steps Taken',
    expectedKeywords: ['strength', 'weakness', 'improvement', 'learning', 'active listening', 'discipline', 'progress', 'habits']
  });

  // =========================================================================
  // 4. WHY DO YOU WANT TO JOIN OUR COMPANY?
  // =========================================================================
  questions.push({
    id: 'mock_q4_company_interest',
    index: 3,
    category: 'company',
    categoryLabel: 'Motivation & Company Fit',
    title: 'Why do you want to join our company?',
    questionText: `What specifically motivated you to apply to ${company}? What excites you about our culture, operational standards, and the impact our work has?`,
    whyInterviewerAsks: `Interviewers want to see if you actually researched their organization or if you submitted the exact same boilerplate application to 50 companies. They evaluate whether your career aspirations align with their mission, team values, and day-to-day challenges.`,
    importantPoints: [
      `Specific Knowledge: Reference a real initiative, product, engineering benchmark, or client reputation of ${company}.`,
      `Cultural Alignment: Explain how their culture (e.g. mentorship, high rigor, user empathy, transparency) matches your work style.`,
      `Value Contribution: Describe what you will bring to their current challenges, not just what perks you will consume.`,
      `Long-term Commitment: Signal that you view this as a multi-year opportunity for substantive mutual growth.`
    ],
    fresherExample: isNonTech
      ? `I want to join ${company} because of your stellar reputation for client trust, inclusive team culture, and transparent customer service standards. While researching ${company}, I was deeply impressed by your commitment to resolving client inquiries with empathy and high operational precision. As someone with a background in ${degree} who values structured organization and active listening, being part of an organization that invests in early-career mentorship while empowering employees to improve daily workflows is the ideal environment for me to build a meaningful, long-term career.`
      : `I want to join ${company} because of your reputation for engineering excellence, scalable architecture, and transparent peer code reviews. I have followed how your engineering teams architect high-availability services and champion automated CI/CD practices. Coming from a ${degree} background in ${normalizedDept}, I thrive in collaborative environments where engineers care deeply about clean code and system resilience. Being part of a team tackling complex technical challenges while prioritizing psychological safety and mentorship makes ${company} my top choice.`,
    experiencedExample: isNonTech
      ? `I have tracked ${company}'s consistent growth and admired your ability to deliver seamless customer experiences at enterprise scale. In my past role, I saw how easily operational friction occurs when teams scale; your emphasis on standardized operating procedures and cross-departmental collaboration stands out in the industry. Given my background in business administration and handling complex client escalations, I want to bring my workflow optimization skills to ${company} and help maintain your high service benchmarks.`
      : `I have been following ${company}'s engineering blog and tech talks, especially your recent work on distributed data pipelines and zero-downtime deployments. In my previous role, I led similar reliability initiatives, and I know how challenging it is to maintain high developer velocity while enforcing strict uptime SLAs. I want to bring my background in backend architecture and automated testing to ${company}, collaborate with talented engineers, and help scale your core platform services to the next level.`,
    commonMistakes: [
      `Saying you applied because "the salary is high" or "it has great office snacks and work from home."`,
      `Giving a generic answer that could apply to literally any company in the country.`,
      `Misstating the company's core products, domain, or industry focus.`,
      `Focusing entirely on flattery without explaining how your skills connect to their goals.`
    ],
    tipsForImproving: [
      `Mention 2 specific facts: 1 about their work/product + 1 about their team culture.`,
      `Explain why this specific company is better suited for your goals than their competitors.`,
      `Speak with genuine warmth and energy—hiring managers remember candidates who care about their mission.`
    ],
    structureFramework: 'Company Recognition & Specific Work → Culture Fit → Personal Value Contribution',
    expectedKeywords: ['company', 'culture', 'mission', 'values', 'products', 'reputation', 'learning', 'growth', 'contribute']
  });

  // =========================================================================
  // 5. WHERE DO YOU SEE YOURSELF IN FIVE YEARS?
  // =========================================================================
  questions.push({
    id: 'mock_q5_five_year_goals',
    index: 4,
    category: 'core',
    categoryLabel: 'Career Aspirations',
    title: 'Where do you see yourself in five years?',
    questionText: `Looking ahead at your career trajectory in ${normalizedDept}, where do you see yourself in five years, both in terms of domain expertise and leadership or project responsibilities?`,
    whyInterviewerAsks: `Interviewers want to see whether you have thought through your professional trajectory, whether your expectations are grounded in reality, and whether you are likely to stay with the company long enough for their training investment to pay off.`,
    importantPoints: [
      `Years 1–2: Focus on becoming an indispensable contributor, mastering domain tools, and executing reliably.`,
      `Years 3–5: Expanding into specialized ownership, team mentorship, or cross-functional coordination.`,
      `Continuous Learning: Demonstrating commitment to upgrading certifications and staying abreast of industry shifts.`,
      `Loyalty to the Organization: Framing your growth as occurring within ${company}.`
    ],
    fresherExample: isNonTech
      ? `Over the next two years, my primary goal is to become a thoroughly dependable, go-to contributor in our team—mastering internal CRM platforms, deepening my advanced Excel capabilities, and maintaining outstanding customer satisfaction scores. By year five, I envision myself growing into a senior operations or client support specialist—taking ownership of complex client accounts, mentoring incoming trainees, and helping streamline office procedures. Ultimately, I want to build a reputation at ${company} as a reliable, detail-oriented professional who elevates team performance.`
      : `In my first two years, my goal is to master our codebase and system architecture, shipping clean production features and becoming an expert in our backend stack. By year five, I see myself growing into a technical lead or senior software engineer—taking ownership of end-to-end architectural designs, mentoring early-career developers, and driving technical decisions that deliver measurable business impact. I want to be recognized within ${company} as a dependable problem solver who champions both technical rigor and team velocity.`,
    experiencedExample: isNonTech
      ? `In the immediate term, I aim to master ${company}'s operational workflows and identify key areas where client turnaround times can be reduced. Over the next three to five years, I aspire to transition into an operations management or client success leadership role—leading a dedicated team, designing standardized client onboarding roadmaps, and representing our department in strategic cross-functional initiatives. I want to help ${company} expand while safeguarding our core service quality.`
      : `In the near term, I plan to leverage my backend expertise to accelerate our platform scalability goals. Looking ahead five years, I envision myself operating as a principal engineer or engineering manager—driving large-scale architectural modernization, defining engineering standards across teams, and mentoring the next generation of engineers. I want to build systems that reliably support millions of users while fostering an inclusive, high-performing engineering culture at ${company}.`,
    commonMistakes: [
      `Saying "I want to be the CEO / have your job in five years" (sounds arrogant or naive).`,
      `Saying "I plan to start my own business / go back to school for an MBA" (signals you will leave soon).`,
      `Saying "I haven't thought that far ahead" (signals a lack of ambition or direction).`,
      `Describing a career path that is completely unrelated to the job you are interviewing for.`
    ],
    tipsForImproving: [
      `Break your answer into two distinct phases: Years 1–2 (Execution) and Years 3–5 (Leadership/Ownership).`,
      `Balance ambition with humility: emphasize mastering current duties before seeking promotion.`,
      `Reiterate that your goal is to grow within this organization.`
    ],
    structureFramework: 'Phase 1: Deepening Core Mastery (Years 1-2) → Phase 2: Leadership & Ownership (Years 3-5)',
    expectedKeywords: ['five years', 'goals', 'growth', 'mastery', 'mentor', 'lead', 'responsibilities', 'ownership', 'contribute']
  });

  // =========================================================================
  // 6. DOMAIN QUESTION: RESUME PROJECT & TECHNICAL / CUSTOMER WORKFLOW
  // =========================================================================
  if (isNonTech) {
    questions.push({
      id: 'mock_q6_customer_handling',
      index: 5,
      category: 'domain',
      categoryLabel: 'Customer Handling & Operations',
      title: 'Customer Handling & Resolving Customer Complaints',
      questionText: `In client-facing and operational roles, handling dissatisfied or angry customers is essential. Describe how you handle an upset customer and de-escalate their frustration while adhering to company guidelines.`,
      whyInterviewerAsks: `Customer service and administrative roles test emotional resilience, composure, and empathy. The interviewer wants to verify that you don't take customer anger personally, that you listen actively before offering fixes, and that you know how to turn a negative incident into a positive client relationship.`,
      importantPoints: [
        `Composure & Empathy: Remaining calm, never arguing, and validating the customer's frustration.`,
        `Active Listening: Allowing the customer to vent fully without interrupting while taking factual notes.`,
        `Actionable Investigation: Explaining concrete steps to investigate the problem transparently.`,
        `Follow-through: Confirming the solution was delivered and checking that the customer is genuinely satisfied.`
      ],
      fresherExample: `When an upset customer reaches out, my first priority is remaining calm and listening actively without interrupting. In my college event volunteering, an attendee arrived furious because their registration ticket showed an incorrect session timing. Instead of quoting guidelines defensively, I acknowledged their frustration immediately: "I completely understand how stressful this is when you planned your day around this session. Let me look into this right away." I checked our database, identified an email batching delay, and coordinated with the coordinator to arrange a VIP pass for their desired session. By validating their emotions and taking swift personal ownership, the attendee left with a very positive impression of our event.`,
      experiencedExample: `I follow the L.A.S.T. framework: Listen, Apologize/Acknowledge, Solve, and Thank. In my previous role, an enterprise client called furious over a billing discrepancy that had frozen their account. I listened without defensive interruption, validated their operational urgency, and said: "You are completely right to be concerned about this outage; I am personally taking ownership of this ticket right now." I immediately coordinated with billing to unblock their service within 15 minutes, issued an invoice correction, and followed up 24 hours later with an executive summary. The client appreciated our transparent accountability and ended up renewing their annual subscription.`,
      commonMistakes: [
        `Interrupting the customer to explain why they are wrong or why policy forbids it.`,
        `Taking the customer's angry tone personally and responding defensively.`,
        `Making impossible promises that violate company policy just to get them off the phone.`,
        `Passing the buck: "That's not my department, call someone else."`
      ],
      tipsForImproving: [
        `Use the L.A.S.T. method (Listen, Acknowledge, Solve, Thank) to structure your answer.`,
        `Emphasize phrases you use: "I understand your frustration", "Let me personally resolve this."`,
        `Always conclude by explaining how you followed through to confirm complete customer satisfaction.`
      ],
      structureFramework: 'L.A.S.T. Framework: Listen & Acknowledge → Investigate Root Cause → Solve Transparently → Thank & Follow Up',
      expectedKeywords: ['customer', 'complaint', 'listen', 'empathy', 'de-escalate', 'calm', 'solution', 'satisfaction', 'follow up']
    });
  } else {
    questions.push({
      id: 'mock_q6_technical_project',
      index: 5,
      category: 'domain',
      categoryLabel: 'Technical Project & Architecture',
      title: 'Project and Internship Technical Walkthrough',
      questionText: `Can you walk me through your primary technical project "${projectTitle}"—the architecture choices you made, your specific individual contributions, and how you verified system reliability?`,
      whyInterviewerAsks: `Interviewers ask this to test your true engineering depth, hands-on ownership, and whether you genuinely wrote the code or just watched your teammates do it. They look for architectural reasoning: why you chose specific libraries or frameworks, how you handled edge cases, and how you measured performance.`,
      importantPoints: [
        `Problem Statement: Clearly articulate what business or engineering problem the project solved.`,
        `Architecture & Tech Stack: Explain why you chose ${primarySkill} over alternatives.`,
        `Individual Contribution: Explicitly isolate what code, APIs, or database models you personally built.`,
        `Impact & Verification: Share quantifiable results—e.g. latency, throughput, unit test coverage, or user feedback.`
      ],
      fresherExample: `In my capstone project "${projectTitle}", we designed an end-to-end web platform using ${primarySkill}. My specific responsibility was architecting the backend API layer and relational database schema. Early in development, we faced slow query response times when retrieving complex user records. I analyzed our query execution plans, normalized our database tables, and added indexed compound keys, which cut response times by 40%. I also implemented automated Jest unit tests covering our core authentication routes. Taking that project from blank repository to deployment taught me the critical difference between code that just compiles and code that is robust and testable.`,
      experiencedExample: `In my last role, I led the technical implementation of our core service overhaul in "${projectTitle}". The legacy monolithic endpoint was suffering from connection pool exhaustion during peak flash sales. I decoupled the write operations into asynchronous message queues using Redis and Dockerized microservices. I personally wrote the worker consumers, configured exponential backoff retries for transient third-party API errors, and set up Prometheus metrics dashboards. This increased our platform throughput by 50% and reduced production errors to near zero during holiday traffic spikes.`,
      commonMistakes: [
        `Speaking only in terms of "we did this" without ever clarifying your personal individual contributions.`,
        `Listing technical buzzwords without being able to explain why you chose that technology over simpler tools.`,
        `Describing only the happy path and pretending you never ran into any bugs or bottlenecks.`,
        `Failing to explain how you tested or verified that your code worked correctly.`
      ],
      tipsForImproving: [
        `Use the STAR method: Situation → Task → Action (your personal code) → Result (measurable metrics).`,
        `Be ready to answer follow-up questions about tradeoffs (e.g., why SQL instead of NoSQL?).`,
        `Emphasize unit testing, error handling, and performance profiling.`
      ],
      structureFramework: 'Problem Context → Architectural Choices → Personal Contribution → Measurable Results',
      expectedKeywords: ['project', 'architecture', 'database', 'api', 'performance', 'tested', 'contribution', 'optimized']
    });
  }

  // =========================================================================
  // 7. BEHAVIORAL: CHALLENGES, TEAMWORK & RESOLVING CONFLICTS
  // =========================================================================
  if (isNonTech) {
    questions.push({
      id: 'mock_q7_teamwork_challenges',
      index: 6,
      category: 'behavioral',
      categoryLabel: 'Teamwork & Workplace Challenges',
      title: 'Teamwork, Time Management & Handling Competing Priorities',
      questionText: `In office administration and client operations, you often face multiple urgent tasks with overlapping deadlines. How do you prioritize your daily workload and collaborate with teammates when pressure spikes?`,
      whyInterviewerAsks: `Recruiters want to assess your organizational triage skills, time management, and ability to handle pressure without burning out or alienating colleagues. They want to see that you proactively communicate with supervisors rather than quietly dropping tasks.`,
      importantPoints: [
        `Triage Framework: Explain how you differentiate between urgent tasks and important tasks (e.g. Eisenhower matrix).`,
        `Proactive Communication: Communicating early with supervisors when two deadlines conflict.`,
        `Collaborative Teamwork: Offering and asking for support constructively without finger-pointing.`,
        `Quality Control: Maintaining zero calculation/transcription errors even when rushing.`
      ],
      fresherExample: `When managing multiple academic deadlines and college event volunteer responsibilities, I rely on a structured triage routine. I categorize tasks by urgency and impact. During our annual festival, I had to balance on-spot attendee registrations with urgent vendor supply receipts. Instead of panicking, I set up a shared digital checklist with my co-volunteer, handled the immediate line of attendees first, and communicated transparently with our committee lead that vendor invoices would be finalized by 3 PM. By communicating early and staying organized, both deliverables were completed accurately without delays.`,
      experiencedExample: `In my previous role, month-end reconciliations often collided with unexpected client escalations. My rule is transparent, early communication. If two senior stakeholders gave me competing "urgent" tasks, I would politely align with both: "Both tasks are vital. Task A takes 2 hours and Task B takes 3 hours. Given current business impact, should I prioritize Task A first, or would you like me to delegate part of Task B to my teammate?" This kept management aligned, eliminated surprises, and protected our output accuracy.`,
      commonMistakes: [
        `Claiming "I never get stressed and I can do everything simultaneously" (unrealistic).`,
        `Silently missing a deadline because you were too intimidated to ask your manager for priority guidance.`,
        `Blaming coworkers for loading too much work on you.`,
        `Rushing through tasks and submitting error-riddled work.`
      ],
      tipsForImproving: [
        `Emphasize open, respectful communication with your manager when workloads peak.`,
        `Mention specific tools you use: Kanban boards, priority checklists, calendar blocks.`,
        `Show that you support colleagues when their workload is heavy, creating reciprocal teamwork.`
      ],
      structureFramework: 'Triage Prioritization → Early Stakeholder Communication → Execution & Mutual Support',
      expectedKeywords: ['priorities', 'teamwork', 'communication', 'deadlines', 'time management', 'collaborate', 'accurate', 'calm']
    });
  } else {
    questions.push({
      id: 'mock_q7_engineering_challenges',
      index: 6,
      category: 'behavioral',
      categoryLabel: 'Engineering Challenges & Teamwork',
      title: 'Technical Teamwork & Resolving Design Disagreements',
      questionText: `Describe a situation where you worked in a software or engineering team and had a disagreement about a design decision, architecture, or code implementation. How did you resolve it?`,
      whyInterviewerAsks: `Software development is a team sport. Interviewers evaluate your ego management, your receptiveness to constructive feedback during code reviews, and whether you can resolve technical debates using objective benchmarks rather than personal opinions.`,
      importantPoints: [
        `Constructive Context: Briefly set up the differing technical approaches (e.g. REST vs GraphQL, SQL vs NoSQL).`,
        `Data-Driven Evaluation: Building quick proofs-of-concept, reviewing documentation, or running latency benchmarks.`,
        `Respectful Communication: Listening openly to the teammate's perspective and focusing on team goals.`,
        `United Execution: Committing fully to the agreed decision without lingering resentment.`
      ],
      fresherExample: `During our semester web development project, my teammate and I disagreed on whether to use client-side state management or server-side session cookies for shopping cart persistence. My teammate preferred client storage for simplicity, while I was concerned about security and multi-tab synchronization. Instead of debating endlessly, we spent two hours building small test prototypes for both approaches and benchmarked state recovery after page refreshes. The prototype proved that server-side sessions prevented race conditions when users opened multiple tabs. My teammate agreed with the evidence, and we documented the decision in our repository readme. We delivered the project smoothly and learned a lot from each other.`,
      experiencedExample: `In my last engineering role, our team was divided on whether to implement synchronous gRPC calls or asynchronous Kafka event streaming for a new payment notification microservice. I was advocating for asynchronous Kafka to ensure resilience during third-party gateway downtime, while another senior engineer was concerned about message ordering complexity. I scheduled a focused 30-minute design review where we mapped out our failure modes and SLA requirements. We realized that while event streaming was essential for payment confirmation, synchronous endpoints were fine for basic status checks. By adopting a hybrid pattern, we met both performance and simplicity requirements, and our team velocity accelerated.`,
      commonMistakes: [
        `Claiming you have never had a disagreement with any teammate (shows lack of experience or honesty).`,
        `Portraying your teammate as incompetent or stubborn while painting yourself as the sole hero.`,
        `Giving in immediately without sharing valid technical concerns, or being obstinate and refusing to compromise.`,
        `Focusing on personal friction rather than technical tradeoffs.`
      ],
      tipsForImproving: [
        `Frame the disagreement around technical tradeoffs (scalability vs simplicity), not personal opinions.`,
        `Showcase how you use prototypes, benchmarks, and data to drive consensus.`,
        `Highlight the concept of "disagree and commit" once the team decision is finalized.`
      ],
      structureFramework: 'Technical Tradeoff Context → Data-Driven Evaluation / Prototyping → Consensus & Delivery',
      expectedKeywords: ['teamwork', 'disagreement', 'code review', 'tradeoffs', 'communication', 'consensus', 'benchmarks', 'collaboration']
    });
  }

  // =========================================================================
  // 8. DO YOU HAVE ANY QUESTIONS FOR US?
  // =========================================================================
  questions.push({
    id: 'mock_q8_candidate_questions',
    index: 7,
    category: 'core',
    categoryLabel: 'Candidate Engagement',
    title: 'Do you have any questions for us?',
    questionText: `We have covered a great deal about your background today, ${candidateName}. Now, the floor is yours: Do you have any questions for me about ${company}, our team, work culture, or learning opportunities?`,
    whyInterviewerAsks: `Saying "No, I don't have any questions" signals lack of interest or lack of preparation. Interviewers evaluate your intellectual curiosity, what matters to you in a workplace, and whether you are evaluating them as carefully as they are evaluating you.`,
    importantPoints: [
      `Curiosity & Engagement: Demonstrate that you care deeply about how the team functions day-to-day.`,
      `Onboarding & Mentorship: Inquire about early-career mentorship programs and feedback loops.`,
      `Challenges & Roadmap: Ask about the team's upcoming milestones, technical bets, or operational goals.`,
      `Culture: Ask about how the team celebrates wins, handles post-mortems, or encourages continuous learning.`
    ],
    fresherExample: isNonTech
      ? `Yes, thank you for asking! I have two questions: First, what does the structured onboarding and mentorship process look like for early-career hires during their first 90 days? Second, what are the primary challenges or operational goals your department is tackling over the next six months that someone in this role could help solve?`
      : `Yes, thank you for asking! I have two questions: First, how does your engineering team approach onboarding and peer code reviews for early-career developers during their first 90 days? Second, what is one of the most interesting technical or architectural challenges your team has faced recently that you are excited about solving?`,
    experiencedExample: isNonTech
      ? `Yes, absolutely. First, looking at ${company}'s growth trajectory over the next year, what does success look like for someone in this role at the 6-month mark? Second, how does the team facilitate cross-functional collaboration between operations and customer-facing teams when scaling client volume?`
      : `Yes, definitely. First, what does your technical roadmap look like over the next 12 months regarding platform scalability and distributed infrastructure? Second, how does your engineering leadership foster continuous learning and support engineers who want to contribute to open-source or speak at conferences?`,
    commonMistakes: [
      `Saying "No, you covered everything" or "No, I don't have any questions."`,
      `Asking only about vacation days, sick leaves, bonuses, or how soon you can leave the office.`,
      `Asking basic questions that could be answered in 5 seconds by checking the company's homepage.`,
      `Asking confrontational questions about stock price drops or negative online reviews.`
    ],
    tipsForImproving: [
      `Always prepare at least 3 thoughtful questions in advance; ask 2 during the interview.`,
      `Reference something the interviewer mentioned earlier to show active listening.`,
      `End with warmth: "Thank you so much for your time and for sharing your insights with me today!"`
    ],
    structureFramework: 'Onboarding & Mentorship Inquiry → Team Goals & Challenges Inquiry → Professional Appreciation',
    expectedKeywords: ['questions', 'team', 'culture', 'mentorship', 'learning', 'challenges', 'onboarding', 'growth']
  });

  return questions;
}

/**
 * Real-time Speech / Text Answer Evaluator for Mock Preparation Practice
 * Evaluates candidate's self-recorded response against question expectations
 * and provides instant constructive NLP feedback and improvement suggestions.
 */
export function evaluateMockSpeechAnswer(
  question: HRMockQuestion,
  candidateSpeech: string,
  isNonTech: boolean = false
): MockSpeechEvaluationResult {
  const clean = candidateSpeech ? candidateSpeech.trim() : '';
  const words = clean.length > 0 ? clean.split(/\s+/).filter(Boolean) : [];
  const wordCount = words.length;
  const lower = clean.toLowerCase();

  // Estimate speaking time at average 130 words per minute
  const estimatedSpeakingSeconds = Math.round((wordCount / 130) * 60);

  // Determine speaking pace rating
  let speakingPaceRating: MockSpeechEvaluationResult['speakingPaceRating'] = 'Good Pace';
  if (wordCount < 30) {
    speakingPaceRating = 'Too Brief';
  } else if (wordCount > 350) {
    speakingPaceRating = 'Slightly Rushed';
  } else if (wordCount >= 90 && wordCount <= 250) {
    speakingPaceRating = 'Good Pace';
  } else {
    speakingPaceRating = 'Comprehensive';
  }

  // Match expected keywords
  const matchedKeywords: string[] = [];
  question.expectedKeywords.forEach((kw) => {
    if (lower.includes(kw.toLowerCase())) {
      matchedKeywords.push(kw);
    }
  });

  // Evaluate structure elements
  const hasOpening = /\b(hello|hi|good morning|good afternoon|thank you|to begin|to answer|my name is|i am|firstly|regarding|my greatest|my core|my strength)\b/i.test(lower);
  const hasEvidenceOrExample = /\b(for example|in my project|during|specifically|when i|we built|i handled|for instance|as an example|my role was|result was|achieved|improved|discovered|refactored|isolated|boosted)\b/i.test(lower);
  const hasConclusion = /\b(in conclusion|overall|therefore|which is why|i look forward|excited to|bring value|contribute to|this has helped|to address this|to address|to overcome|i have adopted|which has helped|which has improved|which significantly|which has significantly|as a result)\b/i.test(lower);

  // Missing concept analysis
  const missingKeyConcepts: string[] = [];
  if (wordCount < 40) {
    missingKeyConcepts.push('Response is too brief—expand with concrete details and examples.');
  }
  if (!hasEvidenceOrExample) {
    missingKeyConcepts.push('Concrete evidence: Include a specific story, metric, or project deliverable.');
  }
  if (matchedKeywords.length < Math.min(2, question.expectedKeywords.length)) {
    missingKeyConcepts.push(`Domain terminology: Consider integrating keywords like "${question.expectedKeywords.slice(0, 3).join(', ')}".`);
  }
  if (!hasConclusion && wordCount >= 60) {
    missingKeyConcepts.push('Closing connection: Conclude by linking your answer directly to the company and role.');
  }

  // Calculate score (0-100)
  let score = 30;
  score += Math.min(35, wordCount * 0.4);
  score += Math.min(15, matchedKeywords.length * 4);
  if (hasOpening) score += 5;
  if (hasEvidenceOrExample) score += 10;
  if (hasConclusion) score += 5;
  score = Math.min(98, Math.max(20, Math.round(score)));

  // Overall rating band
  let overallRating: MockSpeechEvaluationResult['overallRating'] = 'Good Foundation';
  if (score >= 88) overallRating = 'Exceptional';
  else if (score >= 75) overallRating = 'Interview Ready';
  else if (score >= 58) overallRating = 'Good Foundation';
  else overallRating = 'Needs Practice';

  // Constructive feedback text
  let feedback = '';
  if (wordCount < 30) {
    feedback = `Your answer is a good starting point, but it is currently too brief (${wordCount} words / ~${estimatedSpeakingSeconds}s). Interviewers look for structured responses lasting approximately 60–90 seconds with clear supporting examples.`;
  } else if (score >= 80) {
    feedback = `Excellent delivery! Your answer shows strong professional clarity, includes relevant evidence from your background, and covers the core intent of the question. Your speaking pace (~${estimatedSpeakingSeconds}s) is right in the ideal interview sweet spot.`;
  } else {
    feedback = `Solid answer! You addressed the question directly and demonstrated genuine domain relevance. To make this an interview-ready response, strengthen your supporting evidence with quantifiable results and close with an enthusiastic tie-back to the target role.`;
  }

  // Actionable suggestions
  const actionableSuggestions: string[] = [];
  if (!hasEvidenceOrExample) {
    actionableSuggestions.push('Add a real example: mention your capstone project, an internship incident, or a volunteer duty.');
  }
  if (wordCount < 60) {
    actionableSuggestions.push('Aim for 90–150 words to demonstrate depth without rambling.');
  }
  if (actionableSuggestions.length === 0) {
    actionableSuggestions.push('Practice delivering this answer smoothly without looking at notes.');
    actionableSuggestions.push('Maintain warm eye contact with the camera and steady voice inflection.');
  }

  return {
    wordCount,
    estimatedSpeakingSeconds,
    speakingPaceRating,
    matchedKeywords,
    missingKeyConcepts,
    hasOpening,
    hasEvidenceOrExample,
    hasConclusion,
    score,
    overallRating,
    feedback,
    actionableSuggestions
  };
}
