/**
 * Shared helpers for Travelpayouts tpemb.com widgets (cars / transfers).
 * Transfers iframe is rewritten to same-origin `/intui` (Next.js curl proxy → en.intui.travel).
 * Never use www.intui.travel (Russian). ar.intui.travel is 520.
 */

const LABEL_MARK = "data-alrayyan-label";

/** Common English widget labels → Arabic. Light-DOM / open-shadow only. */
export const TPEMB_AR_LABELS: Record<string, string> = {
  "Unlimited mileage": "كيلومترات غير محدودة",
  "Free cancellation": "إلغاء مجاني",
  "Pay at pickup": "الدفع عند الاستلام",
  "Pay now": "ادفع الآن",
  "Instant confirmation": "تأكيد فوري",
  "Instant booking": "حجز فوري",
  "per day": "لليوم",
  "All cars": "كل السيارات",
  "Compare": "مقارنة",
  "New car": "سيارة جديدة",
  "Manual": "عادي",
  "Automatic": "أوتوماتيك",
  "No credit card": "بدون بطاقة ائتمان",
  "Search": "بحث",
  "How it works": "كيف يعمل",
  "FAQ": "الأسئلة الشائعة",
  "Why book with us": "لماذا تحجز معنا",
  "Easy booking": "حجز سهل",
  "Reviews": "التقييمات",
  "Pickup": "الاستلام",
  "Drop-off": "التسليم",
  "PICK-UP LOCATION": "موقع الاستلام",
  "DROP-OFF LOCATION": "موقع التسليم",
  "Airport, hotel, address...": "مطار، فندق، عنوان...",
  "hotel, airport, address...": "فندق، مطار، عنوان...",
  "Same location": "نفس المكان",
  "Airport Transfers Customer Reviews": "تقييمات عملاء ترانسفير المطار",
  "Customer Reviews": "تقييمات العملاء",
  "DATE": "التاريخ",
  "TIME": "الوقت",
  "Date": "التاريخ",
  "Time": "الوقت",
  "From": "من",
  "To": "إلى",
  "Passengers": "الركاب",
  "Passenger": "راكب",
  "Find": "ابحث",
  "One way": "اتجاه واحد",
  "Round trip": "ذهاب وعودة",
  "Book now": "احجز الآن",
  "Details": "التفاصيل",
  "Filters": "التصفية",
  "Price": "السعر",
  "Place your order": "قدّم طلبك",
  "Receive documents": "استلم المستندات",
  "Meeting at the airport": "الاستقبال في المطار",
  "HOW IT WORKS": "كيف يعمل",
  "how it works": "كيف يعمل",
  "January": "يناير",
  "February": "فبراير",
  "March": "مارس",
  "April": "أبريل",
  "May": "مايو",
  "June": "يونيو",
  "July": "يوليو",
  "August": "أغسطس",
  "September": "سبتمبر",
  "October": "أكتوبر",
  "November": "نوفمبر",
  "December": "ديسمبر",
};

export const TRANSFERS_IFRAME_IDLE_MIN = 640;
export const TRANSFERS_IFRAME_PICKER_MIN = 720;
export const TRANSFERS_IFRAME_RESULTS_MIN = 1100;

/** Same-origin nginx proxy of en.intui.travel (see deploy/lonaliza.com.nginx.conf). */
export const INTUI_PROXY_PATH = "/intui";
export const INTUI_FIND_PROXY_PATH = "/intui-find";

export type IntuiSearchQuery = {
  from?: string;
  to?: string;
  date?: string;
  time?: string;
  guests?: string;
};

export type IntuiRewriteOptions = {
  /** tpemb embed locale — keep `en` so the host stays en.intui.travel. */
  embedLocale?: string;
  /** Site language. `ar` is applied as lang= on en.intui.travel only. */
  pageLocale?: string;
  currency?: string;
  search?: IntuiSearchQuery;
};

export type TransfersIframeMode = "idle" | "picker" | "results";

export function normalizeTransfersCurrency(raw?: string | null): string {
  const v = String(raw || "usd").trim().toLowerCase();
  if (!v || v === "eur" || v === "euro") return "usd";
  return v;
}

export function applyTpembCurrencyParams(url: URL, currency?: string | null): void {
  const lower = normalizeTransfersCurrency(currency);
  url.searchParams.set("currency", lower);
  url.searchParams.set("curr", lower);
}

export function applyIntuiCurrencyParams(url: URL, currency?: string | null): void {
  const upper = normalizeTransfersCurrency(currency).toUpperCase();
  url.searchParams.set("currency", upper);
  url.searchParams.set("curr", upper);
}

export function forceHttpsTpembUrl(raw: string): string {
  const trimmed = String(raw || "").trim();
  if (!trimmed) return "";
  if (trimmed.startsWith("//")) return `https:${trimmed}`;
  if (/^http:\/\//i.test(trimmed)) return `https://${trimmed.slice(7)}`;
  return trimmed;
}

/** Keep/override locale=ar on a tpemb script URL (including pasted overrides). */
export function forceTpembLocale(rawUrl: string, locale = "ar"): string {
  const httpsUrl = forceHttpsTpembUrl(rawUrl);
  if (!httpsUrl) return "";
  try {
    const url = new URL(httpsUrl);
    url.searchParams.set("locale", locale || "ar");
    return url.toString();
  } catch {
    return httpsUrl;
  }
}

function resolveIntuiOpts(
  localeOrOpts: string | IntuiRewriteOptions = "en"
): Required<IntuiRewriteOptions> {
  if (typeof localeOrOpts === "string") {
    return {
      embedLocale: localeOrOpts || "en",
      pageLocale: localeOrOpts || "en",
      currency: "usd",
      search: {},
    };
  }
  return {
    embedLocale: localeOrOpts.embedLocale?.trim() || "en",
    pageLocale: localeOrOpts.pageLocale?.trim() || "en",
    currency: normalizeTransfersCurrency(localeOrOpts.currency),
    search: localeOrOpts.search || {},
  };
}

export function toIntuiDmyDate(raw?: string): string {
  const v = String(raw || "").trim();
  const iso = /^(\d{4})-(\d{2})-(\d{2})$/.exec(v);
  if (iso) return `${iso[3]}.${iso[2]}.${iso[1]}`;
  return v;
}

export function applyIntuiSearchParams(
  url: URL,
  query?: IntuiSearchQuery | null
): void {
  if (!query) return;
  if (query.from) {
    url.searchParams.set("from", query.from);
    url.searchParams.set("pickup", query.from);
  }
  if (query.to) {
    url.searchParams.set("to", query.to);
    url.searchParams.set("dropoff", query.to);
  }
  if (query.date) {
    url.searchParams.set("date", query.date);
    const dmy = toIntuiDmyDate(query.date);
    if (dmy && dmy !== query.date) url.searchParams.set("date_dmy", dmy);
  }
  if (query.time) url.searchParams.set("time", query.time);
  if (query.guests) {
    url.searchParams.set("passengers", query.guests);
    url.searchParams.set("pax", query.guests);
  }
}

function isIntuiEmbedUrl(raw: string): boolean {
  if (!raw || /\/public\/js\//i.test(raw)) return false;
  if (raw.startsWith(INTUI_PROXY_PATH) || raw.includes("/intui/?")) return true;
  return /intui\.travel/i.test(raw);
}

function applyIntuiLangParams(url: URL, opts: Required<IntuiRewriteOptions>): void {
  const iframeLang =
    opts.pageLocale === "ar" || opts.pageLocale === "tr" ? opts.pageLocale : "en";
  url.searchParams.set("lang", iframeLang);
  url.searchParams.set("language", iframeLang);
  url.searchParams.set(
    "locale",
    opts.embedLocale === "ru" ? "en" : opts.embedLocale || "en"
  );
  applyIntuiCurrencyParams(url, opts.currency);
}

/**
 * Official tpemb promo 1504 builds `{locale}.intui.travel`
 * (`en` → en.intui.travel, `ru` → www.intui.travel).
 * Rewrite to same-origin `/intui` (Next.js curl proxy → en.intui.travel).
 * Never use www.intui.travel (Russian). ar.intui.travel is 520.
 */
export function rewriteIntuiEmbedSrc(
  rawSrc: string,
  localeOrOpts: string | IntuiRewriteOptions = "en"
): string {
  try {
    const opts = resolveIntuiOpts(localeOrOpts);
    const origin =
      typeof window !== "undefined" ? window.location.origin : "https://lonaliza.com";
    const url = new URL(rawSrc, origin);

    const proxiedAlready =
      url.pathname === "/intui" ||
      url.pathname === "/intui/" ||
      url.pathname.startsWith("/intui/");
    const isIntuiHost = url.hostname.endsWith("intui.travel");
    if (!proxiedAlready && !isIntuiHost) return rawSrc;

    applyIntuiLangParams(url, opts);
    applyIntuiSearchParams(url, opts.search);
    const restPath = proxiedAlready
      ? url.pathname.replace(/^\/intui\/?/, "")
      : url.pathname.replace(/^\//, "");
    if (restPath) {
      return `${INTUI_PROXY_PATH}/${restPath}${url.search}${url.hash}`;
    }
    return `${INTUI_PROXY_PATH}${url.search}${url.hash}`;
  } catch {
    return rawSrc;
  }
}

function intuiParamsMatch(before: URL, after: URL): boolean {
  const keys = [
    "lang",
    "language",
    "locale",
    "currency",
    "curr",
    "from",
    "to",
    "pickup",
    "dropoff",
    "date",
    "time",
    "passengers",
  ] as const;
  const beforePath = before.pathname.replace(/\/+$/, "") || "/";
  const afterPath = after.pathname.replace(/\/+$/, "") || "/";
  if (beforePath !== afterPath) return false;
  return keys.every(
    (key) =>
      (before.searchParams.get(key) || "").toLowerCase() ===
      (after.searchParams.get(key) || "").toLowerCase()
  );
}

export function rewriteIntuiIframes(
  root: ParentNode,
  localeOrOpts: string | IntuiRewriteOptions = "en"
): void {
  const iframes = root.querySelectorAll("iframe");
  for (const iframe of iframes) {
    const src = iframe.getAttribute("src") || iframe.src;
    if (!src || !isIntuiEmbedUrl(src)) continue;
    const next = rewriteIntuiEmbedSrc(src, localeOrOpts);
    if (!next || next === src) continue;
    try {
      const origin =
        typeof window !== "undefined" ? window.location.origin : "https://lonaliza.com";
      const before = new URL(src, origin);
      const after = new URL(next, origin);
      if (intuiParamsMatch(before, after)) continue;
    } catch {
      // still apply next
    }
    iframe.setAttribute("src", next);
  }
}

export function styleTransfersIframe(
  iframe: HTMLIFrameElement,
  mode: TransfersIframeMode
): void {
  iframe.style.width = "100%";
  iframe.style.maxWidth = "100%";
  iframe.style.maxHeight = "none";
  iframe.style.overflow = "visible";
  iframe.style.position = "relative";
  iframe.style.background = "#ffffff";
  iframe.style.display = "block";
  iframe.style.border = "0";
  iframe.setAttribute("scrolling", "no");
  iframe.removeAttribute("translate");
  iframe.classList.remove("notranslate");
  iframe.setAttribute("data-alrayyan-iframe-mode", mode);
  const min =
    mode === "results"
      ? TRANSFERS_IFRAME_RESULTS_MIN
      : mode === "picker"
        ? TRANSFERS_IFRAME_PICKER_MIN
        : TRANSFERS_IFRAME_IDLE_MIN;
  iframe.style.zIndex = mode === "idle" ? "30" : "80";
  iframe.style.minHeight = `${min}px`;
  const current = parseInt(iframe.style.height || iframe.getAttribute("height") || "0", 10);
  if (!current || current < min) {
    iframe.style.height = `${min}px`;
  }
}

const INTUI_PICKER_CSS = `
  html, body {
    background: #fff !important;
    overflow-x: visible !important;
    overflow-y: visible !important;
    max-width: none !important;
    direction: ltr !important;
    scrollbar-width: none !important;
  }
  html::-webkit-scrollbar,
  body::-webkit-scrollbar {
    display: none !important;
    width: 0 !important;
    height: 0 !important;
  }
  body {
    top: 0 !important;
    padding-inline: 4px 10px !important;
    box-sizing: border-box !important;
  }
  form,
  .constructor,
  .simple-form,
  [class*="constructor"],
  [class*="search-form"],
  [class*="SearchForm"] {
    overflow: visible !important;
    max-width: 100% !important;
    box-sizing: border-box !important;
  }
  /* Autocomplete list is appended to body and must never be clipped/hidden. */
  #items,
  #items.on,
  #items .item,
  #p1,
  #p1 * {
    visibility: visible !important;
    clip: auto !important;
    clip-path: none !important;
    pointer-events: auto !important;
  }
  #items.on {
    display: block !important;
    overflow: visible !important;
    z-index: 2147483646 !important;
    background: #fff !important;
    opacity: 1 !important;
  }
  /* Official widget: full teal square magnifying-glass on the FAR RIGHT. */
  button[type="submit"],
  input[type="submit"],
  .btn-search,
  .search-btn,
  [class*="search-btn"],
  [class*="btn-find"],
  [class*="find-btn"] {
    flex-shrink: 0 !important;
    visibility: visible !important;
    opacity: 1 !important;
    clip: auto !important;
    clip-path: none !important;
    overflow: visible !important;
  }
  .datepicker-modal,
  .timepicker-modal,
  .air-datepicker,
  .air-datepicker-global-container,
  .air-datepicker-overlay,
  [class*="air-datepicker"],
  [class*="calendar"],
  [class*="Calendar"],
  [class*="datepicker"],
  [class*="DatePicker"],
  [class*="timepicker"] {
    z-index: 2147483646 !important;
    background: #fff !important;
    opacity: 1 !important;
  }
  /* Hide marketing chrome only. Never hide #p1 or the results list. */
  #kHelp,
  [id^="kayako"],
  .kayako-widget,
  #breadcrumbs,
  .reviews__platforms,
  .reviews__main,
  [class*="trustpilot"],
  iframe[src*="trustpilot"],
  .how-it-works,
  #how,
  [id*="how-it-works"],
  [class*="how-it-works"],
  [class*="howitworks"],
  #faq,
  .faq-block,
  [class*="b_faq"],
  #counter,
  .counter-block,
  #benefits,
  .benefits-block,
  #descr,
  .description-block,
  #about,
  .about-block,
  #map,
  .map-block,
  .breadcrumbs,
  #poweredby,
  .poweredby,
  [class*="powered_by"],
  [class*="powered-by"],
  a[href*="travelpayouts.com"],
  #we_use_cookie,
  .toTop,
  #numbers,
  .numbers-block,
  #assortment,
  #reliable,
  #extended,
  .extended-service,
  #why,
  .why-choose,
  #easybook {
    display: none !important;
  }
`;

/** Same-origin CSS: white LTR constructor, opaque calendar, Trustpilot-only hides. */
export function tryInjectIntuiPickerCss(iframe: HTMLIFrameElement): boolean {
  try {
    const doc = iframe.contentDocument;
    if (!doc) return false;
    const existing = doc.getElementById("alrayyan-intui-picker");
    if (existing) {
      existing.textContent = INTUI_PICKER_CSS;
      return true;
    }
    const style = doc.createElement("style");
    style.id = "alrayyan-intui-picker";
    style.textContent = INTUI_PICKER_CSS;
    (doc.head || doc.documentElement).appendChild(style);
    return true;
  } catch {
    return false;
  }
}

export function forceIntuiUsdCookies(doc: Document): void {
  const maxAge = 84000;
  const parts = [
    `def_curr=USD; path=/; max-age=${maxAge}`,
    `currency=USD; path=/; max-age=${maxAge}`,
    `curr=USD; path=/; max-age=${maxAge}`,
  ];
  for (const cookie of parts) {
    doc.cookie = cookie;
  }
  const win = doc.defaultView;
  if (!win) return;
  try {
    win.localStorage.setItem("def_curr", "USD");
    win.localStorage.setItem("currency", "USD");
    win.localStorage.setItem("curr", "USD");
  } catch {
    // private mode
  }
}

export function clickIntuiUsdSelector(doc: Document): void {
  const nodes = doc.querySelectorAll<HTMLElement>(
    "select, [data-currency], [name='currency'], [name='curr'], [name='def_curr']"
  );
  for (const node of nodes) {
    if (node instanceof HTMLSelectElement) {
      const usd = Array.from(node.options).find((opt) =>
        /usd|us\$|\$/i.test(`${opt.value} ${opt.text}`)
      );
      if (usd && node.value !== usd.value) {
        node.value = usd.value;
        node.dispatchEvent(new Event("change", { bubbles: true }));
      }
      continue;
    }
    const label = `${node.getAttribute("data-currency") || ""} ${node.textContent || ""}`;
    if (/usd/i.test(label) && !/eur/i.test(label)) {
      node.click();
    }
  }
}

type FetchLike = typeof fetch;

function rewriteFindRequestUrl(raw: string, origin: string): string {
  if (!raw || !/find\.intui\.travel/i.test(raw)) return raw;
  return raw.replace(
    /https?:\/\/find\.intui\.travel/gi,
    `${origin}${INTUI_FIND_PROXY_PATH}`
  );
}

export function patchIntuiFindFetch(doc: Document): void {
  const win = doc.defaultView as
    | (Window & { __alrayyanFindPatched?: boolean; XMLHttpRequest: typeof XMLHttpRequest })
    | null;
  if (!win || win.__alrayyanFindPatched) return;
  win.__alrayyanFindPatched = true;
  const origin = win.location.origin;

  if (typeof win.fetch === "function") {
    const orig = win.fetch.bind(win) as FetchLike;
    win.fetch = ((input: RequestInfo | URL, init?: RequestInit) => {
      const raw =
        typeof input === "string"
          ? input
          : input instanceof URL
            ? input.toString()
            : input.url;
      const next = rewriteFindRequestUrl(raw, origin);
      if (next === raw) return orig(input, init);
      if (typeof input === "string" || input instanceof URL) {
        return orig(next, init);
      }
      return orig(new Request(next, input), init);
    }) as FetchLike;
  }

  const Xhr = win.XMLHttpRequest;
  if (typeof Xhr === "function") {
    const origOpen = Xhr.prototype.open;
    Xhr.prototype.open = function (
      this: XMLHttpRequest,
      method: string,
      url: string | URL,
      async?: boolean,
      username?: string | null,
      password?: string | null
    ) {
      const raw = typeof url === "string" ? url : url.toString();
      const next = rewriteFindRequestUrl(raw, origin);
      return origOpen.call(this, method, next, async ?? true, username, password);
    };
  }
}

function setInputValue(el: Element, value: string): void {
  const input = el as HTMLInputElement;
  if (!value) return;
  input.value = value;
  input.dispatchEvent(new Event("input", { bubbles: true }));
  input.dispatchEvent(new Event("change", { bubbles: true }));
}

function fieldKey(el: Element): string {
  return `${el.getAttribute("name") || ""} ${el.getAttribute("id") || ""} ${el.getAttribute("placeholder") || ""} ${el.getAttribute("aria-label") || ""}`.toLowerCase();
}

/** Prefill same-origin /intui constructor fields from homepage /transfers query. */
export function fillIntuiSearchForm(
  doc: Document,
  query: IntuiSearchQuery
): boolean {
  const hasQuery = query.from || query.to || query.date || query.time || query.guests;
  if (!hasQuery) return false;
  const fields = Array.from(doc.querySelectorAll("input, select, textarea"));
  let filled = 0;
  for (const el of fields) {
    const name = fieldKey(el);
    if (
      query.from &&
      /from|pickup|pick|origin|fn\b/.test(name) &&
      !/to|drop|dest|return/.test(name)
    ) {
      setInputValue(el, query.from);
      filled += 1;
    }
    if (query.to && /to|drop|dest|destination|tn\b/.test(name)) {
      setInputValue(el, query.to);
      filled += 1;
    }
    if (query.date && /date/.test(name)) {
      const input = el as HTMLInputElement;
      setInputValue(el, input.type === "date" ? query.date : toIntuiDmyDate(query.date) || query.date);
      filled += 1;
    }
    if (query.time && /time/.test(name)) {
      setInputValue(el, query.time);
      filled += 1;
    }
    if (query.guests && /guest|passenger|pax|adult/.test(name)) {
      setInputValue(el, query.guests);
      filled += 1;
    }
  }
  return filled > 0;
}

export function submitIntuiSearchForm(doc: Document): boolean {
  const marked = doc.documentElement.getAttribute("data-alrayyan-autosubmit");
  if (marked === "1") return false;
  const submit =
    doc.querySelector<HTMLElement>("button[type='submit']") ||
    doc.querySelector<HTMLElement>("input[type='submit']") ||
    doc.querySelector<HTMLElement>("[class*='search-btn']") ||
    doc.querySelector<HTMLElement>("[class*='btn-find']") ||
    Array.from(doc.querySelectorAll("button")).find((btn) =>
      /find|search|ابحث|بحث/i.test(btn.textContent || "")
    );
  if (!submit) return false;
  doc.documentElement.setAttribute("data-alrayyan-autosubmit", "1");
  submit.click();
  return true;
}

export function enhanceIntuiProxiedDocument(
  iframe: HTMLIFrameElement,
  pageLocale: string,
  query?: IntuiSearchQuery
): boolean {
  try {
    const doc = iframe.contentDocument;
    if (!doc?.body) return false;
    forceIntuiUsdCookies(doc);
    patchIntuiFindFetch(doc);
    tryInjectIntuiPickerCss(iframe);
    clickIntuiUsdSelector(doc);
    if (query) fillIntuiSearchForm(doc, query);
    if (pageLocale === "ar") {
      applyTpembLabelDictionary(doc.body);
    }
    return true;
  } catch {
    return false;
  }
}

export function parseIntuiHeightMessage(data: unknown): number | null {
  if (typeof data === "number" && data > 400 && data < 20000) return Math.round(data);
  if (typeof data === "string") {
    const sizer = data.match(/\[iFrameSizer\][^:]*:(\d+)/);
    if (sizer) {
      const h = Number(sizer[1]);
      return h > 400 ? h : null;
    }
    const raw = Number(data);
    return raw > 400 && raw < 20000 ? Math.round(raw) : null;
  }
  if (data && typeof data === "object") {
    const rec = data as Record<string, unknown>;
    const nested =
      rec.iframe && typeof rec.iframe === "object"
        ? (rec.iframe as Record<string, unknown>)
        : rec;
    const candidate = [nested.height, nested.iframeHeight, rec.height, rec.iframeHeight];
    for (const value of candidate) {
      const n = Number(value);
      if (n > 400 && n < 20000) return Math.round(n);
    }
  }
  return null;
}

export function injectTpembScript(mount: HTMLElement, scriptUrl: string): HTMLScriptElement {
  const script = document.createElement("script");
  script.charset = "utf-8";
  script.src = scriptUrl;
  mount.appendChild(script);
  return script;
}

function replaceMappedLabels(root: Node): void {
  const owner = root.ownerDocument || document;
  const walker = owner.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  const pending: Text[] = [];
  while (walker.nextNode()) pending.push(walker.currentNode as Text);
  for (const text of pending) {
    const parent = text.parentElement;
    if (!parent || parent.closest(`[${LABEL_MARK}]`)) continue;
    if (/^(script|style|textarea|input)$/i.test(parent.tagName)) continue;
    const raw = text.textContent || "";
    const trimmed = raw.trim();
    const mapped = TPEMB_AR_LABELS[trimmed];
    if (!mapped) continue;
    text.textContent = raw.replace(trimmed, mapped);
    parent.setAttribute(LABEL_MARK, "1");
  }
}

export function applyTpembLabelDictionary(root: HTMLElement): void {
  replaceMappedLabels(root);
  const visit = (node: ParentNode) => {
    for (const el of node.querySelectorAll("*")) {
      if (el.shadowRoot) {
        replaceMappedLabels(el.shadowRoot);
        visit(el.shadowRoot);
      }
    }
  };
  visit(root);
}

export function unlockTpembOverflow(root: HTMLElement): void {
  root.style.height = "auto";
  root.style.maxHeight = "none";
  root.style.overflow = "visible";
  const win = window as Window & {
    iFrameResize?: (opts: Record<string, unknown>, target: HTMLIFrameElement) => void;
  };
  for (const iframe of root.querySelectorAll("iframe")) {
    iframe.style.maxHeight = "none";
    iframe.style.overflow = "visible";
    iframe.setAttribute("scrolling", "no");
    if (typeof win.iFrameResize === "function") {
      try {
        win.iFrameResize(
          { checkOrigin: false, heightCalculationMethod: "lowestElement" },
          iframe
        );
      } catch {
        // iframeResizer may already be bound
      }
    }
  }
}

export function relocateSearchAbove(
  widgetRoot: HTMLElement,
  searchSlot: HTMLElement
): boolean {
  const search =
    widgetRoot.querySelector<HTMLElement>("form") ||
    widgetRoot.querySelector<HTMLElement>("[class*='SearchForm']") ||
    widgetRoot.querySelector<HTMLElement>("[class*='search-form']");
  if (!search || searchSlot.contains(search)) return false;
  if (search === widgetRoot || search.contains(widgetRoot)) return false;
  const height = search.getBoundingClientRect().height;
  if (height > 420) return false;
  searchSlot.appendChild(search);
  return true;
}
