#!/usr/bin/env bash
pm2 restart $(dirname "$0")/ecosystem.config.cjs
