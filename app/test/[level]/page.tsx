'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Question, TestLevel } from '@/types/question';
import { UserAnswer } from '@/types/answer';
import QuestionRenderer from '@/components/questions/QuestionRenderer';
import { TestProgress, TestNavigation } from '@/components/test';

export default function TestPage() {
  const params = useParams();
  const router = useRouter();
  const level = parseInt(params.level as string) as TestLevel;

  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<UserAnswer[]>([]);
  const [startTime] = useState(Date.now());

  useEffect(() => {
    const savedAnswers = localStorage.getItem(`test_${level}_answers`);
    const savedIndex = localStorage.getItem(`test_${level}_index`);
    
    if (savedAnswers) {
      setAnswers(JSON.parse(savedAnswers));
    }
    if (savedIndex) {
      setCurrentIndex(parseInt(savedIndex));
    }

    const loadQuestions = async () => {
      try {
        const response = await fetch(`/data/test-level-${level}.json`);
        const data = await response.json();
        setQuestions(data.questions || []);
      } catch (error) {
        console.error('Ошибка загрузки вопросов:', error);
      }
    };

    loadQuestions();
  }, [level]);

  const currentQuestion = questions[currentIndex];
  const currentAnswer = answers.find((a) => a.questionId === currentQuestion?.id);

  const handleAnswerChange = (value: string) => {
    const newAnswers = answers.filter((a) => a.questionId !== currentQuestion.id);
    newAnswers.push({
      questionId: currentQuestion.id,
      answer: value,
      timestamp: Date.now(),
    });
    setAnswers(newAnswers);
    localStorage.setItem(`test_${level}_answers`, JSON.stringify(newAnswers));
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      const newIndex = currentIndex - 1;
      setCurrentIndex(newIndex);
      localStorage.setItem(`test_${level}_index`, newIndex.toString());
    }
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      const newIndex = currentIndex + 1;
      setCurrentIndex(newIndex);
      localStorage.setItem(`test_${level}_index`, newIndex.toString());
    }
  };

  const handleSubmit = () => {
    const endTime = Date.now();
    const testAnswers: UserAnswer[] = answers.map((a) => ({
      ...a,
      timestamp: a.timestamp || Date.now(),
    }));

    localStorage.setItem(
      `test_${level}_result`,
      JSON.stringify({
        level,
        answers: testAnswers,
        startTime,
        endTime,
      })
    );

    localStorage.removeItem(`test_${level}_answers`);
    localStorage.removeItem(`test_${level}_index`);

    router.push(`/results/${level}`);
  };

  if (!currentQuestion) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-gray-600">Загрузка вопросов...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-md p-6">
          <TestProgress current={currentIndex + 1} total={questions.length} />
          
          <div className="mt-8">
            <QuestionRenderer
              question={currentQuestion}
              value={currentAnswer?.answer || ''}
              onChange={handleAnswerChange}
            />
          </div>

          <TestNavigation
            currentIndex={currentIndex}
            totalQuestions={questions.length}
            onPrevious={handlePrevious}
            onNext={handleNext}
            onSubmit={handleSubmit}
            canGoNext={!!currentAnswer?.answer}
          />
        </div>
      </div>
    </div>
  );
}
