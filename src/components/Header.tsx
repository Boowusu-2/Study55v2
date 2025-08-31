import Image from "next/image";
import Link from "next/link";
import { Brain, Settings, User } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface HeaderProps {
  onOpenSettings: () => void;
  onOpenUserProfile: () => void;
}

export default function Header({
  onOpenSettings,
  onOpenUserProfile,
}: HeaderProps) {
  const { user, isAuthenticated } = useAuth();

  return (
    <header className="relative mb-16 pt-4 md:pt-0">
      {/* Settings Button - positioned absolutely in upper left on mobile */}
      <div className="absolute top-2 md:top-0 left-2 z-20 md:hidden">
        <button
          onClick={onOpenSettings}
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
          onClick={onOpenSettings}
          className="hidden md:block p-2 md:p-3 bg-white/10 backdrop-blur-md rounded-xl md:rounded-2xl border border-white/20 text-white hover:bg-white/20 hover:border-white/30 transition-all duration-300 shadow-lg hover:shadow-xl"
          aria-label="Settings"
        >
          <Settings className="w-4 h-4 md:w-5 md:h-5" />
        </button>
        {isAuthenticated ? (
          <div className="relative">
            <button
              onClick={onOpenUserProfile}
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
          Transform your documents and images into interactive quizzes powered
          by AI.
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
  );
}
