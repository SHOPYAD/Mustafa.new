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
  MoreHorizontal,
} from "lucide-react";
import { AdminCopilotPanel } from "@/components/admin/copilot";
import { AdminPage } from "@/components/admin/layout";
import { EnterprisePageHeader } from "@/components/admin/enterprise";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from "@/components/ui/empty";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
  "w-full px-3.5 py-2.5 bg-admin-bg-surface border border-admin-border-subtle rounded-xl text-admin-text-primary placeholder:text-admin-text-faint focus:outline-none focus:ring-2 focus:ring-emerald-500/40 text-sm";

const labelClass =
  "block text-[11px] font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider";

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
  const [loadFailed, setLoadFailed] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/pages", { cache: "no-store" });
      const data = await res.json();
      if (data?.ok && Array.isArray(data.pages)) {
        setPages(data.pages as CustomPage[]);
        setLoadFailed(false);
      } else {
        setLoadFailed(true);
        setMessage(t.admin.pagesLoadFailed);
      }
    } catch {
      setLoadFailed(true);
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
    <AdminPage className="grid w-full max-w-none min-w-0 grid-cols-1 gap-6 xl:grid-cols-12">
      <div className="xl:col-span-8 flex flex-col gap-4">
        <EnterprisePageHeader
          breadcrumbs={[
            { label: "لوحة التحكم", href: "/admin" },
            { label: "الصفحات المخصصة" },
          ]}
          icon={FileText}
          title={t.admin.pages}
          description={t.admin.pagesSubtitle}
          actions={
            <Button
              type="button"
              onClick={openNew}
              className="bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 text-slate-950 font-black hover:brightness-110 shadow-lg shadow-amber-500/20"
            >
              <Plus size={16} />
              {t.admin.pagesNew}
            </Button>
          }
        />

        {message && !loadFailed ? (
          <p className="text-sm text-muted-foreground">{message}</p>
        ) : null}

        {loading ? (
          <div className="flex flex-col gap-2">
            <Skeleton className="h-12 rounded-xl" />
            <Skeleton className="h-48 rounded-xl" />
          </div>
        ) : loadFailed ? (
          <Alert variant="destructive">
            <AlertTitle>{t.admin.pagesLoadFailed}</AlertTitle>
            <AlertDescription>
              المخزن غير متاح حالياً (غالباً PocketBase منقطع). الجدول يظهر عندما ترجع البيانات الحقيقية — لن نعرض صفحة فارغة وكأنها بلا محتوى.
            </AlertDescription>
          </Alert>
        ) : pages.length === 0 && !editorOpen ? (
          <Empty>
            <EmptyHeader>
              <EmptyTitle>{t.admin.pagesEmpty}</EmptyTitle>
              <EmptyDescription>لا صفحات مخصّصة في المخزن بعد. استخدموا زر الإضافة أو المساعد.</EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <Card>
            <CardContent className="px-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>العنوان</TableHead>
                    <TableHead>المسار</TableHead>
                    <TableHead>الحالة</TableHead>
                    <TableHead>التنقل</TableHead>
                    <TableHead className="w-12" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pages.map((page) => (
                    <TableRow key={page.id}>
                      <TableCell className="font-medium">{page.titleAr || page.titleEn}</TableCell>
                      <TableCell className="font-mono text-xs text-muted-foreground">/p/{page.slug}</TableCell>
                      <TableCell>
                        <Badge variant={page.published ? "secondary" : "outline"}>
                          {page.published ? t.common.publish : t.common.draft}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-xs">
                        {pagePlacementLabel(page, t.menuVisibility)}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon-sm">
                              <MoreHorizontal className="size-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => openEdit(page)}>
                              <Pencil className="size-3.5" />
                              {t.common.edit}
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <a href={`/admin/homepage-editor?page=custom:${page.slug}`}>
                                <Scan className="size-3.5" />
                                {t.admin.visualAiEditor}
                              </a>
                            </DropdownMenuItem>
                            {page.published ? (
                              <DropdownMenuItem asChild>
                                <a href={`/p/${page.slug}`} target="_blank" rel="noopener noreferrer">
                                  <ExternalLink className="size-3.5" />
                                  عرض
                                </a>
                              </DropdownMenuItem>
                            ) : null}
                            <DropdownMenuItem
                              onClick={() => setDeleteId(page.id)}
                              className="text-destructive"
                            >
                              <Trash2 className="size-3.5" />
                              {t.common.delete}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                        {deleteId === page.id ? (
                          <div className="mt-2 flex gap-1">
                            <Button size="xs" variant="destructive" type="button" onClick={() => void handleDelete(page.id)}>
                              {t.common.delete}
                            </Button>
                            <Button size="xs" variant="outline" type="button" onClick={() => setDeleteId(null)}>
                              {t.common.cancel}
                            </Button>
                          </div>
                        ) : null}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        <Sheet
          open={editorOpen}
          onOpenChange={(open) => {
            if (!open) {
              setEditorOpen(false);
              setForm(emptyForm());
            }
          }}
        >
          <SheetContent side="left" className="w-full sm:max-w-xl overflow-y-auto">
            <SheetHeader>
              <SheetTitle>{form.id ? t.admin.pages : t.admin.pagesNew}</SheetTitle>
              <SheetDescription>الحقول كما هي — نفس واجهة الحفظ.</SheetDescription>
            </SheetHeader>
            <div className="grid grid-cols-1 gap-4 px-4 pb-4">
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

            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
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
              <label className="flex min-w-[14rem] flex-col gap-1.5 text-sm text-muted-foreground">
                <span>{t.menuVisibility.title}</span>
                <select
                  value={placementFromFlags(form.showInHeader, form.showInFooter)}
                  onChange={(e) => {
                    const next = flagsFromPlacement(e.target.value as NavPlacement);
                    setForm((prev) => ({ ...prev, ...next }));
                  }}
                  className="rounded-lg border border-admin-border-subtle bg-slate-950/70 px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
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

            <SheetFooter>
              <Button
                type="button"
                onClick={() => void handleSave()}
                disabled={saving}
              >
                {saving ? t.admin.loading : t.common.save}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setEditorOpen(false);
                  setForm(emptyForm());
                }}
              >
                {t.common.cancel}
              </Button>
            </SheetFooter>
          </SheetContent>
        </Sheet>
      </div>

      <div className="xl:col-span-4">
        <Card className="min-h-[420px] overflow-hidden">
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
        </Card>
      </div>
    </AdminPage>
  );
}
