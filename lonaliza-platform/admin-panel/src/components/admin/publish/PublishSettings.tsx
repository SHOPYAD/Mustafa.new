"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, Copy, KeyRound, Layers, Loader2, PenLine, Plus, Trash2 } from "lucide-react";
import {
  adminCardClass,
  adminGhostBtnClass,
  adminInputClass,
  adminLabelClass,
  adminPrimaryBtnClass,
} from "@/components/admin/ui/admin-ui-classes";
import { cn } from "@/lib/utils";
import {
  createPublishSet,
  createPublishSignature,
  deletePublishSet,
  deletePublishSignature,
  fetchPublishChannels,
  fetchPublishSettings,
  generatePublishApiKey,
} from "./api";
import { PROVIDER_LABEL_AR } from "./constants";
import { PublishShell } from "./PublishShell";
import type { PublishChannel, PublishSet, PublishSignature } from "./types";

export function PublishSettings() {
  const [signatures, setSignatures] = useState<PublishSignature[]>([]);
  const [sets, setSets] = useState<PublishSet[]>([]);
  const [channels, setChannels] = useState<PublishChannel[]>([]);
  const [channelsMissing, setChannelsMissing] = useState(false);
  const [apiKeyMasked, setApiKeyMasked] = useState("");
  const [hasApiKey, setHasApiKey] = useState(false);
  const [revealedKey, setRevealedKey] = useState("");
  const [copied, setCopied] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [loading, setLoading] = useState(true);
  const [missing, setMissing] = useState(false);
  const [error, setError] = useState("");

  const [sigContent, setSigContent] = useState("");
  const [sigAutoAdd, setSigAutoAdd] = useState(false);
  const [sigBusy, setSigBusy] = useState(false);
  const [sigError, setSigError] = useState("");
  const [deletingSigId, setDeletingSigId] = useState("");

  const [setName, setSetName] = useState("");
  const [setChannelIds, setSetChannelIds] = useState<string[]>([]);
  const [setBusy, setSetBusy] = useState(false);
  const [groupError, setGroupError] = useState("");
  const [deletingSetId, setDeletingSetId] = useState("");

  const channelLabel = useMemo(() => {
    const map = new Map<string, string>();
    for (const row of channels) {
      map.set(row.id, row.name || PROVIDER_LABEL_AR[row.provider] || row.provider || row.id);
    }
    return (id: string) => map.get(id) || id;
  }, [channels]);

  const generateKey = async () => {
    setGenerating(true);
    setError("");
    setCopied(false);
    const result = await generatePublishApiKey();
    if (!result.ok) {
      setError(result.error || "تعذّر توليد المفتاح");
      setGenerating(false);
      return;
    }
    const rec = result.data;
    const fullKey = rec?.apiKey?.trim() || "";
    setRevealedKey(fullKey);
    setHasApiKey(Boolean(rec?.hasApiKey || fullKey || rec?.apiKeyMasked));
    setApiKeyMasked(rec?.apiKeyMasked || "");
    setGenerating(false);
  };

  const copyRevealedKey = async () => {
    if (!revealedKey) return;
    try {
      await navigator.clipboard.writeText(revealedKey);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  };

  const createSignature = async () => {
    const content = sigContent.trim();
    if (!content) {
      setSigError("اكتب نص التوقيع أولاً.");
      return;
    }
    setSigBusy(true);
    setSigError("");
    const result = await createPublishSignature({ content, autoAdd: sigAutoAdd });
    if (result.missing) {
      setSigError("واجهة التوقيعات غير متاحة بعد.");
      setSigBusy(false);
      return;
    }
    if (!result.ok) {
      setSigError(result.error || "تعذّر حفظ التوقيع.");
      setSigBusy(false);
      return;
    }
    const created = result.data;
    if (created) {
      setSignatures((prev) => [created, ...prev.filter((row) => row.id !== created.id)]);
    } else {
      const refresh = await fetchPublishSettings();
      setSignatures(refresh.data?.signatures ?? []);
    }
    setSigContent("");
    setSigAutoAdd(false);
    setSigBusy(false);
  };

  const removeSignature = async (id: string) => {
    if (!window.confirm("حذف هذا التوقيع؟")) return;
    setDeletingSigId(id);
    setSigError("");
    const result = await deletePublishSignature(id);
    if (!result.ok) {
      setSigError(result.error || "تعذّر حذف التوقيع.");
      setDeletingSigId("");
      return;
    }
    setSignatures((prev) => prev.filter((row) => row.id !== id));
    setDeletingSigId("");
  };

  const toggleSetChannel = (id: string) => {
    setSetChannelIds((prev) => (prev.includes(id) ? prev.filter((row) => row !== id) : [...prev, id]));
  };

  const createSet = async () => {
    const name = setName.trim();
    if (!name) {
      setGroupError("اكتب اسم المجموعة أولاً.");
      return;
    }
    setSetBusy(true);
    setGroupError("");
    const result = await createPublishSet({ name, channelIds: setChannelIds });
    if (result.missing) {
      setGroupError("واجهة المجموعات غير متاحة بعد.");
      setSetBusy(false);
      return;
    }
    if (!result.ok) {
      setGroupError(result.error || "تعذّر حفظ المجموعة.");
      setSetBusy(false);
      return;
    }
    const created = result.data;
    if (created) {
      setSets((prev) => [created, ...prev.filter((row) => row.id !== created.id)]);
    } else {
      const refresh = await fetchPublishSettings();
      setSets(refresh.data?.sets ?? []);
    }
    setSetName("");
    setSetChannelIds([]);
    setSetBusy(false);
  };

  const removeSet = async (id: string) => {
    if (!window.confirm("حذف هذه المجموعة؟")) return;
    setDeletingSetId(id);
    setGroupError("");
    const result = await deletePublishSet(id);
    if (!result.ok) {
      setGroupError(result.error || "تعذّر حذف المجموعة.");
      setDeletingSetId("");
      return;
    }
    setSets((prev) => prev.filter((row) => row.id !== id));
    setDeletingSetId("");
  };

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const [settingsResult, channelsResult] = await Promise.all([
        fetchPublishSettings(),
        fetchPublishChannels(),
      ]);
      if (cancelled) return;
      setMissing(settingsResult.missing);
      setSignatures(settingsResult.data?.signatures ?? []);
      setSets(settingsResult.data?.sets ?? []);
      setHasApiKey(Boolean(settingsResult.data?.hasApiKey || settingsResult.data?.apiKeyMasked));
      setApiKeyMasked(settingsResult.data?.apiKeyMasked || "");
      setRevealedKey("");
      setChannelsMissing(channelsResult.missing);
      setChannels(channelsResult.data ?? []);
      setError(!settingsResult.ok && !settingsResult.missing ? settingsResult.error || "تعذّر تحميل الإعدادات" : "");
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const keyDisplay = revealedKey || apiKeyMasked || (hasApiKey ? "••••••••••••" : "لم يُولَّد بعد");

  return (
    <PublishShell
      title="إعدادات محرك النشر"
      description="توقيعات قابلة لإعادة الاستخدام، مجموعات قنوات، ومفتاح مطورين للوكلاء. بلا فوترة خارجية."
    >
      {loading ? (
        <div className='flex min-h-48 items-center justify-center text-sm text-muted-foreground'>
          <Loader2 className="me-2 size-4 animate-spin" />
          جاري التحميل…
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
          <article className={adminCardClass}>
            <div className='mb-3 flex size-10 items-center justify-center rounded-xl bg-primary-soft text-primary'>
              <PenLine className="size-5" />
            </div>
            <h2 className='text-sm font-black text-foreground'>التوقيعات</h2>
            <p className='mt-1 text-xs text-muted-foreground'>نص يُلحق تلقائياً عند تفعيل autoAdd.</p>

            <label className={`${adminLabelClass} mt-4`}>نص التوقيع</label>
            <textarea
              className={`${adminInputClass} min-h-24 resize-y`}
              value={sigContent}
              onChange={(e) => setSigContent(e.target.value)}
              placeholder="— لوناليزا للسفر"
              disabled={missing || sigBusy}
            />
            <label className='mt-3 flex cursor-pointer items-center justify-between gap-3 rounded-2xl border border-border bg-admin-bg-subtle px-3 py-2.5'>
              <span className='text-xs font-bold text-foreground'>إلحاق تلقائي</span>
              <input
                type="checkbox"
                className="size-4 accent-admin-accent-hover"
                checked={sigAutoAdd}
                disabled={missing || sigBusy}
                onChange={(e) => setSigAutoAdd(e.target.checked)}
              />
            </label>
            <button
              type="button"
              disabled={missing || sigBusy || !sigContent.trim()}
              onClick={() => void createSignature()}
              className={`${adminPrimaryBtnClass} mt-3 min-h-11 px-4 text-xs`}
            >
              {sigBusy ? <Loader2 className="size-3.5 animate-spin" /> : <Plus className="size-3.5" />}
              إضافة توقيع
            </button>
            {sigError ? <p className="mt-2 text-xs text-rose-600">{sigError}</p> : null}

            {signatures.length === 0 ? (
              <p className='mt-4 rounded-xl border border-dashed border-border px-3 py-4 text-xs text-muted-foreground'>
                لا توقيعات محفوظة{missing ? " — الواجهة غير متاحة بعد" : ""}.
              </p>
            ) : (
              <ul className="mt-4 space-y-2">
                {signatures.map((row) => (
                  <li key={row.id} className='rounded-xl border border-border px-3 py-2 text-xs'>
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <span className='font-bold text-foreground'>{row.name}</span>
                        {row.autoAdd ? (
                          <span className="ms-2 text-[10px] font-bold text-primary">تلقائي</span>
                        ) : null}
                        <p className='mt-1 line-clamp-2 text-muted-foreground'>{row.content || "—"}</p>
                      </div>
                      <button
                        type="button"
                        className='admin-tap rounded-lg p-1.5 text-muted-foreground hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/40'
                        disabled={missing || deletingSigId === row.id}
                        onClick={() => void removeSignature(row.id)}
                        aria-label="حذف التوقيع"
                      >
                        {deletingSigId === row.id ? (
                          <Loader2 className="size-3.5 animate-spin" />
                        ) : (
                          <Trash2 className="size-3.5" />
                        )}
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </article>

          <article className={adminCardClass}>
            <div className='mb-3 flex size-10 items-center justify-center rounded-xl bg-primary-soft text-primary'>
              <Layers className="size-5" />
            </div>
            <h2 className='text-sm font-black text-foreground'>المجموعات (Sets)</h2>
            <p className='mt-1 text-xs text-muted-foreground'>حزم قنوات جاهزة: لوناليزا، شريك B2B، وايت ليبل.</p>

            <label className={`${adminLabelClass} mt-4`}>اسم المجموعة</label>
            <input
              className={adminInputClass}
              value={setName}
              onChange={(e) => setSetName(e.target.value)}
              placeholder="شبكات أساسية"
              disabled={missing || setBusy}
            />
            <p className={`${adminLabelClass} mt-4`}>القنوات</p>
            {channels.length === 0 ? (
              <p className='rounded-xl border border-dashed border-border px-3 py-4 text-xs text-muted-foreground'>
                {channelsMissing
                  ? "قائمة القنوات غير متاحة بعد. يمكن حفظ المجموعة بدون معرّفات."
                  : "لا قنوات محفوظة في المحرك. اربط الحسابات أولاً، أو احفظ المجموعة فارغة."}
              </p>
            ) : (
              <div className="max-h-48 space-y-2 overflow-y-auto">
                {channels.map((channel) => {
                  const checked = setChannelIds.includes(channel.id);
                  return (
                    <label
                      key={channel.id}
                      className={cn(
                        "flex cursor-pointer items-center justify-between gap-3 rounded-2xl border px-3 py-2.5",
                        checked
                          ? 'border-admin-accent/40 bg-primary-soft'
                          : 'border-border bg-admin-bg-subtle',
                        channel.disabled && "opacity-50"
                      )}
                    >
                      <span className='text-xs font-bold text-foreground'>
                        {channel.name || PROVIDER_LABEL_AR[channel.provider] || channel.provider}
                      </span>
                      <input
                        type="checkbox"
                        className="size-4 accent-admin-accent-hover"
                        checked={checked}
                        disabled={missing || setBusy || channel.disabled}
                        onChange={() => toggleSetChannel(channel.id)}
                      />
                    </label>
                  );
                })}
              </div>
            )}
            <button
              type="button"
              disabled={missing || setBusy || !setName.trim()}
              onClick={() => void createSet()}
              className={`${adminPrimaryBtnClass} mt-3 min-h-11 px-4 text-xs`}
            >
              {setBusy ? <Loader2 className="size-3.5 animate-spin" /> : <Plus className="size-3.5" />}
              إضافة مجموعة
            </button>
            {groupError ? <p className="mt-2 text-xs text-rose-600">{groupError}</p> : null}

            {sets.length === 0 ? (
              <p className='mt-4 rounded-xl border border-dashed border-border px-3 py-4 text-xs text-muted-foreground'>
                لا مجموعات محفوظة{missing ? " — الواجهة غير متاحة بعد" : ""}.
              </p>
            ) : (
              <ul className="mt-4 space-y-2">
                {sets.map((row) => (
                  <li key={row.id} className='rounded-xl border border-border px-3 py-2 text-xs'>
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <span className='font-bold text-foreground'>{row.name}</span>
                        <p className='mt-1 text-muted-foreground'>{row.channelIds.length} قناة</p>
                        {row.channelIds.length > 0 ? (
                          <p className="mt-0.5 line-clamp-2 text-[11px] text-muted-foreground">
                            {row.channelIds.map(channelLabel).join("، ")}
                          </p>
                        ) : null}
                      </div>
                      <button
                        type="button"
                        className='admin-tap rounded-lg p-1.5 text-muted-foreground hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/40'
                        disabled={missing || deletingSetId === row.id}
                        onClick={() => void removeSet(row.id)}
                        aria-label="حذف المجموعة"
                      >
                        {deletingSetId === row.id ? (
                          <Loader2 className="size-3.5 animate-spin" />
                        ) : (
                          <Trash2 className="size-3.5" />
                        )}
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </article>

          <article className={adminCardClass}>
            <div className='mb-3 flex size-10 items-center justify-center rounded-xl bg-primary-soft text-primary'>
              <KeyRound className="size-5" />
            </div>
            <h2 className='text-sm font-black text-foreground'>مفتاح مطوري الوكلاء</h2>
            <p className='mt-1 text-xs text-muted-foreground'>
              للـAPI العام وMCP. المفتاح الكامل يُعرض مرة واحدة عند التوليد، ثم القناع فقط.
            </p>
            <label className={`${adminLabelClass} mt-4`}>
              {revealedKey ? "المفتاح الكامل (مرة واحدة)" : "المفتاح (مخفي)"}
            </label>
            <input
              className={adminInputClass}
              readOnly
              value={keyDisplay}
              dir="ltr"
            />
            {revealedKey ? (
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <p className='text-[11px] leading-relaxed text-admin-btn-secondary-hover dark:text-secondary'>
                  انسخ المفتاح الآن — لن يُعرض كاملاً مرة أخرى.
                </p>
                <button
                  type="button"
                  onClick={() => void copyRevealedKey()}
                  className={`${adminGhostBtnClass} min-h-9 px-3 py-1.5 text-[11px]`}
                >
                  {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
                  {copied ? "تم النسخ" : "نسخ"}
                </button>
              </div>
            ) : null}
            <button
              type="button"
              disabled={generating}
              onClick={() => void generateKey()}
              className={`${adminPrimaryBtnClass} mt-3 min-h-11 px-4 text-xs`}
            >
              {generating ? <Loader2 className="size-3.5 animate-spin" /> : null}
              {hasApiKey ? "توليد مفتاح جديد" : "توليد مفتاح"}
            </button>
          </article>
        </div>
      )}
      {error ? <p className="mt-4 text-sm text-rose-600">{error}</p> : null}
    </PublishShell>
  );
}
