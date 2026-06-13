export interface Part1Topic {
  id: string;
  topic: string;
  required: string;
  follow_ups: string[];
}

export interface Part2Part3Set {
  id: string;
  topic: string;
  part2: {
    title: string;
    prompts: string[];
  };
  part3: {
    questions: string[];
  };
}

export interface Quarter {
  id: string;
  name: string;
  part1Topics: Part1Topic[];
  part2part3Sets: Part2Part3Set[];
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
