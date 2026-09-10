import React, { useEffect, useMemo, useState } from 'react';
import { CaretDown, Check } from '@phosphor-icons/react';

const featureRows = [
  {
    label: 'Price',
    value: plan => (
      <>
        <span className="font-semibold text-white">{plan.price}</span>{' '}
        <span className="text-xs font-normal text-slate">{plan.billingPeriod}</span>
      </>
    ),
  },
  { label: 'Total Credits', value: plan => plan.credits.toLocaleString() },
  { label: 'Standard Image Cost', value: plan => `${plan.creditUsage.standard} cr` },
  { label: 'Premium Image Cost', value: plan => `${plan.creditUsage.premium} cr` },
  { label: 'Max Standard Images', value: plan => plan.maxImages.standard.toLocaleString() },
  { label: 'Max Premium Images', value: plan => plan.maxImages.premium.toLocaleString() },
  {
    label: 'Commercial Use',
    value: plan => plan.commercialUse ? (
      <span className="inline-flex items-center gap-1.5 text-white">
        <Check className="h-4 w-4 text-success" weight="bold" aria-hidden="true" />
        Included
      </span>
    ) : 'Not included',
  },
];

function PlanSelect({ id, label, value, plans, onChange }) {
  return (
    <label htmlFor={id} className="block min-w-0">
      <span className="mb-2 block text-xs font-medium uppercase tracking-[0.14em] text-slate">{label}</span>
      <span className="relative block">
        <select
          id={id}
          value={value}
          onChange={event => onChange(event.target.value)}
          className="h-12 w-full appearance-none rounded-xl bg-white/[0.06] px-3 pr-9 text-sm font-semibold text-white outline-none ring-1 ring-inset ring-white/10 transition focus:ring-2 focus:ring-accent"
        >
          {plans.map(plan => (
            <option key={plan.id} value={plan.id} className="bg-paper text-white">{plan.name}</option>
          ))}
        </select>
        <CaretDown
          className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate"
          weight="bold"
          aria-hidden="true"
        />
      </span>
    </label>
  );
}

function MobilePlanComparison({ plans }) {
  const defaultLeft = plans.find(plan => plan.id === 'creator')?.id ?? plans[0]?.id ?? '';
  const defaultRight = plans.find(plan => plan.highlight)?.id ?? plans[1]?.id ?? plans[0]?.id ?? '';
  const [leftPlanId, setLeftPlanId] = useState(defaultLeft);
  const [rightPlanId, setRightPlanId] = useState(defaultRight);

  useEffect(() => {
    if (!plans.some(plan => plan.id === leftPlanId)) setLeftPlanId(defaultLeft);
    if (!plans.some(plan => plan.id === rightPlanId)) setRightPlanId(defaultRight);
  }, [defaultLeft, defaultRight, leftPlanId, plans, rightPlanId]);

  const [leftPlan, rightPlan] = useMemo(() => [
    plans.find(plan => plan.id === leftPlanId) ?? plans[0],
    plans.find(plan => plan.id === rightPlanId) ?? plans[1] ?? plans[0],
  ], [leftPlanId, plans, rightPlanId]);

  if (!leftPlan || !rightPlan) return null;

  return (
    <div className="lg:hidden" data-testid="mobile-plan-comparison">
      <p className="mb-5 text-center text-sm leading-relaxed text-slate">
        Choose any two plans to compare them side by side.
      </p>

      <div className="grid grid-cols-2 gap-3">
        <PlanSelect id="compare-plan-one" label="Plan one" value={leftPlanId} plans={plans} onChange={setLeftPlanId} />
        <PlanSelect id="compare-plan-two" label="Plan two" value={rightPlanId} plans={plans} onChange={setRightPlanId} />
      </div>

      <div className="mt-6 overflow-hidden rounded-2xl bg-white/[0.035] ring-1 ring-inset ring-white/10">
        <div className="grid grid-cols-2 divide-x divide-white/10 border-b border-white/10 bg-white/[0.025]">
          {[leftPlan, rightPlan].map((plan, index) => (
            <div key={`${plan.id}-${index}`} className="min-w-0 px-3 py-4 text-center">
              <p className="truncate text-sm font-semibold text-white">{plan.name}</p>
              {plan.highlight && (
                <span className="mt-1.5 inline-flex rounded-md bg-accent/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-accent">
                  Most popular
                </span>
              )}
            </div>
          ))}
        </div>

        <dl className="divide-y divide-white/[0.07]">
          {featureRows.map(feature => (
            <div key={feature.label} className="px-3 py-4">
              <dt className="mb-2.5 text-center text-xs font-medium text-slate">{feature.label}</dt>
              <dd className="grid grid-cols-2 divide-x divide-white/10 text-center text-sm font-medium text-white">
                <span className="min-w-0 px-2">{feature.value(leftPlan)}</span>
                <span className="min-w-0 px-2">{feature.value(rightPlan)}</span>
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  );
}

function DesktopPlanTable({ plans }) {
  return (
    <div className="hidden lg:block">
      <table className="w-full table-fixed text-left text-base">
        <thead>
          <tr className="border-b border-white/10">
            <th className="w-[28%] px-8 py-6 text-lg font-medium text-slate">Features</th>
            {plans.map(plan => (
              <th key={plan.id} className="w-[18%] px-4 py-6 text-center text-lg font-semibold text-white">
                {plan.name}
                {plan.highlight && (
                  <span className="ml-2 inline-flex rounded bg-accent/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-accent">Pro</span>
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5">
          {featureRows.map((feature, rowIndex) => (
            <tr key={feature.label} className={`${rowIndex % 2 === 0 ? 'bg-white/[0.01]' : ''} transition-colors hover:bg-white/[0.02]`}>
              <td className="px-8 py-6 font-medium text-ink-2">{feature.label}</td>
              {plans.map(plan => (
                <td key={plan.id} className="px-4 py-6 text-center text-white">
                  <span className="inline-flex items-center justify-center">{feature.value(plan)}</span>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function PricingTable({ plans }) {
  return (
    <div className="mx-auto mt-24 w-full max-w-[1500px] sm:mt-32">
      <div className="mb-10 text-center sm:mb-16">
        <h3 className="text-3xl font-semibold tracking-tight text-white">Compare Plans</h3>
        <p className="mt-3 text-slate">Find the right fit for your generation volume.</p>
      </div>

      <MobilePlanComparison plans={plans} />
      <DesktopPlanTable plans={plans} />
    </div>
  );
}
