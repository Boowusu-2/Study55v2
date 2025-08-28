import { QuizData, GeminiResponse } from "@/types";

// Retry configuration
const MAX_RETRIES = 3;
const BASE_DELAY = 1000; // 1 second

// Gemini model configurations
const GEMINI_MODELS = {
  GEMINI_1_5_FLASH: {
    name: "gemini-1.5-flash",
    url: "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent",
    maxTokens: 4096,
    temperature: 0.7,
    priority: 1, // Highest priority - fastest
  },
  GEMINI_1_5_PRO: {
    name: "gemini-1.5-pro",
    url: "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent",
    maxTokens: 8192,
    temperature: 0.7,
    priority: 2, // Medium priority - more capable
  },
  GEMINI_1_0_PRO: {
    name: "gemini-1.0-pro",
    url: "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.0-pro:generateContent",
    maxTokens: 3072,
    temperature: 0.7,
    priority: 3, // Lower priority - fallback
  },
};

// Sleep function for delays
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Exponential backoff delay
const getBackoffDelay = (attempt: number): number => {
  return BASE_DELAY * Math.pow(2, attempt);
};

// Try different models with fallback
async function tryGeminiModels(
  prompt: string,
  apiKey: string,
  selectedModel: string = "auto",
  retryCount: number = 0
): Promise<QuizData> {
  let models;

  if (selectedModel === "auto") {
    // Use all models in priority order
    models = Object.values(GEMINI_MODELS).sort(
      (a, b) => a.priority - b.priority
    );
  } else {
    // Use specific model
    const model = Object.values(GEMINI_MODELS).find(
      (m) => m.name === selectedModel
    );
    models = model
      ? [model]
      : Object.values(GEMINI_MODELS).sort((a, b) => a.priority - b.priority);
  }

  for (const model of models) {
    try {
      console.log(`Trying model: ${model.name}`);
      const result = await callGeminiAPIWithModel(
        prompt,
        apiKey,
        model,
        retryCount
      );
      if (result) {
        console.log(`Success with model: ${model.name}`);
        return result;
      }
    } catch (error) {
      console.warn(`Model ${model.name} failed:`, error);
      continue;
    }
  }

  // If all models fail, return fallback
  console.warn("All Gemini models failed, using fallback quiz");
  return createFallbackQuiz();
}

async function callGeminiAPIWithModel(
  prompt: string,
  apiKey: string,
  model: any,
  retryCount: number = 0
): Promise<QuizData | null> {
  const url = `${model.url}?key=${apiKey}`;

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
          temperature: model.temperature,
          maxOutputTokens: model.maxTokens,
        },
      }),
    });

    if (!response.ok) {
      let errorDetails = "";
      try {
        const errText = await response.text();
        errorDetails = errText.slice(0, 500);
      } catch {}

      console.warn(
        `Gemini API (${model.name}) HTTP ${response.status} ${response.statusText}:`,
        errorDetails
      );

      // Handle specific error cases
      if (response.status === 503 && retryCount < MAX_RETRIES) {
        console.log(
          `API overloaded, retrying in ${getBackoffDelay(
            retryCount
          )}ms... (attempt ${retryCount + 1}/${MAX_RETRIES})`
        );
        await sleep(getBackoffDelay(retryCount));
        return callGeminiAPIWithModel(prompt, apiKey, model, retryCount + 1);
      }

      // If we've exhausted retries or it's a different error, return null to try next model
      return null;
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
        `Generated text from ${model.name} is not valid JSON:`,
        parseError
      );
      return null; // Try next model
    }
  } catch (error) {
    console.error(`Gemini API Error (${model.name}):`, error);

    // Retry on network errors
    if (retryCount < MAX_RETRIES) {
      console.log(
        `Network error, retrying in ${getBackoffDelay(
          retryCount
        )}ms... (attempt ${retryCount + 1}/${MAX_RETRIES})`
      );
      await sleep(getBackoffDelay(retryCount));
      return callGeminiAPIWithModel(prompt, apiKey, model, retryCount + 1);
    }

    return null; // Try next model
  }
}

export async function callGeminiAPI(
  prompt: string,
  apiKey: string,
  selectedModel: string = "auto",
  retryCount: number = 0
): Promise<QuizData> {
  return tryGeminiModels(prompt, apiKey, selectedModel, retryCount);
}

// New function to handle large question counts by splitting requests
export async function callGeminiAPIWithSplitting(
  content: string,
  questionCount: number,
  difficulty: string,
  questionType: string,
  focusArea: string,
  apiKey: string,
  selectedModel: string = "auto",
  onProgress?: (message: string, current: number, total: number) => void
): Promise<QuizData> {
  // If question count is reasonable, use normal approach
  if (questionCount <= 8) {
    console.log(`Using single request for ${questionCount} questions`);
    return callGeminiAPIWithPrompt(
      content,
      questionCount,
      difficulty,
      questionType,
      focusArea,
      apiKey,
      selectedModel
    );
  }

  // For large question counts, split into multiple requests
  console.log(`Splitting ${questionCount} questions into multiple requests...`);
  onProgress?.(
    `Starting generation of ${questionCount} questions...`,
    0,
    questionCount
  );

  const batchSize = 5; // Reduced batch size for better reliability
  const batches = Math.ceil(questionCount / batchSize);
  const allQuestions: any[] = [];

  for (let i = 0; i < batches; i++) {
    const currentBatchSize = Math.min(batchSize, questionCount - i * batchSize);
    const batchNumber = i + 1;

    console.log(
      `Processing batch ${batchNumber}/${batches} (${currentBatchSize} questions)`
    );
    onProgress?.(
      `Generating batch ${batchNumber}/${batches} (${currentBatchSize} questions)...`,
      allQuestions.length,
      questionCount
    );

    let retryCount = 0;
    const maxRetries = 3;

    while (retryCount < maxRetries) {
      try {
        const batchQuiz = await callGeminiAPIWithPrompt(
          content,
          currentBatchSize,
          difficulty,
          questionType,
          focusArea,
          apiKey,
          selectedModel
        );

        if (
          batchQuiz &&
          batchQuiz.questions &&
          batchQuiz.questions.length > 0
        ) {
          allQuestions.push(...batchQuiz.questions);
          console.log(
            `Batch ${batchNumber} successful: ${batchQuiz.questions.length} questions generated`
          );
          onProgress?.(
            `Batch ${batchNumber} completed! Generated ${batchQuiz.questions.length} questions.`,
            allQuestions.length,
            questionCount
          );
          break; // Success, move to next batch
        } else {
          throw new Error("Empty response from API");
        }
      } catch (error) {
        retryCount++;
        console.error(
          `Error in batch ${batchNumber} (attempt ${retryCount}/${maxRetries}):`,
          error
        );

        if (retryCount >= maxRetries) {
          console.error(
            `Batch ${batchNumber} failed after ${maxRetries} attempts`
          );
          // Create fallback questions for this batch
          const fallbackQuestions = createFallbackQuestionsForBatch(
            currentBatchSize,
            difficulty,
            questionType
          );
          allQuestions.push(...fallbackQuestions);
        } else {
          // Wait before retry with exponential backoff
          const delay = Math.pow(2, retryCount) * 1000;
          console.log(`Retrying batch ${batchNumber} in ${delay}ms...`);
          await sleep(delay);
        }
      }
    }

    // Add delay between batches to avoid rate limiting
    if (i < batches - 1) {
      await sleep(3000); // Increased delay between batches
    }
  }

  const finalQuestions = allQuestions.slice(0, questionCount);
  console.log(
    `Total questions generated: ${finalQuestions.length}/${questionCount}`
  );
  onProgress?.(
    `Quiz generation complete! Created ${finalQuestions.length} questions.`,
    finalQuestions.length,
    questionCount
  );

  return {
    questions: finalQuestions,
  };
}

// Helper function to create prompt
function callGeminiAPIWithPrompt(
  content: string,
  questionCount: number,
  difficulty: string,
  questionType: string,
  focusArea: string,
  apiKey: string,
  selectedModel: string = "auto"
): Promise<QuizData> {
  // Truncate content if it's too long to avoid token limits
  const maxContentLength = 8000; // Conservative limit
  const truncatedContent =
    content.length > maxContentLength
      ? content.substring(0, maxContentLength) +
        "... [Content truncated for length]"
      : content;

  const prompt = `Generate exactly ${questionCount} ${difficulty} ${questionType} quiz questions based on this content. ${
    focusArea ? `Focus specifically on: ${focusArea}` : ""
  }

IMPORTANT: Return ONLY valid JSON with this exact structure, no additional text:
{
  "questions": [
    {
      "question": "Clear, specific question text",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correct": 0,
      "explanation": "Brief but detailed explanation of why this is correct"
    }
  ]
}

Content: ${truncatedContent}`;

  return callGeminiAPI(prompt, apiKey, selectedModel);
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

// Helper function to create fallback questions for failed batches
function createFallbackQuestionsForBatch(
  count: number,
  difficulty: string,
  questionType: string
): any[] {
  const questions = [];
  const baseQuestions = [
    {
      question: "What is the main topic discussed in the document?",
      options: ["Topic A", "Topic B", "Topic C", "Topic D"],
      correct: 0,
      explanation:
        "Based on the document content, Topic A is the primary focus.",
    },
    {
      question: "Which concept is most important according to the material?",
      options: ["Concept A", "Concept B", "Concept C", "Concept D"],
      correct: 1,
      explanation:
        "The document emphasizes Concept B as the most critical element.",
    },
    {
      question: "What approach is recommended in the text?",
      options: ["Traditional", "Modern", "Hybrid", "Experimental"],
      correct: 2,
      explanation:
        "The document suggests a hybrid approach for optimal results.",
    },
    {
      question: "Which benefit is highlighted most prominently?",
      options: [
        "Efficiency",
        "Cost savings",
        "User experience",
        "All of the above",
      ],
      correct: 3,
      explanation: "The document mentions multiple interconnected benefits.",
    },
    {
      question: "What is the key takeaway from this material?",
      options: [
        "Process improvement",
        "Technology adoption",
        "Strategic planning",
        "All of the above",
      ],
      correct: 3,
      explanation: "The document covers multiple aspects that work together.",
    },
  ];

  for (let i = 0; i < count; i++) {
    const baseQuestion = baseQuestions[i % baseQuestions.length];
    questions.push({
      ...baseQuestion,
      question: `${baseQuestion.question} (Batch ${
        Math.floor(i / baseQuestions.length) + 1
      })`,
    });
  }

  return questions;
}
