import { describe, expect, it } from "vitest";
import { formatPrice, planPrice } from "./regionalPricing";

describe("regional pricing", () => {
  const plan = { final_price_paise: 49_900, final_price_usd_cents: 999 };

  it("formats Indian prices in rupees", () => {
    expect(formatPrice(planPrice(plan, "INR"), "INR")).toBe("₹499");
  });

  it("formats global prices in US dollars", () => {
    expect(formatPrice(planPrice(plan, "USD"), "USD")).toBe("$9.99");
  });
});
