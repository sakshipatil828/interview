// src/services/candidateClassificationService.ts
var MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December"
];
function normalizeMonthName(raw) {
  if (!raw) return void 0;
  const clean = raw.trim().toLowerCase();
  const num = parseInt(clean, 10);
  if (!isNaN(num) && num >= 1 && num <= 12) {
    return MONTH_NAMES[num - 1];
  }
  if (clean.startsWith("jan")) return "January";
  if (clean.startsWith("feb")) return "February";
  if (clean.startsWith("mar")) return "March";
  if (clean.startsWith("apr")) return "April";
  if (clean === "may") return "May";
  if (clean.startsWith("jun")) return "June";
  if (clean.startsWith("jul")) return "July";
  if (clean.startsWith("aug")) return "August";
  if (clean.startsWith("sep")) return "September";
  if (clean.startsWith("oct")) return "October";
  if (clean.startsWith("nov")) return "November";
  if (clean.startsWith("dec")) return "December";
  return void 0;
}
function isInternshipRole(item) {
  if (item.isInternship !== void 0) return item.isInternship;
  const roleLower = (item.role || "").toLowerCase();
  const descLower = (item.description || "").toLowerCase();
  const companyLower = (item.company || "").toLowerCase();
  return roleLower.includes("intern") || roleLower.includes("trainee") || roleLower.includes("apprentice") || roleLower.includes("fellow") || companyLower.includes("intern") || descLower.includes("summer internship") || descLower.includes("winter internship") || descLower.includes("student intern");
}
function separateInternshipsAndEmployment(rawList = []) {
  const internships = [];
  const employmentHistory = [];
  const items = Array.isArray(rawList) ? rawList : [];
  items.forEach((item) => {
    if (isInternshipRole(item)) {
      internships.push({ ...item, isInternship: true, isEmployment: false });
    } else {
      employmentHistory.push({ ...item, isInternship: false, isEmployment: true });
    }
  });
  let totalExperienceText = "None (Fresher / Academic Projects)";
  if (employmentHistory.length > 0) {
    const totalCount = employmentHistory.length;
    const durations = employmentHistory.map((e) => e.duration).filter(Boolean);
    if (durations.length > 0) {
      totalExperienceText = `${durations.join(", ")} (${totalCount} employment ${totalCount === 1 ? "role" : "roles"})`;
    } else {
      totalExperienceText = `${totalCount} professional employment ${totalCount === 1 ? "role" : "roles"}`;
    }
  }
  return {
    internships,
    employmentHistory,
    totalExperienceText
  };
}
function detectEducationalBackground(resume, profileDepartment) {
  if (!resume) {
    const dept = profileDepartment || "";
    const deptLower = dept.toLowerCase();
    const isNonTech = /(commerce|b\.?com|bba|mba|business|management|finance|accounting|marketing|human resource|hr|arts|humanities|english)/i.test(deptLower);
    return {
      category: isNonTech ? "non_technical" : "technical",
      discipline: dept || (isNonTech ? "Commerce & Business" : "Computer Science and Engineering"),
      isTechnical: !isNonTech,
      confidenceScore: 70,
      reason: dept ? `Determined from profile department: ${dept}` : "Default candidate profile baseline"
    };
  }
  const edu = resume.education && resume.education.length > 0 ? resume.education[0] : null;
  const degreeStr = `${edu?.degree || ""} ${resume.jobTitle || ""}`.toLowerCase();
  const deptStr = `${resume.department || ""} ${edu?.branch || ""} ${profileDepartment || ""}`.toLowerCase();
  const skillsCorpus = (resume.rawSkillsList || []).concat(
    Array.isArray(resume.skills) ? resume.skills.flatMap((s) => typeof s === "string" ? [s] : s?.skills ? s.skills.map((sk) => sk.name) : []) : []
  ).join(" ").toLowerCase();
  const projectCorpus = (resume.projects || []).map((p) => `${p.title} ${p.description} ${(p.technologies || []).join(" ")}`).join(" ").toLowerCase();
  const expCorpus = (resume.experience || []).map((e) => `${e.role} ${e.company} ${e.description}`).join(" ").toLowerCase();
  const fullCorpus = `${degreeStr} ${deptStr} ${resume.summary || ""} ${resume.extractedText || ""} ${skillsCorpus} ${projectCorpus} ${expCorpus}`.toLowerCase();
  let techScore = 0;
  let nonTechScore = 0;
  let detectedDiscipline = "General Studies";
  if (/\b(b\.?com|m\.?com|commerce|accounting|accountancy|tally|gst|taxation|auditing|balance sheet|ledger|financial accounting|cost accounting|chartered accountant|ca|cpa)\b/i.test(fullCorpus)) {
    nonTechScore += 16;
    detectedDiscipline = "Commerce";
  }
  if (/\b(bba|bms|mba|pgdm|business administration|general management|operations management|supply chain|strategic management|business strategy)\b/i.test(fullCorpus)) {
    nonTechScore += 16;
    if (detectedDiscipline === "General Studies" || nonTechScore >= 16) {
      detectedDiscipline = /\b(mba|pgdm|master of business)\b/i.test(fullCorpus) ? "Management" : "Business Administration";
    }
  }
  if (/\b(business analytics|business intelligence|tableau|power bi|powerbi|kpi dashboard|data insights|market analytics|business metrics)\b/i.test(fullCorpus)) {
    nonTechScore += 18;
    detectedDiscipline = "Business Analytics";
  }
  if (/\b(finance|financial modeling|investment banking|banking|wealth management|portfolio management|equity research|corporate finance|cfa)\b/i.test(fullCorpus)) {
    nonTechScore += 16;
    if (detectedDiscipline !== "Business Analytics") {
      detectedDiscipline = "Finance and Accounting";
    }
  }
  if (/\b(marketing|digital marketing|seo|sem|social media marketing|brand management|content marketing|lead generation|market research|advertising)\b/i.test(fullCorpus)) {
    nonTechScore += 16;
    if (detectedDiscipline !== "Business Administration" && detectedDiscipline !== "Management" && !/\b(bba|bms|mba)\b/i.test(degreeStr)) {
      detectedDiscipline = "Marketing";
    }
  }
  if (/\b(human resources|hr|talent acquisition|recruitment|employee relations|payroll|people management|hr analytics|mhrm)\b/i.test(fullCorpus)) {
    nonTechScore += 16;
    detectedDiscipline = "Human Resources";
  }
  if (/\b(b\.?a\b|m\.?a\b|arts|humanities|english|literature|history|sociology|psychology|journalism|creative writing|public relations|mass communication|philosophy)\b/i.test(fullCorpus)) {
    nonTechScore += 16;
    detectedDiscipline = "Arts & Humanities";
  }
  if (/\b(customer service|customer support|client service|helpdesk|bpo|call center|crm data entry|complaint handling|telecalling|billing assistance|sales assistant|sales support|operations associate|record management)\b/i.test(fullCorpus)) {
    nonTechScore += 18;
    if (detectedDiscipline === "General Studies" || detectedDiscipline === "Commerce") {
      detectedDiscipline = "Customer Service & Sales Operations";
    }
  }
  if (/\b(computer science|cse|software engineering|b\.?tech|b\.?e\b|m\.?tech|mca|bca|full[- ]?stack|web development|frontend|backend|react|node|javascript|typescript|python|java|c\+\+|sql|database|data structures|algorithms|git)\b/i.test(fullCorpus)) {
    techScore += 10;
    if (techScore > nonTechScore) {
      detectedDiscipline = "Computer Science and Engineering";
    }
  }
  if (/\b(information technology|it engineering|cloud computing|devops|aws|docker|linux|networking|cybersecurity|system admin)\b/i.test(fullCorpus)) {
    techScore += 10;
    if (techScore > nonTechScore) {
      detectedDiscipline = "Information Technology";
    }
  }
  if (/\b(ai & ml|artificial intelligence|machine learning|deep learning|tensorflow|pytorch|scikit[- ]?learn|computer vision|nlp|neural network)\b/i.test(fullCorpus)) {
    techScore += 12;
    if (techScore > nonTechScore) {
      detectedDiscipline = "Artificial Intelligence and Machine Learning";
    }
  }
  if (/\b(ece|electronics|telecommunication|embedded|microcontroller|vlsi|verilog|vhdl|pcb|arm cortex|signals|iot)\b/i.test(fullCorpus)) {
    techScore += 12;
    if (techScore > nonTechScore) {
      detectedDiscipline = "Electronics and Communication";
    }
  }
  if (/\b(eee|electrical engineering|power systems|electrical machines|circuit theory|substation|transformers|matlab|simulink)\b/i.test(fullCorpus)) {
    techScore += 12;
    if (techScore > nonTechScore) {
      detectedDiscipline = "Electrical and Electronics";
    }
  }
  if (/\b(mechanical engineering|cad|autocad|solidworks|ansys|thermodynamics|fluid mechanics|finite element|fea|manufacturing|cnc)\b/i.test(fullCorpus)) {
    techScore += 12;
    if (techScore > nonTechScore) {
      detectedDiscipline = "Mechanical Engineering";
    }
  }
  if (/\b(civil engineering|etabs|staad\.?pro|structural analysis|surveying|concrete technology|geotechnical|construction management)\b/i.test(fullCorpus)) {
    techScore += 12;
    if (techScore > nonTechScore) {
      detectedDiscipline = "Civil Engineering";
    }
  }
  if (/\b(automobile engineering|automotive|ic engines|chassis|aerodynamics|vehicle dynamics|transmission)\b/i.test(fullCorpus)) {
    techScore += 12;
    if (techScore > nonTechScore) {
      detectedDiscipline = "Automobile Engineering";
    }
  }
  const hasNonTechDegree = /\b(b\.?com|m\.?com|bba|mba|bms|b\.?a\b|m\.?a\b|pgdm|ca|cfa|business analytics|commerce|arts|humanities|customer service|sales|marketing|hr)\b/i.test(degreeStr) || /\b(b\.?com|m\.?com|bba|mba|bms|b\.?a\b|m\.?a\b|business analytics|commerce|arts|humanities|customer service|sales|marketing|hr)\b/i.test(deptStr);
  const hasTechDegree = /\b(b\.?tech|b\.?e\b|m\.?tech|m\.?e\b|mca|bca|b\.?sc cs|b\.?sc it)\b/i.test(degreeStr) || /\b(engineering|technology|computer science)\b/i.test(deptStr);
  if (hasNonTechDegree && !hasTechDegree) {
    nonTechScore += 20;
  } else if (hasTechDegree && !hasNonTechDegree) {
    techScore += 20;
  }
  const isTechnical = techScore > nonTechScore && techScore > 0;
  const category = isTechnical ? "technical" : "non_technical";
  if (!isTechnical && (detectedDiscipline === "General Studies" || detectedDiscipline === "Computer Science and Engineering")) {
    detectedDiscipline = "Commerce & Business Administration";
  } else if (isTechnical && detectedDiscipline === "General Studies") {
    detectedDiscipline = "Computer Science and Engineering";
  }
  return {
    category,
    discipline: detectedDiscipline,
    isTechnical,
    confidenceScore: Math.min(95, Math.max(65, Math.abs(techScore - nonTechScore) * 5 + 60)),
    reason: isTechnical ? `Technical background verified from degree (${degreeStr || "Engineering"}), department (${deptStr || detectedDiscipline}), and technical project skills.` : `Non-technical educational background detected from discipline (${detectedDiscipline}), coursework, and resume skills.`
  };
}
function classifyCandidate(graduationYearOrResume, graduationMonth, experienceItems = [], explicitTotalExp, resumeContext, overrideBackground) {
  if (graduationYearOrResume && typeof graduationYearOrResume === "object" && ("education" in graduationYearOrResume || "skills" in graduationYearOrResume || "fullName" in graduationYearOrResume)) {
    const resume = graduationYearOrResume;
    const edu = resume.education && resume.education.length > 0 ? resume.education[0] : void 0;
    const targetYear = resume.graduationYear || edu?.graduationYear || edu?.year;
    const targetMonth = resume.graduationMonth || edu?.graduationMonth;
    const rawExp = resume.experience || [];
    const explicitExp = resume.totalProfessionalExperience;
    return classifyCandidate(
      targetYear,
      targetMonth,
      rawExp,
      explicitExp,
      resume,
      overrideBackground
    );
  }
  const rawYearStr = String(graduationYearOrResume || "").trim();
  const yearMatch = rawYearStr.match(/\b(20\d{2}|19\d{2})\b/);
  const yearNum = yearMatch ? parseInt(yearMatch[1], 10) : parseInt(rawYearStr, 10);
  const cleanYearStr = !isNaN(yearNum) ? String(yearNum) : rawYearStr;
  let normMonth = normalizeMonthName(graduationMonth);
  if (!normMonth && rawYearStr) {
    const foundMonth = MONTH_NAMES.find((m) => new RegExp(`\\b${m}\\b`, "i").test(rawYearStr));
    if (foundMonth) {
      normMonth = foundMonth;
    }
  }
  const { internships, employmentHistory, totalExperienceText } = separateInternshipsAndEmployment(experienceItems);
  const effectiveTotalExp = explicitTotalExp && explicitTotalExp.trim().length > 0 ? explicitTotalExp.trim() : totalExperienceText;
  const hasEmployment = employmentHistory.length > 0;
  const bgDetection = detectEducationalBackground(resumeContext || null);
  const userSelectedCategory = overrideBackground?.userSelectedCategory !== void 0 ? overrideBackground.userSelectedCategory : resumeContext?.userSelectedCategory ?? null;
  const isUserConfirmed = userSelectedCategory !== null;
  const educationalCategory = userSelectedCategory ?? overrideBackground?.educationalCategory ?? bgDetection.category;
  const discipline = overrideBackground?.discipline || bgDetection.discipline;
  const isTechnical = educationalCategory === "technical";
  const getRoundRecommendations = (track) => {
    if (userSelectedCategory) {
      if (userSelectedCategory === "technical") {
        return {
          recommendedPreparation: "Aptitude + Technical + HR Behaviour",
          recommendedRounds: ["aptitude", "technical", "hr"],
          optionalRounds: ["communication"]
        };
      } else {
        return {
          recommendedPreparation: "Aptitude + Communication + HR Behaviour",
          recommendedRounds: ["aptitude", "communication", "hr"],
          optionalRounds: []
        };
      }
    }
    if (isTechnical) {
      if (track === "fresher") {
        return {
          recommendedPreparation: "Aptitude + Technical + HR Behaviour (Optional Communication)",
          recommendedRounds: ["aptitude", "technical", "hr"],
          optionalRounds: ["communication"]
        };
      } else {
        return {
          recommendedPreparation: "Technical + HR Behaviour (Optional Communication)",
          recommendedRounds: ["technical", "hr"],
          optionalRounds: ["communication", "aptitude"]
        };
      }
    } else {
      if (track === "fresher") {
        return {
          recommendedPreparation: "Aptitude + Communication + HR Behaviour",
          recommendedRounds: ["aptitude", "communication", "hr"],
          optionalRounds: []
        };
      } else {
        return {
          recommendedPreparation: "Communication + HR Behaviour",
          recommendedRounds: ["communication", "hr"],
          optionalRounds: ["aptitude"]
        };
      }
    }
  };
  const hasSignificantEmployment = hasEmployment && (employmentHistory.length >= 2 || /(\b[1-9]\d*(\.\d+)?\s*years?\b)|202[0-4]\s*[-–]\s*(present|202[5-9])/i.test(effectiveTotalExp));
  if (!cleanYearStr || isNaN(yearNum) || yearNum < 1980 || yearNum > 2040) {
    if (hasEmployment && employmentHistory.length > 0) {
      const { recommendedPreparation: recommendedPreparation3, recommendedRounds: recommendedRounds3, optionalRounds: optionalRounds3 } = getRoundRecommendations("experienced");
      return {
        track: "experienced",
        candidateType: "EXPERIENCED PREPARATION TRACK",
        isFresher: false,
        educationalCategory,
        discipline,
        isTechnical,
        userSelectedCategory,
        isUserConfirmed,
        graduationBatch: "Experienced (Batch unstated)",
        graduationMonth: normMonth,
        graduationDateFormatted: "Professional Experience Track",
        isGraduationDateConfirmed: true,
        recommendedPreparation: recommendedPreparation3,
        recommendedRounds: recommendedRounds3,
        optionalRounds: optionalRounds3,
        totalYearsOfExperience: effectiveTotalExp,
        hasEmploymentHistory: true,
        explanationNote: `Professional employment verified (${effectiveTotalExp}) in ${discipline}. Classified as Experienced Preparation Track.`
      };
    }
    const { recommendedPreparation: recommendedPreparation2, recommendedRounds: recommendedRounds2, optionalRounds: optionalRounds2 } = getRoundRecommendations("fresher");
    return {
      track: "fresher",
      candidateType: "UNCONFIRMED",
      isFresher: true,
      educationalCategory,
      discipline,
      isTechnical,
      userSelectedCategory,
      isUserConfirmed,
      graduationBatch: cleanYearStr || "Unspecified",
      graduationMonth: normMonth,
      graduationDateFormatted: normMonth ? `${normMonth} (Year missing)` : "Unconfirmed",
      isGraduationDateConfirmed: false,
      recommendedPreparation: recommendedPreparation2,
      recommendedRounds: recommendedRounds2,
      optionalRounds: optionalRounds2,
      totalYearsOfExperience: effectiveTotalExp,
      hasEmploymentHistory: hasEmployment,
      explanationNote: `Graduation batch was not clearly detected in resume. Background detected as ${discipline} (${educationalCategory === "technical" ? "Technical Track" : "Non-Technical Track"}). Please confirm your graduation year and month.`
    };
  }
  const batchStr = String(yearNum);
  const formattedDate = normMonth ? `${normMonth} ${batchStr}` : batchStr;
  if (hasSignificantEmployment && yearNum > 2025) {
    const { recommendedPreparation: recommendedPreparation2, recommendedRounds: recommendedRounds2, optionalRounds: optionalRounds2 } = getRoundRecommendations("experienced");
    return {
      track: "experienced",
      candidateType: "EXPERIENCED PREPARATION TRACK",
      isFresher: false,
      educationalCategory,
      discipline,
      isTechnical,
      userSelectedCategory,
      isUserConfirmed,
      graduationBatch: batchStr,
      graduationMonth: normMonth,
      graduationDateFormatted: formattedDate,
      isGraduationDateConfirmed: true,
      recommendedPreparation: recommendedPreparation2,
      recommendedRounds: recommendedRounds2,
      optionalRounds: optionalRounds2,
      totalYearsOfExperience: effectiveTotalExp,
      hasEmploymentHistory: true,
      explanationNote: `Verified professional employment history (${effectiveTotalExp}) prioritized over academic batch date ${batchStr}. Classified as Experienced Preparation Track.`
    };
  }
  if (yearNum >= 2027) {
    const { recommendedPreparation: recommendedPreparation2, recommendedRounds: recommendedRounds2, optionalRounds: optionalRounds2 } = getRoundRecommendations("fresher");
    return {
      track: "fresher",
      candidateType: "FRESHER",
      isFresher: true,
      educationalCategory,
      discipline,
      isTechnical,
      userSelectedCategory,
      isUserConfirmed,
      graduationBatch: batchStr,
      graduationMonth: normMonth,
      graduationDateFormatted: formattedDate,
      isGraduationDateConfirmed: true,
      recommendedPreparation: recommendedPreparation2,
      recommendedRounds: recommendedRounds2,
      optionalRounds: optionalRounds2,
      totalYearsOfExperience: effectiveTotalExp,
      hasEmploymentHistory: hasEmployment,
      explanationNote: isTechnical ? `Batch of ${batchStr} (${discipline}): Pre-placement campus placement candidate eligible for full campus screening roadmap.` : `Batch of ${batchStr} (${discipline}): Non-technical candidate roadmap configured for Aptitude, Professional Communication, and HR Behaviour.`
    };
  }
  if (yearNum === 2026) {
    const { recommendedPreparation: recommendedPreparation2, recommendedRounds: recommendedRounds2, optionalRounds: optionalRounds2 } = getRoundRecommendations("fresher");
    return {
      track: "fresher",
      candidateType: "FRESHER",
      isFresher: true,
      educationalCategory,
      discipline,
      isTechnical,
      userSelectedCategory,
      isUserConfirmed,
      graduationBatch: batchStr,
      graduationMonth: normMonth,
      graduationDateFormatted: formattedDate,
      isGraduationDateConfirmed: true,
      recommendedPreparation: recommendedPreparation2,
      recommendedRounds: recommendedRounds2,
      optionalRounds: optionalRounds2,
      totalYearsOfExperience: effectiveTotalExp,
      hasEmploymentHistory: hasEmployment,
      explanationNote: isTechnical ? `Graduation Batch 2026 (${normMonth || "Academic Year 2026"} - ${discipline}): Classified as Technical Fresher Track under CareerCurve placement guidelines.` : `Graduation Batch 2026 (${normMonth || "Academic Year 2026"} - ${discipline}): Non-technical candidate track prioritizing Aptitude, Communication, and HR Behaviour practice.`
    };
  }
  const { recommendedPreparation, recommendedRounds, optionalRounds } = getRoundRecommendations("experienced");
  return {
    track: "experienced",
    candidateType: "EXPERIENCED PREPARATION TRACK",
    isFresher: false,
    educationalCategory,
    discipline,
    isTechnical,
    userSelectedCategory,
    isUserConfirmed,
    graduationBatch: batchStr,
    graduationMonth: normMonth,
    graduationDateFormatted: formattedDate,
    isGraduationDateConfirmed: true,
    recommendedPreparation,
    recommendedRounds,
    optionalRounds,
    totalYearsOfExperience: effectiveTotalExp,
    hasEmploymentHistory: hasEmployment,
    explanationNote: isTechnical ? `Graduation Batch ${batchStr} (${discipline}): Experienced Technical Preparation focusing on Technical & HR Behavioral interviews. Aptitude and Communication are available as optional practice.` : `Graduation Batch ${batchStr} (${discipline}): Experienced Non-Technical Preparation focusing on Professional Communication & HR Behavioral interviews. Aptitude is included; technical questions are omitted.`
  };
}
function enrichParsedResumeWithClassification(resume, overrideGraduation) {
  const edu = resume.education && resume.education.length > 0 ? resume.education[0] : void 0;
  const targetYear = overrideGraduation?.year || resume.graduationYear || edu?.graduationYear || edu?.year;
  const targetMonth = overrideGraduation?.month || resume.graduationMonth || edu?.graduationMonth;
  const rawExp = resume.experience || [];
  const { internships, employmentHistory, totalExperienceText } = separateInternshipsAndEmployment(rawExp);
  const explicitExp = resume.totalProfessionalExperience;
  const classification = classifyCandidate(
    targetYear,
    targetMonth,
    rawExp,
    explicitExp,
    resume,
    overrideGraduation
  );
  const finalUserSelected = overrideGraduation?.userSelectedCategory !== void 0 ? overrideGraduation.userSelectedCategory : resume.userSelectedCategory ?? null;
  return {
    ...resume,
    userSelectedCategory: finalUserSelected,
    department: resume.department || classification.discipline,
    graduationYear: classification.isGraduationDateConfirmed ? classification.graduationBatch : targetYear || "",
    graduationMonth: classification.graduationMonth,
    isGraduationDateConfirmed: classification.isGraduationDateConfirmed,
    classification,
    internships,
    employmentHistory,
    totalProfessionalExperience: classification.totalYearsOfExperience
  };
}

// src/nlp/nonTechnicalQuestionEngine.ts
var COMMERCE_QUESTIONS = [
  {
    domain: "commerce_accounting",
    domainLabel: "Commerce & Financial Accounting",
    questionText: "Can you explain the fundamental difference between Assets, Liabilities, and Equity on a company balance sheet, and how the accounting equation connects them?",
    contextOrScenario: "A foundational financial accounting scenario evaluating understanding of financial statements.",
    difficulty: "Beginner",
    primaryConcept: "Accounting Equation (Assets = Liabilities + Equity)",
    expectedKeywords: ["assets", "liabilities", "equity", "balance sheet", "accounting equation", "resources", "obligations", "capital", "shareholders"],
    modelAnswer: "The fundamental accounting equation is Assets = Liabilities + Shareholders\u2019 Equity. Assets represent economic resources owned by the business that offer future economic benefit (such as cash, inventory, accounts receivable, and equipment). Liabilities are financial obligations or debts owed to external creditors (such as loans, accounts payable, and accrued expenses). Equity represents the residual ownership interest of shareholders after deducting liabilities. Every financial transaction maintains this equilibrium.",
    scoringCriteria: {
      domainKnowledge: "Accurate definition of assets, liabilities, equity, and equation",
      practicalApplication: "Provides concrete examples of balance sheet line items",
      communicationClarity: "Clear, concise, professional financial vocabulary",
      professionalStructure: "Begins with equation, defines each component, and provides summary"
    }
  },
  {
    domain: "commerce_accounting",
    domainLabel: "Commerce & Financial Accounting",
    questionText: "What is Working Capital, why is it critical for daily business operations, and how do you calculate it?",
    contextOrScenario: "Liquidity and short-term financial management evaluation.",
    difficulty: "Intermediate",
    primaryConcept: "Working Capital & Liquidity Management",
    expectedKeywords: ["working capital", "current assets", "current liabilities", "liquidity", "short-term", "cash flow", "operational efficiency", "inventory", "receivables"],
    modelAnswer: "Working Capital measures a company\u2019s operational liquidity and short-term financial health, calculated as Current Assets minus Current Liabilities. Positive working capital indicates the company can easily settle short-term obligations due within a year while funding day-to-day operations like inventory purchases and payroll. Negative working capital signals potential liquidity distress or reliance on immediate cash turnaround.",
    scoringCriteria: {
      domainKnowledge: "Correct formula and distinction between current vs non-current items",
      practicalApplication: "Explains impact of positive vs negative working capital",
      communicationClarity: "Precise financial terminology without ambiguity",
      professionalStructure: "Defines formula, operational rationale, and risk implications"
    }
  },
  {
    domain: "commerce_accounting",
    domainLabel: "Commerce & Financial Accounting",
    questionText: "What is Goods and Services Tax (GST) or Sales Tax, and what is the difference between Input Tax Credit (ITC) and Output Tax liability?",
    contextOrScenario: "Indirect taxation and statutory compliance.",
    difficulty: "Intermediate",
    primaryConcept: "GST / Indirect Tax Mechanism & ITC",
    expectedKeywords: ["gst", "input tax credit", "itc", "output tax", "taxation", "invoice", "compliance", "value added", "supplier"],
    modelAnswer: "GST is a destination-based, comprehensive indirect consumption tax levied on the supply of goods and services. Output tax is the tax collected by a business from its customers when making sales. Input Tax Credit (ITC) allows businesses to deduct the tax they paid on purchases and business expenses from the output tax liability when paying the government. This prevents cascading taxation (tax on tax) and ensures only the incremental value addition is taxed.",
    scoringCriteria: {
      domainKnowledge: "Clear differentiation between input tax credit and output liability",
      practicalApplication: "Explains prevention of tax cascading with an example",
      communicationClarity: "Structured explanation of taxation compliance",
      professionalStructure: "Overview of GST, mechanics of ITC, practical significance"
    }
  },
  {
    domain: "commerce_accounting",
    domainLabel: "Commerce & Financial Accounting",
    questionText: "Explain the difference between Cash Flow and Profit. Why can a profitable company still face bankruptcy?",
    contextOrScenario: "Cash management vs accrual accounting evaluation.",
    difficulty: "Intermediate",
    primaryConcept: "Accrual Accounting vs Cash Flow Reality",
    expectedKeywords: ["cash flow", "profit", "accrual", "revenue recognition", "liquidity", "accounts receivable", "cash crunch", "operating cash", "bankruptcy"],
    modelAnswer: "Profit is calculated on an accrual basis where revenues are recognized when earned and expenses when incurred, regardless of when cash actually changes hands. Cash flow, on the other hand, tracks the physical inflows and outflows of liquid money. A company can show healthy accounting profits on its Income Statement while being insolvent if revenue is tied up in overdue Accounts Receivable or unsellable inventory, leaving it unable to pay suppliers, wages, or loan installments.",
    scoringCriteria: {
      domainKnowledge: "Understands accrual accounting vs cash accounting",
      practicalApplication: "Illustrates receivables lag or inventory tie-up causing insolvency",
      communicationClarity: "Clear, business-oriented explanation",
      professionalStructure: "Definitions, comparative contrast, real-world failure mode"
    }
  }
];
var MANAGEMENT_QUESTIONS = [
  {
    domain: "management_business",
    domainLabel: "Business Administration & Management",
    questionText: "Explain the four core functions of management\u2014Planning, Organizing, Leading, and Controlling (POLC)\u2014and how they apply to executing a business project.",
    contextOrScenario: "General management principles and execution framework.",
    difficulty: "Beginner",
    primaryConcept: "POLC Management Framework",
    expectedKeywords: ["planning", "organizing", "leading", "controlling", "polc", "objectives", "resource allocation", "leadership", "monitoring", "kpis"],
    modelAnswer: "The POLC framework outlines the essential responsibilities of a manager: Planning involves setting strategic goals, forecasting requirements, and outlining actionable steps. Organizing allocates tasks, establishes reporting structures, and distributes resources and budget. Leading focuses on motivating team members, communicating vision, resolving conflict, and guiding performance. Controlling monitors ongoing progress against established benchmarks and KPIs, implementing corrective actions when deviations occur.",
    scoringCriteria: {
      domainKnowledge: "All 4 functions accurately identified and defined",
      practicalApplication: "Maps POLC to practical project milestone delivery",
      communicationClarity: "Cohesive, executive-level communication",
      professionalStructure: "Systematic walkthrough of each function in logical sequence"
    }
  },
  {
    domain: "management_business",
    domainLabel: "Business Administration & Management",
    questionText: "How do you handle conflict between two team members who disagree on project priorities or responsibilities?",
    contextOrScenario: "Conflict resolution and interpersonal team management.",
    difficulty: "Intermediate",
    primaryConcept: "Workplace Conflict Resolution & Mediation",
    expectedKeywords: ["conflict", "active listening", "mediation", "alignment", "objective", "priorities", "collaboration", "expectations", "stakeholders"],
    modelAnswer: "I address conflict promptly rather than letting it fester. First, I meet individually with each team member to listen actively without judgment and identify root causes versus emotional reactions. Next, I bring both together in a neutral setting, re-aligning both parties around the shared project objective and organizational goals. We agree on explicit role boundaries and priority matrices, document agreed next steps, and schedule a follow-up checkpoint to ensure constructive collaboration.",
    scoringCriteria: {
      domainKnowledge: "Follows structured mediation and problem-solving methodology",
      practicalApplication: "Applies active listening, objective alignment, and follow-up",
      communicationClarity: "Empathetic and collaborative tone",
      professionalStructure: "Action-oriented chronological steps"
    }
  },
  {
    domain: "management_business",
    domainLabel: "Business Administration & Management",
    questionText: "What is SWOT Analysis, and how does a business use it to evaluate a new market opportunity or product launch?",
    contextOrScenario: "Strategic planning and market assessment.",
    difficulty: "Beginner",
    primaryConcept: "SWOT Strategic Assessment",
    expectedKeywords: ["swot", "strengths", "weaknesses", "opportunities", "threats", "internal", "external", "strategy", "market", "competitors"],
    modelAnswer: "SWOT Analysis evaluates internal Strengths and Weaknesses alongside external Opportunities and Threats. Strengths (e.g. proprietary technology, strong brand) and Weaknesses (e.g. limited capital, talent gaps) are within the organization\u2019s control. Opportunities (e.g. emerging market demand, regulatory tailwinds) and Threats (e.g. new competitors, supply disruption) arise from the macro environment. Businesses use SWOT to match internal advantages to external possibilities while mitigating vulnerabilities.",
    scoringCriteria: {
      domainKnowledge: "Clear internal vs external distinction and all four quadrants",
      practicalApplication: "Illustrates how insights convert into strategic action",
      communicationClarity: "Articulate business analysis terminology",
      professionalStructure: "Definition, quadrants breakdown, actionable strategic synthesis"
    }
  }
];
var ANALYTICS_QUESTIONS = [
  {
    domain: "business_analytics",
    domainLabel: "Business Analytics & Decision Science",
    questionText: "What is the role of Key Performance Indicators (KPIs) in business decision-making, and what makes a metric actionable versus a vanity metric?",
    contextOrScenario: "Business metrics and performance reporting.",
    difficulty: "Intermediate",
    primaryConcept: "Actionable KPIs vs Vanity Metrics",
    expectedKeywords: ["kpi", "metrics", "actionable", "vanity", "conversion", "decision making", "roi", "retention", "benchmarks", "data-driven"],
    modelAnswer: "A KPI is a quantifiable measure used to track performance against strategic business objectives. An actionable metric directly informs business decisions\u2014for instance, customer conversion rate or churn rate tells us exactly whether a marketing campaign or product onboarding requires adjustment. Conversely, a vanity metric (such as raw page views or social media likes) looks impressive on paper but offers no direct insight into revenue, user retention, or operational health.",
    scoringCriteria: {
      domainKnowledge: "Defines KPIs and clearly contrasts actionable vs vanity metrics",
      practicalApplication: "Uses realistic business examples like churn or conversion",
      communicationClarity: "Analytical, persuasive, and data-minded explanation",
      professionalStructure: "Concept definition, comparative contrast, operational application"
    }
  },
  {
    domain: "business_analytics",
    domainLabel: "Business Analytics & Decision Science",
    questionText: "How do you use Microsoft Excel or Google Sheets (such as Pivot Tables, VLOOKUP/XLOOKUP, and conditional formatting) to clean, analyze, and present a raw sales dataset?",
    contextOrScenario: "Practical spreadsheet modeling and data reporting.",
    difficulty: "Intermediate",
    primaryConcept: "Spreadsheet Data Cleaning & Analysis",
    expectedKeywords: ["excel", "pivot table", "vlookup", "xlookup", "data cleaning", "duplicates", "conditional formatting", "charts", "summary", "trends"],
    modelAnswer: "I start with data hygiene: removing duplicate rows, trimming whitespace, standardizing date formats, and checking for missing or corrupt values. Next, I utilize XLOOKUP or INDEX/MATCH to merge related datasets (such as matching Customer IDs with Sales Records). I construct Pivot Tables to aggregate data across dimensions like region, sales representative, or product category. Finally, I apply subtle conditional formatting to highlight outliers or top performers, and build clean summary charts to communicate key trends to stakeholders.",
    scoringCriteria: {
      domainKnowledge: "Demonstrates familiarity with lookup functions, pivot tables, and cleaning tools",
      practicalApplication: "Describes step-by-step workflow from messy data to executive summary",
      communicationClarity: "Clear, systematic methodology",
      professionalStructure: "Data hygiene -> transformation/lookup -> aggregation -> presentation"
    }
  }
];
var CUSTOMER_SUPPORT_QUESTIONS = [
  {
    domain: "customer_support_operations",
    domainLabel: "Customer Service & Operations",
    questionText: "Walk me through your step-by-step process for handling an irate customer who is shouting because their order was severely delayed or their account was erroneously billed.",
    contextOrScenario: "De-escalation and customer relationship management.",
    difficulty: "Intermediate",
    primaryConcept: "Customer De-escalation & Service Recovery",
    expectedKeywords: ["de-escalate", "active listening", "empathy", "apologize", "calm", "investigate", "solution", "compensation", "follow-up", "ticket"],
    modelAnswer: "First, I maintain composure and listen actively without interrupting, letting the customer express their frustration so they feel heard. I validate their emotion with sincere empathy, apologizing for the inconvenience without blaming colleagues or making defensive excuses. Once calm, I repeat the key issue to confirm alignment, open the ticket/CRM, and explain concrete steps I am taking immediately to resolve the billing or delivery issue. I provide an exact follow-up timeframe, deliver the promised resolution, and follow through with a satisfaction check.",
    scoringCriteria: {
      domainKnowledge: "Employs established customer service and de-escalation best practices",
      practicalApplication: "Demonstrates emotional intelligence and tangible resolution ownership",
      communicationClarity: "Empathetic, reassuring, and assertive tone",
      professionalStructure: "Listen -> Empathize -> Investigate -> Solve -> Follow Up"
    }
  },
  {
    domain: "customer_support_operations",
    domainLabel: "Customer Service & Operations",
    questionText: "What is a Service Level Agreement (SLA) in customer operations, and how do you prioritize incoming tickets when multiple urgent requests arrive simultaneously?",
    contextOrScenario: "Operational ticket management and SLA compliance.",
    difficulty: "Intermediate",
    primaryConcept: "SLA Prioritization & Ticket Queue Management",
    expectedKeywords: ["sla", "service level agreement", "tickets", "priority", "severity", "triage", "crm", "resolution time", "escalation", "urgency"],
    modelAnswer: "An SLA defines formal commitments between the service provider and customers regarding response time and resolution speed. When handling a surge of tickets, I triage based on severity and business impact rather than strict first-come-first-served order. Critical incidents (such as complete service outages or major payment processing failures) receive immediate priority and cross-functional escalation. For standard inquiries approaching their SLA deadline, I send proactive status updates to manage expectations.",
    scoringCriteria: {
      domainKnowledge: "Accurate definition of SLA and impact-based triage principles",
      practicalApplication: "Distinguishes between high-impact blockers vs routine inquiries",
      communicationClarity: "Methodical, operational, and customer-centric",
      professionalStructure: "SLA definition, triage matrix criteria, proactive communication strategy"
    }
  }
];
var OFFICE_ADMIN_QUESTIONS = [
  {
    domain: "office_admin_communication",
    domainLabel: "Office Administration & Professional Skills",
    questionText: "How do you ensure confidentiality and data privacy when managing sensitive documents, client correspondence, or executive scheduling?",
    contextOrScenario: "Data integrity, professional discretion, and office management.",
    difficulty: "Beginner",
    primaryConcept: "Workplace Confidentiality & Information Security",
    expectedKeywords: ["confidentiality", "privacy", "sensitive", "permission", "security", "password", "discretion", "compliance", "ndas", "protocol"],
    modelAnswer: "Maintaining confidentiality requires vigilance across physical and digital spaces. Digitally, I ensure sensitive files have strict role-based access permissions, passwords, and encryption, avoiding public links or unencrypted email attachments. Physically, I follow a clean-desk policy, locking printed documents and badge-protected areas. In conversations, I practice discretion by not discussing internal matters in communal or public areas and adhering strictly to organizational compliance protocols.",
    scoringCriteria: {
      domainKnowledge: "Covers digital security, physical security, and verbal discretion",
      practicalApplication: "Highlights role-based permissions and clean-desk practices",
      communicationClarity: "Professional and trustworthy tone",
      professionalStructure: "Digital measures, physical safeguards, ethical discretion"
    }
  },
  {
    domain: "office_admin_communication",
    domainLabel: "Office Administration & Professional Skills",
    questionText: "Describe your approach to drafting a formal business email to an external vendor regarding overdue deliverables or contract renegotiation.",
    contextOrScenario: "Executive written communication and vendor relations.",
    difficulty: "Beginner",
    primaryConcept: "Professional Business Correspondence & Etiquette",
    expectedKeywords: ["formal email", "subject line", "polite", "firm", "timeline", "action items", "vendor", "contract", "deliverables", "clarity"],
    modelAnswer: "I structure formal correspondence with clear clarity, professional politeness, and firm accountability. The subject line is specific, including the project name and deliverable reference. I open with a respectful greeting, state the current context referencing agreed contract dates, clearly outline the overdue items, and explain the downstream impact objectively. I specify concrete action items and request a revised timeline by an explicit deadline, closing with an open invitation for a brief alignment call.",
    scoringCriteria: {
      domainKnowledge: "Demonstrates professional email etiquette and business communication standards",
      practicalApplication: "Balances diplomacy with accountability",
      communicationClarity: "Clear, crisp, objective prose",
      professionalStructure: "Subject -> Context -> Impact -> Call to Action -> Closing"
    }
  }
];
function generateNonTechnicalQuestions(resume, count = 4) {
  const result = [];
  const dept = String(resume?.department || resume?.classification?.discipline || "").toLowerCase();
  const summary = String(resume?.summary || "").toLowerCase();
  const skills = (resume?.skills || []).map((s) => s.toLowerCase()).join(" ");
  const expText = (resume?.experience || []).map((e) => `${e.title} ${e.company} ${e.description}`).join(" ").toLowerCase();
  const combined = `${dept} ${summary} ${skills} ${expText}`;
  let pool = [];
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
  pool.push(...OFFICE_ADMIN_QUESTIONS);
  if (!isCommerce) pool.push(...COMMERCE_QUESTIONS.slice(0, 2));
  if (!isManagement) pool.push(...MANAGEMENT_QUESTIONS.slice(0, 2));
  if (resume?.projects && resume.projects.length > 0) {
    const proj = resume.projects[0];
    pool.unshift({
      domain: "resume_experience",
      domainLabel: "Resume Project & Practical Experience",
      questionText: `In your resume, you highlighted your project "${proj.title}". Could you walk me through the key objectives, the tools and methodologies you used, and the measurable results or impact achieved?`,
      contextOrScenario: "Direct validation of project experience detailed on candidate resume.",
      difficulty: "Intermediate",
      primaryConcept: "Project Execution & Business Impact",
      expectedKeywords: ["objective", "results", "challenges", "methodology", "tools", "impact", "teamwork", "outcome"],
      modelAnswer: `A comprehensive answer clearly states: 1) The project context and business problem addressed, 2) The candidate's specific hands-on role and tools utilized, 3) Key challenges encountered and how they were overcome, and 4) Concrete, measurable outcomes (e.g. time saved, efficiency improved, or satisfaction delivered).`,
      scoringCriteria: {
        domainKnowledge: "Demonstrates deep familiarity with their own project details",
        practicalApplication: "Connects methodology directly to measurable outcomes",
        communicationClarity: "Structured, confident storytelling",
        professionalStructure: "Situation -> Task -> Action -> Result (STAR method)"
      }
    });
  } else if (resume?.employmentHistory && resume.employmentHistory.length > 0) {
    const job = resume.employmentHistory[0];
    pool.unshift({
      domain: "resume_experience",
      domainLabel: "Resume Professional Experience",
      questionText: `At ${job.company || "your previous workplace"} where you served as ${job.title || "a team member"}, what were your core responsibilities and what was one significant achievement or problem you solved?`,
      contextOrScenario: "Validation of professional role accomplishments and day-to-day operations.",
      difficulty: "Intermediate",
      primaryConcept: "Workplace Contribution & Operational Ownership",
      expectedKeywords: ["responsibility", "problem", "solved", "achievement", "team", "process", "efficiency", "customer"],
      modelAnswer: `An effective answer describes the daily operational scope, identifies a specific operational roadblock or challenge faced, outlines the proactive steps taken to solve it, and shares the positive impact on team performance or customer experience.`,
      scoringCriteria: {
        domainKnowledge: "Clear articulation of operational responsibilities",
        practicalApplication: "Highlights tangible initiative and problem resolution",
        communicationClarity: "Clear, engaging, and professional communication",
        professionalStructure: "Role scope -> Challenge -> Action taken -> Tangible impact"
      }
    });
  }
  const uniqueQuestions = [];
  const seenTexts = /* @__PURE__ */ new Set();
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
function evaluateNonTechnicalAnswer(question, candidateAnswer, _resumeContext) {
  const answer = candidateAnswer.trim();
  const lower = answer.toLowerCase();
  const words = answer.split(/\s+/).filter((w) => w.length > 0);
  const wordCount = words.length;
  if (wordCount < 10) {
    return {
      questionId: question.id,
      questionText: question.questionText,
      candidateAnswer: answer,
      overallScore: 20,
      ratingBand: "Needs Practice",
      scores: {
        domainKnowledge: 5,
        practicalApplication: 5,
        communicationClarity: 5,
        professionalStructure: 5
      },
      strengths: ["Attempted to respond to the question"],
      areasForImprovement: [
        "Response was too brief to evaluate domain mastery. Please elaborate with detailed explanations and examples.",
        "Use specific industry terminology relevant to the topic."
      ],
      matchedKeywords: [],
      missingKeyConcepts: question.expectedKeywords.slice(0, 4),
      modelAnswerSummary: question.modelAnswer,
      feedbackNote: "Please provide a more complete, structured explanation demonstrating your understanding of the concept."
    };
  }
  const matchedKeywords = [];
  const missingKeyConcepts = [];
  for (const kw of question.expectedKeywords) {
    if (lower.includes(kw.toLowerCase())) {
      matchedKeywords.push(kw);
    } else {
      missingKeyConcepts.push(kw);
    }
  }
  const keywordCoverageRatio = question.expectedKeywords.length > 0 ? matchedKeywords.length / question.expectedKeywords.length : 0.5;
  const domainScore = Math.min(25, Math.max(8, Math.round(keywordCoverageRatio * 20 + (wordCount >= 40 ? 5 : 2))));
  const hasExample = /(for example|such as|in my experience|instance|specifically|we implemented|i managed|results|handling|steps|actions?)/i.test(lower);
  const appScore = Math.min(25, Math.max(10, Math.round((hasExample ? 18 : 12) + (wordCount >= 45 ? 6 : 3))));
  const clarityBase = wordCount >= 60 ? 22 : wordCount >= 40 ? 19 : 14;
  const clarityScore = Math.min(25, clarityBase);
  const hasConnectors = /(first|second|next|then|furthermore|additionally|therefore|overall|in conclusion|because|finally)/i.test(lower);
  const structureScore = Math.min(25, Math.max(10, hasConnectors ? 22 : 16));
  const totalScore = Math.min(100, domainScore + appScore + clarityScore + structureScore);
  let ratingBand = "Competent";
  if (totalScore >= 85) ratingBand = "Exceptional";
  else if (totalScore >= 70) ratingBand = "Proficient";
  else if (totalScore >= 50) ratingBand = "Competent";
  else ratingBand = "Needs Practice";
  const strengths = [];
  if (matchedKeywords.length >= 3) {
    strengths.push(`Strong domain terminology: effectively incorporated terms like "${matchedKeywords.slice(0, 3).join('", "')}".`);
  }
  if (hasExample) {
    strengths.push("Excellent practical contextualization: grounded the answer with a practical scenario or example.");
  }
  if (hasConnectors) {
    strengths.push("Well-organized structure: employed logical transitions and cohesive sequencing.");
  }
  if (wordCount >= 60) {
    strengths.push(`Good depth of explanation with ${wordCount} words delivered.`);
  }
  if (strengths.length === 0) {
    strengths.push("Addressed the core subject of the question directly.");
  }
  const areasForImprovement = [];
  if (missingKeyConcepts.length > 0) {
    areasForImprovement.push(`Incorporate key domain concepts such as: ${missingKeyConcepts.slice(0, 3).join(", ")}.`);
  }
  if (!hasExample) {
    areasForImprovement.push("Include a real-world scenario or practical metric to illustrate your explanation.");
  }
  if (!hasConnectors) {
    areasForImprovement.push('Use structured transitions (e.g., "First... Next... Finally...") to make your response even crisper.');
  }
  if (wordCount < 50) {
    areasForImprovement.push("Elaborate with greater detail to showcase comprehensive mastery.");
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
    feedbackNote: ratingBand === "Exceptional" || ratingBand === "Proficient" ? "Strong domain presentation with solid professional articulation!" : "Good effort. Review the model answer and incorporate more domain-specific examples for maximum impact."
  };
}

// scripts/testManualBackgroundSelectionAndRounds.ts
var mockStorage = /* @__PURE__ */ new Map();
var localStorageMock = {
  getItem: (key) => mockStorage.get(key) || null,
  setItem: (key, val) => mockStorage.set(key, String(val)),
  removeItem: (key) => mockStorage.delete(key),
  clear: () => mockStorage.clear()
};
var passed = 0;
var failed = 0;
function assert(condition, testName, detail) {
  if (condition) {
    console.log(`  [PASS] ${testName}`);
    passed++;
  } else {
    console.error(`  [FAIL] ${testName}${detail ? ` -> ${detail}` : ""}`);
    failed++;
  }
}
console.log("\n========================================================================");
console.log(" CAREERCURVE: MANUAL BACKGROUND SELECTION & DYNAMIC ROUNDS VERIFICATION");
console.log("========================================================================\n");
var mockBComExperienced = {
  fullName: "Pooja Verma",
  email: "pooja.verma@clientsupport.com",
  education: [{ degree: "Bachelor of Commerce (B.Com)", year: "2022" }],
  department: "Commerce & Accounting",
  graduationYear: "2022",
  skills: ["Customer Support", "CRM Data Entry", "Zendesk", "MS Excel", "Email Etiquette"],
  rawSkillsList: ["Customer Support", "CRM Data Entry", "Zendesk", "MS Excel", "Email Etiquette"],
  experience: [
    { title: "Customer Service Associate", company: "Global Connect BPO Services", description: "Handled customer queries via CRM chat and Zendesk", duration: "1.5 Years" },
    { title: "Sales Assistant", company: "Retail Solutions", description: "Customer returns processing in MS Excel", duration: "1 Year" }
  ],
  totalProfessionalExperience: "2.5 Years"
};
var mockBComFresher = {
  fullName: "Deepa Shah",
  email: "deepa.shah@commercestudent.edu",
  education: [{ degree: "Bachelor of Commerce (B.Com)", year: "2026" }],
  department: "Commerce",
  graduationYear: "2026",
  skills: ["Customer Support", "Office Administration", "Microsoft Word", "Microsoft Excel", "Google Workspace"],
  rawSkillsList: ["Customer Support", "Office Administration", "Microsoft Word", "Microsoft Excel", "Google Workspace"],
  projects: [
    { title: "Campus Student Service & Feedback Survey Analysis", description: "Tabulated 450+ responses in Google Sheets", technologies: ["Google Sheets", "Excel"] }
  ],
  experience: []
};
var mockCSEResume = {
  fullName: "Alex Rivers",
  email: "alex.rivers@devmail.com",
  education: [{ degree: "Bachelor of Technology in Computer Science & Engineering", year: "2025" }],
  department: "Computer Science and Engineering",
  graduationYear: "2025",
  skills: ["Python", "TypeScript", "React", "Node.js", "PostgreSQL", "Docker", "REST APIs"],
  rawSkillsList: ["Python", "TypeScript", "React", "Node.js", "PostgreSQL", "Docker", "REST APIs"],
  projects: [
    { title: "Real-Time Collaborative Canvas Platform", description: "WebSocket-backed canvas sync", technologies: ["React", "Node.js", "PostgreSQL"] }
  ],
  experience: []
};
console.log("--- TEST A: Sample_NonTechnical_Experienced_Resume (B.Com Customer Service) ---");
{
  const bg = detectEducationalBackground(mockBComExperienced);
  assert(bg.category === "non_technical", "Auto-detection suggests Non-Technical background for B.Com");
  const enriched = enrichParsedResumeWithClassification(mockBComExperienced, {
    userSelectedCategory: "non_technical"
  });
  assert(enriched.userSelectedCategory === "non_technical", "Authoritative selection recorded as non_technical");
  assert(enriched.classification?.isTechnical === false, "isTechnical is strictly false");
  assert(enriched.classification?.educationalCategory === "non_technical", "educationalCategory is non_technical");
  const recRounds = enriched.classification?.recommendedRounds || [];
  assert(recRounds.includes("aptitude"), "Aptitude round is included");
  assert(recRounds.includes("communication"), "Communication round is included");
  assert(recRounds.includes("hr"), "HR Behaviour round is included");
  assert(!recRounds.includes("technical"), "Technical round is STRICTLY EXCLUDED");
  assert(recRounds.length === 3, "Exactly 3 rounds recommended for Non-Technical candidate");
}
console.log("\n--- TEST B: Sample_NonTechnical_Fresher_Resume (B.Com Support / Admin Fresher) ---");
{
  const bg = detectEducationalBackground(mockBComFresher);
  assert(bg.category === "non_technical", "Auto-detection suggests Non-Technical background for B.Com Fresher");
  const enriched = enrichParsedResumeWithClassification(mockBComFresher, {
    userSelectedCategory: "non_technical"
  });
  assert(enriched.userSelectedCategory === "non_technical", "Authoritative selection recorded as non_technical");
  assert(enriched.classification?.isTechnical === false, "isTechnical is strictly false");
  assert(enriched.classification?.track === "fresher", "Candidate classified as fresher");
  const recRounds = enriched.classification?.recommendedRounds || [];
  assert(recRounds.includes("aptitude"), "Aptitude round is included");
  assert(recRounds.includes("communication"), "Communication round is included");
  assert(recRounds.includes("hr"), "HR Behaviour round is included");
  assert(!recRounds.includes("technical"), "Technical round is STRICTLY EXCLUDED for Fresher Non-Tech");
  assert(recRounds.length === 3, "Exactly 3 rounds recommended");
}
console.log("\n--- TEST C: Computer Science & Engineering Resume (Technical Student) ---");
{
  const bg = detectEducationalBackground(mockCSEResume);
  assert(bg.category === "technical", "Auto-detection suggests Technical background for CSE");
  const enriched = enrichParsedResumeWithClassification(mockCSEResume, {
    userSelectedCategory: "technical"
  });
  assert(enriched.userSelectedCategory === "technical", "Authoritative selection recorded as technical");
  assert(enriched.classification?.isTechnical === true, "isTechnical is true");
  assert(enriched.classification?.educationalCategory === "technical", "educationalCategory is technical");
  const recRounds = enriched.classification?.recommendedRounds || [];
  assert(recRounds.includes("aptitude"), "Aptitude round is included");
  assert(recRounds.includes("technical"), "Technical round is included");
  assert(recRounds.includes("hr"), "HR Behaviour round is included");
  assert(!recRounds.includes("communication"), "Communication is not in core 3 recommended (it is optional)");
  assert(recRounds.length === 3, "Exactly 3 core rounds recommended for Technical candidate");
}
console.log("\n--- TEST D: State Isolation \u2014 Non-Technical Uploaded After CSE ---");
{
  const initialCSEJourney = {
    id: "journey_cse_1",
    userId: "user_123",
    config: {
      candidateName: "Alex Rivers",
      email: "alex@dev.com",
      department: "Computer Science and Engineering",
      targetRole: "Software Engineer",
      difficulty: "Intermediate",
      mode: "Assessment Mode",
      aptitudeDurationMinutes: 10,
      technicalDurationMinutes: 15,
      hrDurationMinutes: 10,
      communicationDurationMinutes: 15,
      userSelectedCategory: "technical",
      educationalCategory: "technical",
      selectedRounds: ["aptitude", "technical", "hr"]
    },
    status: "in_progress",
    activeRoundIndex: 1,
    currentPhase: "in_progress",
    completedRounds: ["aptitude"],
    roundResults: {
      aptitude: { roundId: "aptitude", roundTitle: "Aptitude Round", scorePercentage: 80, completedAt: (/* @__PURE__ */ new Date()).toISOString() },
      technical: { roundId: "technical", roundTitle: "Technical Interview", scorePercentage: 90, completedAt: (/* @__PURE__ */ new Date()).toISOString() }
    },
    startedAt: (/* @__PURE__ */ new Date()).toISOString(),
    updatedAt: (/* @__PURE__ */ new Date()).toISOString()
  };
  localStorageMock.setItem("careercurve_interview_journey_user_123", JSON.stringify(initialCSEJourney));
  const updatedNonTech = enrichParsedResumeWithClassification(mockBComExperienced, {
    userSelectedCategory: "non_technical"
  });
  const newJourney = {
    id: "journey_bcom_2",
    userId: "user_123",
    config: {
      candidateName: updatedNonTech.fullName,
      email: updatedNonTech.email,
      department: updatedNonTech.department || "Commerce",
      targetRole: "Customer Support Specialist",
      difficulty: "Intermediate",
      mode: "Assessment Mode",
      aptitudeDurationMinutes: 10,
      technicalDurationMinutes: 15,
      hrDurationMinutes: 10,
      communicationDurationMinutes: 15,
      userSelectedCategory: "non_technical",
      educationalCategory: "non_technical",
      selectedRounds: ["aptitude", "communication", "hr"]
    },
    status: "in_progress",
    activeRoundIndex: 0,
    currentPhase: "form",
    completedRounds: [],
    roundResults: {},
    startedAt: (/* @__PURE__ */ new Date()).toISOString(),
    updatedAt: (/* @__PURE__ */ new Date()).toISOString()
  };
  localStorageMock.setItem("careercurve_interview_journey_user_123", JSON.stringify(newJourney));
  const stored = JSON.parse(localStorageMock.getItem("careercurve_interview_journey_user_123"));
  assert(stored.config.userSelectedCategory === "non_technical", "Stored userSelectedCategory updated to non_technical");
  assert(!stored.config.selectedRounds.includes("technical"), "Technical round completely purged from selectedRounds");
  assert(stored.config.selectedRounds.includes("communication"), "Communication round added to selectedRounds");
  assert(!("technical" in stored.roundResults), "Old CSE technical round results purged");
}
console.log("\n--- TEST E: State Isolation \u2014 CSE Uploaded After Non-Technical ---");
{
  const updatedCSE = enrichParsedResumeWithClassification(mockCSEResume, {
    userSelectedCategory: "technical"
  });
  const cseJourney = {
    id: "journey_cse_3",
    userId: "user_123",
    config: {
      candidateName: updatedCSE.fullName,
      email: updatedCSE.email,
      department: updatedCSE.department || "CSE",
      targetRole: "Software Engineer",
      difficulty: "Intermediate",
      mode: "Assessment Mode",
      aptitudeDurationMinutes: 10,
      technicalDurationMinutes: 15,
      hrDurationMinutes: 10,
      communicationDurationMinutes: 15,
      userSelectedCategory: "technical",
      educationalCategory: "technical",
      selectedRounds: ["aptitude", "technical", "hr"]
    },
    status: "in_progress",
    activeRoundIndex: 0,
    currentPhase: "form",
    completedRounds: [],
    roundResults: {},
    startedAt: (/* @__PURE__ */ new Date()).toISOString(),
    updatedAt: (/* @__PURE__ */ new Date()).toISOString()
  };
  localStorageMock.setItem("careercurve_interview_journey_user_123", JSON.stringify(cseJourney));
  const stored = JSON.parse(localStorageMock.getItem("careercurve_interview_journey_user_123"));
  assert(stored.config.userSelectedCategory === "technical", "Stored userSelectedCategory updated to technical");
  assert(stored.config.selectedRounds.includes("technical"), "Technical round restored in selectedRounds");
}
console.log("\n--- TEST F: Authoritative Manual Overrides ---");
{
  const overriddenToNonTech = enrichParsedResumeWithClassification(mockCSEResume, {
    userSelectedCategory: "non_technical"
  });
  assert(overriddenToNonTech.userSelectedCategory === "non_technical", "User manual selection overrides CSE detection");
  assert(overriddenToNonTech.classification?.isTechnical === false, "isTechnical is forced false by user override");
  assert(overriddenToNonTech.classification?.educationalCategory === "non_technical", "educationalCategory set to non_technical");
  assert(!overriddenToNonTech.classification?.recommendedRounds.includes("technical"), "Technical round suppressed on override");
  assert(overriddenToNonTech.classification?.recommendedRounds.includes("communication"), "Communication round activated on override");
  const overriddenToTech = enrichParsedResumeWithClassification(mockBComFresher, {
    userSelectedCategory: "technical"
  });
  assert(overriddenToTech.userSelectedCategory === "technical", "User manual selection overrides Commerce detection");
  assert(overriddenToTech.classification?.isTechnical === true, "isTechnical is forced true by user override");
  assert(overriddenToTech.classification?.educationalCategory === "technical", "educationalCategory set to technical");
  assert(overriddenToTech.classification?.recommendedRounds.includes("technical"), "Technical round activated on override");
}
console.log("\n--- TEST G: Non-Technical NLP Question Engine & Evaluation ---");
{
  const bcomQuestions = generateNonTechnicalQuestions(mockBComExperienced, 4);
  assert(bcomQuestions.length === 4, `Generated ${bcomQuestions.length} non-technical questions`);
  const hasCustService = bcomQuestions.some((q) => q.domain === "customer_support_operations" || q.domain === "resume_experience");
  assert(hasCustService, "Generated questions relevant to customer service and resume experience");
  const sampleQ = bcomQuestions[0];
  const strongAnswer = `In handling an irate customer, I first maintain composure and practice active listening without interrupting. I validate their frustration with sincere empathy, apologizing for the inconvenience. Next, I investigate the billing issue in our CRM ticket system, explain the concrete corrective steps being taken, and establish a clear timeline. Finally, I follow up to confirm satisfaction and customer retention.`;
  const evalResult = evaluateNonTechnicalAnswer(sampleQ, strongAnswer, mockBComExperienced);
  assert(evalResult.overallScore >= 70, `Strong answer achieved score ${evalResult.overallScore} >= 70`);
  assert(evalResult.ratingBand === "Proficient" || evalResult.ratingBand === "Exceptional", `Answer rated as ${evalResult.ratingBand}`);
  assert(evalResult.matchedKeywords.length >= 2, `Keywords matched: ${evalResult.matchedKeywords.join(", ")}`);
  assert(evalResult.strengths.length > 0, `Strengths identified: ${evalResult.strengths[0]}`);
  const weakAnswer = "I just say sorry.";
  const weakEval = evaluateNonTechnicalAnswer(sampleQ, weakAnswer, mockBComExperienced);
  assert(weakEval.overallScore < 50, `Weak answer correctly scored low (${weakEval.overallScore})`);
  assert(weakEval.ratingBand === "Needs Practice", 'Weak answer assigned "Needs Practice" rating band');
}
console.log("\n========================================================================");
console.log(` TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
console.log("========================================================================\n");
if (failed > 0) {
  process.exit(1);
}
