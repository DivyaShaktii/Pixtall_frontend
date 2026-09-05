let checkoutScriptPromise;

const loadCheckoutScript = () => {
  if (window.Razorpay) return Promise.resolve();
  if (checkoutScriptPromise) return checkoutScriptPromise;
  checkoutScriptPromise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = resolve;
    script.onerror = () => reject(new Error("Could not load Razorpay Checkout."));
    document.head.appendChild(script);
  });
  return checkoutScriptPromise;
};

export const openRazorpayCheckout = async ({ checkout, onSuccess, onDismiss }) => {
  await loadCheckoutScript();
  const options = {
    key: checkout.key_id,
    name: checkout.name,
    description: checkout.description,
    currency: checkout.currency,
    amount: checkout.amount || undefined,
    order_id: checkout.order_id || undefined,
    subscription_id: checkout.subscription_id || undefined,
    prefill: {
      name: checkout.prefill_name || undefined,
      email: checkout.prefill_email || undefined,
    },
    theme: { color: "#84cc16" },
    handler: onSuccess,
    modal: { ondismiss: onDismiss },
    retry: { enabled: true },
  };
  const instance = new window.Razorpay(options);
  instance.on("payment.failed", response => {
    const message = response?.error?.description || "Payment failed. Please try again.";
    onDismiss(message);
  });
  instance.open();
};
