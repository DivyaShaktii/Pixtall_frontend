import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle } from '@phosphor-icons/react';

const tiers = [
  {
    name: "Starter",
    price: "$49",
    description: "Perfect for independent brands and designers.",
    features: [
      "100 AI photo generations",
      "Standard models library",
      "720p outputs",
      "Email support"
    ]
  },
  {
    name: "Studio",
    price: "$199",
    description: "For scaling fashion houses and agencies.",
    highlight: true,
    features: [
      "Unlimited generations",
      "Premium exclusive models",
      "4K high-res outputs",
      "Priority rendering queue",
      "API access"
    ]
  }
];

export function Pricing({ onStart }) {
  return (
    <section id="pricing" className="relative w-full py-32 z-10">
      <div className="mx-auto max-w-[1200px] px-5">
        <div className="mx-auto max-w-2xl text-center mb-16">
          <h2 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            Simple, transparent pricing.
          </h2>
          <p className="mt-4 text-neutral-400">
            Scale your visual content without the overhead of physical photoshoots.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {tiers.map((tier, i) => (
            <motion.div
              key={tier.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className={`relative p-8 rounded-3xl border ${
                tier.highlight ? 'border-[#a3e635]/30 bg-[#a3e635]/5' : 'border-white/10 bg-white/[0.01]'
              } flex flex-col`}
            >
              {tier.highlight && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 px-3 py-1 rounded-full bg-[#a3e635] text-xs font-bold text-black uppercase tracking-wider">
                  Most Popular
                </div>
              )}
              <h3 className="text-xl font-medium text-white">{tier.name}</h3>
              <div className="mt-4 mb-2 flex items-baseline gap-2">
                <span className="text-4xl font-bold text-white">{tier.price}</span>
                <span className="text-sm text-neutral-500">/mo</span>
              </div>
              <p className="text-sm text-neutral-400 mb-8 pb-8 border-b border-white/10">
                {tier.description}
              </p>
              <ul className="space-y-4 mb-8 flex-1">
                {tier.features.map(f => (
                  <li key={f} className="flex items-start gap-3 text-sm text-neutral-300">
                    <CheckCircle className="h-5 w-5 text-[#a3e635] shrink-0" weight="fill" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <button 
                onClick={onStart}
                className={`w-full py-3 rounded-lg text-sm font-medium transition-colors ${
                  tier.highlight 
                    ? 'bg-[#a3e635] text-black hover:bg-[#b6ef5c]' 
                    : 'bg-white/5 text-white border border-white/10 hover:bg-white/10'
                }`}
              >
                Get Started
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
