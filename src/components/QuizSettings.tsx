import { Settings } from "lucide-react";
import { QuizSettings as QuizSettingsType } from "@/types";
import CustomSelect from "@/components/ui/CustomSelect";

interface QuizSettingsProps {
  quizSettings: QuizSettingsType;
  onUpdateSettings: <K extends keyof QuizSettingsType>(
    key: K,
    value: QuizSettingsType[K]
  ) => void;
  onDropdownChange: (dropdownId: string, isOpen: boolean) => void;
}

export default function QuizSettings({
  quizSettings,
  onUpdateSettings,
  onDropdownChange,
}: QuizSettingsProps) {
  return (
    <section className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-3xl p-8 md:p-10 border border-white/20 shadow-2xl hover:shadow-purple-500/10 transition-all duration-300">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/25">
          <Settings className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white">Quiz Settings</h2>
          <p className="text-slate-300 text-sm">
            Customize your learning experience
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div>
          <label className="block text-sm font-semibold text-slate-200 mb-3">
            Questions
          </label>
          <CustomSelect
            options={[
              { value: "5", label: "5 Questions" },
              { value: "10", label: "10 Questions" },
              { value: "15", label: "15 Questions" },
              { value: "20", label: "20 Questions" },
              { value: "30", label: "30 Questions" },
              { value: "40", label: "40 Questions" },
              { value: "50", label: "50 Questions" },
              { value: "60", label: "60 Questions" },
              { value: "70", label: "70 Questions" },
              { value: "80", label: "80 Questions" },
              { value: "90", label: "90 Questions" },
              { value: "100", label: "100 Questions" },
            ]}
            value={quizSettings.questionCount.toString()}
            onChange={(value) =>
              onUpdateSettings("questionCount", parseInt(value))
            }
            placeholder="Select question count"
            onOpenChange={(isOpen) => onDropdownChange("questions", isOpen)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-purple-200 mb-2">
            Difficulty
          </label>
          <CustomSelect
            options={[
              {
                value: "easy",
                label: "Easy",
                description: "Basic concepts",
              },
              {
                value: "medium",
                label: "Medium",
                description: "Standard difficulty",
              },
              {
                value: "hard",
                label: "Hard",
                description: "Advanced concepts",
              },
              {
                value: "mixed",
                label: "Mixed",
                description: "Various difficulty levels",
              },
            ]}
            value={quizSettings.difficulty}
            onChange={(value) =>
              onUpdateSettings(
                "difficulty",
                value as QuizSettingsType["difficulty"]
              )
            }
            placeholder="Select difficulty"
            onOpenChange={(isOpen) => onDropdownChange("difficulty", isOpen)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-purple-200 mb-2">
            Question Type
          </label>
          <CustomSelect
            options={[
              {
                value: "multiple_choice",
                label: "Multiple Choice",
                description: "Choose from options",
              },
              {
                value: "true_false",
                label: "True/False",
                description: "Binary questions",
              },
              {
                value: "flashcard",
                label: "Flashcards",
                description: "Memory cards",
              },
              {
                value: "mixed",
                label: "Mixed Types",
                description: "Various question formats",
              },
            ]}
            value={quizSettings.questionType}
            onChange={(value) =>
              onUpdateSettings(
                "questionType",
                value as QuizSettingsType["questionType"]
              )
            }
            placeholder="Select question type"
            onOpenChange={(isOpen) => onDropdownChange("questionType", isOpen)}
          />
        </div>

        <div>
          <label
            htmlFor="focusArea"
            className="block text-sm font-medium text-purple-200 mb-2"
          >
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
