"use client";

import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";

type Props = {
  open: boolean;
  anchorRef: RefObject<HTMLElement | null>;
  onClose: () => void;
  children: ReactNode;
  size?: "field" | "wide";
  minWidth?: number;
  className?: string;
  dir?: "ltr" | "rtl";
};

const PANEL_ATTR = "data-flight-search-popover";

export function isFlightPopoverTarget(target: EventTarget | null): boolean {
  return target instanceof Element && Boolean(target.closest(`[${PANEL_ATTR}]`));
}

export default function FlightPopover({
  open,
  anchorRef,
  onClose,
  children,
  size = "field",
  minWidth = 288,
  className,
  dir = "ltr",
}: Props) {
  const panelRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  const [box, setBox] = useState({ top: 8, left: 8, width: 320, maxHeight: 420 });

  useEffect(() => {
    setMounted(true);
  }, []);

  useLayoutEffect(() => {
    if (!open || !mounted) return;

    const place = () => {
      const anchor = anchorRef.current;
      if (!anchor) return;
      const rect = anchor.getBoundingClientRect();
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const pad = 12;
      const panel = panelRef.current;
      const desired =
        size === "wide"
          ? Math.min(vw - pad * 2, vw >= 768 ? 880 : Math.max(320, vw - pad * 2))
          : Math.min(vw - pad * 2, Math.max(rect.width, minWidth));
      const width = Math.max(220, desired);
      const measured = panel?.scrollHeight || (size === "wide" ? 520 : 280);
      const spaceBelow = vh - rect.bottom - pad;
      const spaceAbove = rect.top - pad;
      const minPanel = size === "wide" ? 380 : 240;
      const openUp = spaceBelow < Math.min(measured, minPanel) && spaceAbove > spaceBelow;
      const maxHeight = Math.max(
        minPanel,
        openUp ? spaceAbove : Math.max(spaceBelow, size === "wide" ? 420 : 280)
      );
      const usedH = Math.min(measured, maxHeight);
      let top = openUp ? rect.top - usedH - 8 : rect.bottom + 8;
      top = Math.max(pad, Math.min(top, vh - Math.min(usedH, maxHeight) - pad));
      let left = dir === "rtl" ? rect.right - width : rect.left;
      left = Math.max(pad, Math.min(left, vw - width - pad));
      setBox((prev) =>
        prev.top === top &&
        prev.left === left &&
        prev.width === width &&
        prev.maxHeight === maxHeight
          ? prev
          : { top, left, width, maxHeight }
      );
    };

    place();
    const again = window.requestAnimationFrame(place);
    window.addEventListener("resize", place);
    window.addEventListener("scroll", place, true);
    return () => {
      window.cancelAnimationFrame(again);
      window.removeEventListener("resize", place);
      window.removeEventListener("scroll", place, true);
    };
  }, [open, mounted, anchorRef, dir, minWidth, size, children]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!mounted || !open) return null;

  return createPortal(
    <div className="fixed inset-0 z-[120]" data-flight-search-popover="">
      <button
        type="button"
        aria-label="Close"
        className="absolute inset-0 bg-transparent cursor-default"
        onClick={onClose}
      />
      <div
        ref={panelRef}
        dir={dir}
        style={{
          position: "fixed",
          top: box.top,
          left: box.left,
          width: box.width,
          maxHeight: box.maxHeight,
        }}
        className={cn(
          "overflow-auto rounded-2xl border border-purple-200/80 bg-white shadow-2xl shadow-purple-950/25",
          className
        )}
      >
        {children}
      </div>
    </div>,
    document.body
  );
}
