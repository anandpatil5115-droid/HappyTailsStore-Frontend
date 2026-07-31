import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import AuthLayout from '../components/AuthLayout';
import FormField from '../components/FormField';
import { EnvelopeIcon } from '../styles/AuthIcons';
import { 
  headingStyle, subtextStyle,
  submitButtonStyle,
  toastStyle, toastCloseStyle,
  sharedKeyframes
} from '../styles/authStyles';
import { validateLogin, validateRegister, validateForgotPassword } from '../utils/validators';

export default function ForgotPasswordPage() {
  const [form, setForm] = useState({ email: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [focusedField, setFocusedField] = useState(null);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setErrors((prev) => ({ ...prev, [e.target.name]: '' }));
    if (showSuccessMessage) setShowSuccessMessage(false);
  };

  const showToast = (message, type) => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validateForgotPassword(form);
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;
    
    setLoading(true);
    try {
      // TODO: connect to backend - temporarily use console.log
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log('Forgot password submitted:', form);
      setShowSuccessMessage(true);
    } catch (error) {
      showToast('Request failed. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      {toast && (
        <div style={toastStyle(toast.type)}>
          <span>{toast.message}</span>
          <button onClick={() => setToast(null)} style={toastCloseStyle}>✕</button>
        </div>
      )}

      <h2 style={headingStyle}>Reset Your Password</h2>
      <p style={subtextStyle}>Enter your email address and we'll send you an OTP to reset your password.</p>

      <form onSubmit={handleSubmit} noValidate style={{ marginTop: 24 }}>
        {showSuccessMessage ? (
          <div style={{ textAlign: 'center', padding: '24px 16px', borderRadius: '12px' }}>
            <div style={{ fontSize: '36px', marginBottom: 12 }}>✅</div>
            <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 8, color: '#1c1c19' }}>OTP Sent Successfully</h3>
            <p style={{ fontSize: 12, color: '#564339', lineHeight: 1.5, marginBottom: 16 }}>
              Please check your email inbox for the OTP code. You have 10 minutes to reset your password.
            </p>
            <Link
              to="/login"
              className="auth-submit-btn"
              style={{ 
                display: 'inline-block',
                width: 'auto',
                padding: '10px 28px',
                textDecoration: 'none',
              }}
            >
              Back to Sign In →
            </Link>
          </div>
        ) : (
          <>
            <FormField
              name="email" type="email" label="Email Address" placeholder="john@example.com"
              icon={<EnvelopeIcon />}
              value={form.email} error={errors.email} focused={focusedField === 'email'}
              onChange={handleChange}
              onFocus={() => setFocusedField('email')}
              onBlur={() => setFocusedField(null)}
            />

            <button
              type="submit"
              disabled={loading}
              className="auth-submit-btn"
              style={submitButtonStyle(loading)}
            >
              {loading ? (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.6s linear infinite', display: 'inline-block' }} />
                  Sending OTP...
                </span>
              ) : 'Send OTP'}
            </button>
          </>
        )}
      </form>

      <style>{sharedKeyframes}</style>
    </AuthLayout>
  );
}
