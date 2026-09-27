"use client";

import { useMemo, useState, type FormEvent } from "react";
import {
  ArrowUpRight,
  Building2,
  Car,
  FileText,
  Home,
  Layers,
  Loader2,
  Mail,
  Map as MapIcon,
  Newspaper,
  Package,
  Plane,
  Plus,
  Search,
  Sparkles,
  Ticket,
  TreePalm,
  User,
} from "lucide-react";
import { useBuilderStore } from "@/lib/builder/editor-store";
import { cn } from "@/lib/builder/cn";
import { Input, ScrollArea } from "../ui";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import type { Locale } from "@/lib/i18n/types";
import {
  customPageIdFromSlug,
  type EditorPageEntry,
  type EditorPageGroup,
  type EditorPagesData,
} from "@/lib/builder-pages";
import { PageLivePreview } from "@/components/visual-editor/PagePreviewCard";

const ICONS: Record<string, React.ElementType> = {
  home: Home,
  plane: Plane,
  flights: Plane,
  search: Search,
  ticket: Ticket,
  hotel: Building2,
  hotels: Building2,
  car: Car,
  cars: Car,
  package: Package,
  holidays: Package,
  user: User,
  account: User,
  file: FileText,
  map: MapIcon,
  tours: TreePalm,
  news: Newspaper,
  mail: Mail,
  sparkles: Sparkles,
  visa: FileText,
  transfers: Car,
};

const ACCENTS: Record<string, { from: string; to: string; dot: string; ring: string }> = {
  home: {
    from: "from-emerald-500/25",
    to: "to-[#051741]/10",
    dot: "bg-emerald-500",
    ring: "ring-emerald-500/40",
  },
  flights: {
    from: "from-sky-500/25",
    to: "to-cyan-500/10",
    dot: "bg-sky-500",
    ring: "ring-sky-500/40",
  },
  hotels: {
    from: "from-amber-500/25",
    to: "to-orange-500/10",
    dot: "bg-amber-500",
    ring: "ring-amber-500/40",
  },
  cars: {
    from: "from-emerald-500/25",
    to: "to-teal-500/10",
    dot: "bg-emerald-500",
    ring: "ring-emerald-500/40",
  },
  tours: {
    from: "from-lime-500/25",
    to: "to-emerald-500/10",
    dot: "bg-lime-500",
    ring: "ring-lime-500/40",
  },
  transfers: {
    from: "from-blue-500/25",
    to: "to-indigo-500/10",
    dot: "bg-blue-500",
    ring: "ring-blue-500/40",
  },
  holidays: {
    from: "from-rose-500/25",
    to: "to-pink-500/10",
    dot: "bg-rose-500",
    ring: "ring-rose-500/40",
  },
  visa: {
    from: "from-indigo-500/25",
    to: "to-emerald-500/10",
    dot: "bg-indigo-500",
    ring: "ring-indigo-500/40",
  },
  account: {
    from: "from-slate-500/25",
    to: "to-slate-500/10",
    dot: "bg-slate-500",
    ring: "ring-slate-500/40",
  },
  content: {
    from: "from-slate-500/25",
    to: "to-slate-500/10",
    dot: "bg-slate-500",
    ring: "ring-slate-500/40",
  },
  custom: {
    from: "from-[#051741]/25",
    to: "to-emerald-500/10",
    dot: "bg-emerald-500",
    ring: "ring-emerald-500/40",
  },
};

const DEFAULT_ACCENT = {
  from: "from-slate-500/25",
  to: "to-slate-500/10",
  dot: "bg-slate-500",
  ring: "ring-slate-500/40",
};

function localizedPageLabel(page: EditorPageEntry, locale: Locale): string {
  if (locale === "ar") return page.labelAr;
  if (locale === "tr") return page.labelTr;
  return page.labelEn;
}

function localizedGroupLabel(group: EditorPageGroup, locale: Locale): string {
  if (locale === "ar") return group.labelAr;
  if (locale === "tr") return group.labelTr;
  return group.labelEn;
}

function PageCard({
  page,
  label,
  active,
  badge,
  onClick,
}: {
  page: EditorPageEntry;
  label: string;
  active: boolean;
  badge?: string;
  onClick: () => void;
}) {
  const { t } = useLocale();
  const canvasLocale = useBuilderStore((s) => s.locale);
  const Icon = ICONS[page.icon] || ICONS[page.id] || ICONS[page.group] || FileText;
  const accent = ACCENTS[page.id] || ACCENTS[page.group] || DEFAULT_ACCENT;

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onClick();
        }
      }}
      aria-pressed={active}
      data-active={active ? "true" : undefined}
      className={cn(
        "group relative flex w-full cursor-pointer flex-col overflow-hidden rounded-xl border bg-card text-left transition-all duration-300 ease-out",
        "hover:-translate-y-0.5 hover:shadow-lg hover:shadow-foreground/5",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        active ? "border-primary/70 shadow-[0_0_0_3px_hsl(var(--primary)/0.15)]" : "border-border hover:border-foreground/25"
      )}
    >
      <div className={cn("relative aspect-[16/10] w-full overflow-hidden bg-gradient-to-br", accent.from, accent.to)}>
        <PageLivePreview
          path={page.canvasPath || page.path}
          locale={canvasLocale}
          title={`${t.editor.pagePreview}: ${label}`}
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-background/70 via-transparent to-transparent" />
        <div className="absolute left-2 top-2 flex h-7 w-7 items-center justify-center rounded-lg bg-background/85 ring-1 ring-border backdrop-blur-md transition-transform duration-300 group-hover:scale-110">
          <Icon className="h-3.5 w-3.5 text-foreground" />
        </div>
        {active ? (
          <div className="absolute right-2 top-2 flex items-center gap-1 rounded-md bg-primary px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-primary-foreground shadow-sm">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary-foreground/60" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-primary-foreground" />
            </span>
            {t.editor.activePage}
          </div>
        ) : badge ? (
          <div className="absolute right-2 top-2 rounded-md bg-background/85 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-muted-foreground ring-1 ring-border backdrop-blur-md">
            {badge}
          </div>
        ) : null}
        <div className="pointer-events-none absolute inset-0 flex items-end justify-center p-3 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <span className="flex items-center gap-1.5 rounded-full bg-foreground px-2.5 py-1 text-[10px] font-semibold text-background shadow-lg">
            <ArrowUpRight className="h-3 w-3" />
            {t.editor.openPage}
          </span>
        </div>
        <div
          aria-hidden="true"
          className={cn(
            "pointer-events-none absolute inset-0 rounded-[inherit] ring-2 ring-inset transition-opacity duration-300",
            accent.ring,
            active ? "opacity-80" : "opacity-0 group-hover:opacity-60"
          )}
        />
      </div>
      <div className="flex items-center gap-2 border-t border-border bg-card px-3 py-2">
        <span className={cn("h-1.5 w-1.5 shrink-0 rounded-full", accent.dot)} aria-hidden="true" />
        <span className={cn("flex-1 truncate text-sm font-medium", active ? "text-primary" : "text-foreground")}>
          {label}
        </span>
        <span className="rounded bg-muted px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">{page.path}</span>
      </div>
    </div>
  );
}

function CreatePageForm() {
  const { t } = useLocale();
  const applyEditorPagesData = useBuilderStore((s) => s.applyEditorPagesData);
  const setActivePage = useBuilderStore((s) => s.setActivePage);
  const [titleAr, setTitleAr] = useState("");
  const [titleEn, setTitleEn] = useState("");
  const [slug, setSlug] = useState("");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (creating || (!titleAr.trim() && !titleEn.trim())) return;
    setCreating(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/builder-pages", {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          titleAr: titleAr.trim() || titleEn.trim(),
          titleEn: titleEn.trim() || titleAr.trim(),
          slug: slug.trim() || undefined,
        }),
      });
      const data = (await res.json()) as { ok?: boolean; error?: string; page?: { slug?: string } } & Partial<EditorPagesData>;
      if (!data.ok || !Array.isArray(data.pages)) {
        setError(data.error || t.editor.pageCreateFailed);
        return;
      }
      applyEditorPagesData(data);
      if (data.page?.slug) setActivePage(customPageIdFromSlug(data.page.slug));
      setTitleAr("");
      setTitleEn("");
      setSlug("");
    } catch {
      setError(t.editor.pageCreateFailed);
    } finally {
      setCreating(false);
    }
  };

  return (
    <form onSubmit={(e) => void submit(e)} className="space-y-2 rounded-xl border border-dashed border-border bg-muted/30 p-3">
      <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
        <Plus className="h-3 w-3" />
        {t.editor.createPage}
      </div>
      <Input
        value={titleAr}
        onChange={(e) => setTitleAr(e.target.value)}
        placeholder={t.editor.newPageTitleAr}
        className="h-8 text-xs"
      />
      <Input
        value={titleEn}
        onChange={(e) => setTitleEn(e.target.value)}
        placeholder={t.editor.newPageTitleEn}
        className="h-8 text-xs"
      />
      <Input
        value={slug}
        onChange={(e) => setSlug(e.target.value)}
        placeholder={t.editor.newPageSlug}
        className="h-8 font-mono text-xs"
      />
      {error ? <p className="text-[11px] text-destructive">{error}</p> : null}
      <button
        type="submit"
        disabled={creating || (!titleAr.trim() && !titleEn.trim())}
        className="inline-flex h-8 w-full items-center justify-center gap-1.5 rounded-lg bg-primary text-[11px] font-semibold text-primary-foreground disabled:opacity-40"
      >
        {creating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5" />}
        {creating ? t.editor.creatingPage : t.editor.createPageAction}
      </button>
    </form>
  );
}

export function PagesPanel() {
  const { t, locale } = useLocale();
  const editorPages = useBuilderStore((s) => s.editorPages);
  const activePage = useBuilderStore((s) => s.activePage);
  const setActivePage = useBuilderStore((s) => s.setActivePage);

  const core = useMemo(
    () => editorPages.pages.filter((page) => page.kind !== "content" && page.kind !== "custom"),
    [editorPages.pages]
  );
  const cms = useMemo(
    () => editorPages.pages.filter((page) => page.kind === "content"),
    [editorPages.pages]
  );
  const custom = useMemo(
    () => editorPages.pages.filter((page) => page.kind === "custom"),
    [editorPages.pages]
  );

  const coreGroups = useMemo(() => {
    const byGroup = new Map<string, EditorPageEntry[]>();
    for (const page of core) {
      const list = byGroup.get(page.group) || [];
      list.push(page);
      byGroup.set(page.group, list);
    }
    return editorPages.groups
      .filter((group) => group.id !== "content" && group.id !== "custom")
      .map((group) => ({ group, pages: byGroup.get(group.id) || [] }))
      .filter((entry) => entry.pages.length > 0);
  }, [core, editorPages.groups]);

  return (
    <ScrollArea className="h-full">
      <div className="space-y-5 p-3">
        {coreGroups.map(({ group, pages }) => (
          <section key={group.id}>
            <header className="mb-2 flex items-center justify-between px-1">
              <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                <Sparkles className="h-3 w-3" />
                {group.id === "home" ? t.editor.corePages : localizedGroupLabel(group, locale)}
              </div>
              <span className="rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                {pages.length}
              </span>
            </header>
            <div className="grid grid-cols-1 gap-2.5">
              {pages.map((page) => (
                <PageCard
                  key={page.id}
                  page={page}
                  label={localizedPageLabel(page, locale)}
                  active={activePage === page.id}
                  onClick={() => setActivePage(page.id)}
                />
              ))}
            </div>
          </section>
        ))}

        {cms.length > 0 ? (
          <section>
            <header className="mb-2 flex items-center justify-between px-1">
              <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                <Layers className="h-3 w-3" />
                {t.editor.cmsPages}
              </div>
              <span className="rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                {cms.length}
              </span>
            </header>
            <div className="grid grid-cols-1 gap-2.5">
              {cms.map((page) => (
                <PageCard
                  key={page.id}
                  page={page}
                  label={localizedPageLabel(page, locale)}
                  active={activePage === page.id}
                  badge="CMS"
                  onClick={() => setActivePage(page.id)}
                />
              ))}
            </div>
          </section>
        ) : null}

        <section>
          <header className="mb-2 flex items-center justify-between px-1">
            <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              <FileText className="h-3 w-3" />
              {t.editor.customPages}
            </div>
            <span className="rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
              {custom.length}
            </span>
          </header>
          <div className="grid grid-cols-1 gap-2.5">
            {custom.map((page) => (
              <PageCard
                key={page.id}
                page={page}
                label={localizedPageLabel(page, locale)}
                active={activePage === page.id}
                badge={page.published === false ? t.editor.unpublished : undefined}
                onClick={() => setActivePage(page.id)}
              />
            ))}
          </div>
          <div className="mt-2.5">
            <CreatePageForm />
          </div>
        </section>

        <p className="px-1 text-[11px] leading-relaxed text-muted-foreground">{t.editor.pagesHint}</p>
      </div>
    </ScrollArea>
  );
}
