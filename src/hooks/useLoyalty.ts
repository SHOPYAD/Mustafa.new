"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { LoyaltyService, LoyaltySettings } from "@/lib/loyalty/types";

export type PublicCoupon = {
  id: string;
  code: string;
  service: LoyaltyService;
  discountType: "percent" | "fixed";
  discountValue: number;
  currency: string;
  newUserOnly: boolean;
  firstBookingOnly: boolean;
  minBookingAmount: number;
  minBookingCurrency: string;
  title: string;
  description: string;
};

type PublicPayload = {
  ok?: boolean;
  settings?: Pick<
    LoyaltySettings,
    "enabled" | "pointsPerUsd" | "pointsPerUsdByService" | "pointsPerUsdRedeem"
  >;
  coupons?: PublicCoupon[];
  appliedCode?: string;
};

const cache = new Map<string, PublicPayload>();

export function useLoyalty(service: LoyaltyService, locale: string) {
  const [data, setData] = useState<PublicPayload>(() => cache.get(`${service}:${locale}`) || {});
  const [appliedCode, setAppliedCode] = useState(data.appliedCode || "");

  const reload = useCallback(() => {
    const key = `${service}:${locale}`;
    void fetch(`/api/loyalty/public?service=${service}&locale=${locale}`, { cache: "no-store" })
      .then((r) => r.json())
      .then((json: PublicPayload) => {
        cache.set(key, json);
        setData(json);
        setAppliedCode(json.appliedCode || "");
      })
      .catch(() => undefined);
  }, [service, locale]);

  useEffect(() => {
    reload();
  }, [reload]);

  const applyCode = useCallback(
    async (code: string) => {
      const res = await fetch("/api/loyalty/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, service }),
      });
      const json = (await res.json()) as { ok?: boolean; applied?: string; error?: string };
      if (res.ok && json.ok) {
        setAppliedCode(json.applied || code);
        cache.clear();
        return { ok: true as const };
      }
      return { ok: false as const, error: json.error || "failed" };
    },
    [service]
  );

  const clearCode = useCallback(async () => {
    await fetch("/api/loyalty/apply", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ clear: true }),
    });
    setAppliedCode("");
    cache.clear();
  }, []);

  const settings = data.settings;
  const coupons = useMemo(() => data.coupons || [], [data.coupons]);

  return { settings, coupons, appliedCode, applyCode, clearCode, reload };
}

export function earnPointsFor(
  settings: PublicPayload["settings"] | undefined,
  amountUsd: number,
  service: LoyaltyService
): { points: number; usd: number } {
  if (!settings?.enabled || !(amountUsd > 0)) return { points: 0, usd: 0 };
  const rate =
    service !== "all" && settings.pointsPerUsdByService?.[service] != null
      ? settings.pointsPerUsdByService[service] || 0
      : settings.pointsPerUsd;
  const points = Math.max(0, Math.round(amountUsd * rate));
  const redeem = settings.pointsPerUsdRedeem > 0 ? settings.pointsPerUsdRedeem : 100;
  return { points, usd: Math.round((points / redeem) * 100) / 100 };
}
