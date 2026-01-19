'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { TestResult } from '@/types/result';
import { calculateTestResult, formatDuration } from '@/lib/utils/testCalculator';
import { shouldShowFreeResults, getABTestGroup } from '@/lib/ab-test/abTest';
import { ContactForm, ContactData } from '@/components/contact';
import { trackFormSubmit } from '@/lib/analytics/analytics';

export default function ResultsPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const testLevel = parseInt(params.level as string);

  const [testResult, setTestResult] = useState<TestResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formSent, setFormSent] = useState(false);
  const [isPaid, setIsPaid] = useState(false);

  // Проверяем статус оплаты из разных источников
  const checkPaymentStatus = (level: number): boolean => {
    const paidFromUrl = searchParams.get('paid') === 'true';
    const paidKey = `payment_${level}_paid`;
    const paidFromStorage = localStorage.getItem(paidKey) === 'true';
    
    if (paidFromUrl && !paidFromStorage) {
      // Сохраняем статус оплаты из URL в localStorage
      localStorage.setItem(paidKey, 'true');
    }
    
    return paidFromStorage || paidFromUrl;
  };

  useEffect(() => {
    const loadResults = async () => {
      try {
        const savedResultStr = localStorage.getItem(`test_${testLevel}_result`);
        if (!savedResultStr) {
          // Нет сохраненных результатов - редирект на главную
          router.push('/');
          return;
        }

        let savedData;
        try {
          savedData = JSON.parse(savedResultStr);
        } catch (e) {
          // Поврежденные данные
          console.error('Failed to parse saved result', e);
          router.push('/');
          return;
        }

        const { answers, startTime, endTime } = savedData;

        // Загружаем вопросы для пересчета результатов
        const resp = await fetch(`/data/test-level-${testLevel}.json`);
        if (!resp.ok) {
          throw new Error(`Failed to load test data: ${resp.status}`);
        }
        const testData = await resp.json();

        const calculated = calculateTestResult(
          testData.questions,
          answers,
          testLevel,
          startTime,
          endTime
        );

        setTestResult(calculated);
        setIsLoading(false);

        const paidStatus = checkPaymentStatus(testLevel);
        setIsPaid(paidStatus);

        const contactKey = `contact_submitted_${testLevel}`;
        const wasSubmitted = localStorage.getItem(contactKey) === 'true';
        setFormSent(wasSubmitted);

        if (!wasSubmitted) {
          setShowForm(true);
        }
      } catch (err) {
        console.error('Ошибка загрузки результатов:', err);
        router.push('/');
      }
    };

    loadResults();
  }, [testLevel, router, searchParams]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-lg text-gray-600">Загрузка результатов...</p>
      </div>
    );
  }

  if (!testResult) {
    return null;
  }

  const sendContactData = async (contactData: ContactData) => {
    try {
      const abGroup = getABTestGroup();
      const isPaidGroup = abGroup === 'paid';

      // Отправляем в Битрикс24 - может упасть, но не критично
      try {
        await fetch('/api/bitrix24', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: contactData.name,
            email: contactData.email,
            phone: contactData.phone,
            testLevel: testLevel,
            testResult: {
              totalCorrect: testResult.totalCorrect,
              totalQuestions: testResult.totalQuestions,
              percentage: testResult.percentage,
              passed: testResult.passed,
            },
            abTestGroup: abGroup,
          }),
        });
      } catch (bitrixErr) {
        // Битрикс может быть недоступен, но это не должно блокировать пользователя
        console.warn('Bitrix24 send failed', bitrixErr);
      }

      trackFormSubmit(isPaidGroup);

      localStorage.setItem(`contact_submitted_${testLevel}`, 'true');
      setFormSent(true);
      setShowForm(false);
    } catch (err) {
      console.error('Ошибка отправки контактов:', err);
      // Показываем ошибку пользователю, но не блокируем просмотр результатов
    }
  };

  const canViewResults = shouldShowFreeResults() || isPaid;

  if (showForm && !formSent) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-2xl mx-auto px-4">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h1 className="text-3xl font-bold mb-6">Контактные данные</h1>
            <p className="text-gray-600 mb-6">
              Пожалуйста, укажите ваши контактные данные для получения результатов теста
            </p>
            <ContactForm onSubmit={sendContactData} />
          </div>
        </div>
      </div>
    );
  }

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
                    {testResult.totalCorrect} / {testResult.totalQuestions}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">Процент</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {testResult.percentage}%
                  </p>
                </div>
              </div>
              <div className="mt-4">
                <p className={`text-lg font-semibold ${testResult.passed ? 'text-green-600' : 'text-red-600'}`}>
                  {testResult.passed ? '✓ Тест пройден' : '✗ Тест не пройден'}
                </p>
              </div>
            </div>

            {canViewResults ? (
              <>
                <div>
                  <h2 className="text-xl font-semibold mb-4">Результаты по разделам</h2>
                  <div className="space-y-3">
                    {testResult.sectionResults.map((sect) => (
                      <div key={sect.section} className="border rounded-lg p-4">
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-medium">{sect.section}</span>
                          <span className="text-sm text-gray-600">
                            {sect.correct} / {sect.total}
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${sect.percentage}%` }}
                          />
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          {sect.percentage}%
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h2 className="text-xl font-semibold mb-4">Детали по вопросам</h2>
                  <div className="space-y-4">
                    {testResult.questionResults.map((qRes) => (
                      <div
                        key={qRes.questionId}
                        className={`border rounded-lg p-4 ${
                          qRes.isCorrect ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className="font-medium mb-2">
                              {qRes.question.text}
                            </p>
                            <div className="space-y-1 text-sm">
                              <p>
                                <span className="font-medium">Ваш ответ:</span>{' '}
                                {qRes.userAnswer || 'Не ответили'}
                              </p>
                              {!qRes.isCorrect && (
                                <p>
                                  <span className="font-medium">Правильный ответ:</span>{' '}
                                  {qRes.correctAnswer}
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="ml-4">
                            {qRes.isCorrect ? (
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
                  onClick={() => router.push(`/payment/${testLevel}`)}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Перейти к оплате
                </button>
              </div>
            )}

            <div className="pt-4 border-t">
              <p className="text-sm text-gray-600">
                Время прохождения: {formatDuration(testResult.duration)}
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
