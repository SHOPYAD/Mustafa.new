"use client";

import { Check, Loader2, Send, Undo2, X } from "lucide-react";
import type { ApprovalRecord } from "@/lib/automation/approval";

export function ApprovalToolbar({
  record,
  busy,
  notes,
  onNotes,
  onSubmit,
  onApprove,
  onReject,
  onRevise,
  onDelete,
}: {
  record: ApprovalRecord | null;
  busy: boolean;
  notes: string;
  onNotes: (value: string) => void;
  onSubmit: () => void;
  onApprove: () => void;
  onReject: () => void;
  onRevise: () => void;
  onDelete?: () => void;
}) {
  if (!record) return null;
  const draft = record.state === "draft";
  const pending = record.state === "awaiting_approval";
  const closed = record.state === "active" || record.state === "rejected";

  return (
    <div className="space-y-3">
      {record.state !== "active" ? (
        <textarea
          value={notes}
          dir="auto"
          rows={2}
          onChange={(e) => onNotes(e.target.value)}
          placeholder="ملاحظات الاعتماد أو التعديل أو سبب الرفض…"
          className='w-full resize-none rounded-xl border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-border/40'
        />
      ) : null}
      <div className="flex flex-wrap items-center gap-2">
        {draft ? (
          <button
            type="button"
            disabled={busy}
            onClick={onSubmit}
            className='inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-admin-btn-primary-bg via-[#3b0764] to-admin-btn-primary-hover px-4 py-2 text-sm font-bold text-secondary hover:text-muted-foreground disabled:opacity-40 transition-colors shadow-sm'
          >
            {busy ? <Loader2 className='size-4 animate-spin text-secondary' /> : <Send className='size-4 text-secondary' />}
            أرسل للاعتماد
          </button>
        ) : null}
        {pending ? (
          <>
            <button
              type="button"
              disabled={busy}
              onClick={onApprove}
              className='inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-admin-btn-primary-bg via-[#3b0764] to-admin-btn-primary-hover px-4 py-2 text-sm font-bold text-secondary hover:text-muted-foreground disabled:opacity-40 transition-colors shadow-sm'
            >
              {busy ? <Loader2 className='size-4 animate-spin text-secondary' /> : <Check className='size-4 text-secondary' />}
              اعتماد / أطلق
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={onReject}
              className="inline-flex items-center gap-2 rounded-xl border border-rose-400/40 bg-rose-500/10 px-4 py-2 text-sm font-semibold text-rose-700 hover:bg-rose-500/20 dark:text-rose-200 disabled:opacity-40"
            >
              <X className="size-4" />
              ارفض
            </button>
          </>
        ) : null}
        {!closed || record.state === "rejected" ? (
          <button
            type="button"
            disabled={busy || record.state === "active"}
            onClick={onRevise}
            className="inline-flex items-center gap-2 rounded-xl border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-secondary disabled:opacity-40"
          >
            <Undo2 className="size-4" />
            عدّل
          </button>
        ) : null}
        <button
          type="button"
          disabled={busy}
          onClick={onDelete}
          className="inline-flex items-center gap-1.5 rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-500/20 dark:text-rose-300 disabled:opacity-40 transition-colors"
        >
          <X className="size-3.5" />
          حذف المسودة
        </button>
      </div>
    </div>
  );
}
