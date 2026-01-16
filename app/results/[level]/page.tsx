'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { TestResult } from '@/types/result';
import { calculateTestResult, formatDuration } from '@/lib/utils/testCalculator';
import { shouldShowFreeResults } from '@/lib/ab-test/abTest';

export default function ResultsPage() {
  const params = useParams();
  const router = useRouter();
  const level = parseInt(params.level as string);

  const [result, setResult] = useState<TestResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadResult = async () => {
      try {
        const savedResult = localStorage.getItem(`test_${level}_result`);
        if (!savedResult) {
          router.push('/');
          return;
        }

        const { answers, startTime, endTime } = JSON.parse(savedResult);

        const response = await fetch(`/data/test-level-${level}.json`);
        const testData = await response.json();

        const calculatedResult = calculateTestResult(
          testData.questions,
          answers,
          level,
          startTime,
          endTime
        );

        setResult(calculatedResult);
        setLoading(false);
      } catch (error) {
        console.error('Ошибка загрузки результатов:', error);
        router.push('/');
      }
    };

    loadResult();
  }, [level, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-lg text-gray-600">Загрузка результатов...</p>
      </div>
    );
  }

  if (!result) {
    return null;
  }

  const showResults = shouldShowFreeResults();

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-3xl font-bold mb-6">Результаты теста</h1>

          <div className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-gray-600">Правильных ответов</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {result.totalCorrect} / {result.totalQuestions}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">Процент</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {result.percentage}%
                  </p>
                </div>
              </div>
              <div className="mt-4">
                <p className={`text-lg font-semibold ${result.passed ? 'text-green-600' : 'text-red-600'}`}>
                  {result.passed ? '✓ Тест пройден' : '✗ Тест не пройден'}
                </p>
              </div>
            </div>

            {showResults ? (
              <>
                <div>
                  <h2 className="text-xl font-semibold mb-4">Результаты по разделам</h2>
                  <div className="space-y-3">
                    {result.sectionResults.map((section) => (
                      <div key={section.section} className="border rounded-lg p-4">
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-medium">{section.section}</span>
                          <span className="text-sm text-gray-600">
                            {section.correct} / {section.total}
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${section.percentage}%` }}
                          />
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          {section.percentage}%
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h2 className="text-xl font-semibold mb-4">Детали по вопросам</h2>
                  <div className="space-y-4">
                    {result.questionResults.map((qResult) => (
                      <div
                        key={qResult.questionId}
                        className={`border rounded-lg p-4 ${
                          qResult.isCorrect ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className="font-medium mb-2">
                              {qResult.question.text}
                            </p>
                            <div className="space-y-1 text-sm">
                              <p>
                                <span className="font-medium">Ваш ответ:</span>{' '}
                                {qResult.userAnswer || 'Не ответили'}
                              </p>
                              {!qResult.isCorrect && (
                                <p>
                                  <span className="font-medium">Правильный ответ:</span>{' '}
                                  {qResult.correctAnswer}
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="ml-4">
                            {qResult.isCorrect ? (
                              <span className="text-green-600 font-bold text-xl">✓</span>
                            ) : (
                              <span className="text-red-600 font-bold text-xl">✗</span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
                <p className="text-lg font-semibold text-yellow-800 mb-4">
                  Для просмотра детальных результатов необходимо произвести оплату
                </p>
                <button
                  onClick={() => router.push(`/payment/${level}`)}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Перейти к оплате
                </button>
              </div>
            )}

            <div className="pt-4 border-t">
              <p className="text-sm text-gray-600">
                Время прохождения: {formatDuration(result.duration)}
              </p>
            </div>

            <div className="flex justify-center">
              <button
                onClick={() => router.push('/')}
                className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Вернуться на главную
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
