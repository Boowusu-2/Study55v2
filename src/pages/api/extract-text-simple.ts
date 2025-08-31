import type { NextApiRequest, NextApiResponse } from "next";
import formidable, { File } from "formidable";
import fs from "fs";

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

  const form = formidable({
    multiples: true,
    keepExtensions: true,
    maxFileSize: 50 * 1024 * 1024, // 50MB limit
  });

  try {
    const { files } = await new Promise<{
      fields: formidable.Fields;
      files: formidable.Files;
    }>((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) reject(err);
        else resolve({ fields, files });
      });
    });

    const inputFiles: File[] = [];
    const f = files["files"];
    if (Array.isArray(f)) inputFiles.push(...f);
    else if (f) inputFiles.push(f);

    if (inputFiles.length === 0) {
      return res.status(400).json({ error: "No files uploaded" });
    }

    console.log(
      "Processing files:",
      inputFiles.map((f) => f.originalFilename)
    );

    let combinedText = "";

    for (const file of inputFiles) {
      try {
        const fileExtension = file.originalFilename
          ?.split(".")
          .pop()
          ?.toLowerCase();

        // Handle different file types
        if (fileExtension === "txt") {
          // Read text files directly
          const text = fs.readFileSync(file.filepath, "utf8");
          combinedText += `\n\n--- ${file.originalFilename} ---\n${text}`;
        } else if (fileExtension === "pdf") {
          // For PDFs, return a message that OCR is needed
          combinedText += `\n\n--- ${file.originalFilename} ---\n[PDF content - OCR processing required. Please use the Python backend for full PDF support.]`;
        } else if (
          ["doc", "docx", "ppt", "pptx"].includes(fileExtension || "")
        ) {
          // For Office documents, return a message
          combinedText += `\n\n--- ${
            file.originalFilename
          } ---\n[${fileExtension?.toUpperCase()} content - Document processing required. Please use the Python backend for full support.]`;
        } else {
          combinedText += `\n\n--- ${file.originalFilename} ---\n[Unsupported file type: ${fileExtension}]`;
        }
      } catch (error) {
        console.error(`Error processing file ${file.originalFilename}:`, error);
        combinedText += `\n\n--- ${file.originalFilename} ---\n[Error processing file: ${error}]`;
      }
    }

    // Clean up uploaded temp files
    for (const file of inputFiles) {
      try {
        fs.unlinkSync(file.filepath);
      } catch (cleanupErr) {
        console.log("Cleanup error:", cleanupErr);
      }
    }

    if (!combinedText.trim()) {
      return res.status(500).json({
        error: "No text extracted",
        details: "Could not extract text from uploaded files",
      });
    }

    return res.status(200).json({
      text: combinedText.trim(),
      filesProcessed: inputFiles.length,
      message: "Text extracted successfully (basic support only)",
    });
  } catch (error) {
    console.error("API handler error:", error);
    return res.status(500).json({
      error: "Server error",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
}

