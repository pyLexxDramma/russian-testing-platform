import { Question, QuestionType } from '@/types/question';
import { UserAnswer } from '@/types/answer';
import { TestResult, QuestionResult, SectionResult } from '@/types/result';

function checkAnswer(q: Question, userAnswers: UserAnswer[]): QuestionResult {
  const foundAnswer = userAnswers.find(a => a.questionId === q.id);
  const answerText = foundAnswer?.answer ?? '';
  const isRight = answerText === q.correctAnswer;

  return {
    questionId: q.id,
    question: q,
    userAnswer: answerText,
    correctAnswer: q.correctAnswer,
    isCorrect: isRight,
  };
}

function buildSectionStats(results: QuestionResult[]): SectionResult[] {
  const statsBySection = new Map<string, { correct: number; total: number }>();

  for (const res of results) {
    const sect = res.question.section;
    const existing = statsBySection.get(sect) || { correct: 0, total: 0 };
    
    statsBySection.set(sect, {
      correct: existing.correct + (res.isCorrect ? 1 : 0),
      total: existing.total + 1,
    });
  }

  return Array.from(statsBySection.entries()).map(([sect, data]) => ({
    section: sect,
    correct: data.correct,
    total: data.total,
    percentage: Math.round((data.correct / data.total) * 100),
  }));
}

export function calculateTestResult(
  questions: Question[],
  answers: UserAnswer[],
  testLevel: number,
  startTime: number,
  endTime: number
): TestResult {
  const checkedAnswers = questions.map(q => checkAnswer(q, answers));
  
  const rightCount = checkedAnswers.filter(r => r.isCorrect).length;
  const totalCount = questions.length;
  const scorePercent = Math.round((rightCount / totalCount) * 100);

  const sectionStats = buildSectionStats(checkedAnswers);

  const minScore = getPassingPercentage(testLevel);
  const isPassed = scorePercent >= minScore;
  const timeSpent = endTime - startTime;

  return {
    testLevel,
    totalCorrect: rightCount,
    totalQuestions: totalCount,
    score: rightCount,
    percentage: scorePercent,
    passed: isPassed,
    questionResults: checkedAnswers,
    sectionResults: sectionStats,
    startTime,
    endTime,
    duration: timeSpent,
  };
}

function getPassingPercentage(level: number): number {
  // Пока все уровни 60%, но может измениться для уровня 3
  if (level === 1 || level === 2 || level === 3) {
    return 60;
  }
  return 60;
}

export function formatDuration(milliseconds: number): string {
  const mins = Math.floor(milliseconds / 60000);
  const secs = Math.floor((milliseconds % 60000) / 1000);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}
