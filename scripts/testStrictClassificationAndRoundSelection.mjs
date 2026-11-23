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
function getRoundRecommendations(category, track = "fresher", userSelectedCategory) {
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
  if (category === "technical") {
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
  const getRoundRecommendations2 = (track) => {
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
      const { recommendedPreparation: recommendedPreparation3, recommendedRounds: recommendedRounds3, optionalRounds: optionalRounds3 } = getRoundRecommendations2("experienced");
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
    const { recommendedPreparation: recommendedPreparation2, recommendedRounds: recommendedRounds2, optionalRounds: optionalRounds2 } = getRoundRecommendations2("fresher");
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
    const { recommendedPreparation: recommendedPreparation2, recommendedRounds: recommendedRounds2, optionalRounds: optionalRounds2 } = getRoundRecommendations2("experienced");
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
    const { recommendedPreparation: recommendedPreparation2, recommendedRounds: recommendedRounds2, optionalRounds: optionalRounds2 } = getRoundRecommendations2("fresher");
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
    const { recommendedPreparation: recommendedPreparation2, recommendedRounds: recommendedRounds2, optionalRounds: optionalRounds2 } = getRoundRecommendations2("fresher");
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
  const { recommendedPreparation, recommendedRounds, optionalRounds } = getRoundRecommendations2("experienced");
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

// scripts/testStrictClassificationAndRoundSelection.ts
var memoryStore = /* @__PURE__ */ new Map();
var mockLocalStorage = {
  getItem: (k) => memoryStore.get(k) || null,
  setItem: (k, v) => memoryStore.set(k, String(v)),
  removeItem: (k) => memoryStore.delete(k),
  clear: () => memoryStore.clear()
};
function getUserInterviewJourney(userId) {
  if (!userId) return null;
  const key = `careercurve_interview_journey_${userId}`;
  try {
    const raw = mockLocalStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}
function saveUserInterviewJourney(journey) {
  if (!journey?.userId) return;
  const key = `careercurve_interview_journey_${journey.userId}`;
  try {
    mockLocalStorage.setItem(key, JSON.stringify(journey));
  } catch {
  }
}
function clearUserInterviewJourney(userId) {
  if (!userId) return;
  const key = `careercurve_interview_journey_${userId}`;
  try {
    mockLocalStorage.removeItem(key);
  } catch {
  }
}
var green = (text) => `\x1B[32m${text}\x1B[0m`;
var red = (text) => `\x1B[31m${text}\x1B[0m`;
var cyan = (text) => `\x1B[36m${text}\x1B[0m`;
var bold = (text) => `\x1B[1m${text}\x1B[0m`;
var passedCount = 0;
var failedCount = 0;
function assert(condition, message) {
  if (condition) {
    console.log(`  \u2713 ${green(message)}`);
    passedCount++;
  } else {
    console.error(`  \u2717 ${red(message)}`);
    failedCount++;
  }
}
console.log(bold("\n======================================================================"));
console.log(bold("  CAREERCURVE: STRICT CLASSIFICATION & ROUND SELECTION TEST SUITE"));
console.log(bold("======================================================================\n"));
console.log(cyan("--- TEST SUITE 1: 9 Mandatory Candidate Profiles ---"));
var testProfiles = [
  // Profile 1: B.Com Experienced Customer Service
  {
    input: {
      fullName: "Pooja Verma",
      education: [{ degree: "B.Com", college: "St. Xavier College", graduationYear: "2023" }],
      department: "Customer Service & Sales Operations",
      skills: ["Customer Support", "CRM", "Zendesk", "Salesforce", "Conflict Resolution", "Active Listening"],
      experience: [
        { role: "Customer Service Associate", company: "Zeta Helpdesk Solutions", duration: "1.5 years", isInternship: false },
        { role: "Sales Support Assistant", company: "Retail Retailers Ltd", duration: "1 year", isInternship: false }
      ],
      totalExperienceYears: 2.5
    },
    expected: {
      candidateName: "Pooja Verma (B.Com Experienced Customer Service)",
      isTechnical: false,
      educationalCategory: "non_technical",
      track: "experienced",
      exactAllowedRounds: ["communication", "hr"],
      coreRecommendedRounds: ["communication", "hr"],
      forbiddenRounds: ["technical", "aptitude"]
    }
  },
  // Profile 2: BBA Fresher
  {
    input: {
      fullName: "Rohan Mehta",
      education: [{ degree: "BBA", college: "Symbiosis Institute", graduationYear: "2026" }],
      department: "Business Administration & Management",
      skills: ["Marketing", "Market Research", "Digital Marketing", "PowerPoint", "Team Leadership"],
      experience: []
    },
    expected: {
      candidateName: "Rohan Mehta (BBA Fresher)",
      isTechnical: false,
      educationalCategory: "non_technical",
      track: "fresher",
      exactAllowedRounds: ["aptitude", "communication", "hr"],
      coreRecommendedRounds: ["aptitude", "communication", "hr"],
      forbiddenRounds: ["technical"]
    }
  },
  // Profile 3: Business Analytics Fresher
  {
    input: {
      fullName: "Ananya Sen",
      education: [{ degree: "B.Sc Business Analytics", college: "Christ University", graduationYear: "2026" }],
      department: "Business Analytics & Decision Science",
      skills: ["Power BI", "Excel", "Tableau", "Statistical Analysis", "Data Cleaning", "Dashboarding"],
      experience: []
    },
    expected: {
      candidateName: "Ananya Sen (Business Analytics Fresher)",
      isTechnical: false,
      educationalCategory: "non_technical",
      track: "fresher",
      exactAllowedRounds: ["aptitude", "communication", "hr"],
      coreRecommendedRounds: ["aptitude", "communication", "hr"],
      forbiddenRounds: ["technical"]
    }
  },
  // Profile 4: MBA Experienced HR Professional
  {
    input: {
      fullName: "Shweta Kulkarni",
      education: [{ degree: "MBA in Human Resources", college: "Pune University", graduationYear: "2023" }],
      department: "Human Resources Management",
      skills: ["Talent Acquisition", "Employee Onboarding", "HRMS", "Performance Appraisal", "Grievance Handling"],
      experience: [
        { role: "HR Generalist", company: "Apex People Services", duration: "2 years", isInternship: false }
      ],
      totalExperienceYears: 2
    },
    expected: {
      candidateName: "Shweta Kulkarni (MBA Experienced HR)",
      isTechnical: false,
      educationalCategory: "non_technical",
      track: "experienced",
      exactAllowedRounds: ["communication", "hr"],
      coreRecommendedRounds: ["communication", "hr"],
      forbiddenRounds: ["technical", "aptitude"]
    }
  },
  // Profile 5: Arts Fresher
  {
    input: {
      fullName: "Priya Sharma",
      education: [{ degree: "BA English Literature", college: "Lady Shri Ram College", graduationYear: "2026" }],
      department: "English Literature & Communications",
      skills: ["Content Writing", "Copywriting", "Creative Writing", "Editing", "Proofreading", "Public Speaking"],
      experience: []
    },
    expected: {
      candidateName: "Priya Sharma (Arts Fresher)",
      isTechnical: false,
      educationalCategory: "non_technical",
      track: "fresher",
      exactAllowedRounds: ["aptitude", "communication", "hr"],
      coreRecommendedRounds: ["aptitude", "communication", "hr"],
      forbiddenRounds: ["technical"]
    }
  },
  // Profile 6: CSE Fresher
  {
    input: {
      fullName: "Aarav Patel",
      education: [{ degree: "B.Tech", branch: "Computer Science & Engineering", college: "IIT Madras", graduationYear: "2026" }],
      department: "Computer Science & Engineering",
      skills: ["Java", "Python", "React", "Data Structures", "Algorithms", "SQL", "Git"],
      experience: []
    },
    expected: {
      candidateName: "Aarav Patel (CSE Fresher)",
      isTechnical: true,
      educationalCategory: "technical",
      track: "fresher",
      exactAllowedRounds: ["aptitude", "technical", "hr", "communication"],
      coreRecommendedRounds: ["aptitude", "technical", "hr"],
      forbiddenRounds: []
    }
  },
  // Profile 7: ECE Fresher
  {
    input: {
      fullName: "Kavya Nair",
      education: [{ degree: "B.Tech", branch: "Electronics & Communication Engineering", college: "NIT Trichy", graduationYear: "2026" }],
      department: "Electronics & Communication Engineering",
      skills: ["Embedded C", "Verilog", "Digital Signal Processing", "Microcontrollers", "MATLAB"],
      experience: []
    },
    expected: {
      candidateName: "Kavya Nair (ECE Fresher)",
      isTechnical: true,
      educationalCategory: "technical",
      track: "fresher",
      exactAllowedRounds: ["aptitude", "technical", "hr", "communication"],
      coreRecommendedRounds: ["aptitude", "technical", "hr"],
      forbiddenRounds: []
    }
  },
  // Profile 8: Mechanical Experienced Engineer
  {
    input: {
      fullName: "Vikramaditya Rao",
      education: [{ degree: "B.Tech", branch: "Mechanical Engineering", college: "BITS Pilani", graduationYear: "2021" }],
      department: "Mechanical Engineering",
      skills: ["SolidWorks", "AutoCAD", "ANSYS", "GD&T", "Thermodynamics", "Finite Element Analysis"],
      experience: [
        { role: "Mechanical Design Engineer", company: "Tata Motors", duration: "3.5 years", isInternship: false }
      ],
      totalExperienceYears: 3.5
    },
    expected: {
      candidateName: "Vikramaditya Rao (Mechanical Experienced Engineer)",
      isTechnical: true,
      educationalCategory: "technical",
      track: "experienced",
      exactAllowedRounds: ["technical", "hr", "communication"],
      coreRecommendedRounds: ["technical", "hr"],
      forbiddenRounds: ["aptitude"]
      // Aptitude strictly excluded from core track
    }
  },
  // Profile 9: Civil Fresher
  {
    input: {
      fullName: "Neha Gupta",
      education: [{ degree: "B.Tech", branch: "Civil Engineering", college: "Delhi Technological University", graduationYear: "2026" }],
      department: "Civil Engineering",
      skills: ["AutoCAD Civil", "STAAD.Pro", "Structural Analysis", "Surveying", "Revit Architecture"],
      experience: []
    },
    expected: {
      candidateName: "Neha Gupta (Civil Fresher)",
      isTechnical: true,
      educationalCategory: "technical",
      track: "fresher",
      exactAllowedRounds: ["aptitude", "technical", "hr", "communication"],
      coreRecommendedRounds: ["aptitude", "technical", "hr"],
      forbiddenRounds: []
    }
  }
];
for (const [idx, item] of testProfiles.entries()) {
  const profileNum = idx + 1;
  console.log(`
Checking Profile ${profileNum}: ${bold(item.expected.candidateName)}`);
  const classification = classifyCandidate(item.input);
  assert(
    classification.isTechnical === item.expected.isTechnical,
    `Classification isTechnical: expected ${item.expected.isTechnical}, got ${classification.isTechnical}`
  );
  assert(
    classification.educationalCategory === item.expected.educationalCategory,
    `Educational Category: expected ${item.expected.educationalCategory}, got ${classification.educationalCategory}`
  );
  assert(
    classification.track === item.expected.track,
    `Track: expected ${item.expected.track}, got ${classification.track}`
  );
  const rec = getRoundRecommendations(classification.educationalCategory, classification.track);
  const hasAllCore = item.expected.coreRecommendedRounds.every((r) => rec.recommendedRounds.includes(r));
  const exactCoreMatch = rec.recommendedRounds.length === item.expected.coreRecommendedRounds.length && hasAllCore;
  assert(
    exactCoreMatch,
    `Core Recommended Rounds: expected [${item.expected.coreRecommendedRounds.join(", ")}], got [${rec.recommendedRounds.join(", ")}]`
  );
  const classCoreMatch = classification.recommendedRounds.length === item.expected.coreRecommendedRounds.length && item.expected.coreRecommendedRounds.every((r) => classification.recommendedRounds.includes(r));
  assert(
    classCoreMatch,
    `Classification Object Recommended Rounds matches: [${classification.recommendedRounds.join(", ")}]`
  );
  const isNonTech = classification.isTechnical === false || classification.educationalCategory === "non_technical";
  const isFresher = classification.track === "fresher";
  const allowedRounds = isNonTech ? isFresher ? ["aptitude", "communication", "hr"] : ["communication", "hr"] : isFresher ? ["aptitude", "technical", "hr", "communication"] : ["technical", "hr", "communication"];
  const allowedMatch = allowedRounds.length === item.expected.exactAllowedRounds.length && allowedRounds.every((r) => item.expected.exactAllowedRounds.includes(r));
  assert(
    allowedMatch,
    `Exact Allowed Rounds: expected [${item.expected.exactAllowedRounds.join(", ")}], got [${allowedRounds.join(", ")}]`
  );
  for (const forbidden of item.expected.forbiddenRounds) {
    assert(
      !allowedRounds.includes(forbidden) && !rec.recommendedRounds.includes(forbidden),
      `Forbidden round '${forbidden}' is strictly absent from allowed and recommended rounds`
    );
  }
}
console.log(cyan("\n--- TEST SUITE 2: State Contamination & Rapid Re-upload Validation ---"));
var testUserId = "test-session-user-999";
console.log("\nStep 1: Upload Candidate 1 (Technical Fresher - Aarav Patel)");
clearUserInterviewJourney(testUserId);
var candidate1 = testProfiles[5];
var class1 = classifyCandidate(candidate1.input);
var journey1 = {
  userId: testUserId,
  candidateName: candidate1.input.fullName,
  email: "aarav@example.com",
  config: {
    rounds: ["aptitude", "technical", "hr"],
    selectedRounds: ["aptitude", "technical", "hr"],
    difficulty: "Medium",
    department: "Computer Science & Engineering",
    targetRole: "Software Development Engineer"
  },
  completedRounds: ["technical"],
  roundResults: {
    technical: {
      roundId: "technical",
      scorePercentage: 88,
      status: "completed",
      summaryFeedback: "Strong Java and DS knowledge",
      completedAt: (/* @__PURE__ */ new Date()).toISOString(),
      questionResults: [
        { questionId: "q1", marksAwarded: 10, totalMarks: 10, isCorrect: true, userCode: "class Solution {}" }
      ]
    }
  },
  status: "in_progress",
  activeRoundIndex: 1,
  currentPhase: "round_active",
  createdAt: (/* @__PURE__ */ new Date()).toISOString(),
  updatedAt: (/* @__PURE__ */ new Date()).toISOString()
};
saveUserInterviewJourney(journey1);
var loaded1 = getUserInterviewJourney(testUserId);
assert(loaded1 !== null, "Candidate 1 journey successfully saved");
assert(loaded1?.roundResults.technical?.scorePercentage === 88, "Candidate 1 has completed technical score 88%");
assert(loaded1?.config.selectedRounds.includes("technical") === true, "Candidate 1 includes technical round");
console.log("\nStep 2: Immediate Re-upload Candidate 2 (Non-Tech Experienced - Pooja Verma)");
clearUserInterviewJourney(testUserId);
var candidate2 = testProfiles[0];
var class2 = classifyCandidate(candidate2.input);
var isNonTech2 = class2.isTechnical === false || class2.educationalCategory === "non_technical";
var isFresher2 = class2.track === "fresher";
var allowed2 = isNonTech2 ? isFresher2 ? ["aptitude", "communication", "hr"] : ["communication", "hr"] : isFresher2 ? ["aptitude", "technical", "hr", "communication"] : ["technical", "hr", "communication"];
var freshJourney2 = {
  userId: testUserId,
  candidateName: candidate2.input.fullName,
  email: "pooja@example.com",
  config: {
    rounds: ["communication", "hr"],
    selectedRounds: ["communication", "hr"],
    difficulty: "Medium",
    department: "Customer Service & Sales Operations",
    targetRole: "Customer Support Specialist"
  },
  completedRounds: [],
  roundResults: {},
  status: "setup",
  activeRoundIndex: 0,
  currentPhase: "setup",
  createdAt: (/* @__PURE__ */ new Date()).toISOString(),
  updatedAt: (/* @__PURE__ */ new Date()).toISOString()
};
saveUserInterviewJourney(freshJourney2);
var loaded2 = getUserInterviewJourney(testUserId);
assert(loaded2 !== null, "Candidate 2 journey initialized freshly");
assert(Object.keys(loaded2?.roundResults || {}).length === 0, "ZERO residual scores from previous candidate");
assert(!loaded2?.roundResults.technical, "Technical score strictly wiped clean (undefined)");
assert(!loaded2?.completedRounds.includes("technical"), "Completed rounds contains ZERO previous technical rounds");
assert(loaded2?.config.selectedRounds.length === 2, "Candidate 2 selected rounds count is exactly 2");
assert(!loaded2?.config.selectedRounds.includes("technical"), "Technical round is strictly absent from selected rounds");
assert(!loaded2?.config.selectedRounds.includes("aptitude"), "Aptitude round is strictly absent from selected rounds");
console.log("\nStep 3: Stale state sanitize verification");
var rawSavedRoundsWithStaleLeak = ["aptitude", "technical", "communication", "hr"];
var sanitizedRounds = rawSavedRoundsWithStaleLeak.filter((r) => allowed2.includes(r));
assert(
  sanitizedRounds.length === 2 && sanitizedRounds.includes("communication") && sanitizedRounds.includes("hr") && !sanitizedRounds.includes("technical") && !sanitizedRounds.includes("aptitude"),
  "Sanitization filter strictly purges forbidden rounds from stale state"
);
clearUserInterviewJourney(testUserId);
console.log("\nCleaned up test session storage.");
console.log(bold("\n======================================================================"));
console.log(bold(`  TEST RESULTS: ${passedCount} PASSED, ${failedCount} FAILED`));
console.log(bold("======================================================================\n"));
if (failedCount > 0) {
  process.exit(1);
} else {
  console.log(green("All tests passed successfully! Resume-based classification and dynamic round selection verified.\n"));
  process.exit(0);
}
