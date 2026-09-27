import { convertAmount, normalizeCurrencyCode } from "@/lib/currency";
import { getCurrenciesSettings } from "@/lib/server/currencies-store";
import { getSpotRateSafe, getUsdRateTable } from "@/lib/server/iyzico-fx";
import type { AdminFxStatus, PublicFxCurrency, PublicFxPayload } from "@/types/currency";

export async function convertAmountSafe(
  amount: number,
  fromRaw: string,
  toRaw: string
): Promise<number> {
  const from = normalizeCurrencyCode(fromRaw) || "USD";
  const to = normalizeCurrencyCode(toRaw) || "USD";
  const n = Number(amount);
  if (!Number.isFinite(n)) return 0;
  if (from === to) return n;
  const spot = await getSpotRateSafe(from, to);
  return n * spot.rate;
}

export async function getPublicFx(): Promise<PublicFxPayload> {
  const settings = await getCurrenciesSettings();
  const table = await getUsdRateTable({ refresh: settings.liveFxEnabled });

  const enabled = settings.currencies.filter((c) => c.enabled);
  const list = enabled.length ? enabled : settings.currencies;
  const currencies: PublicFxCurrency[] = [];

  for (const row of list) {
    const rate = Number(table.rates[row.code]);
    currencies.push({
      ...row,
      rate: Number.isFinite(rate) && rate > 0 ? rate : row.code === "USD" ? 1 : 0,
    });
  }

  const missing = currencies.filter((c) => !(c.rate > 0));
  if (missing.length && settings.liveFxEnabled) {
    await Promise.all(
      missing.map(async (row) => {
        const spot = await getSpotRateSafe("USD", row.code);
        row.rate = spot.rate > 0 ? spot.rate : 0;
      })
    );
  }

  const usable = currencies.filter((c) => c.rate > 0);
  const fallback = usable.length ? usable : [{ ...list[0], rate: 1, enabled: true }];

  return {
    ok: true,
    base: "USD",
    defaultCode: settings.defaultCode,
    liveFxEnabled: settings.liveFxEnabled,
    currencies: fallback,
    source: table.source,
    at: table.at,
    stale: Boolean(table.stale),
    error: table.error,
  };
}

export async function getAdminFxStatus(): Promise<AdminFxStatus> {
  const settings = await getCurrenciesSettings();
  const table = await getUsdRateTable();
  const rates: Record<string, number> = { USD: 1 };
  for (const row of settings.currencies) {
    const n = Number(table.rates[row.code]);
    if (Number.isFinite(n) && n > 0) rates[row.code] = n;
  }
  const missingRates = settings.currencies
    .filter((row) => row.enabled && !(Number(rates[row.code]) > 0))
    .map((row) => row.code);
  if (missingRates.length && settings.liveFxEnabled) {
    await Promise.all(
      missingRates.map(async (code) => {
        const spot = await getSpotRateSafe("USD", code);
        if (spot.rate > 0 && spot.source !== "unavailable") rates[code] = spot.rate;
      })
    );
  }
  const stillMissing = settings.currencies
    .filter((row) => row.enabled && !(Number(rates[row.code]) > 0))
    .map((row) => row.code);
  return {
    liveFxEnabled: settings.liveFxEnabled,
    source: table.source,
    at: table.at,
    stale: Boolean(table.stale),
    error: table.error,
    rates,
    missingRates: stillMissing,
  };
}

export { convertAmount };
