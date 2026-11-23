/**
 * CareerCurve AI Communication Round — Type Definitions
 * 
 * Supports face-to-face AI communication practice for both technical and non-technical candidates.
 */

import { EducationalBackgroundCategory, CandidateTrack, CommunicationMetricBreakdown } from '../../types';

export type CommunicationCategory = 
  | 'fresher_general'
  | 'fresher_non_technical'
  | 'fresher_technical'
  | 'experienced_professional'
  | 'resume_skill_based';

export interface CommunicationTopic {
  id: string;
  category: CommunicationCategory;
  title: string;
  promptText: string;
  discipline?: string;
  prepTimeSeconds: number; // e.g. 20
  speakingTimeSeconds: number; // e.g. 90
  expectedConcepts: string[];
  keywords: string[];
  sampleStrongPoints: string[];
  exampleFollowUp: string;
}

export interface CommunicationEvaluationResult {
  topicId: string;
  topicTitle: string;
  transcript: string;
  durationSeconds: number;
  wordCount: number;
  wpm: number;
  metrics: CommunicationMetricBreakdown;
  overallScore: number; // 0-100
  ratingBand: 'Exceptional' | 'Proficient Speaker' | 'Competent' | 'Needs Practice';
  strengths: string[];
  areasToImprove: string[];
  domainSpecificAdvice: string[];
  followUpQuestion?: string;
  fillerWordsDetected: { word: string; count: number }[];
}
