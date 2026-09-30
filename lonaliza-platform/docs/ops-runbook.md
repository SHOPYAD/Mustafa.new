# Ops runbook

## PM2 order

Start data services before the Next apps:

1. `lonaliza-pocketbase` (`127.0.0.1:8090`)
2. `lonaliza-hotel-redis` then `lonaliza-hotel-engine`
3. `lonaliza-storefront` (`:3047`) and `lonaliza-admin-backend` (`:3048`)
4. Workers that can follow: `lonaliza-automation`, `lonaliza-hotel-content`, `lonaliza-swarm-worker`

`pm2 save` writes `/root/.pm2/dump.pm2`. Restart only the app that was built. `lonaliza-platform/scripts/safe-deploy.sh` builds `storefront`, `admin`, or `both`, restarts that PM2 process, and runs `nginx -t`. It does not reload nginx.

## Redis

Hotel Redis is the PM2 app `lonaliza-hotel-redis` using `hotel-engine/redis.conf`. Probe with `redis-cli -p 6380 ping`. Swarm BullMQ uses its own Redis port as configured for the worker; do not flush either instance as a deploy step.

## PocketBase backup

Data directory: `lonaliza-platform/database/pocketbase/pb_data`.

Backup, from the server, while the process is running:

```bash
sqlite3 pb_data/data.db ".backup '/root/lonaliza-backups/<timestamp>/pocketbase-data.db'"
sqlite3 pb_data/auxiliary.db ".backup '/root/lonaliza-backups/<timestamp>/pocketbase-auxiliary.db'"
```

Also copy `database/data/providers/registry.json` and `database/data/server-env.json` into that directory and `chmod 700` the directory. The 2026-09-29 snapshot is `/root/lonaliza-backups/20260929T211113Z`.

Restore only with PocketBase stopped:

```bash
pm2 stop lonaliza-pocketbase
cp pocketbase-data.db pb_data/data.db
cp pocketbase-auxiliary.db pb_data/auxiliary.db
pm2 start lonaliza-pocketbase
```

Do not restore over a live WAL.

## Health

`lonaliza-platform/scripts/health-check.sh` checks:

- `http://127.0.0.1:3047/` `/flights` `/hotels` `/blog` `/api/health`
- `http://127.0.0.1:3048/admin` (200 or redirect)
- `http://127.0.0.1:8090/api/health`
- Redis `6380` PING

`/api/health` returns `{ ok, service, time }` and no configuration values.

## Nginx

Config: `/www/server/panel/vhost/nginx/lonaliza.com.conf`. Storefront `:3047`, admin `:3048`. `.data` and `.env` are blocked. `agent-stream` has `proxy_buffering off`. Run `nginx -t` after a config edit. Reload only when the test passes and the config actually changed.
