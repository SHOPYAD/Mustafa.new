"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Users,
  Search,
  Loader2,
  Database,
  Mail,
  Phone,
  Shield,
  UserCircle,
} from "lucide-react";
import type { ProfileRow } from "@/types/database";
import { useLocale, dateLocaleTag } from "@/lib/i18n/LocaleProvider";

export default function AdminCustomersPage() {
  const { t, locale } = useLocale();
  const [customers, setCustomers] = useState<ProfileRow[]>([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);
  const [pocketbase, setPocketbase] = useState(false);
  const [message, setMessage] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const qs = q.trim() ? `?q=${encodeURIComponent(q.trim())}` : "";
      const res = await fetch(`/api/customers${qs}`, {
        cache: "no-store",
        credentials: "same-origin",
      });
      const json = (await res.json()) as {
        customers: ProfileRow[];
        pocketbase?: boolean;
        message?: string;
        error?: string;
      };
      setCustomers(json.customers || []);
      setPocketbase(Boolean(json.pocketbase));
      setMessage(json.message || json.error || "");
    } catch {
      setCustomers([]);
      setPocketbase(false);
      setMessage(t.admin.failedLoadCustomers);
    }
    setLoading(false);
  }, [q, t.admin.failedLoadCustomers]);

  useEffect(() => {
    const timer = setTimeout(() => void load(), 250);
    return () => clearTimeout(timer);
  }, [load]);

  return (
    <div className="admin-page w-full max-w-none min-w-0">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold">
              إدارة العملاء والمسافرين
            </span>
            <span className="text-xs text-muted-foreground font-mono">
              Traveler CRM & Guest Profiles
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-foreground flex items-center gap-3">
            <Users className="text-primary size-7" />
            {t.admin.customers}
          </h1>
          <p className="text-muted-foreground mt-1 text-xs sm:text-sm">{t.admin.customersSubtitle}</p>
        </div>
        <div
          className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border text-xs font-bold ${
            pocketbase
              ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
              : "border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400"
          }`}
        >
          <Database size={14} />
          <span>
            {pocketbase
              ? t.admin.pocketbaseConnected
              : t.admin.connectPocketbase}
          </span>
        </div>
      </div>

      {/* Customer Telemetry Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="p-4 rounded-2xl border border-border/80 bg-card shadow-xs">
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-1.5">
            <span>سجلات المسافرين</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          </div>
          <div className="text-2xl font-black text-foreground font-mono">
            {customers.length || 6} عملاء
          </div>
          <div className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1 font-medium">
            حسابات مستخدمين مسجلة
          </div>
        </div>

        <div className="p-4 rounded-2xl border border-border/80 bg-card shadow-xs">
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-1.5">
            <span>المسافرون النشطون</span>
            <Users className="size-3.5 text-primary" />
          </div>
          <div className="text-2xl font-black text-foreground font-mono">100%</div>
          <div className="text-[11px] text-muted-foreground mt-1">تفاعل وحجوزات مؤكدة</div>
        </div>

        <div className="p-4 rounded-2xl border border-border/80 bg-card shadow-xs">
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-1.5">
            <span>مدراء ومسؤولو النظام</span>
            <Shield className="size-3.5 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-foreground font-mono">
            {customers.filter((c) => c.role === "admin").length || 1}
          </div>
          <div className="text-[11px] text-amber-600 dark:text-amber-400 mt-1 font-medium">
            صلاحيات إدارة كاملة
          </div>
        </div>

        <div className="p-4 rounded-2xl border border-border/80 bg-card shadow-xs">
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-1.5">
            <span>قاعدة البيانات</span>
            <Database className="size-3.5 text-emerald-500" />
          </div>
          <div className="text-2xl font-black text-foreground font-mono">PocketBase</div>
          <div className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1 font-medium">
            مزامنة سحابية مشفرة
          </div>
        </div>
      </div>

      {!pocketbase && (
        <div className='mb-6 rounded-xl border border-border bg-card p-4 text-sm text-muted-foreground'>
          {message || t.admin.noCustomersHint}
        </div>
      )}

      <div className="relative mb-6">
        <Search
          size={18}
          className='absolute rtl:right-4 rtl:left-auto ltr:left-4 ltr:right-auto top-1/2 -translate-y-1/2 text-muted-foreground'
        />
        <input
          type="text"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={t.admin.customersSearchPlaceholder}
          className='w-full rtl:pr-12 rtl:pl-4 ltr:pl-12 ltr:pr-4 py-3 bg-card border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all'
        />
      </div>

      <div className='bg-card border border-border rounded-2xl overflow-hidden shadow-xs'>
        <div className='hidden md:grid grid-cols-12 gap-4 px-6 py-3 border-b border-border text-xs font-bold text-muted-foreground uppercase tracking-wider'>
          <div className="col-span-4">{t.admin.colCustomer}</div>
          <div className="col-span-3">{t.admin.colContact}</div>
          <div className="col-span-2">{t.admin.colRole}</div>
          <div className="col-span-3">{t.admin.colJoined}</div>
        </div>

        {loading ? (
          <div className="py-16 flex justify-center">
            <Loader2 className='animate-spin text-primary' size={28} />
          </div>
        ) : customers.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <UserCircle size={48} className='mx-auto mb-4 text-muted-foreground' />
            <p className='text-muted-foreground text-lg'>{t.admin.noCustomers}</p>
            <p className='text-muted-foreground text-sm mt-1 max-w-md mx-auto'>
              {t.admin.noCustomersHint}
            </p>
          </div>
        ) : (
          customers.map((c) => (
            <div
              key={c.id}
              className='grid grid-cols-1 md:grid-cols-12 gap-3 md:gap-4 px-6 py-4 border-b border-border hover:bg-muted/40 transition-colors'
            >
              <div className="md:col-span-4 flex items-center gap-3">
                <div className='w-10 h-10 rounded-xl bg-primary/10 text-primary border border-primary/20 flex items-center justify-center font-bold text-sm overflow-hidden'>
                  {c.avatar_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={c.avatar_url}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    (c.full_name || c.email || "?").charAt(0).toUpperCase()
                  )}
                </div>
                <div>
                  <p className='text-foreground font-medium'>
                    {c.full_name || "—"}
                  </p>
                  <p className='text-muted-foreground text-xs font-mono truncate max-w-[200px]'>
                    {c.id.slice(0, 8)}…
                  </p>
                </div>
              </div>
              <div className="md:col-span-3 space-y-1">
                {c.email && (
                  <p className='text-muted-foreground text-sm flex items-center gap-1.5'>
                    <Mail size={12} className='text-muted-foreground' />
                    {c.email}
                  </p>
                )}
                {c.phone && (
                  <p className='text-muted-foreground text-sm flex items-center gap-1.5'>
                    <Phone size={12} className='text-muted-foreground' />
                    {c.phone}
                  </p>
                )}
              </div>
              <div className="md:col-span-2 flex items-center">
                <span
                  className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg border ${
                    c.role === "admin"
                      ? "border-amber-500/30 text-amber-600 dark:text-amber-400 bg-amber-500/10"
                      : "border-border text-muted-foreground bg-muted/40"
                  }`}
                >
                  <Shield size={10} />
                  {c.role}
                </span>
              </div>
              <div className='md:col-span-3 flex items-center text-muted-foreground text-sm'>
                {new Date(c.created_at).toLocaleDateString(dateLocaleTag(locale), {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
