import React, { useState } from "react";
import { motion } from "framer-motion";
import "bootstrap-icons/font/bootstrap-icons.css";
import "./GetInspired.css";

const GetInspired = () => {
  // Filter + sort state
  const [sortOption, setSortOption] = useState("Most Popular");
  const [filterDomain, setFilterDomain] = useState("All");

  // Example public portfolio list (you can replace with Firestore data later)
  const portfolios = [
    {
      id: 1,
      name: "Frontend Developer Portfolio",
      domain: "Tech",
      description:
        "A modern developer portfolio built with React, highlighting projects and clean UI.",
      kudos: 128,
      madeBy: "Aarav Sharma",
      date: "Nov 2, 2025",
    },
    {
      id: 2,
      name: "UX Designer Showcase",
      domain: "Design",
      description:
        "Creative designer portfolio showcasing vibrant case studies and prototypes.",
      kudos: 205,
      madeBy: "Riya Kapoor",
      date: "Oct 28, 2025",
    },
    {
      id: 3,
      name: "Business Consultant Profile",
      domain: "Business",
      description:
        "Professional portfolio for a business strategist with achievements and insights.",
      kudos: 96,
      madeBy: "Karan Mehta",
      date: "Nov 1, 2025",
    },
    {
      id: 4,
      name: "Sound Engineer Portfolio",
      domain: "Sound",
      description:
        "Audio specialist’s portfolio featuring high-quality sound mixing and mastering samples.",
      kudos: 74,
      madeBy: "Priya Iyer",
      date: "Oct 30, 2025",
    },
    {
      id: 5,
      name: "Photography Showcase",
      domain: "Photography",
      description:
        "Visual storytelling through breathtaking photography and clean, minimal layout.",
      kudos: 310,
      madeBy: "Rohan Singh",
      date: "Nov 3, 2025",
    },
  ];

  // Filter + sort logic
  const filteredPortfolios = portfolios
    .filter((p) =>
      filterDomain === "All" ? true : p.domain === filterDomain
    )
    .sort((a, b) =>
      sortOption === "Most Popular" ? b.kudos - a.kudos : a.kudos - b.kudos
    );

  return (
    <div className="get-inspired-page">
      <div className="container py-5">
        {/* Header row with title + controls */}
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="getinspired-title">Get Inspired</h1>
            <p className="getinspired-subtitle mb-0">
              Browse public portfolios from talented creators and professionals.
            </p>
          </motion.div>

          <div className="filter-sort-controls d-flex align-items-center gap-3">
            {/* Sort */}
            <div className="sort-dropdown">
              <label className="form-label fw-semibold me-2 mb-0">Sort:</label>
              <select
                className="form-select"
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value)}
              >
                <option>Most Popular</option>
                <option>Least Popular</option>
              </select>
            </div>

            {/* Filter */}
            <div className="filter-dropdown">
              <label className="form-label fw-semibold me-2 mb-0">Filter:</label>
              <select
                className="form-select"
                value={filterDomain}
                onChange={(e) => setFilterDomain(e.target.value)}
              >
                <option>All</option>
                <option>Tech</option>
                <option>Design</option>
                <option>Business</option>
                <option>Sound</option>
                <option>Photography</option>
              </select>
            </div>
          </div>
        </div>

        {/* Portfolio Cards Grid */}
        <div className="row g-4">
          {filteredPortfolios.map((item, index) => (
            <motion.div
              key={item.id}
              className="col-lg-4 col-md-6"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <div className="portfolio-card h-100">
                {/* Top Row */}
                <div className="portfolio-header d-flex justify-content-between align-items-center">
                  <h5 className="portfolio-name">{item.name}</h5>
                  <div className="portfolio-actions">
                    <span className="me-3 text-accent">
                      <i className="bi bi-heart-fill me-1"></i>{item.kudos}
                    </span>
                    <i className="bi bi-bookmark me-3"></i>
                    <i className="bi bi-download"></i>
                  </div>
                </div>

                {/* Description */}
                <p className="portfolio-description my-3">{item.description}</p>

                {/* Footer Row */}
                <div className="portfolio-footer d-flex justify-content-between align-items-center">
                  <span className="portfolio-madeby">
                    Made by <strong>{item.madeBy}</strong>
                  </span>
                  <span className="portfolio-date">{item.date}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default GetInspired;
