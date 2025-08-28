import React from "react";
import {
  CheckCircle,
  XCircle,
  ArrowLeft,
  ArrowRight,
  RotateCcw,
  Brain,
} from "lucide-react";
import { QuizQuestion } from "@/types";

interface QuizInterfaceProps {
  currentQuiz: { questions: QuizQuestion[] };
  currentQuestionIndex: number;
  userAnswers: (number | null)[];
  selectedAnswer: number | null;
  showResult: boolean;
  isGeneratingMore: boolean;
  targetQuestionCount: number;
  loadingMessage: string;
  isCancelling: boolean;
  onSelectAnswer: (optionIndex: number) => void;
  onNextQuestion: () => void;
  onPreviousQuestion: () => void;
  onSkipQuestion: () => void;
  onResetQuiz: () => void;
  onCancelGeneration: () => void;
}

export default function QuizInterface({
  currentQuiz,
  currentQuestionIndex,
  userAnswers,
  selectedAnswer,
  showResult,
  isGeneratingMore,
  targetQuestionCount,
  loadingMessage,
  isCancelling,
  onSelectAnswer,
  onNextQuestion,
  onPreviousQuestion,
  onSkipQuestion,
  onResetQuiz,
  onCancelGeneration,
}: QuizInterfaceProps) {
  const currentQuestion = currentQuiz?.questions[currentQuestionIndex];

  return (
    <section className="bg-white/10 backdrop-blur-lg rounded-3xl p-6 md:p-8 border border-white/20 shadow-2xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white font-bold text-lg">
            {currentQuestionIndex + 1}
          </div>
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-white">
              Question {currentQuestionIndex + 1}
            </h2>
            <p className="text-purple-200">
              of {currentQuiz.questions.length}
              {isGeneratingMore &&
                targetQuestionCount > currentQuiz.questions.length && (
                  <span className="text-yellow-300">
                    {" "}
                    (target: {targetQuestionCount})
                  </span>
                )}
            </p>
          </div>
        </div>
        <button
          onClick={onResetQuiz}
          className="px-4 py-2 bg-white/20 text-white rounded-lg hover:bg-white/30 transition-colors duration-200 flex items-center gap-2 self-start sm:self-center"
          aria-label="Reset quiz"
        >
          <RotateCcw className="w-4 h-4" />
          Reset
        </button>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-white/20 rounded-full h-3 mb-4">
        <div
          className="bg-gradient-to-r from-purple-400 to-pink-400 h-3 rounded-full transition-all duration-500"
          style={{
            width: `${
              ((currentQuestionIndex + 1) / currentQuiz.questions.length) * 100
            }%`,
          }}
          role="progressbar"
          aria-valuenow={currentQuestionIndex + 1}
          aria-valuemax={currentQuiz.questions.length}
        />
      </div>

      {/* Progressive Loading Indicator */}
      {isGeneratingMore && (
        <div className="mb-6 p-3 bg-yellow-500/20 border border-yellow-400/50 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-yellow-200">
              <div className="w-4 h-4 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin" />
              <span className="text-sm font-medium">
                {loadingMessage || "Generating more questions in background..."}
              </span>
            </div>
            <button
              onClick={onCancelGeneration}
              disabled={isCancelling}
              className="px-3 py-1 bg-red-500/20 border border-red-400/50 text-red-200 text-xs rounded-lg hover:bg-red-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isCancelling ? "Cancelling..." : "Cancel"}
            </button>
          </div>
          <div className="mt-2 text-xs text-yellow-100">
            You can continue with the current questions while more are being
            generated
          </div>
        </div>
      )}

      {/* Question */}
      {currentQuestion && (
        <div className="mb-8">
          <h3 className="text-lg md:text-xl font-semibold text-white mb-6 leading-relaxed">
            {currentQuestion.question}
          </h3>

          <div className="space-y-4">
            {currentQuestion.options.map((option, index) => {
              let buttonClass =
                "w-full p-4 text-left border-2 rounded-xl transition-all duration-300 transform ";
              let icon = null;

              if (showResult) {
                if (index === currentQuestion.correct) {
                  buttonClass +=
                    "bg-green-500/20 border-green-400 text-green-100 shadow-lg shadow-green-500/20 ";
                  icon = <CheckCircle className="w-5 h-5 text-green-400" />;
                } else if (selectedAnswer === index) {
                  buttonClass +=
                    "bg-red-500/20 border-red-400 text-red-100 shadow-lg shadow-red-500/20 ";
                  icon = <XCircle className="w-5 h-5 text-red-400" />;
                } else {
                  buttonClass += "bg-white/5 border-white/20 text-white/60 ";
                }
              } else {
                if (selectedAnswer === index) {
                  buttonClass +=
                    "bg-purple-500/20 border-purple-400 text-purple-100 shadow-lg shadow-purple-500/20 scale-105 ";
                } else {
                  buttonClass +=
                    "bg-white/10 border-white/30 text-white hover:bg-white/20 hover:border-white/40 hover:scale-102 ";
                }
              }

              return (
                <button
                  key={index}
                  onClick={() => onSelectAnswer(index)}
                  className={buttonClass}
                  disabled={showResult}
                  aria-label={`Option ${String.fromCharCode(
                    65 + index
                  )}: ${option}`}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                      {String.fromCharCode(65 + index)}
                    </div>
                    <span className="text-left flex-grow font-medium">
                      {option}
                    </span>
                    {icon && <div className="flex-shrink-0">{icon}</div>}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Explanation */}
      {showResult && currentQuestion && (
        <div className="bg-blue-500/20 border-2 border-blue-400/50 rounded-xl p-6 mb-8 animate-fade-in shadow-lg">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-blue-400 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
              <Brain className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1">
              <h4 className="text-lg font-bold text-blue-200 mb-2">
                Explanation
              </h4>
              <p className="text-blue-100 leading-relaxed">
                {currentQuestion.explanation}
              </p>
              {selectedAnswer === currentQuestion.correct && (
                <div className="mt-4 p-3 bg-green-500/20 border border-green-400/50 rounded-lg">
                  <div className="flex items-center gap-2 text-green-200">
                    <CheckCircle className="w-4 h-4" />
                    <span className="text-sm font-medium">
                      Correct! Moving to next question in 2 seconds...
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <button
          onClick={onPreviousQuestion}
          disabled={currentQuestionIndex === 0}
          className="px-6 py-3 bg-white/20 text-white rounded-xl hover:bg-white/30 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 flex items-center justify-center gap-2 order-2 sm:order-1"
          aria-label="Previous question"
        >
          <ArrowLeft className="w-4 h-4" />
          Previous
        </button>

        <div className="text-white/60 text-sm text-center order-1 sm:order-2">
          {userAnswers.filter((a) => a !== null).length} of{" "}
          {currentQuiz.questions.length} answered
        </div>

        <div className="flex gap-3 order-3">
          <button
            onClick={onSkipQuestion}
            className="px-6 py-3 bg-white/10 text-white rounded-xl hover:bg-white/20 transition-colors duration-200 flex items-center justify-center gap-2"
            aria-label="Skip question"
          >
            Skip
          </button>
          <button
            onClick={onNextQuestion}
            disabled={selectedAnswer === null}
            className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2"
            aria-label={
              currentQuestionIndex === currentQuiz.questions.length - 1
                ? "Finish quiz"
                : "Next question"
            }
          >
            {currentQuestionIndex === currentQuiz.questions.length - 1
              ? "Finish"
              : "Next"}
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </nav>
    </section>
  );
}
