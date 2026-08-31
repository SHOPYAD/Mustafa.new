import { chromium } from "playwright";
import { mkdirSync, writeFileSync } from "fs";

mkdirSync("/tmp/flights-verify", { recursive: true });

const SEARCH =
  "https://lonaliza.com/flights?from=RUH&to=IST&date=2026-09-15&flightType=one-way&guests=1";

function frameUrl(frame) {
  try {
    return typeof frame.url === "function" ? frame.url() : frame.url;
  } catch {
    return "?";
  }
}

const browser = await chromium.launch({
  headless: true,
  args: ["--disable-blink-features=AutomationControlled"],
});
const context = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  locale: "ar-SA",
  userAgent:
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36",
});
const page = await context.newPage();
const navLog = [];
page.on("framenavigated", (frame) => {
  navLog.push({ kind: frame === page.mainFrame() ? "TOP" : "FRAME", url: frameUrl(frame) });
  console.log("NAV", frame === page.mainFrame() ? "TOP" : "FRAME", frameUrl(frame));
});
page.on("popup", (popup) => console.log("POPUP", popup.url()));

await page.goto(SEARCH, { waitUntil: "domcontentloaded", timeout: 60000 });
await page.waitForSelector("iframe[title='Flight search']", { timeout: 30000 });
const fl = page.frameLocator("iframe[title='Flight search']");

await page.waitForTimeout(3000);
const accept = fl.locator("button.tpwl-cookie-banner__accept");
if ((await accept.count()) > 0) await accept.first().click().catch(() => {});

const ticketWidget = fl.locator("[class*='TicketsWidget-module__root']");
await ticketWidget.waitFor({ timeout: 45000 }).catch(() => {});
await page.waitForTimeout(8000);
await page.screenshot({ path: "/tmp/flights-verify/01-results.png" });

const details = fl.locator("button, a, [role=button]").filter({ hasText: /تفاصيل|details/i });
console.log("DETAILS_COUNT", await details.count());

if ((await details.count()) > 0) {
  await details.first().click({ timeout: 8000 });
  console.log("CLICK details");
} else {
  const card = fl.locator("[class*='Ticket-module__root'], [class*='TicketCard']").first();
  if ((await card.count()) > 0) {
    await card.click({ timeout: 8000 });
    console.log("CLICK Ticket-module");
  } else {
    await fl.getByText("flyadeal").first().click({ timeout: 8000 });
    console.log("CLICK flyadeal");
  }
}

await page.waitForTimeout(2500);

const metrics = await page.evaluate(() => {
  const iframe = document.querySelector("iframe[title='Flight search']");
  const header = document.querySelector("header");
  const doc = iframe?.contentDocument;
  const headerBottom = header?.getBoundingClientRect().bottom ?? 0;
  const iframeRect = iframe?.getBoundingClientRect();
  const iframeCs = iframe ? getComputedStyle(iframe) : null;

  const walk = (root, acc) => {
    for (const el of root.querySelectorAll(
      "[class*='Modal-module__root'], [class*='Modal-module__overlay'], [class*='TicketDetail'], [role='dialog'], [aria-modal='true']"
    )) {
      const r = el.getBoundingClientRect();
      acc.push({
        cls: el.className?.toString?.().slice(0, 180),
        role: el.getAttribute("role"),
        top: r.top,
        height: r.height,
        width: r.width,
      });
    }
    for (const el of root.querySelectorAll("*")) {
      if (el.shadowRoot) walk(el.shadowRoot, acc);
    }
  };
  const dialogs = [];
  if (doc) walk(doc, dialogs);

  const dialog = dialogs.find((d) => d.height > 80) || dialogs[0];
  const dialogTopInPage = dialog && iframeRect ? iframeRect.top + dialog.top : null;

  return {
    headerBottom,
    iframeTop: iframeRect?.top ?? null,
    iframeHeight: iframeRect?.height ?? null,
    expectedIframeH: window.innerHeight - headerBottom,
    windowH: window.innerHeight,
    iframePos: iframeCs?.position ?? null,
    iframeStyleTop: iframeCs?.top ?? null,
    iframeInline: iframe?.getAttribute("style"),
    htmlClass: doc?.documentElement?.className ?? null,
    hasTpwlModals: !!doc?.getElementById("tpwl-modals"),
    hasShadowCss: !!doc
      ?.getElementById("tpwl-modals")
      ?.shadowRoot?.getElementById("alrayyan-tpwl-modal-shadow"),
    dialogs,
    dialogTopInPage,
    pinOk:
      iframeRect != null &&
      iframeRect.top + 1 >= headerBottom &&
      Math.abs(iframeRect.height - (window.innerHeight - headerBottom)) < 50,
    dialogVisible: Boolean(dialog && dialog.top >= -2 && dialog.height > 80),
  };
});

console.log("METRICS", JSON.stringify(metrics, null, 2));
await page.screenshot({ path: "/tmp/flights-verify/02-modal.png" });

const buy = fl.locator("button, a").filter({ hasText: /شراء|Buy|احجز/i });
console.log("BUY_COUNT", await buy.count());
let afterBuy = null;
if ((await buy.count()) > 0) {
  const popupP = page.waitForEvent("popup", { timeout: 8000 }).catch(() => null);
  const urlP = page.waitForURL(/\/flights\/redirect|tpemb\.com|gotogate/i, { timeout: 8000 }).catch(() => null);
  await buy.first().click();
  const popup = await popupP;
  await urlP;
  await page.waitForTimeout(2500);
  afterBuy = {
    top: page.url(),
    popup: popup?.url() ?? null,
    pages: context.pages().map((p) => p.url()),
    frames: page.frames().map(frameUrl),
  };
  console.log("AFTER_BUY", JSON.stringify(afterBuy, null, 2));
  await page.screenshot({ path: "/tmp/flights-verify/03-buy.png" });
} else {
  console.log("NO_BUY_BUTTON");
}

const redirectOk = Boolean(
  afterBuy &&
    (/lonaliza\.com\/flights\/redirect/.test(afterBuy.top) ||
      afterBuy.pages.some((u) => /lonaliza\.com\/flights\/redirect/.test(u)) ||
      (afterBuy.popup && /lonaliza\.com\/flights\/redirect/.test(afterBuy.popup)))
);

const result = {
  modalPinned: metrics.pinOk,
  dialogVisible: metrics.dialogVisible,
  iframeTop: metrics.iframeTop,
  headerBottom: metrics.headerBottom,
  iframeHeight: metrics.iframeHeight,
  expectedIframeH: metrics.expectedIframeH,
  windowH: metrics.windowH,
  htmlClass: metrics.htmlClass,
  iframePos: metrics.iframePos,
  hasShadowCss: metrics.hasShadowCss,
  dialogTopInPage: metrics.dialogTopInPage,
  redirectOk,
  afterBuy,
  navLog,
};
writeFileSync("/tmp/flights-verify/result.json", JSON.stringify(result, null, 2));
console.log("RESULT", JSON.stringify(result, null, 2));
await browser.close();
process.exit(metrics.pinOk && metrics.dialogVisible ? 0 : 2);
