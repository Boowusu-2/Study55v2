// Test the full pipeline: document extraction -> guided learning -> quiz generation
async function testFullPipeline() {
  console.log("🚀 Testing Full Pipeline...\n");

  try {
    // Step 1: Test document extraction
    console.log("📄 Step 1: Document Extraction");
    const extractResponse = await fetch(
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

    if (!extractResponse.ok) {
      throw new Error(`Extraction failed: ${extractResponse.status}`);
    }

    const extractData = await extractResponse.json();
    console.log("✅ Extraction: SUCCESS");
    console.log("📝 Text length:", extractData.text?.length || 0);

    // Step 2: Test guided learning with extracted text
    console.log("\n🧠 Step 2: Guided Learning");
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

    // Step 3: Test quiz generation with extracted text
    console.log("\n🎯 Step 3: Quiz Generation");
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

    // Step 4: Test a specific learning step
    console.log("\n📖 Step 4: Specific Learning Step");
    const stepResponse = await fetch(
      "http://localhost:3000/api/guided-learning",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          documentContent: extractData.text.substring(0, 2000),
          step: "question",
          currentStep: 0,
        }),
      }
    );

    if (!stepResponse.ok) {
      throw new Error(`Learning step failed: ${stepResponse.status}`);
    }

    const stepData = await stepResponse.json();
    console.log("✅ Learning Step: SUCCESS");
    console.log("❓ Question:", stepData.question?.substring(0, 100) + "...");

    console.log("\n🎉 FULL PIPELINE TEST: SUCCESS!");
    console.log("✅ All components are working correctly:");
    console.log("   - Document extraction ✅");
    console.log("   - Guided learning ✅");
    console.log("   - Quiz generation ✅");
    console.log("   - Learning steps ✅");
  } catch (error) {
    console.log("❌ Pipeline Test Failed:", error.message);
  }
}

// Run the test
testFullPipeline().catch(console.error);
