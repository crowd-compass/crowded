// Test script for Llama Vision API
// Run with: node test-vision.js

const TEST_IMAGE_URL = "https://images.unsplash.com/photo-1506748686214-e9df14d4d9d0"; // Sample landscape image

async function testVisionAPI() {
  console.log("Testing Llama Vision API with model: us.meta.llama3-2-90b-instruct-v1:0\n");

  try {
    const response = await fetch("http://localhost:3000/api/llama/vision", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt: "Describe what you see in this image in detail.",
        imageUrl: TEST_IMAGE_URL,
        modelId: "us.meta.llama3-2-90b-instruct-v1:0",
        maxTokens: 512,
        temperature: 0.5,
        topP: 0.9,
        region: "us-east-1"
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("❌ API Error:", errorData);
      process.exit(1);
    }

    const data = await response.json();

    console.log("✅ API Response received successfully!\n");
    console.log("📊 Response Data:");
    console.log("─".repeat(80));
    console.log("Generation:", data.data.generation);
    console.log("\n📈 Token Usage:");
    console.log("  Prompt tokens:", data.data.promptTokenCount);
    console.log("  Generation tokens:", data.data.generationTokenCount);
    console.log("  Stop reason:", data.data.stopReason);
    console.log("─".repeat(80));

  } catch (error) {
    console.error("❌ Test failed:", error.message);
    process.exit(1);
  }
}

// Run the test
testVisionAPI();
