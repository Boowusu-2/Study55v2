import { useState, useRef, useCallback, useEffect } from "react";
import { QuizQuestion, QuizSettings } from "@/types";
import { useLocalStorage } from "@/components/LocalStorageProvider";

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
  freeGenerationsLeft: number;
  isProUser: boolean;
  showPaymentModal: boolean;
  showApiLimitModal: boolean;
  apiLimitMessage: string;
  questionsReady: boolean;
  showSettingsModal: boolean;
  isOfflineMode: boolean;
  extractedText: string;
  isUploading: boolean;
  uploadProgress: number;
}

const initialState: SmartStudyState = {
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
  freeGenerationsLeft: 3,
  isProUser: false,
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
  isOfflineMode: false,
  extractedText: "",
  isUploading: false,
  uploadProgress: 0,
};

export function useQuizState() {
  const [state, setState] = useState<SmartStudyState>(initialState);
  const [savedQuiz, setSavedQuiz] = useLocalStorage<{
    questions: QuizQuestion[];
  } | null>("studyai_quiz", null);
  const cancellationRef = useRef<{ cancelled: boolean }>({ cancelled: false });

  // Load saved quiz from localStorage on mount
  useEffect(() => {
    if (
      savedQuiz &&
      savedQuiz.questions &&
      Array.isArray(savedQuiz.questions)
    ) {
      setState((prev) => ({
        ...prev,
        currentQuiz: savedQuiz,
        userAnswers: Array.from(
          { length: savedQuiz.questions.length },
          () => null
        ),
      }));
    }
  }, [savedQuiz]);

  // Save quiz to localStorage whenever it changes
  useEffect(() => {
    if (
      state.currentQuiz?.questions &&
      state.currentQuiz.questions.length > 0
    ) {
      setSavedQuiz(state.currentQuiz);
    }
  }, [state.currentQuiz, setSavedQuiz]);

  const updateState = useCallback((updates: Partial<SmartStudyState> | ((prev: SmartStudyState) => Partial<SmartStudyState>)) => {
    if (typeof updates === 'function') {
      setState((prev) => ({ ...prev, ...updates(prev) }));
    } else {
      setState((prev) => ({ ...prev, ...updates }));
    }
  }, []);

  const resetQuiz = useCallback(() => {
    cancellationRef.current.cancelled = true;
    setSavedQuiz(null);
    setState(initialState);
  }, [setSavedQuiz]);

  const addFiles = useCallback(
    (files: File[]) => {
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

      const newFiles = files.filter((file) => {
        const extension = "." + file.name.split(".").pop()?.toLowerCase();
        const isValid = validTypes.includes(extension);
        const isDuplicate = state.uploadedFiles.find(
          (f) => f.name === file.name
        );
        return isValid && !isDuplicate;
      });

      if (newFiles.length > 0) {
        // Show upload progress
        setState((prev) => ({
          ...prev,
          isUploading: true,
          uploadProgress: 0,
        }));

        // Simulate upload progress
        let progress = 0;
        const progressInterval = setInterval(() => {
          progress += Math.random() * 15 + 5; // Random progress between 5-20%
          if (progress >= 100) {
            progress = 100;
            clearInterval(progressInterval);
            
            // Complete upload
            setState((prev) => ({
              ...prev,
              uploadedFiles: [...prev.uploadedFiles, ...newFiles],
              isUploading: false,
              uploadProgress: 100,
            }));

            // Clear progress after a short delay
            setTimeout(() => {
              setState((prev) => ({
                ...prev,
                uploadProgress: 0,
              }));
            }, 1000);
          } else {
            setState((prev) => ({
              ...prev,
              uploadProgress: Math.round(progress),
            }));
          }
        }, 200);
      }
    },
    [state.uploadedFiles]
  );

  const removeFile = useCallback((index: number) => {
    setState((prev) => ({
      ...prev,
      uploadedFiles: prev.uploadedFiles.filter((_, i) => i !== index),
    }));
  }, []);

  const updateQuizSettings = useCallback(
    <K extends keyof QuizSettings>(key: K, value: QuizSettings[K]) => {
      setState((prev) => ({
        ...prev,
        quizSettings: {
          ...prev.quizSettings,
          [key]: value,
        },
      }));
    },
    []
  );

  return {
    state,
    updateState,
    resetQuiz,
    addFiles,
    removeFile,
    updateQuizSettings,
    cancellationRef,
  };
}
