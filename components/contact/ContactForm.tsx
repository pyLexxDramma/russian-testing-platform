'use client';

import { useState, FormEvent } from 'react';

export interface ContactData {
  name: string;
  email: string;
  phone: string;
}

interface ContactFormProps {
  onSubmit: (data: ContactData) => Promise<void>;
  loading?: boolean;
}

export default function ContactForm({ onSubmit, loading = false }: ContactFormProps) {
  const [fields, setFields] = useState<ContactData>({
    name: '',
    email: '',
    phone: '',
  });
  const [errors, setErrors] = useState<Partial<Record<keyof ContactData, string>>>({});

  const checkEmail = (email: string): boolean => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const checkPhone = (phone: string): boolean => {
    // Разрешаем разные форматы - пользователи вводят по-разному
    return /^[\d\s\-\+\(\)]+$/.test(phone);
  };

  const validateForm = (): boolean => {
    const errs: Partial<Record<keyof ContactData, string>> = {};

    if (!fields.name.trim()) {
      errs.name = 'Имя обязательно для заполнения';
    }

    if (!fields.email.trim()) {
      errs.email = 'Email обязателен для заполнения';
    } else if (!checkEmail(fields.email)) {
      errs.email = 'Некорректный email';
    }

    if (!fields.phone.trim()) {
      errs.phone = 'Телефон обязателен для заполнения';
    } else if (!checkPhone(fields.phone)) {
      errs.phone = 'Некорректный номер телефона';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      await onSubmit(fields);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
          Имя *
        </label>
        <input
          type="text"
          id="name"
          value={fields.name}
          onChange={(e) => setFields({ ...fields, name: e.target.value })}
          className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            errors.name ? 'border-red-500' : 'border-gray-300'
          }`}
          disabled={loading}
        />
        {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
          Email *
        </label>
        <input
          type="email"
          id="email"
          value={fields.email}
          onChange={(e) => setFields({ ...fields, email: e.target.value })}
          className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            errors.email ? 'border-red-500' : 'border-gray-300'
          }`}
          disabled={loading}
        />
        {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
      </div>

      <div>
        <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
          Телефон *
        </label>
        <input
          type="tel"
          id="phone"
          value={fields.phone}
          onChange={(e) => setFields({ ...fields, phone: e.target.value })}
          className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            errors.phone ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="+7 (999) 123-45-67"
          disabled={loading}
        />
        {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone}</p>}
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'Отправка...' : 'Продолжить'}
      </button>
    </form>
  );
}
