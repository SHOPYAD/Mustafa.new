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
  Star,
  LayoutDashboard,
} from "lucide-react";

import { dashboardCopy } from "@/components/admin/dashboard/copy";
import { DashboardCharts } from "@/components/admin/dashboard/DashboardCharts";
import { DashboardCommerce } from "@/components/admin/dashboard/DashboardCommerce";
import { KpiSparkCard } from "@/components/admin/dashboard/DashboardKpis";
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
import AdminExecutiveCopilot from "@/components/admin/dashboard/AdminExecutiveCopilot";
import { AdminPage, AdminPageHeader } from "@/components/admin/layout";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
    <div className="flex flex-col gap-6" data-slot="dashboard-skeleton">
      <div className="grid grid-cols-2 gap-3 xl:grid-cols-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-36 rounded-xl" />
        ))}
      </div>
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <Skeleton className="h-80 rounded-xl" />
        <Skeleton className="h-80 rounded-xl" />
      </div>
      <Skeleton className="h-64 rounded-xl" />
    </div>
  );
}

export function AdminStatsDashboard({ statsEndpoint = "/api/admin/dashboard-stats" }: { statsEndpoint?: string } = {}) {
  const { locale } = useLocale();
  const copy = dashboardCopy(locale);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [error, setError] = useState("");
  const [range, setRange] = useState<7 | 14>(14);
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
        const res = await fetch(statsEndpoint, {
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
  }, [copy.loadFailed, statsEndpoint]);

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

  const showCopilot = !statsEndpoint?.includes("/preview");

  const inventory = [
    { label: copy.hotels, value: catalog.hotels, sub: `${catalog.hotelsActive} ${copy.active}`, href: "/admin/hotels" },
    { label: copy.flights, value: catalog.flights, sub: `${catalog.flightsActive} ${copy.active}`, href: "/admin/flights" },
    { label: copy.packages, value: catalog.packages, sub: `${catalog.packagesFeatured} ${copy.featured}`, href: "/admin/packages" },
    { label: copy.tours, value: catalog.tours, sub: `${catalog.toursActive} ${copy.active}`, href: "/admin/tours" },
    { label: copy.transfers, value: catalog.transfers, sub: `${catalog.transfersActive} ${copy.active}`, href: "/admin/transfers" },
    { label: copy.cars, value: stats?.services.cars.total ?? 0, sub: `${stats?.services.cars.active ?? 0} ${copy.active}`, href: "/admin/cars" },
    { label: copy.visa, value: catalog.visa, sub: `${catalog.visaActive} ${copy.active}`, href: "/admin/visa" },
    { label: copy.posts, value: catalog.posts, sub: `${catalog.postsPublished} ${copy.published}`, href: "/admin/blog" },
  ];

  return (
    <AdminPage className="flex flex-col gap-6" dir="rtl" data-enterprise-dashboard="">
      {showCopilot ? <AdminExecutiveCopilot /> : null}

      <AdminPageHeader
        breadcrumb={
          <span>
            لوحة التحكم <span className="mx-1 opacity-50">/</span> نظرة عامة
          </span>
        }
        icon={<LayoutDashboard className="size-5" />}
        title={copy.title}
        description={copy.subtitle}
        actions={
          <div className="flex flex-wrap items-center justify-end gap-2">
            <Badge variant="outline" className="gap-1.5">
              <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
              {copy.live}
            </Badge>
            {stats ? (
              <Badge variant={stats.pocketbase ? "secondary" : "outline"}>
                {stats.pocketbase ? copy.pocketbaseOn : copy.pocketbaseOff}
              </Badge>
            ) : null}
            <Tabs
              value={String(range)}
              onValueChange={(v) => setRange(v === "7" ? 7 : 14)}
            >
              <TabsList>
                <TabsTrigger value="7">7d</TabsTrigger>
                <TabsTrigger value="14">14d</TabsTrigger>
              </TabsList>
            </Tabs>
            {stats ? (
              <p className="text-[11px] text-muted-foreground">
                {copy.generatedAt}: {formatWhen(stats.generatedAt, locale)}
              </p>
            ) : null}
          </div>
        }
      />

      {error ? (
        <Alert variant="destructive">
          <AlertTitle>{copy.loadFailed}</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

      {!error && !stats ? <DashboardSkeleton /> : null}

      {stats ? (
        <>
          {!stats.pocketbase && (
            <Alert>
              <AlertTitle>{copy.pocketbaseOff}</AlertTitle>
              <AlertDescription>
                <Link href="/admin/pocketbase" className="underline underline-offset-4">
                  {copy.pocketbaseOn}
                </Link>
              </AlertDescription>
            </Alert>
          )}

          <section
            className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6"
            data-slot="kpi-strip"
          >
            <KpiSparkCard
              title={copy.bookings}
              raw={stats.bookings.total}
              hint={`${formatInt(stats.bookings.enquiries, locale)} ${copy.enquiries} · ${formatInt(stats.bookings.hotelBookings, locale)} ${copy.hotelBookings}`}
              href="/admin/bookings"
              icon={Inbox}
              series={stats.bookings.last14Days.slice(-range)}
              locale={locale}
            />
            <KpiSparkCard
              title={copy.payments}
              raw={stats.payments.records}
              href="/admin/payments"
              icon={CreditCard}
              hint={paymentHint}
              locale={locale}
            />
            <KpiSparkCard
              title={copy.customers}
              raw={stats.customers.total}
              href="/admin/customers"
              icon={Users}
              hint={copy.customers}
              locale={locale}
            />
            <KpiSparkCard
              title={copy.services}
              raw={servicesTotal}
              href="/admin/hotels"
              icon={Layers}
              hint={`${copy.hotels}: ${formatInt(catalog.hotels, locale)} · ${copy.ownedHotels}: ${formatInt(stats.services.ownedHotels, locale)}`}
              locale={locale}
            />
            <KpiSparkCard
              title={copy.visits}
              raw={stats.traffic.total}
              href="/admin"
              icon={Eye}
              hint={`${copy.uniqueSessions}: ${formatInt(stats.traffic.uniqueSessions, locale)}`}
              series={stats.traffic.last14Days.slice(-range)}
              locale={locale}
            />
            <KpiSparkCard
              title={copy.gemini}
              raw={stats.gemini.freeCount + stats.gemini.paidCount}
              href="/admin/ai-settings"
              icon={Sparkles}
              hint={`${copy.geminiFree}: ${formatInt(stats.gemini.freeCount, locale)}`}
              locale={locale}
            />
          </section>

          <DashboardCharts
            locale={locale}
            copy={copy}
            bookingsDays={stats.bookings.last14Days.slice(-range)}
            bookingsByType={stats.bookings.byType}
            payments={[
              { key: "paid", count: stats.payments.paid },
              { key: "pending", count: stats.payments.pending },
              { key: "refunded", count: stats.payments.refunded },
              { key: "other", count: stats.payments.other },
            ]}
          />

          <section className="grid grid-cols-1 gap-4 xl:grid-cols-12" data-slot="ops-modules">
            <Card className="xl:col-span-7">
              <CardHeader className="flex-row items-start justify-between gap-3">
                <div>
                  <CardTitle>{copy.services}</CardTitle>
                  <CardDescription>المخزون التشغيلي للمنصة — الأرقام من الكتالوج الحي</CardDescription>
                </div>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/admin/hotels">{copy.hotels}</Link>
                </Button>
              </CardHeader>
              <CardContent className="px-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>القسم</TableHead>
                      <TableHead>الحالة</TableHead>
                      <TableHead className="text-end">العدد</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {inventory.map((row) => (
                      <TableRow key={row.href}>
                        <TableCell>
                          <Link href={row.href} className="font-medium hover:underline">
                            {row.label}
                          </Link>
                        </TableCell>
                        <TableCell className="text-muted-foreground">{row.sub}</TableCell>
                        <TableCell className="text-end tabular-nums font-semibold">
                          {formatInt(row.value, locale)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <div className="min-w-0 xl:col-span-5">
              <DashboardTraffic stats={stats} copy={copy} locale={locale} />
            </div>
          </section>

          <DashboardCommerce stats={stats} copy={copy} locale={locale} />

          <section className="grid grid-cols-1 gap-4 lg:grid-cols-2" data-slot="ops-shortcuts">
            <Card>
              <CardHeader className="flex-row items-center justify-between">
                <div>
                  <CardTitle>تقييمات العملاء</CardTitle>
                  <CardDescription>مراجعات المنصة وTripAdvisor</CardDescription>
                </div>
                <Star className="size-5 text-secondary" />
              </CardHeader>
              <CardContent>
                <Button asChild>
                  <Link href="/admin/reviews">فتح المراجعات</Link>
                </Button>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex-row items-center justify-between">
                <div>
                  <CardTitle>{copy.recentBookings}</CardTitle>
                  <CardDescription>سجل الحجوزات التشغيلي</CardDescription>
                </div>
                <Inbox className="size-5 text-secondary" />
              </CardHeader>
              <CardContent>
                <Button variant="secondary" asChild>
                  <Link href="/admin/bookings">{copy.bookings}</Link>
                </Button>
              </CardContent>
            </Card>
          </section>

          <DashboardQuotas stats={stats} copy={copy} locale={locale} />

          <Card data-slot="bookings-ledger">
            <CardHeader className="flex-row items-end justify-between gap-3">
              <div>
                <CardTitle>{copy.recentBookings}</CardTitle>
                <CardDescription>آخر الحركات من واجهة الإحصاءات — بدون أرقام مخترعة</CardDescription>
              </div>
              <Button variant="outline" size="sm" asChild>
                <Link href="/admin/bookings">{copy.bookings}</Link>
              </Button>
            </CardHeader>
            <CardContent className="px-0">
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
        </>
      ) : null}
    </AdminPage>
  );
}
