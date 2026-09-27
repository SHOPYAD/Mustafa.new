import { describe, expect, it } from "vitest";
import { pdfKindsForService } from "./booking-documents";

describe("booking PDF kinds", () => {
  it("attaches nothing before verified payment", () => {
    expect(pdfKindsForService("flight", false)).toEqual([]);
    expect(pdfKindsForService("hotel", false)).toEqual([]);
  });

  it("uses e-ticket + tax invoice for paid flights, never a hotel voucher", () => {
    expect(pdfKindsForService("flight", true)).toEqual(["eticket", "tax_invoice"]);
    expect(pdfKindsForService("flight", true)).not.toContain("voucher");
  });

  it("uses voucher + tax invoice for paid hotels", () => {
    expect(pdfKindsForService("hotel", true)).toEqual(["voucher", "tax_invoice"]);
  });
});
