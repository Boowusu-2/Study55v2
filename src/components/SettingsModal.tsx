import React, { useState } from "react";
import {
  X,
  Crown,
  Zap,
  Check,
  Star,
  CreditCard,
  Shield,
  Settings,
  Sun,
  Moon,
  Monitor,
  Bell,
  Download,
  Share2,
  HelpCircle,
  User,
  LogOut,
  Target,
} from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import { QuizSettings } from "@/types";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  freeGenerationsLeft: number;
  isProUser: boolean;
  onUpgradeToPro: () => void;
  customApiKey: string;
  useCustomApiKey: boolean;
  onUpdateApiKey: (key: string, useCustom: boolean) => void;
  quizSettings?: QuizSettings;
  onUpdateQuizSettings?: (settings: QuizSettings) => void;
  currentQuiz?: { questions: Array<{
    question: string;
    options: string[];
    correct: number;
    explanation: string;
  }> } | null;
}

export default function SettingsModal({
  isOpen,
  onClose,
  freeGenerationsLeft,
  isProUser,
  onUpgradeToPro,
  customApiKey,
  useCustomApiKey,
  onUpdateApiKey,
  quizSettings,
  onUpdateQuizSettings,
  currentQuiz,
}: SettingsModalProps) {
  const { theme, setTheme } = useTheme();
  const [activeTab, setActiveTab] = useState<"account" | "preferences" | "quiz" | "pro">(
    "account"
  );
  const [notifications, setNotifications] = useState(true);
  const [autoSave, setAutoSave] = useState(true);
  const [localApiKey, setLocalApiKey] = useState(customApiKey);
  const [localUseCustomApiKey, setLocalUseCustomApiKey] = useState(useCustomApiKey);
  const [localQuizSettings, setLocalQuizSettings] = useState<QuizSettings>(quizSettings || {
    questionCount: 10,
    difficulty: "medium",
    questionType: "multiple_choice",
    focusArea: "",
    model: "auto",
  });

  if (!isOpen) return null;

  const proFeatures = [
    "Unlimited quiz generations",
    "Advanced AI models",
    "Priority processing",
    "Export to PDF",
    "Custom branding",
    "Analytics dashboard",
    "Priority support",
    "Early access to features",
  ];

  const pricingPlans = [
    {
      name: "Monthly",
      price: "$9.99",
      period: "per month",
      popular: false,
    },
    {
      name: "Yearly",
      price: "$99.99",
      period: "per year",
      popular: true,
      savings: "Save 17%",
    },
  ];

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-3xl border border-white/20 shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-xl flex items-center justify-center">
              <Settings className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Settings</h2>
              <p className="text-slate-300 text-sm">
                Manage your account and preferences
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 bg-white/10 rounded-xl hover:bg-white/20 transition-colors"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        <div className="p-6">
          {/* Tab Navigation */}
          <div className="flex space-x-1 mb-6 bg-white/10 rounded-xl p-1">
            <button
              onClick={() => setActiveTab("account")}
              className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all duration-200 ${
                activeTab === "account"
                  ? "bg-white/20 text-white shadow-sm"
                  : "text-slate-300 hover:text-white"
              }`}
            >
              <User className="w-4 h-4 inline mr-2" />
              Account
            </button>
            <button
              onClick={() => setActiveTab("preferences")}
              className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all duration-200 ${
                activeTab === "preferences"
                  ? "bg-white/20 text-white shadow-sm"
                  : "text-slate-300 hover:text-white"
              }`}
            >
              <Settings className="w-4 h-4 inline mr-2" />
              Preferences
            </button>
            <button
              onClick={() => setActiveTab("quiz")}
              className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all duration-200 ${
                activeTab === "quiz"
                  ? "bg-white/20 text-white shadow-sm"
                  : "text-slate-300 hover:text-white"
              }`}
            >
              <Target className="w-4 h-4 inline mr-2" />
              Quiz
            </button>
            <button
              onClick={() => setActiveTab("pro")}
              className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all duration-200 ${
                activeTab === "pro"
                  ? "bg-white/20 text-white shadow-sm"
                  : "text-slate-300 hover:text-white"
              }`}
            >
              <Crown className="w-4 h-4 inline mr-2" />
              Pro
            </button>
          </div>

          {/* Account Tab */}
          {activeTab === "account" && (
            <div className="space-y-6">
              {/* Current Status */}
              <div className="bg-gradient-to-br from-white/10 to-white/5 rounded-2xl p-6 border border-white/20">
                <div className="flex items-center gap-3 mb-4">
                  {isProUser ? (
                    <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl flex items-center justify-center">
                      <Crown className="w-5 h-5 text-white" />
                    </div>
                  ) : (
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-xl flex items-center justify-center">
                      <Star className="w-5 h-5 text-white" />
                    </div>
                  )}
                  <div>
                    <h3 className="text-xl font-bold text-white">
                      {isProUser ? "Pro Account" : "Free Account"}
                    </h3>
                    <p className="text-slate-300 text-sm">
                      {isProUser
                        ? "You have unlimited access to all features"
                        : `${freeGenerationsLeft} free generations remaining`}
                    </p>
                  </div>
                </div>
              </div>

              {/* Account Actions */}
              <div className="space-y-3">
                <button
                  onClick={() => {
                    // Clear all data functionality
                    if (confirm("Are you sure you want to clear all quiz data? This action cannot be undone.")) {
                      localStorage.clear();
                      window.location.reload();
                    }
                  }}
                  className="w-full p-4 bg-white/10 rounded-xl hover:bg-white/20 transition-colors flex items-center gap-3"
                >
                  <LogOut className="w-5 h-5 text-white" />
                  <span className="text-white font-medium">
                    Clear All Data
                  </span>
                </button>
                <button
                  onClick={() => {
                    // Share app functionality
                    if (typeof window !== "undefined") {
                      if (navigator.share) {
                        navigator.share({
                          title: "SmartStudy - AI-Powered Learning",
                          text: "Check out this amazing AI-powered quiz generator!",
                          url: window.location.href,
                        });
                      } else {
                        // Fallback: copy to clipboard
                        navigator.clipboard.writeText(window.location.href);
                        alert("Link copied to clipboard!");
                      }
                    }
                  }}
                  className="w-full p-4 bg-white/10 rounded-xl hover:bg-white/20 transition-colors flex items-center gap-3"
                >
                  <Share2 className="w-5 h-5 text-white" />
                  <span className="text-white font-medium">Share App</span>
                </button>
                <button
                  onClick={() => {
                    // Help/Support functionality
                    window.open("https://github.com/Boowusu-2/Study55v2", "_blank");
                  }}
                  className="w-full p-4 bg-white/10 rounded-xl hover:bg-white/20 transition-colors flex items-center gap-3"
                >
                  <HelpCircle className="w-5 h-5 text-white" />
                  <span className="text-white font-medium">Help & Support</span>
                </button>
                <button className="w-full p-4 bg-red-500/20 rounded-xl hover:bg-red-500/30 transition-colors flex items-center gap-3">
                  <LogOut className="w-5 h-5 text-red-400" />
                  <span className="text-red-400 font-medium">Sign Out</span>
                </button>
              </div>
            </div>
          )}

          {/* Preferences Tab */}
          {activeTab === "preferences" && (
            <div className="space-y-6">
              {/* Theme Settings */}
              <div className="bg-gradient-to-br from-white/10 to-white/5 rounded-2xl p-6 border border-white/20">
                <h3 className="text-xl font-bold text-white mb-4">
                  Appearance
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-white font-medium mb-3">
                      Theme
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                      <button
                        onClick={() => setTheme("light")}
                        className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                          theme === "light"
                            ? "border-purple-400 bg-gradient-to-r from-purple-500/20 to-pink-500/20"
                            : "border-white/20 bg-white/10 hover:border-purple-400/50"
                        }`}
                      >
                        <Sun className="w-6 h-6 text-white mx-auto mb-2" />
                        <span className="text-white text-sm font-medium">
                          Light
                        </span>
                      </button>
                      <button
                        onClick={() => setTheme("dark")}
                        className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                          theme === "dark"
                            ? "border-purple-400 bg-gradient-to-r from-purple-500/20 to-pink-500/20"
                            : "border-white/20 bg-white/10 hover:border-purple-400/50"
                        }`}
                      >
                        <Moon className="w-6 h-6 text-white mx-auto mb-2" />
                        <span className="text-white text-sm font-medium">
                          Dark
                        </span>
                      </button>
                      <button
                        onClick={() => setTheme("system")}
                        className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                          theme === "system"
                            ? "border-purple-400 bg-gradient-to-r from-purple-500/20 to-pink-500/20"
                            : "border-white/20 bg-white/10 hover:border-purple-400/50"
                        }`}
                      >
                        <Monitor className="w-6 h-6 text-white mx-auto mb-2" />
                        <span className="text-white text-sm font-medium">
                          System
                        </span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Notification Settings */}
              <div className="bg-gradient-to-br from-white/10 to-white/5 rounded-2xl p-6 border border-white/20">
                <h3 className="text-xl font-bold text-white mb-4">
                  Notifications
                </h3>
                <div className="space-y-4">
                  {/* Theme Settings */}
                  <div className="p-4 bg-white/10 rounded-xl">
                    <h4 className="text-white font-medium mb-3">Theme</h4>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setTheme("light")}
                        className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                          theme === "light"
                            ? "bg-purple-500 text-white"
                            : "bg-white/10 text-slate-300 hover:text-white"
                        }`}
                      >
                        <Sun className="w-4 h-4 inline mr-2" />
                        Light
                      </button>
                      <button
                        onClick={() => setTheme("dark")}
                        className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                          theme === "dark"
                            ? "bg-purple-500 text-white"
                            : "bg-white/10 text-slate-300 hover:text-white"
                        }`}
                      >
                        <Moon className="w-4 h-4 inline mr-2" />
                        Dark
                      </button>
                      <button
                        onClick={() => setTheme("system")}
                        className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                          theme === "system"
                            ? "bg-purple-500 text-white"
                            : "bg-white/10 text-slate-300 hover:text-white"
                        }`}
                      >
                        <Monitor className="w-4 h-4 inline mr-2" />
                        System
                      </button>
                    </div>
                  </div>

                  {/* Auto-advance Settings */}
                  <div className="flex items-center justify-between p-4 bg-white/10 rounded-xl">
                    <div className="flex items-center gap-3">
                      <Zap className="w-5 h-5 text-white" />
                      <div>
                        <h4 className="text-white font-medium">
                          Auto-advance Questions
                        </h4>
                        <p className="text-slate-300 text-sm">
                          Automatically move to next question after answering
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        // This would update the global state
                        console.log("Auto-advance toggled");
                      }}
                      className={`w-12 h-6 rounded-full transition-colors duration-200 bg-white/20`}
                    >
                      <div className="w-4 h-4 bg-white rounded-full transition-transform duration-200 translate-x-1" />
                    </button>
                  </div>

                  {/* Sound Settings */}
                  <div className="flex items-center justify-between p-4 bg-white/10 rounded-xl">
                    <div className="flex items-center gap-3">
                      <Bell className="w-5 h-5 text-white" />
                      <div>
                        <h4 className="text-white font-medium">
                          Sound Effects
                        </h4>
                        <p className="text-slate-300 text-sm">
                          Play sounds for correct/incorrect answers
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setNotifications(!notifications)}
                      className={`w-12 h-6 rounded-full transition-colors duration-200 ${
                        notifications ? "bg-purple-500" : "bg-white/20"
                      }`}
                    >
                      <div
                        className={`w-4 h-4 bg-white rounded-full transition-transform duration-200 ${
                          notifications ? "translate-x-6" : "translate-x-1"
                        }`}
                      />
                    </button>
                  </div>

                  {/* Auto-save Settings */}
                  <div className="flex items-center justify-between p-4 bg-white/10 rounded-xl">
                    <div className="flex items-center gap-3">
                      <Settings className="w-5 h-5 text-white" />
                      <div>
                        <h4 className="text-white font-medium">
                          Auto-save Progress
                        </h4>
                        <p className="text-slate-300 text-sm">
                          Automatically save your quiz progress
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setAutoSave(!autoSave)}
                      className={`w-12 h-6 rounded-full transition-colors duration-200 ${
                        autoSave ? "bg-purple-500" : "bg-white/20"
                      }`}
                    >
                      <div
                        className={`w-4 h-4 bg-white rounded-full transition-transform duration-200 ${
                          autoSave ? "translate-x-6" : "translate-x-1"
                        }`}
                      />
                    </button>
                  </div>
                </div>

                {/* API Key Settings */}
                <div className="bg-gradient-to-br from-white/10 to-white/5 rounded-2xl p-6 border border-white/20">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-emerald-500 rounded-xl flex items-center justify-center">
                      <Shield className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white">API Key Settings</h3>
                      <p className="text-slate-300 text-sm">
                        Use your own API key for unlimited access
                      </p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-white/10 rounded-xl">
                      <div className="flex items-center gap-3">
                        <Shield className="w-5 h-5 text-white" />
                        <div>
                          <h4 className="text-white font-medium">
                            Use Custom API Key
                          </h4>
                          <p className="text-slate-300 text-sm">
                            Bypass generation limits with your own key
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          setLocalUseCustomApiKey(!localUseCustomApiKey);
                          onUpdateApiKey(localApiKey, !localUseCustomApiKey);
                        }}
                        className={`w-12 h-6 rounded-full transition-colors duration-200 ${
                          localUseCustomApiKey ? "bg-green-500" : "bg-white/20"
                        }`}
                      >
                        <div
                          className={`w-4 h-4 bg-white rounded-full transition-transform duration-200 ${
                            localUseCustomApiKey ? "translate-x-6" : "translate-x-1"
                          }`}
                        />
                      </button>
                    </div>
                    
                    {localUseCustomApiKey && (
                      <div className="p-4 bg-white/10 rounded-xl">
                        <label className="block text-white font-medium mb-2">
                          Gemini API Key
                        </label>
                        <input
                          type="password"
                          value={localApiKey}
                          onChange={(e) => setLocalApiKey(e.target.value)}
                          onBlur={() => onUpdateApiKey(localApiKey, localUseCustomApiKey)}
                          placeholder="Enter your Gemini API key"
                          className="w-full p-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-purple-400 transition-colors"
                        />
                        <p className="text-slate-300 text-xs mt-2">
                          Your API key is stored locally and never shared
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Quiz Settings Tab */}
          {activeTab === "quiz" && (
            <div className="space-y-6">
              {/* Quiz Preferences */}
              <div className="bg-gradient-to-br from-white/10 to-white/5 rounded-2xl p-6 border border-white/20">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-xl flex items-center justify-center">
                    <Target className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">Quiz Preferences</h3>
                    <p className="text-slate-300 text-sm">
                      Customize your quiz generation settings
                    </p>
                  </div>
                </div>
                <div className="space-y-4">
                  {/* Question Count */}
                  <div className="p-4 bg-white/10 rounded-xl">
                    <label className="block text-white font-medium mb-2">
                      Number of Questions
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="50"
                      value={localQuizSettings.questionCount}
                      onChange={(e) => {
                        const newSettings = { ...localQuizSettings, questionCount: parseInt(e.target.value) || 10 } as QuizSettings;
                        setLocalQuizSettings(newSettings);
                        onUpdateQuizSettings?.(newSettings);
                      }}
                      className="w-full p-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-purple-400 transition-colors"
                    />
                  </div>

                  {/* Difficulty */}
                  <div className="p-4 bg-white/10 rounded-xl">
                    <label className="block text-white font-medium mb-2">
                      Difficulty Level
                    </label>
                    <select
                      value={localQuizSettings.difficulty}
                      onChange={(e) => {
                        const newSettings = { ...localQuizSettings, difficulty: e.target.value as 'easy' | 'medium' | 'hard' | 'mixed' };
                        setLocalQuizSettings(newSettings);
                        onUpdateQuizSettings?.(newSettings);
                      }}
                      className="w-full p-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:border-purple-400 transition-colors"
                    >
                      <option value="easy">Easy</option>
                      <option value="medium">Medium</option>
                      <option value="hard">Hard</option>
                    </select>
                  </div>

                  {/* Question Type */}
                  <div className="p-4 bg-white/10 rounded-xl">
                    <label className="block text-white font-medium mb-2">
                      Question Type
                    </label>
                    <select
                      value={localQuizSettings.questionType}
                      onChange={(e) => {
                        const newSettings = { ...localQuizSettings, questionType: e.target.value as 'multiple_choice' | 'true_false' | 'mixed' };
                        setLocalQuizSettings(newSettings);
                        onUpdateQuizSettings?.(newSettings);
                      }}
                      className="w-full p-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:border-purple-400 transition-colors"
                    >
                      <option value="multiple_choice">Multiple Choice</option>
                      <option value="true_false">True/False</option>
                      <option value="mixed">Mixed</option>
                    </select>
                  </div>

                  {/* Focus Area */}
                  <div className="p-4 bg-white/10 rounded-xl">
                    <label className="block text-white font-medium mb-2">
                      Focus Area (Optional)
                    </label>
                    <input
                      type="text"
                      value={localQuizSettings.focusArea}
                      onChange={(e) => {
                        const newSettings = { ...localQuizSettings, focusArea: e.target.value };
                        setLocalQuizSettings(newSettings);
                        onUpdateQuizSettings?.(newSettings);
                      }}
                      placeholder="e.g., Software Engineering, Machine Learning"
                      className="w-full p-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-purple-400 transition-colors"
                    />
                  </div>
                </div>
              </div>

              {/* Export Current Quiz */}
              {currentQuiz && currentQuiz.questions.length > 0 && (
                <div className="bg-gradient-to-br from-white/10 to-white/5 rounded-2xl p-6 border border-white/20">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-emerald-500 rounded-xl flex items-center justify-center">
                      <Download className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white">Export Quiz</h3>
                      <p className="text-slate-300 text-sm">
                        Download your current quiz data
                      </p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <button
                      onClick={() => {
                        const quizData = {
                          questions: currentQuiz.questions,
                          timestamp: new Date().toISOString(),
                          settings: localQuizSettings,
                        };
                        const dataStr = JSON.stringify(quizData, null, 2);
                        const dataBlob = new Blob([dataStr], {
                          type: "application/json",
                        });
                        const url = URL.createObjectURL(dataBlob);
                        const link = document.createElement("a");
                        link.href = url;
                        link.download = `quiz-${new Date().toISOString().split('T')[0]}.json`;
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                        URL.revokeObjectURL(url);
                      }}
                      className="w-full p-4 bg-white/10 rounded-xl hover:bg-white/20 transition-colors flex items-center gap-3"
                    >
                      <Download className="w-5 h-5 text-white" />
                      <span className="text-white font-medium">
                        Export Quiz as JSON
                      </span>
                    </button>
                    <button
                      onClick={() => {
                        const csvData = [
                          ['Question', 'Option A', 'Option B', 'Option C', 'Option D', 'Correct Answer', 'Explanation'],
                          ...currentQuiz.questions.map(q => [
                            q.question,
                            q.options[0],
                            q.options[1],
                            q.options[2],
                            q.options[3],
                            q.options[q.correct],
                            q.explanation
                          ])
                        ];
                        const csvContent = csvData.map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
                        const dataBlob = new Blob([csvContent], { type: 'text/csv' });
                        const url = URL.createObjectURL(dataBlob);
                        const link = document.createElement("a");
                        link.href = url;
                        link.download = `quiz-${new Date().toISOString().split('T')[0]}.csv`;
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                        URL.revokeObjectURL(url);
                      }}
                      className="w-full p-4 bg-white/10 rounded-xl hover:bg-white/20 transition-colors flex items-center gap-3"
                    >
                      <Download className="w-5 h-5 text-white" />
                      <span className="text-white font-medium">
                        Export Quiz as CSV
                      </span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Pro Tab */}
          {activeTab === "pro" && (
            <div className="space-y-6">
              {/* Pro Upgrade Section */}
              {!isProUser && (
                <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-2xl p-6 border border-purple-400/30">
                  <div className="text-center mb-6">
                    <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <Crown className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-2">
                      Upgrade to Pro
                    </h3>
                    <p className="text-purple-200">
                      Unlock unlimited quiz generations and premium features
                    </p>
                  </div>

                  {/* Features Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                    {proFeatures.map((feature, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-3 p-3 bg-white/10 rounded-xl"
                      >
                        <div className="w-6 h-6 bg-gradient-to-br from-purple-400 to-pink-400 rounded-lg flex items-center justify-center">
                          <Check className="w-3 h-3 text-white" />
                        </div>
                        <span className="text-white font-medium">
                          {feature}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Pricing Plans */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    {pricingPlans.map((plan, index) => (
                      <div
                        key={index}
                        className={`relative p-6 rounded-2xl border-2 transition-all duration-300 cursor-pointer hover:scale-105 ${
                          plan.popular
                            ? "border-purple-400 bg-gradient-to-br from-purple-500/20 to-pink-500/20"
                            : "border-white/20 bg-white/10 hover:border-purple-400/50"
                        }`}
                        onClick={onUpgradeToPro}
                      >
                        {plan.popular && (
                          <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                            <span className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                              {plan.savings}
                            </span>
                          </div>
                        )}
                        <div className="text-center">
                          <h4 className="text-lg font-bold text-white mb-2">
                            {plan.name}
                          </h4>
                          <div className="mb-2">
                            <span className="text-3xl font-bold text-white">
                              {plan.price}
                            </span>
                            <span className="text-slate-300 text-sm ml-1">
                              {plan.period}
                            </span>
                          </div>
                          <div className="flex items-center justify-center gap-2 text-purple-200 text-sm">
                            <Zap className="w-4 h-4" />
                            <span>Unlimited Access</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Payment Methods */}
                  <div className="bg-white/10 rounded-xl p-4 mb-6">
                    <div className="flex items-center gap-3 mb-3">
                      <CreditCard className="w-5 h-5 text-white" />
                      <span className="text-white font-medium">
                        Secure Payment
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-300 text-sm">
                      <Shield className="w-4 h-4" />
                      <span>256-bit SSL encryption • PCI DSS compliant</span>
                    </div>
                  </div>

                  {/* Upgrade Button */}
                  <button
                    onClick={onUpgradeToPro}
                    className="w-full py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all duration-300 transform hover:scale-105 shadow-lg"
                  >
                    Upgrade to Pro
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Account Settings */}
          <div className="bg-gradient-to-br from-white/10 to-white/5 rounded-2xl p-6 border border-white/20">
            <h3 className="text-xl font-bold text-white mb-4">
              Account Settings
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-white/10 rounded-xl">
                <div>
                  <h4 className="text-white font-medium">
                    Email Notifications
                  </h4>
                  <p className="text-slate-300 text-sm">
                    Receive updates about new features
                  </p>
                </div>
                <div className="w-12 h-6 bg-purple-500 rounded-full relative cursor-pointer">
                  <div className="w-4 h-4 bg-white rounded-full absolute top-1 right-1 transition-transform"></div>
                </div>
              </div>
              <div className="flex items-center justify-between p-4 bg-white/10 rounded-xl">
                <div>
                  <h4 className="text-white font-medium">Dark Mode</h4>
                  <p className="text-slate-300 text-sm">
                    Use dark theme (already active)
                  </p>
                </div>
                <div className="w-12 h-6 bg-purple-500 rounded-full relative cursor-pointer">
                  <div className="w-4 h-4 bg-white rounded-full absolute top-1 right-1 transition-transform"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
