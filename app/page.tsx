'use client';

import Link from 'next/link';
import { TEST_LEVELS } from '@/types/test';

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Онлайн-платформа пробного тестирования по русскому языку
          </h1>
          <p className="text-xl text-gray-600 mb-2">
            Для получения РВП, ВНЖ и гражданства РФ
          </p>
          <p className="text-gray-500">
            Пройдите пробный тест и проверьте свой уровень знаний русского языка
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mt-12">
          {Object.values(TEST_LEVELS).map((testLevel) => (
            <Link
              key={testLevel.level}
              href={`/test/${testLevel.level}`}
              className="block p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow border border-gray-200"
            >
              <div className="mb-4">
                <div className="text-3xl font-bold text-blue-600 mb-2">
                  Уровень {testLevel.level}
                </div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  {testLevel.title}
                </h2>
                <p className="text-gray-600 text-sm">
                  {testLevel.description}
                </p>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-200">
                <span className="text-blue-600 font-medium hover:text-blue-700">
                  Начать тест →
                </span>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-12 p-6 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Как это работает?
          </h3>
          <ul className="list-disc list-inside text-gray-700 space-y-1">
            <li>Выберите уровень теста, соответствующий вашей цели</li>
            <li>Пройдите тест, отвечая на вопросы</li>
            <li>Получите результаты и узнайте свой уровень подготовки</li>
            <li>При необходимости оплатите доступ к детальным результатам</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
