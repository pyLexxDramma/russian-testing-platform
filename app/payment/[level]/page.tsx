'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';

export default function PaymentPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const level = parseInt(params.level as string);
  const returnUrl = searchParams.get('returnUrl') || `/results/${level}`;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const amount = level === 1 ? 500 : level === 2 ? 700 : 900;

  const handlePayment = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/yookassa/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount,
          testLevel: level,
          returnUrl: `${window.location.origin}${returnUrl}?paid=true`,
        }),
      });

      if (!response.ok) {
        throw new Error('Ошибка создания платежа');
      }

      const { confirmationUrl } = await response.json();

      if (confirmationUrl) {
        window.location.href = confirmationUrl;
      } else {
        throw new Error('Не получен URL для оплаты');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Произошла ошибка');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-3xl font-bold mb-6">Оплата результатов теста</h1>

          <div className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-lg font-semibold text-gray-900 mb-2">
                Уровень {level}
              </p>
              <p className="text-gray-700 mb-4">
                Для просмотра детальных результатов теста необходимо произвести оплату
              </p>
              <div className="text-3xl font-bold text-blue-600">
                {amount} ₽
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-800">{error}</p>
              </div>
            )}

            <div className="space-y-4">
              <button
                onClick={handlePayment}
                disabled={loading}
                className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Создание платежа...' : 'Оплатить'}
              </button>

              <button
                onClick={() => router.push('/')}
                className="w-full px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Отмена
              </button>
            </div>

            <div className="text-sm text-gray-500 text-center">
              <p>Оплата производится через ЮKassa</p>
              <p>После успешной оплаты вы будете перенаправлены на страницу результатов</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
