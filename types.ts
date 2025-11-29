export interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
  isError?: boolean;
}

export enum Theme {
  SIMPLE = 'Simple',
  DETAILED = 'Detailed',
  STUDENT = 'Student',
  URGENT = 'Urgent',
}

export enum Language {
  BANGLA = 'Bangla',
  ENGLISH = 'English',
  BILINGUAL = 'Bilingual',
}

export interface ChatState {
  messages: Message[];
  isLoading: boolean;
  input: string;
}
