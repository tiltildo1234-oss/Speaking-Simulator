import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { CueCard, getRandomCueCard } from "@/data/questions";

export type TestPart = "home" | "part1" | "part2" | "part3" | "results";

export interface AnswerRecord {
  transcript: string;
  audioUrl: string | null;
}

interface TestState {
  currentPart: TestPart;
  cueCard: CueCard;
  part1Answers: Record<number, AnswerRecord>;
  part2Answer: AnswerRecord | null;
  part3Answers: Record<number, AnswerRecord>;
  goToPart: (part: TestPart) => void;
  savePart1Answer: (questionId: number, answer: AnswerRecord) => void;
  savePart2Answer: (answer: AnswerRecord) => void;
  savePart3Answer: (questionIndex: number, answer: AnswerRecord) => void;
  resetTest: () => void;
}

const TestContext = createContext<TestState | null>(null);

export function TestProvider({ children }: { children: ReactNode }) {
  const [currentPart, setCurrentPart] = useState<TestPart>("home");
  const [cueCard, setCueCard] = useState<CueCard>(getRandomCueCard);
  const [part1Answers, setPart1Answers] = useState<Record<number, AnswerRecord>>({});
  const [part2Answer, setPart2Answer] = useState<AnswerRecord | null>(null);
  const [part3Answers, setPart3Answers] = useState<Record<number, AnswerRecord>>({});

  const goToPart = useCallback((part: TestPart) => setCurrentPart(part), []);

  const savePart1Answer = useCallback((questionId: number, answer: AnswerRecord) => {
    setPart1Answers((prev) => ({ ...prev, [questionId]: answer }));
  }, []);

  const savePart2Answer = useCallback((answer: AnswerRecord) => {
    setPart2Answer(answer);
  }, []);

  const savePart3Answer = useCallback((questionIndex: number, answer: AnswerRecord) => {
    setPart3Answers((prev) => ({ ...prev, [questionIndex]: answer }));
  }, []);

  const resetTest = useCallback(() => {
    setCurrentPart("home");
    setCueCard(getRandomCueCard());
    setPart1Answers({});
    setPart2Answer(null);
    setPart3Answers({});
  }, []);

  return (
    <TestContext.Provider
      value={{
        currentPart,
        cueCard,
        part1Answers,
        part2Answer,
        part3Answers,
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
