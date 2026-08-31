"use client";

import { useCallback } from "react";
import { useCurrency } from "@/components/ui/CurrencySelector";

/** Format flight prices using the site currency selector and admin FX rates. */
export function useFlightPrice() {
  const { formatPrice, convert, currency } = useCurrency();

  const formatFlightPrice = useCallback(
    (amount: number, sourceCurrency = "USD") => formatPrice(amount, sourceCurrency),
    [formatPrice]
  );

  const convertFlightPrice = useCallback(
    (amount: number, sourceCurrency = "USD") => convert(amount, sourceCurrency),
    [convert]
  );

  return {
    currencyCode: currency.code,
    formatFlightPrice,
    convertFlightPrice,
  };
}
