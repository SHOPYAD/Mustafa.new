/**
 * Scrape REAL hotel data from Booking.com reviews pages + Tripadvisor fallback.
 * Output: src/data/scraping/hotels/real-from-booking.json (intermediate raw), then enrich script formats it.
 */
import { chromium } from "playwright";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const RAW_OUT = path.join(__dirname, "../../src/data/scraping/hotels/raw.json");

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
  { slug: "akra-antalya", bookingId: "akra-hotel", taQuery: "Akra Antalya" },
  { slug: "calista-luxury-resort", bookingId: "calista-luxury-resort", taQuery: "Calista Luxury Resort Belek" },
  { slug: "regnum-carya", bookingId: "regnum-carya-golf-spa-resort", taQuery: "Regnum Carya Golf Spa Resort" },
  { slug: "museum-hotel-cappadocia", bookingId: "museum-hotel", taQuery: "Museum Hotel Cappadocia" },
  { slug: "argos-in-cappadocia", bookingId: "argos-in-cappadocia", taQuery: "Argos in Cappadocia" },
  { slug: "kayakapi-premium-caves", bookingId: "kayakapi-premium-caves", taQuery: "Kayakapi Premium Caves Cappadocia" },
  { slug: "cappadocia-cave-resort", bookingId: "cappadocia-cave-resort-and-spa", taQuery: "Cappadocia Cave Resort and Spa" },
  { slug: "zorlu-grand-trabzon", bookingId: "zorlu-grand-hotel", taQuery: "Zorlu Grand Hotel Trabzon" },
  { slug: "novotel-trabzon", bookingId: "novotel-trabzon", taQuery: "Novotel Trabzon" },
  { slug: "radisson-blu-trabzon", bookingId: "radisson-blu-hotel-trabzon", taQuery: "Radisson Blu Hotel Trabzon" },
  { slug: "swissotel-uludag-bursa", bookingId: "swissotel-resort-uludag-bursa", taQuery: "Swissotel Resort Uludag Bursa" },
  { slug: "kervansaray-bursa", bookingId: "kervansaray-bursa", taQuery: "Kervansaray Bursa" },
  { slug: "holiday-inn-bursa", bookingId: "holiday-inn-bursa-city-centre", taQuery: "Holiday Inn Bursa City Centre" },
  { slug: "richmond-nua-wellness-spa", bookingId: "richmond-nua-wellness-spa", taQuery: "Richmond Nua Wellness Spa Sapanca", oldSlug: "sapanca-lake-houses" },
  { slug: "ng-sapanca-wellness", bookingId: "ng-sapanca-wellness-convention", taQuery: "NG Sapanca Wellness Convention" },
  { slug: "ng-sapanca-enjoy", bookingId: "ng-sapanca-enjoy", taQuery: "NG Enjoy Sapanca", oldSlug: "sapanca-glamping-suites" },
  { slug: "ayder-paradise-otel", bookingId: "ayder-paradise-otel", taQuery: "Ayder Paradise Otel", oldSlug: "ayder-plateau-resort" },
  { slug: "yesilvadi", bookingId: "yesilvadi", taQuery: "Yesilvadi Otel Ayder", oldSlug: "rize-tea-garden-hotel" },
];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function dismissCookies(page) {
  try {
    const accept = page.locator("#onetrust-accept-btn-handler");
    if (await accept.isVisible({ timeout: 2500 })) await accept.click();
  } catch {
    /* */
  }
}

async function extractReviewsPage(page) {
  return page.evaluate(() => {
    const text = document.body?.innerText || "";
    const html = document.documentElement?.innerHTML || "";

    const blocked =
      /JavaScript is disabled|verify that you're not a robot|Access Denied/i.test(text) &&
      text.length < 3000;

    // Score: "9.4" near "Review score" or Guests' Choice
    let score = null;
    const scoreM =
      text.match(/Review score[\s\S]{0,80}?Based on[\s\S]{0,40}?([\d,]+)\s*hotel reviews?\s*([\d.]+)/i) ||
      text.match(/Based on\s+([\d,]+)\s+hotel reviews?\s*([\d.]+)/i) ||
      text.match(/([\d.]+)\s*(?:Superb|Wonderful|Excellent|Fabulous|Exceptional|Very good)/i);
    let reviewCount = null;
    if (scoreM) {
      if (scoreM[2] && parseFloat(scoreM[2]) <= 10) {
        reviewCount = parseInt(scoreM[1].replace(/,/g, ""), 10);
        score = parseFloat(scoreM[2]);
      } else {
        score = parseFloat(scoreM[1]);
      }
    }
    if (!reviewCount) {
      const rc = text.match(/Based on\s+([\d,]+)\s+hotel reviews?/i) ||
        text.match(/([\d,]+)\s+Verified Hotel Reviews/i);
      if (rc) reviewCount = parseInt(rc[1].replace(/,/g, ""), 10);
    }

    // Address from breadcrumb area: often "Street, Area, ZIP City, Turkey"
    let address = "";
    const addrM = text.match(
      /([A-Za-zÀ-ÿİıŞşĞğÜüÖöÇç0-9 .,'\/\-]+,\s*[A-Za-zÀ-ÿİıŞşĞğÜüÖöÇç .]+,\s*\d{5}\s+[A-Za-zÀ-ÿİıŞşĞğÜüÖöÇç ]+,?\s*Turkey)/i
    );
    if (addrM) address = addrM[1].replace(/\s+/g, " ").trim();

    let name = "";
    const h1 = document.querySelector("h1");
    if (h1) {
      name = h1.textContent?.replace(/^Reviews of/i, "").trim() || "";
    }
    if (!name) {
      const nm = text.match(/Reviews of\s+([^\n*]+)/);
      if (nm) name = nm[1].replace(/\*5 stars.*/i, "").trim();
    }

    // Parse review blocks from text
    const reviews = [];
    const parts = text.split(/\*?\s*Reviewed:\s+/i).slice(1);
    for (const part of parts.slice(0, 12)) {
      const lines = part.split("\n").map((l) => l.trim()).filter(Boolean);
      if (lines.length < 3) continue;
      const date = lines[0];
      const author = lines[1] || "Guest";
      // Find country: usually after author and before review count / score
      let country = "";
      let rating = null;
      let title = "";
      let stayType = "";
      let roomType = "";
      let body = "";

      for (let i = 2; i < Math.min(lines.length, 25); i++) {
        const l = lines[i];
        if (/^\d+(\.\d+)?$/.test(l) && parseFloat(l) <= 10) {
          rating = parseFloat(l);
          continue;
        }
        if (/^\d+\s*reviews?$/i.test(l) || /^\d+\s*helpful/i.test(l)) continue;
        if (/^&ldquo;|^“|^"/.test(l) || (l.length > 5 && l.length < 180 && !title && !/^•/.test(l) && !/^(Leisure|Business|Stayed)/i.test(l))) {
          if (!title && !/^(Exceptional|Superb|Wonderful|Excellent|Fabulous|Very good|Good|Pleasant|Okay|Poor)$/i.test(l)) {
            // could be country if short and no rating yet
          }
        }
        if (
          !country &&
          l.length > 2 &&
          l.length < 40 &&
          !/^\d/.test(l) &&
          !/trip|stayed|submitted|helpful|reviews?/i.test(l) &&
          !/^•/.test(l) &&
          rating == null
        ) {
          // country often before score
          country = l;
          continue;
        }
        if (!country && rating != null && l.length > 2 && l.length < 40 && !/^\d/.test(l) && !/^•/.test(l) && !/trip|stayed|submitted|room|suite|villa/i.test(l) && !title) {
          // sometimes country after score - skip
        }
        if (/^•\s*Leisure|^•\s*Business/i.test(l)) continue;
        if (/^•\s*(Couple|Solo|Family|Group|People with friends|Business travellers)/i.test(l)) {
          stayType = l.replace(/^•\s*/, "");
          continue;
        }
        if (/^•\s*.*(Room|Suite|Villa|Chalet|Cabin|King|Twin|Deluxe)/i.test(l)) {
          roomType = l.replace(/^•\s*/, "");
          continue;
        }
        if (/^•\s*Stayed|^•\s*Submitted/i.test(l)) continue;
        if (/^Stayed in /i.test(l)) continue;
        // Title candidates
        if (!title && rating != null && l.length > 2 && l.length < 200 && !/^•/.test(l)) {
          title = l.replace(/^["“”„]|["“”„]$/g, "").replace(/^&ldquo;|&rdquo;$/g, "").trim();
          continue;
        }
        if (title && !/^•/.test(l) && !/^Stayed/i.test(l) && l.length > 20) {
          body += (body ? " " : "") + l;
        }
      }

      // Fallback parse with regex on part
      if (!rating) {
        const rm = part.match(/\n(10|\d\.\d)\n/);
        if (rm) rating = parseFloat(rm[1]);
      }
      if (!country) {
        const cm = part.match(/\n([A-Za-z ]{3,30})\n\d+\s*reviews?/i);
        if (cm) country = cm[1].trim();
      }
      if (!stayType) {
        const sm = part.match(/•\s*((?:Couple|Solo traveller|Family with young children|Family with older children|Group of friends|People with friends|Business travellers)[^\n]*)/i);
        if (sm) stayType = sm[1].trim();
      }
      if (!roomType) {
        const rm2 = part.match(/•\s*((?:[^•\n]*(?:Room|Suite|Villa|Chalet|Cabin|King|Twin)[^•\n]*))/i);
        if (rm2) roomType = rm2[1].trim();
      }
      if (!title) {
        const tm = part.match(/(?:10|\d\.\d)\s*\n\s*[""]?([^\n]{5,160})/);
        if (tm) title = tm[1].replace(/[""]/g, "").trim();
      }
      if (!body) {
        const chunks = part.split("\n").filter((l) => l.length > 40 && !/^•/.test(l) && !/Reviewed|Submitted|Stayed in/i.test(l));
        body = chunks.slice(0, 2).join(" ").slice(0, 600);
      }

      if (rating != null || body.length > 30) {
        reviews.push({
          author: author.slice(0, 60),
          country: country || "",
          rating: rating ?? 9,
          date,
          title: title.slice(0, 180),
          text: body.slice(0, 700),
          stayType,
          roomType,
          source: "Booking.com",
        });
      }
    }

    // Room types from reviews
    const roomTypes = [
      ...new Set(
        reviews
          .map((r) => r.roomType)
          .filter((r) => r && r.length > 3 && r.length < 80)
      ),
    ].slice(0, 12);

    return {
      blocked,
      name,
      address,
      score,
      reviewCount,
      reviews: reviews.slice(0, 8),
      roomTypes,
      textLen: text.length,
      textSample: text.slice(0, 6000),
      hasBstatic: html.includes("bstatic.com"),
    };
  });
}

async function extractHotelPage(page) {
  return page.evaluate(() => {
    const text = document.body?.innerText || "";
    const blocked =
      (/JavaScript is disabled|verify that you're not a robot|Find your next stay/i.test(text) &&
        !/Guest reviews|Most popular facilities|What's nearby/i.test(text)) ||
      text.length < 4000;

    let description = "";
    const descEl =
      document.querySelector('[data-testid="property-description"]') ||
      document.querySelector("#property_description_content") ||
      document.querySelector(".hp-description");
    if (descEl) description = descEl.textContent?.replace(/\s+/g, " ").trim() || "";
    if (!description) {
      const m = text.match(
        /(?:About this property|Description|Get the celebrity treatment[^]*?\n)([\s\S]{100,3500}?)(?:\n(?:Facilities|Most popular|Guest reviews|Surroundings|House rules|Fine print))/i
      );
      if (m) description = m[1].replace(/\s+/g, " ").trim();
    }

    const facilities = [];
    const facM = text.match(
      /Most popular facilities\n([\s\S]{20,2000}?)(?:\n(?:Great|Facilities of|Guest reviews|Property highlights|Bathroom))/i
    );
    if (facM) {
      facilities.push(
        ...facM[1]
          .split(/\n/)
          .map((s) => s.trim())
          .filter((s) => s.length > 2 && s.length < 55 && !/show more|see all/i.test(s))
      );
    }

    const nearby = [];
    const nearM = text.match(
      /(?:What's nearby|Surroundings)\n([\s\S]{20,2500}?)(?:\n(?:Restaurants|Closest beaches|Public transit|Guest reviews|FAQ|House rules|Facilities))/i
    );
    if (nearM) {
      nearby.push(
        ...nearM[1]
          .split(/\n/)
          .map((s) => s.trim())
          .filter((s) => /\d/.test(s) && s.length < 90)
          .slice(0, 15)
      );
    }

    const policies = [];
    const polM = text.match(
      /House rules[\s\S]{0,40}\n([\s\S]{50,2000}?)(?:\n(?:Fine print|The fine print|FAQ|Child policies))/i
    );
    if (polM) {
      policies.push(
        ...polM[1]
          .split(/\n/)
          .map((s) => s.trim())
          .filter((s) => s.length > 5 && s.length < 120)
          .slice(0, 12)
      );
    }

    // Room names from availability table
    const roomNames = [];
    document.querySelectorAll('[data-testid="room-name"], .hprt-roomtype-link, .hprt-roomtype-icon-link').forEach((el) => {
      const t = el.textContent?.trim();
      if (t && t.length < 80) roomNames.push(t);
    });

    return {
      blocked,
      description: description.slice(0, 4500),
      facilities: [...new Set(facilities)].slice(0, 30),
      nearby: [...new Set(nearby)].slice(0, 15),
      policies: [...new Set(policies)].slice(0, 12),
      roomNames: [...new Set(roomNames)].slice(0, 15),
      textLen: text.length,
      textSample: text.slice(0, 5000),
    };
  });
}

async function scrapeTripadvisor(page, query) {
  const searchUrl = `https://www.tripadvisor.com/Search?q=${encodeURIComponent(query + " hotel Turkey")}`;
  try {
    await page.goto(searchUrl, { waitUntil: "domcontentloaded", timeout: 60000 });
    await sleep(3000);
    const link = await page.evaluate(() => {
      const a = Array.from(document.querySelectorAll("a[href*='Hotel_Review']")).find((el) =>
        /Hotel_Review-/.test(el.href)
      );
      return a?.href || null;
    });
    if (!link) return { reviews: [], description: "", amenities: [], rating: null, reviewCount: null, url: null };

    await page.goto(link, { waitUntil: "domcontentloaded", timeout: 60000 });
    await sleep(3500);

    return page.evaluate(() => {
      const text = document.body?.innerText || "";
      let description = "";
      const about = text.match(/About\n([\s\S]{80,1200}?)(?:\n(?:Property amenities|Room features|Languages|Good to know))/i);
      if (about) description = about[1].replace(/\s+/g, " ").trim();

      const amenities = [];
      const am = text.match(/Property amenities\n([\s\S]{20,1500}?)(?:\n(?:Room features|Room types|Good to know|Languages Spoken))/i);
      if (am) {
        amenities.push(
          ...am[1]
            .split(/\n/)
            .map((s) => s.trim())
            .filter((s) => s.length > 2 && s.length < 50)
            .slice(0, 25)
        );
      }

      const ratingM = text.match(/(\d\.\d)\s*of\s*5\s*bubbles/i);
      const countM = text.match(/\((\d[\d,]*)\s*reviews?\)/i);

      const reviews = [];
      // Common TA review patterns
      const blocks = text.split(/\n(?=\w[\w .'-]{1,40}\n(?:wrote a review|[\w ]+\n\d))/i).slice(0, 1);
      const reviewChunks = Array.from(document.querySelectorAll('[data-test-target="HR_CC_CARD"], .review-container'));
      if (reviewChunks.length) {
        for (const c of reviewChunks.slice(0, 6)) {
          const t = (c.textContent || "").replace(/\s+/g, " ").trim();
          const author =
            c.querySelector("a.ui_header_link, [class*='infoText'] span")?.textContent?.trim() ||
            t.slice(0, 30);
          reviews.push({
            author,
            text: t.slice(0, 500),
            source: "Tripadvisor",
            rating: null,
            title: "",
            country: "",
            date: "",
            stayType: "",
          });
        }
      } else {
        // Text fallback: sentences with stay keywords
        const paras = text
          .split(/\n/)
          .map((l) => l.trim())
          .filter((l) => l.length > 90 && l.length < 500 && /room|staff|hotel|stay|view|pool|breakfast|location/i.test(l))
          .slice(0, 6);
        for (let i = 0; i < paras.length; i++) {
          reviews.push({
            author: `Traveler ${i + 1}`,
            text: paras[i],
            source: "Tripadvisor",
            rating: null,
            title: "",
            country: "",
            date: "",
            stayType: "",
          });
        }
      }

      return {
        reviews,
        description,
        amenities: [...new Set(amenities)].slice(0, 25),
        rating: ratingM ? parseFloat(ratingM[1]) : null,
        reviewCount: countM ? parseInt(countM[1].replace(/,/g, ""), 10) : null,
        url: location.href,
        textSample: text.slice(0, 4000),
      };
    });
  } catch (e) {
    return { reviews: [], description: "", amenities: [], rating: null, reviewCount: null, error: e.message };
  }
}

async function main() {
  const only = process.argv.slice(2);
  const list = only.length ? HOTELS.filter((h) => only.includes(h.slug) || only.includes(h.bookingId)) : HOTELS;

  const browser = await chromium.launch({
    headless: true,
    args: ["--disable-blink-features=AutomationControlled", "--no-sandbox"],
  });
  const context = await browser.newContext({
    locale: "en-GB",
    timezoneId: "Europe/Istanbul",
    userAgent:
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
    viewport: { width: 1440, height: 960 },
    extraHTTPHeaders: {
      "Accept-Language": "en-GB,en;q=0.9",
    },
  });
  await context.addInitScript(() => {
    Object.defineProperty(navigator, "webdriver", { get: () => undefined });
  });
  const page = await context.newPage();

  await page.goto("https://www.booking.com/", { waitUntil: "domcontentloaded", timeout: 90000 });
  await sleep(2500);
  await dismissCookies(page);

  const results = fs.existsSync(RAW_OUT) ? JSON.parse(fs.readFileSync(RAW_OUT, "utf8")) : {};

  for (const hotel of list) {
    const existing = results[hotel.slug];
    if (existing?.ok && existing.reviews?.length >= 3 && (existing.description?.length > 80 || existing.taDescription?.length > 80)) {
      console.log("skip", hotel.slug);
      continue;
    }

    console.log("\n→", hotel.slug);
    const reviewsUrl = `https://www.booking.com/reviews/tr/hotel/${hotel.bookingId}.en-gb.html`;
    const hotelUrl = `https://www.booking.com/hotel/tr/${hotel.bookingId}.en-gb.html`;
    const entry = {
      ...hotel,
      bookingUrl: hotelUrl,
      reviewsUrl,
      scrapedAt: new Date().toISOString(),
    };

    try {
      await page.goto(reviewsUrl, { waitUntil: "domcontentloaded", timeout: 90000 });
      await sleep(4000);
      await dismissCookies(page);
      const rev = await extractReviewsPage(page);
      console.log(
        `  reviews: blocked=${rev.blocked} score=${rev.score} count=${rev.reviewCount} reviews=${rev.reviews.length} rooms=${rev.roomTypes.length} len=${rev.textLen}`
      );
      Object.assign(entry, {
        name: rev.name,
        address: rev.address,
        score: rev.score,
        reviewCount: rev.reviewCount,
        reviews: rev.reviews,
        roomTypesFromReviews: rev.roomTypes,
        reviewsBlocked: rev.blocked,
        reviewsSample: rev.textSample,
      });

      await page.goto(hotelUrl, { waitUntil: "domcontentloaded", timeout: 90000 });
      await sleep(4500);
      await dismissCookies(page);
      const hp = await extractHotelPage(page);
      console.log(
        `  hotel: blocked=${hp.blocked} desc=${hp.description.length} fac=${hp.facilities.length} near=${hp.nearby.length} rooms=${hp.roomNames.length}`
      );
      entry.description = hp.description;
      entry.facilities = hp.facilities;
      entry.nearby = hp.nearby;
      entry.policies = hp.policies;
      entry.roomNames = hp.roomNames;
      entry.hotelBlocked = hp.blocked;
      entry.hotelSample = hp.textSample;

      const needTa =
        entry.reviews.length < 3 ||
        !entry.description ||
        entry.description.length < 80 ||
        !entry.facilities?.length;
      if (needTa) {
        console.log("  tripadvisor fallback…");
        const ta = await scrapeTripadvisor(page, hotel.taQuery);
        entry.ta = ta;
        entry.taDescription = ta.description;
        entry.taAmenities = ta.amenities;
        if (entry.reviews.length < 3 && ta.reviews?.length) {
          entry.reviews = [...entry.reviews, ...ta.reviews].slice(0, 8);
        }
        if ((!entry.description || entry.description.length < 80) && ta.description) {
          entry.description = ta.description;
        }
        if ((!entry.facilities || !entry.facilities.length) && ta.amenities?.length) {
          entry.facilities = ta.amenities;
        }
        if (!entry.score && ta.rating) {
          entry.taRating = ta.rating;
          entry.taReviewCount = ta.reviewCount;
        }
      }

      entry.ok =
        !!entry.score &&
        entry.reviews.length >= 2 &&
        ((entry.description && entry.description.length > 60) || !!entry.taDescription);
      results[hotel.slug] = entry;
      fs.writeFileSync(RAW_OUT, JSON.stringify(results, null, 2));
      console.log("  ok=", entry.ok);
    } catch (e) {
      console.error(" FAIL", e.message);
      entry.error = e.message;
      entry.ok = false;
      results[hotel.slug] = entry;
      fs.writeFileSync(RAW_OUT, JSON.stringify(results, null, 2));
    }
    await sleep(2000);
  }

  await browser.close();
  console.log("\nWrote", RAW_OUT);
  const vals = Object.values(results);
  console.log(
    "summary: total",
    vals.length,
    "ok",
    vals.filter((v) => v.ok).length,
    "partial",
    vals.filter((v) => !v.ok && (v.score || v.reviews?.length)).length
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
