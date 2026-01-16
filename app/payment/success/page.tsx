'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function PaymentSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const paymentId = searchParams.get('payment_id') || searchParams.get('paymentId');
    const testLevel = searchParams.get('testLevel');

    if (paymentId && testLevel) {
      const checkPayment = async () => {
        try {
          const response = await fetch('/api/payment/check', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              testLevel: parseInt(testLevel),
              paymentId,
            }),
          });

          const data = await response.json();

          if (data.paid) {
            setTimeout(() => {
              router.push(`/results/${testLevel}?paid=true`);
            }, 2000);
          } else {
            const savedResult = localStorage.getItem(`test_${testLevel}_result`);
            if (savedResult) {
              setTimeout(() => {
                router.push(`/results/${testLevel}?paid=true`);
              }, 2000);
            } else {
              setLoading(false);
            }
          }
        } catch (error) {
          console.error('Payment check error:', error);
          const savedResult = localStorage.getItem(`test_${testLevel}_result`);
          if (savedResult) {
            setTimeout(() => {
              router.push(`/results/${testLevel}?paid=true`);
            }, 2000);
          } else {
            setLoading(false);
          }
        }
      };

      checkPayment();
    } else {
      const savedResult = localStorage.getItem(`test_${testLevel}_result`);
      if (savedResult && testLevel) {
        setTimeout(() => {
          router.push(`/results/${testLevel}?paid=true`);
        }, 2000);
      } else {
        setLoading(false);
      }
    }
  }, [router, searchParams]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-gray-600">Проверка оплаты...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <h1 className="text-3xl font-bold mb-4">Оплата обрабатывается</h1>
          <p className="text-gray-600 mb-6">
            Пожалуйста, подождите. Вы будете перенаправлены на страницу результатов.
          </p>
        </div>
      </div>
    </div>
  );
}
