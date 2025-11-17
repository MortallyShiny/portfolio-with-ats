const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
require('dotenv').config();
const express = require('express');
const multer = require('multer');
const fs = require('fs/promises');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');
const { createClient } = require('@supabase/supabase-js');

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

// Available Ollama models (use the ones you downloaded)
const AVAILABLE_MODELS = ['llama2', 'mistral', 'codellama', 'gemma:2b'];

// Free local AI with Ollama
async function analyzeWithOllama(resumeText, jobDescription, modelName = 'llama2') {
  try {
    const prompt = `You are an expert ATS (Applicant Tracking System) analyst. Analyze the resume against the job description and provide a detailed assessment.

RESUME TEXT:
${resumeText.substring(0, 4000)}

JOB DESCRIPTION:
${jobDescription.substring(0, 2000)}

Provide your analysis in this EXACT JSON format:
{
  "score": 85,
  "breakdown": {
    "keyword_match": 80,
    "experience_relevance": 90,
    "skills_alignment": 85,
    "format_quality": 75
  },
  "keywordsMatched": ["JavaScript", "React", "Node.js", "Python"],
  "missingKeywords": ["AWS", "Docker", "Kubernetes"],
  "strengths": ["Strong technical skills", "Relevant experience", "Good education"],
  "weaknesses": ["Missing cloud experience", "No certification mentioned"],
  "recommendations": [
    "Add AWS and Docker experience",
    "Include relevant certifications",
    "Quantify achievements with numbers"
  ],
  "summary": "Strong candidate with excellent technical skills but needs to add cloud technologies and quantify achievements.",
  "estimated_recruiter_score": "B+"
}

Return ONLY the JSON object, no other text or explanations.`;

    const response = await fetch('http://localhost:11434/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: modelName,
        prompt: prompt,
        stream: false,
        options: {
          temperature: 0.1,  // Low temperature for consistent JSON
          top_p: 0.9,
          top_k: 40
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Ollama API error: ${response.status}`);
    }

    const result = await response.json();
    
    if (!result.response) {
      throw new Error('No response from Ollama');
    }

    // Extract JSON from the response
    const jsonMatch = result.response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsedResult = JSON.parse(jsonMatch[0]);
      return {
        ...parsedResult,
        modelUsed: modelName
      };
    } else {
      throw new Error('Could not extract JSON from response');
    }

  } catch (error) {
    console.error(`Ollama analysis error (${modelName}):`, error.message);
    return null;
  }
}

// Try multiple models in order
async function tryAllModels(resumeText, jobDescription) {
  for (const model of AVAILABLE_MODELS) {
    console.log(`Trying model: ${model}`);
    const result = await analyzeWithOllama(resumeText, jobDescription, model);
    if (result) {
      return result;
    }
    // Wait a bit before trying next model
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  return null;
}

// Enhanced heuristic fallback
function enhancedHeuristicATS(resumeText, jobDescription) {
  const jd = (jobDescription || '').toLowerCase();
  const resume = (resumeText || '').toLowerCase();

  const techKeywords = ['javascript', 'python', 'java', 'react', 'node', 'aws', 'docker', 'sql', 'mongodb', 'git'];
  const matched = techKeywords.filter(keyword => jd.includes(keyword) && resume.includes(keyword));
  const missing = techKeywords.filter(keyword => jd.includes(keyword) && !resume.includes(keyword));

  const score = Math.min(100, Math.round((matched.length / Math.max(1, techKeywords.filter(k => jd.includes(k)).length)) * 100));

  return {
    score: score || 50,
    breakdown: {
      keyword_match: score,
      experience_relevance: Math.round(score * 0.9),
      skills_alignment: Math.round(score * 0.8),
      format_quality: 70
    },
    keywordsMatched: matched,
    missingKeywords: missing,
    strengths: ['Automated analysis completed', 'Basic keyword matching applied'],
    weaknesses: ['Limited contextual understanding', 'No semantic analysis'],
    recommendations: [
      'Add missing technical skills: ' + missing.slice(0, 3).join(', '),
      'Include quantifiable achievements',
      'Ensure clear section headings'
    ],
    summary: 'Basic automated analysis completed. Consider manual review for detailed insights.',
    estimated_recruiter_score: score >= 80 ? 'B+' : score >= 60 ? 'C+' : 'C',
    modelUsed: 'heuristic_fallback'
  };
}

// File text extraction
async function extractTextFromFile(filePath, mimetype) {
  try {
    if (mimetype.includes('pdf')) {
      const pdfData = await fs.readFile(filePath);
      const parsed = await pdfParse(pdfData);
      return parsed.text || '';
    } else if (mimetype.includes('word') || mimetype.includes('docx')) {
      const docData = await fs.readFile(filePath);
      const result = await mammoth.extractRawText({ buffer: docData });
      return result.value || '';
    } else {
      return await fs.readFile(filePath, 'utf8');
    }
  } catch (error) {
    console.error('Text extraction error:', error);
    return '';
  }
}

// Main ATS route
router.post('/ollama-ats', upload.single('resume'), async (req, res) => {
  let fileCleanup = false;
  
  try {
    const jobDesc = req.body.jobDescription || '';
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    console.log('Processing resume:', req.file.originalname);

    // Extract text from resume
    const resumeText = await extractTextFromFile(req.file.path, req.file.mimetype);
    
    if (!resumeText || resumeText.trim().length < 50) {
      await fs.unlink(req.file.path);
      return res.status(400).json({ error: 'Could not extract sufficient text from resume' });
    }

    console.log(`Extracted ${resumeText.length} characters from resume`);

    // Upload to Supabase if configured
    let signedURL = null;
    if (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_KEY) {
      try {
        const supabaseAdmin = createClient(
          process.env.SUPABASE_URL, 
          process.env.SUPABASE_SERVICE_KEY, 
          { auth: { persistSession: false } }
        );
        
        const buffer = await fs.readFile(req.file.path);
        const key = `${Date.now()}_${req.file.originalname.replace(/\s+/g, '_')}`;
        const BUCKET = process.env.SUPABASE_BUCKET || 'resumes';

        const { data, error } = await supabaseAdmin.storage
          .from(BUCKET)
          .upload(key, buffer, { contentType: req.file.mimetype });

        if (!error) {
          const { data: signedData } = await supabaseAdmin.storage
            .from(BUCKET)
            .createSignedUrl(data.path, 3600);
          signedURL = signedData?.signedUrl;
          console.log('Uploaded to Supabase:', signedURL);
        }
      } catch (uploadError) {
        console.error('Supabase upload failed:', uploadError.message);
      }
    }

    // Analyze with Ollama
    console.log('Starting AI analysis...');
    let analysis = await tryAllModels(resumeText, jobDesc);
    
    if (!analysis) {
      console.log('All AI models failed, using heuristic fallback');
      analysis = enhancedHeuristicATS(resumeText, jobDesc);
    }

    // Clean up uploaded file
    await fs.unlink(req.file.path);
    fileCleanup = true;

    console.log('Analysis completed successfully');

    res.json({
      success: true,
      signedURL,
      analysis,
      timestamp: new Date().toISOString(),
      resumeLength: resumeText.length,
      modelsAvailable: AVAILABLE_MODELS
    });

  } catch (err) {
    console.error('Ollama ATS error:', err);
    
    // Clean up file if not already done
    if (!fileCleanup && req.file) {
      await fs.unlink(req.file.path).catch(console.error);
    }

    res.status(500).json({ 
      error: err.message,
      suggestion: 'Check if Ollama is running: systemctl status ollama'
    });
  }
});

// Health check for Ollama
router.get('/ollama-health', async (req, res) => {
  try {
    const response = await fetch('http://localhost:11434/api/tags');
    const models = await response.json();
    
    res.json({
      status: 'healthy',
      ollama: 'running',
      models: models.models || [],
      availableModels: AVAILABLE_MODELS
    });
  } catch (error) {
    res.status(500).json({
      status: 'unhealthy',
      ollama: 'not running',
      error: error.message,
      solution: 'Run: sudo systemctl start ollama'
    });
  }
});

module.exports = router;