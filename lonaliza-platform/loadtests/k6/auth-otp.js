import http from "k6/http";
import { check, sleep } from "k6";

export const options = {
  vus: 3,
  duration: "1m",
};

const base = __ENV.BASE_URL || "http://127.0.0.1:3048";

export default function () {
  const res = http.post(`${base}/api/auth/otp/send`, JSON.stringify({ phone: "+905551234567" }), {
    headers: { "Content-Type": "application/json" },
  });
  check(res, {
    "otp throttled or ok": (r) => [200, 400, 429].includes(r.status),
  });
  sleep(3);
}
