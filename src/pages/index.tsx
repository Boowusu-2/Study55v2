import { useState, useCallback, useRef, JSX } from "react";
import Head from "next/head";
import {
  Upload,
  Brain,
  CheckCircle,
  XCircle,
  RotateCcw,
  Trophy,
  FileText,
  Settings,
  Zap,
  Star,
  ArrowRight,
  ArrowLeft,
} from "lucide-react";
import { QuizQuestion, QuizSettings } from "@/types";
import { callGeminiAPIWithSplitting } from "@/lib/api";
import { extractTextFromFiles } from "@/lib/fastapi-client";
import { formatFileSize } from "@/utils/helpers";

interface SmartStudyState {
  uploadedFiles: File[];
  currentQuiz: { questions: QuizQuestion[] } | null;
  currentQuestionIndex: number;
  userAnswers: (number | null)[];
  isLoading: boolean;
  loadingMessage: string;
  apiKey: string;
  selectedAnswer: number | null;
  showResult: boolean;
  quizSettings: QuizSettings;
  quizComplete: boolean;
  autoAdvancing: boolean;
  isGeneratingMore: boolean;
  targetQuestionCount: number;
}

export default function SmartStudy(): JSX.Element {
  const [state, setState] = useState<SmartStudyState>({
    uploadedFiles: [],
    currentQuiz: null,
    currentQuestionIndex: 0,
    userAnswers: [],
    isLoading: false,
    loadingMessage: "",
    apiKey: "",
    selectedAnswer: null,
    showResult: false,
    quizComplete: false,
    autoAdvancing: false,
    isGeneratingMore: false,
    targetQuestionCount: 0,
    quizSettings: {
      questionCount: 10,
      difficulty: "medium",
      questionType: "multiple_choice",
      focusArea: "",
      model: "auto",
    },
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  // File upload handling
  const addFiles = useCallback((files: File[]): void => {
    const validTypes = [".pdf", ".doc", ".docx", ".txt", ".ppt", ".pptx"];
    const newFiles = files.filter((file) => {
      const extension = "." + file.name.split(".").pop()?.toLowerCase();
      return (
        validTypes.includes(extension) &&
        !state.uploadedFiles.find((f) => f.name === file.name)
      );
    });

    setState((prev) => ({
      ...prev,
      uploadedFiles: [...prev.uploadedFiles, ...newFiles],
    }));
  }, [state.uploadedFiles]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const files = Array.from(e.target.files || []);
    addFiles(files);
  };

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>): void => {
    e.preventDefault();
    e.currentTarget.classList.remove("border-blue-400", "bg-blue-50");
    const files = Array.from(e.dataTransfer.files);
    addFiles(files);
  }, [addFiles]);

  const handleDragOver = useCallback(
    (e: React.DragEvent<HTMLDivElement>): void => {
      e.preventDefault();
      e.currentTarget.classList.add("border-blue-400", "bg-blue-50/20");
    },
    []
  );

  const handleDragLeave = useCallback(
    (e: React.DragEvent<HTMLDivElement>): void => {
      e.preventDefault();
      e.currentTarget.classList.remove("border-blue-400", "bg-blue-50/20");
    },
    []
  );

  const removeFile = (index: number): void => {
    setState((prev) => ({
      ...prev,
      uploadedFiles: prev.uploadedFiles.filter((_, i) => i !== index),
    }));
  };

  const updateQuizSettings = <K extends keyof QuizSettings>(
    key: K,
    value: QuizSettings[K]
  ): void => {
    setState((prev) => ({
      ...prev,
      quizSettings: {
        ...prev.quizSettings,
        [key]: value,
      },
    }));
  };

  const extractTextFromServer = async (files: File[]): Promise<string> => {
    try {
      return await extractTextFromFiles(files);
    } catch (error) {
      console.error("Text extraction error:", error);
      throw new Error("Failed to extract text from files");
    }
  };

  const generateQuiz = async (): Promise<void> => {
    if (state.uploadedFiles.length === 0 || !state.apiKey.trim()) {
      alert("Please upload documents and enter your API key");
      return;
    }

    setState((prev) => ({
      ...prev,
      isLoading: true,
      loadingMessage: "Extracting text from documents...",
    }));

    try {
      const combinedContent = await extractTextFromServer(state.uploadedFiles);

      setState((prev) => ({
        ...prev,
        loadingMessage: "Generating quiz questions...",
      }));

      // Start progressive loading
      setState((prev) => ({
        ...prev,
        targetQuestionCount: state.quizSettings.questionCount,
        isLoading: false,
        isGeneratingMore: true,
        loadingMessage: "Starting quiz generation...",
      }));

      // Initialize with first batch
      const initialQuizData = await callGeminiAPIWithSplitting(
        combinedContent,
        Math.min(8, state.quizSettings.questionCount), // Start with first 8 questions
        state.quizSettings.difficulty,
        state.quizSettings.questionType,
        state.quizSettings.focusArea,
        state.apiKey,
        state.quizSettings.model,
        (message, current, total) => {
          setState((prev) => ({
            ...prev,
            loadingMessage: `${message} (${current}/${total})`,
          }));
        }
      );

      // Start the quiz with initial questions
      setState((prev) => ({
        ...prev,
        currentQuiz: initialQuizData,
        userAnswers: new Array(initialQuizData.questions.length).fill(null),
        currentQuestionIndex: 0,
        selectedAnswer: null,
        showResult: false,
        quizComplete: false,
        loadingMessage: "Quiz ready! Generating more questions in background...",
      }));

      // Generate remaining questions in background
      if (state.quizSettings.questionCount > 8) {
        generateRemainingQuestions(combinedContent);
      } else {
        setState((prev) => ({
          ...prev,
          isGeneratingMore: false,
          loadingMessage: "",
        }));
      }
    } catch (error) {
      console.error("Quiz generation error:", error);
      alert("Error generating quiz. Please try again.");
      setState((prev) => ({ ...prev, isLoading: false, loadingMessage: "" }));
    }
  };

  const selectAnswer = (optionIndex: number): void => {
    if (state.showResult) return;

    const newAnswers = [...state.userAnswers];
    newAnswers[state.currentQuestionIndex] = optionIndex;

    setState((prev) => ({
      ...prev,
      selectedAnswer: optionIndex,
      userAnswers: newAnswers,
    }));

    setTimeout(() => {
      setState((prev) => ({ ...prev, showResult: true }));
      
      // Check if answer is correct and auto-advance after showing result
      const currentQuestion = state.currentQuiz?.questions[state.currentQuestionIndex];
      if (currentQuestion && optionIndex === currentQuestion.correct && !state.autoAdvancing) {
        // Set auto-advancing flag to prevent multiple calls
        setState((prev) => ({ ...prev, autoAdvancing: true }));
        
        // Auto-advance to next question after 2 seconds for correct answers
        setTimeout(() => {
          nextQuestion();
        }, 2000);
      }
    }, 500);
  };

  const nextQuestion = (): void => {
    if (
      state.currentQuestionIndex <
      (state.currentQuiz?.questions.length || 0) - 1
    ) {
      const nextIndex = state.currentQuestionIndex + 1;
      setState((prev) => ({
        ...prev,
        currentQuestionIndex: nextIndex,
        selectedAnswer: prev.userAnswers[nextIndex],
        showResult: prev.userAnswers[nextIndex] !== null,
        autoAdvancing: false, // Reset auto-advancing flag
      }));
    } else {
      showFinalResults();
    }
  };

  const skipQuestion = (): void => {
    if (!state.currentQuiz) return;
    if (state.currentQuestionIndex < state.currentQuiz.questions.length - 1) {
      const nextIndex = state.currentQuestionIndex + 1;
      setState((prev) => ({
        ...prev,
        currentQuestionIndex: nextIndex,
        selectedAnswer: prev.userAnswers[nextIndex],
        showResult: prev.userAnswers[nextIndex] !== null,
      }));
    } else {
      showFinalResults();
    }
  };

  const previousQuestion = (): void => {
    if (state.currentQuestionIndex > 0) {
      const prevIndex = state.currentQuestionIndex - 1;
      setState((prev) => ({
        ...prev,
        currentQuestionIndex: prevIndex,
        selectedAnswer: prev.userAnswers[prevIndex],
        showResult: prev.userAnswers[prevIndex] !== null,
      }));
    }
  };

  const showFinalResults = (): void => {
    if (!state.currentQuiz) return;

    // Calculate correct answers for summary
    state.userAnswers.reduce((count: number, answer, index) => {
      return (
        count + (answer === state.currentQuiz!.questions[index].correct ? 1 : 0)
      );
    }, 0);

    // show summary in UI
    setState((prev) => ({ ...prev, quizComplete: true }));
  };

  const generateRemainingQuestions = async (content: string): Promise<void> => {
    try {
      const remainingCount = state.targetQuestionCount - (state.currentQuiz?.questions.length || 0);
      
      if (remainingCount <= 0) {
        setState((prev) => ({
          ...prev,
          isGeneratingMore: false,
          loadingMessage: "",
        }));
        return;
      }

      const additionalQuizData = await callGeminiAPIWithSplitting(
        content,
        remainingCount,
        state.quizSettings.difficulty,
        state.quizSettings.questionType,
        state.quizSettings.focusArea,
        state.apiKey,
        state.quizSettings.model,
        (message, current, total) => {
          setState((prev) => ({
            ...prev,
            loadingMessage: `Generating more questions: ${message} (${current}/${total})`,
          }));
        }
      );

      // Merge new questions with existing ones
      if (state.currentQuiz && additionalQuizData.questions.length > 0) {
        const allQuestions = [...state.currentQuiz.questions, ...additionalQuizData.questions];
        const allAnswers = [...state.userAnswers, ...new Array(additionalQuizData.questions.length).fill(null)];
        
        setState((prev) => ({
          ...prev,
          currentQuiz: { questions: allQuestions },
          userAnswers: allAnswers,
          isGeneratingMore: false,
          loadingMessage: `Added ${additionalQuizData.questions.length} more questions!`,
        }));

        // Clear the success message after 3 seconds
        setTimeout(() => {
          setState((prev) => ({
            ...prev,
            loadingMessage: "",
          }));
        }, 3000);
      }
    } catch (error) {
      console.error("Error generating remaining questions:", error);
      setState((prev) => ({
        ...prev,
        isGeneratingMore: false,
        loadingMessage: "Finished generating questions.",
      }));
    }
  };

  const resetQuiz = (): void => {
    setState((prev) => ({
      ...prev,
      currentQuiz: null,
      currentQuestionIndex: 0,
      userAnswers: [],
      selectedAnswer: null,
      showResult: false,
      quizComplete: false,
      autoAdvancing: false,
      isGeneratingMore: false,
      targetQuestionCount: 0,
    }));
  };

  const currentQuestion =
    state.currentQuiz?.questions[state.currentQuestionIndex];

  return (
    <>
      <Head>
        <title>Study55 - AI-Powered Quiz Generator</title>
        <meta
          name="description"
          content="Transform your documents into interactive quizzes with AI"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
        {/* Animated Background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500/20 rounded-full mix-blend-multiply filter blur-xl animate-pulse" />
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500/20 rounded-full mix-blend-multiply filter blur-xl animate-pulse [animation-delay:2s]" />
        </div>

        <div className="relative z-10 container mx-auto px-4 py-8 max-w-6xl">
          {/* Header */}
          <header className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full mb-6 animate-bounce">
              <Brain className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-400">
              Study55
            </h1>
            <p className="text-lg md:text-xl text-purple-100 max-w-2xl mx-auto leading-relaxed">
              Transform your documents into interactive quizzes powered by AI.
              Upload, configure, and start learning smarter.
            </p>
          </header>

          {!state.currentQuiz ? (
            <div className="space-y-8">
              {/* API Key Section */}
              <section className="bg-white/10 backdrop-blur-lg rounded-3xl p-6 md:p-8 border border-white/20 shadow-2xl">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 bg-yellow-400 rounded-lg flex items-center justify-center">
                    <Zap className="w-5 h-5 text-yellow-900" />
                  </div>
                  <h2 className="text-xl font-semibold text-white">
                    Google Gemini API
                  </h2>
                </div>
                <input
                  type="password"
                  value={state.apiKey}
                  onChange={(e) =>
                    setState((prev) => ({ ...prev, apiKey: e.target.value }))
                  }
                  placeholder="Enter your Gemini API key (AIza...)"
                  className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all duration-200"
                  aria-label="API Key"
                />
                <p className="text-sm text-purple-200 mt-2">
                  Get your free API key from{" "}
                  <a
                    href="https://makersuite.google.com/app/apikey"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-purple-300 hover:text-purple-100 underline transition-colors"
                  >
                    Google AI Studio
                  </a>
                </p>
              </section>

              {/* Upload Section */}
              <section className="bg-white/10 backdrop-blur-lg rounded-3xl p-6 md:p-8 border border-white/20 shadow-2xl">
                <div
                  className="border-3 border-dashed border-white/30 rounded-2xl p-8 md:p-12 text-center transition-all duration-300 cursor-pointer hover:border-purple-400 hover:bg-white/5 group"
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onClick={() => fileInputRef.current?.click()}
                  role="button"
                  tabIndex={0}
                  aria-label="Upload documents"
                >
                  <div className="w-16 h-16 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-200">
                    <Upload className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl md:text-2xl font-semibold text-white mb-2">
                    Upload Your Documents
                  </h3>
                  <p className="text-purple-200 mb-4">
                    Drop files here or click to browse
                  </p>
                  <p className="text-sm text-purple-300">
                    Supports PDF, DOC, DOCX, TXT, PPT, PPTX
                  </p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept=".pdf,.doc,.docx,.txt,.ppt,.pptx"
                    onChange={handleFileSelect}
                    className="sr-only"
                    aria-label="File input"
                  />
                </div>

                {/* File List */}
                {state.uploadedFiles.length > 0 && (
                  <div className="mt-6 space-y-3">
                    {state.uploadedFiles.map((file, index) => (
                      <div
                        key={`${file.name}-${index}`}
                        className="flex items-center justify-between bg-white/20 rounded-xl p-4 group hover:bg-white/30 transition-colors duration-200"
                      >
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <div className="w-10 h-10 bg-purple-400 rounded-lg flex items-center justify-center flex-shrink-0">
                            <FileText className="w-5 h-5 text-white" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-white font-medium truncate">
                              {file.name}
                            </p>
                            <p className="text-purple-200 text-sm">
                              {formatFileSize(file.size)}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => removeFile(index)}
                          className="px-3 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors duration-200 opacity-0 group-hover:opacity-100 flex-shrink-0 ml-4"
                          aria-label={`Remove ${file.name}`}
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </section>

              {/* Settings Panel */}
              <section className="bg-white/10 backdrop-blur-lg rounded-3xl p-6 md:p-8 border border-white/20 shadow-2xl">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 bg-green-400 rounded-lg flex items-center justify-center">
                    <Settings className="w-5 h-5 text-green-900" />
                  </div>
                  <h2 className="text-xl font-semibold text-white">
                    Quiz Settings
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div>
                    <label
                      htmlFor="questionCount"
                      className="block text-sm font-medium text-purple-200 mb-2"
                    >
                      Questions
                    </label>
                    <select
                      id="questionCount"
                      value={state.quizSettings.questionCount}
                      onChange={(e) =>
                        updateQuizSettings(
                          "questionCount",
                          parseInt(e.target.value)
                        )
                      }
                      className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-400 transition-all"
                    >
                      <option value={5} className="text-gray-900">
                        5 Questions
                      </option>
                      <option value={10} className="text-gray-900">
                        10 Questions
                      </option>
                      <option value={15} className="text-gray-900">
                        15 Questions
                      </option>
                      <option value={20} className="text-gray-900">
                        20 Questions
                      </option>
                      <option value={30} className="text-gray-900">
                        30 Questions
                      </option>
                      <option value={40} className="text-gray-900">
                        40 Questions
                      </option>
                      <option value={50} className="text-gray-900">
                        50 Questions
                      </option>
                      <option value={60} className="text-gray-900">
                        60 Questions
                      </option>
                      <option value={70} className="text-gray-900">
                        70 Questions
                      </option>
                      <option value={80} className="text-gray-900">
                        80 Questions
                      </option>
                      <option value={90} className="text-gray-900">
                        90 Questions
                      </option>
                      <option value={100} className="text-gray-900">
                        100 Questions
                      </option>
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor="difficulty"
                      className="block text-sm font-medium text-purple-200 mb-2"
                    >
                      Difficulty
                    </label>
                    <select
                      id="difficulty"
                      value={state.quizSettings.difficulty}
                      onChange={(e) =>
                        updateQuizSettings(
                          "difficulty",
                          e.target.value as QuizSettings["difficulty"]
                        )
                      }
                      className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-400 transition-all"
                    >
                      <option value="easy" className="text-gray-900">
                        Easy
                      </option>
                      <option value="medium" className="text-gray-900">
                        Medium
                      </option>
                      <option value="hard" className="text-gray-900">
                        Hard
                      </option>
                      <option value="mixed" className="text-gray-900">
                        Mixed
                      </option>
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor="questionType"
                      className="block text-sm font-medium text-purple-200 mb-2"
                    >
                      Question Type
                    </label>
                    <select
                      id="questionType"
                      value={state.quizSettings.questionType}
                      onChange={(e) =>
                        updateQuizSettings(
                          "questionType",
                          e.target.value as QuizSettings["questionType"]
                        )
                      }
                      className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-400 transition-all"
                    >
                      <option value="multiple_choice" className="text-gray-900">
                        Multiple Choice
                      </option>
                      <option value="true_false" className="text-gray-900">
                        True/False
                      </option>
                      <option value="mixed" className="text-gray-900">
                        Mixed Types
                      </option>
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor="focusArea"
                      className="block text-sm font-medium text-purple-200 mb-2"
                    >
                      Focus Area
                    </label>
                    <input
                      id="focusArea"
                      type="text"
                      value={state.quizSettings.focusArea}
                      onChange={(e) =>
                        updateQuizSettings("focusArea", e.target.value)
                      }
                      placeholder="e.g., key concepts"
                      className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-purple-400 transition-all"
                    />
                  </div>
                </div>
              </section>

              {/* Generate Button */}
              <div className="text-center">
                <button
                  onClick={generateQuiz}
                  disabled={
                    state.uploadedFiles.length === 0 ||
                    !state.apiKey.trim() ||
                    state.isLoading
                  }
                  className="px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-2xl shadow-lg disabled:opacity-50 disabled:cursor-not-allowed hover:from-purple-600 hover:to-pink-600 transform hover:scale-105 transition-all duration-200 text-lg min-w-[200px]"
                  aria-label="Generate quiz from uploaded documents"
                >
                  {state.isLoading ? (
                    <div className="flex flex-col items-center justify-center gap-2">
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Generating...
                      </div>
                      {state.loadingMessage && (
                        <div className="text-sm text-purple-200 mt-1">
                          {state.loadingMessage}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-2">
                      <Zap className="w-5 h-5" />
                      Generate Quiz
                    </div>
                  )}
                </button>
              </div>
            </div>
          ) : (
            /* Quiz Interface */
            <section className="bg-white/10 backdrop-blur-lg rounded-3xl p-6 md:p-8 border border-white/20 shadow-2xl">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white font-bold text-lg">
                    {state.currentQuestionIndex + 1}
                  </div>
                  <div>
                    <h2 className="text-xl md:text-2xl font-bold text-white">
                      Question {state.currentQuestionIndex + 1}
                    </h2>
                    <p className="text-purple-200">
                      of {state.currentQuiz.questions.length}
                      {state.isGeneratingMore && state.targetQuestionCount > state.currentQuiz.questions.length && (
                        <span className="text-yellow-300"> (target: {state.targetQuestionCount})</span>
                      )}
                    </p>
                  </div>
                </div>
                <button
                  onClick={resetQuiz}
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
                      ((state.currentQuestionIndex + 1) /
                        state.currentQuiz.questions.length) *
                      100
                    }%`,
                  }}
                  role="progressbar"
                  aria-valuenow={state.currentQuestionIndex + 1}
                  aria-valuemax={state.currentQuiz.questions.length}
                />
              </div>

              {/* Progressive Loading Indicator */}
              {state.isGeneratingMore && (
                <div className="mb-6 p-3 bg-yellow-500/20 border border-yellow-400/50 rounded-lg">
                  <div className="flex items-center gap-2 text-yellow-200">
                    <div className="w-4 h-4 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin" />
                    <span className="text-sm font-medium">
                      {state.loadingMessage || "Generating more questions in background..."}
                    </span>
                  </div>
                  <div className="mt-2 text-xs text-yellow-100">
                    You can continue with the current questions while more are being generated
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
                      // Base button styling
                      let buttonClass =
                        "w-full p-4 text-left border-2 rounded-xl transition-all duration-300 transform ";

                      // Icons for correct/incorrect
                      let icon = null;

                      if (state.showResult) {
                        // After answer is revealed
                        if (index === currentQuestion.correct) {
                          // Correct answer - always green
                          buttonClass +=
                            "bg-green-500/20 border-green-400 text-green-100 shadow-lg shadow-green-500/20 ";
                          icon = (
                            <CheckCircle className="w-5 h-5 text-green-400" />
                          );
                        } else if (state.selectedAnswer === index) {
                          // User's wrong answer - red
                          buttonClass +=
                            "bg-red-500/20 border-red-400 text-red-100 shadow-lg shadow-red-500/20 ";
                          icon = <XCircle className="w-5 h-5 text-red-400" />;
                        } else {
                          // Other options - dimmed
                          buttonClass +=
                            "bg-white/5 border-white/20 text-white/60 ";
                        }
                      } else {
                        // Before answer is revealed
                        if (state.selectedAnswer === index) {
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
                          onClick={() => selectAnswer(index)}
                          className={buttonClass}
                          disabled={state.showResult}
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
                            {icon && (
                              <div className="flex-shrink-0">{icon}</div>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Explanation */}
              {state.showResult && currentQuestion && (
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
                      {state.selectedAnswer === currentQuestion.correct && (
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
                  onClick={previousQuestion}
                  disabled={state.currentQuestionIndex === 0}
                  className="px-6 py-3 bg-white/20 text-white rounded-xl hover:bg-white/30 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 flex items-center justify-center gap-2 order-2 sm:order-1"
                  aria-label="Previous question"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Previous
                </button>

                <div className="text-white/60 text-sm text-center order-1 sm:order-2">
                  {state.userAnswers.filter((a) => a !== null).length} of{" "}
                  {state.currentQuiz.questions.length} answered
                </div>

                <div className="flex gap-3 order-3">
                  <button
                    onClick={skipQuestion}
                    className="px-6 py-3 bg-white/10 text-white rounded-xl hover:bg-white/20 transition-colors duration-200 flex items-center justify-center gap-2"
                    aria-label="Skip question"
                  >
                    Skip
                  </button>
                  <button
                    onClick={nextQuestion}
                    disabled={state.selectedAnswer === null}
                    className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2"
                    aria-label={
                      state.currentQuestionIndex ===
                      state.currentQuiz.questions.length - 1
                        ? "Finish quiz"
                        : "Next question"
                    }
                  >
                    {state.currentQuestionIndex ===
                    state.currentQuiz.questions.length - 1
                      ? "Finish"
                      : "Next"}
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </nav>

              {/* Final results inline when quiz completed */}
              {state.quizComplete && (
                <div className="mt-8 bg-gradient-to-r from-green-500/20 to-blue-500/20 border-2 border-green-400/50 rounded-2xl p-8 text-white shadow-lg">
                  {(() => {
                    const total = state.currentQuiz!.questions.length;
                    const correct = state.userAnswers.reduce(
                      (count: number, answer, i) => {
                        const isCorrect =
                          answer === state.currentQuiz!.questions[i].correct;
                        return count + (isCorrect ? 1 : 0);
                      },
                      0
                    );
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
                          <div className={`${performanceColor}`}>
                            {performanceIcon}
                          </div>
                        </div>
                        <h3 className="text-3xl font-bold mb-2">
                          Quiz Complete!
                        </h3>
                        <div className="text-xl">
                          <span className="text-white/80">Your Score: </span>
                          <span
                            className={`font-bold text-2xl ${performanceColor}`}
                          >
                            {correct}/{total}
                          </span>
                          <span className="text-white/60 ml-2">
                            ({percent}%)
                          </span>
                        </div>

                        {/* Performance message */}
                        <div className="mt-4 p-4 bg-white/10 rounded-lg">
                          {percent >= 80 && (
                            <p className="text-green-200">
                              🎉 Excellent work! You&apos;ve mastered this
                              material.
                            </p>
                          )}
                          {percent >= 60 && percent < 80 && (
                            <p className="text-yellow-200">
                              👍 Good job! Consider reviewing the topics you
                              missed.
                            </p>
                          )}
                          {percent < 60 && (
                            <p className="text-red-200">
                              📚 Keep studying! Review the material and try
                              again.
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })()}
                </div>
              )}
            </section>
          )}
        </div>
      </div>
    </>
  );
}
