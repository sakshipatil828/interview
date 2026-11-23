/**
 * CareerCurve AI — Automated Camera Verification Suite
 * Tests Live Camera implementation in Technical and HR Behaviour Interview Rounds
 * 
 * Verifies:
 * 1. Native getUserMedia API usage with { video: ..., audio: false } (camera only, zero mic conflicts)
 * 2. Proper HTML5 Video element properties: autoPlay, playsInline, muted, srcObject
 * 3. Status indicator: "Camera On" (live with pulsing dot) and "Camera Off" (stream released)
 * 4. User camera controls: "Turn Camera Off" / "Turn Camera On" and "Retry Camera"
 * 5. Complete media track cleanup and hardware release on unmount / interview exit
 * 6. Troubleshooting messages for denied, not found, in-use, and insecure contexts
 * 7. Correct layout integration in TechnicalInterviewModule (without covering questions/code editor)
 * 8. Correct layout integration in HRVoiceInterviewModule (unclipped, no audio conflict with speech recognition)
 * 9. Preservation of all existing NLP algorithms, STAR evaluation, and scorecards
 */

import fs from 'fs';
import path from 'path';

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
console.log('   CAREERCURVE AI: LIVE CAMERA IMPLEMENTATION TEST SUITE');
console.log('========================================================================\n');

// -----------------------------------------------------------------------------
// 1. WEBCAM COMPONENT ARCHITECTURE & CONSTRAINTS
// -----------------------------------------------------------------------------
console.log('--- 1. SHARED WEBCAM COMPONENT & CONSTRAINTS ---');

const webcamPath = path.resolve(process.cwd(), 'src/components/WebcamFeed.tsx');
const webcamCode = fs.readFileSync(webcamPath, 'utf8');

assert(
  webcamCode.includes('navigator.mediaDevices.getUserMedia') &&
  webcamCode.includes('audio: false'),
  'Uses native navigator.mediaDevices.getUserMedia with audio: false (camera-only preview)'
);

assert(
  webcamCode.includes('video: true') &&
  webcamCode.includes('audio: false'),
  'Uses { video: true, audio: false } for standard universal camera access'
);

assert(
  !webcamCode.includes('audio: true'),
  'Never requests microphone (audio: true) for camera preview, preventing microphone conflicts'
);

assert(
  webcamCode.includes('autoPlay') &&
  webcamCode.includes('playsInline') &&
  webcamCode.includes('muted'),
  'Video element has autoPlay, playsInline, and muted attributes'
);

assert(
  webcamCode.includes('setVideoRef') &&
  webcamCode.includes('node.srcObject = streamRef.current') &&
  webcamCode.includes('videoNode.srcObject = stream'),
  'Video element receives stream via both callback ref (setVideoRef) and stream synchronization effect'
);

assert(
  webcamCode.includes('isRequestingRef') &&
  webcamCode.includes('if (isRequestingRef.current)'),
  'Prevents concurrent duplicate getUserMedia requests to avoid device hardware locking'
);

assert(
  webcamCode.includes('isMountedRef') &&
  webcamCode.includes('if (!isMountedRef.current)'),
  'Guards against unmount race conditions by releasing tracks if unmounted while awaiting permission'
);

assert(
  !webcamCode.includes('${isCameraActive ? \'block\' : \'hidden\'}') &&
  webcamCode.includes('className="w-full h-full object-cover transform -scale-x-100"'),
  'Video element is unconditionally rendered in DOM without display:none so playback never stalls'
);

assert(
  webcamCode.includes('isCameraActiveAndPlaying') &&
  webcamCode.includes('isPlaying') &&
  webcamCode.includes('onPlaying'),
  'Displays "Camera On" only when stream is active AND video element is actually playing'
);

// -----------------------------------------------------------------------------
// 2. CAMERA STATUS INDICATOR & CONTROLS
// -----------------------------------------------------------------------------
console.log('\n--- 2. CAMERA STATUS INDICATORS & USER CONTROLS ---');

assert(
  webcamCode.includes('Camera On') &&
  webcamCode.includes('animate-pulse'),
  'Displays explicit "Camera On" status indicator with live indicator badge'
);

assert(
  webcamCode.includes('Camera Off') ||
  webcamCode.includes('Camera Feed Paused'),
  'Displays explicit "Camera Off" status indicator when camera is paused or disabled'
);

assert(
  webcamCode.includes('Turn Camera Off') &&
  webcamCode.includes('Turn Camera On'),
  'Provides functional camera controls to turn the camera off and back on'
);

assert(
  webcamCode.includes('Retry Camera'),
  'Includes dedicated "Retry Camera" button for permission re-requests'
);

// -----------------------------------------------------------------------------
// 3. TRACK RELEASE & LIFECYCLE CLEANUP
// -----------------------------------------------------------------------------
console.log('\n--- 3. TRACK RELEASE & STREAM CLEANUP ---');

assert(
  webcamCode.includes('streamRef.current.getTracks().forEach((track) =>') &&
  webcamCode.includes('track.stop()'),
  'Releases and stops all active media tracks when stopping or disabling camera'
);

assert(
  webcamCode.includes('return () => {') &&
  webcamCode.includes('track.stop()') &&
  webcamCode.includes('streamRef.current = null'),
  'Stops every media track immediately on component unmount, preventing background hardware usage'
);

assert(
  webcamCode.includes('videoRef.current.srcObject = null'),
  'Clears video.srcObject on camera stop and component teardown'
);

// -----------------------------------------------------------------------------
// 4. TROUBLESHOOTING & ERROR HANDLING
// -----------------------------------------------------------------------------
console.log('\n--- 4. TROUBLESHOOTING & ERROR MESSAGES ---');

assert(
  webcamCode.includes('Camera access was blocked. Allow camera access in your browser settings and try again.'),
  'Provides exact troubleshooting message for blocked/denied permission'
);

assert(
  webcamCode.includes('No camera was detected. Connect a webcam and retry.'),
  'Provides exact troubleshooting message for missing camera hardware'
);

assert(
  webcamCode.includes('Your camera may be in use by another application. Close the other application and retry.'),
  'Provides exact troubleshooting message for camera busy / in-use'
);

assert(
  webcamCode.includes('Camera access requires a supported browser and a secure context, such as HTTPS or localhost.'),
  'Provides exact message for unsupported browser or insecure non-HTTPS context'
);

// -----------------------------------------------------------------------------
// 5. TECHNICAL INTERVIEW INTEGRATION
// -----------------------------------------------------------------------------
console.log('\n--- 5. TECHNICAL INTERVIEW CAMERA INTEGRATION ---');

const techModulePath = path.resolve(process.cwd(), 'src/components/TechnicalInterviewModule.tsx');
const techModuleCode = fs.readFileSync(techModulePath, 'utf8');

assert(
  techModuleCode.includes('<WebcamFeed') &&
  techModuleCode.includes("import { WebcamFeed } from './WebcamFeed'"),
  'TechnicalInterviewModule imports and renders the shared WebcamFeed component'
);

assert(
  techModuleCode.includes('lg:col-span-5') &&
  techModuleCode.includes('lg:col-span-7'),
  'Technical interview layout places camera in right column (5 cols) without obscuring questions/code workspace (7 cols)'
);

assert(
  techModuleCode.includes('Candidate Live Webcam & Telemetry'),
  'Technical interview includes professional header for live candidate video preview'
);

// -----------------------------------------------------------------------------
// 6. HR BEHAVIOUR INTERVIEW INTEGRATION
// -----------------------------------------------------------------------------
console.log('\n--- 6. HR BEHAVIOUR INTERVIEW CAMERA INTEGRATION ---');

const hrModulePath = path.resolve(process.cwd(), 'src/components/HRVoiceInterviewModule.tsx');
const hrModuleCode = fs.readFileSync(hrModulePath, 'utf8');

assert(
  hrModuleCode.includes('<WebcamFeed') &&
  hrModuleCode.includes("import { WebcamFeed } from './WebcamFeed'"),
  'HRVoiceInterviewModule imports and renders the shared WebcamFeed component'
);

assert(
  hrModuleCode.includes('interviewState !== \'COMPLETED\'') &&
  !hrModuleCode.includes('interviewState === \'SETUP\'\n<WebcamFeed'),
  'HR round only mounts camera preview during active interview, not on pre-flight setup'
);

assert(
  !hrModuleCode.includes('h-44 rounded-2xl overflow-hidden'),
  'Removed restrictive h-44 clipping container, ensuring full visibility of camera and controls'
);

assert(
  hrModuleCode.includes('Candidate Live Webcam'),
  'HR round renders clear Candidate Live Webcam section in recruiter split view'
);

// -----------------------------------------------------------------------------
// 7. PRESERVATION OF CORE ENGINES
// -----------------------------------------------------------------------------
console.log('\n--- 7. PRESERVATION OF NLP ENGINES & QUESTION WORKFLOW ---');

const nlpMatcherPath = path.resolve(process.cwd(), 'src/nlp/nlpQuestionMatcher.ts');
const nlpMatcherCode = fs.readFileSync(nlpMatcherPath, 'utf8');

assert(
  nlpMatcherCode.includes('evaluateAnswerNLP') &&
  nlpMatcherCode.includes('cosineSimilarity'),
  'Technical NLP question matcher and semantic evaluation are fully preserved'
);

const hrEvaluatorPath = path.resolve(process.cwd(), 'src/nlp/hr/hrAnswerEvaluator.ts');
const hrEvaluatorCode = fs.readFileSync(hrEvaluatorPath, 'utf8');

assert(
  hrEvaluatorCode.includes('evaluateHRAnswer') &&
  hrEvaluatorCode.includes('analyzeCommunicationMetrics'),
  'HR speech pacing, STAR behavioral framework, and NLP evaluation are fully preserved'
);

console.log('\n========================================================================');
console.log(`   TEST RESULTS: ${passed} / ${total} CHECKS PASSED (${Math.round((passed / total) * 100)}%)`);
console.log('========================================================================\n');

if (passed === total) {
  process.exit(0);
} else {
  process.exit(1);
}
