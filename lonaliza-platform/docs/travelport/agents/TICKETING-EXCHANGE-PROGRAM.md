# Ticketing, documents, queue, and GDS exchange (sub-program)

This document scopes **wave C5** from the Travelport agent plan: ticketing, batch void, document list/history, queue placement, and GDS ticket exchange. These flows use different base paths than most Air JSON calls (`/11/air/` vs `/11/documents/`, `/11/queue/`, `/11/exchangesearch/`, etc.).

## Exit criteria (program-level)

1. Every endpoint row in `endpoint-matrix.v1.yaml` that is tagged `NON_AIR_BASE` has a documented full `makeRequest` endpoint string and a code reference or an explicit `OUT_OF_SCOPE_PRODUCT` rationale with HTML mirror citation.
2. Sandbox smoke tests exist for **at least one** ticketing path already implemented in `airBookingAdapter` (issue ticket), without storing secrets in the repo.
3. Exchange / queue / batch void are tracked as separate implementation tickets once AirPrice + workbench parity stabilizes (dependency order).

## Canonical references

- Consolidated endpoint list: `travelport-airapi json/.../Content/Air11/General/AirEndpointsList11.html` (sections **AirTicketing**, **NDC Modify**, **GDS Exchanges**).
- Non-air path constants (URL segments only): `erxes/backend/plugins/tourism_api/src/providers/travelport/air/travelportNonAirEndpoints.ts`.

## Operational notes

- OAuth and `XAUTH_TRAVELPORT_ACCESSGROUP` still apply; only the first path segment after `/11/` changes.
- After any GraphQL schema change in plugin subgraphs, follow Liotrip gateway supergraph recomposition rules before production verification.
