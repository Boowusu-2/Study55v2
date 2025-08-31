const fs = require("fs");
const path = require("path");
const FormData = require("form-data");

// Test document upload and text extraction
async function testDocumentExtraction() {
  console.log("📄 Testing Document Extraction...");

  try {
    // Test with text file first
    const textFilePath = path.join(__dirname, "docs", "test-document.txt");
    if (!fs.existsSync(textFilePath)) {
      console.log("❌ Test document not found:", textFilePath);
      return;
    }

    console.log("📄 Test document found:", textFilePath);
    console.log(
      "📊 File size:",
      (fs.statSync(textFilePath).size / 1024).toFixed(2),
      "KB"
    );

    // Create form data for file upload
    const form = new FormData();
    form.append("files", fs.createReadStream(textFilePath));

    // Test the extract-text-simple API
    const response = await fetch(
      "http://localhost:3000/api/extract-text-simple",
      {
        method: "POST",
        body: form,
        headers: form.getHeaders(),
      }
    );

    console.log("Status:", response.status);

    if (response.ok) {
      const data = await response.json();
      console.log("✅ Text Extraction Success!");
      console.log(
        "📝 Extracted text length:",
        data.text?.length || 0,
        "characters"
      );
      console.log("📄 Files processed:", data.filesProcessed);
      console.log("💬 Message:", data.message);
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
    console.log("❌ Document Extraction Error:", error.message);
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

// Run the test
async function runExtractionTest() {
  console.log("🚀 Starting Document Extraction Test...\n");

  await testDocumentExtraction();

  console.log("\n✅ Extraction test completed!");
}

runExtractionTest().catch(console.error);

