export type QuestionType = 
  | 'text-choice'
  | 'text-audio-choice'
  | 'text-table-input'
  | 'text-image-choice';

export interface TextChoiceOption {
  id: string;
  text: string;
}

export interface ImageChoiceOption {
  id: string;
  imageUrl: string;
  alt: string;
}

export interface BaseQuestion {
  id: string;
  type: QuestionType;
  text: string;
  section: string;
  correctAnswer: string;
}

export interface TextChoiceQuestion extends BaseQuestion {
  type: 'text-choice';
  options: TextChoiceOption[];
}

export interface TextAudioChoiceQuestion extends BaseQuestion {
  type: 'text-audio-choice';
  audioUrl: string;
  options: TextChoiceOption[];
}

export interface TextTableInputQuestion extends BaseQuestion {
  type: 'text-table-input';
  tableData: Record<string, string[]>;
}

export interface TextImageChoiceQuestion extends BaseQuestion {
  type: 'text-image-choice';
  options: ImageChoiceOption[];
}

export type Question = 
  | TextChoiceQuestion
  | TextAudioChoiceQuestion
  | TextTableInputQuestion
  | TextImageChoiceQuestion;
