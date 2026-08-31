import {
  extractCheckTimes,
  extractStayExtrasFromRooms,
  parseFacilitiesGrouped,
  parseFacilitiesPayload,
  parseNearbyAttractionsPayload,
  parseNearbyFromDescription,
  parsePoliciesPayload,
  parseReviewsPayload,
} from "../../src/lib/server/hotel-rooms-provider";
import { readFileSync } from "fs";

function assert(cond: unknown, message: string) {
  if (!cond) throw new Error(message);
}

const facilities = JSON.parse(readFileSync("/tmp/booking-facilities.json", "utf8"));
const attractions = JSON.parse(readFileSync("/tmp/booking-attractions.json", "utf8"));
const policies = JSON.parse(readFileSync("/tmp/booking-policies.json", "utf8"));
const reviews = JSON.parse(readFileSync("/tmp/booking-reviews-test.json", "utf8"));

const facItems = parseFacilitiesPayload(facilities);
const facGroups = parseFacilitiesGrouped(facilities);
assert(facItems.length >= 20, `facilities flat expected >=20 got ${facItems.length}`);
assert(
  facItems.some((item) => /wifi|air conditioning|parking|room service/i.test(item)),
  `facilities missing real amenity titles: ${facItems.slice(0, 8).join(", ")}`
);
assert(
  !facItems.includes("General") && !facItems.includes("Some Rooms"),
  `facilities still treating category names as items: ${facItems.slice(0, 8).join(", ")}`
);
assert(facGroups.length >= 5, `facility groups expected >=5 got ${facGroups.length}`);
assert(
  facGroups.some((g) => g.items.length >= 3),
  "facility groups should contain multiple items"
);

const nearby = parseNearbyAttractionsPayload(attractions);
assert(nearby.length >= 8, `nearby expected >=8 got ${nearby.length}`);
assert(
  nearby.some((p) => /juhu|iskcon|mumbai/i.test(p.name)),
  `nearby names missing tag field: ${nearby.map((p) => p.name).slice(0, 5).join(", ")}`
);
assert(
  nearby.some((p) => /km|m/.test(p.distance)),
  `nearby distances missing: ${nearby.slice(0, 3).map((p) => p.distance).join(", ")}`
);

const policyLines = parsePoliciesPayload(policies);
assert(Array.isArray(policyLines), "policies parser should return an array");

const reviewRows = parseReviewsPayload(reviews);
assert(reviewRows.length >= 20, `reviews expected >=20 got ${reviewRows.length}`);
assert(reviewRows[0].author.length > 1, "review author missing");
assert(reviewRows[0].text.length > 5, "review body missing");
assert(reviewRows[0].rating >= 8, `review score should be 10-scale, got ${reviewRows[0].rating}`);

const times = extractCheckTimes({
  data: {
    property: {
      checkin: { fromTime: "14:00", untilTime: "00:00" },
      checkout: { fromTime: "00:00", untilTime: "12:00" },
    },
  },
});
assert(times.checkIn === "14:00", `check-in expected 14:00 got ${times.checkIn}`);
assert(times.checkOut === "12:00", `check-out expected 12:00 got ${times.checkOut}`);

const desc = readFileSync(
  "/www/wwwroot/lonaliza.com/.data/booking-cache/description-13273927-ar.json",
  "utf8"
);
const descJson = JSON.parse(desc);
const descText =
  typeof descJson?.value?.value === "string"
    ? descJson.value.value
    : typeof descJson?.value === "string"
      ? descJson.value
      : "";
const fromDesc = parseNearbyFromDescription(descText);
assert(fromDesc.length >= 4, `description nearby expected >=4 got ${fromDesc.length}`);
assert(
  fromDesc.some((p) => /مطار|Nef|استقلال|سفير/i.test(p.name)),
  `description nearby missing landmarks: ${fromDesc.map((p) => p.name).join(", ")}`
);
assert(
  !fromDesc.some((p) => /Holiday Inn|و35 كم|المصنف/i.test(p.name)),
  `description nearby still merged junk: ${fromDesc.map((p) => p.name).join(" | ")}`
);

const roomsRaw = JSON.parse(
  readFileSync(
    "/www/wwwroot/lonaliza.com/.data/booking-cache/rooms-13273927-2026-08-31-2026-09-03-2-1-ar.json",
    "utf8"
  )
);
const roomsPayload = roomsRaw?.value ?? roomsRaw;
const stayExtras = extractStayExtrasFromRooms(roomsPayload);
assert(stayExtras.policies.length >= 1, `rooms policies expected >=1 got ${stayExtras.policies.length}`);
assert(
  stayExtras.policies.some((line) => /إلغاء|cancel/i.test(line)),
  `rooms policies missing cancellation text: ${stayExtras.policies.slice(0, 2).join(" | ")}`
);
assert(stayExtras.payment.length >= 1, `rooms payment expected >=1 got ${stayExtras.payment.length}`);

console.log(
  JSON.stringify(
    {
      ok: true,
      facilities: facItems.length,
      facilityGroups: facGroups.length,
      nearby: nearby.length,
      nearbySample: nearby.slice(0, 3),
      nearbyFromDescription: fromDesc.length,
      checkTimes: times,
      roomsPolicies: stayExtras.policies.length,
      roomsPayment: stayExtras.payment.length,
      policies: policyLines,
      reviews: reviewRows.length,
      reviewSample: { author: reviewRows[0].author, rating: reviewRows[0].rating, title: reviewRows[0].title },
    },
    null,
    2
  )
);
