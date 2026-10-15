# VegBites — Audit Findings (pre-change)

**Audited by:** Arena Agent · **Date:** 2026-10-13
**Repo:** `github.com/pandyarudresh25-del/VegBites-App` @ `a7868b9` (branch `main`)
**Method:** real clone, real `npm install`, real build/typecheck, static source audit.
**Rule applied:** nothing below is reported unless a command in `EVIDENCE` produced it.

---

## 0. Commands actually run (raw evidence)

| # | Command | Result |
|---|---|---|
| 1 | `git clone https://github.com/pandyarudresh25-del/VegBites-App.git` | ✅ exit 0 · 111 files · single branch `main` @ `a7868b9` |
| 2 | `npm install --no-audit --no-fund` | ✅ exit 0 · 842 packages · 13s |
| 3 | `npx tsc --noEmit` | ✅ **exit 0 · 0 errors** |
| 4 | `CI=1 npx expo export --platform web` | ✅ exit 0 · **89 static routes** rendered, 4.7MB bundle |
| 5 | icon export-surface check vs `lucide-react-native@1.33.0` entry `.d.ts` | ✅ all 63 imported names resolve |
| 6 | i18n key parity (node + `typescript` transpile) | ✅ en 137 = gu 137, 0 missing, 0 used-but-undefined |
| 7 | palette grep for the 8 mandated colours | ❌ **0 of 8 present anywhere in `src/`** |
| 8 | hardcoded-hex scan outside `src/theme` | ❌ **16 files** |
| 9 | nav-target vs route-manifest audit | ❌ **5 broken targets** |
| 10 | state-architecture audit (`createContext`) | ❌ **only 1 context (language)** |

### Corrections to my own earlier (wrong) results
- An earlier icon scan reported "63 missing icons". **That was a bug in my test**, not the app: I probed for `.js` files while lucide ships `.mjs`, and my import-parser mangled aliased imports (`Image as ImageIcon`). Corrected in row 5 — **icons are fine**. Retracted.
- An earlier `npx tsc --noEmit` "failure" came from a *different, stale* folder that had no `tsconfig.json`. Against this repo, tsc passes clean.

---

## 1. What is genuinely working (do not "fix")

- **Build & routing skeleton.** All 89 routes export; Expo Router config is valid; `output: static` works.
- **TypeScript.** `strict: true`, 0 errors.
- **Localization coverage.** 137 keys, exact en/gu parity; every `t('…')` key used in the app is defined. `LanguageContext` persists to AsyncStorage (`@vegbites/language`) with English fallback.
- **Design-system primitives exist** (`AppText`, `AppButton`, `AppCard`, `AppPressable`) and animations use Reanimated correctly.
- **Assets are local** (no remote URLs).

---

## 2. Problems found (the actual work)

### P1 — 🔴 CRITICAL: no application state; every journey is a mock
`src/context/` contains **only** `LanguageContext`. There is no cart, order, auth, wallet or subscription store.

Consequences (verified by reading the screens):
- `cart.tsx` renders a module-level constant `CART_ITEMS` (Gujarati Thali / Buttermilk / Papad) with a **hardcoded bill** (`deliveryFee = 30, platformFee = 5, taxes = 12, discount = 15`). It does not use `computeBill()` and cannot receive items from any other screen. **No add / remove / quantity controls and no empty state.**
- `checkout.tsx` hardcodes the address (`B-402, Shivam Apartment, Vastrapur, **Ahmedabad**` — wrong city for a Rajkot product), hardcodes the 3-line summary and a hardcoded **₹155** total that ignores the cart. The "map preview" is literally `gujarati_thali.jpg`.
- `payments.tsx` hardcodes 6 methods with hardcoded English labels, then `Pay Now` → `order-confirmation` **without creating an order, without a processing state, and with no failure path**.
- `orders.tsx` renders hardcoded `ACTIVE_ORDERS` / `PAST_ORDERS` constants.
- Net effect: **Cart → Checkout → Payment → Tracking → Orders cannot work as a journey**, because no screen can see another's data. This is the root cause of "incomplete interactions / missing functionality".

### P2 — 🔴 CRITICAL: 5 navigation calls target routes that do not exist
Route groups (`(customer)`, `(vendor)`) are **not** URL segments, yet the code pushes the literal string `customer` / `vendor`:

| File | Broken target |
|---|---|
| `(customer)/restaurants.tsx` | `/customer/restaurant/${id}` |
| `(customer)/tiffins/[id]/index.tsx` | `/customer/tiffins/${id}/thali` |
| `(customer)/tiffins/[id]/plans.tsx` | `/customer/tiffins/${id}/thali` |
| `(customer)/tiffins/vendors.tsx` | `/customer/tiffins/${vendor.id}/thali` |
| `(vendor)/orders.tsx` | `/vendor/order/${id}` |

Evidence: the export manifest emits `/restaurants` **and** `/(customer)/restaurants`, but **no `/customer/restaurants`**. So these `push()` calls resolve to the unmatched route. Each is cast `as any`, which is exactly why `tsc` never caught them.

### P3 — 🔴 HIGH: bottom navigation hides the two core journeys
`(customer)/_layout.tsx` exposes 5 tabs: **Home, Reels, Orders, Cart, Profile**. `tiffins/*` and `restaurants` — the Tiffin and Restaurant journeys the brief calls out first — are registered `href: null`, i.e. **unreachable from the bottom bar**. The tab bar is also **not localized** (titles are raw English literals).

### P4 — 🔴 HIGH: the mandated palette is 100% absent
Of `#E85D24 · #C84A18 · #287849 · #FBF8F2 · #FFFFFF · #F4ECE1 · #2B211C · #786A60`, **only `#FFFFFF` exists** (in 6 files). The live theme uses an entirely different set (`#F67B25`, `#221A14`, `#6B5E55`, `#FFFBF5`, `#F9F1E6`, …). Additionally **16 files hardcode hex colours** outside the theme, bypassing it entirely:

`(auth)/language` · `(customer)/chat` · `loyalty` · `notifications` · `order-confirmation` · `settings` · `subscription` (8 hex) · `support` · `tiffins/[id]/index` · `tracking/[id]` · `wallet` · `(delivery)/_layout` · `(delivery)/delivery/[id]` · `(vendor)/earnings` · `(vendor)/order/[id]` · `components/AppButton`

### P5 — 🟠 MEDIUM: dead / non-interactive UI
- `orders.tsx` **Reorder** button has no `onPress` at all.
- `login.tsx` social buttons are plain `<View>`s (Google / Apple do nothing).
- `cart.tsx` "Apply coupon" row is a `TouchableOpacity` with no handler.
- 12 screens have **no outgoing navigation** (`wallet`, `subscription`, `reviews`, `loyalty`, `notifications`, `chat`, `reels`, `restaurant/item`, …) — several are legitimate leaves, but the cluster signals "rendered, not wired".

### P6 — 🟠 MEDIUM: localization has holes despite the claims
`VEGBITES_VISUAL_QA_HANDOFF.md` states *"No hardcoded English strings remain in major components."* Not true:
- `payments.tsx`: `"Payment Methods"`, `"Pay Now"`, all 6 method labels.
- `orders.tsx`: `"On the Way"`, `"Delivered"` statuses and `"Today, 12:30 PM"`-style dates.
- `checkout.tsx`: `"Home"` address label.
- `cart.tsx` / others: item names are English-only literals.
- No number/date/currency formatter exists (`₹{value}` interpolated by hand);
  `checkout.morningTime` / `eveningTime` are identical in both languages.

### P7 — 🟠 MEDIUM: tracking is presentational
`(customer)/tracking/[id].tsx` (321 lines) reads the `id` param but has no state machine and no timer: it cannot progress Placed → Confirmed → Preparing → Packed → Picked up → Out for delivery → Delivered. Requires P1's store to become genuinely "LIVE".

### P8 — 🟡 LOW: stale / contradictory documentation
- `VEGBITES_VISUAL_QA_HANDOFF.md`: *"Vendor and Delivery Boy Apps are strictly NOT started."* **False** — `(vendor)/` has 9 route files, `(delivery)/` has 5.
- `VEGBITES_IMPLEMENTATION_STATUS.md`: 31/31 screens marked ✅ for Implemented/Connected/Localized/Responsive/Animated — contradicted by P1–P7. (Visual QA column is honestly ⏳ for all.)
- `app.json`: splash `backgroundColor: #208AEF` (stock Expo blue) and `adaptiveIcon.backgroundColor: #E6F4FE` — neither belongs to the brand palette. `userInterfaceStyle: "automatic"` while the theme is light-only.
- Stock leftovers tracked in the repo: `react-logo*.png`, `expo-logo.png`, `expo-badge*.png`, `tutorial-web.png`, `assets/expo.icon/`, `scripts/reset-project.js`, `fix_images.py`.

---

## 3. Priority order for the fix

1. **Store** — one typed global store (auth, cart, orders, wallet, subscriptions, reviews) persisted per-user. Everything else depends on it.
2. **Palette + theme** — swap to the 8 mandated colours, delete every hardcoded hex, add real type/spacing/radius scales.
3. **Navigation** — fix the 5 broken pushes; rebuild the bottom bar around Home · Tiffin · Restaurants · Cart · Profile, localized, with a live cart badge.
4. **Journeys** — cart edit/empty, checkout from real cart, payment state machine (processing → success/failure → order creation), LIVE tracking timer, orders/reorder/rate, wallet, subscriptions.
5. **Localization** — move the remaining literals into en/gu; add currency/date/number formatters.
6. **Then** Vendor, then Delivery. No Admin.

Nothing in sections 1–2 above is inferred; each item maps to a command in section 0.

---

## 4. Status after `fix/customer-app-foundation` (updated at `352e9d0`+)

Section 2 above is the **pre-change** audit. This section records what the branch
has actually changed, with the commands re-run to prove it.

### 4.1 Verification — latest run on this branch

| check | pre-branch | now |
|---|---|---|
| `npx tsc --noEmit` | 0 errors | **0 errors** |
| `npx expo lint` | — | 0 errors, **15 warnings** (was 38) |
| `CI=1 npx expo export --platform web` | 89 routes | **129 routes**, exit 0 |
| `node scripts/check-i18n.js` | 137 = 137, 0 unresolved | **531 = 531, 0 unresolved** |
| `node scripts/check-rendered.js` | n/a (did not exist) | **0 of 129 pages** show a raw key |
| customer screens on real state | 0 of 29 | **21 of 29** |
| mandated palette in `src/` | 0 of 8 | all 8; no off-palette hex |
| broken nav targets | 5 | **0** |

### 4.2 Findings from the second pass (all now fixed)

These were found *after* the first fix pass, by reading the remaining screens and
auditing the exported HTML rather than trusting the static checker.

- **`(customer)/tiffins/[id]/thali.tsx` was non-functional.** It never read its own
  route param, showed four hardcoded English components (`Rotli`, `Sabji`, …) and a
  hardcoded `₹120` regardless of the kitchen, and "Add to cart" only navigated —
  the customisation was discarded. Rebuilt: the kitchen comes from the route, the
  composition is priced per portion above what the vendor includes, and the thali
  is written to the cart with its composition as a line note.
- **`(customer)/addons.tsx` dropped everything the user selected.** Add-ons were
  local mock data with string prices (`'₹20'` parsed by `parseInt`), images bound as
  `source={{ uri: require(...) }}` (a numeric module id, so nothing rendered), no
  localization, and pressing "Add" merely pushed `/cart`. Rebuilt on the catalogue
  with `store.addItem`, real images, `currency()` and en/gu labels.
- **`(customer)/tiffins/vendors.tsx` invented ids `'1' | '2' | '3'`** that no other
  screen could resolve, and pushed straight to `/tiffins/1/thali`. Now driven by
  `SEED_RESTAURANTS` and pushing real ids.
- **`(customer)/tiffins/[id]/index.tsx` ignored its own `id`** and always rendered
  "Shree Krishna Tiffin" with three hardcoded dishes and a `#fff` literal. Now
  resolves the kitchen, its menu and its cheapest plan from the catalogue.
- **`(customer)/settings.tsx` "logged out" without logging out** — it navigated to
  `/(auth)/welcome` while leaving the persisted session intact. Now calls
  `store.signOut()` behind an inline confirmation (`Alert.alert` is a no-op on web).
- **`(customer)/notifications.tsx` was three hardcoded English notifications** with
  relative strings (`'10 mins ago'`), a hardcoded `#0284C7` blue and alpha by string
  concatenation. Rebuilt as a real feed derived from orders, wallet ledger and
  subscriptions, with en/gu copy and formatters.
- **`(customer)/loyalty.tsx` claimed a hardcoded 120 points** with a fixed 60%
  progress bar and chevrons on rows that do nothing. Points are now derived from
  delivered orders and written reviews. Redemption is deliberately **not** offered:
  there is no points ledger in the store yet, and a button that cannot redeem would
  be a lie.
- **Order lines could not carry a customisation.** `CartLine`/`OrderLine` gained an
  optional `note`/`noteGu`, threaded through `addItem` → `placeOrder` → `reorder`,
  and rendered on cart, checkout and tracking.
- **`tracking/[id].tsx` rendered `line.name` unlocalized** (Gujarati users saw English
  dish names) — now uses the screen's label helper.
- **Config was still stock Expo:** splash `#208AEF` and `adaptiveIcon` `#E6F4FE`
  (both off-palette, listed as P8 above) → `#FBF8F2`; `userInterfaceStyle` `automatic`
  → `light`, matching the light-only palette.
- **The static export could not serve a single detail page.** Dynamic routes
  exported as empty shells (`restaurant/[id].html` pre-rendered as "no kitchens
  match"). `generateStaticParams` now emits one real page per seeded kitchen for
  `restaurant/[id]`, `tiffins/[id]`, `tiffins/[id]/plans` and `tiffins/[id]/thali`
  — 129 routes instead of 89. `scripts/preview-server.py` also resolves dynamic
  URLs (including multi-level ones) for ids that have no prerendered page.

### 4.3 Still open (do not report as done)

- **8 customer screens remain store-free or hardcoded:** `chat.tsx`, `plans.tsx`,
  `restaurant/item.tsx` (reachable by URL only — nothing links to it),
  plus the vendor/delivery palettes.
- **No pixel-level visual QA.** Verification is typecheck + lint + export +
  rendered-HTML inspection; no browser or screenshot tool is available in this
  environment, so layout and animation quality are **not** verified visually.
- **Vendor and Delivery apps have only palette + broken-link touch-ups.** No Admin
  app, per instruction.
- Reward redemption needs a points ledger before it can be offered honestly.

---

## 5. Third pass — every remaining customer screen (commit `f1b4562`+)

### 5.1 Findings

- **`(customer)/chat.tsx` called a third-party AI service from a customer screen.**
  It imported `@heyputer/puter.js` (declared in `package.json`) and called
  `puter.ai.chat(prompt, { model: 'openai/gpt-5.3-codex' })` — a hosted model with no
  key management, no fallback, an unstructured English-only prompt, and a hardcoded
  `#FFFFFF`. Rebuilt as a store-backed conversation with scripted replies derived
  from the customer's own order/subscription, plus a plainly-worded notice that no
  human agent is connected. **The dependency has been removed** from `package.json`
  (lockfile resynced, −258 lines).
- **`(customer)/plans.tsx`** listed three invented plans with string prices
  (`'₹699'`) and rendered a **"Pause subscription" button with no `onPress` at all**.
  Every plan row pushed to the vendors list regardless of which plan was tapped.
  Rebuilt on `SEED_PLANS` with real subscribe through the store.
- **`(customer)/restaurant/item.tsx` had no inbound link** — it rendered one
  hardcoded thali (price `₹180`, "1.2k+ Ratings") for any dish. It is now
  `restaurant/item/[itemId].tsx`, resolves a real catalogue dish, prerenders one page
  per dish, and is linked from the restaurant menu (both the thumbnail and the name).
- **Subscribing ignored the wallet balance.** `subscribeToPlan` debited
  unconditionally while `pushTxn` clamps the balance at zero → a ₹299 plan could be
  bought with ₹250 and the shortfall vanished silently. The store now refuses
  (`Subscription | null`) and both plans screens route to the wallet to top up.
  The checkout/payments path already guarded this correctly; only subscriptions did not.
- **`support.tsx` claimed tickets went "into the store"** — they were local state that
  vanished on reload. Genuinely persisted now, via the same store as chat.
- **`#fff` / `rgba(...)` literals were still reaching screens** (9 `#fff` in six files,
  plus hand-written `rgba()` overlays). The earlier palette sweep only matched
  six-digit hex. All are now theme tokens or `withAlpha(palette.*)`; no colour literal
  remains outside `src/theme/`.

### 5.2 Verification — latest run

| check | result |
|---|---|
| `npx tsc --noEmit` | 0 errors |
| `npx expo lint` | 0 errors, 15 warnings |
| `CI=1 npx expo export --platform web` | **163 routes**, exit 0 |
| `node scripts/check-i18n.js` | 554 = 554 keys, 0 unresolved |
| `node scripts/check-rendered.js` | 0 of 163 pages show raw keys |
| customer routes served over HTTP | 32/32 status 200 |
| customer screens on real state | **29 of 29** |

### 5.3 Still open

- **No pixel-level visual QA** — no browser or screenshot tool in this environment;
  verification is typecheck + lint + export + rendered-HTML inspection.
- Vendor and Delivery screens have palette/link fixes only; neither app has been
  rebuilt on the store yet. No Admin app, per instruction.
- Reward redemption still needs a points ledger in the store (loyalty states this).
