"use client";

/* Agent C: copilot pipeline */

import type { HomepageSectionInstance } from "@/lib/visual-editor/schema";
import { EditableText, SectionFrame } from "../primitives";
import { InteractiveHeading, ServiceSurface, serviceTitleClass, serviceTitleStyle } from "../surfaces";

type SectionProps = {
  instance: HomepageSectionInstance;
  editorMode: boolean;
  selectedId?: string | null;
};

function sanitizeHtml(raw: string): string {
  return raw
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, "")
    .replace(/on\w+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, "")
    .replace(/javascript:/gi, "")
    .replace(/<iframe[\s\S]*?>[\s\S]*?<\/iframe>/gi, "");
}

export function CopilotCustomSection({ instance, editorMode, selectedId }: SectionProps) {
  const html = typeof instance.settings.html === "string" ? instance.settings.html : "";
  const css = typeof instance.settings.css === "string" ? instance.settings.css : "";
  const slug = typeof instance.settings.copilotSlug === "string" ? instance.settings.copilotSlug : "custom";

  if (html.trim()) {
    return (
      <SectionFrame instance={instance} editorMode={editorMode} selectedId={selectedId}>
        {css.trim() ? <style data-copilot-section={slug}>{css}</style> : null}
        <div
          className="copilot-live-root"
          data-copilot-slug={slug}
          dangerouslySetInnerHTML={{ __html: sanitizeHtml(html) }}
        />
      </SectionFrame>
    );
  }

  return (
    <SectionFrame instance={instance} editorMode={editorMode} selectedId={selectedId}>
      <ServiceSurface kind="neutral">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <h2 className={serviceTitleClass("neutral")} style={serviceTitleStyle("neutral")}>
            <InteractiveHeading>
              <EditableText instance={instance} field="title" editorMode={editorMode} as="span" />
            </InteractiveHeading>
          </h2>
          <p className="mt-3 max-w-2xl text-slate-600">
            <EditableText instance={instance} field="subtitle" editorMode={editorMode} as="span" />
          </p>
        </div>
      </ServiceSurface>
    </SectionFrame>
  );
}
