import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkle } from '@phosphor-icons/react';

export function HeroText({ onStart }) {
  return (
    <div className="mx-auto w-full px-5 pt-12 text-center sm:pt-16">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs text-neutral-300 backdrop-blur transition-colors hover:border-[#a3e635]/40 hover:text-white cursor-pointer"
      >
        <Sparkle className="h-3.5 w-3.5 text-[#a3e635]" weight="fill" aria-hidden="true" />
        Introducing AI Product Photoshoots
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.05 }}
        className="mx-auto mt-6 max-w-4xl text-4xl font-semibold leading-[1.05] tracking-tight text-white sm:text-5xl md:text-6xl"
      >
        Studio-quality product photos,
        <br />
        <span className="text-[#a3e635]"> generated in seconds</span>
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.12 }}
        className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-neutral-400 sm:text-lg"
      >
        Drop in your product, describe the scene, and let our AI render
        photorealistic photoshoots — no camera, studio, or set required.
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.18 }}
        className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row relative z-20"
      >
        <button
          onClick={onStart}
          className="group inline-flex items-center gap-2 rounded-lg bg-[#a3e635] px-6 py-3 text-sm font-medium text-black transition-colors hover:bg-[#b6ef5c]"
        >
          Try for free
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </button>
        <button
          className="inline-flex items-center gap-2 rounded-lg border border-white/10 px-6 py-3 text-sm font-medium text-neutral-200 transition-colors hover:bg-white/5"
        >
          Watch demo
        </button>
      </motion.div>
    </div>
  );
}
