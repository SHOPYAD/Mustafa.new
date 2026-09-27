/**
 * Builtin Fetch / HTTP MCP Server for Lonaliza
 * Performs high-speed, secure HTTP requests, converts HTML to clean Markdown/Text,
 * and handles web intelligence without any external missing npm packages.
 */

export interface FetchToolArgs {
  url: string;
  method?: "GET" | "POST" | "HEAD";
  headers?: Record<string, string>;
  raw?: boolean;
}

export interface FetchToolResult {
  ok: boolean;
  status: number;
  url: string;
  contentType: string;
  content: string;
  error?: string;
}

function cleanHtmlToMarkdown(html: string): string {
  // Remove script and style tags
  let text = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "");
  text = text.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, "");
  // Replace links with markdown links
  text = text.replace(/<a\s+[^>]*href=["']([^"']*)["'][^>]*>(.*?)<\/a>/gi, "[$2]($1)");
  // Replace headers
  text = text.replace(/<h1[^>]*>(.*?)<\/h1>/gi, "\n# $1\n");
  text = text.replace(/<h2[^>]*>(.*?)<\/h2>/gi, "\n## $1\n");
  text = text.replace(/<h3[^>]*>(.*?)<\/h3>/gi, "\n### $1\n");
  // Replace list items
  text = text.replace(/<li[^>]*>(.*?)<\/li>/gi, "\n- $1");
  // Replace paragraphs and line breaks
  text = text.replace(/<\/p>/gi, "\n\n");
  text = text.replace(/<br\s*[\/]?>/gi, "\n");
  // Strip remaining HTML tags
  text = text.replace(/<[^>]+>/g, " ");
  // Unescape common HTML entities
  text = text
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&nbsp;/g, " ");
  // Normalize whitespace
  return text.replace(/[ \t]+/g, " ").replace(/\n{3,}/g, "\n\n").trim();
}

export async function executeBuiltinFetch(args: FetchToolArgs): Promise<FetchToolResult> {
  const url = args.url?.trim();
  if (!url) {
    return {
      ok: false,
      status: 400,
      url: "",
      contentType: "",
      content: "",
      error: "رابط URL مطلوب للاستعلام",
    };
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    const headers: Record<string, string> = {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36 (Lonaliza Travel Advisor)",
      Accept: "text/html,application/xhtml+xml,application/xml,text/plain,application/json;q=0.9,*/*;q=0.8",
      "Accept-Language": "ar,en-US;q=0.9,en;q=0.8,tr;q=0.7",
      ...(args.headers || {}),
    };

    const res = await fetch(url, {
      method: args.method || "GET",
      headers,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    const contentType = res.headers.get("content-type") || "";
    const rawText = await res.text();

    let processedContent = rawText;
    if (!args.raw && contentType.includes("html")) {
      processedContent = cleanHtmlToMarkdown(rawText);
    }

    // Limit maximum response size to avoid context bloat (approx 35,000 characters)
    if (processedContent.length > 35000) {
      processedContent =
        processedContent.slice(0, 35000) + "\n\n... [تم اقتطاع بقية الصفحة لضمان كفاءة معالجة الوكيل]";
    }

    return {
      ok: res.ok,
      status: res.status,
      url: res.url || url,
      contentType,
      content: processedContent,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return {
      ok: false,
      status: 500,
      url,
      contentType: "",
      content: "",
      error: `فشل جلب الصفحة: ${message}`,
    };
  }
}
