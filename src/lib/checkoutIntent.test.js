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
    saveCheckoutIntent("pro");
    expect(readCheckoutIntent()).toEqual({ planCode: "pro", returnPath: "/studio" });
  });

  it("normalizes the legacy pay-as-you-go slug and can be cleared", () => {
    expect(normalizePlanCode("pay-as-you-go")).toBe("payg");
    saveCheckoutIntent("pay-as-you-go");
    expect(readCheckoutIntent()?.planCode).toBe("payg");
    clearCheckoutIntent();
    expect(readCheckoutIntent()).toBeNull();
  });

  it("reuses the same idempotency key until checkout finishes", () => {
    const first = checkoutRequestKey("creator");
    expect(checkoutRequestKey("creator")).toBe(first);
    clearCheckoutRequestKey("creator");
    expect(checkoutRequestKey("creator")).not.toBe(first);
  });
});
