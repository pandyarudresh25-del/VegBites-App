# VegBites Implementation Status

**Branch:** `fix/customer-app-foundation` (`main` = `a7868b9`, untouched) — local only, nothing pushed.
**Last verified:** 2026-10-15 · **Scope:** Customer → Vendor → Delivery Boy. **No Admin app exists**, by instruction.

> Rule applied here: a screen is *not* marked connected because the file exists. "Real state" names
> the store fields the screen actually reads/writes, or says which catalogue it renders.

## How this was verified

| check | command | result |
|---|---|---|
| Types | `npx tsc --noEmit` | **exit 0** |
| Lint | `npx expo lint` | **0 errors, 10 warnings** |
| Static export | `CI=1 npx expo export --platform web` | **164 pages, exit 0** |
| Bilingual parity | `node scripts/check-i18n.js` | **817 = 817 keys, 584 call sites, 0 unresolved** |
| Rendered copy | `node scripts/check-rendered.js` | **0 of 164 pages show a raw translation key** |
| Routes served | `node scripts/check-preview.js` | **162 / 162 routes HTTP 200 with rendered content** (48 export their pre-hydration state — see note 1) |
| Palette lock | `grep -rn "#hex\|rgba(" src --include=*.ts(x) \| grep -v src/theme/` | **no colour literal outside `src/theme/`** (only `#1234` inside translation copy) |
| Live preview | `python3 scripts/preview-server.py` on 8081 | running against `dist/` |

**What is *not* verified:** there is no browser or screenshot tool in this environment, so there has
been **no pixel-level visual QA and no real click-through**. Interactions are verified by their wiring
(store action → persisted state → rendered HTML copy) and by the six automated gates above, not by
pressing them. Haptics are additionally **unverifiable here** — the web build is a guarded no-op.

## Customer screens

| Screen (route) | Real state / source | en + gu | Evidence notes |
|---|---|---|---|
| Splash (`/`) | redirects by session | ✅ | logo reveal animation |
| Welcome (`/welcome`) | none (static copy) | ✅ | |
| Language (`/language`) | `LanguageContext.setLanguage` (persisted) | ✅ | |
| Login (`/login`) | phone → OTP params | ✅ | |
| OTP (`/otp`) | `signIn()` → `/setup` for customers | ✅ | demo OTP is labelled as demo |
| Role (`/role`) | routes to the three roles | ✅ | no Admin option |
| Setup / onboarding (`/setup`) | `addAddress()` + `selectAddress()` + `SEED_RESTAURANTS` by distance | ✅ | area → default address → 3 nearest kitchens, skippable |
| Home (`/home`) | `user, selectedAddress, activeOrders, cartCount` | ✅ | |
| Tiffin hub (`/tiffins`) | `subscriptions, activeSubscription` | ✅ | Morning 05:00–10:00 · Evening 14:00–17:00 |
| Tiffin vendors (`/tiffins/vendors`) | `SEED_RESTAURANTS` (+ open/closed) | ✅ | |
| Vendor page (`/tiffins/[id]`) | `SEED_TIFFIN_MENU`, `SEED_PLANS` | ✅ | prerendered per vendor |
| Plans (`/tiffins/[id]/plans`) | `subscribeToPlan, walletBalance, slot/setSlot` | ✅ | 7 Days ₹699 · 15 Days ₹1499 · Monthly ₹2799 · Jain Monthly ₹2999; refuses when wallet is short → routes to wallet |
| Build-your-thali (`/tiffins/[id]/thali`) | `addItem()` | ✅ | per-component counts priced from the catalogue; pre-renders only vendors that publish a thali |
| Add-ons (`/addons`) | `addItem()` | ✅ | reached from the thali builder; 8 real catalogue add-ons |
| Restaurants (`/restaurants`) | catalogue + search/filter | ✅ | |
| Kitchen page (`/restaurant/[id]`) | `cart, addItem, setQuantity, favourites, toggleFavourite` | ✅ | heart saves the kitchen (feeds Profile); closed kitchens show a real closed banner; a kitchen with no published menu says so instead of "no results" |
| Dish page (`/restaurant/item/[itemId]`) | `cart, addItem, removeLine` | ✅ | prerendered per dish id |
| Cart (`/cart`) | `cart, itemTotal, bill, couponCode, setQuantity, removeLine` | ✅ | coupon validates against `PRICING.coupons` |
| Checkout (`/checkout`) | `cart, bill, addresses, selectedAddress, isAuthed` | ✅ | guest → login, no dead CTA |
| Payment (`/payments`) | `bill, walletBalance, placeOrder, addMoney` | ✅ | 7 methods (COD, UPI, GPay, PhonePe, Netbanking, Card, Wallet); **no money moves — demo, labelled**; success haptic on order placed |
| Order confirmation (`/order-confirmation`) | `orders` | ✅ | |
| **LIVE TRACKING** (`/tracking/[id]`) | `orders, advanceOrder, reduceMotion` | ✅ | six stages Pending→Accepted→Preparing→Food Ready→Out for Delivery→Delivered, progress bar, live pulse, delivery-OTP handover card; pulse honours reduced motion |
| Orders (`/orders`) | `activeOrders, pastOrders, reorder, cancelOrder` | ✅ | Active/Past tabs both populated from real orders |
| Order detail (`/orders/[id]`) | `orders, cancelOrder, reorder` | ✅ | status, OTP, items, bill incl. platform fee, timeline, cancel/rate/reorder |
| Subscriptions (`/subscription`) | `subscriptions, setSubscriptionStatus, skipNextDelivery, walletBalance` | ✅ | pause/resume/skip/cancel all mutate the store |
| Reels (`/reels`) | `addItem, likedReels, savedReels, toggleReelLike, toggleReelSave, reelComments, addReelComment` | ✅ | likes/saves/comments persist; share sheet (native + Web Share + clipboard); comments sheet with seeded threads; kitchen name → vendor page; "Order this" adds the dish and opens the kitchen |
| Reviews (`/reviews`) | `orders, reviews, submitReview` | ✅ | food-quality **and** delivery sub-ratings |
| Profile (`/profile`) | `user, signOut, updateUser, orders, subscriptions, reviews, walletBalance, favourites` | ✅ | saved-kitchens rail from store favourites; rows reach orders, subscriptions, wallet, reviews, addresses, payment methods, notifications, loyalty, support, settings |
| Wallet (`/wallet`) | `walletBalance, walletTxns, addMoney` | ✅ | demo top-up is labelled |
| Loyalty (`/loyalty`) | `orders, reviews, user` | ✅ | points derived from real history; redemption intentionally absent (see gaps) |
| Notifications (`/notifications`) | `orders, walletTxns, subscriptions` | ✅ | derived feed, not a fake list |
| Settings (`/settings`) | `user, signOut, reduceMotion, setReduceMotion` | ✅ | reduce-motion switch; sign-out clears the session then routes to welcome |
| Support (`/support`) | `user, orders, submitTicket` | ✅ | ticket is persisted and returns a reference id |
| Chat (`/chat`) | `chat, sendChatMessage, tickets, submitTicket` | ✅ | scripted agent replies, disclosed as scripted; no third-party AI call |

## Vendor app (Phase 10) — `/vendor/*`

Routed under a real `vendor/` segment so nothing collides with the customer tabs (route groups add no
URL segment — that was the original duplicate-route bug).

| Screen (route) | Real state / source | en + gu | Evidence notes |
|---|---|---|---|
| Dashboard (`/vendor/dashboard`) | `vendorOrders, vendorMenu, vendorRestaurantId, user` | ✅ | four-column board (new / preparing / ready / handed+done), today's revenue, average prep time measured from `order.timeline`, menu counters, insights row |
| Live orders (`/vendor/orders`) | `vendorOrders, setOrderStatus` | ✅ | tab per stage via `TAB_OF_STATUS`; advance through `NEXT_ACTION` placed→confirmed→preparing→packed→picked_up |
| Order detail (`/vendor/order/[id]`) | `vendorOrders, setOrderStatus` | ✅ | reached stages derived from the real timeline; customer note, address, bill |
| Menu (`/vendor/menu`) | `allVendorItems, vendorMenu, toggleSoldOut, restoreMenuItem` | ✅ | "Off the menu" group lists removed dishes with a restore action |
| Add dish (`/vendor/menu/add`) | `addMenuItem({name,nameGu,price,category,description})` | ✅ | validation: name required, price must parse |
| Edit dish (`/vendor/menu/edit`) | `setItemPrice, toggleSoldOut, removeMenuItem, restoreMenuItem` | ✅ | inline remove confirm (no `Alert.alert` — it is a no-op on web) |
| Earnings (`/vendor/earnings`) | `vendorOrders` (delivered only) | ✅ | available / today / week / month, payout ledger, cancelled orders shown as no-earning |
| Insights (`/vendor/insights`) | `vendorOrders, reviews` | ✅ | 7-day analytics (revenue, orders, average basket, cancellations), top dishes by qty + revenue, repeat vs new customers, customer ratings with the matching reviews |
| Profile (`/vendor/profile`) | `user, signOut, vendorRestaurantId, setVendorRestaurant, vendorOrders` | ✅ | switching kitchen genuinely re-scopes orders/menu/earnings; confirmed sign-out; support number |

## Delivery Boy app (Phase 11) — `/delivery/*`

| Screen (route) | Real state / source | en + gu | Evidence notes |
|---|---|---|---|
| Dashboard (`/delivery/dashboard`) | `user, courierOnline, setCourierOnline, deliveryQueue, completedDeliveries, acceptDelivery, setCourierStep, courierSteps` | ✅ | online switch, today's payout, active delivery with 5-step rail, available list (only `packed` and unclaimed), helpline / breakdown |
| Delivery detail (`/delivery/delivery/[id]`) | `acceptDelivery, setCourierStep, reportBreakdown, orders` | ✅ | progress rail, pickup + drop legs with real map links (`Linking`), call, COD amount, OTP handover verified against `order.deliveryOtp`, breakdown report, helpline |
| Earnings (`/delivery/earnings`) | `completedDeliveries` | ✅ | today / week payout at `PAYOUT_PER_DELIVERY`, deliveries completed, cash still to deposit for COD orders, per-delivery ledger, states plainly that settlement is a demo |
| Profile (`/delivery/profile`) | `user, courierOnline, breakdowns, reportBreakdown, signOut, deliveryQueue` | ✅ | identity, vehicle + plate from the courier record on the partner's own deliveries, availability switch, breakdown report form + log, helpline, confirmed sign-out |

**Store support for Delivery (new):** `courierOnline`/`setCourierOnline`, derived `deliveryQueue`
(packed → delivered) and `completedDeliveries` (delivered), `acceptDelivery(orderId)` (assigns a
courier, advances a placed/confirmed order to packed), `courierSteps` + `setCourierStep(orderId, step)`
mapped through `STEP_STATUS` and stamped into `order.timeline`, `breakdowns` + `reportBreakdown`.
New domain types: `CourierStep`, `DeliveryBreakdown`, `PAYOUT_PER_DELIVERY`.

## Animation, motion and haptics

- Reduced motion is **honoured globally**: `src/app/_layout.tsx` mounts `ReducedMotionConfig`, driven
  by the customer's own `reduceMotion` switch in Settings, so every Reanimated entrance, layout move
  and spring snaps instead of animating — no screen has to remember.
- Screens that also read `reduceMotion` directly: LIVE TRACKING, reels, kitchen page, settings.
- Haptics: `src/lib/haptics.ts` (guarded, web no-op) fires on add-to-cart, extras added, reel "Order
  this", order placed, delivery accepted and OTP handover verified.

## Known gaps (stated, not hidden)

1. **Static export renders pre-hydration state.** `dist/*.html` is generated with an empty store, so
   48 routes export their empty/guest state (cart, orders, wallet, vendor board, delivery board …).
   In a browser the store hydrates from `localStorage` and the real content appears. This is native
   `expo-router` static-rendering behaviour, not a broken screen — but it is why a raw HTML fetch of
   those routes looks sparse.
2. **No pixel/visual QA and no click-through** — no browser automation in this environment.
3. **Reward redemption is not implemented.** Loyalty shows milestones and what each costs; tapping is
   deliberately inert and the screen says so. Doing it properly needs a points ledger.
4. **Push notifications are not wired** — `/notifications` is an in-app derived feed only.
5. **Payments and payouts are simulated.** Payment and courier-earnings screens both say so.
6. **`src/app/delivery/tracking.tsx` was deleted.** It was an unrebuilt stub with a hardcoded
   "Delivery #1234" and a fake "Map View" placeholder, reachable from nowhere. The partner's live
   status lives in `/delivery/delivery/[id]`; no route or link referenced the stub.
7. Root splash `src/app/index.tsx` still carries one `useEffect` dependency warning (10 lint warnings
   total, 0 errors).
