import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { useTheme } from "../contexts/ThemeContext";
import { useAuth } from "../contexts/AuthContext";
import Sidebar from "../components/Sidebar";
import "bootstrap-icons/font/bootstrap-icons.css";
import "./Navbar.css";

const Navbar = () => {
  const { theme, toggleTheme } = useTheme();
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  const handleLogout = async () => {
    const result = await logout();
    if (result.success) navigate("/login");
  };

  const isActive = (path) => location.pathname === path;

  const linkVariants = {
    rest: { opacity: 1, scale: 1 },
    hover: { opacity: 0.8, scale: 1.05, transition: { duration: 0.2 } },
  };

  return (
    <>
      <motion.nav
        className="navbar navbar-expand-lg custom-navbar sticky-top"
        initial={{ y: -40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 100 }}
      >
        <div className="container-fluid px-4 d-flex justify-content-between align-items-center">
          {/* Sidebar Toggle */}
          <button className="sidebar-toggle-btn me-3" onClick={toggleSidebar}>
            <i className="bi bi-list"></i>
          </button>

          {/* Brand */}
          <Link to="/" className="navbar-brand fw-bold">
            <motion.span
              whileHover={{ scale: 1.1 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              PortfolioPro
            </motion.span>
          </Link>

          {/* Center links (hide on mobile) */}
          <div className="navbar-links d-none d-lg-flex align-items-center gap-3">
            {[
              { path: "/", label: "Home" },
              { path: "/dashboard", label: "Dashboard" },
              { path: "/get-inspired", label: "Get Inspired" },
              { path: "/ask-ai", label: "Improve Resume" },
              { path: "/contact", label: "Contact Us" },
            ].map((link) => (
              <motion.div key={link.path} initial="rest" whileHover="hover" variants={linkVariants}>
                <Link
                  to={link.path}
                  className={`nav-link ${isActive(link.path) ? "active-nav" : ""}`}
                >
                  {link.label}
                </Link>
              </motion.div>
            ))}
          </div>

          {/* Right controls */}
          <div className="d-flex align-items-center gap-3">
            {/* Theme toggle */}
            <motion.button
              className="btn theme-toggle-btn"
              onClick={toggleTheme}
              whileHover={{ rotate: 15, scale: 1.1 }}
              transition={{ duration: 0.2 }}
            >
              {theme === "light" ? (
                <i className="bi bi-moon-stars-fill"></i>
              ) : (
                <i className="bi bi-sun-fill"></i>
              )}
            </motion.button>

            {/* Auth Buttons */}
            {isAuthenticated ? (
              <div className="d-flex align-items-center gap-2">
                <span className="user-greeting d-none d-sm-inline">
                  Hi, {user?.user_metadata?.display_name || user?.email?.split("@")[0]}
                </span>
                <motion.button
                  onClick={handleLogout}
                  className="btn custom-login-btn fw-bold"
                  whileHover={{ scale: 1.05 }}
                >
                  Logout
                </motion.button>
              </div>
            ) : (
              <>
                <Link to="/login" className="btn custom-login-btn fw-bold">
                  Login
                </Link>
                <Link to="/signup" className="btn custom-cta-btn fw-bold">
                  Create Portfolio
                </Link>
              </>
            )}
          </div>
        </div>
      </motion.nav>

      {/* Sidebar component */}
      <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
    </>
  );
};

export default Navbar;
