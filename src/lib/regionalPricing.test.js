import { afterEach, describe, expect, it, vi } from "vitest";
import { formatPrice, planPrice } from "./regionalPricing";

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe("regional pricing", () => {
  const plan = { final_price_paise: 49_900, final_price_usd_cents: 999 };

  it("formats Indian prices in rupees", () => {
    expect(formatPrice(planPrice(plan, "INR"), "INR")).toBe("₹499");
  });

  it("formats global prices in US dollars", () => {
    expect(formatPrice(planPrice(plan, "USD"), "USD")).toBe("$9.99");
  });

  it("uses INR when the visitor IP resolves to India", async () => {
    vi.resetModules();
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ country: "IN" }),
    }));
    const { getRegionalCurrency } = await import("./regionalPricing");

    await expect(getRegionalCurrency()).resolves.toBe("INR");
  });

  it("uses USD when the visitor IP resolves outside India", async () => {
    vi.resetModules();
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ country: "US" }),
    }));
    const { getRegionalCurrency } = await import("./regionalPricing");

    await expect(getRegionalCurrency()).resolves.toBe("USD");
  });
});
