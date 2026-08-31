"use client";

import { useCopilotAction, useCopilotReadable } from "@copilotkit/react-core";
import type { InvoiceService } from "@/lib/booking-service";
import type { ImportServiceType } from "@/lib/import-schemas";
import {
  isInvoiceCurrencyFormat,
  isInvoiceFieldKey,
  isInvoiceLanguage,
  type InvoiceTemplate,
} from "@/types/invoice-template";
import type { CopilotScope } from "@/lib/builder-agent/types";
import { useScopedPersistMemory } from "./persist-memory";

export type ArticleSnapshot = {
  titleAr?: string;
  titleEn?: string;
  excerptAr?: string;
  excerptEn?: string;
  contentAr?: string;
  contentEn?: string;
  slug?: string;
  category?: string;
  tags?: string;
  author?: string;
  coverImage?: string;
  coverAlt?: string;
  seo?: {
    metaTitleAr?: string;
    metaTitleEn?: string;
    metaDescriptionAr?: string;
    metaDescriptionEn?: string;
    focusKeyword?: string;
    ogImage?: string;
  };
};

export type EmailTemplateApply = {
  name?: string;
  subject_ar?: string;
  subject_en?: string;
  document?: unknown;
};

export type CustomPageApply = {
  id?: string;
  slug?: string;
  titleAr?: string;
  titleEn?: string;
  bodyAr?: string;
  bodyEn?: string;
  seoTitle?: string;
  seoDescription?: string;
  published?: boolean;
  created?: boolean;
};

export type AdminCopilotHost = {
  invoice?: {
    service: InvoiceService;
    draft: InvoiceTemplate;
    onApply: (template: InvoiceTemplate) => void;
  };
  article?: {
    snapshot: ArticleSnapshot;
    onApply: (patch: Record<string, unknown>) => void;
    onInsertReply?: (text: string) => void;
  };
  service?: {
    serviceType: ImportServiceType;
    onPending: (item: Record<string, unknown>, reply: string) => void;
  };
  email?: {
    kind?: string;
    currentDocument?: unknown;
    audienceHint?: string;
    onApply: (template: EmailTemplateApply) => void;
  };
  pages?: {
    draft?: CustomPageApply;
    onApplied: (page: CustomPageApply) => void;
  };
};

function InvoiceCopilotTools({
  service,
  draft,
  onApply,
}: NonNullable<AdminCopilotHost["invoice"]>) {
  useScopedPersistMemory("invoices");
  useCopilotReadable({
    description: "Current invoice template draft and service. Edit chrome only — not booking math.",
    value: { service, template: draft },
  });
  useCopilotAction({
    name: "applyInvoiceTemplate",
    description:
      "Apply invoice-template chrome (logo, colors, header/footer, visible fields, CSS). Cannot edit homepage sections or bookings.",
    parameters: [
      { name: "companyNameAr", type: "string" },
      { name: "companyNameEn", type: "string" },
      { name: "logoUrl", type: "string" },
      { name: "logoHeight", type: "number" },
      { name: "primaryColor", type: "string" },
      { name: "accentColor", type: "string" },
      { name: "headerText", type: "string" },
      { name: "footerText", type: "string" },
      { name: "language", type: "string" },
      { name: "currencyFormat", type: "string" },
      { name: "customCss", type: "string" },
      { name: "extraHtml", type: "string" },
      { name: "fieldsJson", type: "string" },
    ],
    handler: async (args: Record<string, unknown>) => {
      const next: InvoiceTemplate = { ...draft, service };
      const strKeys = [
        "companyNameAr",
        "companyNameEn",
        "logoUrl",
        "primaryColor",
        "accentColor",
        "headerText",
        "footerText",
        "customCss",
        "extraHtml",
      ] as const;
      for (const key of strKeys) {
        if (typeof args[key] === "string") next[key] = args[key] as string;
      }
      if (typeof args.logoHeight === "number" && Number.isFinite(args.logoHeight)) {
        next.logoHeight = Math.min(120, Math.max(24, Math.round(args.logoHeight)));
      }
      if (isInvoiceLanguage(args.language)) next.language = args.language;
      if (isInvoiceCurrencyFormat(args.currencyFormat)) next.currencyFormat = args.currencyFormat;
      if (typeof args.fieldsJson === "string" && args.fieldsJson.trim()) {
        try {
          const parsed = JSON.parse(args.fieldsJson) as Record<string, unknown>;
          for (const [key, value] of Object.entries(parsed)) {
            if (isInvoiceFieldKey(key) && typeof value === "boolean") {
              next.fields[key] = value;
            }
          }
        } catch {
          return "fieldsJson must be a JSON object of boolean field flags.";
        }
      }
      onApply(next);
      return `Applied invoice chrome for ${service}. Review the preview, then save.`;
    },
  });
  return null;
}

function ArticleCopilotTools({
  snapshot,
  onApply,
  onInsertReply,
}: NonNullable<AdminCopilotHost["article"]>) {
  useScopedPersistMemory("articles");
  useCopilotReadable({
    description: "Open CMS article. Patch this article only — never homepage or invoices.",
    value: snapshot,
  });
  useCopilotAction({
    name: "applyArticlePatch",
    description:
      "Patch the open blog article (titles, excerpts, HTML content, SEO). Does not edit homepage sections.",
    parameters: [
      { name: "titleAr", type: "string" },
      { name: "titleEn", type: "string" },
      { name: "excerptAr", type: "string" },
      { name: "excerptEn", type: "string" },
      { name: "contentAr", type: "string" },
      { name: "contentEn", type: "string" },
      { name: "slug", type: "string" },
      { name: "category", type: "string" },
      { name: "tags", type: "string" },
      { name: "author", type: "string" },
      { name: "coverImage", type: "string" },
      { name: "coverAlt", type: "string" },
      { name: "metaTitleAr", type: "string" },
      { name: "metaTitleEn", type: "string" },
      { name: "metaDescriptionAr", type: "string" },
      { name: "metaDescriptionEn", type: "string" },
      { name: "focusKeyword", type: "string" },
    ],
    handler: async (args: Record<string, unknown>) => {
      const patch: Record<string, unknown> = {};
      const keys = [
        "titleAr",
        "titleEn",
        "excerptAr",
        "excerptEn",
        "contentAr",
        "contentEn",
        "slug",
        "category",
        "tags",
        "author",
        "coverImage",
        "coverAlt",
      ] as const;
      for (const key of keys) {
        if (typeof args[key] === "string") patch[key] = args[key];
      }
      const seo: Record<string, string> = {};
      for (const key of ["metaTitleAr", "metaTitleEn", "metaDescriptionAr", "metaDescriptionEn", "focusKeyword"] as const) {
        if (typeof args[key] === "string") seo[key] = args[key] as string;
      }
      if (Object.keys(seo).length) patch.seo = seo;
      onApply(patch);
      return "Applied article patch. Review the form, then save.";
    },
  });
  useCopilotAction({
    name: "insertReplyIntoArabic",
    description: "Append the assistant's prose into the Arabic HTML body.",
    parameters: [{ name: "htmlOrText", type: "string", required: true }],
    handler: async ({ htmlOrText }: { htmlOrText: string }) => {
      if (!onInsertReply) return "Insert is not available.";
      onInsertReply(htmlOrText);
      return "Inserted into Arabic content.";
    },
  });
  return null;
}

function ServiceCopilotTools({
  serviceType,
  onPending,
}: NonNullable<AdminCopilotHost["service"]>) {
  useScopedPersistMemory("services");
  useCopilotReadable({
    description: "Catalog import type. Extract a complete catalog item. Do not patch homepage CSS.",
    value: { serviceType },
  });
  useCopilotAction({
    name: "importServiceFromUrl",
    description:
      "Fetch and extract a catalog item from a URL or brief via the existing import pipeline. Admin must confirm before save.",
    parameters: [{ name: "brief", type: "string", required: true }],
    handler: async ({ brief }: { brief: string }) => {
      const res = await fetch("/api/gemini/import-service", {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          serviceType,
          messages: [{ role: "user", content: brief }],
        }),
      });
      const data = (await res.json()) as {
        ok?: boolean;
        error?: string;
        reply?: string;
        fetchNote?: string;
        item?: Record<string, unknown>;
      };
      if (!data.ok) return data.error || "Import failed.";
      const reply = `${data.reply || "Analyzed."}${data.fetchNote ? `\n\n(${data.fetchNote})` : ""}`;
      if (data.item && typeof data.item === "object") {
        onPending(data.item, reply);
      }
      return reply;
    },
  });
  return null;
}

function EmailCopilotTools({
  kind,
  currentDocument,
  audienceHint,
  onApply,
}: NonNullable<AdminCopilotHost["email"]>) {
  useScopedPersistMemory("email");
  useCopilotReadable({
    description: "Current email visual document. Design only — never send campaigns or edit invoices.",
    value: { kind: kind || "custom", currentDocument },
  });
  useCopilotAction({
    name: "generateEmailTemplate",
    description: "Generate or restyle the email template from a brief. Applies to the draft only.",
    parameters: [{ name: "prompt", type: "string", required: true }],
    handler: async ({ prompt }: { prompt: string }) => {
      const res = await fetch("/api/admin/email-templates/generate", {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt,
          kind: kind || "custom",
          currentDocument,
          audienceHint: audienceHint || "",
        }),
      });
      const json = (await res.json()) as {
        ok?: boolean;
        error?: string;
        template?: EmailTemplateApply;
      };
      if (!res.ok || !json.template) return json.error || "Email generate failed.";
      onApply(json.template);
      return "Applied email draft. Review, then save. Do not send.";
    },
  });
  return null;
}

function PagesCopilotTools({
  draft,
  onApplied,
}: NonNullable<AdminCopilotHost["pages"]>) {
  useScopedPersistMemory("pages");
  useCopilotReadable({
    description: "Custom /p/[slug] pages CMS. Not the homepage template store.",
    value: { draft: draft || null },
  });
  useCopilotAction({
    name: "upsertCustomPage",
    description: "Create or update a custom CMS page. Never writes homepage sections.",
    parameters: [
      { name: "slug", type: "string", required: true },
      { name: "titleAr", type: "string", required: true },
      { name: "titleEn", type: "string", required: true },
      { name: "bodyAr", type: "string", required: true },
      { name: "bodyEn", type: "string", required: true },
      { name: "seoTitle", type: "string" },
      { name: "seoDescription", type: "string" },
      { name: "published", type: "boolean" },
      { name: "id", type: "string" },
    ],
    handler: async (args: {
      slug: string;
      titleAr: string;
      titleEn: string;
      bodyAr: string;
      bodyEn: string;
      seoTitle?: string;
      seoDescription?: string;
      published?: boolean;
      id?: string;
    }) => {
      const payload = {
        id: args.id || draft?.id,
        slug: args.slug,
        titleAr: args.titleAr,
        titleEn: args.titleEn,
        bodyAr: args.bodyAr,
        bodyEn: args.bodyEn,
        seoTitle: args.seoTitle || args.titleAr,
        seoDescription: args.seoDescription || "",
        published: args.published !== false,
      };
      const res = await fetch("/api/admin/pages", {
        method: payload.id ? "PUT" : "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = (await res.json()) as { ok?: boolean; error?: string; page?: CustomPageApply };
      if (!data.ok) return data.error || "Could not save page.";
      onApplied({
        ...(data.page || payload),
        created: !payload.id,
      });
      return `Saved /p/${payload.slug}.`;
    },
  });
  return null;
}

export function AdminScopeTools({
  scope,
  host,
}: {
  scope: CopilotScope;
  host?: AdminCopilotHost;
}) {
  switch (scope) {
    case "editor":
      return null;
    case "invoices":
      return host?.invoice ? <InvoiceCopilotTools {...host.invoice} /> : null;
    case "articles":
      return host?.article ? <ArticleCopilotTools {...host.article} /> : null;
    case "services":
      return host?.service ? <ServiceCopilotTools {...host.service} /> : null;
    case "email":
      return host?.email ? <EmailCopilotTools {...host.email} /> : null;
    case "pages":
      return host?.pages ? <PagesCopilotTools {...host.pages} /> : null;
    default: {
      const _never: never = scope;
      return _never;
    }
  }
}
