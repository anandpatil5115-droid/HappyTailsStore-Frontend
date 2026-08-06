import React from 'react';
import { useAuth } from '../context/AuthContext';
import './AuthLayout.css';

export default function AuthLayout({ children }) {
  return (
    <div className="auth-layout">
      <img className="auth-bg-img" src="/images/pet-spa.jpg" alt="" />
      <div className="auth-quote-card animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
        <div className="auth-quote-icon">"</div>
        <p>Providing your pets with the quality they deserve.</p>
        <div className="auth-stars">
          <span>★</span><span>★</span><span>★</span><span>★</span><span>★</span>
        </div>
      </div>
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
          <div 
            className="animate-fade-in-up"
            style={{ animationDelay: '0.3s' }}
          >
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}