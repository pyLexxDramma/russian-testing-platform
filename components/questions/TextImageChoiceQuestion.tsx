import { TextImageChoiceQuestion as TextImageChoiceQuestionType } from '@/types/question';

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
            <img
              src={option.imageUrl}
              alt={option.alt}
              className="w-full h-32 object-cover"
            />
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
