import React, { useEffect, useState } from 'react';
import { RevealText } from './RevealText';
import { plans } from '../../data/pricingData';
import { PricingCard } from './PricingCard';
import { PricingTable } from './PricingTable';
import { SYSTEM_API_BASE_URL } from '../../utils/apiConfig';

const toCardPlan = plan => ({
  id: plan.code,
  name: plan.name,
  price: new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(plan.final_price_paise / 100),
  billingPeriod: plan.recurring ? '/month' : 'one-time',
  credits: plan.included_credits,
  creditUsage: {
    standard: plan.standard_image_credits,
    premium: plan.premium_image_credits,
  },
  maxImages: {
    standard: Math.floor(plan.included_credits / plan.standard_image_credits),
    premium: Math.floor(plan.included_credits / plan.premium_image_credits),
  },
  commercialUse: true,
  highlight: plan.code === 'pro',
  badge: plan.code === 'pro' ? 'Most Popular' : undefined,
  cta: plan.code === 'payg' ? 'Buy Credits' : `Buy ${plan.name} Plan`,
  ctaPrimary: plan.code === 'pro',
});

export function Pricing({ onStart }) {
  const [displayPlans, setDisplayPlans] = useState(plans);

  useEffect(() => {
    let active = true;
    fetch(`${SYSTEM_API_BASE_URL}/v1/plans`)
      .then(response => response.ok ? response.json() : Promise.reject())
      .then(data => {
        if (active && Array.isArray(data) && data.length) setDisplayPlans(data.map(toCardPlan));
      })
      .catch(() => {});
    return () => { active = false; };
  }, []);

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
          {displayPlans.map((plan, i) => (
            <div 
              key={plan.id}
              className="flex-none w-[85vw] md:w-[350px] xl:flex-1 xl:w-auto xl:max-w-[320px] snap-center flex flex-col"
            >
              <PricingCard plan={plan} index={i} onStart={onStart} />
            </div>
          ))}
        </div>

        {/* Comparison Table */}
        <PricingTable plans={displayPlans} />
      </div>
    </section>
  );
}
