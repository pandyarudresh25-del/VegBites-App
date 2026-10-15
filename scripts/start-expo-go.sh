#!/usr/bin/env bash
#
# Start the VegBites dev server for Expo Go on a physical iPhone.
#
# Why this script exists: on a physical iOS device Expo Go checks the Expo
# account before it will open a project served by a dev server, and it requires
# that account to match the one Expo CLI is signed in as. An anonymous tunnel
# (the default when the CLI is signed out) makes the manifest carry
# `username: undefined`, so Expo Go answers with:
#
#   "You're signed in to Expo Go as "<you>", but not signed in to Expo CLI.
#    Run "npx expo login" on your computer ..."
#
# The CLI reads its session from $EXPO_TOKEN when one is present
# (@expo/cli -> api/user/UserSettings.js), so an access token is enough — no
# interactive login, no password.
#
# Usage:
#   EXPO_TOKEN=<your-access-token> bash scripts/start-expo-go.sh
# or, to keep the token out of your shell history:
#   bash scripts/start-expo-go.sh <token-file>      # file containing only the token
#
set -euo pipefail

PORT="${EXPO_PORT:-8082}"

if [[ -z "${EXPO_TOKEN:-}" && $# -ge 1 && -f "$1" ]]; then
  EXPO_TOKEN="$(tr -d ' \t\r\n' < "$1")"
fi

if [[ -z "${EXPO_TOKEN:-}" ]]; then
  echo "ERROR: no Expo access token." >&2
  echo "Create one (classic) at https://expo.dev/settings/access-tokens — it must belong" >&2
  echo "to the same account your Expo Go app is signed in as — then run:" >&2
  echo "  EXPO_TOKEN=<token> bash scripts/start-expo-go.sh" >&2
  exit 1
fi

export EXPO_TOKEN

echo "── signed in as ──"
npx expo whoami

echo "── starting the tunnel on port ${PORT} (Ctrl-C to stop) ──"
exec npx expo start --tunnel --port "$PORT"
