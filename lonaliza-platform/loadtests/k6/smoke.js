import http from "k6/http";
import { check, sleep } from "k6";

export const options = {
  vus: 5,
  duration: "1m",
  thresholds: {
    http_req_failed: ["rate<0.01"],
    http_req_duration: ["p(95)<2000"],
  },
};

const base = __ENV.BASE_URL || "http://127.0.0.1:3047";

export default function () {
  const health = http.get(`${base}/api/health`);
  check(health, {
    "health 200": (r) => r.status === 200,
    "health ok body": (r) => r.json("ok") === true,
  });
  const cfg = http.get(`${base}/api/public-config`);
  check(cfg, { "public-config not 5xx": (r) => r.status < 500 });
  sleep(1);
}
