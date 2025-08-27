import type { NextApiRequest, NextApiResponse } from "next";
import formidable, { File } from "formidable";
import { spawn } from "child_process";
import fs from "fs";
import path from "path";

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

  const form = formidable({ multiples: true, keepExtensions: true });

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

    console.log("Processing files:", inputFiles.map(f => f.originalFilename));

    // Call python extractor with file paths
    const scriptPath = path.join(
      process.cwd(),
      "src",
      "python",
      "extract_text.py"
    );
    
    console.log("Script path:", scriptPath);
    console.log("Script exists:", fs.existsSync(scriptPath));
    
    const args = [scriptPath, ...inputFiles.map((file) => file.filepath)];
    console.log("Python args:", args);

    const py = spawn("python3", args, { stdio: ["ignore", "pipe", "pipe"] });

    let out = "";
    let err = "";
    py.stdout.on("data", (d) => {
      const data = d.toString();
      console.log("Python stdout:", data);
      out += data;
    });
    
    py.stderr.on("data", (d) => {
      const data = d.toString();
      console.log("Python stderr:", data);
      err += data;
    });

    py.on("close", (code) => {
      console.log("Python process closed with code:", code);
      console.log("Final output:", out);
      console.log("Final error:", err);
      
      // Clean up uploaded temp files
      for (const file of inputFiles) {
        try {
          fs.unlinkSync(file.filepath);
        } catch (cleanupErr) {
          console.log("Cleanup error:", cleanupErr);
        }
      }

      if (code !== 0) {
        return res
          .status(500)
          .json({ 
            error: "Extraction failed", 
            details: err.slice(0, 500),
            code: code 
          });
      }
      
      if (!out || out.trim() === "") {
        return res.status(500).json({ 
          error: "No text extracted", 
          details: "Python script returned empty output" 
        });
      }
      
      return res.status(200).json({ text: out });
    });

    py.on("error", (error) => {
      console.error("Python process error:", error);
      // Clean up files
      for (const file of inputFiles) {
        try {
          fs.unlinkSync(file.filepath);
        } catch {}
      }
      return res.status(500).json({ 
        error: "Failed to start Python process", 
        details: error.message 
      });
    });

  } catch (e) {
    console.error("API handler error:", e);
    const message = e instanceof Error ? e.message : "Unknown error";
    return res.status(500).json({ error: "Server error", details: message });
  }
}