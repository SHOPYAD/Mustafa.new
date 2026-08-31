/**
 * Local partner marks in /public/partners — downloaded files, never hotlinked.
 * More specific names (ZenHotels) must be tested before Hotels.com.
 */
const PARTNER_MARKS: Array<{ test: RegExp; src: string }> = [
  { test: /booking\.com|bookingcom|^booking$/i, src: "/partners/booking.svg" },
  { test: /agoda/i, src: "/partners/agoda.svg" },
  { test: /expedia/i, src: "/partners/expedia.svg" },
  { test: /zenhotels|zen.?hotels/i, src: "/partners/zenhotels.png" },
  { test: /hotelscombined|hotels.?combined/i, src: "/partners/hotelscombined.png" },
  { test: /hotels\.com/i, src: "/partners/hotelscom.svg" },
  { test: /trip\.com|tripcom|ctrip/i, src: "/partners/tripcom.svg" },
  { test: /priceline/i, src: "/partners/priceline.svg" },
  { test: /hopper/i, src: "/partners/hopper.png" },
  { test: /vio\.com|viocom/i, src: "/partners/vio.png" },
  { test: /prestigia/i, src: "/partners/prestigia.png" },
  { test: /stayforlong|stay.?for.?long/i, src: "/partners/stayforlong.png" },
  { test: /tripadvisor|trip advisor/i, src: "/partners/tripadvisor.svg" },
  { test: /kayak/i, src: "/partners/kayak.svg" },
];

export const ALRAYYAN_LOGO_SRC = "/logo.png";

export function partnerLogoSrc(partnerName: string, fallbackUrl = ""): string {
  const name = partnerName.trim();
  if (!name) return fallbackUrl;
  if (/الريان|alrayyan|al-?rayyan/i.test(name)) return ALRAYYAN_LOGO_SRC;
  const hit = PARTNER_MARKS.find((row) => row.test.test(name));
  if (hit) return hit.src;
  if (fallbackUrl && fallbackUrl.startsWith("/partners/")) return fallbackUrl;
  return "";
}
