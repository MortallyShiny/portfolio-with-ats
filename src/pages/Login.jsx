import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../contexts/AuthContext";
import "bootstrap-icons/font/bootstrap-icons.css";
import "./Login.css";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  // Helper: translate Firebase error codes
  const getErrorMessage = (code) => {
    switch (code) {
      case "auth/user-not-found":
      case "auth/wrong-password":
      case "auth/invalid-credential":
        return "Invalid email or password.";
      case "auth/invalid-email":
        return "Invalid email address format.";
      case "auth/user-disabled":
        return "Your account has been disabled.";
      case "auth/too-many-requests":
        return "Too many failed attempts. Try again later.";
      case "auth/network-request-failed":
        return "Network error. Please check your internet connection.";
      default:
        return "Login failed. Please check your credentials.";
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Please fill in all fields.");
      return;
    }

    setLoading(true);
    console.log("🟡 Attempting login with:", email);

    try {
      const result = await login(email, password);
      console.log("🟢 Firebase login result:", result);

      if (result.success) {
        console.log("✅ Login success. Redirecting...");
        navigate("/dashboard");
      } else {
        setError(getErrorMessage(result.error));
      }
    } catch (err) {
      console.error("🔥 Unexpected error:", err);
      setError("Unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      className="login-container d-flex justify-content-center align-items-center min-vh-100"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="login-card p-4 shadow-lg rounded-4" style={{ maxWidth: "400px", width: "100%" }}>
        <motion.h2
          className="text-center mb-3 fw-bold"
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
        >
          Welcome Back 👋
        </motion.h2>
        <p className="text-center text-muted mb-4">
          Sign in to your <strong>PortfolioPro</strong> account
        </p>

        <form onSubmit={handleSubmit}>
          {/* Email */}
          <div className="mb-3">
            <label className="form-label fw-semibold">Email</label>
            <input
              type="email"
              className="form-control"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />
          </div>

          {/* Password */}
          <div className="mb-3 position-relative">
            <label className="form-label fw-semibold">Password</label>
            <input
              type={showPassword ? "text" : "password"}
              className="form-control"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
            />
            <i
              className={`bi ${showPassword ? "bi-eye-slash" : "bi-eye"} password-toggle`}
              style={{
                position: "absolute",
                right: "15px",
                top: "40px",
                cursor: "pointer",
                color: "#6c757d",
              }}
              onClick={() => setShowPassword(!showPassword)}
            ></i>
          </div>

          {/* Error */}
          {error && (
            <div className="alert alert-danger py-2">
              <i className="bi bi-exclamation-triangle me-2"></i>
              {error}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            className="btn btn-primary w-100 mt-2"
            disabled={loading}
          >
            {loading ? (
              <>
                <span
                  className="spinner-border spinner-border-sm me-2"
                  role="status"
                  aria-hidden="true"
                ></span>
                Signing in...
              </>
            ) : (
              "Sign In"
            )}
          </button>

          <div className="text-end mt-2">
            <Link to="/forgot-password" className="text-decoration-none small">
              Forgot password?
            </Link>
          </div>
        </form>

        {/* Divider */}
        <div className="d-flex align-items-center my-3">
          <hr className="flex-grow-1" />
          <span className="mx-2 text-muted small">OR</span>
          <hr className="flex-grow-1" />
        </div>

        {/* Signup Link */}
        <p className="text-center small mb-0">
          Don't have an account?{" "}
          <Link to="/signup" className="fw-semibold text-decoration-none">
            Sign up here
          </Link>
        </p>
      </div>
    </motion.div>
  );
};

export default Login;
