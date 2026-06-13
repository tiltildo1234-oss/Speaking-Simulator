import * as pdfjs from "pdfjs-dist";

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url,
).href;

export type QuestionType = "required" | "follow-up" | "cue-card" | "discussion";

export interface QuestionCard {
  id: string;
  text: string;
  type: QuestionType;
}

function randomId(): string {
  return Math.random().toString(36).slice(2, 9);
}

function detectType(text: string): QuestionType {
  const t = text.trim();
  if (/^(describe\b|talk about\b|tell us about a\b|give.*about a\b)/i.test(t)) return "cue-card";
  if (
    /^(why do you think|how has\b|should\b|to what extent|in what ways|what are the (advantages|disadvantages)|how important is|do you think (that |it is |people|modern|society|governments|countries)|how (effective|likely|might)|who bears|what role does)/i.test(
      t,
    )
  )
    return "discussion";
  if (
    /^(do you\b|have you\b|are you\b|what do you\b|how often\b|how do you\b|can you describe your|what is your|did you\b|where do you\b|when do you\b|which\b.*do you)/i.test(
      t,
    )
  )
    return "required";
  return "follow-up";
}

function splitIntoQuestions(rawText: string): string[] {
  const seen = new Set<string>();
  const results: string[] = [];

  // Normalize unicode dashes/quotes and clean up whitespace
  const normalized = rawText
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/\r\n/g, "\n");

  // Split by newlines first
  const lines = normalized.split(/\n/);

  for (const raw of lines) {
    // Remove common numbering and bullets, then trim
    const line = raw
      .replace(/^\s*\d{1,2}[.)]\s*/, "")
      .replace(/^\s*[a-z][.)]\s*/i, "")
      .replace(/^\s*[-•*▪▸◦]\s*/, "")
      .trim();

    if (line.length < 15) continue;

    // Split on embedded question breaks (multiple Qs on one line)
    const segments = line.split(/(?<=[?])\s+(?=[A-Z"'])/);
    for (const seg of segments) {
      const clean = seg.trim();
      if (clean.length < 15) continue;
      const key = clean.toLowerCase().replace(/\s+/g, " ");
      if (!seen.has(key)) {
        seen.add(key);
        results.push(clean);
      }
    }
  }

  return results;
}

export async function parsePDF(file: File): Promise<QuestionCard[]> {
  const buffer = await file.arrayBuffer();
  const loadingTask = pdfjs.getDocument({ data: buffer });
  const pdf = await loadingTask.promise;

  let fullText = "";
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const pageText = content.items
      .map((item) => ("str" in item ? item.str : ""))
      .join(" ");
    fullText += pageText + "\n";
  }

  const questions = splitIntoQuestions(fullText);
  return questions.map((text) => ({
    id: randomId(),
    text,
    type: detectType(text),
  }));
}
