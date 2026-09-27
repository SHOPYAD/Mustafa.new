# Travelport Air v11 — canonical HTML source (agents)

## Single tree for literal extraction

All agent-facing Markdown under `docs/travelport/agents/air-v11/` is derived from **one** MadCap help tree inside the local HTTrack mirror:

`docs/travelport/travelport api guide/travelport-airapi json/support.travelport.com/webhelp/JSONAPIs/Airv11/Content/Air11/`

Relative to the repository root, the full path is:

```text
docs/travelport/travelport api guide/travelport-airapi json/support.travelport.com/webhelp/JSONAPIs/Airv11/Content/Air11/
```

This subtree contains the consolidated API references and guides (`APIRef_*`, `*Guide.html`, workflows). It is the **only** HTML tree used for automated HTML→MD generation and for endpoint list alignment with `AirEndpointsList11.html` in the same `General/` folder.

## Dedupe policy (HTTrack noise and duplicate mirrors)

The mirror root `docs/travelport/travelport api guide/` also contains parallel copies (for example `Air Endpoints/`, `Air Pricing Guide/`, `Seats Guide/`, `NDC Guide/`, …) that overlap the same `support.travelport.com/webhelp/JSONAPIs/Airv11/Content/...` material.

**Rules:**

1. **Prefer** the path under `travelport-airapi json/.../Content/Air11/` for any APIRef or endpoint table.
2. If the same `APIRef_*.html` filename appears in another mirror folder, treat it as **duplicate** unless a byte-level diff shows a material difference. If there is a difference, record the outcome in the generated MD front matter (`dedupe_note`) and keep the `travelport-airapi json` copy as canonical.
3. Ignore for API extraction: `Skins/`, `hts-cache/`, `hts-log.txt`, `backblue.gif`, `fade.gif`, and other HTTrack scaffolding.

## Official URLs

Live help URLs follow:

`https://support.travelport.com/webhelp/JSONAPIs/Airv11/Content/Air11/<same-relative-path-as-under-Content-Air11>`

Replace spaces in local paths when forming links from the workspace path.

## Gaps vs live Travelport

If a field or endpoint exists on the live portal but **not** in the local HTML file, classify it as **GAP_DOC_MIRROR** in `endpoint-matrix.v1.yaml` and resolve against the official site or a second mirror import — not by guessing payloads.
