# Acceptance update — user instruction

The user deferred visual matching until functional screens and integration are built, then set a minimum visual acceptance of 90/100 per screen. This supersedes the previous zero-different-pixels requirement as a final acceptance policy; raw pixel differences remain diagnostic evidence, not a quality percentage.

## Per-screen visual rubric (all twenty, no averaging across screens)
- Composition and spatial geometry: 30 points.
- Typography, Arabic/RTL and text legibility: 20 points.
- Component hierarchy and proportions: 15 points.
- Light, material, depth and reference-specific effects: 15 points.
- Correct visual interaction states: 10 points.
- Responsive layout and window behavior: 10 points.

Each score requires reference, rendered screenshot, commit SHA and written justification, plus explicit reviewer acceptance. Until those exist the score is null, not 90. No automatic approval or replacement of references.

## Functional delivery scope of this change
- Twenty selectable surfaces, domain drill-down and cumulative hierarchy.
- Fourteen domain workspaces read source adapters and open existing administrative tools inside movable windows.
- Source-derived read adapters, redacted records, unknown/error/partial states.
- Supervisor uses configured model client with source evidence; conversation does not execute writes.
- Two signed, expiring, session-bound draft actions with duplicate protection: article draft and disabled dry-run automation.
- Optional browser speech transcription with explicit disclosure; authenticated TTS playback and output waveform measurement.
- Three.js point-cloud presence, manual rotation and actual audio-level coupling.
- Native management windows reuse existing controls. This is not a claim that those legacy modules have been rewritten or audited in full.

## Still not complete
- New in-studio mutation adapters for bookings, tickets, refunds, advertising, supplier writes and all tenant-specific administrative actions.
- Durable multi-instance task orchestration, per-user/per-tenant RBAC and shared-distributed approval storage.
- Full STT provider integration independent of browser speech-recognition support.
- All twenty reference-specific layouts and their 90-point visual acceptance.
- Production integration verification with configured providers and approved sandbox credentials.

The action receipt backend deliberately refuses serverless environments without durable storage. Local receipt creation is exclusive; uncertain results require reconciliation and never retry automatically. This is not a multi-region exactly-once guarantee.
