#!/usr/bin/env bash
pm2 start $(dirname "$0")/ecosystem.config.cjs
