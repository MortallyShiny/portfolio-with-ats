import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import "./PortfolioForm.css";

const PortfolioForm = () => {
  const [formData, setFormData] = useState({
    navbarName: "",
    heroName: "",
    designations: [""],
    introduction: "",
    socialLinks: {
      github: "",
      instagram: "",
      twitter: "",
      linkedin: "",
    },
    projects: [
      {
        title: "",
        description: "",
        githubLink: "",
        demoLink: "",
        image: "",
      },
    ],
  });

  const [currentDesignationIndex, setCurrentDesignationIndex] = useState(0);
  const [linkErrors, setLinkErrors] = useState({});

  const [activeTooltip, setActiveTooltip] = useState(null);

  // Animate designations slideshow
  useEffect(() => {
    const filledDesignations = formData.designations.filter(
      (d) => d.trim() !== ""
    );
    if (filledDesignations.length > 1) {
      const interval = setInterval(() => {
        setCurrentDesignationIndex(
          (prev) => (prev + 1) % filledDesignations.length
        );
      }, 3000); // Change every 3 seconds
      return () => clearInterval(interval);
    } else {
      setCurrentDesignationIndex(0);
    }
  }, [formData.designations]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name.startsWith("social-")) {
      const socialKey = name.replace("social-", "");
      setFormData((prev) => ({
        ...prev,
        socialLinks: {
          ...prev.socialLinks,
          [socialKey]: value,
        },
      }));
      // Clear error when user types
      setLinkErrors((prev) => ({
        ...prev,
        [socialKey]: "",
      }));
    } else if (name.startsWith("designation-")) {
      const index = parseInt(name.replace("designation-", ""));
      setFormData((prev) => {
        const updatedDesignations = [...prev.designations];
        updatedDesignations[index] = value;
        return {
          ...prev,
          designations: updatedDesignations,
        };
      });
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleProjectChange = (index, field, value) => {
    setFormData((prev) => {
      const updatedProjects = [...prev.projects];
      updatedProjects[index] = {
        ...updatedProjects[index],
        [field]: value,
      };
      return {
        ...prev,
        projects: updatedProjects,
      };
    });

    // Validate URLs for GitHub and Demo links
    if (field === "githubLink" || field === "demoLink") {
      const errorKey = `${index}-${field}`;
      if (value.trim() !== "" && !isValidUrl(value)) {
        setLinkErrors((prev) => ({
          ...prev,
          [errorKey]: "Please input valid link",
        }));
      } else {
        setLinkErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors[errorKey];
          return newErrors;
        });
      }
    }
  };

  const isValidUrl = (string) => {
    try {
      const url = new URL(string);
      return url.protocol === "http:" || url.protocol === "https:";
    } catch (_) {
      return false;
    }
  };

  const addDesignation = () => {
    setFormData((prev) => ({
      ...prev,
      designations: [...prev.designations, ""],
    }));
  };

  const removeDesignation = (index) => {
    if (formData.designations.length > 1) {
      setFormData((prev) => ({
        ...prev,
        designations: prev.designations.filter((_, i) => i !== index),
      }));
      if (currentDesignationIndex >= formData.designations.length - 1) {
        setCurrentDesignationIndex(0);
      }
    }
  };

  const removeSocialLink = (socialKey) => {
    setFormData((prev) => ({
      ...prev,
      socialLinks: {
        ...prev.socialLinks,
        [socialKey]: "",
      },
    }));
  };

  const addProject = () => {
    setFormData((prev) => ({
      ...prev,
      projects: [
        ...prev.projects,
        {
          title: "",
          description: "",
          githubLink: "",
          demoLink: "",
          image: "",
        },
      ],
    }));
  };

  const removeProject = (index) => {
    if (formData.projects.length > 1) {
      setFormData((prev) => ({
        ...prev,
        projects: prev.projects.filter((_, i) => i !== index),
      }));
    }
  };

  const socialIcons = [
    { key: "github", label: "GitHub", icon: "bi-github" },
    { key: "twitter", label: "Twitter", icon: "bi-twitter" },
    { key: "linkedin", label: "LinkedIn", icon: "bi-linkedin" },
    { key: "instagram", label: "Instagram", icon: "bi-instagram" },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div className="portfolio-form-page">
      <div className="portfolio-form-container">
        {/* Navigation Bar */}
        <motion.nav
          className="portfolio-navbar"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="portfolio-nav-content">
            <div className="portfolio-logo">
              <input
                type="text"
                name="navbarName"
                value={formData.navbarName}
                onChange={handleChange}
                placeholder="Enter your name"
                className="logo-input"
              />
            </div>
            <div className="portfolio-nav-links">
              <a href="#home">Home</a>
              <a href="#about">About</a>
              <a href="#projects">Projects</a>
              <a href="#resume">Resume</a>
            </div>
          </div>
        </motion.nav>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="portfolio-form-content"
        >
          {/* Hero Section */}
          <motion.section
            id="home"
            className="portfolio-hero-section"
            variants={itemVariants}
          >
            <div className="hero-content">
              <div className="hero-text">
                <motion.h1 className="hero-greeting" variants={itemVariants}>
                  Hi There! 👋
                </motion.h1>
                <motion.p className="hero-i-am" variants={itemVariants}>
                  I AM
                </motion.p>
                <motion.div className="hero-name" variants={itemVariants}>
                  <input
                    type="text"
                    name="heroName"
                    value={formData.heroName}
                    onChange={handleChange}
                    placeholder="YOUR NAME"
                    className="name-input"
                  />
                </motion.div>
                <motion.div
                  className="hero-designation-container"
                  variants={itemVariants}
                >
                  <div className="designation-input-wrapper">
                    {formData.designations.map((designation, index) => (
                      <div key={index} className="designation-input-group">
                        <input
                          type="text"
                          name={`designation-${index}`}
                          value={designation}
                          onChange={handleChange}
                          placeholder="Software Developer"
                          className="designation-input"
                          style={{
                            display:
                              formData.designations.filter(
                                (d) => d.trim() !== ""
                              ).length > 1
                                ? index === currentDesignationIndex
                                  ? "block"
                                  : "none"
                                : "block",
                          }}
                        />
                        {formData.designations.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeDesignation(index)}
                            className="remove-designation-btn"
                          >
                            <i className="bi bi-x"></i>
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={addDesignation}
                    className="add-designation-btn"
                  >
                    <i className="bi bi-plus-lg"></i>
                  </button>
                  {formData.designations.filter((d) => d.trim() !== "").length >
                    1 && <span className="designation-blink">|</span>}
                </motion.div>
              </div>
            </div>
          </motion.section>

          {/* About Section */}
          <motion.section
            id="about"
            className="portfolio-about-section"
            variants={itemVariants}
          >
            <motion.h2 className="section-title" variants={itemVariants}>
              LET ME <span className="highlight">INTRODUCE MYSELF</span>
            </motion.h2>
            <motion.div className="about-content" variants={itemVariants}>
              <textarea
                name="introduction"
                value={formData.introduction}
                onChange={handleChange}
                placeholder="Enter your introduction here. Tell us about yourself, your skills, interests, and what you love to work on. For example: 'I'm a Software Engineer who loves transforming ideas into reliable, scalable products. Over time, I've explored several technologies and found my passion in building high-performance systems and intuitive user experiences.'"
                className="introduction-textarea"
                rows="8"
              />
            </motion.div>
          </motion.section>

          {/* Social Links Section */}
          <section className="portfolio-social-section">
            <h2 className="section-title">Find Me On</h2>
            <p className="social-subtitle">
              Feel free to <span className="highlight">connect</span> with me
            </p>

            <div className="social-icons-container">
              {socialIcons
                .filter((social) =>
                  formData.socialLinks.hasOwnProperty(social.key)
                )
                .map((social) => (
                  <div
                    key={social.key}
                    className="social-icon-wrapper"
                    onMouseEnter={() => setActiveTooltip(social.key)}
                    onMouseLeave={() => setActiveTooltip(null)}
                  >
                    <input
                      type="url"
                      name={`social-${social.key}`}
                      value={formData.socialLinks[social.key]}
                      onChange={handleChange}
                      placeholder={`Enter your ${social.label} link`}
                      className="social-link-input"
                    />
                    <div className="social-icon-container">
                      <a
                        href={formData.socialLinks[social.key] || "#"}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="social-icon-link"
                        onClick={(e) => {
                          if (!formData.socialLinks[social.key]) {
                            e.preventDefault();
                          }
                        }}
                      >
                        <div className="social-icon">
                          <i className={`bi ${social.icon}`}></i>
                        </div>
                      </a>
                      <button
                        type="button"
                        onClick={() => {
                          const updatedLinks = { ...formData.socialLinks };
                          delete updatedLinks[social.key];
                          setFormData((prev) => ({
                            ...prev,
                            socialLinks: updatedLinks,
                          }));
                        }}
                        className="remove-social-btn"
                        title="Remove Icon"
                      >
                        <i className="bi bi-x"></i>
                      </button>
                    </div>

                    {activeTooltip === social.key && (
                      <div className="tooltip">
                        Enter your {social.label} profile link
                      </div>
                    )}
                  </div>
                ))}

              {/* Add back removed icons */}
              {Object.keys(formData.socialLinks).length <
                socialIcons.length && (
                <div className="add-icon-dropdown">
                  <label>Add Icon:</label>
                  <select
                    onChange={(e) => {
                      const key = e.target.value;
                      if (key) {
                        setFormData((prev) => ({
                          ...prev,
                          socialLinks: {
                            ...prev.socialLinks,
                            [key]: "",
                          },
                        }));
                        e.target.value = "";
                      }
                    }}
                  >
                    <option value="">Select</option>
                    {socialIcons
                      .filter(
                        (social) =>
                          !formData.socialLinks.hasOwnProperty(social.key)
                      )
                      .map((social) => (
                        <option key={social.key} value={social.key}>
                          {social.label}
                        </option>
                      ))}
                  </select>
                </div>
              )}
            </div>
          </section>

          {/* Projects Section */}
          <motion.section
            id="projects"
            className="portfolio-projects-section"
            variants={itemVariants}
          >
            <motion.h2 className="section-title" variants={itemVariants}>
              My Recent <span className="highlight">Works</span>
            </motion.h2>
            <motion.p className="projects-subtitle" variants={itemVariants}>
              Here are a few projects I've worked on recently.
            </motion.p>
            <motion.div className="projects-grid" variants={itemVariants}>
              {formData.projects.map((project, index) => (
                <motion.div
                  key={index}
                  className="project-card"
                  variants={itemVariants}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className="project-image-placeholder">
                    <i className="bi bi-image"></i>
                    <span>Project Image</span>
                  </div>
                  <div className="project-content">
                    <input
                      type="text"
                      placeholder="Enter project title"
                      value={project.title}
                      onChange={(e) =>
                        handleProjectChange(index, "title", e.target.value)
                      }
                      className="project-title-input"
                    />
                    <textarea
                      placeholder="Enter project description"
                      value={project.description}
                      onChange={(e) =>
                        handleProjectChange(
                          index,
                          "description",
                          e.target.value
                        )
                      }
                      className="project-description-input"
                      rows="3"
                    />
                    <div className="project-links">
                      <div className="project-link-wrapper">
                        <input
                          type="url"
                          placeholder="Enter GitHub link"
                          value={project.githubLink}
                          onChange={(e) =>
                            handleProjectChange(
                              index,
                              "githubLink",
                              e.target.value
                            )
                          }
                          className={`project-link-input ${
                            linkErrors[`${index}-githubLink`] ? "invalid" : ""
                          }`}
                        />
                        {linkErrors[`${index}-githubLink`] && (
                          <div className="link-error-message">
                            {linkErrors[`${index}-githubLink`]}
                          </div>
                        )}
                      </div>
                      <div className="project-link-wrapper">
                        <input
                          type="url"
                          placeholder="Enter demo link"
                          value={project.demoLink}
                          onChange={(e) =>
                            handleProjectChange(
                              index,
                              "demoLink",
                              e.target.value
                            )
                          }
                          className={`project-link-input ${
                            linkErrors[`${index}-demoLink`] ? "invalid" : ""
                          }`}
                        />
                        {linkErrors[`${index}-demoLink`] && (
                          <div className="link-error-message">
                            {linkErrors[`${index}-demoLink`]}
                          </div>
                        )}
                      </div>
                    </div>
                    {formData.projects.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeProject(index)}
                        className="remove-project-btn"
                      >
                        <i className="bi bi-trash"></i>
                      </button>
                    )}
                  </div>
                </motion.div>
              ))}
              <motion.button
                type="button"
                onClick={addProject}
                className="add-project-btn"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <i className="bi bi-plus-lg"></i>
              </motion.button>
            </motion.div>
          </motion.section>

          {/* Submit Button */}
          <motion.div className="submit-section" variants={itemVariants}>
            <motion.button
              type="button"
              className="submit-portfolio-btn"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Generate Portfolio
            </motion.button>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default PortfolioForm;
