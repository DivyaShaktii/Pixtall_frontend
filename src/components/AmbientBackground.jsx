import React, { useEffect } from "react";
import { motion, useReducedMotion, useMotionValue } from "framer-motion";

/**
 * Shared ambient background motion used on both the marketing page and the Studio shell.
 */
export default function AmbientBackground({ variant = "dark" }) {
  const shouldReduceMotion = useReducedMotion();
  const isDark = variant === "dark";
  
  const gridOpacity = isDark ? "opacity-[0.04]" : "opacity-[0.025]";
  const gridColor = isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.06)";
  const glowColor = isDark ? "bg-lime-500/[0.06]" : "bg-lime-500/[0.04]";
  const accentColor = isDark ? "bg-lime-500/[0.03]" : "bg-lime-500/[0.02]";

  const driftAnimation = shouldReduceMotion ? {} : {
    x: [0, 80, -40, 60, 0],
    y: [0, -60, 40, -30, 0],
  };

  const driftTransition = {
    duration: 45,
    repeat: Infinity,
    ease: "easeInOut",
  };

  const secondaryDrift = shouldReduceMotion ? {} : {
    x: [0, -60, 30, -50, 0],
    y: [0, 40, -60, 20, 0],
  };

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none select-none" aria-hidden="true">
      {/* Grid texture */}
      <div 
        className={`absolute inset-0 ${gridOpacity}`}
        style={{
          backgroundImage: `linear-gradient(${gridColor} 1px, transparent 1px), linear-gradient(90deg, ${gridColor} 1px, transparent 1px)`,
          backgroundSize: '60px 60px'
        }} 
      />

      {/* Primary drifting glow */}
      <motion.div
        className={`absolute ${glowColor} rounded-full blur-[100px]`}
        style={{ width: 500, height: 500, top: '20%', left: '30%' }}
        animate={driftAnimation}
        transition={driftTransition}
      />

      {/* Secondary drifting glow */}
      <motion.div
        className={`absolute ${glowColor} rounded-full blur-[120px]`}
        style={{ width: 400, height: 400, bottom: '15%', right: '20%' }}
        animate={secondaryDrift}
        transition={{ ...driftTransition, duration: 55 }}
      />

      {/* Corner accent shape */}
      <div className={`absolute -bottom-20 -right-20 w-64 h-64 ${accentColor} rounded-[3rem] rotate-12 blur-[2px]`} />
    </div>
  );
}
