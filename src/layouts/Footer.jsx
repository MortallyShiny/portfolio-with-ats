import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import "./Footer.css"; // Don't forget to create/update this file!

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <motion.footer
      className="footer-section py-5 custom-footer-border"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.8 }}
    >
      <div className="container">
        {/* Adjusted columns for better visual spacing, pushing the navigation 
                    links slightly right using offset-lg-1 on the Portfolio column.
                */}
        <div className="row">
          {/* Column 1: Brand and Social (Col size adjusted for better flow) */}
          <div className="col-lg-3 col-md-4 mb-4 mb-md-0">
            <h5 className="fw-bold mb-3">PortfolioPro</h5>
            <p>Build your professional future.</p>

            {/* Social Links Placeholder */}
            <div className="d-flex mt-3">
              <a
                href="#"
                className="me-3 footer-icon-link"
                aria-label="LinkedIn"
              >
                <i className="bi bi-linkedin"></i>
              </a>
              <a
                href="#"
                className="me-3 footer-icon-link"
                aria-label="Twitter"
              >
                <i className="bi bi-twitter"></i>
              </a>
              <a href="#" className="footer-icon-link" aria-label="GitHub">
                <i className="bi bi-github"></i>
              </a>
            </div>
          </div>

          {/* Column 2: Portfolio Links (Added offset for centering effect) */}
          <div className="col-lg-2 col-md-2 mb-4 mb-md-0 offset-lg-1">
            <h6 className="fw-bold mb-3">Portfolio</h6>
            <ul className="list-unstyled">
              <li>
                <Link
                  to="/templates"
                  className="text-decoration-none mb-2 d-block"
                >
                  Templates
                </Link>
              </li>
              <li>
                <Link
                  to="/features"
                  className="text-decoration-none mb-2 d-block"
                >
                  Features
                </Link>
              </li>
              <li>
                <Link
                  to="/pricing"
                  className="text-decoration-none mb-2 d-block"
                >
                  Pricing (Premium)
                </Link>
              </li>
              <li>
                <Link
                  to="/examples"
                  className="text-decoration-none mb-2 d-block"
                >
                  User Examples
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Help & Support */}
          <div className="col-lg-2 col-md-3 mb-4 mb-md-0">
            <h6 className="fw-bold mb-3">Help</h6>
            <ul className="list-unstyled">
              <li>
                <Link
                  to="/contact"
                  className="text-decoration-none mb-2 d-block"
                >
                  Contact Us
                </Link>
              </li>
              <li>
                <Link to="/faq" className="text-decoration-none mb-2 d-block">
                  FAQs
                </Link>
              </li>
              <li>
                <Link
                  to="/tutorials"
                  className="text-decoration-none mb-2 d-block"
                >
                  Tutorials
                </Link>
              </li>
              <li>
                <Link
                  to="/support"
                  className="text-decoration-none mb-2 d-block"
                >
                  Live Support
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Legal & Company */}
          <div className="col-lg-2 col-md-3">
            <h6 className="fw-bold mb-3">Legal & Company</h6>
            <ul className="list-unstyled">
              <li>
                <Link to="/about" className="text-decoration-none mb-2 d-block">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-decoration-none mb-2 d-block">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link
                  to="/privacy"
                  className="text-decoration-none mb-2 d-block"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  to="/careers"
                  className="text-decoration-none mb-2 d-block"
                >
                  Careers
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar: Copyright */}
        <div className="border-top pt-4 mt-4 text-center">
          <p className="mb-0">
            &copy; {currentYear} PortfolioPro. All rights reserved.
          </p>
        </div>
      </div>
    </motion.footer>
  );
};

export default Footer;
