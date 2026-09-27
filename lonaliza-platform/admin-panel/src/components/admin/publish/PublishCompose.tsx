"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { AlertCircle, CheckCircle2, ChevronDown, ImagePlus, Loader2, Plus, Send, Share2, Sparkles, Trash2, Video } from "lucide-react";
import { adminCardClass, adminInputClass, adminLabelClass, adminPrimaryBtnClass } from "@/components/admin/ui/admin-ui-classes";
import { cn } from "@/lib/utils";
import {
  createPublishPost,
  fetchPublishChannels,
  fetchPublishMedia,
  generatePublishImage,
  generatePublishVideo,
  requestPublishApproval,
} from "./api";
import { ChannelSettingsFields } from "./ChannelSettingsFields";
import { FALLBACK_CHANNEL_OPTIONS, PROVIDER_LABEL_AR } from "./constants";
import { PublishShell } from "./PublishShell";
import { ruleFor, validateCaption, validateMedia } from "./provider-rules";
import {
  emptyChannelSettings,
  type ChannelComposeSettings,
  type ComposeIntent,
  type PublishChannel,
  type PublishMediaItem,
  type ThreadPart,
} from "./types";

function toDatetimeLocal(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function newGroupId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return `grp_${Date.now().toString(36)}`;
}

function settingsPayload(row: ChannelComposeSettings, extra: Record<string, unknown>): Record<string, unknown> {
  return {
    ...extra,
    firstComment: row.firstComment,
    commentDelaySec: row.commentDelaySec,
    content_posting_method: row.content_posting_method,
    privacy_level: row.privacy_level,
    post_type: row.post_type,
    is_trial_reel: row.is_trial_reel,
    graduation_strategy: row.graduation_strategy,
    type: row.ytPrivacy,
    selfDeclaredMadeForKids: row.selfDeclaredMadeForKids,
    topicType: row.topicType,
    callToActionType: row.callToActionType,
    callToActionUrl: row.callToActionUrl,
    eventTitle: row.eventTitle,
    board: row.board,
    link: row.pinLink,
    post_as_images_carousel: row.post_as_images_carousel,
    carousel_name: row.carousel_name,
  };
}

export function PublishCompose() {
  const [channels, setChannels] = useState<PublishChannel[]>([]);
  const [channelsMissing, setChannelsMissing] = useState(false);
  const [mediaLibrary, setMediaLibrary] = useState<PublishMediaItem[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [caption, setCaption] = useState("");
  const [title, setTitle] = useState("");
  const [mediaText, setMediaText] = useState("");
  const [scheduledAt, setScheduledAt] = useState(() => toDatetimeLocal(new Date(Date.now() + 60 * 60 * 1000)));
  const [intent, setIntent] = useState<ComposeIntent>("draft");
  const [requestApproval, setRequestApproval] = useState(true);
  const [intervalInDays, setIntervalInDays] = useState(0);
  const [threadParts, setThreadParts] = useState<ThreadPart[]>([]);
  const [channelSettings, setChannelSettings] = useState<Record<string, ChannelComposeSettings>>({});
  const [openChannel, setOpenChannel] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiBusy, setAiBusy] = useState<"image" | "video" | "">("");

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const [ch, media] = await Promise.all([fetchPublishChannels(), fetchPublishMedia()]);
      if (cancelled) return;
      setChannelsMissing(ch.missing);
      setChannels(ch.data ?? []);
      setMediaLibrary(media.data ?? []);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const options = channels.length > 0 ? channels : FALLBACK_CHANNEL_OPTIONS;
  const usingFallback = channels.length === 0;
  const selectedRows = useMemo(() => options.filter((row) => selected.includes(row.id)), [options, selected]);
  const mediaUrls = mediaText
    .split(/[\n,]+/)
    .map((row) => row.trim())
    .filter(Boolean);

  const toggleChannel = (id: string) => {
    setSelected((prev) => (prev.includes(id) ? prev.filter((row) => row !== id) : [...prev, id]));
    setChannelSettings((prev) => (prev[id] ? prev : { ...prev, [id]: emptyChannelSettings() }));
  };

  const validationIssues = useMemo(() => {
    const issues: string[] = [];
    for (const channel of selectedRows) {
      const settings = channelSettings[channel.id] ?? emptyChannelSettings();
      const text = settings.overrideEnabled ? settings.overrideContent : caption;
      const cap = validateCaption(channel.provider, text);
      if (cap) issues.push(cap);
      const media = validateMedia(channel.provider, mediaUrls);
      if (media) issues.push(`${channel.name}: ${media}`);
      if (channel.provider === "pinterest" && !settings.board.trim()) {
        issues.push("بنترست يتطلب معرّف لوحة.");
      }
      if (channel.provider === "gmb" && settings.topicType === "EVENT" && !settings.eventTitle.trim()) {
        issues.push("فعالية جوجل للأعمال تحتاج عنواناً.");
      }
    }
    return issues;
  }, [caption, channelSettings, mediaUrls, selectedRows]);

  const submit = async () => {
    setBusy(true);
    setMsg("");
    setErr("");
    try {
      if (!caption.trim() && selectedRows.every((row) => !(channelSettings[row.id]?.overrideContent || "").trim())) {
        setErr("اكتب نص المنشور أولاً.");
        return;
      }
      if (selected.length === 0) {
        setErr("اختر قناة واحدة على الأقل.");
        return;
      }
      if (validationIssues.length) {
        setErr(validationIssues[0]);
        return;
      }
      const publishDate = new Date(scheduledAt);
      const iso = Number.isNaN(publishDate.getTime()) ? new Date().toISOString() : publishDate.toISOString();
      const state = intent === "draft" ? "draft" : "queue";
      const group = newGroupId();
      const createdIds: string[] = [];
      let missing = false;
      let lastError = "";

      for (const channel of selectedRows) {
        const row = channelSettings[channel.id] ?? emptyChannelSettings();
        const rule = ruleFor(channel.provider);
        const content = (row.overrideEnabled ? row.overrideContent : caption).trim();
        const platformSettings = settingsPayload(row, {
          intent,
          mediaUrls,
          approved: false,
          perChannel: { [channel.id]: { ...row } },
        });
        const main = await createPublishPost({
          channelId: channel.id,
          content,
          title: (channel.provider === "youtube" ? row.ytTitle : channel.provider === "pinterest" ? row.pinTitle : title).trim() || undefined,
          publishDate: iso,
          state,
          approved: false,
          creationMethod: "web",
          delay: 0,
          group,
          intervalInDays: intervalInDays > 0 ? intervalInDays : undefined,
          mediaUrls,
          settings: platformSettings,
        });
        if (main.missing) {
          missing = true;
          lastError = main.error || lastError;
          break;
        }
        if (!main.ok || !main.data) {
          lastError = main.error || lastError;
          continue;
        }
        createdIds.push(main.data.id);

        if (rule.allowsThreadParts) {
          for (const part of threadParts.filter((item) => item.content.trim())) {
            const child = await createPublishPost({
              channelId: channel.id,
              content: part.content.trim(),
              publishDate: iso,
              state,
              approved: false,
              creationMethod: "web",
              delay: Math.max(0, part.delaySec),
              group,
              parentPostId: main.data.id,
              intervalInDays: intervalInDays > 0 ? intervalInDays : undefined,
              mediaUrls: [],
              settings: { ...platformSettings, firstComment: "", mediaUrls: [] },
            });
            if (child.ok && child.data) createdIds.push(child.data.id);
          }
        }

        if (rule.allowsFirstComment && row.firstComment.trim() && row.commentDelaySec > 0) {
          /* delay is stored on settings; adapters honor firstComment after the main post */
        }
      }

      if (missing) {
        setErr("واجهة إنشاء المنشور غير متاحة بعد. الملحن جاهز ولن يُرسل للشبكة دون اعتماد.");
        return;
      }
      if (createdIds.length === 0) {
        setErr(lastError || "تعذّر حفظ المنشور.");
        return;
      }

      if (requestApproval) {
        const notify = await requestPublishApproval({
          postIds: createdIds,
          summary: `${caption.slice(0, 200)}\nالقنوات: ${selectedRows.map((row) => row.name).join("، ")}`,
        });
        if (!notify.ok) {
          setMsg(
            `حُفظت ${createdIds.length} منشوراً في الطابور/المسودة. تعذّر إشعار تيليجرام: ${notify.error || "غير مهيأ"}`
          );
        } else {
          setMsg(`حُفظت ${createdIds.length} منشوراً وأُرسل طلب اعتماد إلى تيليجرام الإداري.`);
        }
      } else {
        setMsg(
          intent === "now"
            ? `أُدخل ${createdIds.length} منشوراً في مسار الاعتماد. لن يُنشر على الشبكة قبل الموافقة الصريحة.`
            : intent === "queue"
              ? `أُضيف ${createdIds.length} منشوراً إلى الطابور المجدول.`
              : `حُفظت ${createdIds.length} مسودة في محرك النشر.`
        );
      }
    } catch {
      setErr("تعذّر حفظ المنشور.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <PublishShell
      title="ملحن المنشورات"
      description="نص عام أو تجاوز لكل قناة، خيوط بتأخير، وإعدادات المنصة. خيار «الآن» يبقى في الطابور ما لم يُعتمد."
      actions={
        <Link href="/admin/social-accounts" className='admin-tap inline-flex items-center gap-2 rounded-xl border border-border bg-admin-bg-subtle px-4 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground'>
          <Share2 className="size-4" />
          إدارة الربط
        </Link>
      }
    >
      <div className="grid gap-5 xl:grid-cols-12">
        <section className={cn(adminCardClass, "xl:col-span-7")}>
          <label className={adminLabelClass}>عنوان اختياري</label>
          <input className={adminInputClass} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="عنوان يوتيوب أو بنترست…" />

          <label className={`${adminLabelClass} mt-4`}>النص العام</label>
          <textarea
            className={`${adminInputClass} min-h-44 resize-y`}
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="اكتب العرض السياحي، الوجهة، أو دعوة الحجز…"
          />
          <p className="mt-1.5 text-[11px] text-muted-foreground">
            {caption.length} حرفاً
            {selectedRows.length
              ? ` · أدنى حد للقنوات: ${Math.min(...selectedRows.map((row) => ruleFor(row.provider).maxLength))}`
              : ""}
          </p>

          <label className={`${adminLabelClass} mt-4`}>وسائط (روابط، سطراً لكل ملف)</label>
          <textarea
            className={`${adminInputClass} min-h-20 resize-y`}
            dir="ltr"
            value={mediaText}
            onChange={(e) => setMediaText(e.target.value)}
            placeholder="https://…"
          />
          {mediaLibrary.length > 0 ? (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {mediaLibrary.slice(0, 8).map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className='rounded-lg border border-border px-2 py-1 text-[11px] text-muted-foreground hover:border-admin-accent/40'
                  onClick={() => {
                    if (!item.url) return;
                    setMediaText((prev) => (prev.trim() ? `${prev.trim()}\n${item.url}` : item.url || ""));
                  }}
                >
                  {item.name}
                </button>
              ))}
            </div>
          ) : null}

          <div className='mt-4 rounded-2xl border border-border bg-admin-bg-subtle p-3'>
            <p className={adminLabelClass}>توليد وسائط بالذكاء الاصطناعي</p>
            <textarea
              className={`${adminInputClass} mt-2 min-h-16 resize-y`}
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              placeholder="وصف الصورة أو الفيديو — يُستخدم النص العام إن تُرك فارغاً"
            />
            <div className="mt-2 flex flex-wrap gap-2">
              <button
                type="button"
                className='inline-flex items-center gap-1.5 rounded-xl border border-border bg-card px-3 py-2 text-[11px] font-bold text-foreground disabled:opacity-50'
                disabled={Boolean(aiBusy)}
                onClick={async () => {
                  const prompt = aiPrompt.trim() || caption.trim();
                  if (!prompt) {
                    setErr("اكتب وصفاً أو النص العام قبل توليد صورة.");
                    return;
                  }
                  setAiBusy("image");
                  setErr("");
                  const result = await generatePublishImage({ prompt, aspectRatio: "4:5" });
                  setAiBusy("");
                  if (!result.ok || !result.data?.url) {
                    setErr(result.error || "تعذّر توليد الصورة.");
                    return;
                  }
                  setMediaText((prev) => (prev.trim() ? `${prev.trim()}\n${result.data?.url}` : result.data?.url || ""));
                  setMsg("وُلدت صورة وأُضيفت إلى قائمة الوسائط.");
                }}
              >
                {aiBusy === "image" ? <Loader2 className="size-3.5 animate-spin" /> : <ImagePlus className="size-3.5" />}
                توليد صورة
              </button>
              <button
                type="button"
                className='inline-flex items-center gap-1.5 rounded-xl border border-border bg-card px-3 py-2 text-[11px] font-bold text-foreground disabled:opacity-50'
                disabled={Boolean(aiBusy)}
                onClick={async () => {
                  const prompt = aiPrompt.trim() || caption.trim();
                  if (!prompt) {
                    setErr("اكتب وصفاً أو النص العام قبل توليد فيديو.");
                    return;
                  }
                  setAiBusy("video");
                  setErr("");
                  const result = await generatePublishVideo({ prompt, identifier: "studio-generate", output: "vertical" });
                  setAiBusy("");
                  if (!result.ok || !result.data?.url) {
                    setErr(result.error || "تعذّر توليد الفيديو.");
                    return;
                  }
                  setMediaText((prev) => (prev.trim() ? `${prev.trim()}\n${result.data?.url}` : result.data?.url || ""));
                  setMsg("وُلد فيديو وأُضيف إلى قائمة الوسائط.");
                }}
              >
                {aiBusy === "video" ? <Loader2 className="size-3.5 animate-spin" /> : <Video className="size-3.5" />}
                توليد فيديو
              </button>
              <span className="inline-flex items-center gap-1 text-[10px] text-muted-foreground">
                <Sparkles className="size-3" />
                لا يُنشر للشبكة — يُحفظ في المكتبة فقط
              </span>
            </div>
          </div>

          <div className="mt-4">
            <div className="mb-2 flex items-center justify-between">
              <p className={adminLabelClass}>أجزاء الخيط (بتأخير)</p>
              <button
                type="button"
                className="inline-flex items-center gap-1 text-[11px] font-bold text-primary"
                onClick={() => setThreadParts((prev) => [...prev, { content: "", delaySec: 60 }])}
              >
                <Plus className="size-3.5" />
                جزء
              </button>
            </div>
            <p className='mb-2 text-[11px] text-muted-foreground'>
              يُتجاهل على يوتيوب وتيك توك وبنترست. يُستخدم على إكس وثريدز والقنوات التي تسمح بالخيوط.
            </p>
            {threadParts.map((part, index) => (
              <div key={index} className='mb-2 rounded-xl border border-border p-3'>
                <textarea
                  className={`${adminInputClass} min-h-16 resize-y`}
                  value={part.content}
                  onChange={(e) =>
                    setThreadParts((prev) => prev.map((row, i) => (i === index ? { ...row, content: e.target.value } : row)))
                  }
                  placeholder={`الجزء ${index + 2}`}
                />
                <div className="mt-2 flex items-center gap-2">
                  <input
                    type="number"
                    min={0}
                    className={`${adminInputClass} max-w-32`}
                    value={part.delaySec}
                    onChange={(e) =>
                      setThreadParts((prev) =>
                        prev.map((row, i) => (i === index ? { ...row, delaySec: Number(e.target.value) || 0 } : row))
                      )
                    }
                  />
                  <span className='text-[11px] text-muted-foreground'>ثانية تأخير</span>
                  <button type="button" className="ms-auto text-rose-600" onClick={() => setThreadParts((prev) => prev.filter((_, i) => i !== index))}>
                    <Trash2 className="size-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <label className={`${adminLabelClass} mt-4`}>موعد الجدولة</label>
          <input type="datetime-local" dir="ltr" className={adminInputClass} value={scheduledAt} onChange={(e) => setScheduledAt(e.target.value)} />

          <div className="mt-4">
            <label className={adminLabelClass}>تكرار كل (أيام) — intervalInDays</label>
            <input
              type="number"
              min={0}
              className={adminInputClass}
              value={intervalInDays}
              onChange={(e) => setIntervalInDays(Number(e.target.value) || 0)}
            />
            <p className='mt-1 text-[11px] text-muted-foreground'>0 = مرة واحدة. القيمة تُحفظ مع المنشور لإعادة الجدولة.</p>
          </div>

          <div className="mt-5">
            <p className={adminLabelClass}>مسار الحفظ</p>
            <div className="grid gap-2 sm:grid-cols-3">
              {(
                [
                  { id: "draft", label: "مسودة", hint: "يُحفظ دون إرسال" },
                  { id: "queue", label: "طابور مجدول", hint: "يُنشر في الموعد بعد الاعتماد" },
                  { id: "now", label: "الآن عبر الاعتماد", hint: "يبقى طابوراً ما لم يُعتمد" },
                ] as const
              ).map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setIntent(item.id)}
                  className={cn(
                    "rounded-2xl border px-3 py-3 text-right transition-colors",
                    intent === item.id
                      ? 'border-admin-accent/50 bg-primary-soft'
                      : 'border-border bg-admin-bg-subtle hover:border-admin-accent/30'
                  )}
                >
                  <span className='block text-sm font-bold text-foreground'>{item.label}</span>
                  <span className='mt-0.5 block text-[11px] text-muted-foreground'>{item.hint}</span>
                </button>
              ))}
            </div>
          </div>

          {intent === "now" ? (
            <div className='mt-4 rounded-2xl border border-border bg-amber-50 px-4 py-3 text-xs leading-relaxed text-admin-btn-secondary-border dark:border-border dark:bg-[var(--admin-btn-secondary-border)]/30 dark:text-muted-foreground'>
              خيار «الآن» يضع المنشور في الطابور بـ approved=false. لن يُستدعَى مزود اجتماعي قبل الموافقة الصريحة.
            </div>
          ) : null}

          <label className='mt-4 flex items-center gap-2 text-sm text-foreground'>
            <input
              type="checkbox"
              className="size-4 accent-admin-accent-hover"
              checked={requestApproval}
              onChange={(e) => setRequestApproval(e.target.checked)}
            />
            إرسال طلب اعتماد إلى تيليجرام الإداري (بدون إنشاء بطاقة أتمتة الاستوديو)
          </label>

          {validationIssues.length ? (
            <ul className="mt-3 space-y-1 text-xs text-rose-700 dark:text-rose-300">
              {validationIssues.map((issue) => (
                <li key={issue}>{issue}</li>
              ))}
            </ul>
          ) : null}

          <button type="button" className={`${adminPrimaryBtnClass} mt-5`} disabled={busy} onClick={() => void submit()}>
            {busy ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
            {intent === "draft" ? "حفظ المسودة" : intent === "queue" ? "إضافة للطابور" : "إرسال للاعتماد"}
          </button>

          {msg ? (
            <p className='mt-3 flex items-center gap-2 text-sm text-admin-btn-primary-hover dark:text-muted-foreground'>
              <CheckCircle2 className="size-4" />
              {msg}
            </p>
          ) : null}
          {err ? (
            <p className="mt-3 flex items-center gap-2 text-sm text-rose-700 dark:text-rose-300">
              <AlertCircle className="size-4" />
              {err}
            </p>
          ) : null}
        </section>

        <section className={cn(adminCardClass, "xl:col-span-5")}>
          <div className="mb-3 flex items-center justify-between gap-2">
            <h2 className='text-sm font-black text-foreground'>القنوات</h2>
            <Link href="/admin/social-accounts" className="text-[11px] font-bold text-primary hover:underline">
              ربط حساب
            </Link>
          </div>
          {usingFallback ? (
            <p className='mb-3 text-[11px] leading-relaxed text-muted-foreground'>
              {channelsMissing
                ? "قائمة القنوات من المحرك غير متاحة بعد. تظهر المنصات الخمس المعروفة في لوناليزا للاختيار فقط — وليست حسابات متصلة."
                : "لا قنوات محفوظة في المحرك. اربط الحسابات من صفحة التواصل، أو اختر المنصات المعروفة أدناه."}
            </p>
          ) : null}

          <div className="space-y-2">
            {options.map((channel) => {
              const checked = selected.includes(channel.id);
              const rule = ruleFor(channel.provider);
              return (
                <label
                  key={channel.id}
                  className={cn(
                    "flex cursor-pointer items-center justify-between gap-3 rounded-2xl border px-3 py-2.5",
                    checked ? 'border-admin-accent/40 bg-primary-soft' : 'border-border bg-admin-bg-subtle',
                    channel.disabled && "opacity-50"
                  )}
                >
                  <span className='text-sm font-bold text-foreground'>
                    {channel.name || PROVIDER_LABEL_AR[channel.provider] || channel.provider}
                    <span className="ms-2 text-[10px] font-semibold text-muted-foreground">{rule.maxLength} حرف</span>
                    {channel.refreshNeeded ? (
                      <span className="ms-2 text-[10px] font-semibold text-admin-btn-secondary-hover">يحتاج إعادة ربط</span>
                    ) : null}
                  </span>
                  <input
                    type="checkbox"
                    className="size-4 accent-admin-accent-hover"
                    checked={checked}
                    disabled={channel.disabled}
                    onChange={() => toggleChannel(channel.id)}
                  />
                </label>
              );
            })}
          </div>

          <h3 className='mt-6 text-sm font-black text-foreground'>إعدادات لكل قناة</h3>
          <p className='mb-2 text-[11px] text-muted-foreground'>تجاوز النص، خيوط/تعليقات، وإعدادات المنصة (تيك توك، إنستغرام، يوتيوب، جوجل، بنترست، لينكدإن).</p>
          {selectedRows.length === 0 ? (
            <p className='rounded-xl border border-dashed border-border px-3 py-4 text-xs text-muted-foreground'>
              اختر قنوات لإظهار إعداداتها.
            </p>
          ) : (
            <div className="space-y-2">
              {selectedRows.map((channel) => {
                const open = openChannel === channel.id;
                const settings = channelSettings[channel.id] ?? emptyChannelSettings();
                return (
                  <div key={channel.id} className='rounded-2xl border border-border'>
                    <button
                      type="button"
                      className='flex w-full items-center justify-between px-3 py-2.5 text-sm font-bold text-foreground'
                      onClick={() => setOpenChannel(open ? "" : channel.id)}
                    >
                      <span>{channel.name || PROVIDER_LABEL_AR[channel.provider]}</span>
                      <ChevronDown className={cn("size-4 transition-transform", open && "rotate-180")} />
                    </button>
                    {open ? (
                      <div className='border-t border-border px-3 py-3'>
                        <ChannelSettingsFields
                          provider={channel.provider}
                          settings={settings}
                          globalCaption={caption}
                          onChange={(next) => setChannelSettings((prev) => ({ ...prev, [channel.id]: next }))}
                        />
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </PublishShell>
  );
}
