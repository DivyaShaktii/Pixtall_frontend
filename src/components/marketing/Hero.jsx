import React, { useState, useEffect, useRef } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { DemoPlayback } from './Hero3D/DemoPlayback';
import { useDemoTimeline } from './Hero3D/useDemoTimeline';

export function Hero({ onStart }) {
  const shouldReduceMotion = useReducedMotion();
  const [isMobile, setIsMobile] = useState(false);
  const { demoState, cursor, ripples } = useDemoTimeline(shouldReduceMotion);
  const containerRef = useRef(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (let entry of entries) {
        setScale(entry.contentRect.width / 1600);
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <section id="hero" className="relative w-full overflow-hidden pb-16 z-10 border-b border-white/10 bg-black">
      {/* Hero Content Wrapper */}
      <div className="relative w-full mt-[76px] pt-[52px] pb-16">
        {/* Background Video */}
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover z-0 opacity-100 brightness-125 contrast-110"
        >
          <source src="/upload_animation.mp4" type="video/mp4" />
        </video>

        <div className="relative mx-auto max-w-[1200px] px-5 text-center z-10">
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
          className="text-[12vw] sm:text-[8vw] font-medium tracking-tighter leading-[0.85] uppercase blur-[2px]"
          style={{ perspective: '1000px' }}
        >
          {[
            { text: "One", class: "text-white mr-[2vw] sm:mr-[1.5vw]" },
            { text: "Photo.", class: "text-white" },
            { br: true },
            { text: "Marketplace", class: "text-neutral-600 mr-[2vw] sm:mr-[1.5vw]" },
            { text: "Ready.", class: "text-neutral-600" }
          ].map((item, i) => item.br ? <br key={i} /> : (
            <motion.span
              key={i}
              variants={{
                hidden: { opacity: 0, rotateX: -90, y: 20 },
                visible: { opacity: 1, rotateX: 0, y: 0, transition: { duration: 1, ease: [0.16, 1, 0.3, 1] } }
              }}
              style={{ transformOrigin: 'top center' }}
              className={`inline-block ${item.class}`}
            >
              {item.text}
            </motion.span>
          ))}
        </motion.h1>

        <div className="h-[250px] w-full" />
      </div>
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
                <div ref={containerRef} className="w-full relative pointer-events-none" style={{ aspectRatio: '1600/940' }}>
                  <div 
                    className="absolute top-0 left-0 origin-top-left flex flex-col bg-black pointer-events-none select-none"
                    style={{
                      width: '1600px',
                      height: '940px',
                      transform: `scale(${scale})`
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

                    {/* DemoPlayback - Fixed to 1600x900 */}
                    <div className="w-[1600px] h-[900px] shrink-0 relative">
                      <DemoPlayback demoState={demoState} cursor={cursor} ripples={ripples} onStart={onStart} />
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
