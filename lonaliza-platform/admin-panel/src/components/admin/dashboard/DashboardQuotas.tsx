"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type { DashboardCopy } from "@/components/admin/dashboard/copy";
import { formatInt } from "@/components/admin/dashboard/labels";
import type { Locale } from "@/lib/i18n/types";
import type { DashboardQuotaSnap, DashboardStats } from "@/types/dashboard-stats";

function usedPct(used: number, limit: number): number {
  if (!limit || limit <= 0) return 0;
  return Math.min(100, (used / limit) * 100);
}

function remainingPct(snap: DashboardQuotaSnap): number | null {
  if (snap.headerLimit != null && snap.headerLimit > 0 && snap.headerRemaining != null) {
    return Math.min(100, (snap.headerRemaining / snap.headerLimit) * 100);
  }
  return null;
}

function ProviderRow({
  title,
  snap,
  copy,
  locale,
}: {
  title: string;
  snap: DashboardQuotaSnap;
  copy: DashboardCopy;
  locale: Locale;
}) {
  const remain = remainingPct(snap);
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-medium">{title}</p>
        {snap.changeKey ? (
          <Badge variant="destructive">{copy.quotaWarn}</Badge>
        ) : (
          <Badge variant="outline">{snap.monthKey}</Badge>
        )}
      </div>
      {remain == null ? (
        <>
          <Progress value={0} />
          <p className="text-xs text-muted-foreground">{copy.limitUnknown}</p>
        </>
      ) : (
        <Progress value={remain} />
      )}
      <p className="text-xs text-muted-foreground">
        {copy.liveCalls}: {formatInt(snap.liveCalls, locale)}
        {" · "}
        {copy.remaining}:{" "}
        {snap.headerRemaining != null
          ? formatInt(snap.headerRemaining, locale)
          : "—"}
        {snap.headerLimit != null ? ` / ${formatInt(snap.headerLimit, locale)}` : ""}
        {snap.quota429 > 0 ? ` · 429 × ${formatInt(snap.quota429, locale)}` : ""}
      </p>
    </div>
  );
}

export function DashboardQuotas({
  stats,
  copy,
  locale,
}: {
  stats: DashboardStats;
  copy: DashboardCopy;
  locale: Locale;
}) {
  const { gemini, providers } = stats;
  const freePct = usedPct(gemini.freeCount, gemini.freeLimit);
  const paidPct = usedPct(gemini.paidCount, gemini.paidLimit);

  return (
    <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>{copy.gemini}</CardTitle>
          <CardDescription>
            {copy.geminiToday} · {gemini.date}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between text-sm">
              <span>{copy.geminiFree}</span>
              <span className="tabular-nums">
                {formatInt(gemini.freeCount, locale)} / {formatInt(gemini.freeLimit, locale)}
              </span>
            </div>
            <Progress value={freePct} />
          </div>
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between text-sm">
              <span>{copy.geminiPaid}</span>
              <span className="tabular-nums">
                {formatInt(gemini.paidCount, locale)} / {formatInt(gemini.paidLimit, locale)}
              </span>
            </div>
            <Progress value={paidPct} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{copy.providers}</CardTitle>
          <CardDescription>{copy.liveCalls}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-5">
          <ProviderRow
            title={copy.hotelsProvider}
            snap={providers.booking}
            copy={copy}
            locale={locale}
          />
          <ProviderRow
            title={copy.advisorProvider}
            snap={providers.travel_advisor}
            copy={copy}
            locale={locale}
          />
          <ProviderRow
            title={copy.flightsProvider}
            snap={providers.sky_scrapper}
            copy={copy}
            locale={locale}
          />
        </CardContent>
      </Card>
    </div>
  );
}
