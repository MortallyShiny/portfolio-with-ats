import React from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../contexts/AuthContext";
import { useTheme } from "../contexts/ThemeContext";
import "bootstrap-icons/font/bootstrap-icons.css";
import "./Sidebar.css";

export default function Sidebar({ isOpen, toggleSidebar }) {
  const { user, logout } = useAuth();
  const { theme } = useTheme();
  const location = useLocation();

  const username =
    user?.user_metadata?.username ||
    user?.email?.split("@")[0] ||
    "user";

  const menuItems = [
    { path: "/", label: "Home", icon: "bi-house" },
    { path: "/dashboard", label: "My Dashboard", icon: "bi-graph-up" },
    { path: "/templates", label: "View Templates", icon: "bi-columns" },
    { path: "/create-portfolio", label: "Build Portfolio", icon: "bi-brush" },
    { path: `/u/${username}`, label: "My Public Portfolio", icon: "bi-person-bounding-box" },
    { path: "/get-inspired", label: "Get Inspired", icon: "bi-lightbulb" },
    { path: "/ask-ai", label: "Improve Resume AI", icon: "bi-stars" },
    { path: "/upload-resume", label: "Upload Resume", icon: "bi-file-earmark-arrow-up" },
    { path: "/upload-portfolio", label: "Upload Portfolio", icon: "bi-cloud-upload" },
    { path: "/settings", label: "Settings", icon: "bi-gear" },
  ];

  const handleLogout = async () => {
    await logout();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            className="sidebar-overlay"
            onClick={toggleSidebar}
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
          />

          {/* Sidebar */}
          <motion.aside
            className={`universal-sidebar ${theme}`}
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", stiffness: 105, damping: 18 }}
          >
            {/* Header */}
            <div className="sidebar-header">
              <h2 className="sidebar-logo">
                <i className="bi bi-kanban"></i> PortfolioPro
              </h2>

              <button className="sidebar-close" onClick={toggleSidebar}>
                <i className="bi bi-x-lg"></i>
              </button>
            </div>

            {/* User Info */}
            {user && (
              <div className="sidebar-user">
                <div className="sidebar-avatar">
                  {user.user_metadata?.avatar_url ? (
                    <img
                      src={user.user_metadata.avatar_url}
                      alt="Avatar"
                    />
                  ) : (
                    <i className="bi bi-person-circle"></i>
                  )}
                </div>

                <div className="sidebar-user-details">
                  <p className="user-name">
                    {user.user_metadata?.display_name || username}
                  </p>
                  <p className="user-email">{user.email}</p>
                </div>
              </div>
            )}

            {/* Menu */}
            <nav className="sidebar-nav">
              {menuItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={toggleSidebar}
                  className={`sidebar-link ${
                    location.pathname === item.path ? "active" : ""
                  }`}
                >
                  <i className={`bi ${item.icon}`}></i>
                  <span>{item.label}</span>
                </Link>
              ))}
            </nav>

            {/* Footer */}
            <div className="sidebar-footer">
              <button className="logout-btn" onClick={handleLogout}>
                <i className="bi bi-box-arrow-right me-2"></i> Logout
              </button>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
