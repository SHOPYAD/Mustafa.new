"use client";

import { useEffect, useState } from "react";
import { AlertCircle, Check, Loader2, Sparkles, Trash2, X } from "lucide-react";
import { useLocale } from "@/lib/i18n/LocaleProvider";

export default function DemoSeedBanner() {
  const { dir } = useLocale();
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [deletedMsg, setDeletedMsg] = useState(false);

  useEffect(() => {
    void (async () => {
      try {
        const res = await fetch("/api/admin/demo-seed", { cache: "no-store" });
        const data = (await res.json()) as { ok?: boolean; total?: number };
        if (data?.ok && data.total && data.total > 0) {
          setTotal(data.total);
        }
      } catch {
        /* non-blocking */
      }
    })();
  }, []);

  const handleDeleteAll = async () => {
    if (!confirm(`هل أنت متأكد من رغبتك في حذف كافة البيانات التجريبية (${total} عنصر) نهائياً؟`)) {
      return;
    }
    try {
      setDeleting(true);
      const res = await fetch("/api/admin/demo-seed", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "delete_all" }),
      });
      const data = (await res.json()) as { ok?: boolean };
      if (data?.ok) {
        setTotal(0);
        setDeletedMsg(true);
        setTimeout(() => setDeletedMsg(false), 4000);
      }
    } catch {
      alert("حدث خطأ أثناء حذف البيانات التجريبية");
    } finally {
      setDeleting(false);
    }
  };

  if (dismissed || (total === 0 && !deletedMsg)) return null;

  return (
    <div
      className="mb-4 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 text-xs text-foreground backdrop-blur-md flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 shadow-sm"
      dir={dir}
    >
      <div className="flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-500/20 text-amber-500 shrink-0">
          <Sparkles className="h-4 w-4" />
        </div>
        <div>
          <p className="font-bold text-foreground">
            {deletedMsg
              ? "تم حذف كافة البيانات التجريبية بنجاح!"
              : `بيانات تجريبية نشطة (${total} عنصر ديمو)`}
          </p>
          <p className="text-muted-foreground mt-0.5">
            {deletedMsg
              ? "أصبح موقعك الآن فارغاً وجاهزاً لإضافة باقاتك وعروضك الخاصة."
              : "يتضمن موقعك باقات ومقالات تجريبية للمعاينة. يمكنك الإبقاء عليها لتعديلها أو حذفها جماعياً."}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 self-end sm:self-auto">
        {!deletedMsg && (
          <button
            type="button"
            onClick={() => void handleDeleteAll()}
            disabled={deleting}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-red-500 text-white font-semibold hover:bg-red-600 disabled:opacity-50 transition-colors shrink-0"
          >
            {deleting ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Trash2 className="h-3.5 w-3.5" />
            )}
            <span>حذف البيانات التجريبية بضغطة زر</span>
          </button>
        )}

        <button
          type="button"
          onClick={() => setDismissed(true)}
          className="p-1.5 text-muted-foreground hover:bg-secondary rounded-lg transition-colors"
          title="إغلاق التنبيه"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
