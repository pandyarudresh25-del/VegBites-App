# Testing VegBites in Expo Go (physical iPhone)

Two different QR codes, with different lifetimes. Use the **durable** one unless you are actively
watching me change code.

| | **Durable QR** — works with no servers running | **Live-reload QR** — temporary |
|---|---|---|
| URL | `exp://u.expo.dev/3604817a-fe6f-46f5-9d70-397f1909943b?runtime-version=exposdk%3A57.0.0&channel-name=preview` | `exp://<random>-rudreshpandya-8081.exp.direct` |
| Served by | Expo's CDN (EAS Update) | my Metro dev server, over an ngrok tunnel |
| Survives my sandbox being recycled | **yes** | **no** — the tunnel dies with the process (`ERR_NGROK_3200`) |
| Hot reloads when I edit code | no (re-publish instead) | yes |
| Changes URL over time | **never** — it is bound to project + channel | every dev-server restart |

## The durable QR

It encodes the project ID and the `preview` channel, so it always resolves to the **newest published
bundle** on that channel. Publishing again does not change the QR — it just changes what the QR serves.

```bash
export EXPO_TOKEN=<your-token>
npx eas-cli@latest update --channel preview --environment preview --platform ios \
  --message "what changed" --non-interactive
```

Publish for `--platform android` too if you want the same QR to work on Android; the manifest is
per-platform, so a channel with no Android update answers Android clients with an error.

### What has been published

| platform | update id | runtime | assets | published |
|---|---|---|---|---|
| ios | `01a13e82` | `exposdk:57.0.0` | 28 | 2026-10-15 07:42 UTC |
| android | `01a13e84` | `exposdk:57.0.0` | 32 | 2026-10-15 07:43 UTC |

Both were published from commit `6593d19` with **no uncommitted changes**, so the QR serves exactly
what is in git. Verified by fetching the manifest back the way Expo Go does (multipart,
`expo-runtime-version`, `expo-channel-name`) → **HTTP 200** for both platforms.

### What I could not verify

- **Asset download.** Fetching the bundle from `assets.eascdn.net` returns
  `403 Unauthorized asset request — Expo Application Services`. That is **not** our network: a
  third-party fetcher on a different egress IP gets the same 403. It is EAS gating assets for a
  **private** project. Expo Go signed in as the project owner is the intended client, so this should
  work — but I cannot produce a device session from here, so **treat the first load as unverified**.
  If it fails, the lever is the project's privacy setting on expo.dev (Project → Settings).
- **Offline re-open.** After the first successful load Expo Go keeps the update in its cache, so a
  later launch with no network should fall back to the cached bundle. Unverified from here.
- **First load always needs the network** — a QR cannot bootstrap itself from nothing.

## If Expo Go refuses to open it

| Message | Cause | Fix |
|---|---|---|
| *"You're signed in to Expo Go as X, but not signed in to Expo CLI"* | the dev server was anonymous | start it with an `EXPO_TOKEN` for account `X` (see `scripts/start-expo-go.sh`) |
| *`ERR_NGROK_3200` … endpoint … is offline* | the tunnel died with the dev-server process | use the durable QR, or ask me for a fresh tunnel |
| *Project is incompatible with this version of Expo Go* | SDK mismatch | this project is SDK **57.0.0** (`exposdk:57.0.0`); update Expo Go |

## Why this file exists

Expo Go on a **physical iOS device only** checks the Expo account before opening a project served by
a development server, and it requires that account to match the one Expo CLI is signed in as. (Expo's
troubleshooting page: <https://docs.expo.dev/troubleshooting/expo-go-sign-in-required/>.) Confirmed in
the installed CLI rather than guessed:

- `@expo/cli/build/src/api/user/UserSettings.js` → `return process.env.EXPO_TOKEN ?? null;`
- `@expo/cli/build/src/start/server/middleware/ManifestMiddleware.js` →
  `username: username !== 'anonymous' ? username : undefined`
- `@expo/cli/build/src/start/server/AsyncNgrok.js` → builds the tunnel host from that username, which
  is why an unsigned CLI produces `…-anonymous-8081.exp.direct`.

For the live-reload path, authenticate the CLI first:

```bash
EXPO_TOKEN=<your-token> bash scripts/start-expo-go.sh
# or, keeping the token out of shell history:
bash scripts/start-expo-go.sh /path/to/token.txt
```
