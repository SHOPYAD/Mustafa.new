import { chromium } from "playwright";

async function inspect() {
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
  const query = "وكالات سياحة وسفر في إسطنبول";
  await page.goto("https://www.google.com/maps/search/" + encodeURIComponent(query), { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(5000);

  const placeCards = await page.$$('a[href*="/maps/place/"]');
  console.log("Found place cards:", placeCards.length);

  if (placeCards.length > 0) {
    const card = placeCards[0];
    const name = await card.getAttribute("aria-label");
    console.log("Card 1 name:", name);
    await card.click();
    await page.waitForTimeout(3000);

    const buttons = await page.$$eval("button[data-item-id], a[data-item-id]", els =>
      els.map(e => ({
        tag: e.tagName,
        itemId: e.getAttribute("data-item-id"),
        aria: e.getAttribute("aria-label"),
        text: e.innerText?.trim()
      }))
    );
    console.log("Buttons / Links with data-item-id:", JSON.stringify(buttons, null, 2));

    // Also look at rating
    const ratingEl = await page.$('span[role="img"][aria-label*="نجوم"], span[role="img"][aria-label*="stars"]');
    if (ratingEl) {
      console.log("Rating aria-label:", await ratingEl.getAttribute("aria-label"));
    }

    // Coordinates from URL
    console.log("Current page URL:", page.url());
  }

  await browser.close();
}

inspect().catch(console.error);
