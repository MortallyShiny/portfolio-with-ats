import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { supabase } from "../supabase/config";
import TemplateCard from "../components/TemplateCard";
import { renderTemplateHtml } from "../utils/templateRenderer";
import "./CreatePortfolio.css";

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

export default function CreatePortfolio() {
  const query = useQuery();
  const tpl = query.get("tpl") || "photon";
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    headline: "",
    bio: "",
    email: "",
    phone: "",
    skills: "",
    username: "",
    projects: [
      { title: "", description: "", link: "" }
    ]
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // ------------------------------
  // Handle Form Changes
  // ------------------------------
  const handleChange = (field, value) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const updateProject = (index, field, value) => {
    const updated = [...form.projects];
    updated[index][field] = value;
    setForm((prev) => ({ ...prev, projects: updated }));
  };

  const addProject = () => {
    setForm((prev) => ({
      ...prev,
      projects: [...prev.projects, { title: "", description: "", link: "" }]
    }));
  };

  // ------------------------------
  // Publish Portfolio
  // ------------------------------
  const handleSave = async () => {
    setError("");
    if (!form.username.trim()) {
      return setError("Username is required. It creates the public URL.");
    }

    setSaving(true);
    try {
      const user = supabase.auth.user();
      if (!user) throw new Error("Not authenticated.");

      // Get template HTML/CSS/JS from Supabase
      const { data: templateData, error: tmplErr } = await supabase
        .from("portfolio_templates")
        .select("*")
        .eq("id", tpl)
        .maybeSingle();

      if (tmplErr || !templateData)
        throw new Error("Template not found or missing in database.");

      const finalHtml = renderTemplateHtml(
        templateData.html,
        templateData.css,
        templateData.js,
        form
      );

      // Save to user_portfolios table
      const { error: saveErr } = await supabase
        .from("user_portfolios")
        .upsert(
          [
            {
              user_id: user.id,
              username: form.username,
              template_id: tpl,
              data: form,
              html_output: finalHtml,
              public_url: `/u/${form.username}`
            }
          ],
          { onConflict: ["user_id"] }
        );

      if (saveErr) throw saveErr;

      navigate(`/u/${form.username}`);
    } catch (err) {
      setError(err.message);
    }

    setSaving(false);
  };

  // ------------------------------
  // Render Page
  // ------------------------------
  return (
    <div className="create-portfolio container py-5">
      <h1 className="mb-4 fw-bold">Create Your Portfolio</h1>

      <div className="row mt-4">
        
        {/* LEFT — FORM */}
        <div className="col-lg-7">
          
          {/* Full Name */}
          <div className="mb-3">
            <label className="form-label">Full Name</label>
            <input
              className="form-control"
              value={form.name}
              onChange={(e) => handleChange("name", e.target.value)}
            />
          </div>

          {/* Headline */}
          <div className="mb-3">
            <label className="form-label">Professional Headline</label>
            <input
              className="form-control"
              value={form.headline}
              onChange={(e) => handleChange("headline", e.target.value)}
            />
          </div>

          {/* Bio */}
          <div className="mb-3">
            <label className="form-label">Short Bio</label>
            <textarea
              className="form-control"
              value={form.bio}
              onChange={(e) => handleChange("bio", e.target.value)}
            ></textarea>
          </div>

          {/* Username */}
          <div className="mb-3">
            <label className="form-label">Portfolio Username</label>
            <input
              className="form-control"
              value={form.username}
              onChange={(e) => handleChange("username", e.target.value)}
            />
            <small className="form-text text-muted">
              Your public portfolio will be at: <strong>/u/{form.username || "username"}</strong>
            </small>
          </div>

          {/* Skills */}
          <div className="mb-3">
            <label className="form-label">Skills (comma separated)</label>
            <input
              className="form-control"
              value={form.skills}
              onChange={(e) => handleChange("skills", e.target.value)}
            />
          </div>

          {/* Projects */}
          <div className="mb-3">
            <label className="form-label">Projects</label>

            {form.projects.map((p, index) => (
              <div key={index} className="mb-3 project-box">
                <input
                  className="form-control mb-2"
                  placeholder="Project Title"
                  value={p.title}
                  onChange={(e) =>
                    updateProject(index, "title", e.target.value)
                  }
                />

                <input
                  className="form-control mb-2"
                  placeholder="Project Link"
                  value={p.link}
                  onChange={(e) =>
                    updateProject(index, "link", e.target.value)
                  }
                />

                <textarea
                  className="form-control"
                  placeholder="Project Description"
                  value={p.description}
                  onChange={(e) =>
                    updateProject(index, "description", e.target.value)
                  }
                ></textarea>
              </div>
            ))}

            <button className="btn btn-sm btn-outline-primary" onClick={addProject}>
              + Add Another Project
            </button>
          </div>

          {/* Contact Email */}
          <div className="mb-3">
            <label className="form-label">Contact Email</label>
            <input
              className="form-control"
              value={form.email}
              onChange={(e) => handleChange("email", e.target.value)}
            />
          </div>

          {/* Error */}
          {error && <div className="alert alert-danger">{error}</div>}

          {/* Buttons */}
          <div className="d-flex gap-2 mt-4">
            <button
              className="btn btn-primary"
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? "Publishing..." : "Publish Portfolio"}
            </button>

            <button className="btn btn-outline-secondary" onClick={() => navigate(-1)}>
              Cancel
            </button>
          </div>
        </div>

        {/* RIGHT — TEMPLATE + PREVIEW */}
        <div className="col-lg-5">
          <h5 className="fw-semibold">Selected Template</h5>
          <TemplateCard templateId={tpl} />

          <hr className="my-4" />

          <h5 className="fw-semibold">Live Preview</h5>
          <div className="preview-box">
            <p className="text-muted">
              Preview will show after publishing.  
              Live preview will be added soon.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
