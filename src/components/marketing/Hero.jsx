import React, { useState, useEffect } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { DemoPlayback } from './Hero3D/DemoPlayback';
import { useDemoTimeline } from './Hero3D/useDemoTimeline';

export function Hero({ onStart }) {
  const shouldReduceMotion = useReducedMotion();
  const [isMobile, setIsMobile] = useState(false);
  const { demoState, cursor } = useDemoTimeline(shouldReduceMotion);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <section id="hero" className="relative z-50 w-full min-h-[120vh] bg-[#0A0A0A] text-white flex flex-col items-center">
      {/* ── Background Aesthetics: Faint Radial Ambient Glow behind Laptop ── */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[50%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[500px] bg-[#C6F24E]/5 rounded-full blur-[160px]" />
      </div>

      {/* ── 1. Top Header Content ── */}
      <div className="relative z-10 w-full max-w-6xl pt-28 sm:pt-36 px-6 text-center flex flex-col items-center">
        
        {/* Eyebrow Tag */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs text-neutral-300 backdrop-blur mb-6 hover:border-[#C6F24E]/40"
        >
          <span className="h-2 w-2 rounded-full bg-[#C6F24E] animate-pulse" />
          Introducing AI Product Photoshoots
        </motion.div>

        {/* Huge Bold Uppercase Headline */}
        <motion.h1
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: { staggerChildren: 0.15, delayChildren: 0.1 }
            }
          }}
          className="font-extrabold uppercase tracking-tighter text-[clamp(48px,7vw,112px)] leading-[0.9] text-white flex flex-wrap justify-center gap-x-4 sm:gap-x-6 gap-y-0"
        >
          <motion.span 
            variants={{ hidden: { opacity: 0, y: 40 }, visible: { opacity: 1, y: 0, transition: { duration: 1, ease: [0.16, 1, 0.3, 1] } } }} 
            className="inline-block text-white"
          >
            RAW
          </motion.span>
          <motion.span 
            variants={{ hidden: { opacity: 0, y: 40 }, visible: { opacity: 1, y: 0, transition: { duration: 1, ease: [0.16, 1, 0.3, 1] } } }} 
            className="inline-block text-[#C6F24E]"
          >
            IMAGE.
          </motion.span>
          <div className="w-full h-0 basis-full" />
          <motion.span 
            variants={{ hidden: { opacity: 0, y: 40 }, visible: { opacity: 1, y: 0, transition: { duration: 1, ease: [0.16, 1, 0.3, 1] } } }} 
            className="inline-block text-neutral-500"
          >
            STUDIO
          </motion.span>
          <motion.span 
            variants={{ hidden: { opacity: 0, y: 40 }, visible: { opacity: 1, y: 0, transition: { duration: 1, ease: [0.16, 1, 0.3, 1] } } }} 
            className="inline-block text-white"
          >
            PERFECT.
          </motion.span>
        </motion.h1>

        {/* 1-2 Line Subheadline */}
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mt-6 text-base sm:text-xl text-neutral-400 max-w-2xl leading-relaxed font-normal"
        >
          Transform raw product shots into studio-quality marketplace listings in seconds. No photography studio required.
        </motion.p>

        {/* Side-by-Side Pill CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.35 }}
          className="mt-8 flex flex-col sm:flex-row items-center gap-4"
        >
          <button
            onClick={onStart}
            className="rounded-full bg-[#C6F24E] hover:bg-[#b5e33d] px-8 py-3.5 text-sm font-bold text-black transition-all shadow-[0_0_24px_rgba(198,242,78,0.25)] hover:shadow-[0_0_32px_rgba(198,242,78,0.4)] uppercase tracking-wider"
          >
            Start Creating Free
          </button>
          <a
            href="#how-it-works"
            className="rounded-full border border-white/20 hover:border-white/40 bg-white/5 px-8 py-3.5 text-sm font-semibold text-white transition-all backdrop-blur uppercase tracking-wider"
          >
            See How It Works
          </a>
        </motion.div>
      </div>

      {/* ── 2. Generous Vertical Spacing ── */}
      <div className="h-10 sm:h-16" />

      {/* ── 3. CSS 3D Laptop Display (No GLB) ── */}
      <div className="relative w-full max-w-[1100px] px-4 mx-auto flex-1 mb-40 z-20 flex justify-center perspective-[2000px]">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.0, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full aspect-[16/10] z-20 perspective-[2000px]"
        >
          <div className="w-full h-full relative" style={{ transformStyle: 'preserve-3d' }}>
            {/* The Laptop Body rotated in 3D */}
            <motion.div
              animate={{ rotateX: [15, 5, 15] }}
              transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
              className="w-full h-full relative"
              style={{ transformStyle: 'preserve-3d', transformOrigin: 'bottom' }}
            >
              {/* Top Lid (Screen) */}
              <div className="absolute inset-0 rounded-[24px] bg-[#1a1b1e] p-[2px] shadow-[0_0_80px_rgba(198,242,78,0.1),inset_0_1px_1px_rgba(255,255,255,0.2)] border border-[#2a2b2e]">
                <div className="w-full h-full relative bg-[#090a0a] rounded-[22px] p-[6px] border border-black shadow-[inset_0_0_0_1px_rgba(255,255,255,0.05)] overflow-hidden">
                  {/* Screen content (The actual UI) */}
                  <div className="absolute inset-[2px] bg-black rounded-[22px] overflow-hidden flex items-center justify-center">
                    
                    {/* Fake Browser Header (Traffic Lights & URL) */}
                    <div className="absolute top-0 left-0 w-full h-8 border-b border-white/5 bg-[#121214] flex items-center px-4 justify-between z-50">
                      <div className="flex gap-1.5">
                        <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f56]" />
                        <div className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e]" />
                        <div className="w-2.5 h-2.5 rounded-full bg-[#27c93f]" />
                      </div>
                      <div className="text-[10px] text-neutral-500 font-medium px-4 py-0.5 bg-white/5 rounded-md border border-white/5">
                        pixtall.ai/studio
                      </div>
                      <div className="w-[42px]" /> {/* Spacer to balance traffic lights */}
                    </div>

                    {/* Scale DemoPlayback to fit container */}
                    <div className="absolute inset-0 top-8 flex items-center justify-center bg-black">
                      <div className="w-full h-full relative" style={{ containerType: 'inline-size' }}>
                        <div 
                          className="absolute top-0 left-0 origin-top-left"
                          style={{
                            width: '1440px',
                            height: '900px',
                            transform: 'scale(calc(100cqw / 1440))'
                          }}
                        >
                          <DemoPlayback demoState={demoState} cursor={cursor} />
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Glare and reflections for extreme realism */}
                  <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(110deg,rgba(255,255,255,0.05),transparent_40%,transparent_60%,rgba(255,255,255,0.02))]" />
                  <div className="pointer-events-none absolute inset-0 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.15)] rounded-[24px]" />

                  {/* Camera notch */}
                  <div className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-[12%] h-4 bg-[#090a0a] rounded-b-[8px] flex items-center justify-center border-b border-x border-white/5 z-[60]">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#111] border border-white/10" />
                  </div>
                </div>
              </div>

              {/* Razor thin Hinge */}
              <div
                className="absolute inset-x-[12%] bottom-[-1.5%] h-[4%] rounded-full bg-[#0a0b0c] shadow-[0_10px_20px_rgba(0,0,0,0.9)]"
                style={{ transform: 'translateZ(-2px) rotateX(-20deg)' }}
              />

              {/* Razor thin lower body deck */}
              <div
                className="absolute inset-x-[1%] bottom-[-6%] h-[7%] rounded-[4px] border-t border-white/10 bg-[#17181a] shadow-[0_20px_50px_rgba(0,0,0,0.8)] overflow-hidden"
                style={{ transform: 'translateZ(14px) rotateX(15deg)', transformOrigin: 'top' }}
              >
                {/* Front lip highlight */}
                <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                {/* Thumb scoop */}
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[12%] h-[20%] bg-[#0f1012] rounded-t-lg border-t border-white/5" />
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
