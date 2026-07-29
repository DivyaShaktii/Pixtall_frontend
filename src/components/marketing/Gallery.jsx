import React from 'react';
import { motion } from 'framer-motion';
import { RevealText } from './RevealText';

const images = [
  "/gallery/ecom_1.png",
  "/gallery/ecom_2.png",
  "/gallery/ecom_3.png",
  "/gallery/stallpix-generated-1.png",
  "/gallery/stallpix-generated-2.png",
  "/gallery/stallpix-generated-3.png"
];

export function Gallery() {
  return (
    <section id="gallery" className="relative w-full py-24 z-10 bg-white/[0.01] border-y border-white/5">
      <div className="mx-auto w-full px-5">
        <div className="mx-auto max-w-2xl text-center mb-16">
          <motion.span 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            className="text-xs font-medium uppercase tracking-[0.2em] text-[#a3e635] inline-block"
          >
            Stunning Results
          </motion.span>
          <RevealText
            as="h2"
            text="Luxury fashion catalog outputs."
            className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl"
          />
        </div>

        <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4">
          {images.map((src, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.5, delay: (i % 3) * 0.1 }}
              className="group relative overflow-hidden rounded-xl border border-white/10 bg-black break-inside-avoid"
            >
              <img 
                src={src} 
                alt="AI Generated Fashion Model" 
                className="w-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-80 group-hover:opacity-100"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
