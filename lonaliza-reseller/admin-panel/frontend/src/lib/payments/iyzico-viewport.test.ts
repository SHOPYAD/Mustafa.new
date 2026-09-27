import { describe, expect, it } from "vitest";
import { isIyzicoLeakDescriptor } from "./iyzico-viewport";

describe("isIyzicoLeakDescriptor", () => {
  it("matches hosted checkout iframes and sandbox chrome", () => {
    expect(
      isIyzicoLeakDescriptor({
        tag: "iframe",
        src: "https://sandbox-api.iyzipay.com/payment/checkoutform/xyz",
      })
    ).toBe(true);
    expect(
      isIyzicoLeakDescriptor({
        tag: "div",
        id: "iyzipay-checkout-form",
        className: "responsive",
      })
    ).toBe(true);
    expect(isIyzicoLeakDescriptor({ tag: "iframe", name: "pay-with-iyzico" })).toBe(true);
  });

  it("does not match Lonaliza's own card sheet or 3DS host", () => {
    expect(isIyzicoLeakDescriptor({ id: "lonaliza-iyzico-card-sheet" })).toBe(false);
    expect(isIyzicoLeakDescriptor({ id: "lonaliza-iyzico-3ds" })).toBe(false);
    expect(isIyzicoLeakDescriptor({ tag: "div", className: "invoice-table" })).toBe(false);
  });

  it("matches checkout-form scripts that would leak onto document.body", () => {
    expect(
      isIyzicoLeakDescriptor({
        tag: "script",
        src: "https://sandbox-api.iyzipay.com/checkoutform/v2/bundle.js",
      })
    ).toBe(true);
  });
});
