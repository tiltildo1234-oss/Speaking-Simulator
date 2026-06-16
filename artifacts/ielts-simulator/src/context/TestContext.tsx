import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { Part2Part3Set, Quarter, shuffleArray } from "@/data/questionsDB";
import type { AnalysisResult, ScoreResult } from "@/types/ai";

export type TestPart = "home" | "part1" | "part2" | "part3" | "results" | "admin";

export interface AnswerRecord {
  transcript: string;
  audioUrl: string | null;
  transcriptId?: string;
  analysis?: AnalysisResult;
}

export interface Part1QuestionMeta {
  topic: string;
  isRequired: boolean;
}

interface TestState {
  currentPart: TestPart;
  part1Questions: string[];
  part1Meta: Part1QuestionMeta[];
  selectedPair: Part2Part3Set | null;
  part1Answers: Record<number, AnswerRecord>;
  part2Answer: AnswerRecord | null;
  part3Answers: Record<number, AnswerRecord>;
  scoreResult: ScoreResult | null;
  startTest: (quarter: Quarter) => void;
  goToPart: (part: TestPart) => void;
  savePart1Answer: (index: number, answer: AnswerRecord) => void;
  savePart2Answer: (answer: AnswerRecord) => void;
  savePart3Answer: (index: number, answer: AnswerRecord) => void;
  updatePart1Answer: (index: number, answer: AnswerRecord) => void;
  updatePart2Answer: (answer: AnswerRecord) => void;
  updatePart3Answer: (index: number, answer: AnswerRecord) => void;
  setScoreResult: (result: ScoreResult | null) => void;
  resetTest: () => void;
}

const TestContext = createContext<TestState | null>(null);

function buildPart1(quarter: Quarter): { questions: string[]; meta: Part1QuestionMeta[] } {
  const questions: string[] = [];
  const meta: Part1QuestionMeta[] = [];

  const topics = shuffleArray(quarter.part1Topics).slice(0, 3);

  for (const t of topics) {
    questions.push(t.required);
    meta.push({ topic: t.topic, isRequired: true });

    const followUps = shuffleArray(t.follow_ups).slice(0, 3);
    for (const q of followUps) {
      questions.push(q);
      meta.push({ topic: t.topic, isRequired: false });
    }
  }

  return { questions, meta };
}

function pickPair(quarter: Quarter): Part2Part3Set | null {
  if (quarter.part2part3Sets.length === 0) return null;
  const idx = Math.floor(Math.random() * quarter.part2part3Sets.length);
  return quarter.part2part3Sets[idx];
}

export function TestProvider({ children }: { children: ReactNode }) {
  const [currentPart, setCurrentPart] = useState<TestPart>("home");
  const [part1Questions, setPart1Questions] = useState<string[]>([]);
  const [part1Meta, setPart1Meta] = useState<Part1QuestionMeta[]>([]);
  const [selectedPair, setSelectedPair] = useState<Part2Part3Set | null>(null);
  const [part1Answers, setPart1Answers] = useState<Record<number, AnswerRecord>>({});
  const [part2Answer, setPart2Answer] = useState<AnswerRecord | null>(null);
  const [part3Answers, setPart3Answers] = useState<Record<number, AnswerRecord>>({});
  const [scoreResult, setScoreResultState] = useState<ScoreResult | null>(null);

  const startTest = useCallback((quarter: Quarter) => {
    if (quarter.part1Topics.length === 0) return;
    const { questions, meta } = buildPart1(quarter);
    const pair = pickPair(quarter);
    setPart1Questions(questions);
    setPart1Meta(meta);
    setSelectedPair(pair);
    setPart1Answers({});
    setPart2Answer(null);
    setPart3Answers({});
    setScoreResultState(null);
    setCurrentPart("part1");
  }, []);

  const goToPart = useCallback((part: TestPart) => setCurrentPart(part), []);

  const savePart1Answer = useCallback((index: number, answer: AnswerRecord) => {
    setPart1Answers((prev) => ({ ...prev, [index]: answer }));
  }, []);

  const savePart2Answer = useCallback((answer: AnswerRecord) => {
    setPart2Answer(answer);
  }, []);

  const savePart3Answer = useCallback((index: number, answer: AnswerRecord) => {
    setPart3Answers((prev) => ({ ...prev, [index]: answer }));
  }, []);

  const updatePart1Answer = useCallback((index: number, answer: AnswerRecord) => {
    setPart1Answers((prev) => ({ ...prev, [index]: answer }));
  }, []);

  const updatePart2Answer = useCallback((answer: AnswerRecord) => {
    setPart2Answer(answer);
  }, []);

  const updatePart3Answer = useCallback((index: number, answer: AnswerRecord) => {
    setPart3Answers((prev) => ({ ...prev, [index]: answer }));
  }, []);

  const setScoreResult = useCallback((result: ScoreResult | null) => {
    setScoreResultState(result);
  }, []);

  const resetTest = useCallback(() => {
    setCurrentPart("home");
    setPart1Questions([]);
    setPart1Meta([]);
    setSelectedPair(null);
    setPart1Answers({});
    setPart2Answer(null);
    setPart3Answers({});
    setScoreResultState(null);
  }, []);

  return (
    <TestContext.Provider
      value={{
        currentPart,
        part1Questions,
        part1Meta,
        selectedPair,
        part1Answers,
        part2Answer,
        part3Answers,
        startTest,
        goToPart,
        savePart1Answer,
        savePart2Answer,
        savePart3Answer,
        updatePart1Answer,
        updatePart2Answer,
        updatePart3Answer,
        scoreResult,
        setScoreResult,
        resetTest,
      }}
    >
      {children}
    </TestContext.Provider>
  );
}

export function useTest() {
  const ctx = useContext(TestContext);
  if (!ctx) throw new Error("useTest must be used inside TestProvider");
  return ctx;
}
