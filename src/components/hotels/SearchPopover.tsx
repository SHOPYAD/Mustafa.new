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

const PANEL_ATTR = "data-hotel-search-popover";

export function isHotelSearchPopoverTarget(target: EventTarget | null): boolean {
  return target instanceof Element && Boolean(target.closest(`[${PANEL_ATTR}]`));
}

export default function SearchPopover({
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
      const pad = 10;
      const panel = panelRef.current;
      const desired =
        size === "wide"
          ? Math.min(vw - pad * 2, vw >= 768 ? 736 : 360)
          : Math.min(vw - pad * 2, Math.max(rect.width, minWidth));
      const width = Math.max(200, desired);
      const measured = panel?.scrollHeight || (size === "wide" ? 420 : 280);
      const spaceBelow = vh - rect.bottom - pad;
      const spaceAbove = rect.top - pad;
      const openUp = spaceBelow < Math.min(measured, 320) && spaceAbove > spaceBelow;
      const maxHeight = Math.max(200, openUp ? spaceAbove : Math.max(spaceBelow, 240));
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
    const frame = window.requestAnimationFrame(place);
    const late = window.setTimeout(place, 40);
    const panel = panelRef.current;
    const observer = panel ? new ResizeObserver(place) : null;
    if (panel) observer?.observe(panel);
    window.addEventListener("resize", place);
    window.addEventListener("scroll", place, true);
    return () => {
      window.cancelAnimationFrame(frame);
      window.clearTimeout(late);
      observer?.disconnect();
      window.removeEventListener("resize", place);
      window.removeEventListener("scroll", place, true);
    };
  }, [open, mounted, anchorRef, size, minWidth, dir]);

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
    <div
      ref={panelRef}
      data-hotel-search-popover=""
      role="dialog"
      dir={dir}
      className={cn(
        "fixed z-[220] overflow-auto rounded-2xl border border-slate-200 bg-white shadow-[0_24px_64px_rgba(5,23,65,0.22)]",
        className
      )}
      style={{
        top: box.top,
        left: box.left,
        width: box.width,
        maxHeight: box.maxHeight,
      }}
    >
      {children}
    </div>,
    document.body
  );
}
