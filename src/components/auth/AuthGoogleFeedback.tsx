"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { useCustomerAuth } from "@/components/auth/CustomerAuthProvider";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import type { Dictionary } from "@/lib/i18n/types";

const FAIL_REASONS = new Set<string>([
  "google_failed",
  "google_denied",
  "google_expired",
  "google_disabled",
  "google_config",
  "access_denied",
]);

function messageFor(reason: string, t: Dictionary): string {
  switch (reason) {
    case "google_denied":
    case "access_denied":
      return t.auth.googleDenied;
    case "google_expired":
      return t.auth.googleExpired;
    case "google_disabled":
      return t.auth.googleDisabled;
    case "google_config":
      return t.auth.googleConfig;
    case "google_failed":
      return t.auth.googleFailed;
    default:
      return t.auth.googleFailed;
  }
}

export default function AuthGoogleFeedback() {
  const { openAuth, setAuthNotice, refresh } = useCustomerAuth();
  const { t } = useLocale();
  const [banner, setBanner] = useState("");

  useEffect(() => {
    const url = new URL(window.location.href);
    const auth = url.searchParams.get("auth") || "";
    const reasonParam = url.searchParams.get("reason") || "";
    const failedFlag = url.searchParams.has("auth-google-failed");
    const reason = reasonParam || auth;
    const failed = failedFlag || FAIL_REASONS.has(reason);

    if (failed) {
      const text = FAIL_REASONS.has(reason)
        ? messageFor(reason, t)
        : t.auth.googleFailed;
      setBanner(text);
      setAuthNotice(text);
      openAuth("login");
      url.searchParams.delete("auth-google-failed");
      url.searchParams.delete("reason");
      url.searchParams.delete("auth");
      const next = `${url.pathname}${url.search}${url.hash}`;
      window.history.replaceState(null, "", next);
      return;
    }

    if (auth === "ok") {
      void refresh();
      url.searchParams.delete("auth");
      window.history.replaceState(
        null,
        "",
        `${url.pathname}${url.search}${url.hash}`
      );
    }
  }, [openAuth, refresh, setAuthNotice, t]);

  if (!banner) return null;

  return (
    <div
      role="alert"
      className="fixed inset-x-0 top-20 z-[230] flex justify-center px-4"
    >
      <div className="flex max-w-lg items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-800 shadow-lg">
        <p className="flex-1">{banner}</p>
        <button
          type="button"
          className="rounded-full p-1 text-red-500 hover:bg-red-100"
          aria-label={t.common.cancel}
          onClick={() => setBanner("")}
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
}
