/* Agent C: copilot pipeline */

export type CopilotFsChangedFile = {
  path: string;
  action: "created" | "updated" | "deleted";
};

export type CopilotFsClientResult = {
  ok: boolean;
  error?: string;
  path?: string;
  content?: string;
  truncated?: boolean;
  files?: Array<{ path: string; type: "file" | "dir" }>;
  matches?: Array<{ path: string; line: number; text: string }>;
  changed?: CopilotFsChangedFile[];
  sources?: Array<{ type: string; labelAr: string; files: string[]; notes?: string }>;
  section?: {
    slug: string;
    titleAr: string;
    titleEn: string;
    titleTr: string;
    templatePath: string;
    cssPath: string;
    html: string;
    css: string;
  };
};

function emitChanged(changed?: CopilotFsChangedFile[]) {
  if (!changed?.length || typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent("alrayyan:copilot-files", { detail: { changed } }));
}

export async function callCopilotFs(body: Record<string, unknown>): Promise<CopilotFsClientResult> {
  const res = await fetch("/api/admin/copilot-fs", {
    method: "POST",
    credentials: "same-origin",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = (await res.json()) as CopilotFsClientResult;
  if (data.changed?.length) emitChanged(data.changed);
  return data;
}

export function formatFsResult(data: CopilotFsClientResult): string {
  if (!data.ok) return data.error || "File tool failed.";
  if (data.content != null) {
    const head = data.truncated ? `[truncated]\n` : "";
    return `${head}${data.path || ""}\n${data.content}`;
  }
  if (data.matches) {
    return data.matches.length
      ? data.matches.map((item) => `${item.path}:${item.line}: ${item.text}`).join("\n")
      : "No matches.";
  }
  if (data.sources) {
    return data.sources
      .map((item) => `${item.type} (${item.labelAr}): ${item.files.join(", ")}${item.notes ? ` — ${item.notes}` : ""}`)
      .join("\n");
  }
  if (data.files) {
    return data.files.map((item) => item.path).join("\n") || "No files.";
  }
  if (data.changed?.length) {
    return `Changed:\n${data.changed.map((item) => `${item.action} ${item.path}`).join("\n")}`;
  }
  if (data.section) {
    return `Created section ${data.section.slug}. Files: ${data.section.templatePath}, ${data.section.cssPath}. Add it with addSection type=copilot and settings.copilotSlug=${data.section.slug}.`;
  }
  return "OK";
}
