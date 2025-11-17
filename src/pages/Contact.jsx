import React from "react";
import { motion } from "framer-motion";
import "./Contact.css";

const Contact = () => {
  return (
    <div className="contact-page">
      <div className="container py-5">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="contact-title">Contact Us</h1>
          <p className="contact-subtitle">
            Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Contact;




