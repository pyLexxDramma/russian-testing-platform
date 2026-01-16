import { TextAudioChoiceQuestion as TextAudioChoiceQuestionType } from '@/types/question';
import { useState, useRef, useEffect } from 'react';

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
  const [error, setError] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const handlePlay = async () => {
    try {
      setError(null);
      
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }

      const audio = new Audio(question.audioUrl);
      audioRef.current = audio;

      audio.onloadeddata = () => {
        setIsPlaying(true);
      };

      audio.onerror = (e) => {
        setError('Не удалось загрузить аудиофайл');
        setIsPlaying(false);
        audioRef.current = null;
      };

      audio.onended = () => {
        setIsPlaying(false);
        audioRef.current = null;
      };

      audio.onpause = () => {
        setIsPlaying(false);
      };

      await audio.play();
    } catch (err) {
      setError('Не удалось воспроизвести аудио');
      setIsPlaying(false);
      if (audioRef.current) {
        audioRef.current = null;
      }
    }
  };

  const handleStop = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
      setIsPlaying(false);
    }
  };

  return (
    <div className="space-y-4">
      <p className="text-lg font-medium">{question.text}</p>
      <div className="flex items-center space-x-4">
        <button
          onClick={isPlaying ? handleStop : handlePlay}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          {isPlaying ? '⏸ Остановить' : '▶ Проиграть аудио'}
        </button>
        {error && (
          <p className="text-sm text-red-600">{error}</p>
        )}
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
