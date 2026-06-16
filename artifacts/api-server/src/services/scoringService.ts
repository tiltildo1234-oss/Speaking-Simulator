import { scoreTranscript } from "./scoringEngine";
import type { ScoringOutput } from "./scoringEngine";

function randomId(): string {
  return Math.random().toString(36).slice(2, 9);
}

export interface ScoreBreakdown {
  fluency: number;
  grammar: number;
  vocabulary: number;
  pronunciation: number;
  coherence: number;
}

export interface ScoreInput {
  transcript: string;
  question?: string;
  speakingPart: 1 | 2 | 3;
}

export interface ScoreOutput {
  id: string;
  overallBand: number;
  breakdown: ScoreBreakdown;
  strengths: string[];
  weaknesses: string[];
  suggestions: string[];
}

export async function score(input: ScoreInput): Promise<ScoreOutput> {
  const result: ScoringOutput = scoreTranscript(input);

  return {
    id: randomId(),
    overallBand: result.overallBand,
    breakdown: {
      fluency: result.fluency,
      grammar: result.grammar,
      vocabulary: result.vocabulary,
      pronunciation: result.pronunciation,
      coherence: result.coherence,
    },
    strengths: result.strengths,
    weaknesses: result.weaknesses,
    suggestions: result.suggestions,
  };
}
