const CHECKOUT_INTENT_KEY = "pixtall_checkout_intent";
const CHECKOUT_REQUEST_PREFIX = "pixtall_checkout_request:";
const SUPPORTED_CURRENCIES = new Set(["INR", "USD"]);

export const normalizePlanCode = value => value === "pay-as-you-go" ? "payg" : value;

export const saveCheckoutIntent = (planCode, currency) => {
  if (!planCode) return;
  sessionStorage.setItem(CHECKOUT_INTENT_KEY, JSON.stringify({
    planCode: normalizePlanCode(planCode),
    currency: SUPPORTED_CURRENCIES.has(currency) ? currency : null,
    returnPath: "/studio",
  }));
};

export const readCheckoutIntent = () => {
  try {
    const parsed = JSON.parse(sessionStorage.getItem(CHECKOUT_INTENT_KEY) || "null");
    return parsed?.planCode ? parsed : null;
  } catch {
    return null;
  }
};

export const clearCheckoutIntent = () => sessionStorage.removeItem(CHECKOUT_INTENT_KEY);

const checkoutStorageKey = (planCode, currency) => (
  `${CHECKOUT_REQUEST_PREFIX}${normalizePlanCode(planCode)}:${currency || "regional"}`
);

export const checkoutRequestKey = (planCode, currency) => {
  const key = checkoutStorageKey(planCode, currency);
  let value = sessionStorage.getItem(key);
  if (!value) {
    value = crypto.randomUUID();
    sessionStorage.setItem(key, value);
  }
  return value;
};

export const clearCheckoutRequestKey = (planCode, currency) => {
  if (planCode) sessionStorage.removeItem(checkoutStorageKey(planCode, currency));
};
