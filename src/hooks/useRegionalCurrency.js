import { useEffect, useState } from "react";
import { getRegionalCurrency, isSupportedCurrency } from "../lib/regionalPricing";

export const useRegionalCurrency = initialCurrency => {
  const [currency, setCurrency] = useState(
    isSupportedCurrency(initialCurrency) ? initialCurrency : null,
  );

  useEffect(() => {
    if (currency) return undefined;
    let active = true;
    getRegionalCurrency().then(detectedCurrency => {
      if (active) setCurrency(detectedCurrency);
    });
    return () => { active = false; };
  }, [currency]);

  return { currency, currencyLoading: !currency };
};
