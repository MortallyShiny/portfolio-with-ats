import React, { useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "../supabase/config";
import { useAuth } from "../contexts/AuthContext";
import "bootstrap-icons/font/bootstrap-icons.css";
import "./UploadResume.css";

export default function UploadResume() {
  const { user } = useAuth();
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [statusMsg, setStatusMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;
    if (
      selectedFile.type === "application/pdf" ||
      selectedFile.type.includes("word")
    ) {
      setFile(selectedFile);
      setErrorMsg("");
    } else {
      setErrorMsg("Please upload only PDF or Word (DOC/DOCX) files.");
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file || !user) {
      setErrorMsg("Please select a file and make sure you’re logged in.");
      return;
    }

    setUploading(true);
    setStatusMsg("");
    setErrorMsg("");

    try {
      // Upload to Supabase storage (bucket: resumes)
      const filePath = `users/${user.id}/resume.${file.name.split(".").pop()}`;
      const { data, error } = await supabase.storage
        .from("resumes")
        .upload(filePath, file, { upsert: true });

      if (error) throw error;

      // Get public URL
      const publicUrl = supabase.storage.from("resumes").getPublicUrl(data.path)
        .data.publicUrl;

      setStatusMsg("Resume uploaded successfully!");
      console.log("Public URL:", publicUrl);
      setFile(null);
    } catch (err) {
      console.error("Upload error:", err);
      setErrorMsg("Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="upload-resume-page">
      <div className="container py-5">
        <motion.div
          className="upload-resume-card mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="upload-header">
            <i className="bi bi-file-earmark-arrow-up"></i>
            <h2>Upload Resume</h2>
            <p>Upload your resume (PDF or DOC)</p>
          </div>

          <form onSubmit={handleUpload} className="upload-form">
            <div className="upload-area">
              <input
                type="file"
                id="resume-upload"
                accept=".pdf,.doc,.docx"
                onChange={handleFileChange}
                className="file-input"
                disabled={uploading}
              />
              <label htmlFor="resume-upload" className="upload-label">
                <i className="bi bi-cloud-upload"></i>
                <span>{file ? file.name : "Choose file or drag here"}</span>
                <small>Supported: PDF, DOC, DOCX</small>
              </label>
            </div>

            {errorMsg && (
              <div className="alert alert-danger">
                <i className="bi bi-exclamation-triangle me-2"></i>
                {errorMsg}
              </div>
            )}

            {statusMsg && (
              <div className="alert alert-success">
                <i className="bi bi-check-circle me-2"></i>
                {statusMsg}
              </div>
            )}

            <button
              type="submit"
              className="btn-upload-primary"
              disabled={!file || uploading}
            >
              {uploading ? (
                <>
                  <span
                    className="spinner-border spinner-border-sm me-2"
                    role="status"
                  ></span>
                  Uploading...
                </>
              ) : (
                <>
                  <i className="bi bi-upload me-2"></i>
                  Upload Resume
                </>
              )}
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
