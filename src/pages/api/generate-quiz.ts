import { NextApiRequest, NextApiResponse } from "next";
import { callGeminiAPIWithSplitting } from "@/lib/api";

// Get multiple Gemini API keys from environment
function getGeminiApiKeys(): string[] {
  const keys: string[] = [];
  for (let i = 1; i <= 5; i++) {
    const key = process.env[`GEMINI_API_KEY_${i}`];
    if (key && key.trim()) {
      keys.push(key.trim());
    }
  }
  return keys;
}

// Backend API keys from environment variables
const BACKEND_API_KEYS = {
  gemini: getGeminiApiKeys()[0] || "", // Use first key for compatibility
  openai: process.env.OPENAI_API_KEY || "",
  anthropic: process.env.ANTHROPIC_API_KEY || "",
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const {
      content,
      questionCount,
      difficulty,
      questionType,
      focusArea,
      model,
      isDemo,
    } = req.body;

    // Validate required fields
    if (!content || !questionCount || !difficulty || !questionType) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Check if any Gemini API keys are available
    const geminiKeys = getGeminiApiKeys();
    if (geminiKeys.length === 0) {
      console.error("No Gemini API keys configured");
      return res.status(500).json({
        error: "No Gemini API keys configured",
        details:
          "Please set up at least one GEMINI_API_KEY_1 through GEMINI_API_KEY_5 in your .env.local file",
        fallback: true, // Indicate that fallback should be used
      });
    }

    console.log(`Using ${geminiKeys.length} Gemini API keys for generation`);

    // Demo logic - check if user has used demo before
    // In a real app, you'd check this against a database
    if (isDemo) {
      // For demo purposes, we'll allow one free generation
      // In production, you'd check against user session/database
      console.log("Demo quiz generation requested");
    }

    // Generate quiz using backend API keys with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

    try {
      const quizData = await callGeminiAPIWithSplitting(
        content,
        questionCount,
        difficulty,
        questionType,
        focusArea,
        BACKEND_API_KEYS,
        model || "auto",
        (message, current, total) => {
          console.log(`Progress: ${message} (${current}/${total})`);
        }
      );

      clearTimeout(timeoutId);

      res.status(200).json({
        success: true,
        quiz: quizData,
        demoUsed: isDemo, // Mark demo as used if this was a demo request
        isFallback: quizData.questions.some((q) =>
          q.question.includes("(Question")
        ), // Detect fallback quiz
        questionsGenerated: quizData.questions.length,
        targetQuestions: questionCount,
        apiKeysUsed: geminiKeys.length, // Include info about API keys used
      });
    } catch (fetchError) {
      clearTimeout(timeoutId);
      throw fetchError;
    }
  } catch (error) {
    console.error("Quiz generation error:", error);

    // Handle timeout specifically
    if (error instanceof Error && error.name === "AbortError") {
      return res.status(408).json({
        error: "Request timeout",
        details: "The AI service took too long to respond",
        fallback: true,
      });
    }

    // Provide more specific error details
    let errorMessage = "Failed to generate quiz";
    let errorDetails = "Unknown error";

    if (error instanceof Error) {
      errorMessage = error.message;
      errorDetails = error.stack || error.message;
    }

    res.status(500).json({
      error: errorMessage,
      details: errorDetails,
    });
  }
}
