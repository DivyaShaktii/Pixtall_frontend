import React, { useEffect } from "react";
import { motion, useReducedMotion, useMotionValue, useSpring, useTransform } from "framer-motion";

const PARTICLES = [
  { id: 1, src: "/assets/3d/shoes/shoe_01.png", x: "15%", y: "20%", size: 120, parallax: 0.05, delay: 0 },
  { id: 2, src: "/assets/3d/electronics/phone_01.png", x: "80%", y: "15%", size: 140, parallax: -0.08, delay: 1 },
  { id: 3, src: "/assets/3d/jewelry/ring_01.png", x: "75%", y: "75%", size: 90, parallax: 0.12, delay: 2 },
  { id: 4, src: "/assets/3d/beauty/lipstick_01.png", x: "20%", y: "80%", size: 100, parallax: -0.06, delay: 1.5 },
  { id: 5, src: "/assets/3d/home/candle_01.png", x: "40%", y: "10%", size: 110, parallax: 0.04, delay: 0.5 },
  { id: 6, src: "/assets/3d/accessories/sunglasses_01.png", x: "50%", y: "85%", size: 130, parallax: -0.07, delay: 2.5 },
  { id: 7, src: "/assets/3d/luxury/bag_01.png", x: "90%", y: "45%", size: 160, parallax: 0.09, delay: 0.8 },
  { id: 8, src: "/assets/3d/food/coffee_01.png", x: "5%", y: "50%", size: 115, parallax: -0.1, delay: 1.2 },
];

function Particle({ particle, mouseX, mouseY, shouldReduceMotion }) {
  // Float and 3D rotation animation
  const floatAnim = shouldReduceMotion ? {} : {
    y: ["-25px", "25px", "-25px"],
    rotateX: [0, 15, 0, -15, 0],
    rotateY: [0, 25, 0, -25, 0],
    rotateZ: [0, 10, -10, 0]
  };

  // Parallax transform linked to cursor position
  const springConfig = { damping: 25, stiffness: 60 };
  const smoothMouseX = useSpring(mouseX, springConfig);
  const smoothMouseY = useSpring(mouseY, springConfig);

  const parallaxX = useTransform(smoothMouseX, (val) => val * particle.parallax * 200);
  const parallaxY = useTransform(smoothMouseY, (val) => val * particle.parallax * 200);

  return (
    <motion.div
      className="absolute flex items-center justify-center pointer-events-none"
      style={{
        left: particle.x,
        top: particle.y,
        width: particle.size,
        height: particle.size,
        x: shouldReduceMotion ? 0 : parallaxX,
        y: shouldReduceMotion ? 0 : parallaxY,
        opacity: 0.85, 
        zIndex: 0,
      }}
    >
      <motion.img
        src={particle.src}
        alt=""
        className="w-full h-full object-contain drop-shadow-[0_20px_30px_rgba(0,0,0,0.5)] mix-blend-normal"
        animate={floatAnim}
        transition={{
          duration: 12 + particle.id * 1.5,
          repeat: Infinity,
          ease: "easeInOut",
          delay: particle.delay,
        }}
      />
    </motion.div>
  );
}

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

  // Mouse tracking for parallax
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  useEffect(() => {
    if (shouldReduceMotion) return;
    const handleMouseMove = (e) => {
      const x = (e.clientX / window.innerWidth) * 2 - 1;
      const y = (e.clientY / window.innerHeight) * 2 - 1;
      mouseX.set(x);
      mouseY.set(y);
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [mouseX, mouseY, shouldReduceMotion]);

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
    <div className="absolute inset-0 overflow-hidden pointer-events-none select-none" aria-hidden="true" style={{ perspective: "1000px" }}>
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

      {/* 3D Interactive Particles */}
      <div className="absolute inset-0" style={{ transformStyle: "preserve-3d" }}>
        {PARTICLES.map((particle) => (
          <Particle 
            key={particle.id} 
            particle={particle} 
            mouseX={mouseX} 
            mouseY={mouseY} 
            shouldReduceMotion={shouldReduceMotion} 
          />
        ))}
      </div>
    </div>
  );
}
