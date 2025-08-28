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
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Exponential backoff delay
const getBackoffDelay = (attempt: number): number => {
  return BASE_DELAY * Math.pow(2, attempt);
};

// Try different models with fallback
async function tryGeminiModels(
  prompt: string,
  apiKey: string,
  selectedModel: string = 'auto',
  retryCount: number = 0
): Promise<QuizData> {
  let models;
  
  if (selectedModel === 'auto') {
    // Use all models in priority order
    models = Object.values(GEMINI_MODELS).sort((a, b) => a.priority - b.priority);
  } else {
    // Use specific model
    const model = Object.values(GEMINI_MODELS).find(m => m.name === selectedModel);
    models = model ? [model] : Object.values(GEMINI_MODELS).sort((a, b) => a.priority - b.priority);
  }
  
  for (const model of models) {
    try {
      console.log(`Trying model: ${model.name}`);
      const result = await callGeminiAPIWithModel(prompt, apiKey, model, retryCount);
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
        console.log(`API overloaded, retrying in ${getBackoffDelay(retryCount)}ms... (attempt ${retryCount + 1}/${MAX_RETRIES})`);
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
      console.log(`Network error, retrying in ${getBackoffDelay(retryCount)}ms... (attempt ${retryCount + 1}/${MAX_RETRIES})`);
      await sleep(getBackoffDelay(retryCount));
      return callGeminiAPIWithModel(prompt, apiKey, model, retryCount + 1);
    }
    
    return null; // Try next model
  }
}

export async function callGeminiAPI(
  prompt: string,
  apiKey: string,
  selectedModel: string = 'auto',
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
  selectedModel: string = 'auto'
): Promise<QuizData> {
  // If question count is reasonable, use normal approach
  if (questionCount <= 15) {
    return callGeminiAPIWithPrompt(content, questionCount, difficulty, questionType, focusArea, apiKey, selectedModel);
  }

  // For large question counts, split into multiple requests
  console.log(`Splitting ${questionCount} questions into multiple requests...`);
  
  const batchSize = 10; // Process 10 questions at a time
  const batches = Math.ceil(questionCount / batchSize);
  const allQuestions: any[] = [];

  for (let i = 0; i < batches; i++) {
    const currentBatchSize = Math.min(batchSize, questionCount - i * batchSize);
    const batchNumber = i + 1;
    
    console.log(`Processing batch ${batchNumber}/${batches} (${currentBatchSize} questions)`);
    
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
      
      allQuestions.push(...batchQuiz.questions);
      
      // Add delay between batches to avoid rate limiting
      if (i < batches - 1) {
        await sleep(2000); // 2 second delay between batches
      }
    } catch (error) {
      console.error(`Error in batch ${batchNumber}:`, error);
      // Continue with other batches even if one fails
    }
  }

  return {
    questions: allQuestions.slice(0, questionCount) // Ensure we don't exceed requested count
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
  selectedModel: string = 'auto'
): Promise<QuizData> {
  const prompt = `Create ${questionCount} ${difficulty} ${questionType} quiz questions based on this content. ${
    focusArea ? `Focus on: ${focusArea}` : ""
  }

Content: ${content}

Return ONLY valid JSON with this exact structure:
{
  "questions": [
    {
      "question": "Question text",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correct": 0,
      "explanation": "Detailed explanation"
    }
  ]
}`;

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
