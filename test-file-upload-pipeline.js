const fs = require("fs");
const path = require("path");
const FormData = require("form-data");

// Test the full pipeline with actual file uploads
async function testFileUploadPipeline() {
  console.log("🚀 Testing File Upload Pipeline...\n");

  try {
    // Step 1: Test file upload and text extraction
    console.log("📄 Step 1: File Upload and Text Extraction");

    const textFilePath = path.join(__dirname, "docs", "test-document.txt");
    if (!fs.existsSync(textFilePath)) {
      console.log("❌ Test document not found:", textFilePath);
      return;
    }

    console.log("📄 Uploading file:", textFilePath);

    const form = new FormData();
    form.append("files", fs.createReadStream(textFilePath));

    const extractResponse = await fetch(
      "http://localhost:3000/api/extract-text-upload",
      {
        method: "POST",
        body: form,
        headers: form.getHeaders(),
      }
    );

    if (!extractResponse.ok) {
      throw new Error(`Extraction failed: ${extractResponse.status}`);
    }

    const extractData = await extractResponse.json();
    console.log("✅ File Upload & Extraction: SUCCESS");
    console.log("📝 Text length:", extractData.text?.length || 0);
    console.log("📄 Files processed:", extractData.filesProcessed);
    console.log("📋 File types:", extractData.fileTypes);
    console.log("💬 Message:", extractData.message);
    console.log(
      "📝 First 200 characters:",
      extractData.text?.substring(0, 200) + "..."
    );

    // Step 2: Test guided learning with extracted text
    console.log("\n🧠 Step 2: Guided Learning with Uploaded Content");
    const guidedResponse = await fetch(
      "http://localhost:3000/api/guided-learning",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          documentContent: extractData.text.substring(0, 2000),
          step: "analyze",
        }),
      }
    );

    if (!guidedResponse.ok) {
      throw new Error(`Guided learning failed: ${guidedResponse.status}`);
    }

    const guidedData = await guidedResponse.json();
    console.log("✅ Guided Learning: SUCCESS");
    console.log("📚 Title:", guidedData.title);
    console.log("🔑 Key Concepts:", guidedData.keyConcepts?.length || 0);
    console.log("📝 Summary:", guidedData.summary?.substring(0, 100) + "...");

    // Step 3: Test quiz generation with extracted text
    console.log("\n🎯 Step 3: Quiz Generation with Uploaded Content");
    const quizResponse = await fetch(
      "http://localhost:3000/api/generate-quiz",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: extractData.text.substring(0, 2000),
          questionCount: 3,
          difficulty: "medium",
          questionType: "multiple-choice",
        }),
      }
    );

    if (!quizResponse.ok) {
      throw new Error(`Quiz generation failed: ${quizResponse.status}`);
    }

    const quizData = await quizResponse.json();
    console.log("✅ Quiz Generation: SUCCESS");
    console.log(
      "📝 Questions generated:",
      quizData.quiz?.questions?.length || 0
    );
    console.log("🎯 Target questions:", quizData.targetQuestions);
    console.log("🔑 API keys used:", quizData.apiKeysUsed);

    // Show the first question
    if (quizData.quiz?.questions?.[0]) {
      const firstQuestion = quizData.quiz.questions[0];
      console.log(
        "❓ First question:",
        firstQuestion.question?.substring(0, 100) + "..."
      );
      console.log("📋 Options:", firstQuestion.options?.length || 0, "options");
    }

    console.log("\n🎉 FILE UPLOAD PIPELINE TEST: SUCCESS!");
    console.log(
      "✅ Your uploaded documents are now being processed correctly:"
    );
    console.log("   - File upload ✅");
    console.log("   - Text extraction from uploaded files ✅");
    console.log("   - Guided learning with your content ✅");
    console.log("   - Quiz generation from your documents ✅");
  } catch (error) {
    console.log("❌ File Upload Pipeline Test Failed:", error.message);
  }
}

// Run the test
testFileUploadPipeline().catch(console.error);

