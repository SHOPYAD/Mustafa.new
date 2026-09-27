"use client";

import React from "react";
import { AlertTriangle, Trash2, X } from "lucide-react";

interface ConfirmDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isDestructive?: boolean;
}

export default function ConfirmDeleteModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = "حذف نهائياً",
  cancelLabel = "إلغاء التراجع",
  isDestructive = true,
}: ConfirmDeleteModalProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
      dir="rtl"
    >
      <div className="relative w-full max-w-md rounded-3xl border border-border bg-card p-6 shadow-2xl space-y-5 animate-in zoom-in-95 duration-200">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 left-5 p-1 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors cursor-pointer"
        >
          <X className="size-4" />
        </button>

        <div className="flex items-start gap-4">
          <div
            className={`p-3 rounded-2xl shrink-0 ${
              isDestructive
                ? "bg-red-500/10 text-red-600 dark:bg-red-950/30 dark:text-red-400 border border-red-500/20"
                : "bg-primary/10 text-primary border border-primary/20"
            }`}
          >
            {isDestructive ? <Trash2 className="size-6" /> : <AlertTriangle className="size-6" />}
          </div>

          <div className="space-y-1.5 pt-0.5">
            <h3 className="text-base font-black text-foreground">{title}</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">{description}</p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-border">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={`px-5 py-2 rounded-xl text-xs font-black transition-all shadow-md cursor-pointer flex items-center gap-1.5 ${
              isDestructive
                ? "bg-red-600 hover:bg-red-700 text-white shadow-red-600/20"
                : "bg-primary hover:bg-primary/90 text-primary-foreground shadow-primary/20"
            }`}
          >
            <Trash2 className="size-3.5" />
            <span>{confirmLabel}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
