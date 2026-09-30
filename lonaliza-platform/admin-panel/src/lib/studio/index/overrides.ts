/** مرادفات يدوية → nodeId (يجب أن ي exist في platform-index.generated). */
export const KEYWORD_OVERRIDES: Record<string, string[]> = {
  كنسل: ["hub.bookings.cancellations"],
  cancel: ["hub.bookings.cancellations"],
  gds: ["hub.flights.settings"],
  pkfare: ["hub.flights.settings", "screen.04"],
  بكفير: ["hub.flights.settings"],
  jarvis: ["screen.20"],
  جارvis: ["screen.20"],
  المشرف: ["screen.20", "screen.11"],
  الاطلس: ["screen.01"],
  atlas: ["screen.01"],
};
