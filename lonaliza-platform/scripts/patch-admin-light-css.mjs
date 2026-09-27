import fs from "fs";
import path from "path";

const cssPath = path.resolve("src/app/globals.css");
const css = fs.readFileSync(cssPath, "utf8");

const markers = [
  "/* ── Admin light theme",
  "/* ── Admin light theme ─",
  "/* Admin light theme",
  ".admin-shell[data-admin-theme=\"light\"] {",
  ".admin-main--light {",
];

let cutAt = -1;
for (const m of markers) {
  const i = css.indexOf(m);
  if (i >= 0) {
    cutAt = i;
    break;
  }
}

if (cutAt < 0) {
  console.error("Could not locate admin theme CSS block");
  process.exit(1);
}

const head = css.slice(0, cutAt).replace(/\s+$/, "\n\n");

const lightCss = `/* ── Admin light theme ─────────────────────────────────────────────────────
   Shell chrome (sidebar/header) switches in layout.tsx via isLight classes.
   Page bodies + modals still hardcode dark utilities (bg-slate-900, text-white).
   Remap under THREE scopes so nothing is missed:
     1) .admin-main--light (main content)
     2) .admin-shell[data-admin-theme="light"] (shell)
     3) html[data-admin-theme="light"] (document-level sync from layout)
──────────────────────────────────────────────────────────────────────────── */
html[data-admin-theme="light"],
.admin-shell[data-admin-theme="light"] {
  --admin-bg: #f1f5f9;
  --admin-surface: #ffffff;
  --admin-surface-2: #f8fafc;
  --admin-border: #e2e8f0;
  --admin-text: #0f172a;
  --admin-text-muted: #64748b;
  --admin-text-faint: #94a3b8;
  color-scheme: light;
}

html[data-admin-theme="light"] .admin-main,
.admin-main--light,
.admin-shell[data-admin-theme="light"] .admin-main {
  color: var(--admin-text, #0f172a);
}

html[data-admin-theme="light"] .admin-main :is(h1, h2, h3, h4),
.admin-main--light :is(h1, h2, h3, h4),
.admin-shell[data-admin-theme="light"] .admin-main :is(h1, h2, h3, h4) {
  color: var(--admin-text, #0f172a);
}

/* Dark panels → white cards (slate/zinc/gray/hex navy) */
html[data-admin-theme="light"] .admin-main :is(
  [class*="bg-slate-9"],
  [class*="bg-slate-8"],
  [class*="bg-zinc-9"],
  [class*="bg-zinc-8"],
  [class*="bg-neutral-9"],
  [class*="bg-neutral-8"],
  [class*="bg-gray-9"],
  [class*="bg-gray-8"],
  [class*="bg-stone-9"],
  [class*="bg-stone-8"],
  [class*="bg-[#0"],
  [class*="bg-[#1"]
),
.admin-main--light :is(
  [class*="bg-slate-9"],
  [class*="bg-slate-8"],
  [class*="bg-zinc-9"],
  [class*="bg-zinc-8"],
  [class*="bg-neutral-9"],
  [class*="bg-neutral-8"],
  [class*="bg-gray-9"],
  [class*="bg-gray-8"],
  [class*="bg-stone-9"],
  [class*="bg-stone-8"],
  [class*="bg-[#0"],
  [class*="bg-[#1"]
) {
  background-color: var(--admin-surface, #ffffff) !important;
  background-image: none !important;
}

/* Glass chips */
html[data-admin-theme="light"] .admin-main [class*="bg-white/"],
.admin-main--light [class*="bg-white/"] {
  background-color: rgba(15, 23, 42, 0.04) !important;
}

html[data-admin-theme="light"] .admin-main [class*="hover:bg-white/"]:hover,
.admin-main--light [class*="hover:bg-white/"]:hover {
  background-color: rgba(15, 23, 42, 0.08) !important;
}

/* Borders */
html[data-admin-theme="light"] .admin-main :is([class*="border-white"], [class*="border-slate-7"], [class*="border-slate-8"]),
.admin-main--light :is([class*="border-white"], [class*="border-slate-7"], [class*="border-slate-8"]) {
  border-color: var(--admin-border, #e2e8f0) !important;
}

/* Text */
html[data-admin-theme="light"] .admin-main .text-white,
.admin-main--light .text-white {
  color: var(--admin-text, #0f172a) !important;
}

html[data-admin-theme="light"] .admin-main [class*="text-white/"],
.admin-main--light [class*="text-white/"] {
  color: var(--admin-text-muted, #64748b) !important;
}

/* Keep white on saturated CTAs / badges / gradients */
html[data-admin-theme="light"] .admin-main :is(button, a, span)[class*="bg-gradient"].text-white,
html[data-admin-theme="light"] .admin-main :is(button, a, span)[class*="from-"].text-white,
html[data-admin-theme="light"] .admin-main :is(button, a, span)[class*="bg-amber-"].text-white,
html[data-admin-theme="light"] .admin-main :is(button, a, span)[class*="bg-orange-"].text-white,
html[data-admin-theme="light"] .admin-main :is(button, a, span)[class*="bg-sky-"].text-white,
html[data-admin-theme="light"] .admin-main :is(button, a, span)[class*="bg-blue-"].text-white,
html[data-admin-theme="light"] .admin-main :is(button, a, span)[class*="bg-emerald-"].text-white,
html[data-admin-theme="light"] .admin-main :is(button, a, span)[class*="bg-green-"].text-white,
html[data-admin-theme="light"] .admin-main :is(button, a, span)[class*="bg-red-"].text-white,
html[data-admin-theme="light"] .admin-main :is(button, a, span)[class*="bg-rose-"].text-white,
html[data-admin-theme="light"] .admin-main :is(button, a, span)[class*="bg-violet-"].text-white,
html[data-admin-theme="light"] .admin-main :is(button, a, span)[class*="bg-cyan-"].text-white,
html[data-admin-theme="light"] .admin-main [class*="bg-gradient"] .text-white,
html[data-admin-theme="light"] .admin-main [class*="from-amber"] .text-white,
html[data-admin-theme="light"] .admin-main [class*="from-sky"] .text-white,
html[data-admin-theme="light"] .admin-main [class*="from-blue"] .text-white,
html[data-admin-theme="light"] .admin-main [class*="from-emerald"] .text-white,
html[data-admin-theme="light"] .admin-main [class*="bg-amber-5"] .text-white,
html[data-admin-theme="light"] .admin-main [class*="bg-sky-5"] .text-white,
html[data-admin-theme="light"] .admin-main [class*="bg-emerald-5"] .text-white,
html[data-admin-theme="light"] .admin-main [class*="bg-blue-5"] .text-white,
html[data-admin-theme="light"] .admin-main [class*="bg-red-5"] .text-white,
.admin-main--light :is(button, a, span)[class*="bg-gradient"].text-white,
.admin-main--light :is(button, a, span)[class*="from-"].text-white,
.admin-main--light :is(button, a, span)[class*="bg-amber-"].text-white,
.admin-main--light :is(button, a, span)[class*="bg-orange-"].text-white,
.admin-main--light :is(button, a, span)[class*="bg-sky-"].text-white,
.admin-main--light :is(button, a, span)[class*="bg-blue-"].text-white,
.admin-main--light :is(button, a, span)[class*="bg-emerald-"].text-white,
.admin-main--light :is(button, a, span)[class*="bg-green-"].text-white,
.admin-main--light :is(button, a, span)[class*="bg-red-"].text-white,
.admin-main--light :is(button, a, span)[class*="bg-rose-"].text-white,
.admin-main--light :is(button, a, span)[class*="bg-violet-"].text-white,
.admin-main--light :is(button, a, span)[class*="bg-cyan-"].text-white,
.admin-main--light [class*="bg-gradient"] .text-white,
.admin-main--light [class*="from-amber"] .text-white,
.admin-main--light [class*="from-sky"] .text-white,
.admin-main--light [class*="from-blue"] .text-white,
.admin-main--light [class*="from-emerald"] .text-white,
.admin-main--light [class*="bg-amber-5"] .text-white,
.admin-main--light [class*="bg-sky-5"] .text-white,
.admin-main--light [class*="bg-emerald-5"] .text-white,
.admin-main--light [class*="bg-blue-5"] .text-white,
.admin-main--light [class*="bg-red-5"] .text-white {
  color: #ffffff !important;
}

/* Forms */
html[data-admin-theme="light"] .admin-main :is(input, textarea, select),
.admin-main--light :is(input, textarea, select) {
  color: var(--admin-text, #0f172a) !important;
  background-color: var(--admin-surface-2, #f8fafc) !important;
  border-color: var(--admin-border, #e2e8f0) !important;
}

html[data-admin-theme="light"] .admin-main :is(input, textarea)::placeholder,
.admin-main--light :is(input, textarea)::placeholder {
  color: var(--admin-text-faint, #94a3b8) !important;
  opacity: 1 !important;
}

html[data-admin-theme="light"] .admin-main option,
.admin-main--light option {
  background-color: #ffffff;
  color: #0f172a;
}

/* Tables / dividers */
html[data-admin-theme="light"] .admin-main table,
.admin-main--light table {
  color: var(--admin-text, #0f172a);
}

html[data-admin-theme="light"] .admin-main [class*="divide-white"] > :not([hidden]) ~ :not([hidden]),
.admin-main--light [class*="divide-white"] > :not([hidden]) ~ :not([hidden]) {
  border-color: var(--admin-border, #e2e8f0) !important;
}

html[data-admin-theme="light"] .admin-main [class*="shadow-black"],
.admin-main--light [class*="shadow-black"] {
  --tw-shadow-color: rgb(15 23 42 / 0.08) !important;
}

/* Modal scrims stay dimmed */
html[data-admin-theme="light"] .admin-main [class*="bg-black/"],
.admin-main--light [class*="bg-black/"] {
  background-color: rgb(15 23 42 / 0.45) !important;
  background-image: none !important;
}

html[data-admin-theme="light"] .admin-main [class*="ring-white"],
.admin-main--light [class*="ring-white"] {
  --tw-ring-color: rgb(15 23 42 / 0.12) !important;
}
`;

fs.writeFileSync(cssPath, head + lightCss);
console.log("OK patched admin light CSS at", cutAt, "new size", fs.statSync(cssPath).size);
