import React, { useState, useRef, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useQuizState } from "@/hooks/useQuizState";
import { useQuizGeneration } from "@/hooks/useQuizGeneration";
import { useQuizNavigation } from "@/hooks/useQuizNavigation";

// Import components directly
import Header from "@/components/Header";
import DemoInfo from "@/components/DemoInfo";
import FileUpload from "@/components/FileUpload";
import QuizSettings from "@/components/QuizSettings";
import ActionButtons from "@/components/ActionButtons";
import QuizInterface from "@/components/QuizInterface";
import LoadingOverlay from "@/components/LoadingOverlay";
import UserProfile from "@/components/UserProfile";
import SettingsModal from "@/components/SettingsModal";
import PaymentModal from "@/components/PaymentModal";
import GuidedLearning from "@/components/GuidedLearning";
import LearningAssistant from "@/components/LearningAssistant";
import SEO from "@/components/SEO";
import FloatingStars from "@/components/FloatingStars";

function SmartStudy() {
  // Auth context is used in Header component
  useAuth();
  const [showUserProfile, setShowUserProfile] = useState(false);
  const [showGuidedLearning, setShowGuidedLearning] = useState(false);

  // Quiz state management
  const {
    state,
    updateState,
    resetQuiz,
    addFiles,
    removeFile,
    updateQuizSettings,
    cancellationRef,
  } = useQuizState();

  // Quiz generation utilities
  const { createFallbackQuestions, extractTextFromServer } =
    useQuizGeneration();

  // Quiz navigation
  const {
    selectAnswer,
    nextQuestion,
    skipQuestion,
    previousQuestion,
    showFinalResults,
  } = useQuizNavigation();

  // Track if any dropdown is open
  const [openDropdowns, setOpenDropdowns] = useState<Set<string>>(
    () => new Set()
  );

  const handleDropdownChange = useCallback(
    (dropdownId: string, isOpen: boolean) => {
      setOpenDropdowns((prev) => {
        const newSet = new Set(prev);
        if (isOpen) {
          newSet.add(dropdownId);
        } else {
          newSet.delete(dropdownId);
        }
        return newSet;
      });
    },
    []
  );

  // Ref for scrolling to loading section
  const loadingSectionRef = useRef<HTMLDivElement>(null);

  // Quiz generation function
  const generateQuiz = useCallback(async (): Promise<void> => {
    if (state.uploadedFiles.length === 0) {
      alert("Please upload documents to generate a quiz");
      return;
    }

    // Check if user has free generations left or is pro user
    if (state.freeGenerationsLeft <= 0 && !state.isProUser) {
      updateState({ showPaymentModal: true });
      return;
    }

    // Reset cancellation flag
    cancellationRef.current.cancelled = false;

    // Immediately show loading state with better UX
    updateState({
      isLoading: true,
      loadingMessage: "🚀 Starting quiz generation...",
      questionsReady: false,
      isUploading: false, // Clear upload state
    });

    // Scroll to loading section
    setTimeout(() => {
      loadingSectionRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }, 100);

    // Add a small delay to show the loading state
    await new Promise((resolve) => setTimeout(resolve, 100));

    try {
      updateState({ loadingMessage: "📄 Extracting text from documents..." });

      const combinedContent = await extractTextFromServer(state.uploadedFiles);

      // Store the extracted text in state for guided learning
      updateState({ extractedText: combinedContent });

      updateState({
        loadingMessage: "🧠 Generating quiz questions with AI...",
      });

      // Start progressive loading - store target count before any state changes
      const targetCount = state.quizSettings.questionCount;

      updateState({
        targetQuestionCount: targetCount,
        isLoading: true, // Keep loading active
        isGeneratingMore: true,
        loadingMessage: "🎯 Generating questions...",
      });

      // Initialize with empty quiz structure but don't show yet
      const initialQuizData = { questions: [] };

      updateState({
        currentQuiz: initialQuizData,
        userAnswers: [],
        currentQuestionIndex: 0,
        selectedAnswer: null,
        showResult: false,
        quizComplete: false,
        questionsReady: false, // Don't show quiz until all questions are ready
      });

      // Generate questions in one request for better reliability
      updateState({
        loadingMessage: `🎯 Generating ${targetCount} questions with AI...`,
      });

      // Use the Railway backend for AI-powered quiz generation
      console.log("Using Railway backend for AI-powered quiz generation");

      // Extract text from uploaded files first
      let documentContent = "";
      let generatedCount = 0;
      try {
        documentContent = await extractTextFromServer(state.uploadedFiles);
        console.log("Extracted document content for quiz generation:", {
          contentLength: documentContent.length,
          preview: documentContent.substring(0, 200) + "...",
        });

        // Call the Railway backend for AI-powered quiz generation
        const requestBody: {
          content: string;
          questionCount: number;
          difficulty: string;
          questionType: string;
          focusArea: string;
          customApiKey?: string;
        } = {
          content: documentContent,
          questionCount: targetCount, // Request ALL questions at once
          difficulty: state.quizSettings.difficulty,
          questionType: state.quizSettings.questionType,
          focusArea: state.quizSettings.focusArea,
        };

        // Add custom API key if enabled
        if (state.useCustomApiKey && state.customApiKey) {
          requestBody.customApiKey = state.customApiKey;
        }

        const response = await fetch(
          "https://study55v2-production-09c8.up.railway.app/generate-quiz",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(requestBody),
          }
        );

        if (response.ok) {
          const data = await response.json();
          console.log("AI-powered quiz generation successful:", {
            questionsGenerated: data.questions?.length || 0,
          });
          const newQuestions = data.questions || [];

          // Add questions to quiz
          updateState({
            currentQuiz: {
              questions: newQuestions,
            },
            userAnswers: Array.from(
              { length: newQuestions.length },
              () => null
            ),
          });

          generatedCount = newQuestions.length;
        } else {
          console.error("Backend quiz generation failed:", response.status);
          // Fallback to client-side generation
          const newQuestions = createFallbackQuestions(
            targetCount,
            documentContent
          );

          // Add fallback questions to quiz
          updateState({
            currentQuiz: {
              questions: newQuestions,
            },
            userAnswers: Array.from(
              { length: newQuestions.length },
              () => null
            ),
          });

          generatedCount = newQuestions.length;
        }
      } catch (error) {
        console.error("Error calling backend for quiz generation:", error);
        // Fallback to client-side generation
        const newQuestions = createFallbackQuestions(
          targetCount,
          documentContent
        );

        // Add fallback questions to quiz
        updateState({
          currentQuiz: {
            questions: newQuestions,
          },
          userAnswers: Array.from({ length: newQuestions.length }, () => null),
        });

        generatedCount = newQuestions.length;
      }

      if (cancellationRef.current.cancelled) return;

      // Success - update state and show quiz
      updateState({
        freeGenerationsLeft:
          state.freeGenerationsLeft > 0 ? state.freeGenerationsLeft - 1 : 0,
        loadingMessage: `✅ Quiz complete! ${generatedCount} questions generated successfully.`,
        isGeneratingMore: false,
        isLoading: false, // Stop loading
        questionsReady: true, // Show quiz now
      });

      // Auto-scroll to quiz interface and center it
      setTimeout(() => {
        const quizSection = document.querySelector("[data-quiz-section]");
        if (quizSection) {
          quizSection.scrollIntoView({
            behavior: "smooth",
            block: "center", // Center the quiz on screen
          });
        }
      }, 300);
    } catch (error) {
      console.error("Quiz generation error:", error);

      // Provide better error feedback
      let errorMessage = "Error generating quiz. Please try again.";
      if (error instanceof Error) {
        if (error.message.includes("timeout")) {
          errorMessage =
            "Quiz generation timed out. Please try again with fewer questions.";
        } else if (error.message.includes("API")) {
          errorMessage =
            "AI service is temporarily unavailable. Using fallback questions.";
        }
      }

      // Show error message but don't use alert
      updateState({
        isLoading: false,
        loadingMessage: errorMessage,
        isGeneratingMore: false,
        questionsReady: false, // Don't show quiz on error
      });

      // Clear error message after 5 seconds
      setTimeout(() => {
        updateState({ loadingMessage: "" });
      }, 5000);
    }
  }, [
    state.uploadedFiles,
    state.freeGenerationsLeft,
    state.isProUser,
    state.quizSettings,
    state.currentQuiz,
    state.userAnswers,
    cancellationRef,
    updateState,
    extractTextFromServer,
    createFallbackQuestions,
  ]);

  // Quiz navigation handlers
  const handleShowFinalResults = useCallback(() => {
    showFinalResults(updateState);
  }, [updateState, showFinalResults]);

  const handleNextQuestion = useCallback(() => {
    nextQuestion(
      state.currentQuestionIndex,
      state.currentQuiz,
      state.userAnswers,
      updateState,
      () => handleShowFinalResults()
    );
  }, [
    state.currentQuestionIndex,
    state.currentQuiz,
    state.userAnswers,
    updateState,
    nextQuestion,
    handleShowFinalResults,
  ]);

  const handleSelectAnswer = useCallback(
    (optionIndex: number) => {
      selectAnswer(
        optionIndex,
        state.currentQuestionIndex,
        state.userAnswers,
        state.currentQuiz,
        state.showResult,
        state.autoAdvancing,
        updateState,
        () => handleNextQuestion()
      );
    },
    [
      state.currentQuestionIndex,
      state.userAnswers,
      state.currentQuiz,
      state.showResult,
      state.autoAdvancing,
      updateState,
      selectAnswer,
      handleNextQuestion,
    ]
  );

  const handleSkipQuestion = useCallback(() => {
    skipQuestion(
      state.currentQuestionIndex,
      state.currentQuiz,
      state.userAnswers,
      updateState,
      () => handleShowFinalResults()
    );
  }, [
    state.currentQuestionIndex,
    state.currentQuiz,
    state.userAnswers,
    updateState,
    skipQuestion,
    handleShowFinalResults,
  ]);

  const handlePreviousQuestion = useCallback(() => {
    previousQuestion(
      state.currentQuestionIndex,
      state.userAnswers,
      updateState
    );
  }, [
    state.currentQuestionIndex,
    state.userAnswers,
    updateState,
    previousQuestion,
  ]);

  const handleCancelGeneration = useCallback(() => {
    cancellationRef.current.cancelled = true;
    updateState({
      isGeneratingMore: false,
      isCancelling: true,
      loadingMessage: "Cancelling generation...",
    });

    // Clear the cancellation state after a brief delay
    setTimeout(() => {
      updateState({
        isCancelling: false,
        loadingMessage:
          "Generation cancelled. You can continue with the current questions.",
      });

      // Clear the message after 3 seconds
      setTimeout(() => {
        updateState({ loadingMessage: "" });
      }, 3000);
    }, 1000);
  }, [cancellationRef, updateState]);

  const handleUpgradeToPro = useCallback(() => {
    // Close settings modal
    updateState({ showSettingsModal: false });
    // Show payment modal
    updateState({ showPaymentModal: true });
    console.log("Upgrading to Pro - Payment integration would go here");
  }, [updateState]);

  const handlePaymentSuccess = useCallback(() => {
    // Close payment modal
    updateState({ showPaymentModal: false });
    // Upgrade user to pro
    updateState({ isProUser: true });
    // Show success message
    alert("🎉 Welcome to Pro! You now have unlimited access to all features.");
  }, [updateState]);

  const handleStartGuidedLearning = useCallback(async () => {
    if (state.uploadedFiles.length > 0 && !state.extractedText) {
      // Extract text first if not already done
      updateState({
        loadingMessage: "📄 Extracting text for guided learning...",
      });

      try {
        const combinedContent = await extractTextFromServer(
          state.uploadedFiles
        );
        updateState({
          extractedText: combinedContent,
          loadingMessage: "", // Clear loading message
        });
      } catch (error) {
        console.error("Failed to extract text for guided learning:", error);
        updateState({ loadingMessage: "" }); // Clear loading message on error
      }
    }
    setShowGuidedLearning(true);
  }, [
    state.uploadedFiles,
    state.extractedText,
    updateState,
    extractTextFromServer,
  ]);

  // Guided Learning function
  const startGuidedLearning = useCallback(() => {
    if (state.uploadedFiles.length === 0) {
      alert("Please upload a document first");
      return;
    }
    updateState({ showGuidedLearning: true });
  }, [state.uploadedFiles, updateState]);

  // Learning Assistant function
  const openLearningAssistant = useCallback(() => {
    updateState({ showLearningAssistant: true });
  }, [updateState]);

  // Close functions
  const closeGuidedLearning = useCallback(() => {
    updateState({ showGuidedLearning: false });
  }, [updateState]);

  const closeLearningAssistant = useCallback(() => {
    updateState({ showLearningAssistant: false });
  }, [updateState]);

  return (
    <>
      <SEO />

      <div className="min-h-screen bg-gradient-to-br from-black via-slate-900 to-black relative overflow-hidden">
        {/* Modern Animated Background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {/* Enhanced Gradient Orbs */}
          <div className="absolute top-0 -left-4 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-60 animate-blob-enhanced" />
          <div className="absolute top-0 -right-4 w-80 h-80 bg-yellow-500 rounded-full mix-blend-multiply filter blur-xl opacity-60 animate-blob-enhanced animation-delay-2000" />
          <div className="absolute -bottom-8 left-20 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-60 animate-blob-enhanced animation-delay-4000" />
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-40 animate-blob-enhanced animation-delay-1000" />

          {/* Grid Pattern */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:50px_50px]" />

          <FloatingStars />
        </div>

        <div className="relative z-10 container mx-auto px-4 py-8 max-w-6xl">
          {/* Header */}
          <Header
            onOpenSettings={() => updateState({ showSettingsModal: true })}
            onOpenUserProfile={() => setShowUserProfile(true)}
          />

          {/* Learning Mode Selector - Always Visible */}
          <div className="mb-8">
            <h3 className="text-xl font-bold text-white mb-4 text-center">
              Choose Your Learning Mode
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
              {/* Document Learning */}
              <div className="bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-2xl p-6 border border-blue-500/30 hover:border-blue-400/50 transition-all duration-300">
                <div className="text-center">
                  <div className="w-16 h-16 bg-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <svg
                      className="w-8 h-8 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                  </div>
                  <h4 className="text-lg font-semibold text-white mb-2">
                    Document Learning
                  </h4>
                  <p className="text-gray-300 text-sm mb-4">
                    Upload documents and create AI-powered quizzes
                  </p>
                </div>
              </div>

              {/* Programming Learning - FUTURE DEVELOPMENT */}
              <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-2xl p-6 border border-green-500/30 hover:border-green-400/50 transition-all duration-300">
                <div className="text-center">
                  <div className="w-16 h-16 bg-green-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <svg
                      className="w-8 h-8 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
                      />
                    </svg>
                  </div>
                  <h4 className="text-lg font-semibold text-white mb-2">
                    Programming Tutor
                  </h4>
                  <p className="text-gray-300 text-sm mb-4">
                    Learn programming with interactive coding tutorials (Coming
                    Soon)
                  </p>
                  {/* FUTURE DEVELOPMENT: Interactive coding tutorials will be implemented here */}
                  <div className="space-y-3">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-gray-500 rounded-2xl flex items-center justify-center mx-auto mb-4 opacity-50">
                        <svg
                          className="w-8 h-8 text-white"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
                          />
                        </svg>
                      </div>
                      <h4 className="text-lg font-semibold text-gray-400 mb-2">
                        Programming Tutor
                      </h4>
                      <p className="text-gray-500 text-sm mb-4">
                        Interactive coding tutorials coming soon!
                      </p>
                      <button
                        disabled
                        className="w-full px-6 py-3 bg-gray-500 text-gray-300 rounded-xl cursor-not-allowed flex items-center justify-center gap-2"
                      >
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
                          />
                        </svg>
                        Coming Soon
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* AI Chat Learning */}
              <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-2xl p-6 border border-purple-500/30 hover:border-purple-400/50 transition-all duration-300">
                <div className="text-center">
                  <div className="w-16 h-16 bg-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <svg
                      className="w-8 h-8 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                      />
                    </svg>
                  </div>
                  <h4 className="text-lg font-semibold text-white mb-2">
                    AI Learning Assistant
                  </h4>
                  <p className="text-gray-300 text-sm mb-4">
                    Chat with AI for personalized learning guidance
                  </p>
                  <button
                    onClick={openLearningAssistant}
                    className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all duration-200 font-semibold"
                  >
                    Start Chat
                  </button>
                </div>
              </div>
            </div>
          </div>

          {!state.currentQuiz || !state.questionsReady ? (
            <div className="space-y-8 relative" ref={loadingSectionRef}>
              {/* Loading Overlay */}
              <LoadingOverlay
                isLoading={state.isLoading}
                loadingMessage={state.loadingMessage}
                onCancel={() => {
                  cancellationRef.current.cancelled = true;
                  updateState({
                    isLoading: false,
                    isGeneratingMore: false,
                    loadingMessage: "",
                  });
                }}
                progress={
                  state.isGeneratingMore
                    ? Math.round(
                        ((state.currentQuiz?.questions.length || 0) /
                          state.targetQuestionCount) *
                          100
                      )
                    : 0
                }
                isGeneratingMore={state.isGeneratingMore}
              />

              {/* Demo Info Section */}
              <DemoInfo
                freeGenerationsLeft={state.freeGenerationsLeft}
                isProUser={state.isProUser}
                onUpgradeToPro={handleUpgradeToPro}
              />

              {/* File Upload Section */}
              <FileUpload
                uploadedFiles={state.uploadedFiles}
                onAddFiles={addFiles}
                onRemoveFile={removeFile}
                isUploading={state.isUploading}
                uploadProgress={state.uploadProgress}
              />

              {/* Quiz Settings Section */}
              <QuizSettings
                quizSettings={state.quizSettings}
                onUpdateSettings={updateQuizSettings}
                onDropdownChange={handleDropdownChange}
              />

              {/* Spacing to prevent dropdown overlap */}
              <div className="h-8"></div>

              {/* Action Buttons */}
              <ActionButtons
                uploadedFiles={state.uploadedFiles}
                isLoading={state.isLoading}
                loadingMessage={state.loadingMessage}
                openDropdowns={openDropdowns}
                onGenerateQuiz={generateQuiz}
                onStartGuidedLearning={handleStartGuidedLearning}
              />
            </div>
          ) : (
            /* Quiz Interface */
            <div data-quiz-section>
              {/* Back to Learning Modes Button */}
              <div className="mb-6 text-center">
                <button
                  onClick={() =>
                    updateState({ currentQuiz: null, questionsReady: false })
                  }
                  className="px-6 py-3 bg-gray-600 text-white rounded-xl hover:bg-gray-700 transition-colors duration-200 flex items-center justify-center gap-2 mx-auto"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10 19l-7-7m0 0l7-7m-7 7h18"
                    />
                  </svg>
                  Back to Learning Modes
                </button>
              </div>

              <QuizInterface
                currentQuiz={state.currentQuiz}
                currentQuestionIndex={state.currentQuestionIndex}
                userAnswers={state.userAnswers}
                selectedAnswer={state.selectedAnswer}
                showResult={state.showResult}
                quizComplete={state.quizComplete}
                isGeneratingMore={state.isGeneratingMore}
                targetQuestionCount={state.targetQuestionCount}
                isCancelling={state.isCancelling}
                loadingMessage={state.loadingMessage}
                isOfflineMode={state.isOfflineMode}
                onSelectAnswer={handleSelectAnswer}
                onNextQuestion={handleNextQuestion}
                onPreviousQuestion={handlePreviousQuestion}
                onSkipQuestion={handleSkipQuestion}
                onResetQuiz={resetQuiz}
                onCancelGeneration={handleCancelGeneration}
              />
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <UserProfile
        isOpen={showUserProfile}
        onClose={() => setShowUserProfile(false)}
      />

      <SettingsModal
        isOpen={state.showSettingsModal}
        onClose={() => updateState({ showSettingsModal: false })}
        freeGenerationsLeft={state.freeGenerationsLeft}
        isProUser={state.isProUser}
        onUpgradeToPro={handleUpgradeToPro}
        customApiKey={state.customApiKey}
        useCustomApiKey={state.useCustomApiKey}
        onUpdateApiKey={(key, useCustom) =>
          updateState({ customApiKey: key, useCustomApiKey: useCustom })
        }
        quizSettings={state.quizSettings}
        onUpdateQuizSettings={(settings) =>
          updateState({ quizSettings: settings })
        }
        currentQuiz={state.currentQuiz}
      />

      <PaymentModal
        isOpen={state.showPaymentModal}
        onClose={() => updateState({ showPaymentModal: false })}
        selectedPlan={{
          name: "Monthly",
          price: "$9.99",
          period: "per month",
          popular: false,
        }}
        onPaymentSuccess={handlePaymentSuccess}
      />

      <GuidedLearning
        isOpen={showGuidedLearning}
        onClose={() => setShowGuidedLearning(false)}
        documentContent={state.extractedText || ""}
        onGenerateQuiz={generateQuiz}
        customApiKey={state.customApiKey}
        useCustomApiKey={state.useCustomApiKey}
      />

      {/* Learning Assistant Modal */}
      <LearningAssistant
        isOpen={state.showLearningAssistant}
        onClose={closeLearningAssistant}
        currentTopic={
          state.uploadedFiles.length > 0 ? "Document Analysis" : undefined
        }
        customApiKey={state.customApiKey}
        useCustomApiKey={state.useCustomApiKey}
      />

      {/* CodingTerminal component is removed as per edit hint */}
    </>
  );
}

// Export the component directly
export default SmartStudy;
