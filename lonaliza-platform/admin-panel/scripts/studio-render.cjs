#!/usr/bin/env node
/**
 * رندرة الاستوديو السيبراني فعليًا ببيانات PocketBase حية (قراءة فقط) والتقاط لقطة ومقارنة بالمرجع.
 * الاستعمال:
 *   node scripts/studio-render.cjs --screen 01 --size 1672x941 --out /tmp/s01.png [--diff] [--state thinking] [--focus id] [--map id]
 */
const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");

const ROOT = path.resolve(__dirname, "..");
const HANDOFF = path.resolve(ROOT, "../../lonaliza-neural-studio-complete-handoff/images");
const args = Object.fromEntries(
  process.argv.slice(2).reduce((acc, cur, i, arr) => {
    if (cur.startsWith("--")) acc.push([cur.slice(2), arr[i + 1] && !arr[i + 1].startsWith("--") ? arr[i + 1] : "1"]);
    return acc;
  }, [])
);
const screen = args.screen || "01";
const [W, H] = (args.size || "1672x941").split("x").map(Number);
const out = args.out || `/tmp/studio-${screen}-${W}x${H}.png`;
const bundle = "/tmp/studio-shell-bundle.js";

function env() {
  const e = {};
  for (const line of fs.readFileSync(path.join(ROOT, ".env.local"), "utf8").split("\n")) {
    const m = line.match(/^([A-Z_]+)=(.*)$/);
    if (m) e[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
  return e;
}

async function pbClient() {
  const e = env();
  const base = e.POCKETBASE_URL.replace(/\/$/, "");
  const res = await fetch(`${base}/api/collections/_superusers/auth-with-password`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ identity: e.POCKETBASE_ADMIN_EMAIL, password: e.POCKETBASE_ADMIN_PASSWORD }),
  });
  const { token } = await res.json();
  const get = async (p) => (await fetch(base + p, { headers: { Authorization: token }, signal: AbortSignal.timeout(8000) })).json();
  return { get };
}

const SECRET = /pass|token|secret|key|hash|salt/i;

async function main() {
  if (!args["no-build"]) {
    execFileSync(
      "npx",
      ["--yes", "esbuild", path.join(ROOT, "scripts/studio-harness.tsx"), "--bundle", `--outfile=${bundle}`, "--format=iife",
        "--platform=browser", "--jsx=automatic", `--alias:@=${path.join(ROOT, "src")}`, '--define:process.env.NODE_ENV="production"', "--banner:js=var process=globalThis.process||{env:{}};", "--log-level=warning"],
      { cwd: ROOT, stdio: "inherit", env: { ...process.env, NODE_PATH: path.join(ROOT, "node_modules") } }
    );
  }
  const pb = await pbClient();
  const { chromium } = require(path.join(ROOT, "node_modules/playwright"));
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });
  const errors = [];
  page.on("pageerror", (err) => errors.push(String(err)));
  page.on("console", (m) => m.type() === "error" && errors.push(m.text()));

  const HTML = `<!doctype html><html dir="ltr"><head><meta charset="utf-8">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Noto+Sans+Arabic:wght@400;500;600;700&display=block">
<style>html,body{margin:0;background:#01050b;overflow:hidden}*{box-sizing:border-box}button,input{font-family:inherit}</style>
</head><body><div id="root"></div></body></html>`;
  await page.route("http://studio.local/**", async (route) => {
    const url = new URL(route.request().url());
    const json = (body, status = 200) => route.fulfill({ status, contentType: "application/json", body: JSON.stringify(body) });
    if (url.pathname === "/api/admin/studio/live") {
      const names = (url.searchParams.get("collections") || "").split(",").filter(Boolean);
      const counts = {};
      await Promise.all(names.map(async (n) => {
        try {
          const r = await pb.get(`/api/collections/${n}/records?perPage=1&fields=id`);
          counts[n] = typeof r.totalItems === "number" ? { totalItems: r.totalItems, state: "live" } : { totalItems: null, state: "error" };
        } catch { counts[n] = { totalItems: null, state: "timeout" }; }
      }));
      return json({ ok: true, fetchedAt: new Date().toISOString(), counts });
    }
    if (url.pathname === "/api/admin/studio/records") {
      const c = url.searchParams.get("collection");
      if (url.searchParams.get("id")) {
        const it = await pb.get(`/api/collections/${c}/records/${url.searchParams.get("id")}`);
        return json({ ok: true, item: Object.fromEntries(Object.entries(it).filter(([k]) => !SECRET.test(k))) });
      }
      const p = url.searchParams.get("page") || "1";
      const r = await pb.get(`/api/collections/${c}/records?page=${p}&perPage=${url.searchParams.get("perPage") || 12}&sort=-updated`);
      const items = (r.items || []).map((it) => Object.fromEntries(Object.entries(it).filter(([k]) => !SECRET.test(k))));
      return json({ ok: true, page: r.page, totalItems: r.totalItems, totalPages: r.totalPages, items });
    }
    if (url.pathname === "/api/admin/studio/schema") {
      const c = await pb.get(`/api/collections/${url.searchParams.get("collection")}`);
      const fields = (c.fields || []).filter((f) => !f.hidden && !SECRET.test(f.name)).map((f) => ({ name: f.name, type: f.type, required: !!f.required, values: f.values || null }));
      return json({ ok: true, collection: c.name, fields });
    }
    if (url.pathname.startsWith("/api/")) return json({ ok: false, error: "not_mocked" }, 404);
    return route.fulfill({ status: 200, contentType: "text/html; charset=utf-8", body: HTML });
  });

  const q = new URLSearchParams({ screen, ...(args.swarm ? { swarm: "1" } : {}), ...(args.state ? { state: args.state } : {}), ...(args.focus ? { focus: args.focus } : {}), ...(args.map ? { map: args.map } : {}) });
  await page.goto(`http://studio.local/?${q}`, { waitUntil: "networkidle" });
  await page.addScriptTag({ path: bundle });
  await page.evaluate(async () => {
    for (const w of [400, 500, 600, 700]) await document.fonts.load(`${w} 20px 'Noto Sans Arabic'`, "الوكيل المشرف");
    await document.fonts.ready;
  });
  for (const sel of (args.click || "").split("||").filter(Boolean)) {
    await page.click(sel, { timeout: 5000 });
    await page.waitForTimeout(1300);
  }
  await page.waitForTimeout(Number(args.wait || 1500));
  if (args.perf) {
    const perf = await page.evaluate(() => new Promise((resolve) => {
      const gaps = [];
      let last = performance.now();
      const t0 = last;
      const tick = (now) => {
        gaps.push(now - last);
        last = now;
        if (now - t0 < 2000) requestAnimationFrame(tick);
        else {
          gaps.sort((a, b) => a - b);
          const work = performance.getEntriesByName("studio-frame").slice(-60).map((e) => e.duration).sort((a, b) => a - b);
          performance.clearMeasures("studio-frame");
          resolve({ workAvgMs: work.length ? +(work.reduce((a, b) => a + b, 0) / work.length).toFixed(2) : null, workP95Ms: work.length ? +work[Math.floor(work.length * 0.95)].toFixed(2) : null, frames: gaps.length, avgMs: +(gaps.reduce((a, b) => a + b, 0) / gaps.length).toFixed(2), p95Ms: +gaps[Math.floor(gaps.length * 0.95)].toFixed(2) });
        }
      };
      requestAnimationFrame(tick);
    }));
    console.log(JSON.stringify({ perf }));
  }
  await page.screenshot({ path: out });
  await browser.close();
  console.log(JSON.stringify({ out, errors }));

  if (args.diff && W === 1672 && H === 941) {
    const ref = fs.readdirSync(HANDOFF).find((f) => f.startsWith(`${screen}-`));
    const py = `
from PIL import Image, ImageChops
import numpy as np
a=Image.open(r"${path.join(HANDOFF, ref || "")}").convert("RGB"); b=Image.open(r"${out}").convert("RGB").resize(a.size)
d=np.asarray(ImageChops.difference(a,b)).astype(float).mean(axis=2)
side=Image.new("RGB",(a.width*2+8,a.height),(255,0,80)); side.paste(a,(0,0)); side.paste(b,(a.width+8,0))
side.save(r"${out.replace(/\.png$/, "-compare.png")}")
Image.fromarray((np.clip(d*3,0,255)).astype("uint8")).save(r"${out.replace(/\.png$/, "-diff.png")}")
print({"meanAbsDiff": round(float(d.mean()),2), "over40": round(float((d>40).mean()),4)})`;
    execFileSync("python3", ["-c", py], { stdio: "inherit" });
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
