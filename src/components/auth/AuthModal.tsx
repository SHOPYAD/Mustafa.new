"use client";

import { useEffect, useState } from "react";
import { Loader2, X } from "lucide-react";
import { useCustomerAuth } from "@/components/auth/CustomerAuthProvider";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import {
  getPublicGoogleAuthEnabled,
  setPublicGoogleAuthEnabled,
} from "@/lib/public-config";
import GoogleMark from "@/components/auth/GoogleMark";

export default function AuthModal() {
  const { modalOpen, modalMode, closeAuth, openAuth, refresh, authNotice } =
    useCustomerAuth();
  const { t } = useLocale();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
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
    setSaving(true);
    setError("");
    try {
      const res = await fetch(isRegister ? "/api/auth/register" : "/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, phone, password }),
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
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-orange-400"
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
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-orange-400"
              />
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder={t.auth.phone}
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-orange-400"
              />
            </>
          ) : null}
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={t.auth.email}
            className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-orange-400"
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={t.auth.password}
            className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-orange-400"
          />
        </div>

        {error || authNotice ? (
          <p className="mt-3 text-sm text-red-600">{error || authNotice}</p>
        ) : null}

        <button
          type="button"
          onClick={() => void submit()}
          disabled={saving}
          className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 py-3 text-sm font-bold text-white disabled:opacity-60"
        >
          {saving ? <Loader2 size={16} className="animate-spin" /> : null}
          {isRegister ? t.auth.register : t.auth.login}
        </button>

        {googleEnabled ? (
          <a
            href="/api/auth/google?next=/account"
            className="mt-3 flex w-full items-center justify-center gap-2.5 rounded-xl border border-slate-200 bg-white py-3 text-sm font-semibold text-slate-800 hover:bg-slate-50"
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
            className="font-semibold text-orange-600"
            onClick={() => openAuth(isRegister ? "login" : "register")}
          >
            {isRegister ? t.auth.login : t.auth.register}
          </button>
        </p>
          </>
        )}
      </div>
    </div>
  );
}
