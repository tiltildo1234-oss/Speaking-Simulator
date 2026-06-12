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

export const CUE_CARDS: CueCard[] = [
  {
    id: 1,
    topic: "A memorable journey",
    title: "Describe a memorable journey or trip you have taken.",
    prompts: [
      "Where you went",
      "Who you went with",
      "What you did there",
      "Why this journey was so memorable",
    ],
    part3Questions: [
      "Why do you think travel has become so popular in modern society?",
      "How has tourism changed the way people experience other cultures?",
      "What are the negative effects of mass tourism on local communities?",
      "Do you think travelling for leisure is a luxury or a necessity? Why?",
      "How might travel change in the future with advances in technology?",
    ],
  },
  {
    id: 2,
    topic: "An important skill",
    title: "Describe an important skill you have learned.",
    prompts: [
      "What the skill is",
      "When and how you learned it",
      "Who helped you learn it",
      "Why this skill is important to you",
    ],
    part3Questions: [
      "What skills do you think are most important for young people to develop today?",
      "How has technology changed the way people learn new skills?",
      "Should practical skills be taught more in schools? Why or why not?",
      "Do you think people can develop new skills at any age? Why?",
      "How might the skills valued by employers change in the future?",
    ],
  },
  {
    id: 3,
    topic: "A person who inspired you",
    title: "Describe a person who has had a great influence on your life.",
    prompts: [
      "Who this person is",
      "How you know this person",
      "What qualities this person has",
      "Why this person has influenced you so much",
    ],
    part3Questions: [
      "What qualities make a person a good role model for young people?",
      "Do you think celebrities are good role models for teenagers? Why?",
      "How important are family members as influences in a person's life?",
      "Has the internet changed the kinds of people who inspire others?",
      "Should schools do more to teach students about inspirational figures in history?",
    ],
  },
  {
    id: 4,
    topic: "A place you enjoy visiting",
    title: "Describe a place in your city or town that you enjoy visiting.",
    prompts: [
      "Where this place is",
      "How often you go there",
      "What you do there",
      "Why you enjoy visiting this place",
    ],
    part3Questions: [
      "Why is it important for cities to have public spaces like parks and squares?",
      "How do public spaces contribute to community well-being?",
      "Do you think urban areas are becoming better or worse places to live? Why?",
      "How has the development of shopping centres affected traditional local spaces?",
      "What role should governments play in maintaining public spaces?",
    ],
  },
  {
    id: 5,
    topic: "A book or film that affected you",
    title: "Describe a book or film that had a strong effect on you.",
    prompts: [
      "What the book or film was",
      "When you read or watched it",
      "What it was about",
      "Why it had such a strong effect on you",
    ],
    part3Questions: [
      "How do books and films shape people's views of the world?",
      "Do you think reading books is more beneficial than watching films? Why?",
      "How has the internet changed the way people consume stories and entertainment?",
      "Should governments fund the arts, including film and literature? Why?",
      "What responsibility do storytellers have in terms of the messages they promote?",
    ],
  },
];

export function getRandomCueCard(): CueCard {
  return CUE_CARDS[Math.floor(Math.random() * CUE_CARDS.length)];
}
