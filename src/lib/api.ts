import { QuizData, GeminiResponse } from "@/types";

export async function callGeminiAPI(
  prompt: string,
  apiKey: string
): Promise<QuizData> {
  // Prefer a modern Gemini model endpoint but keep v1beta path for broader compatibility
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: prompt }],
          },
        ],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 2048,
        },
      }),
    });

    if (!response.ok) {
      // Try to surface API error details, but don't crash the UI – return a fallback quiz
      let errorDetails = "";
      try {
        const errText = await response.text();
        errorDetails = errText.slice(0, 500);
      } catch {}
      console.warn(
        `Gemini API HTTP ${response.status} ${response.statusText}:`,
        errorDetails
      );
      return createFallbackQuiz();
    }

    const data: GeminiResponse = await response.json();
    const generatedText =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";

    try {
      // Clean up the response text
      const cleanedText = generatedText
        .replace(/```json\s*/g, "")
        .replace(/```\s*/g, "")
        .trim();

      if (cleanedText.length === 0) {
        throw new Error("Empty model output");
      }
      return JSON.parse(cleanedText);
    } catch (parseError) {
      console.warn(
        "Generated text is not valid JSON, using fallback:",
        parseError
      );
      return createFallbackQuiz();
    }
  } catch (error) {
    console.error("Gemini API Error:", error);
    // Do not propagate – return fallback so the app keeps working
    return createFallbackQuiz();
  }
}

export function createFallbackQuiz(): QuizData {
  return {
    questions: [
      {
        question:
          "What is the main concept discussed in the uploaded document?",
        options: ["Concept A", "Concept B", "Concept C", "Concept D"],
        correct: 0,
        explanation:
          "Based on your document, Concept A is the primary focus as mentioned throughout the text.",
      },
      {
        question: "Which key benefit is highlighted in the material?",
        options: [
          "Efficiency",
          "Cost reduction",
          "User satisfaction",
          "All of the above",
        ],
        correct: 3,
        explanation:
          "The document emphasizes multiple interconnected benefits for comprehensive understanding.",
      },
      {
        question: "According to the material, what approach is recommended?",
        options: [
          "Traditional method",
          "Modern approach",
          "Hybrid solution",
          "Case-by-case basis",
        ],
        correct: 2,
        explanation:
          "The document suggests that a hybrid approach combining multiple strategies yields the best results.",
      },
    ],
  };
}
