import React, { useState, useCallback, useEffect } from "react";
import {
  Play,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Lightbulb,
  Settings,
  X,
  Code,
  Terminal,
  FileCode,
  CheckCircle,
} from "lucide-react";

interface CodingTerminalProps {
  isOpen: boolean;
  onClose: () => void;
  programmingLanguage: string;
  mode?: "modal" | "page";
}

interface CodeExample {
  code: string;
  explanation: string;
  difficulty: "beginner" | "intermediate" | "advanced";
}

interface LearningStep {
  id: string;
  title: string;
  description: string;
  codeExample?: CodeExample;
  exercise?: {
    description: string;
    starterCode: string;
    solution: string;
    hints: string[];
  };
}

export default function CodingTerminal({
  isOpen,
  onClose,
  programmingLanguage,
  mode = "modal",
}: CodingTerminalProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [code, setCode] = useState("");
  const [output, setOutput] = useState("");
  const [learningSteps, setLearningSteps] = useState<LearningStep[]>([]);
  const [isLoadingSteps, setIsLoadingSteps] = useState(true);
  const [showHints, setShowHints] = useState(false);
  const [currentHint, setCurrentHint] = useState(0);
  const [terminalHistory, setTerminalHistory] = useState<string[]>([]);
  const [showSettings, setShowSettings] = useState(false);
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [fontSize, setFontSize] = useState(14);
  const [activeTab, setActiveTab] = useState<"description" | "solution">(
    "description"
  );

  const languageConfigs = {
    python: {
      name: "Python",
      extension: ".py",
      examples: [
        {
          code: `print("Hello, World!")
name = "Alice"
age = 25
print(f"Name: {name}, Age: {age}")`,
          explanation:
            "Python has dynamic typing. Variables can hold different types of data.",
          difficulty: "beginner" as const,
        },
      ],
    },
    javascript: {
      name: "JavaScript",
      extension: ".js",
      examples: [
        {
          code: `console.log("Hello, World!");
let name = "Bob";
const age = 30;
console.log(\`Name: \${name}, Age: \${age}\`);`,
          explanation:
            "JavaScript has var, let, and const for variable declaration.",
          difficulty: "beginner" as const,
        },
      ],
    },
    java: {
      name: "Java",
      extension: ".java",
      examples: [
        {
          code: `public class HelloWorld {
    public static void main(String[] args) {
        System.out.println("Hello, World!");
        String name = "Eve";
        int age = 28;
        System.out.println("Name: " + name + ", Age: " + age);
    }
}`,
          explanation:
            "Java is a statically-typed language with explicit type declarations.",
          difficulty: "beginner" as const,
        },
      ],
    },
  };

  const currentLang =
    languageConfigs[programmingLanguage as keyof typeof languageConfigs] ||
    languageConfigs.python;

  const generateLearningSteps = useCallback(() => {
    setIsLoadingSteps(true);

    const steps: LearningStep[] = [
      {
        id: "basics",
        title: "Basic Syntax",
        description:
          "Let's start with the basic syntax of Python. Every programming language has its own rules and conventions.",
        codeExample: {
          code: `print("Hello, World!")`,
          explanation:
            "The print() function outputs text to the console. Text is enclosed in quotes.",
          difficulty: "beginner",
        },
        exercise: {
          description: "Create a program that prints your name to the console.",
          starterCode: `# Write your code here\n# Use print() to output your name`,
          solution: `print("Your Name")`,
          hints: [
            "Use the print() function",
            "Put your name in quotes",
            "Make sure to use parentheses",
          ],
        },
      },
      {
        id: "variables",
        title: "Variables and Data Types",
        description: "Learn how to store and manipulate data using variables.",
        codeExample: {
          code: `name = "Alice"\nage = 25\nheight = 1.75\nis_student = True`,
          explanation:
            "Python has dynamic typing. Variables can hold different types of data.",
          difficulty: "beginner",
        },
        exercise: {
          description:
            "Create variables for your favorite color and age, then print them.",
          starterCode: `# Create variables here\n# Then print them`,
          solution: `color = "blue"\nage = 20\nprint(f"My favorite color is {color}")`,
          hints: [
            "Use the = sign to assign values",
            "Put text in quotes",
            "Use f-strings for formatting",
          ],
        },
      },
    ];

    setLearningSteps(steps);
    setIsLoadingSteps(false);
  }, []);

  useEffect(() => {
    generateLearningSteps();
  }, [generateLearningSteps]);

  const runCode = () => {
    if (!code.trim()) {
      setOutput("❌ Please write some code first!");
      return;
    }

    setOutput("🔄 Running code...");

    setTimeout(() => {
      let result = "";

      if (code.includes("print") || code.includes("console.log")) {
        const printMatch = code.match(/print\s*\(\s*["']([^"']+)["']\s*\)/);
        const consoleMatch = code.match(
          /console\.log\s*\(\s*["']([^"']+)["']\s*\)/
        );

        if (printMatch) {
          result = printMatch[1];
        } else if (consoleMatch) {
          result = consoleMatch[1];
        }
      }

      if (result) {
        setOutput(`✅ Output:\n${result}`);
        setTerminalHistory((prev) => [...prev, `$ ${code}`, result]);
      } else {
        setOutput("✅ Code executed successfully!");
        setTerminalHistory((prev) => [
          ...prev,
          `$ ${code}`,
          "Code executed successfully",
        ]);
      }
    }, 1000);
  };

  const loadExample = (example: CodeExample) => {
    setCode(example.code);
    setOutput("");
  };

  const clearCode = () => {
    setCode("");
    setOutput("");
  };

  const nextStep = () => {
    if (currentStep < learningSteps.length - 1) {
      setCurrentStep(currentStep + 1);
      setCode("");
      setOutput("");
      setShowHints(false);
      setCurrentHint(0);
    }
  };

  const previousStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      setCode("");
      setOutput("");
      setShowHints(false);
      setCurrentHint(0);
    }
  };

  const showHint = () => {
    setShowHints(true);
    setCurrentHint(0);
  };

  const nextHint = () => {
    if (currentExercise && currentHint < currentExercise.hints.length - 1) {
      setCurrentHint(currentHint + 1);
    }
  };

  const currentExercise = learningSteps[currentStep]?.exercise;
  const currentLearningStep = learningSteps[currentStep];
  const progress = (currentStep / Math.max(learningSteps.length - 1, 1)) * 100;
  const difficultyColor =
    currentLearningStep?.codeExample?.difficulty === "beginner"
      ? "text-green-400"
      : "text-yellow-400";

  if (mode === "modal" && !isOpen) return null;

  // Use completely black background and full screen coverage
  const outerWrapperClass =
    mode === "page"
      ? "fixed inset-0 bg-black z-50 flex items-stretch"
      : "fixed inset-0 bg-black z-50 flex items-center justify-center p-4";
  const shellClass =
    mode === "page"
      ? "w-full h-full flex flex-col bg-black"
      : "bg-black rounded-xl border border-gray-800/50 shadow-2xl w-full max-w-7xl h-[95vh] flex flex-col overflow-hidden";

  return (
    <div className={outerWrapperClass}>
      <div className={shellClass}>
        {/* Header */}
        <div className="bg-black border-b border-gray-700/50 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {mode === "page" && (
              <button
                onClick={onClose}
                className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors mr-2"
                title="Back to Learning Modes"
              >
                <ChevronLeft className="w-5 h-5 text-white" />
              </button>
            )}
            <Code className="w-6 h-6 text-orange-500" />
            <div>
              <h1 className="text-xl font-bold text-white">
                {currentLang.name} - SmartStudy
              </h1>
              <p className="text-sm text-gray-400">
                Interactive Programming Tutorial
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-32 bg-gray-700 rounded-full h-2">
                <div
                  className="bg-orange-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <span className="text-sm text-gray-300">
                Progress: {Math.round(progress)}%
              </span>
            </div>

            <button
              onClick={() => setShowSettings(!showSettings)}
              className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
            >
              <Settings className="w-5 h-5" />
            </button>

            {mode === "modal" && (
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        <div className="flex-1 flex overflow-hidden">
          {/* Left Panel */}
          <div className="w-1/2 bg-black border-r border-gray-700/50 flex flex-col">
            <div className="flex bg-black border-b border-gray-700/50">
              <button
                onClick={() => setActiveTab("description")}
                className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                  activeTab === "description"
                    ? "text-white border-b-2 border-orange-500 bg-black"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                Description
              </button>
              <button
                onClick={() => setActiveTab("solution")}
                className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                  activeTab === "solution"
                    ? "text-white border-b-2 border-orange-500 bg-black"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                Solution
              </button>
            </div>

            <div className="flex-1 overflow-y-auto">
              {activeTab === "description" && (
                <div className="p-6 space-y-6">
                  <div className="bg-black rounded-lg border border-gray-700/50 p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-lg font-semibold text-white">
                        {currentLearningStep?.title}
                      </h3>
                      {currentLearningStep?.codeExample && (
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full ${difficultyColor} bg-gray-800`}
                        >
                          {currentLearningStep.codeExample.difficulty}
                        </span>
                      )}
                    </div>

                    {isLoadingSteps ? (
                      <div className="text-gray-400 text-sm animate-pulse">
                        Loading tutorial...
                      </div>
                    ) : (
                      <div className="text-gray-300 text-sm leading-relaxed whitespace-pre-line">
                        {currentLearningStep?.description}
                      </div>
                    )}
                  </div>

                  {currentLearningStep?.codeExample && (
                    <div className="bg-black rounded-lg border border-gray-700/50">
                      <div className="px-4 py-3 border-b border-gray-700/50">
                        <h4 className="text-sm font-medium text-white flex items-center gap-2">
                          <FileCode className="w-4 h-4" />
                          Example:{" "}
                          {
                            currentLearningStep.codeExample.explanation.split(
                              "."
                            )[0]
                          }
                        </h4>
                        <button
                          onClick={() =>
                            loadExample(currentLearningStep.codeExample!)
                          }
                          className="px-3 py-1.5 bg-orange-600 hover:bg-orange-700 text-white text-xs font-medium rounded-md transition-colors"
                        >
                          Load Example
                        </button>
                      </div>
                      <div className="px-4 pb-4">
                        <p className="text-gray-400 text-sm">
                          {currentLearningStep.codeExample.explanation}
                        </p>
                      </div>
                    </div>
                  )}

                  {currentLearningStep?.exercise && (
                    <div className="bg-black rounded-lg border border-gray-700/50">
                      <div className="px-4 py-3 border-b border-gray-700/50">
                        <h4 className="text-sm font-medium text-white flex items-center gap-2">
                          <CheckCircle className="w-4 h-4" />
                          Exercise
                        </h4>
                      </div>
                      <div className="p-4 space-y-4">
                        <p className="text-gray-300 text-sm">
                          {currentLearningStep.exercise.description}
                        </p>
                        <div className="flex flex-col gap-2">
                          <button
                            onClick={showHint}
                            className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md transition-colors flex items-center gap-2"
                          >
                            <Lightbulb className="w-4 h-4" />
                            Show Hint
                          </button>
                          {showHints && (
                            <div className="bg-black rounded-lg border border-gray-600/50 p-3">
                              <div className="text-gray-300 text-sm mb-2">
                                {
                                  currentLearningStep.exercise.hints[
                                    currentHint
                                  ]
                                }
                              </div>
                              {currentHint <
                                currentLearningStep.exercise.hints.length -
                                  1 && (
                                <button
                                  onClick={nextHint}
                                  className="text-blue-400 hover:text-blue-300 text-xs"
                                >
                                  Next hint →
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === "solution" && currentLearningStep?.codeExample && (
                <div className="p-6">
                  <h4 className="text-lg font-semibold text-white mb-4">
                    Solution Explanation
                  </h4>
                  <div className="bg-black rounded-lg border border-gray-700/50 p-4">
                    <pre className="text-green-400 font-mono text-sm">
                      {currentLearningStep.codeExample.code}
                    </pre>
                  </div>
                </div>
              )}
            </div>

            <div className="p-6 border-t border-gray-700/50">
              <div className="flex items-center justify-between">
                <button
                  onClick={previousStep}
                  disabled={currentStep === 0}
                  className="px-4 py-2 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:text-gray-500 text-white rounded-lg transition-colors flex items-center gap-2"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Previous
                </button>

                <span className="text-sm text-gray-400">
                  Step {currentStep + 1} of {learningSteps.length}
                </span>

                <button
                  onClick={nextStep}
                  disabled={currentStep === learningSteps.length - 1}
                  className="px-4 py-2 bg-orange-600 hover:bg-orange-700 disabled:bg-orange-800 disabled:text-gray-500 text-white rounded-lg transition-colors flex items-center gap-2"
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Right Panel */}
          <div className="w-1/2 bg-black flex flex-col">
            <div className="bg-black border-b border-gray-700/50 px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileCode className="w-4 h-4 text-blue-400" />
                <span className="text-sm font-medium text-white">
                  script{currentLang.extension}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={runCode}
                  className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-md transition-colors flex items-center gap-2"
                >
                  <Play className="w-4 h-4" />
                  Run
                </button>
                <button
                  onClick={clearCode}
                  className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="flex-1 relative">
              <textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder={`// Write your ${currentLang.name} code here\n// Example:\n${currentLang.examples[0].code}`}
                className="w-full h-full p-6 bg-black text-white font-mono text-sm leading-6 resize-none outline-none border-none"
                style={{ fontSize: `${fontSize}px` }}
              />
            </div>

            <div className="bg-black border-t border-gray-700/50">
              <div className="px-4 py-2 border-b border-gray-700/50 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-green-400" />
                  <span className="text-sm font-medium text-white">
                    Terminal
                  </span>
                </div>
                <button
                  onClick={() => setTerminalHistory([])}
                  className="text-gray-400 hover:text-white text-xs"
                >
                  Clear
                </button>
              </div>

              <div className="p-4 h-32 overflow-y-auto bg-black">
                {terminalHistory.length === 0 ? (
                  <div className="text-gray-500 text-sm">
                    Run your code to see output here...
                  </div>
                ) : (
                  <div className="space-y-1">
                    {terminalHistory.map((line, index) => (
                      <div key={index} className="text-sm">
                        <span
                          className={
                            line.startsWith("$")
                              ? "text-green-400"
                              : "text-white"
                          }
                        >
                          {line}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {output && (
                  <div className="mt-3 p-3 bg-black rounded-lg border-l-4 border-green-500">
                    <div className="text-white font-medium mb-1">Output:</div>
                    <div className="text-green-300">{output}</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {showSettings && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10">
            <div className="bg-black rounded-lg border border-gray-700/50 p-6 w-80">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Settings</h3>
                <button
                  onClick={() => setShowSettings(false)}
                  className="text-gray-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-gray-300 text-sm block mb-2">
                    Theme
                  </label>
                  <select
                    value={theme}
                    onChange={(e) =>
                      setTheme(e.target.value as "dark" | "light")
                    }
                    className="w-full px-3 py-2 bg-black border border-gray-600/50 rounded-lg text-white text-sm"
                  >
                    <option value="dark">Dark</option>
                    <option value="light">Light</option>
                  </select>
                </div>

                <div>
                  <label className="text-gray-300 text-sm block mb-2">
                    Font Size
                  </label>
                  <input
                    type="range"
                    min="12"
                    max="20"
                    value={fontSize}
                    onChange={(e) => setFontSize(Number(e.target.value))}
                    className="w-full"
                  />
                  <span className="text-gray-400 text-xs">{fontSize}px</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
