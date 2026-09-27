/**
 * Branded flight-booking redirect: allowlist, query parsing, and same-origin
 * /tpwl/ intercept so the top window shows /flights/redirect instead of
 * the generic tpemb.com spinner.
 */

export const FLIGHTS_REDIRECT_PATH = "/flights/redirect";
export const FLIGHTS_REDIRECT_DELAY_MS = 2500;

/** https hosts we will navigate to after the interstitial. */
const ALLOWED_HOST_SUFFIXES = [
  "tpemb.com",
  "travelpayouts.com",
  "aviasales.com",
  "aviasales.ru",
  "hotellook.com",
  "kayak.com",
  "kayak.ae",
  "kayak.co.uk",
  "kayak.de",
  "kayak.fr",
  "kayak.it",
  "kayak.es",
  "kayak.com.au",
  "gotogate.com",
  "kiwi.com",
  "mytrip.com",
  "cheapflights.com",
  "cheapflights.ae",
  "momondo.com",
  "skyscanner.net",
  "skyscanner.com",
  "expedia.com",
  "expedia.ae",
  "booking.com",
  "trip.com",
  "edreams.com",
  "edreams.net",
  "lastminute.com",
  "opodo.com",
  "travelocity.com",
  "orbitz.com",
  "priceline.com",
  "cheapoair.com",
  "justfly.com",
  "flightnetwork.com",
  "budgetair.com",
  "travix.com",
  "travelgenio.com",
  "wayaway.io",
  "wayaway.com",
  "jetcost.com",
  "wego.com",
  "onetwotrip.com",
  "anywayanyday.com",
  "ozon.travel",
  "city.travel",
  "kupibilet.ru",
  "tickets.ru",
  "tickets.ua",
  "biletix.ru",
  "tutu.ru",
  "mego.travel",
  "kissandfly.com",
  "tripsta.com",
  "airpaz.com",
  "google.com",
  "google.ae",
  "turkishairlines.com",
  "emirates.com",
  "flydubai.com",
  "etihad.com",
  "qatarairways.com",
  "pegasusairlines.com",
  "flypgs.com",
  "sunexpress.com",
  "ajet.com",
  "lufthansa.com",
  "airfrance.com",
  "klm.com",
  "britishairways.com",
] as const;

/** Brand label sitting on a known public suffix (kayak.ae, tickets.kiwi.com). */
const ALLOWED_BRAND_LABELS = new Set([
  "kayak",
  "gotogate",
  "aviasales",
  "kiwi",
  "momondo",
  "skyscanner",
  "mytrip",
  "cheapflights",
  "expedia",
  "booking",
  "edreams",
  "opodo",
  "wego",
  "jetcost",
]);

const PUBLIC_SUFFIXES = [
  "com",
  "net",
  "org",
  "io",
  "ru",
  "ae",
  "ua",
  "co.uk",
  "com.au",
  "co.il",
  "com.tr",
] as const;

const BLOCKED_PROTOCOLS = [
  "javascript:",
  "data:",
  "vbscript:",
  "blob:",
  "file:",
];

type NavigateEventLike = Event & {
  destination?: { url?: string };
  canIntercept?: boolean;
  intercept?: (options: { handler: () => void | Promise<void> }) => void;
};

function normalizeHostname(hostname: string): string {
  return hostname.toLowerCase().replace(/\.$/, "");
}

function hostMatchesSuffix(hostname: string, suffix: string): boolean {
  const host = normalizeHostname(hostname);
  return host === suffix || host.endsWith(`.${suffix}`);
}

function isBrandAtRegisteredDomain(hostname: string): boolean {
  const host = normalizeHostname(hostname).replace(/^www\./, "");
  for (const suffix of PUBLIC_SUFFIXES) {
    if (!host.endsWith(`.${suffix}`) && host !== suffix) continue;
    const rest = host === suffix ? "" : host.slice(0, -(suffix.length + 1));
    const label = rest.split(".").pop() || "";
    if (ALLOWED_BRAND_LABELS.has(label)) return true;
  }
  return false;
}

export function sanitizeGateName(raw: string | null | undefined): string {
  if (!raw) return "";
  return raw
    .replace(/[<>]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 80);
}

export function parseAbsoluteHttpsUrl(raw: string, base?: string): URL | null {
  const trimmed = String(raw || "").trim();
  if (!trimmed) return null;
  const lower = trimmed.toLowerCase();
  if (BLOCKED_PROTOCOLS.some((protocol) => lower.startsWith(protocol))) {
    return null;
  }
  try {
    const url = base ? new URL(trimmed, base) : new URL(trimmed);
    if (url.protocol !== "https:") return null;
    if (url.username || url.password) return null;
    if (!url.hostname) return null;
    return url;
  } catch {
    return null;
  }
}

export function isAllowedRedirectHost(hostname: string): boolean {
  const host = normalizeHostname(hostname);
  if (!/^[a-z0-9.-]+$/.test(host)) return false;
  if (ALLOWED_HOST_SUFFIXES.some((suffix) => hostMatchesSuffix(host, suffix))) {
    return true;
  }
  return isBrandAtRegisteredDomain(host);
}

export function isAllowedRedirectTarget(raw: string, base?: string): boolean {
  const url = parseAbsoluteHttpsUrl(raw, base);
  if (!url) return false;
  return isAllowedRedirectHost(url.hostname);
}

export function isTravelpayoutsRedirectUrl(raw: string, base?: string): boolean {
  const url = parseAbsoluteHttpsUrl(raw, base);
  if (!url) return false;
  const path = url.pathname.toLowerCase();
  if (hostMatchesSuffix(url.hostname, "tpemb.com")) return true;
  if (hostMatchesSuffix(url.hostname, "travelpayouts.com")) {
    return /redirect|click|go|wl/.test(path);
  }
  return /\/wl\/redirect/i.test(path);
}

export function gateNameFromUrl(raw: string, base?: string): string {
  const url = parseAbsoluteHttpsUrl(raw, base);
  if (!url) return "";
  return sanitizeGateName(
    url.searchParams.get("gate_name") ||
      url.searchParams.get("gate") ||
      url.searchParams.get("partner") ||
      url.searchParams.get("agency")
  );
}

export function buildFlightsRedirectHref(targetUrl: string, gate?: string): string {
  const params = new URLSearchParams();
  params.set("url", targetUrl);
  const name = sanitizeGateName(gate) || gateNameFromUrl(targetUrl);
  if (name) {
    params.set("gate", name);
    params.set("gate_name", name);
  }
  return `${FLIGHTS_REDIRECT_PATH}?${params.toString()}`;
}

export function resolveFlightsRedirectTarget(
  rawUrl: string | null | undefined,
  rawGate?: string | null
): { url: string; gate: string } | null {
  if (!rawUrl) return null;
  const url = parseAbsoluteHttpsUrl(rawUrl);
  if (!url || !isAllowedRedirectHost(url.hostname)) return null;
  return {
    url: url.href,
    gate:
      sanitizeGateName(rawGate) ||
      gateNameFromUrl(url.href),
  };
}

function asElement(value: EventTarget | null): Element | null {
  if (!value || (value as Node).nodeType !== 1) return null;
  return value as Element;
}

function closest(el: Element, selector: string): Element | null {
  if (typeof el.closest !== "function") return null;
  return el.closest(selector);
}

function composedTargets(event: Event): EventTarget[] {
  if (typeof event.composedPath === "function") {
    return event.composedPath();
  }
  const path: EventTarget[] = [];
  let node: EventTarget | null = event.target;
  while (node) {
    path.push(node);
    node = (node as Node).parentNode;
  }
  return path;
}

function firstMatchingInPath(event: Event, selector: string): Element | null {
  for (const target of composedTargets(event)) {
    const el = asElement(target);
    if (!el) continue;
    if (typeof el.matches === "function" && el.matches(selector)) return el;
    const nested = closest(el, selector);
    if (nested) return nested;
  }
  return null;
}

function readWindowHref(win: Window): string {
  try {
    return win.location.href;
  } catch {
    return "";
  }
}

function navigateTopToInterstitial(targetUrl: string, gate?: string): void {
  const href = buildFlightsRedirectHref(targetUrl, gate);
  try {
    if (window.top && window.top !== window) {
      window.top.location.assign(href);
      return;
    }
  } catch {
    // fall through to same-window assign
  }
  window.location.assign(href);
}

function resolveInterceptHref(
  raw: string,
  base: string
): { href: string; gate: string } | null {
  if (!raw || raw === "#" || raw.toLowerCase().startsWith("javascript:")) {
    return null;
  }
  if (!isTravelpayoutsRedirectUrl(raw, base)) return null;
  const url = parseAbsoluteHttpsUrl(raw, base);
  if (!url) return null;
  return { href: url.href, gate: gateNameFromUrl(url.href, base) };
}

function patchOpen(win: Window): () => void {
  const original = win.open;
  win.open = function patchedOpen(
    url?: string | URL,
    target?: string,
    features?: string
  ) {
    const href = url == null ? "" : String(url);
    const hit = resolveInterceptHref(href, win.location.href);
    if (hit) {
      navigateTopToInterstitial(hit.href, hit.gate);
      return null;
    }
    return original.call(win, url, target, features);
  };
  return () => {
    win.open = original;
  };
}

function interceptLocationWrite(raw: string, currentHref: string, fallback: () => void): void {
  const hit = resolveInterceptHref(raw, currentHref);
  if (hit) {
    navigateTopToInterstitial(hit.href, hit.gate);
    return;
  }
  fallback();
}

function patchLocationHref(win: Window): () => void {
  try {
    const loc = win.location;
    const proto = Object.getPrototypeOf(loc) as Location;
    const desc =
      Object.getOwnPropertyDescriptor(loc, "href") ||
      Object.getOwnPropertyDescriptor(proto, "href") ||
      Object.getOwnPropertyDescriptor(Location.prototype, "href");
    if (!desc?.get || !desc?.set || desc.configurable === false) {
      return () => {};
    }
    Object.defineProperty(loc, "href", {
      configurable: true,
      enumerable: desc.enumerable,
      get() {
        return desc.get!.call(loc);
      },
      set(value: string) {
        interceptLocationWrite(String(value), desc.get!.call(loc), () => {
          desc.set!.call(loc, value);
        });
      },
    });
    return () => {
      try {
        Object.defineProperty(loc, "href", desc);
      } catch {
        // location href restore is best-effort
      }
    };
  } catch {
    return () => {};
  }
}

function patchLocationPrototypeHref(): () => void {
  try {
    const desc = Object.getOwnPropertyDescriptor(Location.prototype, "href");
    if (!desc?.get || !desc?.set || desc.configurable === false) {
      return () => {};
    }
    Object.defineProperty(Location.prototype, "href", {
      configurable: true,
      enumerable: desc.enumerable,
      get() {
        return desc.get!.call(this);
      },
      set(value: string) {
        interceptLocationWrite(String(value), desc.get!.call(this), () => {
          desc.set!.call(this, value);
        });
      },
    });
    return () => {
      Object.defineProperty(Location.prototype, "href", desc);
    };
  } catch {
    return () => {};
  }
}

function patchLocationMethods(win: Window): () => void {
  try {
    const loc = win.location;
    const originalAssign = loc.assign.bind(loc);
    const originalReplace = loc.replace.bind(loc);
    loc.assign = (url: string | URL) => {
      interceptLocationWrite(String(url), loc.href, () => originalAssign(url));
    };
    loc.replace = (url: string | URL) => {
      interceptLocationWrite(String(url), loc.href, () => originalReplace(url));
    };
    const unpatchHref = patchLocationHref(win);
    return () => {
      loc.assign = originalAssign;
      loc.replace = originalReplace;
      unpatchHref();
    };
  } catch {
    return () => {};
  }
}

function patchNavigateApi(win: Window): () => void {
  const navigation = (win as Window & { navigation?: EventTarget }).navigation;
  if (!navigation || typeof navigation.addEventListener !== "function") {
    return () => {};
  }
  const onNavigate = (event: Event) => {
    const e = event as NavigateEventLike;
    const dest = e.destination?.url;
    if (!dest) return;
    const hit = resolveInterceptHref(dest, win.location.href);
    if (!hit) return;
    if (typeof e.intercept === "function" && e.canIntercept) {
      e.intercept({
        handler: () => {
          navigateTopToInterstitial(hit.href, hit.gate);
        },
      });
      return;
    }
    e.preventDefault();
    navigateTopToInterstitial(hit.href, hit.gate);
  };
  navigation.addEventListener("navigate", onNavigate);
  return () => navigation.removeEventListener("navigate", onNavigate);
}

function attachDocumentIntercept(doc: Document, win: Window): () => void {
  const base = () => readWindowHref(win) || doc.baseURI || "";

  const onClick = (event: Event) => {
    const holder = firstMatchingInPath(
      event,
      "a[href], area[href], [data-href], [data-url], [data-redirect]"
    );
    if (!holder) return;
    const raw =
      holder.getAttribute("href") ||
      holder.getAttribute("data-href") ||
      holder.getAttribute("data-url") ||
      holder.getAttribute("data-redirect") ||
      "";
    const hit = resolveInterceptHref(raw, base());
    if (!hit) return;
    event.preventDefault();
    event.stopPropagation();
    if (typeof event.stopImmediatePropagation === "function") {
      event.stopImmediatePropagation();
    }
    const gate =
      sanitizeGateName(
        holder.getAttribute("data-gate") ||
          holder.getAttribute("data-gate-name") ||
          holder.getAttribute("data-partner")
      ) || hit.gate;
    navigateTopToInterstitial(hit.href, gate);
  };

  const onSubmit = (event: Event) => {
    const form = firstMatchingInPath(event, "form") || asElement(event.target);
    if (!form) return;
    const action =
      form.getAttribute("action") ||
      (form as HTMLFormElement).action ||
      "";
    const hit = resolveInterceptHref(action, base());
    if (!hit) return;
    const target = String(form.getAttribute("target") || "").toLowerCase();
    if (target && !["_top", "_blank", "_parent", "_self"].includes(target)) {
      return;
    }
    event.preventDefault();
    event.stopPropagation();
    navigateTopToInterstitial(hit.href, hit.gate);
  };

  doc.addEventListener("click", onClick, true);
  doc.addEventListener("submit", onSubmit, true);
  const unpatchOpen = patchOpen(win);
  const unpatchLoc = patchLocationMethods(win);
  const unpatchNav = patchNavigateApi(win);

  return () => {
    doc.removeEventListener("click", onClick, true);
    doc.removeEventListener("submit", onSubmit, true);
    unpatchOpen();
    unpatchLoc();
    unpatchNav();
  };
}

function redirectIfTravelpayoutsHref(raw: string | null | undefined): boolean {
  if (!raw) return false;
  const hit = resolveInterceptHref(raw, raw);
  if (!hit) return false;
  navigateTopToInterstitial(hit.href, hit.gate);
  return true;
}

/**
 * Install click / window.open / location / form intercept on the same-origin
 * WL iframe and the top window. Ticket details live in open shadow roots, so
 * click handling uses composedPath. Safe to call repeatedly; returns cleanup.
 */
export function attachTravelpayoutsRedirectIntercept(
  iframe: HTMLIFrameElement
): () => void {
  let detachDoc: (() => void) | null = null;
  let attachedDoc: Document | null = null;
  let lastSeenHref = "";

  const readFrameHref = (): string | null => {
    try {
      const href = iframe.contentWindow?.location.href;
      return href || null;
    } catch {
      return null;
    }
  };

  const attachToDoc = () => {
    const href = readFrameHref();
    if (href && href !== lastSeenHref) {
      lastSeenHref = href;
      if (redirectIfTravelpayoutsHref(href)) return;
    }

    const doc = iframe.contentDocument;
    const win = iframe.contentWindow;
    if (!doc?.documentElement || !win) return;
    if (attachedDoc === doc) return;
    detachDoc?.();
    attachedDoc = doc;
    detachDoc = attachDocumentIntercept(doc, win);

    const onFrameUnload = () => {
      const leaving = readFrameHref();
      redirectIfTravelpayoutsHref(leaving);
    };
    win.addEventListener("beforeunload", onFrameUnload);
    win.addEventListener("unload", onFrameUnload);
    const prevDetach = detachDoc;
    detachDoc = () => {
      try {
        win.removeEventListener("beforeunload", onFrameUnload);
        win.removeEventListener("unload", onFrameUnload);
      } catch {
        // document already gone
      }
      prevDetach?.();
    };
  };

  const onLoad = () => {
    attachedDoc = null;
    attachToDoc();
  };
  iframe.addEventListener("load", onLoad);
  attachToDoc();

  const unpatchTopOpen = patchOpen(window);
  const unpatchTopLoc = patchLocationMethods(window);
  const unpatchTopNav = patchNavigateApi(window);
  const unpatchProto = patchLocationPrototypeHref();
  const intervalId = window.setInterval(attachToDoc, 250);

  return () => {
    iframe.removeEventListener("load", onLoad);
    window.clearInterval(intervalId);
    detachDoc?.();
    attachedDoc = null;
    unpatchTopOpen();
    unpatchTopLoc();
    unpatchTopNav();
    unpatchProto();
  };
}
