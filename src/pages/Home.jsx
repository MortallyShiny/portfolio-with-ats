import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import "./Home.css"; // Ensure this file exists for custom styles!

// --- DATA ARRAYS ---

const featuresData = [
  {
    title: "AI Resume Optimization",
    description:
      "Freshers: Instantly check your resume for ATS compatibility and receive tailored feedback. Freelancers: Highlight quantifiable achievements for clients.",
    icon: "robot",
  },
  {
    title: "Drag-and-Drop Editor",
    description:
      "Build your perfect portfolio in minutes. Our WYSIWYG editor allows you to customize layouts, colors, and sections without writing a single line of code.",
    icon: "bricks",
  },
  {
    title: "Industry-Specific Templates",
    description:
      "Choose from professional templates tailored for Dev, Design, Marketing, and more, ensuring your portfolio fits industry standards.",
    icon: "palette",
  },
  {
    title: "Advanced View Analytics",
    description:
      "Track recruiter and client engagement. See who viewed your portfolio, where they spent the most time, and what links they clicked.",
    icon: "graph-up",
  },
  {
    title: "Secure Cloud Hosting",
    description:
      "Easily publish your portfolio to a custom subdomain. Your data and files are securely hosted using Firebase Storage and Vercel's infrastructure.",
    icon: "cloud-lock",
  },
  {
    title: "One-Click Portfolio Upload",
    description:
      "Already have a portfolio? Upload existing documents (PDFs, ZIPs) or link external sites to consolidate all your professional assets in one place.",
    icon: "upload",
  },
];

const faqData = [
  {
    question: "Is PortfolioPro truly free for freshers?",
    answer:
      "Yes! Our core portfolio building tools and basic hosting are completely free. We offer premium tiers for advanced features like custom domains, deep analytics, and premium templates.",
  },
  {
    question: "How does the AI Resume Optimization work?",
    answer:
      "Our AI analyzes your uploaded resume against industry best practices and common Applicant Tracking Systems (ATS). It provides suggestions to improve keywords, formatting, and impact, giving you an edge in the job market.",
  },
  {
    question: "Can I use my own domain name (e.g., www.myname.com)?",
    answer:
      "This feature is available on our **Premium Plan**. Once upgraded, you can easily map your domain purchased from any provider directly to your PortfolioPro website.",
  },
  {
    question: "What if I need to update my portfolio content frequently?",
    answer:
      "Our platform is designed for dynamic professionals. You can update your content, images, and projects instantly via the **Drag-and-Drop Editor**. Changes are live immediately upon publishing.",
  },
];

const Home = () => {
  // Framer Motion variants for animated entrance (Hero Section)
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 },
  };

  return (
    <>
      {/* ============================== 1. HERO SECTION ============================== */}
      <section className="hero-section" style={{ minHeight: "85vh" }}>
        <div className="container py-5">
          <motion.div
            className="row align-items-center"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {/* Left Column: Content (Text and CTAs) */}
            <div className="col-lg-6 col-md-12 text-center text-lg-start pt-5">
              <motion.h1
                className="display-2 fw-bold mb-4"
                variants={itemVariants}
              >
                Launch Your Career with an{" "}
                <span style={{ color: "var(--accent-primary)" }}>
                  Impactful Portfolio.
                </span>
              </motion.h1>

              <motion.p className="lead mb-5" variants={itemVariants}>
                Stop struggling with code, start building your future.
              </motion.p>

              {/* Primary CTA Button (Muted Rose) */}
              <motion.div
                className="d-grid gap-3 d-sm-flex justify-content-sm-center justify-content-lg-start"
                variants={itemVariants}
              >
                <Link
                  to="/signup"
                  className="btn custom-cta-btn btn-lg fw-bold px-4 py-3"
                >
                  Start Building for Free
                </Link>

                {/* Secondary CTA Button (Subtle Outline) */}
                <Link
                  to="/templates"
                  className="btn btn-outline-secondary btn-lg fw-bold px-4 py-3 custom-outline-btn"
                >
                  View Templates
                </Link>
              </motion.div>
            </div>

            {/* Right Column: Visual/Image */}
            <div className="col-lg-6 col-md-12 d-none d-lg-block">
              <motion.div
                className="hero-image-container"
                variants={itemVariants}
                transition={{ duration: 0.8 }}
              ></motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ============================== 2. FEATURES SECTION ============================== */}
      <section className="features-section py-5">
        <div className="container py-5">
          {/* Section Header */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-5"
          >
            <h2 className="display-4 fw-bold">
              Features Designed for Your Success
            </h2>
            <p className="lead">
              Get discovered by recruiters and clients faster with tools built
              for the modern professional.
            </p>
          </motion.div>

          {/* Features Grid */}
          <div className="row g-4">
            {featuresData.map((feature, index) => (
              <div key={index} className="col-lg-4 col-md-6">
                <motion.div
                  className="card h-100 p-4 border-0 shadow-sm"
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <div className="card-body">
                    <div
                      className="mb-3"
                      style={{
                        color: "var(--accent-primary)",
                        fontSize: "2rem",
                      }}
                    >
                      <i className={`bi bi-${feature.icon}`}></i>
                    </div>
                    <h4 className="card-title fw-bold">{feature.title}</h4>
                    <p className="card-text text-muted">
                      {feature.description}
                    </p>
                  </div>
                </motion.div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================== 3. FAQ SECTION ============================== */}
      <section className="faq-section py-5">
        <div className="container py-5">
          {/* Section Header */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-5"
          >
            <h2 className="display-4 fw-bold">Frequently Asked Questions</h2>
            <p className="lead">
              Everything you need to know about building your next professional
              portfolio.
            </p>
          </motion.div>

          {/* FAQ Accordion Grid */}
          <div className="row justify-content-center">
            <div className="col-lg-10">
              <motion.div
                className="accordion"
                id="faqAccordion"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.6 }}
              >
                {faqData.map((item, index) => (
                  <div
                    key={index}
                    className="accordion-item mb-3 rounded-3 shadow-sm border-0"
                  >
                    <h2 className="accordion-header" id={`heading${index}`}>
                      <button
                        className="accordion-button collapsed fw-bold"
                        type="button"
                        data-bs-toggle="collapse"
                        data-bs-target={`#collapse${index}`}
                        aria-expanded="false"
                        aria-controls={`collapse${index}`}
                      >
                        {item.question}
                      </button>
                    </h2>
                    <div
                      id={`collapse${index}`}
                      className="accordion-collapse collapse"
                      aria-labelledby={`heading${index}`}
                      data-bs-parent="#faqAccordion"
                    >
                      <div className="accordion-body text-muted">
                        {item.answer}
                      </div>
                    </div>
                  </div>
                ))}
              </motion.div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Home;
