/**
 * Multi-page visual editor registry.
 *
 * Sibling A (pages list / purple rail) should import `EditorPagesData`
 * and load `GET /api/admin/builder-pages`. Clicking a page should call
 * `setActivePage(entry.id)` — the canvas iframe then opens `canvasPath`
 * (`?builder=1`).
 */

export const BUILTIN_PAGE_IDS = [
  "home",
  "home-b2c",
  "flights",
  "flights-search",
  "flights-booking",
  "hotels",
  "hotels-book",
  "cars",
  "transfers",
  "holidays",
  "account",
  "visa",
  "tours",
  "uae-tours",
  "blog",
  "about",
  "contact",
  "search",
  "ai-chat",
  "privacy",
  "terms",
] as const;

export type BuiltinPageId = (typeof BUILTIN_PAGE_IDS)[number];

export type CustomPageId = `custom:${string}`;

export type EditorPageId = BuiltinPageId | CustomPageId;

export type EditorPageGroupId =
  | "home"
  | "flights"
  | "hotels"
  | "cars"
  | "transfers"
  | "holidays"
  | "tours"
  | "visa"
  | "account"
  | "content"
  | "custom";

export type EditorPageKind =
  | "home"
  | "hub"
  | "search"
  | "funnel"
  | "account"
  | "content"
  | "custom";

export type EditorPageEditable = "homepage" | "theme" | "custom";

export type PageGeminiCapability =
  | "homepage-template"
  | "theme-tokens"
  | "layout-hints"
  | "custom-sections";

export type EditorPageEntry = {
  id: string;
  kind: EditorPageKind;
  group: EditorPageGroupId;
  path: string;
  canvasPath: string;
  labelAr: string;
  labelEn: string;
  labelTr: string;
  editable: EditorPageEditable;
  icon: string;
  slug?: string;
  customId?: string;
  published?: boolean;
};

export type EditorPageGroup = {
  id: EditorPageGroupId;
  labelAr: string;
  labelEn: string;
  labelTr: string;
};

export type EditorPagesData = {
  pages: EditorPageEntry[];
  groups: EditorPageGroup[];
  activeDefaults: { pageId: BuiltinPageId };
  /** POST `{ titleAr, titleEn, slug? }` to create a blank `/p/[slug]` page. */
  createEndpoint: "/api/admin/builder-pages";
};

export type EditorPageOption = {
  value: string;
  label: string;
  routePath: string;
  layoutKey: string;
};

const GROUP_ORDER: EditorPageGroupId[] = [
  "home",
  "flights",
  "hotels",
  "cars",
  "transfers",
  "holidays",
  "tours",
  "visa",
  "account",
  "content",
  "custom",
];

export function isBuiltinPageId(id: string): id is BuiltinPageId {
  return (BUILTIN_PAGE_IDS as readonly string[]).includes(id);
}

export function isCustomPageId(id: string): id is CustomPageId {
  return id.startsWith("custom:") && id.length > "custom:".length;
}

export function customSlugFromPageId(id: string): string | null {
  if (!isCustomPageId(id)) return null;
  return id.slice("custom:".length);
}

export function customPageIdFromSlug(slug: string): CustomPageId {
  return `custom:${slug}`;
}

export function withBuilderQuery(path: string, extra?: Record<string, string>): string {
  const qIndex = path.indexOf("?");
  const pathname = qIndex >= 0 ? path.slice(0, qIndex) : path;
  const params = new URLSearchParams(qIndex >= 0 ? path.slice(qIndex + 1) : "");
  params.set("builder", "1");
  if (extra) {
    for (const [key, value] of Object.entries(extra)) {
      params.set(key, value);
    }
  }
  return `${pathname || "/"}?${params.toString()}`;
}

export function builderCanvasSrc(path: string, locale = "ar"): string {
  return withBuilderQuery(path, {
    editor: "1",
    preview: "1",
    hl: locale,
  });
}

function entry(
  id: BuiltinPageId,
  kind: EditorPageKind,
  group: EditorPageGroupId,
  path: string,
  labelAr: string,
  labelEn: string,
  labelTr: string,
  icon: string
): EditorPageEntry {
  return {
    id,
    kind,
    group,
    path,
    canvasPath: withBuilderQuery(path),
    labelAr,
    labelEn,
    labelTr,
    editable: pageEditable(id),
    icon,
  };
}

export function pageEditable(id: BuiltinPageId): EditorPageEditable {
  switch (id) {
    case "home":
    case "home-b2c":
      return "homepage";
    case "flights":
    case "flights-search":
    case "flights-booking":
    case "hotels":
    case "hotels-book":
    case "cars":
    case "transfers":
    case "holidays":
    case "account":
    case "visa":
    case "tours":
    case "uae-tours":
    case "blog":
    case "about":
    case "contact":
    case "search":
    case "ai-chat":
    case "privacy":
    case "terms":
      return "theme";
    default: {
      const _never: never = id;
      return _never;
    }
  }
}

export function pageKind(id: BuiltinPageId): EditorPageKind {
  switch (id) {
    case "home":
    case "home-b2c":
      return "home";
    case "flights":
    case "hotels":
    case "cars":
    case "transfers":
    case "holidays":
    case "visa":
    case "tours":
    case "uae-tours":
      return "hub";
    case "flights-search":
    case "search":
      return "search";
    case "flights-booking":
    case "hotels-book":
      return "funnel";
    case "account":
      return "account";
    case "blog":
    case "about":
    case "contact":
    case "ai-chat":
    case "privacy":
    case "terms":
      return "content";
    default: {
      const _never: never = id;
      return _never;
    }
  }
}

export function pageGeminiCapabilities(id: string): PageGeminiCapability[] {
  if (isCustomPageId(id)) {
    return ["custom-sections", "theme-tokens", "layout-hints"];
  }
  if (!isBuiltinPageId(id)) return [];
  switch (id) {
    case "home":
    case "home-b2c":
      return ["homepage-template"];
    case "flights":
    case "flights-search":
    case "flights-booking":
    case "hotels":
    case "hotels-book":
    case "cars":
    case "transfers":
    case "holidays":
    case "account":
    case "visa":
    case "tours":
    case "uae-tours":
    case "blog":
    case "about":
    case "contact":
    case "search":
    case "ai-chat":
    case "privacy":
    case "terms":
      return ["theme-tokens", "layout-hints"];
    default: {
      const _never: never = id;
      return _never;
    }
  }
}

export function getBuiltinPage(id: BuiltinPageId): EditorPageEntry {
  switch (id) {
    case "home":
      return entry(id, "home", "home", "/demo", "الرئيسية (بوابة حجوزات السفر B2C)", "Home (B2C Travel Portal & Booking)", "Ana Sayfa (Seyahat)", "home");
    case "home-b2c":
      return entry(id, "home", "home", "/demo", "الرئيسية (بوابة حجوزات السفر B2C)", "Home (B2C Travel Portal & Booking)", "Ana Sayfa (Seyahat)", "home");
    case "flights":
      return entry(id, "hub", "flights", "/flights", "الطيران", "Flights", "Uçuşlar", "plane");
    case "flights-search":
      return entry(
        id,
        "search",
        "flights",
        "/flights/search",
        "بحث الطيران",
        "Flight search",
        "Uçuş arama",
        "search"
      );
    case "flights-booking":
      return entry(
        id,
        "funnel",
        "flights",
        "/flights/booking",
        "حجز الطيران",
        "Flight booking",
        "Uçuş rezervasyonu",
        "ticket"
      );
    case "hotels":
      return entry(id, "hub", "hotels", "/hotels", "الفنادق", "Hotels", "Oteller", "hotel");
    case "hotels-book":
      return entry(
        id,
        "funnel",
        "hotels",
        "/hotels/book",
        "حجز الفندق",
        "Hotel booking",
        "Otel rezervasyonu",
        "ticket"
      );
    case "cars":
      return entry(id, "hub", "cars", "/cars", "السيارات", "Cars", "Araçlar", "car");
    case "transfers":
      return entry(
        id,
        "hub",
        "transfers",
        "/transfers",
        "الترانسفير",
        "Transfers",
        "Transfer",
        "car"
      );
    case "holidays":
      return entry(
        id,
        "hub",
        "holidays",
        "/holidays",
        "العروض",
        "Holidays",
        "Tatiller",
        "package"
      );
    case "account":
      return entry(id, "account", "account", "/account", "حسابي", "Account", "Hesap", "user");
    case "visa":
      return entry(id, "hub", "visa", "/visa", "التأشيرات", "Visas", "Vizeler", "file");
    case "tours":
      return entry(
        id,
        "hub",
        "tours",
        "/vip-tours",
        "الجولات",
        "Tours",
        "Turlar",
        "map"
      );
    case "uae-tours":
      return entry(
        id,
        "hub",
        "tours",
        "/uae-tours",
        "جولات الإمارات",
        "UAE tours",
        "BAE turları",
        "map"
      );
    case "blog":
      return entry(id, "content", "content", "/blog", "المدونة", "Blog", "Blog", "news");
    case "about":
      return entry(id, "content", "content", "/about", "من نحن", "About", "Hakkımızda", "file");
    case "contact":
      return entry(
        id,
        "content",
        "content",
        "/contact",
        "اتصل بنا",
        "Contact",
        "İletişim",
        "mail"
      );
    case "search":
      return entry(id, "search", "content", "/search", "البحث", "Search", "Arama", "search");
    case "ai-chat":
      return entry(
        id,
        "content",
        "content",
        "/ai-chat",
        "مساعد السفر",
        "AI chat",
        "AI sohbet",
        "sparkles"
      );
    case "privacy":
      return entry(
        id,
        "content",
        "content",
        "/privacy",
        "الخصوصية",
        "Privacy",
        "Gizlilik",
        "file"
      );
    case "terms":
      return entry(id, "content", "content", "/terms", "الشروط", "Terms", "Şartlar", "file");
    default: {
      const _never: never = id;
      return _never;
    }
  }
}

export function listBuiltinEditorPages(): EditorPageEntry[] {
  return BUILTIN_PAGE_IDS.filter((id) => id !== "home-b2c").map((id) => getBuiltinPage(id));
}

export function editorPageGroups(): EditorPageGroup[] {
  return [
    { id: "home", labelAr: "الرئيسية", labelEn: "Home", labelTr: "Ana sayfa" },
    { id: "flights", labelAr: "الطيران", labelEn: "Flights", labelTr: "Uçuşlar" },
    { id: "hotels", labelAr: "الفنادق", labelEn: "Hotels", labelTr: "Oteller" },
    { id: "cars", labelAr: "السيارات", labelEn: "Cars", labelTr: "Araçlar" },
    { id: "transfers", labelAr: "الترانسفير", labelEn: "Transfers", labelTr: "Transfer" },
    { id: "holidays", labelAr: "العروض", labelEn: "Holidays", labelTr: "Tatiller" },
    { id: "tours", labelAr: "الجولات", labelEn: "Tours", labelTr: "Turlar" },
    { id: "visa", labelAr: "التأشيرات", labelEn: "Visas", labelTr: "Vizeler" },
    { id: "account", labelAr: "الحساب", labelEn: "Account", labelTr: "Hesap" },
    { id: "content", labelAr: "المحتوى", labelEn: "Content", labelTr: "İçerik" },
    { id: "custom", labelAr: "صفحات مخصصة", labelEn: "Custom pages", labelTr: "Özel sayfalar" },
  ];
}

export function editorPageToOption(page: EditorPageEntry): EditorPageOption {
  return {
    value: page.id,
    label: page.labelEn,
    routePath: page.path,
    layoutKey: page.editable === "homepage" ? "layout" : page.id,
  };
}

export function builtinEditorPageOptions(): EditorPageOption[] {
  return listBuiltinEditorPages().map(editorPageToOption);
}

export function customPageToEntry(page: {
  id: string;
  slug: string;
  titleAr: string;
  titleEn: string;
  published: boolean;
}): EditorPageEntry {
  const path = `/p/${page.slug}`;
  return {
    id: customPageIdFromSlug(page.slug),
    kind: "custom",
    group: "custom",
    path,
    canvasPath: withBuilderQuery(path),
    labelAr: page.titleAr || page.titleEn || page.slug,
    labelEn: page.titleEn || page.titleAr || page.slug,
    labelTr: page.titleEn || page.titleAr || page.slug,
    editable: "custom",
    icon: "file",
    slug: page.slug,
    customId: page.id,
    published: page.published,
  };
}

export function resolvePageIdFromPath(pathname: string): EditorPageId | null {
  const normalized = (pathname || "/").replace(/\/+$/, "") || "/";
  if (normalized.startsWith("/p/")) {
    const slug = normalized.slice("/p/".length).split("/")[0] || "";
    return slug ? customPageIdFromSlug(slug) : null;
  }

  let best: BuiltinPageId | null = null;
  let bestLen = -1;
  for (const id of BUILTIN_PAGE_IDS) {
    const path = getBuiltinPage(id).path;
    if (normalized === path || (path !== "/" && normalized.startsWith(`${path}/`))) {
      if (path.length > bestLen) {
        best = id;
        bestLen = path.length;
      }
    }
  }
  return best;
}

export function findEditorPage(
  pages: EditorPageEntry[],
  id: string
): EditorPageEntry | undefined {
  return pages.find((page) => page.id === id);
}

export function sortEditorPages(pages: EditorPageEntry[]): EditorPageEntry[] {
  const groupRank = new Map(GROUP_ORDER.map((id, index) => [id, index]));
  return [...pages].sort((a, b) => {
    const ga = groupRank.get(a.group) ?? 99;
    const gb = groupRank.get(b.group) ?? 99;
    if (ga !== gb) return ga - gb;
    return a.path.localeCompare(b.path);
  });
}

export function buildEditorPagesData(customPages: Array<{
  id: string;
  slug: string;
  titleAr: string;
  titleEn: string;
  published: boolean;
}>): EditorPagesData {
  const pages = sortEditorPages([
    ...listBuiltinEditorPages(),
    ...customPages.map(customPageToEntry),
  ]);
  return {
    pages,
    groups: editorPageGroups(),
    activeDefaults: { pageId: "home" },
    createEndpoint: "/api/admin/builder-pages",
  };
}
