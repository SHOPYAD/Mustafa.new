export function formatInlineMarkdown(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\*\*(.*?)\*\*/g, '<strong class="font-black text-slate-900 dark:text-white">$1</strong>')
    .replace(/\*(.*?)\*/g, "<em>$1</em>")
    .replace(
      /\[(.*?)\]\((.*?)\)/g,
      '<a href="$2" class="text-emerald-700 dark:text-emerald-400 font-bold hover:underline" target="_blank" rel="noreferrer">$1</a>'
    )
    .replace(
      /`([^`]+)`/g,
      '<code class="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-mono text-xs text-cyan-600 dark:text-cyan-400">$1</code>'
    );
}

export function convertMarkdownToHtml(raw: string): string {
  if (!raw) return "";
  const hasMarkdown = /(^|\n)#{1,4}\s+|\*\*|\[.*\]\(.*\)|\n-\s+/m.test(raw);
  if (!hasMarkdown && /<\/?[a-z][\s\S]*>/i.test(raw)) {
    return raw;
  }

  const lines = raw.split(/\r?\n/);
  const htmlParts: string[] = [];
  let inList = false;
  let inTable = false;
  let tableHeaderDone = false;

  const closeList = () => {
    if (inList) {
      htmlParts.push("</ul>");
      inList = false;
    }
  };
  const closeTable = () => {
    if (inTable) {
      htmlParts.push("</tbody></table></div>");
      inTable = false;
      tableHeaderDone = false;
    }
  };

  for (const rawLine of lines) {
    const line = rawLine.trimEnd();

    if (line.trim().startsWith("|") && line.trim().endsWith("|")) {
      const isSeparator = /^\|[\s\-:|]+\|$/.test(line.trim());
      if (isSeparator) {
        tableHeaderDone = true;
        continue;
      }
      if (!inTable) {
        closeList();
        htmlParts.push(
          '<div class="overflow-x-auto my-6"><table class="w-full border-collapse border border-slate-200 dark:border-slate-800 text-sm">'
        );
        inTable = true;
        tableHeaderDone = false;
      }
      const cells = line
        .trim()
        .split("|")
        .slice(1, -1)
        .map((cell) => cell.trim());
      if (!tableHeaderDone) {
        htmlParts.push(
          '<thead class="bg-slate-100 dark:bg-slate-800"><tr>' +
            cells
              .map(
                (cell) =>
                  `<th class="p-3 border border-slate-200 dark:border-slate-700 text-start font-bold">${formatInlineMarkdown(cell)}</th>`
              )
              .join("") +
            "</tr></thead><tbody>"
        );
      } else {
        htmlParts.push(
          "<tr>" +
            cells
              .map(
                (cell) =>
                  `<td class="p-3 border border-slate-200 dark:border-slate-800">${formatInlineMarkdown(cell)}</td>`
              )
              .join("") +
            "</tr>"
        );
      }
      continue;
    }

    closeTable();

    if (!line.trim()) {
      closeList();
      continue;
    }

    const heading = /^(#{1,4})\s+(.*)$/.exec(line);
    if (heading) {
      closeList();
      const level = heading[1].length;
      htmlParts.push(`<h${level}>${formatInlineMarkdown(heading[2].trim())}</h${level}>`);
      continue;
    }

    if (line.startsWith("> ")) {
      closeList();
      htmlParts.push(
        `<blockquote class="border-r-4 border-emerald-600 bg-emerald-50/60 dark:bg-emerald-950/30 p-4 rounded-xl text-slate-800 dark:text-emerald-100 my-4">${formatInlineMarkdown(line.slice(2).trim())}</blockquote>`
      );
      continue;
    }

    if (/^[-*•]\s+/.test(line)) {
      if (!inList) {
        htmlParts.push(
          '<ul class="space-y-2 my-4 list-disc list-inside text-slate-700 dark:text-slate-300">'
        );
        inList = true;
      }
      htmlParts.push(`<li>${formatInlineMarkdown(line.replace(/^[-*•]\s+/, "").trim())}</li>`);
      continue;
    }

    closeList();

    const imgMatch = line.match(/^!\[(.*?)\]\((.*?)\)/);
    if (imgMatch) {
      const alt = formatInlineMarkdown(imgMatch[1]);
      const src = imgMatch[2].replace(/"/g, "%22");
      htmlParts.push(
        `<figure class="my-8"><img src="${src}" alt="${alt}" class="w-full rounded-2xl shadow-lg border border-slate-200 dark:border-slate-800 object-cover" /><figcaption class="text-center text-xs text-slate-500 mt-2">${alt}</figcaption></figure>`
      );
      continue;
    }

    htmlParts.push(`<p>${formatInlineMarkdown(line.trim())}</p>`);
  }

  closeList();
  closeTable();
  return htmlParts.join("\n");
}

/** Split rendered HTML on a heading near the middle so booking modules can sit between sections. */
export function splitContentAtMidpoint(html: string): [string, string] {
  if (!html) return ["", ""];

  const h2Matches = Array.from(html.matchAll(/<h2[\s>]/gi));
  if (h2Matches.length >= 2) {
    const midIndex = Math.floor(h2Matches.length / 2);
    const splitPos = h2Matches[midIndex].index;
    if (typeof splitPos === "number" && splitPos > 0) {
      return [html.slice(0, splitPos), html.slice(splitPos)];
    }
  }

  const pMatches = Array.from(html.matchAll(/<\/p>/gi));
  if (pMatches.length >= 2) {
    const midIndex = Math.floor(pMatches.length / 2);
    const splitPos = (pMatches[midIndex].index ?? 0) + 4;
    if (splitPos > 4) {
      return [html.slice(0, splitPos), html.slice(splitPos)];
    }
  }

  return [html, ""];
}

export type TocItem = { id: string; text: string; level: 2 | 3 };

function slugifyHeading(text: string, index: number): string {
  const base = text
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s-]/gu, "")
    .replace(/\s+/g, "-")
    .slice(0, 48);
  return base || `section-${index + 1}`;
}

export function enhanceHeadings(html: string): { html: string; toc: TocItem[] } {
  if (!html) return { html: "", toc: [] };
  const toc: TocItem[] = [];
  let i = 0;
  const next = html.replace(
    /<(h[23])(\s[^>]*)?>([\s\S]*?)<\/\1>/gi,
    (_full, tag: string, attrs = "", inner: string) => {
      const level = tag.toLowerCase() === "h2" ? 2 : 3;
      const text = inner.replace(/<[^>]+>/g, "").trim();
      if (!text) return _full;
      const id = slugifyHeading(text, i++);
      toc.push({ id, text, level: level as 2 | 3 });
      const cleanedAttrs = String(attrs || "").replace(/\s+id=(["'])[^"']*\1/i, "");
      return `<${tag}${cleanedAttrs} id="${id}" style="scroll-margin-top:7.5rem">${inner}</${tag}>`;
    }
  );
  return { html: next, toc };
}
