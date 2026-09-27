"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Copy,
  Link2,
  Loader2,
  PenLine,
  Share2,
  Trash2,
} from "lucide-react";
import { adminGhostBtnClass, adminPrimaryBtnClass } from "@/components/admin/ui/admin-ui-classes";
import { cn } from "@/lib/utils";
import {
  changePublishPostStatus,
  deletePublishPost,
  duplicatePublishPost,
  fetchMissingReleasePosts,
  fetchPublishChannels,
  fetchPublishPosts,
  patchPublishReleaseId,
  type MissingReleaseRow,
} from "./api";
import { FALLBACK_CHANNEL_OPTIONS, PROVIDER_LABEL_AR, PUBLISH_STATE_AR, PUBLISH_STATE_CLASS, WEEKDAY_AR } from "./constants";
import { PublishShell } from "./PublishShell";
import type { CalendarView, PublishChannel, PublishPost, PublishState } from "./types";

function startOfDay(date: Date): Date {
  const next = new Date(date);
  next.setHours(0, 0, 0, 0);
  return next;
}

function addDays(date: Date, amount: number): Date {
  const next = new Date(date);
  next.setDate(next.getDate() + amount);
  return next;
}

/** Saturday-first week, matching Gulf/Arabic calendars. */
function startOfWeekSaturday(date: Date): Date {
  const start = startOfDay(date);
  const diff = (start.getDay() + 1) % 7;
  return addDays(start, -diff);
}

function sameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function formatDayLabel(date: Date): string {
  return date.toLocaleDateString("ar-EG", { day: "numeric", month: "short" });
}

function formatFullDate(date: Date): string {
  return date.toLocaleDateString("ar-EG", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
}

function formatTime(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleTimeString("ar-EG", { hour: "2-digit", minute: "2-digit" });
}

function channelLabel(channels: PublishChannel[], channelId: string): string {
  const found = channels.find((row) => row.id === channelId || row.provider === channelId);
  if (found) return found.name || PROVIDER_LABEL_AR[found.provider] || found.provider;
  return PROVIDER_LABEL_AR[channelId] || channelId || "قناة";
}

function monthCells(anchor: Date): Date[] {
  const first = new Date(anchor.getFullYear(), anchor.getMonth(), 1);
  const start = startOfWeekSaturday(first);
  return Array.from({ length: 42 }, (_, i) => addDays(start, i));
}

export function PublishCalendar() {
  const [view, setView] = useState<CalendarView>("week");
  const [anchor, setAnchor] = useState(() => startOfDay(new Date()));
  const [channelFilter, setChannelFilter] = useState("");
  const [posts, setPosts] = useState<PublishPost[]>([]);
  const [channels, setChannels] = useState<PublishChannel[]>([]);
  const [loading, setLoading] = useState(true);
  const [apiMissing, setApiMissing] = useState(false);
  const [error, setError] = useState("");
  const [actingId, setActingId] = useState("");
  const [missingOpen, setMissingOpen] = useState(false);
  const [missingRows, setMissingRows] = useState<MissingReleaseRow[]>([]);
  const [missingHint, setMissingHint] = useState("");
  const [bindId, setBindId] = useState("");
  const [bindValue, setBindValue] = useState("");
  const [bindBusy, setBindBusy] = useState("");

  const range = useMemo(() => {
    if (view === "day") {
      const from = startOfDay(anchor);
      return { from, to: addDays(from, 1) };
    }
    if (view === "month") {
      const from = startOfWeekSaturday(new Date(anchor.getFullYear(), anchor.getMonth(), 1));
      return { from, to: addDays(from, 42) };
    }
    const from = startOfWeekSaturday(anchor);
    return { from, to: addDays(from, 7) };
  }, [anchor, view]);

  const load = async () => {
    try {
      const [postsRes, channelsRes] = await Promise.all([
        fetchPublishPosts({
          from: range.from.toISOString(),
          to: range.to.toISOString(),
          channel: channelFilter || undefined,
        }),
        fetchPublishChannels(),
      ]);
      setApiMissing(Boolean(postsRes.missing && channelsRes.missing));
      setPosts(postsRes.data ?? []);
      setChannels(channelsRes.data ?? []);
      setError(!postsRes.ok && !postsRes.missing ? postsRes.error || "تعذّر تحميل المنشورات" : "");
      const missingRes = await fetchMissingReleasePosts();
      setMissingRows(missingRes.data?.posts ?? []);
      setMissingHint(missingRes.data?.messageAr || "");
    } catch {
      setPosts([]);
      setError("تعذّر تحميل محرك النشر");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    void (async () => {
      await load();
      if (cancelled) return;
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [channelFilter, range.from, range.to]);

  const filterChannels = channels.length > 0 ? channels : FALLBACK_CHANNEL_OPTIONS;
  const visiblePosts = posts.filter((post) => {
    if (!channelFilter) return true;
    return post.channelId === channelFilter;
  });

  const postsByDay = useMemo(() => {
    const map = new Map<string, PublishPost[]>();
    for (const post of visiblePosts) {
      const date = new Date(post.publishDate);
      if (Number.isNaN(date.getTime())) continue;
      const key = startOfDay(date).toISOString();
      const list = map.get(key) ?? [];
      list.push(post);
      map.set(key, list);
    }
    for (const list of map.values()) {
      list.sort((a, b) => a.publishDate.localeCompare(b.publishDate));
    }
    return map;
  }, [visiblePosts]);

  const weekDays = useMemo(() => Array.from({ length: 7 }, (_, i) => addDays(startOfWeekSaturday(anchor), i)), [anchor]);

  const shift = (dir: number) => {
    if (view === "day") setAnchor((prev) => addDays(prev, dir));
    else if (view === "month") setAnchor((prev) => new Date(prev.getFullYear(), prev.getMonth() + dir, 1));
    else setAnchor((prev) => addDays(prev, dir * 7));
  };

  const rangeLabel =
    view === "day"
      ? formatFullDate(anchor)
      : view === "month"
        ? anchor.toLocaleDateString("ar-EG", { month: "long", year: "numeric" })
        : `${formatDayLabel(weekDays[0])} — ${formatDayLabel(weekDays[6])}`;

  const empty = !loading && visiblePosts.length === 0;

  const runAction = async (post: PublishPost, action: "draft" | "queue" | "duplicate" | "delete") => {
    setActingId(post.id);
    setError("");
    try {
      if (action === "delete") {
        if (!confirm("حذف هذا المنشور؟")) return;
        const result = await deletePublishPost(post.id);
        if (!result.ok) setError(result.error || "تعذّر الحذف");
      } else if (action === "duplicate") {
        const result = await duplicatePublishPost(post);
        if (!result.ok) setError(result.error || "تعذّر النسخ");
      } else {
        const result = await changePublishPostStatus(post.id, { state: action });
        if (!result.ok) setError(result.error || "تعذّر تغيير الحالة");
      }
      await load();
    } finally {
      setActingId("");
    }
  };

  const bindRelease = async (postId: string) => {
    const value = bindId === postId ? bindValue.trim() : "";
    if (!value) {
      setError("أدخلوا معرف النشر البعيد");
      return;
    }
    setBindBusy(postId);
    setError("");
    try {
      const result = await patchPublishReleaseId(postId, value);
      if (!result.ok) {
        setError(result.error || "تعذّر ربط معرف النشر");
        return;
      }
      setBindId("");
      setBindValue("");
      await load();
    } finally {
      setBindBusy("");
    }
  };

  const openBind = (postId: string) => {
    setMissingOpen(true);
    setBindId(postId);
    setBindValue("");
  };

  return (
    <PublishShell
      title="محرك النشر"
      description="تقويم جدولة المحتوى السياحي عبر القنوات المتصلة. الحسابات تُدار من صفحة الربط الرسمية."
      actions={
        <div className="flex flex-wrap gap-2">
          <Link href="/admin/social-accounts" className={adminGhostBtnClass}>
            <Share2 className="size-4" />
            الحسابات المتصلة
          </Link>
          <Link href="/admin/publish/compose" className={adminPrimaryBtnClass}>
            <PenLine className="size-4" />
            منشور جديد
          </Link>
          <button
            type="button"
            className={adminGhostBtnClass}
            onClick={() => setMissingOpen((open) => !open)}
          >
            <Link2 className="size-4" />
            بلا معرف نشر
            {missingRows.length > 0 ? (
              <span className="rounded-full bg-admin-bg-subtle px-1.5 text-[11px] font-black text-admin-btn-secondary-hover">
                {missingRows.length}
              </span>
            ) : null}
          </button>
        </div>
      }
    >
      <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          {(["week", "list", "day", "month"] as CalendarView[]).map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setView(item)}
              className={cn(
                "admin-tap rounded-xl border px-3 py-2 text-xs font-bold transition-colors",
                view === item
                  ? 'border-admin-accent/40 bg-primary-soft text-primary'
                  : 'border-border bg-card text-muted-foreground hover:text-foreground'
              )}
            >
              {item === "week" ? "أسبوع" : item === "list" ? "قائمة" : item === "day" ? "يوم" : "شهر"}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button type="button" className={adminGhostBtnClass} onClick={() => shift(-1)} aria-label="السابق">
            <ChevronRight className="size-4" />
          </button>
          <button type="button" className={adminGhostBtnClass} onClick={() => setAnchor(startOfDay(new Date()))}>
            اليوم
          </button>
          <button type="button" className={adminGhostBtnClass} onClick={() => shift(1)} aria-label="التالي">
            <ChevronLeft className="size-4" />
          </button>
          <span className='px-2 text-sm font-bold text-foreground'>{rangeLabel}</span>
          <select
            value={channelFilter}
            onChange={(e) => setChannelFilter(e.target.value)}
            className='min-h-11 rounded-xl border border-border bg-card px-3 text-sm text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-admin-accent/40'
          >
            <option value="">كل القنوات</option>
            {filterChannels.map((channel) => (
              <option key={channel.id} value={channel.id}>
                {channel.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {error ? (
        <div className="mb-4 flex items-center gap-2 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-200">
          <AlertCircle className="size-4 shrink-0" />
          {error}
        </div>
      ) : null}

      {missingOpen ? (
        <MissingReleasePanel
          rows={missingRows}
          hint={missingHint}
          bindId={bindId}
          bindValue={bindValue}
          bindBusy={bindBusy}
          onSelect={openBind}
          onChangeValue={setBindValue}
          onSave={bindRelease}
        />
      ) : null}

      {loading ? (
        <div className='flex min-h-64 items-center justify-center rounded-2xl border border-border bg-card text-sm text-muted-foreground'>
          <Loader2 className="me-2 size-4 animate-spin" />
          جاري تحميل التقويم…
        </div>
      ) : empty ? (
        <EmptyCalendar apiMissing={apiMissing} />
      ) : view === "list" ? (
        <ListView posts={visiblePosts} channels={channels} actingId={actingId} onAction={runAction} onBind={openBind} />
      ) : view === "day" ? (
        <DayView date={anchor} posts={postsByDay.get(startOfDay(anchor).toISOString()) ?? []} channels={channels} actingId={actingId} onAction={runAction} onBind={openBind} />
      ) : view === "month" ? (
        <MonthView
          anchor={anchor}
          cells={monthCells(anchor)}
          postsByDay={postsByDay}
          channels={channels}
          onSelectDay={(date) => {
            setAnchor(startOfDay(date));
            setView("day");
          }}
        />
      ) : (
        <WeekView days={weekDays} postsByDay={postsByDay} channels={channels} actingId={actingId} onAction={runAction} onBind={openBind} />
      )}
    </PublishShell>
  );
}

function EmptyCalendar({ apiMissing }: { apiMissing: boolean }) {
  return (
    <div className="flex min-h-80 flex-col items-center justify-center rounded-3xl border border-dashed border-[color:var(--admin-border-subtle)] bg-gradient-to-b from-[color:var(--admin-gold-soft)] to-admin-bg-surface px-6 py-12 text-center  ">
      <div className='mb-4 flex size-14 items-center justify-center rounded-2xl border border-[color:var(--admin-border-subtle)] bg-card text-[color:var(--admin-gold)] shadow-xs   dark:text-[color:var(--admin-text-muted)]'>
        <CalendarDays className="size-7" />
      </div>
      <h2 className='text-lg font-black text-foreground'>هذا محرك النشر</h2>
      <p className='mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground'>
        من هنا تُجدول المنشورات السياحية على القنوات المتصلة: مسودة، طابور، أو نشر بعد الاعتماد.
        لا توجد منشورات في هذا النطاق، ولن نعرض حجوزات أو بيانات تجريبية.
      </p>
      {apiMissing ? (
        <p className='mt-2 max-w-xl text-xs text-muted-foreground'>
          واجهة البرمجة `/api/admin/publish/posts` غير متاحة حالياً. التقويم جاهز وسيُملأ تلقائياً عند تفعيل المحرك.
        </p>
      ) : null}
      <div className="mt-6 flex flex-wrap justify-center gap-2">
        <Link href="/admin/social-accounts" className={adminGhostBtnClass}>
          <Share2 className="size-4" />
          ربط الحسابات الرسمية
        </Link>
        <Link href="/admin/publish/compose" className={adminPrimaryBtnClass}>
          <PenLine className="size-4" />
          اكتب منشوراً في الملحن
        </Link>
      </div>
    </div>
  );
}

function needsReleaseBind(post: PublishPost): boolean {
  return (post.state === "published" || post.state === "error") && !String(post.releaseId || "").trim();
}

function PostChip({
  post,
  channels,
  actingId,
  onAction,
  onBind,
}: {
  post: PublishPost;
  channels: PublishChannel[];
  actingId?: string;
  onAction?: (post: PublishPost, action: "draft" | "queue" | "duplicate" | "delete") => void;
  onBind?: (postId: string) => void;
}) {
  const errored = post.state === "error" || Boolean(post.error);
  return (
    <div
      className={cn(
        "rounded-xl border bg-admin-bg-subtle p-2 text-right",
        errored ? "border-rose-300 dark:border-rose-800" : 'border-border'
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <span className='truncate text-[11px] font-bold text-foreground'>
          {channelLabel(channels, post.channelId)}
        </span>
        <span className={cn("rounded-full border px-1.5 py-0.5 text-[10px] font-bold", PUBLISH_STATE_CLASS[post.state])}>
          {PUBLISH_STATE_AR[post.state]}
        </span>
      </div>
      <p className='mt-1 line-clamp-2 text-[11px] leading-relaxed text-muted-foreground'>{post.content || post.title || "بدون نص"}</p>
      <p className="mt-1 text-[10px] text-muted-foreground">{formatTime(post.publishDate)}</p>
      {errored ? (
        <p className="mt-1 rounded-lg bg-rose-50 px-2 py-1 text-[10px] font-semibold text-rose-700 dark:bg-rose-950/50 dark:text-rose-300">
          {post.error || "فشل النشر"}
        </p>
      ) : null}
      {needsReleaseBind(post) ? (
        <button
          type="button"
          className='mt-1 inline-flex items-center gap-0.5 rounded-md border border-border bg-amber-50 px-1.5 py-0.5 text-[10px] font-bold text-admin-btn-secondary-border'
          onClick={() => onBind?.(post.id)}
        >
          <Link2 className="size-3" />
          ربط معرف النشر
        </button>
      ) : null}
      {onAction ? (
        <div className="mt-2 flex flex-wrap gap-1">
          {post.state === "draft" || post.state === "error" ? (
            <button type="button" className="rounded-md border border-[color:var(--admin-border-subtle)] px-1.5 py-0.5 text-[10px] font-bold text-[color:var(--admin-gold)] disabled:opacity-50" disabled={actingId === post.id} onClick={() => onAction(post, "queue")}>
              إلى الطابور
            </button>
          ) : null}
          {post.state === "queue" || post.state === "error" ? (
            <button type="button" className='rounded-md border border-border px-1.5 py-0.5 text-[10px] font-bold text-foreground disabled:opacity-50' disabled={actingId === post.id} onClick={() => onAction(post, "draft")}>
              مسودة
            </button>
          ) : null}
          <button type="button" className='inline-flex items-center gap-0.5 rounded-md border border-border px-1.5 py-0.5 text-[10px] disabled:opacity-50' disabled={actingId === post.id} onClick={() => onAction(post, "duplicate")}>
            <Copy className="size-3" />
            نسخ
          </button>
          <button type="button" className="inline-flex items-center gap-0.5 rounded-md border border-rose-200 px-1.5 py-0.5 text-[10px] text-rose-700 disabled:opacity-50" disabled={actingId === post.id} onClick={() => onAction(post, "delete")}>
            <Trash2 className="size-3" />
            حذف
          </button>
        </div>
      ) : null}
    </div>
  );
}

function WeekView({
  days,
  postsByDay,
  channels,
  actingId,
  onAction,
  onBind,
}: {
  days: Date[];
  postsByDay: Map<string, PublishPost[]>;
  channels: PublishChannel[];
  actingId?: string;
  onAction?: (post: PublishPost, action: "draft" | "queue" | "duplicate" | "delete") => void;
  onBind?: (postId: string) => void;
}) {
  const today = startOfDay(new Date());
  return (
    <div className="grid grid-cols-1 gap-2 md:grid-cols-7">
      {days.map((day, index) => {
        const list = postsByDay.get(startOfDay(day).toISOString()) ?? [];
        const isToday = sameDay(day, today);
        return (
          <div
            key={day.toISOString()}
            className={cn(
              'min-h-56 rounded-2xl border bg-card p-2.5',
              isToday ? "border-admin-accent/50 ring-1 ring-admin-accent/20" : 'border-border'
            )}
          >
            <div className="mb-2 flex items-center justify-between text-xs">
              <span className='font-bold text-foreground'>{WEEKDAY_AR[index]}</span>
              <span className={cn("font-semibold", isToday ? "text-primary" : 'text-muted-foreground')}>
                {day.getDate()}
              </span>
            </div>
            <div className="space-y-2">
              {list.length === 0 ? (
                <p className="pt-6 text-center text-[11px] text-muted-foreground">لا منشورات</p>
              ) : (
                list.map((post) => <PostChip key={post.id} post={post} channels={channels} actingId={actingId} onAction={onAction} onBind={onBind} />)
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function DayView({
  date,
  posts,
  channels,
  actingId,
  onAction,
  onBind,
}: {
  date: Date;
  posts: PublishPost[];
  channels: PublishChannel[];
  actingId?: string;
  onAction?: (post: PublishPost, action: "draft" | "queue" | "duplicate" | "delete") => void;
  onBind?: (postId: string) => void;
}) {
  return (
    <div className='rounded-2xl border border-border bg-card p-4'>
      <h3 className='mb-3 text-sm font-black text-foreground'>{formatFullDate(date)}</h3>
      {posts.length === 0 ? (
        <p className='py-10 text-center text-sm text-muted-foreground'>لا توجد منشورات في هذا اليوم.</p>
      ) : (
        <ul className="space-y-2">
          {posts.map((post) => (
            <li key={post.id} className='rounded-2xl border border-border p-3'>
              <PostChip post={post} channels={channels} actingId={actingId} onAction={onAction} onBind={onBind} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function MonthView({
  anchor,
  cells,
  postsByDay,
  channels,
  onSelectDay,
}: {
  anchor: Date;
  cells: Date[];
  postsByDay: Map<string, PublishPost[]>;
  channels: PublishChannel[];
  onSelectDay: (date: Date) => void;
}) {
  return (
    <div>
      <div className='mb-2 grid grid-cols-7 gap-1 text-center text-[11px] font-bold text-muted-foreground'>
        {WEEKDAY_AR.map((day) => (
          <div key={day} className="py-1">
            {day}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {cells.map((day) => {
          const list = postsByDay.get(startOfDay(day).toISOString()) ?? [];
          const outside = day.getMonth() !== anchor.getMonth();
          return (
            <button
              key={day.toISOString()}
              type="button"
              onClick={() => onSelectDay(day)}
              className={cn(
                "min-h-20 rounded-xl border p-1.5 text-right transition-colors",
                outside
                  ? "border-transparent bg-admin-bg-subtle/50 text-muted-foreground"
                  : 'border-border bg-card hover:border-admin-accent/40'
              )}
            >
              <span className="text-[11px] font-bold">{day.getDate()}</span>
              <div className="mt-1 space-y-1">
                {list.slice(0, 2).map((post) => (
                  <span key={post.id} className={cn("block truncate rounded-md border px-1 text-[9px]", PUBLISH_STATE_CLASS[post.state])}>
                    {channelLabel(channels, post.channelId)}
                  </span>
                ))}
                {list.length > 2 ? (
                  <span className='text-[9px] text-muted-foreground'>+{list.length - 2}</span>
                ) : null}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function ListView({
  posts,
  channels,
  actingId,
  onAction,
  onBind,
}: {
  posts: PublishPost[];
  channels: PublishChannel[];
  actingId?: string;
  onAction?: (post: PublishPost, action: "draft" | "queue" | "duplicate" | "delete") => void;
  onBind?: (postId: string) => void;
}) {
  const sorted = [...posts].sort((a, b) => a.publishDate.localeCompare(b.publishDate));
  return (
    <div className='overflow-hidden rounded-2xl border border-border bg-card'>
      <table className="w-full text-sm">
        <thead className='bg-admin-bg-subtle text-xs text-muted-foreground'>
          <tr>
            <th className="px-4 py-3 text-right font-bold">الموعد</th>
            <th className="px-4 py-3 text-right font-bold">القناة</th>
            <th className="px-4 py-3 text-right font-bold">الحالة</th>
            <th className="px-4 py-3 text-right font-bold">النص</th>
            <th className="px-4 py-3 text-right font-bold">إجراءات</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((post) => (
            <tr key={post.id} className='border-t border-border'>
              <td className='whitespace-nowrap px-4 py-3 text-foreground'>
                {new Date(post.publishDate).toLocaleString("ar-EG", {
                  day: "numeric",
                  month: "short",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </td>
              <td className="px-4 py-3">{channelLabel(channels, post.channelId)}</td>
              <td className="px-4 py-3">
                <span className={cn("rounded-full border px-2 py-0.5 text-[11px] font-bold", PUBLISH_STATE_CLASS[post.state])}>
                  {PUBLISH_STATE_AR[post.state as PublishState] || post.state}
                </span>
              </td>
              <td className='max-w-md truncate px-4 py-3 text-muted-foreground'>
                {post.content || post.title || "—"}
                {post.error ? <span className="mt-1 block truncate text-[11px] text-rose-600">{post.error}</span> : null}
              </td>
              <td className="px-4 py-3">
                <PostChip post={post} channels={channels} actingId={actingId} onAction={onAction} onBind={onBind} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function MissingReleasePanel({
  rows,
  hint,
  bindId,
  bindValue,
  bindBusy,
  onSelect,
  onChangeValue,
  onSave,
}: {
  rows: MissingReleaseRow[];
  hint: string;
  bindId: string;
  bindValue: string;
  bindBusy: string;
  onSelect: (postId: string) => void;
  onChangeValue: (value: string) => void;
  onSave: (postId: string) => void;
}) {
  return (
    <div className='mb-4 rounded-2xl border border-border bg-amber-50/80 p-4 dark:border-border dark:bg-[var(--admin-btn-secondary-border)]/30'>
      <div className="mb-2 flex items-center gap-2 text-sm font-black text-admin-btn-secondary-border ">
        <Link2 className="size-4" />
        منشورات بلا معرف نشر بعيد
      </div>
      {hint ? <p className="mb-3 text-xs leading-relaxed text-admin-btn-secondary-hover text-[color:var(--admin-gold)]">{hint}</p> : null}
      {rows.length === 0 ? (
        <p className='text-xs text-muted-foreground'>لا توجد منشورات منشورة بلا releaseId.</p>
      ) : (
        <ul className="space-y-2">
          {rows.map((row) => (
            <li key={row.id} className='rounded-xl border border-border bg-card p-3 dark:border-border dark:bg-card'>
              <p className='text-xs font-bold text-foreground'>
                {row.channelName || row.provider || row.channelId}
              </p>
              <p className='mt-1 line-clamp-2 text-xs text-muted-foreground'>{row.content || row.title || row.id}</p>
              {bindId === row.id ? (
                <div className="mt-2 flex flex-wrap gap-2">
                  <input
                    value={bindValue}
                    onChange={(e) => onChangeValue(e.target.value)}
                    placeholder="releaseId"
                    className='min-h-10 min-w-48 flex-1 rounded-xl border border-border bg-card px-3 text-sm'
                  />
                  <button
                    type="button"
                    className={adminPrimaryBtnClass}
                    disabled={bindBusy === row.id}
                    onClick={() => onSave(row.id)}
                  >
                    {bindBusy === row.id ? <Loader2 className="size-4 animate-spin" /> : "حفظ المعرف"}
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  className='mt-2 rounded-md border border-border px-2 py-1 text-[11px] font-bold text-admin-btn-secondary-border'
                  onClick={() => onSelect(row.id)}
                >
                  ربط معرف
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
