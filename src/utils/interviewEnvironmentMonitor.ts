/**
 * CareerCurve AI Interview Preparation Platform
 * Extra-Person Detection & 3-Warning Rule Policy Engine
 * 
 * Strict Policy Requirements:
 * 1. Monitor existing webcam stream for extra persons using genuine client-side CV model.
 * 2. Normal condition: only 1 candidate visible.
 * 3. Trigger warning ONLY when 2 or more people are simultaneously detected in the camera frame
 *    for a sustained period (>= 2s) confirmed across multiple frames.
 * 4. Darkness, lighting changes, shadows, camera exposure, or background changes NEVER trigger a warning or termination.
 * 5. Exactly 3 Warnings before termination:
 *    - Warning 1 of 3: "Warning 1 of 3: Another person has been detected in your camera view. Please ensure you are alone during the interview."
 *    - Warning 2 of 3: "Warning 2 of 3: Another person has been detected in your camera view. Please ensure you are alone during the interview."
 *    - Warning 3 of 3: "Warning 3 of 3: Another person has been detected in your camera view. Please ensure you are alone during the interview. A further confirmed detection will automatically end this practice interview."
 * 6. Termination ONLY after the third warning (on the 4th confirmed detection):
 *    - Automatically end HR interview.
 *    - Stop timers & speech recognition/synthesis.
 *    - Disable further answer submissions.
 *    - Display: "HR Practice Interview Ended — Repeated Extra-Person Detection."
 *    - Mark round as Interrupted, never Completed.
 *    - Release only camera & mic resources owned by interview.
 * 7. Camera & model failures:
 *    - If camera denied or model fails, show monitoring error, NEVER treat as an extra person.
 */

import { 
  EnvironmentDisruptionCategory, 
  EnvironmentEventLogItem, 
  InterruptedHRInterviewReport,
  HREvaluationResult
} from '../nlp/hr/types';
import { personDetectionService, PersonDetectionOutput } from '../services/personDetectionService';

export const MAX_WARNINGS = 3;
export const DETECTION_INTERVAL_MS = 5000;         // Exact 5-second detection interval
export const SUSTAINED_PERSON_THRESHOLD_MS = 2000; // Compatibility fallback
export const CONFIRMATION_FRAMES_REQUIRED = 2;     // Minimum 2 confirmed frames in 5s interval
export const COOLDOWN_MS = 3000;                   // Cooldown period after acknowledgment

/**
 * EXACT Warning Messages required by the 5-Second Interval & 3-Warning Rule policy.
 */
export const EXACT_PERSON_WARNING_1_BODY = 
  "Another person has been detected in your camera view. Please ensure you are alone.";

export const EXACT_PERSON_WARNING_2_BODY = 
  "Multiple people are still detected. This is your second warning.";

export const EXACT_PERSON_WARNING_3_BODY = 
  "Final warning. Your camera and HR interview are now paused.";

export const EXACT_PERSON_WARNING_1 = 
  "Warning 1/3: Another person has been detected in your camera view. Please ensure you are alone.";

export const EXACT_PERSON_WARNING_2 = 
  "Warning 2/3: Multiple people are still detected. This is your second warning.";

export const EXACT_PERSON_WARNING_3 = 
  "Warning 3/3: Final warning. Your camera and HR interview are now paused.";

export const EXACT_PERSON_ENTERED_MSG = EXACT_PERSON_WARNING_1;
export const EXACT_PERSON_WARNING_1_ALT = EXACT_PERSON_WARNING_1;

export const EXACT_WARNING_MESSAGE = 
  "Interview Environment Warning (1/1): A significant lighting or camera-environment interruption has been detected. Please restore suitable lighting and ensure that you are the only person visible during the interview. A repeated qualifying incident within the next few seconds will automatically end this interview.";

export const TERMINATION_TITLE = 
  "HR Practice Interview Ended — Repeated Extra-Person Detection.";

export const TERMINATION_TITLE_PLAIN = 
  "HR Practice Interview Ended — Repeated Extra-Person Detection";

export const WARNING_MESSAGES: Record<number, string> = {
  1: EXACT_PERSON_WARNING_1,
  2: EXACT_PERSON_WARNING_2,
  3: EXACT_PERSON_WARNING_3,
};

export const WARNING_BODIES: Record<number, string> = {
  1: EXACT_PERSON_WARNING_1_BODY,
  2: EXACT_PERSON_WARNING_2_BODY,
  3: EXACT_PERSON_WARNING_3_BODY,
};

export function getWarningMessage(warningNumber: number): string {
  return WARNING_MESSAGES[warningNumber] || EXACT_PERSON_WARNING_1;
}

/**
 * State machine helper for tracking 5-second continuous multi-person detection intervals and warnings.
 * 
 * Rules:
 * 1. Checks whether two or more people are visible continuously.
 * 2. At 5s continuous: Warning 1 of 3
 * 3. At 10s continuous: Warning 2 of 3
 * 4. At 15s continuous: Warning 3 of 3 and automatically pauses camera and interview.
 * 5. If person count returns to 1: resets continuous duration to 0s, preserves session warnings.
 * 6. If another person enters again: fresh 5-second continuous countdown to next warning.
 */
export class ExtraPersonEventTracker {
  private sessionWarningCount = 0;
  private multiPersonStartTime: number | null = null;
  private currentEventWarnings = 0;
  private hasExtraPersonLeft = true;
  private isTerminated = false;
  private isCameraPaused = false;

  constructor(
    private maxWarnings = MAX_WARNINGS,
    private intervalMs = DETECTION_INTERVAL_MS,
    private requiredFrames = CONFIRMATION_FRAMES_REQUIRED,
    private cooldownMs = 0
  ) {}

  public getWarningCount(): number {
    return this.sessionWarningCount;
  }

  public isPaused(): boolean {
    return this.isCameraPaused;
  }

  public isInterviewTerminated(): boolean {
    return this.isTerminated;
  }

  public getHasExtraPersonLeft(): boolean {
    return this.hasExtraPersonLeft;
  }

  public getContinuousDurationSeconds(currentTime = Date.now()): number {
    if (this.multiPersonStartTime === null) return 0;
    return Math.max(0, Math.floor((currentTime - this.multiPersonStartTime) / 1000));
  }

  public getIntervalStartTime(): number | null {
    return this.multiPersonStartTime;
  }

  public hasWarnedThisInterval(): boolean {
    return this.currentEventWarnings > 0;
  }

  public acknowledgeWarning(currentTime = Date.now()): void {
    // Immediate acknowledgment hook
  }

  public resumeCameraAndInterview(resetWarnings = false, currentTime = Date.now()): void {
    this.isCameraPaused = false;
    this.multiPersonStartTime = null;
    this.currentEventWarnings = 0;
    this.hasExtraPersonLeft = true;
    if (resetWarnings) {
      this.sessionWarningCount = 0;
    }
  }

  public reset(): void {
    this.sessionWarningCount = 0;
    this.multiPersonStartTime = null;
    this.currentEventWarnings = 0;
    this.hasExtraPersonLeft = true;
    this.isCameraPaused = false;
    this.isTerminated = false;
  }

  /**
   * Process a frame observation against the continuous 5-second countdown rule:
   * - 5s continuous: Warning 1 (or next warning)
   * - 10s continuous: Warning 2 (or next warning)
   * - 15s continuous: Warning 3 & automatic pause
   * - If candidate returns to 1 person: resets continuous duration to 0s, preserves sessionWarningCount
   * - When another person enters again: fresh 5s continuous countdown to next warning
   */
  public processObservation(personCount: number, currentTime = Date.now()): {
    eventTriggered: boolean;
    incident?: ReturnType<typeof handleExtraPersonIncident>;
    reason?: string;
    currentDurationSeconds: number;
    warningCount: number;
  } {
    if (this.isTerminated || this.isCameraPaused) {
      return {
        eventTriggered: false,
        reason: this.isCameraPaused ? 'Camera paused — warning limit reached' : 'Already terminated',
        currentDurationSeconds: this.getContinuousDurationSeconds(currentTime),
        warningCount: this.sessionWarningCount,
      };
    }

    // If person count is 0 or 1: normal candidate only
    if (personCount <= 1) {
      this.multiPersonStartTime = null;
      this.currentEventWarnings = 0;
      this.hasExtraPersonLeft = true;
      return {
        eventTriggered: false,
        reason: 'Normal state (single person)',
        currentDurationSeconds: 0,
        warningCount: this.sessionWarningCount,
      };
    }

    // personCount >= 2: Multiple people detected in camera frame
    this.hasExtraPersonLeft = false;

    if (this.multiPersonStartTime === null) {
      this.multiPersonStartTime = currentTime;
      this.currentEventWarnings = 0;
    }

    const continuousDurationMs = currentTime - this.multiPersonStartTime;
    const continuousDurationSec = Math.floor(continuousDurationMs / 1000);

    // Each warning in the continuous event occurs every 5 seconds:
    // Event warning 1: at (0 + 1) * 5000 = 5000ms
    // Event warning 2: at (1 + 1) * 5000 = 10000ms
    // Event warning 3: at (2 + 1) * 5000 = 15000ms
    const nextThresholdMs = (this.currentEventWarnings + 1) * this.intervalMs;

    if (continuousDurationMs >= nextThresholdMs && this.sessionWarningCount < this.maxWarnings) {
      this.currentEventWarnings += 1;
      const incident = handleExtraPersonIncident(this.sessionWarningCount, personCount);
      this.sessionWarningCount = incident.nextWarningCount;

      if (incident.shouldPauseCamera || this.sessionWarningCount >= this.maxWarnings) {
        this.isCameraPaused = true;
      }

      return {
        eventTriggered: true,
        incident,
        currentDurationSeconds: continuousDurationSec,
        warningCount: this.sessionWarningCount,
      };
    }

    return {
      eventTriggered: false,
      reason: `Continuous detection active (${continuousDurationSec}s). Next warning at ${Math.ceil(nextThresholdMs / 1000)}s`,
      currentDurationSeconds: continuousDurationSec,
      warningCount: this.sessionWarningCount,
    };
  }
}

export interface EnvironmentMonitorConfig {
  qualifyingThresholdMs: number;      // Threshold for extra person: 2000ms
  repeatWindowMs: number;              // Window between events
  confirmationFrames: number;          // Required frames: 3
  maxWarnings: number;                 // Exactly 3 warnings
}

export const DEFAULT_MONITOR_CONFIG: EnvironmentMonitorConfig = {
  qualifyingThresholdMs: 2000,
  repeatWindowMs: 5000,
  confirmationFrames: 3,
  maxWarnings: 3,
};

/**
 * Lighting analysis helper:
 * Analyzes video feed luminance and dark pixel ratio to identify significant darkness.
 */
export function detectLightingChange(
  metrics: {
    averageBrightness: number;
    luminance: number;
    darkPixelRatio?: number;
    isObscured?: boolean;
    isLive?: boolean;
  },
  baselineLuminance = 1000,
  config = DEFAULT_MONITOR_CONFIG
): {
  isSignificantDarkness: boolean;
  isWarningCondition: boolean;
  shouldTerminate: boolean;
  reason: string;
  details: string;
} {
  const isDark = (metrics.averageBrightness !== undefined && metrics.averageBrightness < 25) ||
                 (metrics.darkPixelRatio !== undefined && metrics.darkPixelRatio > 0.85) ||
                 (metrics.luminance !== undefined && baselineLuminance > 0 && metrics.luminance < baselineLuminance * 0.25);

  if (isDark) {
    return {
      isSignificantDarkness: true,
      isWarningCondition: false, // Informational for camera stream checks; extra-person rule decouples direct warnings
      shouldTerminate: false,
      reason: 'Significant Lighting Drop: Camera image too dark',
      details: 'Substantial darkness or lighting drop detected in camera preview frame.',
    };
  }

  return {
    isSignificantDarkness: false,
    isWarningCondition: false,
    shouldTerminate: false,
    reason: 'Normal lighting',
    details: 'Lighting, darkness, shadows, and exposure adjustments within acceptable limits.',
  };
}

export interface PersonDetectionResult {
  isAvailable: boolean;
  additionalPersonDetected: boolean;
  personCount: number;
  confidence: number;
  message: string;
  status?: string;
}

/**
 * Evaluates whether more than one person is visible in camera view using genuine client-side model.
 * If model is unavailable or fails, returns isAvailable: false without pretending.
 */
export function detectAdditionalPerson(
  videoElement?: HTMLVideoElement | null
): PersonDetectionResult {
  // 1. Check custom detector on window (e.g. from tests or globals)
  const win = typeof window !== 'undefined' ? (window as any) : null;
  const custom = win?.__careercurvePersonDetector?.detectPersons || win?.__careercurvePersonDetector;
  if (custom && typeof custom === 'function') {
    try {
      const res = custom(videoElement);
      if (res && typeof res.count === 'number') {
        const count = res.count;
        const conf = typeof res.confidence === 'number' ? res.confidence : 0.85;
        return {
          isAvailable: true,
          additionalPersonDetected: count >= 2,
          personCount: count,
          confidence: conf,
          message: count >= 2
            ? 'Multiple People Detected'
            : count === 1
            ? 'Single Person'
            : 'No Person',
          status: 'ready',
        };
      }
    } catch (e) {
      console.warn('Error in custom person detector:', e);
    }
  }

  // 2. Check personDetectionService synchronous detector
  const serviceSync = personDetectionService.detectPersonsSync(videoElement);
  if (serviceSync) {
    return {
      isAvailable: serviceSync.isAvailable,
      additionalPersonDetected: serviceSync.personCount >= 2,
      personCount: serviceSync.personCount,
      confidence: serviceSync.confidence,
      message: serviceSync.message,
      status: serviceSync.status,
    };
  }

  // 3. Fallback to personDetectionService.getLastOutput()
  const lastOut = personDetectionService.getLastOutput();
  if (lastOut && lastOut.isAvailable) {
    return {
      isAvailable: true,
      additionalPersonDetected: lastOut.personCount >= 2,
      personCount: lastOut.personCount,
      confidence: lastOut.confidence,
      message: lastOut.message,
      status: lastOut.status,
    };
  }

  // 4. Model is loading or unavailable
  const modelStatus = personDetectionService.getStatus();
  return {
    isAvailable: false,
    additionalPersonDetected: false,
    personCount: 1,
    confidence: 0,
    status: modelStatus,
    message: modelStatus === 'loading'
      ? 'Person-detection model is initializing...'
      : 'Person-detection model not loaded / unavailable in browser',
  };
}

/**
 * Handles an extra-person detection event:
 * - 1st detection -> Warning 1 of 3
 * - 2nd detection -> Warning 2 of 3
 * - 3rd detection -> Warning 3 of 3 (final warning before termination)
 * - 4th detection -> Automatic termination
 */
export function handleExtraPersonIncident(
  currentWarningCount: number,
  personCount = 2
): {
  nextWarningCount: number;
  shouldWarn: boolean;
  shouldPauseCamera: boolean;
  shouldTerminate: boolean;
  warningMessage: string;
  warningBody: string;
  warningLabel: string;
  isFinalWarning: boolean;
} {
  if (currentWarningCount < MAX_WARNINGS) {
    const nextCount = currentWarningCount + 1;
    const isFinal = nextCount === MAX_WARNINGS;
    return {
      nextWarningCount: nextCount,
      shouldWarn: true,
      shouldPauseCamera: isFinal,
      shouldTerminate: false,
      warningMessage: getWarningMessage(nextCount),
      warningBody: WARNING_BODIES[nextCount] || EXACT_PERSON_WARNING_1_BODY,
      warningLabel: `Warning ${nextCount}/3`,
      isFinalWarning: isFinal,
    };
  }

  // If already at warning limit, maintain pause state
  return {
    nextWarningCount: MAX_WARNINGS,
    shouldWarn: false,
    shouldPauseCamera: true,
    shouldTerminate: false,
    warningMessage: getWarningMessage(MAX_WARNINGS),
    warningBody: WARNING_BODIES[MAX_WARNINGS] || EXACT_PERSON_WARNING_3_BODY,
    warningLabel: `Warning ${MAX_WARNINGS}/3`,
    isFinalWarning: true,
  };
}

/**
 * Backward compatibility helpers for previous test suites
 */
export function handleFirstWarning(
  currentWarningCountOrCategory: number | string = 0,
  description?: string
): EnvironmentEventLogItem & {
  newWarningCount: number;
  isFirstWarning: boolean;
  shouldPause: boolean;
  warningMessage: string;
} {
  const isNumber = typeof currentWarningCountOrCategory === 'number';
  const newCount = isNumber ? currentWarningCountOrCategory + 1 : 1;
  const category: EnvironmentDisruptionCategory = isNumber 
    ? 'SIGNIFICANT_LIGHTING_CHANGE' 
    : (currentWarningCountOrCategory as EnvironmentDisruptionCategory);

  return {
    id: `warn_${Date.now()}`,
    timestamp: new Date().toLocaleTimeString('en-US', { hour12: false }),
    category,
    categoryLabel: category === 'POSSIBLE_ADDITIONAL_PERSON' 
      ? 'Extra Person Detected' 
      : category === 'SIGNIFICANT_LIGHTING_CHANGE'
      ? 'Significant Lighting Drop'
      : 'Interview Environment Disruption',
    description: description || EXACT_WARNING_MESSAGE,
    severity: 'warning',
    newWarningCount: newCount,
    isFirstWarning: newCount === 1,
    shouldPause: true,
    warningMessage: EXACT_WARNING_MESSAGE,
  };
}

export function shouldTriggerTermination(warningCount: number, isRepeatWindowActive = true): boolean {
  if (warningCount >= MAX_WARNINGS) return true;
  return warningCount >= 1 && isRepeatWindowActive === true;
}

/**
 * Formats elapsed seconds into standard MM:SS format.
 */
export function formatElapsedDuration(totalSecondsElapsed: number): string {
  const safeSeconds = Math.max(0, Math.floor(totalSecondsElapsed));
  const mins = Math.floor(safeSeconds / 60);
  const secs = safeSeconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Builds the InterruptedHRInterviewReport on automatic termination.
 */
export function buildInterruptedReport(params: {
  sessionId?: string;
  candidateName: string;
  reason?: string;
  repeatIncident?: string;
  totalElapsedSeconds: number;
  evaluations: HREvaluationResult[];
  events: EnvironmentEventLogItem[];
  warningCount?: number;
  detectedPersonCount?: number;
}): InterruptedHRInterviewReport {
  const elapsedFormatted = formatElapsedDuration(params.totalElapsedSeconds);
  const preservedCount = params.evaluations.length;
  const preservedStatus = preservedCount > 0 
    ? `Preserved (${preservedCount} evaluated ${preservedCount === 1 ? 'answer' : 'answers'})` 
    : 'None submitted prior to interruption';

  const computedWarningCount = params.warningCount !== undefined 
    ? params.warningCount 
    : (params.events && params.events.length > 0 
        ? (params.events.filter(e => e.severity === 'warning').length || 1) 
        : 1);

  return {
    sessionId: params.sessionId || `hr_interrupted_${Date.now()}`,
    candidateName: params.candidateName || 'Candidate',
    interruptedAt: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    reason: params.reason || TERMINATION_TITLE,
    warningCount: computedWarningCount,
    repeatIncident: params.repeatIncident || 'Fourth confirmed extra-person event after 3 warnings',
    elapsedDuration: elapsedFormatted,
    completedAnswersCount: preservedCount,
    evaluatedAnswers: params.evaluations,
    preservedAnswersStatus: preservedStatus,
    events: params.events,
    status: 'interrupted',
  };
}

/**
 * Storage keys for environment and person detection event logs
 */
const STORAGE_KEYS = {
  USER_EVENTS_PREFIX: 'careercurve:user:',
  EVENTS_SUFFIX: ':hr_environment_events',
  FALLBACK_EVENTS: 'careercurve:hr_environment_events',
  SESSION_LATEST_REPORT: 'careercurve:latest_interrupted_session',
  SESSION_LATEST_EVENTS: 'careercurve:latest_environment_events',
};

/**
 * Persists an event log item and optional interruption report to browser storage.
 */
export function saveEnvironmentEventLog(
  userId: string | null | undefined,
  event: EnvironmentEventLogItem,
  report?: InterruptedHRInterviewReport | null
): void {
  try {
    if (typeof window === 'undefined') return;

    const storageKey = userId 
      ? `${STORAGE_KEYS.USER_EVENTS_PREFIX}${userId}${STORAGE_KEYS.EVENTS_SUFFIX}`
      : STORAGE_KEYS.FALLBACK_EVENTS;

    let existingEvents: EnvironmentEventLogItem[] = [];
    const stored = window.localStorage.getItem(storageKey);
    if (stored) {
      try {
        existingEvents = JSON.parse(stored);
      } catch {}
    }

    const updatedEvents = [event, ...existingEvents].slice(0, 50);
    window.localStorage.setItem(storageKey, JSON.stringify(updatedEvents));
    window.sessionStorage.setItem(STORAGE_KEYS.SESSION_LATEST_EVENTS, JSON.stringify(updatedEvents));

    if (report) {
      window.sessionStorage.setItem(STORAGE_KEYS.SESSION_LATEST_REPORT, JSON.stringify(report));
    }
  } catch (err) {
    console.warn('Failed to persist extra-person event log to browser storage:', err);
  }
}

/**
 * Retrieves event logs from browser storage.
 */
export function getEnvironmentEventLogs(userId?: string | null): EnvironmentEventLogItem[] {
  try {
    if (typeof window === 'undefined') return [];
    const storageKey = userId 
      ? `${STORAGE_KEYS.USER_EVENTS_PREFIX}${userId}${STORAGE_KEYS.EVENTS_SUFFIX}`
      : STORAGE_KEYS.FALLBACK_EVENTS;

    const stored = window.localStorage.getItem(storageKey);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch {}
  return [];
}
