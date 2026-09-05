const CHECKOUT_INTENT_KEY = "pixtall_checkout_intent";
const CHECKOUT_REQUEST_PREFIX = "pixtall_checkout_request:";

export const normalizePlanCode = value => value === "pay-as-you-go" ? "payg" : value;

export const saveCheckoutIntent = planCode => {
  if (!planCode) return;
  sessionStorage.setItem(CHECKOUT_INTENT_KEY, JSON.stringify({
    planCode: normalizePlanCode(planCode),
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

export const checkoutRequestKey = planCode => {
  const key = `${CHECKOUT_REQUEST_PREFIX}${normalizePlanCode(planCode)}`;
  let value = sessionStorage.getItem(key);
  if (!value) {
    value = crypto.randomUUID();
    sessionStorage.setItem(key, value);
  }
  return value;
};

export const clearCheckoutRequestKey = planCode => {
  if (planCode) sessionStorage.removeItem(`${CHECKOUT_REQUEST_PREFIX}${normalizePlanCode(planCode)}`);
};
