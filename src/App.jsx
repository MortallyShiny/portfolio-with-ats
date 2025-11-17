import React from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import "./App.css";

// Layouts & Contexts
import Navbar from "./layouts/Navbar";
import Footer from "./layouts/Footer";
import { ThemeProvider } from "./contexts/ThemeContext";

// Components
import ProtectedRoute from "./components/ProtectedRoute";

// Pages (Public)
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Contact from "./pages/Contact";
import PublicPortfolio from "./pages/PublicPortfolio"; // ⭐ NEW

// Pages (Protected)
import Dashboard from "./pages/Dashboard";
import AskAI from "./pages/AskAI";
import Settings from "./pages/Settings";
import UploadResume from "./pages/UploadResume";
import UploadPortfolio from "./pages/UploadPortfolio";
import GetInspired from "./pages/GetInspired";

// Portfolio Builder Pages
import Templates from "./pages/Templates";
import CreatePortfolio from "./pages/CreatePortfolio";
import EditPortfolio from "./pages/EditPortfolio";

const App = () => {
  const location = useLocation();

  // Full-screen pages that hide Navbar & Footer
  const hideNavbarRoutes = [
    "/login",
    "/signup",
    "/dashboard",
    "/create-portfolio",
    "/edit-portfolio",
    "/ask-ai",
    "/settings",
    "/upload-resume",
    "/upload-portfolio",
    "/get-inspired",
    "/templates",
  ];

  // Also hide navbar/footer on public portfolio pages like /u/username
  const isPublicPortfolio = location.pathname.startsWith("/u/");

  const shouldHideNavbar =
    hideNavbarRoutes.includes(location.pathname) || isPublicPortfolio;

  return (
    <ThemeProvider>
      {/* Show Navbar only when needed */}
      {!shouldHideNavbar && <Navbar />}

      <Routes>
        {/* PUBLIC ROUTES */}
        <Route path="/" element={<Home />} />
        <Route path="/contact" element={<Contact />} />

        {/* Auth Pages */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* PUBLIC PORTFOLIO VIEWER */}
        <Route path="/u/:username" element={<PublicPortfolio />} />

        {/* PROTECTED ROUTES */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        {/* Portfolio Builder */}
        <Route
          path="/templates"
          element={
            <ProtectedRoute>
              <Templates />
            </ProtectedRoute>
          }
        />

        <Route
          path="/create-portfolio"
          element={
            <ProtectedRoute>
              <CreatePortfolio />
            </ProtectedRoute>
          }
        />

        <Route
          path="/edit-portfolio"
          element={
            <ProtectedRoute>
              <EditPortfolio />
            </ProtectedRoute>
          }
        />

        {/* Resume / Portfolio Upload */}
        <Route
          path="/upload-resume"
          element={
            <ProtectedRoute>
              <UploadResume />
            </ProtectedRoute>
          }
        />

        <Route
          path="/upload-portfolio"
          element={
            <ProtectedRoute>
              <UploadPortfolio />
            </ProtectedRoute>
          }
        />

        {/* Improve Resume AI */}
        <Route
          path="/ask-ai"
          element={
            <ProtectedRoute>
              <AskAI />
            </ProtectedRoute>
          }
        />

        {/* Get Inspired (Templates list) */}
        <Route
          path="/get-inspired"
          element={
            <ProtectedRoute>
              <GetInspired />
            </ProtectedRoute>
          }
        />

        {/* 404 → Login */}
        <Route path="*" element={<Login />} />
      </Routes>

      {/* Show Footer only when Navbar is visible */}
      {!shouldHideNavbar && <Footer />}
    </ThemeProvider>
  );
};

export default App;
