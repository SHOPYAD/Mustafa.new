import { describe, expect, it } from "vitest";
import { bankTransferWhatsAppHref } from "./whatsapp-bank-link";

describe("bankTransferWhatsAppHref", () => {
  it("emits https://wa.me with reservation id and total", () => {
    const href = bankTransferWhatsAppHref({
      phone: "+905321796763",
      message: "Official bank link please",
      reservationId: "bk_hotel_9",
      totalLabel: "$1,557",
    });
    expect(href.startsWith("https://wa.me/905321796763")).toBe(true);
    expect(href.includes("whatsapp://")).toBe(false);
    const decoded = decodeURIComponent(href);
    expect(decoded).toContain("bk_hotel_9");
    expect(decoded).toContain("$1,557");
  });

  it("returns empty when the phone cannot be normalized", () => {
    expect(
      bankTransferWhatsAppHref({
        phone: "",
        message: "hi",
        reservationId: "x",
        totalLabel: "1",
      })
    ).toBe("");
  });
});
