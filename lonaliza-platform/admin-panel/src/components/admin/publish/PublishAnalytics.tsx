"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { BarChart3, Loader2, PlugZap, RefreshCw } from "lucide-react";
import { adminCardClass, adminGhostBtnClass } from "@/components/admin/ui/admin-ui-classes";
import { cn } from "@/lib/utils";
import {
  fetchPublishAnalyticsOverview,
  fetchPublishChannelAnalytics,
  fetchPublishPostAnalytics,
  fetchPublishPosts,
} from "./api";
import { ANALYTICS_PLATFORMS, PROVIDER_LABEL_AR } from "./constants";
import { PublishShell } from "./PublishShell";
import type { PublishChannelAnalytics, PublishPost, PublishPostAnalytics } from "./types";

function seriesTotal(item: PublishChannelAnalytics["series"][number]): string {
  if (item.data.length === 0) return "—";
  const sum = item.data.reduce((acc, point) => acc + (Number.isFinite(point.total) ? point.total : 0), 0);
  const value = item.average ? sum / item.data.length : sum;
  if (item.average) return `${value.toFixed(1)}%`;
  return new Intl.NumberFormat("ar").format(Math.round(value));
}

function Sparkline({ data }: { data: Array<{ total: number }> }) {
  if (data.length < 2) return null;
  const values = data.map((row) => row.total);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  const w = 160;
  const h = 56;
  const points = values
    .map((value, i) => {
      const x = (i / (values.length - 1)) * w;
      const y = h - ((value - min) / span) * (h - 6) - 3;
      return `${x},${y}`;
    })
    .join(" ");
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="h-16 w-full text-primary" aria-hidden>
      <polyline fill="none" stroke="currentColor" strokeWidth="2" points={points} />
    </svg>
  );
}

function EmptyAnalytics({
  title,
  body,
  reconnect,
}: {
  title: string;
  body: string;
  reconnect?: string;
}) {
  return (
    <div className='flex min-h-64 flex-col items-center justify-center rounded-3xl border border-dashed border-border bg-card px-6 py-10 text-center'>
      <BarChart3 className="mb-3 size-10 text-primary" />
      <p className='text-sm font-black text-foreground'>{title}</p>
      <p className='mt-2 max-w-md text-xs leading-relaxed text-muted-foreground'>{body}</p>
      {reconnect ? (
        <Link
          href={reconnect}
          className='mt-4 inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground'
        >
          <PlugZap className="size-4" />
          إعادة ربط الحساب
        </Link>
      ) : null}
    </div>
  );
}

export function PublishAnalytics() {
  const [days, setDays] = useState(7);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reconnectUrl, setReconnectUrl] = useState("/admin/social-accounts");
  const [channels, setChannels] = useState<PublishChannelAnalytics[]>([]);
  const [currentId, setCurrentId] = useState("");
  const [detail, setDetail] = useState<PublishChannelAnalytics | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [posts, setPosts] = useState<PublishPost[]>([]);
  const [postStats, setPostStats] = useState<Record<string, PublishPostAnalytics>>({});
  const [postBusy, setPostBusy] = useState("");

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      setLoading(true);
      const result = await fetchPublishAnalyticsOverview(days);
      if (cancelled) return;
      if (!result.ok) {
        setError(result.error || "تعذّر تحميل التحليلات");
        setChannels([]);
        setLoading(false);
        return;
      }
      setError("");
      setReconnectUrl(result.data?.reconnectUrl || "/admin/social-accounts");
      const rows = result.data?.channels ?? [];
      setChannels(rows);
      setCurrentId((prev) => {
        if (prev && rows.some((row) => row.channelId === prev)) return prev;
        return rows[0]?.channelId || "";
      });
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [days]);

  useEffect(() => {
    if (!currentId) {
      setDetail(null);
      setPosts([]);
      return;
    }
    let cancelled = false;
    void (async () => {
      setDetailLoading(true);
      const [analyticsRes, postsRes] = await Promise.all([
        fetchPublishChannelAnalytics(currentId, days),
        fetchPublishPosts({ channel: currentId, state: "published" }),
      ]);
      if (cancelled) return;
      setDetail(analyticsRes.data);
      setPosts((postsRes.data ?? []).filter((row) => row.channelId === currentId && row.state === "published"));
      setPostStats({});
      setDetailLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [currentId, days]);

  const current = detail || channels.find((row) => row.channelId === currentId) || null;
  const windows = current?.windows?.length ? current.windows : [7, 30, 90];

  const catalogDisconnected = useMemo(() => {
    const connected = new Set(channels.map((row) => row.provider));
    return ANALYTICS_PLATFORMS.filter((row) => !connected.has(row.id));
  }, [channels]);

  const loadPost = async (postId: string) => {
    setPostBusy(postId);
    const result = await fetchPublishPostAnalytics(postId, days);
    if (result.data) {
      setPostStats((prev) => ({ ...prev, [postId]: result.data as PublishPostAnalytics }));
    }
    setPostBusy("");
  };

  return (
    <PublishShell
      title="تحليلات النشر"
      description="إحصاءات حية على مستوى الحساب لكافة شبكات التواصل الرسمية. لا رسوم بيانية مخترعة للقنوات غير المتصلة."
      actions={
        <Link href={reconnectUrl} className={adminGhostBtnClass}>
          <PlugZap className="size-4" />
          الحسابات الاجتماعية
        </Link>
      }
    >
      {loading ? (
        <div className='flex min-h-64 items-center justify-center text-sm text-muted-foreground'>
          <Loader2 className="me-2 size-4 animate-spin" />
          جاري تحميل التحليلات…
        </div>
      ) : error ? (
        <EmptyAnalytics title="تعذّر التحميل" body={error} reconnect={reconnectUrl} />
      ) : channels.length === 0 ? (
        <EmptyAnalytics
          title="لا قنوات تحليلات متصلة"
          body="اربط فيسبوك، إنستغرام، لينكدإن الصفحة، تيك توك، يوتيوب، جوجل أعمالي، بنترست، ثريدز أو إكس من صفحة الحسابات الاجتماعية. لن تُعرض أرقام وهمية."
          reconnect={reconnectUrl}
        />
      ) : (
        <div className="grid gap-5 lg:grid-cols-12">
          <aside className="space-y-2 lg:col-span-3">
            {channels.map((channel) => (
              <button
                key={channel.channelId}
                type="button"
                onClick={() => setCurrentId(channel.channelId)}
                className={cn(
                  "w-full rounded-2xl border px-3 py-3 text-right transition-colors",
                  currentId === channel.channelId
                    ? 'border-admin-accent/40 bg-primary-soft'
                    : 'border-border bg-admin-bg-subtle hover:border-admin-accent/30'
                )}
              >
                <span className='block text-sm font-bold text-foreground'>{channel.name}</span>
                <span className='mt-0.5 block text-[11px] text-muted-foreground'>
                  {PROVIDER_LABEL_AR[channel.provider] || channel.provider}
                  {channel.live ? " · حي" : " · بلا بيانات"}
                </span>
              </button>
            ))}
          </aside>

          <section className="lg:col-span-9">
            <div className="mb-4 flex flex-wrap items-center gap-2">
              {windows.map((window) => (
                <button
                  key={window}
                  type="button"
                  onClick={() => setDays(window)}
                  className={cn(
                    "rounded-xl border px-3 py-1.5 text-xs font-bold",
                    days === window
                      ? 'border-admin-accent/50 bg-primary-soft text-primary'
                      : 'border-border text-muted-foreground'
                  )}
                >
                  {window} يوماً
                </button>
              ))}
            </div>

            {detailLoading ? (
              <div className='flex min-h-48 items-center justify-center text-sm text-muted-foreground'>
                <Loader2 className="me-2 size-4 animate-spin" />
                جاري جلب الإحصاءات الحية…
              </div>
            ) : !current ? (
              <EmptyAnalytics title="اختر قناة" body="لا قناة محددة." />
            ) : current.status !== "ok" || current.series.length === 0 ? (
              <EmptyAnalytics
                title={
                  current.status === "missing_token" || current.status === "needs_reconnect"
                    ? "الحساب يحتاج إعادة ربط"
                    : current.status === "empty"
                      ? "لا بيانات في هذه الفترة"
                      : "لا تحليلات للعرض"
                }
                body={
                  current.messageAr ||
                  "لم تُرجع واجهة المنصة نقاطاً. لن نختلق رسماً بيانياً."
                }
                reconnect={current.reconnectUrl}
              />
            ) : (
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {current.series.map((item) => (
                  <article key={item.label} className={adminCardClass}>
                    <p className='text-xs font-bold text-muted-foreground'>{item.labelAr}</p>
                    <p className='mt-2 text-3xl font-black text-foreground'>{seriesTotal(item)}</p>
                    <Sparkline data={item.data} />
                  </article>
                ))}
              </div>
            )}

            <div className="mt-8">
              <h3 className='mb-3 text-sm font-black text-foreground'>إحصاءات المنشورات</h3>
              {posts.length === 0 ? (
                <p className='rounded-2xl border border-dashed border-border px-4 py-6 text-xs text-muted-foreground'>
                  لا منشورات منشورة بهذه القناة لإحصاءات المنشورات الفردية.
                </p>
              ) : (
                <div className="space-y-2">
                  {posts.map((post) => {
                    const stats = postStats[post.id];
                    return (
                      <div key={post.id} className='rounded-2xl border border-border bg-admin-bg-subtle px-4 py-3'>
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <p className='text-sm font-bold text-foreground'>
                            {post.title || post.content.slice(0, 72) || post.id}
                          </p>
                          <button
                            type="button"
                            className={adminGhostBtnClass}
                            disabled={postBusy === post.id}
                            onClick={() => void loadPost(post.id)}
                          >
                            {postBusy === post.id ? <Loader2 className="size-4 animate-spin" /> : <RefreshCw className="size-4" />}
                            إحصاءات المنشور
                          </button>
                        </div>
                        {!post.releaseId ? (
                          <p className="mt-2 text-[11px] text-muted-foreground">بلا releaseId — الإحصاءات البعيدة غير متاحة.</p>
                        ) : null}
                        {stats ? (
                          stats.series.length === 0 ? (
                            <p className='mt-2 text-xs text-muted-foreground'>{stats.messageAr || "لا إحصاءات لهذا المنشور."}</p>
                          ) : (
                            <div className="mt-2 flex flex-wrap gap-2">
                              {stats.series.map((item) => (
                                <span
                                  key={item.label}
                                  className='rounded-lg border border-border bg-card px-2 py-1 text-[11px] font-bold'
                                >
                                  {item.labelAr}: {seriesTotal(item)}
                                </span>
                              ))}
                            </div>
                          )
                        ) : null}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </section>
        </div>
      )}

      {catalogDisconnected.length > 0 ? (
        <div className="mt-8">
          <h3 className='mb-3 text-sm font-black text-foreground'>منصات مدعومة وغير متصلة</h3>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
            {catalogDisconnected.map((platform) => (
              <article key={platform.id} className={adminCardClass}>
                <h4 className='text-sm font-black text-foreground'>{platform.nameAr}</h4>
                <p className="mt-1 text-[11px] font-mono text-muted-foreground">{platform.id}</p>
                <p className='mt-2 text-xs leading-relaxed text-muted-foreground'>{platform.note}</p>
                <Link href={reconnectUrl} className="mt-3 inline-block text-[11px] font-bold text-primary hover:underline">
                  ربط الحساب
                </Link>
              </article>
            ))}
          </div>
        </div>
      ) : null}
    </PublishShell>
  );
}
