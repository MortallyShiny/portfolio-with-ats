// src/pages/EditPortfolio.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabase/config";
import { renderTemplateHtml } from "../utils/templateRenderer";
import "./EditPortfolio.css"; // optional - create file to style the form if you want

export default function EditPortfolio() {
  const navigate = useNavigate();
  const [portfolio, setPortfolio] = useState(null);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    name: "",
    headline: "",
    bio: "",
    email: "",
    phone: "",
    skills: "",
    username: "",
    projects: [],
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // load current user's portfolio
  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        const user = supabase.auth.user();
        if (!user) {
          navigate("/login");
          return;
        }

        const { data, error: fetchErr } = await supabase
          .from("user_portfolios")
          .select("*")
          .eq("user_id", user.id)
          .maybeSingle();

        if (fetchErr) throw fetchErr;

        if (!data) {
          // no portfolio yet — redirect to create page
          navigate("/create-portfolio");
          return;
        }

        if (!mounted) return;
        setPortfolio(data);
        setForm({
          ...{
            name: "",
            headline: "",
            bio: "",
            email: "",
            phone: "",
            skills: "",
            username: "",
            projects: [],
          },
          ...(data.data || {}),
        });
      } catch (err) {
        console.error("Load portfolio error:", err);
        setError(err.message || "Failed to load portfolio");
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();
    return () => {
      mounted = false;
    };
  }, [navigate]);

  // helpers
  const handleChange = (key, value) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const updateProject = (index, key, value) => {
    setForm((prev) => {
      const projects = Array.isArray(prev.projects) ? [...prev.projects] : [];
      projects[index] = { ...(projects[index] || {}), [key]: value };
      return { ...prev, projects };
    });
  };

  const addProject = () =>
    setForm((prev) => ({
      ...prev,
      projects: [...(prev.projects || []), { title: "", description: "", link: "" }],
    }));

  const removeProject = (index) =>
    setForm((prev) => ({
      ...prev,
      projects: (prev.projects || []).filter((_, i) => i !== index),
    }));

  // save changes
  const handleSave = async () => {
    setError("");
    // simple validation
    if (!form.username || !form.username.trim()) {
      setError("Username is required for your public URL.");
      return;
    }

    if (!portfolio) {
      setError("No portfolio loaded.");
      return;
    }

    setSaving(true);
    try {
      // fetch template to rebuild html output
      const { data: tmpl, error: tmplErr } = await supabase
        .from("portfolio_templates")
        .select("*")
        .eq("id", portfolio.template_id)
        .maybeSingle();

      if (tmplErr) throw tmplErr;
      if (!tmpl) throw new Error("Template not found.");

      const html = renderTemplateHtml(tmpl.html, tmpl.css, tmpl.js, form);

      const { error: updateErr } = await supabase
        .from("user_portfolios")
        .update({
          data: form,
          html_output: html,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", portfolio.user_id);

      if (updateErr) throw updateErr;

      // redirect to public URL after save
      navigate(`/u/${form.username}`);
    } catch (err) {
      console.error("Save error:", err);
      setError(err.message || "Failed to save changes.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="container py-5">Loading portfolio…</div>;

  return (
    <div className="container py-5 edit-portfolio-page">
      <h1 className="mb-4">Edit Portfolio</h1>

      {error && <div className="alert alert-danger">{error}</div>}

      <div className="row">
        <div className="col-lg-7">
          <div className="mb-3">
            <label className="form-label">Full name</label>
            <input
              className="form-control"
              value={form.name || ""}
              onChange={(e) => handleChange("name", e.target.value)}
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Headline</label>
            <input
              className="form-control"
              value={form.headline || ""}
              onChange={(e) => handleChange("headline", e.target.value)}
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Short bio</label>
            <textarea
              className="form-control"
              value={form.bio || ""}
              onChange={(e) => handleChange("bio", e.target.value)}
              rows={4}
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Username (public URL)</label>
            <input
              className="form-control"
              value={form.username || ""}
              onChange={(e) => handleChange("username", e.target.value)}
            />
            <div className="form-text">Public URL will be /u/{form.username || "username"}</div>
          </div>

          <div className="mb-3">
            <label className="form-label">Skills (comma separated)</label>
            <input
              className="form-control"
              value={form.skills || ""}
              onChange={(e) => handleChange("skills", e.target.value)}
            />
          </div>

          <div className="mb-3">
            <label className="form-label d-block">Projects</label>

            {(form.projects || []).map((p, i) => (
              <div key={i} className="mb-3 project-item">
                <input
                  className="form-control mb-2"
                  placeholder="Project title"
                  value={p.title || ""}
                  onChange={(e) => updateProject(i, "title", e.target.value)}
                />
                <input
                  className="form-control mb-2"
                  placeholder="Project link"
                  value={p.link || ""}
                  onChange={(e) => updateProject(i, "link", e.target.value)}
                />
                <textarea
                  className="form-control mb-2"
                  placeholder="Project description"
                  value={p.description || ""}
                  onChange={(e) => updateProject(i, "description", e.target.value)}
                />
                <div className="d-flex justify-content-end">
                  <button
                    className="btn btn-sm btn-outline-danger"
                    onClick={() => removeProject(i)}
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}

            <button className="btn btn-sm btn-outline-primary" onClick={addProject}>
              + Add project
            </button>
          </div>

          <div className="mb-3">
            <label className="form-label">Contact email</label>
            <input
              className="form-control"
              value={form.email || ""}
              onChange={(e) => handleChange("email", e.target.value)}
            />
          </div>
        </div>

        <div className="col-lg-5">
          <div className="card p-3 mb-3">
            <strong>Template:</strong> {portfolio?.template_id || "—"}
            <div className="small text-muted">You can change template in Templates page</div>
          </div>

          <div className="card p-3 mb-3">
            <strong>Preview</strong>
            <div className="mt-2 text-muted">
              Preview updates after saving. Public page:{" "}
              <a href={`/u/${portfolio?.username || form.username}`} target="_blank" rel="noreferrer">
                /u/{portfolio?.username || form.username}
              </a>
            </div>
          </div>

          <div className="d-grid">
            <button className="btn btn-primary mb-2" onClick={handleSave} disabled={saving}>
              {saving ? "Saving..." : "Save changes"}
            </button>
            <button
              className="btn btn-outline-secondary"
              onClick={() => navigate(-1)}
              disabled={saving}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
