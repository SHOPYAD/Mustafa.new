#!/usr/bin/env node
/**
 * يولّد الفهرس السيادي للمنصة:
 * - src/lib/studio/index/platform-index.generated.ts
 * - src/lib/studio/index/intent-lexicon.generated.ts
 * - docs/cyber-console/PLATFORM_INDEX.md
 */
const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");

const ROOT = path.resolve(__dirname, "..");
const APP = path.join(ROOT, "src/app");
const INDEX_DIR = path.join(ROOT, "src/lib/studio/index");

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
  execFileSync(
    "npx",
    [
      "--yes",
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

function adminHrefFromPage(file) {
  const rel = path.relative(path.join(APP, "admin"), file).replace(/\\/g, "/");
  if (rel === "page.tsx") return "/admin";
  const dir = rel.replace(/\/page\.tsx$/, "");
  return "/admin/" + dir.replace(/\[([^\]]+)\]/g, ":$1");
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
  const { DOMAIN_SCREENS, STUDIO_SCREENS, KNOWN_COLLECTIONS } = loadBundledSources();
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

  for (const screen of STUDIO_SCREENS) {
    addNode({
      id: `screen.${screen.id}`,
      kind: "screen",
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

  for (const [groupId, g] of Object.entries(atlasGroups)) {
    addNode({
      id: `nav.group.${groupId}`,
      kind: "nav_group",
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

  for (const screen of DOMAIN_SCREENS) {
    addNode({
      id: `domain.screen.${screen.screenId}`,
      kind: "screen",
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

  const adminPages = walk(path.join(APP, "admin"), (p) => p.endsWith("/page.tsx") || p.endsWith("\\page.tsx"));
  for (const file of adminPages) {
    const href = adminHrefFromPage(file);
    const slug = href.replace(/^\/admin\/?/, "") || "dashboard";
    addNode({
      id: `page.admin.${slug.replace(/[/:]/g, "_")}`,
      kind: "admin_page",
      labels: { ar: slug, en: slug },
      keywords: kws(slug.replace(/\//g, " "), href),
      href,
      capabilityRefs: ["studio.navigate"],
      defaultIntent: "navigate",
      risk: "low",
      evidence: path.relative(ROOT, file),
    });
  }

  const apiRoutes = walk(path.join(APP, "api/admin"), (p) => p.endsWith("route.ts"));
  for (const file of apiRoutes) {
    const route = apiPathFromFile(file);
    const methods = routeMethods(file);
    const safeGet = methods.includes("GET") && isSafeGetProbe(route);
    const capId = safeGet ? probeCapabilityId(route) : undefined;
    addNode({
      id: `api.${route.replace(/^\/api\/admin\//, "").replace(/[/:]/g, "_")}`,
      kind: "api_route",
      labels: { ar: route, en: route },
      keywords: kws(route.replace(/\//g, " "), route.split("/").pop()),
      route,
      methods,
      capabilityRefs: uniq([capId, safeGet ? "admin.route.call" : "admin.route.call"].filter(Boolean)),
      defaultIntent: safeGet ? "probe" : "command",
      risk: methods.some((m) => m !== "GET") ? "medium" : "low",
      evidence: path.relative(ROOT, file),
    });
  }

  for (const collection of KNOWN_COLLECTIONS) {
    const sensitive = ["financial_transactions", "loyalty_wallets", "users", "customers"].includes(collection);
    addNode({
      id: `collection.${collection}`,
      kind: "collection",
      labels: { ar: collection, en: collection },
      keywords: kws(collection, collection.replace(/_/g, " ")),
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
      screenId: u.screenId,
      labels: { ar: u.label },
      keywords: kws(u.label, ...(u.keywords || [])),
      capabilityRefs: u.id === "ui.briefing.open" ? ["briefing.readiness"] : [],
      defaultIntent: u.id === "ui.briefing.open" ? "briefing" : "navigate",
      risk: "low",
      evidence: "gen-platform-index.cjs",
    });
  }

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

  nodes.sort((a, b) => a.id.localeCompare(b.id));

  const lexEntries = [...lexicon.entries()]
    .map(([term, nodeIds]) => ({ term, nodeIds: uniq(nodeIds).sort() }))
    .sort((a, b) => a.term.localeCompare(b.term));

  const tsNodes = `/** AUTO-GENERATED — node scripts/gen-platform-index.cjs */\nimport type { PlatformIndexNode } from "./types";\n\nexport const PLATFORM_INDEX_NODES: PlatformIndexNode[] = ${JSON.stringify(nodes, null, 2)} as PlatformIndexNode[];\n\nexport const PLATFORM_INDEX_BY_ID: Record<string, PlatformIndexNode> = Object.fromEntries(PLATFORM_INDEX_NODES.map((n) => [n.id, n]));\n\nexport const PLATFORM_INDEX_GENERATED_AT = ${JSON.stringify(new Date().toISOString())};\n`;

  const tsLex = `/** AUTO-GENERATED — node scripts/gen-platform-index.cjs */\nimport type { IntentLexiconEntry } from "./types";\n\nexport const INTENT_LEXICON: IntentLexiconEntry[] = ${JSON.stringify(lexEntries, null, 2)} as IntentLexiconEntry[];\n\nexport const LEXICON_BY_TERM: Record<string, string[]> = Object.fromEntries(INTENT_LEXICON.map((e) => [e.term, e.nodeIds]));\n`;

  fs.mkdirSync(INDEX_DIR, { recursive: true });
  fs.writeFileSync(path.join(INDEX_DIR, "platform-index.generated.ts"), tsNodes);
  fs.writeFileSync(path.join(INDEX_DIR, "intent-lexicon.generated.ts"), tsLex);

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
      `| \`${n.id}\` | ${n.kind} | ${n.screenId || ""} | ${n.labels.ar.slice(0, 60)} | ${n.defaultIntent} | ${n.risk} | ${(n.href || n.route || n.collection || "").slice(0, 48)} |`
  );
  const md = `# Platform Index

مولَّد: \`node scripts/gen-platform-index.cjs\` — ${nodes.length} عقدة، ${lexEntries.length} مصطلح.

| id | kind | screen | label | intent | risk | target |
|---|---|---|---|---|---|---|
${mdRows.join("\n")}
`;
  fs.writeFileSync(path.join(ROOT, "docs/cyber-console/PLATFORM_INDEX.md"), md);
  console.log(`platform index: ${nodes.length} nodes, ${lexEntries.length} lexicon terms`);
}

main();
