export interface UserAnswer {
  questionId: string;
  answer: string;
  timestamp: number;
}

export interface TestAnswers {
  testLevel: number;
  answers: UserAnswer[];
  startTime: number;
  endTime?: number;
}
