# VEGBITES — FINAL MASTER BUILD PROMPT
## Gemini / Astra Persistent Project Specification

> **READ THIS FILE FIRST. SAVE IT IN THE PROJECT ROOT AS `VEGBITES_MASTER_BUILD.md`.**
>
> This file is the persistent master instruction for the VegBites mobile app.
> Treat it as the single implementation brief for product scope, workflow,
> design system, localization, assets, animations, QA, and delivery order.
>
> The attached **VegBites Master Reference Image** is the visual source of truth.
> This file is the product/functional/engineering source of truth.
>
> **Visual Source:** Master Reference Image  
> **Functional Source:** This document + finalized VegBites workflow  
> **Implementation order:** Customer → Vendor → Delivery Boy  
> **Admin:** NEVER BUILD

---

# 1. CORE RULE

Do not merely discuss the product.

**INSPECT → IMPLEMENT → CONNECT → LOCALIZE → ANIMATE → TEST → VISUAL QA → FIX → BUILD → VERIFY**

Never stop at a plan, wireframe, TODO list, mock-only screen, or “can be done later”.

Work inside the existing repository.

Preserve good existing implementation. Repair mismatches. Create missing functionality.

---

# 2. SOURCE-OF-TRUTH HIERARCHY

## A. MASTER REFERENCE IMAGE — VISUAL AUTHORITY

The provided reference image controls:
- composition
- layout hierarchy
- visual density
- typography
- colors
- spacing
- card proportions
- border radius
- shadows
- image treatment
- buttons
- icons
- headers
- bottom navigation
- badges
- status indicators
- CTA placement
- information hierarchy
- interaction states
- animation character

Do not make an “inspired by” version.
Do not create a generic food-delivery template.
Do not introduce a second visual language.
For every screen, compare the implementation with the closest reference screen and fix visible mismatches.

## B. FINALIZED VEG BITES WORKFLOW — FUNCTIONAL AUTHORITY

This controls:
- screens
- features
- order flow
- tiffin flow
- restaurant flow
- subscriptions
- cart
- checkout
- payment
- LIVE TRACKING
- reels
- profile
- vendor workflow
- delivery workflow
- localization behavior

If a feature is required by the finalized workflow, do not silently remove it.

## C. EXISTING PROJECT — IMPLEMENTATION CONTINUITY

Reuse existing good infrastructure where possible.
Do not destructively rewrite working architecture without a real reason.

---

# 3. PRODUCT

**VegBites** = premium Indian/Gujarati food delivery + tiffin platform.

Product personality:
- warm
- homemade
- Gujarati
- trustworthy
- premium
- modern
- convenient
- food-first
- polished
- mobile-native

The final app must feel like one real commercial product.

---

# 4. STRICT ROLE ORDER

### PHASE ORDER
1. Customer App
2. Vendor App
3. Delivery Boy App

### ADMIN IS EXCLUDED
Do not create:
- Admin routes
- Admin screens
- Admin components
- Admin dashboard
- Admin navigation
- Admin backend assumptions
- Admin placeholders

If Admin appears in an older reference or specification, ignore it for implementation.

---

# 5. COMPLETE CUSTOMER SCREEN MAP

## Onboarding / Authentication
1. Splash
2. Welcome
3. Language Selection
4. Customer Login
5. OTP Verification
6. Address Setup
7. Zone/Vendor Discovery where required

## Main Customer Experience
8. Home
9. Explore
10. Tiffin Service
11. Restaurant Listing
12. Restaurant Detail
13. Restaurant Menu
14. Food Detail

## Tiffin
15. Tiffin Timing
16. Subscription Plans
17. Tiffin Vendor Selection
18. Tiffin Vendor Menu
19. Build Your Thali
20. Add-ons

## Order
21. Cart
22. Order Summary / Checkout
23. Address Confirmation
24. Payment Methods
25. Payment Success
26. **LIVE TRACKING**
27. Orders / Order History

## Social / Account
28. Food Reels
29. Reviews & Ratings
30. Subscriptions Management
31. Profile
32. Wallet
33. Loyalty Points
34. Notifications
35. Settings
36. Support / Report Issue

---

# 6. CUSTOMER MASTER FLOW
Splash → Welcome → Language → Login → OTP → Address → Home

### Tiffin flow
Home → Tiffin → Tiffin Timing → Subscription Plans → Vendor Selection → Vendor Menu → Build Your Thali → Add-ons → Cart → Checkout → Address → Payment → Success → LIVE TRACKING → Orders

### Restaurant flow
Home → Restaurants → Restaurant Listing → Restaurant Detail → Restaurant Menu → Food Detail → Cart → Checkout → Payment → Success → LIVE TRACKING → Orders

### Account flow
Home → Reels → Reviews → Orders → Subscriptions → Wallet → Loyalty → Notifications → Profile → Settings → Support

---

# 7. DESIGN SYSTEM
Create a centralized design system in src/theme/ (colors, typography, spacing, radii, shadows, dimensions, motion).
Never scatter arbitrary visual values throughout screens.
Derive tokens from the reference.

---

# 8. TYPOGRAPHY
Gujarati is first-class typography. Test long Gujarati strings to prevent clipping, overlap, awkward wrapping, broken vertical alignment, and fixed-width English assumptions.

---

# 9. COLOR / VISUAL SYSTEM
Extract from the reference rather than inventing arbitrary colors. Maintain consistent shadow and elevation logic. Do not use random gradients or apply glassmorphism to everything.

---

# 10. COMPONENT SYSTEM
Create reusable, composable components (PrimaryButton, IconButton, SearchBar, Cards, Avatar, BottomSheet, AnimatedPressable, BottomNavigation). Do not create giant “do everything” components.

---

# 11. ASSET POLICY
For every image visible in the master reference:
1. Search the project assets first.
2. Reuse the exact supplied asset when available.
3. Otherwise use the closest existing matching asset.
4. If no suitable asset exists, generate a replacement.
5. Never leave final-review UI with gray boxes or obvious placeholders.

---

# 12. GLOBAL LOCALIZATION
English and Gujarati. When Gujarati is selected, the entire app changes language. Persist language selection. Do not leave unexplained English strings in Gujarati mode.

---

# 13. PHASE 1 — FOUNDATION
Inspect first (framework, Expo setup, navigation, state, assets, theme, i18n). Then implement theme tokens, typography, colors, spacing, radii, shadows, motion, localization foundation, reusable components, navigation foundation. Create VEGBITES_IMPLEMENTATION_STATUS.md.

---

# 14. PHASE 2 — CUSTOMER ONBOARDING
Splash, Welcome, Language, Login (mobile + OTP), OTP (6-digits, segmented, resend timer), Address (input, map preview).

---

# 15. PHASE 3 — HOME / DISCOVERY
Home is the flagship customer screen. Implement location header, greeting, search, Tiffin Service, Restaurant, categories, featured food, popular food, recommendations, offers, subscription content, reels. The reference controls layout and density.

---

# 16-24. REST OF APP (Tiffin, Restaurants, Cart, Tracking, Reels, Profile)
(Details specified in prompt)

---

# 41. FINAL EXECUTION COMMAND
START NOW. Implement Phase 1. Implement Phase 2. Build the Customer Home foundation. Run checks/build. Perform visual QA. Fix mismatches. Continue Customer phases in order. Do not build Vendor until Customer completion gate passes. Do not build Delivery Boy until Vendor phase is ready. Never build Admin.
