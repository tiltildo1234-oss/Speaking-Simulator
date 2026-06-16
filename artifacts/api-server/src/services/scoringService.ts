function randomId(): string {
  return Math.random().toString(36).slice(2, 9);
}

export interface ScoreBreakdown {
  fluency: number;
  lexicalResource: number;
  grammaticalRange: number;
  pronunciation: number;
}

export interface ScoreInput {
  analysisIds: string[];
  analyses: Array<{
    vocabularyScore: number;
    coherenceScore: number;
    grammarScore: number;
  }>;
}

export interface ScoreOutput {
  id: string;
  overallBand: number;
  breakdown: ScoreBreakdown;
  analysisIds: string[];
  summary: string;
}

function clampBand(value: number): number {
  const rounded = Math.round(value * 2) / 2;
  return Math.max(1, Math.min(9, rounded));
}

export async function score(input: ScoreInput): Promise<ScoreOutput> {
  // Mock: in production, this would aggregate analyses and apply
  // IELTS scoring rubrics, potentially with LLM evaluation

  if (input.analyses.length === 0) {
    return {
      id: randomId(),
      overallBand: 0,
      breakdown: { fluency: 0, lexicalResource: 0, grammaticalRange: 0, pronunciation: 0 },
      analysisIds: input.analysisIds,
      summary: "No responses to score.",
    };
  }

  const avgVocab =
    input.analyses.reduce((sum, a) => sum + a.vocabularyScore, 0) / input.analyses.length;
  const avgCoherence =
    input.analyses.reduce((sum, a) => sum + a.coherenceScore, 0) / input.analyses.length;
  const avgGrammar =
    input.analyses.reduce((sum, a) => sum + a.grammarScore, 0) / input.analyses.length;

  const fluency = clampBand(avgCoherence + 0.5);
  const lexicalResource = clampBand(avgVocab);
  const grammaticalRange = clampBand(avgGrammar);
  const pronunciation = clampBand(avgCoherence - 0.5);

  const overallBand = clampBand(
    (fluency + lexicalResource + grammaticalRange + pronunciation) / 4
  );

  const bandLabel = (b: number) => (b >= 7 ? "Good" : b >= 5 ? "Modest" : "Limited");

  return {
    id: randomId(),
    overallBand,
    breakdown: { fluency, lexicalResource, grammaticalRange, pronunciation },
    analysisIds: input.analysisIds,
    summary: `Overall band ${overallBand}: ${bandLabel(overallBand)} user. Fluency and coherence: ${bandLabel(fluency)}. Lexical resource: ${bandLabel(lexicalResource)}. Grammatical range: ${bandLabel(grammaticalRange)}. Pronunciation: ${bandLabel(pronunciation)}.`,
  };
}
