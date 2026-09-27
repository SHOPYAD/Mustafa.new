import { chromium } from "playwright";

const BASE = process.env.TRANSFERS_URL || "https://lonaliza.com/transfers";

const browser = await chromium.launch({
  headless: true,
  args: ["--disable-blink-features=AutomationControlled"],
});
const page = await browser.newPage({
  viewport: { width: 1440, height: 900 },
  locale: "ar-SA",
});
const res = await page.goto(BASE, { waitUntil: "commit", timeout: 30000 });
console.log("STATUS", res?.status() ?? 0);

await page.waitForTimeout(12000);
await page.screenshot({ path: "/tmp/transfers-live.png", fullPage: true });
console.log("SHOT /tmp/transfers-live.png");

const html = await page.content();
const scriptMatch = html.match(/https:\/\/tpemb\.com\/content[^"']+/);
const iframeMatch = html.match(/https:\/\/[^"']*intui\.travel[^"']+/);
const script = scriptMatch ? scriptMatch[0].replace(/&amp;/g, "&") : "";
const iframe = iframeMatch ? iframeMatch[0].replace(/&amp;/g, "&") : "";
console.log("SCRIPT", script);
console.log("IFRAME", iframe);
console.log("SCRIPT_USD", /currency=usd/i.test(script) || /curr=usd/i.test(script));
console.log("IFRAME_USD", /currency=USD/i.test(iframe) || /curr=USD/i.test(iframe) || /currency=usd/i.test(iframe));
console.log("IFRAME_HOST", (() => { try { return new URL(iframe).hostname; } catch { return ""; } })());
console.log("HAS_WIDGET", html.includes("tp-transfers-widget"));
console.log("HAS_GT", html.includes("google_translate_element"));
console.log("HAS_BANNER", html.includes("goog-te-banner-frame"));

await browser.close();
