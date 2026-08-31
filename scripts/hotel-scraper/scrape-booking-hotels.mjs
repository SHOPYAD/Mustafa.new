/**
 * Scrape REAL hotel facts + guest reviews from Booking.com (Playwright).
 * Output: src/data/scraping/hotels/booking-raw.json
 *
 * Run: node scripts/scrape-booking-hotels.mjs
 */
import { chromium } from "playwright";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(__dirname, "../../src/data/scraping/hotels/booking-raw.json");

/** Our slug → Booking.com hotel path (verified / real listings only) */
const HOTELS = [
  { slug: "ciragan-palace-kempinski-istanbul", bookingId: "ciragan-palace-kempinski-istanbul", nameEn: "Çırağan Palace Kempinski Istanbul" },
  { slug: "raffles-istanbul", bookingId: "raffles-istanbul", nameEn: "Raffles Istanbul" },
  { slug: "four-seasons-bosphorus", bookingId: "four-seasons-istanbul-at-the-bosphorus", nameEn: "Four Seasons Hotel Istanbul at the Bosphorus" },
  { slug: "shangri-la-bosphorus", bookingId: "shangri-la-bosphorus-istanbul", nameEn: "Shangri-La Bosphorus, Istanbul" },
  { slug: "peninsula-istanbul", bookingId: "the-peninsula-istanbul", nameEn: "The Peninsula Istanbul" },
  { slug: "swissotel-the-bosphorus", bookingId: "swissotel-the-bosphorus", nameEn: "Swissôtel The Bosphorus Istanbul" },
  { slug: "cvk-park-bosphorus", bookingId: "cvk-park-bosphorus-hotel-istanbul", nameEn: "CVK Park Bosphorus Hotel Istanbul" },
  { slug: "pera-palace-hotel", bookingId: "pera-palace-hotel", nameEn: "Pera Palace Hotel" },
  { slug: "ritz-carlton-istanbul", bookingId: "the-ritz-carlton-istanbul", nameEn: "The Ritz-Carlton, Istanbul" },
  { slug: "ajia-hotel-istanbul", bookingId: "a-jia-hotel", nameEn: "A'jia Hotel" },
  { slug: "rixos-premium-belek", bookingId: "rixos-premium-belek", nameEn: "Rixos Premium Belek" },
  { slug: "maxx-royal-kemer", bookingId: "maxx-royal-kemer-resort", nameEn: "Maxx Royal Kemer Resort" },
  { slug: "akra-antalya", bookingId: "akra-hotel", nameEn: "Akra Hotel" },
  { slug: "calista-luxury-resort", bookingId: "calista-luxury-resort", nameEn: "Calista Luxury Resort" },
  { slug: "regnum-carya", bookingId: "regnum-carya-golf-spa-resort", nameEn: "Regnum Carya Golf & Spa Resort" },
  { slug: "museum-hotel-cappadocia", bookingId: "museum-hotel", nameEn: "Museum Hotel" },
  { slug: "argos-in-cappadocia", bookingId: "argos-in-cappadocia", nameEn: "Argos in Cappadocia" },
  { slug: "kayakapi-premium-caves", bookingId: "kayakapi-premium-caves", nameEn: "Kayakapi Premium Caves" },
  { slug: "cappadocia-cave-resort", bookingId: "cappadocia-cave-resort-and-spa", nameEn: "Cappadocia Cave Resort & Spa" },
  { slug: "zorlu-grand-trabzon", bookingId: "zorlu-grand-hotel", nameEn: "Zorlu Grand Hotel" },
  { slug: "novotel-trabzon", bookingId: "novotel-trabzon", nameEn: "Novotel Trabzon" },
  { slug: "radisson-blu-trabzon", bookingId: "radisson-blu-hotel-trabzon", nameEn: "Radisson Blu Hotel, Trabzon" },
  { slug: "swissotel-uludag-bursa", bookingId: "swissotel-resort-uludag-bursa", nameEn: "Swissôtel Resort Uludağ Bursa" },
  { slug: "kervansaray-bursa", bookingId: "kervansaray-bursa", nameEn: "Kervansaray Bursa" },
  { slug: "holiday-inn-bursa", bookingId: "holiday-inn-bursa-city-centre", nameEn: "Holiday Inn Bursa - City Centre" },
  // Replaced generic/fake names with real Booking listings:
  { slug: "sapanca-lake-houses", bookingId: "richmond-nua-wellness-spa", nameEn: "Richmond Nua Wellness Spa", replaceName: true },
  { slug: "ng-sapanca-wellness", bookingId: "ng-sapanca-wellness-convention", nameEn: "NG Sapanca Wellness & Convention" },
  { slug: "sapanca-glamping-suites", bookingId: "ng-sapanca-enjoy", nameEn: "NG Enjoy", replaceName: true },
  { slug: "ayder-plateau-resort", bookingId: "ayder-paradise-otel", nameEn: "Ayder Paradise Otel", replaceName: true },
  { slug: "rize-tea-garden-hotel", bookingId: "yesilvadi", nameEn: "Yeşilvadi Otel", replaceName: true },
];

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function scrapeHotel(page, hotel) {
  const url = `https://www.booking.com/hotel/tr/${hotel.bookingId}.en-gb.html`;
  const reviewsUrl = `https://www.booking.com/reviews/tr/hotel/${hotel.bookingId}.en-gb.html`;

  console.log(`\n→ ${hotel.slug} | ${url}`);
  await page.goto(url, { waitUntil: "domcontentloaded", timeout: 90000 });
  await sleep(2500);

  // Dismiss cookie banner if present
  try {
    const btn = page.locator("#onetrust-accept-btn-handler");
    if (await btn.isVisible({ timeout: 2000 })) await btn.click();
  } catch {
    /* ignore */
  }
  await sleep(1000);

  const data = await page.evaluate(() => {
    const text = (sel) =>
      Array.from(document.querySelectorAll(sel))
        .map((el) => el.textContent?.trim() || "")
        .filter(Boolean);

    const description =
      document.querySelector('[data-testid="property-description"]')?.textContent?.trim() ||
      document.querySelector("#property_description_content")?.textContent?.trim() ||
      document.querySelector(".hp-description")?.textContent?.trim() ||
      "";

    const address =
      document.querySelector('[data-testid="address"]')?.textContent?.trim() ||
      document.querySelector(".hp_address_subtitle")?.textContent?.trim() ||
      "";

    const scoreText =
      document.querySelector('[data-testid="review-score-component"]')?.textContent ||
      document.querySelector(".review-score-badge")?.textContent ||
      document.querySelector('[aria-label*="Scored"]')?.getAttribute("aria-label") ||
      "";

    const facilities = [
      ...text('[data-testid="facility-group"] li'),
      ...text(".hotel-facilities-group li"),
      ...text("#hp_facilities_box li"),
      ...text('[data-testid="property-most-popular-facilities-wrapper"] li'),
    ].slice(0, 40);

    const nearby = [
      ...text('[data-testid="property-landmarks"] li'),
      ...text(".hp-poi-content-container li"),
      ...text('[data-testid="nearby-places"] li'),
    ].slice(0, 20);

    const roomNames = [
      ...text('[data-testid="room-card"] h3'),
      ...text(".hprt-roomtype-link"),
      ...text(".hprt-roomtype-icon-link"),
    ].slice(0, 12);

    const images = Array.from(
      document.querySelectorAll('img[src*="bstatic.com/xdata/images/hotel"]')
    )
      .map((img) => img.src || img.getAttribute("data-src") || "")
      .filter((s) => s.includes("bstatic"))
      .slice(0, 8);

    const title =
      document.querySelector("#hp_hotel_name")?.textContent?.trim() ||
      document.querySelector('[data-testid="title"]')?.textContent?.trim() ||
      document.querySelector("h2")?.textContent?.trim() ||
      "";

    const bodySnippet = document.body?.innerText?.slice(0, 12000) || "";

    return {
      title,
      address,
      description: description.slice(0, 4000),
      scoreText,
      facilities: [...new Set(facilities)],
      nearby: [...new Set(nearby)],
      roomNames: [...new Set(roomNames)],
      images: [...new Set(images)],
      bodySnippet,
      pageOk: !bodySnippet.includes("verify that you're not a robot"),
    };
  });

  // Reviews page
  let reviews = [];
  try {
    await page.goto(reviewsUrl, { waitUntil: "domcontentloaded", timeout: 60000 });
    await sleep(2000);
    reviews = await page.evaluate(() => {
      const cards = Array.from(
        document.querySelectorAll(
          '[data-testid="review-card"], .review_list_new_item_block, .c-review-block'
        )
      ).slice(0, 8);

      return cards.map((card, i) => {
        const author =
          card.querySelector('[data-testid="review-author"], .bui-avatar-block__title')
            ?.textContent?.trim() || `Guest ${i + 1}`;
        const country =
          card.querySelector(
            '[data-testid="review-author-country"], .bui-avatar-block__subtitle'
          )?.textContent?.trim() || "";
        const title =
          card.querySelector(
            '[data-testid="review-title"], .c-review-block__title'
          )?.textContent?.trim() || "";
        const positive =
          card.querySelector(
            '[data-testid="review-positive-text"], .c-review__body, .review_item_review_content'
          )?.textContent?.trim() ||
          card.textContent?.trim().slice(0, 500) ||
          "";
        const score =
          card.querySelector(
            '[data-testid="review-score"], .bui-review-score__badge'
          )?.textContent?.trim() || "";
        const date =
          card.querySelector(
            '[data-testid="review-date"], .c-review-block__date'
          )?.textContent?.trim() || "";
        return { author, country, title, positive: positive.slice(0, 800), score, date };
      });
    });
  } catch (e) {
    console.warn("  reviews failed:", e.message);
  }

  return {
    ...hotel,
    sourceUrl: url,
    reviewsUrl,
    scrapedAt: new Date().toISOString(),
    ...data,
    reviews: reviews.filter((r) => r.positive && r.positive.length > 40),
  };
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    locale: "en-GB",
    userAgent:
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
    viewport: { width: 1400, height: 900 },
  });
  const page = await context.newPage();

  const existing = fs.existsSync(OUT)
    ? JSON.parse(fs.readFileSync(OUT, "utf8"))
    : {};
  const results = { ...existing };

  for (const hotel of HOTELS) {
    if (results[hotel.slug]?.pageOk && results[hotel.slug]?.description) {
      console.log(`skip (cached ok): ${hotel.slug}`);
      continue;
    }
    try {
      const scraped = await scrapeHotel(page, hotel);
      results[hotel.slug] = scraped;
      fs.writeFileSync(OUT, JSON.stringify(results, null, 2), "utf8");
      console.log(
        `  ok=${scraped.pageOk} desc=${scraped.description?.length || 0} facilities=${scraped.facilities?.length || 0} reviews=${scraped.reviews?.length || 0}`
      );
    } catch (e) {
      console.error(`  FAIL ${hotel.slug}:`, e.message);
      results[hotel.slug] = {
        ...hotel,
        error: e.message,
        scrapedAt: new Date().toISOString(),
      };
      fs.writeFileSync(OUT, JSON.stringify(results, null, 2), "utf8");
    }
    await sleep(2000 + Math.random() * 1500);
  }

  await browser.close();
  console.log("\nWrote", OUT);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
