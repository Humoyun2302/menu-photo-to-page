import fs from "fs";
import path from "path";

// Manually parse .env
const envPath = path.join(process.cwd(), ".env");
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, "utf-8");
  for (const line of envContent.split("\n")) {
    const match = line.match(/^\s*VITE_GEMINI_API_KEY\s*=\s*(.+)\s*$/);
    if (match) {
      process.env.VITE_GEMINI_API_KEY = match[1].trim();
    }
  }
}

const GEMINI_MODEL = "gemini-2.5-flash";
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

async function test() {
  const apiKey = process.env.VITE_GEMINI_API_KEY;
  console.log("Using API Key:", apiKey ? apiKey.substring(0, 10) + "..." : "undefined");
  if (!apiKey) {
    console.error("API Key not found in environment.");
    return;
  }

  try {
    const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: "Hello, answer in one word: OK" }] }]
      })
    });
    console.log("Status:", response.status);
    const body = await response.text();
    console.log("Body:", body);
  } catch (err) {
    console.error("Error:", err);
  }
}

test();
