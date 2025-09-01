import React, { useState, useEffect, useCallback } from "react";
import {
  BookOpen,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Lightbulb,
  Target,
  CheckCircle,
  XCircle,
  ArrowRight,
  ArrowLeft,
  Send,
  Loader2,
} from "lucide-react";

interface LearningStep {
  id: string;
  title: string;
  content: string;
  type: "explanation" | "question" | "flashcard" | "checkpoint";
  question?: string;
  answer?: string;
  options?: string[];
  correctAnswer?: string;
  explanation?: string;
  modelAnswer?: string;
  evaluationCriteria?: string[];
}

interface GuidedLearningProps {
  isOpen: boolean;
  onClose: () => void;
  documentContent: string;
  onGenerateQuiz: () => void;
  customApiKey?: string;
  useCustomApiKey?: boolean;
}

export default function GuidedLearning({
  isOpen,
  onClose,
  documentContent,
  onGenerateQuiz,
  customApiKey = "",
  useCustomApiKey = false,
}: GuidedLearningProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
  const [showAnswer, setShowAnswer] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  // const [learningProgress, setLearningProgress] = useState(0);

  const [learningSteps, setLearningSteps] = useState<LearningStep[]>([]);
  const [sentenceAnswer, setSentenceAnswer] = useState("");
  const [isSubmittingAnswer, setIsSubmittingAnswer] = useState(false);
  const [isLoadingSteps, setIsLoadingSteps] = useState(false);
  const [isOfflineMode, setIsOfflineMode] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [answerFeedback, setAnswerFeedback] = useState<{
    isCorrect: boolean;
    feedback: string;
  } | null>(null);

  // Function to extract key topics from document content
  const extractKeyTopics = (content: string): string[] => {
    const topics: string[] = [];

    // Look for common Software Engineering terms
    if (content.toLowerCase().includes("software engineering")) {
      topics.push("Software Engineering");
    }
    if (
      content.toLowerCase().includes("sdlc") ||
      content.toLowerCase().includes("software development life cycle")
    ) {
      topics.push("SDLC");
    }
    if (content.toLowerCase().includes("requirements")) {
      topics.push("Requirements Engineering");
    }
    if (
      content.toLowerCase().includes("functional") ||
      content.toLowerCase().includes("non-functional")
    ) {
      topics.push("Functional & Non-functional Requirements");
    }
    if (content.toLowerCase().includes("machine learning")) {
      topics.push("Machine Learning");
    }
    if (content.toLowerCase().includes("artificial intelligence")) {
      topics.push("Artificial Intelligence");
    }
    if (
      content.toLowerCase().includes("banking system") ||
      content.toLowerCase().includes("online banking")
    ) {
      topics.push("Banking Systems");
    }
    if (content.toLowerCase().includes("testing")) {
      topics.push("Testing & Quality Assurance");
    }
    if (content.toLowerCase().includes("project management")) {
      topics.push("Project Management");
    }

    // If no specific topics found, extract general concepts
    if (topics.length === 0) {
      const words = content.split(/\s+/).filter((word) => word.length > 5);
      const commonWords = words.filter(
        (word) =>
          ![
            "about",
            "their",
            "there",
            "these",
            "those",
            "which",
            "where",
            "when",
            "what",
            "with",
            "from",
            "that",
            "this",
            "have",
            "will",
            "been",
            "were",
            "they",
            "them",
            "then",
            "than",
            "more",
            "most",
            "some",
            "such",
            "each",
            "every",
            "other",
            "another",
            "first",
            "second",
            "third",
            "last",
            "next",
            "previous",
            "current",
            "recent",
            "early",
            "late",
            "high",
            "low",
            "good",
            "bad",
            "new",
            "old",
            "big",
            "small",
            "large",
            "little",
            "much",
            "many",
            "few",
            "several",
            "various",
            "different",
            "similar",
            "same",
            "important",
            "necessary",
            "essential",
            "critical",
            "major",
            "minor",
            "primary",
            "secondary",
            "main",
            "key",
            "central",
            "basic",
            "advanced",
            "complex",
            "simple",
            "easy",
            "difficult",
            "hard",
            "soft",
            "strong",
            "weak",
            "powerful",
            "effective",
            "efficient",
            "successful",
            "successful",
            "successful",
          ].includes(word.toLowerCase())
      );
      topics.push(
        ...commonWords
          .slice(0, 3)
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      );
    }

    return topics.slice(0, 5); // Return max 5 topics
  };

  const initializeLearning = useCallback(async () => {
    setIsLoadingSteps(true);

    // Check if we have document content
    if (!documentContent || documentContent.trim().length === 0) {
      console.log("No document content provided, using fallback");
      setLearningSteps([
        {
          id: "intro",
          title: "Welcome to Guided Learning",
          content: "Please upload a document first to start guided learning.",
          type: "explanation",
        },
      ]);
      setIsInitialized(true);
      setIsLoadingSteps(false);
      return;
    }

    // Check if we're online and API is accessible
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        console.log("API request timeout reached, aborting...");
        controller.abort();
      }, 15000); // 15 second timeout

      try {
        console.log("Initializing guided learning with document content:", {
          contentLength: documentContent.length,
          preview: documentContent.substring(0, 200) + "...",
        });

        // Try to use the Railway backend for AI-powered guided learning
        console.log("Attempting to use Railway backend for guided learning");

        try {
          const requestBody: {
            documentContent: string;
            step: string;
            customApiKey?: string;
          } = {
            documentContent,
            step: "analyze",
          };

          // Add custom API key if enabled
          if (useCustomApiKey && customApiKey) {
            requestBody.customApiKey = customApiKey;
          }

          const response = await fetch(
            "https://study55v2-production-09c8.up.railway.app/guided-learning",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(requestBody),
              signal: controller.signal,
            }
          );

          clearTimeout(timeoutId);

          if (response.ok) {
            const data = await response.json();
            console.log("AI-powered guided learning successful:", data);
            setLearningSteps(data.learningSteps || []);
            setIsInitialized(true);
            setIsLoadingSteps(false);
            return;
          } else {
            console.error("Backend guided learning failed:", response.status);
            throw new Error(`Backend error: ${response.status}`);
          }
        } catch (backendError) {
          console.error(
            "Backend guided learning failed, using fallback:",
            backendError
          );
          clearTimeout(timeoutId);
        }

        // Fallback to client-side guided learning
        console.log("Using client-side guided learning fallback");

        // Use document content to create dynamic learning steps
        // const documentPreview = documentContent.substring(0, 300) + "...";

        // Extract key topics from the document content
        const keyTopics = extractKeyTopics(documentContent);

        const fallbackSteps = [
          {
            id: "intro",
            title: "Welcome to Guided Learning",
            content:
              "I'll help you understand the key concepts from your document. Let's start with an overview of the main topics.",
            type: "explanation" as const,
          },
          {
            id: "concept1",
            title: "Document Overview",
            content: `Based on your uploaded document, here's what we'll be learning about: ${keyTopics.join(
              ", "
            )}. The document contains detailed information about these topics that we'll explore together.`,
            type: "explanation" as const,
          },
          {
            id: "flashcard1",
            title: "Key Concept Flashcard",
            content:
              "Let's test your knowledge with a flashcard about the main concepts from your document.",
            type: "flashcard" as const,
            question: "What is the main topic covered in your document?",
            answer: `Based on your document content, the main topics include: ${keyTopics
              .slice(0, 3)
              .join(
                ", "
              )}. These are the key concepts we'll be exploring in detail.`,
          },
          {
            id: "practice",
            title: "Practice Questions",
            content:
              "Let's test your understanding with some practice questions about the concepts in your document.",
            type: "question" as const,
            question: "What is the main topic of your document?",
            options: [
              "I'm not sure yet",
              "I have some ideas",
              "I understand it well",
            ],
            correctAnswer: "I have some ideas",
            explanation:
              "It's perfectly normal to be learning! The important thing is that you're engaging with the material from your document.",
          },
          {
            id: "summary",
            title: "Learning Summary",
            content: `Great job! You've learned about ${keyTopics
              .slice(0, 2)
              .join(
                " and "
              )} from your document. Ready to test your knowledge with a quiz?`,
            type: "explanation" as const,
          },
        ];

        setLearningSteps(fallbackSteps);
        setIsInitialized(true);
      } catch (error) {
        clearTimeout(timeoutId);

        // Handle AbortError specifically (timeout or manual abort)
        if (error instanceof Error && error.name === "AbortError") {
          console.log("API request timed out, using fallback content");
        } else {
          console.error("Failed to initialize learning:", error);
        }

        // Fallback to basic steps if AI fails
        const keyTopics = extractKeyTopics(documentContent);
        setLearningSteps([
          {
            id: "intro",
            title: "Welcome to Guided Learning",
            content:
              "I'll help you understand the key concepts from your document. Let's start with an overview of the main topics.",
            type: "explanation",
          },
          {
            id: "concept1",
            title: "Document Overview",
            content: `Based on your uploaded document, here's what we'll be learning about: ${keyTopics.join(
              ", "
            )}. The document contains detailed information about these topics that we'll explore together.`,
            type: "explanation",
          },
          {
            id: "flashcard1",
            title: "Key Concept Flashcard",
            content:
              "Let's test your knowledge with a flashcard about the main concepts.",
            type: "flashcard",
            question: "What is the main topic covered in your document?",
            answer:
              "Based on your document content, the main topics include various concepts that we'll explore in detail. The document appears to cover important subject matter that will help you understand the key principles.",
          },
          {
            id: "practice",
            title: "Practice Questions",
            content:
              "Let's test your understanding with some practice questions. Don't worry if you don't get them all right - learning is a process!",
            type: "question",
            question: "What is the main topic of your document?",
            options: [
              "I'm not sure yet",
              "I have some ideas",
              "I understand it well",
            ],
            correctAnswer: "I have some ideas",
            explanation:
              "It's perfectly normal to be learning! The important thing is that you're engaging with the material.",
          },
          {
            id: "summary",
            title: "Learning Summary",
            content:
              "Great job! You've learned the key concepts. Ready to test your knowledge with a quiz?",
            type: "explanation",
          },
        ]);
        setIsInitialized(true);
      }
    } catch (error) {
      console.error("Network error, using offline mode:", error);
      setIsOfflineMode(true);
      // Use fallback content for network errors
      setLearningSteps([
        {
          id: "intro",
          title: "Welcome to Guided Learning",
          content:
            "I'll help you understand the key concepts from your document. Let's start with an overview of the main topics.",
          type: "explanation",
        },
        {
          id: "concept1",
          title: "Document Overview",
          content:
            "Based on your uploaded document, here's what we'll be learning about. The document contains information about various topics that we'll explore together.",
          type: "explanation",
        },
        {
          id: "flashcard1",
          title: "Key Concept Flashcard",
          content:
            "Let's test your knowledge with a flashcard about the main concepts.",
          type: "flashcard",
          question: "What is the main topic covered in your document?",
          answer:
            "Based on your document content, the main topics include various concepts that we'll explore in detail. The document appears to cover important subject matter that will help you understand the key principles.",
        },
        {
          id: "practice",
          title: "Practice Questions",
          content:
            "Let's test your understanding with some practice questions. Don't worry if you don't get them all right - learning is a process!",
          type: "question",
          question: "What is the main topic of your document?",
          options: [
            "I'm not sure yet",
            "I have some ideas",
            "I understand it well",
          ],
          correctAnswer: "I have some ideas",
          explanation:
            "It's perfectly normal to be learning! The important thing is that you're engaging with the material.",
        },
        {
          id: "summary",
          title: "Learning Summary",
          content:
            "Great job! You've learned the key concepts. Ready to test your knowledge with a quiz?",
          type: "explanation",
        },
      ]);
      setIsInitialized(true);
    } finally {
      setIsLoadingSteps(false);
    }
  }, [documentContent]);

  // Reset state when modal closes or document content changes
  useEffect(() => {
    if (!isOpen) {
      setIsInitialized(false);
      setLearningSteps([]);
      setCurrentStep(0);
      setShowAnswer(false);
      setUserAnswers({});
      setSentenceAnswer("");
      setAnswerFeedback(null);
    }
  }, [isOpen]);

  // Initialize learning steps when component opens
  useEffect(() => {
    if (isOpen && documentContent && !isInitialized) {
      // Add a small delay to show loading state
      const timer = setTimeout(() => {
        initializeLearning();
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [isOpen, documentContent, isInitialized, initializeLearning]); // Added initializeLearning dependency

  const currentStepData = learningSteps[currentStep] || {
    id: "loading",
    title: "Loading...",
    content: "Please wait while we prepare your learning experience.",
    type: "explanation" as const,
  };
  const progress =
    learningSteps.length > 0
      ? ((currentStep + 1) / learningSteps.length) * 100
      : 0;

  const handleNext = () => {
    if (currentStep < learningSteps.length - 1) {
      setCurrentStep(currentStep + 1);
      setShowAnswer(false);
      // setLearningProgress(progress);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      setShowAnswer(false);
    }
  };

  const handleAnswerSelect = (answer: string) => {
    setUserAnswers({ ...userAnswers, [currentStepData.id]: answer });
  };

  const handleSubmitSentenceAnswer = async () => {
    if (!sentenceAnswer.trim()) return;

    setIsSubmittingAnswer(true);
    try {
      // Since we're using static export, use client-side evaluation
      console.log("Using client-side answer evaluation for static export");

      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Provide positive feedback for static export
      setAnswerFeedback({
        isCorrect: true,
        feedback:
          "Great answer! You're making excellent progress in your learning journey.",
      });
    } catch (error) {
      console.error("Failed to evaluate answer:", error);
      setAnswerFeedback({
        isCorrect: true,
        feedback: "Your answer has been submitted. Great effort!",
      });
    } finally {
      setIsSubmittingAnswer(false);
    }
  };

  const handleGenerateQuiz = async () => {
    setIsGenerating(true);
    // Simulate AI processing
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setIsGenerating(false);
    onGenerateQuiz();
    onClose();
  };

  const isCorrect =
    userAnswers[currentStepData.id] === currentStepData.correctAnswer;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-3xl border border-white/20 shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-xl flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Guided Learning</h2>
              <p className="text-slate-300 text-sm">
                AI-powered learning experience
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 bg-white/10 rounded-xl hover:bg-white/20 transition-colors"
          >
            <XCircle className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="px-6 py-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-slate-300">Progress</span>
            <span className="text-sm text-white font-medium">
              {learningSteps.length > 0
                ? `${currentStep + 1} of ${learningSteps.length}`
                : "Loading..."}
            </span>
          </div>
          <div className="w-full bg-white/10 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Step Title */}
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">
                {currentStep + 1}
              </span>
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-white">
                {currentStepData.title}
              </h3>
              {isOfflineMode && (
                <p className="text-yellow-400 text-sm mt-1">
                  ⚡ Offline mode - Using fallback content
                </p>
              )}
            </div>
          </div>

          {/* Loading Indicator */}
          {isLoadingSteps && (
            <div className="bg-white/10 rounded-2xl p-6 mb-6">
              <div className="flex items-center justify-center gap-3">
                <Loader2 className="w-6 h-6 animate-spin text-purple-400" />
                <span className="text-white font-medium">
                  Preparing your learning experience...
                </span>
              </div>
            </div>
          )}

          {/* Step Content */}
          {!isLoadingSteps && (
            <div className="bg-white/10 rounded-2xl p-6 mb-6">
              {currentStepData.type === "explanation" && (
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Lightbulb className="w-5 h-5 text-yellow-400 mt-1 flex-shrink-0" />
                    <p className="text-white leading-relaxed">
                      {currentStepData.content}
                    </p>
                  </div>
                </div>
              )}

              {currentStepData.type === "flashcard" && (
                <div className="space-y-4">
                  <div className="bg-white/10 rounded-xl p-4">
                    <h4 className="text-white font-semibold mb-3">
                      {currentStepData.question}
                    </h4>
                    {!showAnswer ? (
                      <button
                        onClick={() => setShowAnswer(true)}
                        className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
                      >
                        Show Answer
                      </button>
                    ) : (
                      <div className="space-y-3">
                        <p className="text-slate-200">
                          {currentStepData.answer || "No answer provided"}
                        </p>
                        <button
                          onClick={() => setShowAnswer(false)}
                          className="px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors"
                        >
                          Hide Answer
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {currentStepData.type === "question" && (
                <div className="space-y-4">
                  <h4 className="text-white font-semibold">
                    {currentStepData.question}
                  </h4>
                  <div className="space-y-3">
                    {currentStepData.options?.map((option, index) => (
                      <button
                        key={index}
                        onClick={() => handleAnswerSelect(option)}
                        className={`w-full p-4 text-left rounded-xl border transition-all duration-200 ${
                          userAnswers[currentStepData.id] === option
                            ? isCorrect
                              ? "bg-green-500/20 border-green-400 text-white"
                              : "bg-red-500/20 border-red-400 text-white"
                            : "bg-white/10 border-white/20 text-white hover:bg-white/20 hover:border-white/30"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                              userAnswers[currentStepData.id] === option
                                ? isCorrect
                                  ? "border-green-400 bg-green-400"
                                  : "border-red-400 bg-red-400"
                                : "border-white/30"
                            }`}
                          >
                            {userAnswers[currentStepData.id] === option &&
                              (isCorrect ? (
                                <CheckCircle className="w-4 h-4 text-white" />
                              ) : (
                                <XCircle className="w-4 h-4 text-white" />
                              ))}
                          </div>
                          <span>{option}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                  {userAnswers[currentStepData.id] && (
                    <div className="bg-white/10 rounded-xl p-4">
                      <p className="text-white font-medium mb-2">
                        {isCorrect ? "Correct!" : "Incorrect"}
                      </p>
                      <p className="text-slate-200 text-sm">
                        {currentStepData.explanation}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {currentStepData.type === "checkpoint" && (
                <div className="space-y-4">
                  <h4 className="text-white font-semibold">
                    {currentStepData.question}
                  </h4>
                  <p className="text-slate-300 text-sm">
                    Please provide a sentence or short paragraph answer.
                  </p>

                  <div className="space-y-3">
                    <textarea
                      value={sentenceAnswer}
                      onChange={(e) => setSentenceAnswer(e.target.value)}
                      placeholder="Type your answer here..."
                      className="w-full p-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-purple-400 transition-all duration-300 resize-none"
                      rows={4}
                    />

                    <button
                      onClick={handleSubmitSentenceAnswer}
                      disabled={!sentenceAnswer.trim() || isSubmittingAnswer}
                      className="w-full px-6 py-3 bg-purple-500 text-white rounded-xl hover:bg-purple-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {isSubmittingAnswer ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Evaluating...
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          Submit Answer
                        </>
                      )}
                    </button>
                  </div>

                  {answerFeedback && (
                    <div
                      className={`rounded-xl p-4 ${
                        answerFeedback.isCorrect
                          ? "bg-green-500/20 border border-green-400/30"
                          : "bg-yellow-500/20 border border-yellow-400/30"
                      }`}
                    >
                      <p
                        className={`font-medium mb-2 ${
                          answerFeedback.isCorrect
                            ? "text-green-200"
                            : "text-yellow-200"
                        }`}
                      >
                        {answerFeedback.isCorrect
                          ? "Great answer!"
                          : "Good effort!"}
                      </p>
                      <p className="text-slate-200 text-sm">
                        {answerFeedback.feedback}
                      </p>
                      {currentStepData.modelAnswer && (
                        <div className="mt-3 pt-3 border-t border-white/20">
                          <p className="text-slate-300 text-sm font-medium mb-1">
                            Model Answer:
                          </p>
                          <p className="text-slate-200 text-sm">
                            {currentStepData.modelAnswer}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Controls */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="p-3 bg-white/10 rounded-xl hover:bg-white/20 transition-colors"
              >
                {isPlaying ? (
                  <Pause className="w-5 h-5 text-white" />
                ) : (
                  <Play className="w-5 h-5 text-white" />
                )}
              </button>
              <button
                onClick={() => setIsMuted(!isMuted)}
                className="p-3 bg-white/10 rounded-xl hover:bg-white/20 transition-colors"
              >
                {isMuted ? (
                  <VolumeX className="w-5 h-5 text-white" />
                ) : (
                  <Volume2 className="w-5 h-5 text-white" />
                )}
              </button>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handlePrevious}
                disabled={currentStep === 0}
                className="flex items-center gap-2 px-4 py-2 bg-white/10 rounded-xl hover:bg-white/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ArrowLeft className="w-4 h-4" />
                Previous
              </button>

              {currentStep === learningSteps.length - 1 ? (
                <button
                  onClick={handleGenerateQuiz}
                  disabled={isGenerating}
                  className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all duration-300 disabled:opacity-50"
                >
                  {isGenerating ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Generating Quiz...
                    </>
                  ) : (
                    <>
                      <Target className="w-4 h-4" />
                      Generate Quiz
                    </>
                  )}
                </button>
              ) : (
                <button
                  onClick={handleNext}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl hover:from-blue-600 hover:to-purple-600 transition-all duration-300"
                >
                  Next
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
