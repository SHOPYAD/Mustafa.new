"use client";

import AdminSwitch from "@/components/admin/AdminSwitch";
import {
  DEFAULT_CONTENT_SETTINGS,
} from "@/lib/automation/content/settings";
import type {
  ContentImageProvider,
  ContentJobSettings,
  ContentLocale,
  ContentSourceId,
} from "@/lib/automation/types";

const SOURCES: { id: ContentSourceId; label: string }[] = [
  { id: "trends", label: "Google Trends" },
  { id: "rss", label: "RSS عربي / تركي" },
  { id: "official", label: "سياحة تركيا الرسمية" },
];

const LOCALES: { id: ContentLocale; label: string }[] = [
  { id: "ar", label: "العربية" },
  { id: "en", label: "English" },
  { id: "tr", label: "Türkçe" },
];

const PROVIDERS: { id: ContentImageProvider; label: string }[] = [
  { id: "auto", label: "تلقائي (Unsplash ثم Pexels ثم ويكيميديا)" },
  { id: "unsplash", label: "Unsplash" },
  { id: "pexels", label: "Pexels" },
  { id: "wikimedia", label: "Wikimedia Commons" },
];

const fieldClass =
  "w-full px-3.5 py-2.5 bg-slate-950/60 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/40";
const labelClass = "block text-[11px] font-semibold text-white/40 mb-1.5 uppercase tracking-wider";

export type ContentJobFieldsValue = ContentJobSettings;

function toggleIn<T extends string>(list: T[] | undefined, id: T, fallback: T[]): T[] {
  const current = list?.length ? list : fallback;
  return current.includes(id)
    ? current.filter((x) => x !== id)
    : [...current, id];
}

export function ContentJobFields({
  value,
  onChange,
}: {
  value: ContentJobFieldsValue;
  onChange: (next: ContentJobFieldsValue) => void;
}) {
  const merged = { ...DEFAULT_CONTENT_SETTINGS, ...value };
  const patch = (partial: Partial<ContentJobSettings>) =>
    onChange({ ...merged, ...partial });

  return (
    <section className="rounded-2xl border border-white/10 bg-slate-900/60 p-5 space-y-5">
      <div>
        <h2 className="text-lg font-bold text-white">محتوى</h2>
        <p className="text-sm text-white/45 mt-1">
          مصادر الاكتشاف، اللغات، النشر، الصور، والحد الأدنى للكلمات. AUTO-CORE يمرّر هذه الحقول إلى معالجات المقالات والرحلات والبرامج والأنشطة.
        </p>
      </div>

      <div>
        <span className={labelClass}>المصادر</span>
        <div className="flex flex-wrap gap-2">
          {SOURCES.map((source) => {
            const on = (merged.sources || []).includes(source.id);
            return (
              <button
                key={source.id}
                type="button"
                onClick={() =>
                  patch({
                    sources: toggleIn(merged.sources, source.id, DEFAULT_CONTENT_SETTINGS.sources),
                  })
                }
                className={`px-3 py-1.5 rounded-full text-xs font-semibold border ${
                  on
                    ? "bg-amber-500/20 border-amber-400/40 text-amber-100"
                    : "bg-white/5 border-white/10 text-white/50"
                }`}
              >
                {source.label}
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <span className={labelClass}>اللغات</span>
        <div className="flex flex-wrap gap-2">
          {LOCALES.map((locale) => {
            const on = (merged.locales || []).includes(locale.id);
            return (
              <button
                key={locale.id}
                type="button"
                onClick={() =>
                  patch({
                    locales: toggleIn(merged.locales, locale.id, DEFAULT_CONTENT_SETTINGS.locales),
                  })
                }
                className={`px-3 py-1.5 rounded-full text-xs font-semibold border ${
                  on
                    ? "bg-teal-500/20 border-teal-400/40 text-teal-100"
                    : "bg-white/5 border-white/10 text-white/50"
                }`}
              >
                {locale.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <label>
          <span className={labelClass}>عدد العناصر في التشغيل</span>
          <input
            type="number"
            min={1}
            max={8}
            className={fieldClass}
            value={merged.count}
            onChange={(e) => patch({ count: Number(e.target.value) || 1 })}
          />
        </label>
        <label>
          <span className={labelClass}>الحد الأدنى للكلمات (عربي)</span>
          <input
            type="number"
            min={800}
            max={4000}
            className={fieldClass}
            value={merged.minWords}
            onChange={(e) => patch({ minWords: Number(e.target.value) || 1200 })}
          />
        </label>
        <label className="sm:col-span-2">
          <span className={labelClass}>موفّر الصور</span>
          <select
            className={fieldClass}
            value={merged.imageProvider}
            onChange={(e) =>
              patch({ imageProvider: e.target.value as ContentImageProvider })
            }
          >
            {PROVIDERS.map((p) => (
              <option key={p.id} value={p.id}>
                {p.label}
              </option>
            ))}
          </select>
        </label>
        <label className="sm:col-span-2">
          <span className={labelClass}>النشر في (اختياري)</span>
          <input
            type="datetime-local"
            className={fieldClass}
            value={merged.publishAt ? merged.publishAt.slice(0, 16) : ""}
            onChange={(e) =>
              patch({
                publishAt: e.target.value
                  ? new Date(e.target.value).toISOString()
                  : undefined,
              })
            }
          />
        </label>
      </div>

      <AdminSwitch
        checked={Boolean(merged.autoPublish)}
        onChange={(autoPublish) => patch({ autoPublish, draft: !autoPublish })}
        label="نشر تلقائي"
        description="المقالات تُنشر على /blog. الرحلات/البرامج/الأنشطة تبقى مسودة ما لم يُفعَّل هذا الخيار."
      />
      <AdminSwitch
        checked={Boolean(merged.draft) && !merged.autoPublish}
        onChange={(draft) => patch({ draft, autoPublish: draft ? false : merged.autoPublish })}
        label="حفظ كمسودة"
        description="الخيار الآمن الافتراضي للمراجعة قبل الظهور للزوار."
      />
      <AdminSwitch
        checked={Boolean(merged.dryRun)}
        onChange={(dryRun) => patch({ dryRun })}
        label="تجربة جافة"
        description="يكتب قائمة المواضيع ومسودة المقال JSON دون مفاتيح مدفوعة ودون نشر حي."
      />
    </section>
  );
}

export default ContentJobFields;
