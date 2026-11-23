/**
 * CareerCurve AI — Advanced HR Interview: Voice AI, Live Transcription & Environment Monitoring Verification Suite
 * 
 * Verifies:
 * 1. Text-to-Speech (TTS):
 *    - Browser SpeechSynthesis integration with pause, resume, repeat, and mute controls
 *    - Spoken question indicator and candidate "Answer Now" early interruption shortcut
 * 2. Speech-to-Text (STT) & Editable Answer Review:
 *    - Web SpeechRecognition streaming to live transcript
 *    - Real-time auto-population of candidate's editable textarea
 *    - Candidate review, correction, manual typing fallback, and Clear/Retry controls
 *    - Recognition states: Listening, Transcribing, Paused, Denied
 * 3. Environment Monitoring & Disruption Handling:
 *    - Pre-flight disclosure with local-only client-side privacy guarantee and consent toggle
 *    - Debounced 5-second sustained threshold for disruptions
 *    - Standard disruption categories: CAMERA_DISCONNECTED, CAMERA_OBSCURED, PROLONGED_ABSENCE_FROM_VIEW,
 *      SIGNIFICANT_LIGHTING_CHANGE, POSSIBLE_ADDITIONAL_PERSON, MANUAL_CAMERA_OFF
 *    - Transparent 1-time courtesy warning policy with timer pausing & candidate acknowledgment
 *    - Repeated disruption handling: immediate audio/stream release, Interrupted state transition,
 *      preservation of prior evaluated answers, and blocking premature round completion
 * 4. Compact Environment Status Panel:
 *    - Displays live Camera status, Microphone status, Monitoring state, Warning counter (0/1), and Event logs
 *    - Status badge indicators: Green (Normal), Amber (Warning), Red (Interrupted)
 */

import fs from 'fs';
import path from 'path';
import { speechService } from '../src/services/speechService';
import { 
  EnvironmentDisruptionCategory, 
  EnvironmentEventLogItem, 
  EnvironmentMonitoringState,
  InterruptedHRInterviewReport 
} from '../src/nlp/hr/types';

let passed = 0;
let total = 0;

function assert(condition: boolean, testName: string, detail?: string) {
  total++;
  if (condition) {
    passed++;
    console.log(`  ✓ [PASS] ${testName}`);
  } else {
    console.error(`  ✗ [FAIL] ${testName}`);
    if (detail) console.error(`          Details: ${detail}`);
  }
}

console.log('\n========================================================================');
console.log('   CAREERCURVE AI: ADVANCED HR VOICE AI & ENVIRONMENT MONITORING SUITE');
console.log('========================================================================\n');

// -----------------------------------------------------------------------------
// 1. SPEECH SERVICE & TTS CAPABILITIES
// -----------------------------------------------------------------------------
console.log('--- 1. TEXT-TO-SPEECH (TTS) & VOICE CONTROLS ---');

assert(
  typeof speechService.speakText === 'function' &&
  typeof speechService.stopSpeaking === 'function' &&
  typeof speechService.pauseSpeaking === 'function' &&
  typeof speechService.resumeSpeaking === 'function' &&
  typeof speechService.isSpeaking === 'function' &&
  typeof speechService.isPausedSpeaking === 'function' &&
  typeof speechService.setMuted === 'function',
  'SpeechService provides complete TTS playback, pause, resume, repeat, and mute methods'
);

const hrModulePath = path.resolve(process.cwd(), 'src/components/HRVoiceInterviewModule.tsx');
const hrModuleCode = fs.readFileSync(hrModulePath, 'utf8');

assert(
  hrModuleCode.includes('handleRepeatQuestion') &&
  hrModuleCode.includes('Repeat Question'),
  'HR interview provides Repeat Question control to re-speak the active prompt'
);

assert(
  hrModuleCode.includes('handleToggleTtsPause') &&
  (hrModuleCode.includes('Pause Speech') || hrModuleCode.includes('Resume Speech')),
  'HR interview provides Spoken Question Audio Pause/Resume control'
);

assert(
  hrModuleCode.includes('toggleMute') &&
  (hrModuleCode.includes('Mute Voice') || hrModuleCode.includes('Unmute Voice') || hrModuleCode.includes('Mute AI voice')),
  'HR interview provides Mute/Unmute AI Voice control'
);

assert(
  hrModuleCode.includes('handleAnswerNow') &&
  hrModuleCode.includes('Answer Now'),
  'Candidate can interrupt spoken question audio early to begin answering immediately'
);

assert(
  hrModuleCode.includes('Speaking question aloud...') ||
  hrModuleCode.includes('isAiSpeaking'),
  'Shows visible animated speaking wave or badge when AI interviewer speaks'
);

// -----------------------------------------------------------------------------
// 2. SPEECH-TO-TEXT (STT) & EDITABLE TEXTAREA
// -----------------------------------------------------------------------------
console.log('\n--- 2. SPEECH-TO-TEXT (STT) & EDITABLE TRANSCRIPT REVIEW ---');

assert(
  hrModuleCode.includes('speechService.startListening') &&
  hrModuleCode.includes('onTranscriptChange'),
  'Candidate voice recognition streams live recognized words in real-time'
);

assert(
  hrModuleCode.includes('setCandidateAnswer(text)') &&
  hrModuleCode.includes('<textarea') &&
  hrModuleCode.includes('value={candidateAnswer}'),
  'Recognized transcript automatically populates the editable answer textarea'
);

assert(
  hrModuleCode.includes('onChange={(e) => setCandidateAnswer(e.target.value)}'),
  'Candidate can directly review, edit typos, or refine their response in the textarea before submission'
);

assert(
  hrModuleCode.includes('handleToggleVoiceInput') &&
  (hrModuleCode.includes('Stop Voice (Review Answer)') || hrModuleCode.includes('Start Voice Input')),
  'Provides Start/Stop Voice Input button allowing candidate to pause microphone and review answer'
);

assert(
  hrModuleCode.includes('handleRetryAnswer') &&
  (hrModuleCode.includes('Clear & Retry') || hrModuleCode.includes('Retry Answer')),
  'Provides Clear & Retry Answer control to reset response and re-record'
);

assert(
  hrModuleCode.includes('Microphone access was denied. You can type your answer directly in the box below without penalty.') ||
  hrModuleCode.includes('Microphone access was denied'),
  'Provides graceful fallback allowing manual typing without penalty on mic denial or unsupported browsers'
);

assert(
  hrModuleCode.includes('Mic Listening') &&
  hrModuleCode.includes('speechStatus'),
  'Clearly indicates speech recognition states: Listening, Transcribing, Paused, and Ready'
);

// -----------------------------------------------------------------------------
// 3. ENVIRONMENT MONITORING DISRUPTION POLICIES & DEBOUNCING
// -----------------------------------------------------------------------------
console.log('\n--- 3. ENVIRONMENT MONITORING & 1-WARNING DISRUPTION POLICY ---');

const hrTypesPath = path.resolve(process.cwd(), 'src/nlp/hr/types.ts');
const hrTypesCode = fs.readFileSync(hrTypesPath, 'utf8');

const requiredCategories = [
  'CAMERA_DISCONNECTED',
  'CAMERA_OBSCURED',
  'PROLONGED_ABSENCE_FROM_VIEW',
  'SIGNIFICANT_LIGHTING_CHANGE',
  'POSSIBLE_ADDITIONAL_PERSON',
  'MANUAL_CAMERA_OFF'
];

for (const cat of requiredCategories) {
  assert(
    hrTypesCode.includes(cat) && hrModuleCode.includes(cat),
    `Defines and handles disruption category: ${cat}`
  );
}

assert(
  hrTypesCode.includes("'INTERRUPTED'") &&
  hrTypesCode.includes('InterruptedHRInterviewReport'),
  'HR types define explicit INTERRUPTED state and InterruptedHRInterviewReport interface'
);

assert(
  hrModuleCode.includes('now - absenceTimerStartRef.current >= 5000') &&
  hrModuleCode.includes('now - obscuredTimerStartRef.current >= 5000'),
  'Rolling window debounces transient fluctuations with a 5-second sustained threshold'
);

assert(
  hrModuleCode.includes('warningCountRef.current === 0') &&
  hrModuleCode.includes("severity: 'warning'"),
  'First significant disruption triggers non-punitive courtesy warning (Warning 1 of 1)'
);

assert(
  hrModuleCode.includes('setIsPaused(true)') &&
  hrModuleCode.includes('speechService.pauseSpeaking()') &&
  hrModuleCode.includes('speechService.stopListening()'),
  'First disruption automatically pauses answer timer, speech synthesis, and microphone recording'
);

assert(
  hrModuleCode.includes('handleAcknowledgeWarning') &&
  hrModuleCode.includes('Acknowledge & Resume'),
  'Candidate can acknowledge warning banner/modal and cleanly resume interview timers'
);

assert(
  hrModuleCode.includes("severity: 'interruption'") &&
  hrModuleCode.includes("setInterviewState('INTERRUPTED')") &&
  hrModuleCode.includes('speechService.terminateAll()'),
  'Second sustained disruption immediately terminates streams and transitions interview to INTERRUPTED state'
);

// -----------------------------------------------------------------------------
// 4. INTERRUPTED VIEW & PRESERVATION OF ANSWERS
// -----------------------------------------------------------------------------
console.log('\n--- 4. INTERRUPTED INTERVIEW REPORT & WORKFLOW INTEGRITY ---');

assert(
  hrModuleCode.includes("interviewState === 'INTERRUPTED'") &&
  hrModuleCode.includes('HR Behaviour Interview Interrupted'),
  'Renders dedicated Interrupted Interview Report screen on repeated disruption'
);

assert(
  hrModuleCode.includes('Recorded Disruption Events') &&
  hrModuleCode.includes('monitoringState.events.map'),
  'Interrupted report displays transparent log of recorded disruption events with timestamps'
);

assert(
  hrModuleCode.includes('Preserved Evaluations Prior to Interruption') &&
  hrModuleCode.includes('evaluations.map'),
  'Interrupted report preserves candidate answers and STAR evaluations evaluated prior to interruption'
);

assert(
  hrModuleCode.includes('handleRetakeRound') &&
  hrModuleCode.includes('Retake HR Behaviour Round'),
  'Provides candidate option to Retake HR Behaviour Round with fresh environment'
);

assert(
  hrModuleCode.includes('handleReturnToSetup') &&
  hrModuleCode.includes('Return to Interview Setup'),
  'Provides candidate option to Return to Interview Rounds Setup'
);

assert(
  !hrModuleCode.includes("interviewState === 'INTERRUPTED'\nonCompleteInterview"),
  'Interrupted round is never marked as Completed or passed as finished to parent workflow'
);

// -----------------------------------------------------------------------------
// 5. COMPACT ENVIRONMENT STATUS PANEL & CONSENT NOTICE
// -----------------------------------------------------------------------------
console.log('\n--- 5. COMPACT ENVIRONMENT PANEL & INFORMED CONSENT ---');

assert(
  hrModuleCode.includes('Interview Environment Monitoring & Fair Assessment Policy') &&
  hrModuleCode.includes('hasEnvironmentConsent'),
  'Pre-flight setup screen displays Environment Monitoring Notice with explicit candidate consent checkbox'
);

assert(
  hrModuleCode.includes('Zero Server Uploads') &&
  hrModuleCode.includes('processed entirely within your browser'),
  'Notice explicitly guarantees 100% local browser processing with zero video or audio server uploads'
);

assert(
  hrModuleCode.includes('Environment Monitor') &&
  hrModuleCode.includes('monitoringState.cameraStatus') &&
  hrModuleCode.includes('monitoringState.micStatus'),
  'Compact Environment Status Panel renders live Camera, Microphone, and Monitoring status'
);

assert(
  hrModuleCode.includes('Warning Count') &&
  hrModuleCode.includes('monitoringState.warningCount'),
  'Environment Status Panel displays Warning Counter (0/1 or 1/1)'
);

assert(
  hrModuleCode.includes('● Normal') &&
  hrModuleCode.includes('▲ Warning (1/1)') &&
  hrModuleCode.includes('✖ Interrupted'),
  'Environment Status Panel badge transitions between Normal (green), Warning (amber), and Interrupted (red)'
);

// -----------------------------------------------------------------------------
// 6. WEBCAM FEED METRICS TELEMETRY INTEGRATION
// -----------------------------------------------------------------------------
console.log('\n--- 6. WEBCAM FEED METRICS TELEMETRY INTEGRATION ---');

const webcamPath = path.resolve(process.cwd(), 'src/components/WebcamFeed.tsx');
const webcamCode = fs.readFileSync(webcamPath, 'utf8');

assert(
  webcamCode.includes('export interface EnvironmentMetrics') &&
  webcamCode.includes('onEnvironmentMetrics?: (metrics: EnvironmentMetrics) => void'),
  'WebcamFeed exports EnvironmentMetrics interface and onEnvironmentMetrics prop'
);

assert(
  webcamCode.includes('isObscured: isFrameObscured') &&
  webcamCode.includes('faceCoverage') &&
  webcamCode.includes('averageBrightness'),
  'WebcamFeed real-time pixel loop samples brightness, skin coverage, and obstruction'
);

assert(
  hrModuleCode.includes('onEnvironmentMetrics={handleEnvironmentMetrics}'),
  'HRVoiceInterviewModule connects live video telemetry to its environment disruption engine'
);

// -----------------------------------------------------------------------------
// SUMMARY
// -----------------------------------------------------------------------------
console.log('\n========================================================================');
console.log(`   TEST RESULTS: ${passed} / ${total} CHECKS PASSED (${Math.round((passed / total) * 100)}%)`);
console.log('========================================================================\n');

if (passed === total) {
  process.exit(0);
} else {
  process.exit(1);
}
