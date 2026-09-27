import { chromium } from "playwright";
import fs from "node:fs";

const creds = fs.readFileSync("/tmp/lonaliza-admin-creds.env", "utf8");
const user = /NEXT_PUBLIC_ADMIN_USERNAME="([^"]+)"/.exec(creds)?.[1];
const pass = /NEXT_PUBLIC_ADMIN_PASSWORD="([^"]+)"/.exec(creds)?.[1];
if (!user || !pass) throw new Error("missing creds");

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 1100 } });

async function login() {
  await page.goto("https://lonaliza.com/admin/login", { waitUntil: "networkidle", timeout: 60000 });
  await page.locator("input[autocomplete='username']").fill(user);
  await page.locator("input[autocomplete='current-password']").fill(pass);
  await page.locator("button[type='submit']").click();
  await page.waitForURL(/\/admin(?!\/login)/, { timeout: 45000 });
  await page.evaluate(() => {
    localStorage.setItem("lonaliza_admin_theme_v3", "light");
  });
}

function snap(label) {
  return page.evaluate((pageLabel) => {
    return {
      label: pageLabel,
      url: location.href,
      theme:
        document.querySelector("#admin-root")?.getAttribute("data-admin-theme") ||
        document.documentElement.getAttribute("data-admin-color-scheme"),
      htmlDark: document.documentElement.classList.contains("dark"),
      bg: getComputedStyle(document.body).backgroundColor,
      cards: document.querySelectorAll("[data-slot='card']").length,
      tables: document.querySelectorAll("[data-slot='table']").length,
      tabs: document.querySelectorAll("[data-slot='tabs-trigger']").length,
      buttons: document.querySelectorAll("[data-slot='button']").length,
      royalHero: document.querySelectorAll(".royal-hero").length,
      royalModule: document.querySelectorAll(".royal-module").length,
      royalTable: document.querySelectorAll(".royal-data-table").length,
      h1: document.querySelector("h1")?.textContent?.trim()?.slice(0, 90) || "",
    };
  }, label);
}

await login();
const fail = [];

await page.goto("https://lonaliza.com/admin/ads?cb=" + Date.now(), {
  waitUntil: "networkidle",
  timeout: 60000,
});
await page.waitForSelector("h1", { timeout: 30000 });
const ads = await snap("ads");
await page.screenshot({ path: "/tmp/lonaliza-proof-ads.png" });
if (ads.royalHero > 0 || ads.royalModule > 0 || ads.royalTable > 0) fail.push("ads still royal-*");
if (ads.tabs < 1) fail.push("ads missing tabs");

await page.goto("https://lonaliza.com/admin/packages?cb=" + Date.now(), {
  waitUntil: "networkidle",
  timeout: 60000,
});
await page.waitForSelector("h1", { timeout: 30000 });
const packages = await snap("packages");
await page.screenshot({ path: "/tmp/lonaliza-proof-packages.png" });
if (packages.royalTable > 0) fail.push("packages royal-data-table");
if (packages.tables < 1 && packages.cards < 1) fail.push("packages missing table/cards");

await page.goto("https://lonaliza.com/admin/agent-war-room?cb=" + Date.now(), {
  waitUntil: "networkidle",
  timeout: 60000,
});
await page.waitForSelector("h1, [data-slot='card-title']", { timeout: 30000 });
const war = await snap("agent-war-room");
await page.screenshot({ path: "/tmp/lonaliza-proof-war-room.png" });
if (war.royalHero > 0) fail.push("war room royal-hero");
if (war.cards < 1) fail.push("war room missing cards");

const report = { ads, packages, war, fail };
console.log(JSON.stringify(report, null, 2));
fs.writeFileSync("/tmp/lonaliza-final-sweep-proof.json", JSON.stringify(report, null, 2));
await browser.close();
if (fail.length) {
  console.error("PROOF_FAIL", fail);
  process.exit(1);
}
console.log("PROOF_OK");
