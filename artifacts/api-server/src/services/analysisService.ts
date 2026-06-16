import { scoreTranscript } from "./scoringEngine";

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

export async function analyze(input: AnalyzeInput): Promise<AnalyzeOutput> {
  const result = scoreTranscript({
    transcript: input.transcript,
    question: input.question,
    speakingPart: input.partNumber,
  });

  const wordCount = input.transcript.split(/\s+/).filter(Boolean).length;

  // Convert weaknesses + suggestions into structured issues
  const issues: AnalysisIssue[] = [];

  if (result.vocabulary < 6) {
    issues.push({
      type: "vocabulary",
      description: "Limited vocabulary range",
      suggestion: result.suggestions.find((s) => /synonym|paraphras/i.test(s))
        ?? "Use a wider range of vocabulary and paraphrasing",
    });
  }

  if (result.coherence < 6) {
    issues.push({
      type: "coherence",
      description: "Weak use of discourse markers",
      suggestion: result.suggestions.find((s) => /connector|linking/i.test(s))
        ?? "Use linking words to connect your ideas more clearly",
    });
  }

  if (result.grammar < 6) {
    issues.push({
      type: "grammar",
      description: "Simple sentence structures",
      suggestion: result.suggestions.find((s) => /complex|clause|conjunction/i.test(s))
        ?? "Use a mix of simple and complex sentence structures",
    });
  }

  if (result.fluency < 5.5) {
    issues.push({
      type: "pronunciation",
      description: "Frequent hesitations affect fluency",
      suggestion: result.suggestions.find((s) => /filler|pause|hesitat/i.test(s))
        ?? "Reduce filler words and practice smoother delivery",
    });
  }

  // Build feedback from strengths + suggestions
  const feedbackParts: string[] = [];
  if (result.strengths.length > 0) {
    feedbackParts.push(result.strengths.join(". ") + ".");
  }
  if (result.suggestions.length > 0) {
    feedbackParts.push("Areas to improve: " + result.suggestions.join("; ") + ".");
  }

  return {
    id: randomId(),
    transcriptId: input.transcriptId,
    wordCount,
    issues,
    vocabularyScore: result.vocabulary,
    coherenceScore: result.coherence,
    grammarScore: result.grammar,
    feedback: feedbackParts.join(" "),
  };
}
