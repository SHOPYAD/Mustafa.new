#!/usr/bin/env node
/** يولد docs/cyber-console/CAPABILITIES.md من src/lib/studio/capabilities/registry.ts */
const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");

const ROOT = path.resolve(__dirname, "..");
const out = "/tmp/studio-registry.cjs";
execFileSync("npx", ["--yes", "esbuild", path.join(ROOT, "src/lib/studio/capabilities/registry.ts"), "--bundle", "--platform=node", "--format=cjs", `--outfile=${out}`, "--log-level=warning"], { cwd: ROOT, stdio: "inherit" });
const { CAPABILITIES } = require(out);

const rows = CAPABILITIES.map((c) => `| \`${c.id}\` | ${c.titleAr} | ${c.domainId} | \`${c.nodeId}\` | ${c.kind} | ${c.risk} | ${[c.target.collection, c.target.route, c.target.fn].filter(Boolean).map((x) => `\`${x}\``).join(" ")} | \`${c.evidence}\` |`);
const md = `# Cyber Console — سجل القدرات

مولَّد تلقائيًا: \`node scripts/gen-capabilities-doc.cjs\`. لا تعدله يدويًا.

كل قدرة تُنفذ عبر \`POST /api/admin/studio/capabilities/execute\` (المنفذ: \`src/lib/studio/capabilities/executor.server.ts\`).

- \`query\`: قراءة فورية بلا أثر.
- \`command\`: معاينة (\`dryRun\`) ثم تنفيذ بـ \`idempotencyKey\`؛ \`high\` يتطلب \`approvalRef\` موقّعًا يصدر للمدير فقط.
- الكتابة على مجموعة حساسة ترفع الخطورة إلى \`high\` تلقائيًا.
- كل تنفيذ يُسجَّل في \`studio_audit_log\` ويُبث على \`agent-stream\`.
- الاختبار: \`src/lib/studio/studio-core.test.ts\`.

| المعرّف | العنوان | المجال | العقدة | النوع | الخطورة | الهدف | الدليل |
|---|---|---|---|---|---|---|---|
${rows.join("\n")}
`;
fs.writeFileSync(path.join(ROOT, "docs/cyber-console/CAPABILITIES.md"), md);
console.log(`wrote ${CAPABILITIES.length} capabilities`);
