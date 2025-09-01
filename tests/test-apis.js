const fs = require("fs");
const path = require("path");

// Test the guided learning API
async function testGuidedLearning() {
  console.log("🧪 Testing Guided Learning API...");

  try {
    const response = await fetch("http://localhost:3000/api/guided-learning", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        documentContent:
          "This is a test document about machine learning. Machine learning is a subset of artificial intelligence that enables computers to learn and make decisions from data without being explicitly programmed.",
        step: "analyze",
      }),
    });

    console.log("Status:", response.status);

    if (response.ok) {
      const data = await response.json();
      console.log(
        "✅ Guided Learning API Response:",
        JSON.stringify(data, null, 2)
      );
    } else {
      const errorText = await response.text();
      console.log("❌ Guided Learning API Error:", errorText);
    }
  } catch (error) {
    console.log("❌ Guided Learning API Error:", error.message);
  }
}

// Test the quiz generation API
async function testQuizGeneration() {
  console.log("\n🧪 Testing Quiz Generation API...");

  try {
    const response = await fetch("http://localhost:3000/api/generate-quiz", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        content:
          "This is a test document about machine learning. Machine learning is a subset of artificial intelligence that enables computers to learn and make decisions from data without being explicitly programmed.",
        questionCount: 3,
        difficulty: "medium",
        questionType: "multiple-choice",
      }),
    });

    console.log("Status:", response.status);

    if (response.ok) {
      const data = await response.json();
      console.log(
        "✅ Quiz Generation API Response:",
        JSON.stringify(data, null, 2)
      );
    } else {
      const errorText = await response.text();
      console.log("❌ Quiz Generation API Error:", errorText);
    }
  } catch (error) {
    console.log("❌ Quiz Generation API Error:", error.message);
  }
}

// Test the text extraction API
async function testTextExtraction() {
  console.log("\n🧪 Testing Text Extraction API...");

  try {
    // Check if the document exists
    const docPath = path.join(__dirname, "docs", "Lecture 1.pdf");
    if (!fs.existsSync(docPath)) {
      console.log("❌ Document not found:", docPath);
      return;
    }

    console.log("📄 Document found:", docPath);

    // For now, just test if the API endpoint exists
    const response = await fetch("http://localhost:3000/api/extract-text", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        test: true,
      }),
    });

    console.log("Status:", response.status);

    if (response.ok) {
      const data = await response.json();
      console.log(
        "✅ Text Extraction API Response:",
        JSON.stringify(data, null, 2)
      );
    } else {
      const errorText = await response.text();
      console.log("❌ Text Extraction API Error:", errorText);
    }
  } catch (error) {
    console.log("❌ Text Extraction API Error:", error.message);
  }
}

// Run all tests
async function runTests() {
  console.log("🚀 Starting API Tests...\n");

  await testGuidedLearning();
  await testQuizGeneration();
  await testTextExtraction();

  console.log("\n✅ All tests completed!");
}

runTests().catch(console.error);
