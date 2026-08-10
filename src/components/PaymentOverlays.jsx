import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { EASE } from '../animations';

const PRIMARY = '#9b4500';
const PRIMARY_LIGHT = '#ff914d';
const BG = '#FAF3E8';
const BADGE = '#B5541C';
const MUTED = '#6b5b45';
const TRUCK_BROWN = '#9b4500';
const TRUCK_ORANGE = '#e07a3f';

function prefersReducedMotion() {
  return (
    typeof window !== 'undefined' &&
    window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
}

const formatAmount = (val) => {
  const n = Number(val);
  if (Number.isNaN(n)) return '₹0.00';
  return `₹${n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};
const formatOrderId = (id) => (id == null ? '' : `#${String(id)}`);

// ─── Static checkmark badge used during drawing step ───────────────────────
function CheckmarkBadge({ draw }) {
  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.4, ease: [0.34, 1.56, 0.64, 1] }}
      style={{
        width: 100, height: 100, borderRadius: '50%',
        background: `linear-gradient(135deg, ${BADGE}, ${PRIMARY_LIGHT})`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: '0 8px 24px rgba(181,84,28,0.35)',
      }}
    >
      <svg viewBox="0 0 60 60" width="44" height="44">
        <motion.path
          d="M 15 31 L 27 42 L 46 20"
          fill="none"
          stroke="#fff"
          strokeWidth="7"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray="60"
          initial={{ strokeDashoffset: 60 }}
          animate={{ strokeDashoffset: draw ? 0 : 60 }}
          transition={{ duration: 0.4, ease: EASE }}
        />
      </svg>
    </motion.div>
  );
}

// ─── Delivery truck (inline SVG) + landing boxes ───────────────────────────
function Truck({ phase }) {
  // phase: 'enter' | 'load' | 'exit'
  return (
    <motion.div
      style={{ width: 200, height: 130, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
    >
      <motion.div
        style={{ position: 'relative', width: 200 }}
        initial={{ x: -250 }}
        animate={{
          x: phase === 'exit' ? [0, 250] : 0,
          transition: phase === 'exit'
            ? { duration: 0.4, ease: 'easeIn' }
            : { duration: 0.5, ease: 'easeOut' },
        }}
      >
        {phase === 'exit' && (
          <motion.div
            style={{
              position: 'absolute', left: 195, top: 55, display: 'flex', flexDirection: 'column', gap: 5,
            }}
            initial={{ opacity: 1 }}
            animate={{ opacity: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            {[0, 1, 2].map((s) => (
              <div key={s} style={{ width: 14 + s * 5, height: 3, background: '#d9c7b2', borderRadius: 2 }} />
            ))}
          </motion.div>
        )}

        <svg viewBox="0 0 200 100" width="200" height="100">
          {/* cargo bed */}
          <rect x="6" y="34" width="120" height="44" rx="8" fill={TRUCK_ORANGE} />
          <rect x="6" y="34" width="120" height="44" rx="8" fill="#fff" opacity="0.06" />
          {/* cab */}
          <rect x="126" y="38" width="52" height="40" rx="8" fill={TRUCK_BROWN} />
          <rect x="132" y="46" width="16" height="14" rx="3" fill={BG} opacity="0.9" />
          {/* wheels */}
          <circle cx="40" cy="82" r="12" fill="#4a2f1e" />
          <circle cx="40" cy="82" r="5" fill="#8a5c38" />
          <circle cx="128" cy="82" r="12" fill="#4a2f1e" />
          <circle cx="128" cy="82" r="5" fill="#8a5c38" />

          {/* boxes landing into the bed */}
          {[{ x: 40, color: PRIMARY }, { x: 74, color: TRUCK_ORANGE }].map((b, i) => (
            <motion.g
              key={i}
              initial={{ y: -34, opacity: 0 }}
              animate={phase === 'load' || phase === 'exit' ? { y: 0, opacity: 1 } : { y: -34, opacity: 0 }}
              transition={{ delay: i * 0.15, type: 'spring', stiffness: 320, damping: 16 }}
            >
              <rect x={b.x} y={46} width="26" height="22" rx={3} fill={b.color} />
              {/* tape line */}
              <rect x={b.x + 6} y={48} width="2" height="22" fill={BG} opacity="0.85" />
              <rect x={b.x + 11} y={48} width="2" height="22" fill={BG} opacity="0.85" />
            </motion.g>
          ))}
        </svg>
      </motion.div>
    </motion.div>
  );
}

// ─── CTA buttons ───────────────────────────────────────────────────────────
function ActionButtons({ onOrders, onProducts }) {
  return (
    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
      <button
        onClick={onOrders}
        style={{
          padding: '13px 26px', border: 'none', borderRadius: 26, cursor: 'pointer',
          background: `linear-gradient(135deg, ${PRIMARY}, ${PRIMARY_LIGHT})`, color: '#fff',
          fontSize: 14, fontWeight: 700, fontFamily: "'Plus Jakarta Sans', sans-serif",
          boxShadow: '0 6px 16px rgba(155,69,0,0.35)',
        }}
      >
        View Order Details
      </button>
      <button
        onClick={onProducts}
        style={{
          padding: '13px 26px', border: `1.5px solid ${PRIMARY}`, background: 'transparent',
          color: PRIMARY, borderRadius: 26, cursor: 'pointer',
          fontSize: 14, fontWeight: 600, fontFamily: "'Plus Jakarta Sans', sans-serif",
        }}
      >
        Continue Shopping
      </button>
    </div>
  );
}

// ─── Success overlay ───────────────────────────────────────────────────────
function SuccessOverlay({ data }) {
  const navigate = useNavigate();
  const reducedMotion = useRef(prefersReducedMotion()).current;
  const [stage, setStage] = useState(reducedMotion ? 'cta' : 'idle');
  const goRef = useRef(false);

  const orderId = data?.orderId;
  const total = data?.totalAmount;
  const itemCount = data?.itemCount;
  const estimatedDeliveryDate = data?.estimatedDeliveryDate;

  const goOrders = () => { if (!goRef.current) { goRef.current = true; navigate('/orders'); } };
  const goProducts = () => { if (!goRef.current) { goRef.current = true; navigate('/products'); } };

  useEffect(() => {
    if (reducedMotion) return;
    const timers = [
      setTimeout(() => setStage('check'), 500),
      setTimeout(() => setStage('text'), 900),
      setTimeout(() => setStage('enter'), 1400),
      setTimeout(() => setStage('load'), 1900),
      setTimeout(() => setStage('exit'), 2800),
      setTimeout(() => setStage('cta'), 3200),
    ];
    return () => timers.forEach(clearTimeout);
  }, [reducedMotion]);

  const showText = stage === 'text' || stage === 'enter' || stage === 'load' || stage === 'exit' || stage === 'cta';
  const truckPhase =
    stage === 'enter' ? 'enter' :
    stage === 'load' ? 'load' :
    stage === 'exit' ? 'exit' : null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      style={{
        position: 'fixed', inset: 0, zIndex: 500, overflow: 'hidden',
        background: BG, fontFamily: "'Plus Jakarta Sans', sans-serif",
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        padding: 24,
      }}
    >
      {reducedMotion ? (
        <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 22, alignItems: 'center' }}>
          <svg viewBox="0 0 60 60" width="52" height="52">
            <circle cx="30" cy="30" r="28" fill={BADGE} />
            <path d="M 15 31 L 26 42 L 45 20" fill="none" stroke="#fff" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <OrderText orderId={orderId} total={total} itemCount={itemCount} />
          <ActionButtons onOrders={goOrders} onProducts={goProducts} />
        </div>
      ) : (
        <>
          {stage !== 'idle' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}
            >
              <CheckmarkBadge draw={stage !== 'idle'} />
            </motion.div>
          )}

          <div style={{ minHeight: 78, marginTop: 22, textAlign: 'center' }}>
            {truckPhase ? (
              <Truck phase={truckPhase} />
            ) : (
              showText && (
                <OrderText orderId={orderId} total={total} itemCount={itemCount} />
              )
            )}
          </div>

          <AnimatePresence>
            {stage === 'cta' && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, ease: EASE }}
                style={{ marginTop: 18, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}
              >
                <p style={{ margin: 0, fontSize: 13, color: '#2e7d32', fontWeight: 700 }}>
                  📦 Estimated delivery: {estimatedDeliveryDate}
                </p>
                <ActionButtons onOrders={goOrders} onProducts={goProducts} />
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}
    </motion.div>
  );
}

function OrderText({ orderId, total, itemCount }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
      <h2 style={{
        fontFamily: "'Quicksand', sans-serif", fontSize: 28, fontWeight: 700, color: PRIMARY, margin: 0,
        letterSpacing: '-0.01em',
      }}>
        Order Placed Successfully! 🐾
      </h2>
      <div style={{ marginTop: 10, color: MUTED, fontSize: 13, lineHeight: 1.7, minWidth: 220 }}>
        {[
          orderId != null && `Order ID: ${formatOrderId(orderId)}`,
          itemCount != null && `${itemCount} ${itemCount === 1 ? 'item' : 'items'}`,
          total != null && formatAmount(total),
        ].filter(Boolean).map((line, i) => (
          <motion.p
            key={i}
            style={{ margin: 0 }}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1, duration: 0.35, ease: EASE }}
          >
            {line}
          </motion.p>
        ))}
      </div>
    </motion.div>
  );
}

// ─── Failure overlay ───────────────────────────────────────────────────────
function FailureOverlay({ onRetry, onBack }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: 'fixed', inset: 0, zIndex: 500, background: BG, fontFamily: "'Plus Jakarta Sans', sans-serif",
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        padding: 24, textAlign: 'center',
      }}
    >
      <div style={{ width: 100, height: 100, borderRadius: '50%', background: '#f2c14e22', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <svg viewBox="0 0 60 60" width="48" height="48">
          <circle cx="30" cy="30" r="28" fill="#c97b57" />
          <path d="M 20 20 L 40 40 M 40 20 L 20 40" stroke="#fff" strokeWidth="6" strokeLinecap="round" />
        </svg>
      </div>
      <h2 style={{ fontFamily: "'Quicksand', sans-serif", fontSize: 24, fontWeight: 700, color: PRIMARY, margin: '18px 0 8px' }}>
        Payment Failed — Let's try that again
      </h2>
      <p style={{ fontSize: 13.5, color: '#7a5a3f', maxWidth: 400, margin: '0 0 26px', lineHeight: 1.6 }}>
        We couldn't complete your payment. Your cart is still safe and no charge was made.
      </p>
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
        <button onClick={onRetry} style={{
          padding: '13px 26px', border: 'none', borderRadius: 26, cursor: 'pointer',
          background: `linear-gradient(135deg, #9b4500, #ff914d)`, color: '#fff', fontSize: 14, fontWeight: 700,
          fontFamily: "'Plus Jakarta Sans', sans-serif", boxShadow: '0 6px 16px rgba(155,69,0,0.3)',
        }}>
          🔄 Retry Payment
        </button>
        <button onClick={onBack} style={{
          padding: '13px 26px', border: '1.5px solid #9b4500', background: 'transparent', color: PRIMARY,
          borderRadius: 26, fontSize: 14, fontWeight: 600, fontFamily: "'Plus Jakarta Sans', sans-serif",
        }}>
          Back to Cart
        </button>
      </div>
    </motion.div>
  );
}

export { SuccessOverlay, FailureOverlay };