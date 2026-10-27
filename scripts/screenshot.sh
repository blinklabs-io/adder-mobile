#!/usr/bin/env bash
# Capture the booted iOS simulator (or connected Android device) into docs/screenshots/.
#   npm run screenshot -- feed-linked            # iOS simulator
#   npm run screenshot -- feed-linked android    # Android via adb
set -euo pipefail
name="${1:?usage: screenshot.sh <name> [android]}"
out="$(cd "$(dirname "$0")/.." && pwd)/docs/screenshots/${name}.png"
if [[ "${2:-}" == "android" ]]; then
  adb exec-out screencap -p > "$out"
else
  xcrun simctl io booted screenshot "$out" >/dev/null
fi
echo "$out"
