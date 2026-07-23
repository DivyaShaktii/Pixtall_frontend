import { useReducedMotion } from "framer-motion";

export const transitions = {
  snappy: { type: "spring", stiffness: 400, damping: 30, mass: 1, duration: 0.2 },
  spring: { type: "spring", stiffness: 300, damping: 25, mass: 1 },
  springLayout: { type: "spring", stiffness: 400, damping: 30, mass: 1 },
  micro: { type: "spring", stiffness: 500, damping: 25, mass: 1 },
  fade: { duration: 0.15, ease: "easeOut" }
};

export const rawVariants = {
  pageEntrance: {
    initial: { opacity: 0, y: 10 },
    animate: { 
      opacity: 1, 
      y: 0, 
      transition: {
        ...transitions.snappy,
        staggerChildren: 0.05
      }
    },
    exit: { opacity: 0, y: -10, transition: transitions.fade }
  },
  childItem: {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0, transition: transitions.snappy },
    exit: { opacity: 0, y: -10, transition: transitions.fade }
  },
  modalOverlay: {
    initial: { opacity: 0 },
    animate: { opacity: 1, transition: transitions.fade },
    exit: { opacity: 0, transition: transitions.fade }
  },
  modalContent: {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1, transition: transitions.snappy },
    exit: { opacity: 0, scale: 0.95, transition: transitions.fade }
  },
  dropdown: {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1, transition: transitions.fade },
    exit: { opacity: 0, scale: 0.95, transition: transitions.fade }
  }
};

/**
 * Strips transforms (y, x, scale) from a variant definition, preserving opacity.
 * This ensures accessible fallback animations for users preferring reduced motion.
 */
function stripTransforms(variantObj) {
  const safe = JSON.parse(JSON.stringify(variantObj));
  ['initial', 'animate', 'exit'].forEach(state => {
    if (safe[state]) {
      if (safe[state].y !== undefined) delete safe[state].y;
      if (safe[state].x !== undefined) delete safe[state].x;
      if (safe[state].scale !== undefined) delete safe[state].scale;
    }
  });
  return safe;
}

export function useMotionVariants() {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return {
      pageEntrance: stripTransforms(rawVariants.pageEntrance),
      childItem: stripTransforms(rawVariants.childItem),
      modalOverlay: stripTransforms(rawVariants.modalOverlay),
      modalContent: stripTransforms(rawVariants.modalContent),
      dropdown: stripTransforms(rawVariants.dropdown)
    };
  }

  return rawVariants;
}
