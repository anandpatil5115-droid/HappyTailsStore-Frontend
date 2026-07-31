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

export default function RegisterPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', email: '', password: '', confirmPassword: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [focusedField, setFocusedField] = useState(null);
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
    if (passed <= 2) return { label: 'Weak', percent: 25, color: '#b91c1c' };
    if (passed === 3) return { label: 'Fair', percent: 50, color: '#b45309' };
    if (passed === 4) return { label: 'Strong', percent: 75, color: '#047857' };
    return { label: 'Very Strong', percent: 100, color: '#047857' };
  };

  const strength = getPasswordStrength(form.password);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setErrors((prev) => ({ ...prev, [e.target.name]: '' }));
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
        const msg = data.message || (data.messages ? Object.values(data.messages).join(' ') : 'Registration failed');
        showToast(msg, 'error');
        return;
      }
      showToast('Registration successful! Welcome to HappyTailsStore.', 'success');
      setForm({ username: '', email: '', password: '', confirmPassword: '' });
      setTimeout(() => navigate('/login'), 1500);
    } catch (error) {
      showToast('Registration failed. Please try again.', 'error');
    }
    } catch (error) {
      showToast('Registration failed. Please try again.', 'error');
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

      <h2 style={headingStyle}>Join the Pack</h2>
      <p style={subtextStyle}>Create an account for exclusive pet-care collections and member perks.</p>

      <form onSubmit={handleSubmit} noValidate style={{ marginTop: 24 }}>
        <FormField
          name="username" type="text" label="Username" placeholder="johndoe"
          icon={<PersonIcon />}
          value={form.username} error={errors.username} focused={focusedField === 'username'}
          onChange={handleChange}
          onFocus={() => setFocusedField('username')}
          onBlur={() => setFocusedField(null)}
        />
        <FormField
          name="email" type="email" label="Email Address" placeholder="john@example.com"
          icon={<EnvelopeIcon />}
          value={form.email} error={errors.email} focused={focusedField === 'email'}
          onChange={handleChange}
          onFocus={() => setFocusedField('email')}
          onBlur={() => setFocusedField(null)}
        />
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

        {form.password && (
          <div style={{ marginBottom: 12, paddingLeft: 2 }}>
            {passwordRequirements.map((req, i) => {
              const met = req.test(form.password);
              return (
                <div key={i} style={{ fontSize: 10, color: met ? '#065f46' : '#dcc1b4', marginBottom: 2, display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span style={{ color: met ? '#065f46' : '#dcc1b4' }}>
                    {met ? '✓' : '○'}
                  </span>
                  {req.label}
                </div>
              );
            })}
            {strength.label && (
              <div style={{ fontSize: 10, color: '#564339', marginTop: 4, fontWeight: 500 }}>
                Strength: <span style={{ color: strength.color }}>{strength.label}</span>
              </div>
            )}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="auth-submit-btn"
          style={submitButtonStyle(loading)}
        >
          {loading ? (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}>
              <span style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.6s linear infinite', display: 'inline-block' }} />
              Creating Account...
            </span>
          ) : 'Create Account'}
        </button>
      </form>

      <div style={{ textAlign: 'right', marginTop: 12 }}>
        <span style={{ fontSize: 10, color: '#dcc1b4', letterSpacing: '0.05em', fontWeight: 500 }}>ALREADY A MEMBER?</span>{' '}
        <Link
          to="/login"
          style={{ fontSize: 11, color: '#1c1c19', fontWeight: 700, textDecoration: 'none', letterSpacing: '0.02em' }}
        >
          Sign In to Account →
        </Link>
      </div>

      <style>{sharedKeyframes}</style>
    </AuthLayout>
  );
}
