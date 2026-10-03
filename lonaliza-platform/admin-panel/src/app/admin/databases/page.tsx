"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Database, Loader2, RefreshCw, Server } from "lucide-react";
import { useLocale } from "@/lib/i18n/LocaleProvider";

type DbStatus = {
  ok?: boolean;
  settings: {
    activeBackend: "pocketbase" | "postgres";
    standbySyncEnabled: boolean;
    lastCutoverAt?: string;
    lastSyncAt?: string;
    syncLagMs?: number;
  };
  pocketbase: { healthy: boolean; collectionsCount: number; error?: string };
  postgres: { ok: boolean; error?: string };
};

export default function DatabasesAdminPage() {
  const { t } = useLocale();
  const [data, setData] = useState<DbStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/databases", { cache: "no-store" });
      const json = (await res.json()) as DbStatus;
      setData(json);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const switchBackend = async (activeBackend: "pocketbase" | "postgres") => {
    const confirm = window.prompt(
      activeBackend === "postgres"
        ? 'اكتب CUTOVER لتفعيل PostgreSQL كمصدر الكتابة النشط'
        : 'اكتب CUTOVER للعودة إلى PocketBase'
    );
    if (confirm !== "CUTOVER") return;
    setBusy(true);
    setMessage("");
    try {
      const res = await fetch("/api/admin/databases", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ activeBackend, confirm: "CUTOVER" }),
      });
      const json = await res.json();
      if (!res.ok) {
        setMessage(json.error || "switch_failed");
        return;
      }
      setMessage("تم تحديث مصدر البيانات النشط");
      await load();
    } finally {
      setBusy(false);
    }
  };

  const runSync = async () => {
    setBusy(true);
    setMessage("");
    try {
      const res = await fetch("/api/admin/databases/sync", { method: "POST" });
      const json = await res.json();
      setMessage(res.ok ? "تم طلب المزامنة" : json.error || "sync_failed");
      await load();
    } finally {
      setBusy(false);
    }
  };

  const active = data?.settings.activeBackend || "pocketbase";

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div className="flex items-center gap-3">
        <Database className="text-primary" size={28} />
        <div>
          <h1 className="text-2xl font-bold text-foreground">إدارة قواعد البيانات</h1>
          <p className="text-sm text-muted-foreground">
            PocketBase + PostgreSQL — مصدر كتابة واحد نشط مع مزامنة احتياطية
          </p>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="animate-spin" size={18} /> {t("common.loading") || "جاري التحميل…"}
        </div>
      ) : null}

      {data ? (
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-border p-5 space-y-3 bg-card">
            <div className="flex items-center gap-2 font-semibold">
              <Server size={18} /> PocketBase
            </div>
            <p className="text-sm">
              {data.pocketbase.healthy ? "متصل" : "غير متاح"} — {data.pocketbase.collectionsCount} مجموعة
            </p>
            {data.pocketbase.error ? (
              <p className="text-xs text-destructive">{data.pocketbase.error}</p>
            ) : null}
          </div>
          <div className="rounded-2xl border border-border p-5 space-y-3 bg-card">
            <div className="flex items-center gap-2 font-semibold">
              <Database size={18} /> PostgreSQL
            </div>
            <p className="text-sm">{data.postgres.ok ? "متصل" : "غير مهيأ"}</p>
            {!data.postgres.ok && data.postgres.error ? (
              <p className="text-xs text-muted-foreground">{data.postgres.error}</p>
            ) : null}
          </div>
        </div>
      ) : null}

      <div className="rounded-2xl border border-border p-5 space-y-4 bg-card">
        <p className="text-sm">
          المصدر النشط: <strong>{active === "postgres" ? "PostgreSQL" : "PocketBase"}</strong>
        </p>
        {data?.settings.lastSyncAt ? (
          <p className="text-xs text-muted-foreground">آخر مزامنة: {data.settings.lastSyncAt}</p>
        ) : null}
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            disabled={busy || active === "pocketbase"}
            onClick={() => switchBackend("pocketbase")}
            className="px-4 py-2 rounded-xl bg-muted text-sm font-semibold disabled:opacity-50"
          >
            التشغيل على PocketBase
          </button>
          <button
            type="button"
            disabled={busy || active === "postgres"}
            onClick={() => switchBackend("postgres")}
            className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-semibold disabled:opacity-50"
          >
            التشغيل على PostgreSQL
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={runSync}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-border text-sm font-semibold"
          >
            <RefreshCw size={16} /> مزامنة الآن
          </button>
        </div>
        {message ? <p className="text-sm text-primary">{message}</p> : null}
      </div>

      <Link
        href="/admin/pocketbase"
        className="text-sm text-primary underline underline-offset-4"
      >
        إعدادات PocketBase التفصيلية (OAuth، Google، superuser)
      </Link>
    </div>
  );
}
