require('dotenv').config();
const express = require('express');
const multer = require('multer');
const fs = require('fs/promises');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { createClient } = require('@supabase/supabase-js');

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const BUCKET = process.env.SUPABASE_BUCKET || 'resumes';
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// Validate required environment variables
if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY || !GEMINI_API_KEY) {
  console.error('Missing required environment variables');
  process.exit(1);
}

const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: { persistSession: false }
});

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

// Candidate models in preferred order
const CANDIDATE_MODELS = [
  'gemini-1.5-flash',
  'gemini-1.5-pro',
  'gemini-1.0-pro'
];

// helper: try generateContent on a specific model with a single attempt
async function tryModel(modelId, prompt) {
  try {
    const m = genAI.getGenerativeModel({ model: modelId });
    const result = await m.generateContent(prompt);
    return { ok: true, result };
  } catch (err) {
    return { ok: false, err };
  }
}

// small sleep helper
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ---- SIGNED URL UPLOAD ----
async function uploadToSupabase(localFilePath, originalName, mime) {
  const buffer = await fs.readFile(localFilePath);
  const key = `${Date.now()}_${originalName.replace(/\s+/g, '_')}`;

  const { data, error } = await supabaseAdmin.storage
    .from(BUCKET)
    .upload(key, buffer, { contentType: mime });

  if (error) throw error;

  const { data: signedData, error: signErr } =
    await supabaseAdmin.storage.from(BUCKET).createSignedUrl(data.path, 3600);

  if (signErr) throw signErr;

  return signedData.signedUrl;
}

// ---- PARSE RESUME ----
async function extractText(filePath, mime) {
  if (!filePath) return '';
  
  try {
    if (mime && mime.includes('pdf')) {
      const pdfData = await fs.readFile(filePath);
      const parsed = await pdfParse(pdfData);
      return parsed.text || '';
    }
    
    if (mime && (mime.includes('word') || mime.includes('docx'))) {
      const docData = await fs.readFile(filePath);
      const result = await mammoth.extractRawText({ buffer: docData });
      return result.value || '';
    }
    
    // For text files
    return await fs.readFile(filePath, 'utf8');
  } catch (error) {
    console.error('Error extracting text:', error);
    return '';
  }
}

// ---- Local heuristic ATS fallback (simple but useful) ----
function heuristicATS(resumeText, jobDescription) {
  const jd = (jobDescription || '').toLowerCase();
  const resume = (resumeText || '').toLowerCase();

  const jdKeywords = [...new Set((jd.match(/\b[a-z0-9\-\+\.#]+\b/gi) || []).map(k => k.toLowerCase()))];

  const matched = [];
  jdKeywords.forEach(k => {
    if (k.length > 1 && resume.includes(k)) matched.push(k);
  });

  const score = jdKeywords.length === 0 ? 50 : Math.round((matched.length / jdKeywords.length) * 100);

  const strengths = matched.slice(0, 10).map(k => {
    const idx = resume.indexOf(k);
    if (idx === -1) return k;
    const start = Math.max(0, idx - 40);
    const snippet = resume.substring(start, idx + k.length + 40).replace(/\s+/g, ' ');
    return `${k}: ...${snippet}...`;
  });

  const missing = jdKeywords.filter(k => !matched.includes(k)).slice(0, 20);

  const improvements = [];
  if (score < 60) improvements.push('Add more keywords from the job description to the resume.');
  if ((resume || '').length < 200) improvements.push('Add more detail about responsibilities and achievements.');
  if (strengths.length === 0) improvements.push('Highlight specific technologies and measurable outcomes.');

  return {
    score,
    keywordsMatched: matched,
    missingKeywords: missing,
    recommendations: improvements,
    strengths
  };
}

// Robust extractor for model responses
function extractTextFromModelResult(result) {
  try {
    if (result?.response && typeof result.response.text === 'function') {
      return result.response.text();
    }
    if (result?.candidates?.[0]?.content?.parts?.[0]?.text) {
      return result.candidates[0].content.parts[0].text;
    }
    if (typeof result === 'string') return result;
    return JSON.stringify(result);
  } catch (e) {
    return JSON.stringify(result);
  }
}

// Try candidate models in order, small backoff between attempts
async function runModelsInOrder(prompt) {
  let lastErr = null;
  for (let i = 0; i < CANDIDATE_MODELS.length; i++) {
    const modelId = CANDIDATE_MODELS[i];
    // small exponential backoff before attempts after the first
    if (i > 0) await sleep(300 * i);

    const { ok, result, err } = await tryModel(modelId, prompt);
    if (ok) {
      return { success: true, modelId, result };
    } else {
      lastErr = err;
      // If error is specifically a quota/rate or server error, continue to next model
      // Otherwise continue as well (we want best-effort)
      console.error(`Model ${modelId} failed:`, err && err.message ? err.message : err);
    }
  }
  return { success: false, error: lastErr };
}

// ---- ATS ROUTE ----
router.post('/ats-gemini', upload.single('resume'), async (req, res) => {
  try {
    const jobDesc = req.body.jobDescription || '';
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

    // 1) Extract text
    const resumeText = await extractText(req.file.path, req.file.mimetype);
    
    if (!resumeText || resumeText.trim().length === 0) {
      await fs.unlink(req.file.path).catch(() => {});
      return res.status(400).json({ error: 'Could not extract text from the resume file' });
    }

    // 2) Upload file to Supabase (signed URL)
    let signedURL = null;
    try {
      signedURL = await uploadToSupabase(req.file.path, req.file.originalname, req.file.mimetype);
    } catch (upErr) {
      console.error('Supabase upload error:', upErr);
    }

    // 3) Build a strict prompt asking for JSON output
    const prompt = `
You are an ATS scoring AI. Compare this resume against this job description.
Return STRICT JSON ONLY with these exact keys:
{
  "score": <number 0-100>,
  "keywordsMatched": [array of strings],
  "missingKeywords": [array of strings],
  "recommendations": [array of strings],
  "summary": "<brief overall assessment>"
}

Job Description:
${jobDesc}

Resume Text:
${resumeText.substring(0, 10000)} // Limit to avoid token limits

Return ONLY valid JSON, no other text.
`;

    // 4) Try multiple models in order
    const modelRun = await runModelsInOrder(prompt);

    if (modelRun.success) {
      const raw = extractTextFromModelResult(modelRun.result);
      let atsObj;
      try {
        // Clean the response to extract only JSON
        const jsonMatch = raw.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          atsObj = JSON.parse(jsonMatch[0]);
        } else {
          atsObj = { error: 'No JSON found in response', raw };
        }
      } catch (e) {
        atsObj = { error: 'Failed to parse model output as JSON', raw };
      }

      await fs.unlink(req.file.path).catch(() => {});
      return res.json({ 
        success: true, 
        signedURL, 
        used: modelRun.modelId, 
        ats: atsObj 
      });
    }

    // 5) All models failed -> heuristic fallback
    console.error('All model attempts failed. Last error:', modelRun.error);
    const heuristic = heuristicATS(resumeText, jobDesc);
    await fs.unlink(req.file.path).catch(() => {});
    return res.json({ 
      success: true, 
      signedURL, 
      used: 'heuristic', 
      ats: heuristic, 
      note: 'Gemini API unavailable, using fallback analysis' 
    });

  } catch (err) {
    console.error('Unhandled ATS error:', err);
    
    // Clean up file on error
    if (req.file) {
      await fs.unlink(req.file.path).catch(() => {});
    }
    
    return res.status(500).json({ 
      error: err && err.message ? err.message : String(err) 
    });
  }
});

module.exports = router;