# Cloudflare CDN cache rules (Phase 3)

Apply in Cloudflare dashboard → Rules → Cache Rules.

## Cache static Next assets

- **If** URI Path starts with `/_next/static/`
- **Cache eligibility:** Eligible
- **Edge TTL:** 1 month
- **Browser TTL:** respect origin

## Cache public config (short)

- **If** URI Path equals `/api/public-config`
- **Edge TTL:** 60 seconds
- **Bypass cache on cookie:** any session/admin cookie

## Never cache

- `/api/auth/*`, `/api/bookings`, `/api/admin/*`, `/admin/*`
- Set `Cache-Control: no-store` on origin (already on health/cron).

## WAF

- Enable OWASP core ruleset
- Rate limit burst on `/api/auth/otp/send` at edge (supplement app limiter)
