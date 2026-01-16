'use client';

import { Question } from '@/types/question';
import {
  TextChoiceQuestion,
  TextAudioChoiceQuestion,
  TextTableInputQuestion,
  TextImageChoiceQuestion,
} from './index';

interface QuestionRendererProps {
  question: Question;
  value: string;
  onChange: (value: string) => void;
}

export default function QuestionRenderer({
  question,
  value,
  onChange,
}: QuestionRendererProps) {
  switch (question.type) {
    case 'text-choice':
      return (
        <TextChoiceQuestion
          question={question}
          value={value}
          onChange={onChange}
        />
      );
    case 'text-audio-choice':
      return (
        <TextAudioChoiceQuestion
          question={question}
          value={value}
          onChange={onChange}
        />
      );
    case 'text-table-input':
      return (
        <TextTableInputQuestion
          question={question}
          value={value}
          onChange={onChange}
        />
      );
    case 'text-image-choice':
      return (
        <TextImageChoiceQuestion
          question={question}
          value={value}
          onChange={onChange}
        />
      );
    default:
      return <div>Неизвестный тип вопроса</div>;
  }
}
