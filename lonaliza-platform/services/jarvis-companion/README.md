# JARVIS 2.1 — Reference Architecture & Companion Daemon
**Origin:** Muslim's JARVIS 2.1 ("The Build Guide - Book Two of Two")  
**Platform Target:** Lonaliza Sovereign Cybernetic OS (Linux Server + Web Client)

## System Architecture Map
As documented in Muslim's 39-page Build Guide:
1. `server.py`: The heart. Web server (FastAPI/Tornado), conversation loop, hearing, speaking, system prompt.
2. `quick.py`: The shortcut. Fast-path regex matching that handles direct commands in milliseconds with $0 model cost.
3. `actions.py`: Master tool catalog and dispatch. Standardized return prefixes: `OK:`, `FAILED:`, `NOT_ALLOWED:`, `NEED_CONFIRM:`.
4. `local_voice.py`: Faster-whisper on GPU with keyword hint priming (`HINT = "..."`) boosting travel vocabulary.
5. `omni_voice.py`: Voice cloning from 20-30s audio sample, locked voice reference (`lock_voice.bat`), gain control (1.6x).
6. `memory.py`: Plain JSON persistent facts.
7. `system_control.py`: Plumbing for volume, media keys, typing, power.
8. `modes.py`: Swappable personalities via `persona.txt` and `routines.json`.
9. `index.html`: Client web interface with 6 states (idle, hearing, thinking, speaking, missed, typing), 850ms silence detection, 45s follow-up window, and 1.5s echo guard.

## Lonaliza Platform Integration
- **Client-Side Port (Web / WASM):** Hand gesture tracking via MediaPipe Hands + 3D Holographic Cylinder Cards in Three.js WebGL.
- **Server-Side Integration:** Direct API bridging to Lonaliza's 6 operational sectors (Ads, Social, Video, SEO Articles, Tour Packages, GDS/BedBanks).
