"use client";

import { useCallback, useEffect, useState } from "react";
import { ImageIcon, Loader2, RefreshCw, Sparkles } from "lucide-react";
import { adminGhostBtnClass, adminInputClass, adminLabelClass, adminPrimaryBtnClass } from "@/components/admin/ui/admin-ui-classes";
import { fetchPublishMedia, generatePublishImage, generatePublishVideo, uploadPublishFromUrl } from "./api";
import { PublishShell } from "./PublishShell";
import type { PublishMediaItem } from "./types";

export function PublishMedia() {
  const [items, setItems] = useState<PublishMediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [missing, setMissing] = useState(false);
  const [error, setError] = useState("");
  const [fromUrl, setFromUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadMsg, setUploadMsg] = useState("");
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiBusy, setAiBusy] = useState<"image" | "video" | "">("");

  const load = useCallback(async () => {
    const result = await fetchPublishMedia();
    setMissing(result.missing);
    setItems(result.data ?? []);
    setError(!result.ok && !result.missing ? result.error || "تعذّر تحميل المكتبة" : "");
    setLoading(false);
  }, []);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const result = await fetchPublishMedia();
      if (cancelled) return;
      setMissing(result.missing);
      setItems(result.data ?? []);
      setError(!result.ok && !result.missing ? result.error || "تعذّر تحميل المكتبة" : "");
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const ingestUrl = async () => {
    const url = fromUrl.trim();
    if (!url) return;
    setUploading(true);
    setUploadMsg("");
    const result = await uploadPublishFromUrl(url);
    if (result.missing) {
      setUploadMsg("واجهة الرفع من رابط غير متاحة بعد.");
    } else if (!result.ok) {
      setUploadMsg(result.error || "تعذّر حفظ الملف.");
    } else {
      setFromUrl("");
      setUploadMsg("تم حفظ الملف في مسار الاستوديو.");
      await load();
    }
    setUploading(false);
  };

  return (
    <PublishShell
      title="مكتبة وسائط النشر"
      description="صور وفيديو محرك النشر. الرفع من الرابط والاستوديو السياحي سيُربطان هنا عند جاهزية الواجهة."
      actions={
        <button
          type="button"
          className={adminGhostBtnClass}
          onClick={() => {
            setLoading(true);
            void load();
          }}
        >
          <RefreshCw className="size-4" />
          تحديث
        </button>
      }
    >
      <div className="mb-4 flex flex-col gap-2 sm:flex-row">
        <input
          dir="ltr"
          className={adminInputClass}
          value={fromUrl}
          onChange={(e) => setFromUrl(e.target.value)}
          placeholder="https://… رفع وسيط من رابط"
        />
        <button type="button" className={adminPrimaryBtnClass} disabled={uploading || !fromUrl.trim()} onClick={() => void ingestUrl()}>
          {uploading ? <Loader2 className="size-4 animate-spin" /> : null}
          إضافة من رابط
        </button>
      </div>
      {uploadMsg ? <p className="mb-4 text-xs text-admin-text-muted">{uploadMsg}</p> : null}

      <div className="mb-6 rounded-2xl border border-admin-border-subtle bg-admin-bg-subtle p-4">
        <label className={adminLabelClass}>توليد بالذكاء الاصطناعي</label>
        <textarea
          className={`${adminInputClass} mt-2 min-h-16 resize-y`}
          value={aiPrompt}
          onChange={(e) => setAiPrompt(e.target.value)}
          placeholder="وصف سياحي للصورة أو الفيديو…"
        />
        <div className="mt-2 flex flex-wrap gap-2">
          <button
            type="button"
            className={adminGhostBtnClass}
            disabled={Boolean(aiBusy) || !aiPrompt.trim()}
            onClick={async () => {
              setAiBusy("image");
              setUploadMsg("");
              const result = await generatePublishImage({ prompt: aiPrompt.trim(), aspectRatio: "4:5" });
              setAiBusy("");
              if (!result.ok) {
                setUploadMsg(result.error || "تعذّر توليد الصورة.");
                return;
              }
              setUploadMsg("وُلدت صورة وحُفظت في المكتبة.");
              await load();
            }}
          >
            {aiBusy === "image" ? <Loader2 className="size-4 animate-spin" /> : <Sparkles className="size-4" />}
            توليد صورة
          </button>
          <button
            type="button"
            className={adminGhostBtnClass}
            disabled={Boolean(aiBusy) || !aiPrompt.trim()}
            onClick={async () => {
              setAiBusy("video");
              setUploadMsg("");
              const result = await generatePublishVideo({ prompt: aiPrompt.trim(), identifier: "studio-generate" });
              setAiBusy("");
              if (!result.ok) {
                setUploadMsg(result.error || "تعذّر توليد الفيديو.");
                return;
              }
              setUploadMsg("وُلد فيديو وحُفظ في المكتبة.");
              await load();
            }}
          >
            {aiBusy === "video" ? <Loader2 className="size-4 animate-spin" /> : <Sparkles className="size-4" />}
            توليد فيديو
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex min-h-64 items-center justify-center rounded-2xl border border-admin-border-subtle bg-admin-bg-surface text-sm text-admin-text-muted">
          <Loader2 className="me-2 size-4 animate-spin" />
          جاري تحميل المكتبة…
        </div>
      ) : items.length === 0 ? (
        <div className="flex min-h-72 flex-col items-center justify-center rounded-3xl border border-dashed border-admin-border-subtle bg-admin-bg-surface px-6 text-center">
          <ImageIcon className="mb-3 size-10 text-[color:var(--admin-gold)]" />
          <h2 className="text-base font-black text-admin-text-primary">المكتبة فارغة</h2>
          <p className="mt-2 max-w-md text-sm leading-relaxed text-admin-text-muted">
            لا توجد ملفات في محرك النشر. لن نعرض صوراً تجريبية.
            {missing ? " واجهة `/api/admin/publish/media` غير متاحة بعد." : ""}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {items.map((item) => (
            <figure
              key={item.id}
              className="overflow-hidden rounded-2xl border border-admin-border-subtle bg-admin-bg-surface"
            >
              <div className="relative aspect-square bg-admin-bg-subtle">
                {item.thumbnail || item.url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={item.thumbnail || item.url}
                    alt={item.alt || item.name}
                    className="size-full object-cover"
                  />
                ) : (
                  <div className="flex size-full items-center justify-center text-admin-text-faint">
                    <ImageIcon className="size-8" />
                  </div>
                )}
              </div>
              <figcaption className="truncate px-2.5 py-2 text-[11px] font-semibold text-admin-text-muted">
                {item.name}
              </figcaption>
            </figure>
          ))}
        </div>
      )}
      {error ? <p className="mt-4 text-sm text-rose-600">{error}</p> : null}
    </PublishShell>
  );
}
