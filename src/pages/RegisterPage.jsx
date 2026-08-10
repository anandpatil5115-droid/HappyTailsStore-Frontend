import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import AuthLayout from '../components/AuthLayout';
import FormField from '../components/FormField';
import { SuccessCheckmark, PawBurst } from '../components/SuccessCelebration';
import { EnvelopeIcon, LockIcon, PersonIcon, KeyIcon } from '../styles/AuthIcons';
import {
  headingStyle, subtextStyle,
  toastStyle, toastCloseStyle,
  sharedKeyframes
} from '../styles/authStyles';
import { validateRegister } from '../utils/validators';
import {
  authFormContainer, authFieldItem, EASE,
} from '../animations';

export default function RegisterPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', email: '', password: '', confirmPassword: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [focusedField, setFocusedField] = useState(null);
  const [serverError, setServerError] = useState(null);
  const [shake, setShake] = useState(0);
  const [success, setSuccess] = useState(false);
  const [passwordRequirements, setPasswordRequirements] = useState([
    { label: 'At least 8 characters', test: (p) => p.length >= 8 },
    { label: 'At least 1 uppercase letter (A-Z)', test: (p) => /[A-Z]/.test(p) },
    { label: 'At least 1 lowercase letter (a-z)', test: (p) => /[a-z]/.test(p) },
    { label: 'At least 1 number (0-9)', test: (p) => /\d/.test(p) },
    { label: 'At least 1 special character (!@#$%^&*)', test: (p) => /[!@#$%^&*()_+\-=\[\]{};\':"\\\\|,.<>\/?]/.test(p) },
  ]);

  const getPasswordStrength = (password) => {
    const passed = passwordRequirements.filter((r) => r.test(password)).length;
    if (passed === 0) return { label: '', percent: 0 };
    if (passed <= 2) return { label: 'Weak', percent: 25, color: '#b45309' };
    if (passed === 3) return { label: 'Fair', percent: 50, color: '#b45309' };
    if (passed === 4) return { label: 'Strong', percent: 75, color: '#047857' };
    return { label: 'Very Strong', percent: 100, color: '#047857' };
  };

  const strength = getPasswordStrength(form.password);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setErrors((prev) => ({ ...prev, [e.target.name]: '' }));
    if (e.target.name === 'email' || e.target.name === 'password') setServerError(null);
  };

  const showToast = (message, type) => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validateRegister(form);
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setLoading(true);
    try {
      const response = await fetch('http://localhost:8080/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: form.username,
          email: form.email,
          password: form.password,
          confirmPassword: form.confirmPassword,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || (data.messages ? Object.values(data.messages).join(' ') : 'Registration failed'));
      }
      setSuccess(true);
      setForm({ username: '', email: '', password: '', confirmPassword: '' });
      setTimeout(() => navigate('/login'), 1000);
    } catch (error) {
      setServerError(error.message || 'Registration failed. Please try again.');
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

      <h2 style={headingStyle}>Join the Pack</h2>
      <p style={subtextStyle}>Create an account for exclusive pet-care collections and member perks.</p>

      <motion.form
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
            name="username" type="text" label="Username" placeholder="johndoe"
            icon={<PersonIcon />}
            value={form.username} error={errors.username} focused={focusedField === 'username'}
            onChange={handleChange}
            onFocus={() => setFocusedField('username')}
            onBlur={() => setFocusedField(null)}
          />
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
            name="password" type="password" label="Password" placeholder="Create a password"
            icon={<LockIcon />}
            value={form.password} error={errors.password} focused={focusedField === 'password'}
            onChange={handleChange}
            onFocus={() => setFocusedField('password')}
            onBlur={() => setFocusedField(null)}
            isPassword showPassword={showPassword}
            onTogglePassword={() => setShowPassword((p) => !p)}
          />
        </motion.div>

        <motion.div variants={authFieldItem}>
          <FormField
            name="confirmPassword" type="password" label="Confirm Password" placeholder="Re-enter password"
            icon={<KeyIcon />}
            value={form.confirmPassword} error={errors.confirmPassword} focused={focusedField === 'confirmPassword'}
            onChange={handleChange}
            onFocus={() => setFocusedField('confirmPassword')}
            onBlur={() => setFocusedField(null)}
            isPassword showPassword={showConfirmPassword}
            onTogglePassword={() => setShowConfirmPassword((p) => !p)}
          />
        </motion.div>

        {form.password && (
          <motion.div variants={authFieldItem} style={{ marginBottom: 12, paddingLeft: 2 }}>
            {passwordRequirements.map((req, i) => {
              const met = req.test(form.password);
              return (
                <div key={i} style={{ fontSize: 10, color: met ? '#047857' : '#dcc1b4', marginBottom: 2, display: 'flex', alignItems: 'center', gap: 4, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                  <motion.span
                    initial={false}
                    animate={{ scale: met ? [1, 1.25, 1] : 1, color: met ? '#047857' : '#dcc1b4' }}
                    transition={{ duration: 0.2 }}
                  >
                    {met ? '✓' : '○'}
                  </motion.span>
                  {req.label}
                </div>
              );
            })}
            {strength.label && (
              <div style={{ fontSize: 10, color: '#564339', marginTop: 4, fontWeight: 500, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                Strength: <span style={{ color: strength.color }}>{strength.label}</span>
              </div>
            )}
          </motion.div>
        )}

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
                    Welcome to the pack!
                  </span>
                </motion.span>
              ) : loading ? (
                <motion.span
                  key="loading"
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 10, justifyContent: 'center', width: '100%' }}
                >
                  <span style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.6s linear infinite', display: 'inline-block' }} />
                  Creating Account...
                </motion.span>
              ) : (
                <motion.span
                  key="idle"
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  style={{ display: 'inline-block', width: '100%', fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                >
                  Create Account
                </motion.span>
              )}
            </AnimatePresence>
            {success && <PawBurst />}
          </motion.button>
        </motion.div>
      </motion.form>

      <div style={{ textAlign: 'right', marginTop: 16, paddingTop: 12, borderTop: '1px solid rgba(220,193,180,0.4)' }}>
        <span style={{ fontSize: 10, color: '#b9a292', letterSpacing: '0.05em', fontWeight: 500, marginRight: 6 }}>ALREADY A MEMBER?</span>{' '}
        <Link
          to="/login"
          style={{ fontSize: 11, color: '#9b4500', fontWeight: 700, textDecoration: 'none', letterSpacing: '0.02em', fontFamily: "'Plus Jakarta Sans', sans-serif" }}
        >
          Sign In to Account →
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