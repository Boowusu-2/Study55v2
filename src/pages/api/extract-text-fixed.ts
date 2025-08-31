import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // For now, let's create a simple text extraction that works
    // This will handle basic text input and return sample content

    const { text, documentType } = req.body;

    if (!text && !documentType) {
      return res.status(400).json({
        error: "No content provided",
        message: "Please provide text content or specify document type",
      });
    }

    // If text is provided directly, use it
    if (text) {
      return res.status(200).json({
        text: text,
        filesProcessed: 1,
        message: "Text processed successfully",
      });
    }

    // For document types, return sample content
    let sampleText = "";

    switch (documentType) {
      case "machine-learning":
        sampleText = `
Introduction to Machine Learning

Machine learning is a subset of artificial intelligence that enables computers to learn and make decisions from data without being explicitly programmed.

Key Concepts:
1. Supervised Learning: Learning from labeled data
2. Unsupervised Learning: Finding patterns in unlabeled data
3. Reinforcement Learning: Learning through trial and error

Applications:
- Image recognition
- Natural language processing
- Recommendation systems
- Autonomous vehicles

The machine learning process involves:
1. Data collection and preprocessing
2. Feature engineering
3. Model selection and training
4. Evaluation and validation
5. Deployment and monitoring
        `;
        break;

      case "python":
        sampleText = `
Python Programming Fundamentals

Python is a high-level, interpreted programming language known for its simplicity and readability.

Key Features:
1. Easy to learn and use
2. Extensive standard library
3. Cross-platform compatibility
4. Strong community support

Common Use Cases:
- Web development
- Data analysis
- Machine learning
- Automation
- Scientific computing

Basic Syntax:
- Variables and data types
- Control structures
- Functions and modules
- Object-oriented programming
- Error handling
        `;
        break;

      default:
        sampleText = `
Sample Document Content

This is a sample document that demonstrates the text extraction functionality.

Topics Covered:
1. Document processing
2. Text extraction
3. Content analysis
4. AI integration

This content can be used to test:
- Guided learning features
- Quiz generation
- Content analysis
- AI processing capabilities
        `;
    }

    return res.status(200).json({
      text: sampleText.trim(),
      filesProcessed: 1,
      message: "Sample content generated successfully",
      documentType: documentType || "default",
    });
  } catch (error) {
    console.error("API handler error:", error);
    return res.status(500).json({
      error: "Server error",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
}

