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
    <section id="hero" className="relative w-full overflow-hidden pb-40 pt-32 z-10 border-b border-white/10 bg-black">
      <div className="mx-auto max-w-[1200px] px-5 text-center">
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
          className="text-[12vw] sm:text-[8vw] font-medium tracking-tighter leading-[0.85] uppercase"
        >
          <motion.span 
            variants={{ hidden: { opacity: 0, y: 40 }, visible: { opacity: 1, y: 0, transition: { duration: 1, ease: [0.16, 1, 0.3, 1] } } }} 
            className="inline-block text-white mr-[2vw] sm:mr-[1.5vw]"
          >
            One
          </motion.span>
          <motion.span 
            variants={{ hidden: { opacity: 0, y: 40 }, visible: { opacity: 1, y: 0, transition: { duration: 1, ease: [0.16, 1, 0.3, 1] } } }} 
            className="inline-block text-white"
          >
            Photo.
          </motion.span>
          <br />
          <motion.span 
            variants={{ hidden: { opacity: 0, y: 40 }, visible: { opacity: 1, y: 0, transition: { duration: 1, ease: [0.16, 1, 0.3, 1] } } }} 
            className="inline-block text-neutral-600 mr-[2vw] sm:mr-[1.5vw]"
          >
            Marketplace
          </motion.span>
          <motion.span 
            variants={{ hidden: { opacity: 0, y: 40 }, visible: { opacity: 1, y: 0, transition: { duration: 1, ease: [0.16, 1, 0.3, 1] } } }} 
            className="inline-block text-neutral-600"
          >
            Ready.
          </motion.span>
        </motion.h1>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.5 }}
          className="mt-16 flex flex-col items-center"
        >
          <p className="max-w-xl text-lg text-neutral-400 leading-relaxed mb-10">
            Pixtall AI composites your raw product shot onto a professional model reference to generate high-converting listing photos for Amazon, Flipkart, Etsy, and more — no studio, no shoot.
          </p>
          <button className="rounded-none border border-white bg-transparent px-10 py-4 text-sm font-bold text-white hover:bg-white/10 transition-colors uppercase tracking-widest">
            Start Creating
          </button>
        </motion.div>
      </div>

      {/* ── 2. Generous Vertical Spacing ── */}
      <div className="h-10 sm:h-24" />

      {/* ── 3. Flat Browser Tab Display ── */}
      <div className="relative w-full max-w-[1500px] px-4 sm:px-8 mx-auto flex-1 mb-8 z-20 flex justify-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.0, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full aspect-[1440/940] z-20"
        >
          <div className="w-full h-full relative rounded-[24px] bg-[#1a1b1e] p-[2px] shadow-[0_40px_80px_rgba(0,0,0,0.8),inset_0_1px_1px_rgba(255,255,255,0.2)] border border-[#2a2b2e]">
            <div className="w-full h-full relative bg-[#090a0a] rounded-[22px] p-[6px] border border-black shadow-[inset_0_0_0_1px_rgba(255,255,255,0.05)] overflow-hidden">
              {/* Screen content (The actual UI) */}
              <div className="absolute inset-[2px] bg-black rounded-[20px] overflow-hidden flex items-center justify-center">
                
                {/* Scale DemoPlayback and Header to fit container */}
                <div className="w-full h-full relative" style={{ containerType: 'inline-size' }}>
                  <div 
                    className="absolute top-0 left-0 origin-top-left flex flex-col bg-black"
                    style={{
                      width: '1440px',
                      height: '940px',
                      transform: 'scale(calc(100cqw / 1440))'
                    }}
                  >
                    {/* Fake Browser Header (Traffic Lights & URL) */}
                    <div className="w-full h-[40px] border-b border-white/5 bg-[#121214] flex items-center px-4 justify-between shrink-0">
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

                    {/* DemoPlayback - Fixed to 1440x900 */}
                    <div className="w-[1440px] h-[900px] shrink-0 relative">
                      <DemoPlayback demoState={demoState} cursor={cursor} />
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Glare and reflections for extreme realism */}
              <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(110deg,rgba(255,255,255,0.05),transparent_40%,transparent_60%,rgba(255,255,255,0.02))]" />
              <div className="pointer-events-none absolute inset-0 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.15)] rounded-[24px]" />
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
