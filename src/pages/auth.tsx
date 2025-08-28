import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import LoginForm from '@/components/LoginForm';
import RegisterForm from '@/components/RegisterForm';
import ForgotPasswordForm from '@/components/ForgotPasswordForm';
import { Brain, BookOpen, Target, Zap } from 'lucide-react';

type AuthMode = 'login' | 'register' | 'forgot-password';

export default function AuthPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const [authMode, setAuthMode] = useState<AuthMode>('login');

  // Redirect if already authenticated
  if (isAuthenticated) {
    if (typeof window !== 'undefined') {
      window.location.href = '/';
    }
    return null;
  }

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white/60">Loading...</p>
        </div>
      </div>
    );
  }

  const renderAuthForm = () => {
    switch (authMode) {
      case 'login':
        return (
          <LoginForm
            onSwitchToRegister={() => setAuthMode('register')}
            onSwitchToForgotPassword={() => setAuthMode('forgot-password')}
          />
        );
      case 'register':
        return (
          <RegisterForm
            onSwitchToLogin={() => setAuthMode('login')}
          />
        );
      case 'forgot-password':
        return (
          <ForgotPasswordForm
            onSwitchToLogin={() => setAuthMode('login')}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex">
      {/* Left Side - Features */}
      <div className="hidden lg:flex lg:w-1/2 bg-black/20 backdrop-blur-sm p-12 flex-col justify-center">
        <div className="max-w-md">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white">SmartStudy</h1>
          </div>
          
          <h2 className="text-4xl font-bold text-white mb-6">
            Transform Your Learning Experience
          </h2>
          
          <p className="text-purple-200 text-lg mb-12">
            Upload your study materials and let AI create personalized quizzes to help you master any subject.
          </p>

          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <BookOpen className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <h3 className="text-white font-semibold mb-1">Smart Content Analysis</h3>
                <p className="text-purple-200 text-sm">
                  AI analyzes your documents and creates relevant, challenging questions
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <Target className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <h3 className="text-white font-semibold mb-1">Personalized Learning</h3>
                <p className="text-purple-200 text-sm">
                  Track your progress and get questions tailored to your learning style
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-pink-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <Zap className="w-5 h-5 text-pink-400" />
              </div>
              <div>
                <h3 className="text-white font-semibold mb-1">Instant Feedback</h3>
                <p className="text-purple-200 text-sm">
                  Get detailed explanations and learn from your mistakes immediately
                </p>
              </div>
            </div>
          </div>

          <div className="mt-12 p-6 bg-white/10 rounded-2xl border border-white/20">
            <p className="text-white/80 text-sm italic">
              &ldquo;SmartStudy has completely transformed how I prepare for exams. The AI-generated questions are incredibly relevant and help me understand concepts better.&rdquo;
            </p>
            <div className="flex items-center gap-3 mt-4">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full"></div>
              <div>
                <p className="text-white font-medium text-sm">Sarah Johnson</p>
                <p className="text-white/60 text-xs">Medical Student</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Auth Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white">SmartStudy</h1>
          </div>

          {/* Auth Form */}
          <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-8 border border-white/20">
            {renderAuthForm()}
          </div>

          {/* Footer */}
          <div className="text-center mt-8">
            <p className="text-white/40 text-sm">
              By continuing, you agree to our{' '}
              <a href="#" className="text-purple-300 hover:text-white transition-colors">
                Terms of Service
              </a>{' '}
              and{' '}
              <a href="#" className="text-purple-300 hover:text-white transition-colors">
                Privacy Policy
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
