function randomId(): string {
  return Math.random().toString(36).slice(2, 9);
}

const MOCK_TRANSCRIPTS = [
  "Well, I think technology has changed our lives significantly. For example, smartphones have made communication much easier and we can now connect with people from all over the world instantly.",
  "In my opinion, reading is very important because it helps us expand our knowledge and improve our vocabulary. I try to read at least one book every month.",
  "I would say that my hometown is a peaceful place with friendly people. The weather is generally pleasant and there are many beautiful parks to visit.",
  "Actually, I enjoy cooking traditional dishes from my country. It reminds me of my childhood and brings back wonderful memories of family gatherings.",
  "To be honest, I believe that education is the key to success. It opens doors to better opportunities and helps us understand the world around us.",
];

export interface TranscribeInput {
  audioData: string;
  mimeType: string;
  durationSeconds?: number;
  language?: string;
}

export interface TranscribeOutput {
  id: string;
  transcript: string;
  confidence: number;
  durationSeconds: number;
  language: string;
}

export async function transcribe(input: TranscribeInput): Promise<TranscribeOutput> {
  // Mock: in production, this would call a speech-to-text provider
  // (e.g., OpenAI Whisper, Google Speech-to-Text, AWS Transcribe)
  const duration = input.durationSeconds ?? 30;
  const wordCount = Math.round(duration * 2.5);
  const baseTranscript = MOCK_TRANSCRIPTS[Math.floor(Math.random() * MOCK_TRANSCRIPTS.length)];

  // Trim or pad transcript to roughly match duration
  const words = baseTranscript.split(" ");
  const transcript = words.slice(0, Math.min(wordCount, words.length)).join(" ");

  return {
    id: randomId(),
    transcript,
    confidence: 0.85 + Math.random() * 0.1,
    durationSeconds: duration,
    language: input.language ?? "en",
  };
}
