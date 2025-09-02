import React, { useState, useRef, useEffect } from "react";
import { Send, X, Loader2, Bot, User } from "lucide-react";
import { LearningAssistantMessage } from "@/types";

interface LearningAssistantProps {
  isOpen: boolean;
  onClose: () => void;
  currentTopic?: string;
  customApiKey?: string;
  useCustomApiKey?: boolean;
}

export default function LearningAssistant({
  isOpen,
  onClose,
  currentTopic,
  customApiKey = "",
  useCustomApiKey = false,
}: LearningAssistantProps) {
  const [messages, setMessages] = useState<LearningAssistantMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      content: `Hello! I'm your AI Learning Assistant. I'm here to help you with any questions you have about learning, studying, or understanding concepts. 

${
  currentTopic
    ? `I see you're currently studying: **${currentTopic}**. Feel free to ask me anything about this topic or any other subject!`
    : "What would you like to learn about today?"
}

I can help you with:
• Understanding complex concepts
• Study strategies and techniques
• Breaking down difficult topics
• Providing examples and analogies
• Answering questions about any subject
• Learning tips and best practices

What would you like to explore?`,
      timestamp: new Date(),
    },
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: LearningAssistantMessage = {
      id: Date.now().toString(),
      role: "user",
      content: inputMessage,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage("");
    setIsLoading(true);

    try {
      console.log("Sending message to AI Learning Assistant:", inputMessage);

      // Use the Railway backend for AI-powered responses
      const requestBody: {
        message: string;
        conversationHistory: LearningAssistantMessage[];
        currentTopic?: string;
        customApiKey?: string;
      } = {
        message: inputMessage,
        conversationHistory: messages,
        currentTopic,
      };

      if (useCustomApiKey && customApiKey) {
        requestBody.customApiKey = customApiKey;
      }

      console.log("Request body:", requestBody);

      const response = await fetch(
        "https://study55v2-production-09c8.up.railway.app/learning-assistant",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestBody),
        }
      );

      console.log("Response status:", response.status);
      console.log("Response headers:", response.headers);

      if (response.ok) {
        const data = await response.json();
        console.log("AI Response data:", data);

        const assistantMessage: LearningAssistantMessage = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content:
            data.response ||
            "I received a response but it seems empty. Could you try asking your question again?",
          timestamp: new Date(),
          relatedConcepts: data.relatedConcepts || [],
        };
        setMessages((prev) => [...prev, assistantMessage]);
      } else {
        // Only use fallback for actual errors, not as default
        const errorText = await response.text();
        console.error(
          "Backend error:",
          response.status,
          response.statusText,
          errorText
        );

        const assistantMessage: LearningAssistantMessage = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: `I'm having trouble connecting to my AI brain right now (Error: ${response.status}). Please try again in a moment, or check your internet connection.`,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, assistantMessage]);
      }
    } catch (error) {
      console.error("Error calling learning assistant:", error);
      // Network error fallback
      const assistantMessage: LearningAssistantMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content:
          "I'm experiencing a network connection issue. Please check your internet connection and try again. I'm here to help once we're connected!",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 rounded-3xl shadow-2xl w-full max-w-4xl h-[85vh] flex flex-col border border-slate-700 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700 bg-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">
                AI Learning Assistant
              </h2>
              <p className="text-slate-300 text-sm">
                {currentTopic
                  ? `Currently studying: ${currentTopic}`
                  : "Your personal learning companion"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Messages Container - Fixed height with proper scrolling */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-900">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-3 ${
                message.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              {message.role === "assistant" && (
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <Bot className="w-4 h-4 text-white" />
                </div>
              )}

              <div
                className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                  message.role === "user"
                    ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white"
                    : "bg-slate-800 text-slate-100 border border-slate-600"
                }`}
              >
                <div className="whitespace-pre-wrap break-words leading-relaxed">
                  {message.content}
                </div>
                {message.relatedConcepts &&
                  message.relatedConcepts.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-slate-600">
                      <p className="text-xs text-slate-400 mb-2">
                        Related concepts:
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {message.relatedConcepts.map((concept, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-slate-700 text-xs text-slate-200 rounded-full"
                          >
                            {concept}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                <div className="text-xs text-slate-400 mt-2">
                  {message.timestamp.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
              </div>

              {message.role === "user" && (
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <User className="w-4 h-4 text-white" />
                </div>
              )}
            </div>
          ))}

          {isLoading && (
            <div className="flex gap-3 justify-start">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div className="bg-slate-800 rounded-2xl px-4 py-3 border border-slate-600">
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-blue-400" />
                  <span className="text-slate-300">Thinking...</span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Section - Fixed at bottom */}
        <div className="p-6 border-t border-slate-700 bg-slate-800">
          <div className="flex gap-3">
            <input
              ref={inputRef}
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask me anything about learning, studying, or any subject..."
              className="flex-1 px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={isLoading}
            />
            <button
              onClick={handleSendMessage}
              disabled={!inputMessage.trim() || isLoading}
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center gap-2"
            >
              <Send className="w-4 h-4" />
              Send
            </button>
          </div>

          {/* Quick Suggestions */}
          <div className="mt-4 flex flex-wrap gap-2">
            {[
              "How can I improve my memory?",
              "What are effective study techniques?",
              "How do I stay focused while studying?",
              "Can you explain this concept simply?",
            ].map((suggestion) => (
              <button
                key={suggestion}
                onClick={() => setInputMessage(suggestion)}
                className="px-3 py-1 bg-slate-700 hover:bg-slate-600 text-slate-300 text-xs rounded-lg transition-colors border border-slate-600"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
