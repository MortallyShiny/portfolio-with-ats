import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../contexts/AuthContext";
import "./Signup.css";

const Signup = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [firebaseError, setFirebaseError] = useState("");
  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    } else if (formData.name.trim().length < 2) {
      newErrors.name = "Name must be at least 2 characters";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Helper function to get user-friendly error messages
  const getErrorMessage = (errorCode, errorMessage) => {
    // Log the error for debugging
    console.log('Error Code:', errorCode);
    console.log('Error Message:', errorMessage);
    
    switch (errorCode) {
      case "auth/email-already-in-use":
        return "An account with this email already exists. Please sign in instead.";
      case "auth/invalid-email":
        return "Invalid email address format.";
      case "auth/operation-not-allowed":
        return "Email/password accounts are not enabled. Please enable it in Firebase Console > Authentication > Sign-in method.";
      case "auth/weak-password":
        return "Password is too weak. Please choose a stronger password (at least 6 characters).";
      case "auth/network-request-failed":
        return "Network error. Please check your connection.";
      case "auth/invalid-api-key":
        return "Invalid Firebase API key. Please check your Firebase configuration.";
      case "auth/app-not-authorized":
        return "Firebase app is not authorized. Please check your Firebase configuration.";
      default:
        // Show the actual error message if available for debugging
        if (errorMessage && errorMessage !== errorCode) {
          return `${errorMessage}. If this persists, please check the browser console for details.`;
        }
        return `Error: ${errorCode || "An error occurred. Please try again."}`;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFirebaseError("");
    
    if (validateForm()) {
      setLoading(true);
      
      try {
        const result = await signup(
          formData.email,
          formData.password,
          formData.name
        );
        
        if (result.success) {
          // Success - user will be automatically redirected by AuthContext
          navigate("/dashboard");
        } else {
          // Handle Firebase error
          const errorCode = result.error || "unknown-error";
          const errorMessage = result.errorMessage || "";
          const userFriendlyMessage = getErrorMessage(errorCode, errorMessage);
          setFirebaseError(userFriendlyMessage);
          
          // Log full error for debugging
          console.error('Signup failed:', {
            errorCode: errorCode,
            errorMessage: errorMessage,
            fullError: result
          });
        }
      } catch (error) {
        setFirebaseError("An unexpected error occurred. Please try again.");
      } finally {
        setLoading(false);
      }
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div className="signup-page">
      <div className="container py-5">
        <div className="row justify-content-center align-items-center min-vh-100 py-5">
          <motion.div
            className="col-lg-5 col-md-7 col-sm-9"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.div className="signup-card" variants={itemVariants}>
              {/* Header */}
              <div className="text-center mb-4">
                <motion.h2
                  className="signup-title mb-2"
                  variants={itemVariants}
                >
                  Create Your Account
                </motion.h2>
                <motion.p
                  className="signup-subtitle"
                  variants={itemVariants}
                >
                  Start building your professional portfolio today
                </motion.p>
              </div>

              {/* Signup Form */}
              <form onSubmit={handleSubmit}>
                {/* Name Field */}
                <motion.div className="mb-3" variants={itemVariants}>
                  <label htmlFor="name" className="form-label">
                    Full Name
                  </label>
                  <input
                    type="text"
                    className={`form-control ${errors.name ? "is-invalid" : ""}`}
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter your full name"
                    autoComplete="name"
                  />
                  {errors.name && (
                    <div className="invalid-feedback">{errors.name}</div>
                  )}
                </motion.div>

                {/* Email Field */}
                <motion.div className="mb-3" variants={itemVariants}>
                  <label htmlFor="email" className="form-label">
                    Email Address
                  </label>
                  <input
                    type="email"
                    className={`form-control ${errors.email ? "is-invalid" : ""}`}
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter your email"
                    autoComplete="email"
                  />
                  {errors.email && (
                    <div className="invalid-feedback">{errors.email}</div>
                  )}
                </motion.div>

                {/* Password Field */}
                <motion.div className="mb-3" variants={itemVariants}>
                  <label htmlFor="password" className="form-label">
                    Password
                  </label>
                  <div className="password-input-wrapper">
                    <input
                      type={showPassword ? "text" : "password"}
                      className={`form-control ${errors.password ? "is-invalid" : ""}`}
                      id="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Create a password"
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      className="password-toggle-btn"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label="Toggle password visibility"
                    >
                      <i
                        className={`bi ${showPassword ? "bi-eye-slash" : "bi-eye"}`}
                      ></i>
                    </button>
                  </div>
                  {errors.password && (
                    <div className="invalid-feedback">{errors.password}</div>
                  )}
                </motion.div>

                {/* Confirm Password Field */}
                <motion.div className="mb-4" variants={itemVariants}>
                  <label htmlFor="confirmPassword" className="form-label">
                    Confirm Password
                  </label>
                  <div className="password-input-wrapper">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      className={`form-control ${errors.confirmPassword ? "is-invalid" : ""}`}
                      id="confirmPassword"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      placeholder="Confirm your password"
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      className="password-toggle-btn"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      aria-label="Toggle password visibility"
                    >
                      <i
                        className={`bi ${showConfirmPassword ? "bi-eye-slash" : "bi-eye"}`}
                      ></i>
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <div className="invalid-feedback">
                      {errors.confirmPassword}
                    </div>
                  )}
                </motion.div>

                {/* Firebase Error Message */}
                {firebaseError && (
                  <motion.div
                    className="alert alert-danger"
                    role="alert"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <i className="bi bi-exclamation-triangle-fill me-2"></i>
                    {firebaseError}
                  </motion.div>
                )}

                {/* Submit Button */}
                <motion.button
                  type="submit"
                  className="btn signup-submit-btn w-100 mb-3"
                  variants={itemVariants}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span
                        className="spinner-border spinner-border-sm me-2"
                        role="status"
                        aria-hidden="true"
                      ></span>
                      Creating Account...
                    </>
                  ) : (
                    "Create Account"
                  )}
                </motion.button>
              </form>

              {/* Divider */}
              <motion.div
                className="divider-wrapper my-4"
                variants={itemVariants}
              >
                <div className="divider"></div>
                <span className="divider-text">OR</span>
                <div className="divider"></div>
              </motion.div>

              {/* Login Link */}
              <motion.div className="text-center" variants={itemVariants}>
                <p className="login-prompt">
                  Already have an account?{" "}
                  <Link to="/login" className="login-link">
                    Sign in here
                  </Link>
                </p>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Signup;

