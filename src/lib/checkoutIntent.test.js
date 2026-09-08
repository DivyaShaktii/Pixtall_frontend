import { beforeEach, describe, expect, it } from "vitest";
import {
  clearCheckoutIntent,
  clearCheckoutRequestKey,
  checkoutRequestKey,
  normalizePlanCode,
  readCheckoutIntent,
  saveCheckoutIntent,
} from "./checkoutIntent";

describe("checkout intent", () => {
  beforeEach(() => sessionStorage.clear());

  it("preserves a selected plan through an authentication redirect", () => {
    saveCheckoutIntent("pro", "USD");
    expect(readCheckoutIntent()).toEqual({ planCode: "pro", currency: "USD", returnPath: "/studio" });
  });

  it("normalizes the legacy pay-as-you-go slug and can be cleared", () => {
    expect(normalizePlanCode("pay-as-you-go")).toBe("payg");
    saveCheckoutIntent("pay-as-you-go");
    expect(readCheckoutIntent()?.planCode).toBe("payg");
    clearCheckoutIntent();
    expect(readCheckoutIntent()).toBeNull();
  });

  it("reuses the same idempotency key until checkout finishes", () => {
    const first = checkoutRequestKey("creator", "USD");
    expect(checkoutRequestKey("creator", "USD")).toBe(first);
    expect(checkoutRequestKey("creator", "INR")).not.toBe(first);
    clearCheckoutRequestKey("creator", "USD");
    expect(checkoutRequestKey("creator", "USD")).not.toBe(first);
  });
});
