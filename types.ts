
export interface CaseStudy {
  id: string;
  title: string;
  category: string;
  client: string;
  sector: string;
  timeline: string;
  stack: string[];
  description: string;
  image: string;
  challenge: string;
  solution: string;
  impact: {
    label: string;
    value: string;
    description: string;
  }[];
  quote?: {
    text: string;
    author: string;
    role: string;
    avatar: string;
  };
}

export interface Course {
  id: string;
  level: 'Beginner' | 'Avanzato' | 'Executive';
  title: string;
  description: string;
  duration: string;
  topics: string[];
  icon: string;
  accent?: boolean;
}
