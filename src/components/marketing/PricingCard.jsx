import React from 'react';
import { motion } from 'framer-motion';
import { 
  Check, 
  Coins, 
  Image as ImageIcon, 
  Sparkle, 
  Briefcase 
} from '@phosphor-icons/react';

export function PricingCard({ plan, index, onStart }) {
  const { 
    name, 
    price, 
    billingPeriod, 
    credits, 
    creditUsage, 
    maxImages, 
    highlight, 
    badge, 
    cta, 
    ctaPrimary 
  } = plan;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ y: -8, scale: 1.02 }}
      className={`group relative px-8 pt-10 pb-8 rounded-3xl border flex flex-col h-full bg-paper/50 backdrop-blur-md shadow-lg transition-all duration-300 ${
        highlight 
          ? 'border-accent/40 bg-accent/5 shadow-[0_8px_32px_-12px_rgba(132,204,22,0.2)] hover:border-accent/60 hover:bg-accent/10 hover:shadow-[0_8px_32px_-12px_rgba(132,204,22,0.5)]' 
          : 'border-white/10 hover:border-accent/40 hover:bg-white/5 hover:shadow-[0_8px_32px_-12px_rgba(132,204,22,0.4)]'
      }`}
    >
      {highlight && badge && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full bg-accent text-xs font-bold text-paper uppercase tracking-widest shadow-[0_0_15px_rgba(132,204,22,0.5)]">
          {badge}
        </div>
      )}

      {/* Plan Header */}
      <div className="mb-8">
        <h3 className="text-xl font-medium text-white mb-3">{name}</h3>
        <div className="flex items-baseline gap-2 mb-4">
          <span className="text-4xl font-bold text-white tracking-tight transition-all duration-300 group-hover:text-purple-400 group-hover:drop-shadow-[0_0_15px_rgba(192,132,252,0.8)]">{price}</span>
          <span className="text-sm text-slate">{billingPeriod}</span>
        </div>
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-sm font-medium text-white">
          <Coins className="text-accent w-4 h-4" weight="fill" />
          {credits.toLocaleString()} Credits
        </div>
      </div>

      <div className="w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent my-6" />

      {/* Credit Usage */}
      <div className="mb-8">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-slate mb-8">Credit Usage</h4>
        <ul className="space-y-4">
          <li className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-3 text-ink-2">
              <ImageIcon className="w-4 h-4 text-slate" />
              Standard Image
            </div>
            <span className="font-medium text-white">{creditUsage.standard} <span className="text-slate text-xs font-normal">cr</span></span>
          </li>
          <li className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-3 text-ink-2">
              <Sparkle className="w-4 h-4 text-accent" weight="fill" />
              Premium Image
            </div>
            <span className="font-medium text-white">{creditUsage.premium} <span className="text-slate text-xs font-normal">cr</span></span>
          </li>
        </ul>
      </div>

      <div className="w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent my-6" />

      {/* Included */}
      <div className="mb-10">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-slate mb-8">Included</h4>
        <ul className="space-y-4">
          <li className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-3 text-ink-2">
              <Check className="w-4 h-4 text-success shrink-0" weight="bold" />
              Standard Images
            </div>
            <span className="font-medium text-white">{maxImages.standard.toLocaleString()}</span>
          </li>
          <li className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-3 text-ink-2">
              <Check className="w-4 h-4 text-success shrink-0" weight="bold" />
              Premium Images
            </div>
            <span className="font-medium text-white">{maxImages.premium.toLocaleString()}</span>
          </li>
          <li className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-3 text-ink-2">
              <Check className="w-4 h-4 text-success shrink-0" weight="bold" />
              Commercial Usage
            </div>
            <Briefcase className="w-4 h-4 text-white" />
          </li>
        </ul>
      </div>

      {/* CTA Button */}
      <motion.button 
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => onStart?.(plan.id)}
        className={`w-full py-4 px-4 mt-auto rounded-xl text-sm font-semibold transition-all duration-200 flex items-center justify-center ${
          ctaPrimary
            ? 'bg-accent text-paper hover:bg-accent-ink shadow-[0_4px_14px_0_rgba(132,204,22,0.39)]' 
            : 'bg-white/5 text-white border border-white/10 hover:bg-white/10 hover:border-white/20'
        }`}
      >
        {cta}
      </motion.button>
    </motion.div>
  );
}
