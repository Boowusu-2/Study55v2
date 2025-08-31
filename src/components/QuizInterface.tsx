import React from "react";
import {
  CheckCircle,
  XCircle,
  RotateCcw,
  Trophy,
  Brain,
  Star,
  ArrowRight,
  ArrowLeft,
} from "lucide-react";
import { QuizQuestion } from "@/types";

interface QuizInterfaceProps {
  currentQuiz: { questions: QuizQuestion[] } | null;
  currentQuestionIndex: number;
  userAnswers: (number | null)[];
  selectedAnswer: number | null;
  showResult: boolean;
  quizComplete: boolean;
  isGeneratingMore: boolean;
  targetQuestionCount: number;
  isCancelling: boolean;
  loadingMessage: string;
  isOfflineMode: boolean;
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
  quizComplete,
  isGeneratingMore,
  targetQuestionCount,
  isCancelling,
  loadingMessage,
  isOfflineMode,
  onSelectAnswer,
  onNextQuestion,
  onPreviousQuestion,
  onSkipQuestion,
  onResetQuiz,
  onCancelGeneration,
}: QuizInterfaceProps) {
  const currentQuestion = currentQuiz?.questions[currentQuestionIndex];

  if (!currentQuiz || !currentQuestion) {
    return null;
  }

  return (
    <section className="bg-white/10 backdrop-blur-lg rounded-3xl p-6 md:p-8 border border-white/20 shadow-2xl">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white font-bold text-lg">
            {currentQuestionIndex + 1}
          </div>
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-white">
              Question {currentQuestionIndex + 1}
            </h2>
            <div className="flex items-center gap-2 text-purple-200">
              <span>of {currentQuiz.questions.length}</span>
              {isGeneratingMore && (
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
                  <span className="text-yellow-300 text-sm">
                    Generating more...
                  </span>
                </div>
              )}
              {isOfflineMode && (
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                  <span className="text-yellow-300 text-sm">Offline mode</span>
                </div>
              )}
            </div>
            {isGeneratingMore &&
              targetQuestionCount > currentQuiz.questions.length && (
                <p className="text-sm text-yellow-200 mt-1">
                  Target: {targetQuestionCount} questions
                </p>
              )}
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
        <div className="mb-6 p-4 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-400/50 rounded-xl">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3 text-yellow-200">
              <div className="w-5 h-5 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin" />
              <div>
                <span className="text-sm font-semibold">
                  {loadingMessage ||
                    "Generating more questions in background..."}
                </span>
                {targetQuestionCount > currentQuiz.questions.length && (
                  <div className="text-xs text-yellow-100 mt-1">
                    Progress: {currentQuiz.questions.length}/
                    {targetQuestionCount} questions
                  </div>
                )}
              </div>
            </div>
            <button
              onClick={onCancelGeneration}
              disabled={isCancelling}
              className="px-4 py-2 bg-red-500/20 border border-red-400/50 text-red-200 text-sm rounded-lg hover:bg-red-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              {isCancelling ? (
                <>
                  <div className="w-3 h-3 border border-red-200 border-t-transparent rounded-full animate-spin" />
                  Cancelling...
                </>
              ) : (
                "Cancel"
              )}
            </button>
          </div>
          <div className="text-sm text-yellow-100 bg-yellow-500/10 rounded-lg p-3">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-yellow-400 rounded-full flex items-center justify-center">
                <span className="text-yellow-900 text-xs font-bold">!</span>
              </div>
              <span>
                You can continue with the current questions while more are being
                generated
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Question */}
      <div className="mb-8">
        <h3 className="text-lg md:text-xl font-semibold text-white mb-6 leading-relaxed">
          {currentQuestion.question}
        </h3>

        <div className="space-y-4">
          {currentQuestion.options.map((option, index) => {
            // Base button styling
            let buttonClass =
              "w-full p-4 text-left border-2 rounded-xl transition-all duration-300 transform ";

            // Icons for correct/incorrect
            let icon = null;

            if (showResult) {
              // After answer is revealed
              if (index === currentQuestion.correct) {
                // Correct answer - always green
                buttonClass +=
                  "bg-green-500/20 border-green-400 text-green-100 shadow-lg shadow-green-500/20 ";
                icon = <CheckCircle className="w-5 h-5 text-green-400" />;
              } else if (selectedAnswer === index) {
                // User's wrong answer - red
                buttonClass +=
                  "bg-red-500/20 border-red-400 text-red-100 shadow-lg shadow-red-500/20 ";
                icon = <XCircle className="w-5 h-5 text-red-400" />;
              } else {
                // Other options - dimmed
                buttonClass += "bg-white/5 border-white/20 text-white/60 ";
              }
            } else {
              // Before answer is revealed
              if (selectedAnswer === index) {
                // Selected option
                buttonClass +=
                  "bg-purple-500/20 border-purple-400 text-purple-100 shadow-lg shadow-purple-500/20 scale-105 ";
              } else {
                // Unselected options
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

      {/* Explanation */}
      {showResult && (
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
              {/* Auto-advance indicator for correct answers */}
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
          <div className="flex flex-col items-center gap-1">
            <div className="flex items-center gap-2">
              <span>{userAnswers.filter((a) => a !== null).length}</span>
              <span>of</span>
              <span>{currentQuiz.questions.length}</span>
              <span>answered</span>
            </div>
            {isGeneratingMore &&
              targetQuestionCount > currentQuiz.questions.length && (
                <div className="text-xs text-yellow-300">
                  +{targetQuestionCount - currentQuiz.questions.length} more
                  coming...
                </div>
              )}
          </div>
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

      {/* Final results inline when quiz completed */}
      {quizComplete && (
        <div className="mt-8 bg-gradient-to-r from-green-500/20 to-blue-500/20 border-2 border-green-400/50 rounded-2xl p-8 text-white shadow-lg">
          {(() => {
            const total = currentQuiz.questions.length;
            const correct = userAnswers.reduce((count: number, answer, i) => {
              const isCorrect = answer === currentQuiz.questions[i].correct;
              return count + (isCorrect ? 1 : 0);
            }, 0);
            const percent = Math.round((correct / total) * 100);

            let performanceColor = "text-red-300";
            let performanceIcon = <XCircle className="w-8 h-8" />;

            if (percent >= 80) {
              performanceColor = "text-green-300";
              performanceIcon = <Trophy className="w-8 h-8" />;
            } else if (percent >= 60) {
              performanceColor = "text-yellow-300";
              performanceIcon = <Star className="w-8 h-8" />;
            }

            return (
              <div className="text-center space-y-4">
                <div className="flex items-center justify-center mb-4">
                  <div className={`${performanceColor}`}>{performanceIcon}</div>
                </div>
                <h3 className="text-3xl font-bold mb-2">Quiz Complete!</h3>
                <div className="text-xl">
                  <span className="text-white/80">Your Score: </span>
                  <span className={`font-bold text-2xl ${performanceColor}`}>
                    {correct}/{total}
                  </span>
                  <span className="text-white/60 ml-2">({percent}%)</span>
                </div>
                <div className="text-sm text-white/60">
                  Total questions generated: {total}
                </div>

                {/* Performance message */}
                <div className="mt-4 p-4 bg-white/10 rounded-lg">
                  {percent >= 80 && (
                    <p className="text-green-200">
                      🎉 Excellent work! You&apos;ve mastered this material.
                    </p>
                  )}
                  {percent >= 60 && percent < 80 && (
                    <p className="text-yellow-200">
                      👍 Good job! Consider reviewing the topics you missed.
                    </p>
                  )}
                  {percent < 60 && (
                    <p className="text-red-200">
                      📚 Keep studying! Review the material and try again.
                    </p>
                  )}
                </div>
              </div>
            );
          })()}
        </div>
      )}
    </section>
  );
}
