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
  Sparkles,
  BookOpen,
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
import {
  EnterprisePageHeader,
  EnterpriseKpiGrid,
  EnterpriseKpiCard,
  EnterpriseFilterBar,
  EnterpriseDataTable,
  EnterpriseStatusBadge,
  type ColumnDef,
} from "@/components/admin/enterprise";

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

export default function AdminBlogPage() {
  const router = useRouter();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
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
    setMigrating(true);
    const local = peekLegacyLocalPosts();
    const count = await importLegacyPostsRemote(local);
    markLegacyBlogMigrated();
    setLegacyCount(0);
    setMigrating(false);
    await refresh();
  };

  const filtered = posts.filter((p) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      (p.titleAr && p.titleAr.toLowerCase().includes(q)) ||
      (p.titleEn && p.titleEn.toLowerCase().includes(q)) ||
      (p.category && p.category.toLowerCase().includes(q)) ||
      (p.slug && p.slug.toLowerCase().includes(q));
    const matchesStatus = statusFilter === "all" || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const publishedCount = posts.filter((p) => p.status === "published").length;
  const draftCount = posts.filter((p) => p.status === "draft").length;

  const columns: ColumnDef<BlogPost>[] = [
    {
      key: "titleAr",
      title: "عنوان المقال",
      render: (post) => (
        <div className="flex items-center gap-3 min-w-0">
          {post.coverImage ? (
            <div className="size-10 rounded-xl overflow-hidden shrink-0 border border-border/60 bg-card">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={post.coverImage} alt="" className="size-full object-cover" />
            </div>
          ) : (
            <div className="size-10 rounded-xl flex items-center justify-center shrink-0 border border-border/60 bg-primary/10 text-primary">
              <FileText className="size-5" />
            </div>
          )}
          <div className="min-w-0">
            <Link
              href={`/admin/blog/${post.id}`}
              className="font-bold text-foreground hover:text-primary transition-colors text-sm truncate block"
            >
              {post.titleAr || "بدون عنوان"}
            </Link>
            <p className="text-xs text-muted-foreground truncate">{post.slug || post.id}</p>
          </div>
        </div>
      ),
    },
    {
      key: "status",
      title: "الحالة",
      render: (post) => (
        <EnterpriseStatusBadge
          status={post.status === "published" ? "active" : "draft"}
          label={post.status === "published" ? "منشور حي" : "مسودة"}
          size="sm"
        />
      ),
    },
    {
      key: "category",
      title: "التصنيف",
      render: (post) => (
        <span className="text-xs font-semibold text-foreground bg-secondary/60 px-2.5 py-1 rounded-lg">
          {post.category || "عام"}
        </span>
      ),
    },
    {
      key: "seo",
      title: "جودة SEO",
      render: (post) => {
        const score = computeSeoScore(post);
        return (
          <span
            className={`font-mono font-black text-xs tabular-nums ${
              score >= 80 ? "text-emerald-400" : score >= 50 ? "text-amber-400" : "text-rose-400"
            }`}
          >
            {score}%
          </span>
        );
      },
    },
    {
      key: "updatedAt",
      title: "آخر تعديل",
      render: (post) => (
        <span className="text-xs text-muted-foreground tabular-nums">
          {formatDate(post.updatedAt || post.publishedAt || "")}
        </span>
      ),
    },
    {
      key: "actions",
      title: "الإجراءات",
      align: "left",
      render: (post) => (
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => void handleToggleStatus(post)}
            disabled={busyId === post.id}
            className="p-1.5 rounded-xl border border-border/60 bg-card text-muted-foreground hover:text-foreground hover:border-primary/40 transition-colors cursor-pointer disabled:opacity-50"
            title={post.status === "published" ? "تحويل لمسودة" : "نشر المقال"}
          >
            {post.status === "published" ? (
              <ToggleRight className="size-4 text-emerald-400" />
            ) : (
              <ToggleLeft className="size-4 text-muted-foreground" />
            )}
          </button>
          <Link
            href={`/admin/blog/${post.id}`}
            className="p-1.5 rounded-xl border border-border/60 bg-card text-muted-foreground hover:text-foreground hover:border-primary/40 transition-colors"
            title="تعديل المقال"
          >
            <Pencil className="size-3.5" />
          </Link>
          <button
            type="button"
            onClick={() => void handleDelete(post.id)}
            disabled={busyId === post.id}
            className="p-1.5 rounded-xl border border-rose-500/20 bg-rose-500/10 text-rose-400 hover:bg-rose-500 hover:text-white transition-colors cursor-pointer disabled:opacity-50"
            title="حذف"
          >
            <Trash2 className="size-3.5" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-8" dir="rtl">
      <EnterprisePageHeader
        icon={BookOpen}
        title="إدارة المدونة والمقالات السياحية (Blog CMS)"
        description="المقالات تُحفظ على الخادم وتظهر لكافة الأجهزة والزوار مع فحص مباشر لقوة ومعايير الـ SEO."
        breadcrumbs={[
          { label: "لوحة التحكم", href: "/admin" },
          { label: "المحتوى", href: "/admin/content" },
          { label: "المدونة والمقالات" },
        ]}
        actions={
          <button
            type="button"
            onClick={() => void handleNew()}
            disabled={creating}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 px-5 py-2.5 text-xs font-black text-slate-950 shadow-lg shadow-amber-500/20 transition-all hover:brightness-110 active:scale-95 disabled:opacity-50 cursor-pointer"
          >
            {creating ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
            <span>مقال جديد</span>
          </button>
        }
      />

      {legacyCount > 0 && (
        <div className="flex flex-col gap-3 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 sm:flex-row sm:items-center sm:justify-between backdrop-blur-xl">
          <p className="text-xs text-amber-200 font-bold">
            وُجدت {legacyCount} مقالة قديمة في هذا المتصفح فقط. انقلها للخادم مرة واحدة حتى تظهر للجميع.
          </p>
          <button
            type="button"
            onClick={() => void handleMigrateLegacy()}
            disabled={migrating}
            className="inline-flex items-center gap-2 rounded-xl bg-amber-500 px-4 py-2 text-xs font-black text-slate-950 hover:brightness-110 disabled:opacity-60 transition-all shadow-md"
          >
            {migrating ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
            <span>نقل للمتجر على الخادم</span>
          </button>
        </div>
      )}

      <EnterpriseKpiGrid cols={3}>
        <EnterpriseKpiCard
          label="إجمالي المقالات"
          value={posts.length}
          hint="شاملة المسودات والمنشور"
          icon={FileText}
          tone="royal"
        />
        <EnterpriseKpiCard
          label="مقالات منشورة حية"
          value={publishedCount}
          hint="مفهرسة وظاهرة للجمهور"
          icon={Sparkles}
          tone="emerald"
        />
        <EnterpriseKpiCard
          label="مسودات قيد التحرير"
          value={draftCount}
          hint="غير منشورة بعد"
          icon={Pencil}
          tone="amber"
        />
      </EnterpriseKpiGrid>

      <div className="space-y-4">
        <EnterpriseFilterBar
          searchValue={searchQuery}
          onSearchChange={setSearchQuery}
          searchPlaceholder="بحث بعنوان المقال، التصنيف، أو الرابط..."
          totalResults={filtered.length}
          filterTabs={[
            { id: "all", label: "الكل" },
            { id: "published", label: "منشور" },
            { id: "draft", label: "مسودة" },
          ]}
          activeTab={statusFilter}
          onTabChange={setStatusFilter}
        />

        <EnterpriseDataTable
          data={filtered}
          columns={columns}
          keyExtractor={(p) => p.id}
          loading={loading}
          emptyTitle="لا توجد مقالات مطابقة"
          emptyDescription="ابدأ بإنشاء مقالك السياحي الأول بالضغط على زر 'مقال جديد'."
        />
      </div>
    </div>
  );
}
