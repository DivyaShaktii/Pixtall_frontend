import React from 'react';
import { motion } from 'framer-motion';
import { RevealText } from './RevealText';

const steps = [
  {
    number: '01',
    eyebrow: 'Raw upload',
    title: 'Upload your product photo',
    body: 'Any clean shot works — jewelry, apparel, bags, beauty, food. Straight off a phone is fine.',
    img: '/gallery/step1.jpg',
  },
  {
    number: '02',
    eyebrow: 'Jewelry · outdoor · 4:5',
    title: 'Set the context',
    body: 'Pick a category, a scene, and an aspect ratio. Choose one of several preset models — or upload a photo of your own.',
    img: '/gallery/step2.jpg',
  },
  {
    number: '03',
    eyebrow: 'Compositing',
    title: 'Pixtall composites the shot',
    body: 'The engine places your product on the model, matching light, angle, and perspective.',
    img: '/gallery/step3.png',
  },
  {
    number: '04',
    eyebrow: 'Marketplace-ready',
    title: 'Export, ready to list',
    body: 'Download a listing photo sized for Amazon, Flipkart, Etsy, and more.',
    img: '/gallery/step4.png',
  }
];

const highlights = [
  { title: 'Higher conversion', body: 'Model-worn photos engage more than a flat product shot.' },
  { title: 'Time saving', body: 'Generate a listing photo in seconds, not a studio day.' },
  { title: 'Cost effective', body: 'No studio, no shoot, no stylist to book.' },
  { title: 'Marketplace ready', body: 'Sized correctly for every platform you sell on.' },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="relative w-full pb-32 pt-[30vh] sm:pt-[40vh] z-10 bg-black">
      <div className="mx-auto w-full px-5">
        <div className="max-w-3xl mb-24 flex flex-col gap-4">
          <h2 className="text-5xl sm:text-7xl font-bold tracking-tighter text-white">
            How it <span className="text-[#84cc16]">works.</span>
          </h2>
          <p className="font-medium text-xl sm:text-2xl text-[#f5f5f5] max-w-xl">
            One photo is all you need. We handle the lighting, styling, and formatting.
          </p>
        </div>

        <div className="relative grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Horizontal line connecting steps (visible on desktop) */}
          <div className="hidden md:block absolute top-[16px] left-[40px] right-[40px] h-[1px] bg-white/10 z-0" />
          
          {steps.map((step, idx) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className="relative z-10 flex flex-col"
            >
              {/* Step Badge */}
              <div className="mb-10 flex h-8 w-8 items-center justify-center rounded-full bg-black border border-white/20 text-xs font-mono text-[#a3e635] shadow-[0_0_15px_rgba(163,230,53,0.15)]">
                {step.number}
              </div>
              
              {/* Image Card */}
              <div className="aspect-square rounded-2xl border border-white/10 bg-white/[0.02] overflow-hidden mb-6 group relative">
                <img 
                  src={step.img} 
                  alt={step.title}
                  className="w-full h-full object-cover opacity-80 transition-transform duration-700 group-hover:scale-105 group-hover:opacity-100"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />
              </div>
              
              {/* Text Content */}
              <div className="flex flex-col flex-grow">
                <span className="text-xs font-mono text-neutral-500 mb-2">{step.eyebrow}</span>
                <h3 className="text-lg font-medium text-white mb-2">{step.title}</h3>
                <p className="text-sm text-neutral-400 leading-relaxed">{step.body}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Feature Strip */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-24 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 rounded-2xl border border-white/10 bg-white/[0.01] p-8"
        >
          {highlights.map((h, i) => (
            <div key={i} className="flex flex-col">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-1.5 h-1.5 rounded-full bg-[#a3e635]" />
                <h4 className="text-sm font-medium text-white">{h.title}</h4>
              </div>
              <p className="text-xs text-neutral-500 leading-relaxed w-full">{h.body}</p>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
