"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  ChevronDown,
  ChevronUp,
  GripVertical,
  ImagePlus,
  Loader2,
  Plus,
  Save,
  Trash2,
} from "lucide-react";
import { AdminCopilotPanel } from "@/components/admin/copilot";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { normalizeUploadSrc } from "@/lib/email/image-src";
import {
  EMAIL_BLOCK_TYPES,
  EMAIL_SITE_LINKS,
  applyEmailPlaceholders,
  blockLabelAr,
  compileVisualEmail,
  createBlock,
  defaultVisualDocument,
  extractVisualDocument,
  sanitizeVisualDocument,
  type EmailBlock,
  type EmailBlockType,
  type EmailBrandLite,
  type EmailVisualDocument,
} from "@/lib/email/visual-doc";

const inputClass =
  "w-full px-3 py-2.5 bg-slate-950/60 border border-white/10 rounded-xl text-white placeholder-white/25 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/40 text-sm";
const cardClass = "rounded-2xl border border-white/10 bg-white/[0.03] p-4";

type EditorProps = {
  ar: boolean;
  brand: EmailBrandLite;
  name: string;
  subjectAr: string;
  subjectEn: string;
  htmlAr: string;
  document: unknown;
  busy: string;
  emailKind?: string;
  audienceHint?: string;
  onNameChange: (value: string) => void;
  onSubjectArChange: (value: string) => void;
  onSubjectEnChange: (value: string) => void;
  onDocumentChange: (doc: EmailVisualDocument) => void;
  onSave: () => void;
  onGemini: (prompt: string) => void;
};

export default function EmailVisualEditor({
  ar,
  brand,
  name,
  subjectAr,
  subjectEn,
  htmlAr,
  document,
  busy,
  emailKind,
  audienceHint,
  onNameChange,
  onSubjectArChange,
  onSubjectEnChange,
  onDocumentChange,
  onSave,
  onGemini,
}: EditorProps) {
  const [doc, setDoc] = useState<EmailVisualDocument>(() =>
    sanitizeVisualDocument(
      document || extractVisualDocument(htmlAr, brand),
      brand
    )
  );
  const [selectedId, setSelectedId] = useState(doc.blocks[0]?.id || "");
  const [previewMode, setPreviewMode] = useState<"desktop" | "narrow">("desktop");
  const [dragId, setDragId] = useState("");
  const { t } = useLocale();

  useEffect(() => {
    const next = sanitizeVisualDocument(
      document || extractVisualDocument(htmlAr, brand) || defaultVisualDocument(brand),
      brand
    );
    setDoc(next);
    setSelectedId((current) =>
      next.blocks.some((b) => b.id === current) ? current : next.blocks[0]?.id || ""
    );
  }, [document, htmlAr, brand]);

  const selected = doc.blocks.find((b) => b.id === selectedId) || null;

  const previewHtml = useMemo(() => {
    const compiled = compileVisualEmail(doc, brand);
    return applyEmailPlaceholders(compiled, {
      name: "محمد أحمد",
      company: brand.brandNameAr,
      bookingId: "BK-PREVIEW",
      booking_id: "BK-PREVIEW",
      amount: "—",
      cta_url: `${brand.siteUrl}/account`,
    });
  }, [doc, brand]);

  const commit = (next: EmailVisualDocument) => {
    setDoc(next);
    onDocumentChange(next);
  };

  const updateBlock = (id: string, patch: Partial<EmailBlock>) => {
    commit({
      ...doc,
      blocks: doc.blocks.map((block) => (block.id === id ? { ...block, ...patch } : block)),
    });
  };

  const addBlock = (type: EmailBlockType) => {
    const block = createBlock(type, brand);
    const index = selected
      ? doc.blocks.findIndex((b) => b.id === selected.id) + 1
      : doc.blocks.length;
    const blocks = [...doc.blocks];
    blocks.splice(index, 0, block);
    commit({ ...doc, blocks });
    setSelectedId(block.id);
  };

  const removeBlock = (id: string) => {
    const blocks = doc.blocks.filter((b) => b.id !== id);
    if (blocks.length === 0) return;
    commit({ ...doc, blocks });
    setSelectedId(blocks[0].id);
  };

  const moveBlock = (id: string, dir: -1 | 1) => {
    const index = doc.blocks.findIndex((b) => b.id === id);
    const next = index + dir;
    if (index < 0 || next < 0 || next >= doc.blocks.length) return;
    const blocks = [...doc.blocks];
    const [item] = blocks.splice(index, 1);
    blocks.splice(next, 0, item);
    commit({ ...doc, blocks });
  };

  const onDrop = (targetId: string) => {
    if (!dragId || dragId === targetId) return;
    const from = doc.blocks.findIndex((b) => b.id === dragId);
    const to = doc.blocks.findIndex((b) => b.id === targetId);
    if (from < 0 || to < 0) return;
    const blocks = [...doc.blocks];
    const [item] = blocks.splice(from, 1);
    blocks.splice(to, 0, item);
    commit({ ...doc, blocks });
    setDragId("");
  };

  return (
    <div className="space-y-4">
      <div className="grid md:grid-cols-2 gap-3">
        <input
          className={inputClass}
          value={name}
          onChange={(e) => onNameChange(e.target.value)}
          placeholder={ar ? "اسم القالب" : "Template name"}
        />
        <input
          className={inputClass}
          value={subjectAr}
          onChange={(e) => onSubjectArChange(e.target.value)}
          placeholder={ar ? "موضوع الرسالة (عربي)" : "Subject (AR)"}
        />
        <input
          className={`${inputClass} md:col-span-2`}
          value={subjectEn}
          onChange={(e) => onSubjectEnChange(e.target.value)}
          placeholder={ar ? "موضوع الرسالة (إنجليزي)" : "Subject (EN)"}
        />
      </div>

      <div className={`${cardClass} overflow-hidden p-0`}>
        <AdminCopilotPanel
          scope="email"
          title={ar ? "توليد أو تعديل عبر Copilot" : "Generate or edit with Copilot"}
          hint={t.builderAgent.isolated}
          placeholder={
            ar
              ? "مثال: تذكير حجز فندق مع زر حسابي وجدول رقم الحجز والمبلغ"
              : "e.g. Hotel booking reminder with account button and booking table"
          }
          className="h-[360px]"
          host={{
            email: {
              kind: emailKind,
              audienceHint,
              currentDocument: doc,
              onApply: (template) => {
                if (template.name) onNameChange(template.name);
                if (template.subject_ar) onSubjectArChange(template.subject_ar);
                if (template.subject_en) onSubjectEnChange(template.subject_en);
                if (template.document) {
                  commit(sanitizeVisualDocument(template.document, brand));
                }
              },
            },
          }}
          fallback={async (messages) => {
            const prompt = messages.filter((m) => m.role === "user").map((m) => m.content).pop() || "";
            if (prompt.trim().length < 8) {
              return ar ? "اكتب وصفاً أوضح (8 أحرف على الأقل)." : "Write a clearer brief (8+ characters).";
            }
            onGemini(prompt);
            return ar ? "طُلِب التوليد — راجع المحرر بعد التطبيق." : "Generation requested — review the editor after apply.";
          }}
        />
      </div>

      <div className="grid xl:grid-cols-[240px_1fr_280px] gap-4">
        <div className={`${cardClass} space-y-2`}>
          <p className="text-xs uppercase tracking-wider text-white/35">
            {ar ? "المكوّنات" : "Blocks"}
          </p>
          <div className="flex flex-wrap gap-1.5">
            {EMAIL_BLOCK_TYPES.map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => addBlock(type)}
                className="inline-flex items-center gap-1 px-2 py-1 rounded-lg border border-white/10 text-[11px] text-white/70 hover:bg-white/[0.06]"
              >
                <Plus size={11} />
                {blockLabelAr(type)}
              </button>
            ))}
          </div>
          <div className="space-y-1 pt-2">
            {doc.blocks.map((block) => (
              <div
                key={block.id}
                draggable
                onDragStart={() => setDragId(block.id)}
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => onDrop(block.id)}
                className={`flex items-center gap-1 rounded-xl px-2 py-1.5 ${
                  selectedId === block.id
                    ? "bg-amber-500/15 border border-amber-500/25"
                    : "hover:bg-white/[0.04]"
                }`}
              >
                <button
                  type="button"
                  className="text-white/30 cursor-grab"
                  aria-label={ar ? "سحب" : "Drag"}
                >
                  <GripVertical size={14} />
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedId(block.id)}
                  className="flex-1 text-start text-xs text-white/80"
                >
                  {blockLabelAr(block.type)}
                </button>
                <button type="button" onClick={() => moveBlock(block.id, -1)} className="text-white/35">
                  <ChevronUp size={13} />
                </button>
                <button type="button" onClick={() => moveBlock(block.id, 1)} className="text-white/35">
                  <ChevronDown size={13} />
                </button>
                <button type="button" onClick={() => removeBlock(block.id)} className="text-red-300/70">
                  <Trash2 size={13} />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className={`${cardClass} space-y-3`}>
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs uppercase tracking-wider text-white/35">
              {ar ? "معاينة حيّة" : "Live preview"}
            </p>
            <div className="flex gap-1">
              {(["desktop", "narrow"] as const).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setPreviewMode(mode)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] ${
                    previewMode === mode
                      ? "bg-amber-500 text-slate-950"
                      : "border border-white/10 text-white/50"
                  }`}
                >
                  {mode === "desktop" ? (ar ? "سطح المكتب" : "Desktop") : ar ? "عرض ضيق" : "Narrow"}
                </button>
              ))}
            </div>
          </div>
          <div className="flex justify-center bg-black/20 rounded-xl p-3">
            <iframe
              title="email-preview"
              className="h-[560px] rounded-lg border border-white/10 bg-white transition-all"
              style={{ width: previewMode === "desktop" ? "100%" : 360, maxWidth: 600 }}
              srcDoc={previewHtml}
            />
          </div>
          <p className="text-[11px] text-white/35">
            {ar
              ? "المتغيرات: {{name}} {{company}} {{bookingId}} {{amount}}"
              : "Variables: {{name}} {{company}} {{bookingId}} {{amount}}"}
          </p>
        </div>

        <div className={`${cardClass} space-y-3`}>
          <p className="text-xs uppercase tracking-wider text-white/35">
            {ar ? "تحرير المكوّن" : "Edit block"}
          </p>
          {selected ? (
            <BlockInspector
              ar={ar}
              brand={brand}
              block={selected}
              onChange={(patch) => updateBlock(selected.id, patch)}
              canvasBg={doc.canvasBg}
              cardBg={doc.cardBg}
              onCanvas={(patch) => commit({ ...doc, ...patch })}
            />
          ) : (
            <p className="text-sm text-white/40">
              {ar ? "اختر مكوّناً من القائمة." : "Select a block."}
            </p>
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={onSave}
          disabled={busy === "save"}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 text-white font-semibold text-sm disabled:opacity-40"
        >
          {busy === "save" ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
          {ar ? "حفظ وتحديث القائمة" : "Save and update list"}
        </button>
      </div>
    </div>
  );
}

function BlockInspector({
  ar,
  brand,
  block,
  onChange,
  canvasBg,
  cardBg,
  onCanvas,
}: {
  ar: boolean;
  brand: EmailBrandLite;
  block: EmailBlock;
  onChange: (patch: Partial<EmailBlock>) => void;
  canvasBg: string;
  cardBg: string;
  onCanvas: (patch: Pick<EmailVisualDocument, "canvasBg" | "cardBg">) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");

  const uploadImage = async (file: File) => {
    setUploading(true);
    setUploadError("");
    try {
      const form = new FormData();
      form.set("file", file);
      const res = await fetch("/api/admin/email-templates/upload", {
        method: "POST",
        body: form,
      });
      const json = (await res.json()) as {
        url?: string;
        path?: string;
        error?: string;
      };
      if (!res.ok || !json.url) throw new Error(json.error || "تعذّر رفع الصورة");
      onChange({ src: normalizeUploadSrc(json.url) });
    } catch (e) {
      setUploadError(e instanceof Error ? e.message : "تعذّر رفع الصورة");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-3">
      <p className="text-sm font-semibold text-white">{blockLabelAr(block.type)}</p>
      {(block.type === "heading" || block.type === "paragraph" || block.type === "button") && (
        <label className="block text-[11px] text-white/40">
          {ar ? "النص" : "Text"}
          <textarea
            className={`${inputClass} mt-1 min-h-[70px]`}
            value={block.text || ""}
            onChange={(e) => onChange({ text: e.target.value })}
          />
        </label>
      )}
      {block.type === "button" && (
        <>
          <label className="block text-[11px] text-white/40">
            {ar ? "وجهة الزر" : "Button target"}
            <select
              className={`${inputClass} mt-1`}
              value={block.hrefKey || "home"}
              onChange={(e) =>
                onChange({
                  hrefKey: EMAIL_SITE_LINKS.find((l) => l.key === e.target.value)?.key || "home",
                })
              }
            >
              {EMAIL_SITE_LINKS.map((link) => (
                <option key={link.key} value={link.key}>
                  {ar ? link.labelAr : link.labelEn}
                  {link.path ? ` — ${link.path}` : ""}
                </option>
              ))}
            </select>
          </label>
          {block.hrefKey === "custom" && (
            <input
              className={inputClass}
              value={block.customUrl || ""}
              onChange={(e) => onChange({ customUrl: e.target.value })}
              placeholder={ar ? "مسار الموقع مثل /holidays" : "Site path such as /holidays"}
            />
          )}
        </>
      )}
      {block.type === "header" && (
        <label className="block text-[11px] text-white/40">
          {ar ? "خلفية الشعار" : "Logo background"}
          <select
            className={`${inputClass} mt-1`}
            value={block.logoBackground || "brand"}
            onChange={(e) =>
              onChange({
                logoBackground: e.target.value === "transparent" ? "transparent" : "brand",
              })
            }
          >
            <option value="brand">{ar ? "لون البراند" : "Brand color"}</option>
            <option value="transparent">{ar ? "شفاف" : "Transparent"}</option>
          </select>
        </label>
      )}
      {block.type === "image" && (
        <>
          <input
            dir="ltr"
            className={`${inputClass} text-left font-mono text-xs`}
            value={block.src || ""}
            onChange={(e) => onChange({ src: normalizeUploadSrc(e.target.value) })}
            placeholder="/api/branding/file?name=email/…"
          />
          {block.src ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={block.src}
              alt=""
              className="mt-1 max-h-28 w-full rounded-lg bg-black/30 object-contain"
            />
          ) : null}
          <label className="inline-flex items-center gap-2 text-xs text-amber-200 cursor-pointer">
            <ImagePlus size={14} />
            {uploading ? (ar ? "رفع…" : "Uploading…") : ar ? "رفع صورة" : "Upload image"}
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                e.target.value = "";
                if (file) void uploadImage(file);
              }}
            />
          </label>
          {uploadError ? (
            <p className="text-[11px] text-red-300">{uploadError}</p>
          ) : null}
        </>
      )}
      {block.type === "bookingTable" && (
        <div className="space-y-2">
          {(block.rows || []).map((row, index) => (
            <div key={`${row.label}-${index}`} className="grid grid-cols-2 gap-2">
              <input
                className={inputClass}
                value={row.label}
                onChange={(e) => {
                  const rows = [...(block.rows || [])];
                  rows[index] = { ...rows[index], label: e.target.value };
                  onChange({ rows });
                }}
              />
              <input
                className={inputClass}
                value={row.value}
                onChange={(e) => {
                  const rows = [...(block.rows || [])];
                  rows[index] = { ...rows[index], value: e.target.value };
                  onChange({ rows });
                }}
              />
            </div>
          ))}
          <button
            type="button"
            className="text-xs text-amber-200"
            onClick={() =>
              onChange({
                rows: [...(block.rows || []), { label: "حقل", value: "{{bookingId}}" }],
              })
            }
          >
            {ar ? "+ صف" : "+ row"}
          </button>
        </div>
      )}
      {(block.type === "heading" ||
        block.type === "paragraph" ||
        block.type === "button" ||
        block.type === "image") && (
        <div className="flex gap-1">
          {(["right", "center", "left"] as const).map((align) => (
            <button
              key={align}
              type="button"
              onClick={() => onChange({ align })}
              className={`p-1.5 rounded-lg border ${
                block.align === align ? "border-amber-400 text-amber-200" : "border-white/10 text-white/40"
              }`}
            >
              {align === "right" ? (
                <AlignRight size={14} />
              ) : align === "center" ? (
                <AlignCenter size={14} />
              ) : (
                <AlignLeft size={14} />
              )}
            </button>
          ))}
        </div>
      )}
      {(block.type === "heading" || block.type === "paragraph" || block.type === "button") && (
        <label className="block text-[11px] text-white/40">
          {ar ? "لون النص" : "Text color"}
          <input
            type="color"
            className="mt-1 h-9 w-full rounded-lg bg-transparent border border-white/10"
            value={block.color || "#122033"}
            onChange={(e) => onChange({ color: e.target.value })}
          />
        </label>
      )}
      {(block.type === "header" ||
        block.type === "button" ||
        block.type === "bookingTable" ||
        block.type === "footer" ||
        block.type === "divider") && (
        <label className="block text-[11px] text-white/40">
          {block.type === "divider" ? (ar ? "لون الفاصل" : "Divider") : ar ? "لون الخلفية" : "Background"}
          <input
            type="color"
            className="mt-1 h-9 w-full rounded-lg bg-transparent border border-white/10"
            value={block.background || block.color || brand.button}
            onChange={(e) =>
              onChange(block.type === "divider" ? { color: e.target.value } : { background: e.target.value })
            }
          />
        </label>
      )}
      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/10">
        <label className="block text-[11px] text-white/40">
          {ar ? "خلفية الصفحة" : "Canvas"}
          <input
            type="color"
            className="mt-1 h-9 w-full rounded-lg bg-transparent border border-white/10"
            value={canvasBg}
            onChange={(e) => onCanvas({ canvasBg: e.target.value, cardBg })}
          />
        </label>
        <label className="block text-[11px] text-white/40">
          {ar ? "خلفية البطاقة" : "Card"}
          <input
            type="color"
            className="mt-1 h-9 w-full rounded-lg bg-transparent border border-white/10"
            value={cardBg}
            onChange={(e) => onCanvas({ canvasBg, cardBg: e.target.value })}
          />
        </label>
      </div>
    </div>
  );
}
