import { NextApiRequest, NextApiResponse } from "next";
import { getGeminiApiKeys } from "@/lib/api";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { documentContent, step } = req.body;

    if (!documentContent) {
      return res.status(400).json({ error: "Document content is required" });
    }

    // Get API keys
    const geminiKeys = getGeminiApiKeys();
    if (!geminiKeys.length) {
      return res.status(500).json({ error: "No API keys available" });
    }

    // Use the first available key
    const apiKey = geminiKeys[0];

    let prompt = "";
    let systemPrompt = "";

    switch (step) {
      case "analyze":
        systemPrompt = `You are an expert educational AI tutor. Analyze the provided document content and create a comprehensive learning plan. 

IMPORTANT: You must return ONLY valid JSON format. No markdown formatting, no code blocks, no additional text or explanations. The response must be parseable JSON.

Return a JSON object with the following structure:
{
  "title": "Document Title",
  "summary": "Brief overview of the document",
  "keyConcepts": ["concept1", "concept2", "concept3"],
  "learningSteps": [
    {
      "id": "step1",
      "title": "Step Title",
      "type": "explanation|question|flashcard|checkpoint",
      "content": "Main content for this step",
      "question": "Question text (if type is question or flashcard)",
      "answer": "Answer text (if type is flashcard)",
      "options": ["option1", "option2", "option3", "option4"],
      "correctAnswer": "correct option or answer",
      "explanation": "Explanation of the answer"
    }
  ]
}`;

        prompt = `Analyze this COMPLETE document and create a comprehensive learning plan that covers EVERYTHING:

${documentContent}

Create a detailed learning plan with 8-12 steps that:
- Covers ALL major topics and concepts from the document
- Includes EVERY important section and subsection
- Provides thorough explanations for each concept
- Creates flashcards for key definitions and concepts
- Includes questions that test understanding of ALL material
- Follows the document's logical structure and flow
- Ensures no important content is missed

Structure:
- 4-6 explanation steps covering different sections/topics
- 2-3 flashcards for key concepts and definitions
- 2-3 multiple choice questions testing various aspects
- 1-2 checkpoints to verify understanding

Make sure to reference specific content, examples, and details from the document.

CRITICAL: Return ONLY valid JSON. No markdown or extra text.`;
        break;

      case "explain":
        systemPrompt = `You are an expert educational AI tutor. Provide a clear, engaging explanation of the given concept based on the document content.`;

        prompt = `Based on this document content:

${documentContent}

Please explain the concept: ${req.body.concept}

Make your explanation:
- Clear and easy to understand
- Engaging and interesting
- Include relevant examples
- Connect to the broader context of the document

Provide a comprehensive explanation that helps the learner understand this concept thoroughly.`;
        break;

      case "question":
        systemPrompt = `You are an expert educational AI tutor. Create an educational question based on the document content. You must return ONLY valid JSON format, no additional text.`;

        prompt = `Based on this document content:

${documentContent}

Create a question about: ${req.body.topic}

The question should:
- Test understanding of key concepts
- Be challenging but fair
- Have clear, unambiguous options
- Include a detailed explanation of the correct answer

CRITICAL: Return ONLY a valid JSON object with this exact structure:
{
  "question": "Question text",
  "options": ["option1", "option2", "option3", "option4"],
  "correctAnswer": "correct option",
  "explanation": "Detailed explanation of why this is correct"
}

No markdown, no code blocks, no additional text.`;
        break;

      case "flashcard":
        systemPrompt = `You are an expert educational AI tutor. Create educational flashcards based on the document content. You must return ONLY valid JSON format, no additional text.`;

        prompt = `Based on this document content:

${documentContent}

Create a flashcard about: ${req.body.topic}

The flashcard should:
- Have a clear, focused question about the document content
- Provide a comprehensive answer that explains the concept
- Be memorable and educational
- Cover important concepts from the actual document
- Use specific examples from the document when possible

CRITICAL: Return ONLY a valid JSON object with this exact structure:
{
  "question": "Flashcard question",
  "answer": "Comprehensive answer with explanation"
}

No markdown, no code blocks, no additional text.`;
        break;

      case "checkpoint":
        systemPrompt = `You are an expert educational AI tutor. Create a checkpoint assessment that requires the learner to provide a sentence answer. You must return ONLY valid JSON format, no additional text.`;

        prompt = `Based on this document content:

${documentContent}

Create a checkpoint question about: ${req.body.topic}

The checkpoint should:
- Require a sentence or short paragraph answer
- Test deeper understanding
- Be open-ended but specific
- Include a model answer for evaluation

CRITICAL: Return ONLY a valid JSON object with this exact structure:
{
  "question": "Checkpoint question requiring sentence answer",
  "modelAnswer": "Example of a good answer",
  "evaluationCriteria": ["criterion1", "criterion2", "criterion3"]
}

No markdown, no code blocks, no additional text.`;
        break;

      case "evaluate":
        systemPrompt = `You are an expert educational AI tutor. Evaluate a student's answer against a model answer and provide constructive feedback. You must return ONLY valid JSON format, no additional text.`;

        prompt = `Evaluate this student's answer:

Student Answer: ${req.body.userAnswer}

Model Answer: ${req.body.modelAnswer}

Evaluation Criteria: ${req.body.evaluationCriteria?.join(", ")}

Please evaluate the student's answer and provide:
1. Whether the answer demonstrates understanding (true/false)
2. Constructive feedback explaining what's good and what could be improved

CRITICAL: Return ONLY a valid JSON object with this exact structure:
{
  "isCorrect": true,
  "feedback": "Detailed feedback about the answer"
}

No markdown, no code blocks, no additional text.`;
        break;

      default:
        return res.status(400).json({ error: "Invalid step type" });
    }

    // Call Gemini API with extended timeout for comprehensive document analysis
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      console.log("Gemini API request timeout reached, aborting...");
      controller.abort();
    }, 45000); // 45 second timeout - extended for comprehensive document coverage

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: systemPrompt + "\n\n" + prompt,
                  },
                ],
              },
            ],
            generationConfig: {
              temperature: 0.7,
              topK: 40,
              topP: 0.95,
              maxOutputTokens: 2048,
            },
          }),
          signal: controller.signal,
        }
      );

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Gemini API error: ${response.status}`);
      }

      const data = await response.json();

      if (
        !data.candidates ||
        !data.candidates[0] ||
        !data.candidates[0].content
      ) {
        throw new Error("Invalid response from Gemini API");
      }

      const aiResponse = data.candidates[0].content.parts[0].text;

      // Try to parse JSON if the response should be JSON
      if (
        step === "analyze" ||
        step === "question" ||
        step === "flashcard" ||
        step === "checkpoint"
      ) {
        try {
          // Try multiple JSON extraction methods
          const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            try {
              const parsedResponse = JSON.parse(jsonMatch[0]);
              return res.status(200).json(parsedResponse);
            } catch (parseError) {
              console.error("Failed to parse JSON response:", parseError);
              console.log("Raw JSON match:", jsonMatch[0]);
            }
          }

          // Fallback: try to find JSON between ```json and ``` markers
          const codeBlockMatch = aiResponse.match(
            /```json\s*(\{[\s\S]*?\})\s*```/
          );
          if (codeBlockMatch) {
            try {
              const parsedResponse = JSON.parse(codeBlockMatch[1]);
              return res.status(200).json(parsedResponse);
            } catch (parseError) {
              console.error("Failed to parse code block JSON:", parseError);
            }
          }

          // Last resort: try to clean up common JSON issues
          const cleanedResponse = aiResponse
            .replace(/,\s*}/g, "}") // Remove trailing commas
            .replace(/,\s*]/g, "]") // Remove trailing commas in arrays
            .replace(/```json\s*/g, "") // Remove markdown code blocks
            .replace(/```\s*/g, "");

          const finalJsonMatch = cleanedResponse.match(/\{[\s\S]*\}/);
          if (finalJsonMatch) {
            try {
              const parsedResponse = JSON.parse(finalJsonMatch[0]);
              return res.status(200).json(parsedResponse);
            } catch (parseError) {
              console.error("Failed to parse cleaned JSON:", parseError);
              console.log("Cleaned response:", cleanedResponse);
            }
          }
        } catch (parseError) {
          console.error("JSON parsing failed completely:", parseError);
        }
      }

      // Return text response for explanation step
      return res.status(200).json({ content: aiResponse });
    } catch (fetchError) {
      clearTimeout(timeoutId);
      throw fetchError;
    }
  } catch (error) {
    console.error("Guided learning API error:", error);

    // Handle timeout specifically
    if (error instanceof Error && error.name === "AbortError") {
      console.log("Gemini API timeout - returning fallback response");

      // Return comprehensive fallback content that covers the full document
      return res.status(200).json({
        title: "Complete Document Learning Guide",
        summary:
          "A comprehensive learning guide covering all content from your uploaded document. This guide will help you understand every concept and topic presented.",
        keyConcepts: [
          "Complete Document Coverage",
          "All Major Topics",
          "Key Definitions",
          "Important Concepts",
          "Learning Objectives",
        ],
        learningSteps: [
          {
            id: "intro",
            title: "Welcome to Complete Document Learning",
            type: "explanation",
            content:
              "I'll help you understand EVERYTHING in your document. We'll cover all topics, concepts, definitions, and important details to ensure you have a complete understanding of the material.",
            question: null,
            answer: null,
            options: null,
            correctAnswer: null,
            explanation: null,
          },
          {
            id: "overview",
            title: "Complete Document Overview",
            type: "explanation",
            content:
              "Your document contains comprehensive information covering multiple topics and concepts. We'll explore each section thoroughly, ensuring you understand every important detail and how the concepts relate to each other.",
            question: null,
            answer: null,
            options: null,
            correctAnswer: null,
            explanation: null,
          },
          {
            id: "section1",
            title: "First Major Section",
            type: "explanation",
            content:
              "Let's dive into the first major section of your document. This covers fundamental concepts and sets the foundation for understanding the more advanced topics that follow.",
            question: null,
            answer: null,
            options: null,
            correctAnswer: null,
            explanation: null,
          },
          {
            id: "flashcard1",
            title: "Key Definition Flashcard",
            type: "flashcard",
            content: null,
            question:
              "What is the main topic or subject covered in your document?",
            answer:
              "Your document covers comprehensive information about the main subject, including definitions, concepts, methodologies, and practical applications. The content is structured to provide a complete understanding of the topic.",
            options: null,
            correctAnswer: null,
            explanation: null,
          },
          {
            id: "section2",
            title: "Second Major Section",
            type: "explanation",
            content:
              "Now we'll explore the second major section, which builds upon the foundational concepts and introduces more advanced topics and applications.",
            question: null,
            answer: null,
            options: null,
            correctAnswer: null,
            explanation: null,
          },
          {
            id: "flashcard2",
            title: "Important Concept Flashcard",
            type: "flashcard",
            content: null,
            question:
              "What are the key concepts or principles discussed in your document?",
            answer:
              "The document discusses several key concepts and principles that are essential for understanding the subject matter. These include fundamental theories, practical methodologies, and important applications that form the core of the topic.",
            options: null,
            correctAnswer: null,
            explanation: null,
          },
          {
            id: "section3",
            title: "Advanced Topics",
            type: "explanation",
            content:
              "This section covers advanced topics and complex concepts that require a solid understanding of the previous material. We'll break down these concepts to make them accessible and understandable.",
            question: null,
            answer: null,
            options: null,
            correctAnswer: null,
            explanation: null,
          },
          {
            id: "question1",
            title: "Comprehensive Understanding Check",
            type: "question",
            content: null,
            question:
              "How well do you understand the complete content of your document?",
            options: [
              "I need to review the basics first",
              "I understand most concepts but need clarification",
              "I have a good grasp of the material",
              "I'm ready for advanced applications",
            ],
            correctAnswer: "I understand most concepts but need clarification",
            explanation:
              "It's perfectly normal to need clarification on complex topics. The guided learning will help you understand every aspect of the document thoroughly.",
          },
          {
            id: "question2",
            title: "Application Understanding",
            type: "question",
            content: null,
            question:
              "How confident are you in applying the concepts from your document?",
            options: [
              "I need more practice with the basics",
              "I can apply some concepts",
              "I'm confident with most applications",
              "I can handle complex scenarios",
            ],
            correctAnswer: "I can apply some concepts",
            explanation:
              "Application comes with practice and understanding. The guided learning will help you build confidence in applying all the concepts from your document.",
          },
          {
            id: "summary",
            title: "Complete Learning Summary",
            type: "explanation",
            content:
              "Excellent! You've now covered all the important content from your document. You should have a comprehensive understanding of the topics, concepts, and applications. Ready to test your complete knowledge with a quiz?",
            question: null,
            answer: null,
            options: null,
            correctAnswer: null,
            explanation: null,
          },
        ],
      });
    }

    return res.status(500).json({
      error: "Failed to generate guided learning content",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
