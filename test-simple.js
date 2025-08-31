// Simple test to verify APIs work with direct text input
async function testWithSampleText() {
  console.log("🧪 Testing APIs with sample text...\n");

  // Sample text from a typical lecture
  const sampleText = `
  Introduction to Machine Learning
  
  Machine learning is a subset of artificial intelligence that enables computers to learn and make decisions from data without being explicitly programmed. 
  
  Key Concepts:
  1. Supervised Learning: Learning from labeled data
  2. Unsupervised Learning: Finding patterns in unlabeled data
  3. Reinforcement Learning: Learning through trial and error
  
  Applications:
  - Image recognition
  - Natural language processing
  - Recommendation systems
  - Autonomous vehicles
  
  The machine learning process involves:
  1. Data collection and preprocessing
  2. Feature engineering
  3. Model selection and training
  4. Evaluation and validation
  5. Deployment and monitoring
  `;

  console.log("📝 Sample text length:", sampleText.length, "characters");

  // Test Guided Learning
  console.log("\n🧠 Testing Guided Learning...");
  try {
    const glResponse = await fetch(
      "http://localhost:3000/api/guided-learning",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          documentContent: sampleText,
          step: "analyze",
        }),
      }
    );

    if (glResponse.ok) {
      const glData = await glResponse.json();
      console.log("✅ Guided Learning: SUCCESS");
      console.log("   📚 Title:", glData.title);
      console.log("   📖 Steps:", glData.learningSteps?.length || 0);
    } else {
      console.log("❌ Guided Learning: FAILED");
    }
  } catch (error) {
    console.log("❌ Guided Learning Error:", error.message);
  }

  // Test Quiz Generation
  console.log("\n❓ Testing Quiz Generation...");
  try {
    const qgResponse = await fetch("http://localhost:3000/api/generate-quiz", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        content: sampleText,
        questionCount: 3,
        difficulty: "medium",
        questionType: "multiple-choice",
      }),
    });

    if (qgResponse.ok) {
      const qgData = await qgResponse.json();
      console.log("✅ Quiz Generation: SUCCESS");
      console.log("   ❓ Questions:", qgData.questionsGenerated);
      console.log("   🎯 Target:", qgData.targetQuestions);
    } else {
      console.log("❌ Quiz Generation: FAILED");
    }
  } catch (error) {
    console.log("❌ Quiz Generation Error:", error.message);
  }

  console.log("\n✅ All tests completed!");
}

testWithSampleText().catch(console.error);
