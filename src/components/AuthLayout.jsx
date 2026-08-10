import React from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { authHeroVariants, authQuoteVariants } from '../animations';
import './AuthLayout.css';

export default function AuthLayout({ children }) {
  return (
    <div className="auth-layout">
      <motion.img
        className="auth-bg-img"
        src="/images/pet-spa.jpg"
        alt=""
        variants={authHeroVariants}
        initial="initial"
        animate="animate"
      />
      <motion.div
        className="auth-quote-card"
        variants={authQuoteVariants}
        initial="initial"
        animate="animate"
      >
        <div className="auth-quote-icon">"</div>
        <p>Providing your pets with the quality they deserve.</p>
        <div className="auth-stars">
          <span>★</span><span>★</span><span>★</span><span>★</span><span>★</span>
        </div>
      </motion.div>
      <div className="auth-glass-panel">
        <div className="auth-form-container">
          <div
            className="auth-blob-badge animate-fade-in-up animate-blob"
            style={{ animationDelay: '0.1s' }}
          >
            🐾
          </div>
          <div
            className="auth-wordmark animate-fade-in-up"
            style={{ animationDelay: '0.2s' }}
          >
            HappyTailsStore
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}