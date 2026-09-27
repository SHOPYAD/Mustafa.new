"use client";

import { useState } from "react";

/**
 * Isolated branded maintenance page for the mobile WebView shell.
 * Do not import flight/social/profile/package UI here.
 */
export default function MaintenancePage() {
  const [busy, setBusy] = useState(false);

  async function retry() {
    if (busy) return;
    setBusy(true);
    try {
      const res = await fetch("/api/mobile/v1/shell-health", {
        cache: "no-store",
        headers: { "x-lonaliza-app": "1" },
      });
      if (res.ok) {
        const next = new URLSearchParams(window.location.search).get("next") || "/?app=1";
        window.location.replace(next);
        return;
      }
    } catch {
      /* stay */
    }
    setBusy(false);
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "32px 22px",
        background: "linear-gradient(180deg, #2e1065 0%, #1a0a36 52%, #140522 100%)",
        color: "#fff",
        textAlign: "center",
      }}
    >
      <div style={{ width: "min(440px, 100%)" }}>
        <div
          style={{
            width: 96,
            height: 96,
            margin: "0 auto 22px",
            borderRadius: 999,
            border: "1.5px solid rgba(245, 158, 11, 0.5)",
            background: "rgba(255,255,255,0.08)",
            display: "grid",
            placeItems: "center",
            fontSize: 34,
            fontWeight: 800,
            color: "#f59e0b",
          }}
        >
          L
        </div>
        <div
          style={{
            display: "inline-block",
            marginBottom: 14,
            padding: "5px 12px",
            borderRadius: 999,
            fontSize: 11,
            letterSpacing: 1.6,
            fontWeight: 800,
            color: "#fbbf24",
            border: "1px solid rgba(245,158,11,0.45)",
            background: "rgba(245,158,11,0.16)",
          }}
        >
          LONALIZA
        </div>
        <h1 style={{ margin: "0 0 12px", fontSize: 26, lineHeight: 1.35 }}>
          تحديث مجدول قيد التنفيذ
        </h1>
        <p style={{ margin: "0 0 22px", color: "rgba(255,255,255,0.74)", lineHeight: 1.6, fontSize: 15 }}>
          نُجري تحديثاً قصيراً ومجدولاً لتجربة لوناليزا. عُد خلال لحظات ولن تحتاج لإعادة فتح التطبيق.
        </p>
        <button
          type="button"
          onClick={retry}
          disabled={busy}
          style={{
            width: "100%",
            border: 0,
            borderRadius: 16,
            padding: "14px 18px",
            background: "#f59e0b",
            color: "#140522",
            fontWeight: 800,
            fontSize: 15,
            cursor: busy ? "wait" : "pointer",
            opacity: busy ? 0.55 : 1,
          }}
        >
          {busy ? "جارٍ التحقق…" : "إعادة التحميل"}
        </button>
        <p style={{ marginTop: 12, color: "rgba(255,255,255,0.48)", fontSize: 12 }}>
          لن يتم إغلاق التطبيق. نتحقق من جاهزية الخادم ثم نعيد جلستك.
        </p>
      </div>
    </main>
  );
}
