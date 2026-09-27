"use client";

import { useEffect, useState } from "react";
import { Loader2, X, MessageCircle, ShieldCheck, CheckSquare, Square } from "lucide-react";
import { useCustomerAuth } from "@/components/auth/CustomerAuthProvider";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import {
  getPublicGoogleAuthEnabled,
  setPublicGoogleAuthEnabled,
} from "@/lib/public-config";
import GoogleMark from "@/components/auth/GoogleMark";
import TermsModal, { type LegalTab } from "@/components/auth/TermsModal";

export default function AuthModal() {
  const { modalOpen, modalMode, closeAuth, openAuth, refresh, authNotice } =
    useCustomerAuth();
  const { t, dir } = useLocale();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [termsModalOpen, setTermsModalOpen] = useState(false);
  const [termsModalTab, setTermsModalTab] = useState<LegalTab>("terms");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [googleEnabled, setGoogleEnabled] = useState(getPublicGoogleAuthEnabled);
  const [otpTo, setOtpTo] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [otpDone, setOtpDone] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const res = await fetch("/api/public-config", { cache: "no-store" });
        const data = (await res.json()) as {
          ok?: boolean;
          googleAuthEnabled?: boolean;
        };
        if (!cancelled && data?.ok) {
          const on = Boolean(data.googleAuthEnabled);
          setPublicGoogleAuthEnabled(on);
          setGoogleEnabled(on);
        }
      } catch {
        /* keep current */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    setOtpTo("");
    setOtpCode("");
    setOtpDone(false);
    setAgreedToTerms(false);
    setError("");
  }, [modalMode, modalOpen]);

  if (!modalOpen) return null;

  const isRegister = modalMode === "register";

  const confirmOtp = async () => {
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/auth/otp/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ to: otpTo, code: otpCode, purpose: "register" }),
      });
      const data = (await res.json()) as { ok?: boolean };
      if (!res.ok || !data.ok) {
        setError(t.auth.otpFailed);
        return;
      }
      setOtpDone(true);
      closeAuth();
    } catch {
      setError(t.auth.otpFailed);
    } finally {
      setSaving(false);
    }
  };

  const submit = async () => {
    if (isRegister) {
      if (!name.trim()) {
        setError(t.auth.fullName + " مطلوب");
        return;
      }
      if (!phone.trim() || phone.replace(/\D/g, "").length < 8) {
        setError(t.auth.whatsappRequired);
        return;
      }
      if (!agreedToTerms) {
        setError(t.auth.termsRequired);
        return;
      }
    }

    setSaving(true);
    setError("");
    try {
      const res = await fetch(isRegister ? "/api/auth/register" : "/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          phone,
          password,
          termsAgreed: agreedToTerms,
        }),
      });
      const data = (await res.json()) as {
        ok?: boolean;
        error?: string;
        otpSent?: boolean;
        otpTo?: string;
      };
      if (!res.ok || !data.ok) {
        setError(data.error || t.auth.failed);
        return;
      }
      await refresh();
      if (isRegister && data.otpSent && data.otpTo) {
        setOtpTo(data.otpTo);
        return;
      }
      closeAuth();
    } catch {
      setError(t.auth.failed);
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-[240] flex items-center justify-center p-4">
        <button
          type="button"
          className="absolute inset-0 bg-slate-950/60"
          aria-label={t.common.cancel}
          onClick={closeAuth}
        />
        <div className="relative w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
          <button
            type="button"
            onClick={closeAuth}
            className="absolute top-4 end-4 rounded-full p-1.5 text-slate-400 hover:bg-slate-100"
            aria-label={t.common.cancel}
          >
            <X size={18} />
          </button>
          <h2 className="text-2xl font-bold text-slate-900 mb-1">
            {otpTo ? t.auth.otpTitle : isRegister ? t.auth.registerTitle : t.auth.loginTitle}
          </h2>
          <p className="text-sm text-slate-500 mb-5">{otpTo ? t.auth.otpHint : t.auth.subtitle}</p>

          {otpTo ? (
            <div className="space-y-3">
              <input
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value)}
                placeholder={t.auth.otpCode}
                inputMode="numeric"
                autoComplete="one-time-code"
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-emerald-500"
              />
              {error ? <p className="text-sm text-red-600">{error}</p> : null}
              <button
                type="button"
                onClick={() => void confirmOtp()}
                disabled={saving || otpDone}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 py-3 text-sm font-bold text-white disabled:opacity-60"
              >
                {saving ? <Loader2 size={16} className="animate-spin" /> : null}
                {t.auth.otpVerify}
              </button>
              <button
                type="button"
                onClick={closeAuth}
                className="flex w-full items-center justify-center rounded-xl border border-slate-200 py-3 text-sm font-semibold text-slate-600"
              >
                {t.auth.otpSkip}
              </button>
            </div>
          ) : (
            <>
              <div className="space-y-3">
                {isRegister ? (
                  <>
                    <input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder={t.auth.fullName}
                      className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                    <div className="relative">
                      <input
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder={`${t.auth.phone} (WhatsApp e.g. +90501...)`}
                        className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-emerald-500 pe-10"
                      />
                      <div className="absolute top-3 end-3 text-emerald-600">
                        <MessageCircle size={18} />
                      </div>
                    </div>
                  </>
                ) : null}
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t.auth.email}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t.auth.password}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-emerald-500"
                />

                {isRegister && (
                  <div className="pt-1">
                    <label className="flex items-start gap-2.5 cursor-pointer text-xs text-slate-600 select-none">
                      <button
                        type="button"
                        onClick={() => setAgreedToTerms(!agreedToTerms)}
                        className="mt-0.5 text-purple-700 shrink-0"
                      >
                        {agreedToTerms ? (
                          <CheckSquare size={16} className="text-purple-700" />
                        ) : (
                          <Square size={16} className="text-slate-400" />
                        )}
                      </button>
                      <span className="leading-relaxed text-[11px] sm:text-xs text-slate-700">
                        {dir === "rtl" ? "أوافق على" : "I agree to the"}{" "}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            setTermsModalTab("terms");
                            setTermsModalOpen(true);
                          }}
                          className="font-bold text-purple-900 underline hover:text-amber-600"
                        >
                          {t.common.terms}
                        </button>
                        {", "}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            setTermsModalTab("privacy");
                            setTermsModalOpen(true);
                          }}
                          className="font-bold text-purple-900 underline hover:text-amber-600"
                        >
                          {t.common.privacy}
                        </button>
                        {", "}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            setTermsModalTab("gdpr");
                            setTermsModalOpen(true);
                          }}
                          className="font-bold text-purple-900 underline hover:text-amber-600"
                        >
                          {dir === "rtl" ? "قوانين حماية البيانات (GDPR)" : "GDPR Compliance"}
                        </button>
                        {" "}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            setTermsModalTab("whatsapp");
                            setTermsModalOpen(true);
                          }}
                          className="text-slate-600 hover:text-purple-900 underline"
                        >
                          {dir === "rtl" ? "واستقبال إشعارات الحجز عبر الواتساب" : "and WhatsApp alerts"}
                        </button>
                      </span>
                    </label>
                  </div>
                )}
              </div>

              {error || authNotice ? (
                <p className="mt-3 text-sm text-red-600">{error || authNotice}</p>
              ) : null}

              <button
                type="button"
                onClick={() => void submit()}
                disabled={saving}
                className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#1b0833] via-[#280c4c] to-[#16062a] hover:from-purple-900 hover:to-purple-950 py-3 text-sm font-bold text-white shadow-lg shadow-purple-950/20 transition-all disabled:opacity-60 cursor-pointer"
              >
                {saving ? <Loader2 size={16} className="animate-spin" /> : null}
                {isRegister ? t.auth.register : t.auth.login}
              </button>

              {googleEnabled ? (
                <a
                  href="/api/auth/google?next=/account"
                  className="mt-3 flex w-full items-center justify-center gap-2.5 rounded-xl border border-slate-200 bg-white py-3 text-sm font-semibold text-slate-800 hover:bg-slate-50 shadow-2xs"
                >
                  <GoogleMark size={18} />
                  {t.auth.googleLogin}
                </a>
              ) : (
                <button
                  type="button"
                  disabled
                  title={t.auth.googleEnableHint}
                  className="mt-3 flex w-full items-center justify-center rounded-xl border border-slate-200 bg-slate-50 py-3 text-sm font-semibold text-slate-400"
                >
                  {t.auth.googleSoon}
                </button>
              )}

              <p className="mt-4 text-center text-sm text-slate-500">
                {isRegister ? t.auth.haveAccount : t.auth.needAccount}{" "}
                <button
                  type="button"
                  className="font-bold text-purple-900 hover:text-amber-600"
                  onClick={() => openAuth(isRegister ? "login" : "register")}
                >
                  {isRegister ? t.auth.login : t.auth.register}
                </button>
              </p>
            </>
          )}
        </div>
      </div>

      <TermsModal
        open={termsModalOpen}
        initialTab={termsModalTab}
        onClose={() => setTermsModalOpen(false)}
        onAccept={() => {
          setAgreedToTerms(true);
        }}
      />
    </>
  );
}

