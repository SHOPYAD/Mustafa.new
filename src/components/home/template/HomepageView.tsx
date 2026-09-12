"use client";

import { useEffect, useState, Suspense, type CSSProperties } from "react";
import { useSearchParams } from "next/navigation";
import {
  cloneDraft,
  defaultHomepageDraft,
  type HomepageTemplateDraft,
} from "@/lib/visual-editor/schema";
import { isThemeUpdate, isVeTemplate, postToParent } from "@/lib/visual-editor/protocol";
import { applyBrandTheme, type BrandTheme } from "@/lib/theme/tokens";
import { applyElementOverridesToDocument } from "@/lib/visual-editor/live-bind";
import { RenderHomepageSection } from "./render-section";
import { ScrollLinkedBackdrop } from "./scroll-backdrop";
import { CommunityReelsSlider } from "@/components/home/CommunityReelsSlider";
import { CommunityStoriesSlider } from "@/components/home/CommunityStoriesSlider";
import "./service-cards.css";

type HomepageViewProps = {
  initialDraft: HomepageTemplateDraft;
};

function HomepageViewInner({ initialDraft }: HomepageViewProps) {
  const searchParams = useSearchParams();
  const editorMode =
    searchParams.get("editor") === "1" ||
    searchParams.get("editor") === "true" ||
    searchParams.get("builder") === "1" ||
    searchParams.get("builder") === "true";
  const [draft, setDraft] = useState<HomepageTemplateDraft>(initialDraft);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    if (!editorMode) return;
    postToParent({ type: "alrayyan-ve-ready" });
    postToParent({ type: "builderReady" });
    const onMessage = (e: MessageEvent) => {
      if (e.origin !== window.location.origin) return;
      if (isVeTemplate(e.data)) {
        setDraft(cloneDraft(e.data.draft));
      } else if (isThemeUpdate(e.data)) {
        if (e.data.theme?.layout) setDraft(cloneDraft(e.data.theme));
        const brand = (e.data as { brandTheme?: BrandTheme }).brandTheme;
        if (brand?.colors) applyBrandTheme(brand);
      }
    };
    const onSelect = (e: Event) => {
      const detail = (e as CustomEvent<{ instanceId?: string }>).detail;
      setSelectedId(detail?.instanceId || null);
    };
    const onSettings = (e: Event) => {
      const detail = (e as CustomEvent<{
        instanceId?: string;
        settings?: Record<string, string | number | boolean>;
      }>).detail;
      if (!detail?.instanceId || !detail.settings) return;
      setDraft((prev) => ({
        ...prev,
        layout: prev.layout.map((item) =>
          item.instanceId === detail.instanceId
            ? { ...item, settings: { ...item.settings, ...detail.settings } }
            : item
        ),
      }));
    };
    const onMove = (e: Event) => {
      const detail = (e as CustomEvent<{
        instanceId?: string;
        targetInstanceId?: string;
        position?: "before" | "after";
      }>).detail;
      if (!detail?.instanceId || !detail.targetInstanceId) return;
      setDraft((prev) => {
        const list = [...prev.layout];
        const from = list.findIndex((item) => item.instanceId === detail.instanceId);
        const to = list.findIndex((item) => item.instanceId === detail.targetInstanceId);
        if (from < 0 || to < 0 || from === to) return prev;
        const [moved] = list.splice(from, 1);
        if (!moved) return prev;
        const targetNow = list.findIndex((item) => item.instanceId === detail.targetInstanceId);
        const insertAt = detail.position === "after" ? targetNow + 1 : targetNow;
        list.splice(insertAt, 0, moved);
        return { ...prev, layout: list };
      });
    };
    window.addEventListener("message", onMessage);
    window.addEventListener("alrayyan:ve-section-selected", onSelect);
    window.addEventListener("alrayyan:section-move", onMove);
    window.addEventListener("alrayyan:ve-settings", onSettings);
    return () => {
      window.removeEventListener("message", onMessage);
      window.removeEventListener("alrayyan:ve-section-selected", onSelect);
      window.removeEventListener("alrayyan:section-move", onMove);
      window.removeEventListener("alrayyan:ve-settings", onSettings);
    };
  }, [editorMode]);

  useEffect(() => {
    if (editorMode) return;
    let cancelled = false;
    void fetch("/api/homepage-template", { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled && data?.draft) setDraft(data.draft);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [editorMode]);

  useEffect(() => {
    /* Agent L2: live inspector bind */
    applyElementOverridesToDocument(document, draft.elementOverrides);
  }, [draft]);

  const navy = draft.global.navy || "var(--brand-header)";
  const emerald = draft.global.emerald || "var(--brand-primary)";
  const heroHasSearch = draft.layout.some(
    (item) => item.type === "hero" && !item.hidden && item.settings.showSearch !== false
  );

  return (
    <div
      className="alrayyan-home relative isolate"
      style={
        {
          "--alrayyan-navy": navy,
          "--alrayyan-emerald": emerald,
        } as CSSProperties
      }
    >
      <ScrollLinkedBackdrop layout={draft.layout.filter((item) => !item.hidden || editorMode)} />
      <div className="relative z-10">
      {draft.layout.map((instance, idx) => {
        if (instance.hidden && !editorMode) return null;
        if (instance.type === "search" && heroHasSearch) return null;

        // Position 1: Video Reels slider directly below Hero/Search
        const isHeroOrSearch = instance.type === "hero" || (instance.type === "search" && !heroHasSearch);
        const nextInstance = draft.layout[idx + 1];
        const isNextSearch = nextInstance && nextInstance.type === "search" && !heroHasSearch;
        const renderReelsAfterThis = isHeroOrSearch && !isNextSearch;

        // Position 2: Community Stories slider in mid-page (rendered only once after hotels, packages, or index 4)
        const firstStoriesTargetIdx = draft.layout.findIndex(
          (l) => (!l.hidden || editorMode) && (l.type === "hotels" || l.type === "packages")
        );
        const storiesSlotIdx = firstStoriesTargetIdx !== -1 ? firstStoriesTargetIdx : 4;
        const renderStoriesAfterThis = idx === storiesSlotIdx;

        return (
          <div key={instance.instanceId}>
            <RenderHomepageSection
              instance={instance}
              editorMode={editorMode}
              selectedId={selectedId}
            />
            {renderReelsAfterThis && <CommunityReelsSlider />}
            {renderStoriesAfterThis && <CommunityStoriesSlider />}
          </div>
        );
      })}
      </div>
    </div>
  );
}

export default function HomepageView({ initialDraft }: HomepageViewProps) {
  return (
    <Suspense fallback={<HomepageViewInner initialDraft={initialDraft || defaultHomepageDraft()} />}>
      <HomepageViewInner initialDraft={initialDraft || defaultHomepageDraft()} />
    </Suspense>
  );
}
