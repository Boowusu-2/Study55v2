// Test to check if environment variables are being read
const fetch = require("node-fetch");

const BACKEND_URL = "https://study55v2-production-09c8.up.railway.app";

async function testEnvironment() {
  console.log("🔍 Testing Environment Variables...\n");

  // Test 1: Check if we can get any response
  console.log("1. Testing basic connectivity...");
  try {
    const response = await fetch(`${BACKEND_URL}/`);
    const data = await response.json();
    console.log("✅ Root endpoint:", data);
  } catch (error) {
    console.log("❌ Root endpoint failed:", error.message);
  }

  // Test 2: Check health endpoint
  console.log("\n2. Testing health endpoint...");
  try {
    const response = await fetch(`${BACKEND_URL}/health`);
    const data = await response.json();
    console.log("✅ Health endpoint:", data);
  } catch (error) {
    console.log("❌ Health endpoint failed:", error.message);
  }

  // Test 3: Try a simple quiz generation with minimal data
  console.log("\n3. Testing minimal quiz generation...");
  try {
    const response = await fetch(`${BACKEND_URL}/generate-quiz`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        content: "test",
        questionCount: 1,
        difficulty: "easy",
        questionType: "multiple_choice",
      }),
    });

    console.log("Response status:", response.status);
    const text = await response.text();
    console.log("Response body:", text);

    if (response.ok) {
      console.log("✅ Quiz generation successful!");
    } else {
      console.log("❌ Quiz generation failed with status:", response.status);
    }
  } catch (error) {
    console.log("❌ Quiz generation error:", error.message);
  }

  console.log("\n🎉 Environment testing complete!");
}

testEnvironment().catch(console.error);
