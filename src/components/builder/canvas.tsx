"use client";

/* Agent A: editor chrome only */

import { useEffect, useMemo, useRef, useState } from "react";
import { DeviceFrame } from "./device-frame";
import { useBuilderStore } from "@/lib/builder/editor-store";
import {
  sendToIframe,
  subscribeIframeMessages,
} from "@/lib/visual-editor/protocol";
import { isHomepageSectionType } from "@/lib/visual-editor/schema";
import { injectOverlayIntoIframe } from "@/lib/visual-editor/iframe-overlay";
import {
  inferFieldFromBuilderId,
  nearestTextField,
} from "@/lib/visual-editor/live-bind";
import {
  builderCanvasSrc,
  findEditorPage,
  type EditorPagesData,
} from "@/lib/builder-pages";
import { isInspectorInteracting } from "@/lib/builder/inspector-stay-open";

export function Canvas() {
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const device = useBuilderStore((s) => s.device);
  const theme = useBuilderStore((s) => s.theme);
  const locale = useBuilderStore((s) => s.locale);
  const activePage = useBuilderStore((s) => s.activePage);
  const pageOptions = useBuilderStore((s) => s.pageOptions);
  const editorPages = useBuilderStore((s) => s.editorPages);
  const applyEditorPagesData = useBuilderStore((s) => s.applyEditorPagesData);
  const setActivePage = useBuilderStore((s) => s.setActivePage);
  const setIframeReady = useBuilderStore((s) => s.setIframeReady);
  const setSelectedElement = useBuilderStore((s) => s.setSelectedElement);
  const reorderSection = useBuilderStore((s) => s.reorderSection);
  const duplicateSection = useBuilderStore((s) => s.duplicateSection);
  const removeSection = useBuilderStore((s) => s.removeSection);
  const hideSection = useBuilderStore((s) => s.hideSection);
  const addSection = useBuilderStore((s) => s.addSection);
  const copySection = useBuilderStore((s) => s.copySection);
  const pasteSection = useBuilderStore((s) => s.pasteSection);
  const setElementContent = useBuilderStore((s) => s.setElementContent);
  const updateSectionSettings = useBuilderStore((s) => s.updateSectionSettings);
  const setActivePanel = useBuilderStore((s) => s.setActivePanel);
  const setRightDockCollapsed = useBuilderStore((s) => s.setRightDockCollapsed);

  useEffect(() => {
    let cancelled = false;
    void fetch("/api/admin/builder-pages", { credentials: "same-origin", cache: "no-store" })
      .then((res) => res.json())
      .then((data: { ok?: boolean } & Partial<EditorPagesData>) => {
        if (cancelled || !data?.ok || !Array.isArray(data.pages)) return;
        applyEditorPagesData(data);
        const wanted =
          typeof window !== "undefined"
            ? new URLSearchParams(window.location.search).get("page")
            : null;
        if (wanted && findEditorPage(data.pages, wanted)) {
          setActivePage(wanted);
        }
      })
      .catch(() => {
        /* keep builtin registry */
      });
    return () => {
      cancelled = true;
    };
  }, [applyEditorPagesData, setActivePage]);

  const [canvasEpoch, setCanvasEpoch] = useState(0);

  const canvasSrc = useMemo(() => {
    const page = findEditorPage(editorPages.pages, activePage);
    const option = pageOptions.find((entry) => entry.value === activePage) || pageOptions[0];
    const isApp = device === "mobile" || (typeof window !== "undefined" && window.location.pathname.includes("mobile-app-editor"));
    return builderCanvasSrc(page?.path || option?.routePath || "/", locale, isApp);
  }, [activePage, device, editorPages.pages, locale, pageOptions]);

  useEffect(() => {
    const onRefresh = () => setCanvasEpoch((n) => n + 1);
    window.addEventListener("alrayyan:builder-refresh", onRefresh);
    return () => window.removeEventListener("alrayyan:builder-refresh", onRefresh);
  }, []);

  useEffect(() => {
    setIframeReady(false);
  }, [activePage, setIframeReady]);

  useEffect(() => {
    sendToIframe(iframeRef.current, { type: "themeUpdate", theme, locale });
    sendToIframe(iframeRef.current, {
      type: "alrayyan-ve-template",
      draft: theme,
      locale,
    });
    sendToIframe(iframeRef.current, {
      type: "localeUpdate",
      locale,
      dir: locale === "ar" ? "rtl" : "ltr",
    });
    /* Agent E: settings panel + card design */
    const selected = useBuilderStore.getState().selectedElement;
    if (selected?.sectionInstanceId && !isInspectorInteracting()) {
      window.setTimeout(() => {
        const still = useBuilderStore.getState().selectedElement;
        if (!still?.sectionInstanceId) return;
        sendToIframe(iframeRef.current, {
          type: "selectElement",
          id: still.id,
          instanceId: still.sectionInstanceId,
        });
      }, 80);
    }
  }, [theme, locale]);

  useEffect(() => {
    sendToIframe(iframeRef.current, { type: "deviceChange", device });
  }, [device]);

  useEffect(() => {
    const onEdge = (e: MessageEvent) => {
      const d = e.data;
      if (!d || d.type !== "sectionDragEdge") return;
      const wrap = document.getElementById("canvas-wrap");
      const target = wrap?.closest("[data-builder-canvas-scroll]") || wrap?.parentElement;
      const speed = Math.max(2, Math.min(40, Number(d.speed) || 8));
      const delta = d.direction === "up" ? -speed : speed;
      if (target instanceof HTMLElement) target.scrollBy(0, delta);
    };
    window.addEventListener("message", onEdge);
    return () => window.removeEventListener("message", onEdge);
  }, []);

  useEffect(() => {
    /* Agent L2: live inspector bind */
    let lastValidSelectAt = 0;
    return subscribeIframeMessages((msg) => {
      if (msg.type === "builderReady" || msg.type === "alrayyan-ve-ready") {
        setIframeReady(true);
        const state = useBuilderStore.getState();
        sendToIframe(iframeRef.current, {
          type: "themeUpdate",
          theme: state.theme,
          locale: state.locale,
        });
        sendToIframe(iframeRef.current, {
          type: "alrayyan-ve-template",
          draft: state.theme,
          locale: state.locale,
        });
        return;
      }
      /* Agent E: settings panel + card design */
      if (msg.type === "alrayyan-ve-select") {
        const cur = useBuilderStore.getState().selectedElement;
        if (isInspectorInteracting() && cur?.sectionInstanceId === msg.instanceId) return;
        lastValidSelectAt = Date.now();
        setSelectedElement({
          id: msg.field ? `${msg.instanceId}.${msg.field}` : msg.instanceId,
          sectionInstanceId: msg.instanceId,
          sectionType: msg.sectionType,
          text: msg.text,
          field: msg.field,
          label: msg.labelAr,
          src: msg.src,
          tagName: msg.tagName,
          currentStyles: msg.currentStyles,
        });
        return;
      }
      if (msg.type === "elementSelected") {
        const incomingId = msg.id || msg.sectionInstanceId || msg.instanceId || "";
        const incomingInstance = msg.sectionInstanceId || msg.instanceId || "";
        const cur = useBuilderStore.getState().selectedElement;
        if (!incomingId) {
          /* Agent L2: live inspector bind — ignore stale empty clears */
          if (isInspectorInteracting()) return;
          if (cur && Date.now() - lastValidSelectAt < 240) return;
          setSelectedElement(null);
          return;
        }
        if (
          isInspectorInteracting() &&
          cur &&
          (cur.id === incomingId || cur.sectionInstanceId === incomingInstance)
        ) {
          return;
        }
        const sectionType = msg.sectionType || msg.sectionKey || null;
        const typed = sectionType && isHomepageSectionType(sectionType) ? sectionType : null;
        const state = useBuilderStore.getState();
        const section = incomingInstance
          ? state.theme.layout.find((item) => item.instanceId === incomingInstance)
          : undefined;
        let field =
          msg.field || inferFieldFromBuilderId(incomingId, incomingInstance);
        if (!field && section) {
          field = nearestTextField(section, msg.text, state.locale);
        }
        lastValidSelectAt = Date.now();
        setSelectedElement({
          id: incomingId,
          sectionInstanceId: incomingInstance || null,
          sectionType: typed || section?.type || null,
          text: msg.text,
          tagName: msg.tagName || msg.tag,
          label: msg.label || field || undefined,
          src: msg.src,
          field,
          currentStyles: msg.currentStyles,
          isInsideButton: Boolean((msg as { isInsideButton?: boolean }).isInsideButton),
        });
        return;
      }
      if (msg.type === "alrayyan-ve-text" || msg.type === "inlineEditCommit") {
        const instanceId =
          msg.type === "alrayyan-ve-text" ? msg.instanceId : msg.instanceId || "";
        const field = msg.type === "alrayyan-ve-text" ? msg.field : msg.field || "title";
        const value = msg.type === "alrayyan-ve-text" ? msg.value : msg.plainText;
        const loc = msg.type === "alrayyan-ve-text" ? msg.locale : useBuilderStore.getState().locale;
        if (instanceId && field) {
          setElementContent(instanceId, field, loc, value);
          if (/LogosJson$/.test(field) || field === "heroPackagesJson") {
            updateSectionSettings(instanceId, { [field]: value });
          }
        }
        return;
      }
      const applyMove = (
        instanceId: string,
        targetInstanceId: string,
        position: "before" | "after"
      ) => {
        const list = useBuilderStore.getState().theme.layout;
        const idx = list.findIndex((item) => item.instanceId === instanceId);
        const targetIdx = list.findIndex((item) => item.instanceId === targetInstanceId);
        if (targetIdx < 0 || idx < 0) return;
        let nextIdx = targetIdx + (position === "after" ? 1 : 0);
        if (idx < nextIdx) nextIdx -= 1;
        if (nextIdx === idx) return;
        reorderSection(instanceId, nextIdx);
      };

      if (msg.type === "section-move") {
        if (msg.instanceId && msg.targetInstanceId) {
          applyMove(msg.instanceId, msg.targetInstanceId, msg.position);
          window.dispatchEvent(new CustomEvent("alrayyan:builder-autosave-draft"));
        }
        return;
      }

      if (msg.type === "sectionAction") {
        const state = useBuilderStore.getState();
        const list = state.theme.layout;
        const idx = list.findIndex((item) => item.instanceId === msg.instanceId);
        switch (msg.action) {
          case "moveUp":
            if (idx > 0) reorderSection(msg.instanceId, idx - 1);
            break;
          case "moveDown":
            if (idx >= 0 && idx < list.length - 1) reorderSection(msg.instanceId, idx + 1);
            break;
          case "duplicate":
            duplicateSection(msg.instanceId);
            break;
          case "delete":
            removeSection(msg.instanceId);
            break;
          case "toggleVisibility": {
            const cur = idx >= 0 ? list[idx]?.hidden : false;
            hideSection(msg.instanceId, !cur);
            break;
          }
          case "addAfter":
            if (msg.sectionType && isHomepageSectionType(msg.sectionType)) {
              addSection(msg.sectionType, msg.instanceId);
            }
            break;
          case "move": {
            if (!msg.targetInstanceId) return;
            applyMove(msg.instanceId, msg.targetInstanceId, msg.position || "after");
            break;
          }
          case "copy":
            copySection(msg.instanceId);
            break;
          case "paste":
            pasteSection(msg.instanceId);
            break;
          case "settings": {
            const item = idx >= 0 ? list[idx] : null;
            if (item) {
              const field = nearestTextField(item, undefined, state.locale);
              lastValidSelectAt = Date.now();
              setSelectedElement({
                id: field ? `${item.instanceId}.${field}` : item.instanceId,
                sectionInstanceId: item.instanceId,
                sectionType: item.type,
                label: item.type,
                field,
                text: field ? (item.texts[field] as Record<string, string | undefined>)?.[state.locale] : undefined,
              });
            }
            setActivePanel("design");
            setRightDockCollapsed(false);
            break;
          }
          default: {
            const _never: never = msg.action;
            return _never;
          }
        }
        if (msg.action !== "settings" && msg.action !== "copy") {
          window.dispatchEvent(new CustomEvent("alrayyan:builder-autosave-draft"));
        }
        const next = useBuilderStore.getState();
        const selectedId = next.selectedElement?.sectionInstanceId;
        if (selectedId) {
          window.setTimeout(() => {
            sendToIframe(iframeRef.current, {
              type: "selectElement",
              id: selectedId,
              instanceId: selectedId,
            });
          }, 60);
        }
      }
    });
  }, [
    addSection,
    copySection,
    duplicateSection,
    hideSection,
    pasteSection,
    removeSection,
    reorderSection,
    setActivePanel,
    setElementContent,
    updateSectionSettings,
    setIframeReady,
    setRightDockCollapsed,
    setSelectedElement,
  ]);

  return (
    <div id="canvas-wrap" className="ed-canvas-workspace flex-1 min-h-0">
      <DeviceFrame device={device}>
        <iframe
          key={`${activePage}-${locale}-${canvasEpoch}`}
          ref={iframeRef}
          data-builder-preview="1"
          title="Lonaliza builder canvas"
          src={canvasSrc}
          className="h-full min-h-[960px] w-full border-0 bg-white"
          onLoad={() => {
            injectOverlayIntoIframe(iframeRef.current);
          }}
        />
      </DeviceFrame>
    </div>
  );
}
