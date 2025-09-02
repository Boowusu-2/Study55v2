import { QuizData, QuizQuestion, QuizSettings } from "@/types";

// Retry configuration
const MAX_RETRIES = 3;
const BASE_DELAY = 1000; // 1 second

// AI Provider configurations - Only Gemini for now
const AI_PROVIDERS = {
  // Gemini models (Google) - Updated to Gemini 2.0
  GEMINI_2_0_FLASH: {
    name: "gemini-2.0-flash",
    provider: "gemini",
    url: "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent",
    maxTokens: 4096,
    temperature: 0.7,
    priority: 1, // Highest priority - fastest
  },
  GEMINI_1_5_PRO: {
    name: "gemini-1.5-pro",
    provider: "gemini",
    url: "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent",
    maxTokens: 8192,
    temperature: 0.7,
    priority: 2, // Medium priority - more capable
  },
};

// Sleep function for delays
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Exponential backoff delay
const getBackoffDelay = (attempt: number): number => {
  return BASE_DELAY * Math.pow(2, attempt);
};

interface AIModel {
  name: string;
  provider: string;
  url: string;
  maxTokens: number;
  temperature: number;
  priority: number;
}

// Get multiple Gemini API keys from environment
export function getGeminiApiKeys(): string[] {
  const keys: string[] = [];
  for (let i = 1; i <= 5; i++) {
    const key = process.env[`GEMINI_API_KEY_${i}`];
    if (key && key.trim()) {
      keys.push(key.trim());
    }
  }
  return keys;
}

// API key rotation with round-robin
// let currentKeyIndex = 0;
// function getNextApiKey(apiKeys: string[]): string {
//   if (apiKeys.length === 0) return "";
//   const key = apiKeys[currentKeyIndex];
//   currentKeyIndex = (currentKeyIndex + 1) % apiKeys.length;
//   return key;
// }

// Try Gemini models only with multiple API keys
async function tryAIProviders(
  prompt: string,
  apiKeys: { gemini?: string; openai?: string; anthropic?: string },
  selectedModel: string = "auto",
  retryCount: number = 0
): Promise<QuizData> {
  let models: AIModel[] = [];

  if (selectedModel === "auto") {
    // Use only Gemini models in priority order
    models = Object.values(AI_PROVIDERS)
      .filter((model) => model.provider === "gemini")
      .sort((a, b) => a.priority - b.priority);
  } else {
    // Use specific Gemini model if available
    const model = Object.values(AI_PROVIDERS).find(
      (m) => m.name === selectedModel && m.provider === "gemini"
    );
    if (model) {
      models = [model];
    }

    // Fallback to available Gemini models if specific model not found
    if (models.length === 0) {
      models = Object.values(AI_PROVIDERS)
        .filter((model) => model.provider === "gemini")
        .sort((a, b) => a.priority - b.priority);
    }
  }

  // Get all available Gemini API keys
  const geminiKeys = getGeminiApiKeys();
  if (geminiKeys.length === 0) {
    console.warn("No Gemini API keys configured");
    return { questions: [] };
  }

  for (const model of models) {
    // Try each API key for this model
    for (let keyIndex = 0; keyIndex < geminiKeys.length; keyIndex++) {
      const apiKey = geminiKeys[keyIndex];
      try {
        console.log(
          `Trying ${model.provider} model: ${model.name} with key ${
            keyIndex + 1
          }`
        );
        const result = await callAIProvider(
          prompt,
          { gemini: apiKey },
          model,
          retryCount
        );
        if (result) {
          console.log(
            `Success with ${model.provider} model: ${model.name} using key ${
              keyIndex + 1
            }`
          );
          return result;
        }
      } catch (error) {
        console.warn(
          `Gemini model ${model.name} with key ${keyIndex + 1} failed:`,
          error
        );

        // If it's a quota error, skip this key
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        if (
          errorMessage.includes("quota") ||
          errorMessage.includes("insufficient_quota")
        ) {
          console.warn(`Skipping key ${keyIndex + 1} due to quota issues`);
          continue;
        }

        // For other errors, continue to next key
        continue;
      }
    }
  }

  // If all Gemini models and keys fail, return empty quiz (no fallback)
  console.warn(
    "All Gemini models and API keys failed - no questions generated"
  );
  return {
    questions: [],
  };
}

async function callAIProvider(
  prompt: string,
  apiKeys: { gemini?: string; openai?: string; anthropic?: string },
  model: AIModel,
  retryCount: number = 0
): Promise<QuizData | null> {
  const apiKey = apiKeys.gemini;
  if (!apiKey) {
    console.warn("No Gemini API key provided");
    return null;
  }

  try {
    let generatedText = "";

    // Only Gemini API call
    const url = `${model.url}?key=${apiKey}`;
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

    if (response.ok) {
      const data = await response.json();
      generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
    }

    if (!response.ok) {
      let errorDetails = "";
      try {
        const errText = await response.text();
        errorDetails = errText.slice(0, 500);
      } catch {}

      console.warn(
        `GEMINI API (${model.name}) HTTP ${response.status} ${response.statusText}:`,
        errorDetails
      );

      // Check for quota/rate limit errors
      const isQuotaError =
        response.status === 429 ||
        (response.status === 400 && errorDetails.includes("quota")) ||
        (response.status === 400 &&
          errorDetails.includes("insufficient_quota")) ||
        (response.status === 400 &&
          errorDetails.includes("RESOURCE_EXHAUSTED"));

      // For quota errors, don't retry - move to next model immediately
      if (isQuotaError) {
        console.warn(
          `Gemini ${model.name} quota exceeded, skipping to next model`
        );
        return null;
      }

      // Retry on rate limits or server errors (but not quota errors)
      if (
        (response.status === 429 || response.status >= 500) &&
        retryCount < MAX_RETRIES
      ) {
        console.log(
          `Retrying ${model.name} in ${getBackoffDelay(retryCount)}ms...`
        );
        await sleep(getBackoffDelay(retryCount));
        return callAIProvider(prompt, apiKeys, model, retryCount + 1);
      }

      return null;
    }

    if (!generatedText) {
      console.warn(`No text generated by ${model.name}`);
      return null;
    }

    // Try to parse JSON response
    try {
      // Clean up the response text
      const cleanedText = generatedText
        .replace(/```json\s*/g, "")
        .replace(/```\s*/g, "")
        .trim();

      if (cleanedText.length === 0) {
        throw new Error("Empty model output");
      }

      const quizData = JSON.parse(cleanedText);
      if (quizData.questions && Array.isArray(quizData.questions)) {
        return quizData;
      }
    } catch (parseError) {
      console.warn(
        `Generated text from ${model.name} is not valid JSON:`,
        parseError
      );
    }

    return null;
  } catch (error) {
    console.error(`GEMINI API Error (${model.name}):`, error);

    // Retry on network errors
    if (retryCount < MAX_RETRIES) {
      console.log(
        `Retrying ${model.name} due to network error in ${getBackoffDelay(
          retryCount
        )}ms...`
      );
      await sleep(getBackoffDelay(retryCount));
      return callAIProvider(prompt, apiKeys, model, retryCount + 1);
    }

    return null;
  }
}

export async function callGeminiAPI(
  prompt: string,
  apiKey: string,
  selectedModel: string = "auto",
  retryCount: number = 0
): Promise<QuizData> {
  return tryAIProviders(prompt, { gemini: apiKey }, selectedModel, retryCount);
}

// Helper function to chunk content for diverse questions
function chunkContent(content: string, maxChunkSize: number): string[] {
  const chunks: string[] = [];
  const contentLength = content.length;

  for (let i = 0; i < contentLength; i += maxChunkSize) {
    const chunk = content.substring(i, i + maxChunkSize);
    chunks.push(chunk);
  }

  return chunks;
}

// New function to handle large question counts by splitting requests
export async function callGeminiAPIWithSplitting(
  content: string,
  questionCount: number,
  difficulty: string,
  questionType: string,
  focusArea: string,
  apiKeys: { gemini?: string; openai?: string; anthropic?: string },
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
      apiKeys,
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
  const allQuestions: QuizQuestion[] = [];

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

    // Get a different chunk of content for each batch to ensure diversity
    const contentChunk = content.substring(
      (batchNumber - 1) * Math.floor(content.length / batches),
      batchNumber * Math.floor(content.length / batches)
    );

    let retryCount = 0;
    const maxRetries = 3;

    while (retryCount < maxRetries) {
      try {
        const batchQuiz = await callGeminiAPIWithPrompt(
          contentChunk,
          currentBatchSize,
          difficulty,
          questionType,
          focusArea,
          apiKeys,
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
          // Don't create fallback questions - just skip this batch
          // This preserves any successfully generated questions from previous batches
          console.log(
            `Skipping batch ${batchNumber} - will use available questions`
          );
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

  // Deduplicate questions to ensure no repeats
  const uniqueQuestions = deduplicateQuestions(allQuestions);
  const finalQuestions = uniqueQuestions.slice(0, questionCount);

  console.log(
    `Total questions generated: ${finalQuestions.length}/${questionCount} (${
      allQuestions.length - uniqueQuestions.length
    } duplicates removed)`
  );

  // Only use fallback if no questions were generated at all
  if (finalQuestions.length === 0) {
    console.warn("No questions generated from any batch, using fallback quiz");
    const fallbackQuiz = createFallbackQuiz(questionCount);
    onProgress?.(
      `Using fallback questions due to API failures. Generated ${fallbackQuiz.questions.length} questions.`,
      fallbackQuiz.questions.length,
      questionCount
    );
    return fallbackQuiz;
  }

  onProgress?.(
    `Quiz generation complete! Created ${finalQuestions.length} unique questions.`,
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
  apiKeys: { gemini?: string; openai?: string; anthropic?: string },
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

CRITICAL REQUIREMENTS:
1. Each question must be UNIQUE and cover DIFFERENT aspects of the content
2. Avoid repetitive questions or similar topics
3. Vary the question types and difficulty within the specified range
4. Cover different sections, concepts, and details from the provided content
5. Ensure all answer options are plausible and well-distributed

IMPORTANT: Return ONLY valid JSON with this exact structure, no additional text:
{
  "questions": [
    {
      "question": "Clear, specific question text covering unique content",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correct": 0,
      "explanation": "Brief but detailed explanation of why this is correct"
    }
  ]
}

Content: ${truncatedContent}`;

  return tryAIProviders(prompt, apiKeys, selectedModel);
}

export function createFallbackQuiz(questionCount: number = 10): QuizData {
  const baseQuestions = [
    {
      question: "What is the main concept discussed in the uploaded document?",
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
    {
      question: "What is the primary objective mentioned in the document?",
      options: ["Objective A", "Objective B", "Objective C", "Objective D"],
      correct: 1,
      explanation: "The document clearly states Objective B as the main goal.",
    },
    {
      question: "Which methodology is described in the material?",
      options: ["Method A", "Method B", "Method C", "Method D"],
      correct: 0,
      explanation:
        "Method A is outlined as the primary methodology in the document.",
    },
    {
      question: "What challenge is identified in the document?",
      options: ["Challenge A", "Challenge B", "Challenge C", "Challenge D"],
      correct: 2,
      explanation:
        "The document highlights Challenge C as a significant obstacle.",
    },
    {
      question:
        "Which factor is crucial for success according to the material?",
      options: ["Factor A", "Factor B", "Factor C", "Factor D"],
      correct: 1,
      explanation: "Factor B is emphasized as essential for achieving success.",
    },
    {
      question: "What outcome is expected from following the guidelines?",
      options: ["Outcome A", "Outcome B", "Outcome C", "Outcome D"],
      correct: 3,
      explanation:
        "Outcome D represents the expected result of following the guidelines.",
    },
    {
      question: "Which principle underlies the main concepts?",
      options: ["Principle A", "Principle B", "Principle C", "Principle D"],
      correct: 0,
      explanation:
        "Principle A forms the foundation of the main concepts discussed.",
    },
    {
      question: "What strategy is recommended for implementation?",
      options: ["Strategy A", "Strategy B", "Strategy C", "Strategy D"],
      correct: 2,
      explanation: "Strategy C is recommended as the most effective approach.",
    },
  ];

  // Generate the requested number of questions by cycling through base questions
  const questions = [];
  for (let i = 0; i < questionCount; i++) {
    const baseQuestion = baseQuestions[i % baseQuestions.length];
    questions.push({
      ...baseQuestion,
      question: `${baseQuestion.question} (Question ${i + 1})`,
    });
  }

  return { questions };
}

// Helper function to deduplicate questions
function deduplicateQuestions(questions: QuizQuestion[]): QuizQuestion[] {
  const seen = new Set<string>();
  const unique: QuizQuestion[] = [];

  for (const question of questions) {
    // Create a normalized version of the question for comparison
    const normalized = question.question
      .toLowerCase()
      .replace(/[^\w\s]/g, "") // Remove punctuation
      .replace(/\s+/g, " ") // Normalize whitespace
      .trim();

    if (!seen.has(normalized)) {
      seen.add(normalized);
      unique.push(question);
    }
  }

  return unique;
}

// Function to shuffle array (Fisher-Yates algorithm)
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// Function to randomize quiz options and update correct answer index
function randomizeQuizOptions(question: QuizQuestion): QuizQuestion {
  if (!question.options || question.options.length === 0) {
    return question;
  }

  // Shuffle the options
  const shuffledOptions = shuffleArray(question.options);

  // Find the new position of the correct answer
  const correctAnswer = question.options[question.correct];
  const newCorrectIndex = shuffledOptions.indexOf(correctAnswer);

  return {
    ...question,
    options: shuffledOptions,
    correct: newCorrectIndex,
  };
}

export async function generateQuiz(
  documentContent: string,
  settings: QuizSettings,
  customApiKey?: string,
  useCustomApiKey?: boolean
): Promise<QuizData> {
  console.log("Generating quiz with settings:", settings);
  console.log("Document content length:", documentContent.length);

  // Chunk the document content if it's too long
  const maxChunkSize = 8000; // Reduced from 10000 to ensure better processing
  const chunks = chunkContent(documentContent, maxChunkSize);
  console.log(`Document split into ${chunks.length} chunks`);

  let allQuestions: QuizQuestion[] = [];
  let attempts = 0;
  const maxAttempts = 3;

  while (
    allQuestions.length < settings.questionCount &&
    attempts < maxAttempts
  ) {
    attempts++;
    console.log(`Attempt ${attempts}: Generating questions...`);

    try {
      // Generate questions from each chunk
      const chunkPromises = chunks.map(async (chunk, chunkIndex) => {
        const questionsPerChunk = Math.ceil(
          settings.questionCount / chunks.length
        );
        console.log(
          `Chunk ${chunkIndex + 1}: Generating ${questionsPerChunk} questions`
        );

        const response = await fetch(
          "https://study55v2-production-09c8.up.railway.app/generate-quiz",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              documentContent: chunk,
              questionCount: questionsPerChunk,
              difficulty: settings.difficulty,
              questionType: settings.questionType,
              focusArea: settings.focusArea,
              model: settings.model,
              customApiKey: useCustomApiKey ? customApiKey : undefined,
            }),
          }
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log(`Chunk ${chunkIndex + 1} response:`, data);

        if (data.questions && Array.isArray(data.questions)) {
          // Randomize the options for each question
          const randomizedQuestions = data.questions.map(randomizeQuizOptions);
          return randomizedQuestions;
        } else {
          console.warn(`Chunk ${chunkIndex + 1}: Invalid response format`);
          return [];
        }
      });

      const chunkResults = await Promise.all(chunkPromises);
      const newQuestions = chunkResults.flat();

      // Remove duplicates based on question content
      const uniqueQuestions = deduplicateQuestions([
        ...allQuestions,
        ...newQuestions,
      ]);

      // Update the questions array
      allQuestions = uniqueQuestions;

      console.log(
        `Total questions after attempt ${attempts}: ${allQuestions.length}`
      );

      // If we have enough questions, break
      if (allQuestions.length >= settings.questionCount) {
        break;
      }

      // Wait a bit before retrying
      if (attempts < maxAttempts) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    } catch (error) {
      console.error(`Attempt ${attempts} failed:`, error);

      if (attempts === maxAttempts) {
        throw new Error(
          `Failed to generate quiz after ${maxAttempts} attempts: ${error}`
        );
      }
    }
  }

  // Ensure we have the exact number of questions requested
  if (allQuestions.length > settings.questionCount) {
    allQuestions = allQuestions.slice(0, settings.questionCount);
  }

  // Final randomization of all questions to ensure variety
  allQuestions = shuffleArray(allQuestions);

  console.log(`Final quiz generated with ${allQuestions.length} questions`);
  return { questions: allQuestions };
}
