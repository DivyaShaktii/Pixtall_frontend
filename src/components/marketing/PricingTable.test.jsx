import React from 'react';
import { fireEvent, render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { plans } from '../../data/pricingData';
import { PricingTable } from './PricingTable';

const displayPlans = plans.map(plan => ({ ...plan, price: plan.priceUSD }));

describe('PricingTable', () => {
  it('offers a no-scroll two-plan comparison for compact layouts', () => {
    render(<PricingTable plans={displayPlans} />);

    const comparison = screen.getByTestId('mobile-plan-comparison');
    expect(comparison).toHaveTextContent('Choose any two plans');
    expect(screen.getByLabelText('Plan one')).toHaveValue('creator');
    expect(screen.getByLabelText('Plan two')).toHaveValue('pro');
    expect(within(comparison).getByText('Total Credits')).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText('Plan one'), { target: { value: 'payg' } });
    expect(screen.getByLabelText('Plan one')).toHaveValue('payg');
    expect(within(comparison).getByText('420')).toBeInTheDocument();
  });

  it('keeps the complete comparison table available on desktop', () => {
    const { container } = render(<PricingTable plans={displayPlans} />);
    const table = container.querySelector('table');

    expect(table).toBeInTheDocument();
    expect(within(table).getByText('Pay as You Go')).toBeInTheDocument();
    expect(within(table).getByText('Business')).toBeInTheDocument();
  });
});
