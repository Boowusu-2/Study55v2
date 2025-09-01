// Test the fixed text extraction API
async function testFixedExtraction() {
  console.log("📄 Testing Fixed Text Extraction...");

  try {
    // Test 1: Direct text input
    console.log("\n🧪 Test 1: Direct text input");
    const response1 = await fetch(
      "http://localhost:3000/api/extract-text-fixed",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: "This is a test document about machine learning. Machine learning is a subset of artificial intelligence.",
        }),
      }
    );

    console.log("Status:", response1.status);
    if (response1.ok) {
      const data1 = await response1.json();
      console.log("✅ Direct text input: SUCCESS");
      console.log("📝 Text length:", data1.text?.length || 0);
      console.log("💬 Message:", data1.message);
    } else {
      console.log("❌ Direct text input: FAILED");
    }

    // Test 2: Machine learning document type
    console.log("\n🧪 Test 2: Machine learning document type");
    const response2 = await fetch(
      "http://localhost:3000/api/extract-text-fixed",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          documentType: "machine-learning",
        }),
      }
    );

    console.log("Status:", response2.status);
    if (response2.ok) {
      const data2 = await response2.json();
      console.log("✅ ML document type: SUCCESS");
      console.log("📝 Text length:", data2.text?.length || 0);
      console.log("📄 Document type:", data2.documentType);

      // Test guided learning with the extracted text
      console.log("\n🧠 Testing Guided Learning with extracted text...");
      await testGuidedLearningWithExtractedText(data2.text);
    } else {
      console.log("❌ ML document type: FAILED");
    }

    // Test 3: Python document type
    console.log("\n🧪 Test 3: Python document type");
    const response3 = await fetch(
      "http://localhost:3000/api/extract-text-fixed",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          documentType: "python",
        }),
      }
    );

    console.log("Status:", response3.status);
    if (response3.ok) {
      const data3 = await response3.json();
      console.log("✅ Python document type: SUCCESS");
      console.log("📝 Text length:", data3.text?.length || 0);
      console.log("📄 Document type:", data3.documentType);
    } else {
      console.log("❌ Python document type: FAILED");
    }
  } catch (error) {
    console.log("❌ Fixed Extraction Error:", error.message);
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
      console.log("📝 Summary:", data.summary?.substring(0, 100) + "...");
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
async function runFixedExtractionTest() {
  console.log("🚀 Starting Fixed Text Extraction Test...\n");

  await testFixedExtraction();

  console.log("\n✅ Fixed extraction test completed!");
}

runFixedExtractionTest().catch(console.error);

