"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Plus,
  Pencil,
  Trash2,
  FileText,
  Search,
  ToggleLeft,
  ToggleRight,
  Loader2,
  Upload,
} from "lucide-react";
import {
  computeSeoScore,
  createEmptyPostRemote,
  deletePostRemote,
  fetchAllPostsRemote,
  importLegacyPostsRemote,
  markLegacyBlogMigrated,
  peekLegacyLocalPosts,
  upsertPostRemote,
} from "@/data/blog";
import type { BlogPost } from "@/types/blog";
import { AdminPage, AdminPageHeader } from "@/components/admin/layout";

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString("ar-AE", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return iso;
  }
}

function seoColor(score: number) {
  if (score >= 80) return "text-emerald-400";
  if (score >= 50) return "text-secondary";
  return "text-red-400";
}

export default function AdminBlogPage() {
  const router = useRouter();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [loading, setLoading] = useState(true);
  const [legacyCount, setLegacyCount] = useState(0);
  const [migrating, setMigrating] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);

  const refresh = async () => {
    const next = await fetchAllPostsRemote();
    setPosts(next);
    setLoading(false);
  };

  useEffect(() => {
    void refresh();
    setLegacyCount(peekLegacyLocalPosts().length);
  }, []);

  const handleNew = async () => {
    setCreating(true);
    const post = await createEmptyPostRemote();
    setCreating(false);
    if (post) router.push(`/admin/blog/${post.id}`);
  };

  const handleDelete = async (id: string) => {
    setBusyId(id);
    await deletePostRemote(id);
    setDeleteConfirmId(null);
    setBusyId(null);
    await refresh();
  };

  const handleToggleStatus = async (post: BlogPost) => {
    const next = post.status === "published" ? "draft" : "published";
    setBusyId(post.id);
    await upsertPostRemote({
      id: post.id,
      status: next,
      publishedAt:
        next === "published"
          ? post.publishedAt || new Date().toISOString()
          : post.publishedAt,
    });
    setBusyId(null);
    await refresh();
  };

  const handleMigrateLegacy = async () => {
    const legacy = peekLegacyLocalPosts();
    if (!legacy.length) return;
    setMigrating(true);
    await importLegacyPostsRemote(legacy);
    markLegacyBlogMigrated();
    setLegacyCount(0);
    setMigrating(false);
    await refresh();
  };

  const filtered = posts.filter(
    (p) =>
      p.titleAr.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.titleEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.slug.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const publishedCount = posts.filter((p) => p.status === "published").length;
  const draftCount = posts.filter((p) => p.status === "draft").length;

  return (
    <AdminPage>
      <AdminPageHeader
        icon={<FileText size={20} />}
        title="مدونة ومقالات السياحة (Travel Blog CMS)"
        description="إدارة ونشر مقالات السفر، الأدلة السياحية، وتوليد المحتوى بالذكاء الاصطناعي مع تحسين محركات البحث SEO."
        actions={
          <button
            onClick={() => void handleNew()}
            disabled={creating}
            className='px-5 py-2.5 bg-primary hover:brightness-110 text-white font-bold rounded-xl shadow-lg shadow-primary/20 transition-all flex items-center gap-2 disabled:opacity-60 cursor-pointer'
          >
            {creating ? <Loader2 size={18} className="animate-spin text-white stroke-white" /> : <Plus size={18} className="text-white stroke-white" />}
            <span className="text-white">مقالة جديدة</span>
          </button>
        }
      />

      {/* 4-Bento Telemetry Cards */}
      <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <div className="rounded-2xl border border-border bg-card p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground">إجمالي المقالات</span>
            <span className="rounded-md bg-primary/10 px-1.5 py-0.5 text-[10px] font-bold text-primary">
              المحتوى
            </span>
          </div>
          <p className="mt-2 text-2xl font-bold tracking-tight text-foreground">{posts.length}</p>
          <p className="text-[11px] text-muted-foreground">مقالات وأدلة سياحية مسجلة</p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground">المنشورة حياً</span>
            <span className="rounded-md bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
              مفعلة
            </span>
          </div>
          <p className="mt-2 text-2xl font-bold tracking-tight text-foreground">{publishedCount}</p>
          <p className="text-[11px] text-muted-foreground">تظهر للزوار ومفهرسة بجوجل</p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground">المسودات</span>
            <span className="rounded-md bg-amber-500/10 px-1.5 py-0.5 text-[10px] font-bold text-amber-600 dark:text-amber-400">
              قيد التحرير
            </span>
          </div>
          <p className="mt-2 text-2xl font-bold tracking-tight text-foreground">{draftCount}</p>
          <p className="text-[11px] text-muted-foreground">مسودات لم تُنشر بعد للعامة</p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground">التصنيفات السياحية</span>
            <span className="rounded-md bg-teal-500/10 px-1.5 py-0.5 text-[10px] font-bold text-teal-600 dark:text-teal-400">
              أقسام
            </span>
          </div>
          <p className="mt-2 text-2xl font-bold tracking-tight text-foreground">
            {Array.from(new Set(posts.map((p) => p.category).filter(Boolean))).length}
          </p>
          <p className="text-[11px] text-muted-foreground">فئات المحتوى والوجهات المختلفة</p>
        </div>
      </div>

      {legacyCount > 0 && (
        <div className='mb-6 flex flex-col gap-3 rounded-2xl border border-border/30 bg-secondary/10 px-4 py-3 sm:flex-row sm:items-center sm:justify-between'>
          <p className='text-sm text-muted-foreground'>
            وُجدت {legacyCount} مقالة قديمة في هذا المتصفح فقط. انقلها للخادم مرة واحدة حتى تظهر للجميع.
          </p>
          <button
            type="button"
            onClick={() => void handleMigrateLegacy()}
            disabled={migrating}
            className='inline-flex items-center gap-2 rounded-xl bg-secondary px-4 py-2 text-sm font-semibold text-foreground disabled:opacity-60'
          >
            {migrating ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
            نقل للمتجر على الخادم
          </button>
        </div>
      )}

      <div className="relative mb-6">
        <Search
          size={18}
          className='absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground'
        />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by title, category, or slug..."
          className='w-full pl-12 pr-4 py-3 bg-background/80 border border-border rounded-xl text-foreground placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-border/50 focus:border-border/50 transition-all'
        />
      </div>

      <div className="flex items-center gap-6 mb-6 text-sm">
        <span className='text-muted-foreground'>
          Total: <span className='text-foreground font-semibold'>{posts.length}</span>
        </span>
        <span className='text-muted-foreground'>
          نشر:{" "}
          <span className="text-emerald-400 font-semibold">{publishedCount}</span>
        </span>
        <span className='text-muted-foreground'>
          مسودة:{" "}
          <span className='text-secondary font-semibold'>{draftCount}</span>
        </span>
      </div>

      <div className='bg-background/80 border border-border rounded-2xl overflow-hidden'>
        <div className='hidden md:grid grid-cols-12 gap-4 px-6 py-3 border-b border-border text-xs font-bold text-muted-foreground uppercase tracking-wider'>
          <div className="col-span-4">Title (Ar)</div>
          <div className="col-span-1">Status</div>
          <div className="col-span-1">SEO</div>
          <div className="col-span-2">Category</div>
          <div className="col-span-2">Updated</div>
          <div className="col-span-2 text-right">Actions</div>
        </div>

        {loading ? (
          <div className='flex items-center justify-center px-6 py-16 text-muted-foreground'>
            <Loader2 className='animate-spin text-secondary' size={28} />
          </div>
        ) : filtered.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <FileText size={48} className='mx-auto mb-4 text-muted-foreground' />
            <p className='text-muted-foreground text-lg'>No articles found</p>
          </div>
        ) : (
          filtered.map((post) => {
            const score = computeSeoScore(post);
            return (
              <div
                key={post.id}
                className='grid grid-cols-1 md:grid-cols-12 gap-3 md:gap-4 px-6 py-4 border-b border-border hover:bg-card/[0.02] transition-colors'
              >
                <div className="col-span-4 flex items-center gap-3 min-w-0">
                  {post.coverImage ? (
                    <div className='w-10 h-10 rounded-lg bg-card overflow-hidden flex-shrink-0'>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={post.coverImage}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className='w-10 h-10 rounded-lg bg-card flex items-center justify-center flex-shrink-0'>
                      <FileText size={16} className='text-muted-foreground' />
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className='text-foreground font-medium text-sm truncate' dir="rtl">
                      {post.titleAr || "بدون عنوان"}
                    </p>
                    <p className='text-muted-foreground text-xs truncate'>{post.slug}</p>
                  </div>
                </div>

                <div className="col-span-1 flex items-center">
                  <span
                    className={`text-[11px] font-bold px-2.5 py-1 rounded-lg border ${
                      post.status === "published"
                        ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/30"
                        : "bg-amber-50 text-admin-btn-secondary-hover dark:bg-secondary/15 dark:text-secondary border-border dark:border-admin-btn-secondary-border/30"
                    }`}
                  >
                    {post.status === "published" ? "نشر" : "مسودة"}
                  </span>
                </div>

                <div className="col-span-1 flex items-center">
                  <span className={`font-bold text-sm ${seoColor(score)}`}>
                    {score}
                  </span>
                </div>

                <div className="col-span-2 flex items-center">
                  <span className='text-foreground dark:text-muted-foreground text-sm font-medium truncate'>
                    {post.category}
                  </span>
                </div>

                <div className="col-span-2 flex items-center">
                  <span className='text-muted-foreground dark:text-muted-foreground text-sm'>
                    {formatDate(post.updatedAt)}
                  </span>
                </div>

                <div className="col-span-2 flex items-center justify-end gap-2">
                  <button
                    onClick={() => void handleToggleStatus(post)}
                    disabled={busyId === post.id}
                    className='w-9 h-9 bg-card-2 hover:bg-slate-200 dark:bg-card/5 dark:hover:bg-card/10 rounded-lg flex items-center justify-center text-foreground dark:text-muted-foreground hover:text-admin-btn-secondary-hover dark:hover:text-secondary transition-all disabled:opacity-50'
                    title={
                      post.status === "published" ? "Set to مسودة" : "Set to نشر"
                    }
                  >
                    {post.status === "published" ? (
                      <ToggleRight size={20} className="text-emerald-600 dark:text-emerald-400" />
                    ) : (
                      <ToggleLeft size={20} className="text-muted-foreground" />
                    )}
                  </button>
                  <Link
                    href={`/admin/blog/${post.id}`}
                    className="w-9 h-9 bg-blue-50 hover:bg-blue-100 dark:bg-blue-500/15 dark:hover:bg-blue-500/25 border border-blue-200 dark:border-blue-500/30 rounded-lg flex items-center justify-center text-blue-600 dark:text-blue-400 hover:text-blue-700 transition-all shadow-sm"
                    title="Edit"
                  >
                    <Pencil size={15} />
                  </Link>
                  {deleteConfirmId === post.id ? (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => void handleDelete(post.id)}
                        className='px-3 py-1.5 bg-red-600 hover:bg-red-700 text-foreground rounded-lg text-xs font-bold transition-all shadow-sm'
                      >
                        Confirm
                      </button>
                      <button
                        onClick={() => setDeleteConfirmId(null)}
                        className='px-3 py-1.5 bg-slate-200 dark:bg-card/10 text-foreground dark:text-muted-foreground rounded-lg text-xs font-semibold transition-all'
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setDeleteConfirmId(post.id)}
                      className="w-9 h-9 bg-red-50 hover:bg-red-100 dark:bg-red-500/15 dark:hover:bg-red-500/25 border border-red-200 dark:border-red-500/30 rounded-lg flex items-center justify-center text-red-600 dark:text-red-400 hover:text-red-700 transition-all shadow-sm"
                      title="حذف"
                    >
                      <Trash2 size={15} />
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </AdminPage>
  );
}
