# VegBites Implementation Status

**Branch:** `fix/customer-app-foundation` · **HEAD:** `87c0345` (`main` = `a7868b9`, untouched)
**Last verified:** 2026-10-15 · **Scope of this table:** the Customer application. Vendor and
Delivery are separate phases (see the bottom of this file). **No Admin app exists**, by instruction.

> Rule applied here: a screen is *not* marked connected because the file exists. "Real state"
> names the store fields the screen actually reads/writes, or says which catalogue it renders.

## How this was verified

| check | command | result |
|---|---|---|
| Types | `npx tsc --noEmit` | **0 errors** |
| Lint | `npx expo lint` | **0 errors, 11 warnings** (all in Vendor/Delivery screens + root splash) |
| Static export | `CI=1 npx expo export --platform web` | **173 pages, exit 0** |
| Bilingual parity | `node scripts/check-i18n.js` | **607 = 607 keys, 415 call sites, 0 unresolved** |
| Rendered copy | `node scripts/check-rendered.js` | **0 of 173 pages show a raw translation key** |
| Routes served | HTTP sweep against the preview server | **35 / 35 status 200** |
| Palette lock | `grep -rn "#hex\|rgba(" src --include=*.ts(x) \| grep -v src/theme` | **no colour literal outside `src/theme/`** |
| Live preview | `PORT=8081 python3 scripts/preview-server.py` | running, serves `dist/` |

**What is *not* verified:** there is no browser or screenshot tool in this environment, so there
has been **no pixel-level visual QA and no click-through in a real browser**. Interactions are
verified by their wiring (store action → persisted state → rendered HTML copy), not by pressing
them. Anything below marked "parity" means the two locales render from the same keys.

## Customer screens

| Screen (route) | Real state / source | en + gu | Evidence notes |
|---|---|---|---|
| Splash (`/`) | redirects by session | ✅ | logo animation; deps warning open (see gaps) |
| Welcome (`/welcome` or `(auth)/welcome`) | none (static copy) | ✅ | |
| Language (`(auth)/language`) | `LanguageContext.setLanguage` (persisted) | ✅ | |
| Login (`(auth)/login`) | phone → OTP params | ✅ | |
| OTP (`(auth)/otp`) | `signIn()` → `/setup` for customers | ✅ | demo OTP is labelled as demo |
| Role (`(auth)/role`) | routes to the three roles | ✅ | no Admin option |
| **Setup / onboarding** (`(auth)/setup`) | `addAddress()` + `selectAddress()` + `SEED_RESTAURANTS` by distance | ✅ | **new**: area → default address → 3 nearest kitchens, skippable |
| Home (`/home`) | `user, selectedAddress, activeOrders, cartCount` | ✅ | |
| Tiffin hub (`/tiffins`) | `subscriptions, activeSubscription` | ✅ | Morning 05:00–10:00 · Evening 14:00–17:00 |
| Tiffin vendors (`/tiffins/vendors`) | `SEED_RESTAURANTS` (+ open/closed) | ✅ | |
| Vendor page (`/tiffins/[id]`) | `SEED_TIFFIN_MENU`, `SEED_PLANS` | ✅ | prerendered per vendor |
| Plans (`/tiffins/[id]/plans`) | `subscribeToPlan, walletBalance, slot/setSlot` | ✅ | 7 Days ₹699 · 15 Days ₹1499 · Monthly ₹2799 · Jain Monthly ₹2999; refuses if wallet short → routes to wallet |
| Build-your-thali (`/tiffins/[id]/thali`) | `addItem()` | ✅ | per-component counts priced from the catalogue, instructions folded in |
| Add-ons (`/addons`) | `addItem()` | ✅ | 8 add-ons from the catalogue |
| Restaurants (`/restaurants`) | catalogue + search/filter | ✅ | |
| Kitchen page (`/restaurant/[id]`) | `cart, addItem, setQuantity, favourites, toggleFavourite` | ✅ | **new**: heart saves the kitchen (feeds Profile) |
| Dish page (`/restaurant/item/[itemId]`) | `cart, addItem, removeLine` | ✅ | prerendered per dish id |
| Cart (`/cart`) | `cart, itemTotal, bill, couponCode, setQuantity, removeLine` | ✅ | coupon validates against `PRICING.coupons` |
| Checkout (`/checkout`) | `cart, bill, addresses, selectedAddress, isAuthed` | ✅ | guest → login, no dead CTA |
| Payment (`/payments`) | `bill, walletBalance, placeOrder, addMoney` | ✅ | 7 methods (COD, UPI, GPay, PhonePe, Netbanking, Card, Wallet); **no money moves — demo, labelled** |
| Order confirmation (`/order-confirmation`) | `orders` | ✅ | |
| **LIVE TRACKING** (`/tracking/[id]`) | `orders, advanceOrder, reduceMotion` | ✅ | **new**: six stages Pending→Accepted→Preparing→Food Ready→Out for Delivery→Delivered, progress bar, live pulse, delivery-OTP handover card; pulse honours reduced motion |
| Orders (`/orders`) | `activeOrders, pastOrders, reorder, cancelOrder` | ✅ | Active/Past tabs both populated from real orders |
| **Order detail** (`/orders/[id]`) | `orders, cancelOrder, reorder` | ✅ | **new screen**: status, OTP, items, bill incl. platform fee, timeline, cancel/rate/reorder |
| Subscriptions (`/subscription`) | `subscriptions, setSubscriptionStatus, skipNextDelivery, walletBalance` | ✅ | pause/resume/skip/cancel all mutate the store |
| Reels (`/reels`) | `addItem, likedReels, savedReels, toggleReelLike, toggleReelSave, reelComments, addReelComment` | ✅ | **new**: likes/saves/comments persist; share sheet (native + Web Share + clipboard); comments sheet with seeded threads; kitchen name → vendor page; "Order this" adds the dish and opens the kitchen |
| Reviews (`/reviews`) | `orders, reviews, submitReview` | ✅ | food-quality **and** delivery sub-ratings |
| Profile (`/profile`) | `user, signOut, updateUser, orders, subscriptions, reviews, walletBalance, favourites` | ✅ | **new**: saved-kitchens rail from store favourites |
| Wallet (`/wallet`) | `walletBalance, walletTxns, addMoney` | ✅ | demo top-up is labelled |
| Loyalty (`/loyalty`) | `orders, reviews, user` | ✅ | points derived from real history; redemption intentionally absent (see gaps) |
| Notifications (`/notifications`) | `orders, walletTxns, subscriptions` | ✅ | derived feed, not a fake list |
| Settings (`/settings`) | `user, signOut, reduceMotion, setReduceMotion` | ✅ | **new**: reduce-motion switch; sign-out clears the session then routes to welcome |
| Support (`/support`) | `user, orders, submitTicket` | ✅ | ticket is persisted and returns a reference id |
| Chat (`/chat`) | `chat, sendChatMessage, tickets, submitTicket` | ✅ | scripted agent replies, disclosed as scripted; no third-party AI call |

## Known gaps (stated, not hidden)

1. **No pixel/visual QA** — no browser automation available; see "What is not verified".
2. **Reward redemption is not implemented.** Loyalty shows milestones and how many points each
   needs; tapping is deliberately inert and the screen says so. Doing it properly needs a points
   ledger in the store (redeem → wallet credit). No fake redeem button was added.
3. **Push notifications are not wired** — `/notifications` is an in-app derived feed only.
4. **Payments are simulated.** Every payment screen states that no real money moves.
5. **Vendor app (Phase 10) and Delivery app (Phase 11) are not rebuilt on the store yet** — they
   only received palette/link fixes. The 11 remaining lint warnings live there and in the root
   splash screen.
6. `src/app/index.tsx` (root splash) has an open `useEffect` dependency warning; it is customer
   facing and is worth fixing in the next pass.
