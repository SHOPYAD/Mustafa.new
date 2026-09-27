/**
 * Parse Booking.com hotel page dumps from agent-tools into structured fields.
 * Usage: node scripts/parse-booking-dumps.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TOOLS =
  process.env.AGENT_TOOLS ||
  "C:/Users/Alrayyan Sales 1/.cursor/projects/c-Users-Alrayyan-Sales-1-Desktop-alrayyan-yeni-web-setesi/agent-tools";
const OUT = path.join(__dirname, "../../src/data/scraping/hotels/parsed.json");

const HOTELS = [
  { slug: "ciragan-palace-kempinski-istanbul", bookingId: "ciragan-palace-kempinski-istanbul", match: /[Cc][ıiI]ra[gğ]an|ciragan-palace/i },
  { slug: "raffles-istanbul", bookingId: "raffles-istanbul", match: /Raffles Istanbul/i },
  { slug: "four-seasons-bosphorus", bookingId: "four-seasons-istanbul-at-the-bosphorus", match: /Four Seasons Hotel Istanbul at the Bosphorus/i },
  { slug: "shangri-la-bosphorus", bookingId: "shangri-la-bosphorus-istanbul", match: /Shangri-La Bosphorus/i },
  { slug: "peninsula-istanbul", bookingId: "the-peninsula-istanbul", match: /The Peninsula Istanbul|Peninsula Istanbul(?!,)/i },
  { slug: "swissotel-the-bosphorus", bookingId: "swissotel-the-bosphorus", match: /Swissôtel The Bosphorus|Swissotel The Bosphorus/i },
  { slug: "cvk-park-bosphorus", bookingId: "cvk-park-bosphorus-hotel-istanbul", match: /CVK Park Bosphorus/i },
  { slug: "pera-palace-hotel", bookingId: "pera-palace-hotel", match: /Pera Palace/i },
  { slug: "ritz-carlton-istanbul", bookingId: "the-ritz-carlton-istanbul", match: /Ritz-Carlton Istanbul|Ritz Carlton Istanbul/i },
  { slug: "ajia-hotel-istanbul", bookingId: "a-jia-hotel", match: /Ajia Hotel|A'jia|A’jia/i },
  { slug: "rixos-premium-belek", bookingId: "rixos-premium-belek", match: /Rixos Premium Belek/i },
  { slug: "maxx-royal-kemer", bookingId: "maxx-royal-kemer-resort", match: /Maxx Royal Kemer/i },
  { slug: "akra-antalya", bookingId: "akra-hotel", match: /Akra (Hotel|Antalya)/i },
  { slug: "calista-luxury-resort", bookingId: "calista-luxury-resort", match: /Calista Luxury/i },
  { slug: "regnum-carya", bookingId: "regnum-carya-golf-spa-resort", match: /Regnum Carya/i },
  { slug: "museum-hotel-cappadocia", bookingId: "museum-hotel", match: /MUSEUM HOTEL|Museum Hotel/i },
  { slug: "argos-in-cappadocia", bookingId: "argos-in-cappadocia", match: /Argos in Cappadocia/i },
  { slug: "kayakapi-premium-caves", bookingId: "kayakapi-premium-caves", match: /Kayakap[ıi] Premium/i },
  { slug: "cappadocia-cave-resort", bookingId: "cappadocia-cave-resort-and-spa", match: /Cappadocia Cave Resort/i },
  { slug: "zorlu-grand-trabzon", bookingId: "zorlu-grand-hotel", match: /Zorlu Grand/i },
  { slug: "novotel-trabzon", bookingId: "novotel-trabzon", match: /Novotel Trabzon/i },
  { slug: "radisson-blu-trabzon", bookingId: "radisson-blu-hotel-trabzon", match: /Radisson Blu.*Trabzon/i },
  { slug: "swissotel-uludag-bursa", bookingId: "swissotel-resort-uludag-bursa", match: /Swissôtel Resort Uluda[gğ]|Swissotel Resort Uludag/i },
  { slug: "kervansaray-bursa", bookingId: "kervansaray-bursa", match: /Kervansaray Bursa/i },
  { slug: "holiday-inn-bursa", bookingId: "holiday-inn-bursa-city-centre", match: /Holiday Inn Bursa/i },
  { slug: "richmond-nua-wellness-spa", bookingId: "richmond-nua-wellness-spa", match: /Richmond Nua/i },
  { slug: "ng-sapanca-wellness", bookingId: "ng-sapanca-wellness-convention", match: /NG Sapanca Wellness/i },
  { slug: "ng-sapanca-enjoy", bookingId: "ng-sapanca-enjoy", match: /NG Enjoy/i },
  { slug: "ayder-paradise-otel", bookingId: "ayder-paradise-otel", match: /Ayder Paradise/i },
  { slug: "yesilvadi", bookingId: "yesilvadi", match: /Ye[sş]ilvadi/i },
];

function parseBookingText(text, file) {
  const isReviews = /Verified Hotel Reviews of/i.test(text.slice(0, 200));
  const isHotel =
    /Most popular facilities|Scored \d|Wonderful·|Exceptional·|Guest reviews/i.test(text) &&
    !/Find your next stay\n\nSearch low prices/i.test(text.slice(0, 800));

  let name = "";
  const nameM =
    text.match(/Reviews of\s*\[?([^\n*\]]+)/) ||
    text.match(/^([^\n,|]+),\s*(?:Istanbul|Sapanca|Belek|Antalya|Uçhisar|Trabzon|Bursa|Ayder|Kemer|Nev)/im) ||
    text.match(/#\s*([^\n]+)\n/);
  if (nameM) name = nameM[1].replace(/\(Hotel\).*/i, "").replace(/\(Resort\).*/i, "").trim();

  let score = null;
  let reviewCount = null;
  const scorePatterns = [
    /Based on\s+([\d,]+)\s+hotel reviews?\s*([\d.]+)/i,
    /Scored\s+([\d.]+)\s*\n?\s*\1?\s*\n?(?:Wonderful|Exceptional|Superb|Fabulous|Excellent|Very good)?[^\n]*\n?([\d,]+)\s*(?:real )?reviews/i,
    /Scored\s+([\d.]+)[\s\S]{0,40}?([\d,]+)\s*(?:real )?reviews/i,
    /([\d.]+)\s*\n(?:Rated exceptional\n)?(?:Exceptional|Wonderful|Superb|Fabulous)[·\s]*([\d,]+)\s*(?:real )?reviews/i,
    /\*\*Excellent\*\*location[^\n]*score from\*\*([\d,]+)\*\*reviews\)[\s\S]{0,200}?Scored\s+([\d.]+)/i,
  ];
  for (const re of scorePatterns) {
    const m = text.match(re);
    if (m) {
      const a = m[1].replace(/,/g, "");
      const b = m[2]?.replace(/,/g, "");
      if (parseFloat(a) <= 10 && b) {
        score = parseFloat(a);
        reviewCount = parseInt(b, 10);
      } else if (parseFloat(b) <= 10 && a) {
        reviewCount = parseInt(a, 10);
        score = parseFloat(b);
      }
      if (score != null) break;
    }
  }
  // Common Booking dump: "Scored 9.4\n9.4\n...\n570 reviews" or "9.4#### Score"
  if (score == null) {
    const m = text.match(/Review score\s*Based on\s+([\d,]+)\s+hotel reviews?\s*([\d.]+)/i);
    if (m) {
      reviewCount = parseInt(m[1].replace(/,/g, ""), 10);
      score = parseFloat(m[2]);
    }
  }
  if (score == null) {
    const m = text.match(/\nScored\s+([\d.]+)\s*\n\1\s*\n/);
    if (m) score = parseFloat(m[1]);
  }
  if (reviewCount == null) {
    const m =
      text.match(/Wonderful[·\s]*([\d,]+)\s*reviews/i) ||
      text.match(/Exceptional[·\s]*([\d,]+)\s*(?:real )?reviews/i) ||
      text.match(/Based on\s+([\d,]+)\s+hotel reviews/i) ||
      text.match(/([\d,]+)\s+Verified Hotel Reviews/i) ||
      text.match(/([\d,]+)\s+real reviews/i);
    if (m) reviewCount = parseInt(m[1].replace(/,/g, ""), 10);
  }

  let address = "";
  const addrM = text.match(
    /((?:[A-Za-zÀ-ÿİıŞşĞğÜüÖöÇç0-9 .,'\/\-]+,\s*){1,3}\d{5}\s+[A-Za-zÀ-ÿİıŞşĞğÜüÖöÇç ]+)/
  );
  if (addrM) address = addrM[1].replace(/\s+/g, " ").trim();

  let description = "";
  // Property description often after facilities intro or in "About"
  const descPatterns = [
    /(?:About this property|Description)\n([\s\S]{80,2500}?)(?:\n(?:Facilities|Most popular|Guest reviews|House rules|Fine print))/i,
    /Set (?:on|in|amidst|within)[\s\S]{40,2000}?(?=\n###|\nMost popular|\n\*\s*2 swimming|\nGuest reviews)/i,
    /Offering[\s\S]{40,1800}?(?=\n###|\nMost popular|\nGuest reviews)/i,
    /This \d-star[\s\S]{40,1800}?(?=\n###|\nMost popular|\nGuest reviews)/i,
    /Located[\s\S]{40,1500}?(?=\n###|\nMost popular|\nGuest reviews)/i,
  ];
  for (const re of descPatterns) {
    const m = text.match(re);
    if (m) {
      description = (m[0] || m[1]).replace(/\s+/g, " ").trim().slice(0, 3500);
      if (description.length > 80) break;
    }
  }

  const facilities = [];
  const facM = text.match(
    /Most popular facilities\n([\s\S]{10,1200}?)(?:\n(?:###|Great facilities|Bathroom|Bedroom|Cleaning|Languages|Internet|Parking|Reception|Safety|Entertainment|Food|Business|Accessibility|Outdoor|Wellness|Activities|Services|Family|Pets|Hotel surroundings|What's nearby|Guest reviews|Resort facilities))/i
  );
  if (facM) {
    facilities.push(
      ...facM[1]
        .split(/\n/)
        .map((s) => s.replace(/^\*\s*/, "").trim())
        .filter((s) => s.length > 1 && s.length < 60 && !/^show |^see /i.test(s))
    );
  }

  const nearby = [];
  const nearM = text.match(
    /(?:What's nearby|Hotel surroundings|Surroundings)\n([\s\S]{20,2000}?)(?:\n(?:Restaurants|Closest beaches|Public transit|Closest airports|Guest reviews|FAQ|House rules|Fine print|###))/i
  );
  if (nearM) {
    const lines = nearM[1].split(/\n/).map((s) => s.replace(/^\*\s*/, "").trim());
    for (let i = 0; i < lines.length; i++) {
      const l = lines[i];
      if (!l) continue;
      // "Place 1.2 km" or Place\n1.2 km
      if (/\d+(\.\d+)?\s*(km|m)\b/i.test(l) && l.length < 90) {
        nearby.push(l);
      } else if (lines[i + 1] && /^\d+(\.\d+)?\s*(km|m)\b/i.test(lines[i + 1]) && l.length < 70) {
        nearby.push(`${l} — ${lines[i + 1]}`);
        i++;
      }
    }
  }

  const policies = [];
  if (/Check-in/i.test(text)) {
    const ci = text.match(/Check-in[^\n]*?(?:from\s*)?(\d{1,2}:\d{2}\s*(?:AM|PM)?)/i);
    const co = text.match(/Check-out[^\n]*?(?:until\s*|before\s*)?(\d{1,2}:\d{2}\s*(?:AM|PM)?)/i);
    if (ci) policies.push(`Check-in from ${ci[1]}`);
    if (co) policies.push(`Check-out until ${co[1]}`);
  }
  if (/Adults only|Adult Only/i.test(text)) policies.push("Adults only");
  if (/Pets are not allowed|No pets/i.test(text)) policies.push("Pets are not allowed");
  if (/Pets are allowed/i.test(text)) policies.push("Pets are allowed on request");

  // Room type names
  const roomNames = [];
  const roomRes = [
    /((?:Deluxe|Superior|Executive|Junior|Presidential|Family|Standard|Classic|Premier|Luxury|Club|Grand|Palace|Garden|Sea|Pool|Cave|Twin|King|Double|Suite|Villa|Room|Chalet|Residence)[^\n]{0,50}(?:Room|Suite|Villa|Residence|Chalet))/gi,
  ];
  for (const re of roomRes) {
    let m;
    while ((m = re.exec(text)) && roomNames.length < 20) {
      const n = m[1].replace(/\s+/g, " ").trim();
      if (n.length > 5 && n.length < 70 && !/select|filter|search|show/i.test(n)) {
        roomNames.push(n);
      }
    }
  }

  // Guest review excerpts from reviews pages or "Guests who stayed here loved"
  const reviews = [];
  if (isReviews) {
    const parts = text.split(/\*?\s*Reviewed:\s+/i).slice(1);
    for (const part of parts.slice(0, 10)) {
      const lines = part.split("\n").map((l) => l.trim()).filter(Boolean);
      if (lines.length < 4) continue;
      const date = lines[0];
      const author = lines[1];
      let country = "";
      let rating = null;
      let title = "";
      let stayType = "";
      let roomType = "";
      let body = "";
      for (let i = 2; i < lines.length; i++) {
        const l = lines[i];
        if (/^\d+\s*reviews?$/i.test(l) || /helpful vote/i.test(l)) continue;
        if (/^\d+(\.\d+)?$/.test(l) && parseFloat(l) <= 10) {
          rating = parseFloat(l);
          continue;
        }
        if (!country && rating == null && l.length > 2 && l.length < 40 && !/^•/.test(l) && !/^\d/.test(l)) {
          country = l;
          continue;
        }
        if (/^•\s*(Couple|Solo|Family|Group|People with friends)/i.test(l)) {
          stayType = l.replace(/^•\s*/, "");
          continue;
        }
        if (/^•\s*.*(Room|Suite|Villa|King|Twin)/i.test(l)) {
          roomType = l.replace(/^•\s*/, "");
          continue;
        }
        if (/^•/.test(l) || /^Stayed in /i.test(l)) continue;
        if (!title && rating != null && l.length > 2 && l.length < 200) {
          title = l.replace(/^["“”]|["“”]$/g, "").replace(/&ldquo;|&rdquo;/g, "").trim();
          continue;
        }
        if (title && l.length > 15 && !/^Nothing$/i.test(l)) {
          body += (body ? " " : "") + l;
        } else if (title && /^Nothing$/i.test(l)) {
          // "liked" section often after Nothing (disliked)
          continue;
        }
      }
      if (!body) {
        const long = lines.filter((l) => l.length > 40 && !/^•/.test(l));
        body = long.slice(0, 2).join(" ");
      }
      if (rating != null || body.length > 25) {
        reviews.push({
          author,
          country,
          rating: rating ?? 9,
          date,
          title,
          text: body.slice(0, 700),
          stayType,
          roomType,
          source: "Booking.com",
        });
      }
    }
  }

  // Quotes from hotel page
  const quoteMs = [...text.matchAll(/[“"]([^”"]{40,400})[”"]/g)];
  for (const qm of quoteMs.slice(0, 4)) {
    if (reviews.length >= 8) break;
    reviews.push({
      author: "Verified guest",
      country: "",
      rating: score || 9,
      date: "",
      title: "",
      text: qm[1].trim(),
      stayType: "",
      roomType: "",
      source: "Booking.com",
    });
  }

  return {
    file: path.basename(file),
    isReviews,
    isHotel,
    name,
    address,
    score,
    reviewCount,
    description,
    facilities: [...new Set(facilities)].slice(0, 30),
    nearby: [...new Set(nearby)].slice(0, 15),
    policies: [...new Set(policies)].slice(0, 10),
    roomNames: [...new Set(roomNames)].slice(0, 12),
    reviews: reviews.slice(0, 8),
    textLen: text.length,
  };
}

function main() {
  if (!fs.existsSync(TOOLS)) {
    console.error("agent-tools not found", TOOLS);
    process.exit(1);
  }
  const files = fs.readdirSync(TOOLS).filter((f) => f.endsWith(".txt"));
  const bySlug = {};

  for (const f of files) {
    const full = path.join(TOOLS, f);
    const text = fs.readFileSync(full, "utf8");
    if (text.length < 5000) continue;
    if (!/booking\.com|Scored |Review score|Most popular facilities|Verified Hotel Reviews/i.test(text)) {
      // still allow tripadvisor
      if (!/tripadvisor|Hotel_Review/i.test(text.slice(0, 500))) continue;
    }
    for (const h of HOTELS) {
      if (!h.match.test(text.slice(0, 3000)) && !h.match.test(text)) continue;
      // Skip wrong peninsula
      if (h.slug === "peninsula-istanbul" && /Hotel Peninsula(?! Istanbul)/i.test(text.slice(0, 200)) && !/The Peninsula Istanbul/i.test(text.slice(0, 500))) {
        continue;
      }
      const parsed = parseBookingText(text, full);
      const prev = bySlug[h.slug];
      if (!prev) {
        bySlug[h.slug] = { ...h, sources: [f], ...parsed };
      } else {
        // merge best fields
        bySlug[h.slug] = {
          ...prev,
          sources: [...new Set([...(prev.sources || []), f])],
          score: prev.score || parsed.score,
          reviewCount: prev.reviewCount || parsed.reviewCount,
          description:
            (parsed.description?.length || 0) > (prev.description?.length || 0)
              ? parsed.description
              : prev.description,
          facilities: prev.facilities?.length ? prev.facilities : parsed.facilities,
          nearby: prev.nearby?.length ? prev.nearby : parsed.nearby,
          policies: [...new Set([...(prev.policies || []), ...(parsed.policies || [])])],
          roomNames: [...new Set([...(prev.roomNames || []), ...(parsed.roomNames || [])])].slice(0, 12),
          reviews: [...(prev.reviews || []), ...(parsed.reviews || [])]
            .filter((r, i, arr) => arr.findIndex((x) => x.text === r.text) === i)
            .slice(0, 8),
          address: prev.address || parsed.address,
          name: prev.name || parsed.name,
        };
      }
    }
  }

  fs.writeFileSync(OUT, JSON.stringify(bySlug, null, 2));
  console.log("Parsed", Object.keys(bySlug).length, "hotels →", OUT);
  for (const [slug, h] of Object.entries(bySlug)) {
    console.log(
      slug,
      "|",
      h.score,
      h.reviewCount,
      "| desc",
      h.description?.length || 0,
      "| fac",
      h.facilities?.length || 0,
      "| near",
      h.nearby?.length || 0,
      "| rooms",
      h.roomNames?.length || 0,
      "| rev",
      h.reviews?.length || 0
    );
  }
  const missing = HOTELS.filter((h) => !bySlug[h.slug]).map((h) => h.slug);
  console.log("MISSING:", missing.join(", "));
}

main();
