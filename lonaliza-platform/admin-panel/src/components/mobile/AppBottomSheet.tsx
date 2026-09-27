"use client";

import { useEffect, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { cn } from "@/lib/utils";

type AppBottomSheetProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
};

export default function AppBottomSheet({ open, onClose, title, children }: AppBottomSheetProps) {
  const { dir } = useLocale();

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <div className="fixed inset-0 z-[80]" dir={dir} role="dialog" aria-modal="true" aria-label={title}>
      <button
        type="button"
        className="absolute inset-0 bg-slate-950/45"
        aria-label="Close"
        onClick={onClose}
      />
      <div className="absolute inset-x-0 bottom-0 max-h-[82vh] overflow-hidden rounded-t-[28px] bg-white shadow-[0_-18px_50px_rgba(46,16,101,0.18)]">
        <div className="flex items-center gap-3 px-4 pb-2 pt-3">
          <div className="mx-auto h-1 w-10 rounded-full bg-slate-200" aria-hidden />
        </div>
        <div className="flex items-center justify-between gap-3 px-4 pb-3">
          <h2 className="text-[16px] font-black text-[#2E1065]">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-slate-600"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>
        <div className={cn("overflow-y-auto px-3 pb-[max(1.25rem,env(safe-area-inset-bottom))]")}>{children}</div>
      </div>
    </div>,
    document.body
  );
}
