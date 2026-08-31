/**
 * Scrape REAL hotel data via Booking.com with warmer session + Tripadvisor fallback.
 * Output: src/data/scraping/hotels/booking-real.json
 */
import { chromium } from "playwright";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(__dirname, "../../src/data/scraping/hotels/booking-real.json");

const HOTELS = [
  { slug: "ciragan-palace-kempinski-istanbul", bookingId: "ciragan-palace-kempinski-istanbul", taQuery: "Ciragan Palace Kempinski Istanbul" },
  { slug: "raffles-istanbul", bookingId: "raffles-istanbul", taQuery: "Raffles Istanbul" },
  { slug: "four-seasons-bosphorus", bookingId: "four-seasons-istanbul-at-the-bosphorus", taQuery: "Four Seasons Hotel Istanbul at the Bosphorus" },
  { slug: "shangri-la-bosphorus", bookingId: "shangri-la-bosphorus-istanbul", taQuery: "Shangri-La Bosphorus Istanbul" },
  { slug: "peninsula-istanbul", bookingId: "the-peninsula-istanbul", taQuery: "The Peninsula Istanbul" },
  { slug: "swissotel-the-bosphorus", bookingId: "swissotel-the-bosphorus", taQuery: "Swissotel The Bosphorus Istanbul" },
  { slug: "cvk-park-bosphorus", bookingId: "cvk-park-bosphorus-hotel-istanbul", taQuery: "CVK Park Bosphorus Hotel Istanbul" },
  { slug: "pera-palace-hotel", bookingId: "pera-palace-hotel", taQuery: "Pera Palace Hotel Istanbul" },
  { slug: "ritz-carlton-istanbul", bookingId: "the-ritz-carlton-istanbul", taQuery: "The Ritz-Carlton Istanbul" },
  { slug: "ajia-hotel-istanbul", bookingId: "a-jia-hotel", taQuery: "Ajia Hotel Istanbul" },
  { slug: "rixos-premium-belek", bookingId: "rixos-premium-belek", taQuery: "Rixos Premium Belek" },
  { slug: "maxx-royal-kemer", bookingId: "maxx-royal-kemer-resort", taQuery: "Maxx Royal Kemer Resort" },
  { slug: "akra-antalya", bookingId: "akra-hotel", taQuery: "Akra Antalya Hotel" },
  { slug: "calista-luxury-resort", bookingId: "calista-luxury-resort", taQuery: "Calista Luxury Resort Belek" },
  { slug: "regnum-carya", bookingId: "regnum-carya-golf-spa-resort", taQuery: "Regnum Carya Golf Spa Resort" },
  { slug: "museum-hotel-cappadocia", bookingId: "museum-hotel", taQuery: "Museum Hotel Cappadocia" },
  { slug: "argos-in-cappadocia", bookingId: "argos-in-cappadocia", taQuery: "Argos in Cappadocia" },
  { slug: "kayakapi-premium-caves", bookingId: "kayakapi-premium-caves", taQuery: "Kayakapi Premium Caves Cappadocia" },
  { slug: "cappadocia-cave-resort", bookingId: "cappadocia-cave-resort-and-spa", taQuery: "Cappadocia Cave Resort Spa" },
  { slug: "zorlu-grand-trabzon", bookingId: "zorlu-grand-hotel", taQuery: "Zorlu Grand Hotel Trabzon" },
  { slug: "novotel-trabzon", bookingId: "novotel-trabzon", taQuery: "Novotel Trabzon" },
  { slug: "radisson-blu-trabzon", bookingId: "radisson-blu-hotel-trabzon", taQuery: "Radisson Blu Hotel Trabzon" },
  { slug: "swissotel-uludag-bursa", bookingId: "swissotel-resort-uludag-bursa", taQuery: "Swissotel Resort Uludag Bursa" },
  { slug: "kervansaray-bursa", bookingId: "kervansaray-bursa", taQuery: "Kervansaray Bursa Hotel" },
  { slug: "holiday-inn-bursa", bookingId: "holiday-inn-bursa-city-centre", taQuery: "Holiday Inn Bursa City Centre" },
  { slug: "sapanca-lake-houses", bookingId: "richmond-nua-wellness-spa", taQuery: "Richmond Nua Wellness Spa Sapanca", replaceNameEn: "Richmond Nua Wellness Spa", replaceNameAr: "ريتشموند نوا ويلنس سبا سبانجا" },
  { slug: "ng-sapanca-wellness", bookingId: "ng-sapanca-wellness-convention", taQuery: "NG Sapanca Wellness Convention" },
  { slug: "sapanca-glamping-suites", bookingId: "ng-sapanca-enjoy", taQuery: "NG Enjoy Sapanca", replaceNameEn: "NG Enjoy", replaceNameAr: "إن جي إنجوي سبانجا" },
  { slug: "ayder-plateau-resort", bookingId: "ayder-paradise-otel", taQuery: "Ayder Paradise Otel", replaceNameEn: "Ayder Paradise Otel", replaceNameAr: "آيدر بارادايس أوتيل" },
  { slug: "rize-tea-garden-hotel", bookingId: "yesilvadi", taQuery: "Yesilvadi Otel Ayder", replaceNameEn: "Yeşilvadi Otel", replaceNameAr: "يشيل فادي أوتيل آيدر" },
];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function extractBooking(page) {
  return page.evaluate(() => {
    const get = (sels) => {
      for (const s of sels) {
        const el = document.querySelector(s);
        if (el?.textContent?.trim()) return el.textContent.trim();
      }
      return "";
    };
    const allText = document.body?.innerText || "";
    const isHome =
      allText.includes("Find your next stay") &&
      !allText.includes("Guest reviews") &&
      allText.length < 20000;

    // Pull description from common blocks in full text
    let description = get([
      '[data-testid="property-description"]',
      "#property_description_content",
      ".hp-description",
      '[data-capla-component*="PropertyDescription"]',
    ]);
    if (!description) {
      const m = allText.match(
        /(?:About this property|Description|Get the celebrity treatment)([\s\S]{80,2500}?)(?:Facilities|Most popular|Guest reviews|Surroundings|House rules)/i
      );
      if (m) description = m[1].replace(/\s+/g, " ").trim();
    }

    const facilities = [];
    const facSection = allText.match(
      /Most popular facilities([\s\S]{20,1500}?)(?:Great facilities|Facilities of|Guest reviews|Property highlights)/i
    );
    if (facSection) {
      facilities.push(
        ...facSection[1]
          .split(/\n|•/)
          .map((s) => s.trim())
          .filter((s) => s.length > 2 && s.length < 60)
      );
    }

    const nearby = [];
    const nearSection = allText.match(
      /(?:What's nearby|Surroundings|Nearby)([\s\S]{20,2000}?)(?:Restaurants|Guest reviews|FAQ|House rules|Facilities)/i
    );
    if (nearSection) {
      nearby.push(
        ...nearSection[1]
          .split(/\n/)
          .map((s) => s.trim())
          .filter((s) => /\d/.test(s) && s.length < 80)
          .slice(0, 15)
      );
    }

    const scoreMatch = allText.match(
      /(?:Scored|Review score|Superb|Wonderful|Excellent|Fabulous|Very good)\s*([\d.]+)/i
    ) || allText.match(/([\d.]+)\s*(?:Superb|Wonderful|Excellent|Fabulous)/i);

    const reviewCountMatch = allText.match(/([\d,]+)\s*(?:reviews|real reviews)/i);

    const roomNames = [];
    const roomBlocks = allText.match(/(?:Room|Suite|Villa|Chalet|Cabin)[^\n]{5,80}/gi) || [];
    for (const r of roomBlocks.slice(0, 40)) {
      if (/select|search|adult|child|filter/i.test(r)) continue;
      roomNames.push(r.trim());
    }

    return {
      isHome,
      title: get(["#hp_hotel_name", "h2.pp-header__title", "h1", '[data-testid="title"]']),
      address: get(['[data-testid="address"]', ".hp_address_subtitle", "#showMap2"]),
      description: description.slice(0, 4500),
      score: scoreMatch ? parseFloat(scoreMatch[1]) : null,
      reviewCount: reviewCountMatch
        ? parseInt(reviewCountMatch[1].replace(/,/g, ""), 10)
        : null,
      facilities: [...new Set(facilities)].slice(0, 30),
      nearby: [...new Set(nearby)].slice(0, 15),
      roomNames: [...new Set(roomNames)].slice(0, 10),
      allTextLen: allText.length,
      allTextSample: allText.slice(0, 8000),
    };
  });
}

async function scrapeTripadvisorReviews(page, query) {
  const searchUrl = `https://www.tripadvisor.com/Search?q=${encodeURIComponent(query + " hotel")}`;
  try {
    await page.goto(searchUrl, { waitUntil: "domcontentloaded", timeout: 60000 });
    await sleep(2500);
    const link = await page.evaluate(() => {
      const a = Array.from(document.querySelectorAll("a[href*='Hotel_Review']")).find(
        (el) => el.href.includes("Hotel_Review")
      );
      return a?.href || null;
    });
    if (!link) return [];
    await page.goto(link, { waitUntil: "domcontentloaded", timeout: 60000 });
    await sleep(2500);
    return page.evaluate(() => {
      const cards = Array.from(
        document.querySelectorAll('[data-test-target="HR_CC_CARD"], .review-container, .YibKl')
      ).slice(0, 6);
      // Fallback: review text blocks
      const texts = Array.from(document.querySelectorAll("span, q, p"))
        .map((el) => el.textContent?.trim() || "")
        .filter((t) => t.length > 80 && t.length < 700 && /hotel|room|stay|staff|pool|view/i.test(t))
        .slice(0, 8);

      if (cards.length) {
        return cards.map((c, i) => ({
          author: c.querySelector(".ui_header_link, a.ui_social_avatar + span")?.textContent?.trim() || `Traveler ${i + 1}`,
          text: (c.textContent || "").replace(/\s+/g, " ").trim().slice(0, 600),
          source: "Tripadvisor",
        }));
      }
      return texts.map((text, i) => ({
        author: `Traveler ${i + 1}`,
        text,
        source: "Tripadvisor",
      }));
    });
  } catch {
    return [];
  }
}

async function main() {
  const browser = await chromium.launch({
    headless: true,
    args: ["--disable-blink-features=AutomationControlled"],
  });
  const context = await browser.newContext({
    locale: "en-US",
    timezoneId: "Europe/Istanbul",
    userAgent:
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
    viewport: { width: 1440, height: 960 },
  });
  await context.addInitScript(() => {
    Object.defineProperty(navigator, "webdriver", { get: () => undefined });
  });
  const page = await context.newPage();

  // Warm session
  await page.goto("https://www.booking.com/", { waitUntil: "domcontentloaded", timeout: 60000 });
  await sleep(2000);
  try {
    const accept = page.locator("#onetrust-accept-btn-handler");
    if (await accept.isVisible({ timeout: 3000 })) await accept.click();
  } catch {
    /* */
  }

  const results = fs.existsSync(OUT) ? JSON.parse(fs.readFileSync(OUT, "utf8")) : {};

  for (const hotel of HOTELS) {
    if (results[hotel.slug]?.description && results[hotel.slug].description.length > 100) {
      console.log("skip", hotel.slug);
      continue;
    }
    console.log("\n→", hotel.slug);
    const url = `https://www.booking.com/hotel/tr/${hotel.bookingId}.html`;
    try {
      await page.goto(url, { waitUntil: "networkidle", timeout: 90000 });
      await sleep(3500);
      try {
        const accept = page.locator("#onetrust-accept-btn-handler");
        if (await accept.isVisible({ timeout: 1500 })) await accept.click();
      } catch {
        /* */
      }
      const booking = await extractBooking(page);
      console.log(
        `  booking home=${booking.isHome} desc=${booking.description.length} fac=${booking.facilities.length} score=${booking.score}`
      );

      let reviews = [];
      if (!booking.isHome && booking.allTextSample) {
        // Parse review-like lines from page text if present
        const chunks = booking.allTextSample.split(/\n{2,}/);
        reviews = chunks
          .filter((c) => c.length > 100 && /staff|room|breakfast|location|pool|view|clean/i.test(c))
          .slice(0, 5)
          .map((text, i) => ({
            author: `Verified guest ${i + 1}`,
            text: text.replace(/\s+/g, " ").trim().slice(0, 500),
            source: "Booking.com",
          }));
      }

      if (reviews.length < 3) {
        console.log("  fetching Tripadvisor reviews…");
        const ta = await scrapeTripadvisorReviews(page, hotel.taQuery);
        reviews = [...reviews, ...ta].slice(0, 8);
      }

      results[hotel.slug] = {
        ...hotel,
        sourceUrl: url,
        scrapedAt: new Date().toISOString(),
        ...booking,
        reviews,
      };
      fs.writeFileSync(OUT, JSON.stringify(results, null, 2));
    } catch (e) {
      console.error(" FAIL", e.message);
      results[hotel.slug] = { ...hotel, error: e.message };
      fs.writeFileSync(OUT, JSON.stringify(results, null, 2));
    }
    await sleep(2500);
  }

  await browser.close();
  console.log("Wrote", OUT);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
