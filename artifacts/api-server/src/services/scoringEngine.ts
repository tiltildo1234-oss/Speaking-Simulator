// Rule-based IELTS Speaking scoring engine.
// No external AI APIs — all scores derived from transcript text analysis.

// --- Constants ---

const FILLER_WORDS = new Set([
  "um", "uh", "erm", "ah", "like", "you know", "i mean",
  "basically", "actually", "literally", "right", "so yeah",
  "kind of", "sort of", "well so", "anyway",
]);

const COHERENCE_INDICATORS = new Set([
  "however", "moreover", "furthermore", "additionally", "nevertheless",
  "consequently", "therefore", "thus", "hence", "although", "whereas",
  "while", "despite", "in contrast", "on the other hand", "in addition",
  "for example", "for instance", "such as", "namely", "specifically",
  "in conclusion", "to summarize", "overall", "as a result",
  "firstly", "secondly", "thirdly", "finally", "next", "then",
  "in my opinion", "i believe", "i think", "from my perspective",
]);

const SIMPLE_SENTENCE_STARTS = new Set([
  "i", "it", "there", "this", "that", "we", "they", "he", "she",
]);

// Target word counts per part (IELTS expectations)
const PART_WORD_TARGETS: Record<number, { min: number; ideal: number }> = {
  1: { min: 20, ideal: 50 },   // 4-6 sentences
  2: { min: 100, ideal: 200 }, // 2 minutes speaking
  3: { min: 40, ideal: 80 },   // extended answers
};

// --- Types ---

export interface ScoringInput {
  transcript: string;
  question?: string;
  speakingPart: 1 | 2 | 3;
}

export interface ScoringOutput {
  fluency: number;
  grammar: number;
  vocabulary: number;
  pronunciation: number;
  coherence: number;
  overallBand: number;
  strengths: string[];
  weaknesses: string[];
  suggestions: string[];
}

// --- Tokenization helpers ---

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z\s'-]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 0);
}

function getSentences(text: string): string[] {
  return text
    .split(/[.!?]+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

function getUniqueWords(words: string[]): Set<string> {
  return new Set(words.filter((w) => w.length > 2));
}

// --- Individual metric calculators ---

function calcLengthScore(wordCount: number, part: number): number {
  const target = PART_WORD_TARGETS[part] ?? PART_WORD_TARGETS[1];
  if (wordCount < target.min) {
    const ratio = wordCount / target.min;
    return Math.max(3, 4 + ratio * 2);
  }
  if (wordCount < target.ideal * 0.5) return 5;
  if (wordCount < target.ideal * 0.75) return 5.5;
  if (wordCount < target.ideal) return 6;
  if (wordCount < target.ideal * 1.3) return 7;
  if (wordCount < target.ideal * 1.6) return 7.5;
  return 8;
}

function calcVocabularyDiversity(words: string[]): number {
  if (words.length === 0) return 1;
  const unique = getUniqueWords(words);
  const total = words.filter((w) => w.length > 2).length;
  if (total === 0) return 1;

  // Type-Token Ratio (TTR), with normalization for length
  const ttr = unique.size / total;
  // TTR naturally decreases with longer texts, so we normalize
  const normalizedTtr = Math.min(1, ttr * Math.sqrt(total / 50));

  if (normalizedTtr > 0.8) return 8;
  if (normalizedTtr > 0.7) return 7;
  if (normalizedTtr > 0.6) return 6;
  if (normalizedTtr > 0.5) return 5.5;
  if (normalizedTtr > 0.4) return 5;
  if (normalizedTtr > 0.3) return 4;
  return 3.5;
}

function calcRepeatedWords(words: string[]): { score: number; topRepeated: string[] } {
  if (words.length === 0) return { score: 1, topRepeated: [] };

  const freq: Record<string, number> = {};
  for (const w of words) {
    if (w.length > 2) freq[w] = (freq[w] || 0) + 1;
  }

  // Get content words repeated 3+ times (excluding common function words)
  const functionWords = new Set([
    "the", "and", "that", "this", "with", "for", "are", "not", "but",
    "have", "was", "were", "they", "been", "from", "are", "its", "can",
    "will", "would", "could", "should", "may", "might", "shall",
  ]);

  const repeated = Object.entries(freq)
    .filter(([w, c]) => c >= 3 && !functionWords.has(w))
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  const maxRepetition = repeated.length > 0 ? repeated[0][1] : 1;
  const repeatedCount = repeated.length;

  let score = 7;
  if (maxRepetition >= 6) score -= 2;
  else if (maxRepetition >= 4) score -= 1;
  if (repeatedCount >= 4) score -= 1;
  else if (repeatedCount >= 2) score -= 0.5;

  return { score: Math.max(3, Math.min(9, score)), topRepeated: repeated.map(([w]) => w) };
}

function calcFillerScore(words: string[]): { score: number; fillerCount: number } {
  const bigrams: string[] = [];
  for (let i = 0; i < words.length - 1; i++) {
    bigrams.push(`${words[i]} ${words[i + 1]}`);
  }

  let fillerCount = 0;
  for (const w of words) {
    if (FILLER_WORDS.has(w)) fillerCount++;
  }
  for (const bg of bigrams) {
    if (FILLER_WORDS.has(bg)) fillerCount++;
  }

  const totalWords = words.length || 1;
  const fillerRatio = fillerCount / totalWords;

  if (fillerRatio > 0.1) return { score: 3.5, fillerCount };
  if (fillerRatio > 0.07) return { score: 4, fillerCount };
  if (fillerRatio > 0.05) return { score: 4.5, fillerCount };
  if (fillerRatio > 0.03) return { score: 5, fillerCount };
  if (fillerRatio > 0.02) return { score: 5.5, fillerCount };
  if (fillerRatio > 0.01) return { score: 6, fillerCount };
  if (fillerRatio > 0.005) return { score: 6.5, fillerCount };
  return { score: 7.5, fillerCount };
}

function calcSentenceVariety(sentences: string[]): number {
  if (sentences.length <= 1) return 4;

  const lengths = sentences.map((s) => s.split(/\s+/).filter(Boolean).length);
  const avg = lengths.reduce((a, b) => a + b, 0) / lengths.length;
  const variance = lengths.reduce((sum, l) => sum + (l - avg) ** 2, 0) / lengths.length;
  const stdDev = Math.sqrt(variance);

  // Variety of sentence structures — check for subordinate clauses
  const subordinateCount = sentences.filter((s) =>
    /, (which|who|where|when|although|because|if|while|that|since)/i.test(s)
  ).length;
  const subordinateRatio = subordinateCount / sentences.length;

  let score = 5;

  // Standard deviation of sentence lengths
  if (stdDev > 5) score += 1.5;
  else if (stdDev > 3) score += 1;
  else if (stdDev > 1.5) score += 0.5;

  // Subordinate clause usage
  if (subordinateRatio > 0.4) score += 1;
  else if (subordinateRatio > 0.2) score += 0.5;

  // Sentence count (more = more variety opportunity)
  if (sentences.length >= 8) score += 0.5;
  else if (sentences.length < 3) score -= 1;

  return Math.max(3, Math.min(9, score));
}

function calcCoherenceScore(words: string[], sentences: string[]): number {
  if (sentences.length <= 1) return 4.5;

  const bigrams: string[] = [];
  for (let i = 0; i < words.length - 1; i++) {
    bigrams.push(`${words[i]} ${words[i + 1]}`);
  }

  let indicatorCount = 0;
  for (const w of words) {
    if (COHERENCE_INDICATORS.has(w)) indicatorCount++;
  }
  for (const bg of bigrams) {
    if (COHERENCE_INDICATORS.has(bg)) indicatorCount++;
  }

  const indicatorRatio = indicatorCount / sentences.length;

  let score = 5;
  if (indicatorRatio > 2) score = 7.5;
  else if (indicatorRatio > 1.5) score = 7;
  else if (indicatorRatio > 1) score = 6.5;
  else if (indicatorRatio > 0.7) score = 6;
  else if (indicatorRatio > 0.4) score = 5.5;
  else if (indicatorRatio > 0.2) score = 5;
  else score = 4.5;

  // Penalize very short answers that can't demonstrate coherence
  if (sentences.length < 3) score = Math.min(score, 5);

  return Math.max(3, Math.min(9, score));
}

// --- Main scoring function ---

function clampBand(value: number): number {
  return Math.max(1, Math.min(9, Math.round(value * 2) / 2));
}

export function scoreTranscript(input: ScoringInput): ScoringOutput {
  const words = tokenize(input.transcript);
  const sentences = getSentences(input.transcript);
  const wordCount = words.length;

  // Calculate individual metrics
  const lengthScore = calcLengthScore(wordCount, input.speakingPart);
  const vocabDiversityScore = calcVocabularyDiversity(words);
  const { score: repeatedScore, topRepeated } = calcRepeatedWords(words);
  const { score: fillerScore, fillerCount } = calcFillerScore(words);
  const sentenceVarietyScore = calcSentenceVariety(sentences);
  const coherenceRawScore = calcCoherenceScore(words, sentences);

  // Derive IELTS band scores from metrics

  // Fluency: length + fillers (inverse) + sentence count
  const fluency = clampBand(
    lengthScore * 0.4 + fillerScore * 0.35 + Math.min(7, sentences.length * 0.5 + 4) * 0.25
  );

  // Grammar: sentence variety + subordinate clauses
  const grammar = clampBand(sentenceVarietyScore * 0.6 + lengthScore * 0.4);

  // Vocabulary: diversity + repetition (inverse)
  const vocabulary = clampBand(vocabDiversityScore * 0.55 + repeatedScore * 0.45);

  // Pronunciation: proxy from filler ratio and answer completeness
  const pronunciation = clampBand(fillerScore * 0.5 + lengthScore * 0.3 + coherenceRawScore * 0.2);

  // Coherence: coherence indicators + sentence variety
  const coherence = clampBand(coherenceRawScore * 0.6 + sentenceVarietyScore * 0.25 + lengthScore * 0.15);

  const overallBand = clampBand(
    (fluency + grammar + vocabulary + pronunciation + coherence) / 5
  );

  // Generate strengths, weaknesses, suggestions
  const strengths: string[] = [];
  const weaknesses: string[] = [];
  const suggestions: string[] = [];

  // Length-based feedback
  const target = PART_WORD_TARGETS[input.speakingPart];
  if (wordCount >= target.ideal) {
    strengths.push("Answer length is strong and well-developed");
  } else if (wordCount >= target.min) {
    strengths.push("Answer meets minimum length expectations");
  } else {
    weaknesses.push("Answer is too short — aim for more detail");
    suggestions.push(`Try to speak at least ${target.min} words for Part ${input.speakingPart}`);
  }

  // Vocabulary feedback
  if (vocabDiversityScore >= 7) {
    strengths.push("Good range of vocabulary with varied word choice");
  } else if (vocabDiversityScore >= 6) {
    // neutral
  } else {
    weaknesses.push("Limited vocabulary range — words are repetitive");
    suggestions.push("Use synonyms and paraphrasing to avoid repeating the same words");
  }

  if (topRepeated.length > 0) {
    weaknesses.push(`Overused words: "${topRepeated.slice(0, 3).join('", "')}"`);
    suggestions.push(`Find synonyms for "${topRepeated[0]}" to show lexical range`);
  }

  // Filler feedback
  if (fillerScore >= 7) {
    strengths.push("Fluent delivery with minimal hesitation");
  } else if (fillerScore >= 5.5) {
    // neutral
  } else {
    weaknesses.push(`Frequent filler words detected (${fillerCount} instances)`);
    suggestions.push('Reduce fillers like "um", "uh", "like" — pause silently instead');
  }

  // Coherence feedback
  if (coherenceRawScore >= 7) {
    strengths.push("Well-organized response with clear connectives");
  } else if (coherenceRawScore >= 6) {
    // neutral
  } else {
    weaknesses.push("Limited use of linking words and discourse markers");
    suggestions.push('Use connectors like "however", "furthermore", "for example" to structure your answer');
  }

  // Sentence variety feedback
  if (sentenceVarietyScore >= 7) {
    strengths.push("Good variety of sentence structures including complex sentences");
  } else if (sentenceVarietyScore < 5) {
    weaknesses.push("Sentences are short and lack structural variety");
    suggestions.push("Combine simple sentences using relative clauses and conjunctions");
  }

  // Ensure at least 2 strengths (add generic ones if needed)
  if (strengths.length === 0) {
    strengths.push("Attempted to answer the question", "Response is on-topic");
  }
  if (strengths.length === 1) {
    strengths.push("Shows effort to communicate ideas");
  }

  return {
    fluency,
    grammar,
    vocabulary,
    pronunciation,
    coherence,
    overallBand,
    strengths,
    weaknesses,
    suggestions,
  };
}
