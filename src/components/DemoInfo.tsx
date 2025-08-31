import { Star } from "lucide-react";

interface DemoInfoProps {
  freeGenerationsLeft: number;
  isProUser: boolean;
  onUpgradeToPro: () => void;
}

export default function DemoInfo({
  freeGenerationsLeft,
  isProUser,
  onUpgradeToPro,
}: DemoInfoProps) {
  return (
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
            Upload your documents and generate your first quiz completely free!
            Experience the power of AI-powered quiz generation with no setup
            required.
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
                  {freeGenerationsLeft}
                </span>
              </div>
              <h3 className="text-lg font-semibold text-blue-200">
                Free Generations Left
              </h3>
            </div>
            {freeGenerationsLeft <= 0 && !isProUser && (
              <button
                onClick={onUpgradeToPro}
                className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-200 font-medium"
              >
                Upgrade to Pro
              </button>
            )}
          </div>
          <p className="text-blue-100 mb-3">
            {freeGenerationsLeft > 0
              ? `You have ${freeGenerationsLeft} free quiz generation${
                  freeGenerationsLeft === 1 ? "" : "s"
                } remaining.`
              : "You've used all your free generations. Upgrade to Pro for unlimited quizzes!"}
          </p>
          {freeGenerationsLeft > 0 && (
            <div className="flex items-center gap-2 text-sm text-blue-200">
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
              <span>Free tier: 3 generations</span>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
