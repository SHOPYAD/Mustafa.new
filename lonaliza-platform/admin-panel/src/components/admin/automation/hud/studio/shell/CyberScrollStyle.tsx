"use client";

/** شريط تمرير الاستوديو: رفيع، نيوني، ناعم. يُطبَّق على كل ما داخل `.cyber-console`. */
function scrollCss(scope: string) {
  const bar = `${scope}::-webkit-scrollbar, ${scope} *::-webkit-scrollbar`;
  return `
${scope}, ${scope} * { scrollbar-width: thin !important; scrollbar-color: rgba(79,230,255,0.85) rgba(4,20,34,0.45) !important; scroll-behavior: smooth; overscroll-behavior: contain; }
${bar} { width: 8px !important; height: 8px !important; }
${scope}::-webkit-scrollbar-track, ${scope} *::-webkit-scrollbar-track { background: rgba(4,20,34,0.55) !important; border-radius: 8px !important; }
${scope}::-webkit-scrollbar-thumb, ${scope} *::-webkit-scrollbar-thumb {
  border-radius: 8px !important;
  background: linear-gradient(180deg, #d8fbff 0%, #4fe6ff 42%, #0e7490 78%, #ffae2e 100%) !important;
  border: 1px solid rgba(2,10,18,0.65) !important;
  box-shadow: 0 0 8px rgba(79,230,255,0.45) !important;
}
${scope}::-webkit-scrollbar-thumb:hover, ${scope} *::-webkit-scrollbar-thumb:hover { background: linear-gradient(180deg, #ffffff 0%, #7ff0ff 50%, #ffc46a 100%) !important; }
${scope}::-webkit-scrollbar-corner, ${scope} *::-webkit-scrollbar-corner,
${scope}::-webkit-scrollbar-button, ${scope} *::-webkit-scrollbar-button { display: none !important; width: 0 !important; height: 0 !important; background: transparent !important; }
`;
}
const INPUTS = `
.cyber-console :is(input, textarea, select):not([type="checkbox"]):not([type="radio"]):not([type="button"]):not([type="submit"]),
html[data-studio-embed] :is(input, textarea, select):not([type="checkbox"]):not([type="radio"]):not([type="button"]):not([type="submit"]) {
  background-color: rgba(2,10,18,0.94) !important;
  color: #e8f2f6 !important;
  border-color: rgba(64,214,245,0.35) !important;
  caret-color: #4fe6ff;
}
.cyber-console :is(input, textarea)::placeholder,
html[data-studio-embed] :is(input, textarea)::placeholder { color: #93a8b3 !important; }
`;
const CSS = `${scrollCss(".cyber-console")}\n${scrollCss("html[data-studio-embed]")}\n${INPUTS}`;

export function CyberScrollStyle() {
  return <style data-cyber-scroll dangerouslySetInnerHTML={{ __html: CSS }} />;
}

/** هوية الاستوديو للصفحات الحقيقية المفتوحة داخل نوافذه: نفس المكونات والإجراءات، بثيم سيبراني. */
const EMBED_CSS = `
html[data-studio-embed][data-admin-theme], html[data-studio-embed] body, html[data-studio-embed] .studio-embed {
  --background: #01050b !important; --foreground: #e8f2f6 !important; --heading: #ffffff !important;
  --card: #051321 !important; --card-foreground: #e8f2f6 !important;
  --muted: #071a2b !important; --muted-foreground: #93a8b3 !important;
  --border: rgba(64,214,245,0.26) !important; --input: rgba(64,214,245,0.3) !important; --ring: #4fe6ff !important;
  --popover: #04101c !important; --popover-foreground: #e8f2f6 !important;
  --secondary: #0a2233 !important; --secondary-foreground: #bff6ff !important;
  --accent: #ffae2e !important; --accent-foreground: #01050b !important; --accent-light: #ffc46a !important;
  --primary: #22d3ee !important; --primary-foreground: #01121b !important; --primary-light: #7ff0ff !important; --primary-dark: #0ea5c6 !important;
  --destructive: #ff4d6a !important; --destructive-foreground: #ffffff !important;
  --navy: #051321 !important; --navy-mid: #0a2233 !important; --emerald: #35f0a0 !important;
  --chart-1: #4fe6ff !important; --chart-2: #ffae2e !important; --chart-3: #d65cff !important; --chart-4: #3cf0a8 !important; --chart-5: #9a7bff !important;
  --sidebar: #01050b !important; --sidebar-foreground: #e8f2f6 !important; --sidebar-border: rgba(64,214,245,0.26) !important; --sidebar-accent: rgba(64,214,245,0.14) !important; --sidebar-accent-foreground: #4fe6ff !important; --sidebar-muted: #93a8b3 !important;
  --admin-bg: #01050b !important; --admin-surface: #051321 !important; --admin-surface-2: #071a2b !important; --admin-border: rgba(64,214,245,0.26) !important;
  --admin-text: #e8f2f6 !important; --admin-text-muted: #93a8b3 !important; --admin-text-faint: #6f8490 !important;
  --admin-bg-surface: #051321 !important; --admin-bg-surface-2: #071a2b !important; --admin-border-base: rgba(64,214,245,0.28) !important; --admin-border-subtle: rgba(64,214,245,0.14) !important;
  --admin-accent: #4fe6ff !important; --admin-accent-border: rgba(64,214,245,0.62) !important; --admin-accent-soft: rgba(64,214,245,0.12) !important;
  --admin-btn-primary-bg: #0e7490 !important; --admin-btn-primary-fg: #e6fdff !important;
  --color-accent: #4fe6ff !important; --color-accent-fg: #01121b !important;
  --brand-primary: #22d3ee !important; --brand-secondary: #0a2233 !important; --brand-accent: #ffae2e !important; --brand-button: #0e7490 !important; --brand-header: #051321 !important; --brand-footer: #01050b !important;
  --theme-page-bg: #01050b !important; --theme-section-bg: #071a2b !important; --theme-card-bg: #051321 !important; --theme-border-color: rgba(64,214,245,0.26) !important;
  --theme-text-heading: #ffffff !important; --theme-text-body: #e8f2f6 !important; --theme-text-muted: #93a8b3 !important; --theme-text-link: #4fe6ff !important;
  --theme-btn-hover-bg: #0891b2 !important; --theme-btn-active-bg: #0891b2 !important;
}
html[data-studio-embed], html[data-studio-embed] body { background: #01050b !important; color: #e8f2f6; }
.studio-embed {
  min-height: 100vh;
  background: radial-gradient(ellipse at 50% -10%, rgba(10,60,80,0.55), transparent 60%) fixed, radial-gradient(circle at 100% 100%, rgba(255,150,40,0.06), transparent 40%) fixed, #01050b;
  font-family: 'Noto Sans Arabic', 'IBM Plex Sans Arabic', Tahoma, sans-serif;
}
.studio-embed :is(h1, h2, h3) { color: #ffffff !important; text-shadow: 0 0 14px rgba(79,230,255,0.25); }
.studio-embed :is(.bg-white, .bg-card, .bg-slate-50, .bg-slate-100, .bg-gray-50, .bg-gray-100, .bg-zinc-50, .bg-neutral-50, .bg-violet-50, .bg-purple-50, .bg-indigo-50, .bg-white\\/80, .bg-white\\/90, .bg-white\\/70, .bg-white\\/60, .bg-white\\/50) {
  background-color: rgba(5,19,33,0.92) !important;
}
.studio-embed :is(.bg-slate-200, .bg-gray-200, .bg-violet-100, .bg-purple-100, .bg-indigo-100, .bg-secondary, .bg-muted) { background-color: #0a2233 !important; }
.studio-embed :is(.text-slate-900, .text-slate-800, .text-slate-700, .text-gray-900, .text-gray-800, .text-gray-700, .text-zinc-900, .text-neutral-900, .text-black, .text-foreground, .text-violet-950, .text-purple-950) { color: #e8f2f6 !important; }
.studio-embed :is(.text-slate-600, .text-slate-500, .text-gray-600, .text-gray-500, .text-slate-400, .text-gray-400, .text-muted-foreground) { color: #93a8b3 !important; }
.studio-embed :is(.text-violet-600, .text-violet-700, .text-purple-600, .text-purple-700, .text-indigo-600, .text-primary) { color: #4fe6ff !important; }
.studio-embed :is(.bg-violet-600, .bg-violet-700, .bg-purple-600, .bg-indigo-600, .bg-primary) { background-color: #0e7490 !important; color: #e6fdff !important; box-shadow: 0 0 14px rgba(34,211,238,0.35); }
.studio-embed :is(.border, [class*="border-slate-"], [class*="border-gray-"], [class*="border-violet-"], [class*="border-purple-"], .border-border) { border-color: rgba(64,214,245,0.24) !important; }
.studio-embed :is(.card, [class*="rounded-2xl"], [class*="rounded-3xl"], [class*="rounded-xl"][class*="border"]) {
  border-color: rgba(64,214,245,0.3) !important;
  box-shadow: 0 0 18px rgba(64,214,245,0.08), inset 0 0 18px rgba(64,214,245,0.03) !important;
}
.studio-embed :is(input, select, textarea) { background-color: rgba(2,10,18,0.88) !important; border-color: rgba(64,214,245,0.3) !important; color: #e8f2f6 !important; }
.studio-embed :is(input, select, textarea)::placeholder { color: #6f8490 !important; }
.studio-embed :is(input, select, textarea):focus { border-color: #4fe6ff !important; box-shadow: 0 0 0 2px rgba(79,230,255,0.25) !important; outline: none; }
.studio-embed :is(th, thead tr, thead) { background-color: #071a2b !important; color: #93a8b3 !important; }
.studio-embed :is(td, tr) { border-color: rgba(64,214,245,0.1) !important; }
.studio-embed tr:hover td { background-color: rgba(64,214,245,0.05); }
.studio-embed a:not([class*="bg-"]) { color: #4fe6ff; }
.studio-embed button:not([class*="bg-"]):not([disabled]):hover { filter: drop-shadow(0 0 6px rgba(79,230,255,0.35)); }
`;

export function StudioEmbedStyle() {
  return (
    <>
      <CyberScrollStyle />
      <style data-studio-embed dangerouslySetInnerHTML={{ __html: EMBED_CSS }} />
    </>
  );
}
