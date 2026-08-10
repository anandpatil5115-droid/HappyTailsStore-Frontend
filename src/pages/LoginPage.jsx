import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import AuthLayout from '../components/AuthLayout';
import FormField from '../components/FormField';
import { SuccessCheckmark, PawBurst } from '../components/SuccessCelebration';
import { EnvelopeIcon, LockIcon } from '../styles/AuthIcons';
import {
  headingStyle, subtextStyle,
  toastStyle, toastCloseStyle,
  sharedKeyframes
} from '../styles/authStyles';
import { validateLogin } from '../utils/validators';
import { useAuth } from '../context/AuthContext';
import {
  authFormContainer, authFieldItem, EASE,
} from '../animations';
import { API_BASE } from '../utils/api';

export default function LoginPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '', rememberMe: false });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [focusedField, setFocusedField] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState(null);
  const [shake, setShake] = useState(0);
  const [success, setSuccess] = useState(false);
  const { login: authLogin } = useAuth();
  const formRef = useRef(null);

  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setForm((prev) => ({ ...prev, [e.target.name]: value }));
    setErrors((prev) => ({ ...prev, [e.target.name]: '' }));
    if (e.target.name === 'email' || e.target.name === 'password') setServerError(null);
  };

  const showToast = (message, type) => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const handleSuccess = (data) => {
    setSuccess(true);
    authLogin(data.token, form.rememberMe);
    setForm({ email: '', password: '', rememberMe: false });
    setTimeout(() => navigate('/products'), 1000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validateLogin(form);
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: form.email, password: form.password }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Invalid email or password');
      }
      if (data.role === 'ADMIN') {
        throw new Error('Please use the Admin Portal to log in');
      }
      handleSuccess(data);
    } catch (error) {
      setServerError(error.message || 'Login failed. Please try again.');
      setShake((s) => s + 1);
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

      <motion.form
        ref={formRef}
        onSubmit={handleSubmit}
        noValidate
        style={{ marginTop: 24 }}
        variants={authFormContainer}
        initial="hidden"
        animate="show"
      >
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: serverError ? 1 : 0, height: serverError ? 'auto' : 0 }}
          transition={{ duration: 0.25 }}
          style={{ overflow: 'hidden', marginBottom: serverError ? 14 : 0 }}
        >
          <motion.div
            key={serverError}
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, ease: EASE }}
            style={{
              background: 'rgba(194, 88, 26, 0.1)',
              border: '1px solid rgba(194, 88, 26, 0.3)',
              color: '#c2561a',
              borderRadius: 10,
              padding: '10px 14px',
              fontSize: 12,
              fontWeight: 500,
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              textAlign: 'left',
            }}
          >
            {serverError}
          </motion.div>
        </motion.div>

        <motion.div variants={authFieldItem}>
          <FormField
            name="email" type="email" label="Email Address" placeholder="john@example.com"
            icon={<EnvelopeIcon />}
            value={form.email} error={errors.email} focused={focusedField === 'email'}
            onChange={handleChange}
            onFocus={() => setFocusedField('email')}
            onBlur={() => setFocusedField(null)}
          />
        </motion.div>

        <motion.div variants={authFieldItem}>
          <FormField
            name="password" type="password" label="Password" placeholder="Enter your password"
            icon={<LockIcon />}
            value={form.password} error={errors.password} focused={focusedField === 'password'}
            onChange={handleChange}
            onFocus={() => setFocusedField('password')}
            onBlur={() => setFocusedField(null)}
            isPassword showPassword={showPassword}
            onTogglePassword={() => setShowPassword((p) => !p)}
          />
        </motion.div>

        <motion.div
          variants={authFieldItem}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', margin: '4px 2px 22px' }}
        >
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 12, color: '#564339', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            <input
              type="checkbox"
              name="rememberMe"
              checked={form.rememberMe}
              onChange={handleChange}
              style={{ accentColor: '#9b4500', width: 16, height: 16, margin: 0 }}
            />
            Remember Me
          </label>
          <Link to="/forgot-password" style={{ fontSize: 11, color: '#9b4500', textDecoration: 'none', fontWeight: 600, fontFamily: "'Plus Jakarta Sans', sans-serif", paddingRight: 2 }}>
            Lost key?
          </Link>
        </motion.div>

        <motion.div
          variants={authFieldItem}
          style={{ position: 'relative' }}
          animate={shake > 0 ? { x: [0, -10, 10, -8, 8, -4, 4, 0] } : { x: 0 }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
          key={`shake-${shake}`}
        >
          <motion.button
            type="submit"
            disabled={loading || success}
            whileTap={success ? undefined : { scale: 0.97 }}
            whileHover={success ? undefined : { scale: 1.01 }}
            className="auth-submit-btn"
            style={submitButtonContentStyle(loading, success)}
          >
            <AnimatePresence mode="wait" initial={false}>
              {success ? (
                <motion.span
                  key="success"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, ease: EASE }}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 12, justifyContent: 'center', width: '100%' }}
                >
                  <SuccessCheckmark size={34} />
                  <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, fontSize: 13, letterSpacing: '0.02em' }}>
                    Welcome back!
                  </span>
                </motion.span>
              ) : loading ? (
                <motion.span
                  key="loading"
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 10, justifyContent: 'center', width: '100%' }}
                >
                  <span style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.6s linear infinite', display: 'inline-block' }} />
                  Signing In...
                </motion.span>
              ) : (
                <motion.span
                  key="idle"
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  style={{ display: 'inline-block', width: '100%', fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                >
                  Sign In
                </motion.span>
              )}
            </AnimatePresence>
            {success && <PawBurst />}
          </motion.button>
        </motion.div>
      </motion.form>

      <div style={{ textAlign: 'right', marginTop: 16, paddingTop: 12, borderTop: '1px solid rgba(220,193,180,0.4)' }}>
        <span style={{ fontSize: 10, color: '#b9a292', letterSpacing: '0.05em', fontWeight: 500, marginRight: 6 }}>NOT A MEMBER?</span>{' '}
        <Link
          to="/register"
          style={{ fontSize: 11, color: '#9b4500', fontWeight: 700, textDecoration: 'none', letterSpacing: '0.02em', fontFamily: "'Plus Jakarta Sans', sans-serif" }}
        >
          Create an Account →
        </Link>
      </div>

      <div style={{ textAlign: 'right', marginTop: 8 }}>
        <Link
          to="/admin/login"
          style={{ fontSize: 11, color: '#564339', textDecoration: 'none', fontWeight: 500, fontFamily: "'Plus Jakarta Sans', sans-serif" }}
        >
          Are you an admin? Login here
        </Link>
      </div>

      <style>{sharedKeyframes}</style>
    </AuthLayout>
  );
}

function submitButtonContentStyle(loading, success) {
  return {
    width: '100%',
    padding: '14px 0',
    background: success
      ? 'linear-gradient(135deg, #047857, #065f46)'
      : loading
        ? '#564339'
        : 'linear-gradient(135deg, #9b4500, #c05e1a)',
    color: '#fff',
    border: 'none',
    borderRadius: 24,
    fontSize: 13,
    fontWeight: 600,
    letterSpacing: '0.03em',
    cursor: loading || success ? 'default' : 'pointer',
    opacity: 1,
    position: 'relative',
    overflow: 'visible',
    boxShadow: success
      ? '0 6px 20px rgba(4, 120, 87, 0.4)'
      : '0 4px 14px rgba(155, 69, 0, 0.3)',
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    transition: 'background 0.3s ease, box-shadow 0.3s ease',
  };
}