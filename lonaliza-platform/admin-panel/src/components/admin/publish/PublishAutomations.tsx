"use client";

import { useEffect, useMemo, useState } from "react";
import { Loader2, Plug, Plus, Rss, Trash2, Webhook } from "lucide-react";
import {
  adminCardClass,
  adminGhostBtnClass,
  adminInputClass,
  adminLabelClass,
  adminPrimaryBtnClass,
} from "@/components/admin/ui/admin-ui-classes";
import { cn } from "@/lib/utils";
import {
  deletePublishRssFeed,
  deletePublishWebhook,
  fetchPublishChannels,
  fetchPublishPlugs,
  fetchPublishRssFeeds,
  fetchPublishWebhooks,
  previewPublishRss,
  savePublishPlug,
  savePublishRssFeed,
  savePublishWebhook,
} from "./api";
import { PROVIDER_LABEL_AR } from "./constants";
import { PublishShell } from "./PublishShell";
import type {
  PublishChannel,
  PublishPlug,
  PublishPlugCatalog,
  PublishPlugDefinition,
  PublishRssFeed,
  PublishWebhook,
} from "./types";

type AutoTab = "plugs" | "rss" | "webhooks";

const TABS: Array<{ id: AutoTab; label: string; icon: typeof Plug }> = [
  { id: "plugs", label: "Plugs", icon: Plug },
  { id: "rss", label: "RSS", icon: Rss },
  { id: "webhooks", label: "Webhooks", icon: Webhook },
];

function fieldValue(plug: PublishPlug | undefined, name: string): string {
  return plug?.data.find((row) => row.name === name)?.value || "";
}

export function PublishAutomations() {
  const [tab, setTab] = useState<AutoTab>("plugs");
  const [channels, setChannels] = useState<PublishChannel[]>([]);
  const [plugs, setPlugs] = useState<PublishPlug[]>([]);
  const [catalog, setCatalog] = useState<PublishPlugCatalog[]>([]);
  const [feeds, setFeeds] = useState<PublishRssFeed[]>([]);
  const [webhooks, setWebhooks] = useState<PublishWebhook[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const reload = async () => {
    setLoading(true);
    setError("");
    const [ch, pg, rs, wh] = await Promise.all([
      fetchPublishChannels(),
      fetchPublishPlugs(),
      fetchPublishRssFeeds(),
      fetchPublishWebhooks(),
    ]);
    if (ch.data) setChannels(ch.data);
    if (pg.data) {
      setPlugs(pg.data.plugs);
      setCatalog(pg.data.catalog);
    }
    if (rs.data) setFeeds(rs.data);
    if (wh.data) setWebhooks(wh.data);
    const firstError = [pg, rs, wh].find((row) => !row.ok && !row.missing)?.error;
    if (firstError) setError(firstError);
    setLoading(false);
  };

  useEffect(() => {
    void reload();
  }, []);

  return (
    <PublishShell
      title="أتمتة محرك النشر"
      description="Plugs لإعادة النشر عند الأداء المرتفع، تغذية RSS كل ساعة، وإشعارات Webhooks عند النشر أو الخطأ."
    >
      <div className='mb-5 flex flex-wrap gap-1.5 rounded-2xl border border-border bg-card p-1.5'>
        {TABS.map((item) => {
          const Icon = item.icon;
          const active = tab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setTab(item.id)}
              className={cn(
                "admin-tap inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold",
                active
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-primary-soft'
              )}
            >
              <Icon className="size-3.5" />
              {item.label}
            </button>
          );
        })}
      </div>

      {loading ? (
        <div className='flex min-h-40 items-center justify-center text-sm text-muted-foreground'>
          <Loader2 className="me-2 size-4 animate-spin" />
          جاري التحميل…
        </div>
      ) : null}

      {!loading && tab === "plugs" ? (
        <PlugsPanel
          channels={channels}
          plugs={plugs}
          catalog={catalog}
          onChange={setPlugs}
        />
      ) : null}

      {!loading && tab === "rss" ? (
        <RssPanel channels={channels} feeds={feeds} onChange={setFeeds} />
      ) : null}

      {!loading && tab === "webhooks" ? (
        <WebhooksPanel channels={channels} webhooks={webhooks} onChange={setWebhooks} />
      ) : null}

      {error ? <p className="mt-4 text-sm text-rose-600">{error}</p> : null}
    </PublishShell>
  );
}

function PlugsPanel({
  channels,
  plugs,
  catalog,
  onChange,
}: {
  channels: PublishChannel[];
  plugs: PublishPlug[];
  catalog: PublishPlugCatalog[];
  onChange: (rows: PublishPlug[]) => void;
}) {
  const matching = useMemo(() => {
    return channels.filter((channel) =>
      catalog.some((row) => row.identifier === channel.provider && !channel.disabled)
    );
  }, [channels, catalog]);
  const [channelId, setChannelId] = useState("");
  const [busyKey, setBusyKey] = useState("");
  const [formError, setFormError] = useState("");
  const [drafts, setDrafts] = useState<Record<string, Record<string, string>>>({});

  useEffect(() => {
    if (!channelId && matching[0]) setChannelId(matching[0].id);
  }, [channelId, matching]);

  const channel = matching.find((row) => row.id === channelId) || matching[0];
  const providerCatalog = catalog.find((row) => row.identifier === channel?.provider);

  const savedFor = (methodName: string) =>
    plugs.find((row) => row.channelId === channel?.id && row.plugFunction === methodName);

  const saveDef = async (def: PublishPlugDefinition) => {
    if (!channel) return;
    const saved = savedFor(def.methodName);
    const values = drafts[`${channel.id}:${def.methodName}`] || {};
    const data = def.fields.map((field) => ({
      name: field.name,
      value: values[field.name] ?? fieldValue(saved, field.name),
    }));
    if (def.fields.some((field) => field.name === "likesAmount" && !/^\d+$/.test(data.find((row) => row.name === "likesAmount")?.value || ""))) {
      setFormError("أدخل عدد إعجابات صالح.");
      return;
    }
    if (def.kind === "comment" && (data.find((row) => row.name === "post")?.value || "").trim().length < 3) {
      setFormError("نص التعليق قصير جداً.");
      return;
    }
    setBusyKey(def.methodName);
    setFormError("");
    const result = await savePublishPlug({
      id: saved?.id,
      channelId: channel.id,
      plugFunction: def.methodName,
      data,
      activated: saved?.activated ?? true,
    });
    setBusyKey("");
    if (!result.ok || !result.data) {
      setFormError(result.error || "تعذّر حفظ القاعدة.");
      return;
    }
    onChange([result.data, ...plugs.filter((row) => row.id !== result.data?.id)]);
  };

  const toggle = async (def: PublishPlugDefinition, activated: boolean) => {
    const saved = savedFor(def.methodName);
    if (!saved) return;
    setBusyKey(`t-${def.methodName}`);
    const result = await savePublishPlug({ id: saved.id, activated });
    setBusyKey("");
    if (result.data) {
      onChange(plugs.map((row) => (row.id === result.data?.id ? result.data : row)));
    }
  };

  if (matching.length === 0) {
    return (
      <article className={adminCardClass}>
        <h2 className='text-sm font-black text-foreground'>Plugs</h2>
        <p className='mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground'>
          لا توجد قنوات مطابقة. إعادة النشر والتعليق التلقائي تعمل على إكس، ثريدز، صفحة لينكدإن، وبلوسكاي بعد ربط الحساب من التقويم.
        </p>
      </article>
    );
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[220px_1fr]">
      <article className={adminCardClass}>
        <h2 className='text-sm font-black text-foreground'>القنوات</h2>
        <div className="mt-3 space-y-1.5">
          {matching.map((row) => (
            <button
              key={row.id}
              type="button"
              onClick={() => setChannelId(row.id)}
              className={cn(
                "admin-tap flex w-full items-center justify-between rounded-xl px-3 py-2 text-start text-xs font-bold",
                channel?.id === row.id
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-primary-soft'
              )}
            >
              <span>{row.name || PROVIDER_LABEL_AR[row.provider] || row.provider}</span>
              <span className="text-[10px] opacity-80">{PROVIDER_LABEL_AR[row.provider] || row.provider}</span>
            </button>
          ))}
        </div>
      </article>
      <div className="grid gap-4 md:grid-cols-2">
        {(providerCatalog?.plugs || []).map((def) => {
          const saved = savedFor(def.methodName);
          const key = `${channel?.id}:${def.methodName}`;
          return (
            <article key={def.identifier} className={adminCardClass}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className='text-sm font-black text-foreground'>{def.titleAr}</h3>
                  <p className='mt-1 text-xs leading-relaxed text-muted-foreground'>{def.descriptionAr}</p>
                </div>
                {saved ? (
                  <label className='flex items-center gap-2 text-[11px] font-bold text-muted-foreground'>
                    تفعيل
                    <input
                      type="checkbox"
                      className="size-4 accent-admin-accent-hover"
                      checked={saved.activated}
                      disabled={busyKey === `t-${def.methodName}`}
                      onChange={(e) => void toggle(def, e.target.checked)}
                    />
                  </label>
                ) : null}
              </div>
              {def.fields.map((field) => (
                <div key={field.name} className="mt-3">
                  <label className={adminLabelClass}>{field.descriptionAr}</label>
                  {field.type === "richtext" ? (
                    <textarea
                      className={`${adminInputClass} min-h-24 resize-y`}
                      placeholder={field.placeholder}
                      value={drafts[key]?.[field.name] ?? fieldValue(saved, field.name)}
                      onChange={(e) =>
                        setDrafts((prev) => ({
                          ...prev,
                          [key]: { ...(prev[key] || {}), [field.name]: e.target.value },
                        }))
                      }
                    />
                  ) : (
                    <input
                      className={adminInputClass}
                      inputMode="numeric"
                      placeholder={field.placeholder}
                      value={drafts[key]?.[field.name] ?? fieldValue(saved, field.name)}
                      onChange={(e) =>
                        setDrafts((prev) => ({
                          ...prev,
                          [key]: { ...(prev[key] || {}), [field.name]: e.target.value },
                        }))
                      }
                    />
                  )}
                </div>
              ))}
              <button
                type="button"
                className={`${adminPrimaryBtnClass} mt-3 min-h-11 px-4 text-xs`}
                disabled={busyKey === def.methodName}
                onClick={() => void saveDef(def)}
              >
                {busyKey === def.methodName ? <Loader2 className="size-3.5 animate-spin" /> : <Plus className="size-3.5" />}
                {saved ? "حفظ القاعدة" : "تفعيل القاعدة"}
              </button>
            </article>
          );
        })}
        {formError ? <p className="text-xs text-rose-600 md:col-span-2">{formError}</p> : null}
      </div>
    </div>
  );
}

function RssPanel({
  channels,
  feeds,
  onChange,
}: {
  channels: PublishChannel[];
  feeds: PublishRssFeed[];
  onChange: (rows: PublishRssFeed[]) => void;
}) {
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [content, setContent] = useState("");
  const [onSlot, setOnSlot] = useState(true);
  const [syncLast, setSyncLast] = useState(true);
  const [addPicture, setAddPicture] = useState(false);
  const [generateContent, setGenerateContent] = useState(true);
  const [active, setActive] = useState(true);
  const [channelIds, setChannelIds] = useState<string[]>([]);
  const [lastUrl, setLastUrl] = useState("");
  const [busy, setBusy] = useState(false);
  const [previewing, setPreviewing] = useState(false);
  const [formError, setFormError] = useState("");
  const [deletingId, setDeletingId] = useState("");

  const save = async () => {
    if (!title.trim() || !url.trim()) {
      setFormError("العنوان ورابط التغذية مطلوبان.");
      return;
    }
    setBusy(true);
    setFormError("");
    const result = await savePublishRssFeed({
      title: title.trim(),
      url: url.trim(),
      content,
      onSlot,
      syncLast,
      addPicture,
      generateContent,
      active,
      lastUrl: syncLast ? "" : lastUrl,
      integrations: channelIds.map((id) => ({ id })),
    });
    setBusy(false);
    if (!result.ok || !result.data) {
      setFormError(result.error || "تعذّر حفظ التغذية.");
      return;
    }
    onChange([result.data, ...feeds.filter((row) => row.id !== result.data?.id)]);
    setTitle("");
    setUrl("");
    setContent("");
    setLastUrl("");
    setChannelIds([]);
  };

  const preview = async () => {
    if (!url.trim()) {
      setFormError("أدخل رابط التغذية أولاً.");
      return;
    }
    setPreviewing(true);
    setFormError("");
    const result = await previewPublishRss(url.trim());
    setPreviewing(false);
    if (!result.ok || !result.data?.success) {
      setFormError(result.data?.error || result.error || "تعذّر قراءة التغذية.");
      return;
    }
    if (result.data.url) setLastUrl(result.data.url);
  };

  const remove = async (id: string) => {
    if (!window.confirm("حذف هذه التغذية؟")) return;
    setDeletingId(id);
    const result = await deletePublishRssFeed(id);
    setDeletingId("");
    if (result.ok) onChange(feeds.filter((row) => row.id !== id));
  };

  const toggle = async (feed: PublishRssFeed, nextActive: boolean) => {
    const result = await savePublishRssFeed({ id: feed.id, active: nextActive });
    if (result.data) {
      onChange(feeds.map((row) => (row.id === result.data?.id ? result.data : row)));
    }
  };

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
      <article className={adminCardClass}>
        <h2 className='text-sm font-black text-foreground'>تغذية RSS</h2>
        <p className='mt-1 text-xs text-muted-foreground'>
          يفحص العامل التغذيات النشطة مرة كل ساعة، وينشئ منشورات `autopost` في الطابور عند ظهور عنصر جديد.
        </p>
        <label className={`${adminLabelClass} mt-4`}>العنوان</label>
        <input className={adminInputClass} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="مدونة لوناليزا" />
        <label className={`${adminLabelClass} mt-3`}>رابط التغذية</label>
        <input className={adminInputClass} dir="ltr" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://example.com/rss.xml" />
        <div className="mt-2 flex flex-wrap gap-2">
          <button type="button" className={`${adminGhostBtnClass} min-h-10 px-3 text-xs`} disabled={previewing} onClick={() => void preview()}>
            {previewing ? <Loader2 className="size-3.5 animate-spin" /> : null}
            اختبار التغذية
          </button>
          {lastUrl ? <span className='self-center text-[11px] text-muted-foreground'>آخر عنصر: {lastUrl}</span> : null}
        </div>
        <label className={`${adminLabelClass} mt-3`}>نص بديل إن لم يُولَّد المحتوى</label>
        <textarea className={`${adminInputClass} min-h-20 resize-y`} value={content} onChange={(e) => setContent(e.target.value)} />
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          <ToggleRow label="نشر في أقرب فترة زمنية" checked={onSlot} onChange={setOnSlot} />
          <ToggleRow label="مزامنة آخر عنصر (لا تعِد النشر)" checked={syncLast} onChange={setSyncLast} />
          <ToggleRow label="إرفاق صورة من التغذية" checked={addPicture} onChange={setAddPicture} />
          <ToggleRow label="إعادة صياغة بالذكاء الاصطناعي" checked={generateContent} onChange={setGenerateContent} />
          <ToggleRow label="نشط" checked={active} onChange={setActive} />
        </div>
        <p className={`${adminLabelClass} mt-4`}>القنوات (فارغ = الكل)</p>
        {channels.length === 0 ? (
          <p className='rounded-xl border border-dashed border-border px-3 py-4 text-xs text-muted-foreground'>
            لا قنوات محفوظة بعد. يمكن حفظ التغذية الآن وربط القنوات لاحقاً.
          </p>
        ) : (
          <div className="max-h-40 space-y-1.5 overflow-y-auto">
            {channels.map((channel) => {
              const checked = channelIds.includes(channel.id);
              return (
                <label key={channel.id} className="flex items-center gap-2 rounded-xl px-2 py-1.5 text-xs">
                  <input
                    type="checkbox"
                    className="size-4 accent-admin-accent-hover"
                    checked={checked}
                    onChange={() =>
                      setChannelIds((prev) => (checked ? prev.filter((id) => id !== channel.id) : [...prev, channel.id]))
                    }
                  />
                  {channel.name || PROVIDER_LABEL_AR[channel.provider] || channel.provider}
                </label>
              );
            })}
          </div>
        )}
        <button type="button" className={`${adminPrimaryBtnClass} mt-4 min-h-11 px-4 text-xs`} disabled={busy} onClick={() => void save()}>
          {busy ? <Loader2 className="size-3.5 animate-spin" /> : <Plus className="size-3.5" />}
          حفظ التغذية
        </button>
        {formError ? <p className="mt-2 text-xs text-rose-600">{formError}</p> : null}
      </article>
      <article className={adminCardClass}>
        <h2 className='text-sm font-black text-foreground'>المصادر المحفوظة</h2>
        {feeds.length === 0 ? (
          <p className='mt-3 rounded-xl border border-dashed border-border px-3 py-6 text-xs text-muted-foreground'>
            لا تغذيات محفوظة. أضف مصدراً في النموذج المقابل — العامل لن ينشر شيئاً قبل ذلك.
          </p>
        ) : (
          <ul className="mt-3 space-y-2">
            {feeds.map((feed) => (
              <li key={feed.id} className='rounded-xl border border-border px-3 py-2.5 text-xs'>
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className='font-bold text-foreground'>{feed.title}</p>
                    <p className='mt-1 truncate text-muted-foreground' dir="ltr">
                      {feed.url}
                    </p>
                    <p className="mt-1 text-[11px] text-muted-foreground">
                      {feed.active ? "نشط" : "متوقف"} · {feed.onSlot ? "أقرب فترة" : "فوري"} · آخر عنصر: {feed.lastUrl || "—"}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <label className='flex items-center gap-1 text-[10px] font-bold text-muted-foreground'>
                      <input
                        type="checkbox"
                        className="size-4 accent-admin-accent-hover"
                        checked={feed.active}
                        onChange={(e) => void toggle(feed, e.target.checked)}
                      />
                    </label>
                    <button
                      type="button"
                      className='admin-tap rounded-lg p-1.5 text-muted-foreground hover:bg-rose-50 hover:text-rose-600'
                      disabled={deletingId === feed.id}
                      onClick={() => void remove(feed.id)}
                      aria-label="حذف التغذية"
                    >
                      {deletingId === feed.id ? <Loader2 className="size-3.5 animate-spin" /> : <Trash2 className="size-3.5" />}
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </article>
    </div>
  );
}

function WebhooksPanel({
  channels,
  webhooks,
  onChange,
}: {
  channels: PublishChannel[];
  webhooks: PublishWebhook[];
  onChange: (rows: PublishWebhook[]) => void;
}) {
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const [channelIds, setChannelIds] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [formError, setFormError] = useState("");
  const [deletingId, setDeletingId] = useState("");

  const save = async () => {
    if (!name.trim() || !url.trim()) {
      setFormError("الاسم والرابط مطلوبان.");
      return;
    }
    setBusy(true);
    setFormError("");
    const result = await savePublishWebhook({
      name: name.trim(),
      url: url.trim(),
      channelIds,
    });
    setBusy(false);
    if (!result.ok || !result.data) {
      setFormError(result.error || "تعذّر حفظ الويب هوك. استخدم HTTPS عاماً.");
      return;
    }
    onChange([result.data, ...webhooks.filter((row) => row.id !== result.data?.id)]);
    setName("");
    setUrl("");
    setChannelIds([]);
  };

  const remove = async (id: string) => {
    if (!window.confirm("حذف هذا الويب هوك؟")) return;
    setDeletingId(id);
    const result = await deletePublishWebhook(id);
    setDeletingId("");
    if (result.ok) onChange(webhooks.filter((row) => row.id !== id));
  };

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <article className={adminCardClass}>
        <h2 className='text-sm font-black text-foreground'>Webhooks</h2>
        <p className='mt-1 text-xs leading-relaxed text-muted-foreground'>
          يُرسل POST JSON إلى الرابط بعد أن يصبح المنشور `published` أو `error`. لا تُعرض أسرار القنوات.
        </p>
        <label className={`${adminLabelClass} mt-4`}>الاسم</label>
        <input className={adminInputClass} value={name} onChange={(e) => setName(e.target.value)} placeholder="تنبيه لوناليزا" />
        <label className={`${adminLabelClass} mt-3`}>الرابط (HTTPS)</label>
        <input className={adminInputClass} dir="ltr" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://example.com/hooks/publish" />
        <p className={`${adminLabelClass} mt-4`}>القنوات (فارغ = الكل)</p>
        {channels.length === 0 ? (
          <p className='rounded-xl border border-dashed border-border px-3 py-4 text-xs text-muted-foreground'>
            لا قنوات بعد — الويب هوك سيُطلق لكل المنشورات.
          </p>
        ) : (
          <div className="max-h-40 space-y-1.5 overflow-y-auto">
            {channels.map((channel) => {
              const checked = channelIds.includes(channel.id);
              return (
                <label key={channel.id} className="flex items-center gap-2 rounded-xl px-2 py-1.5 text-xs">
                  <input
                    type="checkbox"
                    className="size-4 accent-admin-accent-hover"
                    checked={checked}
                    onChange={() =>
                      setChannelIds((prev) => (checked ? prev.filter((id) => id !== channel.id) : [...prev, channel.id]))
                    }
                  />
                  {channel.name || PROVIDER_LABEL_AR[channel.provider] || channel.provider}
                </label>
              );
            })}
          </div>
        )}
        <button type="button" className={`${adminPrimaryBtnClass} mt-4 min-h-11 px-4 text-xs`} disabled={busy} onClick={() => void save()}>
          {busy ? <Loader2 className="size-3.5 animate-spin" /> : <Plus className="size-3.5" />}
          حفظ الويب هوك
        </button>
        {formError ? <p className="mt-2 text-xs text-rose-600">{formError}</p> : null}
      </article>
      <article className={adminCardClass}>
        <h2 className='text-sm font-black text-foreground'>المسجّلة</h2>
        {webhooks.length === 0 ? (
          <p className='mt-3 rounded-xl border border-dashed border-border px-3 py-6 text-xs text-muted-foreground'>
            لا Webhooks محفوظة. لن يُرسل المحرك أي طلب خارجي حتى تضيف رابطاً عاماً.
          </p>
        ) : (
          <ul className="mt-3 space-y-2">
            {webhooks.map((hook) => (
              <li key={hook.id} className='rounded-xl border border-border px-3 py-2.5 text-xs'>
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className='font-bold text-foreground'>{hook.name}</p>
                    <p className='mt-1 truncate text-muted-foreground' dir="ltr">
                      {hook.url}
                    </p>
                    <p className="mt-1 text-[11px] text-muted-foreground">
                      {hook.channelIds.length ? `${hook.channelIds.length} قنوات` : "كل القنوات"}
                    </p>
                  </div>
                  <button
                    type="button"
                    className='admin-tap rounded-lg p-1.5 text-muted-foreground hover:bg-rose-50 hover:text-rose-600'
                    disabled={deletingId === hook.id}
                    onClick={() => void remove(hook.id)}
                    aria-label="حذف الويب هوك"
                  >
                    {deletingId === hook.id ? <Loader2 className="size-3.5 animate-spin" /> : <Trash2 className="size-3.5" />}
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </article>
    </div>
  );
}

function ToggleRow({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <label className='flex cursor-pointer items-center justify-between gap-3 rounded-2xl border border-border bg-admin-bg-subtle px-3 py-2.5'>
      <span className='text-xs font-bold text-foreground'>{label}</span>
      <input
        type="checkbox"
        className="size-4 accent-admin-accent-hover"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
    </label>
  );
}
