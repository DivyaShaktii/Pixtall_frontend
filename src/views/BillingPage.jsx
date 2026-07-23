import React from 'react';
import { CreditCard, Receipt, CaretRight, Sparkle, Lightning } from "@phosphor-icons/react";

const BillingPage = () => {
  return (
    <div className="flex flex-col gap-10">
      <div>
        <h1 className="text-3xl font-bold text-ink mb-2 tracking-tight">Billing</h1>
        <p className="text-slate">Manage your subscription, credits, and payment methods.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="col-span-1 flex flex-col gap-2">
          <h2 className="font-semibold text-lg text-ink">Current Plan</h2>
          <p className="text-sm text-slate">You are currently on the Pro plan.</p>
        </div>
        <div className="col-span-1 lg:col-span-2">
          <div className="bg-paper border border-accent/30 rounded-2xl p-6 shadow-sm flex flex-col gap-6 relative overflow-hidden">
            {/* Subtle lime glow for active plan */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 rounded-full blur-3xl pointer-events-none" />
            
            <div className="flex justify-between items-start z-10">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent-soft text-accent text-xs font-bold mb-3 uppercase tracking-wider">
                  <Sparkle weight="fill" size={14} /> Active Plan
                </div>
                <h3 className="font-bold text-2xl text-ink">Pro Plan</h3>
                <p className="text-slate mt-1">$29/month &middot; Renews Aug 24, 2026</p>
              </div>
              <button className="border border-line bg-cloud hover:bg-cloud-2 transition-colors px-4 py-2 rounded-lg font-medium text-sm text-ink">
                Change Plan
              </button>
            </div>
            
            <div className="bg-cloud rounded-xl p-5 border border-line flex flex-col gap-3 z-10">
              <div className="flex justify-between text-sm">
                <span className="font-medium text-ink flex items-center gap-2"><Lightning size={16} className="text-accent" /> Credits Used</span>
                <span className="text-slate"><strong className="text-ink">4</strong> / 10</span>
              </div>
              <div className="w-full h-2 bg-cloud-2 rounded-full overflow-hidden">
                <div className="h-full bg-accent rounded-full" style={{ width: "40%" }} />
              </div>
              <p className="text-xs text-slate mt-1">Need more? <a href="#" className="text-accent hover:underline">Buy extra credits</a></p>
            </div>
          </div>
        </div>
      </div>

      <div className="h-px w-full bg-line" />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="col-span-1 flex flex-col gap-2">
          <h2 className="font-semibold text-lg text-ink">Payment Method</h2>
          <p className="text-sm text-slate">Update your billing details and cards.</p>
        </div>
        <div className="col-span-1 lg:col-span-2">
          <div className="bg-paper border border-line rounded-2xl p-6 shadow-sm flex flex-col gap-4">
            <div className="flex items-center justify-between p-4 border border-line bg-cloud rounded-xl">
              <div className="flex items-center gap-4">
                <div className="w-12 h-8 bg-white rounded border border-line flex items-center justify-center text-black font-bold italic">
                  Visa
                </div>
                <div>
                  <h3 className="font-medium text-ink">Visa ending in 4242</h3>
                  <p className="text-xs text-slate">Expires 12/28</p>
                </div>
              </div>
              <span className="text-xs font-semibold px-2 py-1 bg-cloud-2 text-slate rounded uppercase">Default</span>
            </div>
            <button className="text-sm font-medium text-ink hover:text-accent transition-colors self-start flex items-center gap-1 mt-2">
              + Add new payment method
            </button>
          </div>
        </div>
      </div>

      <div className="h-px w-full bg-line" />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="col-span-1 flex flex-col gap-2">
          <h2 className="font-semibold text-lg text-ink">Invoice History</h2>
          <p className="text-sm text-slate">View and download past invoices.</p>
        </div>
        <div className="col-span-1 lg:col-span-2">
          <div className="bg-paper border border-line rounded-2xl overflow-hidden shadow-sm">
            <table className="w-full text-left text-sm">
              <thead className="bg-cloud text-slate border-b border-line">
                <tr>
                  <th className="px-6 py-4 font-medium">Date</th>
                  <th className="px-6 py-4 font-medium">Amount</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium text-right">Invoice</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line text-ink">
                {[
                  { date: "Jul 24, 2026", amount: "$29.00", status: "Paid" },
                  { date: "Jun 24, 2026", amount: "$29.00", status: "Paid" },
                  { date: "May 24, 2026", amount: "$29.00", status: "Paid" }
                ].map((inv, i) => (
                  <tr key={i} className="hover:bg-cloud/50 transition-colors">
                    <td className="px-6 py-4">{inv.date}</td>
                    <td className="px-6 py-4 font-medium">{inv.amount}</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2 py-1 rounded-md bg-success-soft text-success text-xs font-semibold">
                        {inv.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-slate hover:text-accent transition-colors p-2 rounded-lg hover:bg-cloud">
                        <Receipt size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      
    </div>
  );
};

export default BillingPage;
