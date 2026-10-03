#!/usr/bin/env node
/**
 * يولّد الفهرس السيادي الشامل للمنصة بنسبة 100%:
 * - واجهات الموقع العام (Storefront Pages) الـ 46
 * - مسارات APIs الإدارة (Admin API Routes) الـ 219
 * - مسارات APIs العامة والحجوزات (Public & Travel APIs)
 * - مسارات APIs تطبيقات الهواتف (Mobile APIs)
 * - مسارات APIs قطاع الشركات (B2B APIs)
 * - مهام الجدولة والكرون (Cron Jobs)
 * - بوابات التوريد الخارجية والـ GDS (External Suppliers) الـ 41
 * - قنوات الويب هوكس والرسائل (Webhooks & Gateways)
 * - مجموعات وقواعد البيانات (PocketBase Collections) الـ 62
 * - شاشات الاستوديو والمحاور والقطاعات الهولوغرافية (Studio Screens & Hubs)
 * 
 * المخرجات:
 * - src/lib/studio/index/platform-index.generated.ts
 * - src/lib/studio/index/intent-lexicon.generated.ts
 * - src/lib/studio/index/probe-routes.generated.ts
 * - docs/cyber-console/PLATFORM_INDEX.md
 */
const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");

const ROOT = path.resolve(__dirname, "..");
const APP = path.join(ROOT, "src/app");
const INDEX_DIR = path.join(ROOT, "src/lib/studio/index");
const STOREFRONT_APP = path.resolve(ROOT, "../storefront/src/app/(site)");

function norm(s) {
  return String(s)
    .replace(/[\u064B-\u0652]/g, "")
    .replace(/[أإآ]/g, "ا")
    .replace(/ة/g, "ه")
    .replace(/ى/g, "ي")
    .toLowerCase()
    .trim();
}

function uniq(arr) {
  return [...new Set(arr.filter(Boolean))];
}

function walk(dir, pred) {
  const out = [];
  if (!fs.existsSync(dir)) return out;
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) out.push(...walk(p, pred));
    else if (pred(p)) out.push(p);
  }
  return out;
}

function loadBundledSources() {
  const out = "/tmp/platform-index-sources.cjs";
  const pnpmBin = "/root/.nvm/versions/node/v20.20.2/bin/pnpm";
  const cmd = fs.existsSync(pnpmBin) ? pnpmBin : "pnpm";
  execFileSync(
    cmd,
    [
      "exec",
      "esbuild",
      path.join(ROOT, "scripts/platform-index-bundle-entry.ts"),
      "--bundle",
      "--platform=node",
      "--format=cjs",
      `--outfile=${out}`,
      "--log-level=warning",
      `--alias:@=${path.join(ROOT, "src")}`,
    ],
    { cwd: ROOT, stdio: "inherit" }
  );
  return require(out);
}

function parseAtlasGroups() {
  const mapsPath = path.join(ROOT, "src/lib/studio/graph/maps.ts");
  const src = fs.readFileSync(mapsPath, "utf8");
  const block = src.match(/const GROUPS:[\s\S]*?= (\{[\s\S]*?\n\};)/);
  if (!block) return {};
  const groups = {};
  const groupRe = /(\w+):\s*\{[^}]*label:\s*"([^"]+)"[^}]*screens:\s*\[([^\]]*)\][^}]*leaves:\s*\[([\s\S]*?)\]\s*\}/g;
  let m;
  while ((m = groupRe.exec(block[1]))) {
    const id = m[1];
    const label = m[2];
    const screens = m[3]
      .split(",")
      .map((s) => s.replace(/"/g, "").trim())
      .filter(Boolean);
    const leavesRaw = m[4];
    const leaves = [];
    const leafRe = /\["([^"]+)",\s*"([^"]+)"\]/g;
    let lm;
    while ((lm = leafRe.exec(leavesRaw))) leaves.push({ id: lm[1], label: lm[2] });
    groups[id] = { id, label, screens, leaves };
  }
  return groups;
}

function parseLeafCollections() {
  const mapsPath = path.join(ROOT, "src/lib/studio/graph/maps.ts");
  const src = fs.readFileSync(mapsPath, "utf8");
  const block = src.match(/const LEAF_COLLECTION:[\s\S]*?= (\{[\s\S]*?\n\};)/);
  if (!block) return {};
  const out = {};
  const re = /"([^"]+)":\s*"([^"]+)"/g;
  let m;
  while ((m = re.exec(block[1]))) out[m[1]] = m[2];
  return out;
}

function apiPathFromFile(file) {
  const rel = path.relative(path.join(APP, "api/admin"), file).replace(/\\/g, "/");
  const segs = rel.split("/");
  segs.pop();
  let route = "/api/admin/" + segs.join("/");
  route = route.replace(/\/\[([^\]]+)\]/g, "/:$1");
  return route;
}

function generalApiPathFromFile(file) {
  const rel = path.relative(path.join(APP, "api"), file).replace(/\\/g, "/");
  const segs = rel.split("/");
  segs.pop();
  let route = "/api/" + segs.join("/");
  route = route.replace(/\/\[\.\.\.([^\]]+)\]/g, "/*$1").replace(/\/\[([^\]]+)\]/g, "/:$1");
  return route;
}

function adminHrefFromPage(file) {
  const rel = path.relative(path.join(APP, "admin"), file).replace(/\\/g, "/");
  if (rel === "page.tsx") return "/admin";
  const dir = rel.replace(/\/page\.tsx$/, "");
  return "/admin/" + dir.replace(/\[([^\]]+)\]/g, ":$1");
}

function storefrontInfoFromPage(file) {
  const rel = path.relative(STOREFRONT_APP, file).replace(/\\/g, "/");
  const isRoot = rel === "page.tsx";
  const dir = isRoot ? "" : rel.replace(/\/page\.tsx$/, "");
  const href = isRoot ? "/" : "/" + dir.replace(/\[([^\]]+)\]/g, ":$1");
  const slug = isRoot ? "home" : dir.replace(/[/:]/g, "_").replace(/[\[\]]/g, "");

  const titleMap = {
    "": { ar: "الصفحة الرئيسية لموقع لوناليزا العام", en: "Storefront Home" },
    "about": { ar: "من نحن ومعلومات المنصة والترخيص السياحي", en: "About Us" },
    "hotels": { ar: "كتالوج وحجز الفنادق والإقامة العالمية", en: "Hotels Catalog" },
    "hotels/[slug]": { ar: "تفاصيل وحجز الفندق المختار والغرف", en: "Hotel Details" },
    "hotels/book": { ar: "إتمام ودفع حجز الفندق", en: "Hotel Booking Checkout" },
    "flights": { ar: "حجز تذاكر الطيران والرحلات الجوية المباشرة", en: "Flights Booking" },
    "flights/search": { ar: "نتائج بحث ومقارنة أسعار الطيران", en: "Flight Search Results" },
    "flights/booking": { ar: "إتمام حجز وإصدار تذاكر الطيران", en: "Flight Checkout" },
    "flights/redirect": { ar: "تحويل حجز الطيران إلى شريك الطيران", en: "Flight Partner Redirect" },
    "transfers": { ar: "خدمات النقل وتوصيل المطار في عموم تركيا والعالم", en: "Airport Transfers" },
    "transfers/[slug]": { ar: "تفاصيل مسار خدمة التوصيل والنقل", en: "Transfer Route Details" },
    "holidays": { ar: "باقات العطلات والرحلات السياحية المتكاملة", en: "Holiday Packages" },
    "holidays/[destination]": { ar: "عطلات وباقات الوجهة السياحية المختارة", en: "Destination Holidays" },
    "package/[slug]": { ar: "تفاصيل باقة العطلة المختارة وبرنامج الرحلة", en: "Holiday Package Details" },
    "package/[slug]/book": { ar: "حجز باقة العطلة السياحية", en: "Package Booking" },
    "package/book": { ar: "إتمام حجز باقات السفر والعطلات", en: "Holiday Package Checkout" },
    "tours": { ar: "الجولات السياحية اليومية والأنشطة والفعاليات", en: "Tours & Excursions" },
    "uae-tours": { ar: "جولات ورحلات الإمارات ودبي السياحية", en: "UAE & Dubai Tours" },
    "vip-tours": { ar: "الجولات السياحية الخاصة وخدمات VIP الفاخرة", en: "VIP Luxury Tours" },
    "vip-tours/[slug]": { ar: "تفاصيل الجولة السياحية الخاصة VIP", en: "VIP Tour Details" },
    "cars": { ar: "تأجير السيارات السياحية بسائق وبدون سائق", en: "Car Rentals" },
    "flight-tracker": { ar: "رادار تتبع الرحلات الجوية ومواعيد الهبوط والإقلاع", en: "Live Flight Tracker" },
    "community": { ar: "مجتمع المسافرين والقصص وريلز السفر", en: "Traveler Community" },
    "community/reels": { ar: "ريلز وفيديوهات السفر والمغامرات القصيرة", en: "Travel Reels" },
    "community/buddies": { ar: "البحث عن رفقاء ومشاركي السفر", en: "Travel Buddies Finder" },
    "community/user/[id]": { ar: "الملف الشخصي للمسافر في المجتمع", en: "Traveler Profile" },
    "community/leaderboard": { ar: "لوحة شرف مجتمع المسافرين وكبار المكتشفين", en: "Community Leaderboard" },
    "ai-chat": { ar: "الشات السياحي الذكي ومساعد الحجز الذاتي", en: "AI Travel Assistant" },
    "gift-cards": { ar: "بطاقات الهدايا وقسائم الرصيد السياحي", en: "Gift Cards & Vouchers" },
    "visa": { ar: "خدمات التأشيرات واستشارات السفر والدعم القنصلي", en: "Visa Services" },
    "blog": { ar: "مدونة السفر والمقالات والدلائل السياحية", en: "Travel Blog & Guides" },
    "blog/[slug]": { ar: "مقال ودليل سياحي تفصيلي في المدونة", en: "Blog Article" },
    "contact": { ar: "تواصل معنا وخدمة العملاء والدعم المباشر", en: "Contact & Support" },
    "terms": { ar: "الشروط والأحكام وسياسة الاستخدام المعتمدة", en: "Terms of Service" },
    "privacy": { ar: "سياسة الخصوصية وحماية بيانات العملاء", en: "Privacy Policy" },
    "gdpr": { ar: "حقوق الخصوصية والامتثال للائحة الأوروبية GDPR", en: "GDPR Compliance" },
    "invoice/verify": { ar: "التحقق من صحة الفواتير وسندات الحجز الإلكترونية", en: "Invoice Verification" },
    "account": { ar: "لوحة تحكم حساب العميل والملف الشخصي", en: "Customer Account" },
    "account/bookings/[id]": { ar: "تفاصيل وإدارة حجز العميل", en: "Booking Details" },
    "account/chat/[id]": { ar: "المحادثة المباشرة مع خدمة العملاء للحجز", en: "Customer Support Chat" },
    "account/messages/[id]": { ar: "الرسائل والإشعارات الخاصة بحساب العميل", en: "Customer Messages" },
    "account/companions/[userId]": { ar: "قائمة المرافقين والمسافرين التابعين للعميل", en: "Customer Companions" },
    "menu": { ar: "القائمة السريعة للخدمات وكتالوج المنصة", en: "Quick Services Menu" },
    "search": { ar: "محرك البحث السياحي الموحد للرحلات والفنادق", en: "Unified Travel Search" },
    "p/[slug]": { ar: "صفحة تسويقية ومحتوى مخصص للوجهات", en: "Landing Page" },
    "r/[code]": { ar: "رابط الإحالة والتسويق بالعمولة للمسوقين", en: "Affiliate Referral Link" },
  };

  const mapped = titleMap[dir] || { ar: `صفحة ${dir.replace(/[/_]/g, " ")}`, en: dir };
  return { href, slug, labelAr: mapped.ar, labelEn: mapped.en };
}

function routeMethods(file) {
  const src = fs.readFileSync(file, "utf8");
  const methods = [];
  for (const meth of ["GET", "POST", "PUT", "PATCH", "DELETE"]) {
    if (new RegExp(`export\\s+(async\\s+)?function\\s+${meth}\\b`).test(src)) methods.push(meth);
  }
  return methods.length ? methods : ["GET"];
}

const BLOCKED_ROUTE = /^\/api\/admin\/(studio\/capabilities|session|pocketbase\/superuser|env)(\/|$|\?)/;

function isSafeGetProbe(route) {
  return !BLOCKED_ROUTE.test(route);
}

function probeCapabilityId(route) {
  return (
    "probe." +
    route
      .replace(/^\/api\/admin\//, "")
      .replace(/[^a-zA-Z0-9]+/g, "_")
      .replace(/^_+|_+$/g, "")
      .slice(0, 80)
  );
}

function main() {
  const sources = loadBundledSources();
  const { DOMAIN_SCREENS, STUDIO_SCREENS, KNOWN_COLLECTIONS, listCatalogProviders, DOMAIN_THESAURUS_MAP } = sources;
  const atlasGroups = parseAtlasGroups();
  const leafCollections = parseLeafCollections();

  const nodes = [];
  const lexicon = new Map();

  function addNode(node) {
    if (nodes.some((n) => n.id === node.id)) return;
    node.keywords = uniq(node.keywords.map(norm).filter((k) => k.length >= 2));
    nodes.push(node);
    for (const kw of node.keywords) {
      const list = lexicon.get(kw) || [];
      list.push(node.id);
      lexicon.set(kw, uniq(list));
    }
  }

  function kws(...parts) {
    return uniq(parts.flatMap((p) => String(p).split(/\s+/)).map(norm));
  }

  // 1. Studio Screens (01..22)
  for (const screen of STUDIO_SCREENS) {
    addNode({
      id: `screen.${screen.id}`,
      kind: "screen",
      scope: "admin",
      screenId: screen.id,
      mapId: screen.id === "01" ? "atlas" : `screen.${screen.id}`,
      labels: { ar: screen.title, en: screen.slug },
      keywords: kws(screen.title, screen.slug, screen.scope, ...(screen.nodes || [])),
      capabilityRefs: screen.capabilities || [],
      defaultIntent: screen.id === "19" ? "briefing" : screen.id === "20" ? "navigate" : "navigate",
      risk: "low",
      evidence: "screensData.ts",
    });
  }

  // 2. Atlas Groups & Leaves
  for (const [groupId, g] of Object.entries(atlasGroups)) {
    addNode({
      id: `nav.group.${groupId}`,
      kind: "nav_group",
      scope: "admin",
      screenId: g.screens[0] || "01",
      mapId: `group.${groupId}`,
      labels: { ar: g.label },
      keywords: kws(g.label, groupId),
      capabilityRefs: [],
      defaultIntent: "navigate",
      risk: "low",
      evidence: "maps.ts:GROUPS",
      parentId: "screen.01",
    });
    for (const leaf of g.leaves) {
      const coll = leafCollections[leaf.id];
      addNode({
        id: `nav.leaf.${leaf.id}`,
        kind: "nav_leaf",
        scope: "admin",
        screenId: g.screens[0] || "01",
        mapId: `group.${groupId}`,
        labels: { ar: leaf.label },
        keywords: kws(leaf.label, leaf.id, g.label),
        collection: coll,
        capabilityRefs: coll ? [`collection.${coll}.list`, "studio.open_table"] : ["studio.navigate"],
        defaultIntent: coll ? "open_table" : "navigate",
        risk: "low",
        evidence: "maps.ts:GROUPS",
        parentId: `nav.group.${groupId}`,
      });
    }
  }

  // 3. Domain Screens, Hubs & Items
  for (const screen of DOMAIN_SCREENS) {
    addNode({
      id: `domain.screen.${screen.screenId}`,
      kind: "screen",
      scope: "admin",
      screenId: screen.screenId,
      mapId: `screen.${screen.screenId}`,
      labels: { ar: screen.title },
      keywords: kws(screen.title, screen.subtitle, ...(screen.crumbs || [])),
      href: screen.core?.href,
      capabilityRefs: ["studio.navigate"],
      defaultIntent: "navigate",
      risk: "low",
      evidence: "domain-systems.ts",
    });
    for (const hub of screen.hubs) {
      const hubNodeId = hub.id.includes(".") ? `hub.${hub.id}` : `hub.${hub.id}`;
      const id = hubNodeId.startsWith("hub.") ? hubNodeId : `hub.${hub.id}`;
      addNode({
        id,
        kind: "domain_hub",
        scope: "admin",
        screenId: screen.screenId,
        mapId: `hub.${hub.id}`,
        hubId: hub.id,
        labels: { ar: hub.label },
        keywords: kws(hub.label, ...(hub.keywords || [])),
        href: hub.href,
        capabilityRefs: ["studio.navigate"],
        defaultIntent: "navigate",
        risk: "low",
        evidence: "domain-systems.ts",
        parentId: `domain.screen.${screen.screenId}`,
      });
      hub.items.forEach((item, idx) => {
        const rawSlug = item.collection || item.route || String(idx);
        const slug = String(rawSlug).replace(/[^\w]+/g, "_").replace(/^_+|_+$/g, "").slice(0, 40) || String(idx);
        const itemId = `item.${hub.id.replace(/\./g, "__")}.${slug}`;
        const caps = [];
        if (item.collection) {
          caps.push(`collection.${item.collection}.list`, "studio.open_table", "records.list");
        }
        if (item.route) {
          const r = item.route.startsWith("/") ? item.route : `/api/admin/${item.route}`;
          if (isSafeGetProbe(r)) caps.push(probeCapabilityId(r), "admin.route.call");
        }
        addNode({
          id: itemId,
          kind: "domain_item",
          scope: "admin",
          screenId: screen.screenId,
          mapId: `hub.${hub.id}`,
          hubId: hub.id,
          labels: { ar: item.label },
          keywords: kws(item.label, hub.label, item.collection || "", item.route || ""),
          href: item.href,
          route: item.route?.startsWith("/") ? item.route : item.route ? `/api/admin/${item.route.replace(/^\/api\/admin\//, "")}` : undefined,
          collection: item.collection,
          capabilityRefs: uniq(caps),
          defaultIntent: item.collection ? "open_table" : item.route ? "probe" : "navigate",
          risk: "low",
          evidence: "domain-systems.ts",
          parentId: id,
        });
      });
    }
  }

  // 4. Admin Classic Pages
  const adminPages = walk(path.join(APP, "admin"), (p) => p.endsWith("/page.tsx") || p.endsWith("\\page.tsx"));
  for (const file of adminPages) {
    const href = adminHrefFromPage(file);
    const slug = href.replace(/^\/admin\/?/, "") || "dashboard";
    addNode({
      id: `page.admin.${slug.replace(/[/:]/g, "_")}`,
      kind: "admin_page",
      scope: "admin",
      labels: { ar: slug, en: slug },
      keywords: kws(slug.replace(/\//g, " "), href, "لوحة التحكم", "ادارة", "admin"),
      href,
      capabilityRefs: ["studio.navigate"],
      defaultIntent: "navigate",
      risk: "low",
      evidence: path.relative(ROOT, file),
    });
  }

  // 5. Storefront Public Pages (All 46 pages)
  const storefrontPages = walk(STOREFRONT_APP, (p) => p.endsWith("/page.tsx") || p.endsWith("\\page.tsx"));
  for (const file of storefrontPages) {
    const info = storefrontInfoFromPage(file);
    addNode({
      id: `page.site.${info.slug}`,
      kind: "storefront_page",
      scope: "storefront",
      labels: { ar: info.labelAr, en: info.labelEn },
      keywords: kws(info.labelAr, info.labelEn, info.href, info.slug.replace(/[_]/g, " "), "متجر", "موقع", "storefront", "site"),
      href: info.href,
      capabilityRefs: ["storefront.navigate"],
      defaultIntent: "navigate",
      risk: "low",
      evidence: path.relative(ROOT, file),
    });
  }

  // 6. Admin API Routes
  const adminApiRoutes = walk(path.join(APP, "api/admin"), (p) => p.endsWith("route.ts"));
  for (const file of adminApiRoutes) {
    const route = apiPathFromFile(file);
    const methods = routeMethods(file);
    const safeGet = methods.includes("GET") && isSafeGetProbe(route);
    const capId = safeGet ? probeCapabilityId(route) : undefined;
    addNode({
      id: `api.${route.replace(/^\/api\/admin\//, "").replace(/[/:]/g, "_")}`,
      kind: "api_route",
      scope: "admin",
      labels: { ar: route, en: route },
      keywords: kws(route.replace(/\//g, " "), route.split("/").pop()),
      route,
      methods,
      capabilityRefs: uniq([capId, "admin.route.call"].filter(Boolean)),
      defaultIntent: safeGet ? "probe" : "command",
      risk: methods.some((m) => m !== "GET") ? "medium" : "low",
      evidence: path.relative(ROOT, file),
    });
  }

  // 7. General APIs: Public Travel, Mobile, B2B, and Cron
  const allApiRoutes = walk(path.join(APP, "api"), (p) => p.endsWith("route.ts"));
  for (const file of allApiRoutes) {
    const rel = path.relative(path.join(APP, "api"), file).replace(/\\/g, "/");
    if (rel.startsWith("admin/")) continue; // already indexed above

    const route = generalApiPathFromFile(file);
    const methods = routeMethods(file);
    const safeGet = methods.includes("GET");

    let kind = "public_api";
    let scope = "public";
    let prefix = "api.public";

    if (rel.startsWith("mobile/")) {
      kind = "mobile_api";
      scope = "mobile";
      prefix = "api.mobile";
    } else if (rel.startsWith("v1/b2b/")) {
      kind = "b2b_api";
      scope = "b2b";
      prefix = "api.b2b";
    } else if (rel.startsWith("cron/")) {
      kind = "cron_job";
      scope = "cron";
      prefix = "api.cron";
    }

    const cleanSlug = route
      .replace(/^\/api\//, "")
      .replace(/^(mobile\/v1\/|mobile\/|v1\/b2b\/|cron\/)/, "")
      .replace(/[*:/]/g, "_")
      .replace(/^_+|_+$/g, "");

    const id = `${prefix}.${cleanSlug || "root"}`;

    addNode({
      id,
      kind,
      scope,
      labels: { ar: route, en: route },
      keywords: kws(route.replace(/\//g, " "), route.split("/").pop(), kind, scope),
      route,
      methods,
      capabilityRefs: [safeGet ? `${prefix}.call` : `${prefix}.mutate`],
      defaultIntent: safeGet ? "probe" : "command",
      risk: methods.some((m) => m !== "GET") ? "medium" : "low",
      evidence: path.relative(ROOT, file),
    });
  }

  // 8. External Suppliers & GDS Partners (Catalog)
  if (typeof listCatalogProviders === "function") {
    const providers = listCatalogProviders();
    for (const p of providers) {
      addNode({
        id: `supplier.${p.id}`,
        kind: "external_supplier",
        scope: "supplier",
        supplierId: p.id,
        labels: { ar: p.nameAr || p.name, en: p.name },
        keywords: kws(p.nameAr || "", p.name, p.id, p.vertical, p.category, p.noteAr || "", "مورد", "مزود", "supplier", "gateway", "gds"),
        capabilityRefs: [`provider.${p.id}.query`, `provider.${p.id}.status`],
        defaultIntent: "probe",
        risk: p.integration === "live" ? "medium" : "low",
        evidence: `catalog.ts:${p.id}`,
      });
    }
  }

  // 9. Webhooks & Communication Gateways
  const webhooks = [
    { id: "telegram_admin_bot", label: "بوت تيليجرام لإشعارات الإدارة والقرارات الفورية", route: "/api/admin/automation/comms", keywords: ["تيليجرام", "telegram", "بوت الإدارة", "bot"] },
    { id: "whatsapp_business_gateway", label: "بوابة واتساب للأعمال والرسائل التفاعلية", route: "/api/admin/automation/comms", keywords: ["واتساب", "whatsapp", "شات العملاء"] },
    { id: "iyzico_payment_webhook", label: "ويب هوك بوابة دفع إيزيكو Iyzico", route: "/api/payments/iyzico/callback", keywords: ["ايزيكو", "دفع", "iyzico", "payment"] },
    { id: "seeru_flights_webhook", label: "بوابة إشعارات وتحديثات تذاكر طيران Seeru", route: "/api/flights/webhook", keywords: ["سيرو", "seeru", "طيران"] },
    { id: "pkfare_flights_webhook", label: "بوابة إشعارات أسعار وإصدار تذاكر PKFare", route: "/api/flights/pkfare-webhook", keywords: ["بي كي فير", "pkfare", "gds"] },
  ];
  for (const wh of webhooks) {
    addNode({
      id: `webhook.${wh.id}`,
      kind: "webhook",
      scope: "webhook",
      labels: { ar: wh.label, en: wh.id },
      keywords: kws(wh.label, wh.id, wh.route, ...(wh.keywords || [])),
      route: wh.route,
      capabilityRefs: ["webhook.receive", "webhook.verify"],
      defaultIntent: "probe",
      risk: "medium",
      evidence: "gen-platform-index.cjs:webhooks",
    });
  }

  // 10. Database Collections
  for (const collection of KNOWN_COLLECTIONS) {
    const sensitive = ["financial_transactions", "loyalty_wallets", "users", "customers"].includes(collection);
    addNode({
      id: `collection.${collection}`,
      kind: "collection",
      scope: "database",
      labels: { ar: collection, en: collection },
      keywords: kws(collection, collection.replace(/_/g, " "), "قاعدة بيانات", "جدول", "collection"),
      collection,
      capabilityRefs: [
        `collection.${collection}.list`,
        `collection.${collection}.get`,
        "records.list",
        "records.get",
        "studio.open_table",
      ],
      defaultIntent: "open_table",
      risk: sensitive ? "high" : "low",
      evidence: "domain-systems.ts:KNOWN_COLLECTIONS",
    });
  }

  // 11. UI Actions
  const uiActions = [
    { id: "ui.voice.mute", label: "كتم الصوت", screenId: "17", keywords: ["كتم", "mute"] },
    { id: "ui.agents.hide", label: "إخفاء الوكلاء", screenId: "18", keywords: ["اخفاء الوكلاء", "hide agents"] },
    { id: "ui.swarm.layout", label: "تنسيق جماعي", screenId: "18", keywords: ["تنسيق جماعي", "swarm layout"] },
    { id: "ui.briefing.open", label: "تقرير جاهزية", screenId: "19", keywords: ["جاهزيه", "ثغرات", "خوادم مفعله"] },
  ];
  for (const u of uiActions) {
    addNode({
      id: u.id,
      kind: "ui_action",
      scope: "admin",
      screenId: u.screenId,
      labels: { ar: u.label },
      keywords: kws(u.label, ...(u.keywords || [])),
      capabilityRefs: u.id === "ui.briefing.open" ? ["briefing.readiness"] : [],
      defaultIntent: u.id === "ui.briefing.open" ? "briefing" : "navigate",
      risk: "low",
      evidence: "gen-platform-index.cjs",
    });
  }

  // 12. Nexus Sectors
  const nexusSectors = [
    { id: "nexus-hotels", stationId: "hotels", label: "محرك الفنادق والـ GDS" },
    { id: "nexus-flights", stationId: "flights", label: "رادار تذاكر الطيران" },
    { id: "nexus-transfers", stationId: "transfers", label: "النقل والمواصلات" },
    { id: "nexus-b2b", stationId: "b2b", label: "شبكة B2B والموزعين" },
    { id: "nexus-ads", stationId: "ads", label: "حملات الإعلانات" },
    { id: "nexus-social", stationId: "social", label: "النشر والسوشيال" },
  ];
  for (const sec of nexusSectors) {
    addNode({
      id: `nexus.sector.${sec.id}`,
      kind: "domain_hub",
      scope: "admin",
      screenId: "21",
      hubId: sec.stationId,
      labels: { ar: sec.label },
      keywords: kws(sec.label, sec.stationId, sec.id.replace("nexus-", "")),
      capabilityRefs: ["nexus.rotate", "nexus.run_sector_command", "studio.open_screen"],
      defaultIntent: "navigate",
      risk: "low",
      evidence: "HolographicCylinderStage:NEXUS_SECTOR_CARDS",
    });
  }

  // 13. Inject Sovereign Domain Thesaurus (5,000+ terms)
  if (sources.DOMAIN_THESAURUS_MAP && typeof sources.DOMAIN_THESAURUS_MAP === "object") {
    const existingNodeIds = new Set(nodes.map((n) => n.id));
    for (const [term, targetIds] of Object.entries(sources.DOMAIN_THESAURUS_MAP)) {
      const normTerm = norm(term);
      if (normTerm.length < 2) continue;
      const validTargets = targetIds.filter((id) => existingNodeIds.has(id));
      if (!validTargets.length) continue;
      const list = lexicon.get(normTerm) || [];
      list.push(...validTargets);
      lexicon.set(normTerm, uniq(list));
    }
  }

  nodes.sort((a, b) => a.id.localeCompare(b.id));

  const lexEntries = [...lexicon.entries()]
    .map(([term, nodeIds]) => ({ term, nodeIds: uniq(nodeIds).sort() }))
    .sort((a, b) => a.term.localeCompare(b.term));


  const chunkSize = 150;
  const chunks = [];
  for (let i = 0; i < nodes.length; i += chunkSize) {
    chunks.push(nodes.slice(i, i + chunkSize));
  }

  const chunkDefs = chunks
    .map(
      (chunk, idx) =>
        `const CHUNK_${idx}: PlatformIndexNode[] = ${JSON.stringify(chunk, null, 2)} as PlatformIndexNode[];`
    )
    .join("\n\n");

  const chunkNames = chunks.map((_, idx) => `CHUNK_${idx}`).join(", ");

  const tsNodes = `/** AUTO-GENERATED — node scripts/gen-platform-index.cjs */\nimport type { PlatformIndexNode } from "./types";\n\n${chunkDefs}\n\nexport const PLATFORM_INDEX_NODES: PlatformIndexNode[] = ([] as PlatformIndexNode[]).concat(${chunkNames});\n\nexport const PLATFORM_INDEX_BY_ID: Record<string, PlatformIndexNode> = Object.fromEntries(PLATFORM_INDEX_NODES.map((n) => [n.id, n]));\n\nexport const PLATFORM_INDEX_GENERATED_AT = ${JSON.stringify(new Date().toISOString())};\n`;

  const tsLex = `/** AUTO-GENERATED — node scripts/gen-platform-index.cjs */\nimport type { IntentLexiconEntry } from "./types";\n\nexport const INTENT_LEXICON: IntentLexiconEntry[] = ${JSON.stringify(lexEntries, null, 2)} as IntentLexiconEntry[];\n\nexport const LEXICON_BY_TERM: Record<string, string[]> = Object.fromEntries(INTENT_LEXICON.map((e) => [e.term, e.nodeIds]));\n`;

  fs.mkdirSync(INDEX_DIR, { recursive: true });
  fs.writeFileSync(path.join(INDEX_DIR, "platform-index.generated.ts"), tsNodes);
  fs.writeFileSync(path.join(INDEX_DIR, "intent-lexicon.generated.ts"), tsLex);

  const BRAIN_DIR = path.resolve(ROOT, "../database/data/brain");
  fs.mkdirSync(BRAIN_DIR, { recursive: true });
  fs.writeFileSync(path.join(BRAIN_DIR, "platform-nodes.json"), JSON.stringify(nodes, null, 2));
  fs.writeFileSync(path.join(BRAIN_DIR, "intent-lexicon.json"), JSON.stringify(lexEntries, null, 2));



  const probeMap = {};
  for (const n of nodes) {
    if (n.kind !== "api_route" || !n.route || !n.methods?.includes("GET") || !isSafeGetProbe(n.route)) continue;
    const capId = probeCapabilityId(n.route);
    probeMap[capId] = n.route;
  }
  const tsProbe = `/** AUTO-GENERATED */\nexport const PROBE_ROUTE_BY_CAP_ID: Record<string, string> = ${JSON.stringify(probeMap, null, 2)};\n`;
  fs.writeFileSync(path.join(INDEX_DIR, "probe-routes.generated.ts"), tsProbe);

  const mdRows = nodes.map(
    (n) =>
      `| \`${n.id}\` | ${n.kind} | ${n.scope || "admin"} | ${n.screenId || ""} | ${n.labels.ar.slice(0, 50)} | ${n.defaultIntent} | ${n.risk} | ${(n.href || n.route || n.collection || n.supplierId || "").slice(0, 40)} |`
  );
  const md = `# Platform Sovereign Index (100% Holistic Coverage)

مولَّد آلياً: \`node scripts/gen-platform-index.cjs\`
تغطية سيادية شاملة: **${nodes.length} عقدة**، **${lexEntries.length} مصطلح دلالي ومترادف**.

| المعرف ID | النوع Kind | النطاق Scope | الشاشة Screen | التسمية Label | النية الافتراضية Intent | مستوى الخطر Risk | الهدف Target |
|---|---|---|---|---|---|---|---|
${mdRows.join("\n")}
`;
  fs.writeFileSync(path.join(ROOT, "docs/cyber-console/PLATFORM_INDEX.md"), md);
  console.log(`✅ Platform sovereign index generated: ${nodes.length} nodes, ${lexEntries.length} lexicon terms across all 100% platform systems.`);
}

main();
