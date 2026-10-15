/**
 * Domain model for the Customer application.
 *
 * Framework-free on purpose: the same types can back a real API later and be
 * reused by the Vendor / Delivery partner apps without importing UI code.
 *
 * Money is always in whole rupees (no paise) — the product never shows paise.
 */

export type Role = 'customer' | 'vendor' | 'delivery';

export type User = {
  id: string;
  name: string;
  phone: string;
  role: Role;
  memberSince: string;
  /** Lifetime savings shown on the profile screen. */
  savedTotal: number;
};

export type AddressLabel = 'home' | 'work' | 'other';

export type Address = {
  id: string;
  label: AddressLabel;
  name: string;
  phone: string;
  line1: string;
  line2: string;
  city: string;
  pincode: string;
  isDefault?: boolean;
};

/** Diet tags driving filtering, marks and kitchen matching. */
export type DietTag = 'veg' | 'jain' | 'noOnionGarlic' | 'vegan';

export type CuisineTag = 'gujarathi' | 'kathiyawadi' | 'jain' | 'southIndian' | 'punjabi' | 'dessert';

export type MenuItem = {
  id: string;
  restaurantId: string;
  name: string;
  nameGu: string;
  description: string;
  descriptionGu: string;
  price: number;
  /** Original price when discounted. */
  mrp?: number;
  image?: number;
  diet: DietTag[];
  isBestseller?: boolean;
  isSpicy?: boolean;
  category: string;
  available: boolean;
};

export type Restaurant = {
  id: string;
  name: string;
  nameGu: string;
  cuisines: CuisineTag[];
  rating: number;
  ratingCount: number;
  /** Minutes. */
  deliveryMins: number;
  distanceKm: number;
  minOrder: number;
  costForTwo: number;
  pureVeg: boolean;
  isOpen: boolean;
  image?: number;
  offerText?: string;
  heroItemIds: string[];
};

/** Kitchen windows from the build spec, not arbitrary times. */
export type TiffinSlot = 'morning' | 'evening';

export const TIFFIN_SLOTS: TiffinSlot[] = ['morning', 'evening'];

export const SLOT_WINDOW: Record<TiffinSlot, { start: string; end: string }> = {
  morning: { start: '05:00 AM', end: '10:00 AM' },
  evening: { start: '02:00 PM', end: '05:00 PM' },
};

export type PlanCadence = 'trial' | 'weekly' | 'fortnight' | 'monthly';

export type TiffinPlan = {
  id: string;
  name: string;
  nameGu: string;
  cadence: PlanCadence;
  /** Price for the whole cadence period. */
  price: number;
  mrp?: number;
  meals: number;
  diet: DietTag[];
  includes: string[];
  includesGu: string[];
  isPopular?: boolean;
};

/** One line in the cart — either a dish or a tiffin plan. */
export type CartLine = {
  id: string;
  kind: 'item' | 'plan';
  refId: string;
  name: string;
  nameGu: string;
  unitPrice: number;
  mrp?: number;
  quantity: number;
  image?: number;
  restaurantId?: string;
  /** Free-form composition line, e.g. a customised thali ("4 rotli · 2 sabji"). */
  note?: string;
  noteGu?: string;
};

export type PaymentMethod =
  | 'cod'
  | 'upi'
  | 'gpay'
  | 'phonepe'
  | 'netbanking'
  | 'card'
  | 'wallet';

/**
 * Order lifecycle. Everything up to `delivered` is what the LIVE TRACKING
 * screen animates through.
 */
export type OrderStatus =
  | 'placed'
  | 'confirmed'
  | 'preparing'
  | 'packed'
  | 'picked_up'
  | 'out_for_delivery'
  | 'delivered'
  | 'cancelled';

/**
 * The six customer-facing stages shown on LIVE TRACKING. The internal OrderStatus
 * set is finer-grained (7 states) because the kitchen and courier apps need
 * "packed" and "picked up" separately; both map onto these stages so the customer
 * only ever sees the six required labels.
 */
export type TrackingStage = 'pending' | 'accepted' | 'preparing' | 'ready' | 'outForDelivery' | 'delivered';

export const TRACKING_STAGES: TrackingStage[] = [
  'pending',
  'accepted',
  'preparing',
  'ready',
  'outForDelivery',
  'delivered',
];

export const STAGE_OF_STATUS: Record<OrderStatus, TrackingStage> = {
  placed: 'pending',
  confirmed: 'accepted',
  preparing: 'preparing',
  packed: 'ready',
  picked_up: 'outForDelivery',
  out_for_delivery: 'outForDelivery',
  delivered: 'delivered',
  cancelled: 'pending',
};

export const STAGE_KEY: Record<TrackingStage, string> = {
  pending: 'tracking.pending',
  accepted: 'tracking.accepted',
  preparing: 'tracking.preparing',
  ready: 'tracking.foodReady',
  outForDelivery: 'tracking.outForDelivery',
  delivered: 'tracking.delivered',
};

/** Ordered progression used by the tracking timeline. */
export const ORDER_FLOW: OrderStatus[] = [
  'placed',
  'confirmed',
  'preparing',
  'packed',
  'picked_up',
  'out_for_delivery',
  'delivered',
];

export type OrderLine = {
  id: string;
  name: string;
  nameGu: string;
  unitPrice: number;
  quantity: number;
  image?: number;
  note?: string;
  noteGu?: string;
};

export type Bill = {
  itemTotal: number;
  discount: number;
  deliveryFee: number;
  platformFee: number;
  taxes: number;
  total: number;
  couponCode?: string;
};

export type Courier = {
  name: string;
  phone: string;
  rating: number;
  vehicle: string;
  /** e.g. "GJ-03 KL 4471" */
  plate: string;
};

export type Order = {
  id: string;
  createdAt: number;
  status: OrderStatus;
  /** Epoch ms for each milestone already reached, for the timeline. */
  timeline: Partial<Record<OrderStatus, number>>;
  restaurantId?: string;
  restaurantName: string;
  restaurantNameGu: string;
  kitchenImage?: number;
  lines: OrderLine[];
  bill: Bill;
  paymentMethod: PaymentMethod;
  address: Address;
  courier?: Courier;
  /** Minutes, counted down by the tracking screen. */
  etaMins: number;
  /** Handover code the delivery partner verifies at the door. */
  deliveryOtp: string;
  /** Free-text note from the customer for this order. */
  instructions?: string;
  /** Requested tiffin slot, when the order came from a tiffin plan. */
  slot?: TiffinSlot;
  reviewed?: boolean;
  subscriptionId?: string;
};

export type SubscriptionStatus = 'active' | 'paused' | 'cancelled';

export type Subscription = {
  id: string;
  planId: string;
  planName: string;
  planNameGu: string;
  status: SubscriptionStatus;
  startedAt: number;
  renewsAt: number;
  mealsTotal: number;
  mealsUsed: number;
  nextDeliveryAt: number;
};

export type Reel = {
  id: string;
  kitchenName: string;
  kitchenNameGu: string;
  restaurantId?: string;
  caption: string;
  captionGu: string;
  image?: number;
  likes: number;
  commentsCount: number;
  views: number;
  liked?: boolean;
  saved?: boolean;
  /** Dish the reel sells — "Order this" jumps to that restaurant. */
  itemId?: string;
};

export type Review = {
  id: string;
  orderId: string;
  restaurantId?: string;
  restaurantName: string;
  restaurantNameGu: string;
  /** Overall rating (1-5). */
  rating: number;
  /** Food-quality sub-rating (1-5). */
  foodRating: number;
  /** Delivery sub-rating (1-5). */
  deliveryRating: number;
  text: string;
  createdAt: number;
  image?: number;
};

export type ReelComment = {
  id: string;
  author: string;
  text: string;
  at: number;
  /** True for comments this customer wrote (seeded ones are other people's). */
  mine?: boolean;
};

export type WalletTxnKind = 'credit' | 'debit' | 'refund' | 'cashback';

export type WalletTxn = {
  id: string;
  kind: WalletTxnKind;
  amount: number;
  note: string;
  noteGu: string;
  createdAt: number;
  orderId?: string;
};

export type SupportTopic = 'order' | 'refund' | 'payment' | 'delivery' | 'quality' | 'account' | 'other';

export type SupportTicket = {
  id: string;
  topic: SupportTopic;
  message: string;
  createdAt: number;
  status: 'open' | 'answered';
};

export type ChatMessage = {
  id: string;
  from: 'me' | 'agent';
  text: string;
  at: number;
};

/** Pricing rules — one place to tune delivery economics. */
export const PRICING = {
  freeDeliveryOver: 499,
  deliveryFee: 29,
  /** Flat platform fee, waived on larger baskets. */
  platformFee: 5,
  freePlatformFeeOver: 999,
  /** Applied on post-discount subtotal. */
  taxRate: 0.05,
  coupons: {
    VEG20: { type: 'percent' as const, value: 0.2, maxDiscount: 200, minOrder: 299 },
    FIRST50: { type: 'flat' as const, value: 50, minOrder: 199 },
  },
  walletAddRange: { min: 100, max: 5000 },
} as const;

export type CouponCode = keyof typeof PRICING.coupons;
export const COUPON_CODES = Object.keys(PRICING.coupons) as CouponCode[];

/** True when a coupon code exists and the order value qualifies. */
export function isCouponApplicable(code: string, itemTotal: number): code is CouponCode {
  const coupon = PRICING.coupons[code as CouponCode];
  return Boolean(coupon) && itemTotal >= coupon.minOrder;
}

/**
 * Single source of truth for order maths — screens must never add up bills
 * themselves (the previous cart screen hardcoded its own totals).
 */
export function computeBill(itemTotal: number, couponCode?: string): Bill {
  let discount = 0;
  if (couponCode && isCouponApplicable(couponCode, itemTotal)) {
    const coupon = PRICING.coupons[couponCode];
    discount =
      coupon.type === 'percent'
        ? Math.min(Math.round(itemTotal * coupon.value), coupon.maxDiscount)
        : coupon.value;
  }
  const deliveryFee = itemTotal === 0 || itemTotal >= PRICING.freeDeliveryOver ? 0 : PRICING.deliveryFee;
  const platformFee = itemTotal === 0 || itemTotal >= PRICING.freePlatformFeeOver ? 0 : PRICING.platformFee;
  const taxes = Math.round((itemTotal - discount) * PRICING.taxRate);
  return {
    itemTotal,
    discount,
    deliveryFee,
    platformFee,
    taxes,
    total: Math.max(0, itemTotal - discount + deliveryFee + platformFee + taxes),
    couponCode: discount > 0 ? couponCode : undefined,
  };
}

/** Localized copy keys for each order status (used by tracking + orders). */
export const STATUS_KEY: Record<OrderStatus, string> = {
  placed: 'flow.status.placed',
  confirmed: 'flow.status.confirmed',
  preparing: 'flow.status.preparing',
  packed: 'flow.status.packed',
  picked_up: 'flow.status.pickedUp',
  out_for_delivery: 'flow.status.outForDelivery',
  delivered: 'flow.status.delivered',
  cancelled: 'flow.status.cancelled',
};

export const STATUS_NOTE_KEY: Record<OrderStatus, string> = {
  placed: 'flow.note.placed',
  confirmed: 'flow.note.confirmed',
  preparing: 'flow.note.preparing',
  packed: 'flow.note.packed',
  picked_up: 'flow.note.pickedUp',
  out_for_delivery: 'flow.note.outForDelivery',
  delivered: 'flow.note.delivered',
  cancelled: 'flow.note.cancelled',
};
