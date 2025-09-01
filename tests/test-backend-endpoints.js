// Test script to verify backend endpoints work correctly
const fetch = require("node-fetch");

const BACKEND_URL = "https://study55v2-production-09c8.up.railway.app";

async function testBackend() {
  console.log("🧪 Testing SmartStudy Backend Endpoints...\n");

  // Test 1: Health Check
  console.log("1. Testing Health Check...");
  try {
    const healthResponse = await fetch(`${BACKEND_URL}/health`);
    const healthData = await healthResponse.json();
    console.log("✅ Health Check:", healthData);
  } catch (error) {
    console.log("❌ Health Check Failed:", error.message);
  }

  // Test 2: Quiz Generation
  console.log("\n2. Testing Quiz Generation...");
  try {
    const quizResponse = await fetch(`${BACKEND_URL}/generate-quiz`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        content:
          "Software Engineering is a systematic approach to the design, development, operation, and maintenance of software systems. The Software Development Life Cycle (SDLC) is a framework that defines tasks performed at each step in the software development process.",
        questionCount: 3,
        difficulty: "medium",
        questionType: "multiple_choice",
        focusArea: "Software Engineering",
      }),
    });

    if (quizResponse.ok) {
      const quizData = await quizResponse.json();
      console.log("✅ Quiz Generation:", {
        questionsGenerated: quizData.questions?.length || 0,
        firstQuestion: quizData.questions?.[0]?.question || "No questions",
      });
    } else {
      console.log(
        "❌ Quiz Generation Failed:",
        quizResponse.status,
        await quizResponse.text()
      );
    }
  } catch (error) {
    console.log("❌ Quiz Generation Error:", error.message);
  }

  // Test 3: Guided Learning
  console.log("\n3. Testing Guided Learning...");
  try {
    const learningResponse = await fetch(`${BACKEND_URL}/guided-learning`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        documentContent:
          "Machine Learning is a subset of artificial intelligence that enables computers to learn and make decisions from data without being explicitly programmed. It includes supervised learning, unsupervised learning, and reinforcement learning.",
        step: "analyze",
      }),
    });

    if (learningResponse.ok) {
      const learningData = await learningResponse.json();
      console.log("✅ Guided Learning:", {
        stepsGenerated: learningData.learningSteps?.length || 0,
        firstStep: learningData.learningSteps?.[0]?.title || "No steps",
      });
    } else {
      console.log(
        "❌ Guided Learning Failed:",
        learningResponse.status,
        await learningResponse.text()
      );
    }
  } catch (error) {
    console.log("❌ Guided Learning Error:", error.message);
  }

  console.log("\n🎉 Backend testing complete!");
}

testBackend().catch(console.error);
