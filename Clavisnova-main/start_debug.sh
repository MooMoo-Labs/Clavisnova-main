#!/usr/bin/env bash
set -eu
echo "=== ENV ==="
env
echo "=== RUN APP ==="
exec python -u backend/main.py


