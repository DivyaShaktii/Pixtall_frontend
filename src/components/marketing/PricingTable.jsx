import React from 'react';
import { motion } from 'framer-motion';
import { Check } from '@phosphor-icons/react';
import { plans } from '../../data/pricingData';

export function PricingTable() {
  return (
    <div className="mt-32 mx-auto w-full max-w-[1500px]">
      <div className="text-center mb-16">
        <h3 className="text-3xl font-semibold text-white tracking-tight">Compare Plans</h3>
        <p className="text-slate mt-3">Find the right fit for your generation volume.</p>
      </div>

      <div className="relative overflow-x-auto pb-4 custom-scrollbar">
        <div className="min-w-[1000px]">
          <table className="w-full text-left text-base">
            <thead>
              <tr className="border-b border-white/10">
                <th className="py-6 px-8 font-medium text-slate text-lg w-[28%] sticky left-0 bg-paper/90 backdrop-blur-md z-10">Features</th>
                {plans.map(plan => (
                  <th key={plan.id} className="py-6 px-8 font-semibold text-white text-center text-lg w-[18%]">
                    {plan.name}
                    {plan.highlight && (
                      <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-accent/20 text-accent uppercase tracking-wider">
                        Pro
                      </span>
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              <tr className="hover:bg-white/[0.02] transition-colors">
                <td className="py-6 px-8 font-medium text-ink-2 sticky left-0 bg-paper/90 backdrop-blur-md z-10">Price</td>
                {plans.map(plan => (
                  <td key={plan.id} className="py-6 px-8 text-white font-medium text-center">
                    {plan.price} <span className="text-slate text-sm font-normal">{plan.billingPeriod}</span>
                  </td>
                ))}
              </tr>
              <tr className="hover:bg-white/[0.02] transition-colors">
                <td className="py-6 px-8 font-medium text-ink-2 sticky left-0 bg-paper/90 backdrop-blur-md z-10">Total Credits</td>
                {plans.map(plan => (
                  <td key={plan.id} className="py-6 px-8 text-white text-center">
                    {plan.credits.toLocaleString()}
                  </td>
                ))}
              </tr>
              <tr className="hover:bg-white/[0.02] transition-colors bg-white/[0.01]">
                <td className="py-6 px-8 font-medium text-ink-2 sticky left-0 bg-paper/90 backdrop-blur-md z-10">Standard Image Cost</td>
                {plans.map(plan => (
                  <td key={plan.id} className="py-6 px-8 text-slate text-center">
                    {plan.creditUsage.standard} cr
                  </td>
                ))}
              </tr>
              <tr className="hover:bg-white/[0.02] transition-colors">
                <td className="py-6 px-8 font-medium text-ink-2 sticky left-0 bg-paper/90 backdrop-blur-md z-10">Premium Image Cost</td>
                {plans.map(plan => (
                  <td key={plan.id} className="py-6 px-8 text-slate text-center">
                    {plan.creditUsage.premium} cr
                  </td>
                ))}
              </tr>
              <tr className="hover:bg-white/[0.02] transition-colors bg-white/[0.01]">
                <td className="py-6 px-8 font-medium text-ink-2 sticky left-0 bg-paper/90 backdrop-blur-md z-10">Max Standard Images</td>
                {plans.map(plan => (
                  <td key={plan.id} className="py-6 px-8 text-white text-center">
                    {plan.maxImages.standard.toLocaleString()}
                  </td>
                ))}
              </tr>
              <tr className="hover:bg-white/[0.02] transition-colors">
                <td className="py-6 px-8 font-medium text-ink-2 sticky left-0 bg-paper/90 backdrop-blur-md z-10">Max Premium Images</td>
                {plans.map(plan => (
                  <td key={plan.id} className="py-6 px-8 text-white text-center">
                    {plan.maxImages.premium.toLocaleString()}
                  </td>
                ))}
              </tr>
              <tr className="hover:bg-white/[0.02] transition-colors bg-white/[0.01]">
                <td className="py-6 px-8 font-medium text-ink-2 sticky left-0 bg-paper/90 backdrop-blur-md z-10 rounded-bl-2xl">Commercial Use</td>
                {plans.map(plan => (
                  <td key={plan.id} className="py-6 px-8 text-white text-center align-middle">
                    {plan.commercialUse ? (
                      <Check className="w-5 h-5 text-success mx-auto" weight="bold" />
                    ) : (
                      <span className="text-slate">-</span>
                    )}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      
      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar {
          height: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.02);
          border-radius: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.2);
        }
      `}} />
    </div>
  );
}
