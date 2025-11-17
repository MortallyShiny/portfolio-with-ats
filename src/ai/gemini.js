// src/ai/gemini.js
import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

// Safety check
if (!apiKey) {
  console.error("❌ Missing Gemini API Key. Add VITE_GEMINI_API_KEY to your .env file.");
}

const genAI = new GoogleGenerativeAI(apiKey);

// Use Gemini 1.5 Flash (BEST for ATS)
export const gemini = genAI.getGenerativeModel({
  model: "gemini-1.5-flash",
});

export default gemini;
