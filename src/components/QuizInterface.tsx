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
    <section className="bg-white/10 backdrop-blur-lg rounded-3xl p-4 md:p-8 border border-white/20 shadow-2xl min-h-0">
      <div className="flex flex-col gap-4 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white font-bold text-base md:text-lg flex-shrink-0">
              {currentQuestionIndex + 1}
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="text-lg md:text-2xl font-bold text-white truncate">
                Question {currentQuestionIndex + 1}
              </h2>
              <div className="flex items-center gap-2 text-purple-200 text-sm">
                <span>of {currentQuiz.questions.length}</span>
                {isGeneratingMore && (
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
                    <span className="text-yellow-300 text-xs md:text-sm">
                      Generating more...
                    </span>
                  </div>
                )}
                {isOfflineMode && (
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                    <span className="text-yellow-300 text-xs md:text-sm">Offline mode</span>
                  </div>
                )}
              </div>
              {isGeneratingMore &&
                targetQuestionCount > currentQuiz.questions.length && (
                  <p className="text-xs text-yellow-200 mt-1">
                    Target: {targetQuestionCount} questions
                  </p>
                )}
            </div>
          </div>
          <button
            onClick={onResetQuiz}
            className="px-3 py-2 md:px-4 md:py-2 bg-white/20 text-white rounded-lg hover:bg-white/30 transition-colors duration-200 flex items-center gap-2 self-start sm:self-center text-sm"
            aria-label="Reset quiz"
          >
            <RotateCcw className="w-4 h-4" />
            <span className="hidden sm:inline">Reset</span>
          </button>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-white/20 rounded-full h-2 md:h-3">
          <div
            className="bg-gradient-to-r from-purple-400 to-pink-400 h-2 md:h-3 rounded-full transition-all duration-500"
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
      </div>

      {/* Progressive Loading Indicator */}
      {isGeneratingMore && (
        <div className="mb-6 p-3 md:p-4 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-400/50 rounded-xl">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-3 text-yellow-200">
              <div className="w-4 h-4 md:w-5 md:h-5 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin flex-shrink-0" />
              <div className="min-w-0">
                <span className="text-xs md:text-sm font-semibold block">
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
              className="px-3 py-2 md:px-4 md:py-2 bg-red-500/20 border border-red-400/50 text-red-200 text-xs md:text-sm rounded-lg hover:bg-red-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2 self-start sm:self-center"
            >
              {isCancelling ? (
                <>
                  <div className="w-3 h-3 border border-red-200 border-t-transparent rounded-full animate-spin" />
                  <span className="hidden sm:inline">Cancelling...</span>
                  <span className="sm:hidden">Cancel...</span>
                </>
              ) : (
                "Cancel"
              )}
            </button>
          </div>
          <div className="text-xs md:text-sm text-yellow-100 bg-yellow-500/10 rounded-lg p-3 mt-3">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-yellow-400 rounded-full flex items-center justify-center flex-shrink-0">
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
      <div className="mb-6 md:mb-8">
        <h3 className="text-base md:text-xl font-semibold text-white mb-4 md:mb-6 leading-relaxed">
          {currentQuestion.question}
        </h3>

        {/* Question Type Indicator */}
        {currentQuestion.questionType && (
          <div className="mb-4">
            <span className="inline-flex items-center px-2 py-1 md:px-3 md:py-1 rounded-full text-xs font-medium bg-blue-500/20 text-blue-300 border border-blue-400/30">
              {currentQuestion.questionType === "practical_case"
                ? "Practical Case"
                : currentQuestion.questionType === "multiple_choice"
                ? "Multiple Choice"
                : currentQuestion.questionType === "true_false"
                ? "True/False"
                : "Question"}
            </span>
          </div>
        )}

        {/* Multiple Choice Options */}
        {currentQuestion.options && currentQuestion.options.length > 0 && (
          <div className="space-y-3 md:space-y-4">
            {currentQuestion.options.map((option, index) => {
              // Base button styling
              let buttonClass =
                "w-full p-3 md:p-4 text-left border-2 rounded-xl transition-all duration-300 transform ";

              // Icons for correct/incorrect
              let icon = null;

              if (showResult) {
                // After answer is revealed
                if (index === currentQuestion.correct) {
                  // Correct answer - always green
                  buttonClass +=
                    "bg-green-500/20 border-green-400 text-green-100 shadow-lg shadow-green-500/20 ";
                  icon = <CheckCircle className="w-4 h-4 md:w-5 md:h-5 text-green-400" />;
                } else if (selectedAnswer === index) {
                  // User's wrong answer - red
                  buttonClass +=
                    "bg-red-500/20 border-red-400 text-red-100 shadow-lg shadow-red-500/20 ";
                  icon = <XCircle className="w-4 h-4 md:w-5 md:h-5 text-red-400" />;
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
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 md:w-10 md:h-10 bg-white/20 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">
                      {String.fromCharCode(65 + index)}
                    </div>
                    <span className="text-left flex-grow font-medium leading-relaxed text-sm md:text-base">
                      {option}
                    </span>
                    {icon && <div className="flex-shrink-0">{icon}</div>}
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* Essay/Practical Case Input */}
        {currentQuestion.questionType === "practical_case" && (
          <div className="mt-6">
            <label className="block text-sm font-medium text-white mb-3">
              Your Answer (Essay Format)
            </label>
            <textarea
              className="w-full p-3 md:p-4 bg-white/10 border border-white/30 rounded-xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent resize-none text-sm md:text-base"
              rows={4}
              placeholder="Describe your approach to solving this practical case. Be specific and show how you would apply the concepts you've learned..."
              disabled={showResult}
            />
            {showResult && currentQuestion.modelAnswer && (
              <div className="mt-4 p-3 md:p-4 bg-blue-500/10 border border-blue-400/20 rounded-xl">
                <h5 className="text-sm font-semibold text-blue-300 mb-2">
                  Model Answer:
                </h5>
                <p className="text-blue-100 text-sm leading-relaxed">
                  {currentQuestion.modelAnswer}
                </p>
                {currentQuestion.evaluationCriteria && (
                  <div className="mt-3 pt-3 border-t border-blue-400/20">
                    <h6 className="text-xs font-semibold text-blue-300 mb-2">
                      Evaluation Criteria:
                    </h6>
                    <ul className="space-y-1">
                      {currentQuestion.evaluationCriteria.map(
                        (criterion, index) => (
                          <li
                            key={index}
                            className="text-xs text-blue-200 flex items-start gap-2"
                          >
                            <span className="w-1.5 h-1.5 bg-blue-400 rounded-full mt-1.5 flex-shrink-0"></span>
                            {criterion}
                          </li>
                        )
                      )}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Explanation */}
      {showResult && (
        <div className="bg-blue-500/20 border-2 border-blue-400/50 rounded-xl p-4 md:p-6 mb-6 md:mb-8 animate-fade-in shadow-lg">
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 md:w-8 md:h-8 bg-blue-400 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
              <Brain className="w-3 h-3 md:w-4 md:h-4 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-base md:text-lg font-bold text-blue-200 mb-2">
                Explanation
              </h4>
              <p className="text-blue-100 leading-relaxed text-sm md:text-base">
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
      <nav className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center">
        <button
          onClick={onPreviousQuestion}
          disabled={currentQuestionIndex === 0}
          className="px-4 py-3 md:px-6 md:py-3 bg-white/20 text-white rounded-xl hover:bg-white/30 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 flex items-center justify-center gap-2 order-2 sm:order-1 text-sm md:text-base"
          aria-label="Previous question"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Previous</span>
          <span className="sm:hidden">Prev</span>
        </button>

        <div className="text-white/60 text-xs md:text-sm text-center order-1 sm:order-2">
          <div className="flex flex-col items-center gap-1">
            <div className="flex items-center gap-2">
              <span>{userAnswers.filter((a) => a !== null).length}</span>
              <span>of</span>
              <span>{currentQuiz.questions.length}</span>
              <span className="hidden sm:inline">answered</span>
              <span className="sm:hidden">done</span>
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

        <div className="flex gap-2 md:gap-3 order-3">
          <button
            onClick={onSkipQuestion}
            className="px-4 py-3 md:px-6 md:py-3 bg-white/10 text-white rounded-xl hover:bg-white/20 transition-colors duration-200 flex items-center justify-center gap-2 text-sm md:text-base"
            aria-label="Skip question"
          >
            Skip
          </button>
          <button
            onClick={onNextQuestion}
            disabled={selectedAnswer === null}
            className="px-4 py-3 md:px-6 md:py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2 text-sm md:text-base"
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
        <div className="mt-6 md:mt-8 bg-gradient-to-r from-green-500/20 to-blue-500/20 border-2 border-green-400/50 rounded-2xl p-6 md:p-8 text-white shadow-lg">
          {(() => {
            const total = currentQuiz.questions.length;
            const correct = userAnswers.reduce((count: number, answer, i) => {
              const isCorrect = answer === currentQuiz.questions[i].correct;
              return count + (isCorrect ? 1 : 0);
            }, 0);
            const percent = Math.round((correct / total) * 100);

            let performanceColor = "text-red-300";
            let performanceIcon = <XCircle className="w-6 h-6 md:w-8 md:h-8" />;

            if (percent >= 80) {
              performanceColor = "text-green-300";
              performanceIcon = <Trophy className="w-6 h-6 md:w-8 md:h-8" />;
            } else if (percent >= 60) {
              performanceColor = "text-yellow-300";
              performanceIcon = <Star className="w-6 h-6 md:w-8 md:h-8" />;
            }

            return (
              <div className="text-center space-y-4">
                <div className="flex items-center justify-center mb-4">
                  <div className={`${performanceColor}`}>{performanceIcon}</div>
                </div>
                <h3 className="text-2xl md:text-3xl font-bold mb-2">Quiz Complete!</h3>
                <div className="text-lg md:text-xl">
                  <span className="text-white/80">Your Score: </span>
                  <span className={`font-bold text-xl md:text-2xl ${performanceColor}`}>
                    {correct}/{total}
                  </span>
                  <span className="text-white/60 ml-2">({percent}%)</span>
                </div>
                <div className="text-xs md:text-sm text-white/60">
                  Total questions generated: {total}
                </div>

                {/* Performance message */}
                <div className="mt-4 p-3 md:p-4 bg-white/10 rounded-lg">
                  {percent >= 80 && (
                    <p className="text-green-200 text-sm md:text-base">
                      🎉 Excellent work! You&apos;ve mastered this material.
                    </p>
                  )}
                  {percent >= 60 && percent < 80 && (
                    <p className="text-yellow-200 text-sm md:text-base">
                      👍 Good job! Consider reviewing the topics you missed.
                    </p>
                  )}
                  {percent < 60 && (
                    <p className="text-red-200 text-sm md:text-base">
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
