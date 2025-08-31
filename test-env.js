#!/usr/bin/env node

// Test script to verify environment variables
require("dotenv").config({ path: ".env.local" });

console.log("🔍 Testing study.ai environment configuration...\n");

// Check for multiple Gemini API keys
const geminiKeys = [];
for (let i = 1; i <= 5; i++) {
  const key = process.env[`GEMINI_API_KEY_${i}`];
  if (key && key.trim()) {
    geminiKeys.push(key);
  }
}

const requiredVars = {
  GEMINI_API_KEYS:
    geminiKeys.length > 0
      ? `${geminiKeys.length} keys configured`
      : "No keys found",
  OPENAI_API_KEY: process.env.OPENAI_API_KEY,
  ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY,
  JWT_SECRET: process.env.JWT_SECRET,
  NODE_ENV: process.env.NODE_ENV,
};

let hasAnyApiKey = false;
let allGood = true;

console.log("📋 Environment Variables Status:\n");

for (const [key, value] of Object.entries(requiredVars)) {
  const status = value ? "✅" : "❌";
  let displayValue = value || "Not set";

  if (key === "GEMINI_API_KEYS") {
    displayValue = value;
  } else if (key.includes("API_KEY") && value) {
    displayValue = `${value.substring(0, 10)}...`;
  } else if (key.includes("SECRET") && value) {
    displayValue = `${value.substring(0, 10)}...`;
  }

  console.log(`${status} ${key}: ${displayValue}`);

  if (key === "GEMINI_API_KEYS" && geminiKeys.length > 0) {
    hasAnyApiKey = true;
  } else if (key.includes("API_KEY") && value) {
    hasAnyApiKey = true;
  }

  if (key === "GEMINI_API_KEYS" && geminiKeys.length === 0) {
    allGood = false;
  }
}

console.log("\n📊 Summary:");

if (hasAnyApiKey) {
  console.log("✅ At least one API key is configured");
} else {
  console.log("❌ No API keys found");
  allGood = false;
}

if (geminiKeys.length > 0) {
  console.log(`✅ ${geminiKeys.length} Gemini API key(s) configured`);
  if (geminiKeys.length > 1) {
    console.log("✅ Multiple API keys enable automatic rotation and fallback");
  }
} else {
  console.log("❌ No Gemini API keys found");
  allGood = false;
}

if (process.env.JWT_SECRET) {
  console.log("✅ JWT Secret is configured");
} else {
  console.log("❌ JWT Secret is missing");
  allGood = false;
}

if (process.env.NODE_ENV) {
  console.log(`✅ NODE_ENV is set to: ${process.env.NODE_ENV}`);
} else {
  console.log("⚠️  NODE_ENV is not set (defaults to development)");
}

console.log("\n🎯 Recommendation:");
if (allGood) {
  console.log(
    "✅ Environment is properly configured! You can start the app with: npm run dev"
  );
} else {
  console.log(
    "❌ Please configure the missing environment variables before starting the app."
  );
  console.log("💡 Run './setup-env.sh' for interactive setup.");
}
