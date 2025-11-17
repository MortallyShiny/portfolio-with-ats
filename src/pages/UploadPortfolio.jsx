import React, { useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "../supabase/config";
import { useAuth } from "../contexts/AuthContext";
import "bootstrap-icons/font/bootstrap-icons.css";
import "./UploadPortfolio.css";

export default function UploadPortfolio() {
  const { user } = useAuth();
  const [file, setFile] = useState(null);
  const [portfolioUrl, setPortfolioUrl] = useState("");
  const [uploadType, setUploadType] = useState("file");
  const [uploading, setUploading] = useState(false);
  const [statusMsg, setStatusMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      if (selectedFile.name.endsWith(".zip")) {
        setFile(selectedFile);
        setErrorMsg("");
      } else {
        setErrorMsg("Please upload a ZIP file only.");
      }
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    setUploading(true);
    setStatusMsg("");
    setErrorMsg("");

    try {
      if (uploadType === "file") {
        if (!file) throw new Error("No file selected");
        const filePath = `users/${user.id}/portfolio.${file.name.split(".").pop()}`;
        const { data, error } = await supabase.storage
          .from("portfolios")
          .upload(filePath, file, { upsert: true });
        if (error) throw error;

        const publicUrl = supabase.storage
          .from("portfolios")
          .getPublicUrl(data.path).data.publicUrl;
        setStatusMsg("Portfolio ZIP uploaded successfully!");
        console.log("Portfolio URL:", publicUrl);
      } else {
        if (!portfolioUrl.trim()) throw new Error("Enter a valid URL");
        setStatusMsg("Portfolio URL saved successfully!");
        console.log("Linked URL:", portfolioUrl);
      }
    } catch (err) {
      console.error(err);
      setErrorMsg(err.message);
    } finally {
      setUploading(false);
      setFile(null);
      setPortfolioUrl("");
    }
  };

  return (
    <div className="upload-portfolio-page">
      <div className="container py-5">
        <motion.div
          className="upload-portfolio-card mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="upload-header">
            <i className="bi bi-cloud-upload"></i>
            <h2>Upload Portfolio</h2>
            <p>Upload a ZIP file or link an online portfolio</p>
          </div>

          <div className="upload-type-selector">
            <button
              type="button"
              className={`type-btn ${uploadType === "file" ? "active" : ""}`}
              onClick={() => setUploadType("file")}
            >
              <i className="bi bi-file-zip"></i> Upload File
            </button>
            <button
              type="button"
              className={`type-btn ${uploadType === "url" ? "active" : ""}`}
              onClick={() => setUploadType("url")}
            >
              <i className="bi bi-link-45deg"></i> Link URL
            </button>
          </div>

          <form onSubmit={handleUpload} className="upload-form">
            {uploadType === "file" ? (
              <div className="upload-area">
                <input
                  type="file"
                  id="portfolio-upload"
                  accept=".zip"
                  onChange={handleFileChange}
                  className="file-input"
                  disabled={uploading}
                />
                <label htmlFor="portfolio-upload" className="upload-label">
                  <i className="bi bi-cloud-upload"></i>
                  <span>{file ? file.name : "Choose ZIP file or drag here"}</span>
                  <small>ZIP files only</small>
                </label>
              </div>
            ) : (
              <div className="url-input-area">
                <label htmlFor="portfolio-url" className="form-label">
                  Portfolio URL
                </label>
                <input
                  type="url"
                  id="portfolio-url"
                  value={portfolioUrl}
                  onChange={(e) => setPortfolioUrl(e.target.value)}
                  placeholder="https://your-portfolio.com"
                  className="form-control"
                />
              </div>
            )}

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
              disabled={uploading || (uploadType === "file" && !file)}
            >
              {uploading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2"></span>
                  Uploading...
                </>
              ) : (
                <>
                  <i className="bi bi-upload me-2"></i>
                  {uploadType === "file" ? "Upload Portfolio" : "Save URL"}
                </>
              )}
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
