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
      "Processing uploaded files:",
      inputFiles.map((f) => f.originalFilename)
    );

    let combinedText = "";

    for (const file of inputFiles) {
      try {
        const fileExtension = file.originalFilename
          ?.split(".")
          .pop()
          ?.toLowerCase();

        if (fileExtension === "txt") {
          // Read text files directly
          const text = fs.readFileSync(file.filepath, "utf8");
          combinedText += `\n\n--- ${file.originalFilename} ---\n${text}`;
        } else if (fileExtension === "pdf") {
          // For PDFs, try to extract text using a simple approach
          // In a real implementation, you'd use a PDF library
          combinedText += `\n\n--- ${file.originalFilename} ---\n[PDF content detected. For full PDF text extraction, please use the Python backend with proper dependencies installed.]`;
        } else if (
          ["doc", "docx", "ppt", "pptx"].includes(fileExtension || "")
        ) {
          // For Office documents
          combinedText += `\n\n--- ${
            file.originalFilename
          } ---\n[${fileExtension?.toUpperCase()} content detected. For full document processing, please use the Python backend with proper dependencies installed.]`;
        } else if (
          ["jpg", "jpeg", "png", "bmp", "tiff", "tif", "gif", "webp"].includes(
            fileExtension || ""
          )
        ) {
          // For images
          combinedText += `\n\n--- ${file.originalFilename} ---\n[Image file detected. For OCR text extraction, please use the Python backend with EasyOCR/Tesseract installed.]`;
        } else {
          // Try to read as text for unknown file types
          try {
            const text = fs.readFileSync(file.filepath, "utf8");
            combinedText += `\n\n--- ${file.originalFilename} ---\n${text}`;
          } catch {
            combinedText += `\n\n--- ${file.originalFilename} ---\n[Binary file - cannot extract text directly. File type: ${fileExtension}]`;
          }
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
      message: "Text extracted from uploaded files",
      fileTypes: inputFiles.map((f) =>
        f.originalFilename?.split(".").pop()?.toLowerCase()
      ),
    });
  } catch (error) {
    console.error("API handler error:", error);
    return res.status(500).json({
      error: "Server error",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
}

