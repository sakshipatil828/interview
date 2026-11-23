import React from 'react';
import { ParsedResume, InterviewSession } from '../types';
import { TechnicalInterviewModule } from './TechnicalInterviewModule';
import { HRVoiceInterviewModule } from './HRVoiceInterviewModule';
import { EngineeringDepartment } from '../nlp/types';

interface AIInterviewModuleProps {
  parsedResume: ParsedResume | null;
  roundType: 'technical' | 'hr';
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  profileDepartment?: string;
  targetDepartment?: EngineeringDepartment;
  onCompleteInterview: (session: InterviewSession) => void;
  onNavigate: (tab: string) => void;
}

/**
 * AIInterviewModule routes directly to either:
 * 1. TechnicalInterviewModule: Resume-aware NLP question engine & semantic answer evaluation
 * 2. HRVoiceInterviewModule: Interactive, real-time voice-based HR behavioral interview
 */
export const AIInterviewModule: React.FC<AIInterviewModuleProps> = ({
  parsedResume,
  roundType,
  difficulty,
  profileDepartment,
  targetDepartment,
  onCompleteInterview,
  onNavigate,
}) => {
  // If HR behavioral round is selected, delegate to dedicated Real-Time Voice HR Interview Module
  if (roundType === 'hr') {
    return (
      <HRVoiceInterviewModule
        parsedResume={parsedResume}
        profileDepartment={profileDepartment}
        onCompleteInterview={onCompleteInterview}
        onNavigate={onNavigate}
      />
    );
  }

  // Default to NLP Technical Interview Module
  return (
    <TechnicalInterviewModule
      parsedResume={parsedResume}
      profileDepartment={profileDepartment}
      targetDepartment={targetDepartment}
      difficulty={difficulty}
      onCompleteInterview={onCompleteInterview}
      onNavigate={onNavigate}
    />
  );
};
