// Shared animation presets using GPU-accelerated properties (transform/opacity only).
// All variants respect prefers-reduced-motion at the component level via MotionConfig.

export const EASE = [0.25, 0.1, 0.25, 1];

// Duration in seconds for page enter/exit (snappy 250-350ms).
export const PAGE_DURATION = 0.3;

// Page container: fades in and slides in from below on enter, fades out and
// slides up slightly on exit.
export const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: PAGE_DURATION, ease: EASE } },
  exit: { opacity: 0, y: -14, transition: { duration: PAGE_DURATION - 0.05, ease: EASE } },
};

// Staggered children entrance (e.g., product cards / cart items).
// Each item fades in and rises, delayed by `delayFactor * i` (customize via custom prop).
export const staggerContainer = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.06, delayChildren: 0.05 },
  },
};

export const staggerItem = {
  hidden: { opacity: 0, y: 16 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.28, ease: EASE },
  },
};

// Micro-interaction scale presets (hover / tap) for GPU-friendly feedback.
export const cardWhileHover = { scale: 1.02 };
export const cardWhileTap = { scale: 0.98 };
export const buttonWhileTap = { scale: 0.96 };

// Cart icon bounce used when an item is added.
export const cartBounceKeyframes = [0, 1, 0.6, 1];

// ─── Auth pages ────────────────────────────────────────────────────────────

// Left hero image: subtle zoom-out + fade-in on load (scale 1.05 -> 1.0).
export const authHeroVariants = {
  initial: { opacity: 0, scale: 1.05 },
  animate: { opacity: 1, scale: 1, transition: { duration: 0.6, ease: EASE } },
};

// Testimonial card: delayed fade-in + slide-up (secondary detail).
export const authQuoteVariants = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.5, delay: 0.5, ease: EASE } },
};

// Form container: staggered entrance for each field/element.
export const authFormContainer = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07, delayChildren: 0.15 } },
};

export const authFieldItem = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3, ease: EASE } },
};

// Error shake keyframes for failed submit.
export const shakeKeyframes = {
  x: [0, -10, 10, -8, 8, -4, 4, 0],
  transition: { duration: 0.3, ease: 'easeInOut' },
};