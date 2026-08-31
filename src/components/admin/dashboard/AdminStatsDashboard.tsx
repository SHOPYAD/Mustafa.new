"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  CreditCard,
  Eye,
  Inbox,
  Layers,
  Sparkles,
  Users,
} from "lucide-react";

import { dashboardCopy } from "@/components/admin/dashboard/copy";
import { DashboardCharts } from "@/components/admin/dashboard/DashboardCharts";
import { DashboardCommerce } from "@/components/admin/dashboard/DashboardCommerce";
import { KpiSparkCard, SectionTitle } from "@/components/admin/dashboard/DashboardKpis";
import { DashboardQuotas } from "@/components/admin/dashboard/DashboardQuotas";
import { DashboardTraffic } from "@/components/admin/dashboard/DashboardTraffic";
import {
  formatInt,
  formatMoney,
  formatWhen,
  statusLabel,
  statusVariant,
  typeLabel,
} from "@/components/admin/dashboard/labels";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getActiveFlights, getFlights } from "@/data/flights";
import { getPosts } from "@/data/blog";
import { getHotels } from "@/data/hotels";
import { getPackages } from "@/data/packages";
import { getTours } from "@/data/tours";
import { getTransfers } from "@/data/transfers";
import { getVisaData } from "@/data/visa";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import type { DashboardNamedCount, DashboardStats } from "@/types/dashboard-stats";

function DashboardSkeleton() {
  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-2 gap-3 xl:grid-cols-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-36 rounded-xl" />
        ))}
      </div>
      <Skeleton className="h-64 rounded-xl" />
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <Skeleton className="h-56 rounded-xl" />
        <Skeleton className="h-56 rounded-xl" />
        <Skeleton className="h-56 rounded-xl" />
      </div>
    </div>
  );
}

export function AdminStatsDashboard() {
  const { locale } = useLocale();
  const copy = dashboardCopy(locale);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [error, setError] = useState("");
  const [catalog, setCatalog] = useState({
    hotels: 0,
    hotelsActive: 0,
    flights: 0,
    flightsActive: 0,
    packages: 0,
    packagesFeatured: 0,
    tours: 0,
    toursActive: 0,
    transfers: 0,
    transfersActive: 0,
    visa: 0,
    visaActive: 0,
    posts: 0,
    postsPublished: 0,
  });

  useEffect(() => {
    const hotels = getHotels();
    const flights = getFlights();
    const packages = getPackages();
    const tours = getTours();
    const transfers = getTransfers();
    const visa = getVisaData();
    const posts = getPosts();
    setCatalog({
      hotels: hotels.length,
      hotelsActive: hotels.filter((h) => h.isActive).length,
      flights: flights.length,
      flightsActive: getActiveFlights().length,
      packages: packages.length,
      packagesFeatured: packages.filter((p) => p.isFeatured).length,
      tours: tours.length,
      toursActive: tours.filter((t) => t.isActive !== false).length,
      transfers: transfers.length,
      transfersActive: transfers.filter((t) => t.isActive).length,
      visa: visa.length,
      visaActive: visa.filter((v) => v.isActive !== false).length,
      posts: posts.length,
      postsPublished: posts.filter((p) => p.status === "published").length,
    });
  }, []);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const res = await fetch("/api/admin/dashboard-stats", {
          cache: "no-store",
          credentials: "same-origin",
        });
        const json = (await res.json()) as { ok?: boolean; stats?: DashboardStats };
        if (!res.ok || !json.stats) {
          throw new Error("bad_response");
        }
        if (!cancelled) setStats(json.stats);
      } catch {
        if (!cancelled) setError(copy.loadFailed);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [copy.loadFailed]);

  const serviceRows: DashboardNamedCount[] = useMemo(
    () => [
      { key: copy.hotels, count: catalog.hotels },
      { key: copy.flights, count: catalog.flights },
      { key: copy.packages, count: catalog.packages },
      { key: copy.tours, count: catalog.tours },
      { key: copy.transfers, count: catalog.transfers },
      { key: copy.cars, count: stats?.services.cars.total ?? 0 },
      { key: copy.visa, count: catalog.visa },
      { key: copy.pages, count: stats?.services.pages.total ?? 0 },
      { key: copy.posts, count: catalog.posts },
    ],
    [catalog, copy, stats]
  );

  const servicesTotal = serviceRows.reduce((sum, row) => sum + row.count, 0);

  const paymentHint = useMemo(() => {
    if (!stats?.payments.available) return copy.pocketbaseOff;
    const first = stats.payments.totalsByCurrency[0];
    if (!first) {
      return `${formatInt(stats.payments.paid, locale)} ${copy.paid}`;
    }
    return formatMoney(first.paid, first.currency, locale);
  }, [copy.paid, copy.pocketbaseOff, locale, stats]);

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTitle>{copy.loadFailed}</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (!stats) {
    return (
      <div className="flex flex-col gap-5">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{copy.title}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{copy.subtitle}</p>
        </div>
        <DashboardSkeleton />
      </div>
    );
  }

  const payMix: DashboardNamedCount[] = [
    { key: "paid", count: stats.payments.paid },
    { key: "pending", count: stats.payments.pending },
    { key: "refunded", count: stats.payments.refunded },
    { key: "other", count: stats.payments.other },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-heading">
            {copy.title}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">{copy.subtitle}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Badge className="bg-emerald-600 text-white hover:bg-emerald-600">{copy.live}</Badge>
          <Badge variant="outline">
            {stats.pocketbase ? copy.pocketbaseOn : copy.pocketbaseOff}
          </Badge>
          <span className="text-xs text-muted-foreground">
            {copy.generatedAt}: {formatWhen(stats.generatedAt, locale)}
          </span>
        </div>
      </div>

      {!stats.pocketbase && (
        <Alert>
          <AlertTitle>{copy.pocketbaseOff}</AlertTitle>
          <AlertDescription>
            <Link href="/admin/pocketbase">{copy.pocketbaseOn}</Link>
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-2 gap-3 xl:grid-cols-6">
        <KpiSparkCard
          title={copy.bookings}
          value={formatInt(stats.bookings.total, locale)}
          hint={`${formatInt(stats.bookings.enquiries, locale)} ${copy.enquiries} · ${formatInt(stats.bookings.hotelBookings, locale)} ${copy.hotelBookings}`}
          href="/admin/bookings"
          icon={Inbox}
          series={stats.bookings.last14Days}
          locale={locale}
        />
        <KpiSparkCard
          title={copy.customers}
          value={formatInt(stats.customers.total, locale)}
          href="/admin/customers"
          icon={Users}
          hint={copy.customers}
          locale={locale}
        />
        <KpiSparkCard
          title={copy.payments}
          value={formatInt(stats.payments.records, locale)}
          href="/admin/payments"
          icon={CreditCard}
          hint={paymentHint}
          locale={locale}
        />
        <KpiSparkCard
          title={copy.services}
          value={formatInt(servicesTotal, locale)}
          href="/admin/hotels"
          icon={Layers}
          hint={`${copy.hotels}: ${formatInt(catalog.hotels, locale)} · ${copy.ownedHotels}: ${formatInt(stats.services.ownedHotels, locale)}`}
          locale={locale}
        />
        <KpiSparkCard
          title={copy.visits}
          value={formatInt(stats.traffic.total, locale)}
          href="/admin"
          icon={Eye}
          hint={`${copy.uniqueSessions}: ${formatInt(stats.traffic.uniqueSessions, locale)}`}
          series={stats.traffic.last14Days}
          locale={locale}
        />
        <KpiSparkCard
          title={copy.gemini}
          value={`${formatInt(stats.gemini.freeCount + stats.gemini.paidCount, locale)}`}
          href="/admin/ai-settings"
          icon={Sparkles}
          hint={`${copy.geminiFree} ${formatInt(stats.gemini.freeCount, locale)}/${formatInt(stats.gemini.freeLimit, locale)}`}
          locale={locale}
        />
      </div>

      <div className="grid grid-cols-2 gap-2 md:grid-cols-4 xl:grid-cols-8">
        {[
          { label: copy.hotels, value: catalog.hotels, sub: `${catalog.hotelsActive} ${copy.active}`, href: "/admin/hotels" },
          { label: copy.flights, value: catalog.flights, sub: `${catalog.flightsActive} ${copy.active}`, href: "/admin/flights" },
          { label: copy.packages, value: catalog.packages, sub: `${catalog.packagesFeatured} ${copy.featured}`, href: "/admin/packages" },
          { label: copy.tours, value: catalog.tours, sub: `${catalog.toursActive} ${copy.active}`, href: "/admin/tours" },
          { label: copy.transfers, value: catalog.transfers, sub: `${catalog.transfersActive} ${copy.active}`, href: "/admin/transfers" },
          { label: copy.cars, value: stats.services.cars.total, sub: `${stats.services.cars.active} ${copy.active}`, href: "/admin/cars" },
          { label: copy.visa, value: catalog.visa, sub: `${catalog.visaActive} ${copy.active}`, href: "/admin/visa" },
          { label: copy.posts, value: catalog.posts, sub: `${catalog.postsPublished} ${copy.published}`, href: "/admin/blog" },
        ].map((row) => (
          <Link key={row.href} href={row.href}>
            <div className="rounded-xl border border-border bg-card px-3 py-2.5 transition-colors hover:border-emerald-500/40">
              <p className="text-[11px] text-muted-foreground">{row.label}</p>
              <p className="text-xl font-semibold tabular-nums text-heading">
                {formatInt(row.value, locale)}
              </p>
              <p className="text-[11px] text-muted-foreground">{row.sub}</p>
            </div>
          </Link>
        ))}
      </div>

      <DashboardCommerce stats={stats} copy={copy} locale={locale} />

      <DashboardCharts
        locale={locale}
        copy={copy}
        bookingsDays={stats.bookings.last14Days}
        bookingsByType={stats.bookings.byType}
        payments={payMix}
        services={serviceRows}
      />

      <DashboardQuotas stats={stats} copy={copy} locale={locale} />

      <Card>
        <CardHeader>
          <CardTitle>{copy.recentBookings}</CardTitle>
          <CardDescription>
            <Link href="/admin/bookings">{copy.bookings}</Link>
          </CardDescription>
        </CardHeader>
        <CardContent>
          {stats.bookings.recent.length === 0 ? (
            <Empty>
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <Inbox />
                </EmptyMedia>
                <EmptyTitle>{copy.noBookings}</EmptyTitle>
                <EmptyDescription>{copy.noBookingsHint}</EmptyDescription>
              </EmptyHeader>
            </Empty>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{copy.customer}</TableHead>
                  <TableHead>{copy.service}</TableHead>
                  <TableHead>{copy.status}</TableHead>
                  <TableHead>{copy.date}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stats.bookings.recent.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell className="font-medium">{row.name}</TableCell>
                    <TableCell>
                      <span className="flex flex-col gap-0.5">
                        <span>{row.service}</span>
                        <span className="text-xs text-muted-foreground">
                          {typeLabel(row.type, copy)}
                        </span>
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge variant={statusVariant(row.status)}>
                        {statusLabel(row.status, copy)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatWhen(row.createdAt, locale)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <SectionTitle title={copy.audience} hint={copy.visitSource} />
      <DashboardTraffic stats={stats} copy={copy} locale={locale} />
    </div>
  );
}
