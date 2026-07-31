import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthLayout from '../components/AuthLayout';
import FormField from '../components/FormField';
import { EnvelopeIcon, LockIcon, PersonIcon, KeyIcon } from '../styles/AuthIcons';
import { 
  headingStyle, subtextStyle,
  submitButtonStyle,
  toastStyle, toastCloseStyle,
  sharedKeyframes
} from '../styles/authStyles';
import { validateLogin, validateRegister, validateForgotPassword } from '../utils/validators';

export default function LoginPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '', rememberMe: false });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [focusedField, setFocusedField] = useState(null);

  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setForm((prev) => ({ ...prev, [e.target.name]: value }));
    setErrors((prev) => ({ ...prev, [e.target.name]: '' }));
  };

  const showToast = (message, type) => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validateLogin(form);
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;
    
    setLoading(true);
    try {
      const response = await fetch('http://localhost:8080/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: form.email, password: form.password }),
      });
      const data = await response.json();
      if (!response.ok) {
        showToast(data.message || 'Invalid email or password', 'error');
        return;
      }
      localStorage.setItem('token', data.token);
      localStorage.setItem('userId', String(data.userId));
      localStorage.setItem('username', data.username);
      showToast('Welcome back, Pet Parent!', 'success');
       setForm({ email: '', password: '', rememberMe: false });
       navigate('/products');
     } catch (error) {
       showToast('Login failed. Please try again.', 'error');
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

      <h2 style={headingStyle}>Welcome Back, Pet Parent</h2>
      <p style={subtextStyle}>Sign in to keep spoiling your furry friend.</p>

      <form onSubmit={handleSubmit} noValidate style={{ marginTop: 24 }}>
        <FormField
          name="email" type="email" label="Email Address" placeholder="john@example.com"
          icon={<EnvelopeIcon />}
          value={form.email} error={errors.email} focused={focusedField === 'email'}
          onChange={handleChange}
          onFocus={() => setFocusedField('email')}
          onBlur={() => setFocusedField(null)}
        />
        <FormField
          name="password" type="password" label="Password" placeholder="Enter your password"
          icon={<LockIcon />}
          value={form.password} error={errors.password} focused={focusedField === 'password'}
          onChange={handleChange}
          onFocus={() => setFocusedField('password')}
          onBlur={() => setFocusedField(null)}
        />

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontSize: 12 }}>
            <input
              type="checkbox"
              name="rememberMe"
              checked={form.rememberMe}
              onChange={handleChange}
              style={{ accentColor: '#9b4500', width: 16, height: 16 }}
            />
            Stay Authenticated
          </label>
          <Link to="/forgot-password" style={{ fontSize: 11, color: '#564339', textDecoration: 'none', fontWeight: 500 }}>
            Lost key?
          </Link>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="auth-submit-btn"
          style={submitButtonStyle(loading)}
        >
          {loading ? (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}>
              <span style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.6s linear infinite', display: 'inline-block' }} />
              Signing In...
            </span>
          ) : 'Sign In'}
        </button>
      </form>

      <div style={{ textAlign: 'right', marginTop: 12 }}>
        <span style={{ fontSize: 10, color: '#dcc1b4', letterSpacing: '0.05em', fontWeight: 500 }}>NOT A MEMBER?</span>{' '}
        <Link
          to="/register"
          style={{ fontSize: 11, color: '#1c1c19', fontWeight: 700, textDecoration: 'none', letterSpacing: '0.02em' }}
        >
          Create an Account →
        </Link>
      </div>

      <style>{sharedKeyframes}</style>
    </AuthLayout>
  );
}
