// src/utils/templateRenderer.js

/**
 * Replace {{variable}} placeholders with data values.
 * Supports deep keys like user.name using dot notation.
 */
function replaceFields(html, data) {
  return html.replace(/{{\s*([\w.]+)\s*}}/g, (_, key) => {
    const parts = key.split(".");
    let value = data;

    for (let p of parts) {
      value = value?.[p];
      if (value === undefined || value === null) return "";
    }

    return value;
  });
}

/**
 * Render project blocks into {{projects}} placeholder.
 */
function renderProjects(projects = []) {
  if (!Array.isArray(projects) || projects.length === 0) return "";

  return projects
    .map(
      (p) => `
      <div class="project-block">
        <h3>${p.title || ""}</h3>
        <p>${p.description || ""}</p>
        ${
          p.link
            ? `<a href="${p.link}" target="_blank" class="project-link">
                 View Project →
               </a>`
            : ""
        }
      </div>
    `
    )
    .join("\n");
}

/**
 * Render skill chips into {{skills}} placeholder.
 */
function renderSkills(skills = "") {
  if (!skills || typeof skills !== "string") return "";

  return skills
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .map((s) => `<span class="skill-chip">${s}</span>`)
    .join("\n");
}

/**
 * Render profile image into {{profile_image}} placeholder.
 */
function renderProfileImage(url) {
  if (!url) return "";
  return `<img src="${url}" alt="Profile" class="profile-image" />`;
}

/**
 * Final Renderer — generates full static HTML page that can
 * be served anywhere (Supabase, Vercel, Netlify, Cloudflare).
 */
export function renderTemplateHtml(html, css = "", js = "", data = {}) {
  if (!html) {
    return `<h1>Error: Missing template HTML</h1>`;
  }

  let output = html;

  // Insert dynamic blocks
  output = output.replace("{{projects}}", renderProjects(data.projects));
  output = output.replace("{{skills}}", renderSkills(data.skills));
  output = output.replace("{{profile_image}}", renderProfileImage(data.profile_image));

  // Replace simple placeholders {{name}}, {{bio}}, {{headline}}, etc.
  output = replaceFields(output, data);

  // Full compiled HTML
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>${data.name || "Portfolio"}</title>

  <style>
    body {
      margin: 0;
      padding: 0;
      font-family: system-ui, sans-serif;
      background: #fff;
    }

    .skill-chip {
      display: inline-block;
      padding: 6px 12px;
      background: #f1f1f1;
      border-radius: 8px;
      margin: 4px;
      font-size: 0.9rem;
    }

    .project-block {
      padding: 12px 0;
      border-bottom: 1px solid #ddd;
    }

    .profile-image {
      width: 140px;
      height: 140px;
      object-fit: cover;
      border-radius: 50%;
      margin-bottom: 12px;
    }

    ${css}
  </style>
</head>

<body>
  ${output}

  <script>
    ${js}
  </script>
</body>
</html>
  `.trim();
}
