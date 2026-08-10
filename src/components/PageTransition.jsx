import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation, useOutlet } from 'react-router-dom';
import { pageVariants } from '../animations';

// Wraps the active route outlet in an AnimatePresence so each route change
// triggers a fade + slide enter/exit. Respects prefers-reduced-motion via
// MotionConfig in App.jsx.
export default function PageTransition() {
  const location = useLocation();
  const outlet = useOutlet();

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={location.pathname}
        variants={pageVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        style={{ minHeight: '100vh' }}
      >
        {outlet}
      </motion.div>
    </AnimatePresence>
  );
}