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
  lexicalResource: number;
  grammaticalRange: number;
  pronunciation: number;
}

export interface ScoreResult {
  id: string;
  overallBand: number;
  breakdown: ScoreBreakdown;
  analysisIds: string[];
  summary: string;
}
