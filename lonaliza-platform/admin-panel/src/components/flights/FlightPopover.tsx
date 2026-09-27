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

    const visualBox = () => {
      const vv = window.visualViewport;
      if (vv) {
        return { top: vv.offsetTop, left: vv.offsetLeft, width: vv.width, height: vv.height };
      }
      return { top: 0, left: 0, width: window.innerWidth, height: window.innerHeight };
    };

    const place = () => {
      const anchor = anchorRef.current;
      if (!anchor) return;
      const rect = anchor.getBoundingClientRect();
      const vp = visualBox();
      const pad = 10;
      const panel = panelRef.current;
      const desired =
        size === "wide"
          ? Math.min(vp.width - pad * 2, vp.width >= 768 ? 880 : Math.max(280, vp.width - pad * 2))
          : Math.min(vp.width - pad * 2, Math.max(rect.width, Math.min(minWidth, vp.width - pad * 2)));
      const width = Math.max(200, desired);
      const measured = panel?.scrollHeight || (size === "wide" ? 520 : 280);
      const spaceBelow = vp.top + vp.height - rect.bottom - pad;
      const spaceAbove = rect.top - vp.top - pad;
      const minPanel = size === "wide" ? 280 : 160;
      const openUp = spaceBelow < Math.min(measured, 200) && spaceAbove > spaceBelow;
      const available = Math.max(openUp ? spaceAbove : spaceBelow, 120);
      const maxHeight = Math.min(Math.max(minPanel, available), measured > 0 ? Math.max(measured, minPanel) : available);
      const usedH = Math.min(measured, maxHeight);
      let top = openUp ? rect.top - usedH - 8 : rect.bottom + 8;
      top = Math.max(vp.top + pad, Math.min(top, vp.top + vp.height - Math.min(usedH, maxHeight) - pad));
      let left = dir === "rtl" ? rect.right - width : rect.left;
      left = Math.max(vp.left + pad, Math.min(left, vp.left + vp.width - width - pad));
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
    const vv = window.visualViewport;
    vv?.addEventListener("resize", place);
    vv?.addEventListener("scroll", place);
    return () => {
      window.cancelAnimationFrame(again);
      window.removeEventListener("resize", place);
      window.removeEventListener("scroll", place, true);
      vv?.removeEventListener("resize", place);
      vv?.removeEventListener("scroll", place);
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
