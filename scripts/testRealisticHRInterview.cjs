// src/nlp/hr/hrSevenQuestionEngine.ts
var SEVEN_MAIN_HR_QUESTIONS = [
  {
    index: 0,
    areaKey: "self_introduction",
    category: "self_introduction",
    progressTitle: "Question 1 of 7 \u2014 Introduction",
    shortTitle: "Introduction",
    baseQuestion: "Could you please tell me about yourself\u2014including your education, technical background, key projects, skills, and what excites you most in your engineering journey?",
    expectedConcepts: [
      "Academic background and engineering department",
      "Technical skills and proficiencies",
      "Key practical projects or achievements",
      "Career interests and engineering passion"
    ],
    keywords: ["engineering", "degree", "projects", "skills", "experience", "interests", "technologies", "developed", "built", "background"],
    starFrameworkApplicable: false,
    evaluationFocus: "Clarity of self-presentation, relevance of technical skills, articulation of projects, and professional enthusiasm.",
    exampleStrongAnswer: "I am a final-year engineering student with a strong passion for designing scalable software and solving practical problems. Throughout my studies in Computer Science, I have developed solid proficiency in Python, React, and SQL. A highlight of my journey has been architecting an end-to-end task management application where I engineered asynchronous queueing and responsive UI workflows. Outside the classroom, I actively participate in hackathons and open-source discussions, which has strengthened both my technical execution and collaborative teamwork.",
    exampleWeakAnswer: "I am a Computer Science student. I know Python."
  },
  {
    index: 1,
    areaKey: "why_hire_you",
    category: "why_hire_you",
    progressTitle: "Question 2 of 7 \u2014 Why should we hire you?",
    shortTitle: "Why should we hire you?",
    baseQuestion: "Why should we hire you? What unique blend of technical skills, project experience, and problem-solving mindset do you bring to our opportunity?",
    expectedConcepts: [
      "Technical capabilities matched to real-world execution",
      "Demonstrated project ownership or internship experience",
      "Strong problem-solving grit and adaptability",
      "Team collaboration and eagerness to learn"
    ],
    keywords: ["hire", "skills", "projects", "ownership", "value", "contribute", "learn", "problem solving", "results", "experience"],
    starFrameworkApplicable: false,
    evaluationFocus: "Value proposition, concrete practical evidence, alignment with role requirements, and self-assurance.",
    exampleStrongAnswer: "You should hire me because I offer a strong foundation in core engineering principles combined with practical, hands-on experience taking projects from concept to deployment. In my project work, I did not just implement assigned features\u2014I proactively optimized database queries and resolved edge-case bottlenecks. I learn new technologies rapidly, communicate transparently with peers, and take genuine pride in writing clean, reliable code that drives business value.",
    exampleWeakAnswer: "You should hire me because I am a hard worker and I need a job."
  },
  {
    index: 2,
    areaKey: "strengths_weaknesses",
    category: "strengths_weaknesses",
    progressTitle: "Question 3 of 7 \u2014 Strengths and weaknesses",
    shortTitle: "Strengths and weaknesses",
    baseQuestion: "What are your greatest strengths, and what is one genuine weakness or area for improvement you have identified and are actively working to overcome?",
    expectedConcepts: [
      "Identifiable genuine strength with practical context",
      "Honest, non-clich\xE9 area of weakness",
      "Active corrective steps and progress made",
      "Self-awareness and growth mindset"
    ],
    keywords: ["strength", "weakness", "improvement", "learning", "habits", "active", "progress", "discipline", "feedback", "overcome"],
    starFrameworkApplicable: false,
    evaluationFocus: "Self-awareness, honesty, actionable improvement strategies, and emotional maturity.",
    exampleStrongAnswer: "My greatest strength is my methodical approach to root-cause debugging\u2014when faced with unexpected system failures, I break down issues through logging and reproduction steps rather than guessing. A genuine weakness I identified earlier was a tendency to take on too many tasks individually rather than delegating early. To address this, I have adopted agile Kanban tracking and initiated proactive 5-minute stand-ups with teammates, which has significantly improved our team velocity and my own workload balance.",
    exampleWeakAnswer: "My weakness is that I work too hard and am a perfectionist. My strength is that I know everything."
  },
  {
    index: 3,
    areaKey: "company_interest",
    category: "motivation_company_fit",
    progressTitle: "Question 4 of 7 \u2014 Company interest",
    shortTitle: "Company interest",
    baseQuestion: "Why do you want to join our company, and what specifically attracts you to our engineering culture, mission, and work environment?",
    expectedConcepts: [
      "Knowledge of company mission, products, or technology stack",
      "Connection between personal career goals and company culture",
      "Enthusiasm for engineering excellence and collaborative learning",
      "Value alignment with the organization"
    ],
    keywords: ["company", "mission", "culture", "products", "technology", "scale", "learning", "values", "attracts", "motivated"],
    starFrameworkApplicable: false,
    evaluationFocus: "Genuine motivation, research and understanding of organizational values, and alignment of career vision.",
    exampleStrongAnswer: "I want to join your organization because of your reputation for engineering rigor, transparent peer reviews, and user-centric innovation. I have followed how your teams architect resilient systems that scale gracefully. As someone who thrives in an environment that values continuous learning and proactive initiative, being part of a team that tackles challenging technical problems while upholding high engineering standards is the ideal place for me to contribute and grow.",
    exampleWeakAnswer: "I want to join because your company is famous and has good packages."
  },
  {
    index: 4,
    areaKey: "five_year_goals",
    category: "career_goals",
    progressTitle: "Question 5 of 7 \u2014 Five-year goals",
    shortTitle: "Five-year goals",
    baseQuestion: "Where do you see yourself professionally in five years, both in terms of technical mastery and broader responsibilities?",
    expectedConcepts: [
      "Realistic short-to-medium term technical trajectory",
      "Deep domain mastery in chosen engineering specialisation",
      "Evolution into architectural ownership or team mentoring",
      "Commitment to continuous learning and industry adaptation"
    ],
    keywords: ["five years", "goals", "growth", "mastery", "lead", "mentor", "architecture", "responsibilities", "technical", "impact"],
    starFrameworkApplicable: false,
    evaluationFocus: "Career planning, ambition balanced with realism, continuous professional development, and loyalty.",
    exampleStrongAnswer: "Over the next two years, my focus is on becoming a go-to technical contributor by delivering robust production features and mastering our system architecture. By year five, I see myself stepping into a technical lead or senior engineering role\u2014taking ownership of large architectural decisions, mentoring incoming engineers, and driving cross-functional milestones that create tangible business impact. I want to build a reputation as a dependable problem solver who elevates the entire team.",
    exampleWeakAnswer: "In five years I just want to become a manager and stop doing technical work."
  },
  {
    index: 5,
    areaKey: "challenges_problem_solving",
    category: "leadership_problem_solving",
    progressTitle: "Question 6 of 7 \u2014 Challenges and problem-solving",
    shortTitle: "Challenges and problem-solving",
    baseQuestion: "Engineering projects often encounter unexpected obstacles. Tell me about a significant challenge you faced\u2014technical, deadline, or teamwork\u2014and walk me through how you handled it.",
    expectedConcepts: [
      "Situation & specific challenge context",
      "Personal responsibility and task",
      "Action: Concrete methodology and steps taken",
      "Result: Quantifiable outcome, resolution, and lesson learned (STAR)"
    ],
    keywords: ["challenge", "obstacle", "problem", "situation", "action", "result", "resolved", "outcome", "learned", "team"],
    starFrameworkApplicable: true,
    evaluationFocus: "STAR framework compliance, individual ownership, analytical problem solving, resilience, and actionable learnings.",
    exampleStrongAnswer: "During our semester capstone project, our backend service crashed during concurrent load testing two days before the submission deadline. As the person responsible for the API layer, I immediately set up isolated request profiling to identify the bottleneck. I discovered redundant synchronous database queries blocking the connection pool. I refactored the query logic into batch lookups and introduced lightweight caching for hot endpoints. As a result, response times improved by 65%, the system handled 500 concurrent users without error, and our project received the highest distinction in our department.",
    exampleWeakAnswer: "I faced a problem in my project. It was very hard but we finished it."
  },
  {
    index: 6,
    areaKey: "candidate_questions",
    category: "candidate_questions",
    progressTitle: "Question 7 of 7 \u2014 Questions for the interviewer",
    shortTitle: "Questions for the interviewer",
    baseQuestion: "We have explored your background thoroughly. Now, the floor is yours: Do you have any questions for me regarding our engineering team, culture, work environment, or learning opportunities?",
    expectedConcepts: [
      "Thoughtful curiosity about engineering culture and team dynamics",
      "Questions regarding mentorship, onboarding, or technical challenges",
      "Professional demeanor and active engagement",
      "Or polite professional closing if no questions"
    ],
    keywords: ["questions", "team", "culture", "mentorship", "learning", "technology", "environment", "growth", "expectations", "role"],
    starFrameworkApplicable: false,
    evaluationFocus: "Engagement, intellectual curiosity, interest in company environment, and professional closing etiquette.",
    exampleStrongAnswer: "Could you tell me what the onboarding and mentorship process looks like for early-career engineers during their first 90 days, and what opportunities there are for cross-team technical collaboration?",
    exampleWeakAnswer: "No, nothing."
  }
];
function normalizeDepartment(dept) {
  if (!dept) return "Professional Studies";
  const d = dept.toLowerCase();
  if (d.includes("commerce") || d.includes("b.com") || d.includes("accounting") || d.includes("tally")) return "Commerce & Accounting";
  if (d.includes("business analytics") || d.includes("analytics") || d.includes("business intelligence")) return "Business Analytics";
  if (d.includes("bba") || d.includes("business admin") || d.includes("bms")) return "Business Administration";
  if (d.includes("mba") || d.includes("management") || d.includes("pgdm")) return "Management";
  if (d.includes("finance")) return "Finance & Accounting";
  if (d.includes("marketing") || d.includes("sales")) return "Marketing";
  if (d.includes("human resource") || d.includes("hr")) return "Human Resources";
  if (d.includes("arts") || d.includes("humanities") || d.includes("english") || d.includes("literature")) return "Arts & Humanities";
  if (d.includes("computer") || d.includes("cse") || d.includes("software")) return "Computer Science & Engineering";
  if (d.includes("information") || d.includes(" it") || d === "it") return "Information Technology";
  if (d.includes("electron") || d.includes("ece") || d.includes("telecom") || d.includes("communication")) return "Electronics & Communication Engineering";
  if (d.includes("electr") || d.includes("eee")) return "Electrical & Electronics Engineering";
  if (d.includes("mech")) return "Mechanical Engineering";
  if (d.includes("civil") || d.includes("structur")) return "Civil Engineering";
  if (d.includes("auto") || d.includes("motor")) return "Automobile Engineering";
  return dept;
}
function generateSevenMainHRQuestions(parsedResume, targetCompany, difficulty = "Intermediate") {
  const candidateName = parsedResume?.fullName ? parsedResume.fullName.split(" ")[0] : "Candidate";
  const fullName = parsedResume?.fullName || candidateName;
  const dept = normalizeDepartment(parsedResume?.department);
  const college = parsedResume?.education?.[0]?.college || parsedResume?.education?.[0]?.institution || "your university";
  const gradYear = parsedResume?.education?.[0]?.graduationYear || "2024";
  const primaryProject = parsedResume?.projects?.[0];
  const candidateClassification = parsedResume?.classification;
  const isNonTech = candidateClassification?.educationalCategory === "non_technical" || /(commerce|b\.?com|bba|mba|business|management|finance|accounting|marketing|human resource|hr|arts|humanities|english)/i.test(dept);
  const isExperienced = candidateClassification?.track === "experienced" || parsedResume?.employmentHistory && parsedResume.employmentHistory.length > 0;
  const projectTitle = primaryProject?.title || (isNonTech ? "your primary project or practical assignment" : "your engineering capstone project");
  const projectTech = primaryProject?.technologies && primaryProject.technologies.length > 0 ? primaryProject.technologies.slice(0, 3).join(", ") : isNonTech ? "your core analytical tools" : "relevant engineering tools";
  const skillsList = parsedResume?.rawSkillsList && parsedResume.rawSkillsList.length > 0 ? parsedResume.rawSkillsList.slice(0, 4).join(", ") : isNonTech ? "your professional and analytical proficiencies" : "your technical competencies";
  const company = targetCompany && targetCompany.trim() && targetCompany.trim().toLowerCase() !== "general" && targetCompany.trim().toLowerCase() !== "general / any company" ? targetCompany.trim() : null;
  return SEVEN_MAIN_HR_QUESTIONS.map((def) => {
    let personalizedText = def.baseQuestion;
    if (def.index === 0) {
      if (isNonTech) {
        personalizedText = `Hello ${candidateName}, welcome to CareerCurve! To begin our interview today, could you please tell me about yourself\u2014walk me through your academic background in ${dept} at ${college}, your key professional skills, projects like ${projectTitle}, and what excites you most about your career journey?`;
      } else if (isExperienced) {
        personalizedText = `Hello ${candidateName}, welcome to CareerCurve! Could you please introduce yourself\u2014walk me through your professional background in ${dept}, your core skills, key workplace achievements, and what motivates you in your career?`;
      } else {
        personalizedText = `Hello ${candidateName}, welcome to CareerCurve! To begin our interview today, could you please tell me about yourself\u2014walk me through your academic background in ${dept} at ${college}, your key technical skills, projects like ${projectTitle}, and what excites you most about engineering?`;
      }
    } else if (def.index === 1) {
      if (company) {
        if (isNonTech) {
          personalizedText = `Thank you, ${candidateName}. With many candidates applying to ${company}, why should we hire you? How do your analytical skills in ${skillsList} and your hands-on background in ${dept} make you the right fit for our team?`;
        } else {
          personalizedText = `Thank you, ${candidateName}. With many candidates applying to ${company}, why should we hire you? How do your technical skills in ${skillsList} and your hands-on experience in ${dept} make you the right fit for our team?`;
        }
      } else {
        if (isNonTech) {
          personalizedText = `Thank you, ${candidateName}. Looking at the requirements for this position, why should we hire you? What unique blend of problem-solving mindset, practical skills, and domain experience in ${dept} sets you apart?`;
        } else {
          personalizedText = `Thank you, ${candidateName}. Looking at the requirements for this engineering role, why should we hire you? What unique blend of technical skills, problem-solving mindset, and project experience sets you apart?`;
        }
      }
    } else if (def.index === 2) {
      personalizedText = `Self-awareness and a willingness to grow are crucial for any successful professional. What would you say are your greatest strengths, and what is one genuine weakness you have identified and are actively working to improve?`;
    } else if (def.index === 3) {
      if (company) {
        personalizedText = `What specifically motivated you to apply to ${company}? What excites you about our culture, team values, and the impact our work has?`;
      } else {
        personalizedText = `When you think about an organization you want to build your career with, what attracts you most to a company's work culture, team values, and organizational mission?`;
      }
    } else if (def.index === 4) {
      if (isNonTech) {
        personalizedText = `Looking ahead at your career trajectory in ${dept}, where do you see yourself in five years, both in terms of domain expertise and leadership or project responsibilities?`;
      } else {
        personalizedText = `Looking ahead at your career trajectory in ${dept}, where do you see yourself in five years, both in terms of technical depth and leadership or project responsibilities?`;
      }
    } else if (def.index === 5) {
      if (isNonTech) {
        personalizedText = `In any project or professional setting, unexpected challenges arise. Tell me about a significant challenge you encountered\u2014perhaps during your work on "${projectTitle}" or during coursework\u2014and walk me through how you analyzed the situation, what action you personally took, and the final result.`;
      } else {
        personalizedText = `Engineering projects rarely go completely smoothly. Tell me about a significant challenge you encountered\u2014perhaps during your work on "${projectTitle}" or during coursework\u2014and walk me through how you analyzed the situation, what action you personally took, and the final result.`;
      }
    } else if (def.index === 6) {
      if (company) {
        personalizedText = `We have covered a great deal about your background today, ${candidateName}. Now, the floor is yours: Do you have any questions for me about ${company}, our team, our culture, or learning opportunities?`;
      } else {
        personalizedText = `We have covered a great deal about your background today, ${candidateName}. Now, the floor is yours: Do you have any questions for me regarding our team, mentorship, work culture, or what day-to-day life looks like here?`;
      }
    }
    const datasetQuestion = {
      id: `hr_seven_${def.index + 1}_${def.areaKey}`,
      category: def.category,
      categoryDisplayName: def.progressTitle,
      question: personalizedText,
      difficulty,
      style: "Professional",
      expectedConcepts: def.expectedConcepts,
      keywords: def.keywords,
      rubric: {
        relevanceWeight: 0.35,
        completenessWeight: 0.25,
        clarityWeight: 0.2,
        evidenceWeight: 0.2
      },
      exampleStrongAnswer: def.exampleStrongAnswer,
      exampleWeakAnswer: def.exampleWeakAnswer,
      followUpTemplates: [
        `Could you elaborate further on how you handled that specific scenario in your project?`,
        `What were the key technical lessons you took away from that experience?`
      ],
      starFrameworkApplicable: def.starFrameworkApplicable,
      isResumeAware: true
    };
    return {
      question: datasetQuestion,
      personalizedText,
      progressTitle: def.progressTitle,
      shortTitle: def.shortTitle
    };
  });
}
function evaluateHRSatisfaction(questionDef, candidateAnswerText, currentFollowUpCount, parsedResume, targetCompany) {
  const clean = candidateAnswerText.trim();
  const words = clean.length > 0 ? clean.split(/\s+/).filter(Boolean) : [];
  const wordCount = words.length;
  const lower = clean.toLowerCase();
  const MAX_FOLLOW_UPS = 2;
  const candidateName = parsedResume?.fullName ? parsedResume.fullName.split(" ")[0] : "there";
  const dept = normalizeDepartment(parsedResume?.department);
  const primaryProject = parsedResume?.projects?.[0];
  const projectTitle = primaryProject?.title || "your engineering project";
  const projectTech = primaryProject?.technologies?.slice(0, 2).join(" and ") || "your technical tools";
  const company = targetCompany && targetCompany.trim() && targetCompany.trim().toLowerCase() !== "general" && targetCompany.trim().toLowerCase() !== "general / any company" ? targetCompany.trim() : null;
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
        satisfactionReason: "Candidate concluded questions politely."
      };
    } else {
      const candidateQResp = handleCandidateQuestionInteraction(clean, company || void 0);
      return {
        isSatisfied: currentFollowUpCount >= 1,
        // Satisfied after AI answers their question!
        score: 92,
        relevanceScore: 95,
        completenessScore: 90,
        clarityScore: 90,
        missingElements: [],
        followUpQuestion: candidateQResp.isConcluding ? void 0 : candidateQResp.followUpPrompt,
        acknowledgmentSpeech: candidateQResp.aiAnswer,
        isMaxFollowUpsReached: currentFollowUpCount >= 1,
        satisfactionReason: "Candidate asked a thoughtful interview question."
      };
    }
  }
  if (currentFollowUpCount >= MAX_FOLLOW_UPS) {
    return {
      isSatisfied: true,
      score: Math.min(80, Math.max(45, Math.round(wordCount * 1.2))),
      relevanceScore: 70,
      completenessScore: 65,
      clarityScore: 70,
      missingElements: ["Maximum follow-up question limit reached for this topic."],
      acknowledgmentSpeech: `Thank you for sharing those additional details, ${candidateName}. Let's move ahead to the next question.`,
      isMaxFollowUpsReached: true,
      satisfactionReason: "Follow-up threshold reached; continuing smoothly to next topic."
    };
  }
  const missingElements = [];
  let followUpQuestion = void 0;
  let isSatisfied = true;
  let satisfactionReason = "Answer provides clear, relevant, and sufficiently detailed evidence.";
  const isCommerce = /commerce|b\.?com|accounting|finance/i.test(dept);
  const isAnalytics = /analytics|intelligence/i.test(dept);
  const isArts = /arts|humanities|english/i.test(dept);
  const isExperiencedCandidate = parsedResume?.classification?.track === "experienced" || parsedResume?.employmentHistory && parsedResume.employmentHistory.length > 0;
  const isNonTech = parsedResume?.classification?.educationalCategory === "non_technical" || isCommerce || isAnalytics || isArts;
  if (questionDef.index === 0) {
    const hasProjectMention = /\b(project|built|developed|designed|implemented|capstone|created|architected|researched|analyzed|accounting|audit|campaign)\b/i.test(lower);
    const hasSkillMention = /\b(python|java|react|node|c\+\+|sql|autocad|matlab|embedded|circuits|algorithm|framework|tools?|excel|tally|power bi|tableau|seo|marketing|writing|finance)\b/i.test(lower);
    if (wordCount < 25 || !hasProjectMention && !hasSkillMention) {
      isSatisfied = false;
      if (!hasProjectMention) missingElements.push("Concrete project experience, coursework highlights, or practical contributions");
      if (!hasSkillMention) missingElements.push("Specific tools, domain competencies, or professional skills");
      if (currentFollowUpCount === 0) {
        if (isCommerce) {
          followUpQuestion = `You mentioned accounting and commerce skills in your resume, ${candidateName}. How have you applied those accounting or financial skills in real projects or practical casework?`;
        } else if (isAnalytics) {
          followUpQuestion = `Tell me about a specific project where you used data to solve a problem\u2014and how would you explain your findings to a manager?`;
        } else if (isArts) {
          followUpQuestion = `What specific critical thinking, research, or communication skills from your education will help you make an impact in the workplace?`;
        } else if (isExperiencedCandidate) {
          followUpQuestion = `Could you walk me through the key responsibilities you handled in your previous role, and what professional achievement you are most proud of?`;
        } else if (isNonTech) {
          followUpQuestion = `That is a good start, ${candidateName}. Could you share more about one specific project, case study, or practical assignment you worked on, and what your individual contribution was?`;
        } else {
          followUpQuestion = `That's a good start, ${candidateName}. Could you also tell me about one specific project you have worked on\u2014perhaps your work on "${projectTitle}" or using ${projectTech}\u2014and what your personal individual contribution was?`;
        }
      } else {
        if (isNonTech) {
          followUpQuestion = `Thank you. Could you also highlight two or three of your core professional skills in ${dept}, and how you enjoy applying them to solve business or analytical challenges?`;
        } else {
          followUpQuestion = `Thank you. Could you also highlight two or three of your core technical skills, and how you enjoy applying them to solve practical engineering problems?`;
        }
      }
      satisfactionReason = "Introduction lacks project specifics or core skill evidence.";
    }
  } else if (questionDef.index === 1) {
    const hasConcreteReason = /\b(experience|skills?|project|ownership|solve|problem|deliver|learn|adapt|passion|value|analytical|finance|accounting|market|insights)\b/i.test(lower);
    const isTooBrief = wordCount < 28;
    if (isTooBrief || !hasConcreteReason) {
      isSatisfied = false;
      missingElements.push("Concrete evidence differentiating candidate from others");
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
      satisfactionReason = "Response was overly brief or lacked practical value proof.";
    }
  } else if (questionDef.index === 2) {
    const hasWeakness = /\b(weakness|improve|improving|challenge|struggle|work on|development area|habit|overcome|steps|adopting)\b/i.test(lower);
    const hasStrength = /\b(strength|good at|excel|strong|analytical|debugging|organized|communication|problem solving)\b/i.test(lower);
    if (wordCount < 25 || !hasWeakness) {
      isSatisfied = false;
      if (!hasWeakness) missingElements.push("Genuine area for improvement with proactive remediation steps");
      if (currentFollowUpCount === 0) {
        followUpQuestion = `You touched on your strengths, but could you also share one genuine weakness or development area you have identified, and the specific steps you are taking to overcome it?`;
      } else {
        followUpQuestion = `Can you share a specific situation where that challenge surfaced in your work, and how you managed it?`;
      }
      satisfactionReason = "Candidate omitted a genuine weakness or corrective action.";
    }
  } else if (questionDef.index === 3) {
    const hasCompanyOrCulture = /\b(culture|mission|product|technology|scale|team|values|reputation|learning|architecture|engineering)\b/i.test(lower);
    if (wordCount < 24 || !hasCompanyOrCulture) {
      isSatisfied = false;
      missingElements.push("Specific alignment with organizational values, engineering culture, or products");
      if (company) {
        followUpQuestion = `What specific products, engineering practices, or learning opportunities at ${company} align most closely with your career ambitions?`;
      } else {
        followUpQuestion = `What specific engineering practices, collaboration styles, or learning environments do you look for most in a team?`;
      }
      satisfactionReason = "Answer lacked specific motivation regarding engineering culture or work environment.";
    }
  } else if (questionDef.index === 4) {
    const hasTrajectory = /\b(lead|senior|architect|mentor|master|specialize|technical|contribute|deepen|growth|responsibility)\b/i.test(lower);
    if (wordCount < 24 || !hasTrajectory) {
      isSatisfied = false;
      missingElements.push("Structured technical learning milestones or progression pathway");
      if (currentFollowUpCount === 0) {
        followUpQuestion = `What specific technical milestones or domain specializations in ${dept} do you plan to master on your way to achieving that five-year vision?`;
      } else {
        followUpQuestion = `How do you plan to continuously update your skills and handle emerging technologies as industry standards evolve?`;
      }
      satisfactionReason = "Five-year vision was too generic or lacked technical progression milestones.";
    }
  } else if (questionDef.index === 5) {
    const hasAction = /\b(i (did|took|wrote|investigated|profiled|refactored|fixed|coordinated|implemented|researched|decided))\b/i.test(lower);
    const hasResult = /\b(result|outcome|improved|reduced|resolved|completed|learned|succeeded|percent|%|award)\b/i.test(lower);
    if (wordCount < 30 || !hasAction && !hasResult) {
      isSatisfied = false;
      if (!hasAction) missingElements.push("Specific personal actions taken (STAR Action)");
      if (!hasResult) missingElements.push("Measurable result, outcome, or lesson learned (STAR Result)");
      if (currentFollowUpCount === 0) {
        followUpQuestion = `Could you explain what the actual technical or teamwork challenge was, what action you personally took, and what the final outcome was?`;
      } else {
        followUpQuestion = `What was the key takeaway or measurable impact of that experience that shaped how you approach engineering obstacles today?`;
      }
      satisfactionReason = "Response lacks complete STAR breakdown (missing personal action or measurable result).";
    }
  }
  const completenessScore = isSatisfied ? 85 : Math.max(35, Math.min(65, wordCount * 2));
  const relevanceScore = isSatisfied ? 88 : Math.max(40, Math.min(70, wordCount * 2 + 10));
  const clarityScore = Math.max(50, Math.min(92, wordCount > 20 ? 80 : 55));
  const score = Math.round(relevanceScore * 0.4 + completenessScore * 0.35 + clarityScore * 0.25);
  const ACKNOWLEDGMENTS = [
    `Thank you, ${candidateName}. That gives me a clear and well-rounded perspective. Let's move on to the next question.`,
    `Thank you for providing that detail. That helps me understand your background much better. Let's proceed to the next question.`,
    `I appreciate that thoughtful explanation, ${candidateName}. Let's move ahead to our next topic.`,
    `Thank you. That gives me a clear insight into your engineering mindset. Let's continue to the next question.`
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
    satisfactionReason
  };
}
function handleCandidateQuestionInteraction(candidateInput, targetCompany) {
  const lower = candidateInput.toLowerCase();
  const company = targetCompany || "our engineering organization";
  if (/\b(no|none|nothing|don't have|dont have|no questions?|all clear|covered everything|not at the moment|not really)\b/i.test(lower)) {
    return {
      category: "none",
      detectedIntent: "No Questions (Polite Wrap-up)",
      aiAnswer: `That is completely fine! We have covered a great deal of ground today. Thank you for your thoughtful participation and for walking me through your engineering journey.`,
      followUpPrompt: "",
      isConcluding: true
    };
  }
  if (/\b(mentor|mentorship|training|onboard|ramp up|learn|guidance|junior|support)\b/i.test(lower)) {
    return {
      category: "mentorship",
      detectedIntent: "Mentorship and Onboarding",
      aiAnswer: `That is an excellent question. In ${company}, we place a high priority on early-career development. Every new engineer is paired with a dedicated senior mentor for their first six months, attends structured technical deep-dives, and participates in weekly knowledge-sharing sessions. We believe engineers learn best through psychological safety, peer code reviews, and hands-on guidance.`,
      followUpPrompt: `Did that give you a clear sense of our mentorship culture, or is there any other aspect of the team you would like to know about?`,
      isConcluding: false
    };
  }
  if (/\b(tech stack|technolog(y|ies)|architecture|tools?|code review|ci\/cd|pipeline|frameworks?|deploy|scale|microservices?|databases?|engineering practices?|stack)\b/i.test(lower)) {
    return {
      category: "tech_stack",
      detectedIntent: "Technology Stack & Engineering Rigor",
      aiAnswer: `Great question. Our teams utilize modern, high-availability architecture with containerized microservices, comprehensive automated CI/CD pipelines, and rigorous peer code reviews. We continuously evaluate new tools, encourage proof-of-concept experimentation, and prioritize writing clean, maintainable, and well-tested code.`,
      followUpPrompt: `Does that sound like the kind of technical environment you are excited to build in, or did you have a specific technology question?`,
      isConcluding: false
    };
  }
  if (/\b(culture|work[- ]?life|collaborat|team|environment|flexib|values|atmosphere)\b/i.test(lower)) {
    return {
      category: "culture",
      detectedIntent: "Team Culture & Work Environment",
      aiAnswer: `I really appreciate you asking that. Our culture centers on transparency, mutual respect, and blameless post-mortems. When technical challenges arise, teams rally together to solve them rather than pointing fingers. We also champion a sustainable work-life balance because we know rested, supported engineers write the best systems.`,
      followUpPrompt: `Does that align with what you look for in a team culture, or do you have any other questions before we wrap up?`,
      isConcluding: false
    };
  }
  if (/\b(growth|promotion|career|advance|trajectory|ladder|next level|pathway)\b/i.test(lower)) {
    return {
      category: "growth",
      detectedIntent: "Career Progression & Growth Ladders",
      aiAnswer: `We operate dual career pathways\u2014allowing engineers to progress either along a deep technical specialist track or into engineering leadership. We hold transparent biannual performance conversations and quarterly growth check-ins so you always know what milestones to achieve for your next career step.`,
      followUpPrompt: `Does that provide clarity on our career development framework, or do you have any final questions?`,
      isConcluding: false
    };
  }
  return {
    category: "general",
    detectedIntent: "General Company & Role Inquiries",
    aiAnswer: `Thank you for asking that thoughtful question. In ${company}, we strive to create an engineering culture where early-career engineers have immediate project ownership, close mentorship, and the freedom to propose solutions. We look for curiosity and dedication, and we invest heavily in helping you succeed from day one.`,
    followUpPrompt: `Does that address what you had in mind, or is there anything else you would like to ask before we wrap up?`,
    isConcluding: false
  };
}
function getInterviewClosingStatement(candidateName, targetCompany) {
  const name = candidateName ? ` ${candidateName}` : "";
  const companyMention = targetCompany && targetCompany.toLowerCase() !== "general" ? ` at ${targetCompany}` : "";
  return `Thank you${name} for participating in today's interview${companyMention}. I appreciate your time, honesty, and the detailed answers you shared across all our topics. Your HR interview is now officially complete. You can review your comprehensive scorecard, communication metrics, and personalized feedback below.`;
}

// src/nlp/hr/hrAnswerEvaluator.ts
var FILLER_WORDS = [
  "um",
  "uh",
  "er",
  "ah",
  "like",
  "actually",
  "basically",
  "you know",
  "sort of",
  "kind of",
  "literally",
  "honestly",
  "i mean"
];
var CONVERSATIONAL_SYNONYMS = {
  narrative: ["journey", "story", "background", "progression", "education", "path", "studies", "started", "overview"],
  chronological: ["started", "journey", "initially", "began", "college", "degree", "timeline", "path", "completed", "b.tech", "bachelor"],
  thematic: ["focused", "focus", "specialized", "area", "domain", "passionate", "interests", "aims"],
  milestones: ["milestone", "project", "projects", "achievements", "built", "developed", "work", "journey", "created"],
  trajectory: ["goal", "role", "career", "aim", "future", "aspirations", "direction", "looking", "opportunity", "team", "position"],
  internships: ["intern", "internship", "experience", "work", "project", "projects", "company", "industry", "responsibilities"],
  internship: ["intern", "internships", "experience", "work", "project", "projects", "company", "industry", "responsibilities"],
  technologies: ["tech", "stack", "tools", "languages", "frameworks", "systems", "backend", "frontend", "database", "node", "redis", "react", "python", "sql", "architectures"],
  growth: ["learning", "development", "skills", "progress", "improved", "grown", "journey", "career", "goals"],
  architecture: ["system", "systems", "design", "pipeline", "infrastructure", "backend", "service", "services", "processing", "architectures"],
  leadership: ["initiative", "led", "owned", "guided", "mentored", "facilitated", "drove", "headed"],
  capstone: ["project", "final", "thesis", "application", "system", "task", "developed"],
  weakness: ["improvement", "challenge", "struggled", "development", "growth", "tendency", "learning curve", "work on", "improve"],
  strength: ["proficient", "expertise", "good at", "excel", "strong", "ability", "capability", "structured", "strengths"],
  conflict: ["disagreement", "divergence", "differing", "friction", "debate", "differed", "difference"],
  resolution: ["resolved", "solution", "solved", "compromise", "aligned", "consensus", "agreement"],
  result: ["outcome", "impact", "achieved", "delivered", "reduced", "improved", "saved", "results", "reliability"],
  action: ["implemented", "built", "designed", "created", "developed", "benchmarked", "facilitated", "coded", "took"],
  task: ["objective", "goal", "responsibility", "target", "problem", "deliverable"],
  situation: ["context", "project", "sprint", "scenario", "environment", "during", "when"],
  contribution: ["responsibility", "role", "ownership", "built", "worked", "developed", "architected", "implemented", "handled", "focused"],
  individual: ["personal", "solely", "independently", "personally", "solo", "myself"],
  metrics: ["throughput", "percentage", "latency", "seconds", "ms", "rate", "numbers", "qps", "rpm", "reliability", "speed", "minutes", "hours"],
  quantifiable: ["percentage", "throughput", "reduced", "increased", "stabilized", "numbers", "%", "latency", "reliability"],
  challenges: ["contention", "obstacle", "bottleneck", "issue", "problem", "difficulty", "bugs", "bursts", "pressure", "failure"],
  challenge: ["contention", "obstacle", "bottleneck", "issue", "problem", "difficulty", "bug", "burst", "pressure", "failure"],
  solved: ["resolved", "eliminated", "fixed", "addressed", "stabilized", "optimized", "mitigated", "overcame"],
  reduced: ["decreased", "lowered", "slashed", "dropped", "eliminated", "stabilized", "cut"],
  latency: ["delay", "throughput", "speed", "response time", "performance", "duration"],
  design: ["architecting", "architecture", "schema", "pipeline", "structure", "engine"],
  effort: ["work", "tasks", "implementation", "development", "sprint"],
  obstacle: ["contention", "bottleneck", "difficulty", "issue", "problem", "challenge", "bursts"],
  tradeoffs: ["balance", "trade-off", "tradeoff", "evaluation", "benchmark", "comparison"]
};
function preprocessAnswerText(rawText) {
  const cleanText = rawText.replace(/\s+/g, " ").trim();
  const words = cleanText.toLowerCase().split(/[^a-zA-Z0-9']+/).filter(Boolean);
  const sentences = cleanText.split(/[.!?]+/).map((s) => s.trim()).filter(Boolean);
  return { cleanText, words, sentences };
}
function analyzeCommunicationMetrics(cleanText, words, durationSeconds) {
  const totalWords = words.length;
  const effectiveDuration = Math.max(1, durationSeconds);
  const wordsPerMinute = Math.round(totalWords / effectiveDuration * 60);
  const lower = cleanText.toLowerCase();
  const fillerWordMap = {};
  let totalFillers = 0;
  for (const filler of FILLER_WORDS) {
    const regex = new RegExp(`\\b${filler}\\b`, "gi");
    const matches = lower.match(regex);
    if (matches && matches.length > 0) {
      fillerWordMap[filler] = matches.length;
      totalFillers += matches.length;
    }
  }
  const fillerWordsList = Object.entries(fillerWordMap).map(([word, count]) => ({ word, count }));
  const uniqueWords = new Set(words);
  const redundancyRatio = totalWords > 15 ? 1 - uniqueWords.size / totalWords : 0;
  const redundancyCount = Math.round(redundancyRatio * totalWords);
  let clarityBase = 88;
  if (totalFillers > 6) clarityBase -= Math.min(15, (totalFillers - 6) * 2);
  if (wordsPerMinute > 185) clarityBase -= 6;
  if (wordsPerMinute < 85 && totalWords > 20) clarityBase -= 8;
  if (totalWords < 20) clarityBase -= 12;
  const sentenceClarityScore = Math.max(50, Math.min(98, clarityBase));
  const coachingTips = [];
  if (totalFillers > 4) {
    coachingTips.push(`Noticeable filler words detected (${totalFillers} instances). Practice taking a silent 1-second pause instead of using verbal crutches like "${fillerWordsList[0]?.word}". Pausing briefly to gather your thoughts is natural and demonstrates composure.`);
  }
  if (wordsPerMinute > 180) {
    coachingTips.push(`Your speaking pace (~${wordsPerMinute} WPM) is on the faster side. Slowing down slightly to 130\u2013150 WPM will help the interviewer absorb complex details easily.`);
  } else if (wordsPerMinute < 95 && totalWords >= 25) {
    coachingTips.push(`Your delivery pace (~${wordsPerMinute} WPM) is somewhat hesitant. Rehearsing your core technical milestones will help your delivery flow more continuously.`);
  } else {
    coachingTips.push(`Pacing is well-controlled (~${wordsPerMinute} WPM). Your delivery tempo sounded natural and professional.`);
  }
  if (totalWords < 30) {
    coachingTips.push(`Your answer was relatively brief (${totalWords} words). Elaborate further with concrete examples or quantifiable outcomes.`);
  }
  return {
    totalWords,
    durationSeconds,
    wordsPerMinute,
    fillerWordsCount: totalFillers,
    fillerWordsList,
    redundancyCount,
    sentenceClarityScore,
    coachingTips
  };
}
function analyzeSTARFramework(cleanText, sentences) {
  const lower = cleanText.toLowerCase();
  const situationKeywords = [
    "when i was",
    "during my",
    "in our",
    "at the time",
    "last semester",
    "project was",
    "we were building",
    "the context was",
    "faced a scenario",
    "while working on",
    "challenge began when",
    "our team had",
    "our team faced",
    "faced a critical",
    "team faced"
  ];
  const situationRegex = /\b(during my|when i was|in our|at the time|project was|we were|faced a|while working|our team|team faced|in my previous|at apex|at my internship)\b/i;
  const hasSituation = situationKeywords.some((kw) => lower.includes(kw)) || situationRegex.test(lower);
  const situationSentence = sentences.find((s) => situationKeywords.some((kw) => s.toLowerCase().includes(kw)) || situationRegex.test(s));
  const taskKeywords = [
    "my task was",
    "my responsibility was",
    "i was assigned",
    "needed to",
    "goal was to",
    "had to deliver",
    "requirement was",
    "objective was",
    "i needed to",
    "had to resolve",
    "was tasked with",
    "my goal was",
    "my objective was"
  ];
  const taskRegex = /\b(my task|my responsibility|my objective|my goal|was to|objective was|goal was|needed to|had to|tasked with|assigned to)\b/i;
  const hasTask = taskKeywords.some((kw) => lower.includes(kw)) || taskRegex.test(lower);
  const taskSentence = sentences.find((s) => taskKeywords.some((kw) => s.toLowerCase().includes(kw)) || taskRegex.test(s));
  const actionKeywords = [
    "took initiative",
    "took the initiative",
    "i implemented",
    "i designed",
    "i organized",
    "i researched",
    "i proposed",
    "i benchmarked",
    "i refactored",
    "i led",
    "i communicated",
    "i decided to",
    "i developed",
    "i built",
    "i resolved",
    "i took initiative",
    "i ran",
    "i profiled",
    "i facilitated",
    "i documented"
  ];
  const actionRegex = /\b(took initiative|took the initiative|i (took|ran|profiled|benchmarked|implemented|designed|built|created|developed|refactored|facilitated|documented|tested|led|decided|coordinated|organized|analyzed|configured|migrated))\b/i;
  const hasAction = actionKeywords.some((kw) => lower.includes(kw)) || actionRegex.test(lower);
  const actionSentence = sentences.find((s) => actionKeywords.some((kw) => s.toLowerCase().includes(kw)) || actionRegex.test(s));
  const resultKeywords = [
    "as a result",
    "in the end",
    "outcome was",
    "successfully delivered",
    "achieved",
    "improved by",
    "reduced latency",
    "increased performance",
    "learned that",
    "finished on time",
    "placed in top",
    "positive feedback",
    "prevented the issue",
    "measurable result",
    "the takeaway was",
    "slashed",
    "saved"
  ];
  const resultRegex = /\b(as a result|in the end|outcome was|successfully|achieved|improved by|reduced|slashed|increased|saved|delivered|finished on time|takeaway was)\b/i;
  const hasResult = resultKeywords.some((kw) => lower.includes(kw)) || resultRegex.test(lower);
  const resultSentence = sentences.find((s) => resultKeywords.some((kw) => s.toLowerCase().includes(kw)) || resultRegex.test(s));
  const componentsCount = (hasSituation ? 1 : 0) + (hasTask ? 1 : 0) + (hasAction ? 1 : 0) + (hasResult ? 1 : 0);
  const starScore = Math.min(100, Math.round(componentsCount / 4 * 100));
  let feedback = "";
  if (componentsCount === 4) {
    feedback = "Excellent STAR response! You clearly structured Situation, Task, Action, and the final Result.";
  } else if (componentsCount === 3) {
    const missing = !hasSituation ? "Situation" : !hasTask ? "Task" : !hasAction ? "Action" : "quantifiable Result";
    feedback = `Solid structure! Adding a clearer ${missing} would make this answer completely comprehensive.`;
  } else {
    feedback = "Consider structuring situational responses with the STAR method (Situation \u2192 Task \u2192 Action \u2192 Result) for maximum clarity and impact.";
  }
  return {
    hasSituation,
    situationSnippet: situationSentence,
    hasTask,
    taskSnippet: taskSentence,
    hasAction,
    actionSnippet: actionSentence,
    hasResult,
    resultSnippet: resultSentence,
    starScore,
    feedback
  };
}
function generateContextualFollowUp(question, cleanText, words, overallScore) {
  if (words.length < 25) {
    return {
      followUp: `Thank you for sharing that starting point. Could you expand a little further with a specific example or scenario that illustrates your point?`,
      nextAction: "encourage_and_move_on"
    };
  }
  const entityMatches = [];
  const candidateMentions = [
    "redis",
    "docker",
    "postgresql",
    "mongodb",
    "react",
    "node",
    "python",
    "etabs",
    "autocad",
    "solidworks",
    "ansys",
    "verilog",
    "kicad",
    "pytorch",
    "spark",
    "kafka",
    "api",
    "database",
    "hackathon",
    "capstone",
    "internship",
    "backend",
    "frontend",
    "cloud",
    "architecture",
    "teammate",
    "benchmark"
  ];
  for (const m of candidateMentions) {
    if (cleanText.toLowerCase().includes(m)) {
      entityMatches.push(m.charAt(0).toUpperCase() + m.slice(1));
    }
  }
  if (entityMatches.length > 0 && question.followUpTemplates.length > 0) {
    const topEntity = entityMatches[0];
    const template = question.followUpTemplates[0];
    const customized = template.replace("{detected_entity}", topEntity);
    return {
      followUp: customized,
      nextAction: overallScore >= 80 ? "deep_dive" : "ask_follow_up"
    };
  }
  if (question.followUpTemplates.length > 0) {
    return {
      followUp: question.followUpTemplates[0].replace("{detected_entity}", "that approach"),
      nextAction: overallScore >= 80 ? "deep_dive" : "ask_follow_up"
    };
  }
  if (overallScore >= 85) {
    return {
      followUp: `That was a very clear breakdown. If you had to scale that solution or explain it to a non-technical executive, how would you summarize the core value?`,
      nextAction: "deep_dive"
    };
  }
  return {
    followUp: `Thank you, that clarifies your perspective well. Let's proceed to the next question.`,
    nextAction: "next_question"
  };
}
function generateResumeBasedFeedback(question, userAnswerText, commMetrics, starAnalysis, conceptCoverage, parsedResume) {
  const cleanAnswer = userAnswerText.trim();
  const sentences = cleanAnswer ? cleanAnswer.split(/(?<=[.!?])\s+/).map((s) => s.trim()).filter(Boolean) : [];
  const candidateName = parsedResume?.fullName || "Candidate";
  const candidateDept = parsedResume?.department || "Engineering";
  const candidateCollege = parsedResume?.education?.[0]?.college || "University";
  const primaryProject = parsedResume?.projects?.[0];
  const primarySkills = parsedResume?.rawSkillsList && parsedResume.rawSkillsList.length > 0 ? parsedResume.rawSkillsList : ["Problem Solving", "Communication", "Technical Design"];
  const whatDidWell = [];
  const whatIsMissing = [];
  const offTopicAnalysis = [];
  const mistakesIdentified = [];
  const howToImproveWithResume = [];
  const highlightedIssues = [];
  const questionKeywords = question.keywords.map((k) => k.toLowerCase());
  const questionConcepts = question.expectedConcepts.map((c) => c.toLowerCase());
  const resumeKeywords = [
    ...primarySkills.map((s) => s.toLowerCase()),
    ...primaryProject ? [primaryProject.title.toLowerCase(), ...primaryProject.technologies.map((t) => t.toLowerCase())] : [],
    candidateDept.toLowerCase(),
    candidateCollege.toLowerCase(),
    "team",
    "project",
    "work",
    "experience",
    "build",
    "solved",
    "learned",
    "contributed",
    "collaborated"
  ];
  if (sentences.length === 0) {
    highlightedIssues.push({
      text: "(No verbal response detected)",
      label: "Needs improvement",
      reason: "No response was provided for this question.",
      correctedExample: "Speak or type your answer clearly before submitting."
    });
  } else {
    sentences.forEach((sentence) => {
      const lowerSentence = sentence.toLowerCase();
      const sentenceWords = lowerSentence.split(/[^a-z0-9]+/).filter((w) => w.length > 2);
      const hasQuestionKeyword = questionKeywords.some((kw) => {
        if (lowerSentence.includes(kw)) return true;
        const syns = CONVERSATIONAL_SYNONYMS[kw] || [];
        return syns.some((s) => lowerSentence.includes(s));
      });
      const hasConceptOverlap = questionConcepts.some((qc) => {
        const tokens = qc.split(/\s+/).filter((t) => t.length > 3);
        return tokens.some((t) => {
          if (lowerSentence.includes(t)) return true;
          const syns = CONVERSATIONAL_SYNONYMS[t] || [];
          return syns.some((s) => lowerSentence.includes(s));
        });
      });
      const hasResumeOverlap = resumeKeywords.some((rk) => lowerSentence.includes(rk));
      const hasGeneralHRTerms = /\b(role|task|goal|objective|responsibilit|learn|strength|weakness|skill|challenge|obstacle|result|impact|achiev|internship|college|career|problem|solut|improv|collaborat|deliver)\b/i.test(lowerSentence);
      const isSentenceOnTopic = hasQuestionKeyword || hasConceptOverlap || hasResumeOverlap || hasGeneralHRTerms && sentenceWords.length > 3;
      if (!isSentenceOnTopic && sentenceWords.length >= 4) {
        const offTopicObj = {
          snippet: sentence,
          explanation: `This statement shifts away from "${question.question}". Recruiters focus on role-relevant experience rather than unrelated subjects.`
        };
        offTopicAnalysis.push(offTopicObj);
        highlightedIssues.push({
          text: sentence,
          label: "Off-topic",
          reason: "Unrelated to the question topic; distracting from your core qualifications.",
          correctedExample: "Directly address the question topic using relevant examples from your background."
        });
        return;
      }
      const fillerMatches = FILLER_WORDS.filter((f) => new RegExp(`\\b${f}\\b`, "i").test(lowerSentence));
      const isVague = /\b(stuff|things|did some work|it was okay|you know what i mean|kind of good|somehow worked)\b/i.test(lowerSentence);
      if (isVague) {
        const mistakeObj = {
          statement: sentence,
          issue: "Vague formulation lacks concrete technical ownership and precise engineering vocabulary.",
          correctedExample: "Replace vague terms with specific actions, tools, and quantified metrics."
        };
        mistakesIdentified.push(mistakeObj);
        highlightedIssues.push({
          text: sentence,
          label: "Needs improvement",
          reason: "Phrasing is overly casual or indistinct; specify the tools and actions you used.",
          correctedExample: "Specify the exact methodology, architecture, or tools employed."
        });
      } else if (fillerMatches.length >= 2) {
        const cleaned = sentence.replace(/\b(basically|you know|sort of|kind of|literally|actually)\b/gi, "").replace(/\s+/g, " ").trim();
        const mistakeObj = {
          statement: sentence,
          issue: `Contains multiple filler words ("${fillerMatches.join('", "')}"), which diminish verbal authority and poise.`,
          correctedExample: cleaned || sentence
        };
        mistakesIdentified.push(mistakeObj);
        highlightedIssues.push({
          text: sentence,
          label: "Needs improvement",
          reason: `Noticeable filler words (${fillerMatches.join(", ")}). Replacing fillers with brief silent pauses projects higher confidence.`,
          correctedExample: mistakeObj.correctedExample
        });
      } else if (hasQuestionKeyword || hasConceptOverlap || starAnalysis && (lowerSentence.includes("because") || lowerSentence.includes("result") || lowerSentence.includes("i "))) {
        highlightedIssues.push({
          text: sentence,
          label: "Correct",
          reason: "Directly addresses the question criteria with clear, relevant focus."
        });
      } else {
        highlightedIssues.push({
          text: sentence,
          label: "Correct",
          reason: "Contributes constructive supporting context to your response."
        });
      }
    });
  }
  const missingConcepts = conceptCoverage.filter((c) => !c.covered);
  missingConcepts.forEach((mc) => {
    whatIsMissing.push(`Missing coverage of "${mc.concept}": expand on this to satisfy core recruiter expectations.`);
    highlightedIssues.push({
      text: `Missing: ${mc.concept}`,
      label: "Missing from your answer",
      reason: `Recruiters specifically evaluate "${mc.concept}" for this interview question.`,
      correctedExample: `Explicitly articulate how you handled ${mc.concept.toLowerCase()}.`
    });
  });
  if (question.starFrameworkApplicable && starAnalysis) {
    if (!starAnalysis.hasResult) {
      whatIsMissing.push("Missing quantifiable Result or lessons learned: always conclude your behavioral story with the outcome.");
      highlightedIssues.push({
        text: "Missing: Measurable Result / Outcome",
        label: "Missing from your answer",
        reason: "Behavioral answers require a quantifiable outcome or impact to validate your actions.",
        correctedExample: "As a result, our team reduced turnaround time by 35% and received commendation from our lead."
      });
    }
    if (!starAnalysis.hasAction) {
      whatIsMissing.push('Missing specific individual Action: clarify your personal contribution rather than only speaking as "we".');
      highlightedIssues.push({
        text: "Missing: Specific Personal Actions",
        label: "Missing from your answer",
        reason: "Interviewer wants to evaluate what YOU specifically designed, implemented, or resolved.",
        correctedExample: "I took ownership of researching the trade-offs and wrote the core automation script."
      });
    }
  }
  const coveredConcepts = conceptCoverage.filter((c) => c.covered);
  if (coveredConcepts.length > 0) {
    whatDidWell.push(`Effectively addressed key competencies: ${coveredConcepts.map((c) => `"${c.concept}"`).slice(0, 3).join(", ")}.`);
  }
  if (starAnalysis?.hasSituation) {
    whatDidWell.push("Clearly established the context and initial scenario for the interviewer.");
  }
  if (starAnalysis?.hasAction) {
    whatDidWell.push("Demonstrated personal accountability by describing concrete actions taken.");
  }
  if (starAnalysis?.hasResult) {
    whatDidWell.push("Included outcomes that substantiate the effectiveness of your solution.");
  }
  if (commMetrics.wordsPerMinute >= 105 && commMetrics.wordsPerMinute <= 165) {
    whatDidWell.push(`Well-calibrated conversational pace (~${commMetrics.wordsPerMinute} WPM), making your response pleasant and easy to follow.`);
  }
  if (commMetrics.fillerWordsCount <= 1 && cleanAnswer.length > 40) {
    whatDidWell.push("Clean verbal delivery with minimal filler words, projecting confidence and composure.");
  }
  if (whatDidWell.length === 0) {
    whatDidWell.push("Initiated a foundation for this HR response that can be refined with specific examples.");
  }
  if (primaryProject) {
    howToImproveWithResume.push(
      `Leverage your actual project "${primaryProject.title}": explain how you applied ${primaryProject.technologies.slice(0, 3).join(", ")} to overcome real technical challenges.`
    );
  }
  if (parsedResume?.experience && parsedResume.experience.length > 0) {
    const exp = parsedResume.experience[0];
    howToImproveWithResume.push(
      `Draw from your experience as ${exp.role} at ${exp.company} to demonstrate professional teamwork and deadline management.`
    );
  }
  if (parsedResume?.education && parsedResume.education.length > 0) {
    howToImproveWithResume.push(
      `Frame your academic progression in ${candidateDept} at ${candidateCollege} to highlight your structured fundamentals.`
    );
  }
  if (primarySkills.length > 0) {
    howToImproveWithResume.push(
      `Reference your verified skills (${primarySkills.slice(0, 4).join(", ")}) as concrete tools in your problem-solving process.`
    );
  }
  howToImproveWithResume.push(
    "Structure your delivery using the STAR framework: 20 seconds on Situation/Task, 50 seconds on your Actions, and 20 seconds on the Result."
  );
  let suggestedAnswerUsingResume = "";
  if (question.category === "self_introduction") {
    const projectMention = primaryProject ? `Most recently, I engineered "${primaryProject.title}" utilizing ${primaryProject.technologies.slice(0, 3).join(", ")}, where I tackled complex data flow challenges.` : `Throughout my projects, I have specialized in ${primarySkills.slice(0, 3).join(", ")}.`;
    suggestedAnswerUsingResume = `Hello, I'm ${candidateName}. I graduated with a degree in ${candidateDept} from ${candidateCollege}. Over the course of my engineering journey, I developed a strong passion for building robust software solutions. ${projectMention} I thrive in collaborative environments where I can tackle demanding engineering challenges, and I am eager to contribute my skills to your team.`;
  } else if (question.category === "project_contribution" && primaryProject) {
    suggestedAnswerUsingResume = `In my resume, I highlighted my project "${primaryProject.title}". Our goal was to ${primaryProject.description || "deliver a scalable solution"}. My individual responsibility centered on architecting the core modules using ${primaryProject.technologies.slice(0, 3).join(", ")}. A pivotal technical obstacle we solved was optimizing throughput under load; by implementing modular caching and streamlined queries, we achieved smooth execution. This project taught me the importance of proactive benchmarking and clean system design.`;
  } else if (question.category === "teamwork_conflict" || question.category === "leadership_problem_solving") {
    const projTitle = primaryProject ? `our "${primaryProject.title}" project` : "a critical engineering sprint";
    suggestedAnswerUsingResume = `During ${projTitle}, our team reached a divergence in opinion regarding the architecture to adopt. Instead of letting differences cause delays, I proposed an objective benchmark using ${primarySkills.slice(0, 2).join(" and ")} to evaluate latency and maintenance overhead. I consolidated our empirical findings into an accessible comparison doc and hosted a brief sync. This data-driven approach enabled the entire team to align cohesively, delivering the milestone 2 days ahead of schedule.`;
  } else if (question.category === "strengths_weaknesses") {
    suggestedAnswerUsingResume = `My greatest technical strength is rapid diagnostic problem-solving\u2014as demonstrated in my work with ${primarySkills.slice(0, 2).join(" and ")}, where I methodically break down complex bottlenecks into testable parts. An area I actively work to improve is delegating tasks earlier; in past sprints, I tended to handle multiple subtasks personally. I have adopted structured task-tracking and regular stand-up updates to distribute workload and collaborate more smoothly.`;
  } else if (question.category === "why_hire_you" || question.category === "why_this_role") {
    suggestedAnswerUsingResume = `You should hire me because I combine rigorous foundational knowledge in ${candidateDept} from ${candidateCollege} with practical implementation skills in ${primarySkills.slice(0, 3).join(", ")}. In projects like "${primaryProject?.title || "my capstone"}", I demonstrated not just coding capability, but the ownership required to carry a product from design to reliable deployment. I am excited to bring this dedication and continuous learning mindset to your team.`;
  } else if (question.category === "ethics_professional_behavior") {
    suggestedAnswerUsingResume = `In an engineering project, ethical integrity and software reliability are paramount. If asked to deploy code with known security vulnerabilities to meet a tight deadline, I would document the exact exposure with empirical test results, communicate transparently with stakeholders, and propose a phased mitigation plan. Protecting user trust is always non-negotiable.`;
  } else if (question.category === "motivation_company_fit") {
    suggestedAnswerUsingResume = `What motivates me most is having end-to-end ownership on engineering systems that solve real-world problems. With my background in ${candidateDept} and hands-on experience in ${primarySkills.slice(0, 3).join(", ")}, I am drawn to your culture because you prioritize engineering craftsmanship, peer code reviews, and continuous learning. I thrive in teams where engineers are encouraged to ask thoughtful questions and take initiative.`;
  } else if (question.category === "future_goals_learning" || question.category === "career_goals") {
    suggestedAnswerUsingResume = `Over the next two to three years, my goal is to evolve into a versatile engineer capable of architecting resilient distributed systems. Building on my foundation in ${primarySkills.slice(0, 3).join(", ")}, I am actively exploring advanced systems design and cloud infrastructure. Longer term, I aim to mentor junior developers and lead technical initiatives that deliver measurable business impact.`;
  } else if (question.category === "time_management") {
    suggestedAnswerUsingResume = `When balancing concurrent project deadlines, I rely on rigorous prioritization using agile timeboxing. During a semester where I had to deliver our "${primaryProject?.title || "capstone"}" project alongside exams, I broke our roadmap into modular milestones, conducted daily 5-minute personal stand-ups, and proactively communicated progress. This disciplined approach enabled me to deliver our project on time without sacrificing code quality.`;
  } else if (question.category === "handling_failure") {
    suggestedAnswerUsingResume = `During an earlier iteration of our "${primaryProject?.title || "capstone"}" project, a query optimization I implemented underperformed under concurrent load during our stress tests. Instead of hiding the setback, I immediately flagged the regression to my team, conducted a blameless post-mortem using execution profiling, and identified the missing index. We resolved the bottleneck within 24 hours, and that experience taught me the critical value of rigorous stress-testing before shipping.`;
  } else {
    suggestedAnswerUsingResume = question.exampleStrongAnswer || "I approach challenges methodically by first diagnosing constraints, coordinating openly with team members, and delivering measurable results.";
  }
  return {
    whatDidWell,
    whatIsMissing,
    offTopicAnalysis,
    mistakesIdentified,
    howToImproveWithResume,
    highlightedIssues,
    suggestedAnswerUsingResume
  };
}
async function evaluateHRAnswerLocally(question, userAnswerText, durationSeconds, parsedResume) {
  const { cleanText, words, sentences } = preprocessAnswerText(userAnswerText);
  const commMetrics = analyzeCommunicationMetrics(cleanText, words, durationSeconds);
  const starAnalysis = question.starFrameworkApplicable ? analyzeSTARFramework(cleanText, sentences) : void 0;
  const conceptCoverage = question.expectedConcepts.map((concept) => {
    const conceptLower = concept.toLowerCase();
    if (starAnalysis) {
      if (conceptLower.startsWith("situation") && starAnalysis.hasSituation) {
        return { concept, covered: true };
      }
      if (conceptLower.startsWith("task") && starAnalysis.hasTask) {
        return { concept, covered: true };
      }
      if (conceptLower.startsWith("action") && starAnalysis.hasAction) {
        return { concept, covered: true };
      }
      if (conceptLower.startsWith("result") && starAnalysis.hasResult) {
        return { concept, covered: true };
      }
    }
    const cleanTokens = conceptLower.replace(/[^a-z0-9\s]/g, " ").split(/\s+/).filter((w) => w.length > 2 && !["situation", "task", "action", "result"].includes(w));
    if (cleanTokens.length === 0) {
      return { concept, covered: true };
    }
    const matches = cleanTokens.filter((token) => {
      const stem = token.length > 5 ? token.slice(0, -2) : token;
      const root5 = token.length >= 6 ? token.slice(0, 5) : "";
      if (cleanText.toLowerCase().includes(token) || cleanText.toLowerCase().includes(stem) || root5 && cleanText.toLowerCase().includes(root5)) {
        return true;
      }
      const synonyms = CONVERSATIONAL_SYNONYMS[token] || [];
      if (synonyms.some((syn) => cleanText.toLowerCase().includes(syn))) {
        return true;
      }
      if (["metrics", "quantifiable", "speedup", "accuracy"].includes(token) && /\b\d+([.,]\d+)?%?\b/.test(cleanText)) {
        return true;
      }
      if (parsedResume) {
        if (["project", "projects", "capstone", "milestones", "internship", "internships"].includes(token)) {
          const mentionedProj = parsedResume.projects?.some(
            (p) => cleanText.toLowerCase().includes(p.title.toLowerCase()) || p.technologies?.some((t) => cleanText.toLowerCase().includes(t.toLowerCase()))
          );
          if (mentionedProj) return true;
        }
        if (["skill", "skills", "technologies", "tools"].includes(token)) {
          const mentionedSkill = parsedResume.rawSkillsList?.some((s) => cleanText.toLowerCase().includes(s.toLowerCase()));
          if (mentionedSkill) return true;
        }
        if (["education", "college", "university", "degree", "narrative", "chronological"].includes(token)) {
          const mentionedEdu = parsedResume.education?.some(
            (e) => cleanText.toLowerCase().includes(e.college.toLowerCase()) || cleanText.toLowerCase().includes(e.degree.toLowerCase()) || cleanText.toLowerCase().includes(e.branch.toLowerCase())
          );
          if (mentionedEdu) return true;
        }
      }
      return false;
    });
    const isCovered = matches.length >= Math.max(1, Math.floor(cleanTokens.length * 0.35));
    return { concept, covered: isCovered };
  });
  const coveredCount = conceptCoverage.filter((c) => c.covered).length;
  const coverageRatio = conceptCoverage.length > 0 ? coveredCount / conceptCoverage.length : 0.8;
  const completenessScore = Math.min(100, Math.round(coverageRatio * 100));
  const keywordMatches = question.keywords.filter((kw) => {
    const kwLower = kw.toLowerCase();
    const stem = kwLower.length > 5 ? kwLower.slice(0, -2) : kwLower;
    if (cleanText.toLowerCase().includes(kwLower) || cleanText.toLowerCase().includes(stem)) {
      return true;
    }
    const synonyms = CONVERSATIONAL_SYNONYMS[kwLower] || [];
    if (synonyms.some((syn) => cleanText.toLowerCase().includes(syn))) {
      return true;
    }
    if (parsedResume) {
      if (["capstone", "milestones"].includes(kwLower)) {
        const hasProj = parsedResume.projects?.some((p) => cleanText.toLowerCase().includes(p.title.toLowerCase()));
        if (hasProj) return true;
      }
      if (["technologies", "skills"].includes(kwLower)) {
        const hasSkill = parsedResume.rawSkillsList?.some((s) => cleanText.toLowerCase().includes(s.toLowerCase()));
        if (hasSkill) return true;
      }
    }
    return false;
  });
  const keywordRatio = question.keywords.length > 0 ? keywordMatches.length / question.keywords.length : 0.5;
  let effectiveRelevance = keywordRatio * 0.4 + coverageRatio * 0.6;
  if (starAnalysis) {
    const starRatio = starAnalysis.starScore / 100;
    effectiveRelevance = effectiveRelevance * 0.5 + starRatio * 0.5;
  }
  const relevanceScore = Math.min(98, Math.max(35, Math.round(effectiveRelevance * 100)));
  let qualityBase = Math.round(relevanceScore * 0.45 + completenessScore * 0.35 + commMetrics.sentenceClarityScore * 0.2);
  if (starAnalysis) {
    qualityBase = Math.round(qualityBase * 0.65 + starAnalysis.starScore * 0.35);
  }
  const qualityScore = Math.min(96, Math.max(35, qualityBase));
  const structureScore = starAnalysis ? starAnalysis.starScore : commMetrics.sentenceClarityScore;
  const r = question.rubric;
  const overallScore = Math.min(
    98,
    Math.max(
      30,
      Math.round(
        relevanceScore * r.relevanceWeight + completenessScore * r.completenessWeight + commMetrics.sentenceClarityScore * r.clarityWeight + structureScore * r.evidenceWeight
      )
    )
  );
  let ratingBand = "Satisfactory";
  if (overallScore >= 88) ratingBand = "Exceptional";
  else if (overallScore >= 75) ratingBand = "Strong Answer";
  else if (overallScore >= 55) ratingBand = "Satisfactory";
  else ratingBand = "Needs Improvement";
  const strengths = [];
  const areasToImprove = [];
  if (relevanceScore >= 75) {
    strengths.push("Directly addressed the core intent of the question.");
  }
  if (coveredCount >= 2) {
    strengths.push(`Addressed key concepts including ${conceptCoverage.filter((c) => c.covered).map((c) => `"${c.concept}"`).slice(0, 2).join(" and ")}.`);
  }
  if (starAnalysis && starAnalysis.hasAction) {
    strengths.push("Clearly articulated individual actions taken rather than speaking solely in abstract terms.");
  }
  if (commMetrics.wordsPerMinute >= 110 && commMetrics.wordsPerMinute <= 165) {
    strengths.push("Delivery pacing was well-paced and articulate.");
  }
  if (strengths.length === 0) {
    strengths.push("Provided a starting point that touched on your background.");
  }
  if (completenessScore < 65) {
    const missing = conceptCoverage.find((c) => !c.covered);
    if (missing) {
      areasToImprove.push(`Elaborate further on ${missing.concept.toLowerCase()} to provide a more holistic answer.`);
    }
  }
  if (starAnalysis && !starAnalysis.hasResult) {
    areasToImprove.push("Conclude with the quantifiable result, impact, or key lessons learned from your experience.");
  }
  if (commMetrics.fillerWordsCount >= 4) {
    areasToImprove.push(`Reduce filler words (${commMetrics.fillerWordsList.slice(0, 2).map((f) => `"${f.word}"`).join(", ")}) to project sharper confidence.`);
  }
  if (words.length < 35) {
    areasToImprove.push("Answer was relatively short; aim for 60\u201390 words with specific examples from your projects or coursework.");
  }
  if (areasToImprove.length === 0) {
    areasToImprove.push("Keep practicing concise, punchy summaries to make strong first impressions.");
  }
  const { followUp, nextAction } = generateContextualFollowUp(question, cleanText, words, overallScore);
  const explanation = `Score calculated across relevance (${relevanceScore}%), concept coverage (${completenessScore}%), clarity (${commMetrics.sentenceClarityScore}%), and structure (${structureScore}%). ${ratingBand === "Exceptional" || ratingBand === "Strong Answer" ? "Strong alignment with professional HR interview benchmarks." : "Review the suggested answer to see how to incorporate more concrete evidence."}`;
  const resumeFeedback = generateResumeBasedFeedback(
    question,
    cleanText,
    commMetrics,
    starAnalysis,
    conceptCoverage,
    parsedResume
  );
  return {
    questionId: question.id,
    questionText: question.question,
    userAnswerText: cleanText,
    relevanceScore,
    qualityScore,
    clarityScore: commMetrics.sentenceClarityScore,
    structureScore,
    overallScore,
    completenessScore,
    ratingBand,
    conceptCoverage,
    starAnalysis,
    communicationMetrics: commMetrics,
    strengths: resumeFeedback.whatDidWell.length > 0 ? resumeFeedback.whatDidWell : strengths,
    areasToImprove: resumeFeedback.whatIsMissing.length > 0 ? resumeFeedback.whatIsMissing : areasToImprove,
    suggestedImprovedAnswer: resumeFeedback.suggestedAnswerUsingResume || question.exampleStrongAnswer,
    explanation,
    followUpQuestion: followUp,
    nextAction,
    resumeFeedback
  };
}

// scripts/testRealisticHRInterview.ts
async function runTestSuite() {
  console.log("================================================================");
  console.log("CAREERCURVE REALISTIC COMPANY-STYLE 7-QUESTION HR INTERVIEW TEST");
  console.log("================================================================\n");
  let totalTests = 0;
  let passedTests = 0;
  function assert(condition, testName, detail) {
    totalTests++;
    if (condition) {
      passedTests++;
      console.log(`  [PASS] ${testName}`);
    } else {
      console.error(`  [FAIL] ${testName} ${detail ? `- ${detail}` : ""}`);
    }
  }
  console.log("\n--- SUITE 1: 7 CANONICAL QUESTION STRUCTURE ---");
  assert(
    SEVEN_MAIN_HR_QUESTIONS.length === 7,
    "Dataset defines exactly 7 canonical HR question definitions",
    `Found ${SEVEN_MAIN_HR_QUESTIONS.length}`
  );
  const expectedTitles = [
    "Introduction",
    "Why should we hire you?",
    "Strengths and weaknesses",
    "Company interest",
    "Five-year goals",
    "challenge",
    "questions"
  ];
  expectedTitles.forEach((keyword, idx) => {
    const qDef = SEVEN_MAIN_HR_QUESTIONS[idx];
    assert(
      !!qDef && (qDef.shortTitle.toLowerCase().includes(keyword.toLowerCase()) || qDef.progressTitle.toLowerCase().includes(keyword.toLowerCase())),
      `Question #${idx + 1} matches "${keyword}"`,
      `Found: ${qDef?.shortTitle} (${qDef?.progressTitle})`
    );
    assert(
      !!qDef?.expectedConcepts && qDef.expectedConcepts.length >= 3,
      `Question #${idx + 1} has defined expected evaluation concepts (${qDef?.expectedConcepts?.length})`
    );
    assert(
      !!qDef?.exampleStrongAnswer && qDef.exampleStrongAnswer.length > 50,
      `Question #${idx + 1} has comprehensive strong answer guide`
    );
  });
  console.log("\n--- SUITE 2: RESUME & COMPANY PERSONALIZATION ---");
  const sampleCSEResume = {
    fullName: "Aditya Verma",
    email: "aditya@example.com",
    phone: "9876543210",
    jobTitle: "Software Engineering Graduate",
    summary: "CSE student with expertise in React, Node.js, and Machine Learning.",
    department: "Computer Science and Engineering",
    education: [{ institution: "Anna University", degree: "B.E. CSE", graduationYear: "2025" }],
    skills: [
      { category: "Languages", skills: ["Python", "TypeScript", "SQL"] },
      { category: "Frameworks", skills: ["React", "Node.js", "Express"] }
    ],
    rawSkillsList: ["Python", "TypeScript", "SQL", "React", "Node.js"],
    projects: [
      {
        title: "Autonomous Drone Navigation System",
        description: "Used computer vision and Node.js backend for telemetry tracking",
        technologies: ["Python", "OpenCV", "Node.js"]
      }
    ],
    experience: [],
    certifications: [{ name: "AWS Cloud Practitioner", issuer: "Amazon" }]
  };
  const cseQuestionsWithCompany = generateSevenMainHRQuestions(sampleCSEResume, "Google");
  assert(
    cseQuestionsWithCompany.length === 7,
    "generateSevenMainHRQuestions produces exactly 7 questions for CSE candidate with company",
    `Length: ${cseQuestionsWithCompany.length}`
  );
  const q1Text = cseQuestionsWithCompany[0].personalizedText;
  assert(
    q1Text.includes("Aditya") || q1Text.includes("Computer Science"),
    "Q1 personalizes with candidate name or department",
    `Q1: ${q1Text}`
  );
  assert(
    q1Text.includes("Autonomous Drone Navigation System"),
    "Q1 incorporates actual project from resume",
    `Q1: ${q1Text}`
  );
  const q4Text = cseQuestionsWithCompany[3].personalizedText;
  assert(
    q4Text.includes("Google"),
    'Q4 personalizes with target company "Google"',
    `Q4: ${q4Text}`
  );
  const cseQuestionsGeneral = generateSevenMainHRQuestions(sampleCSEResume, void 0);
  const q4GeneralText = cseQuestionsGeneral[3].personalizedText;
  assert(
    q4GeneralText.includes("organization") || q4GeneralText.includes("company") || q4GeneralText.includes("culture"),
    "Q4 falls back to general professional phrasing when target company is omitted",
    `Q4: ${q4GeneralText}`
  );
  const depts = [
    { dept: "Electronics and Communication Engineering", expectedNorm: "Electronics & Communication Engineering" },
    { dept: "Mechanical Engineering", expectedNorm: "Mechanical Engineering" },
    { dept: "Civil Engineering", expectedNorm: "Civil Engineering" }
  ];
  depts.forEach((d) => {
    const norm = normalizeDepartment(d.dept);
    assert(norm === d.expectedNorm, `Department normalizer maps "${d.dept}" to "${d.expectedNorm}"`);
    const testResume = {
      ...sampleCSEResume,
      fullName: `Test ${d.expectedNorm} Candidate`,
      department: d.dept
    };
    const qs = generateSevenMainHRQuestions(testResume, "Tata Motors");
    assert(
      qs.length === 7 && qs[3].personalizedText.includes("Tata Motors"),
      `Generated 7 customized questions for ${d.expectedNorm} targeting Tata Motors`
    );
  });
  console.log("\n--- SUITE 3: SATISFACTION EVALUATION & FOLLOW-UP SYNTHESIS ---");
  const shallowQ1Answer = "I am Aditya, a student. I know some programming.";
  const q1Eval = evaluateHRSatisfaction(SEVEN_MAIN_HR_QUESTIONS[0], shallowQ1Answer, 0, sampleCSEResume, "Google");
  assert(
    q1Eval.isSatisfied === false,
    "Shallow Q1 answer is marked not satisfied",
    `Status: ${q1Eval.isSatisfied}, Score: ${q1Eval.score}`
  );
  assert(
    !!q1Eval.followUpQuestion && q1Eval.followUpQuestion.length > 10,
    "Follow-up question is generated for shallow Q1 answer",
    `Follow-up: ${q1Eval.followUpQuestion}`
  );
  assert(
    q1Eval.missingElements.length > 0,
    "Missing elements identified (e.g. project details, background depth)",
    `Missing: ${q1Eval.missingElements.join(", ")}`
  );
  const q1EvalAtCap = evaluateHRSatisfaction(SEVEN_MAIN_HR_QUESTIONS[0], shallowQ1Answer, 2, sampleCSEResume, "Google");
  assert(
    q1EvalAtCap.isSatisfied === true || q1EvalAtCap.followUpQuestion === void 0,
    "At follow-up cap (2), engine stops asking follow-ups to avoid candidate exhaustion",
    `isSatisfied: ${q1EvalAtCap.isSatisfied}, followUpQuestion: ${q1EvalAtCap.followUpQuestion}`
  );
  const comprehensiveQ1Answer = `
Hello, thank you for having me. My name is Aditya Verma and I recently graduated with a B.E. in Computer Science and Engineering from Anna University. 
Throughout my academic journey, I built a strong foundation in core software engineering, data structures, and full-stack development with Python, TypeScript, and React. 
One of my key accomplishments was designing an Autonomous Drone Navigation System, where I developed real-time telemetry processing using Node.js and OpenCV. 
Beyond academics, I achieved AWS Cloud Practitioner certification and led our university coding club hackathon. 
I am eager to apply my technical and collaborative skills to build scalable software solutions.
`.trim();
  const q1EvalComp = evaluateHRSatisfaction(SEVEN_MAIN_HR_QUESTIONS[0], comprehensiveQ1Answer, 0, sampleCSEResume, "Google");
  assert(
    q1EvalComp.isSatisfied === true,
    "Comprehensive Q1 answer meets satisfaction criteria on first attempt",
    `isSatisfied: ${q1EvalComp.isSatisfied}, score: ${q1EvalComp.score}`
  );
  const incompleteQ6Answer = "In my final year project, the drone was not communicating with the server properly.";
  const q6EvalIncomplete = evaluateHRSatisfaction(SEVEN_MAIN_HR_QUESTIONS[5], incompleteQ6Answer, 0, sampleCSEResume, "Google");
  assert(
    q6EvalIncomplete.isSatisfied === false,
    "Q6 answer with only Situation and missing Action/Result triggers follow-up",
    `Follow-up: ${q6EvalIncomplete.followUpQuestion}`
  );
  assert(
    q6EvalIncomplete.missingElements.some((m) => m.toLowerCase().includes("action") || m.toLowerCase().includes("resolution") || m.toLowerCase().includes("result")),
    "Q6 evaluation specifically notes missing Action or Result/Resolution",
    `Missing elements: ${q6EvalIncomplete.missingElements.join(", ")}`
  );
  const completeQ6Answer = `
During the development of our Autonomous Drone Navigation system, we encountered a critical challenge where high-frequency telemetry data overwhelmed our WebSocket server, causing packet drops. 
My task was to stabilize the communication channel without losing positional accuracy. 
I took the initiative to profile the network bottlenecks, implemented client-side data throttling with a rolling buffer, and batch-streamed coordinates every 50 milliseconds. 
As a result, we reduced server CPU utilization by 42% and achieved zero dropped packets during flight tests, allowing our team to complete the demonstration smoothly.
`.trim();
  const q6EvalComplete = evaluateHRSatisfaction(SEVEN_MAIN_HR_QUESTIONS[5], completeQ6Answer, 0, sampleCSEResume, "Google");
  assert(
    q6EvalComplete.isSatisfied === true,
    "Complete STAR Q6 answer with Situation, Task, Action, and measurable Result is satisfied",
    `Score: ${q6EvalComplete.score}, missing: ${q6EvalComplete.missingElements.length}`
  );
  console.log("\n--- SUITE 4: QUESTION 7 CANDIDATE Q&A INTERACTIONS ---");
  const mentorReply = handleCandidateQuestionInteraction("What kind of mentorship or training is available for freshers?", "Google");
  assert(
    mentorReply.category === "mentorship",
    "Recognizes mentorship and onboarding query",
    `Category: ${mentorReply.category}`
  );
  assert(
    mentorReply.aiAnswer.toLowerCase().includes("mentor") || mentorReply.aiAnswer.toLowerCase().includes("onboarding"),
    "Provides corporate answer regarding mentorship and guidance"
  );
  const techReply = handleCandidateQuestionInteraction("What technologies and engineering practices does your team use?", "Google");
  assert(
    techReply.category === "tech_stack",
    "Recognizes tech stack and engineering practices query",
    `Category: ${techReply.category}`
  );
  const cultureReply = handleCandidateQuestionInteraction("Could you tell me about the team work culture and collaboration?", "Google");
  assert(
    cultureReply.category === "culture",
    "Recognizes team culture and work environment query",
    `Category: ${cultureReply.category}`
  );
  const growthReply = handleCandidateQuestionInteraction("What does the career progression path look like for this position?", "Google");
  assert(
    growthReply.category === "growth",
    "Recognizes career advancement and progression query",
    `Category: ${growthReply.category}`
  );
  const noQReply = handleCandidateQuestionInteraction("No, I do not have any questions at this moment. Everything was clear.", "Google");
  assert(
    noQReply.category === "none",
    "Recognizes polite candidate statement with no questions asked",
    `Category: ${noQReply.category}`
  );
  console.log("\n--- SUITE 5: INTERVIEW CLOSING STATEMENT ---");
  const closingStmt = getInterviewClosingStatement("Aditya", "Google");
  assert(
    closingStmt.includes("Aditya") && closingStmt.includes("Google"),
    "Closing statement includes candidate name and target company",
    `Closing: ${closingStmt}`
  );
  assert(
    closingStmt.toLowerCase().includes("next steps") || closingStmt.toLowerCase().includes("review"),
    "Closing statement provides transparent expectations for next steps"
  );
  console.log("\n--- SUITE 6: OVERALL EVALUATOR INTEGRATION ---");
  const comprehensiveEval = await evaluateHRAnswerLocally(
    cseQuestionsWithCompany[0].question,
    comprehensiveQ1Answer,
    45,
    sampleCSEResume
  );
  assert(
    comprehensiveEval.overallScore >= 70,
    "Comprehensive answer achieves strong overall score",
    `Overall score: ${comprehensiveEval.overallScore}`
  );
  assert(
    comprehensiveEval.explanation.length > 0 && comprehensiveEval.strengths.length > 0,
    "Evaluation returns constructive feedback, strengths, and actionable improvement tips"
  );
  console.log("\n================================================================");
  console.log(`TOTAL TESTS: ${totalTests} | PASSED: ${passedTests} | FAILED: ${totalTests - passedTests}`);
  console.log("================================================================");
  if (passedTests === totalTests) {
    console.log("\n>> SUCCESS: ALL REALISTIC HR INTERVIEW TESTS PASSED! <<\n");
    process.exit(0);
  } else {
    console.error("\n>> FAILURE: SOME TESTS FAILED! <<\n");
    process.exit(1);
  }
}
runTestSuite().catch((err) => {
  console.error("Test suite failed with unexpected error:", err);
  process.exit(1);
});
