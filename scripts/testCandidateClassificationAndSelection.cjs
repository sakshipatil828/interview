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
  const deptStr = `${resume.department || ""} ${edu?.branch || ""} ${edu?.fieldOfStudy || ""} ${profileDepartment || ""}`.toLowerCase();
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
  const hasNonTechDegree = /\b(b\.?com|m\.?com|bba|mba|bms|b\.?a\b|m\.?a\b|pgdm|ca|cfa|business analytics|commerce|arts|humanities)\b/i.test(degreeStr) || /\b(b\.?com|m\.?com|bba|mba|bms|b\.?a\b|m\.?a\b|business analytics|commerce|arts|humanities)\b/i.test(deptStr);
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
  const educationalCategory = overrideBackground?.educationalCategory || bgDetection.category;
  const discipline = overrideBackground?.discipline || bgDetection.discipline;
  const isTechnical = educationalCategory === "technical";
  const getRoundRecommendations = (track) => {
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
  if (!cleanYearStr || isNaN(yearNum) || yearNum < 1980 || yearNum > 2040) {
    const { recommendedPreparation: recommendedPreparation2, recommendedRounds: recommendedRounds2, optionalRounds: optionalRounds2 } = getRoundRecommendations("fresher");
    return {
      track: "fresher",
      candidateType: "UNCONFIRMED",
      isFresher: true,
      educationalCategory,
      discipline,
      isTechnical,
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
  if (yearNum >= 2027) {
    const { recommendedPreparation: recommendedPreparation2, recommendedRounds: recommendedRounds2, optionalRounds: optionalRounds2 } = getRoundRecommendations("fresher");
    return {
      track: "fresher",
      candidateType: "FRESHER",
      isFresher: true,
      educationalCategory,
      discipline,
      isTechnical,
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
    graduationBatch: batchStr,
    graduationMonth: normMonth,
    graduationDateFormatted: formattedDate,
    isGraduationDateConfirmed: true,
    recommendedPreparation,
    recommendedRounds,
    optionalRounds,
    totalYearsOfExperience: effectiveTotalExp,
    hasEmploymentHistory: hasEmployment,
    explanationNote: isTechnical ? `Graduation Batch ${batchStr} (${discipline}): Experienced Technical Preparation focusing on Technical & HR Behavioral interviews. Aptitude and Communication are available as optional practice.` : `Graduation Batch ${batchStr} (${discipline}): Experienced Non-Technical Preparation focusing on Professional Communication & HR Behavioral interviews. Aptitude is optional; technical questions are omitted.`
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
  return {
    ...resume,
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

// scripts/testCandidateClassificationAndSelection.ts
function assert(condition, message) {
  if (!condition) {
    console.error(`\u274C FAILED: ${message}`);
    process.exit(1);
  }
  console.log(`\u2713 PASSED: ${message}`);
}
console.log("================================================================");
console.log("\u{1F680} CareerCurve \u2014 Candidate Classification & Selection Test Suite");
console.log("================================================================\n");
console.log("--- Test Group 1: 2027 Graduating Batch (Fresher) ---");
var fresher2027 = classifyCandidate(2027, "May");
assert(fresher2027.track === "fresher", "2027 batch must be classified as fresher");
assert(fresher2027.candidateType === "FRESHER", "2027 batch candidateType must be FRESHER");
assert(
  JSON.stringify(fresher2027.recommendedRounds) === JSON.stringify(["aptitude", "technical", "hr"]),
  "2027 Fresher must be recommended Aptitude + Technical + HR Behaviour"
);
assert(fresher2027.isGraduationDateConfirmed === true, "Date is confirmed");
console.log("\n--- Test Group 2: 2026 Graduating Batch (Fresher) ---");
var fresher2026Nov = classifyCandidate(2026, "November");
assert(fresher2026Nov.track === "fresher", "2026 Nov batch must be classified as fresher");
assert(fresher2026Nov.candidateType === "FRESHER", "2026 Nov batch candidateType must be FRESHER");
assert(
  JSON.stringify(fresher2026Nov.recommendedRounds) === JSON.stringify(["aptitude", "technical", "hr"]),
  "2026 Fresher must be recommended Aptitude + Technical + HR Behaviour"
);
var fresher2026Dec = classifyCandidate(2026, "December");
assert(fresher2026Dec.track === "fresher", "2026 post-Nov batch must be classified as fresher");
console.log("\n--- Test Group 3: 2025 & 2024 Batches (Experienced Preparation Track) ---");
var experienced2025 = classifyCandidate(2025, "June");
assert(
  experienced2025.track === "experienced",
  "2025 batch must be classified as experienced preparation track"
);
assert(
  experienced2025.candidateType === "EXPERIENCED PREPARATION TRACK",
  "2025 batch candidateType must be EXPERIENCED PREPARATION TRACK"
);
assert(
  JSON.stringify(experienced2025.recommendedRounds) === JSON.stringify(["technical", "hr"]),
  "2025 batch must be recommended Technical + HR Behaviour (Aptitude optional)"
);
var experienced2024 = classifyCandidate(2024, "May");
assert(
  experienced2024.track === "experienced",
  "2024 batch must be classified as experienced preparation track"
);
assert(
  JSON.stringify(experienced2024.recommendedRounds) === JSON.stringify(["technical", "hr"]),
  "2024 batch must be recommended Technical + HR Behaviour"
);
console.log("\n--- Test Group 4: Missing or Unclear Graduation Date ---");
var missingGrad = classifyCandidate(void 0, void 0);
assert(missingGrad.candidateType === "UNCONFIRMED", "Missing date must be unconfirmed");
assert(missingGrad.isGraduationDateConfirmed === false, "isGraduationDateConfirmed must be false");
assert(
  missingGrad.explanationNote.includes("confirm"),
  "Candidate explanationNote must prompt user to confirm graduation year and month"
);
console.log("\n--- Test Group 5: Interactive Confirmation & Adjustment ---");
var confirmedFromUnconfirmed = classifyCandidate(2025, "June");
assert(
  confirmedFromUnconfirmed.track === "experienced",
  "Confirmed 2025 should update track to experienced"
);
assert(
  confirmedFromUnconfirmed.isGraduationDateConfirmed === true,
  "isGraduationDateConfirmed is now true"
);
var reconfirmedFresher = classifyCandidate(2027, "May");
assert(
  reconfirmedFresher.track === "fresher",
  "Changing to 2027 should update track to fresher"
);
assert(
  reconfirmedFresher.recommendedRounds.length === 3,
  "Recommended rounds should now include all 3"
);
console.log("\n--- Test Group 6: Internship vs Employment Separation ---");
var sampleExperience = [
  {
    company: "FinTech Labs",
    role: "Frontend Development Intern",
    duration: "May 2026 - Aug 2026 (4 mos)",
    highlights: ["Built responsive React dashboards"]
  },
  {
    company: "Campus Tech Club",
    role: "Web Development Summer Intern",
    duration: "3 months",
    highlights: ["Created student portal"]
  }
];
var separated = separateInternshipsAndEmployment(sampleExperience);
assert(separated.internships.length === 2, "Both roles should be identified as internships");
assert(separated.employmentHistory.length === 0, "No employment history should be created");
assert(
  separated.internships[0].isInternship === true,
  "Role item must carry isInternship = true"
);
var emptyExpSeparated = separateInternshipsAndEmployment([]);
assert(emptyExpSeparated.employmentHistory.length === 0, "Zero experience in resume results in zero employment");
assert(emptyExpSeparated.totalExperienceText.includes("None"), "Total experience text indicates None");
var fullTimeExp = [
  {
    company: "Acme Corp",
    role: "Software Engineer",
    duration: "July 2024 - Present (2 yrs)",
    highlights: ["Microservices in Go and TypeScript"]
  }
];
var fullTimeSeparated = separateInternshipsAndEmployment(fullTimeExp);
assert(fullTimeSeparated.employmentHistory.length === 1, "Software Engineer role should be employment");
assert(fullTimeSeparated.internships.length === 0, "No internships for full-time role");
assert(
  fullTimeSeparated.employmentHistory[0].isEmployment === true,
  "Role item must carry isEmployment = true"
);
console.log("\n--- Test Group 7: Resume Enrichment with Classification ---");
var rawMockResume = {
  fullName: "Priya Sharma",
  department: "Computer Science",
  skills: ["React", "Node.js", "SQL"],
  experience: sampleExperience,
  education: [
    {
      degree: "B.Tech Computer Science",
      college: "National Institute of Technology",
      year: "2027",
      graduationMonth: "May"
    }
  ],
  projects: [{ title: "AI Assistant", tech: ["TypeScript"], bullets: [] }],
  atsScore: 88,
  resumeScore: 90,
  matchRank: "Top Candidate",
  missingSkills: [],
  strongSkills: ["React", "Node.js"],
  suggestedTechnologies: [],
  careerSuggestions: [],
  uploadedAt: (/* @__PURE__ */ new Date()).toISOString(),
  fileName: "priya_sharma_2027.pdf"
};
var enriched = enrichParsedResumeWithClassification(rawMockResume);
assert(String(enriched.graduationYear) === "2027", "Enriched resume extracts graduation year 2027");
assert(enriched.graduationMonth === "May", "Enriched resume extracts graduation month May");
assert(enriched.classification?.track === "fresher", "Enriched classification is fresher");
assert(enriched.internships?.length === 2, "Enriched resume separates internships");
assert(enriched.employmentHistory?.length === 0, "Enriched resume keeps employmentHistory empty");
assert(
  enriched.totalProfessionalExperience !== void 0,
  "Enriched resume reports total professional experience"
);
console.log("\n--- Test Group 8: Flexible Round Selection & Sequential Progression ---");
function getNextSequentialRound(currentCompletedRound, selectedRounds, completedRounds) {
  const updatedCompleted = Array.from(/* @__PURE__ */ new Set([...completedRounds, currentCompletedRound]));
  const remainingSelected = selectedRounds.filter((r) => !updatedCompleted.includes(r));
  if (remainingSelected.length === 0) {
    return "consolidated_scorecard";
  }
  return remainingSelected[0];
}
var selAll = ["aptitude", "technical", "hr"];
var completed = [];
var next1 = getNextSequentialRound("aptitude", selAll, completed);
assert(next1 === "technical", "Scenario 8A: After Aptitude, next is Technical");
completed.push("aptitude");
var next2 = getNextSequentialRound("technical", selAll, completed);
assert(next2 === "hr", "Scenario 8A: After Technical, next is HR");
completed.push("technical");
var next3 = getNextSequentialRound("hr", selAll, completed);
assert(next3 === "consolidated_scorecard", "Scenario 8A: After HR, transitions to Consolidated Scorecard");
console.log("\n--- Test Group 8B: Technical + HR Selected (Aptitude Skipped) ---");
var selTechHr = ["technical", "hr"];
completed = [];
var nextB1 = getNextSequentialRound("technical", selTechHr, completed);
assert(nextB1 === "hr", "Scenario 8B: After Technical, skips Aptitude and goes directly to HR");
completed.push("technical");
var nextB2 = getNextSequentialRound("hr", selTechHr, completed);
assert(nextB2 === "consolidated_scorecard", "Scenario 8B: After HR, transitions to Consolidated Scorecard");
console.log("\n--- Test Group 8C: Aptitude + Technical Selected (HR Skipped) ---");
var selAptTech = ["aptitude", "technical"];
completed = [];
var nextC1 = getNextSequentialRound("aptitude", selAptTech, completed);
assert(nextC1 === "technical", "Scenario 8C: After Aptitude, goes to Technical");
completed.push("aptitude");
var nextC2 = getNextSequentialRound("technical", selAptTech, completed);
assert(nextC2 === "consolidated_scorecard", "Scenario 8C: After Technical, skips HR and transitions to Consolidated Scorecard");
console.log("\n--- Test Group 8D: Single Round Selected (Technical Only) ---");
var selTechOnly = ["technical"];
completed = [];
var nextD1 = getNextSequentialRound("technical", selTechOnly, completed);
assert(nextD1 === "consolidated_scorecard", "Scenario 8D: After Technical, transitions immediately to Consolidated Scorecard");
console.log("\n--- Test Group 9: Dynamic Weighted Readiness Index ---");
function calculateDynamicOverallReadiness(selectedRounds, roundResults) {
  const completedSelected = selectedRounds.filter((r) => roundResults[r] !== void 0);
  if (completedSelected.length === 0) return 0;
  const weights = {
    aptitude: selectedRounds.includes("technical") ? 0.3 : 0.5,
    technical: selectedRounds.includes("aptitude") ? 0.4 : selectedRounds.includes("hr") ? 0.6 : 1,
    hr: selectedRounds.includes("aptitude") ? 0.3 : selectedRounds.includes("technical") ? 0.4 : 1
  };
  let totalWeight = 0;
  let weightedSum = 0;
  completedSelected.forEach((r) => {
    const w = weights[r] || 0.33;
    totalWeight += w;
    weightedSum += (roundResults[r]?.scorePercentage || 0) * w;
  });
  return totalWeight > 0 ? Math.round(weightedSum / totalWeight) : 0;
}
var scoreAll = calculateDynamicOverallReadiness(["aptitude", "technical", "hr"], {
  aptitude: { scorePercentage: 80 },
  technical: { scorePercentage: 90 },
  hr: { scorePercentage: 70 }
});
assert(scoreAll === 81, `Scenario 9A: All 3 rounds score should be 81% (got ${scoreAll}%)`);
var scoreTechHr = calculateDynamicOverallReadiness(["technical", "hr"], {
  aptitude: void 0,
  technical: { scorePercentage: 90 },
  hr: { scorePercentage: 80 }
});
assert(
  scoreTechHr === 86,
  `Scenario 9B: Technical + HR score should be 86% without Aptitude penalty (got ${scoreTechHr}%)`
);
var scoreTechOnly = calculateDynamicOverallReadiness(["technical"], {
  aptitude: void 0,
  technical: { scorePercentage: 85 },
  hr: void 0
});
assert(scoreTechOnly === 85, `Scenario 9C: Single Technical round should be 85% (got ${scoreTechOnly}%)`);
console.log("\n--- Test Group 10: Month Name Normalization ---");
assert(normalizeMonthName("nov") === "November", "nov normalizes to November");
assert(normalizeMonthName("5") === "May", "5 normalizes to May");
assert(normalizeMonthName("Jun") === "June", "Jun normalizes to June");
assert(normalizeMonthName(void 0) === void 0, "undefined returns undefined");
console.log("\n================================================================");
console.log("\u{1F389} ALL 25 VERIFICATION TESTS PASSED SUCCESSFULLY!");
console.log("================================================================\n");
