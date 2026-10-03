import http from "k6/http";
import { check, sleep } from "k6";

export const options = {
  vus: 10,
  duration: "2m",
  thresholds: {
    http_req_failed: ["rate<0.02"],
  },
};

const base = __ENV.BASE_URL || "http://127.0.0.1:3048";

export default function () {
  const q =
    "originSkyId=IST&destinationSkyId=AYT&date=2026-12-01&adults=1";
  const res = http.get(`${base}/api/flights/search?${q}`);
  check(res, {
    "search not 502/504": (r) => r.status !== 502 && r.status !== 504,
    "search acceptable": (r) => [200, 202, 400, 429].includes(r.status),
  });
  sleep(2);
}
