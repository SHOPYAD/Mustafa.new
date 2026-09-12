#!/usr/bin/env bash
pm2 stop $(dirname "$0")/ecosystem.config.cjs
