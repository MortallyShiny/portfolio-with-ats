import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import "./Templates.css";

const templates = [
  {
    id: "photon",
    name: "Photon",
    desc: "Minimal portfolio with parallax sections.",
  },
  {
    id: "editorial",
    name: "Editorial",
    desc: "Magazine-style layout for writers & creators.",
  },
  {
    id: "forty",
    name: "Forty",
    desc: "Bold full-screen hero with gallery support.",
  },
];

export default function Templates() {
  const navigate = useNavigate();

  const handleUseTemplate = (e, id) => {
    e.stopPropagation();
    navigate(`/create-portfolio?tpl=${id}`);
  };

  const handlePreview = (e, id) => {
    e.stopPropagation();
    navigate(`/preview-template/${id}`);
  };

  return (
    <div className="templates-wrapper container py-5">
      <motion.h1
        className="templates-title text-center mb-3"
        initial={{ opacity: 0, y: -15 }}
        animate={{ opacity: 1, y: 0 }}
      >
        Choose a Template
      </motion.h1>

      <p className="templates-subtitle text-center mb-4">
        Select a template to start building your personal portfolio.
      </p>

      <div className="templates-list">
        {templates.map((tpl, idx) => (
          <motion.div
            key={tpl.id}
            className="template-item"
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.07 }}
          >
            <div className="template-content">
              <h3 className="template-title">{tpl.name}</h3>
              <p className="template-desc">{tpl.desc}</p>

              <div className="template-actions">
                <button
                  className="btn btn-outline-primary preview-btn"
                  onClick={(e) => handlePreview(e, tpl.id)}
                >
                  Preview
                </button>

                <button
                  className="btn btn-primary use-btn"
                  onClick={(e) => handleUseTemplate(e, tpl.id)}
                >
                  Use Template
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
