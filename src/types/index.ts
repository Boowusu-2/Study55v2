export interface QuizQuestion {
  question: string;
  options: string[];
  correct: number;
  explanation: string;
}

export interface QuizSettings {
  questionCount: number;
  difficulty: 'easy' | 'medium' | 'hard' | 'mixed';
  questionType: 'multiple_choice' | 'true_false' | 'mixed';
  focusArea: string;
  model: 'auto' | 'gemini-1.5-flash' | 'gemini-1.5-pro' | 'gemini-1.0-pro';
}

export interface GeminiResponse {
  candidates: Array<{
    content: {
      parts: Array<{
        text: string;
      }>;
    };
  }>;
}

export interface QuizData {
  questions: QuizQuestion[];
}