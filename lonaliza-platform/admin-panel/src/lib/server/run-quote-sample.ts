import { buildLiveQuote } from "@/lib/server/ai-quote";

async function main() {
  const q = await buildLiveQuote(
    {
      destination: "Antalya",
      arrivalDate: "2026-06-01",
      departureDate: "2026-06-07",
      people: 2,
      fromIata: "DXB",
    },
    15
  );
  if (!q) throw new Error("no quote");
  const summary = {
    types: Object.fromEntries(
      (["flight", "hotel", "transfer", "car"] as const).map((t) => [
        t,
        q.cards
          .filter((c) => c.type === t)
          .map((c) => ({
            title: c.titleEn || c.titleAr,
            price: c.clientPrice,
            pending: c.pricePending,
            href: c.href,
            source: c.source,
          })),
      ])
    ),
    total: q.totalClientPrice,
    pending: q.pendingTypes,
    warnings: q.warnings,
  };
  console.log(JSON.stringify(summary, null, 2));
  if (!q.cards.some((c) => c.type === "transfer" && c.clientPrice > 0 && c.href?.startsWith("/transfers"))) {
    process.exit(3);
  }
  if (!q.cards.some((c) => c.type === "car" && c.clientPrice > 0 && (c.href || "").includes("/cars"))) {
    process.exit(4);
  }
  if (!q.cards.some((c) => c.type === "flight" && c.href?.startsWith("/flights"))) {
    process.exit(5);
  }
  if (!q.cards.some((c) => c.type === "hotel" && (c.href || "").includes("/hotels"))) {
    process.exit(6);
  }
  console.log("QUOTE_OK");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
