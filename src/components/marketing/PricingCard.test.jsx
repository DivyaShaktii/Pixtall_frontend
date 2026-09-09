import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { beforeAll, expect, it, vi } from "vitest";
import { PricingCard } from "./PricingCard";

beforeAll(() => {
  globalThis.IntersectionObserver = class IntersectionObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
});

const plan = {
  id: "creator",
  name: "Creator",
  price: "$15.99",
  billingPeriod: "/month",
  credits: 1000,
  creditUsage: { standard: 4, premium: 10 },
  maxImages: { standard: 250, premium: 100 },
  highlight: false,
  cta: "Buy Creator Plan",
};

it("renders an unmistakable primary action for every pricing card", () => {
  const onStart = vi.fn();
  render(<PricingCard plan={plan} index={0} onStart={onStart} />);

  const button = screen.getByRole("button", { name: "Buy Creator Plan" });
  expect(button).toHaveClass("!bg-[#84cc16]", "border-accent", "min-h-11");

  fireEvent.click(button);
  expect(onStart).toHaveBeenCalledWith("creator");
});
