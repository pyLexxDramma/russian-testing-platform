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
  const testLevel = parseInt(params.level as string) as TestLevel;

  const [questionsList, setQuestionsList] = useState<Question[]>([]);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<UserAnswer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [testStartTime] = useState(Date.now());

  // Восстанавливаем прогресс из localStorage
  const restoreProgress = () => {
    const savedAnswersStr = localStorage.getItem(`test_${testLevel}_answers`);
    const savedIndexStr = localStorage.getItem(`test_${testLevel}_index`);
    
    if (savedAnswersStr) {
      try {
        setUserAnswers(JSON.parse(savedAnswersStr));
      } catch (e) {
        // Если данные повреждены, начинаем заново
        console.warn('Failed to parse saved answers', e);
      }
    }
    if (savedIndexStr) {
      const idx = parseInt(savedIndexStr);
      if (!isNaN(idx) && idx >= 0) {
        setCurrentQIndex(idx);
      }
    }
  };

  useEffect(() => {
    restoreProgress();

    const fetchQuestions = async () => {
      try {
        setIsLoading(true);
        setLoadError(null);
        const resp = await fetch(`/data/test-level-${testLevel}.json`);
        
        if (!resp.ok) {
          // 404 или другие ошибки сервера
          throw new Error(`Ошибка загрузки: ${resp.status}`);
        }
        
        const testData = await resp.json();
        
        // Проверяем структуру данных
        if (!testData.questions || !Array.isArray(testData.questions) || testData.questions.length === 0) {
          throw new Error('Файл теста не содержит вопросов');
        }
        
        setQuestionsList(testData.questions);
      } catch (err) {
        console.error('Ошибка загрузки вопросов:', err);
        const errMsg = err instanceof Error ? err.message : 'Не удалось загрузить вопросы';
        setLoadError(errMsg);
      } finally {
        setIsLoading(false);
      }
    };

    fetchQuestions();
  }, [testLevel]);

  const currentQ = questionsList[currentQIndex];
  const currentAns = userAnswers.find((a) => a.questionId === currentQ?.id);

  const updateAnswer = (value: string) => {
    if (!currentQ) return;
    
    const updatedAnswers = userAnswers.filter((a) => a.questionId !== currentQ.id);
    updatedAnswers.push({
      questionId: currentQ.id,
      answer: value,
      timestamp: Date.now(),
    });
    setUserAnswers(updatedAnswers);
    // Сохраняем после каждого ответа - пользователь может закрыть вкладку
    localStorage.setItem(`test_${testLevel}_answers`, JSON.stringify(updatedAnswers));
  };

  const goToPrevious = () => {
    if (currentQIndex > 0) {
      const prevIdx = currentQIndex - 1;
      setCurrentQIndex(prevIdx);
      localStorage.setItem(`test_${testLevel}_index`, prevIdx.toString());
    }
  };

  const goToNext = () => {
    if (currentQIndex < questionsList.length - 1) {
      const nextIdx = currentQIndex + 1;
      setCurrentQIndex(nextIdx);
      localStorage.setItem(`test_${testLevel}_index`, nextIdx.toString());
    }
  };

  const finishTest = () => {
    const endTime = Date.now();
    // Убеждаемся, что у всех ответов есть timestamp
    const finalAnswers: UserAnswer[] = userAnswers.map((a) => ({
      ...a,
      timestamp: a.timestamp || Date.now(),
    }));

    localStorage.setItem(
      `test_${testLevel}_result`,
      JSON.stringify({
        level: testLevel,
        answers: finalAnswers,
        startTime: testStartTime,
        endTime,
      })
    );

    // Очищаем промежуточные данные
    localStorage.removeItem(`test_${testLevel}_answers`);
    localStorage.removeItem(`test_${testLevel}_index`);

    router.push(`/results/${testLevel}`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-gray-600">Загрузка вопросов...</p>
        </div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md">
          <p className="text-lg text-red-600 mb-4">{loadError}</p>
          <button
            onClick={() => router.push('/')}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Вернуться на главную
          </button>
        </div>
      </div>
    );
  }

  if (!currentQ || questionsList.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-gray-600">Вопросы не найдены</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-md p-6">
          <TestProgress current={currentQIndex + 1} total={questionsList.length} />
          
          <div className="mt-8">
            <QuestionRenderer
              question={currentQ}
              value={currentAns?.answer || ''}
              onChange={updateAnswer}
            />
          </div>

          <TestNavigation
            currentIndex={currentQIndex}
            totalQuestions={questionsList.length}
            onPrevious={goToPrevious}
            onNext={goToNext}
            onSubmit={finishTest}
            canGoNext={!!currentAns?.answer}
          />
        </div>
      </div>
    </div>
  );
}
