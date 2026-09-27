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
    const root = document.querySelector("#admin-root") || document.body;
    const theme =
      document.querySelector("#admin-root")?.getAttribute("data-admin-theme") ||
      document.documentElement.getAttribute("data-admin-color-scheme");
    return {
      label: pageLabel,
      url: location.href,
      theme,
      htmlDark: document.documentElement.classList.contains("dark"),
      bg: getComputedStyle(document.body).backgroundColor,
      cards: document.querySelectorAll("[data-slot='card']").length,
      tables: document.querySelectorAll("[data-slot='table']").length,
      sheets: document.querySelectorAll("[data-slot='sheet']").length,
      buttons: document.querySelectorAll("[data-slot='button']").length,
      details: document.querySelectorAll("details").length,
      royalHero: document.querySelectorAll(".royal-hero").length,
      royalModule: document.querySelectorAll(".royal-module").length,
      royalTable: document.querySelectorAll(".royal-data-table").length,
      h1: document.querySelector("h1")?.textContent?.trim()?.slice(0, 80) || "",
    };
  }, label);
}

await login();
const fail = [];

await page.goto("https://lonaliza.com/admin/tours?cb=" + Date.now(), {
  waitUntil: "networkidle",
  timeout: 60000,
});
await page.waitForSelector("h1", { timeout: 30000 });
const tours = await snap("tours");
await page.screenshot({ path: "/tmp/lonaliza-proof-tours.png" });
if (tours.tables < 1) fail.push("tours missing table");
if (tours.royalHero > 0) fail.push("tours royal-hero");
if (tours.royalTable > 0) fail.push("tours royal-data-table");

const addTour = page.getByRole("button", { name: /Add Tour|إضافة/i }).first();
if (await addTour.count()) {
  await addTour.click();
  await page.waitForTimeout(600);
}
const tourForm = await snap("tours-add-sheet");
await page.screenshot({ path: "/tmp/lonaliza-proof-tours-add.png" });
if (tourForm.sheets < 1 && tourForm.details < 1) fail.push("add tour form missing sheet/details");

await page.goto("https://lonaliza.com/admin/payments?cb=" + Date.now(), {
  waitUntil: "networkidle",
  timeout: 60000,
});
await page.waitForSelector("h1", { timeout: 30000 });
const payments = await snap("payments");
await page.screenshot({ path: "/tmp/lonaliza-proof-payments.png" });
if (payments.cards < 1) fail.push("payments missing cards");
if (payments.royalHero > 0) fail.push("payments royal-hero");

await page.goto("https://lonaliza.com/admin/hotels/supply?cb=" + Date.now(), {
  waitUntil: "networkidle",
  timeout: 60000,
});
await page.waitForSelector("h1", { timeout: 30000 });
const supply = await snap("hotels-supply");
await page.screenshot({ path: "/tmp/lonaliza-proof-hotels-supply.png" });

await page.goto("https://lonaliza.com/admin/customers?cb=" + Date.now(), {
  waitUntil: "networkidle",
  timeout: 60000,
});
await page.waitForSelector("h1", { timeout: 30000 });
const customers = await snap("customers");

const report = { tours, tourForm, payments, supply, customers, fail };
console.log(JSON.stringify(report, null, 2));
fs.writeFileSync("/tmp/lonaliza-leftover-ui-proof.json", JSON.stringify(report, null, 2));
await browser.close();
if (fail.length) {
  console.error("PROOF_FAIL", fail);
  process.exit(1);
}
console.log("PROOF_OK");
