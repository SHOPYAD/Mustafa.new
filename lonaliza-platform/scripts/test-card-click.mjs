import { chromium } from "playwright";

async function testClick() {
  const browser = await chromium.launch({
    executablePath: "/usr/bin/chromium-browser",
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"]
  });
  const context = await browser.newContext({
    locale: "ar",
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36",
  });
  await context.addCookies([
    { name: "SOCS", value: "CAISHAgBEhJnd3NfMjAyNDA5MjQtMF9SQzIaAmFyIAEaBgiA7L22Bg", domain: ".google.com", path: "/" },
    { name: "CONSENT", value: "PENDING+999", domain: ".google.com", path: "/" },
  ]);
  const page = await context.newPage();
  await page.goto("https://www.google.com/maps/search/%D9%88%D9%83%D8%A7%D9%84%D8%A7%D8%AA+%D8%B3%D9%8A%D8%A7%D8%AD%D8%A9+%D9%88%D8%B3%D9%81%D8%B1+%D9%81%D9%8A+%D8%A5%D8%B3%D8%B7%D9%86%D8%A8%D9%88%D9%84?hl=ar", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(5000);

  const cards = await page.$$('a[href*="/maps/place/"]');
  console.log("Found cards:", cards.length);

  for (let i = 0; i < Math.min(3, cards.length); i++) {
    const card = cards[i];
    const name = await card.getAttribute("aria-label");
    console.log(`\n--- Card ${i}: ${name} ---`);
    await card.scrollIntoViewIfNeeded().catch(() => {});
    await card.click({ force: true }).catch(() => {});
    await page.waitForTimeout(3000);

    const phoneBtn = await page.$('button[data-item-id^="phone:tel:"]');
    const phone = phoneBtn ? await phoneBtn.getAttribute("data-item-id") : "NONE";

    const webEl = await page.$('a[data-item-id="authority"]');
    const web = webEl ? await webEl.getAttribute("href") : "NONE";

    const addrEl = await page.$('button[data-item-id="address"]');
    const addr = addrEl ? await addrEl.getAttribute("aria-label") : "NONE";

    console.log("Phone:", phone);
    console.log("Website:", web);
    console.log("Address:", addr);
  }

  await browser.close();
}

testClick().catch(console.error);
