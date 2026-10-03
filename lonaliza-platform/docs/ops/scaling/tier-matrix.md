# Scaling tier matrix (T0–T5)

| Tier | Origin RPS (light) | Search starts/s | App nodes | Redis | Database | Typical use |
|------|-------------------|-----------------|-----------|-------|----------|-------------|
| T0 | 20–40 | 5–10 | 1 Next | optional local | PocketBase single | Today (pre-plan) |
| T1 | 80–200 | 15–30 async | 2–3 Next + nginx upstream | 1 instance | PB + PG standby sync | Phase 1–2 |
| T2 | 200–500 | 30–60 | 3–5 Next | Sentinel/managed | PG primary + replica | Phase 3 |
| T3 | 500–2k | 60–150 | 6–20 (K8s/Nomad) | Cluster | PG + replicas | Investor scale demo |
| T4 | 2k–10k | 150–400 | Autoscaled pools | Cluster | PG partitioned | Single-region cloud |
| T5 | 10k+ | 400+ | Multi-region | Global | PG sharded + DR | Global brand |

**Promotion triggers:** see [capacity-model.md](../capacity-model.md).
