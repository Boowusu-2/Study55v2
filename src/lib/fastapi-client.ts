// Configuration for the FastAPI backend
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export interface ExtractTextResponse {
  text: string;
}

export interface ApiError {
  detail: string;
}

/**
 * Extract text from uploaded files using the FastAPI backend
 */
export async function extractTextFromFiles(files: File[]): Promise<string> {
  const formData = new FormData();

  // Add all files to the form data
  files.forEach((file) => {
    formData.append("files", file);
  });

  try {
    const response = await fetch(`${API_BASE_URL}/extract-text`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      let errorMessage = "Failed to extract text";
      try {
        const errorData: ApiError = await response.json();
        errorMessage = errorData.detail || errorMessage;
      } catch {
        errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      }
      throw new Error(errorMessage);
    }

    const data: ExtractTextResponse = await response.json();
    return data.text;
  } catch (error) {
    console.error("Text extraction error:", error);
    throw error;
  }
}

/**
 * Check if the FastAPI backend is healthy
 */
export async function checkApiHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/health`);
    return response.ok;
  } catch (error) {
    console.error("Health check failed:", error);
    return false;
  }
}

/**
 * Get API information
 */
export async function getApiInfo(): Promise<{
  message: string;
  status: string;
}> {
  try {
    const response = await fetch(`${API_BASE_URL}/`);
    if (response.ok) {
      return await response.json();
    }
    throw new Error(`HTTP ${response.status}`);
  } catch (error) {
    console.error("API info request failed:", error);
    throw error;
  }
}
