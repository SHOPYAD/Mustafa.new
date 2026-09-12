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
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Users className="text-amber-400" size={28} />
            {t.admin.customers}
          </h1>
          <p className="text-white/50 mt-1">{t.admin.customersSubtitle}</p>
        </div>
        <div
          className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium ${
            pocketbase
              ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
              : "border-amber-500/30 bg-amber-500/10 text-amber-200"
          }`}
        >
          <Database size={14} />
          {pocketbase
            ? t.admin.pocketbaseConnected
            : t.admin.connectPocketbase}
        </div>
      </div>

      {!pocketbase && (
        <div className="mb-6 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white/45">
          {message || t.admin.noCustomersHint}
        </div>
      )}

      <div className="relative mb-6">
        <Search
          size={18}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30"
        />
        <input
          type="text"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={t.admin.customersSearchPlaceholder}
          className="w-full pl-12 pr-4 py-3 bg-slate-900/80 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all"
        />
      </div>

      <div className="bg-slate-900/80 border border-white/5 rounded-2xl overflow-hidden">
        <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-3 border-b border-white/5 text-xs font-bold text-white/30 uppercase tracking-wider">
          <div className="col-span-4">{t.admin.colCustomer}</div>
          <div className="col-span-3">{t.admin.colContact}</div>
          <div className="col-span-2">{t.admin.colRole}</div>
          <div className="col-span-3">{t.admin.colJoined}</div>
        </div>

        {loading ? (
          <div className="py-16 flex justify-center">
            <Loader2 className="animate-spin text-amber-400" size={28} />
          </div>
        ) : customers.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <UserCircle size={48} className="mx-auto mb-4 text-white/10" />
            <p className="text-white/30 text-lg">{t.admin.noCustomers}</p>
            <p className="text-white/20 text-sm mt-1 max-w-md mx-auto">
              {t.admin.noCustomersHint}
            </p>
          </div>
        ) : (
          customers.map((c) => (
            <div
              key={c.id}
              className="grid grid-cols-1 md:grid-cols-12 gap-3 md:gap-4 px-6 py-4 border-b border-white/5 hover:bg-white/[0.02]"
            >
              <div className="md:col-span-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400/80 to-orange-500/80 flex items-center justify-center text-white font-bold text-sm overflow-hidden">
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
                  <p className="text-white font-medium">
                    {c.full_name || "—"}
                  </p>
                  <p className="text-white/35 text-xs font-mono truncate max-w-[200px]">
                    {c.id.slice(0, 8)}…
                  </p>
                </div>
              </div>
              <div className="md:col-span-3 space-y-1">
                {c.email && (
                  <p className="text-white/60 text-sm flex items-center gap-1.5">
                    <Mail size={12} className="text-white/25" />
                    {c.email}
                  </p>
                )}
                {c.phone && (
                  <p className="text-white/60 text-sm flex items-center gap-1.5">
                    <Phone size={12} className="text-white/25" />
                    {c.phone}
                  </p>
                )}
              </div>
              <div className="md:col-span-2 flex items-center">
                <span
                  className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg border ${
                    c.role === "admin"
                      ? "border-amber-500/30 text-amber-300 bg-amber-500/10"
                      : "border-white/10 text-white/50 bg-white/[0.03]"
                  }`}
                >
                  <Shield size={10} />
                  {c.role}
                </span>
              </div>
              <div className="md:col-span-3 flex items-center text-white/40 text-sm">
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
