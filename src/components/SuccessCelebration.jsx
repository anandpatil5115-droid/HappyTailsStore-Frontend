import React, { useMemo } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { EASE } from '../animations';

// Animated success checkmark: the circle + check path draw themselves in with a
// smooth stroke animation. Always rendered (essential feedback), no particles.
export function SuccessCheckmark({ size = 40 }) {
  return (
    <motion.svg
      width={size}
      height={size}
      viewBox="0 0 52 52"
      initial="hidden"
      animate="visible"
    >
      <motion.circle
        cx="26"
        cy="26"
        r="24"
        fill="none"
        stroke="#fff"
        strokeWidth="3"
        variants={{
          hidden: { pathLength: 0 },
          visible: { pathLength: 1, transition: { duration: 0.35, ease: EASE } },
        }}
      />
      <motion.path
        d="M14 27l8 8 16-16"
        fill="none"
        stroke="#fff"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
        variants={{
          hidden: { pathLength: 0 },
          visible: {
            pathLength: 1,
            transition: { duration: 0.3, delay: 0.35, ease: EASE },
          },
        }}
      />
    </motion.svg>
  );
}

// Decorative paw-print confetti burst around the button. Completely disabled
// for users with prefers-reduced-motion.
export function PawBurst() {
  const reduced = useReducedMotion();

  const particles = useMemo(() => {
    return Array.from({ length: 14 }, (_, i) => {
      const angle = (i / 14) * Math.PI * 2 + Math.random() * 0.5;
      const dist = 60 + Math.random() * 70;
      return {
        id: i,
        x: Math.cos(angle) * dist,
        y: Math.sin(angle) * dist,
        rotate: (Math.random() - 0.5) * 180,
        scale: 0.6 + Math.random() * 0.8,
        delay: Math.random() * 0.15,
      };
    });
  }, []);

  if (reduced) return null;

  return (
    <span
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 5,
      }}
      aria-hidden="true"
    >
      {particles.map((p) => (
        <motion.span
          key={p.id}
          initial={{ opacity: 0, x: 0, y: 0, scale: 0.3, rotate: 0 }}
          animate={{
            opacity: [0, 1, 1, 0],
            x: p.x,
            y: p.y,
            scale: p.scale,
            rotate: p.rotate,
          }}
          transition={{ duration: 0.9, ease: 'easeOut', delay: p.delay }}
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            fontSize: 18,
            transform: 'translate(-50%, -50%)',
          }}
        >
          🐾
        </motion.span>
      ))}
    </span>
  );
}