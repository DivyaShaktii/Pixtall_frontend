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
    <section id="how-it-works" className="relative w-full pb-32 pt-16 sm:pt-24 z-10 bg-black">
      <div className="mx-auto w-full px-5">
        <div className="max-w-3xl mb-24 flex flex-col gap-4">
          <motion.h2 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: { staggerChildren: 0.15 }
              }
            }}
            className="text-5xl sm:text-7xl font-bold tracking-tighter flex flex-wrap gap-x-[0.3em] gap-y-2"
            style={{ perspective: '1000px' }}
          >
            {[
              { text: "How", class: "text-white" },
              { text: "it", class: "text-white" },
              { text: "works.", class: "text-[#84cc16]" }
            ].map((item, i) => (
              <motion.span
                key={i}
                variants={{
                  hidden: { opacity: 0, rotateX: -90, y: 20 },
                  visible: { opacity: 1, rotateX: 0, y: 0, transition: { duration: 1, ease: [0.16, 1, 0.3, 1] } }
                }}
                className={`inline-block origin-bottom ${item.class}`}
              >
                {item.text}
              </motion.span>
            ))}
          </motion.h2>
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
                <span className="text-sm font-mono text-neutral-500 mb-3">{step.eyebrow}</span>
                <h3 className="text-xl font-semibold text-white mb-3">{step.title}</h3>
                <p className="text-base text-neutral-400 leading-relaxed">{step.body}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Feature Strip */}
        {/* Feature Strip */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-24 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 rounded-2xl border-t border-[#a3e635]/30 bg-gradient-to-b from-[#a3e635]/5 to-transparent p-12"
        >
          {highlights.map((h, i) => (
            <div key={i} className="flex flex-col border-l border-white/10 pl-6">
              <h4 className="text-xl font-bold text-[#a3e635] mb-4">{h.title}</h4>
              <p className="text-base text-white/90 leading-relaxed w-full font-medium">{h.body}</p>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
