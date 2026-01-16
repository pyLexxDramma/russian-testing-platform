import { TextAudioChoiceQuestion as TextAudioChoiceQuestionType } from '@/types/question';
import { useState } from 'react';

interface TextAudioChoiceQuestionProps {
  question: TextAudioChoiceQuestionType;
  value: string;
  onChange: (value: string) => void;
}

export default function TextAudioChoiceQuestion({
  question,
  value,
  onChange,
}: TextAudioChoiceQuestionProps) {
  const [isPlaying, setIsPlaying] = useState(false);

  const handlePlay = () => {
    const audio = new Audio(question.audioUrl);
    audio.play();
    setIsPlaying(true);
    audio.onended = () => setIsPlaying(false);
  };

  return (
    <div className="space-y-4">
      <p className="text-lg font-medium">{question.text}</p>
      <div className="flex items-center space-x-4">
        <button
          onClick={handlePlay}
          disabled={isPlaying}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          {isPlaying ? 'Воспроизведение...' : '▶ Проиграть аудио'}
        </button>
      </div>
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
