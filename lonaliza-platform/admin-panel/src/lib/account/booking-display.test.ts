import { describe, expect, it } from "vitest";
import {
  customerFacingCopy,
  fareRulePills,
  formatFlightClock,
  pickScheduleStamp,
} from "./booking-display";

describe("formatFlightClock", () => {
  it("reads ISO wall-clock times", () => {
    expect(formatFlightClock("2026-09-20T14:35:00Z")).toBe("14:35");
    expect(formatFlightClock("2026-09-20 08:15:00")).toBe("08:15");
  });

  it("hides date-only and midnight placeholders", () => {
    expect(formatFlightClock("2026-09-20")).toBe("");
    expect(formatFlightClock("2026-09-20T00:00:00.000Z")).toBe("");
    expect(formatFlightClock("2026-09-20 00:00:00")).toBe("");
    expect(formatFlightClock("")).toBe("");
  });

  it("reads HH:mm and nested objects", () => {
    expect(formatFlightClock("09:40")).toBe("09:40");
    expect(formatFlightClock({ dateTime: "2026-09-20T21:05:00" })).toBe("21:05");
    expect(formatFlightClock({ date: "2026-09-20", time: "06:10" })).toBe("06:10");
  });
});

describe("pickScheduleStamp", () => {
  it("prefers a real clock over check-in midnight", () => {
    expect(
      formatFlightClock(
        pickScheduleStamp("2026-09-20T00:00:00.000Z", { departure: "2026-09-20T13:20:00" })
      )
    ).toBe("13:20");
  });
});

describe("fareRulePills", () => {
  it("wraps long fare-rule lines into pills", () => {
    expect(fareRulePills("غير قابل للاسترداد · غير قابل للتغيير · بدون أمتعة")).toEqual([
      "غير قابل للاسترداد",
      "غير قابل للتغيير",
      "بدون أمتعة",
    ]);
  });
});

describe("customerFacingCopy", () => {
  it("strips supplier B2B jargon", () => {
    const out = customerFacingCopy(
      "خدمات لوناليزا المشمولة (تنفّذها لوناليزا، مستقلة عن المورد): وفق شروط المورد."
    );
    expect(out).not.toMatch(/مورد/);
    expect(out).toMatch(/وفق شروط الخدمة/);
  });
});
