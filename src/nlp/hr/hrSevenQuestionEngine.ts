/**
 * CareerCurve AI HR Behaviour Interview Engine — Realistic Seven-Question Architecture
 * 
 * Implements:
 * 1. Seven Main HR Questions covering the required canonical areas:
 *    - Q1: Tell me about yourself (Introduction)
 *    - Q2: Why should we hire you? (Value proposition & fit)
 *    - Q3: What are your strengths and weaknesses? (Self-awareness & growth)
 *    - Q4: Why do you want to join our company? (Company interest & motivation)
 *    - Q5: Where do you see yourself in five years? (Career trajectory & vision)
 *    - Q6: Tell me about a challenge you faced and how you handled it (STAR problem solving)
 *    - Q7: Do you have any questions for us? (Two-way candidate Q&A)
 * 2. Intelligent satisfaction evaluation & dynamic follow-up generation (max 2 per question).
 * 3. Deep resume personalization across all engineering departments (CSE, IT, ECE, EEE, Mech, Civil, Auto).
 * 4. Company-aware customization with verified facts, with general professional fallback.
 * 5. Realistic candidate Q&A responder for Question 7.
 * 6. Professional closing statements and comprehensive scorecard synthesis.
 */

import { ParsedResume } from '../../types';
import { 
  HRDatasetQuestion, 
  HRInterviewConfig, 
  HRSatisfactionEvaluation, 
  CandidateQuestionResponse 
} from './types';

export interface HRSevenQuestionDef {
  index: number; // 0 to 6
  areaKey: string;
  category: HRDatasetQuestion['category'];
  progressTitle: string;
  shortTitle: string;
  baseQuestion: string;
  expectedConcepts: string[];
  keywords: string[];
  starFrameworkApplicable: boolean;
  evaluationFocus: string;
  exampleStrongAnswer: string;
  exampleWeakAnswer: string;
}

export const SEVEN_MAIN_HR_QUESTIONS: HRSevenQuestionDef[] = [
  {
    index: 0,
    areaKey: 'self_introduction',
    category: 'self_introduction',
    progressTitle: 'Question 1 of 7 — Introduction',
    shortTitle: 'Introduction',
    baseQuestion: 'Could you please tell me about yourself—including your education, technical background, key projects, skills, and what excites you most in your engineering journey?',
    expectedConcepts: [
      'Academic background and engineering department',
      'Technical skills and proficiencies',
      'Key practical projects or achievements',
      'Career interests and engineering passion'
    ],
    keywords: ['engineering', 'degree', 'projects', 'skills', 'experience', 'interests', 'technologies', 'developed', 'built', 'background'],
    starFrameworkApplicable: false,
    evaluationFocus: 'Clarity of self-presentation, relevance of technical skills, articulation of projects, and professional enthusiasm.',
    exampleStrongAnswer: "I am a final-year engineering student with a strong passion for designing scalable software and solving practical problems. Throughout my studies in Computer Science, I have developed solid proficiency in Python, React, and SQL. A highlight of my journey has been architecting an end-to-end task management application where I engineered asynchronous queueing and responsive UI workflows. Outside the classroom, I actively participate in hackathons and open-source discussions, which has strengthened both my technical execution and collaborative teamwork.",
    exampleWeakAnswer: "I am a Computer Science student. I know Python."
  },
  {
    index: 1,
    areaKey: 'why_hire_you',
    category: 'why_hire_you',
    progressTitle: 'Question 2 of 7 — Why should we hire you?',
    shortTitle: 'Why should we hire you?',
    baseQuestion: 'Why should we hire you? What unique blend of technical skills, project experience, and problem-solving mindset do you bring to our opportunity?',
    expectedConcepts: [
      'Technical capabilities matched to real-world execution',
      'Demonstrated project ownership or internship experience',
      'Strong problem-solving grit and adaptability',
      'Team collaboration and eagerness to learn'
    ],
    keywords: ['hire', 'skills', 'projects', 'ownership', 'value', 'contribute', 'learn', 'problem solving', 'results', 'experience'],
    starFrameworkApplicable: false,
    evaluationFocus: 'Value proposition, concrete practical evidence, alignment with role requirements, and self-assurance.',
    exampleStrongAnswer: "You should hire me because I offer a strong foundation in core engineering principles combined with practical, hands-on experience taking projects from concept to deployment. In my project work, I did not just implement assigned features—I proactively optimized database queries and resolved edge-case bottlenecks. I learn new technologies rapidly, communicate transparently with peers, and take genuine pride in writing clean, reliable code that drives business value.",
    exampleWeakAnswer: "You should hire me because I am a hard worker and I need a job."
  },
  {
    index: 2,
    areaKey: 'strengths_weaknesses',
    category: 'strengths_weaknesses',
    progressTitle: 'Question 3 of 7 — Strengths and weaknesses',
    shortTitle: 'Strengths and weaknesses',
    baseQuestion: 'What are your greatest strengths, and what is one genuine weakness or area for improvement you have identified and are actively working to overcome?',
    expectedConcepts: [
      'Identifiable genuine strength with practical context',
      'Honest, non-cliché area of weakness',
      'Active corrective steps and progress made',
      'Self-awareness and growth mindset'
    ],
    keywords: ['strength', 'weakness', 'improvement', 'learning', 'habits', 'active', 'progress', 'discipline', 'feedback', 'overcome'],
    starFrameworkApplicable: false,
    evaluationFocus: 'Self-awareness, honesty, actionable improvement strategies, and emotional maturity.',
    exampleStrongAnswer: "My greatest strength is my methodical approach to root-cause debugging—when faced with unexpected system failures, I break down issues through logging and reproduction steps rather than guessing. A genuine weakness I identified earlier was a tendency to take on too many tasks individually rather than delegating early. To address this, I have adopted agile Kanban tracking and initiated proactive 5-minute stand-ups with teammates, which has significantly improved our team velocity and my own workload balance.",
    exampleWeakAnswer: "My weakness is that I work too hard and am a perfectionist. My strength is that I know everything."
  },
  {
    index: 3,
    areaKey: 'company_interest',
    category: 'motivation_company_fit',
    progressTitle: 'Question 4 of 7 — Company interest',
    shortTitle: 'Company interest',
    baseQuestion: 'Why do you want to join our company, and what specifically attracts you to our engineering culture, mission, and work environment?',
    expectedConcepts: [
      'Knowledge of company mission, products, or technology stack',
      'Connection between personal career goals and company culture',
      'Enthusiasm for engineering excellence and collaborative learning',
      'Value alignment with the organization'
    ],
    keywords: ['company', 'mission', 'culture', 'products', 'technology', 'scale', 'learning', 'values', 'attracts', 'motivated'],
    starFrameworkApplicable: false,
    evaluationFocus: 'Genuine motivation, research and understanding of organizational values, and alignment of career vision.',
    exampleStrongAnswer: "I want to join your organization because of your reputation for engineering rigor, transparent peer reviews, and user-centric innovation. I have followed how your teams architect resilient systems that scale gracefully. As someone who thrives in an environment that values continuous learning and proactive initiative, being part of a team that tackles challenging technical problems while upholding high engineering standards is the ideal place for me to contribute and grow.",
    exampleWeakAnswer: "I want to join because your company is famous and has good packages."
  },
  {
    index: 4,
    areaKey: 'five_year_goals',
    category: 'career_goals',
    progressTitle: 'Question 5 of 7 — Five-year goals',
    shortTitle: 'Five-year goals',
    baseQuestion: 'Where do you see yourself professionally in five years, both in terms of technical mastery and broader responsibilities?',
    expectedConcepts: [
      'Realistic short-to-medium term technical trajectory',
      'Deep domain mastery in chosen engineering specialisation',
      'Evolution into architectural ownership or team mentoring',
      'Commitment to continuous learning and industry adaptation'
    ],
    keywords: ['five years', 'goals', 'growth', 'mastery', 'lead', 'mentor', 'architecture', 'responsibilities', 'technical', 'impact'],
    starFrameworkApplicable: false,
    evaluationFocus: 'Career planning, ambition balanced with realism, continuous professional development, and loyalty.',
    exampleStrongAnswer: "Over the next two years, my focus is on becoming a go-to technical contributor by delivering robust production features and mastering our system architecture. By year five, I see myself stepping into a technical lead or senior engineering role—taking ownership of large architectural decisions, mentoring incoming engineers, and driving cross-functional milestones that create tangible business impact. I want to build a reputation as a dependable problem solver who elevates the entire team.",
    exampleWeakAnswer: "In five years I just want to become a manager and stop doing technical work."
  },
  {
    index: 5,
    areaKey: 'challenges_problem_solving',
    category: 'leadership_problem_solving',
    progressTitle: 'Question 6 of 7 — Challenges and problem-solving',
    shortTitle: 'Challenges and problem-solving',
    baseQuestion: 'Engineering projects often encounter unexpected obstacles. Tell me about a significant challenge you faced—technical, deadline, or teamwork—and walk me through how you handled it.',
    expectedConcepts: [
      'Situation & specific challenge context',
      'Personal responsibility and task',
      'Action: Concrete methodology and steps taken',
      'Result: Quantifiable outcome, resolution, and lesson learned (STAR)'
    ],
    keywords: ['challenge', 'obstacle', 'problem', 'situation', 'action', 'result', 'resolved', 'outcome', 'learned', 'team'],
    starFrameworkApplicable: true,
    evaluationFocus: 'STAR framework compliance, individual ownership, analytical problem solving, resilience, and actionable learnings.',
    exampleStrongAnswer: "During our semester capstone project, our backend service crashed during concurrent load testing two days before the submission deadline. As the person responsible for the API layer, I immediately set up isolated request profiling to identify the bottleneck. I discovered redundant synchronous database queries blocking the connection pool. I refactored the query logic into batch lookups and introduced lightweight caching for hot endpoints. As a result, response times improved by 65%, the system handled 500 concurrent users without error, and our project received the highest distinction in our department.",
    exampleWeakAnswer: "I faced a problem in my project. It was very hard but we finished it."
  },
  {
    index: 6,
    areaKey: 'candidate_questions',
    category: 'candidate_questions',
    progressTitle: 'Question 7 of 7 — Questions for the interviewer',
    shortTitle: 'Questions for the interviewer',
    baseQuestion: 'We have explored your background thoroughly. Now, the floor is yours: Do you have any questions for me regarding our engineering team, culture, work environment, or learning opportunities?',
    expectedConcepts: [
      'Thoughtful curiosity about engineering culture and team dynamics',
      'Questions regarding mentorship, onboarding, or technical challenges',
      'Professional demeanor and active engagement',
      'Or polite professional closing if no questions'
    ],
    keywords: ['questions', 'team', 'culture', 'mentorship', 'learning', 'technology', 'environment', 'growth', 'expectations', 'role'],
    starFrameworkApplicable: false,
    evaluationFocus: 'Engagement, intellectual curiosity, interest in company environment, and professional closing etiquette.',
    exampleStrongAnswer: "Could you tell me what the onboarding and mentorship process looks like for early-career engineers during their first 90 days, and what opportunities there are for cross-team technical collaboration?",
    exampleWeakAnswer: "No, nothing."
  }
];

/**
 * Normalizes engineering or non-technical department to standard discipline names
 */
export function normalizeDepartment(dept?: string): string {
  if (!dept) return 'Professional Studies';
  const d = dept.toLowerCase();
  // Non-Technical
  if (d.includes('commerce') || d.includes('b.com') || d.includes('accounting') || d.includes('tally')) return 'Commerce & Accounting';
  if (d.includes('business analytics') || d.includes('analytics') || d.includes('business intelligence')) return 'Business Analytics';
  if (d.includes('bba') || d.includes('business admin') || d.includes('bms')) return 'Business Administration';
  if (d.includes('mba') || d.includes('management') || d.includes('pgdm')) return 'Management';
  if (d.includes('finance')) return 'Finance & Accounting';
  if (d.includes('marketing') || d.includes('sales')) return 'Marketing';
  if (d.includes('human resource') || d.includes('hr')) return 'Human Resources';
  if (d.includes('arts') || d.includes('humanities') || d.includes('english') || d.includes('literature')) return 'Arts & Humanities';
  // Technical
  if (d.includes('computer') || d.includes('cse') || d.includes('software')) return 'Computer Science & Engineering';
  if (d.includes('information') || d.includes(' it') || d === 'it') return 'Information Technology';
  if (d.includes('electron') || d.includes('ece') || d.includes('telecom') || d.includes('communication')) return 'Electronics & Communication Engineering';
  if (d.includes('electr') || d.includes('eee')) return 'Electrical & Electronics Engineering';
  if (d.includes('mech')) return 'Mechanical Engineering';
  if (d.includes('civil') || d.includes('structur')) return 'Civil Engineering';
  if (d.includes('auto') || d.includes('motor')) return 'Automobile Engineering';
  return dept;
}

/**
 * Builds personalized 7 main HR questions based on the candidate's actual resume
 * and optional target company.
 */
export function generateSevenMainHRQuestions(
  parsedResume: ParsedResume | null,
  targetCompany?: string,
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced' = 'Intermediate'
): { question: HRDatasetQuestion; personalizedText: string; progressTitle: string; shortTitle: string }[] {
  const candidateName = parsedResume?.fullName ? parsedResume.fullName.split(' ')[0] : 'Candidate';
  const fullName = parsedResume?.fullName || candidateName;
  const dept = normalizeDepartment(parsedResume?.department);
  const college = parsedResume?.education?.[0]?.college || (parsedResume?.education?.[0] as any)?.institution || 'your university';
  const gradYear = parsedResume?.education?.[0]?.graduationYear || '2024';
  
  // Extract project details
  const primaryProject = parsedResume?.projects?.[0];
  const candidateClassification = parsedResume?.classification;
  const isNonTech = candidateClassification?.educationalCategory === 'non_technical' ||
    parsedResume?.userSelectedCategory === 'non_technical' ||
    candidateClassification?.userSelectedCategory === 'non_technical' ||
    candidateClassification?.isTechnical === false ||
    /(commerce|b\.?com|bba|mba|business|management|finance|accounting|marketing|human resource|hr|arts|humanities|english|customer service|customer support)/i.test(dept);

  let displayDept = dept;
  if (isNonTech && (/engineering|computer science|general studies/i.test(dept) || dept === 'General Engineering')) {
    displayDept = candidateClassification?.discipline && !/engineering|computer science/i.test(candidateClassification.discipline)
      ? candidateClassification.discipline
      : 'Commerce';
  }

  const isExperienced = candidateClassification?.track === 'experienced' ||
    (parsedResume?.employmentHistory && parsedResume.employmentHistory.length > 0);

  const projectTitle = primaryProject?.title || (isNonTech ? 'your primary project or practical assignment' : 'your engineering capstone project');
  const projectTech = primaryProject?.technologies && primaryProject.technologies.length > 0
    ? primaryProject.technologies.slice(0, 3).join(', ')
    : (isNonTech ? 'your core analytical tools' : 'relevant engineering tools');

  // Extract skills
  const skillsList = parsedResume?.rawSkillsList && parsedResume.rawSkillsList.length > 0
    ? parsedResume.rawSkillsList.slice(0, 4).join(', ')
    : (isNonTech ? 'your professional and analytical proficiencies' : 'your technical competencies');

  const company = targetCompany && targetCompany.trim() && targetCompany.trim().toLowerCase() !== 'general' && targetCompany.trim().toLowerCase() !== 'general / any company'
    ? targetCompany.trim()
    : null;

  return SEVEN_MAIN_HR_QUESTIONS.map((def) => {
    let personalizedText = def.baseQuestion;

    if (def.index === 0) {
      // Question 1: Introduction
      if (isExperienced) {
        personalizedText = `Hello ${candidateName}, welcome to CareerCurve! Could you please introduce yourself—walk me through your professional background in ${displayDept}, your key workplace responsibilities, core skills, and what motivates you in your career?`;
      } else if (isNonTech) {
        personalizedText = `Hello ${candidateName}, welcome to CareerCurve! To begin our interview today, could you please tell me about yourself—walk me through your academic background in ${displayDept} at ${college}, your key professional skills, projects like ${projectTitle}, and what excites you most about your career journey?`;
      } else {
        personalizedText = `Hello ${candidateName}, welcome to CareerCurve! To begin our interview today, could you please tell me about yourself—walk me through your academic background in ${displayDept} at ${college}, your key technical skills, projects like ${projectTitle}, and what excites you most about engineering?`;
      }
    } else if (def.index === 1) {
      // Question 2: Why should we hire you?
      if (company) {
        if (isNonTech) {
          personalizedText = `Thank you, ${candidateName}. With many candidates applying to ${company}, why should we hire you? How do your analytical skills in ${skillsList} and your hands-on background in ${displayDept} make you the right fit for our team?`;
        } else {
          personalizedText = `Thank you, ${candidateName}. With many candidates applying to ${company}, why should we hire you? How do your technical skills in ${skillsList} and your hands-on experience in ${displayDept} make you the right fit for our team?`;
        }
      } else {
        if (isNonTech) {
          personalizedText = `Thank you, ${candidateName}. Looking at the requirements for this position, why should we hire you? What unique blend of problem-solving mindset, practical skills, and domain experience in ${displayDept} sets you apart?`;
        } else {
          personalizedText = `Thank you, ${candidateName}. Looking at the requirements for this engineering role, why should we hire you? What unique blend of technical skills, problem-solving mindset, and project experience sets you apart?`;
        }
      }
    } else if (def.index === 2) {
      // Question 3: Strengths and weaknesses
      personalizedText = `Self-awareness and a willingness to grow are crucial for any successful professional. What would you say are your greatest strengths, and what is one genuine weakness you have identified and are actively working to improve?`;
    } else if (def.index === 3) {
      // Question 4: Company interest
      if (company) {
        personalizedText = `What specifically motivated you to apply to ${company}? What excites you about our culture, team values, and the impact our work has?`;
      } else {
        personalizedText = `When you think about an organization you want to build your career with, what attracts you most to a company's work culture, team values, and organizational mission?`;
      }
    } else if (def.index === 4) {
      // Question 5: Five-year goals
      if (isNonTech) {
        personalizedText = `Looking ahead at your career trajectory in ${displayDept}, where do you see yourself in five years, both in terms of domain expertise and leadership or project responsibilities?`;
      } else {
        personalizedText = `Looking ahead at your career trajectory in ${displayDept}, where do you see yourself in five years, both in terms of technical depth and leadership or project responsibilities?`;
      }
    } else if (def.index === 5) {
      // Question 6: Challenges & problem-solving
      if (isNonTech) {
        personalizedText = `In any project or professional setting, unexpected challenges arise. Tell me about a significant challenge you encountered—perhaps during your work on "${projectTitle}" or during coursework—and walk me through how you analyzed the situation, what action you personally took, and the final result.`;
      } else {
        personalizedText = `Engineering projects rarely go completely smoothly. Tell me about a significant challenge you encountered—perhaps during your work on "${projectTitle}" or during coursework—and walk me through how you analyzed the situation, what action you personally took, and the final result.`;
      }
    } else if (def.index === 6) {
      // Question 7: Candidate questions
      if (company) {
        personalizedText = `We have covered a great deal about your background today, ${candidateName}. Now, the floor is yours: Do you have any questions for me about ${company}, our team, our culture, or learning opportunities?`;
      } else {
        personalizedText = `We have covered a great deal about your background today, ${candidateName}. Now, the floor is yours: Do you have any questions for me regarding our team, mentorship, work culture, or what day-to-day life looks like here?`;
      }
    }

    const datasetQuestion: HRDatasetQuestion = {
      id: `hr_seven_${def.index + 1}_${def.areaKey}`,
      category: def.category,
      categoryDisplayName: def.progressTitle,
      question: personalizedText,
      difficulty: difficulty,
      style: 'Professional',
      expectedConcepts: def.expectedConcepts,
      keywords: def.keywords,
      rubric: {
        relevanceWeight: 0.35,
        completenessWeight: 0.25,
        clarityWeight: 0.20,
        evidenceWeight: 0.20,
      },
      exampleStrongAnswer: def.exampleStrongAnswer,
      exampleWeakAnswer: def.exampleWeakAnswer,
      followUpTemplates: [
        `Could you elaborate further on how you handled that specific scenario in your project?`,
        `What were the key technical lessons you took away from that experience?`
      ],
      starFrameworkApplicable: def.starFrameworkApplicable,
      isResumeAware: true,
    };

    return {
      question: datasetQuestion,
      personalizedText,
      progressTitle: def.progressTitle,
      shortTitle: def.shortTitle,
    };
  });
}

/**
 * Evaluates candidate answer satisfaction using content, relevance, completeness,
 * and specific examples. Triggers intelligent follow-ups when incomplete,
 * strictly capped at 2 follow-ups per main question.
 */
export function evaluateHRSatisfaction(
  questionDef: HRSevenQuestionDef,
  candidateAnswerText: string,
  currentFollowUpCount: number,
  parsedResume: ParsedResume | null,
  targetCompany?: string
): HRSatisfactionEvaluation {
  const clean = candidateAnswerText.trim();
  const words = clean.length > 0 ? clean.split(/\s+/).filter(Boolean) : [];
  const wordCount = words.length;
  const lower = clean.toLowerCase();
  const MAX_FOLLOW_UPS = 2;

  const candidateName = parsedResume?.fullName ? parsedResume.fullName.split(' ')[0] : 'there';
  const dept = normalizeDepartment(parsedResume?.department);
  const primaryProject = parsedResume?.projects?.[0];
  const projectTitle = primaryProject?.title || 'your engineering project';
  const projectTech = primaryProject?.technologies?.slice(0, 2).join(' and ') || 'your technical tools';
  const company = targetCompany && targetCompany.trim() && targetCompany.trim().toLowerCase() !== 'general' && targetCompany.trim().toLowerCase() !== 'general / any company'
    ? targetCompany.trim()
    : null;

  // Detect candidate background for tailored questions & follow-ups
  const candidateClassification = parsedResume?.classification;
  const isCommerce = /commerce|b\.?com|accounting|finance/i.test(dept) || /commerce|b\.?com|accounting|finance/i.test(candidateClassification?.discipline || '');
  const isAnalytics = /analytics|intelligence/i.test(dept) || /analytics|intelligence/i.test(candidateClassification?.discipline || '');
  const isArts = /arts|humanities|english/i.test(dept) || /arts|humanities|english/i.test(candidateClassification?.discipline || '');
  const isExperiencedCandidate = candidateClassification?.track === 'experienced' ||
    (parsedResume?.employmentHistory && parsedResume.employmentHistory.length > 0);
  const isNonTech = candidateClassification?.educationalCategory === 'non_technical' ||
    parsedResume?.userSelectedCategory === 'non_technical' ||
    candidateClassification?.userSelectedCategory === 'non_technical' ||
    candidateClassification?.isTechnical === false ||
    isCommerce || isAnalytics || isArts ||
    /(commerce|b\.?com|bba|mba|business|management|finance|accounting|marketing|human resource|hr|arts|humanities|english|customer service|customer support)/i.test(dept);

  let displayDept = dept;
  if (isNonTech && (/engineering|computer science|general studies/i.test(dept) || dept === 'General Engineering')) {
    displayDept = candidateClassification?.discipline && !/engineering|computer science/i.test(candidateClassification.discipline)
      ? candidateClassification.discipline
      : 'Commerce';
  }

  // Question 7 has unique satisfaction: candidate questions
  if (questionDef.index === 6) {
    const isNoQuestion = /\b(no|nope|don'?t have|no questions?|none|nothing|all clear|everything is clear|covered everything|good for now)\b/i.test(lower);
    if (isNoQuestion || wordCount < 5) {
      return {
        isSatisfied: true,
        score: 85,
        relevanceScore: 90,
        completenessScore: 85,
        clarityScore: 90,
        missingElements: [],
        acknowledgmentSpeech: `Thank you, ${candidateName}. That brings us to the conclusion of our interview today.`,
        isMaxFollowUpsReached: true,
        satisfactionReason: 'Candidate concluded questions politely.'
      };
    } else {
      // Candidate asked an authentic question!
      const candidateQResp = handleCandidateQuestionInteraction(clean, company || undefined, isNonTech);
      return {
        isSatisfied: currentFollowUpCount >= 1, // Satisfied after AI answers their question!
        score: 92,
        relevanceScore: 95,
        completenessScore: 90,
        clarityScore: 90,
        missingElements: [],
        followUpQuestion: candidateQResp.isConcluding ? undefined : candidateQResp.followUpPrompt,
        acknowledgmentSpeech: candidateQResp.aiAnswer,
        isMaxFollowUpsReached: currentFollowUpCount >= 1,
        satisfactionReason: 'Candidate asked a thoughtful interview question.'
      };
    }
  }

  // If follow-up limit already reached, enforce satisfaction and advance politely
  if (currentFollowUpCount >= MAX_FOLLOW_UPS) {
    return {
      isSatisfied: true,
      score: Math.min(80, Math.max(45, Math.round(wordCount * 1.2))),
      relevanceScore: 70,
      completenessScore: 65,
      clarityScore: 70,
      missingElements: ['Maximum follow-up question limit reached for this topic.'],
      acknowledgmentSpeech: `Thank you for sharing those additional details, ${candidateName}. Let's move ahead to the next question.`,
      isMaxFollowUpsReached: true,
      satisfactionReason: 'Follow-up threshold reached; continuing smoothly to next topic.'
    };
  }

  // Detect specific missing elements and generate intelligent follow-ups per question area
  const missingElements: string[] = [];
  let followUpQuestion: string | undefined = undefined;
  let isSatisfied = true;
  let satisfactionReason = 'Answer provides clear, relevant, and sufficiently detailed evidence.';

  // Question 1: Tell me about yourself
  if (questionDef.index === 0) {
    const hasProjectMention = /\b(project|built|developed|designed|implemented|capstone|created|architected|researched|analyzed|accounting|audit|campaign)\b/i.test(lower);
    const hasSkillMention = /\b(python|java|react|node|c\+\+|sql|autocad|matlab|embedded|circuits|algorithm|framework|tools?|excel|tally|power bi|tableau|seo|marketing|writing|finance)\b/i.test(lower);

    if (wordCount < 25 || (!hasProjectMention && !hasSkillMention)) {
      isSatisfied = false;
      if (!hasProjectMention) missingElements.push('Concrete project experience, coursework highlights, or practical contributions');
      if (!hasSkillMention) missingElements.push('Specific tools, domain competencies, or professional skills');

      if (currentFollowUpCount === 0) {
        if (isCommerce) {
          followUpQuestion = `You mentioned accounting and commerce skills in your resume, ${candidateName}. How have you applied those accounting or financial skills in real projects or practical casework?`;
        } else if (isAnalytics) {
          followUpQuestion = `Tell me about a specific project where you used data to solve a problem—and how would you explain your findings to a manager?`;
        } else if (isArts) {
          followUpQuestion = `What specific critical thinking, research, or communication skills from your education will help you make an impact in the workplace?`;
        } else if (isExperiencedCandidate) {
          followUpQuestion = `Could you walk me through the key responsibilities you handled in your previous role, and what professional achievement you are most proud of?`;
        } else if (isNonTech) {
          followUpQuestion = `That is a good start, ${candidateName}. Could you share more about one specific project, case study, or practical assignment you worked on, and what your individual contribution was?`;
        } else {
          followUpQuestion = `That's a good start, ${candidateName}. Could you also tell me about one specific project you have worked on—perhaps your work on "${projectTitle}" or using ${projectTech}—and what your personal individual contribution was?`;
        }
      } else {
        if (isNonTech) {
          followUpQuestion = `Thank you. Could you also highlight two or three of your core professional skills in ${dept}, and how you enjoy applying them to solve business or analytical challenges?`;
        } else {
          followUpQuestion = `Thank you. Could you also highlight two or three of your core technical skills, and how you enjoy applying them to solve practical engineering problems?`;
        }
      }
      satisfactionReason = 'Introduction lacks project specifics or core skill evidence.';
    }
  }

  // Question 2: Why should we hire you?
  else if (questionDef.index === 1) {
    const hasConcreteReason = /\b(experience|skills?|project|ownership|solve|problem|deliver|learn|adapt|passion|value|analytical|finance|accounting|market|insights)\b/i.test(lower);
    const isTooBrief = wordCount < 28;

    if (isTooBrief || !hasConcreteReason) {
      isSatisfied = false;
      missingElements.push('Concrete evidence differentiating candidate from others');
      if (currentFollowUpCount === 0) {
        if (isCommerce) {
          followUpQuestion = `What specifically interests you about working in corporate business, finance, or commercial operations, and how will your accounting background help our team?`;
        } else if (isAnalytics) {
          followUpQuestion = `How do your practical experiences in Business Analytics help you translate raw metrics into strategic decisions for business leaders?`;
        } else if (isExperiencedCandidate) {
          followUpQuestion = `What motivated you to look for a new career opportunity at this stage, and what proven value from your past experience will you bring?`;
        } else if (isNonTech) {
          followUpQuestion = `Could you connect your strengths to a concrete skill or project from your background that proves your readiness to contribute to our organizational goals?`;
        } else {
          followUpQuestion = `Could you connect your strengths to a concrete technical skill or project from your background that proves your readiness to contribute to our engineering goals?`;
        }
      } else {
        if (isNonTech) {
          followUpQuestion = `How do your practical experiences in ${dept} help you handle tight delivery deadlines or cross-functional team expectations?`;
        } else {
          followUpQuestion = `How do your practical experiences in ${dept} help you handle tight delivery deadlines or unfamiliar technical tools?`;
        }
      }
      satisfactionReason = 'Response was overly brief or lacked practical value proof.';
    }
  }

  // Question 3: Strengths and weaknesses
  else if (questionDef.index === 2) {
    const hasWeakness = /\b(weakness|improve|improving|challenge|struggle|work on|development area|habit|overcome|steps|adopting)\b/i.test(lower);
    const hasStrength = /\b(strength|good at|excel|strong|analytical|debugging|organized|communication|problem solving)\b/i.test(lower);

    if (wordCount < 25 || !hasWeakness) {
      isSatisfied = false;
      if (!hasWeakness) missingElements.push('Genuine area for improvement with proactive remediation steps');
      if (currentFollowUpCount === 0) {
        followUpQuestion = `You touched on your strengths, but could you also share one genuine weakness or development area you have identified, and the specific steps you are taking to overcome it?`;
      } else {
        followUpQuestion = `Can you share a specific situation where that challenge surfaced in your work, and how you managed it?`;
      }
      satisfactionReason = 'Candidate omitted a genuine weakness or corrective action.';
    }
  }

  // Question 4: Company interest
  else if (questionDef.index === 3) {
    const hasCompanyOrCulture = /\b(culture|mission|product|technology|scale|team|values|reputation|learning|architecture|engineering)\b/i.test(lower);

    if (wordCount < 24 || !hasCompanyOrCulture) {
      isSatisfied = false;
      missingElements.push('Specific alignment with organizational values, engineering culture, or products');
      if (company) {
        followUpQuestion = `What specific products, engineering practices, or learning opportunities at ${company} align most closely with your career ambitions?`;
      } else {
        followUpQuestion = `What specific engineering practices, collaboration styles, or learning environments do you look for most in a team?`;
      }
      satisfactionReason = 'Answer lacked specific motivation regarding engineering culture or work environment.';
    }
  }

  // Question 5: Five-year goals
  else if (questionDef.index === 4) {
    const hasTrajectory = /\b(lead|senior|architect|mentor|master|specialize|technical|contribute|deepen|growth|responsibility)\b/i.test(lower);

    if (wordCount < 24 || !hasTrajectory) {
      isSatisfied = false;
      missingElements.push('Structured technical learning milestones or progression pathway');
      if (currentFollowUpCount === 0) {
        followUpQuestion = `What specific technical milestones or domain specializations in ${dept} do you plan to master on your way to achieving that five-year vision?`;
      } else {
        followUpQuestion = `How do you plan to continuously update your skills and handle emerging technologies as industry standards evolve?`;
      }
      satisfactionReason = 'Five-year vision was too generic or lacked technical progression milestones.';
    }
  }

  // Question 6: Challenges & problem-solving (STAR)
  else if (questionDef.index === 5) {
    const hasAction = /\b(i (did|took|wrote|investigated|profiled|refactored|fixed|coordinated|implemented|researched|decided))\b/i.test(lower);
    const hasResult = /\b(result|outcome|improved|reduced|resolved|completed|learned|succeeded|percent|%|award)\b/i.test(lower);

    if (wordCount < 30 || (!hasAction && !hasResult)) {
      isSatisfied = false;
      if (!hasAction) missingElements.push('Specific personal actions taken (STAR Action)');
      if (!hasResult) missingElements.push('Measurable result, outcome, or lesson learned (STAR Result)');

      if (currentFollowUpCount === 0) {
        followUpQuestion = isNonTech
          ? `Could you explain what the actual workplace, project, or teamwork challenge was, what action you personally took, and what the final outcome was?`
          : `Could you explain what the actual technical or teamwork challenge was, what action you personally took, and what the final outcome was?`;
      } else {
        followUpQuestion = isNonTech
          ? `What was the key takeaway or measurable impact of that experience that shaped how you approach professional challenges and teamwork today?`
          : `What was the key takeaway or measurable impact of that experience that shaped how you approach engineering obstacles today?`;
      }
      satisfactionReason = 'Response lacks complete STAR breakdown (missing personal action or measurable result).';
    }
  }

  // Calculate scores
  const completenessScore = isSatisfied ? 85 : Math.max(35, Math.min(65, wordCount * 2));
  const relevanceScore = isSatisfied ? 88 : Math.max(40, Math.min(70, wordCount * 2 + 10));
  const clarityScore = Math.max(50, Math.min(92, wordCount > 20 ? 80 : 55));
  const score = Math.round(relevanceScore * 0.4 + completenessScore * 0.35 + clarityScore * 0.25);

  // Natural acknowledgment speech when moving forward
  const ACKNOWLEDGMENTS = [
    `Thank you, ${candidateName}. That gives me a clear and well-rounded perspective. Let's move on to the next question.`,
    `Thank you for providing that detail. That helps me understand your background much better. Let's proceed to the next question.`,
    `I appreciate that thoughtful explanation, ${candidateName}. Let's move ahead to our next topic.`,
    isNonTech
      ? `Thank you. That gives me a clear insight into your professional and practical approach. Let's continue to the next question.`
      : `Thank you. That gives me a clear insight into your engineering mindset. Let's continue to the next question.`
  ];
  const acknowledgmentSpeech = ACKNOWLEDGMENTS[questionDef.index % ACKNOWLEDGMENTS.length];

  return {
    isSatisfied,
    score,
    relevanceScore,
    completenessScore,
    clarityScore,
    missingElements,
    followUpQuestion,
    acknowledgmentSpeech,
    isMaxFollowUpsReached: false,
    satisfactionReason,
  };
}

/**
 * Handles Question 7 candidate questions by classifying topic and providing
 * realistic, authentic company-style answers.
 */
export function handleCandidateQuestionInteraction(
  candidateInput: string,
  targetCompany?: string,
  isNonTech?: boolean
): CandidateQuestionResponse {
  const lower = candidateInput.toLowerCase();
  const defaultOrg = isNonTech ? 'our organization' : 'our engineering organization';
  const company = targetCompany || defaultOrg;

  // 0. No questions / Polite wrap up
  if (/\b(no|none|nothing|don't have|dont have|no questions?|all clear|covered everything|not at the moment|not really)\b/i.test(lower)) {
    return {
      category: 'none',
      detectedIntent: 'No Questions (Polite Wrap-up)',
      aiAnswer: isNonTech
        ? `That is completely fine! We have covered a great deal of ground today. Thank you for your thoughtful participation and for walking me through your background and journey.`
        : `That is completely fine! We have covered a great deal of ground today. Thank you for your thoughtful participation and for walking me through your engineering journey.`,
      followUpPrompt: '',
      isConcluding: true
    };
  }

  // 1. Mentorship / Onboarding / Training
  if (/\b(mentor|mentorship|training|onboard|ramp up|learn|guidance|junior|support)\b/i.test(lower)) {
    return {
      category: 'mentorship',
      detectedIntent: 'Mentorship and Onboarding',
      aiAnswer: isNonTech
        ? `That is an excellent question. In ${company}, we place a high priority on early-career development. Every new team member is paired with a dedicated senior mentor for their first six months, attends structured onboarding sessions, and participates in regular knowledge-sharing forums. We believe people learn best through psychological safety, constructive feedback, and hands-on guidance.`
        : `That is an excellent question. In ${company}, we place a high priority on early-career development. Every new engineer is paired with a dedicated senior mentor for their first six months, attends structured technical deep-dives, and participates in weekly knowledge-sharing sessions. We believe engineers learn best through psychological safety, peer code reviews, and hands-on guidance.`,
      followUpPrompt: `Did that give you a clear sense of our mentorship culture, or is there any other aspect of the team you would like to know about?`,
      isConcluding: false
    };
  }

  // 2. Tech stack / Architecture / Operational Tools & Systems
  if (/\b(tech stack|technolog(y|ies)|architecture|tools?|code review|ci\/cd|pipeline|frameworks?|deploy|scale|microservices?|databases?|engineering practices?|stack|software|systems)\b/i.test(lower)) {
    return {
      category: 'tech_stack',
      detectedIntent: isNonTech ? 'Operational Tools & Systems' : 'Technology Stack & Engineering Rigor',
      aiAnswer: isNonTech
        ? `Great question. Our teams utilize modern business applications, cloud-based productivity suites, and robust enterprise tools to streamline workflows and deliver quality outcomes. We continuously evaluate new tools, encourage process improvement, and prioritize accuracy, collaboration, and high operational standards.`
        : `Great question. Our teams utilize modern, high-availability architecture with containerized microservices, comprehensive automated CI/CD pipelines, and rigorous peer code reviews. We continuously evaluate new tools, encourage proof-of-concept experimentation, and prioritize writing clean, maintainable, and well-tested code.`,
      followUpPrompt: isNonTech
        ? `Does that sound like the kind of professional environment you are excited to contribute to, or did you have a specific systems question?`
        : `Does that sound like the kind of technical environment you are excited to build in, or did you have a specific technology question?`,
      isConcluding: false
    };
  }

  // 3. Culture / Work-life balance / Collaboration
  if (/\b(culture|work[- ]?life|collaborat|team|environment|flexib|values|atmosphere)\b/i.test(lower)) {
    return {
      category: 'culture',
      detectedIntent: 'Team Culture & Work Environment',
      aiAnswer: isNonTech
        ? `I really appreciate you asking that. Our culture centers on transparency, mutual respect, and collaborative problem-solving. When unexpected operational challenges arise, teams rally together to solve them constructively rather than pointing fingers. We also champion a sustainable work-life balance because we know rested, supported colleagues deliver the best work.`
        : `I really appreciate you asking that. Our culture centers on transparency, mutual respect, and blameless post-mortems. When technical challenges arise, teams rally together to solve them rather than pointing fingers. We also champion a sustainable work-life balance because we know rested, supported engineers write the best systems.`,
      followUpPrompt: `Does that align with what you look for in a team culture, or do you have any other questions before we wrap up?`,
      isConcluding: false
    };
  }

  // 4. Growth / Career progression / Promotion
  if (/\b(growth|promotion|career|advance|trajectory|ladder|next level|pathway)\b/i.test(lower)) {
    return {
      category: 'growth',
      detectedIntent: 'Career Progression & Growth Ladders',
      aiAnswer: isNonTech
        ? `We operate structured career pathways—allowing professionals to progress either along a specialized domain track or into team leadership and management. We hold transparent biannual performance conversations and quarterly growth check-ins so you always know what milestones to achieve for your next career step.`
        : `We operate dual career pathways—allowing engineers to progress either along a deep technical specialist track or into engineering leadership. We hold transparent biannual performance conversations and quarterly growth check-ins so you always know what milestones to achieve for your next career step.`,
      followUpPrompt: `Does that provide clarity on our career development framework, or do you have any final questions?`,
      isConcluding: false
    };
  }

  // 5. Default authentic response for general inquiries
  return {
    category: 'general',
    detectedIntent: 'General Company & Role Inquiries',
    aiAnswer: isNonTech
      ? `Thank you for asking that thoughtful question. In ${company}, we strive to create an inclusive culture where early-career professionals have immediate project ownership, close mentorship, and the freedom to propose improvements. We look for curiosity and dedication, and we invest heavily in helping you succeed from day one.`
      : `Thank you for asking that thoughtful question. In ${company}, we strive to create an engineering culture where early-career engineers have immediate project ownership, close mentorship, and the freedom to propose solutions. We look for curiosity and dedication, and we invest heavily in helping you succeed from day one.`,
    followUpPrompt: `Does that address what you had in mind, or is there anything else you would like to ask before we wrap up?`,
    isConcluding: false
  };
}

/**
 * Returns the professional interview closing statement spoken by the AI recruiter
 */
export function getInterviewClosingStatement(candidateName?: string, targetCompany?: string): string {
  const name = candidateName ? ` ${candidateName}` : '';
  const companyMention = targetCompany && targetCompany.toLowerCase() !== 'general' ? ` at ${targetCompany}` : '';
  return `Thank you${name} for participating in today's interview${companyMention}. I appreciate your time, honesty, and the detailed answers you shared across all our topics. Your HR interview is now officially complete. You can review your comprehensive scorecard, communication metrics, and personalized feedback below.`;
}
