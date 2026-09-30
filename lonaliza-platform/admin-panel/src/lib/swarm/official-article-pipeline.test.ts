import { describe, expect, it } from "vitest";
import {
  assertOfficialArticle,
  citiesFromTrendQueries,
  EDITORIAL_FRANCE_CITIES,
  findTurkeyLeak,
  isFrancePlaceQuery,
  planFranceDestinations,
  renderOfficialArticle,
  wantsSeparateArticle,
  type OfficialArticleModel,
} from "@/lib/swarm/article-pipeline-types";
import { franceHotelSupplierKey } from "@/lib/server/hotels/destinations";
import { FRANCE_TREND_QUERIES, hitsFromRelatedBody, trendsBlockReason } from "@/lib/swarm/trends-browser";

const longParis =
  "باريس تجمع بين الفن والتاريخ والحياة العصرية على ضفاف الس Seine، وتمنح المسافر من الخليج وأمريكا تجربة متنوعة من المتاحف العالمية والأحياء الساحرة والمطاعم الراقية، مع بنية تحتية سياحية ممتازة ومواصلات عامة سهلة بين المعالم الكبرى والضواحي الثقافية والأسواق المحلية التي تعكس روح فرنسا الأصيلة في كل موسم.".repeat(
    4
  );
const programParis = [
  { day: 1, titleAr: "قلب باريس", bodyAr: longParis },
  { day: 2, titleAr: "متاحف وحدائق", bodyAr: longParis },
  { day: 3, titleAr: "أحياء ونهر", bodyAr: longParis },
  { day: 4, titleAr: "تسوق وثقافة", bodyAr: longParis },
];

const model: OfficialArticleModel = {
  titleAr: "فرنسا للمسافر من الخليج وأمريكا",
  titleEn: "France",
  introAr: "وجهات أعادها بحث الاتجاهات.",
  cities: [
    {
      name: "Paris",
      nameAr: "باريس",
      iata: "CDG",
      distinctionAr: longParis,
      activities: ["اللوفر", "برج إيفل", "مونمارتر", "متحف أورsay", "شانزيليزieh", "المارais"],
      programDays: programParis,
      imageUrl: "https://images.example/paris.jpg",
      imageAlt: "Paris, France",
    },
  ],
  trends: [{ query: "paris vacation", geo: "US", interest: "100" }],
  flights: [
    {
      origin: "Riyadh (RUH)",
      destination: "Paris (CDG)",
      airline: "SV",
      flightNumber: "SV123",
      aircraft: "A320",
      departure: "2026-11-01T10:00",
      arrival: "2026-11-01T15:00",
      duration: "360 min",
      stops: "0",
      price: "540",
      currency: "USD",
      baggage: "1pc",
    },
  ],
  flightItineraries: [
    {
      cityIata: "CDG",
      cityName: "Paris",
      originCode: "RUH",
      itinerary: {
        id: "test_paris",
        legs: [
          {
            id: "leg0",
            origin: { displayCode: "RUH", city: "Riyadh", name: "Riyadh" },
            destination: { displayCode: "CDG", city: "Paris", name: "Paris" },
            departure: "2026-11-01T10:00",
            arrival: "2026-11-01T15:00",
            durationMinutes: 360,
            stopCount: 0,
            segments: [
              {
                id: "seg0",
                flightNumber: "SV123",
                departure: "2026-11-01T10:00",
                arrival: "2026-11-01T15:00",
                durationInMinutes: 360,
                origin: { displayCode: "RUH", name: "Riyadh", city: "Riyadh", country: "SA" },
                destination: { displayCode: "CDG", name: "Paris", city: "Paris", country: "FR" },
                marketingCarrier: { id: "SV", name: "Saudia", code: "SV", logoUrl: "" },
              },
            ],
            carriers: [{ id: "SV", name: "Saudia", code: "SV", logoUrl: "" }],
          },
        ],
        price: { client: 540, currency: "USD" },
        stops: 0,
        durationMinutes: 360,
        airlines: ["SV"],
        badges: [],
        fareFamilies: [{ id: "f0", name: "Economy", price: 540, currency: "USD", cabinClass: "economy" }],
      },
    },
  ],
  hotels: [
    {
      city: "Paris",
      name: "Hotel Example",
      image: "https://images.example/hotel.jpg",
      rating: "8.6",
      roomType: "Double",
      bedType: "Queen",
      price: "210",
      currency: "USD",
    },
  ],
  ground: [{ city: "Paris", mode: "transfer", title: "Sedan", price: "80", currency: "USD", supplier: "Seeru" }],
  faq: [{ q: "من أين البيانات؟", a: "من الموزع." }],
};

describe("official article rules", () => {
  it("chooses French cities only from trend query text", () => {
    const cities = citiesFromTrendQueries(["paris vacation", "french riviera hotels", "belgium vs france"]);
    expect(cities.map((city) => city.name)).toEqual(["Paris", "Nice"]);
  });

  it("does not treat a football title as a destination", () => {
    expect(citiesFromTrendQueries(["belgium vs france"])).toEqual([]);
  });

  it("rejects Turkey wording", () => {
    expect(findTurkeyLeak("guide-turkey-2027 Trabzon")).toBeTruthy();
  });

  it("renders sliders and keeps the same revision rule", () => {
    const html = renderOfficialArticle(model);
    expect(html).toContain('data-flight-slider="true"');
    expect(html).toContain('data-hotel-slider="true"');
    expect(html).not.toContain("display:grid");
    expect(assertOfficialArticle(html, model)).toBeNull();
    expect(wantsSeparateArticle("عدّل الصور")).toBe(false);
    expect(wantsSeparateArticle("اكتب مقالاً منفصلاً")).toBe(true);
  });

  it("keeps a failed browser crawl off the Trends stage and uses the editorial France list", () => {
    const plan = planFranceDestinations({
      hits: [],
      crawlError: "geo=US q=France travel: HTTP 429 https://trends.google.com/trends/explore?q=France%20travel&geo=US",
    });
    expect(plan.trendsStatus).toBe("failed");
    expect(plan.source).toBe("editorial-fallback");
    expect(plan.trends).toEqual([]);
    expect(plan.cities.map((city) => city.name)).toEqual(["Paris", "Nice", "Lyon"]);
    expect(plan.cities.map((city) => city.name).join(" ")).not.toMatch(/Turkey|Trabzon|Istanbul/);
    expect(plan.error).toContain("HTTP 429");
    expect(EDITORIAL_FRANCE_CITIES).toHaveLength(3);
  });

  it("completes Trends only when the browser payload has real rows", () => {
    const raw = `)]}'\n{"default":{"rankedList":[{"rankedKeyword":[{"query":"paris france","formattedValue":"100"},{"query":"nice france","formattedValue":"20"}]},{"rankedKeyword":[{"query":"flights to france","formattedValue":"Breakout"}]}]}}`;
    const hits = hitsFromRelatedBody(raw, "US");
    expect(hits.map((hit) => hit.query)).toEqual(["paris france", "nice france", "flights to france"]);
    const plan = planFranceDestinations({ hits, crawlError: null });
    expect(plan.trendsStatus).toBe("completed");
    expect(plan.source).toBe("trends");
    expect(plan.cities.map((city) => city.name)).toEqual(["Paris", "Nice"]);
    expect(plan.error).toBeUndefined();
    const html = renderOfficialArticle({ ...model, destinationSource: "editorial-fallback", trends: [] });
    expect(html).not.toContain("editorial-fallback");
    expect(html).not.toContain("editorial");
    expect(html).not.toContain("Google Trends");
    expect(assertOfficialArticle(html, model)).toBeNull();
  });

  it("keeps only a city or region inside France and stays silent in the article", () => {
    expect(isFrancePlaceQuery("italy vacation")).toBe(false);
    expect(isFrancePlaceQuery("lidl")).toBe(false);
    expect(isFrancePlaceQuery("wikipedia")).toBe(false);
    expect(isFrancePlaceQuery("france news")).toBe(false);
    expect(isFrancePlaceQuery("paris france")).toBe(true);
    const plan = planFranceDestinations({
      hits: [
        { query: "italy", geo: "US" },
        { query: "lidl", geo: "US" },
        { query: "wikipedia", geo: "US" },
        { query: "breaking news", geo: "US" },
      ],
      crawlError: null,
    });
    expect(plan.source).toBe("editorial-fallback");
    expect(plan.trends).toEqual([]);
    expect(plan.cities.map((city) => city.name)).toEqual(["Paris", "Nice", "Lyon"]);
    const html = renderOfficialArticle({
      ...model,
      introAr: "Google Trends editorial-fallback Seeru stayed in the engine",
      destinationSource: plan.source,
      trends: plan.trends,
      hotelNote: "hotelbeds:no Hotelbeds destination code",
      groundNote: "SeeruRideAdapter.searchLocations returned no places for Paris",
    });
    expect(html).not.toContain("Google Trends");
    expect(html).not.toContain("editorial");
    expect(html).not.toContain("Seeru");
    expect(html).not.toContain("hotelbeds");
    expect(html).toContain('data-landmark-gallery="Paris"');
  });

  it("walks France and Paris queries for US and SA, including Gulf Arabic wording", () => {
    expect(FRANCE_TREND_QUERIES.map((row) => `${row.geo}:${row.q}`)).toEqual([
      "US:France travel",
      "US:Paris travel",
      "SA:France travel",
      "SA:Paris travel",
      "SA:سفر فرنسا",
      "SA:سياحة باريس",
    ]);
    expect(trendsBlockReason({ navStatus: 429, title: "Error 429", url: "https://trends.google.com/trends/explore", body: "too many requests" })).toContain("HTTP 429");
    expect(trendsBlockReason({ navStatus: 200, title: "Before you continue", url: "https://consent.google.com/m", body: "Before you continue" })).toContain("consent wall");
  });

  it("uses the Hotelbeds city codes and shows a supplier error instead of a fake hotel", () => {
    expect(franceHotelSupplierKey("Paris, France PAR")).toEqual({ nameEn: "Paris", iata: "PAR" });
    expect(franceHotelSupplierKey("Nice, France NCE")).toEqual({ nameEn: "Nice", iata: "NCE" });
    expect(franceHotelSupplierKey("Lyon, France LYS")).toEqual({ nameEn: "Lyon", iata: "LYS" });
    expect(franceHotelSupplierKey("Paris, Texas")).toBeNull();
    const html = renderOfficialArticle({
      ...model,
      hotels: [],
      ground: [],
      hotelNote: "hotelbeds:no Hotelbeds destination code",
      groundNote: "SeeruRideAdapter.searchLocations returned no places for Paris",
    });
    expect(html).not.toContain("hotelbeds:no Hotelbeds destination code");
    expect(html).not.toContain("SeeruRideAdapter.searchLocations returned no places for Paris");
    expect(html).not.toContain("Seeru");
    expect(html).toContain('data-hotel-slider="true"');
    expect(html).toContain('data-flight-slider="true"');
    expect(html).not.toContain("Hotel Example");
  });
});
