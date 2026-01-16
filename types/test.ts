import { Question } from './question';

export type TestLevel = 1 | 2 | 3;

export interface TestLevelInfo {
  level: TestLevel;
  title: string;
  description: string;
}

export const TEST_LEVELS: Record<TestLevel, TestLevelInfo> = {
  1: {
    level: 1,
    title: 'Разрешение на работу (патент)',
    description: 'Тест для получения разрешения на работу в РФ',
  },
  2: {
    level: 2,
    title: 'Разрешение на временное проживание в РФ',
    description: 'Тест для получения РВП',
  },
  3: {
    level: 3,
    title: 'Вид на жительство в РФ',
    description: 'Тест для получения ВНЖ',
  },
};

export interface Test {
  level: TestLevel;
  title: string;
  description: string;
  questions: Question[];
  sections: string[];
  totalQuestions: number;
  passingScore: number;
}
