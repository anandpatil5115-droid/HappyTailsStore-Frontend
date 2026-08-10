import React from 'react';
import { Link } from 'react-router-dom';
import { getStoredToken } from '../utils/auth';

const PRIMARY = '#9b4500';
const PRIMARY_LIGHT = '#ff914d';
const CREAM = '#fcf9f4';
const BROWN = '#564339';
const MUTED = '#dcc1b4';

export default function NotFoundPage() {
  const token = getStoredToken();

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: CREAM,
      fontFamily: "'Plus Jakarta Sans', sans-serif",
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center',
      padding: '32px',
    }}>
      <div style={{
        fontSize: '72px',
        marginBottom: '16px',
        opacity: 0.3,
        lineHeight: 1,
      }}>🐾</div>

      <h1 style={{
        fontFamily: "'Quicksand', sans-serif",
        fontSize: 56,
        fontWeight: 700,
        color: PRIMARY,
        margin: '0 0 12px',
        lineHeight: 1,
      }}>
        404
      </h1>

      <h2 style={{
        fontSize: 22,
        color: BROWN,
        margin: '0 0 24px',
        fontWeight: 600,
      }}>
        Oops! This page wandered off.
      </h2>

      <p style={{
        fontSize: 15,
        color: MUTED,
        maxWidth: 480,
        margin: '0 0 32px',
        lineHeight: 1.6,
      }}>
        The page you're looking for doesn't exist or may have been removed. 
        Don't worry — your furry friend is still waiting! Head back to explore our pet collection.
      </p>

      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', justifyContent: 'center' }}>
        {token ? (
          <Link to="/products" style={{
            padding: '12px 28px',
            backgroundColor: PRIMARY,
            color: '#fff',
            border: 'none',
            borderRadius: 24,
            fontSize: 14,
            fontWeight: 600,
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            cursor: 'pointer',
            textDecoration: 'none',
            transition: 'all 0.2s ease',
            boxShadow: '0 4px 10px rgba(155,69,0,0.3)',
            display: 'inline-block',
          }}
          onMouseEnter={(e) => {
            e.target.style.transform = 'translateY(-2px)';
            e.target.style.boxShadow = '0 6px 16px rgba(155,69,0,0.4)';
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'translateY(0)';
            e.target.style.boxShadow = '0 4px 10px rgba(155,69,0,0.3)';
          }}
        >
          Browse Products
        </Link>
        ) : (
          <Link to="/login" style={{
            padding: '12px 28px',
            backgroundColor: PRIMARY,
            color: '#fff',
            border: 'none',
            borderRadius: 24,
            fontSize: 14,
            fontWeight: 600,
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            cursor: 'pointer',
            textDecoration: 'none',
            transition: 'all 0.2s ease',
            boxShadow: '0 4px 10px rgba(155,69,0,0.3)',
            display: 'inline-block',
          }}
          onMouseEnter={(e) => {
            e.target.style.transform = 'translateY(-2px)';
            e.target.style.boxShadow = '0 6px 16px rgba(155,69,0,0.4)';
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'translateY(0)';
            e.target.style.boxShadow = '0 4px 10px rgba(155,69,0,0.3)';
          }}
          >
            Sign In
          </Link>
        )}
        <Link to="/" style={{
          padding: '12px 28px',
          backgroundColor: 'transparent',
          color: BROWN,
          border: `2px solid ${PRIMARY_LIGHT}`,
          borderRadius: 24,
          fontSize: 14,
          fontWeight: 600,
          fontFamily: "'Plus Jakarta Sans', sans-serif",
          cursor: 'pointer',
          textDecoration: 'none',
          transition: 'all 0.2s ease',
        }}
        onMouseEnter={(e) => {
          e.target.style.background = `${PRIMARY_LIGHT}10`;
        }}
        onMouseLeave={(e) => {
          e.target.style.background = 'transparent';
        }}
        >
          Back to Home
        </Link>
      </div>
    </div>
  );
}
