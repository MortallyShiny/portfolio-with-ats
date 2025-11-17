import React from "react";
import "./TemplateCard.css";

export default function TemplateCard({ template, onSelect, isSelected }) {
  if (!template) {
    return (
      <div className="template-card-empty">
        <p>No template selected</p>
      </div>
    );
  }

  return (
    <div
      className={`template-card ${isSelected ? "selected" : ""}`}
      onClick={() => onSelect && onSelect(template.id)}
    >
      {/* Header */}
      <div className="template-card-header">
        <h4 className="template-title">{template.name}</h4>
      </div>

      {/* Description */}
      <div className="template-card-body">
        <p className="template-desc">
          {template.description || "A clean professional portfolio layout."}
        </p>
      </div>

      {/* Footer */}
      <div className="template-card-footer">
        {isSelected ? (
          <span className="selected-badge">Selected</span>
        ) : (
          <button className="use-template-btn">Use this template</button>
        )}
      </div>
    </div>
  );
}
