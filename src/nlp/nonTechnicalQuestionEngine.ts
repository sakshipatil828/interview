/**
 * CareerCurve AI Non-Technical Question Generation & Evaluation Engine
 * 
 * Generates domain-specific and resume-driven questions and evaluates candidate answers
 * for non-technical disciplines (Commerce, BBA/MBA, Business Analytics, Customer Support,
 * Office Admin, Marketing, HR, Economics, Arts & Humanities).
 */

import { ParsedResume } from '../types';

export type NonTechnicalDomain = 
  | 'commerce_accounting'
  | 'management_business'
  | 'business_analytics'
  | 'customer_support_operations'
  | 'office_admin_communication'
  | 'resume_experience';

export interface NonTechnicalQuestion {
  id: string;
  domain: NonTechnicalDomain;
  domainLabel: string;
  questionText: string;
  contextOrScenario?: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  primaryConcept: string;
  expectedKeywords: string[];
  modelAnswer: string;
  scoringCriteria: {
    domainKnowledge: string;
    practicalApplication: string;
    communicationClarity: string;
    professionalStructure: string;
  };
}

export interface NonTechnicalAnswerEvaluation {
  questionId: string;
  questionText: string;
  candidateAnswer: string;
  overallScore: number; // 0-100
  ratingBand: 'Exceptional' | 'Proficient' | 'Competent' | 'Needs Practice';
  scores: {
    domainKnowledge: number; // 0-25
    practicalApplication: number; // 0-25
    communicationClarity: number; // 0-25
    professionalStructure: number; // 0-25
  };
  strengths: string[];
  areasForImprovement: string[];
  matchedKeywords: string[];
  missingKeyConcepts: string[];
  modelAnswerSummary: string;
  feedbackNote: string;
}

// ============================================================================
// CURATED DOMAIN QUESTION POOLS
// ============================================================================

const COMMERCE_QUESTIONS: Omit<NonTechnicalQuestion, 'id'>[] = [
  {
    domain: 'commerce_accounting',
    domainLabel: 'Commerce & Financial Accounting',
    questionText: 'Can you explain the fundamental difference between Assets, Liabilities, and Equity on a company balance sheet, and how the accounting equation connects them?',
    contextOrScenario: 'A foundational financial accounting scenario evaluating understanding of financial statements.',
    difficulty: 'Beginner',
    primaryConcept: 'Accounting Equation (Assets = Liabilities + Equity)',
    expectedKeywords: ['assets', 'liabilities', 'equity', 'balance sheet', 'accounting equation', 'resources', 'obligations', 'capital', 'shareholders'],
    modelAnswer: 'The fundamental accounting equation is Assets = Liabilities + Shareholders’ Equity. Assets represent economic resources owned by the business that offer future economic benefit (such as cash, inventory, accounts receivable, and equipment). Liabilities are financial obligations or debts owed to external creditors (such as loans, accounts payable, and accrued expenses). Equity represents the residual ownership interest of shareholders after deducting liabilities. Every financial transaction maintains this equilibrium.',
    scoringCriteria: {
      domainKnowledge: 'Accurate definition of assets, liabilities, equity, and equation',
      practicalApplication: 'Provides concrete examples of balance sheet line items',
      communicationClarity: 'Clear, concise, professional financial vocabulary',
      professionalStructure: 'Begins with equation, defines each component, and provides summary'
    }
  },
  {
    domain: 'commerce_accounting',
    domainLabel: 'Commerce & Financial Accounting',
    questionText: 'What is Working Capital, why is it critical for daily business operations, and how do you calculate it?',
    contextOrScenario: 'Liquidity and short-term financial management evaluation.',
    difficulty: 'Intermediate',
    primaryConcept: 'Working Capital & Liquidity Management',
    expectedKeywords: ['working capital', 'current assets', 'current liabilities', 'liquidity', 'short-term', 'cash flow', 'operational efficiency', 'inventory', 'receivables'],
    modelAnswer: 'Working Capital measures a company’s operational liquidity and short-term financial health, calculated as Current Assets minus Current Liabilities. Positive working capital indicates the company can easily settle short-term obligations due within a year while funding day-to-day operations like inventory purchases and payroll. Negative working capital signals potential liquidity distress or reliance on immediate cash turnaround.',
    scoringCriteria: {
      domainKnowledge: 'Correct formula and distinction between current vs non-current items',
      practicalApplication: 'Explains impact of positive vs negative working capital',
      communicationClarity: 'Precise financial terminology without ambiguity',
      professionalStructure: 'Defines formula, operational rationale, and risk implications'
    }
  },
  {
    domain: 'commerce_accounting',
    domainLabel: 'Commerce & Financial Accounting',
    questionText: 'What is Goods and Services Tax (GST) or Sales Tax, and what is the difference between Input Tax Credit (ITC) and Output Tax liability?',
    contextOrScenario: 'Indirect taxation and statutory compliance.',
    difficulty: 'Intermediate',
    primaryConcept: 'GST / Indirect Tax Mechanism & ITC',
    expectedKeywords: ['gst', 'input tax credit', 'itc', 'output tax', 'taxation', 'invoice', 'compliance', 'value added', 'supplier'],
    modelAnswer: 'GST is a destination-based, comprehensive indirect consumption tax levied on the supply of goods and services. Output tax is the tax collected by a business from its customers when making sales. Input Tax Credit (ITC) allows businesses to deduct the tax they paid on purchases and business expenses from the output tax liability when paying the government. This prevents cascading taxation (tax on tax) and ensures only the incremental value addition is taxed.',
    scoringCriteria: {
      domainKnowledge: 'Clear differentiation between input tax credit and output liability',
      practicalApplication: 'Explains prevention of tax cascading with an example',
      communicationClarity: 'Structured explanation of taxation compliance',
      professionalStructure: 'Overview of GST, mechanics of ITC, practical significance'
    }
  },
  {
    domain: 'commerce_accounting',
    domainLabel: 'Commerce & Financial Accounting',
    questionText: 'Explain the difference between Cash Flow and Profit. Why can a profitable company still face bankruptcy?',
    contextOrScenario: 'Cash management vs accrual accounting evaluation.',
    difficulty: 'Intermediate',
    primaryConcept: 'Accrual Accounting vs Cash Flow Reality',
    expectedKeywords: ['cash flow', 'profit', 'accrual', 'revenue recognition', 'liquidity', 'accounts receivable', 'cash crunch', 'operating cash', 'bankruptcy'],
    modelAnswer: 'Profit is calculated on an accrual basis where revenues are recognized when earned and expenses when incurred, regardless of when cash actually changes hands. Cash flow, on the other hand, tracks the physical inflows and outflows of liquid money. A company can show healthy accounting profits on its Income Statement while being insolvent if revenue is tied up in overdue Accounts Receivable or unsellable inventory, leaving it unable to pay suppliers, wages, or loan installments.',
    scoringCriteria: {
      domainKnowledge: 'Understands accrual accounting vs cash accounting',
      practicalApplication: 'Illustrates receivables lag or inventory tie-up causing insolvency',
      communicationClarity: 'Clear, business-oriented explanation',
      professionalStructure: 'Definitions, comparative contrast, real-world failure mode'
    }
  }
];

const MANAGEMENT_QUESTIONS: Omit<NonTechnicalQuestion, 'id'>[] = [
  {
    domain: 'management_business',
    domainLabel: 'Business Administration & Management',
    questionText: 'Explain the four core functions of management—Planning, Organizing, Leading, and Controlling (POLC)—and how they apply to executing a business project.',
    contextOrScenario: 'General management principles and execution framework.',
    difficulty: 'Beginner',
    primaryConcept: 'POLC Management Framework',
    expectedKeywords: ['planning', 'organizing', 'leading', 'controlling', 'polc', 'objectives', 'resource allocation', 'leadership', 'monitoring', 'kpis'],
    modelAnswer: 'The POLC framework outlines the essential responsibilities of a manager: Planning involves setting strategic goals, forecasting requirements, and outlining actionable steps. Organizing allocates tasks, establishes reporting structures, and distributes resources and budget. Leading focuses on motivating team members, communicating vision, resolving conflict, and guiding performance. Controlling monitors ongoing progress against established benchmarks and KPIs, implementing corrective actions when deviations occur.',
    scoringCriteria: {
      domainKnowledge: 'All 4 functions accurately identified and defined',
      practicalApplication: 'Maps POLC to practical project milestone delivery',
      communicationClarity: 'Cohesive, executive-level communication',
      professionalStructure: 'Systematic walkthrough of each function in logical sequence'
    }
  },
  {
    domain: 'management_business',
    domainLabel: 'Business Administration & Management',
    questionText: 'How do you handle conflict between two team members who disagree on project priorities or responsibilities?',
    contextOrScenario: 'Conflict resolution and interpersonal team management.',
    difficulty: 'Intermediate',
    primaryConcept: 'Workplace Conflict Resolution & Mediation',
    expectedKeywords: ['conflict', 'active listening', 'mediation', 'alignment', 'objective', 'priorities', 'collaboration', 'expectations', 'stakeholders'],
    modelAnswer: 'I address conflict promptly rather than letting it fester. First, I meet individually with each team member to listen actively without judgment and identify root causes versus emotional reactions. Next, I bring both together in a neutral setting, re-aligning both parties around the shared project objective and organizational goals. We agree on explicit role boundaries and priority matrices, document agreed next steps, and schedule a follow-up checkpoint to ensure constructive collaboration.',
    scoringCriteria: {
      domainKnowledge: 'Follows structured mediation and problem-solving methodology',
      practicalApplication: 'Applies active listening, objective alignment, and follow-up',
      communicationClarity: 'Empathetic and collaborative tone',
      professionalStructure: 'Action-oriented chronological steps'
    }
  },
  {
    domain: 'management_business',
    domainLabel: 'Business Administration & Management',
    questionText: 'What is SWOT Analysis, and how does a business use it to evaluate a new market opportunity or product launch?',
    contextOrScenario: 'Strategic planning and market assessment.',
    difficulty: 'Beginner',
    primaryConcept: 'SWOT Strategic Assessment',
    expectedKeywords: ['swot', 'strengths', 'weaknesses', 'opportunities', 'threats', 'internal', 'external', 'strategy', 'market', 'competitors'],
    modelAnswer: 'SWOT Analysis evaluates internal Strengths and Weaknesses alongside external Opportunities and Threats. Strengths (e.g. proprietary technology, strong brand) and Weaknesses (e.g. limited capital, talent gaps) are within the organization’s control. Opportunities (e.g. emerging market demand, regulatory tailwinds) and Threats (e.g. new competitors, supply disruption) arise from the macro environment. Businesses use SWOT to match internal advantages to external possibilities while mitigating vulnerabilities.',
    scoringCriteria: {
      domainKnowledge: 'Clear internal vs external distinction and all four quadrants',
      practicalApplication: 'Illustrates how insights convert into strategic action',
      communicationClarity: 'Articulate business analysis terminology',
      professionalStructure: 'Definition, quadrants breakdown, actionable strategic synthesis'
    }
  }
];

const ANALYTICS_QUESTIONS: Omit<NonTechnicalQuestion, 'id'>[] = [
  {
    domain: 'business_analytics',
    domainLabel: 'Business Analytics & Decision Science',
    questionText: 'What is the role of Key Performance Indicators (KPIs) in business decision-making, and what makes a metric actionable versus a vanity metric?',
    contextOrScenario: 'Business metrics and performance reporting.',
    difficulty: 'Intermediate',
    primaryConcept: 'Actionable KPIs vs Vanity Metrics',
    expectedKeywords: ['kpi', 'metrics', 'actionable', 'vanity', 'conversion', 'decision making', 'roi', 'retention', 'benchmarks', 'data-driven'],
    modelAnswer: 'A KPI is a quantifiable measure used to track performance against strategic business objectives. An actionable metric directly informs business decisions—for instance, customer conversion rate or churn rate tells us exactly whether a marketing campaign or product onboarding requires adjustment. Conversely, a vanity metric (such as raw page views or social media likes) looks impressive on paper but offers no direct insight into revenue, user retention, or operational health.',
    scoringCriteria: {
      domainKnowledge: 'Defines KPIs and clearly contrasts actionable vs vanity metrics',
      practicalApplication: 'Uses realistic business examples like churn or conversion',
      communicationClarity: 'Analytical, persuasive, and data-minded explanation',
      professionalStructure: 'Concept definition, comparative contrast, operational application'
    }
  },
  {
    domain: 'business_analytics',
    domainLabel: 'Business Analytics & Decision Science',
    questionText: 'How do you use Microsoft Excel or Google Sheets (such as Pivot Tables, VLOOKUP/XLOOKUP, and conditional formatting) to clean, analyze, and present a raw sales dataset?',
    contextOrScenario: 'Practical spreadsheet modeling and data reporting.',
    difficulty: 'Intermediate',
    primaryConcept: 'Spreadsheet Data Cleaning & Analysis',
    expectedKeywords: ['excel', 'pivot table', 'vlookup', 'xlookup', 'data cleaning', 'duplicates', 'conditional formatting', 'charts', 'summary', 'trends'],
    modelAnswer: 'I start with data hygiene: removing duplicate rows, trimming whitespace, standardizing date formats, and checking for missing or corrupt values. Next, I utilize XLOOKUP or INDEX/MATCH to merge related datasets (such as matching Customer IDs with Sales Records). I construct Pivot Tables to aggregate data across dimensions like region, sales representative, or product category. Finally, I apply subtle conditional formatting to highlight outliers or top performers, and build clean summary charts to communicate key trends to stakeholders.',
    scoringCriteria: {
      domainKnowledge: 'Demonstrates familiarity with lookup functions, pivot tables, and cleaning tools',
      practicalApplication: 'Describes step-by-step workflow from messy data to executive summary',
      communicationClarity: 'Clear, systematic methodology',
      professionalStructure: 'Data hygiene -> transformation/lookup -> aggregation -> presentation'
    }
  }
];

const CUSTOMER_SUPPORT_QUESTIONS: Omit<NonTechnicalQuestion, 'id'>[] = [
  {
    domain: 'customer_support_operations',
    domainLabel: 'Customer Service & Operations',
    questionText: 'Walk me through your step-by-step process for handling an irate customer who is shouting because their order was severely delayed or their account was erroneously billed.',
    contextOrScenario: 'De-escalation and customer relationship management.',
    difficulty: 'Intermediate',
    primaryConcept: 'Customer De-escalation & Service Recovery',
    expectedKeywords: ['de-escalate', 'active listening', 'empathy', 'apologize', 'calm', 'investigate', 'solution', 'compensation', 'follow-up', 'ticket'],
    modelAnswer: 'First, I maintain composure and listen actively without interrupting, letting the customer express their frustration so they feel heard. I validate their emotion with sincere empathy, apologizing for the inconvenience without blaming colleagues or making defensive excuses. Once calm, I repeat the key issue to confirm alignment, open the ticket/CRM, and explain concrete steps I am taking immediately to resolve the billing or delivery issue. I provide an exact follow-up timeframe, deliver the promised resolution, and follow through with a satisfaction check.',
    scoringCriteria: {
      domainKnowledge: 'Employs established customer service and de-escalation best practices',
      practicalApplication: 'Demonstrates emotional intelligence and tangible resolution ownership',
      communicationClarity: 'Empathetic, reassuring, and assertive tone',
      professionalStructure: 'Listen -> Empathize -> Investigate -> Solve -> Follow Up'
    }
  },
  {
    domain: 'customer_support_operations',
    domainLabel: 'Customer Service & Operations',
    questionText: 'What is a Service Level Agreement (SLA) in customer operations, and how do you prioritize incoming tickets when multiple urgent requests arrive simultaneously?',
    contextOrScenario: 'Operational ticket management and SLA compliance.',
    difficulty: 'Intermediate',
    primaryConcept: 'SLA Prioritization & Ticket Queue Management',
    expectedKeywords: ['sla', 'service level agreement', 'tickets', 'priority', 'severity', 'triage', 'crm', 'resolution time', 'escalation', 'urgency'],
    modelAnswer: 'An SLA defines formal commitments between the service provider and customers regarding response time and resolution speed. When handling a surge of tickets, I triage based on severity and business impact rather than strict first-come-first-served order. Critical incidents (such as complete service outages or major payment processing failures) receive immediate priority and cross-functional escalation. For standard inquiries approaching their SLA deadline, I send proactive status updates to manage expectations.',
    scoringCriteria: {
      domainKnowledge: 'Accurate definition of SLA and impact-based triage principles',
      practicalApplication: 'Distinguishes between high-impact blockers vs routine inquiries',
      communicationClarity: 'Methodical, operational, and customer-centric',
      professionalStructure: 'SLA definition, triage matrix criteria, proactive communication strategy'
    }
  }
];

const OFFICE_ADMIN_QUESTIONS: Omit<NonTechnicalQuestion, 'id'>[] = [
  {
    domain: 'office_admin_communication',
    domainLabel: 'Office Administration & Professional Skills',
    questionText: 'How do you ensure confidentiality and data privacy when managing sensitive documents, client correspondence, or executive scheduling?',
    contextOrScenario: 'Data integrity, professional discretion, and office management.',
    difficulty: 'Beginner',
    primaryConcept: 'Workplace Confidentiality & Information Security',
    expectedKeywords: ['confidentiality', 'privacy', 'sensitive', 'permission', 'security', 'password', 'discretion', 'compliance', 'ndas', 'protocol'],
    modelAnswer: 'Maintaining confidentiality requires vigilance across physical and digital spaces. Digitally, I ensure sensitive files have strict role-based access permissions, passwords, and encryption, avoiding public links or unencrypted email attachments. Physically, I follow a clean-desk policy, locking printed documents and badge-protected areas. In conversations, I practice discretion by not discussing internal matters in communal or public areas and adhering strictly to organizational compliance protocols.',
    scoringCriteria: {
      domainKnowledge: 'Covers digital security, physical security, and verbal discretion',
      practicalApplication: 'Highlights role-based permissions and clean-desk practices',
      communicationClarity: 'Professional and trustworthy tone',
      professionalStructure: 'Digital measures, physical safeguards, ethical discretion'
    }
  },
  {
    domain: 'office_admin_communication',
    domainLabel: 'Office Administration & Professional Skills',
    questionText: 'Describe your approach to drafting a formal business email to an external vendor regarding overdue deliverables or contract renegotiation.',
    contextOrScenario: 'Executive written communication and vendor relations.',
    difficulty: 'Beginner',
    primaryConcept: 'Professional Business Correspondence & Etiquette',
    expectedKeywords: ['formal email', 'subject line', 'polite', 'firm', 'timeline', 'action items', 'vendor', 'contract', 'deliverables', 'clarity'],
    modelAnswer: 'I structure formal correspondence with clear clarity, professional politeness, and firm accountability. The subject line is specific, including the project name and deliverable reference. I open with a respectful greeting, state the current context referencing agreed contract dates, clearly outline the overdue items, and explain the downstream impact objectively. I specify concrete action items and request a revised timeline by an explicit deadline, closing with an open invitation for a brief alignment call.',
    scoringCriteria: {
      domainKnowledge: 'Demonstrates professional email etiquette and business communication standards',
      practicalApplication: 'Balances diplomacy with accountability',
      communicationClarity: 'Clear, crisp, objective prose',
      professionalStructure: 'Subject -> Context -> Impact -> Call to Action -> Closing'
    }
  }
];

// ============================================================================
// GENERATOR & EVALUATOR FUNCTIONS
// ============================================================================

/**
 * Generates tailored Non-Technical questions from resume details, candidate department, and experience.
 */
export function generateNonTechnicalQuestions(
  resume: ParsedResume | null,
  count: number = 4
): NonTechnicalQuestion[] {
  const result: NonTechnicalQuestion[] = [];
  const dept = String(resume?.department || resume?.classification?.discipline || '').toLowerCase();
  const summary = String(resume?.summary || '').toLowerCase();

  const skillList: string[] = [];
  if (Array.isArray(resume?.rawSkillsList)) {
    skillList.push(...resume.rawSkillsList);
  }
  if (Array.isArray(resume?.skills)) {
    for (const sc of resume.skills) {
      if (typeof sc === 'string') {
        skillList.push(sc);
      } else if (sc && Array.isArray((sc as any).skills)) {
        for (const item of (sc as any).skills) {
          if (typeof item === 'string') skillList.push(item);
          else if (item && (item as any).name) skillList.push((item as any).name);
        }
      }
    }
  }
  const skills = skillList.map(s => String(s).toLowerCase()).join(' ');
  const expText = (resume?.experience || []).map(e => `${(e as any).role || (e as any).title || ''} ${e.company || ''} ${e.description || ''}`).join(' ').toLowerCase();
  const combined = `${dept} ${summary} ${skills} ${expText}`;

  let pool: Omit<NonTechnicalQuestion, 'id'>[] = [];

  // Match domain relevance
  const isCommerce = /(commerce|b\.?com|account|finance|ledger|gst|tax|audit|tally|balance sheet)/i.test(combined);
  const isManagement = /(bba|mba|management|business admin|operations|strategy|leadership|marketing)/i.test(combined);
  const isAnalytics = /(analytics|excel|dashboard|kpi|power bi|tableau|data analysis|trend)/i.test(combined);
  const isCustomerService = /(customer service|customer support|client service|bpo|call center|helpdesk|crm|ticket)/i.test(combined);

  if (isCustomerService) {
    pool.push(...CUSTOMER_SUPPORT_QUESTIONS);
  }
  if (isCommerce) {
    pool.push(...COMMERCE_QUESTIONS);
  }
  if (isManagement) {
    pool.push(...MANAGEMENT_QUESTIONS);
  }
  if (isAnalytics) {
    pool.push(...ANALYTICS_QUESTIONS);
  }

  // Always ensure office admin & foundational business questions are available as baseline
  pool.push(...OFFICE_ADMIN_QUESTIONS);
  if (!isCommerce) pool.push(...COMMERCE_QUESTIONS.slice(0, 2));
  if (!isManagement) pool.push(...MANAGEMENT_QUESTIONS.slice(0, 2));

  // Synthesize resume-specific questions if project/experience exists
  if (resume?.projects && resume.projects.length > 0) {
    const proj = resume.projects[0];
    pool.unshift({
      domain: 'resume_experience',
      domainLabel: 'Resume Project & Practical Experience',
      questionText: `In your resume, you highlighted your project "${proj.title}". Could you walk me through the key objectives, the tools and methodologies you used, and the measurable results or impact achieved?`,
      contextOrScenario: 'Direct validation of project experience detailed on candidate resume.',
      difficulty: 'Intermediate',
      primaryConcept: 'Project Execution & Business Impact',
      expectedKeywords: ['objective', 'results', 'challenges', 'methodology', 'tools', 'impact', 'teamwork', 'outcome'],
      modelAnswer: `A comprehensive answer clearly states: 1) The project context and business problem addressed, 2) The candidate's specific hands-on role and tools utilized, 3) Key challenges encountered and how they were overcome, and 4) Concrete, measurable outcomes (e.g. time saved, efficiency improved, or satisfaction delivered).`,
      scoringCriteria: {
        domainKnowledge: 'Demonstrates deep familiarity with their own project details',
        practicalApplication: 'Connects methodology directly to measurable outcomes',
        communicationClarity: 'Structured, confident storytelling',
        professionalStructure: 'Situation -> Task -> Action -> Result (STAR method)'
      }
    });
  } else if (resume?.employmentHistory && resume.employmentHistory.length > 0) {
    const job = resume.employmentHistory[0];
    const jobRole = (job as any).role || (job as any).title || 'a team member';
    pool.unshift({
      domain: 'resume_experience',
      domainLabel: 'Resume Professional Experience',
      questionText: `At ${job.company || 'your previous workplace'} where you served as ${jobRole}, what were your core responsibilities and what was one significant achievement or problem you solved?`,
      contextOrScenario: 'Validation of professional role accomplishments and day-to-day operations.',
      difficulty: 'Intermediate',
      primaryConcept: 'Workplace Contribution & Operational Ownership',
      expectedKeywords: ['responsibility', 'problem', 'solved', 'achievement', 'team', 'process', 'efficiency', 'customer'],
      modelAnswer: `An effective answer describes the daily operational scope, identifies a specific operational roadblock or challenge faced, outlines the proactive steps taken to solve it, and shares the positive impact on team performance or customer experience.`,
      scoringCriteria: {
        domainKnowledge: 'Clear articulation of operational responsibilities',
        practicalApplication: 'Highlights tangible initiative and problem resolution',
        communicationClarity: 'Clear, engaging, and professional communication',
        professionalStructure: 'Role scope -> Challenge -> Action taken -> Tangible impact'
      }
    });
  }

  // Deduplicate and assemble
  const uniqueQuestions: NonTechnicalQuestion[] = [];
  const seenTexts = new Set<string>();

  for (let i = 0; i < pool.length; i++) {
    const q = pool[i];
    if (!seenTexts.has(q.questionText)) {
      seenTexts.add(q.questionText);
      uniqueQuestions.push({
        id: `nontech_q_${i + 1}`,
        ...q
      });
    }
    if (uniqueQuestions.length >= count) break;
  }

  return uniqueQuestions;
}

/**
 * Transparent NLP evaluation of candidate answer against scoring rubric and expected keywords.
 */
export function evaluateNonTechnicalAnswer(
  question: NonTechnicalQuestion,
  candidateAnswer: string,
  _resumeContext?: ParsedResume | null
): NonTechnicalAnswerEvaluation {
  const answer = candidateAnswer.trim();
  const lower = answer.toLowerCase();
  const words = answer.split(/\s+/).filter(w => w.length > 0);
  const wordCount = words.length;

  if (wordCount < 10) {
    return {
      questionId: question.id,
      questionText: question.questionText,
      candidateAnswer: answer,
      overallScore: 20,
      ratingBand: 'Needs Practice',
      scores: {
        domainKnowledge: 5,
        practicalApplication: 5,
        communicationClarity: 5,
        professionalStructure: 5
      },
      strengths: ['Attempted to respond to the question'],
      areasForImprovement: [
        'Response was too brief to evaluate domain mastery. Please elaborate with detailed explanations and examples.',
        'Use specific industry terminology relevant to the topic.'
      ],
      matchedKeywords: [],
      missingKeyConcepts: question.expectedKeywords.slice(0, 4),
      modelAnswerSummary: question.modelAnswer,
      feedbackNote: 'Please provide a more complete, structured explanation demonstrating your understanding of the concept.'
    };
  }

  // 1. Keyword & Concept Matching
  const matchedKeywords: string[] = [];
  const missingKeyConcepts: string[] = [];

  for (const kw of question.expectedKeywords) {
    if (lower.includes(kw.toLowerCase())) {
      matchedKeywords.push(kw);
    } else {
      missingKeyConcepts.push(kw);
    }
  }

  const keywordCoverageRatio = question.expectedKeywords.length > 0
    ? matchedKeywords.length / question.expectedKeywords.length
    : 0.5;

  // 2. Score Components (each 0 - 25)
  // Domain Knowledge (0 - 25): based on keyword coverage and depth
  const domainScore = Math.min(25, Math.max(8, Math.round(keywordCoverageRatio * 20 + (wordCount >= 40 ? 5 : 2))));

  // Practical Application (0 - 25): checks for practical markers (e.g. "for example", "process", "result", "customer", "project")
  const hasExample = /(for example|such as|in my experience|instance|specifically|we implemented|i managed|results|handling|steps|actions?)/i.test(lower);
  const appScore = Math.min(25, Math.max(10, Math.round((hasExample ? 18 : 12) + (wordCount >= 45 ? 6 : 3))));

  // Communication Clarity (0 - 25): word count maturity, sentence structure
  const clarityBase = wordCount >= 60 ? 22 : wordCount >= 40 ? 19 : 14;
  const clarityScore = Math.min(25, clarityBase);

  // Professional Structure (0 - 25): structured connectors (first, next, then, finally, because, therefore, overall)
  const hasConnectors = /(first|second|next|then|furthermore|additionally|therefore|overall|in conclusion|because|finally)/i.test(lower);
  const structureScore = Math.min(25, Math.max(10, hasConnectors ? 22 : 16));

  const totalScore = Math.min(100, domainScore + appScore + clarityScore + structureScore);

  let ratingBand: 'Exceptional' | 'Proficient' | 'Competent' | 'Needs Practice' = 'Competent';
  if (totalScore >= 85) ratingBand = 'Exceptional';
  else if (totalScore >= 70) ratingBand = 'Proficient';
  else if (totalScore >= 50) ratingBand = 'Competent';
  else ratingBand = 'Needs Practice';

  // Strengths
  const strengths: string[] = [];
  if (matchedKeywords.length >= 3) {
    strengths.push(`Strong domain terminology: effectively incorporated terms like "${matchedKeywords.slice(0, 3).join('", "')}".`);
  }
  if (hasExample) {
    strengths.push('Excellent practical contextualization: grounded the answer with a practical scenario or example.');
  }
  if (hasConnectors) {
    strengths.push('Well-organized structure: employed logical transitions and cohesive sequencing.');
  }
  if (wordCount >= 60) {
    strengths.push(`Good depth of explanation with ${wordCount} words delivered.`);
  }
  if (strengths.length === 0) {
    strengths.push('Addressed the core subject of the question directly.');
  }

  // Areas to Improve
  const areasForImprovement: string[] = [];
  if (missingKeyConcepts.length > 0) {
    areasForImprovement.push(`Incorporate key domain concepts such as: ${missingKeyConcepts.slice(0, 3).join(', ')}.`);
  }
  if (!hasExample) {
    areasForImprovement.push('Include a real-world scenario or practical metric to illustrate your explanation.');
  }
  if (!hasConnectors) {
    areasForImprovement.push('Use structured transitions (e.g., "First... Next... Finally...") to make your response even crisper.');
  }
  if (wordCount < 50) {
    areasForImprovement.push('Elaborate with greater detail to showcase comprehensive mastery.');
  }

  return {
    questionId: question.id,
    questionText: question.questionText,
    candidateAnswer: answer,
    overallScore: totalScore,
    ratingBand,
    scores: {
      domainKnowledge: domainScore,
      practicalApplication: appScore,
      communicationClarity: clarityScore,
      professionalStructure: structureScore
    },
    strengths,
    areasForImprovement,
    matchedKeywords,
    missingKeyConcepts,
    modelAnswerSummary: question.modelAnswer,
    feedbackNote: ratingBand === 'Exceptional' || ratingBand === 'Proficient'
      ? 'Strong domain presentation with solid professional articulation!'
      : 'Good effort. Review the model answer and incorporate more domain-specific examples for maximum impact.'
  };
}
