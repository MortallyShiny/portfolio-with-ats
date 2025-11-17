const aiHealth = require('./ai-health.cjs');
// server/index.js (CommonJS)
require("dotenv").config();

const supabaseUpload = require('./supabase-upload.cjs'); 
const geminiAts = require("./ats-gemini.cjs");
const ollamaAts = require("./ollama-ats.cjs");

console.log('Ollama module loaded successfully');

const express = require("express");
const multer = require("multer");
const fs = require("fs/promises");
const pdfParse = require("pdf-parse");
const mammoth = require("mammoth");
const stringSimilarity = require("string-similarity");

const upload = multer({ dest: "uploads/" });
const app = express();
app.use(express.json());
// near top of server/index.cjs (after require('dotenv').config() and express setup)

app.use('/api', aiHealth);
app.use('/api', supabaseUpload); // <-- add this after app.use(express.json())

//app.use("/api", geminiAts);
app.use("/api", ollamaAts);

console.log('Ollama routes loaded:', ollamaAts ? 'Yes' : 'No');


async function extractTextFromFile(filepath, originalname, mimetype) {
  const buf = await fs.readFile(filepath);

  if (originalname.endsWith(".pdf") || mimetype === "application/pdf") {
    const r = await pdfParse(buf);
    return r.text || "";
  }

  if (originalname.endsWith(".docx") || mimetype.includes("wordprocessingml")) {
    const r = await mammoth.extractRawText({ buffer: buf });
    return r.value || "";
  }

  return buf.toString("utf8");
}

function normalize(text) {
  return (text || "")
    .replace(/\r/g, " ")
    .replace(/\n+/g, "\n")
    .trim();
}

function scoreResume(resumeText, jobDesc) {
  const resume = normalize(resumeText).toLowerCase();
  const job = normalize(jobDesc).toLowerCase();

  const jdTokens = Array.from(
    new Set(
      job.replace(/[^\w\s-]/g, " ")
        .split(/\s+/)
        .filter((t) => t.length > 3)
    )
  );

  const parts = job.split(/\s+/).filter(Boolean);
  const jdPhrases = [];
  for (let i = 0; i < parts.length - 1; i++) {
    const a = parts[i].replace(/[^\w]/g, "");
    const b = parts[i + 1].replace(/[^\w]/g, "");
    if (a.length > 2 && b.length > 2) jdPhrases.push(`${a} ${b}`);
  }

  const candidates = jdTokens.concat(jdPhrases).slice(0, 40);

  let matches = [];
  for (const token of candidates) {
    const sections = resume.split(/\s{1,4}/).filter(Boolean);
    const best = stringSimilarity.findBestMatch(token, sections);
    const score = best.bestMatch.rating;
    if (score > 0.55) matches.push({ token, score });
  }

  const keyword_match_pct = Math.round(
    (matches.length / Math.max(1, candidates.length)) * 100
  );

  const sectionHeadings = [
    "experience",
    "education",
    "skills",
    "projects",
    "summary",
    "certifications",
    "contact",
  ];
  let sectionsFound = 0;
  for (const h of sectionHeadings) if (resume.includes(h)) sectionsFound++;
  const sections_pct = Math.round(
    (sectionsFound / sectionHeadings.length) * 100
  );

  const years = resume.match(/(19|20)\d{2}/g) || [];
  const yearCount = new Set(years).size;

  let relevance_raw =
    keyword_match_pct * 0.7 + Math.min(yearCount * 3, 20) * 0.3;
  const relevance_pct = Math.round(Math.min(100, relevance_raw));

  const sentences = resume.split(/[.?!]\s+/).filter(Boolean);
  const avgSentenceLen = sentences.length
    ? Math.round(resume.split(/\s+/).length / sentences.length)
    : 0;

  let readability_pct = 100 - Math.max(0, Math.abs(avgSentenceLen - 15) * 4);
  const totalWords = resume.split(/\s+/).filter(Boolean).length;
  if (totalWords > 1200)
    readability_pct -= Math.min(
      40,
      Math.round((totalWords - 1200) / 50)
    );
  readability_pct = Math.max(
    0,
    Math.min(100, Math.round(readability_pct))
  );

  const keyword_gaps = candidates
    .filter((tok) => !matches.find((m) => m.token === tok))
    .slice(0, 20);

  const highlights = matches
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map((m) => m.token);

  const issues = [];
  if (!resume.includes("@") || !resume.includes("."))
    issues.push("Missing or unclear contact email");
  if (sectionsFound < 2) issues.push("Resume missing clear sections");
  if (totalWords < 200) issues.push("Resume too short");
  if (totalWords > 2500) issues.push("Resume too long (aim for 1–2 pages)");
  if (avgSentenceLen > 30)
    issues.push("Sentences too long — use bullet points");

  const breakdown = {
    keyword_match: keyword_match_pct,
    sections_format: sections_pct,
    relevance: relevance_pct,
    readability: readability_pct,
  };

  const score = Math.round(
    breakdown.keyword_match * 0.4 +
      breakdown.sections_format * 0.2 +
      breakdown.relevance * 0.3 +
      breakdown.readability * 0.1
  );

  const suggested_edits = [];
  if (keyword_gaps.length)
    suggested_edits.push(
      `Add keywords: ${keyword_gaps.slice(0, 6).join(", ")}`
    );
  if (sectionsFound < 3)
    suggested_edits.push(
      "Add Experience, Education, Skills, Projects sections"
    );
  if (avgSentenceLen > 22)
    suggested_edits.push("Shorten sentences; use bullet points");
  if (totalWords > 1200)
    suggested_edits.push("Trim resume to 1–2 pages");

  return {
    score,
    breakdown,
    keyword_gaps,
    highlights,
    issues,
    suggested_edits,
    meta: {
      totalWords,
      avgSentenceLen,
      years: Array.from(new Set(years)),
    },
  };
}

app.post("/api/ats-check", upload.single("resume"), async (req, res) => {
  try {
    const jd = req.body.jobDescription || "";
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });

    const txt = await extractTextFromFile(
      req.file.path,
      req.file.originalname,
      req.file.mimetype
    );

    await fs.unlink(req.file.path).catch(() => {});

    const result = scoreResume(txt, jd);
    return res.json({ result });
  } catch (err) {
    console.error("ATS error", err);
    return res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () =>
  console.log(`ATS heuristic API running at http://localhost:${PORT}`)
);
