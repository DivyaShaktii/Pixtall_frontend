import React from 'react'
import { motion } from 'framer-motion'
import { ArrowRight } from '@phosphor-icons/react'

export function CtaSection({ onStart }) {
  return (
    <section id="start" className="relative w-full px-5 py-20">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 0.6 }}
        className="relative mx-auto max-w-[1200px] overflow-hidden rounded-3xl border border-[#a3e635]/20 bg-[#111] px-6 py-20 text-center sm:px-12"
      >
        <div className="pointer-events-none absolute -top-24 left-1/2 h-64 w-[80%] -translate-x-1/2 rounded-full bg-[#a3e635]/15 blur-[100px]" />
        <h2 className="relative text-3xl font-semibold tracking-tight text-white sm:text-4xl md:text-5xl">
          Start creating AI Fashion Photos today.
        </h2>
        <p className="relative mx-auto mt-6 max-w-md text-neutral-400 text-lg">
          Generate your first studio-quality virtual try-on catalog. No camera, no studio required.
        </p>
        <button
          onClick={onStart}
          className="group relative mt-10 inline-flex items-center gap-2 rounded-lg bg-[#a3e635] px-8 py-4 text-sm font-semibold text-black transition-all hover:bg-[#b6ef5c] shadow-[0_0_20px_rgba(163,230,53,0.3)] hover:shadow-[0_0_30px_rgba(163,230,53,0.5)]"
        >
          Start Creating
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </button>
      </motion.div>
    </section>
  )
}
