"use client";

import { useState, useEffect, use, useMemo } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Save,
  Loader2,
  FileText,
  Eye,
  Code2,
  CheckCircle2,
} from "lucide-react";
import { computeSeoScore, fetchPostByIdRemote, upsertPostRemote } from "@/data/blog";
import { AdminCopilotPanel } from "@/components/admin/copilot";
import { AdminPage } from "@/components/admin/layout";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import type { BlogPost, BlogSeo } from "@/types/blog";

type FormState = {
  slug: string;
  titleAr: string;
  titleEn: string;
  excerptAr: string;
  excerptEn: string;
  contentAr: string;
  contentEn: string;
  coverImage: string;
  coverAlt: string;
  category: string;
  tags: string;
  author: string;
  status: BlogPost["status"];
  seo: BlogSeo;
  publishedAt?: string;
};

const inputClass =
  "w-full px-3.5 py-2.5 bg-slate-950/60 border border-white/10 rounded-xl text-white placeholder-white/25 focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500/40 transition-all text-sm";

const labelClass =
  "block text-[11px] font-semibold text-white/35 mb-1.5 uppercase tracking-wider";

const CATEGORIES = [
  "Travel Tips",
  "Destination Guides",
  "Visa Guide",
  "News",
  "Hotels",
  "Flights",
];

function emptyForm(): FormState {
  return {
    slug: "",
    titleAr: "",
    titleEn: "",
    excerptAr: "",
    excerptEn: "",
    contentAr: "",
    contentEn: "",
    coverImage: "",
    coverAlt: "",
    category: "Travel Tips",
    tags: "",
    author: "Alrayyan Tourism",
    status: "draft",
    seo: {
      metaTitleAr: "",
      metaTitleEn: "",
      metaDescriptionAr: "",
      metaDescriptionEn: "",
      focusKeyword: "",
      ogImage: "",
    },
  };
}

function postToForm(post: BlogPost): FormState {
  return {
    slug: post.slug,
    titleAr: post.titleAr,
    titleEn: post.titleEn,
    excerptAr: post.excerptAr,
    excerptEn: post.excerptEn,
    contentAr: post.contentAr,
    contentEn: post.contentEn,
    coverImage: post.coverImage,
    coverAlt: post.coverAlt,
    category: post.category,
    tags: post.tags.join(", "),
    author: post.author,
    status: post.status,
    seo: { ...post.seo },
    publishedAt: post.publishedAt,
  };
}

function formToPartial(form: FormState): Partial<BlogPost> {
  return {
    slug: form.slug.trim(),
    titleAr: form.titleAr,
    titleEn: form.titleEn,
    excerptAr: form.excerptAr,
    excerptEn: form.excerptEn,
    contentAr: form.contentAr,
    contentEn: form.contentEn,
    coverImage: form.coverImage,
    coverAlt: form.coverAlt,
    category: form.category,
    tags: form.tags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean),
    author: form.author,
    status: form.status,
    seo: { ...form.seo },
    publishedAt: form.publishedAt,
  };
}

function seoColor(score: number) {
  if (score >= 80) return "text-emerald-400";
  if (score >= 50) return "text-amber-400";
  return "text-red-400";
}

function mergeArticlePatch(
  form: FormState,
  patch: Record<string, unknown>
): FormState {
  const next = { ...form, seo: { ...form.seo } };

  const strKeys = [
    "titleAr",
    "titleEn",
    "excerptAr",
    "excerptEn",
    "contentAr",
    "contentEn",
    "coverImage",
    "coverAlt",
    "category",
    "author",
    "slug",
  ] as const;

  for (const key of strKeys) {
    if (typeof patch[key] === "string") {
      next[key] = patch[key] as string;
    }
  }

  if (Array.isArray(patch.tags)) {
    next.tags = (patch.tags as unknown[])
      .map(String)
      .filter(Boolean)
      .join(", ");
  } else if (typeof patch.tags === "string") {
    next.tags = patch.tags;
  }

  if (patch.seo && typeof patch.seo === "object") {
    const seo = patch.seo as Record<string, unknown>;
    const seoKeys: (keyof BlogSeo)[] = [
      "metaTitleAr",
      "metaTitleEn",
      "metaDescriptionAr",
      "metaDescriptionEn",
      "focusKeyword",
      "ogImage",
    ];
    for (const key of seoKeys) {
      if (typeof seo[key] === "string") {
        next.seo[key] = seo[key] as string;
      }
    }
  }

  return next;
}

function ContentEditor({
  label,
  value,
  onChange,
  dir,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  dir?: "rtl" | "ltr";
}) {
  const [tab, setTab] = useState<"edit" | "preview">("edit");

  return (
    <div className="bg-slate-900/60 border border-white/5 rounded-2xl overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/5">
        <span className="text-xs font-semibold text-white/40 uppercase tracking-wider">
          {label}
        </span>
        <div className="flex items-center gap-1 bg-white/5 rounded-lg p-0.5">
          <button
            type="button"
            onClick={() => setTab("edit")}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
              tab === "edit"
                ? "bg-amber-500/20 text-amber-400"
                : "text-white/40 hover:text-white/70"
            }`}
          >
            <Code2 size={12} />
            Edit
          </button>
          <button
            type="button"
            onClick={() => setTab("preview")}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
              tab === "preview"
                ? "bg-amber-500/20 text-amber-400"
                : "text-white/40 hover:text-white/70"
            }`}
          >
            <Eye size={12} />
            Preview
          </button>
        </div>
      </div>
      {tab === "edit" ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={14}
          dir={dir}
          placeholder="HTML content allowed..."
          className="w-full px-4 py-3 bg-transparent text-white/90 placeholder-white/20 focus:outline-none text-sm font-mono leading-relaxed resize-y min-h-[220px]"
        />
      ) : (
        <div
          dir={dir}
          className="px-4 py-3 prose prose-invert prose-sm max-w-none min-h-[220px] text-white/80"
          dangerouslySetInnerHTML={{
            __html: value || "<p class='text-white/30'>No content</p>",
          }}
        />
      )}
    </div>
  );
}

export default function AdminBlogEditorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { t } = useLocale();
  const [form, setForm] = useState<FormState>(emptyForm());
  const [loaded, setLoaded] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savedFlash, setSavedFlash] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void fetchPostByIdRemote(id).then((remote) => {
      if (cancelled) return;
      if (!remote) {
        setNotFound(true);
        setLoaded(true);
        return;
      }
      setForm(postToForm(remote));
      setLoaded(true);
    });
    return () => {
      cancelled = true;
    };
  }, [id]);

  const livePost = useMemo((): BlogPost => {
    const partial = formToPartial(form);
    return {
      id,
      createdAt: "",
      updatedAt: "",
      slug: partial.slug || "",
      titleAr: partial.titleAr || "",
      titleEn: partial.titleEn || "",
      excerptAr: partial.excerptAr || "",
      excerptEn: partial.excerptEn || "",
      contentAr: partial.contentAr || "",
      contentEn: partial.contentEn || "",
      coverImage: partial.coverImage || "",
      coverAlt: partial.coverAlt || "",
      category: partial.category || "",
      tags: partial.tags || [],
      author: partial.author || "",
      status: partial.status || "draft",
      seo: partial.seo!,
      publishedAt: partial.publishedAt,
    };
  }, [form, id]);

  const score = computeSeoScore(livePost);

  const setField = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((f) => ({ ...f, [key]: value }));
  };

  const setSeo = (key: keyof BlogSeo, value: string) => {
    setForm((f) => ({ ...f, seo: { ...f.seo, [key]: value } }));
  };

  const persist = async (status: BlogPost["status"]) => {
    setSaving(true);
    const payload = formToPartial({
      ...form,
      status,
      publishedAt:
        status === "published"
          ? form.publishedAt || new Date().toISOString()
          : form.publishedAt,
    });
    const remote = await upsertPostRemote({ id, ...payload });
    setSaving(false);
    if (!remote) return;
    setForm(postToForm(remote));
    setSavedFlash(true);
    setTimeout(() => setSavedFlash(false), 2000);
  };

  if (!loaded) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="animate-spin text-amber-400" size={28} />
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="text-center py-24">
        <FileText size={48} className="mx-auto mb-4 text-white/10" />
        <p className="text-white/40 mb-4">Article not found</p>
        <Link
          href="/admin/blog"
          className="text-amber-400 hover:text-amber-300 text-sm font-medium"
        >
          Back to list
        </Link>
      </div>
    );
  }

  return (
    <AdminPage className="pb-8">
      {/* Top bar */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
        <div className="flex items-center gap-3 min-w-0">
          <Link
            href="/admin/blog"
            className="w-10 h-10 bg-white/5 hover:bg-white/10 rounded-xl flex items-center justify-center text-white/50 hover:text-white transition-all flex-shrink-0"
          >
            <ArrowLeft size={18} />
          </Link>
          <div className="min-w-0">
            <h1
              className="text-xl font-bold text-white truncate"
              dir="rtl"
            >
              {form.titleAr || "تحرير المقال"}
            </h1>
            <div className="flex items-center gap-3 mt-0.5 text-xs text-white/40">
              <span
                className={
                  form.status === "published"
                    ? "text-emerald-400"
                    : "text-amber-400"
                }
              >
                {form.status === "published" ? "نشر" : "مسودة"}
              </span>
              <span>
                SEO:{" "}
                <span className={`font-bold ${seoColor(score)}`}>{score}</span>
              </span>
              {savedFlash && (
                <span className="text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 size={12} /> Saved
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => void persist("draft")}
            disabled={saving}
            className="px-4 py-2.5 bg-white/5 hover:bg-white/10 text-white/70 hover:text-white font-medium rounded-xl transition-all flex items-center gap-2 text-sm disabled:opacity-50"
          >
            <Save size={15} />
            Save draft
          </button>
          <button
            onClick={() => void persist("published")}
            disabled={saving}
            className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold rounded-xl shadow-lg shadow-orange-500/20 transition-all flex items-center gap-2 text-sm disabled:opacity-50"
          >
            نشر الآن
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        {/* Main editor */}
        <div className="xl:col-span-8 space-y-5">
          <div className="bg-slate-900/80 border border-white/5 rounded-2xl p-5 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>العنوان (عربي)</label>
                <input
                  value={form.titleAr}
                  onChange={(e) => setField("titleAr", e.target.value)}
                  className={inputClass}
                  dir="rtl"
                />
              </div>
              <div>
                <label className={labelClass}>Title (EN)</label>
                <input
                  value={form.titleEn}
                  onChange={(e) => setField("titleEn", e.target.value)}
                  className={inputClass}
                />
              </div>
            </div>

            <div>
              <label className={labelClass}>Slug</label>
              <input
                value={form.slug}
                onChange={(e) => setField("slug", e.target.value)}
                className={inputClass}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>المقتطف (عربي)</label>
                <textarea
                  value={form.excerptAr}
                  onChange={(e) => setField("excerptAr", e.target.value)}
                  rows={3}
                  className={inputClass}
                  dir="rtl"
                />
              </div>
              <div>
                <label className={labelClass}>Excerpt (EN)</label>
                <textarea
                  value={form.excerptEn}
                  onChange={(e) => setField("excerptEn", e.target.value)}
                  rows={3}
                  className={inputClass}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className={labelClass}>Category</label>
                <select
                  value={form.category}
                  onChange={(e) => setField("category", e.target.value)}
                  className={`${inputClass} appearance-none cursor-pointer`}
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c} className="bg-slate-900">
                      {c}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelClass}>Tags (comma)</label>
                <input
                  value={form.tags}
                  onChange={(e) => setField("tags", e.target.value)}
                  placeholder="travel, dubai, tips"
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Author</label>
                <input
                  value={form.author}
                  onChange={(e) => setField("author", e.target.value)}
                  className={inputClass}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Cover Image URL</label>
                <input
                  value={form.coverImage}
                  onChange={(e) => setField("coverImage", e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Cover Alt</label>
                <input
                  value={form.coverAlt}
                  onChange={(e) => setField("coverAlt", e.target.value)}
                  className={inputClass}
                />
              </div>
            </div>
          </div>

          {/* SEO */}
          <div className="bg-slate-900/80 border border-white/5 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                SEO Panel
              </h2>
              <span className={`text-sm font-bold ${seoColor(score)}`}>
                Score {score}/100
              </span>
            </div>
            <div>
              <label className={labelClass}>Focus Keyword</label>
              <input
                value={form.seo.focusKeyword}
                onChange={(e) => setSeo("focusKeyword", e.target.value)}
                className={inputClass}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Meta Title (Ar)</label>
                <input
                  value={form.seo.metaTitleAr}
                  onChange={(e) => setSeo("metaTitleAr", e.target.value)}
                  className={inputClass}
                  dir="rtl"
                />
              </div>
              <div>
                <label className={labelClass}>Meta Title (En)</label>
                <input
                  value={form.seo.metaTitleEn}
                  onChange={(e) => setSeo("metaTitleEn", e.target.value)}
                  className={inputClass}
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Meta Description (Ar)</label>
                <textarea
                  value={form.seo.metaDescriptionAr}
                  onChange={(e) => setSeo("metaDescriptionAr", e.target.value)}
                  rows={2}
                  className={inputClass}
                  dir="rtl"
                />
              </div>
              <div>
                <label className={labelClass}>Meta Description (En)</label>
                <textarea
                  value={form.seo.metaDescriptionEn}
                  onChange={(e) => setSeo("metaDescriptionEn", e.target.value)}
                  rows={2}
                  className={inputClass}
                />
              </div>
            </div>
            <div>
              <label className={labelClass}>OG Image URL</label>
              <input
                value={form.seo.ogImage}
                onChange={(e) => setSeo("ogImage", e.target.value)}
                className={inputClass}
              />
            </div>
          </div>

          {/* Content */}
          <ContentEditor
            label="المحتوى العربي (HTML)"
            value={form.contentAr}
            onChange={(v) => setField("contentAr", v)}
            dir="rtl"
          />
          <ContentEditor
            label="English Content (HTML)"
            value={form.contentEn}
            onChange={(v) => setField("contentEn", v)}
            dir="ltr"
          />
        </div>

        <div className="xl:col-span-4">
          <div className="sticky top-24 overflow-hidden rounded-2xl border border-white/5 bg-slate-900/80 h-[min(720px,calc(100vh-10rem))]">
            <AdminCopilotPanel
              scope="articles"
              title={t.builderAgent.scopes.articles}
              hint={t.builderAgent.isolated}
              className="h-full"
              host={{
                article: {
                  snapshot: {
                    titleAr: form.titleAr,
                    titleEn: form.titleEn,
                    excerptAr: form.excerptAr,
                    excerptEn: form.excerptEn,
                    contentAr: form.contentAr,
                    contentEn: form.contentEn,
                    slug: form.slug,
                    category: form.category,
                    tags: form.tags,
                    author: form.author,
                    coverImage: form.coverImage,
                    coverAlt: form.coverAlt,
                    seo: form.seo,
                  },
                  onApply: (patch) => setForm((f) => mergeArticlePatch(f, patch)),
                  onInsertReply: (text) => {
                    const cleaned = text.replace(/```json[\s\S]*?```/g, "").trim();
                    if (!cleaned) return;
                    setForm((f) => ({
                      ...f,
                      contentAr: f.contentAr
                        ? `${f.contentAr}\n\n<p>${cleaned}</p>`
                        : `<p>${cleaned}</p>`,
                    }));
                  },
                },
              }}
              fallback={async (messages) => {
                const res = await fetch("/api/gemini/chat", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    messages,
                    articleContext: {
                      titleAr: form.titleAr,
                      titleEn: form.titleEn,
                      slug: form.slug,
                      excerptAr: form.excerptAr,
                      excerptEn: form.excerptEn,
                      contentAr: form.contentAr,
                      contentEn: form.contentEn,
                      category: form.category,
                      tags: form.tags,
                      author: form.author,
                      coverImage: form.coverImage,
                      coverAlt: form.coverAlt,
                      seo: form.seo,
                    },
                  }),
                });
                const data = (await res.json()) as {
                  ok?: boolean;
                  error?: string;
                  reply?: string;
                  articlePatch?: Record<string, unknown>;
                };
                if (data.articlePatch && typeof data.articlePatch === "object") {
                  setForm((f) => mergeArticlePatch(f, data.articlePatch as Record<string, unknown>));
                }
                if (!data.ok) return data.error || t.editor.aiError;
                return data.reply || t.builderAgent.isolated;
              }}
            />
          </div>
        </div>
      </div>
    </AdminPage>
  );
}
