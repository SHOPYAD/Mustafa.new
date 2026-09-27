"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
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
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import type { ResellerLicense } from "@/lib/server/resale-store";
import {
  EnterprisePageHeader,
  EnterpriseKpiGrid,
  EnterpriseKpiCard,
  EnterpriseFilterBar,
  EnterpriseDataTable,
  EnterpriseStatusBadge,
  EnterpriseModal,
  type ColumnDef,
} from "@/components/admin/enterprise";

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

  const totalLicenses = licenses.length;
  const activeLicenses = licenses.filter((l) => l.status === "active").length;
  const onlineInstances = licenses.filter((l) => l.online).length;
  const revokedLicenses = licenses.filter((l) => l.status === "revoked").length;

  const columns: ColumnDef<ResellerLicense>[] = [
    {
      key: "licenseKey",
      title: "مفتاح الترخيص السحابي",
      render: (l) => (
        <div className="flex items-center gap-2">
          <code className="font-mono text-xs font-black text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/20 tracking-wider">
            {l.licenseKey}
          </code>
          <button
            type="button"
            onClick={() => copyKey(l.licenseKey)}
            className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-card transition-colors"
            title="نسخ المفتاح"
          >
            {copiedKey === l.licenseKey ? (
              <Check className="h-3.5 w-3.5 text-emerald-400" />
            ) : (
              <Copy className="h-3.5 w-3.5" />
            )}
          </button>
        </div>
      ),
    },
    {
      key: "companyName",
      title: "الشركة المالكة",
      render: (l) => (
        <span className="font-bold text-foreground text-xs">
          {l.companyName || "غير محددة"}
        </span>
      ),
    },
    {
      key: "boundDomain",
      title: "النطاق المرتبط",
      render: (l) =>
        l.boundDomain ? (
          <span className="font-mono text-xs text-primary flex items-center gap-1.5">
            <Globe className="h-3.5 w-3.5 text-muted-foreground" />
            {l.boundDomain}
          </span>
        ) : (
          <span className="text-muted-foreground text-xs italic">غير مرتبط بدومين</span>
        ),
    },
    {
      key: "online",
      title: "الاتصال المباشر",
      render: (l) => (
        <EnterpriseStatusBadge
          status={l.online ? "active" : "inactive"}
          label={l.online ? "متصل مباشر" : "غير متصل"}
          size="sm"
        />
      ),
    },
    {
      key: "status",
      title: "حالة الترخيص",
      render: (l) => (
        <EnterpriseStatusBadge
          status={l.status === "active" ? "active" : "cancelled"}
          label={l.status === "active" ? "نشط وسارٍ" : "ملغي"}
          size="sm"
        />
      ),
    },
    {
      key: "actions",
      title: "الإجراءات",
      align: "left",
      render: (l) => (
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setRebindLicense(l);
              setNewDomain(l.boundDomain || "");
            }}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-card border border-border/60 text-foreground hover:border-primary/40 text-xs font-bold transition-all shadow-xs"
          >
            <Globe className="h-3 w-3 text-primary" />
            <span>ربط دومين</span>
          </button>
          {l.status === "active" && (
            <button
              type="button"
              onClick={() => void revokeLicense(l.id)}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20 hover:bg-rose-500 hover:text-white text-xs font-bold transition-all"
            >
              <ShieldAlert className="h-3 w-3" />
              <span>إلغاء</span>
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-8" dir={dir}>
      <EnterprisePageHeader
        icon={KeyRound}
        title={t.admin?.resaleLicenses || "إدارة تراخيص المنصات السحابية (Software Licenses)"}
        description={t.admin?.resaleLicensesDesc || "توليد، ربط، وتتبع تراخيص التملك المستقلة وعقد التحقق الدوري للمنصات المستنسخة."}
        breadcrumbs={[
          { label: "لوحة التحكم", href: "/admin" },
          { label: "الموزعين", href: "/admin/resale" },
          { label: "التراخيص" },
        ]}
        actions={
          <div className="flex items-center gap-3">
            <Link
              href="/admin/resale"
              className="inline-flex items-center gap-2 rounded-xl border border-border/70 bg-card/60 px-4 py-2.5 text-xs font-bold text-foreground backdrop-blur-md transition-all hover:bg-card hover:border-primary/40 active:scale-95"
            >
              <ArrowRight className="size-4" />
              منصة التوزيع
            </Link>
            <button
              type="button"
              onClick={() => void loadLicenses()}
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 px-5 py-2.5 text-xs font-black text-slate-950 shadow-lg shadow-amber-500/20 transition-all hover:brightness-110 active:scale-95 disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
              تحديث
            </button>
          </div>
        }
      />

      <EnterpriseKpiGrid cols={4}>
        <EnterpriseKpiCard
          label="إجمالي التراخيص"
          value={totalLicenses}
          hint="كافة المفاتيح المصدرة"
          icon={KeyRound}
          tone="royal"
        />
        <EnterpriseKpiCard
          label="التراخيص النشطة"
          value={activeLicenses}
          hint="سارية ومصرحة رسمياً"
          icon={ShieldCheck}
          tone="emerald"
        />
        <EnterpriseKpiCard
          label="منصات متصلة حالياً"
          value={onlineInstances}
          hint="ترسل نبضات Heartbeat حية"
          icon={Globe}
          tone="amber"
        />
        <EnterpriseKpiCard
          label="التراخيص الملغاة"
          value={revokedLicenses}
          hint="محظورة من التشغيل"
          icon={ShieldAlert}
          tone="rose"
        />
      </EnterpriseKpiGrid>

      <div className="space-y-4">
        <EnterpriseFilterBar
          searchValue={search}
          onSearchChange={setSearch}
          searchPlaceholder="بحث بمفتاح الترخيص، اسم الشركة، أو النطاق..."
          totalResults={filtered.length}
        />

        <EnterpriseDataTable
          data={filtered}
          columns={columns}
          keyExtractor={(l) => l.id}
          loading={loading}
          emptyTitle="لا توجد تراخيص مطابقة"
          emptyDescription="ستظهر تراخيص المنصات هنا تلقائياً بمجرد إتمام عمليات الشراء والتفعيل."
        />
      </div>

      {/* Rebind Modal */}
      {rebindLicense && (
        <EnterpriseModal
          isOpen={Boolean(rebindLicense)}
          onClose={() => setRebindLicense(null)}
          title="إعادة ربط الترخيص بنطاق جديد"
          description={`مفتاح: ${rebindLicense.licenseKey}`}
          size="sm"
        >
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-foreground mb-1">
                النطاق الجديد (Fully Qualified Domain Name)
              </label>
              <input
                type="text"
                value={newDomain}
                onChange={(e) => setNewDomain(e.target.value)}
                placeholder="example.com"
                className="w-full px-3.5 py-2.5 bg-background border border-border/70 rounded-xl text-xs font-mono text-foreground focus:outline-none focus:border-primary"
              />
              <p className="text-[11px] text-muted-foreground mt-1">
                سيتم حصر تشغيل كود المنصة على هذا النطاق فقط ولن تعمل على غيره.
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setRebindLicense(null)}
                className="px-4 py-2 rounded-xl border border-border/60 text-xs font-bold text-muted-foreground hover:text-foreground"
              >
                إلغاء
              </button>
              <button
                type="button"
                onClick={() => void submitRebind()}
                disabled={rebindLoading || !newDomain.trim()}
                className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 text-xs font-black hover:brightness-110 disabled:opacity-50 transition-all shadow-md"
              >
                {rebindLoading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                <span>حفظ وتحديث الربط</span>
              </button>
            </div>
          </div>
        </EnterpriseModal>
      )}
    </div>
  );
}
