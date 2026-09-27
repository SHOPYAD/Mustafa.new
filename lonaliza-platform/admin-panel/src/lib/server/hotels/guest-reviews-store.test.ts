import { describe, it, expect } from "vitest";
import { getOrFetchGuestReviews } from "@/lib/server/hotels/guest-reviews-store";
import { translateText } from "@/lib/server/libretranslate";

describe("Guest Reviews & LibreTranslate Integration", () => {
  it("translates English text to Arabic via local Docker LibreTranslate", async () => {
    const text = "The room was spacious and clean with fantastic breakfast";
    const translated = await translateText(text, "ar", "en");
    expect(translated).not.toBe(text);
    // Should contain Arabic characters
    expect(/[\u0600-\u06FF]/.test(translated)).toBe(true);
  });

  it("fetches live guest reviews for a known hotel and translates them", async () => {
    // Hotel ID 14197 is a known hotel in booking-com15
    const result = await getOrFetchGuestReviews({
      bookingHotelId: "14197",
      name: "The Marmara Taksim",
      city: "Istanbul",
      lang: "ar",
    });

    expect(result).toBeDefined();
    expect(result.reviews).toBeDefined();
    console.log("Fetched reviews count:", result.reviews.length);
    if (result.reviews.length > 0) {
      console.log("Sample review text:", result.reviews[0].text.slice(0, 100));
      expect(result.reviews[0].text.length).toBeGreaterThan(0);
    }
  }, 20000);
});
