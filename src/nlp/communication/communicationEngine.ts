/**
 * CareerCurve AI Communication Practice & Evaluation Engine
 *
 * Provides dynamic speaking topic generation and comprehensive multi-metric NLP speech evaluation
 * for both Technical and Non-Technical candidates (Commerce, Business Analytics, BBA/MBA, Arts, Engineering).
 */

import { ParsedResume, CandidateTrack, CommunicationMetricBreakdown, EducationalBackgroundCategory } from '../../types';
import { CommunicationTopic, CommunicationEvaluationResult } from './types';

// Canonical Common Filler Words
const FILLER_WORDS = ['um', 'uh', 'er', 'ah', 'like', 'you know', 'basically', 'actually', 'literally', 'sort of', 'kind of'];

/**
 * Dynamically synthesizes personalized communication topics based on the student's actual resume,
 * track (fresher vs experienced), educational background, and skills.
 */
export function generateCommunicationTopics(
  resume: ParsedResume | null,
  trackOrDiscipline: CandidateTrack | string = 'fresher',
  disciplineOrTrack?: string | boolean | number,
  count: number = 4,
  categoryOverride?: EducationalBackgroundCategory | string
): CommunicationTopic[] {
  let track: CandidateTrack = 'fresher';
  let discipline: string | undefined = undefined;

  if (trackOrDiscipline === 'experienced' || trackOrDiscipline === 'fresher') {
    track = trackOrDiscipline;
    if (typeof disciplineOrTrack === 'string') {
      discipline = disciplineOrTrack;
    } else if (typeof disciplineOrTrack === 'number') {
      count = disciplineOrTrack;
    }
  } else if (typeof trackOrDiscipline === 'string') {
    // trackOrDiscipline is a discipline (e.g. 'Commerce', 'Business Analytics')
    discipline = trackOrDiscipline;
    if (typeof disciplineOrTrack === 'string' && (disciplineOrTrack === 'experienced' || disciplineOrTrack === 'fresher')) {
      track = disciplineOrTrack;
    } else if (typeof disciplineOrTrack === 'boolean') {
      track = disciplineOrTrack ? 'fresher' : 'experienced';
    } else if (typeof disciplineOrTrack === 'number') {
      count = disciplineOrTrack;
    }
  }

  const candidateName = resume?.fullName ? resume.fullName.split(' ')[0] : 'Candidate';

  // Robust Non-Technical Category Resolution: respects user manual selection & classification
  const userCat = resume?.userSelectedCategory || resume?.classification?.userSelectedCategory;
  const isExplicitlyNonTech = userCat === 'non_technical' || 
    categoryOverride === 'non_technical' || 
    resume?.classification?.educationalCategory === 'non_technical' || 
    resume?.classification?.isTechnical === false;

  let effectiveDiscipline = discipline || resume?.classification?.discipline || resume?.department || 'General Studies';
  let discLower = String(effectiveDiscipline).toLowerCase();

  const isDisciplineNonTech = /(commerce|b\.?com|bba|mba|business|management|finance|accounting|marketing|human resource|hr|arts|humanities|english|customer service|client service|office admin|administration)/i.test(discLower);

  const isNonTech = isExplicitlyNonTech || isDisciplineNonTech;

  // Sanitize discipline for non-technical candidates: NEVER allow engineering discipline
  if (isNonTech && /computer science|engineering|cse|ece|mech|civil|electrical|general studies/i.test(discLower)) {
    const rawCorpus = `${resume?.education?.[0]?.degree || ''} ${resume?.department || ''} ${resume?.summary || ''} ${resume?.jobTitle || ''} ${resume?.extractedText || ''}`.toLowerCase();
    if (/\b(b\.?com|bcom|commerce|accounting|accountancy|tally|gst)\b/i.test(rawCorpus)) {
      effectiveDiscipline = 'Commerce';
    } else if (/\b(bba|mba|bms|business admin|management)\b/i.test(rawCorpus)) {
      effectiveDiscipline = 'Business Administration';
    } else if (/\b(business analytics|data insights|power bi|tableau)\b/i.test(rawCorpus)) {
      effectiveDiscipline = 'Business Analytics';
    } else if (/\b(b\.?a\b|arts|humanities|english|literature|journalism)\b/i.test(rawCorpus)) {
      effectiveDiscipline = 'Arts & Humanities';
    } else {
      effectiveDiscipline = 'Commerce';
    }
    discLower = effectiveDiscipline.toLowerCase();
  }

  const primaryProject = resume?.projects?.[0];
  const projectTitle = primaryProject?.title;
  const rawSkills = resume?.rawSkillsList || [];
  const topSkill = rawSkills[0] || (isNonTech ? 'customer communication' : 'software engineering');

  const topicPool: CommunicationTopic[] = [];

  // =========================================================================
  // 1. EXPERIENCED CANDIDATE TOPICS
  // =========================================================================
  if (track === 'experienced') {
    // A. Experienced Customer Service & Sales Operations
    if (/customer service|client service|helpdesk|bpo|call center|complaint|sales support/i.test(discLower)) {
      topicPool.push({
        id: 'comm_exp_cs_01',
        category: 'experienced_professional',
        title: 'Handling an Escalated Client Dispute & Service Recovery',
        promptText: `${candidateName}, in customer service and client operations, escalations require deep composure and active listening. Describe a critical situation where a high-value customer faced a billing discrepancy or service breakdown. Walk me through how you de-escalated their frustration, investigated the issue, and communicated a resolution.`,
        prepTimeSeconds: 20,
        speakingTimeSeconds: 90,
        expectedConcepts: ['De-escalation & empathy', 'Root cause investigation', 'Accountability & transparent timeline', 'Customer retention & satisfaction'],
        keywords: ['customer', 'complaint', 'escalation', 'billing', 'resolution', 'de-escalate', 'crm', 'retention', 'empathy'],
        sampleStrongPoints: [
          'Acknowledged customer frustration promptly without defensive posture',
          'Explained concrete investigation steps and billing correction',
          'Followed through to confirm long-term customer trust and satisfaction'
        ],
        exampleFollowUp: 'What internal processes did you recommend to ensure that specific billing discrepancy does not recur for other customers?'
      });

      topicPool.push({
        id: 'comm_exp_cs_02',
        category: 'experienced_professional',
        title: 'Cross-Departmental Communication for Customer Ticket Resolution',
        promptText: 'Customer problems often cross departments—involving billing, logistics, and sales. Describe how you communicate customer ticket details and urgency across internal teams to meet resolution SLAs.',
        prepTimeSeconds: 20,
        speakingTimeSeconds: 90,
        expectedConcepts: ['Cross-team collaboration', 'SLA prioritization', 'Clear documentation in CRM', 'Transparent customer updates'],
        keywords: ['tickets', 'crm', 'sla', 'collaboration', 'billing', 'operations', 'communication', 'urgency'],
        sampleStrongPoints: [
          'Used precise ticket notes and data-driven urgency flags',
          'Maintained proactive communication with the waiting customer',
          'Balanced customer advocacy with operational feasibility'
        ],
        exampleFollowUp: 'How do you handle situations where internal teams are delayed in responding to an urgent customer ticket?'
      });
    }

    // B. Experienced HR Professional
    else if (/human resource|hr|talent acquisition|recruitment/i.test(discLower)) {
      topicPool.push({
        id: 'comm_exp_hr_01',
        category: 'experienced_professional',
        title: 'Managing Sensitive Employee Grievances & Policy Compliance',
        promptText: `${candidateName}, as an experienced HR professional, describe how you conduct a sensitive grievance mediation or communicate a difficult policy change. Walk me through how you balanced employee empathy, organizational compliance, and strict confidentiality.`,
        prepTimeSeconds: 20,
        speakingTimeSeconds: 90,
        expectedConcepts: ['Confidentiality & neutrality', 'Empathy & active listening', 'Compliance & documentation', 'Constructive outcome'],
        keywords: ['grievance', 'mediation', 'compliance', 'confidentiality', 'employee relations', 'resolution', 'policy'],
        sampleStrongPoints: [
          'Maintained strict neutrality and objective fact-finding',
          'Protected organizational compliance while listening to employee concerns',
          'Established clear behavioral commitments and follow-up milestones'
        ],
        exampleFollowUp: 'How do you handle situations where an employee feels retaliation after reporting a grievance?'
      });

      topicPool.push({
        id: 'comm_exp_hr_02',
        category: 'experienced_professional',
        title: 'Aligning Hiring Managers on Talent Strategy & Job Expectations',
        promptText: 'Hiring managers often have unrealistic candidate wishlists or misaligned expectations. Describe how you communicate labor market realities, candidate assessment metrics, and salary benchmarks to business stakeholders.',
        prepTimeSeconds: 20,
        speakingTimeSeconds: 90,
        expectedConcepts: ['Market data communication', 'Consultative recruiting partnership', 'Managing stakeholder expectations', 'Time-to-hire efficiency'],
        keywords: ['talent', 'hiring manager', 'recruiting', 'benchmarks', 'market', 'expectations', 'pipeline'],
        sampleStrongPoints: [
          'Used competitive salary and talent market data to guide expectations',
          'Structured consultative calibration meetings on core competencies',
          'Accelerated interview turnaround through proactive stakeholder alignment'
        ],
        exampleFollowUp: 'How do you convince a hiring manager to consider a non-traditional candidate with strong transferable skills?'
      });
    }

    // C. Experienced Commerce & Finance
    else if (/commerce|finance|accounting/i.test(discLower)) {
      topicPool.push({
        id: 'comm_exp_fin_01',
        category: 'experienced_professional',
        title: 'Presenting Audit Findings and Budget Variances to Department Leads',
        promptText: `${candidateName}, when financial reviews or statutory audits identify significant budget overspends or compliance gaps, department heads may respond defensively. Describe how you communicate financial findings constructively to drive corrective action.`,
        prepTimeSeconds: 20,
        speakingTimeSeconds: 90,
        expectedConcepts: ['Objective data presentation', 'Constructive non-accusatory tone', 'Corrective action plan', 'Fiscal responsibility'],
        keywords: ['audit', 'variance', 'budget', 'financial', 'compliance', 'overspend', 'corrective', 'reporting'],
        sampleStrongPoints: [
          'Focused on verifiable ledgers and business impact rather than personal blame',
          'Proposed collaborative variance reconciliation measures',
          'Helped department leads establish monthly tracking checks'
        ],
        exampleFollowUp: 'How do you communicate complex statutory tax or accounting changes to operational staff who find it tedious?'
      });
    }

    // D. Experienced Business Analytics
    else if (/analytics|intelligence|bi\b/i.test(discLower)) {
      topicPool.push({
        id: 'comm_exp_ba_01',
        category: 'experienced_professional',
        title: 'Presenting Strategic KPI Insights to Executive Leadership',
        promptText: `${candidateName}, imagine you must deliver a high-stakes dashboard review to senior directors showing that a major product launch missed customer adoption targets. How do you structure your presentation to highlight the root cause, business impact, and strategic pivot?`,
        prepTimeSeconds: 20,
        speakingTimeSeconds: 90,
        expectedConcepts: ['Executive-level synthesis', 'Root-cause attribution', 'Actionable pivot recommendations', 'Confidence in data'],
        keywords: ['kpi', 'executive', 'leadership', 'analytics', 'dashboard', 'root cause', 'pivot', 'actionable'],
        sampleStrongPoints: [
          'Led with the bottom-line business reality and avoided technical clutter',
          'Separated correlation from causation using statistical attribution',
          'Proposed high-leverage intervention experiments'
        ],
        exampleFollowUp: 'What do you do when an executive vehemently disagrees with a metric finding?'
      });
    }

    // Core Experienced Professional Topics
    topicPool.push({
      id: 'comm_exp_01',
      category: 'experienced_professional',
      title: 'Handling a Significant Professional Challenge',
      promptText: `${candidateName}, describe a complex challenge or bottleneck you handled in your professional career. Walk me through how you diagnosed the problem, communicated with your team or stakeholders, and delivered a resolution.`,
      prepTimeSeconds: 20,
      speakingTimeSeconds: 90,
      expectedConcepts: ['Problem diagnosis', 'Stakeholder communication', 'Personal initiative', 'Measurable resolution'],
      keywords: ['challenge', 'problem', 'communicated', 'team', 'stakeholders', 'solution', 'impact', 'resolved'],
      sampleStrongPoints: [
        'Clearly articulated the context and root cause',
        'Outlined proactive communication strategy',
        'Shared measurable outcome or business benefit'
      ],
      exampleFollowUp: 'What was the single most valuable lesson you took away from that experience regarding team alignment?'
    });

    topicPool.push({
      id: 'comm_exp_02',
      category: 'experienced_professional',
      title: 'Resolving Workplace Conflicts Constructively',
      promptText: 'Disagreements on technical or business approaches are natural in high-performing teams. Describe a situation where you had a differing viewpoint with a peer or manager, and how you communicated to achieve alignment.',
      prepTimeSeconds: 20,
      speakingTimeSeconds: 90,
      expectedConcepts: ['Constructive dialogue', 'Active listening', 'Objective focus', 'Compromise & shared goal'],
      keywords: ['conflict', 'disagreement', 'listened', 'objective', 'consensus', 'compromise', 'collaboration'],
      sampleStrongPoints: [
        'Maintained professional, non-confrontational tone',
        'Demonstrated active listening and empathy',
        'Focused on data and organizational priorities'
      ],
      exampleFollowUp: 'How do you ensure psychological safety and mutual respect during high-pressure debates?'
    });

    topicPool.push({
      id: 'comm_exp_03',
      category: 'experienced_professional',
      title: 'Communicating Decisions to Senior Management',
      promptText: 'Imagine you need to present an important project proposal or strategic decision to senior leadership. How do you structure your communication to secure buy-in and address executive concerns?',
      prepTimeSeconds: 20,
      speakingTimeSeconds: 90,
      expectedConcepts: ['Executive summary', 'Business value / ROI', 'Risk mitigation', 'Clear next steps'],
      keywords: ['management', 'leadership', 'proposal', 'roi', 'risks', 'timeline', 'decision', 'buy-in'],
      sampleStrongPoints: [
        'Started with the bottom line and business value',
        'Addressed potential risks transparently',
        'Maintained executive brevity and clarity'
      ],
      exampleFollowUp: 'How do you pivot your presentation style when executives ask unexpected technical questions?'
    });
  }

  // =========================================================================
  // 2. NON-TECHNICAL FRESHER TOPICS (Dynamically Generated from Resume)
  // =========================================================================
  else if (isNonTech) {
    const skillsList = (resume?.rawSkillsList || [])
      .concat(Array.isArray(resume?.skills) ? resume.skills.flatMap(s => typeof s === 'string' ? [s] : (s?.skills ? s.skills.map(sk => sk.name) : [])) : []);
    const fullText = `${resume?.summary || ''} ${resume?.jobTitle || ''} ${resume?.extractedText || ''} ${skillsList.join(' ')}`.toLowerCase();

    const hasCustomerSupport = /(customer service|customer support|client service|helpdesk|call center|complaint|client communication|customer satisfaction|customer experience)/i.test(fullText);
    const hasOfficeAdmin = /(office admin|administration|email writing|correspondence|filing|document organization|record keeping|records management|data entry)/i.test(fullText);
    const hasExcel = /(excel|spreadsheet|pivot table|vlookup|ms office|google sheets|formulas)/i.test(fullText);
    const hasTeamwork = /(teamwork|collaboration|time management|multitasking|problem solving)/i.test(fullText);
    const hasCommerce = /(commerce|b\.?com|accounting|finance|billing|invoices|ledger|taxation|gst|auditing)/i.test(fullText);

    const firstExp = resume?.experience?.[0] || resume?.internships?.[0];

    // Topic A: Customer Service and Customer Satisfaction
    if (hasCustomerSupport || hasOfficeAdmin || hasCommerce) {
      topicPool.push({
        id: 'comm_nontech_cs_satisfaction',
        category: 'resume_skill_based',
        title: 'Customer Service and Customer Satisfaction',
        promptText: `Hello ${candidateName}. Delivering exceptional customer service requires active listening, prompt problem resolution, and empathetic communication. Speak on what customer service means to you, how you actively listen to understand client needs, and how you ensure customer interactions leave a positive, trustworthy impression.`,
        prepTimeSeconds: 20,
        speakingTimeSeconds: 90,
        expectedConcepts: ['Active listening & needs discovery', 'Customer satisfaction principles', 'Empathetic communication', 'Professional follow-through'],
        keywords: ['customer service', 'satisfaction', 'active listening', 'communication', 'empathy', 'client', 'resolution', 'support'],
        sampleStrongPoints: [
          'Articulated clear customer-first service mindset',
          'Highlighted the importance of active listening before offering solutions',
          'Demonstrated positive, patient, and professional diction'
        ],
        exampleFollowUp: 'How do you measure whether a customer was genuinely satisfied with the resolution you provided?'
      });
    }

    // Topic B: How to Handle an Angry Customer & Handling Customer Complaints
    if (hasCustomerSupport || hasOfficeAdmin || isNonTech) {
      topicPool.push({
        id: 'comm_nontech_angry_customer',
        category: 'resume_skill_based',
        title: 'How to Handle an Angry Customer & Handling Customer Complaints',
        promptText: `In customer support and office operations, de-escalating upset or angry clients is a vital skill. Walk me through your step-by-step approach: how you listen without interrupting, validate their frustration calmly, and communicate an effective resolution while adhering to company guidelines.`,
        prepTimeSeconds: 20,
        speakingTimeSeconds: 90,
        expectedConcepts: ['De-escalation techniques', 'Active listening without defensive posture', 'Validating client frustration', 'Clear action plan'],
        keywords: ['angry customer', 'complaints', 'de-escalate', 'active listening', 'patience', 'empathy', 'solution', 'service recovery'],
        sampleStrongPoints: [
          'Maintained composure and acknowledged the customer frustration calmly',
          'Explained concrete investigation steps without making false promises',
          'Followed through to confirm resolution and rebuild customer trust'
        ],
        exampleFollowUp: 'What specific words or phrases do you deliberately avoid using when speaking to an agitated customer?'
      });
    }

    // Topic C: Resume Academic Project (Prioritized when student has a project on their resume)
    if (primaryProject && primaryProject.title) {
      const projTitle = primaryProject.title;
      const isFeedbackSurvey = /customer feedback survey/i.test(projTitle);
      topicPool.push({
        id: 'comm_nontech_project_spotlight',
        category: 'resume_skill_based',
        title: isFeedbackSurvey ? 'Customer Feedback Survey & Improving Customer Experience' : `Project Spotlight: ${projTitle}`,
        promptText: `In your resume, you highlighted your project "${projTitle}". Walk me through how you designed the methodology, analyzed the data using analytical tools, and what actionable recommendations you derived to improve operations or customer satisfaction.`,
        prepTimeSeconds: 20,
        speakingTimeSeconds: 90,
        expectedConcepts: ['Project methodology & feedback gathering', 'Data analysis & tabulation', 'Customer experience insights', 'Actionable recommendations'],
        keywords: ['customer feedback', 'survey', 'excel', 'customer experience', 'satisfaction', 'data analysis', 'recommendations', 'project'],
        sampleStrongPoints: [
          'Clearly articulated the project objective and practical methodology',
          'Explained how data analysis translated into concrete service improvements',
          'Demonstrated strong presentation and storytelling ability'
        ],
        exampleFollowUp: 'What specific operational improvement did you recommend based on your project findings?'
      });
    }

    // Topic D: Effective Communication in the Workplace & Professional Email Writing
    if (hasOfficeAdmin || hasCustomerSupport || isNonTech) {
      topicPool.push({
        id: 'comm_nontech_email_writing',
        category: 'resume_skill_based',
        title: 'Effective Communication in the Workplace & Professional Email Writing',
        promptText: `Clear, professional email correspondence and verbal communication prevent costly misunderstandings and keep office operations running smoothly. Speak on how you structure business emails, communicate complex information simply, and ensure your tone remains polite, constructive, and actionable.`,
        prepTimeSeconds: 20,
        speakingTimeSeconds: 90,
        expectedConcepts: ['Business email structure & etiquette', 'Clarity & conciseness', 'Constructive tone', 'Preventing misunderstandings'],
        keywords: ['professional email writing', 'workplace communication', 'clarity', 'etiquette', 'tone', 'active listening', 'office administration'],
        sampleStrongPoints: [
          'Emphasized structured subject lines, concise bodies, and clear calls to action',
          'Highlighted proofreading and professional tone',
          'Addressed how open communication prevents cross-department friction'
        ],
        exampleFollowUp: 'What verification routine do you follow before hitting send on a critical business email to an external client?'
      });
    }

    // Topic E: Importance of Excel in Business and Office Administration & Data Entry Accuracy
    if (hasExcel || hasOfficeAdmin || hasCommerce) {
      topicPool.push({
        id: 'comm_nontech_excel_admin',
        category: 'resume_skill_based',
        title: 'Importance of Excel in Business and Office Administration',
        promptText: `Spreadsheet tools like MS Excel, basic formulas, and organized record-keeping form the foundation of office administration and billing accuracy. Speak on how you use Excel to manage records, track data accurately, and prevent transcription errors in business documents.`,
        prepTimeSeconds: 20,
        speakingTimeSeconds: 90,
        expectedConcepts: ['MS Excel formulas & formatting', 'Data entry accuracy & verification', 'Office record management', 'Document organization'],
        keywords: ['excel', 'data entry', 'accuracy', 'record management', 'spreadsheets', 'office administration', 'formulas', 'organization'],
        sampleStrongPoints: [
          'Connected spreadsheet organization to business decision-making',
          'Described systematic self-checks to eliminate data entry mistakes',
          'Demonstrated pride in structured document and filing management'
        ],
        exampleFollowUp: 'How do you double-check your data entry to ensure zero calculation or transcription errors in critical records?'
      });
    }

    // Topic E: Importance of Teamwork, Time Management & Handling Multiple Tasks in an Office
    topicPool.push({
      id: 'comm_nontech_teamwork_multitasking',
      category: 'fresher_general',
      title: 'Importance of Teamwork and Time Management in an Office',
      promptText: `In office administration and customer coordination, managing competing priorities, urgent requests, and tight deadlines is a daily reality. Speak on how you prioritize multiple tasks, manage time effectively, and collaborate smoothly with team members to keep office operations running efficiently.`,
      prepTimeSeconds: 20,
      speakingTimeSeconds: 90,
      expectedConcepts: ['Task prioritization & triage', 'Time management under deadlines', 'Team collaboration', 'Handling workplace pressure'],
      keywords: ['teamwork', 'time management', 'multitasking', 'priorities', 'deadlines', 'collaboration', 'office administration', 'problem solving'],
      sampleStrongPoints: [
        'Described practical triage and prioritization strategies',
        'Showed empathy for colleagues and shared accountability',
        'Maintained structured focus during high-pressure work spikes'
      ],
      exampleFollowUp: 'When two supervisors give you conflicting urgent tasks at the same time, how do you communicate with them to prioritize?'
    });

    // Topic F: Event Volunteering / Practical Coordination (if experience exists)
    if (firstExp && firstExp.role) {
      topicPool.push({
        id: 'comm_nontech_volunteering',
        category: 'resume_skill_based',
        title: 'Event Coordination, Communication & Problem-Solving',
        promptText: `During your experience as a ${firstExp.role} with ${firstExp.company || 'your college/organization'}, you coordinated logistics and communicated with participants. Speak on a specific challenge you handled on the ground, how you used active listening and teamwork, and what you learned about real-time coordination.`,
        prepTimeSeconds: 20,
        speakingTimeSeconds: 90,
        expectedConcepts: ['Logistical coordination', 'Active listening on the ground', 'Team collaboration', 'Rapid problem solving'],
        keywords: ['volunteer', 'event coordination', 'communication', 'teamwork', 'problem solving', 'active listening', 'participants'],
        sampleStrongPoints: [
          'Shared concrete examples of managing attendee questions politely',
          'Demonstrated calm problem-solving during fast-paced event moments',
          'Connected volunteering lessons directly to workplace readiness'
        ],
        exampleFollowUp: 'How did that volunteering experience strengthen your confidence in handling diverse customer queries?'
      });
    }

    // Topic H: Applying Commerce Education to Office Administration
    if (hasCommerce || /commerce/i.test(discLower)) {
      topicPool.push({
        id: 'comm_nontech_commerce_app',
        category: 'resume_skill_based',
        title: 'Applying Commerce Knowledge to Business & Support Operations',
        promptText: `As a Bachelor of Commerce (B.Com) graduate, speak on how your academic foundation in commerce, basic accounting principles, and business operations helps you manage office records, understand client transactions, and contribute to business productivity.`,
        prepTimeSeconds: 20,
        speakingTimeSeconds: 90,
        expectedConcepts: ['Commerce fundamentals', 'Billing & financial records', 'Organizational workflows', 'Business awareness'],
        keywords: ['commerce', 'b.com', 'billing', 'records', 'business', 'operations', 'invoices', 'accounting'],
        sampleStrongPoints: [
          'Connected academic coursework directly to practical office operations',
          'Explained how understanding commercial terms improves communication with clients and vendors',
          'Showed enthusiasm for continuous operational learning'
        ],
        exampleFollowUp: 'How do you communicate with a customer who has a discrepancy or dispute over an invoice or billing statement?'
      });
    }
  }

  // =========================================================================
  // 3. TECHNICAL FRESHER TOPICS (Engineering, Computer Science, ECE, Mech, Civil)
  // =========================================================================
  else {
    topicPool.push({
      id: 'comm_tech_intro',
      category: 'fresher_general',
      title: 'Engineering Self-Introduction & Practical Passion',
      promptText: `Hello ${candidateName}. Introduce yourself: explain your academic background in ${effectiveDiscipline}, key technical tools you enjoy working with, projects like ${projectTitle || 'your main engineering project'}, and where you see yourself growing as an engineer.`,
      prepTimeSeconds: 20,
      speakingTimeSeconds: 90,
      expectedConcepts: ['Academic overview in branch', 'Hands-on project highlight', 'Core technical proficiencies', 'Engineering passion'],
      keywords: ['engineering', 'degree', 'projects', 'skills', 'technologies', 'developed', 'passion', 'growth'],
      sampleStrongPoints: [
        'Articulated both technical execution and communication clarity',
        'Highlighted practical problem-solving in projects',
        'Spoke with authentic enthusiasm for engineering solutions'
      ],
      exampleFollowUp: 'What was the steepest technical learning curve you overcame during your project?'
    });

    topicPool.push({
      id: 'comm_tech_ai_society',
      category: 'fresher_technical',
      title: 'Artificial Intelligence & Technology in Daily Life',
      promptText: 'Artificial intelligence and automation are transforming every industry. Speak on how AI is shaping daily life, the exciting opportunities it brings, and the societal or ethical responsibilities engineers must keep in mind.',
      prepTimeSeconds: 20,
      speakingTimeSeconds: 90,
      expectedConcepts: ['Real-world AI applications', 'Productivity & automation', 'Ethics & bias', 'Future outlook'],
      keywords: ['artificial intelligence', 'automation', 'society', 'technology', 'ethics', 'innovation', 'future'],
      sampleStrongPoints: [
        'Balanced technological optimism with realistic ethical awareness',
        'Used clear real-world examples (healthcare, education, smart cities)',
        'Advocated for responsible, user-centered engineering'
      ],
      exampleFollowUp: 'How can young engineers ensure the software they build remains inclusive and unbiased?'
    });

    topicPool.push({
      id: 'comm_tech_teamwork',
      category: 'fresher_general',
      title: 'Collaboration in Software and Engineering Teams',
      promptText: 'Modern engineering is a team sport—requiring code reviews, cross-functional sprints, and clear documentation. Speak on why strong communication is just as vital as technical coding skills for an engineer.',
      prepTimeSeconds: 20,
      speakingTimeSeconds: 90,
      expectedConcepts: ['Code reviews & documentation', 'Bridging tech & non-tech', 'Empathy in debugging', 'Team velocity'],
      keywords: ['teamwork', 'documentation', 'code review', 'collaboration', 'communication', 'sprints', 'velocity'],
      sampleStrongPoints: [
        'Explained why misunderstood requirements cause engineering rework',
        'Emphasized value of clean documentation and empathetic peer reviews',
        'Shared personal experience collaborating on technical builds'
      ],
      exampleFollowUp: 'How do you explain a complex system bug to a client who does not understand code?'
    });
  }

  // Return requested count (default 4)
  return topicPool.slice(0, count);
}

/**
 * Preprocesses candidate transcript: cleans text, tokenizes words and sentences.
 */
function preprocessSpeechText(raw: string) {
  const clean = raw.trim().replace(/\s+/g, ' ');
  const words = clean.length > 0 ? clean.split(/\s+/).filter(w => w.length > 0) : [];
  const sentences = clean.split(/[.?!]+/).filter(s => s.trim().length > 0);
  return { clean, words, sentences };
}

/**
 * Evaluates candidate communication performance across the 8 core dimensions.
 * ZERO facial appearance bias — strictly text and acoustic delivery metrics.
 */
export function evaluateCommunicationSpeech(
  topicOrTranscript: CommunicationTopic | string,
  candidateTranscriptOrTopic: string | CommunicationTopic,
  durationSeconds: number = 60,
  candidateDiscipline?: string,
  _isFresher?: boolean
): CommunicationEvaluationResult {
  let topic: CommunicationTopic;
  let candidateTranscript: string;

  if (typeof topicOrTranscript === 'string') {
    candidateTranscript = topicOrTranscript;
    topic = candidateTranscriptOrTopic as CommunicationTopic;
  } else {
    topic = topicOrTranscript;
    candidateTranscript = typeof candidateTranscriptOrTopic === 'string' ? candidateTranscriptOrTopic : '';
  }

  const { clean, words, sentences } = preprocessSpeechText(candidateTranscript);
  const wordCount = words.length;
  const safeDuration = Math.max(10, durationSeconds);
  const wpm = Math.round((wordCount / safeDuration) * 60);

  // 1. Detect filler words
  const lowerText = clean.toLowerCase();
  const detectedFillers: { word: string; count: number }[] = [];
  let totalFillerCount = 0;

  for (const filler of FILLER_WORDS) {
    const regex = new RegExp(`\\b${filler}\\b`, 'gi');
    const matches = lowerText.match(regex);
    if (matches && matches.length > 0) {
      detectedFillers.push({ word: filler, count: matches.length });
      totalFillerCount += matches.length;
    }
  }

  // 2. Metric Calculations (0-100)

  // A. Fluency (optimal speaking rate: 110 - 150 WPM)
  let fluency = 75;
  if (wpm >= 110 && wpm <= 160) {
    fluency = 92;
  } else if (wpm >= 90 && wpm < 110) {
    fluency = 84;
  } else if (wpm > 160 && wpm <= 190) {
    fluency = 80;
  } else if (wpm < 70) {
    fluency = Math.max(35, wpm);
  } else {
    fluency = 70;
  }
  // Penalize excessive fillers on fluency
  if (totalFillerCount > 6) fluency = Math.max(40, fluency - (totalFillerCount * 2));

  // B. Grammar (sentence structure, capitalization, punctuation, average sentence length)
  let grammar = 75;
  const avgSentenceLength = sentences.length > 0 ? wordCount / sentences.length : 0;
  if (avgSentenceLength >= 8 && avgSentenceLength <= 24) {
    grammar += 12;
  } else if (avgSentenceLength > 30) {
    grammar -= 8; // Run-on sentences
  }
  if (wordCount > 35) grammar += 8;
  grammar = Math.min(95, Math.max(45, grammar));

  // C. Vocabulary (unique words, diversity, professional jargon)
  const uniqueWords = new Set(words.map(w => w.toLowerCase()));
  const lexicalDiversity = wordCount > 0 ? uniqueWords.size / wordCount : 0;
  let vocabulary = Math.round(lexicalDiversity * 100);
  if (wordCount >= 40) vocabulary = Math.min(94, vocabulary + 25);
  vocabulary = Math.min(95, Math.max(40, vocabulary));

  // D. Clarity (absence of fillers, clean sentence flow)
  let clarity = 85 - (totalFillerCount * 3.5);
  if (wordCount < 20) clarity -= 20;
  clarity = Math.min(95, Math.max(40, Math.round(clarity)));

  // E. Topic Understanding (covers expected concepts)
  let matchedConcepts = 0;
  for (const concept of topic.expectedConcepts) {
    const conceptWords = concept.toLowerCase().split(/\s+/).filter(w => w.length > 3);
    const hit = conceptWords.some(cw => lowerText.includes(cw));
    if (hit) matchedConcepts++;
  }
  const conceptRatio = topic.expectedConcepts.length > 0 ? matchedConcepts / topic.expectedConcepts.length : 0.5;
  let topicUnderstanding = Math.round(55 + (conceptRatio * 40));
  if (wordCount > 45 && matchedConcepts > 0) topicUnderstanding = Math.min(95, topicUnderstanding + 5);

  // F. Logical Organization (transition indicators, intro/body/conclusion signals)
  const hasIntro = /\b(hello|firstly|to begin|start|introduce|my name|i am|regarding|in terms of)\b/i.test(lowerText);
  const hasBodyTransitions = /\b(additionally|furthermore|moreover|secondly|for example|such as|in my experience|because)\b/i.test(lowerText);
  const hasConclusion = /\b(finally|in conclusion|to summarize|overall|ultimately|therefore|as a result)\b/i.test(lowerText);

  let logicalOrganization = 60;
  if (hasIntro) logicalOrganization += 12;
  if (hasBodyTransitions) logicalOrganization += 14;
  if (hasConclusion) logicalOrganization += 12;
  logicalOrganization = Math.min(95, Math.max(45, logicalOrganization));

  // G. Relevance (keyword density from prompt)
  let matchedKeywords = 0;
  for (const kw of topic.keywords) {
    if (lowerText.includes(kw.toLowerCase())) matchedKeywords++;
  }
  const kwRatio = topic.keywords.length > 0 ? matchedKeywords / topic.keywords.length : 0.4;
  let relevance = Math.round(50 + (kwRatio * 45));
  if (wordCount < 15) relevance = Math.min(45, relevance);
  relevance = Math.min(95, Math.max(40, relevance));

  // H. Ability to Explain Ideas (concrete examples, analogies, numbers, evidence)
  const hasExamples = /\b(for instance|for example|in my project|specifically|such as|case study|when i worked|we achieved|reduced|increased)\b/i.test(lowerText);
  let abilityToExplainIdeas = hasExamples ? 88 : (wordCount > 40 ? 74 : 58);
  if (wordCount > 60 && hasExamples) abilityToExplainIdeas = 94;

  const metrics: CommunicationMetricBreakdown = {
    fluency,
    grammar,
    vocabulary,
    clarity,
    topicUnderstanding,
    logicalOrganization,
    relevance,
    abilityToExplainIdeas
  };

  // 3. Overall Weighted Score
  const overallScore = Math.round(
    fluency * 0.15 +
    grammar * 0.10 +
    vocabulary * 0.10 +
    clarity * 0.15 +
    topicUnderstanding * 0.15 +
    logicalOrganization * 0.10 +
    relevance * 0.15 +
    abilityToExplainIdeas * 0.10
  );

  // 4. Rating Band
  let ratingBand: CommunicationEvaluationResult['ratingBand'] = 'Competent';
  if (overallScore >= 85) ratingBand = 'Exceptional';
  else if (overallScore >= 75) ratingBand = 'Proficient Speaker';
  else if (overallScore >= 60) ratingBand = 'Competent';
  else ratingBand = 'Needs Practice';

  // 5. Strengths & Improvements
  const strengths: string[] = [];
  const areasToImprove: string[] = [];

  if (fluency >= 80) strengths.push(`Natural and confident speaking pace (${wpm} words per minute).`);
  else if (wpm < 90) areasToImprove.push(`Speaking rate is slightly deliberate (${wpm} WPM). Aim for 120-140 WPM with steady rhythm.`);
  else areasToImprove.push(`Pacing is slightly fast (${wpm} WPM). Pause at key punctuation marks to give listeners time to absorb.`);

  if (clarity >= 80) strengths.push('Clear articulation with minimal filler hesitation.');
  else if (totalFillerCount > 3) areasToImprove.push(`Detected ${totalFillerCount} filler words (${detectedFillers.map(f => `"${f.word}" x${f.count}`).join(', ')}). Replace fillers with deliberate 1-second silent pauses.`);

  if (relevance >= 80 && topicUnderstanding >= 80) strengths.push('Directly addressed prompt objectives with strong domain relevance.');
  else areasToImprove.push('Ensure each point directly answers the specific prompt scenario before expanding on background.');

  if (hasExamples) strengths.push('Used specific examples and real-world instances to anchor ideas.');
  else areasToImprove.push('Incorporate a concrete personal example or measurable outcome to illustrate theoretical points.');

  if (hasIntro && hasConclusion) strengths.push('Structured response with distinct introductory and concluding thoughts.');
  else areasToImprove.push('Use structured transitions (e.g. "Firstly...", "For instance...", "In summary...") to guide your listener.');

  if (strengths.length === 0) strengths.push('Addressed the topic within the allocated response time.');
  if (areasToImprove.length === 0) areasToImprove.push('Continue polishing your delivery to maintain consistent executive presence.');

  // 6. Domain-Specific Advice
  const domainSpecificAdvice: string[] = [];
  const disc = (candidateDiscipline || '').toLowerCase();

  if (/commerce|finance|accounting/i.test(disc)) {
    domainSpecificAdvice.push('When explaining financial concepts, always link figures to business impact (e.g., cash flow sustainability, risk mitigation).');
    domainSpecificAdvice.push('Practice de-jargonizing accounting principles so non-finance stakeholders can make confident decisions.');
  } else if (/analytics|intelligence/i.test(disc)) {
    domainSpecificAdvice.push('Lead your communication with the strategic insight ("The So What?"), followed by the supportive data visualization.');
    domainSpecificAdvice.push('Frame metrics around decisions: highlight what action a manager should take based on the chart.');
  } else if (/marketing/i.test(disc)) {
    domainSpecificAdvice.push('Always identify the target customer persona early in your explanation to give your strategy context.');
    domainSpecificAdvice.push('Back creative campaigns with measurable KPI benchmarks (e.g., CAC, customer lifetime value).');
  } else if (/human resource|hr/i.test(disc)) {
    domainSpecificAdvice.push('Adopt an empathetic yet objective communication tone when discussing workplace mediation and policies.');
    domainSpecificAdvice.push('Emphasize mutual win-win outcomes and ongoing organizational support channels.');
  } else if (/arts|humanities|english/i.test(disc)) {
    domainSpecificAdvice.push('Leverage your strong narrative storytelling skills while keeping workplace presentations concise and action-oriented.');
    domainSpecificAdvice.push('Use structured bullet points to anchor deep qualitative ideas.');
  } else {
    // Engineering / Technical
    domainSpecificAdvice.push('When explaining technical architecture, summarize the problem before diving into algorithms and frameworks.');
    domainSpecificAdvice.push('Explain trade-offs clearly: why you selected one technology over another based on latency, cost, or maintainability.');
  }

  // Follow-up question
  const followUpQuestion = topic.exampleFollowUp || 'Could you elaborate with one specific example of how you would handle that scenario in a team setting?';

  return {
    topicId: topic.id,
    topicTitle: topic.title,
    transcript: clean,
    durationSeconds: safeDuration,
    wordCount,
    wpm,
    metrics,
    overallScore,
    ratingBand,
    strengths,
    areasToImprove,
    domainSpecificAdvice,
    followUpQuestion,
    fillerWordsDetected: detectedFillers
  };
}
