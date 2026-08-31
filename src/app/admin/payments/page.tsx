"use client";

import { useEffect, useState } from "react";
import { Copy, CreditCard, Eye, EyeOff, Loader2, MessageCircle, RefreshCw, Save, Undo2 } from "lucide-react";
import AdminSwitch from "@/components/admin/AdminSwitch";
import { useLocale } from "@/lib/i18n/LocaleProvider";

const inputClass =
  "w-full px-3 py-2.5 bg-slate-950/60 border border-white/10 rounded-xl text-white placeholder-white/25 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/40 text-sm";
const labelClass = "block text-[11px] font-semibold text-white/40 mb-1.5 uppercase tracking-wider";
const cardClass = "rounded-2xl border border-white/10 bg-white/[0.03] p-5";

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
  const p = t.paymentsAdmin;
  const [values, setValues] = useState<Values | null>(null);
  const [urls, setUrls] = useState<MerchantUrls>(FALLBACK_URLS);
  const [bookings, setBookings] = useState<AdminBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [busyId, setBusyId] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [showSecret, setShowSecret] = useState(false);
  const [copied, setCopied] = useState("");
  const [msg, setMsg] = useState("");
  const [testBusy, setTestBusy] = useState(false);
  const [testResult, setTestResult] = useState<{ ok: boolean; text: string } | null>(null);

  const copyUrl = async (value: string, key: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(key);
      window.setTimeout(() => setCopied(""), 1600);
    } catch {
      setCopied("");
    }
  };

  const loadBookings = async () => {
    try {
      const res = await fetch("/api/admin/iyzico-bookings", { cache: "no-store" });
      const data = (await res.json()) as { bookings?: AdminBooking[] };
      setBookings(data.bookings || []);
    } catch {
      setBookings([]);
    }
  };

  useEffect(() => {
    void (async () => {
      try {
        const res = await fetch("/api/admin/payments-settings", { cache: "no-store" });
        const data = (await res.json()) as { values?: Values; urls?: MerchantUrls };
        if (data.urls?.callbackUrl && data.urls.webhookUrl) setUrls(data.urls);
        setValues(
          data.values || {
            PAYMENTS_IYZICO_ENABLED: "false",
            PAYMENTS_WHATSAPP_BANK_LINK_ENABLED: "true",
            IYZICO_MODE: "sandbox",
            IYZICO_API_KEY: "",
            IYZICO_SECRET_KEY: "",
            IYZICO_BASE_URL: "",
            PAYMENTS_WHATSAPP_NUMBER: "",
          }
        );
        await loadBookings();
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const save = async () => {
    if (!values) return;
    setSaving(true);
    setMsg("");
    try {
      const res = await fetch("/api/admin/payments-settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ values }),
      });
      const data = (await res.json()) as { ok?: boolean; values?: Values; error?: string };
      if (!res.ok || !data.ok) {
        setMsg(data.error || t.admin.saveFailed);
        return;
      }
      if (data.values) setValues(data.values);
      setMsg(t.admin.saved);
    } catch {
      setMsg(t.admin.saveFailed);
    } finally {
      setSaving(false);
    }
  };

  const testIyzico = async () => {
    if (!values) return;
    setTestBusy(true);
    setTestResult(null);
    try {
      const res = await fetch("/api/admin/iyzico-test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          IYZICO_API_KEY: values.IYZICO_API_KEY,
          IYZICO_SECRET_KEY: values.IYZICO_SECRET_KEY,
        }),
      });
      const data = (await res.json()) as {
        ok?: boolean;
        mode?: string;
        latencyMs?: number;
        currencyNote?: string;
        error?: string | null;
        errorCode?: string | null;
        hintCode?: string | null;
      };
      if (data.ok) {
        setTestResult({
          ok: true,
          text: `${p.testOk} · ${data.mode || ""} · ${data.currencyNote || ""} · ${data.latencyMs ?? 0}ms`,
        });
      } else {
        const iyzicoText = data.error || data.errorCode || "iyzico";
        const signatureFail =
          data.hintCode === "invalid_signature" ||
          data.errorCode === "1000" ||
          /invalid signature/i.test(String(data.error || ""));
        const hint = signatureFail
          ? values.IYZICO_MODE === "production"
            ? p.testSignatureHintProduction
            : p.testSignatureHint
          : "";
        setTestResult({
          ok: false,
          text: hint ? `${p.testFail}: ${iyzicoText}. ${hint}` : `${p.testFail}: ${iyzicoText}`,
        });
      }
    } catch {
      setTestResult({ ok: false, text: p.testFail });
    } finally {
      setTestBusy(false);
    }
  };

  const runBookingAction = async (action: "retrieve" | "refund", booking: AdminBooking) => {
    if (action === "refund" && !window.confirm(p.refundConfirm)) return;
    setBusyId(`${action}:${booking.id}`);
    setMsg("");
    try {
      const res = await fetch("/api/admin/iyzico-bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, bookingId: booking.id }),
      });
      const data = (await res.json()) as { ok?: boolean; booking?: AdminBooking; error?: string };
      if (!res.ok || !data.ok) {
        setMsg(data.error || (action === "refund" ? p.refundFailed : p.refreshFailed));
        return;
      }
      if (data.booking) {
        setBookings((rows) => rows.map((row) => (row.id === data.booking?.id ? data.booking : row)));
      } else {
        await loadBookings();
      }
      setMsg(action === "refund" ? p.refundOk : p.refreshOk);
    } catch {
      setMsg(action === "refund" ? p.refundFailed : p.refreshFailed);
    } finally {
      setBusyId("");
    }
  };

  if (loading || !values) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Loader2 className="animate-spin text-amber-400" />
      </div>
    );
  }

  const on = (key: keyof Values) => values[key] === "true";

  return (
    <div className="admin-page w-full max-w-none min-w-0 space-y-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-teal-500/15 text-teal-300">
            <CreditCard size={20} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">{p.title}</h1>
            <p className="text-sm text-white/45">{p.subtitle}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => void save()}
          disabled={saving}
          className="inline-flex items-center gap-2 self-start rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-amber-500/20 disabled:opacity-60"
        >
          {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
          {p.save}
        </button>
      </div>

      {msg ? (
        <p className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-2.5 text-sm text-emerald-200">
          {msg}
        </p>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-2">
        <section className={cardClass}>
          <h2 className="mb-3 text-sm font-semibold text-white">{p.channelsTitle}</h2>
          <AdminSwitch
            checked={on("PAYMENTS_IYZICO_ENABLED")}
            onChange={(next) =>
              setValues({ ...values, PAYMENTS_IYZICO_ENABLED: next ? "true" : "false" })
            }
            label={p.iyzicoEnabled}
            description={p.iyzicoEnabledHelp}
          />
          <div className="my-2 border-t border-white/8" />
          <AdminSwitch
            checked={on("PAYMENTS_WHATSAPP_BANK_LINK_ENABLED")}
            onChange={(next) =>
              setValues({
                ...values,
                PAYMENTS_WHATSAPP_BANK_LINK_ENABLED: next ? "true" : "false",
              })
            }
            label={p.whatsappEnabled}
            description={p.whatsappEnabledHelp}
          />
        </section>

        <section className={cardClass}>
          <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-white">
            <MessageCircle size={16} className="text-teal-300" />
            {p.whatsappCardTitle}
          </h2>
          <label className={labelClass}>{p.whatsappNumber}</label>
          <input
            value={values.PAYMENTS_WHATSAPP_NUMBER}
            onChange={(e) => setValues({ ...values, PAYMENTS_WHATSAPP_NUMBER: e.target.value })}
            placeholder="905321796763"
            className={`${inputClass} font-mono`}
            dir="ltr"
          />
          {/^98(5\d{9})$/.test(values.PAYMENTS_WHATSAPP_NUMBER.replace(/\D/g, "")) ? (
            <p className="mt-2 text-xs text-amber-200">{p.whatsappTypoHint}</p>
          ) : null}
        </section>
      </div>

      <section className={cardClass}>
        <h2 className="mb-4 text-sm font-semibold text-white">{p.iyzicoCardTitle}</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className={labelClass}>{p.mode}</label>
            <select
              value={values.IYZICO_MODE}
              onChange={(e) => setValues({ ...values, IYZICO_MODE: e.target.value })}
              className={inputClass}
            >
              <option value="sandbox">{p.sandbox}</option>
              <option value="production">{p.production}</option>
            </select>
          </div>
          <div>
            <label className={labelClass}>{p.baseUrl}</label>
            <input
              value={values.IYZICO_BASE_URL}
              onChange={(e) => setValues({ ...values, IYZICO_BASE_URL: e.target.value })}
              placeholder="https://sandbox-api.iyzipay.com"
              className={`${inputClass} font-mono`}
              dir="ltr"
            />
          </div>
          <SecretField
            label={p.apiKey}
            value={values.IYZICO_API_KEY}
            shown={showKey}
            onToggle={() => setShowKey((v) => !v)}
            onChange={(value) => setValues({ ...values, IYZICO_API_KEY: value })}
          />
          <SecretField
            label={p.secretKey}
            value={values.IYZICO_SECRET_KEY}
            shown={showSecret}
            onToggle={() => setShowSecret((v) => !v)}
            onChange={(value) => setValues({ ...values, IYZICO_SECRET_KEY: value })}
          />
        </div>
        <p className="mt-4 text-xs leading-6 text-white/40">{p.helpFx}</p>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => void testIyzico()}
            disabled={testBusy}
            className="inline-flex items-center gap-2 rounded-xl border border-[#1E64FF]/40 bg-[#1E64FF]/15 px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#1E64FF]/25 disabled:opacity-60"
          >
            {testBusy ? <Loader2 size={16} className="animate-spin" /> : <CreditCard size={16} />}
            {p.testConnection}
          </button>
          {testResult ? (
            <p
              className={`text-sm ${
                testResult.ok ? "text-emerald-300" : "text-rose-300"
              }`}
            >
              {testResult.text}
            </p>
          ) : null}
        </div>
      </section>

      <section className={cardClass}>
        <h2 className="mb-3 text-sm font-semibold text-white">{p.urlsTitle}</h2>
        <UrlRow
          label={p.callbackUrlLabel}
          value={urls.callbackUrl}
          copied={copied === "callback"}
          copyLabel={p.copy}
          copiedLabel={p.copied}
          onCopy={() => void copyUrl(urls.callbackUrl, "callback")}
          help={p.callbackHelp}
        />
        <UrlRow
          label={p.webhookUrlLabel}
          value={urls.webhookUrl}
          copied={copied === "webhook"}
          copyLabel={p.copy}
          copiedLabel={p.copied}
          onCopy={() => void copyUrl(urls.webhookUrl, "webhook")}
          help={p.webhookHelp}
        />
        <p className="mt-3 text-xs leading-6 text-white/45">{p.webhookPanelSteps}</p>
        <p className="mt-2 text-[11px] text-white/35">{p.hostsLabel}</p>
        <p className="font-mono text-[11px] text-white/55" dir="ltr">
          {p.sandboxHost}
        </p>
        <p className="font-mono text-[11px] text-white/55" dir="ltr">
          {p.productionHost}
        </p>
      </section>

      <section className={cardClass}>
        <h2 className="mb-3 text-sm font-semibold text-white">{p.bookingsTitle}</h2>
        {bookings.length === 0 ? (
          <p className="text-sm text-white/40">{p.bookingsEmpty}</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-start text-sm">
              <thead className="text-[11px] uppercase tracking-wider text-white/35">
                <tr>
                  <th className="pb-2 font-semibold">{p.colHotel}</th>
                  <th className="pb-2 font-semibold">{p.colGuest}</th>
                  <th className="pb-2 font-semibold">{p.colStatus}</th>
                  <th className="pb-2 font-semibold">{p.colPaymentId}</th>
                  <th className="pb-2 font-semibold">{p.colCharged}</th>
                  <th className="pb-2 font-semibold" />
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-white/80">
                {bookings.map((row) => (
                  <tr key={row.id}>
                    <td className="py-2.5 pe-3">{row.hotel_name}</td>
                    <td className="py-2.5 pe-3">{row.customer_name}</td>
                    <td className="py-2.5 pe-3 font-mono text-xs">
                      {row.payment_status || row.status}
                    </td>
                    <td className="py-2.5 pe-3 font-mono text-xs" dir="ltr">
                      {row.paymentId || "—"}
                    </td>
                    <td className="py-2.5 pe-3 font-mono text-xs" dir="ltr">
                      {row.charged_amount
                        ? `${row.charged_currency} ${row.charged_amount}`
                        : `${row.display_currency} ${row.display_amount}`}
                    </td>
                    <td className="py-2.5">
                      <div className="flex flex-wrap justify-end gap-1.5">
                        <button
                          type="button"
                          disabled={busyId === `retrieve:${row.id}`}
                          onClick={() => void runBookingAction("retrieve", row)}
                          className="inline-flex items-center gap-1 rounded-lg border border-white/10 px-2.5 py-1 text-xs text-white/75 hover:bg-white/5 disabled:opacity-50"
                        >
                          {busyId === `retrieve:${row.id}` ? (
                            <Loader2 size={12} className="animate-spin" />
                          ) : (
                            <RefreshCw size={12} />
                          )}
                          {p.refreshStatus}
                        </button>
                        {row.canRefund ? (
                          <button
                            type="button"
                            disabled={busyId === `refund:${row.id}`}
                            onClick={() => void runBookingAction("refund", row)}
                            className="inline-flex items-center gap-1 rounded-lg border border-rose-400/20 px-2.5 py-1 text-xs text-rose-200 hover:bg-rose-500/10 disabled:opacity-50"
                          >
                            {busyId === `refund:${row.id}` ? (
                              <Loader2 size={12} className="animate-spin" />
                            ) : (
                              <Undo2 size={12} />
                            )}
                            {p.refund}
                          </button>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

function SecretField(props: {
  label: string;
  value: string;
  shown: boolean;
  onToggle: () => void;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <label className={labelClass}>{props.label}</label>
      <div className="relative">
        <input
          type={props.shown ? "text" : "password"}
          value={props.value}
          onChange={(e) => props.onChange(e.target.value)}
          className={`${inputClass} pe-10 font-mono`}
          dir="ltr"
          autoComplete="off"
          onFocus={(e) => e.currentTarget.select()}
        />
        <button
          type="button"
          className="absolute end-2.5 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70"
          onClick={props.onToggle}
        >
          {props.shown ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>
    </div>
  );
}

function UrlRow(props: {
  label: string;
  value: string;
  help: string;
  copied: boolean;
  copyLabel: string;
  copiedLabel: string;
  onCopy: () => void;
}) {
  return (
    <div className="mb-3 last:mb-0">
      <label className={labelClass}>{props.label}</label>
      <div className="flex gap-2">
        <input value={props.value} readOnly className={`${inputClass} font-mono text-xs`} dir="ltr" />
        <button
          type="button"
          onClick={props.onCopy}
          className="inline-flex shrink-0 items-center gap-1 rounded-xl border border-white/10 px-3 text-xs text-white/80 hover:bg-white/5"
        >
          <Copy size={14} />
          {props.copied ? props.copiedLabel : props.copyLabel}
        </button>
      </div>
      <p className="mt-1.5 text-xs leading-5 text-white/40">{props.help}</p>
    </div>
  );
}
