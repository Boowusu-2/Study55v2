import { useCallback } from "react";
import { QuizQuestion } from "@/types";

export function useQuizNavigation() {
  const selectAnswer = useCallback(
    (
      optionIndex: number,
      currentQuestionIndex: number,
      userAnswers: (number | null)[],
      currentQuiz: { questions: QuizQuestion[] } | null,
      showResult: boolean,
      autoAdvancing: boolean,
      onUpdateState: (updates: Record<string, unknown>) => void,
      onNextQuestion: () => void
    ) => {
      if (showResult) return;

      const newAnswers = [...userAnswers];
      newAnswers[currentQuestionIndex] = optionIndex;

      onUpdateState({
        selectedAnswer: optionIndex,
        userAnswers: newAnswers,
      });

      setTimeout(() => {
        onUpdateState({ showResult: true });

        // Check if answer is correct and auto-advance after showing result
        const currentQuestion = currentQuiz?.questions[currentQuestionIndex];
        if (
          currentQuestion &&
          optionIndex === currentQuestion.correct &&
          !autoAdvancing
        ) {
          // Set auto-advancing flag to prevent multiple calls
          onUpdateState({ autoAdvancing: true });

          // Auto-advance to next question after 2 seconds for correct answers
          setTimeout(() => {
            onNextQuestion();
          }, 2000);
        }
      }, 500);
    },
    []
  );

  const nextQuestion = useCallback(
    (
      currentQuestionIndex: number,
      currentQuiz: { questions: QuizQuestion[] } | null,
      userAnswers: (number | null)[],
      onUpdateState: (updates: Record<string, unknown>) => void,
      onShowFinalResults: () => void
    ) => {
      if (currentQuestionIndex < (currentQuiz?.questions.length || 0) - 1) {
        const nextIndex = currentQuestionIndex + 1;
        onUpdateState({
          currentQuestionIndex: nextIndex,
          selectedAnswer: userAnswers[nextIndex],
          showResult: userAnswers[nextIndex] !== null,
          autoAdvancing: false, // Reset auto-advancing flag
        });
      } else {
        onShowFinalResults();
      }
    },
    []
  );

  const skipQuestion = useCallback(
    (
      currentQuestionIndex: number,
      currentQuiz: { questions: QuizQuestion[] } | null,
      userAnswers: (number | null)[],
      onUpdateState: (updates: Record<string, unknown>) => void,
      onShowFinalResults: () => void
    ) => {
      if (!currentQuiz) return;
      if (currentQuestionIndex < currentQuiz.questions.length - 1) {
        const nextIndex = currentQuestionIndex + 1;
        onUpdateState({
          currentQuestionIndex: nextIndex,
          selectedAnswer: userAnswers[nextIndex],
          showResult: userAnswers[nextIndex] !== null,
        });
      } else {
        onShowFinalResults();
      }
    },
    []
  );

  const previousQuestion = useCallback(
    (
      currentQuestionIndex: number,
      userAnswers: (number | null)[],
      onUpdateState: (updates: Record<string, unknown>) => void
    ) => {
      if (currentQuestionIndex > 0) {
        const prevIndex = currentQuestionIndex - 1;
        onUpdateState({
          currentQuestionIndex: prevIndex,
          selectedAnswer: userAnswers[prevIndex],
          showResult: userAnswers[prevIndex] !== null,
        });
      }
    },
    []
  );

  const showFinalResults = useCallback(
    (onUpdateState: (updates: Record<string, unknown>) => void) => {
      onUpdateState({ quizComplete: true });
    },
    []
  );

  return {
    selectAnswer,
    nextQuestion,
    skipQuestion,
    previousQuestion,
    showFinalResults,
  };
}
