"use client";

import { useCallback, useMemo } from "react";
import { sendToIframe } from "@/lib/visual-editor/protocol";
import { useBuilderStore } from "@/lib/builder/editor-store";

export type ResponsiveLayer = "desktop" | "tablet" | "mobile";

export interface ElementStyleApi {
  read: (prop: string) => string;
  readOverride: (prop: string) => string;
  readBase: (prop: string) => string;
  readComputed: (prop: string) => string;
  write: (prop: string, value: string) => void;
  writeBase: (prop: string, value: string) => void;
  layer: ResponsiveLayer;
  isInstanceScoped: boolean;
  hasAnyOverride: boolean;
  hasBaseOverride: (prop: string) => boolean;
  clearAll: () => void;
}

export function useElementStyle(): ElementStyleApi {
  const selectedElement = useBuilderStore((s) => s.selectedElement);
  const theme = useBuilderStore((s) => s.theme);
  const device = useBuilderStore((s) => s.device);
  const updateElementStyle = useBuilderStore((s) => s.updateElementStyle);
  const updateElementStyleResponsive = useBuilderStore((s) => s.updateElementStyleResponsive);
  const patchSelectedStyles = useBuilderStore((s) => s.patchSelectedStyles);
  const clearElementOverrides = useBuilderStore((s) => s.clearElementOverrides);

  const layer: ResponsiveLayer = device;
  const id = selectedElement?.id || "";
  const sectionInstanceId = selectedElement?.sectionInstanceId ?? null;
  const isInstanceScoped = Boolean(sectionInstanceId && !/-default$/.test(sectionInstanceId));

  const baseOverride: Record<string, unknown> = useMemo(() => {
    if (!id) return {};
    return (theme.elementOverrides?.[id] || {}) as Record<string, unknown>;
  }, [id, theme.elementOverrides]);

  const layerOverride: Record<string, unknown> = useMemo(() => {
    if (layer === "desktop") return baseOverride;
    const responsive = (baseOverride.responsive || {}) as Record<string, Record<string, unknown>>;
    return responsive[layer] || {};
  }, [baseOverride, layer]);

  const computed = selectedElement?.currentStyles || {};

  const hasAnyOverride = useMemo(() => {
    if (Object.keys(baseOverride).filter((k) => k !== "responsive").length > 0) return true;
    const r = (baseOverride.responsive || {}) as Record<string, Record<string, unknown>>;
    return Boolean(
      (r.tablet && Object.keys(r.tablet).length) || (r.mobile && Object.keys(r.mobile).length)
    );
  }, [baseOverride]);

  const read = useCallback(
    (prop: string): string => {
      if (layerOverride[prop] != null && layerOverride[prop] !== "") return String(layerOverride[prop]);
      if (baseOverride[prop] != null && baseOverride[prop] !== "") return String(baseOverride[prop]);
      const v = computed[prop];
      return typeof v === "string" ? v : "";
    },
    [layerOverride, baseOverride, computed]
  );

  const readOverride = useCallback(
    (prop: string): string => {
      const v = layerOverride[prop];
      return typeof v === "string" ? v : "";
    },
    [layerOverride]
  );

  const readBase = useCallback(
    (prop: string): string => {
      const v = baseOverride[prop];
      return typeof v === "string" ? v : "";
    },
    [baseOverride]
  );

  const readComputed = useCallback(
    (prop: string): string => {
      const v = computed[prop];
      return typeof v === "string" ? v : "";
    },
    [computed]
  );

  const hasBaseOverride = useCallback(
    (prop: string): boolean => Object.prototype.hasOwnProperty.call(baseOverride, prop),
    [baseOverride]
  );

  const pushStyle = (prop: string, value: string) => {
    const iframe = document.querySelector<HTMLIFrameElement>("[data-builder-preview='1']");
    sendToIframe(iframe, {
      type: "styleChange",
      id,
      prop,
      value,
      instanceId: sectionInstanceId || undefined,
    });
    /* Agent L2: live inspector bind */
    /* Agent E: settings panel + card design — never re-enter setSelectedElement */
    patchSelectedStyles({ [prop]: value });
  };

  const write = useCallback(
    (prop: string, value: string) => {
      if (!id) return;
      updateElementStyleResponsive(id, sectionInstanceId, layer, prop, value);
      pushStyle(prop, value);
    },
    [id, layer, sectionInstanceId, patchSelectedStyles, updateElementStyleResponsive]
  );

  const writeBase = useCallback(
    (prop: string, value: string) => {
      if (!id) return;
      updateElementStyle(id, sectionInstanceId, prop, value);
      pushStyle(prop, value);
    },
    [id, sectionInstanceId, patchSelectedStyles, updateElementStyle]
  );

  const clearAll = useCallback(() => {
    if (!id) return;
    clearElementOverrides(id);
  }, [clearElementOverrides, id]);

  return {
    read,
    readOverride,
    readBase,
    readComputed,
    write,
    writeBase,
    layer,
    isInstanceScoped,
    hasAnyOverride,
    hasBaseOverride,
    clearAll,
  };
}
