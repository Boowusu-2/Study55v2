import React from 'react';
import { TrendingUp, Clock, Target, Award } from 'lucide-react';

interface QuizAnalyticsProps {
  totalQuizzes: number;
  averageScore: number;
  totalQuestions: number;
  studyTime: number; // in minutes
  streakDays: number;
  improvementRate: number;
}

export default function QuizAnalytics({
  totalQuizzes,
  averageScore,
  totalQuestions,
  studyTime,
  streakDays,
  improvementRate
}: QuizAnalyticsProps) {
  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  return (
    <section className="bg-white/10 backdrop-blur-lg rounded-3xl p-6 md:p-8 border border-white/20 shadow-2xl">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-8 h-8 bg-purple-400 rounded-lg flex items-center justify-center">
          <TrendingUp className="w-5 h-5 text-white" />
        </div>
        <h2 className="text-xl font-semibold text-white">Your Learning Analytics</h2>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div className="bg-white/10 rounded-xl p-4 border border-white/20">
          <div className="flex items-center gap-2 mb-2">
            <Target className="w-4 h-4 text-green-400" />
            <span className="text-sm text-purple-200">Average Score</span>
          </div>
          <div className="text-2xl font-bold text-white">{averageScore}%</div>
          <div className="text-xs text-green-400">
            +{improvementRate}% from last week
          </div>
        </div>

        <div className="bg-white/10 rounded-xl p-4 border border-white/20">
          <div className="flex items-center gap-2 mb-2">
            <Award className="w-4 h-4 text-yellow-400" />
            <span className="text-sm text-purple-200">Quizzes Taken</span>
          </div>
          <div className="text-2xl font-bold text-white">{totalQuizzes}</div>
          <div className="text-xs text-purple-200">
            {totalQuestions} questions answered
          </div>
        </div>

        <div className="bg-white/10 rounded-xl p-4 border border-white/20">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-4 h-4 text-blue-400" />
            <span className="text-sm text-purple-200">Study Time</span>
          </div>
          <div className="text-2xl font-bold text-white">{formatTime(studyTime)}</div>
          <div className="text-xs text-purple-200">
            This week
          </div>
        </div>

        <div className="bg-white/10 rounded-xl p-4 border border-white/20">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-orange-400" />
            <span className="text-sm text-purple-200">Streak</span>
          </div>
          <div className="text-2xl font-bold text-white">{streakDays} days</div>
          <div className="text-xs text-orange-400">
            Keep it up!
          </div>
        </div>
      </div>

      {/* Progress Chart Placeholder */}
      <div className="mt-6 p-4 bg-white/5 rounded-xl border border-white/10">
        <h3 className="text-lg font-semibold text-white mb-4">Performance Trend</h3>
        <div className="h-32 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-lg flex items-center justify-center">
          <span className="text-purple-200">Chart visualization coming soon</span>
        </div>
      </div>
    </section>
  );
}
