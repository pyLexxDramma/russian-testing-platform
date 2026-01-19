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
  const [playing, setPlaying] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    return () => {
      // Иначе аудио может висеть в памяти после размонтирования
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const stopCurrentAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
      setPlaying(false);
    }
  };

  const handlePlay = async () => {
    try {
      setLoadError(null);
      stopCurrentAudio();

      const player = new Audio(question.audioUrl);
      audioRef.current = player;

      player.onloadeddata = () => {
        setPlaying(true);
      };

      player.onerror = () => {
        // CORS/404 на мобильных - частая проблема
        setLoadError('Не удалось загрузить аудиофайл');
        setPlaying(false);
        audioRef.current = null;
      };

      player.onended = () => {
        setPlaying(false);
        audioRef.current = null;
      };

      player.onpause = () => {
        setPlaying(false);
      };

      await player.play();
    } catch (err) {
      // Браузеры блокируют автовоспроизведение без взаимодействия
      setLoadError('Не удалось воспроизвести аудио');
      setPlaying(false);
      audioRef.current = null;
    }
  };

  const handleStop = () => {
    stopCurrentAudio();
  };

  return (
    <div className="space-y-4">
      <p className="text-lg font-medium">{question.text}</p>
      <div className="flex items-center space-x-4">
        <button
          onClick={playing ? handleStop : handlePlay}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          {playing ? '⏸ Остановить' : '▶ Проиграть аудио'}
        </button>
        {loadError && (
          <p className="text-sm text-red-600">{loadError}</p>
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
