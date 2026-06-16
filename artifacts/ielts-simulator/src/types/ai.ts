export interface TranscriptResult {
  id: string;
  transcript: string;
  confidence: number;
  durationSeconds: number;
  language: string;
}

export interface AnalysisIssue {
  type: "grammar" | "vocabulary" | "coherence" | "pronunciation";
  description: string;
  suggestion: string;
  excerpt?: string;
}

export interface AnalysisResult {
  id: string;
  transcriptId: string;
  wordCount: number;
  issues: AnalysisIssue[];
  vocabularyScore: number;
  coherenceScore: number;
  grammarScore: number;
  feedback: string;
}

export interface ScoreBreakdown {
  fluency: number;
  grammar: number;
  vocabulary: number;
  pronunciation: number;
  coherence: number;
}

export interface ScoreResult {
  id: string;
  overallBand: number;
  breakdown: ScoreBreakdown;
  strengths: string[];
  weaknesses: string[];
  suggestions: string[];
  analysisIds: string[];
}
