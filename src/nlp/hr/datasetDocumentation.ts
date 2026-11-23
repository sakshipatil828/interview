/**
 * CareerCurve AI HR Personal Interview Module
 * NLP Dataset Preparation, Training Architecture, and Model Roadmap Documentation.
 * 
 * TRANSPARENCY NOTICE:
 * The current live evaluation engine combines a deterministic linguistic/STAR rubric
 * and semantic keyword matching on the client, supplemented by the Gemini 3.5/3.8 Flash
 * model via the backend API when connected.
 * 
 * This module defines the formal specification, data format, validation strategy,
 * and loss functions for training a future dedicated open-weight fine-tuned model
 * (e.g., Llama-3-8B-Instruct or DeBERTa-v3-large).
 */

export interface TrainingSample {
  id: string;
  question_id: string;
  question_category: string;
  question_text: string;
  candidate_transcript: string;
  candidate_department: string;
  speaking_duration_seconds: number;
  word_count: number;
  star_annotations: {
    has_situation: boolean;
    has_task: boolean;
    has_action: boolean;
    has_result: boolean;
  };
  labels: {
    relevance_score: number;      // 0.0 to 1.0 (continuous regression target)
    completeness_score: number;   // 0.0 to 1.0
    clarity_score: number;        // 0.0 to 1.0
    overall_quality_score: number;// 0.0 to 1.0
    rating_band: 'Exceptional' | 'Strong Answer' | 'Satisfactory' | 'Needs Improvement';
  };
  critique: {
    strengths: string[];
    improvements: string[];
    suggested_rewrite: string;
  };
}

export const NLP_TRAINING_PIPELINE_SPEC = {
  version: '2.4.0',
  architecture: {
    encoder_backbone: 'sentence-transformers/all-MiniLM-L6-v2 (Relevance Scoring)',
    evaluator_llm: 'meta-llama/Meta-Llama-3-8B-Instruct (or DeBERTa-v3-large multi-task head)',
    input_representation: `[CLS] Question: {question} [SEP] Candidate Response: {transcript} [SEP] Domain: {department} [SEP]`,
  },
  loss_functions: {
    score_regression: 'Mean Squared Error (MSE) / Smooth L1 Loss',
    star_multi_label: 'Binary Cross-Entropy with Logits (BCEWithLogitsLoss)',
    critique_generation: 'Autoregressive Cross-Entropy Loss with Label Smoothing (0.1)',
  },
  validation_strategy: {
    split: '70% Train, 15% Validation, 15% Test',
    cross_validation: '5-Fold Stratified Cross-Validation by Question Category & Difficulty',
    evaluation_metrics: [
      'Pearson Correlation Coefficient (r) for Score Regression (Target > 0.82)',
      'Macro-F1 for STAR Element Detection (Target > 0.85)',
      'ROUGE-L and BERTScore for Actionable Improvement Suggestions (Target F1 > 0.88)'
    ]
  },
  dataset_preprocessing_pipeline: [
    '1. ASR Audio Normalization: Discard non-verbal acoustic artifacts, retain explicit filler tokens (um, uh).',
    '2. Text Lowercasing and Punctuation Restoration using RoBERTa punctuation head.',
    '3. Entity Masking / Tagging for specific technologies and department names.',
    '4. Double-Blind Human HR Expert Annotation for rubric scoring calibration.'
  ]
};

/**
 * Formats an HR question and candidate response into the standard JSONL training record.
 */
export function exportToTrainingJSONL(
  questionId: string,
  questionText: string,
  category: string,
  transcript: string,
  department: string,
  score: number,
  starLabels: { s: boolean; t: boolean; a: boolean; r: boolean }
): string {
  const sample: TrainingSample = {
    id: `train_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    question_id: questionId,
    question_category: category,
    question_text: questionText,
    candidate_transcript: transcript,
    candidate_department: department,
    speaking_duration_seconds: 60,
    word_count: transcript.split(/\s+/).length,
    star_annotations: {
      has_situation: starLabels.s,
      has_task: starLabels.t,
      has_action: starLabels.a,
      has_result: starLabels.r,
    },
    labels: {
      relevance_score: Math.min(1.0, score / 100),
      completeness_score: Math.min(1.0, (score * 0.95) / 100),
      clarity_score: 0.85,
      overall_quality_score: Math.min(1.0, score / 100),
      rating_band: score >= 85 ? 'Strong Answer' : score >= 60 ? 'Satisfactory' : 'Needs Improvement',
    },
    critique: {
      strengths: ['Addressed question premise', 'Clear articulation'],
      improvements: ['Include quantifiable metrics', 'State explicit outcome'],
      suggested_rewrite: 'An optimal response provides situation, action, and verifiable impact.',
    },
  };

  return JSON.stringify(sample);
}
