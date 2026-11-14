#!/bin/bash
# Flơr: start the local app on macOS (Mac version of start.bat).
# Double-click this file in Finder, or run ./start.command in Terminal.
cd "$(dirname "$0")"
export PYTHONIOENCODING=utf-8
export CF_ACCOUNT_ID=476febd9c90853e6db2890529eaf8f96

if ! grep -q '^CF_API_TOKEN=' .env 2>/dev/null; then
  echo
  echo "Paste your Cloudflare API token and press Enter."
  echo "(Leave empty to use lower-quality Pollinations images.)"
  read -r -p "Token: " CF_API_TOKEN
  if [ -n "$CF_API_TOKEN" ]; then
    echo "CF_API_TOKEN=$CF_API_TOKEN" >> .env
    echo "Token saved to .env - keep this file private."
  fi
fi

(sleep 1; open http://localhost:8080) &
python3 server.py
