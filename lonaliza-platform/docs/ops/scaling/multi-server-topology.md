# Multi-server topology

```mermaid
flowchart TB
  users[Users] --> cdn[CDN_WAF]
  cdn --> lb[L7_LoadBalancer]
  lb --> sf1[Storefront_3047]
  lb --> sf2[Storefront_3049]
  lb --> sf3[Storefront_3050]
  lb --> adm[Admin_3048]
  sf1 --> redis[(Redis_6380)]
  sf2 --> redis
  sf3 --> redis
  sf1 --> active[Active_Data_Backend]
  active --> pg[(PostgreSQL)]
  active --> pb[(PocketBase_8090)]
  sync[db_sync_orchestrator] --> pg
  sync --> pb
  sf1 --> he[HotelEngine_3051]
  workers[Search_publish_workers] --> redis
```

Deploy artifacts:

- [`deploy/lonaliza-storefront-upstream.conf`](../../../deploy/lonaliza-storefront-upstream.conf)
- [`ecosystem.config.cjs`](../../../ecosystem.config.cjs)
- Second node: [`deploy/scale-out-second-node.md`](../../../deploy/scale-out-second-node.md)
