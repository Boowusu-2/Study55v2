import LoadingSpinner from "@/components/ui/LoadingSpinner";

interface LoadingOverlayProps {
  isLoading: boolean;
  loadingMessage: string;
  onCancel: () => void;
}

export default function LoadingOverlay({
  isLoading,
  loadingMessage,
  onCancel,
}: LoadingOverlayProps) {
  if (!isLoading) return null;

  return (
    <div className="absolute inset-0 bg-black/60 backdrop-blur-md rounded-3xl flex items-center justify-center z-50">
      <div className="bg-gradient-to-br from-white/20 to-white/10 backdrop-blur-xl rounded-3xl p-10 border border-white/30 shadow-2xl max-w-lg w-full mx-4 relative overflow-hidden">
        {/* Animated background */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-500/10 animate-pulse" />

        <div className="relative z-10">
          <LoadingSpinner
            message={loadingMessage || "🚀 Generating your quiz..."}
            size="lg"
          />

          {/* Progress steps */}
          <div className="mt-8 space-y-3">
            <div className="flex items-center gap-3 text-white/80">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-sm">Processing documents...</span>
            </div>
            <div className="flex items-center gap-3 text-white/60">
              <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
              <span className="text-sm">Extracting content...</span>
            </div>
            <div className="flex items-center gap-3 text-white/60">
              <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
              <span className="text-sm">Generating questions...</span>
            </div>
          </div>

          {/* Cancel Button */}
          <div className="mt-8 pt-6 border-t border-white/20">
            <button
              onClick={onCancel}
              className="w-full px-6 py-3 bg-red-500/20 hover:bg-red-500/30 border border-red-400/30 text-red-200 rounded-xl transition-all duration-300 font-medium"
            >
              Cancel Generation
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
