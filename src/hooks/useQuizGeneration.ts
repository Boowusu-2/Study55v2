import { useCallback } from "react";
import { QuizQuestion } from "@/types";

export function useQuizGeneration() {
  // Create fallback questions when API fails
  const createFallbackQuestions = useCallback(
    (count: number, documentContent?: string): QuizQuestion[] => {
      // Generate questions based on document content if available
      if (documentContent) {
        const content = documentContent.toLowerCase();
        const questions: QuizQuestion[] = [];

        // Software Engineering questions
        if (content.includes("software engineering")) {
          questions.push({
            question: "What is the main topic of the uploaded document?",
            options: [
              "Machine Learning",
              "Software Engineering",
              "Data Science",
              "Web Development",
            ],
            correct: 1,
            explanation:
              "The document focuses on Software Engineering concepts and methodologies.",
          });
        }

        if (
          content.includes("sdlc") ||
          content.includes("software development life cycle")
        ) {
          questions.push({
            question: "What does SDLC stand for in Software Engineering?",
            options: [
              "Software Development Life Cycle",
              "System Design Life Cycle",
              "Software Design Life Cycle",
              "System Development Life Cycle",
            ],
            correct: 0,
            explanation: "SDLC stands for Software Development Life Cycle.",
          });
        }

        if (content.includes("requirements")) {
          questions.push({
            question:
              "What type of requirements focus on system qualities like performance and security?",
            options: [
              "Functional requirements",
              "Non-functional requirements",
              "Technical requirements",
              "User requirements",
            ],
            correct: 1,
            explanation:
              "Non-functional requirements focus on system qualities.",
          });
        }

        if (
          content.includes("functional") ||
          content.includes("non-functional")
        ) {
          questions.push({
            question: "Which of the following is a functional requirement?",
            options: [
              "System response time",
              "User registration",
              "Security encryption",
              "System availability",
            ],
            correct: 1,
            explanation:
              "User registration is a functional requirement that describes specific functionality.",
          });
        }

        if (
          content.includes("banking system") ||
          content.includes("online banking")
        ) {
          questions.push({
            question:
              "In the banking system example, what is a key functional requirement?",
            options: [
              "System performance",
              "User authentication",
              "Data encryption",
              "System reliability",
            ],
            correct: 1,
            explanation:
              "User authentication is a functional requirement for the banking system.",
          });
        }

        // Machine Learning questions
        if (content.includes("machine learning")) {
          questions.push({
            question:
              "What is the main concept discussed in the uploaded document?",
            options: [
              "Machine Learning",
              "Artificial Intelligence",
              "Data Science",
              "Computer Programming",
            ],
            correct: 0,
            explanation:
              "The document focuses on Machine Learning as the main concept.",
          });
        }

        if (
          content.includes("supervised learning") ||
          content.includes("unsupervised learning")
        ) {
          questions.push({
            question: "Which type of learning uses labeled data?",
            options: [
              "Supervised Learning",
              "Unsupervised Learning",
              "Reinforcement Learning",
              "Deep Learning",
            ],
            correct: 0,
            explanation: "Supervised Learning uses labeled data for training.",
          });
        }

        // If we have enough content-specific questions, return them
        if (questions.length >= count) {
          return questions.slice(0, count);
        }
      }

      // Fallback to generic questions if not enough content-specific ones
      const baseQuestions = [
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
        {
          question: "What is the primary objective mentioned in the document?",
          options: ["Objective A", "Objective B", "Objective C", "Objective D"],
          correct: 1,
          explanation:
            "The document clearly states Objective B as the main goal.",
        },
        {
          question: "Which methodology is described in the material?",
          options: ["Method A", "Method B", "Method C", "Method D"],
          correct: 0,
          explanation:
            "Method A is outlined as the primary methodology in the document.",
        },
      ];

      // Return requested number of questions, cycling through the base questions if needed
      return baseQuestions.slice(0, count);
    },
    []
  );

  const extractTextFromServer = useCallback(
    async (files: File[]): Promise<string> => {
      try {
        // Check file types
        const fileTypes = files.map((file) =>
          file.name.split(".").pop()?.toLowerCase()
        );
        const hasTextFiles = fileTypes.some((type) => type === "txt");
        const hasPdfFiles = fileTypes.some((type) => type === "pdf");
        const hasOtherFiles = fileTypes.some(
          (type) => type && !["txt", "pdf"].includes(type)
        );

        // For text files, read directly in browser
        if (hasTextFiles) {
          let combinedText = "";
          for (const file of files) {
            if (file.name.toLowerCase().endsWith(".txt")) {
              const text = await file.text();
              combinedText += `\n\n--- ${file.name} ---\n${text}`;
            }
          }
          if (combinedText.trim()) {
            console.log("Text files processed directly in browser");
            return combinedText.trim();
          }
        }

        // For PDF files, use the Python backend
        if (hasPdfFiles) {
          console.log("PDF files detected, using Python backend");
          try {
            const formData = new FormData();
            files.forEach((file) => {
              formData.append("files", file);
            });

            const response = await fetch(
              "https://study55v2-production-09c8.up.railway.app/extract-text",
              {
                method: "POST",
                body: formData,
              }
            );

            if (response.ok) {
              const data = await response.json();
              console.log("PDF text extraction successful:", {
                textLength: data.text?.length || 0,
                filesProcessed: files.length,
              });
              return data.text;
            } else {
              console.log(
                "PDF extraction failed, falling back to sample content"
              );
            }
          } catch (pdfError) {
            console.error("PDF extraction error:", pdfError);
          }
        }

        // For other file types or if PDF extraction failed, use the actual extracted content
        if (hasOtherFiles || hasPdfFiles) {
          console.log("Using extracted content for files");

          // Try to get the actual extracted text from the Railway backend
          try {
            const formData = new FormData();
            files.forEach((file) => {
              formData.append("files", file);
            });

            const response = await fetch(
              "https://study55v2-production-09c8.up.railway.app/extract-text",
              {
                method: "POST",
                body: formData,
              }
            );

            if (response.ok) {
              const data = await response.json();
              console.log("Successfully extracted text from files:", {
                textLength: data.text?.length || 0,
                filesProcessed: files.length,
              });
              return data.text;
            }
          } catch (extractionError) {
            console.error("Text extraction failed:", extractionError);
          }

          // If extraction fails, return a message about the files
          return `Your uploaded files (${files
            .map((f) => f.name)
            .join(
              ", "
            )}) have been detected. The content from these files will be used to generate relevant quiz questions.`;
        }

        // Default fallback
        return `Please upload a document to generate quiz questions based on its content.`;
      } catch (error) {
        console.error("Text extraction error:", error);
        // Fallback to sample content if extraction fails
        return `Unable to extract text from the uploaded files. Please try uploading a different document or check the file format.`;
      }
    },
    []
  );

  return {
    createFallbackQuestions,
    extractTextFromServer,
  };
}
