import type { NextApiRequest, NextApiResponse } from "next";

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // For now, let's create a simple solution that works with text files
    // This will handle the basic case and provide clear feedback for other file types

    // Read the raw body
    const chunks: Buffer[] = [];
    for await (const chunk of req) {
      chunks.push(chunk);
    }
    const buffer = Buffer.concat(chunks);

    // Convert to string and look for file content
    const bodyString = buffer.toString("utf8");

    // Simple text extraction - look for content between boundaries
    const textMatch = bodyString.match(
      /Content-Type: text\/plain[\s\S]*?\r?\n\r?\n([\s\S]*?)(?=\r?\n--|$)/
    );

    if (textMatch && textMatch[1]) {
      const extractedText = textMatch[1].trim();

      return res.status(200).json({
        text: extractedText,
        filesProcessed: 1,
        message: "Text extracted from uploaded file",
        fileTypes: ["txt"],
      });
    }

    // If no text content found, provide helpful message
    return res.status(200).json({
      text: `[File Upload Detected]\n\nYour file has been uploaded successfully. For full document processing (PDF, DOCX, etc.), please use the Python backend with proper dependencies installed.\n\nFor now, you can:\n1. Upload .txt files for immediate processing\n2. Use the sample content option\n3. Set up the Python backend for full document support`,
      filesProcessed: 1,
      message: "File uploaded - using fallback content",
      fileTypes: ["unknown"],
    });
  } catch (error) {
    console.error("API handler error:", error);
    return res.status(500).json({
      error: "Server error",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
}

