import React from 'react';
import { motion } from 'framer-motion';

const testimonials = [
  {
    quote: "This feels like having an entire fashion photography studio inside my laptop. The quality of the models and the preservation of fabric details is unmatched.",
    author: "Elena R.",
    role: "Creative Director, Lumina"
  },
  {
    quote: "We completely eliminated our studio costs for basic e-commerce shots. The workflow is incredibly intuitive and the outputs are instantly ready for production.",
    author: "Marcus T.",
    role: "Head of Digital, VESTURE"
  }
];

export function Testimonials() {
  return (
    <section id="testimonials" className="relative w-full py-32 z-10">
      <div className="mx-auto w-full px-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {testimonials.map((t, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="relative p-10 rounded-3xl border border-white/5 bg-white/[0.01] transition-colors hover:bg-white/[0.03]"
            >
              <div className="text-4xl text-[#a3e635]/40 font-serif mb-4">"</div>
              <p className="text-lg text-neutral-300 leading-relaxed mb-8">
                {t.quote}
              </p>
              <div>
                <p className="text-white font-medium">{t.author}</p>
                <p className="text-sm text-neutral-500">{t.role}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
