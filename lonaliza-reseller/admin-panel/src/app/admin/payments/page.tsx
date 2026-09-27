"use client";

import { useEffect, useState } from "react";
import {
  Copy,
  CreditCard,
  Eye,
  EyeOff,
  Loader2,
  MessageCircle,
  RefreshCw,
  Save,
  Undo2,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
} from "lucide-react";
import AdminSwitch from "@/components/admin/AdminSwitch";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import {
  EnterprisePageHeader,
  EnterpriseKpiGrid,
  EnterpriseKpiCard,
  EnterpriseDataTable,
  EnterpriseStatusBadge,
  type ColumnDef,
} from "@/components/admin/enterprise";
import { Button } from "@/components/ui/button";

const inputClass =
  "w-full px-3.5 py-2.5 bg-background/80 border border-border/60 rounded-xl text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/30 text-sm";
const labelClass = "block text-xs font-semibold text-muted-foreground mb-1.5";

type Values = {
  PAYMENTS_IYZICO_ENABLED: string;
  PAYMENTS_WHATSAPP_BANK_LINK_ENABLED: string;
  IYZICO_MODE: string;
  IYZICO_API_KEY: string;
  IYZICO_SECRET_KEY: string;
  IYZICO_BASE_URL: string;
  PAYMENTS_WHATSAPP_NUMBER: string;
};

type MerchantUrls = {
  origin: string;
  callbackUrl: string;
  webhookUrl: string;
  sandboxApi: string;
  productionApi: string;
};

type AdminBooking = {
  id: string;
  hotel_name: string;
  customer_name: string;
  status: string;
  payment_status: string;
  paymentId: string;
  charged_amount: number;
  charged_currency: string;
  display_amount: number;
  display_currency: string;
  canRefund: boolean;
};

const FALLBACK_URLS: MerchantUrls = {
  origin: "https://lonaliza.com",
  callbackUrl: "https://lonaliza.com/api/payments/iyzico/callback",
  webhookUrl: "https://lonaliza.com/api/payments/iyzico/webhook",
  sandboxApi: "https://sandbox-api.iyzipay.com",
  productionApi: "https://api.iyzipay.com",
};

export default function AdminPaymentsPage() {
  const { t } = useLocale();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [showSecret, setShowSecret] = useState(false);
  const [urls, setUrls] = useState<MerchantUrls>(FALLBACK_URLS);

  const [bookings, setBookings] = useState<AdminBooking[]>([]);
  const [refundBusyId, setRefundBusyId] = useState<string | null>(null);
  const [refundMsg, setRefundMsg] = useState<{ id: string; ok: boolean; text: string } | null>(null);

  const [values, setValues] = useState<Values>({
    PAYMENTS_IYZICO_ENABLED: "false",
    PAYMENTS_WHATSAPP_BANK_LINK_ENABLED: "true",
    IYZICO_MODE: "sandbox",
    IYZICO_API_KEY: "",
    IYZICO_SECRET_KEY: "",
    IYZICO_BASE_URL: "",
    PAYMENTS_WHATSAPP_NUMBER: "",
  });

  const loadSettings = async () => {
    try {
      const res = await fetch("/api/admin/payments-config", { cache: "no-store" });
      const data = await res.json();
      if (data.ok && data.values) {
        setValues((prev) => ({ ...prev, ...data.values }));
      }
      if (data.merchantUrls) {
        setUrls(data.merchantUrls);
      }
      if (Array.isArray(data.bookings)) {
        setBookings(data.bookings);
      }
    } catch {
      setError("تعذر جلب إعدادات الدفع وحركات الحجوزات.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadSettings();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    setError(null);
    try {
      const res = await fetch("/api/admin/payments-config", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const data = await res.json();
      if (!data.ok) {
        setError(data.error || "فشل حفظ إعدادات بوابات الدفع");
        return;
      }
      setSaved(true);
      await loadSettings();
    } catch {
      setError("حدث خطأ أثناء حفظ التغييرات.");
    } finally {
      setSaving(false);
    }
  };

  const copyToClipboard = (text: string, key: string) => {
    void navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleRefund = async (bookingId: string) => {
    if (!confirm("هل أنت متأكد من رغبتك في استرداد هذا المبلغ للعميل عبر بوابة Iyzico؟")) return;
    setRefundBusyId(bookingId);
    setRefundMsg(null);
    try {
      const res = await fetch("/api/payments/iyzico/refund", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId }),
      });
      const data = await res.json();
      if (data.ok) {
        setRefundMsg({ id: bookingId, ok: true, text: "تم تنفيذ الاسترداد المالي بنجاح." });
        await loadSettings();
      } else {
        setRefundMsg({ id: bookingId, ok: false, text: data.error || "فشلت عملية الاسترداد." });
      }
    } catch {
      setRefundMsg({ id: bookingId, ok: false, text: "تعذر الاتصال بخادم الاسترداد." });
    } finally {
      setRefundBusyId(null);
    }
  };

  const columns: ColumnDef<AdminBooking>[] = [
    {
      key: "hotel_name",
      header: "الحجز والخدمة",
      render: (b) => (
        <div className="py-1">
          <p className="font-bold text-foreground text-xs">{b.hotel_name}</p>
          <p className="font-mono text-[11px] text-muted-foreground">ID: {b.id.slice(0, 10)}</p>
        </div>
      ),
    },
    {
      key: "customer_name",
      header: "العميل",
      render: (b) => (
        <span className="text-xs font-semibold text-foreground">{b.customer_name}</span>
      ),
    },
    {
      key: "charged_amount",
      header: "المبلغ المحصل",
      sortable: true,
      render: (b) => (
        <span className="font-mono font-bold text-foreground text-xs tabular-nums">
          {b.charged_currency} {b.charged_amount}
        </span>
      ),
    },
    {
      key: "payment_status",
      header: "حالة الدفع",
      align: "center",
      render: (b) => (
        <EnterpriseStatusBadge
          variant={b.payment_status === "paid" ? "success" : "pending"}
          label={b.payment_status === "paid" ? "مدفوع بالكامل" : b.payment_status}
        />
      ),
    },
    {
      key: "actions",
      header: "",
      align: "end",
      render: (b) => (
        <div className="flex items-center gap-2 justify-end">
          {refundMsg && refundMsg.id === b.id && (
            <span
              className={`text-[11px] font-bold ${
                refundMsg.ok ? "text-emerald-400" : "text-rose-400"
              }`}
            >
              {refundMsg.text}
            </span>
          )}
          {b.canRefund ? (
            <Button
              type="button"
              size="sm"
              variant="destructive"
              disabled={refundBusyId === b.id}
              onClick={() => void handleRefund(b.id)}
              className="rounded-xl text-xs font-bold h-8 gap-1.5"
            >
              {refundBusyId === b.id ? (
                <Loader2 size={13} className="animate-spin" />
              ) : (
                <Undo2 size={13} />
              )}
              <span>استرداد المبلغ</span>
            </Button>
          ) : (
            <span className="text-[11px] text-muted-foreground/60">—</span>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-6" dir="rtl">
      <EnterprisePageHeader
        breadcrumbs={[
          { label: "لوحة التحكم", href: "/admin" },
          { label: "المالية والخزينة", href: "/admin/payments" },
          { label: "بوابات الدفع الإلكتروني" },
        ]}
        icon={<CreditCard className="h-6 w-6 text-primary" />}
        title="بوابات الدفع الإلكتروني و Iyzico"
        subtitle="إدارة بوابة الدفع المعتمدة Iyzico، المفاتيح الأمنية، روابط إشعارات الويب هوك، وإجراءات الاسترداد المالي للحجوزات."
        actions={
          <Button
            type="button"
            onClick={() => void handleSave()}
            disabled={saving}
            className="rounded-xl font-bold bg-amber-500 hover:bg-amber-600 text-black shadow-lg shadow-amber-500/20 gap-2 h-11 px-5"
          >
            {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            <span>{saving ? "جاري الحفظ..." : "حفظ إعدادات البوابة"}</span>
          </Button>
        }
      />

      {saved && (
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs font-bold text-emerald-400 backdrop-blur-md">
          تم حفظ إعدادات بوابات الدفع بنجاح.
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs font-bold text-rose-400 backdrop-blur-md">
          {error}
        </div>
      )}

      {/* KPI Grid */}
      <EnterpriseKpiGrid columns={4}>
        <EnterpriseKpiCard
          title="حالة بوابة Iyzico"
          value={values.PAYMENTS_IYZICO_ENABLED === "true" ? "مفعلة ونشطة" : "معطلة"}
          subValue={values.IYZICO_MODE === "live" ? "وضع الإنتاج الحي (Live)" : "بيئة الاختبار (Sandbox)"}
          icon={<CreditCard className="size-5" />}
          color={values.PAYMENTS_IYZICO_ENABLED === "true" ? "emerald" : "amber"}
        />
        <EnterpriseKpiCard
          title="الدفع عبر واتساب / بنك"
          value={values.PAYMENTS_WHATSAPP_BANK_LINK_ENABLED === "true" ? "مفعّل" : "معطل"}
          subValue={values.PAYMENTS_WHATSAPP_NUMBER || "رقم الدعم المعتمد"}
          icon={<MessageCircle className="size-5" />}
          color="purple"
        />
        <EnterpriseKpiCard
          title="إجمالي الحركات المحصلة"
          value={bookings.length}
          subValue="حجز مدفوع عبر البوابة"
          icon={<ShieldCheck className="size-5" />}
          color="blue"
        />
        <EnterpriseKpiCard
          title="طلبات قابلة للاسترداد"
          value={bookings.filter((b) => b.canRefund).length}
          subValue="متاحة للإرجاع الفوري"
          icon={<Undo2 className="size-5" />}
          color="rose"
        />
      </EnterpriseKpiGrid>

      {/* Iyzico Configuration Card */}
      <div className="rounded-2xl border border-border/50 bg-card/70 p-6 backdrop-blur-xl shadow-xs space-y-5">
        <h2 className="text-base font-bold text-foreground flex items-center gap-2">
          <CreditCard className="size-5 text-primary" />
          <span>إعدادات بوابة Iyzico (Pay with Iyzico Checkout)</span>
        </h2>

        <div className="grid gap-5 sm:grid-cols-2">
          <AdminSwitch
            checked={values.PAYMENTS_IYZICO_ENABLED === "true"}
            onChange={(val) =>
              setValues((prev) => ({
                ...prev,
                PAYMENTS_IYZICO_ENABLED: val ? "true" : "false",
              }))
            }
            label="تفعيل بوابة الدفع Iyzico"
            description="عرض نموذج الدفع بالبطاقات الائتمانية في صفحة الدفع للعملاء."
          />

          <AdminSwitch
            checked={values.PAYMENTS_WHATSAPP_BANK_LINK_ENABLED === "true"}
            onChange={(val) =>
              setValues((prev) => ({
                ...prev,
                PAYMENTS_WHATSAPP_BANK_LINK_ENABLED: val ? "true" : "false",
              }))
            }
            label="تفعيل خيار الدفع عبر واتساب / تحويل"
            description="إتاحة إرسال طلب الحجز للواتساب لإتمام الدفع يدوياً."
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2 pt-2">
          <div>
            <label className={labelClass}>وضع التشغيل:</label>
            <select
              value={values.IYZICO_MODE}
              onChange={(e) => setValues((prev) => ({ ...prev, IYZICO_MODE: e.target.value }))}
              className={inputClass}
            >
              <option value="sandbox">بيئة الاختبار والتجربة (Sandbox)</option>
              <option value="live">البيئة الحية الحقيقية (Live Production)</option>
            </select>
          </div>

          <div>
            <label className={labelClass}>رقم واتساب المحاسبة واستقبال المدفوعات:</label>
            <input
              type="text"
              value={values.PAYMENTS_WHATSAPP_NUMBER}
              onChange={(e) =>
                setValues((prev) => ({ ...prev, PAYMENTS_WHATSAPP_NUMBER: e.target.value }))
              }
              placeholder="+90 532 000 0000"
              className={inputClass}
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={labelClass}>مفتاح API Key:</label>
            <input
              type="text"
              value={values.IYZICO_API_KEY}
              onChange={(e) => setValues((prev) => ({ ...prev, IYZICO_API_KEY: e.target.value }))}
              placeholder="sandbox-..."
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>مفتاح Secret Key السري:</label>
            <div className="relative">
              <input
                type={showSecret ? "text" : "password"}
                value={values.IYZICO_SECRET_KEY}
                onChange={(e) =>
                  setValues((prev) => ({ ...prev, IYZICO_SECRET_KEY: e.target.value }))
                }
                placeholder="sandbox-..."
                className={`${inputClass} pe-10 font-mono`}
              />
              <button
                type="button"
                onClick={() => setShowSecret((p) => !p)}
                className="absolute end-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showSecret ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Webhook & Callback URLs Card */}
      <div className="rounded-2xl border border-border/50 bg-card/70 p-6 backdrop-blur-xl shadow-xs space-y-4">
        <h2 className="text-sm font-bold text-foreground">عناوين الربط المباشرة مع Iyzico (Webhooks & Callback)</h2>
        <div className="grid gap-3 sm:grid-cols-2 text-xs">
          <div className="p-3.5 rounded-xl bg-muted/30 border border-border/40 space-y-1">
            <span className="text-muted-foreground font-semibold block">عنوان الرد التلقائي (Callback URL):</span>
            <div className="flex items-center justify-between gap-2 font-mono text-foreground">
              <span className="truncate">{urls.callbackUrl}</span>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                onClick={() => copyToClipboard(urls.callbackUrl, "callback")}
              >
                <Copy size={13} />
              </Button>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-muted/30 border border-border/40 space-y-1">
            <span className="text-muted-foreground font-semibold block">عنوان إشعارات الويب هوك (Webhook URL):</span>
            <div className="flex items-center justify-between gap-2 font-mono text-foreground">
              <span className="truncate">{urls.webhookUrl}</span>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                onClick={() => copyToClipboard(urls.webhookUrl, "webhook")}
              >
                <Copy size={13} />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Bookings Payments & Refund Table */}
      <div className="space-y-3">
        <h2 className="text-base font-bold text-foreground">حركات الدفع الإلكتروني والاسترداد المباشر</h2>
        <EnterpriseDataTable
          columns={columns}
          data={bookings as unknown as Record<string, unknown>[]}
          keyField="id"
          pageSize={10}
          emptyTitle="لا توجد حركات دفع مسجلة"
          emptyDescription="ستظهر هنا كافة المدفوعات المنفذة عبر بطاقات الائتمان مع إمكانية استردادها فورياً."
        />
      </div>
    </div>
  );
}
