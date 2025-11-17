// server/ai-health.cjs
require('dotenv').config();
const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const router = express.Router();

const key = process.env.GEMINI_API_KEY;
router.get('/ai-health', async (req, res) => {
  if (!key) return res.json({ ok: false, reason: 'no_key' });
  try {
    const gen = new GoogleGenerativeAI(key);
    const model = gen.getGenerativeModel({ model: 'gemini-2.0-flash' });
    // lightweight call: countTokens or a tiny generateContent with tiny prompt
    await model.generateContent('Health check: say OK in plain text (1 word).');
    return res.json({ ok: true });
  } catch (err) {
    return res.json({ ok: false, reason: err?.message || String(err) });
  }
});

module.exports = router;
