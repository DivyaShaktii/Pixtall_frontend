import React from 'react';
import { RevealText } from './RevealText';
import { plans } from '../../data/pricingData';
import { PricingCard } from './PricingCard';
import { PricingTable } from './PricingTable';

export function Pricing({ onStart }) {
  return (
    <section id="pricing" className="relative w-full py-32 z-10">
      <div className="mx-auto w-full px-5 max-w-[1500px]">
        <div className="mx-auto max-w-2xl text-center mb-20">
          <RevealText
            as="h2"
            text="Flexible Pricing for Every Creator"
            className="text-3xl font-semibold tracking-tight text-white sm:text-4xl"
          />
          <RevealText
            as="p"
            delay={0.2}
            text="Whether you're generating a few product images or managing thousands every month, Pixtall scales with your business. Only pay for what you need."
            className="mt-4 text-neutral-400 leading-relaxed"
          />
        </div>

        {/* Pricing Cards Grid */}
        <div 
          className="flex flex-nowrap overflow-x-auto pb-8 snap-x snap-mandatory items-stretch gap-10 xl:justify-center xl:overflow-x-visible"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          <style>{`
            .flex-nowrap::-webkit-scrollbar { display: none; }
          `}</style>
          {plans.map((plan, i) => (
            <div 
              key={plan.id}
              className="flex-none w-[85vw] md:w-[350px] xl:flex-1 xl:w-auto xl:max-w-[320px] snap-center flex flex-col"
            >
              <PricingCard plan={plan} index={i} onStart={onStart} />
            </div>
          ))}
        </div>

        {/* Comparison Table */}
        <PricingTable />
      </div>
    </section>
  );
}
