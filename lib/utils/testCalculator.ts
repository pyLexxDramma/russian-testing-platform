import { Question, QuestionType } from '@/types/question';
import { UserAnswer } from '@/types/answer';
import { TestResult, QuestionResult, SectionResult } from '@/types/result';

export function calculateTestResult(
  questions: Question[],
  answers: UserAnswer[],
  testLevel: number,
  startTime: number,
  endTime: number
): TestResult {
  const questionResults: QuestionResult[] = questions.map((question) => {
    const userAnswer = answers.find((a) => a.questionId === question.id);
    const userAnswerText = userAnswer?.answer || '';
    const isCorrect = userAnswerText === question.correctAnswer;

    return {
      questionId: question.id,
      question,
      userAnswer: userAnswerText,
      correctAnswer: question.correctAnswer,
      isCorrect,
    };
  });

  const totalCorrect = questionResults.filter((r) => r.isCorrect).length;
  const totalQuestions = questions.length;
  const percentage = Math.round((totalCorrect / totalQuestions) * 100);

  const sectionMap = new Map<string, { correct: number; total: number }>();

  questionResults.forEach((result) => {
    const section = result.question.section;
    const current = sectionMap.get(section) || { correct: 0, total: 0 };
    
    sectionMap.set(section, {
      correct: current.correct + (result.isCorrect ? 1 : 0),
      total: current.total + 1,
    });
  });

  const sectionResults: SectionResult[] = Array.from(sectionMap.entries()).map(
    ([section, stats]) => ({
      section,
      correct: stats.correct,
      total: stats.total,
      percentage: Math.round((stats.correct / stats.total) * 100),
    })
  );

  const passingPercentage = getPassingPercentage(testLevel);
  const passed = percentage >= passingPercentage;
  const duration = endTime - startTime;

  return {
    testLevel,
    totalCorrect,
    totalQuestions,
    score: totalCorrect,
    percentage,
    passed,
    questionResults,
    sectionResults,
    startTime,
    endTime,
    duration,
  };
}

function getPassingPercentage(testLevel: number): number {
  switch (testLevel) {
    case 1:
      return 60;
    case 2:
      return 60;
    case 3:
      return 60;
    default:
      return 60;
  }
}

export function formatDuration(ms: number): string {
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}
