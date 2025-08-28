import React from 'react';
import { Settings } from 'lucide-react';
import { QuizSettings as QuizSettingsType } from '@/types';

interface QuizSettingsProps {
  quizSettings: QuizSettingsType;
  onUpdateSettings: <K extends keyof QuizSettingsType>(
    key: K,
    value: QuizSettingsType[K]
  ) => void;
}

export default function QuizSettings({ quizSettings, onUpdateSettings }: QuizSettingsProps) {
  return (
    <section className="bg-white/10 backdrop-blur-lg rounded-3xl p-6 md:p-8 border border-white/20 shadow-2xl">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-8 h-8 bg-green-400 rounded-lg flex items-center justify-center">
          <Settings className="w-5 h-5 text-white" />
        </div>
        <h2 className="text-xl font-semibold text-white">Quiz Settings</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div>
          <label htmlFor="questionCount" className="block text-sm font-medium text-purple-200 mb-2">
            Questions
          </label>
          <select
            id="questionCount"
            value={quizSettings.questionCount}
            onChange={(e) => onUpdateSettings("questionCount", parseInt(e.target.value))}
            className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-400 transition-all"
          >
            <option value={5} className="text-gray-900">5 Questions</option>
            <option value={10} className="text-gray-900">10 Questions</option>
            <option value={15} className="text-gray-900">15 Questions</option>
            <option value={20} className="text-gray-900">20 Questions</option>
            <option value={30} className="text-gray-900">30 Questions</option>
            <option value={40} className="text-gray-900">40 Questions</option>
            <option value={50} className="text-gray-900">50 Questions</option>
            <option value={60} className="text-gray-900">60 Questions</option>
            <option value={70} className="text-gray-900">70 Questions</option>
            <option value={80} className="text-gray-900">80 Questions</option>
            <option value={90} className="text-gray-900">90 Questions</option>
            <option value={100} className="text-gray-900">100 Questions</option>
          </select>
        </div>

        <div>
          <label htmlFor="difficulty" className="block text-sm font-medium text-purple-200 mb-2">
            Difficulty
          </label>
          <select
            id="difficulty"
            value={quizSettings.difficulty}
            onChange={(e) => onUpdateSettings("difficulty", e.target.value as QuizSettingsType["difficulty"])}
            className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-400 transition-all"
          >
            <option value="easy" className="text-gray-900">Easy</option>
            <option value="medium" className="text-gray-900">Medium</option>
            <option value="hard" className="text-gray-900">Hard</option>
            <option value="mixed" className="text-gray-900">Mixed</option>
          </select>
        </div>

        <div>
          <label htmlFor="questionType" className="block text-sm font-medium text-purple-200 mb-2">
            Question Type
          </label>
          <select
            id="questionType"
            value={quizSettings.questionType}
            onChange={(e) => onUpdateSettings("questionType", e.target.value as QuizSettingsType["questionType"])}
            className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-400 transition-all"
          >
            <option value="multiple_choice" className="text-gray-900">Multiple Choice</option>
            <option value="true_false" className="text-gray-900">True/False</option>
            <option value="mixed" className="text-gray-900">Mixed Types</option>
          </select>
        </div>

        <div>
          <label htmlFor="focusArea" className="block text-sm font-medium text-purple-200 mb-2">
            Focus Area
          </label>
          <input
            id="focusArea"
            type="text"
            value={quizSettings.focusArea}
            onChange={(e) => onUpdateSettings("focusArea", e.target.value)}
            placeholder="e.g., key concepts"
            className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-purple-400 transition-all"
          />
        </div>
      </div>
    </section>
  );
}
