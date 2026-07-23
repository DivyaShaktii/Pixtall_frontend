import React from 'react';
import { motion } from 'framer-motion';

const logos = ['Acne Studios', 'Balenciaga', 'Zara', 'H&M', 'Nike', 'Adidas'];

export function BrandStrip() {
  return (
    <section className="mx-auto mt-12 max-w-[1000px] px-5 mb-24 relative z-10">
      <p className="text-center text-xs uppercase tracking-[0.2em] text-neutral-600">
        Trusted by modern fashion brands
      </p>
      <div className="mt-6 flex flex-wrap items-center justify-center gap-x-12 gap-y-6 opacity-60 grayscale transition-opacity hover:opacity-100">
        {logos.map((logo) => (
          <span
            key={logo}
            className="text-lg font-medium tracking-tight text-neutral-400 transition-colors hover:text-white"
          >
            {logo}
          </span>
        ))}
      </div>
    </section>
  );
}
