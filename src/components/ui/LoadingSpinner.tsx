import React from "react";

interface LoadingSpinnerProps {
  message: string;
  showProgress?: boolean;
  progress?: number;
  total?: number;
  size?: "sm" | "md" | "lg";
}

export default function LoadingSpinner({
  message,
  showProgress = false,
  progress = 0,
  total = 100,
  size = "md",
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-6 h-6",
    lg: "w-8 h-8",
  };

  const percentage = total > 0 ? Math.round((progress / total) * 100) : 0;

  return (
    <div className="flex flex-col items-center justify-center p-6 space-y-4">
      {/* Animated Spinner */}
      <div className="relative">
        <div
          className={`${sizeClasses[size]} border-2 border-purple-200 border-t-purple-500 rounded-full animate-spin`}
        />
        {showProgress && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xs font-bold text-purple-600">
              {percentage}%
            </span>
          </div>
        )}
      </div>

      {/* Loading Message */}
      <div className="text-center">
        <p className="text-white font-medium text-lg">{message}</p>
        {showProgress && total > 0 && (
          <p className="text-purple-200 text-sm mt-1">
            {progress} of {total} completed
          </p>
        )}
      </div>

      {/* Progress Bar */}
      {showProgress && (
        <div className="w-full max-w-xs bg-white/20 rounded-full h-2">
          <div
            className="bg-gradient-to-r from-purple-400 to-pink-400 h-2 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${percentage}%` }}
          />
        </div>
      )}

      {/* Animated Dots */}
      <div className="flex space-x-1">
        <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce [animation-delay:0ms]" />
        <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce [animation-delay:150ms]" />
        <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce [animation-delay:300ms]" />
      </div>
    </div>
  );
}
