import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import Navbar from "../layouts/Navbar";
import Footer from "../layouts/Footer";

const ProtectedRoute = ({ children, noLayout = false }) => {
  const { user, loading } = useAuth();

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  // If dashboard or full-page layout, don’t include Navbar/Footer
  if (noLayout) {
    return <>{children}</>;
  }

  return (
    <>
      <Navbar />
      {children}
      <Footer />
    </>
  );
};

export default ProtectedRoute;
