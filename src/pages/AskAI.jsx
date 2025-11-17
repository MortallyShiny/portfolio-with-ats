import React, { useState } from "react";
import { motion } from "framer-motion";
import { useAuth } from "../contexts/AuthContext";
import { supabase } from "../supabase/config";
import { gemini } from "../ai/gemini";
import { jsPDF } from "jspdf";
import * as pdfjsLib from "pdfjs-dist";
import "pdfjs-dist/build/pdf.worker.mjs";
import "./AskAI.css";

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.mjs",
  import.meta.url
).toString();

export default function AskAI() {
  const { user } = useAuth();
  const [resumeText, setResumeText] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [fileName, setFileName] = useState("");

  // 📄 Extract text from PDF or TXT
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setError("");
    setLoading(true);
    setFileName(file.name);

    try {
      if (file.type === "application/pdf") {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        let textContent = "";
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const text = await page.getTextContent();
          textContent += text.items.map((s) => s.str).join(" ") + "\n";
        }
        setResumeText(textContent);
      } else if (file.type === "text/plain") {
        const text = await file.text();
        setResumeText(text);
      } else {
        setError("Unsupported file type. Upload PDF or TXT.");
      }
    } catch {
      setError("Error reading file.");
    } finally {
      setLoading(false);
    }
  };

  // 🤖 ANALYZE USING GEMINI AI
  const handleAnalyze = async () => {
    if (!resumeText.trim()) {
      setError("Please upload or paste your resume text.");
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const prompt = `
You are an ATS (Applicant Tracking System) resume evaluator.

Analyze the following resume and give:
1. ATS Score (0–100)
2. 4–5 line Summary of candidate
3. Improvement Suggestions
4. Top 10 Keywords they should add

Resume:
${resumeText}
`;

      const aiResponse = await gemini.generateContent(prompt);
      const text = aiResponse.response.text();

      // Convert AI output into structured JSON
      const parsed = parseGeminiATS(text);

      setResult(parsed);

      // Save to Supabase
      await supabase.from("atsReports").insert([
        {
          uid: user?.id || "guest",
          userName:
            user?.user_metadata?.display_name ||
            user?.email?.split("@")[0],
          fileName: fileName || "pasted_resume",
          score: parsed.score,
          summary: parsed.summary,
          suggestions: parsed.suggestions,
          keywords: parsed.keywords,
          created_at: new Date(),
        },
      ]);
    } catch (err) {
      setError("AI Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Helper → Convert Gemini text into JSON
  function parseGeminiATS(raw) {
    let score = 0;
    let summary = "";
    let suggestions = [];
    let keywords = [];

    const scoreMatch = raw.match(/(Score|ATS Score)[:\- ]+(\d+)/i);
    if (scoreMatch) score = parseInt(scoreMatch[2]);

    const summaryMatch = raw.match(/Summary[:\- ]+([\s\S]*?)(Suggestions|Keywords|$)/i);
    if (summaryMatch) summary = summaryMatch[1].trim();

    const suggestionsMatch = raw.match(/Suggestions[:\- ]+([\s\S]*?)(Keywords|$)/i);
    if (suggestionsMatch)
      suggestions = suggestionsMatch[1]
        .split(/\n|•|- /)
        .map((s) => s.trim())
        .filter(Boolean);

    const keywordsMatch = raw.match(/Keywords[:\- ]+([\s\S]*)/i);
    if (keywordsMatch)
      keywords = keywordsMatch[1]
        .split(/,|\n/)
        .map((k) => k.trim())
        .filter(Boolean);

    return { score, summary, suggestions, keywords };
  }

  // 📥 Download PDF
  const handleDownloadReport = () => {
    if (!result) return;
    const doc = new jsPDF();
    doc.text("PortfolioPro ATS Report", 20, 20);
    doc.text(`Score: ${result.score}/100`, 20, 30);
    doc.text(`Summary: ${result.summary}`, 20, 40);
    doc.save("ATS_Report.pdf");
  };

  return (
    <div className="askai-page">
      <div className="container py-5">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="askai-title">Improve Resume</h1>
          <p className="askai-subtitle">
            Upload or paste your resume text to get ATS Score, Improvements, Keywords & AI review.
          </p>

          <div className="ats-section mt-4">
            <label className="form-label">Upload Resume (PDF/TXT)</label>
            <input
              type="file"
              accept=".pdf,.txt"
              className="form-control mb-3"
              onChange={handleFileUpload}
            />

            <label className="form-label">Or Paste Resume Text</label>
            <textarea
              className="form-control"
              rows="10"
              value={resumeText}
              onChange={(e) => setResumeText(e.target.value)}
              placeholder="Paste your resume here..."
            />

            <button
              className="btn custom-cta-btn mt-3"
              onClick={handleAnalyze}
              disabled={loading}
            >
              {loading ? "Analyzing..." : "Run ATS Tracker"}
            </button>

            {error && <div className="alert alert-danger mt-3">{error}</div>}
          </div>

          {result && (
            <div className="ats-results mt-5">
              <div className="ats-card">
                <h3>
                  ATS Score: <span className="score">{result.score}</span>/100
                </h3>
                <p>{result.summary}</p>

                <h5 className="mt-3">Suggestions</h5>
                <ul>
                  {result.suggestions.map((s, i) => (
                    <li key={i}>{s}</li>
                  ))}
                </ul>

                <h5 className="mt-3">Keywords</h5>
                <p>{result.keywords.join(", ")}</p>

                <button className="btn btn-outline-primary mt-3" onClick={handleDownloadReport}>
                  Download Report
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
