export const INDIA_CURRENCY = "INR";
export const GLOBAL_CURRENCY = "USD";

const COUNTRY_ENDPOINT = "https://api.country.is/";
const COUNTRY_TIMEOUT_MS = 4_000;

let currencyPromise;

const PLAN_PRICES = {
  payg: { INR: 49_900, USD: 999 },
  creator: { INR: 99_900, USD: 1_599 },
  pro: { INR: 199_900, USD: 2_999 },
  business: { INR: 399_900, USD: 5_499 },
};

const requestCurrency = async () => {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), COUNTRY_TIMEOUT_MS);

  try {
    const response = await fetch(COUNTRY_ENDPOINT, {
      signal: controller.signal,
      credentials: "omit",
      referrerPolicy: "no-referrer",
    });
    if (!response.ok) throw new Error("Country lookup failed");
    const data = await response.json();
    return String(data?.country || "").toUpperCase() === "IN"
      ? INDIA_CURRENCY
      : GLOBAL_CURRENCY;
  } catch {
    return GLOBAL_CURRENCY;
  } finally {
    window.clearTimeout(timeout);
  }
};

export const getRegionalCurrency = () => {
  if (!currencyPromise) currencyPromise = requestCurrency();
  return currencyPromise;
};

export const isSupportedCurrency = value => (
  value === INDIA_CURRENCY || value === GLOBAL_CURRENCY
);

export const formatPrice = (amount, currency) => new Intl.NumberFormat(
  currency === INDIA_CURRENCY ? "en-IN" : "en-US",
  {
    style: "currency",
    currency,
    minimumFractionDigits: currency === INDIA_CURRENCY ? 0 : 2,
    maximumFractionDigits: currency === INDIA_CURRENCY ? 0 : 2,
  },
).format((amount || 0) / 100);

export const planPrice = (plan, currency) => {
  const backendPrice = currency === INDIA_CURRENCY
    ? plan.final_price_paise
    : plan.final_price_usd_cents;
  return backendPrice > 0 ? backendPrice : PLAN_PRICES[plan.code]?.[currency] || 0;
};
