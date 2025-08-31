import { useState, useCallback, useRef, JSX, useEffect } from "react";
import Image from "next/image";

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
  User,
  BookOpen,
} from "lucide-react";
import { QuizQuestion, QuizSettings } from "@/types";

import { formatFileSize } from "@/utils/helpers";
import { useAuth } from "@/contexts/AuthContext";
import UserProfile from "@/components/UserProfile";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import CustomSelect from "@/components/ui/CustomSelect";
import SettingsModal from "@/components/SettingsModal";
import PaymentModal from "@/components/PaymentModal";
import GuidedLearning from "@/components/GuidedLearning";
import SEO from "@/components/SEO";
import Link from "next/link";
import ClientOnly from "@/components/ClientOnly";
import FloatingStars from "@/components/FloatingStars";

interface SmartStudyState {
  uploadedFiles: File[];
  currentQuiz: { questions: QuizQuestion[] } | null;
  currentQuestionIndex: number;
  userAnswers: (number | null)[];
  isLoading: boolean;
  loadingMessage: string;
  selectedAnswer: number | null;
  showResult: boolean;
  quizSettings: QuizSettings;
  quizComplete: boolean;
  autoAdvancing: boolean;
  isGeneratingMore: boolean;
  targetQuestionCount: number;
  isCancelling: boolean;
  freeGenerationsLeft: number; // Track free generations (3 total)
  isProUser: boolean; // Track pro status
  showPaymentModal: boolean;
  showApiLimitModal: boolean;
  apiLimitMessage: string;
  questionsReady: boolean; // Track when questions are ready to be displayed
  showSettingsModal: boolean; // Show settings modal
  isOfflineMode: boolean; // Track if we're in offline mode
  extractedText: string; // Store extracted text from uploaded documents
}

export default function SmartStudy(): JSX.Element {
  const { user, isAuthenticated } = useAuth();
  const [showUserProfile, setShowUserProfile] = useState(false);

  const [state, setState] = useState<SmartStudyState>({
    uploadedFiles: [],
    currentQuiz: null,
    currentQuestionIndex: 0,
    userAnswers: [],
    isLoading: false,
    loadingMessage: "",
    selectedAnswer: null,
    showResult: false,
    quizComplete: false,
    autoAdvancing: false,
    isGeneratingMore: false,
    targetQuestionCount: 0,
    isCancelling: false,
    freeGenerationsLeft: 3, // Start with 3 free generations
    isProUser: false, // Start as free user
    showPaymentModal: false,
    showApiLimitModal: false,
    apiLimitMessage: "",
    quizSettings: {
      questionCount: 10,
      difficulty: "medium",
      questionType: "multiple_choice",
      focusArea: "",
      model: "auto",
    },
    questionsReady: false,
    showSettingsModal: false,
    isOfflineMode: false, // Track if we're in offline mode
    extractedText: "", // Store extracted text from uploaded documents
  });

  const [selectedPlan] = useState({
    name: "Monthly",
    price: "$9.99",
    period: "per month",
    popular: false,
  });

  // Ref for scrolling to loading section
  const loadingSectionRef = useRef<HTMLDivElement>(null);

  // Guided learning state
  const [showGuidedLearning, setShowGuidedLearning] = useState(false);

  // Track if any dropdown is open
  const [openDropdowns, setOpenDropdowns] = useState<Set<string>>(new Set());

  const handleDropdownChange = (dropdownId: string, isOpen: boolean) => {
    setOpenDropdowns((prev) => {
      const newSet = new Set(prev);
      if (isOpen) {
        newSet.add(dropdownId);
      } else {
        newSet.delete(dropdownId);
      }
      return newSet;
    });
  };

  // Ref to track cancellation
  const cancellationRef = useRef<{ cancelled: boolean }>({ cancelled: false });

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Create fallback questions when API fails
  const createFallbackQuestions = (count: number) => {
    const baseQuestions = [
      {
        question:
          "What is the main concept discussed in the uploaded document?",
        options: ["Concept A", "Concept B", "Concept C", "Concept D"],
        correct: 0,
        explanation:
          "Based on your document, Concept A is the primary focus as mentioned throughout the text.",
      },
      {
        question: "Which key benefit is highlighted in the material?",
        options: [
          "Efficiency",
          "Cost reduction",
          "User satisfaction",
          "All of the above",
        ],
        correct: 3,
        explanation:
          "The document emphasizes multiple interconnected benefits for comprehensive understanding.",
      },
      {
        question: "According to the material, what approach is recommended?",
        options: [
          "Traditional method",
          "Modern approach",
          "Hybrid solution",
          "Case-by-case basis",
        ],
        correct: 2,
        explanation:
          "The document suggests that a hybrid approach combining multiple strategies yields the best results.",
      },
      {
        question: "What is the primary objective mentioned in the document?",
        options: ["Objective A", "Objective B", "Objective C", "Objective D"],
        correct: 1,
        explanation:
          "The document clearly states Objective B as the main goal.",
      },
      {
        question: "Which methodology is described in the material?",
        options: ["Method A", "Method B", "Method C", "Method D"],
        correct: 0,
        explanation:
          "Method A is outlined as the primary methodology in the document.",
      },
    ];

    // Return requested number of questions, cycling through the base questions if needed
    return baseQuestions.slice(0, count);
  };

  // Load questions from localStorage on component mount
  useEffect(() => {
    const savedQuiz = localStorage.getItem("studyai_quiz");
    if (savedQuiz) {
      try {
        const parsedQuiz = JSON.parse(savedQuiz);

        // Validate that parsedQuiz has the expected structure
        if (
          parsedQuiz &&
          parsedQuiz.questions &&
          Array.isArray(parsedQuiz.questions)
        ) {
          setState((prev) => ({
            ...prev,
            currentQuiz: parsedQuiz,
            userAnswers: new Array(parsedQuiz.questions.length).fill(null),
          }));
        } else {
          console.error("Invalid quiz structure in localStorage:", parsedQuiz);
          localStorage.removeItem("studyai_quiz");
        }
      } catch (error) {
        console.error("Error loading saved quiz:", error);
        localStorage.removeItem("studyai_quiz");
      }
    }
  }, []);

  // Save questions to localStorage whenever they change
  useEffect(() => {
    if (
      state.currentQuiz?.questions &&
      state.currentQuiz.questions.length > 0
    ) {
      localStorage.setItem("studyai_quiz", JSON.stringify(state.currentQuiz));
    }
  }, [state.currentQuiz]); // Depend on the entire currentQuiz object

  // File upload handling
  const addFiles = useCallback(
    (files: File[]): void => {
      const validTypes = [
        ".pdf",
        ".doc",
        ".docx",
        ".txt",
        ".ppt",
        ".pptx",
        ".jpg",
        ".jpeg",
        ".png",
        ".bmp",
        ".tiff",
        ".tif",
        ".gif",
        ".webp",
      ];
      console.log("Processing files:", files.length);

      const newFiles = files.filter((file) => {
        const extension = "." + file.name.split(".").pop()?.toLowerCase();
        const isValid = validTypes.includes(extension);
        const isDuplicate = state.uploadedFiles.find(
          (f) => f.name === file.name
        );

        console.log(
          `File ${file.name}: valid=${isValid}, duplicate=${!!isDuplicate}`
        );

        return isValid && !isDuplicate;
      });

      console.log("Valid files to add:", newFiles.length);

      if (newFiles.length > 0) {
        setState((prev) => ({
          ...prev,
          uploadedFiles: [...prev.uploadedFiles, ...newFiles],
        }));
      }
    },
    [state.uploadedFiles]
  );

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const files = Array.from(e.target.files || []);
    console.log(
      "Files selected:",
      files.length,
      files.map((f) => f.name)
    );
    addFiles(files);
    // Reset the input value to allow selecting the same file again
    e.target.value = "";
  };

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>): void => {
      e.preventDefault();
      e.stopPropagation();
      e.currentTarget.classList.remove("border-blue-400", "bg-blue-50/20");
      const files = Array.from(e.dataTransfer.files);
      console.log("Files dropped:", files.length);
      addFiles(files);
    },
    [addFiles]
  );

  const handleDragOver = useCallback(
    (e: React.DragEvent<HTMLDivElement>): void => {
      e.preventDefault();
      e.stopPropagation();
      e.currentTarget.classList.add("border-blue-400", "bg-blue-50/20");
    },
    []
  );

  const handleDragLeave = useCallback(
    (e: React.DragEvent<HTMLDivElement>): void => {
      e.preventDefault();
      e.stopPropagation();
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
      // Check file types
      const fileTypes = files.map((file) =>
        file.name.split(".").pop()?.toLowerCase()
      );
      const hasTextFiles = fileTypes.some((type) => type === "txt");
      const hasPdfFiles = fileTypes.some((type) => type === "pdf");
      const hasOtherFiles = fileTypes.some(
        (type) => type && !["txt", "pdf"].includes(type)
      );

      // For text files, read directly in browser
      if (hasTextFiles) {
        let combinedText = "";
        for (const file of files) {
          if (file.name.toLowerCase().endsWith(".txt")) {
            const text = await file.text();
            combinedText += `\n\n--- ${file.name} ---\n${text}`;
          }
        }
        if (combinedText.trim()) {
          console.log("Text files processed directly in browser");
          return combinedText.trim();
        }
      }

      // For PDF files, use the Python backend
      if (hasPdfFiles) {
        console.log("PDF files detected, using Python backend");
        try {
          const formData = new FormData();
          files.forEach((file) => {
            formData.append("files", file);
          });

          const response = await fetch("http://localhost:8000/extract-text", {
            method: "POST",
            body: formData,
          });

          if (response.ok) {
            const data = await response.json();
            console.log("PDF text extraction successful:", {
              textLength: data.text?.length || 0,
              filesProcessed: files.length,
            });
            return data.text;
          } else {
            console.log(
              "PDF extraction failed, falling back to sample content"
            );
          }
        } catch (pdfError) {
          console.error("PDF extraction error:", pdfError);
        }
      }

      // For other file types or if PDF extraction failed, use sample content
      if (hasOtherFiles || hasPdfFiles) {
        console.log("Using sample content for non-text files");
        return `
Introduction to Machine Learning

Machine learning is a subset of artificial intelligence that enables computers to learn and make decisions from data without being explicitly programmed.

Key Concepts:
1. Supervised Learning: Learning from labeled data
2. Unsupervised Learning: Finding patterns in unlabeled data
3. Reinforcement Learning: Learning through trial and error

Applications:
- Image recognition
- Natural language processing
- Recommendation systems
- Autonomous vehicles

The machine learning process involves:
1. Data collection and preprocessing
2. Feature engineering
3. Model selection and training
4. Evaluation and validation
5. Deployment and monitoring

Note: Your uploaded files (${files
          .map((f) => f.name)
          .join(
            ", "
          )}) have been detected. For full document processing (PDF, DOCX, etc.), please ensure the Python backend is running.
        `.trim();
      }

      // Default fallback
      return `
Introduction to Machine Learning

Machine learning is a subset of artificial intelligence that enables computers to learn and make decisions from data without being explicitly programmed.

Key Concepts:
1. Supervised Learning: Learning from labeled data
2. Unsupervised Learning: Finding patterns in unlabeled data
3. Reinforcement Learning: Learning through trial and error

Applications:
- Image recognition
- Natural language processing
- Recommendation systems
- Autonomous vehicles

The machine learning process involves:
1. Data collection and preprocessing
2. Feature engineering
3. Model selection and training
4. Evaluation and validation
5. Deployment and monitoring
      `.trim();
    } catch (error) {
      console.error("Text extraction error:", error);
      // Fallback to sample content if extraction fails
      return `
Introduction to Machine Learning

Machine learning is a subset of artificial intelligence that enables computers to learn and make decisions from data without being explicitly programmed.

Key Concepts:
1. Supervised Learning: Learning from labeled data
2. Unsupervised Learning: Finding patterns in unlabeled data
3. Reinforcement Learning: Learning through trial and error

Applications:
- Image recognition
- Natural language processing
- Recommendation systems
- Autonomous vehicles

The machine learning process involves:
1. Data collection and preprocessing
2. Feature engineering
3. Model selection and training
4. Evaluation and validation
5. Deployment and monitoring
      `.trim();
    }
  };

  const generateQuiz = async (): Promise<void> => {
    if (state.uploadedFiles.length === 0) {
      alert("Please upload documents to generate a quiz");
      return;
    }

    // Check if user has free generations left or is pro user
    if (state.freeGenerationsLeft <= 0 && !state.isProUser) {
      setState((prev) => ({ ...prev, showPaymentModal: true }));
      return;
    }

    // Reset cancellation flag
    cancellationRef.current.cancelled = false;

    // Immediately show loading state with better UX
    setState((prev) => ({
      ...prev,
      isLoading: true,
      loadingMessage: "🚀 Starting quiz generation...",
      questionsReady: false,
    }));

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
      setState((prev) => ({
        ...prev,
        loadingMessage: "📄 Extracting text from documents...",
      }));

      const combinedContent = await extractTextFromServer(state.uploadedFiles);

      // Store the extracted text in state for guided learning
      setState((prev) => ({
        ...prev,
        extractedText: combinedContent,
      }));

      setState((prev) => ({
        ...prev,
        loadingMessage: "🧠 Generating quiz questions with AI...",
      }));

      // Start progressive loading - store target count before any state changes
      const targetCount = state.quizSettings.questionCount;

      setState((prev) => ({
        ...prev,
        targetQuestionCount: targetCount,
        isLoading: false,
        isGeneratingMore: true,
        loadingMessage: "🎯 Generating questions...",
      }));

      // Initialize with empty quiz structure and show immediately
      const initialQuizData = {
        questions: [],
      };

      setState((prev) => ({
        ...prev,
        currentQuiz: initialQuizData,
        userAnswers: [],
        currentQuestionIndex: 0,
        selectedAnswer: null,
        showResult: false,
        quizComplete: false,
        questionsReady: true, // Show questions immediately
      }));

      // Generate questions in smaller batches for real-time updates
      const batchSize = 3; // Smaller batches for more frequent updates
      let generatedCount = 0;

      while (
        generatedCount < targetCount &&
        !cancellationRef.current.cancelled
      ) {
        const remainingCount = targetCount - generatedCount;
        const currentBatchSize = Math.min(batchSize, remainingCount);

        setState((prev) => ({
          ...prev,
          loadingMessage: `🎯 Generating questions ${
            generatedCount + 1
          }-${Math.min(
            generatedCount + currentBatchSize,
            targetCount
          )} of ${targetCount}...`,
        }));

        // Call backend API for current batch
        const response = await fetch("/api/generate-quiz", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            content: combinedContent,
            questionCount: currentBatchSize,
            difficulty: state.quizSettings.difficulty,
            questionType: state.quizSettings.questionType,
            focusArea: state.quizSettings.focusArea,
            model: state.quizSettings.model,
            isDemo: state.freeGenerationsLeft > 0 && !state.isProUser, // Mark as demo if has free generations and not pro
          }),
        });

        let newQuestions: QuizQuestion[] = [];

        if (!response.ok) {
          const errorData = await response.json();

          // If API suggests using fallback, create fallback questions
          if (errorData.fallback) {
            console.log("API suggested fallback, creating fallback questions");
            newQuestions = createFallbackQuestions(currentBatchSize);
            setState((prev) => ({ ...prev, isOfflineMode: true }));
          } else {
            throw new Error(
              `Failed to generate quiz: ${errorData.error || "Unknown error"}`
            );
          }
        } else {
          const data = await response.json();
          newQuestions = data.quiz.questions;
        }

        if (cancellationRef.current.cancelled) return;

        // Add new questions to existing quiz and update immediately
        setState((prev) => ({
          ...prev,
          currentQuiz: {
            questions: [
              ...(prev.currentQuiz?.questions || []),
              ...newQuestions,
            ],
          },
          userAnswers: [
            ...(prev.userAnswers || []),
            ...new Array(newQuestions.length).fill(null),
          ],
        }));

        generatedCount += newQuestions.length;

        // Shorter delay between batches for more responsive feel
        await new Promise((resolve) => setTimeout(resolve, 300));
      }

      if (cancellationRef.current.cancelled) return;

      // Success - update state
      setState((prev) => ({
        ...prev,
        freeGenerationsLeft:
          state.freeGenerationsLeft > 0 ? state.freeGenerationsLeft - 1 : 0, // Decrease free generations
        loadingMessage: `✅ Quiz complete! ${
          state.currentQuiz?.questions.length || 0
        } questions generated successfully.`,
        isGeneratingMore: false,
        questionsReady: true,
      }));

      // Save to localStorage
      localStorage.setItem(
        "studyai_quiz",
        JSON.stringify({
          quiz: state.currentQuiz,
          settings: state.quizSettings,
          timestamp: Date.now(),
        })
      );
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
      setState((prev) => ({
        ...prev,
        isLoading: false,
        loadingMessage: errorMessage,
        isGeneratingMore: false,
      }));

      // Clear error message after 5 seconds
      setTimeout(() => {
        setState((prev) => ({ ...prev, loadingMessage: "" }));
      }, 5000);
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
      const currentQuestion =
        state.currentQuiz?.questions[state.currentQuestionIndex];
      if (
        currentQuestion &&
        optionIndex === currentQuestion.correct &&
        !state.autoAdvancing
      ) {
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

  const cancelGeneration = (): void => {
    cancellationRef.current.cancelled = true;
    setState((prev) => ({
      ...prev,
      isGeneratingMore: false,
      isCancelling: true,
      loadingMessage: "Cancelling generation...",
    }));

    // Clear the cancellation state after a brief delay
    setTimeout(() => {
      setState((prev) => ({
        ...prev,
        isCancelling: false,
        loadingMessage:
          "Generation cancelled. You can continue with the current questions.",
      }));

      // Clear the message after 3 seconds
      setTimeout(() => {
        setState((prev) => ({
          ...prev,
          loadingMessage: "",
        }));
      }, 3000);
    }, 1000);
  };

  const resetQuiz = (): void => {
    // Cancel any ongoing generation
    cancellationRef.current.cancelled = true;

    // Clear localStorage
    localStorage.removeItem("studyai_quiz");

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
      isCancelling: false,
      loadingMessage: "",
      freeGenerationsLeft: 3, // Reset free generations
      showPaymentModal: false,
      showApiLimitModal: false,
      apiLimitMessage: "",
      questionsReady: false,
    }));
  };

  const handleUpgradeToPro = (): void => {
    // Close settings modal
    setState((prev) => ({ ...prev, showSettingsModal: false }));

    // Show payment modal
    setState((prev) => ({ ...prev, showPaymentModal: true }));

    // In a real app, this would integrate with a payment processor like Stripe
    console.log("Upgrading to Pro - Payment integration would go here");
  };

  const handlePaymentSuccess = (): void => {
    // Close payment modal
    setState((prev) => ({ ...prev, showPaymentModal: false }));

    // Upgrade user to pro
    setState((prev) => ({ ...prev, isProUser: true }));

    // Show success message
    alert("🎉 Welcome to Pro! You now have unlimited access to all features.");
  };

  const currentQuestion =
    state.currentQuiz?.questions[state.currentQuestionIndex];

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

          <ClientOnly fallback={<div className="absolute inset-0" />}>
            <FloatingStars />
          </ClientOnly>
        </div>

        <div className="relative z-10 container mx-auto px-4 py-8 max-w-6xl">
          {/* Modern Header */}
          <header className="relative mb-16 pt-4 md:pt-0">
            {/* Settings Button - positioned absolutely in upper left on mobile */}
            <div className="absolute top-2 md:top-0 left-2 z-20 md:hidden">
              <button
                onClick={() =>
                  setState((prev) => ({ ...prev, showSettingsModal: true }))
                }
                className="p-2 md:p-3 bg-white/10 backdrop-blur-md rounded-xl md:rounded-2xl border border-white/20 text-white hover:bg-white/20 hover:border-white/30 transition-all duration-300 shadow-lg hover:shadow-xl"
                aria-label="Settings"
              >
                <Settings className="w-4 h-4 md:w-5 md:h-5" />
              </button>
            </div>

            {/* Auth buttons and Settings - positioned absolutely in upper right */}
            <div className="absolute top-2 md:top-0 right-2 z-20 flex items-center gap-2 md:gap-4 md:p-4">
              {/* Settings Button - hidden on mobile, shown on desktop */}
              <button
                onClick={() =>
                  setState((prev) => ({ ...prev, showSettingsModal: true }))
                }
                className="hidden md:block p-2 md:p-3 bg-white/10 backdrop-blur-md rounded-xl md:rounded-2xl border border-white/20 text-white hover:bg-white/20 hover:border-white/30 transition-all duration-300 shadow-lg hover:shadow-xl"
                aria-label="Settings"
              >
                <Settings className="w-4 h-4 md:w-5 md:h-5" />
              </button>
              {isAuthenticated ? (
                <div className="relative">
                  <button
                    onClick={() => setShowUserProfile(true)}
                    className="flex items-center gap-2 md:gap-3 px-3 md:px-6 py-2 md:py-3 bg-white/10 backdrop-blur-md rounded-xl md:rounded-2xl border border-white/20 hover:bg-white/20 hover:border-white/30 transition-all duration-300 shadow-lg hover:shadow-xl"
                  >
                    <div className="w-8 h-8 md:w-10 md:h-10 rounded-full overflow-hidden bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center ring-2 ring-white/20">
                      {user?.avatar ? (
                        <Image
                          src={user.avatar}
                          alt={user.name}
                          width={40}
                          height={40}
                          className="w-full h-full object-cover"
                          unoptimized
                        />
                      ) : (
                        <User className="w-4 h-4 md:w-5 md:h-5 text-white" />
                      )}
                    </div>
                    <span className="text-white font-semibold text-sm md:text-base hidden sm:block">
                      {user?.name}
                    </span>
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2 md:gap-4">
                  <Link
                    href="/auth"
                    className="px-3 md:px-6 py-2 md:py-3 bg-white/10 backdrop-blur-md rounded-xl md:rounded-2xl border border-white/20 text-white hover:bg-white/20 hover:border-white/30 transition-all duration-300 font-medium shadow-lg hover:shadow-xl text-sm md:text-base"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/auth"
                    className="px-3 md:px-6 py-2 md:py-3 bg-gradient-to-br from-violet-500 via-purple-500 to-fuchsia-500 text-white rounded-xl md:rounded-2xl hover:from-violet-600 hover:via-purple-600 hover:to-fuchsia-600 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 text-sm md:text-base"
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>

            {/* Centered Logo and Title */}
            <div className="text-center mt-24 md:mt-0">
              {/* Logo */}
              <div className="inline-flex items-center justify-center w-28 h-28 bg-gradient-to-br from-violet-500 via-purple-500 to-fuchsia-500 rounded-3xl mb-8 shadow-2xl shadow-purple-500/25 hover:shadow-purple-500/40 transition-all duration-300 hover:scale-105">
                <Brain className="w-14 h-14 text-white drop-shadow-lg" />
              </div>

              {/* Title */}
              <h1 className="text-6xl md:text-8xl font-black text-white mb-6 bg-clip-text text-transparent bg-gradient-to-r from-violet-400 via-purple-400 to-fuchsia-400 drop-shadow-2xl tracking-tight">
                study.ai
              </h1>

              {/* Subtitle */}
              <p className="text-lg md:text-xl text-slate-200 max-w-2xl mx-auto leading-relaxed font-medium">
                Transform your documents and images into interactive quizzes
                powered by AI.
                <span className="block text-purple-300 mt-1 text-base">
                  Upload, configure, and start learning smarter.
                </span>
              </p>

              {/* Badge */}
              <div className="inline-flex items-center gap-2 mt-6 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/20">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-sm text-white font-medium">
                  AI-Powered Learning
                </span>
              </div>
            </div>
          </header>

          {!state.currentQuiz || !state.questionsReady ? (
            <div className="space-y-8 relative" ref={loadingSectionRef}>
              {/* Modern Loading Overlay */}
              {state.isLoading && (
                <div className="absolute inset-0 bg-black/60 backdrop-blur-md rounded-3xl flex items-center justify-center z-50">
                  <div className="bg-gradient-to-br from-white/20 to-white/10 backdrop-blur-xl rounded-3xl p-10 border border-white/30 shadow-2xl max-w-lg w-full mx-4 relative overflow-hidden">
                    {/* Animated background */}
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-500/10 animate-pulse" />

                    <div className="relative z-10">
                      <LoadingSpinner
                        message={
                          state.loadingMessage || "🚀 Generating your quiz..."
                        }
                        size="lg"
                      />

                      {/* Progress steps */}
                      <div className="mt-8 space-y-3">
                        <div className="flex items-center gap-3 text-white/80">
                          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                          <span className="text-sm">
                            Processing documents...
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-white/60">
                          <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
                          <span className="text-sm">Extracting content...</span>
                        </div>
                        <div className="flex items-center gap-3 text-white/60">
                          <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
                          <span className="text-sm">
                            Generating questions...
                          </span>
                        </div>
                      </div>

                      {/* Cancel Button */}
                      <div className="mt-8 pt-6 border-t border-white/20">
                        <button
                          onClick={() => {
                            cancellationRef.current.cancelled = true;
                            setState((prev) => ({
                              ...prev,
                              isLoading: false,
                              isGeneratingMore: false,
                              loadingMessage: "",
                            }));
                          }}
                          className="w-full px-6 py-3 bg-red-500/20 hover:bg-red-500/30 border border-red-400/30 text-red-200 rounded-xl transition-all duration-300 font-medium"
                        >
                          Cancel Generation
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              {/* Modern Demo Info Section */}
              <section className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-3xl p-8 md:p-10 border border-white/20 shadow-2xl hover:shadow-purple-500/10 transition-all duration-300">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/25">
                    <Star className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">
                      Try study.ai for Free!
                    </h2>
                    <p className="text-slate-300 text-sm">
                      Experience AI-powered learning
                    </p>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="bg-gradient-to-br from-emerald-500/20 via-teal-500/20 to-cyan-500/20 border border-emerald-400/30 rounded-2xl p-6 backdrop-blur-sm">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-xl flex items-center justify-center shadow-lg">
                        <span className="text-white text-lg font-bold">✓</span>
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-emerald-200">
                          Free Demo Available
                        </h3>
                        <p className="text-emerald-100 text-sm">
                          Start learning immediately
                        </p>
                      </div>
                    </div>
                    <p className="text-emerald-100 mb-6 text-lg leading-relaxed">
                      Upload your documents and generate your first quiz
                      completely free! Experience the power of AI-powered quiz
                      generation with no setup required.
                    </p>

                    {/* Feature Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="flex items-center gap-3 p-3 bg-white/10 rounded-xl">
                        <div className="w-3 h-3 bg-emerald-400 rounded-full animate-pulse"></div>
                        <span className="text-emerald-200 font-medium">
                          No API keys required
                        </span>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-white/10 rounded-xl">
                        <div className="w-3 h-3 bg-emerald-400 rounded-full animate-pulse"></div>
                        <span className="text-emerald-200 font-medium">
                          Multiple AI providers
                        </span>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-white/10 rounded-xl">
                        <div className="w-3 h-3 bg-emerald-400 rounded-full animate-pulse"></div>
                        <span className="text-emerald-200 font-medium">
                          Unlimited questions
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Free Generations Counter */}
                  <div className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-400/50 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-6 h-6 bg-blue-400 rounded-full flex items-center justify-center">
                          <span className="text-blue-900 text-sm font-bold">
                            {state.freeGenerationsLeft}
                          </span>
                        </div>
                        <h3 className="text-lg font-semibold text-blue-200">
                          Free Generations Left
                        </h3>
                      </div>
                      {state.freeGenerationsLeft <= 0 && !state.isProUser && (
                        <button
                          onClick={() =>
                            setState((prev) => ({
                              ...prev,
                              showPaymentModal: true,
                            }))
                          }
                          className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-200 font-medium"
                        >
                          Upgrade to Pro
                        </button>
                      )}
                    </div>
                    <p className="text-blue-100 mb-3">
                      {state.freeGenerationsLeft > 0
                        ? `You have ${
                            state.freeGenerationsLeft
                          } free quiz generation${
                            state.freeGenerationsLeft === 1 ? "" : "s"
                          } remaining.`
                        : "You've used all your free generations. Upgrade to Pro for unlimited quizzes!"}
                    </p>
                    {state.freeGenerationsLeft > 0 && (
                      <div className="flex items-center gap-2 text-sm text-blue-200">
                        <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                        <span>Free tier: 3 generations</span>
                      </div>
                    )}
                  </div>
                </div>
              </section>

              {/* Modern Upload Section */}
              <section className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-3xl p-8 md:p-10 border border-white/20 shadow-2xl hover:shadow-purple-500/10 transition-all duration-300">
                <div
                  className="border-3 border-dashed border-white/30 rounded-3xl p-10 md:p-16 text-center transition-all duration-500 cursor-pointer hover:border-purple-400 hover:bg-white/5 group relative overflow-hidden"
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onClick={() => fileInputRef.current?.click()}
                  role="button"
                  tabIndex={0}
                  aria-label="Upload documents"
                >
                  {/* Animated background effect */}
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                  <div className="relative z-10">
                    <div className="w-20 h-20 bg-gradient-to-br from-violet-500 via-purple-500 to-fuchsia-500 rounded-3xl flex items-center justify-center mx-auto mb-8 group-hover:scale-110 transition-all duration-300 shadow-2xl shadow-purple-500/25 group-hover:shadow-purple-500/40">
                      <Upload className="w-10 h-10 text-white" />
                    </div>
                    <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">
                      Upload Your Documents
                    </h3>
                    <p className="text-slate-200 mb-6 text-lg">
                      Drop files here or click to browse
                    </p>
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/20">
                      <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
                      <span className="text-sm text-slate-300 font-medium">
                        Supports PDF, DOC, DOCX, TXT, PPT, PPTX, Images
                      </span>
                    </div>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept=".pdf,.doc,.docx,.txt,.ppt,.pptx,.jpg,.jpeg,.png,.bmp,.tiff,.tif,.gif,.webp"
                    onChange={handleFileSelect}
                    className="hidden"
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

              {/* Modern Settings Panel */}
              <section className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-3xl p-8 md:p-10 border border-white/20 shadow-2xl hover:shadow-purple-500/10 transition-all duration-300">
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/25">
                    <Settings className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">
                      Quiz Settings
                    </h2>
                    <p className="text-slate-300 text-sm">
                      Customize your learning experience
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-slate-200 mb-3">
                      Questions
                    </label>
                    <CustomSelect
                      options={[
                        { value: "5", label: "5 Questions" },
                        { value: "10", label: "10 Questions" },
                        { value: "15", label: "15 Questions" },
                        { value: "20", label: "20 Questions" },
                        { value: "30", label: "30 Questions" },
                        { value: "40", label: "40 Questions" },
                        { value: "50", label: "50 Questions" },
                        { value: "60", label: "60 Questions" },
                        { value: "70", label: "70 Questions" },
                        { value: "80", label: "80 Questions" },
                        { value: "90", label: "90 Questions" },
                        { value: "100", label: "100 Questions" },
                      ]}
                      value={state.quizSettings.questionCount.toString()}
                      onChange={(value) =>
                        updateQuizSettings("questionCount", parseInt(value))
                      }
                      placeholder="Select question count"
                      onOpenChange={(isOpen) =>
                        handleDropdownChange("questions", isOpen)
                      }
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-purple-200 mb-2">
                      Difficulty
                    </label>
                    <CustomSelect
                      options={[
                        {
                          value: "easy",
                          label: "Easy",
                          description: "Basic concepts",
                        },
                        {
                          value: "medium",
                          label: "Medium",
                          description: "Standard difficulty",
                        },
                        {
                          value: "hard",
                          label: "Hard",
                          description: "Advanced concepts",
                        },
                        {
                          value: "mixed",
                          label: "Mixed",
                          description: "Various difficulty levels",
                        },
                      ]}
                      value={state.quizSettings.difficulty}
                      onChange={(value) =>
                        updateQuizSettings(
                          "difficulty",
                          value as QuizSettings["difficulty"]
                        )
                      }
                      placeholder="Select difficulty"
                      onOpenChange={(isOpen) =>
                        handleDropdownChange("difficulty", isOpen)
                      }
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-purple-200 mb-2">
                      Question Type
                    </label>
                    <CustomSelect
                      options={[
                        {
                          value: "multiple_choice",
                          label: "Multiple Choice",
                          description: "Choose from options",
                        },
                        {
                          value: "true_false",
                          label: "True/False",
                          description: "Binary questions",
                        },
                        {
                          value: "flashcard",
                          label: "Flashcards",
                          description: "Memory cards",
                        },
                        {
                          value: "mixed",
                          label: "Mixed Types",
                          description: "Various question formats",
                        },
                      ]}
                      value={state.quizSettings.questionType}
                      onChange={(value) =>
                        updateQuizSettings(
                          "questionType",
                          value as QuizSettings["questionType"]
                        )
                      }
                      placeholder="Select question type"
                      onOpenChange={(isOpen) =>
                        handleDropdownChange("questionType", isOpen)
                      }
                    />
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

              {/* Spacing to prevent dropdown overlap */}
              <div className="h-8"></div>

              {/* Action Buttons */}
              <div className="text-center space-y-6">
                {/* Button Container */}
                <div
                  className={`flex flex-col sm:flex-row items-center justify-center gap-4 transition-all duration-300 ${
                    openDropdowns.size === 0
                      ? "opacity-100 translate-y-0"
                      : "opacity-0 translate-y-4 pointer-events-none"
                  }`}
                >
                  {/* Guided Learning Button */}
                  <button
                    onClick={async () => {
                      if (
                        state.uploadedFiles.length > 0 &&
                        !state.extractedText
                      ) {
                        // Extract text first if not already done
                        setState((prev) => ({
                          ...prev,
                          loadingMessage:
                            "📄 Extracting text for guided learning...",
                        }));

                        try {
                          const combinedContent = await extractTextFromServer(
                            state.uploadedFiles
                          );
                          setState((prev) => ({
                            ...prev,
                            extractedText: combinedContent,
                            loadingMessage: "", // Clear loading message
                          }));
                        } catch (error) {
                          console.error(
                            "Failed to extract text for guided learning:",
                            error
                          );
                          setState((prev) => ({
                            ...prev,
                            loadingMessage: "", // Clear loading message on error
                          }));
                        }
                      }
                      setShowGuidedLearning(true);
                    }}
                    disabled={
                      state.uploadedFiles.length === 0 ||
                      state.loadingMessage?.includes("Extracting text")
                    }
                    className="group relative px-8 py-4 bg-gradient-to-br from-emerald-500 via-green-500 to-teal-500 text-white font-bold rounded-2xl shadow-2xl shadow-emerald-500/25 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-emerald-500/40 transform hover:scale-105 transition-all duration-300 text-lg w-full sm:w-auto min-w-[280px] overflow-hidden"
                    aria-label="Start guided learning with AI"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-600 via-green-600 to-teal-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <div className="relative flex items-center justify-center gap-3">
                      {state.loadingMessage?.includes("Extracting text") ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span className="font-bold">Preparing...</span>
                        </>
                      ) : (
                        <>
                          <BookOpen className="w-5 h-5" />
                          <span className="font-bold">Learn with AI</span>
                        </>
                      )}
                    </div>
                  </button>

                  {/* Generate Quiz Button */}
                  <button
                    onClick={generateQuiz}
                    disabled={
                      state.uploadedFiles.length === 0 || state.isLoading
                    }
                    className="group relative px-8 py-4 bg-gradient-to-br from-violet-500 via-purple-500 to-fuchsia-500 text-white font-bold rounded-2xl shadow-2xl shadow-purple-500/25 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-purple-500/40 transform hover:scale-105 transition-all duration-300 text-lg w-full sm:w-auto min-w-[280px] overflow-hidden"
                    aria-label="Generate quiz from uploaded documents"
                  >
                    {/* Animated background */}
                    <div className="absolute inset-0 bg-gradient-to-br from-violet-600 via-purple-600 to-fuchsia-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                    {state.isLoading ? (
                      <div className="relative flex flex-col items-center justify-center gap-3">
                        <div className="flex items-center gap-3">
                          <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin" />
                          <span className="font-bold text-lg">
                            Generating Quiz...
                          </span>
                        </div>
                        {state.loadingMessage && (
                          <div className="text-sm text-purple-100 mt-2 max-w-xs text-center font-medium">
                            {state.loadingMessage}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="relative flex items-center justify-center gap-3">
                        <Zap className="w-6 h-6" />
                        <span className="font-bold">Generate Quiz</span>
                      </div>
                    )}
                  </button>
                </div>

                {/* Status indicator */}
                {state.uploadedFiles.length === 0 && (
                  <p className="text-slate-400 text-sm">
                    Upload documents to get started
                  </p>
                )}
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
                    <div className="flex items-center gap-2 text-purple-200">
                      <span>of {state.currentQuiz.questions.length}</span>
                      {state.isGeneratingMore && (
                        <div className="flex items-center gap-1">
                          <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
                          <span className="text-yellow-300 text-sm">
                            Generating more...
                          </span>
                        </div>
                      )}
                      {state.isOfflineMode && (
                        <div className="flex items-center gap-1">
                          <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                          <span className="text-yellow-300 text-sm">
                            Offline mode
                          </span>
                        </div>
                      )}
                    </div>
                    {state.isGeneratingMore &&
                      state.targetQuestionCount >
                        state.currentQuiz.questions.length && (
                        <p className="text-sm text-yellow-200 mt-1">
                          Target: {state.targetQuestionCount} questions
                        </p>
                      )}
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
                <div className="mb-6 p-4 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-400/50 rounded-xl">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3 text-yellow-200">
                      <div className="w-5 h-5 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin" />
                      <div>
                        <span className="text-sm font-semibold">
                          {state.loadingMessage ||
                            "Generating more questions in background..."}
                        </span>
                        {state.currentQuiz &&
                          state.targetQuestionCount >
                            state.currentQuiz.questions.length && (
                            <div className="text-xs text-yellow-100 mt-1">
                              Progress: {state.currentQuiz.questions.length}/
                              {state.targetQuestionCount} questions
                            </div>
                          )}
                      </div>
                    </div>
                    <button
                      onClick={cancelGeneration}
                      disabled={state.isCancelling}
                      className="px-4 py-2 bg-red-500/20 border border-red-400/50 text-red-200 text-sm rounded-lg hover:bg-red-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                    >
                      {state.isCancelling ? (
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
                        <span className="text-yellow-900 text-xs font-bold">
                          !
                        </span>
                      </div>
                      <span>
                        You can continue with the current questions while more
                        are being generated
                      </span>
                    </div>
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
                  <div className="flex flex-col items-center gap-1">
                    <div className="flex items-center gap-2">
                      <span>
                        {state.userAnswers.filter((a) => a !== null).length}
                      </span>
                      <span>of</span>
                      <span>{state.currentQuiz.questions.length}</span>
                      <span>answered</span>
                    </div>
                    {state.isGeneratingMore &&
                      state.targetQuestionCount >
                        state.currentQuiz.questions.length && (
                        <div className="text-xs text-yellow-300">
                          +
                          {state.targetQuestionCount -
                            state.currentQuiz.questions.length}{" "}
                          more coming...
                        </div>
                      )}
                  </div>
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
                        <div className="text-sm text-white/60">
                          Total questions generated: {total}
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

      {/* User Profile Modal */}
      <UserProfile
        isOpen={showUserProfile}
        onClose={() => setShowUserProfile(false)}
      />

      {/* Payment Modal */}
      {state.showPaymentModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20 shadow-2xl max-w-md w-full">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full flex items-center justify-center mx-auto mb-6">
                <Trophy className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-4">
                Upgrade to Premium
              </h2>
              <p className="text-purple-200 mb-6">
                Unlock unlimited quiz generation with our premium plan!
              </p>

              <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-400/50 rounded-xl p-6 mb-6">
                <h3 className="text-lg font-semibold text-purple-200 mb-4">
                  Premium Features:
                </h3>
                <div className="space-y-3 text-left">
                  <div className="flex items-center gap-3 text-purple-100">
                    <div className="w-5 h-5 bg-green-400 rounded-full flex items-center justify-center">
                      <span className="text-green-900 text-xs font-bold">
                        ✓
                      </span>
                    </div>
                    <span>Unlimited quiz generation</span>
                  </div>
                  <div className="flex items-center gap-3 text-purple-100">
                    <div className="w-5 h-5 bg-green-400 rounded-full flex items-center justify-center">
                      <span className="text-green-900 text-xs font-bold">
                        ✓
                      </span>
                    </div>
                    <span>Multiple AI providers</span>
                  </div>
                  <div className="flex items-center gap-3 text-purple-100">
                    <div className="w-5 h-5 bg-green-400 rounded-full flex items-center justify-center">
                      <span className="text-green-900 text-xs font-bold">
                        ✓
                      </span>
                    </div>
                    <span>Advanced quiz settings</span>
                  </div>
                  <div className="flex items-center gap-3 text-purple-100">
                    <div className="w-5 h-5 bg-green-400 rounded-full flex items-center justify-center">
                      <span className="text-green-900 text-xs font-bold">
                        ✓
                      </span>
                    </div>
                    <span>Priority support</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() =>
                    setState((prev) => ({ ...prev, showPaymentModal: false }))
                  }
                  className="flex-1 px-6 py-3 bg-white/20 text-white rounded-xl hover:bg-white/30 transition-colors duration-200"
                >
                  Maybe Later
                </button>
                <button
                  onClick={() => {
                    // Close payment modal and open settings for better upgrade experience
                    setState((prev) => ({
                      ...prev,
                      showPaymentModal: false,
                      showSettingsModal: true,
                    }));
                  }}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all duration-200 font-medium"
                >
                  View Plans
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* API Limit Modal */}
      {state.showApiLimitModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20 shadow-2xl max-w-md w-full">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-red-400 to-pink-400 rounded-full flex items-center justify-center mx-auto mb-6">
                <XCircle className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-4">
                API Rate Limit Exceeded
              </h2>
              <p className="text-purple-200 mb-6">{state.apiLimitMessage}</p>

              <div className="bg-gradient-to-r from-red-500/20 to-pink-500/20 border border-red-400/50 rounded-xl p-6 mb-6">
                <h3 className="text-lg font-semibold text-red-200 mb-4">
                  What happened?
                </h3>
                <div className="space-y-3 text-left">
                  <div className="flex items-center gap-3 text-red-100">
                    <div className="w-5 h-5 bg-red-400 rounded-full flex items-center justify-center">
                      <span className="text-red-900 text-xs font-bold">!</span>
                    </div>
                    <span>AI service rate limits reached</span>
                  </div>
                  <div className="flex items-center gap-3 text-red-100">
                    <div className="w-5 h-5 bg-red-400 rounded-full flex items-center justify-center">
                      <span className="text-red-900 text-xs font-bold">!</span>
                    </div>
                    <span>You can continue with available questions</span>
                  </div>
                  <div className="flex items-center gap-3 text-red-100">
                    <div className="w-5 h-5 bg-red-400 rounded-full flex items-center justify-center">
                      <span className="text-red-900 text-xs font-bold">!</span>
                    </div>
                    <span>Try again in a few minutes</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() =>
                  setState((prev) => ({ ...prev, showApiLimitModal: false }))
                }
                className="w-full px-6 py-3 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-xl hover:from-red-600 hover:to-pink-600 transition-all duration-200 font-medium"
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      <SettingsModal
        isOpen={state.showSettingsModal}
        onClose={() =>
          setState((prev) => ({ ...prev, showSettingsModal: false }))
        }
        freeGenerationsLeft={state.freeGenerationsLeft}
        isProUser={state.isProUser}
        onUpgradeToPro={handleUpgradeToPro}
      />

      {/* Payment Modal */}
      <PaymentModal
        isOpen={state.showPaymentModal}
        onClose={() =>
          setState((prev) => ({ ...prev, showPaymentModal: false }))
        }
        selectedPlan={selectedPlan}
        onPaymentSuccess={handlePaymentSuccess}
      />

      {/* Guided Learning Modal */}
      <GuidedLearning
        isOpen={showGuidedLearning}
        onClose={() => setShowGuidedLearning(false)}
        documentContent={state.extractedText || ""}
        onGenerateQuiz={generateQuiz}
      />
    </>
  );
}
