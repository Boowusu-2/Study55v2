import { useState, useRef, useCallback } from "react";
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
        questionsReady: false, // Don't show questions yet
      });

      // Generate questions in smaller batches for real-time updates
      const batchSize = 3; // Smaller batches for more frequent updates
      let generatedCount = 0;

      while (
        generatedCount < targetCount &&
        !cancellationRef.current.cancelled
      ) {
        const remainingCount = targetCount - generatedCount;
        const currentBatchSize = Math.min(batchSize, remainingCount);

        updateState({
          loadingMessage: `🎯 Generating questions ${
            generatedCount + 1
          }-${Math.min(
            generatedCount + currentBatchSize,
            targetCount
          )} of ${targetCount}... (${Math.round(
            (generatedCount / targetCount) * 100
          )}% complete)`,
        });

        // Use the Railway backend for AI-powered quiz generation
        console.log("Using Railway backend for AI-powered quiz generation");

        // Extract text from uploaded files first
        let documentContent = "";
        try {
          documentContent = await extractTextFromServer(state.uploadedFiles);
          console.log("Extracted document content for quiz generation:", {
            contentLength: documentContent.length,
            preview: documentContent.substring(0, 200) + "...",
          });
        } catch (error) {
          console.error("Failed to extract text for quiz generation:", error);
          // Fallback to client-side generation if extraction fails
          const newQuestions = createFallbackQuestions(currentBatchSize);

          // Add fallback questions to quiz
          updateState({
            currentQuiz: {
              questions: [
                ...(state.currentQuiz?.questions || []),
                ...newQuestions,
              ],
            },
            userAnswers: [
              ...(state.userAnswers || []),
              ...Array.from({ length: newQuestions.length }, () => null),
            ],
          });

          generatedCount += newQuestions.length;
          continue; // Skip to next iteration
        }

        // Call the Railway backend for AI-powered quiz generation
        let newQuestions = [];
        try {
          const response = await fetch(
            "https://study55v2-production-09c8.up.railway.app/generate-quiz",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                content: documentContent,
                questionCount: currentBatchSize,
                difficulty: state.quizSettings.difficulty,
                questionType: state.quizSettings.questionType,
                focusArea: state.quizSettings.focusArea,
              }),
            }
          );

          if (response.ok) {
            const data = await response.json();
            console.log("AI-powered quiz generation successful:", {
              questionsGenerated: data.questions?.length || 0,
            });
            newQuestions = data.questions || [];
          } else {
            console.error("Backend quiz generation failed:", response.status);
            // Fallback to client-side generation
            newQuestions = createFallbackQuestions(
              currentBatchSize,
              documentContent
            );
          }
        } catch (error) {
          console.error("Error calling backend for quiz generation:", error);
          // Fallback to client-side generation
          newQuestions = createFallbackQuestions(
            currentBatchSize,
            documentContent
          );
        }

        if (cancellationRef.current.cancelled) return;

        // Add new questions to existing quiz and update immediately
        updateState((prevState) => ({
          currentQuiz: {
            questions: [
              ...(prevState.currentQuiz?.questions || []),
              ...newQuestions,
            ],
          },
          userAnswers: [
            ...(prevState.userAnswers || []),
            ...Array.from({ length: newQuestions.length }, () => null),
          ],
        }));

        generatedCount += newQuestions.length;

        // Shorter delay between batches for more responsive feel
        await new Promise((resolve) => setTimeout(resolve, 300));
      }

      if (cancellationRef.current.cancelled) return;

      // Success - update state and show quiz
      updateState({
        freeGenerationsLeft:
          state.freeGenerationsLeft > 0 ? state.freeGenerationsLeft - 1 : 0,
        loadingMessage: `✅ Quiz complete! ${
          state.currentQuiz?.questions.length || 0
        } questions generated successfully.`,
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
      />
    </>
  );
}

// Export the component directly
export default SmartStudy;
