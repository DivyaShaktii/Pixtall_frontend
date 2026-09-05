import { beforeEach, describe, expect, it, vi } from "vitest";
import { openRazorpayCheckout } from "./razorpay";

describe("Razorpay checkout adapter", () => {
  let capturedOptions;
  let open;

  beforeEach(() => {
    capturedOptions = null;
    open = vi.fn();
    window.Razorpay = function Razorpay(options) {
      capturedOptions = options;
      return { open, on: vi.fn() };
    };
  });

  it("uses the server-created order and does not invent an amount", async () => {
    await openRazorpayCheckout({
      checkout: {
        key_id: "rzp_test_key",
        name: "Pixtall by AI Vatika",
        description: "Pay as You Go",
        currency: "INR",
        amount: 49900,
        order_id: "order_123",
        prefill_email: "person@example.com",
      },
      onSuccess: vi.fn(),
      onDismiss: vi.fn(),
    });

    expect(capturedOptions.order_id).toBe("order_123");
    expect(capturedOptions.amount).toBe(49900);
    expect(capturedOptions.subscription_id).toBeUndefined();
    expect(open).toHaveBeenCalledOnce();
  });

  it("passes a provider subscription id for monthly plans", async () => {
    await openRazorpayCheckout({
      checkout: {
        key_id: "rzp_test_key",
        name: "Pixtall by AI Vatika",
        description: "Pro",
        currency: "INR",
        subscription_id: "sub_123",
      },
      onSuccess: vi.fn(),
      onDismiss: vi.fn(),
    });

    expect(capturedOptions.subscription_id).toBe("sub_123");
    expect(capturedOptions.order_id).toBeUndefined();
    expect(capturedOptions.amount).toBeUndefined();
  });
});
