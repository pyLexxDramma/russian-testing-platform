import { TextChoiceQuestion as TextChoiceQuestionType } from '@/types/question';

interface TextChoiceQuestionProps {
  question: TextChoiceQuestionType;
  value: string;
  onChange: (value: string) => void;
}

export default function TextChoiceQuestion({
  question,
  value,
  onChange,
}: TextChoiceQuestionProps) {
  return (
    <div className="space-y-4">
      <p className="text-lg font-medium">{question.text}</p>
      <div className="space-y-2">
        {question.options.map((option) => (
          <label
            key={option.id}
            className="flex items-center space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
          >
            <input
              type="radio"
              name={question.id}
              value={option.id}
              checked={value === option.id}
              onChange={(e) => onChange(e.target.value)}
              className="w-4 h-4 text-blue-600"
            />
            <span>{option.text}</span>
          </label>
        ))}
      </div>
    </div>
  );
}
