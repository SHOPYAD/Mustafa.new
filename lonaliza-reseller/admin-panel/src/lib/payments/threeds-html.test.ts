import { describe, expect, it } from "vitest";
import { decodeThreeDSHtml } from "@/lib/server/iyzico";

describe("decodeThreeDSHtml", () => {
  it("decodes iyzico base64 ACS markup and passes through HTML", () => {
    const html = "<html><form action='https://acs.example/3ds'></form></html>";
    expect(decodeThreeDSHtml(Buffer.from(html, "utf8").toString("base64"))).toContain("acs.example");
    expect(decodeThreeDSHtml(html)).toContain("acs.example");
    expect(decodeThreeDSHtml("not-html-or-base64-html")).toBe("");
  });
});
