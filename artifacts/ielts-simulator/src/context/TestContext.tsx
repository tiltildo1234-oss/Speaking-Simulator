import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { Topic, Quarter, shuffleArray } from "@/data/questionsDB";

export type TestPart = "home" | "part1" | "part2" | "part3" | "results" | "admin";

export interface AnswerRecord {
  transcript: string;
  audioUrl: string | null;
}

interface TestState {
  currentPart: TestPart;
  selectedTopic: Topic | null;
  part1Questions: string[];
  part1Answers: Record<number, AnswerRecord>;
  part2Answer: AnswerRecord | null;
  part3Answers: Record<number, AnswerRecord>;
  startTest: (quarter: Quarter) => void;
  goToPart: (part: TestPart) => void;
  savePart1Answer: (index: number, answer: AnswerRecord) => void;
  savePart2Answer: (answer: AnswerRecord) => void;
  savePart3Answer: (index: number, answer: AnswerRecord) => void;
  resetTest: () => void;
}

const TestContext = createContext<TestState | null>(null);

function buildPart1Questions(topic: Topic): string[] {
  const followUps = shuffleArray(topic.part1.follow_ups).slice(0, 3);
  return [topic.part1.required, ...followUps];
}

export function TestProvider({ children }: { children: ReactNode }) {
  const [currentPart, setCurrentPart] = useState<TestPart>("home");
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
  const [part1Questions, setPart1Questions] = useState<string[]>([]);
  const [part1Answers, setPart1Answers] = useState<Record<number, AnswerRecord>>({});
  const [part2Answer, setPart2Answer] = useState<AnswerRecord | null>(null);
  const [part3Answers, setPart3Answers] = useState<Record<number, AnswerRecord>>({});

  const startTest = useCallback((quarter: Quarter) => {
    if (quarter.topics.length === 0) return;
    const topic = quarter.topics[Math.floor(Math.random() * quarter.topics.length)];
    setSelectedTopic(topic);
    setPart1Questions(buildPart1Questions(topic));
    setPart1Answers({});
    setPart2Answer(null);
    setPart3Answers({});
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

  const resetTest = useCallback(() => {
    setCurrentPart("home");
    setSelectedTopic(null);
    setPart1Questions([]);
    setPart1Answers({});
    setPart2Answer(null);
    setPart3Answers({});
  }, []);

  return (
    <TestContext.Provider
      value={{
        currentPart,
        selectedTopic,
        part1Questions,
        part1Answers,
        part2Answer,
        part3Answers,
        startTest,
        goToPart,
        savePart1Answer,
        savePart2Answer,
        savePart3Answer,
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
