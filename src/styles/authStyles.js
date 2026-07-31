// ─── Brand / Text ─────────────────────────────────────
export const headingStyle = {
  fontSize: 20,
  fontWeight: 700,
  color: '#1c1c19',
  letterSpacing: '-0.02em',
  lineHeight: 1.2,
  marginBottom: 4,
};

export const subtextStyle = {
  fontSize: 12,
  color: '#564339',
  lineHeight: 1.5,
};

// ─── Form Fields ──────────────────────────────────────
export const fieldLabelStyle = {
  display: 'block',
  fontSize: 9,
  fontWeight: 600,
  letterSpacing: '0.08em',
  color: '#564339',
  marginBottom: 4,
  textTransform: 'uppercase',
};

export const fieldInputStyle = {
  width: '100%',
  padding: '17px 12px 17px 40px',
  fontSize: 16,
  color: '#564339',
  transition: 'border-color 0.2s ease',
  fontFamily: '"Plus Jakarta Sans", sans-serif',
  WebkitTextFillColor: '#564339',
};

export const iconLeftStyle = {
  position: 'absolute',
  left: 0,
  top: '50%',
  transform: 'translateY(-50%)',
  display: 'flex',
  alignItems: 'center',
  pointerEvents: 'none',
};

export const showToggleStyle = {
  position: 'absolute',
  right: 0,
  top: '50%',
  transform: 'translateY(-50%)',
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  padding: '4px 0',
  color: '#dcc1b4',
  fontSize: 10,
  fontWeight: 600,
  letterSpacing: '0.03em',
};

export const fieldErrorStyle = {
  fontSize: 10,
  color: '#dc2626',
  marginTop: 2,
};

// ─── Button ───────────────────────────────────────────
export const submitButtonStyle = (loading) => ({
  width: '100%',
  padding: '12px 0',
  background: loading ? '#564339' : '#9b4500',
  color: '#fff',
  border: 'none',
  borderRadius: 24,
  fontSize: 12,
  fontWeight: 600,
  letterSpacing: '0.03em',
  cursor: loading ? 'not-allowed' : 'pointer',
  opacity: loading ? 0.6 : 1,
  transition: 'background 0.3s ease, box-shadow 0.3s ease, transform 0.2s ease',
  position: 'relative',
  overflow: 'hidden',
});

// ─── Toast ────────────────────────────────────────────
export const toastStyle = (type) => ({
  position: 'fixed',
  top: 16,
  right: 16,
  zIndex: 1000,
  padding: '12px 18px',
  borderRadius: 8,
  background: type === 'success' ? '#065f46' : '#dc2626',
  color: '#fff',
  fontSize: 12,
  fontWeight: 500,
  boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
  animation: 'toastSlide 0.3s ease',
  maxWidth: 360,
  display: 'flex',
  alignItems: 'center',
  gap: 10,
});

export const toastCloseStyle = {
  background: 'none',
  border: 'none',
  color: 'rgba(255,255,255,0.7)',
  cursor: 'pointer',
  fontSize: 13,
  padding: 0,
  lineHeight: 1,
};

// ─── Shared Animations ────────────────────────────────
export const sharedKeyframes = `
  @media (max-width: 768px) {
    .split-layout { flex-direction: column; }
    .split-right { min-height: 300px; order: -1; }
  }
`;
