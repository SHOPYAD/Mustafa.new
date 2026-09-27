"use client";

import { useEffect, useState } from "react";
import {
  Check,
  Copy,
  Globe,
  KeyRound,
  Loader2,
  Radio,
  RefreshCw,
  Search,
  ShieldAlert,
  ShieldCheck,
  X,
} from "lucide-react";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { AdminPage, AdminPageHeader } from "@/components/admin/layout";
import type { ResellerLicense } from "@/lib/server/resale-store";

export default function ResaleLicensesPage() {
  const { t, dir } = useLocale();
  const [licenses, setLicenses] = useState<ResellerLicense[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Rebind Modal state
  const [rebindLicense, setRebindLicense] = useState<ResellerLicense | null>(null);
  const [newDomain, setNewDomain] = useState("");
  const [rebindLoading, setRebindLoading] = useState(false);

  const loadLicenses = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/resale/licenses", { cache: "no-store" });
      const json = (await res.json()) as { ok?: boolean; licenses?: ResellerLicense[] };
      if (json?.ok && json.licenses) {
        setLicenses(json.licenses);
      }
    } catch {
      /* non-blocking */
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadLicenses();
  }, []);

  const copyKey = (key: string) => {
    void navigator.clipboard.writeText(key);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  const revokeLicense = async (licenseId: string) => {
    if (!confirm("هل أنت متأكد من إلغاء هذا الترخيص؟ سيتوقف موقع العميل عن العمل فوراً.")) return;
    try {
      const res = await fetch("/api/admin/resale/licenses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "revoke", licenseId }),
      });
      const json = (await res.json()) as { ok?: boolean };
      if (json?.ok) {
        void loadLicenses();
      }
    } catch {
      /* error */
    }
  };

  const submitRebind = async () => {
    if (!rebindLicense || !newDomain.trim()) return;
    try {
      setRebindLoading(true);
      const res = await fetch("/api/admin/resale/licenses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "rebind",
          licenseId: rebindLicense.id,
          newDomain: newDomain.trim(),
        }),
      });
      const json = (await res.json()) as { ok?: boolean };
      if (json?.ok) {
        setRebindLicense(null);
        setNewDomain("");
        void loadLicenses();
      }
    } catch {
      /* error */
    } finally {
      setRebindLoading(false);
    }
  };

  const filtered = licenses.filter((l) => {
    const s = search.toLowerCase();
    return (
      l.licenseKey.toLowerCase().includes(s) ||
      (l.companyName && l.companyName.toLowerCase().includes(s)) ||
      (l.boundDomain && l.boundDomain.toLowerCase().includes(s))
    );
  });

  return (
    <AdminPage className="space-y-6" dir={dir}>
      <AdminPageHeader
        icon={<KeyRound className="size-5" />}
        title={t.admin.resaleLicenses}
        description={t.admin.resaleLicensesDesc}
        actions={
          <button type="button" onClick={() => void loadLicenses()} className="admin-btn-secondary">
            <RefreshCw className="h-4 w-4" />
            تحديث
          </button>
        }
      />

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute right-3.5 top-3 h-4 w-4 text-muted-foreground" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="بحث بمفتاح الترخيص أو الشركة أو الدومين..."
          className="w-full pl-4 pr-10 py-2.5 bg-card/60 border border-border rounded-xl text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/40"
        />
      </div>

      {/* Licenses Table */}
      <div className="rounded-2xl border border-border bg-card/60 overflow-hidden shadow-sm">
        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center text-muted-foreground space-y-2">
            <KeyRound className="h-10 w-10 mx-auto text-muted-foreground/40" />
            <p className="font-medium text-foreground">لا توجد تراخيص مصدرة</p>
            <p className="text-xs">تُصدر التراخيص تلقائياً عند إتمام الشركات لعملية الشراء</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-right">
              <thead className="border-b border-border bg-muted/40 text-xs font-semibold text-muted-foreground uppercase">
                <tr>
                  <th className="px-5 py-3.5">مفتاح الترخيص</th>
                  <th className="px-5 py-3.5">الشركة</th>
                  <th className="px-5 py-3.5">الدومين المربوط</th>
                  <th className="px-5 py-3.5">الحالة</th>
                  <th className="px-5 py-3.5">النبضة الحية</th>
                  <th className="px-5 py-3.5 text-left">إجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((l) => (
                  <tr key={l.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-amber-500">{l.licenseKey}</span>
                        <button
                          type="button"
                          onClick={() => copyKey(l.licenseKey)}
                          className="p-1 rounded-lg hover:bg-secondary text-muted-foreground transition-colors"
                          title="نسخ المفتاح"
                        >
                          {copiedKey === l.licenseKey ? (
                            <Check className="h-3.5 w-3.5 text-emerald-500" />
                          ) : (
                            <Copy className="h-3.5 w-3.5" />
                          )}
                        </button>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <p className="font-medium text-foreground text-xs">{l.companyName || "شركة غير مسماة"}</p>
                      <p className="text-[11px] text-muted-foreground">{l.companyEmail}</p>
                    </td>
                    <td className="px-5 py-4">
                      {l.boundDomain ? (
                        <span className="flex items-center gap-1.5 text-xs font-mono text-foreground">
                          <Globe className="h-3.5 w-3.5 text-muted-foreground" />
                          {l.boundDomain}
                        </span>
                      ) : (
                        <span className="text-xs text-amber-500/80 italic">بانتظار أول تفعيل</span>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          l.status === "bound"
                            ? "bg-emerald-500/10 text-emerald-500"
                            : l.status === "issued"
                            ? "bg-blue-500/10 text-blue-500"
                            : "bg-red-500/10 text-red-500"
                        }`}
                      >
                        {l.status === "bound" && "مربوط بالدومين"}
                        {l.status === "issued" && "تم الإصدار"}
                        {l.status === "revoked" && "ملغي"}
                        {l.status === "expired" && "منتهي"}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 text-xs font-medium ${
                          l.online ? "text-emerald-500" : "text-muted-foreground"
                        }`}
                      >
                        <Radio className={`h-3 w-3 ${l.online ? "animate-pulse" : ""}`} />
                        {l.online ? "متصل الآن" : "غير متصل"}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-left">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setRebindLicense(l);
                            setNewDomain(l.boundDomain || "");
                          }}
                          className="px-2.5 py-1 text-xs font-medium rounded-lg bg-secondary text-foreground hover:bg-muted transition-colors"
                        >
                          إعادة ربط
                        </button>
                        {l.status !== "revoked" && (
                          <button
                            type="button"
                            onClick={() => void revokeLicense(l.id)}
                            className="px-2.5 py-1 text-xs font-medium rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-colors"
                          >
                            إلغاء
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Rebind Modal */}
      {rebindLicense && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-md bg-card border border-border rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                <Globe className="h-4 w-4 text-amber-500" />
                إعادة ربط الترخيص بدومين جديد
              </h2>
              <button
                type="button"
                onClick={() => setRebindLicense(null)}
                className="p-1 text-muted-foreground hover:bg-secondary rounded-lg"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <p className="text-xs text-muted-foreground">
              مفتاح الترخيص: <span className="font-mono text-amber-500">{rebindLicense.licenseKey}</span>
            </p>

            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5">
                الدومين الجديد المعتمد
              </label>
              <input
                type="text"
                value={newDomain}
                onChange={(e) => setNewDomain(e.target.value)}
                placeholder="example-travel.com"
                className="w-full px-3.5 py-2.5 bg-secondary/60 border border-border rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-amber-500/40"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setRebindLicense(null)}
                className="px-4 py-2 bg-secondary text-foreground text-xs font-medium rounded-xl hover:bg-muted transition-colors"
              >
                إلغاء
              </button>
              <button
                type="button"
                onClick={() => void submitRebind()}
                disabled={rebindLoading || !newDomain.trim()}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-amber-500 text-slate-950 text-xs font-bold rounded-xl hover:bg-amber-400 disabled:opacity-50 transition-all"
              >
                {rebindLoading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                <span>حفظ وربط الدومين</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminPage>
  );
}
