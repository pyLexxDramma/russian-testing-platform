import { TextImageChoiceQuestion as TextImageChoiceQuestionType } from '@/types/question';
import { useState } from 'react';

interface TextImageChoiceQuestionProps {
  question: TextImageChoiceQuestionType;
  value: string;
  onChange: (value: string) => void;
}

export default function TextImageChoiceQuestion({
  question,
  value,
  onChange,
}: TextImageChoiceQuestionProps) {
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});

  const handleImageError = (optionId: string) => {
    setImageErrors((prev) => ({ ...prev, [optionId]: true }));
  };

  return (
    <div className="space-y-4">
      <p className="text-lg font-medium">{question.text}</p>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {question.options.map((option) => (
          <label
            key={option.id}
            className={`relative border-2 rounded-lg overflow-hidden cursor-pointer transition-all ${
              value === option.id
                ? 'border-blue-600 ring-2 ring-blue-300'
                : 'border-gray-300 hover:border-gray-400'
            }`}
          >
            <input
              type="radio"
              name={question.id}
              value={option.id}
              checked={value === option.id}
              onChange={(e) => onChange(e.target.value)}
              className="sr-only"
            />
            {imageErrors[option.id] ? (
              <div className="w-full h-32 bg-gray-200 flex items-center justify-center">
                <div className="text-center p-4">
                  <svg
                    className="w-12 h-12 mx-auto text-gray-400 mb-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  <p className="text-sm text-gray-500">{option.alt}</p>
                </div>
              </div>
            ) : (
              <img
                src={option.imageUrl}
                alt={option.alt}
                className="w-full h-32 object-cover"
                onError={() => handleImageError(option.id)}
              />
            )}
            {value === option.id && (
              <div className="absolute top-2 right-2 bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center">
                ✓
              </div>
            )}
          </label>
        ))}
      </div>
    </div>
  );
}
