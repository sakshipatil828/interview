/**
 * CareerCurve AI — Candidate Classification & Smart Recommendation Service
 *
 * Upgraded to support BOTH Technical and Non-Technical students:
 * - Technical: CSE, IT, AI & ML, ECE, EEE, Mechanical, Civil, Automobile, etc.
 * - Non-Technical: Commerce (B.Com), BBA, MBA, Business Analytics, Finance & Accounting, Marketing, HR, Arts & Humanities, English, etc.
 *
 * Implements the CareerCurve Classification Policy based on the current reference date of November 2026:
 *
 * Rules:
 * 1. Technical Fresher:
 *    - 2027, 2026 batches (through Nov 30, 2026).
 *    - Recommended Preparation: "Aptitude + Technical + HR Behaviour (Optional Communication)"
 *    - Recommended Rounds: ['aptitude', 'technical', 'hr']
 *    - Optional Rounds: ['communication']
 *
 * 2. Technical Experienced Candidate:
 *    - 2025 and earlier graduating batches.
 *    - Recommended Preparation: "Technical + HR Behaviour (Optional Communication)"
 *    - Recommended Rounds: ['technical', 'hr']
 *    - Optional Rounds: ['communication', 'aptitude'] (Aptitude not forced)
 *
 * 3. Non-Technical Fresher:
 *    - 2027, 2026 batches (through Nov 30, 2026).
 *    - Recommended Preparation: "Aptitude + Communication + HR Behaviour"
 *    - Recommended Rounds: ['aptitude', 'communication', 'hr']
 *    - Technical Interview is NOT displayed or forced!
 *
 * 4. Non-Technical Experienced Candidate:
 *    - 2025 and earlier graduating batches.
 *    - Recommended Preparation: "Communication + HR Behaviour"
 *    - Recommended Rounds: ['communication', 'hr']
 *    - Optional Rounds: ['aptitude']
 *    - Aptitude and Technical are NOT forced!
 *
 * 5. Crucial Distinction:
 *    - Graduation year determines the interview preparation track only.
 *    - Professional work experience is extracted separately and accurately from actual employment records.
 *    - Do NOT invent employment experience from academic projects or certificates.
 */

import type { 
  CandidateClassification, 
  EducationalBackgroundCategory,
  ExperienceItem, 
  InterviewRoundId,
  ParsedResume 
} from '../types';

export const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

/**
 * Standardizes raw month string or number to a canonical month name (e.g. "November")
 */
export function normalizeMonthName(raw?: string): string | undefined {
  if (!raw) return undefined;
  const clean = raw.trim().toLowerCase();
  
  // Numeric string "1" - "12" or "01" - "12"
  const num = parseInt(clean, 10);
  if (!isNaN(num) && num >= 1 && num <= 12) {
    return MONTH_NAMES[num - 1];
  }

  // Prefix matching
  if (clean.startsWith('jan')) return 'January';
  if (clean.startsWith('feb')) return 'February';
  if (clean.startsWith('mar')) return 'March';
  if (clean.startsWith('apr')) return 'April';
  if (clean === 'may') return 'May';
  if (clean.startsWith('jun')) return 'June';
  if (clean.startsWith('jul')) return 'July';
  if (clean.startsWith('aug')) return 'August';
  if (clean.startsWith('sep')) return 'September';
  if (clean.startsWith('oct')) return 'October';
  if (clean.startsWith('nov')) return 'November';
  if (clean.startsWith('dec')) return 'December';

  return undefined;
}

/**
 * Categorizes an experience item into internship vs full-time/contract employment
 */
export function isInternshipRole(item: ExperienceItem): boolean {
  if (item.isInternship !== undefined) return item.isInternship;
  const roleLower = (item.role || '').toLowerCase();
  const descLower = (item.description || '').toLowerCase();
  const companyLower = (item.company || '').toLowerCase();

  return (
    roleLower.includes('intern') ||
    roleLower.includes('trainee') ||
    roleLower.includes('apprentice') ||
    roleLower.includes('fellow') ||
    companyLower.includes('intern') ||
    descLower.includes('summer internship') ||
    descLower.includes('winter internship') ||
    descLower.includes('student intern')
  );
}

/**
 * Separates raw experience items into internships and employment history
 */
export function separateInternshipsAndEmployment(rawList: ExperienceItem[] = []): {
  internships: ExperienceItem[];
  employmentHistory: ExperienceItem[];
  totalExperienceText: string;
} {
  const internships: ExperienceItem[] = [];
  const employmentHistory: ExperienceItem[] = [];
  const items = Array.isArray(rawList) ? rawList : [];

  items.forEach((item) => {
    if (isInternshipRole(item)) {
      internships.push({ ...item, isInternship: true, isEmployment: false });
    } else {
      employmentHistory.push({ ...item, isInternship: false, isEmployment: true });
    }
  });

  let totalExperienceText = 'None (Fresher / Academic Projects)';
  if (employmentHistory.length > 0) {
    const totalCount = employmentHistory.length;
    const durations = employmentHistory.map((e) => e.duration).filter(Boolean);
    if (durations.length > 0) {
      totalExperienceText = `${durations.join(', ')} (${totalCount} employment ${totalCount === 1 ? 'role' : 'roles'})`;
    } else {
      totalExperienceText = `${totalCount} professional employment ${totalCount === 1 ? 'role' : 'roles'}`;
    }
  }

  return {
    internships,
    employmentHistory,
    totalExperienceText,
  };
}

export interface DetectedEducationalBackground {
  category: EducationalBackgroundCategory;
  discipline: string;
  isTechnical: boolean;
  confidenceScore: number;
  reason: string;
}

/**
 * Detects whether the candidate comes from a Technical or Non-Technical educational background,
 * analyzing degree, department, skills, projects, and employment history without relying solely on degree name.
 */
export function detectEducationalBackground(
  resume: ParsedResume | null,
  profileDepartment?: string
): DetectedEducationalBackground {
  if (!resume) {
    const dept = profileDepartment || '';
    const deptLower = dept.toLowerCase();
    const isNonTech = /(commerce|b\.?com|bba|mba|business|management|finance|accounting|marketing|human resource|hr|arts|humanities|english)/i.test(deptLower);
    return {
      category: isNonTech ? 'non_technical' : 'technical',
      discipline: dept || (isNonTech ? 'Commerce & Business' : 'Computer Science and Engineering'),
      isTechnical: !isNonTech,
      confidenceScore: 70,
      reason: dept ? `Determined from profile department: ${dept}` : 'Default candidate profile baseline'
    };
  }

  const edu = resume.education && resume.education.length > 0 ? resume.education[0] : null;
  const degreeStr = `${edu?.degree || ''} ${resume.jobTitle || ''}`.toLowerCase();
  // Do not allow profileDepartment from an old session/account to contaminate a parsed resume
  const deptStr = `${resume.department || ''} ${edu?.branch || ''} ${!resume.department && !edu?.branch ? (profileDepartment || '') : ''}`.toLowerCase();

  const skillsCorpus = (resume.rawSkillsList || [])
    .concat(
      Array.isArray(resume.skills)
        ? resume.skills.flatMap(s => typeof s === 'string' ? [s] : (s?.skills ? s.skills.map(sk => sk.name) : []))
        : []
    )
    .join(' ')
    .toLowerCase();

  const projectCorpus = (resume.projects || [])
    .map(p => `${p.title} ${p.description} ${(p.technologies || []).join(' ')}`)
    .join(' ')
    .toLowerCase();

  const expCorpus = (resume.experience || [])
    .map(e => `${e.role} ${e.company} ${e.description}`)
    .join(' ')
    .toLowerCase();

  const fullCorpus = `${degreeStr} ${deptStr} ${resume.summary || ''} ${resume.extractedText || ''} ${skillsCorpus} ${projectCorpus} ${expCorpus}`.toLowerCase();

  let techScore = 0;
  let nonTechScore = 0;
  let detectedDiscipline = 'General Studies';
  let hasCommerceDegree = false;

  // 1. NON-TECHNICAL DISCIPLINES SIGNALS

  // A. Commerce / Accounting / Taxation
  if (/\b(b\.?com|bcom|bachelor of commerce|m\.?com|commerce|accounting|accountancy|tally|gst|taxation|auditing|balance sheet|ledger|financial accounting|cost accounting|chartered accountant|ca|cpa)\b/i.test(fullCorpus)) {
    nonTechScore += 25;
    detectedDiscipline = 'Commerce';
    hasCommerceDegree = true;
  }

  // B. Business Administration / Management (BBA / MBA)
  if (/\b(bba|bms|mba|pgdm|business administration|general management|operations management|supply chain|strategic management|business strategy)\b/i.test(fullCorpus)) {
    nonTechScore += 16;
    if (detectedDiscipline === 'General Studies' || nonTechScore >= 16) {
      detectedDiscipline = /\b(mba|pgdm|master of business)\b/i.test(fullCorpus) ? 'Management' : 'Business Administration';
    }
  }

  // C. Business Analytics (Non-Tech Domain)
  if (/\b(business analytics|business intelligence|tableau|power bi|powerbi|kpi dashboard|data insights|market analytics|business metrics)\b/i.test(fullCorpus)) {
    nonTechScore += 18;
    detectedDiscipline = 'Business Analytics';
  }

  // D. Finance & Banking
  if (/\b(finance|financial modeling|investment banking|banking|wealth management|portfolio management|equity research|corporate finance|cfa)\b/i.test(fullCorpus)) {
    nonTechScore += 16;
    if (detectedDiscipline !== 'Business Analytics') {
      detectedDiscipline = 'Finance and Accounting';
    }
  }

  // E. Marketing & Sales
  if (/\b(marketing|digital marketing|seo|sem|social media marketing|brand management|content marketing|lead generation|market research|advertising)\b/i.test(fullCorpus)) {
    nonTechScore += 16;
    if (detectedDiscipline !== 'Business Administration' && detectedDiscipline !== 'Management' && !/\b(bba|bms|mba)\b/i.test(degreeStr)) {
      detectedDiscipline = 'Marketing';
    }
  }

  // F. Human Resources
  if (/\b(human resources|hr|talent acquisition|recruitment|employee relations|payroll|people management|hr analytics|mhrm)\b/i.test(fullCorpus)) {
    nonTechScore += 16;
    detectedDiscipline = 'Human Resources';
  }

  // G. Arts & Humanities / English
  if (/\b(b\.?a\b|m\.?a\b|arts|humanities|english|literature|history|sociology|psychology|journalism|creative writing|public relations|mass communication|philosophy)\b/i.test(fullCorpus)) {
    nonTechScore += 16;
    detectedDiscipline = 'Arts & Humanities';
  }

  // H. Customer Service / Client Support / Sales Operations
  if (/\b(customer service|customer support|client service|helpdesk|bpo|call center|crm data entry|complaint handling|telecalling|billing assistance|sales assistant|sales support|operations associate|record management)\b/i.test(fullCorpus)) {
    nonTechScore += 18;
    if (detectedDiscipline === 'General Studies' && !hasCommerceDegree) {
      detectedDiscipline = 'Customer Service & Sales Operations';
    }
  }

  // 2. TECHNICAL DISCIPLINES SIGNALS

  // A. Computer Science & Software Engineering
  if (/\b(computer science|cse|software engineering|b\.?tech|b\.?e\b|m\.?tech|mca|bca|full[- ]?stack|web development|frontend|backend|react|node|javascript|typescript|python|java|c\+\+|sql|database|data structures|algorithms|git)\b/i.test(fullCorpus)) {
    techScore += 10;
    if (techScore > nonTechScore && !hasCommerceDegree) {
      detectedDiscipline = 'Computer Science and Engineering';
    }
  }

  // B. Information Technology
  if (/\b(information technology|it engineering|cloud computing|devops|aws|docker|linux|networking|cybersecurity|system admin)\b/i.test(fullCorpus)) {
    techScore += 10;
    if (techScore > nonTechScore) {
      detectedDiscipline = 'Information Technology';
    }
  }

  // C. Artificial Intelligence & Machine Learning
  if (/\b(ai & ml|artificial intelligence|machine learning|deep learning|tensorflow|pytorch|scikit[- ]?learn|computer vision|nlp|neural network)\b/i.test(fullCorpus)) {
    techScore += 12;
    if (techScore > nonTechScore) {
      detectedDiscipline = 'Artificial Intelligence and Machine Learning';
    }
  }

  // D. Electronics & Communication (ECE)
  if (/\b(ece|electronics|telecommunication|embedded|microcontroller|vlsi|verilog|vhdl|pcb|arm cortex|signals|iot)\b/i.test(fullCorpus)) {
    techScore += 12;
    if (techScore > nonTechScore) {
      detectedDiscipline = 'Electronics and Communication';
    }
  }

  // E. Electrical & Electronics (EEE)
  if (/\b(eee|electrical engineering|power systems|electrical machines|circuit theory|substation|transformers|matlab|simulink)\b/i.test(fullCorpus)) {
    techScore += 12;
    if (techScore > nonTechScore) {
      detectedDiscipline = 'Electrical and Electronics';
    }
  }

  // F. Mechanical Engineering
  if (/\b(mechanical engineering|cad|autocad|solidworks|ansys|thermodynamics|fluid mechanics|finite element|fea|manufacturing|cnc)\b/i.test(fullCorpus)) {
    techScore += 12;
    if (techScore > nonTechScore) {
      detectedDiscipline = 'Mechanical Engineering';
    }
  }

  // G. Civil Engineering
  if (/\b(civil engineering|etabs|staad\.?pro|structural analysis|surveying|concrete technology|geotechnical|construction management)\b/i.test(fullCorpus)) {
    techScore += 12;
    if (techScore > nonTechScore) {
      detectedDiscipline = 'Civil Engineering';
    }
  }

  // H. Automobile Engineering
  if (/\b(automobile engineering|automotive|ic engines|chassis|aerodynamics|vehicle dynamics|transmission)\b/i.test(fullCorpus)) {
    techScore += 12;
    if (techScore > nonTechScore) {
      detectedDiscipline = 'Automobile Engineering';
    }
  }

  // Explicit degree override check (e.g. B.Com, BBA, BA vs B.Tech, B.E.)
  const hasNonTechDegree = /\b(b\.?com|m\.?com|bba|mba|bms|b\.?a\b|m\.?a\b|pgdm|ca|cfa|business analytics|commerce|arts|humanities|customer service|sales|marketing|hr)\b/i.test(degreeStr) || /\b(b\.?com|m\.?com|bba|mba|bms|b\.?a\b|m\.?a\b|business analytics|commerce|arts|humanities|customer service|sales|marketing|hr)\b/i.test(deptStr);
  const hasTechDegree = /\b(b\.?tech|b\.?e\b|m\.?tech|m\.?e\b|mca|bca|b\.?sc cs|b\.?sc it)\b/i.test(degreeStr) || /\b(engineering|technology|computer science)\b/i.test(deptStr);

  if (hasNonTechDegree && !hasTechDegree) {
    nonTechScore += 20;
  } else if (hasTechDegree && !hasNonTechDegree) {
    techScore += 20;
  }

  const isTechnical = techScore > nonTechScore && techScore > 0;
  const category: EducationalBackgroundCategory = isTechnical ? 'technical' : 'non_technical';

  if (!isTechnical && (detectedDiscipline === 'General Studies' || detectedDiscipline === 'Computer Science and Engineering')) {
    detectedDiscipline = hasCommerceDegree ? 'Commerce' : 'Commerce & Business Administration';
  } else if (!isTechnical && hasCommerceDegree) {
    detectedDiscipline = 'Commerce';
  } else if (isTechnical && detectedDiscipline === 'General Studies') {
    detectedDiscipline = 'Computer Science and Engineering';
  }

  return {
    category,
    discipline: detectedDiscipline,
    isTechnical,
    confidenceScore: Math.min(95, Math.max(65, Math.abs(techScore - nonTechScore) * 5 + 60)),
    reason: isTechnical
      ? `Technical background verified from degree (${degreeStr || 'Engineering'}), department (${deptStr || detectedDiscipline}), and technical project skills.`
      : `Non-technical educational background detected from discipline (${detectedDiscipline}), coursework, and resume skills.`
  };
}

/**
 * Returns round recommendations based on educational category and track.
 * Matrix:
 * - Technical Fresher: Aptitude, Technical, HR + Optional Communication
 * - Technical Experienced: Technical, HR + Optional Communication (Aptitude excluded from core track)
 * - Non-Technical Fresher: Aptitude, Communication, HR (Technical strictly excluded)
 * - Non-Technical Experienced: Communication, HR (Aptitude & Technical strictly excluded)
 */
export function getRoundRecommendations(
  category: 'technical' | 'non_technical',
  track: 'fresher' | 'experienced' = 'fresher',
  userSelectedCategory?: 'technical' | 'non_technical' | null
): {
  recommendedPreparation: string;
  recommendedRounds: InterviewRoundId[];
  optionalRounds: InterviewRoundId[];
} {
  // Authoritative manual background selection (Prompt 10)
  if (userSelectedCategory) {
    if (userSelectedCategory === 'technical') {
      return {
        recommendedPreparation: 'Aptitude + Technical + HR Behaviour',
        recommendedRounds: ['aptitude', 'technical', 'hr'],
        optionalRounds: ['communication'],
      };
    } else {
      return {
        recommendedPreparation: 'Aptitude + Communication + HR Behaviour',
        recommendedRounds: ['aptitude', 'communication', 'hr'],
        optionalRounds: [],
      };
    }
  }

  // Automatic heuristic recommendation matrix before explicit manual selection (Prompt 9)
  if (category === 'technical') {
    if (track === 'fresher') {
      return {
        recommendedPreparation: 'Aptitude + Technical + HR Behaviour (Optional Communication)',
        recommendedRounds: ['aptitude', 'technical', 'hr'],
        optionalRounds: ['communication'],
      };
    } else {
      return {
        recommendedPreparation: 'Technical + HR Behaviour (Optional Communication)',
        recommendedRounds: ['technical', 'hr'],
        optionalRounds: ['communication', 'aptitude'],
      };
    }
  } else {
    // Non-Technical
    if (track === 'fresher') {
      return {
        recommendedPreparation: 'Aptitude + Communication + HR Behaviour',
        recommendedRounds: ['aptitude', 'communication', 'hr'],
        optionalRounds: [],
      };
    } else {
      return {
        recommendedPreparation: 'Communication + HR Behaviour',
        recommendedRounds: ['communication', 'hr'],
        optionalRounds: ['aptitude'],
      };
    }
  }
}

/**
 * Classifies a candidate based on graduation year, employment history, and educational background,
 * conforming strictly to CareerCurve's November 2026 classification policy and dynamic round recommendations.
 */
export function classifyCandidate(
  graduationYearOrResume?: string | number | ParsedResume | null,
  graduationMonth?: string,
  experienceItems: ExperienceItem[] = [],
  explicitTotalExp?: string,
  resumeContext?: ParsedResume | null,
  overrideBackground?: { 
    educationalCategory?: EducationalBackgroundCategory; 
    discipline?: string;
    userSelectedCategory?: 'technical' | 'non_technical' | null;
  }
): CandidateClassification {
  if (
    graduationYearOrResume && 
    typeof graduationYearOrResume === 'object' && 
    ('education' in graduationYearOrResume || 'skills' in graduationYearOrResume || 'fullName' in graduationYearOrResume)
  ) {
    const resume = graduationYearOrResume as ParsedResume;
    const edu = resume.education && resume.education.length > 0 ? resume.education[0] : undefined;
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

  const rawYearStr = String(graduationYearOrResume || '').trim();
  const yearMatch = rawYearStr.match(/\b(20\d{2}|19\d{2})\b/);
  const yearNum = yearMatch ? parseInt(yearMatch[1], 10) : parseInt(rawYearStr, 10);
  const cleanYearStr = !isNaN(yearNum) ? String(yearNum) : rawYearStr;

  let normMonth = normalizeMonthName(graduationMonth);
  if (!normMonth && rawYearStr) {
    const foundMonth = MONTH_NAMES.find(m => new RegExp(`\\b${m}\\b`, 'i').test(rawYearStr));
    if (foundMonth) {
      normMonth = foundMonth;
    }
  }

  const { internships, employmentHistory, totalExperienceText } = separateInternshipsAndEmployment(experienceItems);
  const effectiveTotalExp = explicitTotalExp && explicitTotalExp.trim().length > 0
    ? explicitTotalExp.trim()
    : totalExperienceText;

  const hasEmployment = employmentHistory.length > 0;

  // Detect Educational Background (Technical vs Non-Technical)
  const bgDetection = detectEducationalBackground(resumeContext || null);
  const userSelectedCategory: 'technical' | 'non_technical' | null = 
    overrideBackground?.userSelectedCategory !== undefined 
      ? overrideBackground.userSelectedCategory 
      : (resumeContext?.userSelectedCategory ?? null);
  const isUserConfirmed = userSelectedCategory !== null;
  const educationalCategory: EducationalBackgroundCategory = 
    userSelectedCategory ?? overrideBackground?.educationalCategory ?? bgDetection.category;
  let discipline = overrideBackground?.discipline || bgDetection.discipline;
  const isTechnical = educationalCategory === 'technical';

  // Strict Sanitization: Never allow an engineering discipline for non-technical candidates
  if (!isTechnical && /computer science|engineering|cse|ece|mech|civil|electrical|general studies|unspecified/i.test(discipline)) {
    const rawText = `${resumeContext?.education?.[0]?.degree || ''} ${resumeContext?.department || ''} ${resumeContext?.summary || ''} ${resumeContext?.jobTitle || ''} ${resumeContext?.extractedText || ''}`.toLowerCase();
    if (/\b(b\.?com|bcom|commerce|accounting|accountancy|tally|gst)\b/i.test(rawText)) {
      discipline = 'Commerce';
    } else if (/\b(bba|mba|bms|business admin|management)\b/i.test(rawText)) {
      discipline = 'Business Administration';
    } else if (/\b(business analytics|data insights|power bi|tableau)\b/i.test(rawText)) {
      discipline = 'Business Analytics';
    } else if (/\b(b\.?a\b|arts|humanities|english|literature|journalism)\b/i.test(rawText)) {
      discipline = 'Arts & Humanities';
    } else {
      discipline = 'Commerce';
    }
  } else if (isTechnical && (/commerce|business admin|arts|humanities/i.test(discipline) || discipline === 'General Studies')) {
    discipline = 'Computer Science and Engineering';
  }

  // Helper to construct dynamic rounds:
  // - If candidate has made manual background selection (userSelectedCategory):
  //   - Technical Student: Aptitude, Technical, HR Behaviour
  //   - Non-Technical Student: Aptitude, Communication, HR Behaviour (Strictly NO Technical Round)
  // - If before manual selection:
  //   - Uses automatic heuristic matrix (Fresher vs Experienced)
  const getRoundRecommendations = (track: 'fresher' | 'experienced'): {
    recommendedPreparation: string;
    recommendedRounds: InterviewRoundId[];
    optionalRounds: InterviewRoundId[];
  } => {
    if (userSelectedCategory) {
      if (userSelectedCategory === 'technical') {
        return {
          recommendedPreparation: 'Aptitude + Technical + HR Behaviour',
          recommendedRounds: ['aptitude', 'technical', 'hr'],
          optionalRounds: ['communication']
        };
      } else {
        return {
          recommendedPreparation: 'Aptitude + Communication + HR Behaviour',
          recommendedRounds: ['aptitude', 'communication', 'hr'],
          optionalRounds: []
        };
      }
    }

    if (isTechnical) {
      if (track === 'fresher') {
        return {
          recommendedPreparation: 'Aptitude + Technical + HR Behaviour (Optional Communication)',
          recommendedRounds: ['aptitude', 'technical', 'hr'],
          optionalRounds: ['communication']
        };
      } else {
        return {
          recommendedPreparation: 'Technical + HR Behaviour (Optional Communication)',
          recommendedRounds: ['technical', 'hr'],
          optionalRounds: ['communication', 'aptitude']
        };
      }
    } else {
      // Non-Technical
      if (track === 'fresher') {
        return {
          recommendedPreparation: 'Aptitude + Communication + HR Behaviour',
          recommendedRounds: ['aptitude', 'communication', 'hr'],
          optionalRounds: []
        };
      } else {
        return {
          recommendedPreparation: 'Communication + HR Behaviour',
          recommendedRounds: ['communication', 'hr'],
          optionalRounds: ['aptitude']
        };
      }
    }
  };

  // Check if meaningful full-time employment is present
  const hasSignificantEmployment = hasEmployment && (
    employmentHistory.length >= 2 ||
    /(\b[1-9]\d*(\.\d+)?\s*years?\b)|202[0-4]\s*[-–]\s*(present|202[5-9])/i.test(effectiveTotalExp)
  );

  // Case 1: Missing or invalid graduation year
  if (!cleanYearStr || isNaN(yearNum) || yearNum < 1980 || yearNum > 2040) {
    if (hasEmployment && employmentHistory.length > 0) {
      const { recommendedPreparation, recommendedRounds, optionalRounds } = getRoundRecommendations('experienced');
      return {
        track: 'experienced',
        candidateType: 'EXPERIENCED PREPARATION TRACK',
        isFresher: false,
        educationalCategory,
        discipline,
        isTechnical,
        userSelectedCategory,
        isUserConfirmed,
        graduationBatch: 'Experienced (Batch unstated)',
        graduationMonth: normMonth,
        graduationDateFormatted: 'Professional Experience Track',
        isGraduationDateConfirmed: true,
        recommendedPreparation,
        recommendedRounds,
        optionalRounds,
        totalYearsOfExperience: effectiveTotalExp,
        hasEmploymentHistory: true,
        explanationNote: `Professional employment verified (${effectiveTotalExp}) in ${discipline}. Classified as Experienced Preparation Track.`,
      };
    }

    const { recommendedPreparation, recommendedRounds, optionalRounds } = getRoundRecommendations('fresher');
    return {
      track: 'fresher',
      candidateType: 'UNCONFIRMED',
      isFresher: true,
      educationalCategory,
      discipline,
      isTechnical,
      userSelectedCategory,
      isUserConfirmed,
      graduationBatch: cleanYearStr || 'Unspecified',
      graduationMonth: normMonth,
      graduationDateFormatted: normMonth ? `${normMonth} (Year missing)` : 'Unconfirmed',
      isGraduationDateConfirmed: false,
      recommendedPreparation,
      recommendedRounds,
      optionalRounds,
      totalYearsOfExperience: effectiveTotalExp,
      hasEmploymentHistory: hasEmployment,
      explanationNote: `Graduation batch was not clearly detected in resume. Background detected as ${discipline} (${educationalCategory === 'technical' ? 'Technical Track' : 'Non-Technical Track'}). Please confirm your graduation year and month.`,
    };
  }

  const batchStr = String(yearNum);
  const formattedDate = normMonth ? `${normMonth} ${batchStr}` : batchStr;

  // If candidate has significant professional full-time employment (e.g. 2022-2023, 2023-Present)
  if (hasSignificantEmployment && yearNum > 2025) {
    const { recommendedPreparation, recommendedRounds, optionalRounds } = getRoundRecommendations('experienced');
    return {
      track: 'experienced',
      candidateType: 'EXPERIENCED PREPARATION TRACK',
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
      hasEmploymentHistory: true,
      explanationNote: `Verified professional employment history (${effectiveTotalExp}) prioritized over academic batch date ${batchStr}. Classified as Experienced Preparation Track.`,
    };
  }

  // Case 2: 2027 and later batches -> Fresher Track
  if (yearNum >= 2027) {
    const { recommendedPreparation, recommendedRounds, optionalRounds } = getRoundRecommendations('fresher');
    return {
      track: 'fresher',
      candidateType: 'FRESHER',
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
      recommendedPreparation,
      recommendedRounds,
      optionalRounds,
      totalYearsOfExperience: effectiveTotalExp,
      hasEmploymentHistory: hasEmployment,
      explanationNote: isTechnical
        ? `Batch of ${batchStr} (${discipline}): Pre-placement campus placement candidate eligible for full campus screening roadmap.`
        : `Batch of ${batchStr} (${discipline}): Non-technical candidate roadmap configured for Aptitude, Professional Communication, and HR Behaviour.`,
    };
  }

  // Case 3: 2026 batch (November 2026 current baseline) -> Fresher Track
  if (yearNum === 2026) {
    const { recommendedPreparation, recommendedRounds, optionalRounds } = getRoundRecommendations('fresher');
    return {
      track: 'fresher',
      candidateType: 'FRESHER',
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
      recommendedPreparation,
      recommendedRounds,
      optionalRounds,
      totalYearsOfExperience: effectiveTotalExp,
      hasEmploymentHistory: hasEmployment,
      explanationNote: isTechnical
        ? `Graduation Batch 2026 (${normMonth || 'Academic Year 2026'} - ${discipline}): Classified as Technical Fresher Track under CareerCurve placement guidelines.`
        : `Graduation Batch 2026 (${normMonth || 'Academic Year 2026'} - ${discipline}): Non-technical candidate track prioritizing Aptitude, Communication, and HR Behaviour practice.`,
    };
  }

  // Case 4: 2025, 2024, and earlier batches -> Experienced Preparation Track
  const { recommendedPreparation, recommendedRounds, optionalRounds } = getRoundRecommendations('experienced');
  return {
    track: 'experienced',
    candidateType: 'EXPERIENCED PREPARATION TRACK',
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
    explanationNote: isTechnical
      ? `Graduation Batch ${batchStr} (${discipline}): Experienced Technical Preparation focusing on Technical & HR Behavioral interviews. Aptitude and Communication are available as optional practice.`
      : `Graduation Batch ${batchStr} (${discipline}): Experienced Non-Technical Preparation focusing on Professional Communication & HR Behavioral interviews. Aptitude is included; technical questions are omitted.`,
  };
}

/**
 * Attaches classification, background category, internships, and employment separation to a ParsedResume object
 */
export function enrichParsedResumeWithClassification(
  resume: ParsedResume,
  overrideGraduation?: { 
    year?: string; 
    month?: string;
    educationalCategory?: EducationalBackgroundCategory;
    discipline?: string;
    userSelectedCategory?: 'technical' | 'non_technical' | null;
  }
): ParsedResume {
  const edu = resume.education && resume.education.length > 0 ? resume.education[0] : undefined;
  
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

  const finalUserSelected = overrideGraduation?.userSelectedCategory !== undefined
    ? overrideGraduation.userSelectedCategory
    : (resume.userSelectedCategory ?? null);

  return {
    ...resume,
    userSelectedCategory: finalUserSelected,
    department: !classification.isTechnical
      ? (resume.department && !/engineering|computer science|cse/i.test(resume.department) ? resume.department : classification.discipline)
      : (classification.discipline || resume.department),
    graduationYear: classification.isGraduationDateConfirmed ? classification.graduationBatch : (targetYear || ''),
    graduationMonth: classification.graduationMonth,
    isGraduationDateConfirmed: classification.isGraduationDateConfirmed,
    classification,
    internships,
    employmentHistory,
    totalProfessionalExperience: classification.totalYearsOfExperience,
  };
}
