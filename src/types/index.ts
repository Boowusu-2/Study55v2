export interface QuizQuestion {
  question: string;
  options: string[];
  correct: number;
  explanation: string;
  questionType?: "multiple_choice" | "true_false" | "practical_case" | "essay";
  modelAnswer?: string;
  evaluationCriteria?: string[];
}

export interface QuizSettings {
  questionCount: number;
  difficulty: "easy" | "medium" | "hard" | "mixed";
  questionType: "multiple_choice" | "true_false" | "practical_case" | "mixed";
  focusArea: string;
  model: "auto" | "gemini-1.5-flash" | "gemini-1.5-pro" | "gemini-1.0-pro";
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

export interface LearningStep {
  id: string;
  title: string;
  content: string;
  type:
    | "explanation"
    | "question"
    | "flashcard"
    | "checkpoint"
    | "interactive"
    | "example";
  question?: string;
  answer?: string;
  options?: string[];
  correctAnswer?: string;
  explanation?: string;
  modelAnswer?: string;
  evaluationCriteria?: string[];
  examples?: string[];
  interactiveElements?: {
    type: "drag_drop" | "fill_blank" | "matching" | "simulation";
    content: Record<string, unknown>;
  };
  nextSteps?: string[];
  commonMistakes?: string[];
  realWorldApplications?: string[];
}

export interface LearningAssistantMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  relatedConcepts?: string[];
}

export interface LearningAssistantState {
  messages: LearningAssistantMessage[];
  isOpen: boolean;
  isLoading: boolean;
  currentTopic?: string;
}
