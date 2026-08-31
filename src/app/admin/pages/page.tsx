"use client";

import { useCallback, useEffect, useState } from "react";
import {
  FileText,
  Loader2,
  Pencil,
  Plus,
  Trash2,
  ExternalLink,
  Scan,
} from "lucide-react";
import { AdminCopilotPanel } from "@/components/admin/copilot";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import type { CustomPage, CustomPageInput } from "@/types/custom-page";
import {
  NAV_PLACEMENTS,
  flagsFromPlacement,
  placementFromFlags,
  type NavPlacement,
} from "@/data/nav-visibility";

type FormState = {
  id?: string;
  slug: string;
  titleAr: string;
  titleEn: string;
  bodyAr: string;
  bodyEn: string;
  seoTitle: string;
  seoDescription: string;
  published: boolean;
  showInHeader: boolean;
  showInFooter: boolean;
};

const emptyForm = (): FormState => ({
  slug: "",
  titleAr: "",
  titleEn: "",
  bodyAr: "",
  bodyEn: "",
  seoTitle: "",
  seoDescription: "",
  published: true,
  showInHeader: false,
  showInFooter: false,
});

const inputClass =
  "w-full px-3.5 py-2.5 bg-slate-950/60 border border-white/10 rounded-xl text-white placeholder-white/25 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 text-sm";

const labelClass =
  "block text-[11px] font-semibold text-white/35 mb-1.5 uppercase tracking-wider";

function pagePlacementLabel(
  page: Pick<CustomPage, "showInHeader" | "showInFooter">,
  labels: {
    placeHeaderFooter: string;
    placeHeader: string;
    placeFooter: string;
    placeHidden: string;
  }
): string {
  const placement = placementFromFlags(page.showInHeader, page.showInFooter);
  switch (placement) {
    case "header-footer":
      return labels.placeHeaderFooter;
    case "header":
      return labels.placeHeader;
    case "footer":
      return labels.placeFooter;
    case "hidden":
      return labels.placeHidden;
    default: {
      const _never: never = placement;
      return _never;
    }
  }
}

function pageToForm(page: CustomPage): FormState {
  return {
    id: page.id,
    slug: page.slug,
    titleAr: page.titleAr,
    titleEn: page.titleEn,
    bodyAr: page.bodyAr,
    bodyEn: page.bodyEn,
    seoTitle: page.seoTitle,
    seoDescription: page.seoDescription,
    published: page.published,
    showInHeader: page.showInHeader,
    showInFooter: page.showInFooter,
  };
}

export default function AdminPagesPage() {
  const { t } = useLocale();
  const [pages, setPages] = useState<CustomPage[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm());
  const [editorOpen, setEditorOpen] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/pages", { cache: "no-store" });
      const data = await res.json();
      if (data?.ok && Array.isArray(data.pages)) {
        setPages(data.pages as CustomPage[]);
      }
    } catch {
      setMessage(t.admin.pagesLoadFailed);
    } finally {
      setLoading(false);
    }
  }, [t.admin.pagesLoadFailed]);

  useEffect(() => {
    void load();
  }, [load]);

  const openNew = () => {
    setForm(emptyForm());
    setEditorOpen(true);
    setMessage(null);
  };

  const openEdit = (page: CustomPage) => {
    setForm(pageToForm(page));
    setEditorOpen(true);
    setMessage(null);
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);
    const payload: CustomPageInput & { id?: string } = {
      id: form.id,
      slug: form.slug,
      titleAr: form.titleAr,
      titleEn: form.titleEn,
      bodyAr: form.bodyAr,
      bodyEn: form.bodyEn,
      seoTitle: form.seoTitle,
      seoDescription: form.seoDescription,
      published: form.published,
      showInHeader: form.showInHeader,
      showInFooter: form.showInFooter,
    };
    try {
      const res = await fetch("/api/admin/pages", {
        method: form.id ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!data?.ok) {
        setMessage(data?.error || t.admin.pagesSaveFailed);
        return;
      }
      setMessage(t.admin.pagesSaved);
      setEditorOpen(false);
      setForm(emptyForm());
      await load();
    } catch {
      setMessage(t.admin.pagesSaveFailed);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/pages?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!data?.ok) {
        setMessage(data?.error || t.admin.pagesDeleteFailed);
        return;
      }
      setDeleteId(null);
      await load();
    } catch {
      setMessage(t.admin.pagesDeleteFailed);
    }
  };

  return (
    <div className="admin-page grid w-full max-w-none min-w-0 grid-cols-1 gap-6 xl:grid-cols-12">
      <div className="xl:col-span-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <FileText className="text-emerald-400" size={28} />
              {t.admin.pages}
            </h1>
            <p className="text-white/50 mt-1">{t.admin.pagesSubtitle}</p>
          </div>
          <button
            type="button"
            onClick={openNew}
            className="px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold rounded-xl shadow-lg inline-flex items-center gap-2"
          >
            <Plus size={18} />
            {t.admin.pagesNew}
          </button>
        </div>

        {message ? (
          <p className="mb-4 text-sm text-emerald-300/90">{message}</p>
        ) : null}

        {loading ? (
          <div className="flex items-center gap-2 text-white/40">
            <Loader2 className="animate-spin" size={18} />
            {t.admin.loading}
          </div>
        ) : pages.length === 0 && !editorOpen ? (
          <div className="bg-slate-900/80 border border-white/5 rounded-2xl px-6 py-16 text-center text-white/35">
            {t.admin.pagesEmpty}
          </div>
        ) : (
          <div className="bg-slate-900/80 border border-white/5 rounded-2xl overflow-hidden mb-6">
            {pages.map((page) => (
              <div
                key={page.id}
                className="flex flex-col md:flex-row md:items-center gap-3 px-5 py-4 border-b border-white/5"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-white font-medium truncate">
                    {page.titleAr || page.titleEn}
                  </p>
                  <p className="text-white/35 text-xs truncate">
                    /p/{page.slug}
                    {page.published ? ` · ${t.common.publish}` : ` · ${t.common.draft}`}
                    {` · ${pagePlacementLabel(page, t.menuVisibility)}`}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <a
                    href={`/admin/homepage-editor?page=custom:${page.slug}`}
                    className="w-9 h-9 bg-violet-500/10 hover:bg-violet-500/20 rounded-lg flex items-center justify-center text-violet-300"
                    title={t.admin.visualAiEditor}
                  >
                    <Scan size={14} />
                  </a>
                  {page.published ? (
                    <a
                      href={`/p/${page.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-9 h-9 bg-white/5 hover:bg-white/10 rounded-lg flex items-center justify-center text-white/50"
                    >
                      <ExternalLink size={14} />
                    </a>
                  ) : null}
                  <button
                    type="button"
                    onClick={() => openEdit(page)}
                    className="w-9 h-9 bg-blue-500/10 hover:bg-blue-500/20 rounded-lg flex items-center justify-center text-blue-400"
                  >
                    <Pencil size={14} />
                  </button>
                  {deleteId === page.id ? (
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => void handleDelete(page.id)}
                        className="px-3 py-1.5 bg-red-500/20 text-red-400 text-xs font-semibold rounded-lg"
                      >
                        {t.common.delete}
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteId(null)}
                        className="px-3 py-1.5 bg-white/5 text-white/50 text-xs rounded-lg"
                      >
                        {t.common.cancel}
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setDeleteId(page.id)}
                      className="w-9 h-9 bg-red-500/10 hover:bg-red-500/20 rounded-lg flex items-center justify-center text-red-400"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {editorOpen ? (
          <div className="bg-slate-900/80 border border-white/10 rounded-2xl p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>{t.admin.pagesTitleAr}</label>
                <input
                  className={inputClass}
                  value={form.titleAr}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, titleAr: e.target.value }))
                  }
                />
              </div>
              <div>
                <label className={labelClass}>{t.admin.pagesTitleEn}</label>
                <input
                  className={inputClass}
                  value={form.titleEn}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, titleEn: e.target.value }))
                  }
                />
              </div>
              <div>
                <label className={labelClass}>{t.admin.pagesSlug}</label>
                <input
                  className={inputClass}
                  value={form.slug}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, slug: e.target.value }))
                  }
                  placeholder="privacy-policy"
                />
              </div>
              <div>
                <label className={labelClass}>{t.admin.pagesSeoTitle}</label>
                <input
                  className={inputClass}
                  value={form.seoTitle}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, seoTitle: e.target.value }))
                  }
                />
              </div>
              <div className="md:col-span-2">
                <label className={labelClass}>
                  {t.admin.pagesSeoDescription}
                </label>
                <input
                  className={inputClass}
                  value={form.seoDescription}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      seoDescription: e.target.value,
                    }))
                  }
                />
              </div>
              <div className="md:col-span-2">
                <label className={labelClass}>{t.admin.pagesBodyAr}</label>
                <textarea
                  className={`${inputClass} min-h-[160px]`}
                  value={form.bodyAr}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, bodyAr: e.target.value }))
                  }
                />
              </div>
              <div className="md:col-span-2">
                <label className={labelClass}>{t.admin.pagesBodyEn}</label>
                <textarea
                  className={`${inputClass} min-h-[160px]`}
                  value={form.bodyEn}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, bodyEn: e.target.value }))
                  }
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-4 text-sm text-white/70">
              <label className="inline-flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={form.published}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      published: e.target.checked,
                    }))
                  }
                />
                {t.common.publish}
              </label>
              <label className="flex min-w-[14rem] flex-col gap-1.5 text-sm text-white/70">
                <span>{t.menuVisibility.title}</span>
                <select
                  value={placementFromFlags(form.showInHeader, form.showInFooter)}
                  onChange={(e) => {
                    const next = flagsFromPlacement(e.target.value as NavPlacement);
                    setForm((prev) => ({ ...prev, ...next }));
                  }}
                  className="rounded-lg border border-white/10 bg-slate-950/70 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
                >
                  {NAV_PLACEMENTS.map((placement) => {
                    const label = (() => {
                      switch (placement) {
                        case "header-footer":
                          return t.menuVisibility.placeHeaderFooter;
                        case "header":
                          return t.menuVisibility.placeHeader;
                        case "footer":
                          return t.menuVisibility.placeFooter;
                        case "hidden":
                          return t.menuVisibility.placeHidden;
                        default: {
                          const _never: never = placement;
                          return _never;
                        }
                      }
                    })();
                    return (
                      <option key={placement} value={placement}>
                        {label}
                      </option>
                    );
                  })}
                </select>
              </label>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => void handleSave()}
                disabled={saving}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl disabled:opacity-60"
              >
                {saving ? t.admin.loading : t.common.save}
              </button>
              <button
                type="button"
                onClick={() => {
                  setEditorOpen(false);
                  setForm(emptyForm());
                }}
                className="px-5 py-2.5 bg-white/5 text-white/60 rounded-xl"
              >
                {t.common.cancel}
              </button>
            </div>
          </div>
        ) : null}
      </div>

      <div className="xl:col-span-4">
        <div className="min-h-[420px] overflow-hidden rounded-2xl border border-white/10 bg-slate-900/80">
          <AdminCopilotPanel
            scope="pages"
            title={t.admin.pagesAiTitle}
            hint={`${t.admin.pagesAiHint} ${t.builderAgent.isolated}`}
            placeholder={t.admin.pagesAiPlaceholder}
            className="h-[520px]"
            host={{
              pages: {
                draft: form,
                onApplied: (page) => {
                  if (page.slug) {
                    setForm({
                      id: page.id,
                      slug: page.slug || "",
                      titleAr: page.titleAr || "",
                      titleEn: page.titleEn || "",
                      bodyAr: page.bodyAr || "",
                      bodyEn: page.bodyEn || "",
                      seoTitle: page.seoTitle || "",
                      seoDescription: page.seoDescription || "",
                      published: page.published !== false,
                      showInHeader: form.showInHeader,
                      showInFooter: form.showInFooter,
                    });
                    setEditorOpen(true);
                  }
                  setMessage(page.created ? t.admin.pagesAiCreated : t.admin.pagesAiUpdated);
                  void load();
                },
              },
            }}
            fallback={async (messages) => {
              const res = await fetch("/api/gemini/pages", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ messages }),
              });
              const data = (await res.json()) as {
                ok?: boolean;
                error?: string;
                reply?: string;
                page?: CustomPage;
                created?: boolean;
                saveError?: string;
              };
              if (data.page) {
                setForm(pageToForm(data.page));
                setEditorOpen(true);
                setMessage(data.created ? t.admin.pagesAiCreated : t.admin.pagesAiUpdated);
                await load();
              } else if (data.saveError) {
                setMessage(String(data.saveError));
              }
              if (!data.ok) return data.error || t.admin.pagesAiFailed;
              return data.reply || t.admin.pagesAiCreated;
            }}
          />
        </div>
      </div>
    </div>
  );
}
