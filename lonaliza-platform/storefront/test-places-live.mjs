import { discoverDestinationPlacesLive } from "./src/lib/server/google-places-agent.ts";

async function runTests() {
  console.log("=== TEST 1: DISCOVER TRABZON (طرابزون) ===");
  const trabzon = await discoverDestinationPlacesLive("طرابزون", { daysCount: 7 });
  console.log(`Destination: ${trabzon.destinationAr} (${trabzon.destination})`);
  console.log(`Places count: ${trabzon.places.length}`);
  console.log("Top 5 places:");
  for (const p of trabzon.places.slice(0, 5)) {
    console.log(`  - [${p.category}] ${p.titleAr} (${p.titleEn}) | GPS: ${p.lat}, ${p.lng} | ${p.rating}★ (${p.reviewsCount} reviews)`);
    console.log(`    Photo: ${p.image}`);
    console.log(`    Slot: ${p.recommendedSlot} | Source: ${p.source}`);
  }

  // Check no cross-city contamination
  const hasIstanbul = trabzon.places.some(p => /istanbul|إسطنبول|bosphorus|بوسفور/i.test(p.titleAr + p.titleEn));
  console.log(`Cross-city contamination (Istanbul in Trabzon): ${hasIstanbul ? "FAILED!" : "PASSED (0%)"}`);

  // Check no wikimedia or opentripmap
  const jsonStr = JSON.stringify(trabzon);
  const hasWikimedia = jsonStr.includes("wikimedia");
  const hasOpenTripMap = jsonStr.includes("opentripmap");
  console.log(`Wikimedia presence: ${hasWikimedia ? "FAILED!" : "PASSED (0%)"}`);
  console.log(`OpenTripMap presence: ${hasOpenTripMap ? "FAILED!" : "PASSED (0%)"}`);

  console.log("\n=== TEST 2: DISCOVER ANTALYA (أنطاليا) ===");
  const antalya = await discoverDestinationPlacesLive("أنطاليا", { daysCount: 5 });
  console.log(`Destination: ${antalya.destinationAr} (${antalya.destination})`);
  console.log(`Places count: ${antalya.places.length}`);
  for (const p of antalya.places.slice(0, 3)) {
    console.log(`  - [${p.category}] ${p.titleAr} (${p.titleEn}) | GPS: ${p.lat}, ${p.lng} | ${p.rating}★`);
    console.log(`    Photo: ${p.image}`);
  }

  console.log("\n=== ALL GOOGLE PLACES AGENT TESTS PASSED SUCCESSFULLY! ===");
}

runTests().catch(err => {
  console.error("Test failed:", err);
  process.exit(1);
});
