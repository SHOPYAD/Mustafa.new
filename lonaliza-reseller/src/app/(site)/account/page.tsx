"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  Bookmark,
  Copy,
  Loader2,
  MessageCircle,
  Share2,
  UserRound,
  Wallet,
  Coins,
  Download,
  Check,
} from "lucide-react";
import AccountBookings from "@/components/account/AccountBookings";
import AccountShell, { isAccountTab, type AccountTab } from "@/components/account/AccountShell";
import { useCustomerAuth } from "@/components/auth/CustomerAuthProvider";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { cn, tContent } from "@/lib/utils";

function money(n: number) {
  return `$${Math.round((Number(n) || 0) * 100) / 100}`;
}

function AccountDashboard() {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const { user, loading, openAuth } = useCustomerAuth();
  const { t } = useLocale();
  const tabParam = params.get("tab");
  const [tab, setTab] = useState<AccountTab>(isAccountTab(tabParam) ? tabParam : "profile");

  useEffect(() => {
    if (isAccountTab(tabParam)) setTab(tabParam);
  }, [tabParam]);

  useEffect(() => {
    if (!loading && !user) openAuth("login");
  }, [loading, user, openAuth]);

  const changeTab = (next: AccountTab) => {
    setTab(next);
    router.replace(`${pathname}?tab=${next}`, { scroll: false });
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="mx-auto max-w-lg px-4 py-28">
        <div className="rounded-3xl border border-amber-200 bg-amber-50 p-8 text-center shadow-sm">
          <UserRound className="mx-auto mb-3 text-amber-700" />
          <h1 className="text-2xl font-bold text-slate-900">{t.account.title}</h1>
          <p className="mt-2 text-slate-600">{t.account.loginNotice}</p>
          <button
            type="button"
            onClick={() => openAuth("login")}
            className="mt-5 rounded-full bg-slate-900 px-6 py-3 text-sm font-bold text-white"
          >
            {t.account.loginCta}
          </button>
        </div>
      </div>
    );
  }

  return (
    <AccountShell
      tab={tab}
      onTabChange={changeTab}
      userName={user.name || t.account.title}
      userEmail={user.email || ""}
    >
      {tab === "profile" && <ProfileSection />}
      {tab === "chats" && <ChatsSection />}
      {tab === "programs" && <ProgramsSection />}
      {tab === "bookings" && <AccountBookings />}
      {tab === "affiliate" && <AffiliateSection />}
      {tab === "wallet" && (
        <div className="space-y-6">
          <LoyaltyWalletSection />
          <WalletSection />
        </div>
      )}
    </AccountShell>
  );
}

function Card({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-3xl border border-slate-100 bg-white p-6 shadow-sm",
        className
      )}
    >
      {children}
    </div>
  );
}

function ProfileSection() {
  const { t } = useLocale();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  useEffect(() => {
    void fetch("/api/account/profile", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => {
        if (d.profile) {
          setName(d.profile.name || "");
          setEmail(d.profile.email || "");
          setPhone(d.profile.phone || "");
        }
      });
  }, []);

  const save = async () => {
    setSaving(true);
    setMsg("");
    setErr("");
    try {
      const res = await fetch("/api/account/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setErr(t.account.profileFailed);
        return;
      }
      setMsg(t.account.profileSaved);
    } catch {
      setErr(t.account.profileFailed);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card>
      <h2 className="text-xl font-bold text-slate-900">{t.account.navProfile}</h2>
      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <label className="text-sm text-slate-600">
          {t.account.name}
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm"
          />
        </label>
        <label className="text-sm text-slate-600">
          {t.account.email}
          <input
            value={email}
            disabled
            className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm"
          />
        </label>
        <label className="text-sm text-slate-600 sm:col-span-2">
          {t.account.phone}
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm"
          />
        </label>
      </div>
      {msg ? <p className="mt-3 text-sm text-emerald-700">{msg}</p> : null}
      {err ? <p className="mt-3 text-sm text-red-600">{err}</p> : null}
      <button
        type="button"
        onClick={() => void save()}
        disabled={saving}
        className="mt-5 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-bold text-white disabled:opacity-60"
      >
        {saving ? <Loader2 size={16} className="animate-spin" /> : null}
        {t.account.saveProfile}
      </button>
    </Card>
  );
}

function ChatsSection() {
  const { t, locale } = useLocale();
  const [items, setItems] = useState<
    Array<{ id: string; title: string; preview: string; updated: string }>
  >([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void fetch("/api/account/conversations", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => setItems(d.conversations || []))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <Card className="flex justify-center py-16">
        <Loader2 className="animate-spin text-emerald-600" />
      </Card>
    );
  }

  if (!items.length) {
    return (
      <Card className="text-center">
        <MessageCircle className="mx-auto text-emerald-600" />
        <p className="mt-3 text-slate-600">{t.account.noChats}</p>
        <Link
          href="/ai-chat"
          className="mt-4 inline-flex rounded-full bg-emerald-600 px-5 py-2.5 text-sm font-bold text-white"
        >
          {t.account.chatWithAssistant}
        </Link>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {items.map((c) => (
        <Link
          key={c.id}
          href={`/account/chat/${c.id}`}
          className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
        >
          <p className="font-bold text-slate-900">{c.title || t.account.navChats}</p>
          <p className="mt-2 line-clamp-2 text-sm text-slate-500">{c.preview}</p>
          <p className="mt-3 text-xs text-slate-400">
            {c.updated
              ? new Date(c.updated).toLocaleString(
                  locale === "ar" ? "ar-AE" : locale === "tr" ? "tr-TR" : "en-GB"
                )
              : ""}
          </p>
        </Link>
      ))}
    </div>
  );
}

function ProgramsSection() {
  const { t, locale } = useLocale();
  const [programs, setPrograms] = useState<
    Array<{
      pbId: string;
      id: string;
      titleAr: string;
      titleEn: string;
      destination: string;
      nights: number;
      people?: number;
      arrivalDate?: string;
      departureDate?: string;
      priceFromUsd: number;
      thumbnail?: string;
    }>
  >([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void fetch("/api/account/programs", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => setPrograms(d.programs || []))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <Card className="flex justify-center py-16">
        <Loader2 className="animate-spin text-emerald-600" />
      </Card>
    );
  }
  if (!programs.length) {
    return (
      <Card className="text-center">
        <Bookmark className="mx-auto text-amber-500" />
        <p className="mt-3 text-slate-600">{t.account.noPrograms}</p>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {programs.map((p) => (
        <div
          key={p.pbId}
          className="overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm"
        >
          {p.thumbnail ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={p.thumbnail} alt="" className="h-40 w-full object-cover" />
          ) : (
            <div className="h-28 bg-gradient-to-l from-emerald-700 to-slate-900" />
          )}
          <div className="p-5">
            <h3 className="font-bold text-slate-900">
              {tContent(p, "title", locale)}
            </h3>
            <p className="mt-1 text-sm text-slate-500">{p.destination}</p>
            <p className="mt-2 text-xs text-slate-400">
              {t.account.programNights}: {p.nights}
              {p.people ? ` · ${t.account.programPeople}: ${p.people}` : ""}
            </p>
            {(p.arrivalDate || p.departureDate) && (
              <p className="text-xs text-slate-400">
                {t.account.programDates}: {p.arrivalDate || "—"} → {p.departureDate || "—"}
              </p>
            )}
            <p className="mt-3 text-lg font-bold text-emerald-700">
              {money(p.priceFromUsd)}
            </p>
            <a
              href={`/api/account/programs/${p.pbId}/pdf`}
              className="mt-4 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-bold text-white"
            >
              <Download size={14} />
              {t.account.downloadPdf}
            </a>
          </div>
        </div>
      ))}
    </div>
  );
}

function AffiliateSection() {
  const { t } = useLocale();
  const [data, setData] = useState<{
    enabled?: boolean;
    profile?: { code: string; status: string };
    links?: Array<{ key: string; path: string; url: string; shortUrl: string }>;
    wallet?: {
      approved: number;
      pending: number;
      withdrawn: number;
      balance: number;
    };
    stats?: { visits: number; visitsByService: Record<string, number> };
  } | null>(null);
  const [copied, setCopied] = useState("");

  useEffect(() => {
    void fetch("/api/account/affiliate", { cache: "no-store" })
      .then((r) => r.json())
      .then(setData);
  }, []);

  const copy = useCallback(async (text: string, key: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(key);
      setTimeout(() => setCopied(""), 1600);
    } catch {
      /* ignore */
    }
  }, []);

  if (!data) {
    return (
      <Card className="flex justify-center py-16">
        <Loader2 className="animate-spin text-emerald-600" />
      </Card>
    );
  }
  if (data.enabled === false) {
    return (
      <Card>
        <p className="text-slate-600">{t.account.affiliateDisabled}</p>
      </Card>
    );
  }

  const pageLabel: Record<string, string> = {
    home: t.nav.home,
    flights: t.nav.flights,
    hotels: t.nav.hotels,
    cars: t.nav.cars,
    transfers: t.nav.transfers,
    holidays: t.nav.holidays,
    vipTours: t.nav.vipDailyTours,
  };

  const serviceLabel = (key: string) => {
    switch (key) {
      case "flight":
        return t.nav.flights;
      case "hotel":
        return t.nav.hotels;
      case "car":
        return t.nav.cars;
      case "transfer":
        return t.nav.transfers;
      case "package":
        return t.nav.holidays;
      case "other":
        return t.account.statsByService;
      default: {
        const _never: string = key;
        return _never;
      }
    }
  };

  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label={t.account.visits} value={String(data.stats?.visits || 0)} />
        <StatCard label={t.account.pendingCommission} value={money(data.wallet?.pending || 0)} />
        <StatCard label={t.account.approvedEarnings} value={money(data.wallet?.approved || 0)} />
        <StatCard label={t.account.walletBalance} value={money(data.wallet?.balance || 0)} accent />
      </div>

      <Card>
        <p className="text-sm text-slate-500">{t.account.referralCode}</p>
        <div className="mt-2 flex flex-wrap items-center gap-3">
          <p className="text-3xl font-black tracking-widest text-slate-900">
            {data.profile?.code}
          </p>
          <button
            type="button"
            onClick={() => void copy(data.profile?.code || "", "code")}
            className="inline-flex items-center gap-1 rounded-full bg-slate-900 px-3 py-1.5 text-xs font-bold text-white"
          >
            {copied === "code" ? <Check size={12} /> : <Copy size={12} />}
            {copied === "code" ? t.account.copied : t.account.copy}
          </button>
        </div>
      </Card>

      <Card>
        <h3 className="font-bold text-slate-900">{t.account.yourLinks}</h3>
        <div className="mt-4 space-y-3">
          {(data.links || []).map((link) => (
            <div
              key={link.key}
              className="flex flex-col gap-2 rounded-2xl bg-slate-50 p-3 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0">
                <p className="text-sm font-semibold text-slate-800">
                  {pageLabel[link.key] || link.path}
                </p>
                <p className="truncate text-xs text-slate-500">{link.url}</p>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => void copy(link.url, link.key)}
                  className="rounded-full border border-slate-200 px-3 py-1.5 text-xs font-bold"
                >
                  {copied === link.key ? t.account.copied : t.account.copy}
                </button>
                <a
                  href={`https://wa.me/?text=${encodeURIComponent(link.url)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 rounded-full bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white"
                >
                  <Share2 size={12} />
                  {t.account.shareWhatsApp}
                </a>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {data.stats?.visitsByService && (
        <Card>
          <h3 className="font-bold text-slate-900">{t.account.statsByService}</h3>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            {Object.entries(data.stats.visitsByService).map(([service, count]) => (
              <div key={service} className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs text-slate-500">{serviceLabel(service)}</p>
                <p className="mt-1 text-2xl font-bold text-slate-900">{count}</p>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}

function StatCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-3xl border p-5 shadow-sm",
        accent
          ? "border-emerald-200 bg-gradient-to-br from-emerald-50 to-white"
          : "border-slate-100 bg-white"
      )}
    >
      <p className="text-xs font-semibold text-slate-500">{label}</p>
      <p className="mt-2 text-2xl font-black text-slate-900">{value}</p>
    </div>
  );
}

function LoyaltyWalletSection() {
  const { t } = useLocale();
  const [data, setData] = useState<{
    points?: number;
    pendingPoints?: number;
    usd?: number;
    pendingUsd?: number;
    ledger?: Array<{
      id: string;
      kind: string;
      status: string;
      points: number;
      usdValue: number;
      bookingId?: string;
      createdAt: string;
    }>;
    settings?: { minConvertPoints: number };
  } | null>(null);
  const [points, setPoints] = useState("");
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  const reload = useCallback(() => {
    void fetch("/api/loyalty/wallet", { cache: "no-store" })
      .then((r) => r.json())
      .then(setData);
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  const convert = async () => {
    setSaving(true);
    setErr("");
    try {
      const res = await fetch("/api/loyalty/convert", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ points: Number(points) }),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) {
        setErr(t.loyalty.convertFailed);
        return;
      }
      setPoints("");
      reload();
    } catch {
      setErr(t.loyalty.convertFailed);
    } finally {
      setSaving(false);
    }
  };

  if (!data) {
    return (
      <Card className="flex justify-center py-10">
        <Loader2 className="animate-spin text-emerald-600" />
      </Card>
    );
  }

  const earns = (data.ledger || []).filter((row) => row.kind === "earn");

  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          label={t.loyalty.pointsBalance}
          value={Math.round(data.points || 0).toLocaleString("en-US")}
          accent
        />
        <StatCard
          label={t.loyalty.pointsUsd}
          value={`$${(data.usd || 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
        />
        <StatCard
          label={t.loyalty.pendingPoints}
          value={Math.round(data.pendingPoints || 0).toLocaleString("en-US")}
        />
      </div>

      <Card>
        <div className="flex items-start gap-3 rounded-2xl bg-emerald-50 p-4 text-emerald-950">
          <Coins className="mt-0.5 shrink-0" size={18} />
          <div>
            <p className="font-bold">{t.loyalty.convertTitle}</p>
            <p className="mt-1 text-sm">{t.loyalty.convertHint}</p>
            <p className="mt-1 text-xs text-emerald-800/70">
              {t.loyalty.minConvert}: {data.settings?.minConvertPoints || 100}
            </p>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-3">
          <input
            type="number"
            min={data.settings?.minConvertPoints || 100}
            value={points}
            onChange={(e) => setPoints(e.target.value)}
            className="min-w-[10rem] flex-1 rounded-xl border border-slate-200 px-4 py-3 text-sm"
          />
          <button
            type="button"
            onClick={() => void convert()}
            disabled={saving}
            className="rounded-xl bg-[#051741] px-5 py-3 text-sm font-bold text-white disabled:opacity-60"
          >
            {saving ? t.common.loading : t.loyalty.convertCta}
          </button>
        </div>
        {err ? <p className="mt-3 text-sm text-red-600">{err}</p> : null}
      </Card>

      <Card>
        <h3 className="font-bold text-slate-900">{t.loyalty.earnHistory}</h3>
        {!earns.length ? (
          <p className="mt-3 text-sm text-slate-500">{t.loyalty.noEarnHistory}</p>
        ) : (
          <div className="mt-4 space-y-3">
            {earns.map((row) => (
              <div key={row.id} className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
                <div>
                  <p className="font-bold text-slate-900">
                    {row.points.toLocaleString("en-US")} · ${row.usdValue.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                  </p>
                  <p className="text-xs text-slate-500">
                    {row.bookingId || "—"} · {row.createdAt.slice(0, 10)}
                  </p>
                </div>
                <span className="text-xs font-bold text-slate-600">
                  {row.status === "pending" ? t.loyalty.pendingPoints : t.account.statusConfirmed}
                </span>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

function WalletSection() {
  const { t } = useLocale();
  const [data, setData] = useState<{
    wallet?: {
      approved: number;
      pending: number;
      withdrawn: number;
      pendingWithdraw: number;
      balance: number;
    };
    settings?: { min_withdraw: number };
    withdrawals?: Array<{
      id: string;
      amount: number;
      binance_id: string;
      status: string;
      created: string;
    }>;
    enabled?: boolean;
  } | null>(null);
  const [amount, setAmount] = useState("");
  const [binance, setBinance] = useState("");
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  const reload = useCallback(() => {
    void fetch("/api/account/affiliate", { cache: "no-store" })
      .then((r) => r.json())
      .then(setData);
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  const submit = async () => {
    setSaving(true);
    setErr("");
    try {
      const res = await fetch("/api/account/withdraw", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: Number(amount), binance_id: binance }),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) {
        if (json.error === "min_withdraw") setErr(t.account.minWithdrawNote);
        else if (json.error === "insufficient_balance") setErr(t.account.emptyWallet);
        else setErr(t.auth.failed);
        return;
      }
      setAmount("");
      reload();
    } catch {
      setErr(t.auth.failed);
    } finally {
      setSaving(false);
    }
  };

  if (!data) {
    return (
      <Card className="flex justify-center py-16">
        <Loader2 className="animate-spin text-emerald-600" />
      </Card>
    );
  }

  const withdrawStatus = (status: string) => {
    if (status === "paid") return t.account.withdrawPaid;
    if (status === "rejected") return t.account.withdrawRejected;
    return t.account.withdrawPending;
  };

  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label={t.account.walletBalance} value={money(data.wallet?.balance || 0)} accent />
        <StatCard label={t.account.approvedEarnings} value={money(data.wallet?.approved || 0)} />
        <StatCard label={t.account.pendingCommission} value={money(data.wallet?.pending || 0)} />
        <StatCard label={t.account.withdrawn} value={money(data.wallet?.withdrawn || 0)} />
      </div>

      <Card>
        <div className="flex items-start gap-3 rounded-2xl bg-amber-50 p-4 text-amber-900">
          <Wallet className="mt-0.5 shrink-0" size={18} />
          <div>
            <p className="font-bold">{t.account.minWithdraw}</p>
            <p className="mt-1 text-sm">{t.account.minWithdrawNote}</p>
            <p className="mt-1 text-sm">{t.account.binanceOnly}</p>
          </div>
        </div>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <label className="text-sm text-slate-600">
            {t.account.withdrawAmount}
            <input
              type="number"
              min={data.settings?.min_withdraw || 100}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm"
            />
          </label>
          <label className="text-sm text-slate-600">
            {t.account.binanceId}
            <input
              value={binance}
              onChange={(e) => setBinance(e.target.value)}
              placeholder={t.account.binanceHint}
              className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm"
            />
          </label>
        </div>
        <p className="mt-2 text-xs text-slate-400">{t.account.usdtNetwork}</p>
        {err ? <p className="mt-3 text-sm text-red-600">{err}</p> : null}
        <button
          type="button"
          onClick={() => void submit()}
          disabled={saving}
          className="mt-4 rounded-xl bg-slate-900 px-5 py-3 text-sm font-bold text-white disabled:opacity-60"
        >
          {saving ? t.common.loading : t.account.withdrawSubmit}
        </button>
      </Card>

      <Card>
        <h3 className="font-bold text-slate-900">{t.account.withdrawHistory}</h3>
        {!data.withdrawals?.length ? (
          <p className="mt-3 text-sm text-slate-500">{t.account.noWithdrawals}</p>
        ) : (
          <div className="mt-4 space-y-3">
            {data.withdrawals.map((w) => (
              <div
                key={w.id}
                className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3"
              >
                <div>
                  <p className="font-bold text-slate-900">{money(w.amount)}</p>
                  <p className="text-xs text-slate-500">{w.binance_id}</p>
                </div>
                <span className="text-xs font-bold text-slate-600">
                  {withdrawStatus(w.status)}
                </span>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

export default function AccountPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[50vh] items-center justify-center">
          <Loader2 className="animate-spin text-emerald-600" />
        </div>
      }
    >
      <AccountDashboard />
    </Suspense>
  );
}
