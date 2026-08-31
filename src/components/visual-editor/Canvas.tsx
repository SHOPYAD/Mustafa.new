"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import {
  isVeReady,
  isVeSelection,
  isVeTextCommit,
  postToIframe,
} from "@/lib/visual-editor/protocol";
import { useVisualEditor } from "./context";

const PREVIEW = "/?preview=1&editor=1";

export function Canvas() {
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const { draft, locale, device, setSelection, updateText } = useVisualEditor();

  useEffect(() => {
    const onMessage = (e: MessageEvent) => {
      if (e.origin !== window.location.origin) return;
      if (isVeReady(e.data)) {
        postToIframe(iframeRef.current, { type: "alrayyan-ve-template", draft, locale });
      }
      if (isVeSelection(e.data)) {
        setSelection({
          instanceId: e.data.instanceId,
          sectionType: e.data.sectionType,
          field: e.data.field,
          text: e.data.text,
          labelAr: e.data.labelAr,
          labelEn: e.data.labelEn,
          labelTr: e.data.labelTr,
        });
      }
      if (isVeTextCommit(e.data)) {
        updateText(e.data.instanceId, e.data.field, e.data.locale, e.data.value);
      }
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [draft, locale, setSelection, updateText]);

  useEffect(() => {
    postToIframe(iframeRef.current, { type: "alrayyan-ve-template", draft, locale });
  }, [draft, locale]);

  const width =
    device === "mobile" ? 390 : device === "tablet" ? 768 : "100%";

  return (
    <div className="flex-1 min-w-0 min-h-0 bg-slate-950/80 p-3 flex justify-center">
      <div
        className={cn(
          "h-full bg-white overflow-hidden shadow-2xl border border-white/10",
          device === "desktop" ? "w-full rounded-xl" : "rounded-[1.75rem]"
        )}
        style={{ width, maxWidth: "100%" }}
      >
        <iframe
          key={locale}
          ref={iframeRef}
          title="Alrayyan homepage canvas"
          src={`${PREVIEW}&hl=${locale}`}
          className="w-full h-full border-0 bg-white"
        />
      </div>
    </div>
  );
}
