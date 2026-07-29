import React, { useState, useEffect } from 'react';
import { motion, useReducedMotion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Sparkle } from '@phosphor-icons/react';

const examples = [
  {
    name: "Premium Footwear",
    garment: "/assets/marketing/media__1784837623592.jpg",
    model: "/assets/marketing/media__1784837623543.jpg",
    settings: { model: "Male Lifestyle", lighting: "Mediterranean Sun" }
  },
  {
    name: "Virtual Try-On (Apparel)",
    garment: "/assets/marketing/media__1784837623530.jpg",
    model: "/assets/marketing/media__1784837623648.jpg",
    settings: { model: "Original Photo", lighting: "Studio Concrete" }
  }
];


export function Hero({ onStart }) {
  const shouldReduceMotion = useReducedMotion();
  const [activeIndex, setActiveIndex] = useState(0);
  const [animState, setAnimState] = useState('upload'); // upload, configure, generate, result

  useEffect(() => {
    let active = true;
    const runSequence = async () => {
      while (active) {
        setAnimState('upload');
        await new Promise(r => setTimeout(r, 1500));
        if (!active) break;
        
        setAnimState('configure');
        await new Promise(r => setTimeout(r, 1200));
        if (!active) break;
        
        setAnimState('generate');
        await new Promise(r => setTimeout(r, 2000));
        if (!active) break;
        
        setAnimState('result');
        await new Promise(r => setTimeout(r, 3500));
        if (!active) break;
        
        setActiveIndex((prev) => (prev + 1) % examples.length);
      }
    };
    
    runSequence();
    return () => { active = false; };
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
              <button className="rounded-none border border-white bg-white px-10 py-4 text-sm font-bold text-black hover:bg-neutral-200 transition-colors uppercase tracking-widest">
                Start Creating
              </button>
            </motion.div>
          </div>

          {/* Crisp, brutalist presentation of the MacBook */}
          <div className="relative mx-auto mt-32 max-w-[1400px] px-5">
             {/* Massive floating MacBook Cinematic Showcase */}
                <motion.div
                  initial={{ opacity: 0, y: 100, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 1.4, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
                  className="relative mx-auto mt-24 max-w-[1500px] px-5 sm:px-10 pointer-events-none"
                  style={{ perspective: '2500px' }}
                >
                  {/* Soft glowing drop shadow underneath the laptop to make it feel naturally floating */}
                  <motion.div 
                    animate={shouldReduceMotion ? undefined : { scaleX: [1, 1.05, 1], scaleY: [1, 0.9, 1], opacity: [0.3, 0.5, 0.3] }}
                    transition={{ duration: 6, ease: 'easeInOut', repeat: Infinity }}
                    className="pointer-events-none absolute inset-x-[15%] -bottom-[10%] z-0 h-[25%] rounded-[50%] bg-transparent"
                  />

                  {/* Glowing pedestal line */}
                  <div className="absolute -bottom-[5%] left-1/2 z-[1] h-[3px] w-[80px] -translate-x-1/2 rounded-full bg-transparent shadow-[0_0_30px_rgba(163,230,53,0.9)]" />

                  <div className="relative mx-auto aspect-[16/10] w-full max-w-[1400px]">
                    {/* Subtle floating motion for the whole laptop assembly */}
                    <motion.div
                      animate={shouldReduceMotion ? { rotateX: 12, rotateY: 0, y: 0 } : { rotateX: [12, 14, 12], rotateY: [-0.5, 0.5, -0.5], y: [0, -20, 0] }}
                      transition={{ duration: 6, ease: 'easeInOut', repeat: Infinity }}
                      className="absolute inset-x-0 top-0 bottom-[12%] z-10"
                      style={{ transformStyle: 'preserve-3d' }}
                    >
                      {/* Display: outer casing, thin bevels, and premium glass screen */}
                      <div
                        className="absolute inset-0 rounded-[28px] bg-[#090a0a] p-[0.3%] shadow-[0_50px_100px_rgba(0,0,0,0.8),inset_0_0_0_1.5px_rgba(255,255,255,0.15)] ring-1 ring-black"
                        style={{ transform: 'translateZ(15px)' }}
                      >
                        {/* Screen inner container */}
                        <div className="relative flex h-full overflow-hidden rounded-[24px] bg-[#070707] ring-1 ring-inset ring-white/5">

                          {/* ---------------------------------------------------- */}
                          {/* LIVE BEFORE/AFTER SIMULATION UI                      */}
                          {/* ---------------------------------------------------- */}
                          <div className="relative flex-1 w-full h-full overflow-hidden">

                            {/* The Current Example - App UI Simulation (Dashboard V2) */}
                            <AnimatePresence mode="wait">
                              <motion.div
                                key={activeIndex}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.6 }}
                                className="absolute inset-0 w-full h-full flex overflow-hidden bg-[#0d0d0d] text-white font-sans"
                              >
                                {/* Left Sidebar (Nav) */}
                                <div className="w-[18%] max-w-[160px] h-full bg-[#0a0a0a] border-r border-white/5 flex flex-col p-3 z-20">
                                  {/* Logo */}
                                  <div className="flex items-center gap-2 mb-8 mt-1">
                                    <div className="w-4 h-4 bg-[#a3e635] rounded-sm flex items-center justify-center text-black font-bold text-[8px]">PS</div>
                                    <div className="text-[10px] font-semibold tracking-wide">Pixtall AI Pro</div>
                                  </div>
                                  
                                  {/* Workspace */}
                                  <div className="flex items-center gap-2 mb-6 px-1">
                                    <div className="w-5 h-5 bg-[#a3e635]/20 rounded text-[#a3e635] flex items-center justify-center text-[9px] font-bold">P</div>
                                    <div className="flex flex-col">
                                      <span className="text-[9px] text-neutral-300">Personal Wor...</span>
                                      <span className="text-[7px] text-neutral-500 uppercase tracking-widest">Pro Plan</span>
                                    </div>
                                  </div>

                                  <div className="text-[7px] text-neutral-500 uppercase tracking-widest mb-2 px-1">Main</div>
                                  
                                  <div className="flex flex-col gap-1">
                                    <div className="flex items-center gap-2 bg-white/5 text-[#a3e635] px-2 py-1.5 rounded-md">
                                      <Sparkle weight="fill" className="w-3 h-3" />
                                      <span className="text-[9px] font-medium">Studio</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-neutral-400 hover:text-white px-2 py-1.5 rounded-md">
                                      <div className="w-3 h-3 border border-current rounded-sm opacity-70" />
                                      <span className="text-[9px]">My Products</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-neutral-400 hover:text-white px-2 py-1.5 rounded-md">
                                      <div className="w-3 h-3 border border-current rounded-sm opacity-70" />
                                      <span className="text-[9px]">Gallery</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-neutral-400 hover:text-white px-2 py-1.5 rounded-md">
                                      <div className="w-3 h-3 border border-current rounded-sm opacity-70" />
                                      <span className="text-[9px]">Billing</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-neutral-400 hover:text-white px-2 py-1.5 rounded-md">
                                      <div className="w-3 h-3 border border-current rounded-sm opacity-70" />
                                      <span className="text-[9px]">Settings</span>
                                    </div>
                                  </div>

                                  <div className="mt-auto bg-[#050505] border border-white/5 rounded-lg p-2 flex justify-between items-center">
                                    <span className="text-[7px] text-neutral-500 uppercase tracking-widest">Credits</span>
                                    <span className="text-[9px] font-bold">6 left</span>
                                  </div>
                                </div>

                                {/* Center Main Canvas Area */}
                                <div className="flex-1 h-full bg-[#111113] flex flex-col p-4 overflow-hidden relative">
                                  {/* Top Header */}
                                  <div className="w-full bg-[#0a0a0a] border border-white/5 rounded-lg p-3 flex items-center gap-3 mb-3">
                                    <div className="w-6 h-6 bg-[#a3e635]/10 text-[#a3e635] rounded-md flex items-center justify-center">
                                      <Sparkle weight="fill" className="w-3 h-3" />
                                    </div>
                                    <div>
                                      <div className="text-[10px] font-medium text-white">Product to Model Studio</div>
                                      <div className="text-[8px] text-neutral-500">Generate and compare.</div>
                                    </div>
                                  </div>

                                  {/* Big Image Preview Box */}
                                  <div className="flex-1 w-full bg-[#0a0a0a] border border-white/5 rounded-xl mb-3 relative overflow-hidden flex items-center justify-center">
                                    <AnimatePresence>
                                      {animState === 'upload' && (
                                        <motion.div 
                                          exit={{ opacity: 0, scale: 0.95 }}
                                          className="flex flex-col items-center gap-2"
                                        >
                                          <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-neutral-500 border border-white/10">
                                            <div className="w-4 h-4 border-2 border-current rounded-sm opacity-50" />
                                          </div>
                                          <div className="text-[9px] text-neutral-400">Upload a product and click Generate</div>
                                        </motion.div>
                                      )}
                                      
                                      {(animState === 'configure' || animState === 'generate') && (
                                        <motion.div 
                                          initial={{ opacity: 0 }}
                                          animate={{ opacity: 1 }}
                                          exit={{ opacity: 0 }}
                                          className="absolute inset-0 flex items-center justify-center"
                                        >
                                          <img 
                                            src={examples[activeIndex].garment} 
                                            className="w-[80%] h-[80%] object-contain opacity-30 blur-[4px] grayscale-[50%]" 
                                          />
                                          {animState === 'generate' && (
                                            <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm">
                                              <div className="w-full h-full absolute top-0 left-0 overflow-hidden">
                                                <motion.div 
                                                  animate={{ y: ['-10%', '110%'] }}
                                                  transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                                                  className="w-full h-[1px] bg-[#a3e635] shadow-[0_0_20px_2px_#a3e635]"
                                                />
                                              </div>
                                              <div className="bg-[#0a0a0a] border border-white/10 px-4 py-2 rounded-full text-[9px] font-medium text-white shadow-2xl flex items-center gap-2">
                                                <Sparkle className="text-[#a3e635] animate-pulse w-3 h-3" weight="fill" />
                                                Generating...
                                              </div>
                                            </div>
                                          )}
                                        </motion.div>
                                      )}

                                      {animState === 'result' && (
                                        <motion.div 
                                          initial={{ opacity: 0, filter: "brightness(2) blur(10px)" }}
                                          animate={{ opacity: 1, filter: "brightness(1) blur(0px)" }}
                                          transition={{ duration: 0.6 }}
                                          className="absolute inset-0 w-full h-full"
                                        >
                                          <img src={examples[activeIndex].model} className="w-full h-full object-cover" />
                                        </motion.div>
                                      )}
                                    </AnimatePresence>
                                  </div>

                                  {/* 3 Thumbnails Row */}
                                  <div className="h-[25%] w-full flex gap-3">
                                    {[0, 1, 2].map((i) => (
                                      <div key={i} className="flex-1 bg-[#0a0a0a] border border-white/5 rounded-xl flex items-center justify-center relative overflow-hidden">
                                         {animState === 'result' && i === 0 ? (
                                           <motion.img 
                                             initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                             src={examples[activeIndex].model} className="w-full h-full object-cover" 
                                           />
                                         ) : (
                                           <div className="w-4 h-4 border-2 border-neutral-700/50 rounded-sm" />
                                         )}
                                      </div>
                                    ))}
                                  </div>
                                </div>

                                {/* Right Sidebar */}
                                <div className="w-[25%] max-w-[220px] h-full bg-[#0a0a0a] border-l border-white/5 flex flex-col p-4 z-20 overflow-y-auto">
                                  {/* Toggle */}
                                  <div className="bg-white/5 rounded-lg p-1 flex mb-6">
                                    <div className="flex-1 bg-[#1a1a1a] rounded text-[8px] font-medium text-white flex items-center justify-center py-1.5 shadow-sm border border-white/5">
                                      Product to Model
                                    </div>
                                    <div className="flex-1 text-[8px] font-medium text-neutral-500 flex items-center justify-center py-1.5">
                                      Virtual Try-On
                                    </div>
                                  </div>

                                  {/* Source Material */}
                                  <div className="mb-4">
                                    <div className="text-[7px] text-neutral-500 uppercase tracking-widest mb-2 font-mono">Source Material</div>
                                    <div className="w-full aspect-[4/3] rounded-lg border border-dashed border-white/10 bg-white/[0.01] flex flex-col items-center justify-center p-2 relative overflow-hidden">
                                      <AnimatePresence>
                                        {animState !== 'upload' ? (
                                          <motion.img 
                                            initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
                                            src={examples[activeIndex].garment} className="w-full h-full object-contain"
                                          />
                                        ) : (
                                          <motion.div exit={{ opacity: 0 }} className="flex flex-col items-center gap-1.5">
                                            <div className="w-6 h-6 rounded-full bg-white/5 flex items-center justify-center text-neutral-400">↑</div>
                                            <div className="text-[8px] font-medium text-neutral-300">Drop product photo</div>
                                            <div className="text-[6px] text-neutral-500">JPG, PNG or WEBP - max 10MB</div>
                                            <div className="mt-1 bg-white/10 px-3 py-1 rounded-full text-[7px] text-white">Choose image</div>
                                          </motion.div>
                                        )}
                                      </AnimatePresence>
                                    </div>
                                  </div>

                                  {/* Model Reference */}
                                  <div className="mb-4">
                                    <div className="text-[7px] text-neutral-500 uppercase tracking-widest mb-2 font-mono">Model Reference</div>
                                    <div className="flex bg-white/5 rounded-lg overflow-hidden border border-white/5">
                                      <div className="flex-1 py-1.5 text-[8px] text-center bg-[#1a1a1a] text-white">Male</div>
                                      <div className="flex-1 py-1.5 text-[8px] text-center text-neutral-400">Female</div>
                                      <div className="flex-1 py-1.5 text-[8px] text-center text-neutral-400">None</div>
                                    </div>
                                  </div>

                                  {/* Dropdowns */}
                                  <div className="space-y-3 mb-6">
                                    <div>
                                      <div className="text-[7px] text-neutral-500 uppercase tracking-widest mb-1.5 font-mono">Category</div>
                                      <div className="w-full h-7 rounded-lg bg-white/5 border border-white/5 px-2 flex items-center justify-between text-[8px] text-neutral-300">
                                        {examples[activeIndex].name}
                                        <span className="text-[6px]">▼</span>
                                      </div>
                                    </div>
                                    <div>
                                      <div className="text-[7px] text-neutral-500 uppercase tracking-widest mb-1.5 font-mono">Details</div>
                                      <div className="w-full h-7 rounded-lg bg-white/5 border border-white/5 px-2 flex items-center justify-between text-[8px] text-neutral-300">
                                        Details
                                        <span className="text-[6px]">▼</span>
                                      </div>
                                    </div>
                                    <div>
                                      <div className="text-[7px] text-neutral-500 uppercase tracking-widest mb-1.5 font-mono">Scene</div>
                                      <div className="w-full h-7 rounded-lg bg-white/5 border border-white/5 px-2 flex items-center justify-between text-[8px] text-neutral-300">
                                        {examples[activeIndex].settings.lighting}
                                        <span className="text-[6px]">▼</span>
                                      </div>
                                    </div>
                                    <div className="flex gap-2">
                                      <div className="flex-1">
                                        <div className="text-[7px] text-neutral-500 uppercase tracking-widest mb-1.5 font-mono">Size</div>
                                        <div className="w-full h-7 rounded-lg bg-white/5 border border-white/5 px-2 flex items-center justify-between text-[8px] text-neutral-300">
                                          Size <span className="text-[6px]">▼</span>
                                        </div>
                                      </div>
                                      <div className="flex-[1.5]">
                                        <div className="text-[7px] text-neutral-500 uppercase tracking-widest mb-1.5 font-mono">Count</div>
                                        <div className="flex items-center gap-2 text-[9px] text-neutral-400 px-1 pt-1">
                                          <span className="text-white">1</span>
                                          <span>2</span>
                                          <span>3</span>
                                          <span>4</span>
                                        </div>
                                      </div>
                                    </div>
                                  </div>

                                  <div className="mt-auto pt-2">
                                    <motion.button 
                                      animate={{ 
                                        opacity: animState === 'upload' ? 0.5 : 1,
                                        backgroundColor: animState === 'generate' ? '#27272a' : '#a3e635',
                                        color: animState === 'generate' ? '#a1a1aa' : '#000'
                                      }}
                                      className="w-full py-2.5 rounded-lg text-[9px] font-bold transition-all flex items-center justify-center gap-1.5"
                                    >
                                      <Sparkle weight="fill" className="w-3 h-3" />
                                      {animState === 'generate' ? 'Generating...' : animState === 'result' ? 'Generated' : 'Generate'}
                                    </motion.button>
                                  </div>
                                </div>
                              </motion.div>
                            </AnimatePresence>

                          </div>
                          {/* ---------------------------------------------------- */}

                          {/* Glare and reflections for extreme realism */}
                          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(110deg,rgba(255,255,255,0.08),transparent_40%,transparent_60%,rgba(255,255,255,0.02))]" />
                          <div className="pointer-events-none absolute inset-0 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.15)] rounded-[24px]" />

                          {/* Camera notch */}
                          <div className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-[12%] h-4 bg-[#090a0a] rounded-b-[8px] flex items-center justify-center border-b border-x border-white/5">
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
