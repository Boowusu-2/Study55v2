import { BookOpen, Zap } from "lucide-react";

interface ActionButtonsProps {
  uploadedFiles: File[];
  isLoading: boolean;
  loadingMessage: string;
  openDropdowns: Set<string>;
  onGenerateQuiz: () => void;
  onStartGuidedLearning: () => void;
}

export default function ActionButtons({
  uploadedFiles,
  isLoading,
  loadingMessage,
  openDropdowns,
  onGenerateQuiz,
  onStartGuidedLearning,
}: ActionButtonsProps) {
  return (
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
          onClick={onStartGuidedLearning}
          disabled={
            uploadedFiles.length === 0 ||
            loadingMessage?.includes("Extracting text")
          }
          className="group relative px-8 py-4 bg-gradient-to-br from-emerald-500 via-green-500 to-teal-500 text-white font-bold rounded-2xl shadow-2xl shadow-emerald-500/25 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-emerald-500/40 transform hover:scale-105 transition-all duration-300 text-lg w-full sm:w-auto min-w-[280px] overflow-hidden"
          aria-label="Start guided learning with AI"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-600 via-green-600 to-teal-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="relative flex items-center justify-center gap-3">
            {loadingMessage?.includes("Extracting text") ? (
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
          onClick={onGenerateQuiz}
          disabled={uploadedFiles.length === 0 || isLoading}
          className="group relative px-8 py-4 bg-gradient-to-br from-violet-500 via-purple-500 to-fuchsia-500 text-white font-bold rounded-2xl shadow-2xl shadow-purple-500/25 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-purple-500/40 transform hover:scale-105 transition-all duration-300 text-lg w-full sm:w-auto min-w-[280px] overflow-hidden"
          aria-label="Generate quiz from uploaded documents"
        >
          {/* Animated background */}
          <div className="absolute inset-0 bg-gradient-to-br from-violet-600 via-purple-600 to-fuchsia-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          {isLoading ? (
            <div className="relative flex flex-col items-center justify-center gap-3">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin" />
                <span className="font-bold text-lg">Generating Quiz...</span>
              </div>
              {loadingMessage && (
                <div className="text-sm text-purple-100 mt-2 max-w-xs text-center font-medium">
                  {loadingMessage}
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
      {uploadedFiles.length === 0 && (
        <p className="text-slate-400 text-sm">
          Upload documents to get started
        </p>
      )}
    </div>
  );
}
