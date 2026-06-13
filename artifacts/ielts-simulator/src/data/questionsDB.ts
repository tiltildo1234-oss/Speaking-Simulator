export interface Part1Data {
  required: string;
  follow_ups: string[];
}

export interface Part2Data {
  title: string;
  prompts: string[];
}

export interface Part3Data {
  questions: string[];
}

export interface Topic {
  id: string;
  topic: string;
  part1: Part1Data;
  part2: Part2Data;
  part3: Part3Data;
}

export interface Quarter {
  id: string;
  name: string;
  topics: Topic[];
}

export interface QDB {
  quarters: Quarter[];
}

export function randomId(): string {
  return Math.random().toString(36).slice(2, 9);
}

export function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
