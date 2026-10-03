import http from "k6/http";
import { check, sleep } from "k6";

export const options = {
  vus: 8,
  duration: "2m",
};

const base = __ENV.BASE_URL || "http://127.0.0.1:3048";

export default function () {
  const res = http.get(
    `${base}/api/hotels/suggest?q=istanbul&limit=5`
  );
  check(res, { "suggest not 5xx": (r) => r.status < 500 });
  sleep(1.5);
}
