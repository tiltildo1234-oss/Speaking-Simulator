export interface IELTSQuestion {
  id: number;
  topic: string;
  question: string;
  tip: string;
}

export const PART1_QUESTIONS: IELTSQuestion[] = [
  {
    id: 1,
    topic: "Hometown",
    question: "Can you tell me where you are from?",
    tip: "Describe your hometown briefly and mention what makes it special.",
  },
  {
    id: 2,
    topic: "Work or Study",
    question: "Are you currently working or studying?",
    tip: "Explain your current situation and what you enjoy most about it.",
  },
  {
    id: 3,
    topic: "Hobbies",
    question: "What do you enjoy doing in your free time?",
    tip: "Mention 1-2 hobbies and explain why you enjoy them.",
  },
  {
    id: 4,
    topic: "Music",
    question: "Do you like listening to music? What kind of music do you prefer?",
    tip: "Talk about your favourite genre or artist and why you like that style.",
  },
  {
    id: 5,
    topic: "Travel",
    question: "Do you like travelling? Where would you like to travel in the future?",
    tip: "Share a travel experience or a dream destination and give reasons.",
  },
  {
    id: 6,
    topic: "Food",
    question: "What is your favourite food or cuisine?",
    tip: "Describe the food and explain why you enjoy it — taste, memories, or culture.",
  },
  {
    id: 7,
    topic: "Reading",
    question: "Do you enjoy reading? What types of books or articles do you read?",
    tip: "Talk about the genres you enjoy and how often you read.",
  },
  {
    id: 8,
    topic: "Sports & Exercise",
    question: "Do you do any sports or physical exercise? How often?",
    tip: "Mention the activity, frequency, and why you find it beneficial or enjoyable.",
  },
  {
    id: 9,
    topic: "Technology",
    question: "How important is technology in your daily life?",
    tip: "Give specific examples of how you use technology every day.",
  },
  {
    id: 10,
    topic: "Future Plans",
    question: "What are your plans or goals for the next few years?",
    tip: "Be specific about your aspirations — career, education, or personal life.",
  },
];
