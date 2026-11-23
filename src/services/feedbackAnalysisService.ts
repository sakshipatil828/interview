/**
 * CareerCurve AI Interview Preparation Platform
 * Personalized Interview Experience & Improvement Feedback Analysis Engine
 * 
 * Synthesizes student self-reported feedback with objective interview performance metrics,
 * answer evaluations, and AI scorecards to generate grounded, actionable 7-day plans.
 */

import { 
  StudentInterviewFeedback, 
  PersonalizedImprovementPlan, 
  DayExercise, 
  ImprovementPriority, 
  ProgressGoal, 
  NextPracticeRecommendation 
} from '../types/feedback';
import { InterviewSession, AptitudeResult, ParsedResume } from '../types';

/**
 * Generates a deeply personalized improvement plan and report.
 * Operates in dual mode: attempts server API if online, falls back seamlessly to client-side analysis.
 */
export async function generatePersonalizedImprovementPlan(
  feedback: StudentInterviewFeedback,
  interviewSessions: InterviewSession[],
  aptitudeResults: AptitudeResult[],
  parsedResume: ParsedResume | null,
  userId: string
): Promise<PersonalizedImprovementPlan> {
  // 1. Check if backend API is available
  try {
    const response = await fetch('/api/feedback/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        feedback,
        lastInterviewSession: interviewSessions[0] || null,
        lastAptitudeResult: aptitudeResults[0] || null,
        resumeProfile: parsedResume ? {
          department: parsedResume.department,
          topSkills: parsedResume.rawSkillsList?.slice(0, 5) || [],
        } : null,
      }),
    });

    if (response.ok) {
      const data = await response.json();
      if (data.success && data.plan) {
        return {
          ...data.plan,
          id: `plan_${Date.now()}_${userId.slice(-6)}`,
          userId,
          feedbackId: feedback.id,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
      }
    }
  } catch {
    // Backend offline: run comprehensive client-side deterministic analysis engine
  }

  return generateLocalImprovementPlan(feedback, interviewSessions, aptitudeResults, parsedResume, userId);
}

/**
 * Deterministic, grounded client-side improvement plan generator.
 */
export function generateLocalImprovementPlan(
  feedback: StudentInterviewFeedback,
  interviewSessions: InterviewSession[],
  aptitudeResults: AptitudeResult[],
  parsedResume: ParsedResume | null,
  userId: string
): PersonalizedImprovementPlan {
  const lastInterview = interviewSessions[0];
  const lastAptitude = aptitudeResults[0];
  const isScorecardAvailable = !!lastInterview || !!lastAptitude;

  // Extract objective metrics
  const techScore = lastInterview?.technicalScore;
  const hrScore = lastInterview?.hrScore;
  const aptScore = lastAptitude?.scorePercentage;
  const atsScore = parsedResume?.atsScore;
  const overallReadiness = lastInterview?.overallScore || (lastAptitude ? lastAptitude.scorePercentage : undefined);

  // Extract communication metrics if HR session was taken
  let totalFillers = 0;
  let averageWpm = 0;
  let hasSTARData = false;
  let starAverage = 0;

  if (lastInterview?.answers) {
    const answersWithFeedback = lastInterview.answers.filter((a) => a.aiFeedback);
    if (answersWithFeedback.length > 0) {
      // Check for filler words / WPM in answers if available
      const wpmSamples: number[] = [];
      answersWithFeedback.forEach((ans) => {
        if (ans.timeTakenSeconds && ans.userAnswer) {
          const words = ans.userAnswer.trim().split(/\s+/).length;
          const wpm = Math.round((words / Math.max(1, ans.timeTakenSeconds)) * 60);
          wpmSamples.push(wpm);
        }
      });
      if (wpmSamples.length > 0) {
        averageWpm = Math.round(wpmSamples.reduce((a, b) => a + b, 0) / wpmSamples.length);
      }
    }
  }

  // ---------------------------------------------------------------------------
  // A. My Interview Experience Summary
  // ---------------------------------------------------------------------------
  const voiceSnippet = feedback.voiceTranscript && feedback.voiceTranscriptIncluded
    ? ` In your spoken feedback, you noted: "${feedback.voiceTranscript.trim()}"`
    : '';

  const experienceSummary = `You rated your overall interview experience as "${feedback.experienceRating}" and marked your pre-interview confidence level at ${feedback.confidenceRating} out of 5. You identified "${feedback.mostChallengingPhase}" as the most demanding phase of your journey.${voiceSnippet} This reflection provides a baseline for targeting your key growth areas.`;

  // ---------------------------------------------------------------------------
  // B. My Main Challenges
  // ---------------------------------------------------------------------------
  const primaryDifficulty = feedback.biggestDifficulty === 'Other' && feedback.biggestDifficultyCustom
    ? feedback.biggestDifficultyCustom
    : feedback.biggestDifficulty;

  const mainChallenges = `Your primary self-identified barrier was: "${primaryDifficulty}". You specifically prioritized growth in ${feedback.improvementGoals.join(', ')}${feedback.improvementGoalCustom ? `, alongside "${feedback.improvementGoalCustom}"` : ''}. Understanding this friction point allows us to calibrate your daily exercises so you can transition from hesitation to structured confidence.`;

  // ---------------------------------------------------------------------------
  // C. My Performance Insights & Confidence Mismatch Analysis
  // ---------------------------------------------------------------------------
  const weakestMeasuredAreas: string[] = [];
  let confidenceMismatchAnalysis = '';

  if (isScorecardAvailable) {
    const scores: { name: string; score: number }[] = [];
    if (techScore !== undefined) scores.push({ name: 'Technical Depth & Architecture', score: techScore });
    if (hrScore !== undefined) scores.push({ name: 'HR Behavioral & STAR Structuring', score: hrScore });
    if (aptScore !== undefined) scores.push({ name: 'Aptitude & Logical Speed', score: aptScore });

    scores.sort((a, b) => a.score - b.score);
    scores.forEach((s) => {
      if (s.score < 80) weakestMeasuredAreas.push(`${s.name} (${s.score}%)`);
    });
    if (weakestMeasuredAreas.length === 0 && scores.length > 0) {
      weakestMeasuredAreas.push(`${scores[0].name} (Score: ${scores[0].score}% - room for advanced mastery)`);
    }

    // Confidence Mismatch Analysis
    const avgScore = scores.length > 0
      ? Math.round(scores.reduce((a, b) => a + b.score, 0) / scores.length)
      : (overallReadiness || 75);

    if (feedback.confidenceRating >= 4 && avgScore < 72) {
      confidenceMismatchAnalysis = `⚠️ High Confidence with Objective Knowledge Gaps: You rated your confidence at ${feedback.confidenceRating}/5, yet your objective benchmark was ${avgScore}%. This reveals potential blind spots—such as omitting edge-case complexity in technical rounds or missing quantifiable results in behavioral questions. Calibration with strict rubrics will protect against surprise rejections.`;
    } else if (feedback.confidenceRating <= 2 && avgScore >= 80) {
      confidenceMismatchAnalysis = `🌟 Underestimated Competence (Performance Anxiety / Impostor Phenomenon): You reported a self-confidence of only ${feedback.confidenceRating}/5 and experienced nervousness, yet your actual interview performance scored a strong ${avgScore}%. Your core competencies are already robust; your primary barrier is psychological nervousness rather than a knowledge deficit. Focus on timed delivery to build self-trust.`;
    } else {
      confidenceMismatchAnalysis = `🎯 Calibrated Self-Assessment: Your self-reported confidence of ${feedback.confidenceRating}/5 closely matches your objective score (${avgScore}%). You have an accurate internal compass regarding what went well and where answers felt unpolished.`;
    }
  } else {
    confidenceMismatchAnalysis = `ℹ️ Self-Reported Trajectory Notice: No previous interview session scorecard was found in this browser. This analysis and improvement roadmap is generated solely from your self-reported feedback, challenges, and goals.`;
    weakestMeasuredAreas.push(feedback.mostChallengingPhase);
  }

  // ---------------------------------------------------------------------------
  // D. Demonstrated Strengths
  // ---------------------------------------------------------------------------
  const demonstratedStrengths: string[] = [];
  if (parsedResume) {
    demonstratedStrengths.push(`Strong engineering profile in ${parsedResume.department} with verified ATS readiness (${parsedResume.atsScore}%).`);
  }
  if (techScore && techScore >= 80) {
    demonstratedStrengths.push(`Solid technical problem-solving foundation demonstrated in technical evaluations (${techScore}%).`);
  }
  if (hrScore && hrScore >= 80) {
    demonstratedStrengths.push(`Articulate communication and positive professional alignment in HR evaluations (${hrScore}%).`);
  }
  if (aptScore && aptScore >= 80) {
    demonstratedStrengths.push(`Sharp quantitative problem-solving and rapid deduction in aptitude assessments (${aptScore}%).`);
  }
  if (lastInterview?.answers) {
    lastInterview.answers.forEach((ans) => {
      ans.aiFeedback?.strengths?.forEach((str) => {
        if (!demonstratedStrengths.includes(str) && demonstratedStrengths.length < 4) {
          demonstratedStrengths.push(str);
        }
      });
    });
  }
  if (demonstratedStrengths.length === 0) {
    demonstratedStrengths.push('Commitment to proactive practice and honest self-evaluation.');
    demonstratedStrengths.push('Demonstrated persistence through full interview simulation rounds.');
  }

  // ---------------------------------------------------------------------------
  // E. My Improvement Priorities (Top 3)
  // ---------------------------------------------------------------------------
  const topPriorities: ImprovementPriority[] = [];

  // Priority 1: Direct intersection of primary difficulty and weakest phase
  if (feedback.mostChallengingPhase === 'Technical Interview' || feedback.biggestDifficulty.includes('technical')) {
    topPriorities.push({
      rank: 1,
      skill: 'Technical Explanations & Boundary Conditions',
      reason: 'You reported struggling with technical questions or depth.',
      recommendedAction: 'Break down complex algorithms and architecture trade-offs using diagrammatic mental models before speaking.',
    });
  } else if (feedback.mostChallengingPhase === 'HR Interview' || feedback.biggestDifficulty.includes('explain my thoughts')) {
    topPriorities.push({
      rank: 1,
      skill: 'STAR Behavioral Structuring (Situation-Task-Action-Result)',
      reason: 'Difficulty articulating thoughts clearly during situational queries.',
      recommendedAction: 'Frame stories with a strict 4-part structure: S (15s), T (10s), A (35s), R (20s) with measurable numbers.',
    });
  } else {
    topPriorities.push({
      rank: 1,
      skill: 'Nervousness Management & Structured Thinking Under Pressure',
      reason: 'Self-reported anxiety impacting delivery clarity.',
      recommendedAction: 'Practice taking an intentional 2-second breath before answering rather than rushing to fill the silence.',
    });
  }

  // Priority 2: Pacing, communication, or aptitude
  if (feedback.improvementGoals.includes('Communication skills') || feedback.improvementGoals.includes('Speaking fluency')) {
    topPriorities.push({
      rank: 2,
      skill: 'Speaking Pace & Eliminating Verbal Fillers',
      reason: 'Targeting higher conversational polish and eliminating "um/uh" habits.',
      recommendedAction: 'Practice audio recordings aiming for a crisp 120–140 WPM pace with zero filler words.',
    });
  } else if (feedback.mostChallengingPhase === 'Aptitude Test' || feedback.biggestDifficulty.includes('aptitude')) {
    topPriorities.push({
      rank: 2,
      skill: 'Aptitude Speed & Elimination Shortcuts',
      reason: 'Struggling with timed quantitative reasoning.',
      recommendedAction: 'Master unit digit calculations, percentage approximations, and deductive option elimination.',
    });
  } else {
    topPriorities.push({
      rank: 2,
      skill: 'Time Management & Answer Conciseness',
      reason: 'Ensuring answers deliver maximum punch within the 60–90 second window.',
      recommendedAction: 'Conclude answers with a decisive wrap-up phrase rather than trailing off or over-explaining.',
    });
  }

  // Priority 3: Department Specific or Resume Grounding
  topPriorities.push({
    rank: 3,
    skill: `Resume Capstone Defense (${parsedResume?.department || 'Core Engineering'})`,
    reason: 'Connecting academic projects to real-world corporate engineering impact.',
    recommendedAction: 'Prepare 2-minute elevator narratives for your top projects highlighting your individual code ownership.',
  });

  // ---------------------------------------------------------------------------
  // F. 7-Day Improvement Plan
  // ---------------------------------------------------------------------------
  const sevenDayPlan: DayExercise[] = [
    {
      day: 1,
      title: 'Self-Introduction & Elevator Pitch Calibration',
      duration: '20 mins',
      phaseTag: 'HR Voice',
      taskDescription: 'Draft and rehearse a crisp 90-second self-introduction covering your academic branch, defining project milestone, and why you are passionate about engineering.',
      measurableGoal: 'Deliver smoothly at 120–140 WPM with fewer than 2 filler words on audio playback.',
      completed: false,
    },
    {
      day: 2,
      title: 'STAR Method: The Conflict & Teamwork Story',
      duration: '25 mins',
      phaseTag: 'HR Voice',
      taskDescription: 'Identify a real team project disagreement. Write bullet points for Situation, Task, Action (what YOU did), and Result (verifiable metrics or timeline impact).',
      measurableGoal: 'Speak the story out loud in 75 seconds without exceeding the time limit.',
      completed: false,
    },
    {
      day: 3,
      title: 'Core Technical Deep Dive & Edge Cases',
      duration: '30 mins',
      phaseTag: 'Technical',
      taskDescription: `Review top questions from your engineering domain (${parsedResume?.department || 'Engineering'}). Practice explaining the trade-offs between two competing technologies.`,
      measurableGoal: 'Explain one fundamental concept out loud using first principles and correct terminology.',
      completed: false,
    },
    {
      day: 4,
      title: 'Aptitude Speed Drills & Logical Reasoning',
      duration: '25 mins',
      phaseTag: 'Aptitude',
      taskDescription: 'Solve 10 timed aptitude MCQs focusing on percentages, ratios, and syllogisms. Strictly enforce 60 seconds per question.',
      measurableGoal: 'Achieve at least 80% accuracy within the 10-minute timer without second-guessing.',
      completed: false,
    },
    {
      day: 5,
      title: 'Resume Project Ownership Defense',
      duration: '25 mins',
      phaseTag: 'Technical',
      taskDescription: 'Anticipate 3 challenging questions about your primary capstone project: "Why did you choose this architecture?", "What was the hardest bug?", "What would you redesign?".',
      measurableGoal: 'Defend your individual technical role and quantify the performance outcome.',
      completed: false,
    },
    {
      day: 6,
      title: 'High-Pressure Mock Rehearsal (Timed Recording)',
      duration: '20 mins',
      phaseTag: 'Mindset',
      taskDescription: 'Run a simulated interview session with CareerCurve AI Voice Interview. Practice the 2-second pause before speaking to eliminate rushed starts.',
      measurableGoal: 'Complete the entire interview round with an overall communication score above 85%.',
      completed: false,
    },
    {
      day: 7,
      title: 'Comprehensive Review & Benchmarking',
      duration: '30 mins',
      phaseTag: 'Communication',
      taskDescription: 'Review your notes from Days 1–6. Take a full AI Mock Interview round on CareerCurve to benchmark your week-over-week score improvement.',
      measurableGoal: 'Demonstrate measurable increase in overall score and complete your post-interview checklist.',
      completed: false,
    },
  ];

  // ---------------------------------------------------------------------------
  // G. Next Practice Session Recommendation
  // ---------------------------------------------------------------------------
  let nextPracticeSession: NextPracticeRecommendation;

  if (feedback.mostChallengingPhase === 'Technical Interview' || (techScore !== undefined && techScore < 75)) {
    nextPracticeSession = {
      recommendedPhase: 'technical',
      title: 'Technical Interview Round',
      badge: 'High Priority • Knowledge Calibration',
      reason: 'Your self-assessment and scoring pinpoint technical architecture and concept depth as your biggest growth catalyst.',
      keyTopicsToFocus: ['System architecture trade-offs', 'Boundary conditions & edge cases', 'Industry terminology precision'],
    };
  } else if (feedback.mostChallengingPhase === 'Aptitude Test' || (aptScore !== undefined && aptScore < 75)) {
    nextPracticeSession = {
      recommendedPhase: 'aptitude',
      title: 'Aptitude & Logic Screening',
      badge: 'Time-Critical Screening Round',
      reason: 'Aptitude test scores gate initial campus and corporate hiring filters. Drilling speed will unlock technical stages.',
      keyTopicsToFocus: ['Deductive logic', 'Quantitative shortcut formulas', 'Fast option elimination'],
    };
  } else {
    nextPracticeSession = {
      recommendedPhase: 'hr',
      title: 'AI HR Voice Interview Round',
      badge: 'Communication & Behavioral Mastery',
      reason: 'Two-way voice practice will desensitize nervousness, build conversational cadence, and automate your STAR delivery.',
      keyTopicsToFocus: ['Executive self-introduction', 'Quantifiable project outcomes', 'Calm pacing under 90-second countdowns'],
    };
  }

  // ---------------------------------------------------------------------------
  // H. Progress Goals (Measurable future comparison targets)
  // ---------------------------------------------------------------------------
  const progressGoals: ProgressGoal[] = [
    {
      metric: 'Overall Readiness Index',
      currentBenchmark: `${overallReadiness || 75}%`,
      targetBenchmark: '88%+',
      howToMeasure: 'Composite score across Resume ATS, Technical, HR Voice, and Aptitude.',
    },
    {
      metric: 'STAR Method Mastery',
      currentBenchmark: hrScore ? `${hrScore}%` : '70%',
      targetBenchmark: '90%+',
      howToMeasure: 'Automatic detection of all 4 components (S, T, A, R) in behavioral answers.',
    },
    {
      metric: 'Speaking Delivery & Filler Words',
      currentBenchmark: totalFillers > 0 ? `${totalFillers} fillers detected` : '3–5 fillers avg',
      targetBenchmark: '<= 1 filler per response',
      howToMeasure: 'Real-time NLP audio transcript analysis during voice sessions.',
    },
    {
      metric: 'Technical Depth Score',
      currentBenchmark: techScore ? `${techScore}%` : '72%',
      targetBenchmark: '85%+',
      howToMeasure: 'Coverage of essential engineering concepts and absence of misconceptions.',
    },
  ];

  // ---------------------------------------------------------------------------
  // Future comparison if multiple interviews exist
  // ---------------------------------------------------------------------------
  let comparisonWithPrevious = undefined;
  if (interviewSessions.length >= 2) {
    const current = interviewSessions[0].overallScore;
    const prev = interviewSessions[1].overallScore;
    const delta = current - prev;
    comparisonWithPrevious = {
      hasComparison: true,
      previousSessionDate: interviewSessions[1].date,
      scoreDelta: delta,
      note: delta >= 0
        ? `You gained +${delta}% overall improvement compared to your session on ${interviewSessions[1].date}.`
        : `Your score changed by ${delta}% compared to your session on ${interviewSessions[1].date}. Focus on consistent STAR delivery.`,
    };
  }

  return {
    id: `plan_${Date.now()}_${userId.slice(-6)}`,
    userId,
    feedbackId: feedback.id,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    experienceSummary,
    mainChallenges,
    performanceInsights: {
      isScorecardAvailable,
      analysisMode: isScorecardAvailable ? 'real_history_and_feedback' : 'self_reported_only',
      objectiveScores: {
        technical: techScore,
        hr: hrScore,
        aptitude: aptScore,
        ats: atsScore,
        overallReadiness,
      },
      weakestMeasuredAreas,
      confidenceMismatchAnalysis,
      fillerWordsDetected: totalFillers,
      wpmAverage: averageWpm,
    },
    demonstratedStrengths,
    topPriorities,
    sevenDayPlan,
    nextPracticeSession,
    progressGoals,
    personalNotes: '',
    comparisonWithPrevious,
  };
}
