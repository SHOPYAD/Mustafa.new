# 🔐 Travelport Trial / Sandbox Credentials

> **⚠️ SECURITY WARNING ⚠️**
>
> This file is **excluded from git** via `.gitignore`. It contains real credentials that grant access to Travelport PP (pre-production) environment.
>
> **NEVER:**
> - Commit this file to any repository.
> - Paste these values into public issues, tickets, or chat.
> - Deploy these values to production servers.
> - Share outside the immediate integration team.
>
> **ALWAYS:**
> - Use through the encrypted `TenantSupplierSettings` flow (see `tourism_api` suppliers module).
> - Rotate if ever exposed.
> - Contact Travelport support to revoke if leaked: travelport.com/support

---

## 1. Account Identity

| Field | Value |
|---|---|
| Username | `TP55037298` |
| Password | `9Q8OG[<#c–RSm` *(⚠️ note the em-dash `–` U+2013, not a regular hyphen)* |
| Client ID | `2C9uuTkO7EC96maT3ewQLANt6tag6knC` |
| Client Secret | `WfZbPITTd66c4EgtmHiRmCk1EuTzZQmaROQv0fG-twd0PTcZ_4v86AHN6yuIzDtx` |
| PCC | `7K7L` |
| Access Group | `50C1BCC1-615D-4F7F-AD66-919730C8FD0C` |
| Region | `EMEA:Turkey` |
| Currency | `TRY` |

## 2. Carriers

### GDS Carriers (via 1G)
```
AI  Air India
EK  Emirates
FZ  flydubai
MS  EgyptAir
NP  Nile Air
QR  Qatar Airways
SU  Aeroflot
SV  Saudia
TA  TACA
TK  Turkish Airlines
XY  flynas
1G  Galileo (default aggregator)
```

### NDC Carriers
```
AA  American Airlines
UA  United Airlines
QF  Qantas
SQ  Singapore Airlines
```

> **Hotel:** No specific carrier allowlist — hotel content is provider-aggregated (GDS chains + Booking.com aggregator available via same tenant account).

## 3. Endpoints (Pre-Production)

| Purpose | URL |
|---|---|
| **OAuth token endpoint** | `https://auth.pp.travelport.net/oauth/token` |
| **API base path (all Air/Hotel/Ancillary)** | `https://api.pp.travelport.net/` |

### Full endpoint composition (examples)

```
POST https://auth.pp.travelport.net/oauth/token
POST https://api.pp.travelport.net/11/air/search/catalogofferings
POST https://api.pp.travelport.net/11/air/price/offersprice
POST https://api.pp.travelport.net/11/air/book/reservation
POST https://api.pp.travelport.net/11/hotel/search/searchcomplete  (ODM v12)
POST https://api.pp.travelport.net/11/hotel/availability            (ODM v11)
POST https://api.pp.travelport.net/11/hotel/reservation             (ODM v11)
```

### Authentication scopes requested

```
scope = "openid"  (default)
grant_type = "password"
Or:
grant_type = "client_credentials"
```

## 4. Required Headers (every request)

| Header | Value |
|---|---|
| `Authorization` | `Bearer <access_token>` |
| `Content-Type` | `application/json` |
| `Accept` | `application/json` |
| `XAUTH_TRAVELPORT_ACCESSGROUP` | `50C1BCC1-615D-4F7F-AD66-919730C8FD0C` |
| `Accept-Version` | `11` *(Hotel Search uses v12)* |
| `Content-Version` | `11` *(matches Accept-Version)* |
| `TraceId` | `<uuid-v4 per request>` |

## 5. cURL reference — Obtain access token

```bash
curl -X POST 'https://auth.pp.travelport.net/oauth/token' \
  -H 'Content-Type: application/x-www-form-urlencoded' \
  -d 'grant_type=password' \
  -d 'username=TP55037298' \
  -d 'password=9Q8OG[<#c–RSm' \
  -d 'client_id=2C9uuTkO7EC96maT3ewQLANt6tag6knC' \
  -d 'client_secret=WfZbPITTd66c4EgtmHiRmCk1EuTzZQmaROQv0fG-twd0PTcZ_4v86AHN6yuIzDtx' \
  -d 'scope=openid'
```

Expected response:
```json
{
  "access_token": "eyJ...",
  "token_type": "Bearer",
  "expires_in": 3600,
  "refresh_token": "...",
  "scope": "openid"
}
```

## 6. Rate Limits (Trial / Sandbox)

| Category | Limit |
|---|---|
| OAuth token calls | ~100/min (cache token, reuse ~55 minutes) |
| Air Search | Lower throughput on trial; recommend ≤ 5 req/sec |
| Hotel Search | ≤ 5 req/sec |
| Reservations | ≤ 2 req/sec |

> On 429: exponential backoff (1s → 2s → 4s → 8s, max 3 retries).

## 7. Known Limitations (Trial)

- Some GDS responses may return synthetic/test data for specific carriers.
- Ticketing (`/air/ticket`) requires a valid commission/agreement — trial accounts have limited real ticket issuance. Use "document" mode for dry-runs.
- NDC on trial: AA/UA/QF/SQ may return limited results; full catalog requires production access.
- Hotel Booking.com aggregator on trial: availability is synthetic.

## 8. Agent Usage Protocol

### For Air agent
1. Never hardcode these values in source files.
2. Use only in `docs/travelport/postman/` or local `.env.travelport` for manual Postman testing.
3. Seed them into the database via the shared seed script (see `§12` below), not env.
4. Test connection through the `tenantSupplierConnectionTest` GraphQL mutation after seed.

### For Hotel agent
1. Same rules.
2. Reuse the same OAuth token (one-tenant, one-token cache).
3. Use `Accept-Version: 12` only for `SearchComplete`; everything else is `11`.

## 9. Troubleshooting (known issues)

| Symptom | Likely cause | Fix |
|---|---|---|
| `401` on OAuth | Password contains `–` em-dash, copy-paste corrupted it | Use this file directly, not retyped. |
| `403 missing_access_group` | Forgot `XAUTH_TRAVELPORT_ACCESSGROUP` header | Add it to every request |
| `Invalid PCC` | Wrong PCC format | Exactly `7K7L` (4 chars) |
| Token expires too soon | Not caching | Cache for `expires_in - 60s` |
| `Content-Version mismatch` | Using v11 for SearchComplete | Use v12 for SearchComplete only |

## 10. Rotation Schedule

- Client Secret: rotate every 90 days (if available in trial).
- Password: change if exposed; Travelport allows self-service password change via portal.
- If rotation needed: update this file + re-run seed script to update DB.

## 11. Target Tenants for Auto-Seed

When the seed script runs, credentials are attached to the **development** subdomain(s) listed below. The super-admin can clone settings to other tenants via `b2bTenantUpdate`.

```yaml
targetTenants:
  - subdomain: dev          # local development
  - subdomain: demo         # demo tenant
  - subdomain: staging      # staging environment
# Production tenants: MUST use their own credentials, not these trial ones
```

## 12. Seed Script Reference

The shared seed script lives at (to be created in Air Phase 0):
```
erxes/backend/plugins/tourism_api/scripts/seed-travelport-trial.ts
```

Usage:
```bash
# From erxes backend root
pnpm --filter=@erxes/plugin-tourism-api exec ts-node scripts/seed-travelport-trial.ts \
  --subdomain dev \
  --provider travelport \
  --environment sandbox
```

Behavior:
1. Loads credentials from `/www/wwwroot/liotrip.com/docs/travelport/CREDENTIALS_SANDBOX.md` (this file) OR from `.env.travelport` if present.
2. Encrypts them using `TENANT_SECRETS_KEY`.
3. Upserts into `TenantSupplierSettings` for the given subdomain:
   - `airProviders[]` entry: `travelport` (enabled, sandbox)
   - `hotelProviders[]` entry: `travelport` (enabled, sandbox)
4. Runs `tenantSupplierConnectionTest` for both Air and Hotel — fails loudly if connection fails.
5. Prints summary.

See §§18–19 of both Air/Hotel plans for full seed specification.

---

## 13. Contact

- Travelport support: travelport.com/support
- Account manager: *(to be filled)*
- Internal owner of this credential set: *(to be filled — platform team)*

**Last verified working:** 2026-04-17 (trial issued for testing both Air v11 and Hotel v11/v12).
