import { Question } from './question';
import { UserAnswer } from './answer';

export interface QuestionResult {
  questionId: string;
  question: Question;
  userAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
}

export interface SectionResult {
  section: string;
  correct: number;
  total: number;
  percentage: number;
}

export interface TestResult {
  testLevel: number;
  totalCorrect: number;
  totalQuestions: number;
  score: number;
  percentage: number;
  passed: boolean;
  questionResults: QuestionResult[];
  sectionResults: SectionResult[];
  startTime: number;
  endTime: number;
  duration: number;
}
