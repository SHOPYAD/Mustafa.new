"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Check,
  ChevronDown,
  ChevronUp,
  Copy,
  GripVertical,
  ImagePlus,
  Layers,
  Loader2,
  Monitor,
  Plus,
  Save,
  Sliders,
  Smartphone,
  Sparkles,
  Tablet,
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
  "w-full px-3 py-2.5 bg-background/80 border border-slate-700/60 rounded-xl text-slate-100 placeholder-slate-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-admin-btn-secondary-border/40 text-sm transition-colors";
const cardClass = "rounded-2xl border border-border bg-background/60 p-4 shadow-sm";

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
  const [previewMode, setPreviewMode] = useState<"desktop" | "tablet" | "mobile">("desktop");
  const [activeStudioTab, setActiveStudioTab] = useState<"blocks" | "inspector">("blocks");
  const [copilotOpen, setCopilotOpen] = useState(false);
  const [copiedToken, setCopiedToken] = useState<string | null>(null);
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
      amount: "1,250 SAR",
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
    setActiveStudioTab("inspector");
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

  const copyToken = (token: string) => {
    navigator.clipboard.writeText(token);
    setCopiedToken(token);
    setTimeout(() => setCopiedToken(null), 2000);
  };

  const previewWidth =
    previewMode === "desktop" ? "100%" : previewMode === "tablet" ? "480px" : "360px";

  return (
    <div className="space-y-5">
      {/* Subject & Meta Fields */}
      <div className="grid md:grid-cols-3 gap-3">
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">
            {ar ? "اسم القالب الداخلي" : "Template Name"}
          </label>
          <input
            className={inputClass}
            value={name}
            onChange={(e) => onNameChange(e.target.value)}
            placeholder={ar ? "اسم القالب" : "Template name"}
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">
            {ar ? "موضوع الرسالة (عربي)" : "Subject (Arabic)"}
          </label>
          <input
            className={inputClass}
            value={subjectAr}
            onChange={(e) => onSubjectArChange(e.target.value)}
            placeholder={ar ? "مثال: تأكيد حجز رحلتكم مع لوناليزا" : "Subject (AR)"}
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">
            {ar ? "موضوع الرسالة (إنجليزي)" : "Subject (English)"}
          </label>
          <input
            className={inputClass}
            value={subjectEn}
            onChange={(e) => onSubjectEnChange(e.target.value)}
            placeholder={ar ? "Your booking confirmation" : "Subject (EN)"}
          />
        </div>
      </div>

      {/* AI Copilot Collapsible Panel */}
      <div className='rounded-2xl border border-admin-btn-primary-hover/40 bg-primary/20 overflow-hidden transition-all'>
        <button
          type="button"
          onClick={() => setCopilotOpen(!copilotOpen)}
          className='w-full flex items-center justify-between px-4 py-3 text-start hover:bg-primary/20 transition-colors'
        >
          <div className="flex items-center gap-2">
            <span className='flex items-center justify-center w-7 h-7 rounded-lg bg-gradient-to-tr from-admin-btn-primary-bg to-admin-accent text-secondary'>
              <Sparkles size={15} />
            </span>
            <div>
              <p className="text-sm font-semibold text-slate-200">
                {ar ? "مساعد الذكاء الاصطناعي Copilot لتصميم البريد" : "AI Email Copilot Assistant"}
              </p>
              <p className="text-[11px] text-muted-foreground">
                {ar
                  ? "توليد محتوى احترافي ومخصص بنقرة واحدة عبر الذكاء الاصطناعي"
                  : "Generate customized, high-converting email layouts with AI"}
              </p>
            </div>
          </div>
          <span className='text-xs px-2.5 py-1 rounded-lg bg-primary/40 text-muted-foreground border border-primary/30 flex items-center gap-1'>
            {copilotOpen ? (ar ? "إخفاء" : "Collapse") : ar ? "فتح Copilot" : "Open Copilot"}
            {copilotOpen ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
          </span>
        </button>

        {copilotOpen && (
          <div className="border-t border-admin-btn-primary-hover/30 p-2 bg-background/40">
            <AdminCopilotPanel
              scope="email"
              title={ar ? "توليد أو تعديل عبر Copilot" : "Generate or edit with Copilot"}
              hint={t.builderAgent.isolated}
              placeholder={
                ar
                  ? "مثال: تذكير حجز فندق في إسطنبول مع جدول تفاصيل الحجز وزر حسابي باللون البنفسجي"
                  : "e.g. Hotel booking reminder with account button and booking details"
              }
              className="h-[340px]"
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
                const prompt =
                  messages
                    .filter((m) => m.role === "user")
                    .map((m) => m.content)
                    .pop() || "";
                if (prompt.trim().length < 8) {
                  return ar
                    ? "اكتب وصفاً أوضح (8 أحرف على الأقل)."
                    : "Write a clearer brief (8+ characters).";
                }
                onGemini(prompt);
                return ar
                  ? "طُلِب التوليد — راجع المحرر بعد التطبيق."
                  : "Generation requested — review the editor after apply.";
              }}
            />
          </div>
        )}
      </div>

      {/* Spacious 2-Column Studio Layout (Canvas 60% / Tools 40%) */}
      <div className="grid lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Live Email Canvas (60% width) */}
        <div className="lg:col-span-7 xl:col-span-7 space-y-3">
          <div className={`${cardClass} space-y-3`}>
            {/* Canvas Header & Device Toggles */}
            <div className='flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-border'>
              <div className="flex items-center gap-2">
                <span className='w-2.5 h-2.5 rounded-full bg-secondary animate-pulse' />
                <p className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  {ar ? "معاينة حيّة للمراسلة" : "Live Email Canvas"}
                </p>
              </div>

              {/* Device Selector */}
              <div className='flex items-center gap-1 bg-background/70 p-1 rounded-xl border border-border'>
                <button
                  type="button"
                  onClick={() => setPreviewMode("desktop")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    previewMode === "desktop"
                      ? "bg-gradient-to-r from-admin-btn-primary-bg to-admin-btn-primary-hover text-secondary shadow-sm"
                      : "text-muted-foreground hover:text-slate-200"
                  }`}
                >
                  <Monitor size={14} />
                  {ar ? "كمبيوتر" : "Desktop"}
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewMode("tablet")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    previewMode === "tablet"
                      ? "bg-gradient-to-r from-admin-btn-primary-bg to-admin-btn-primary-hover text-secondary shadow-sm"
                      : "text-muted-foreground hover:text-slate-200"
                  }`}
                >
                  <Tablet size={14} />
                  {ar ? "تابلت" : "Tablet"}
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewMode("mobile")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    previewMode === "mobile"
                      ? "bg-gradient-to-r from-admin-btn-primary-bg to-admin-btn-primary-hover text-secondary shadow-sm"
                      : "text-muted-foreground hover:text-slate-200"
                  }`}
                >
                  <Smartphone size={14} />
                  {ar ? "جوال" : "Mobile"}
                </button>
              </div>
            </div>

            {/* Device Simulated Screen Frame */}
            <div className='flex justify-center bg-background/80 rounded-2xl p-4 sm:p-6 border border-border overflow-x-auto min-h-[660px]'>
              <div
                className='transition-all duration-300 flex flex-col shadow-2xl rounded-xl border border-slate-700/60 bg-card overflow-hidden'
                style={{ width: previewWidth, maxWidth: "100%" }}
              >
                {/* Simulated Email Client Top Bar */}
                <div className='bg-card-2 px-3 py-2 border-b border-border flex items-center justify-between text-xs text-muted-foreground select-none'>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-400" />
                    <span className='w-2.5 h-2.5 rounded-full bg-secondary' />
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                  </div>
                  <div className='text-[11px] font-medium text-muted-foreground truncate max-w-[200px]'>
                    {subjectAr || "Inbox Preview"}
                  </div>
                  <span className="text-[10px] text-muted-foreground">Lonaliza Mail</span>
                </div>

                <iframe
                  title="email-preview"
                  className='w-full h-[580px] bg-card border-0'
                  srcDoc={previewHtml}
                />
              </div>
            </div>

            {/* Quick Variable Tokens */}
            <div className='pt-2 border-t border-border'>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-muted-foreground">
                  {ar ? "متغيرات ذكية قابلة للنسخ:" : "Dynamic template variables (click to copy):"}
                </span>
                {copiedToken && (
                  <span className='text-[11px] font-semibold text-secondary flex items-center gap-1'>
                    <Check size={12} /> {ar ? "تم النسخ للحافظة!" : "Copied to clipboard!"}
                  </span>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {[
                  { token: "{{name}}", label: ar ? "اسم العميل" : "Name" },
                  { token: "{{company}}", label: ar ? "اسم الشركة" : "Company" },
                  { token: "{{bookingId}}", label: ar ? "رقم الحجز" : "Booking ID" },
                  { token: "{{amount}}", label: ar ? "المبلغ" : "Amount" },
                  { token: "{{cta_url}}", label: ar ? "رابط الإجراء" : "CTA URL" },
                ].map(({ token, label }) => (
                  <button
                    key={token}
                    type="button"
                    onClick={() => copyToken(token)}
                    className='inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-card/80 hover:bg-primary/60 border border-slate-700/60 text-xs text-slate-300 hover:text-muted-foreground transition-colors'
                  >
                    <Copy size={11} className="text-muted-foreground" />
                    <code className='text-secondary font-mono text-[11px]'>{token}</code>
                    <span className="text-[10px] text-muted-foreground">({label})</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Studio Tools & Block Inspector (40% width) */}
        <div className="lg:col-span-5 xl:col-span-5 space-y-4">
          <div className={`${cardClass} space-y-4`}>
            {/* Studio Tabs */}
            <div className='grid grid-cols-2 gap-1.5 p-1 bg-background/80 rounded-xl border border-border'>
              <button
                type="button"
                onClick={() => setActiveStudioTab("blocks")}
                className={`flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all ${
                  activeStudioTab === "blocks"
                    ? "bg-gradient-to-r from-admin-btn-primary-bg to-admin-btn-primary-hover text-secondary shadow-sm"
                    : "text-muted-foreground hover:text-slate-200"
                }`}
              >
                <Layers size={14} />
                {ar ? `المكونات والترتيب (${doc.blocks.length})` : `Blocks (${doc.blocks.length})`}
              </button>
              <button
                type="button"
                onClick={() => setActiveStudioTab("inspector")}
                className={`flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all ${
                  activeStudioTab === "inspector"
                    ? "bg-gradient-to-r from-admin-btn-primary-bg to-admin-btn-primary-hover text-secondary shadow-sm"
                    : "text-muted-foreground hover:text-slate-200"
                }`}
              >
                <Sliders size={14} />
                {ar ? "خصائص العنصر" : "Block Inspector"}
              </button>
            </div>

            {/* TAB 1: BLOCKS PALETTE & REORDERING */}
            {activeStudioTab === "blocks" && (
              <div className="space-y-4">
                {/* Palette */}
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">
                    {ar ? "إضافة مكوّن جديد" : "Add Block"}
                  </p>
                  <div className="grid grid-cols-2 gap-1.5">
                    {EMAIL_BLOCK_TYPES.map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => addBlock(type)}
                        className='flex items-center gap-2 px-3 py-2 rounded-xl bg-card/60 hover:bg-primary/50 border border-slate-700/50 hover:border-primary/40 text-xs text-slate-200 hover:text-muted-foreground transition-all text-start'
                      >
                        <Plus size={13} className='text-secondary' />
                        <span className="truncate">{blockLabelAr(type)}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Blocks List & Drag-Reorder */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      {ar ? "هيكل القالب (الترتيب)" : "Template Structure"}
                    </p>
                    <span className="text-[10px] text-muted-foreground">
                      {ar ? "اسحب أو استخدم الأسهم" : "Drag or use arrows"}
                    </span>
                  </div>

                  <div className="space-y-1.5 max-h-[420px] overflow-y-auto pr-1">
                    {doc.blocks.map((block, idx) => (
                      <div
                        key={block.id}
                        draggable
                        onDragStart={() => setDragId(block.id)}
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={() => onDrop(block.id)}
                        className={`flex items-center gap-2 rounded-xl px-3 py-2 border transition-all ${
                          selectedId === block.id
                            ? "bg-primary/70 border-admin-btn-secondary-border/40 shadow-sm"
                            : "bg-background/40 border-border hover:bg-card/40"
                        }`}
                      >
                        <button
                          type="button"
                          className='text-muted-foreground hover:text-slate-300 cursor-grab active:cursor-grabbing p-0.5'
                          aria-label={ar ? "سحب" : "Drag"}
                        >
                          <GripVertical size={14} />
                        </button>
                        <span className='text-[10px] font-mono text-muted-foreground w-4 text-center'>
                          {idx + 1}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedId(block.id);
                            setActiveStudioTab("inspector");
                          }}
                          className='flex-1 text-start text-xs font-semibold text-slate-200 hover:text-muted-foreground truncate'
                        >
                          {blockLabelAr(block.type)}
                        </button>
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => moveBlock(block.id, -1)}
                            disabled={idx === 0}
                            className="p-1 text-muted-foreground hover:text-slate-200 disabled:opacity-30"
                            title={ar ? "تحريك لأعلى" : "Move up"}
                          >
                            <ChevronUp size={13} />
                          </button>
                          <button
                            type="button"
                            onClick={() => moveBlock(block.id, 1)}
                            disabled={idx === doc.blocks.length - 1}
                            className="p-1 text-muted-foreground hover:text-slate-200 disabled:opacity-30"
                            title={ar ? "تحريك لأسفل" : "Move down"}
                          >
                            <ChevronDown size={13} />
                          </button>
                          <button
                            type="button"
                            onClick={() => removeBlock(block.id)}
                            className="p-1 text-red-400/70 hover:text-red-300"
                            title={ar ? "حذف" : "Delete"}
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: INSPECTOR PROPERTIES */}
            {activeStudioTab === "inspector" && (
              <div>
                {selected ? (
                  <div className="space-y-4">
                    <div className='flex items-center justify-between pb-2 border-b border-border'>
                      <div>
                        <span className='text-[10px] text-secondary font-bold uppercase tracking-wider'>
                          {ar ? "تعديل خصائص المكوّن" : "Editing Element"}
                        </span>
                        <h4 className="text-sm font-bold text-slate-100">
                          {blockLabelAr(selected.type)}
                        </h4>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeBlock(selected.id)}
                        className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1"
                      >
                        <Trash2 size={12} />
                        {ar ? "حذف المكوّن" : "Delete"}
                      </button>
                    </div>

                    <BlockInspector
                      ar={ar}
                      brand={brand}
                      block={selected}
                      onChange={(patch) => updateBlock(selected.id, patch)}
                      canvasBg={doc.canvasBg}
                      cardBg={doc.cardBg}
                      onCanvas={(patch) => commit({ ...doc, ...patch })}
                    />
                  </div>
                ) : (
                  <div className="text-center py-10 px-4">
                    <p className="text-sm font-medium text-muted-foreground">
                      {ar ? "لم يتم تحديد أي مكوّن." : "No block selected."}
                    </p>
                    <button
                      type="button"
                      onClick={() => setActiveStudioTab("blocks")}
                      className='mt-3 text-xs text-secondary hover:underline'
                    >
                      {ar ? "اختر مكوّناً من القائمة" : "Choose a block from the list"}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Save Action Bar - Purged Emerald, Royal Purple & Radiant Amber */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
        <button
          type="button"
          onClick={onSave}
          disabled={busy === "save"}
          className='inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-admin-btn-primary-bg to-admin-btn-primary-hover hover:from-[#3b157e] hover:to-[#581c87] text-foreground font-bold text-sm shadow-md shadow-[hsl(var(--primary))]/30 transition-all hover:scale-[1.01] active:scale-[0.98] disabled:opacity-50'
        >
          {busy === "save" ? (
            <Loader2 size={16} className='animate-spin text-secondary' />
          ) : (
            <Save size={16} className='text-secondary' />
          )}
          <span>{ar ? "حفظ التعديلات وتحديث القالب" : "Save and Update Template"}</span>
        </button>

        <p className="text-xs text-muted-foreground">
          {ar
            ? "يتم تطبيق التحديثات فوراً على حملات البريد الإلكتروني الجاهزة للإرسال."
            : "Saved changes will be immediately available to draft and queued campaigns."}
        </p>
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
    <div className="space-y-4">
      {/* Text / Body input */}
      {(block.type === "heading" || block.type === "paragraph" || block.type === "button") && (
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">
            {ar ? "النص أو المحتوى" : "Text content"}
          </label>
          <textarea
            className={`${inputClass} min-h-[85px] leading-relaxed`}
            value={block.text || ""}
            onChange={(e) => onChange({ text: e.target.value })}
            placeholder={ar ? "اكتب النص هنا..." : "Type text here..."}
          />
        </div>
      )}

      {/* Button Destination Link */}
      {block.type === "button" && (
        <div className="space-y-2">
          <label className="block text-xs font-semibold text-slate-300">
            {ar ? "وجهة الزر" : "Button Target"}
          </label>
          <select
            className={inputClass}
            value={block.hrefKey || "home"}
            onChange={(e) =>
              onChange({
                hrefKey: EMAIL_SITE_LINKS.find((l) => l.key === e.target.value)?.key || "home",
              })
            }
          >
            {EMAIL_SITE_LINKS.map((link) => (
              <option key={link.key} value={link.key} className='bg-background text-foreground'>
                {ar ? link.labelAr : link.labelEn}
                {link.path ? ` — ${link.path}` : ""}
              </option>
            ))}
          </select>

          {block.hrefKey === "custom" && (
            <input
              className={inputClass}
              value={block.customUrl || ""}
              onChange={(e) => onChange({ customUrl: e.target.value })}
              placeholder={ar ? "مسار الرابط مثل: /holidays أو https://..." : "/holidays or https://..."}
            />
          )}
        </div>
      )}

      {/* Header Logo Background */}
      {block.type === "header" && (
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">
            {ar ? "خلفية الشعار" : "Logo background"}
          </label>
          <select
            className={inputClass}
            value={block.logoBackground || "brand"}
            onChange={(e) =>
              onChange({
                logoBackground: e.target.value === "transparent" ? "transparent" : "brand",
              })
            }
          >
            <option value="brand" className='bg-background text-foreground'>
              {ar ? "لون البراند الأساسي" : "Brand Color"}
            </option>
            <option value="transparent" className='bg-background text-foreground'>
              {ar ? "شفاف" : "Transparent"}
            </option>
          </select>
        </div>
      )}

      {/* Image Uploader */}
      {block.type === "image" && (
        <div className="space-y-2">
          <label className="block text-xs font-semibold text-slate-300">
            {ar ? "رابط أو ملف الصورة" : "Image Source or Upload"}
          </label>
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
              className='mt-1 max-h-36 w-full rounded-xl bg-foreground/5 object-contain border border-slate-700/60'
            />
          ) : null}
          <label className='inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-primary/60 border border-admin-btn-primary-hover/40 text-xs font-semibold text-secondary cursor-pointer hover:bg-primary/40 transition-colors'>
            <ImagePlus size={15} />
            <span>{uploading ? (ar ? "جاري الرفع…" : "Uploading…") : ar ? "رفع صورة جديدة" : "Upload Image"}</span>
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
          {uploadError ? <p className="text-xs text-red-400 font-medium">{uploadError}</p> : null}
        </div>
      )}

      {/* Booking Table Rows */}
      {block.type === "bookingTable" && (
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-semibold text-slate-300">
              {ar ? "صفوف جدول الحجز" : "Booking details rows"}
            </label>
            <button
              type="button"
              className='text-xs font-semibold text-secondary hover:text-muted-foreground'
              onClick={() =>
                onChange({
                  rows: [...(block.rows || []), { label: "حقل", value: "{{bookingId}}" }],
                })
              }
            >
              {ar ? "+ إضافة صف" : "+ Add row"}
            </button>
          </div>
          {(block.rows || []).map((row, index) => (
            <div key={`${row.label}-${index}`} className="grid grid-cols-2 gap-2">
              <input
                className={inputClass}
                value={row.label}
                placeholder={ar ? "عنوان الحقل" : "Field label"}
                onChange={(e) => {
                  const rows = [...(block.rows || [])];
                  rows[index] = { ...rows[index], label: e.target.value };
                  onChange({ rows });
                }}
              />
              <input
                className={inputClass}
                value={row.value}
                placeholder={ar ? "القيمة أو المتغير" : "Value"}
                onChange={(e) => {
                  const rows = [...(block.rows || [])];
                  rows[index] = { ...rows[index], value: e.target.value };
                  onChange({ rows });
                }}
              />
            </div>
          ))}
        </div>
      )}

      {/* Text Alignment */}
      {(block.type === "heading" ||
        block.type === "paragraph" ||
        block.type === "button" ||
        block.type === "image") && (
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
            {ar ? "المحاذاة" : "Alignment"}
          </label>
          <div className="flex gap-1.5">
            {(["right", "center", "left"] as const).map((align) => (
              <button
                key={align}
                type="button"
                onClick={() => onChange({ align })}
                className={`p-2 rounded-xl border flex-1 flex justify-center transition-colors ${
                  block.align === align
                    ? "border-admin-btn-secondary-border bg-secondary/10 text-secondary"
                    : "border-border bg-background/40 text-muted-foreground hover:text-slate-200"
                }`}
              >
                {align === "right" ? (
                  <AlignRight size={16} />
                ) : align === "center" ? (
                  <AlignCenter size={16} />
                ) : (
                  <AlignLeft size={16} />
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Text & Background Color Controls */}
      <div className='grid grid-cols-2 gap-3 pt-2 border-t border-border'>
        {(block.type === "heading" || block.type === "paragraph" || block.type === "button") && (
          <div>
            <label className="block text-[11px] font-semibold text-slate-300 mb-1">
              {ar ? "لون النص" : "Text color"}
            </label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                className="h-8 w-10 rounded-lg cursor-pointer bg-transparent border border-slate-700/60"
                value={block.color || "#122033"}
                onChange={(e) => onChange({ color: e.target.value })}
              />
              <span className="text-xs font-mono text-muted-foreground">{block.color || "#122033"}</span>
            </div>
          </div>
        )}

        {(block.type === "header" ||
          block.type === "button" ||
          block.type === "bookingTable" ||
          block.type === "footer" ||
          block.type === "divider") && (
          <div>
            <label className="block text-[11px] font-semibold text-slate-300 mb-1">
              {block.type === "divider"
                ? ar
                  ? "لون الفاصل"
                  : "Divider color"
                : ar
                  ? "لون الخلفية"
                  : "Background color"}
            </label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                className="h-8 w-10 rounded-lg cursor-pointer bg-transparent border border-slate-700/60"
                value={block.background || block.color || brand.button}
                onChange={(e) =>
                  onChange(
                    block.type === "divider"
                      ? { color: e.target.value }
                      : { background: e.target.value }
                  )
                }
              />
              <span className="text-xs font-mono text-muted-foreground">
                {block.background || block.color || brand.button}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Global Canvas & Card Color settings */}
      <div className='grid grid-cols-2 gap-3 pt-2 border-t border-border'>
        <div>
          <label className="block text-[11px] font-semibold text-slate-300 mb-1">
            {ar ? "خلفية الصفحة الخارجية" : "Canvas BG"}
          </label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              className="h-8 w-10 rounded-lg cursor-pointer bg-transparent border border-slate-700/60"
              value={canvasBg}
              onChange={(e) => onCanvas({ canvasBg: e.target.value, cardBg })}
            />
            <span className="text-xs font-mono text-muted-foreground">{canvasBg}</span>
          </div>
        </div>
        <div>
          <label className="block text-[11px] font-semibold text-slate-300 mb-1">
            {ar ? "خلفية بطاقة البريد" : "Card BG"}
          </label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              className="h-8 w-10 rounded-lg cursor-pointer bg-transparent border border-slate-700/60"
              value={cardBg}
              onChange={(e) => onCanvas({ canvasBg, cardBg: e.target.value })}
            />
            <span className="text-xs font-mono text-muted-foreground">{cardBg}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
