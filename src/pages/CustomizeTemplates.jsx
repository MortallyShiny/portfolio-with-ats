import React, { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import "bootstrap-icons/font/bootstrap-icons.css";
import "./CustomizeTemplates.css";

const CustomizeTemplates = () => {
  const [selectedTemplate, setSelectedTemplate] = useState(null);

  const templates = [
    {
      id: 1,
      name: "Modern Professional",
      category: "Tech",
      preview: "🚀",
      description: "Clean and modern design perfect for developers",
    },
    {
      id: 2,
      name: "Creative Portfolio",
      category: "Design",
      preview: "🎨",
      description: "Bold and creative for designers and artists",
    },
    {
      id: 3,
      name: "Business Executive",
      category: "Business",
      preview: "💼",
      description: "Professional template for business professionals",
    },
    {
      id: 4,
      name: "Minimalist",
      category: "All",
      preview: "✨",
      description: "Simple and elegant minimalist design",
    },
  ];

  return (
    <div className="customize-templates-page">
      <div className="container py-5">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="templates-header">
            <h1>Customize Templates</h1>
            <p>Choose and customize a template for your portfolio</p>
          </div>

          <div className="templates-grid">
            {templates.map((template) => (
              <motion.div
                key={template.id}
                className={`template-card ${selectedTemplate === template.id ? "selected" : ""}`}
                onClick={() => setSelectedTemplate(template.id)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <div className="template-preview">
                  <div className="template-icon">{template.preview}</div>
                  <div className="template-badge">{template.category}</div>
                </div>
                <div className="template-info">
                  <h3>{template.name}</h3>
                  <p>{template.description}</p>
                </div>
                {selectedTemplate === template.id && (
                  <div className="template-actions">
                    <Link
                      to="/create-portfolio"
                      className="btn-customize"
                    >
                      <i className="bi bi-pencil"></i> Customize
                    </Link>
                  </div>
                )}
              </motion.div>
            ))}
          </div>

          {selectedTemplate && (
            <motion.div
              className="selected-template-info"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <p className="info-text">
                Template selected! Click "Customize" to start editing, or{" "}
                <Link to="/create-portfolio">create a new portfolio</Link>.
              </p>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default CustomizeTemplates;


