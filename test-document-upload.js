const fs = require("fs");
const path = require("path");
const FormData = require("form-data");

// Test document upload and text extraction
async function testDocumentUpload() {
  console.log("📄 Testing Document Upload and Text Extraction...");

  try {
    // Check if the document exists
    const docPath = path.join(__dirname, "docs", "Lecture 1.pdf");
    if (!fs.existsSync(docPath)) {
      console.log("❌ Document not found:", docPath);
      return;
    }

    console.log("📄 Document found:", docPath);
    console.log(
      "📊 File size:",
      (fs.statSync(docPath).size / 1024).toFixed(2),
      "KB"
    );

    // Create form data for file upload
    const form = new FormData();
    form.append("files", fs.createReadStream(docPath));

    // Test the extract-text API
    const response = await fetch("http://localhost:3000/api/extract-text", {
      method: "POST",
      body: form,
      headers: form.getHeaders(),
    });

    console.log("Status:", response.status);

    if (response.ok) {
      const data = await response.json();
      console.log("✅ Text Extraction Success!");
      console.log(
        "📝 Extracted text length:",
        data.text?.length || 0,
        "characters"
      );
      console.log(
        "📝 First 500 characters:",
        data.text?.substring(0, 500) + "..."
      );

      // Now test guided learning with the extracted text
      if (data.text) {
        console.log("\n🧠 Testing Guided Learning with extracted text...");
        await testGuidedLearningWithExtractedText(data.text);
      }
    } else {
      const errorText = await response.text();
      console.log("❌ Text Extraction Error:", errorText);
    }
  } catch (error) {
    console.log("❌ Document Upload Error:", error.message);
  }
}

// Test guided learning with extracted text
async function testGuidedLearningWithExtractedText(extractedText) {
  try {
    const response = await fetch("http://localhost:3000/api/guided-learning", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        documentContent: extractedText.substring(0, 2000), // Limit to first 2000 chars
        step: "analyze",
      }),
    });

    console.log("Guided Learning Status:", response.status);

    if (response.ok) {
      const data = await response.json();
      console.log("✅ Guided Learning Success!");
      console.log("📚 Title:", data.title);
      console.log("📝 Summary:", data.summary);
      console.log(
        "🔑 Key Concepts:",
        data.keyConcepts?.length || 0,
        "concepts"
      );
      console.log(
        "📖 Learning Steps:",
        data.learningSteps?.length || 0,
        "steps"
      );
    } else {
      const errorText = await response.text();
      console.log("❌ Guided Learning Error:", errorText);
    }
  } catch (error) {
    console.log("❌ Guided Learning Error:", error.message);
  }
}

// Test quiz generation with extracted text
async function testQuizGenerationWithExtractedText(extractedText) {
  try {
    const response = await fetch("http://localhost:3000/api/generate-quiz", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        content: extractedText.substring(0, 2000), // Limit to first 2000 chars
        questionCount: 5,
        difficulty: "medium",
        questionType: "multiple-choice",
      }),
    });

    console.log("Quiz Generation Status:", response.status);

    if (response.ok) {
      const data = await response.json();
      console.log("✅ Quiz Generation Success!");
      console.log("❓ Questions Generated:", data.questionsGenerated);
      console.log("🎯 Target Questions:", data.targetQuestions);
      console.log("🔑 API Keys Used:", data.apiKeysUsed);
    } else {
      const errorText = await response.text();
      console.log("❌ Quiz Generation Error:", errorText);
    }
  } catch (error) {
    console.log("❌ Quiz Generation Error:", error.message);
  }
}

// Run the test
async function runDocumentTest() {
  console.log("🚀 Starting Document Upload Test...\n");

  await testDocumentUpload();

  console.log("\n✅ Document test completed!");
}

runDocumentTest().catch(console.error);
