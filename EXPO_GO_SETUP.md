# Testing VegBites in Expo Go (physical iPhone)

## The error you saw

```
There was a problem running the requested project.
You're signed in to Expo Go as "rudreshpandya", but not signed in to Expo CLI.
Run "npx expo login" on your computer to sign in to Expo CLI as "rudreshpandya"
so you can open this project.
```

This is not a bug in the app. On a **physical iOS device only**, Expo Go checks the Expo
account before opening a project served by a development server, and it requires that account
to match the one Expo CLI is signed in as. (Expo's own troubleshooting page documents it:
<https://docs.expo.dev/troubleshooting/expo-go-sign-in-required/>. Android devices, the iOS
Simulator and published updates are unaffected.)

I confirmed the mechanism in the installed CLI rather than guessing:

- `@expo/cli/build/src/api/user/UserSettings.js` → `return process.env.EXPO_TOKEN ?? null;`
  — the CLI takes its session from `EXPO_TOKEN` when no interactive login exists.
- `@expo/cli/build/src/start/server/middleware/ManifestMiddleware.js` →
  `const username = getActorDisplayName(user);` then
  `getExpoGoConfig({ ..., username: username !== 'anonymous' ? username : undefined })`
  — with no signed-in user, the manifest ships **no** username.
- `@expo/cli/build/src/start/server/AsyncNgrok.js` builds the tunnel hostname from that
  username, which is why our QR read `ge-g1-o-**anonymous**-8082.exp.direct`.

So Expo Go sees `anonymous` in the manifest, compares it with `rudreshpandya`, and refuses.

## Fix: give the CLI an access token (no password needed)

1. Open <https://expo.dev/settings/access-tokens> in a browser, signed in as **rudreshpandya**.
2. Create a token (classic). Name it something like `vegbites-test`, and set a short expiry.
3. Paste the token into the chat, or attach it as a small `.txt` file. I set `EXPO_TOKEN`,
   restart the tunnel, and hand you a fresh QR — the new hostname will contain your username
   instead of `anonymous`.
4. **Revoke the token** at the same page when you have finished testing. It grants full
   account access; treat it like a password.

Reproduce it yourself at any time:

```bash
# inside the project
EXPO_TOKEN=<your-token> bash scripts/start-expo-go.sh
# or, keeping the token out of shell history:
bash scripts/start-expo-go.sh /path/to/token.txt
```

Then scan the QR with the iPhone Camera app (or Expo Go → *Scan QR code*).

## Alternatives that need no account at all

| Path | How | Notes |
|---|---|---|
| **Safari on the iPhone** | Open the web build URL | Same screens, same store, no Expo Go. The web build is a static export of this exact code. |
| **Android device** | Scan the tunnel QR | The account check does not apply to Android. |
| **iOS Simulator** (macOS) | `npx expo start` then press `i` | Also unaffected by the check. |

## If the QR stops working

A `--tunnel` URL is issued per dev-server process. If the dev server restarts (for example when
the sandbox is recycled), the old `exp.direct` hostname dies and a new QR is needed — ask me and
I will issue a fresh one. The tunnel is also rate-limited per session, so the first bundle
download can take a minute or two; later reloads are fast.
