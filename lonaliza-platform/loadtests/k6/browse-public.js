import http from "k6/http";
import { check, sleep } from "k6";

export const options = {
  stages: [
    { duration: "30s", target: 20 },
    { duration: "1m", target: 50 },
    { duration: "30s", target: 0 },
  ],
  thresholds: {
    http_req_failed: ["rate<0.005"],
    http_req_duration: ["p(95)<800"],
  },
};

const base = __ENV.BASE_URL || "http://127.0.0.1:3047";

export default function () {
  const paths = ["/", "/api/public-config", "/api/translations?locale=ar"];
  for (const p of paths) {
    const res = http.get(`${base}${p}`);
    check(res, { [`${p} not 5xx`]: (r) => r.status < 500 });
  }
  sleep(0.5);
}
