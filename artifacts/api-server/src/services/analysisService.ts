function randomId(): string {
  return Math.random().toString(36).slice(2, 9);
}

export interface AnalysisIssue {
  type: "grammar" | "vocabulary" | "coherence" | "pronunciation";
  description: string;
  suggestion: string;
  excerpt?: string;
}

export interface AnalyzeInput {
  transcriptId: string;
  transcript: string;
  partNumber: 1 | 2 | 3;
  question?: string;
}

export interface AnalyzeOutput {
  id: string;
  transcriptId: string;
  wordCount: number;
  issues: AnalysisIssue[];
  vocabularyScore: number;
  coherenceScore: number;
  grammarScore: number;
  feedback: string;
}

const MOCK_ISSUES: AnalysisIssue[] = [
  {
    type: "grammar",
    description: "Subject-verb agreement error",
    suggestion: 'Use "has" instead of "have" with singular subjects',
  },
  {
    type: "vocabulary",
    description: "Repetitive word choice",
    suggestion: 'Try using synonyms like "significant", "substantial", or "considerable" instead of "very big"',
  },
  {
    type: "coherence",
    description: "Missing transition between ideas",
    suggestion: 'Add connectors like "Furthermore" or "On the other hand" to link your points',
  },
  {
    type: "pronunciation",
    description: "Likely mispronunciation detected",
    suggestion: "Practice the stress pattern of multi-syllable words",
  },
];

export async function analyze(input: AnalyzeInput): Promise<AnalyzeOutput> {
  // Mock: in production, this would call an LLM provider
  // (e.g., OpenAI GPT, Anthropic Claude, Google Gemini)
  const wordCount = input.transcript.split(/\s+/).filter(Boolean).length;

  // Select 1-2 mock issues based on transcript length
  const issueCount = wordCount > 30 ? 2 : 1;
  const shuffled = [...MOCK_ISSUES].sort(() => Math.random() - 0.5);
  const issues = shuffled.slice(0, issueCount).map((issue) => ({
    ...issue,
    excerpt:
      wordCount > 10
        ? input.transcript.split(" ").slice(0, 5).join(" ") + "..."
        : undefined,
  }));

  const baseScore = 5.5 + Math.random() * 2;

  return {
    id: randomId(),
    transcriptId: input.transcriptId,
    wordCount,
    issues,
    vocabularyScore: Math.round((baseScore + Math.random()) * 2) / 2,
    coherenceScore: Math.round((baseScore - 0.5 + Math.random()) * 2) / 2,
    grammarScore: Math.round((baseScore - 0.3 + Math.random()) * 2) / 2,
    feedback: `Your response for Part ${input.partNumber} demonstrates ${wordCount > 50 ? "good" : "adequate"} development. Consider expanding on your ideas with specific examples and using a wider range of vocabulary to achieve a higher band score.`,
  };
}
