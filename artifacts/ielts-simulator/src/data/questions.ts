export interface IELTSQuestion {
  id: number;
  topic: string;
  question: string;
  tip: string;
}

export interface CueCard {
  id: number;
  topic: string;
  title: string;
  prompts: string[];
  part3Questions: string[];
}

export const PART1_QUESTIONS: IELTSQuestion[] = [
  // Topic 1: Daily Routine (4 questions)
  {
    id: 1,
    topic: "Daily Routine",
    question: "What time do you usually wake up in the morning?",
    tip: "Describe your typical morning and whether you consider yourself an early riser or not.",
  },
  {
    id: 2,
    topic: "Daily Routine",
    question: "Do you follow a fixed routine each day, or does it vary?",
    tip: "Explain what stays the same and what changes, and whether you prefer structure or flexibility.",
  },
  {
    id: 3,
    topic: "Daily Routine",
    question: "How do you usually spend your evenings after work or study?",
    tip: "Mention 1–2 activities and say why you enjoy them at the end of the day.",
  },
  {
    id: 4,
    topic: "Daily Routine",
    question: "Has your daily routine changed compared to a few years ago? How?",
    tip: "Compare your current routine with the past and give a reason for any changes.",
  },

  // Topic 2: Food and Cooking (4 questions)
  {
    id: 5,
    topic: "Food & Cooking",
    question: "Do you enjoy cooking? Why or why not?",
    tip: "Say whether you cook regularly and what you like or dislike about it.",
  },
  {
    id: 6,
    topic: "Food & Cooking",
    question: "How often do you eat out at restaurants or order food in?",
    tip: "Give a frequency and explain what drives that choice — convenience, taste, or cost.",
  },
  {
    id: 7,
    topic: "Food & Cooking",
    question: "What is your favourite meal of the day and why?",
    tip: "Pick one meal, describe what you usually eat, and explain why it's your favourite.",
  },
  {
    id: 8,
    topic: "Food & Cooking",
    question: "Do you think people's eating habits in your country are changing? In what way?",
    tip: "Comment on trends such as fast food, health consciousness, or international cuisines.",
  },

  // Topic 3: Technology (4 questions)
  {
    id: 9,
    topic: "Technology",
    question: "How much time do you spend on your phone each day?",
    tip: "Give an approximate amount and mention what you mainly use your phone for.",
  },
  {
    id: 10,
    topic: "Technology",
    question: "Which apps or websites do you use most often, and why?",
    tip: "Name 1–2 specific apps and explain what makes them useful or enjoyable for you.",
  },
  {
    id: 11,
    topic: "Technology",
    question: "Do you think people rely too much on technology in their daily lives?",
    tip: "Give your opinion and support it with a concrete example from everyday life.",
  },
  {
    id: 12,
    topic: "Technology",
    question: "How has technology changed the way people communicate with friends and family?",
    tip: "Compare communication now with the past, mentioning both benefits and drawbacks.",
  },
];

export const CUE_CARDS: CueCard[] = [
  {
    id: 1,
    topic: "Learning a new skill",
    title: "Describe a skill you would like to learn in the future.",
    prompts: [
      "What the skill is",
      "Why you want to learn it",
      "How you plan to learn it",
      "How this skill would benefit your life",
    ],
    part3Questions: [
      "Why do you think it is important for people to keep learning new skills throughout their lives?",
      "How has technology changed the way people learn and develop new skills?",
      "Do you think schools adequately prepare young people with the skills they need for the modern world?",
      "Should governments invest more in adult education and vocational skills training? Why?",
    ],
  },
];

export function getRandomCueCard(): CueCard {
  return CUE_CARDS[Math.floor(Math.random() * CUE_CARDS.length)];
}
