#!/usr/bin/env bash
# Review before running. Closes public access to co-located services on the Lonaliza host.
set -euo pipefail

echo "This script documents UFW hardening — uncomment to apply on production."

# ufw default deny incoming
# ufw allow 22/tcp
# ufw allow 80/tcp
# ufw allow 443/tcp
# ufw deny 8090/tcp
# ufw deny 3047/tcp
# ufw deny 3048/tcp
# ufw deny 6380/tcp
# ufw deny 8080/tcp
# ufw deny 41443/tcp
# ufw deny 888/tcp
# ufw deny 21/tcp
# ufw enable

echo "Done (dry-run). Edit deploy/pocketbase-allowlist.conf for admin IP."
