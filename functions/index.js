const functions = require("firebase-functions");
const admin = require("firebase-admin");
const fetch = require("node-fetch");
const cors = require("cors")({ origin: true });
const { Configuration, OpenAIApi } = require("openai");

admin.initializeApp();

exports.analyzeResume = functions.https.onRequest(async (req, res) => {
  cors(req, res, async () => {
    try {
      if (req.method !== "POST")
        return res.status(405).send("Only POST allowed");

      const { resumeText } = req.body;
      if (!resumeText || resumeText.trim().length < 20)
        return res.status(400).json({ error: "Missing resumeText" });

      const openai = new OpenAIApi(
        new Configuration({
          apiKey: process.env.OPENAI_API_KEY,
        })
      );

      const prompt = `
You are a professional ATS resume reviewer.
Analyze the resume below and return ONLY JSON with:
{
  "summary": "short summary",
  "score": 0-100,
  "suggestions": ["tip1", "tip2"],
  "top_keywords": ["keyword1", "keyword2"],
  "rewrite_bullet_examples": [{"original": "...", "improved": "..."}]
}
Resume:
"""${resumeText}"""
      `;

      const completion = await openai.createChatCompletion({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 700,
        temperature: 0.3,
      });

      const raw = completion.data.choices[0].message.content;
      let parsed = {};
      try {
        parsed = JSON.parse(raw);
      } catch {
        parsed = { summary: "Parsing error", score: 50, suggestions: [], top_keywords: [] };
      }

      return res.json({ success: true, result: parsed });
    } catch (err) {
      console.error("Error:", err);
      res.status(500).json({ error: err.message });
    }
  });
});
