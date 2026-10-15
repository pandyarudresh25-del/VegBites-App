/**
 * Global application store.
 *
 * Before this existed the app had exactly one context (language) and every
 * screen rendered its own `const CART_ITEMS = [...]`, so no journey could span
 * two screens. This store is the single source of truth for auth, addresses,
 * cart, orders, subscriptions, wallet, reviews and support, and it persists to
 * AsyncStorage so state survives a reload.
 *
 * Kept dependency-free (React context + reducer-ish helpers) rather than
 * pulling in Zustand/Redux: the surface is small and this keeps the bundle and
 * the review diff small.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  Address,
  ReelComment,
  Bill,
  CartLine,
  ChatMessage,
  SupportTicket,
  SupportTopic,
  TiffinSlot,
  Courier,
  MenuItem,
  DeliveryBreakdown,
  CourierStep,
  Order,
  OrderStatus,
  PaymentMethod,
  Review,
  Subscription,
  TiffinPlan,
  User,
  WalletTxn,
  computeBill,
} from '../domain/types';
import { SEED_ADDRESSES, SEED_MENU } from '../data/catalogue';

const STORAGE_KEY = '@vegbites/state/v1';

export type PaymentResult = 'success' | 'failure';

type PersistedState = {
  user: User | null;
  addresses: Address[];
  cart: CartLine[];
  couponCode?: string;
  orders: Order[];
  subscriptions: Subscription[];
  walletBalance: number;
  walletTxns: WalletTxn[];
  reviews: Review[];
  tickets: SupportTicket[];
  chat: ChatMessage[];
  /** Restaurant ids the customer has saved. */
  favourites: string[];
  /** Chosen tiffin window; persists across the tiffin funnel. */
  slot?: TiffinSlot;
  /** Special instructions carried from cart/checkout into the placed order. */
  instructions?: string;
  /** Menu items the vendor has marked sold out. */
  soldOutItemIds: string[];
  /** Delivery partner availability (delivery app). */
  courierOnline: boolean;
  /** Respects a reduced-motion preference for entrance animations. */
  reduceMotion: boolean;
  /** Reel ids the customer liked / saved — persisted so the feed remembers them. */
  likedReels: string[];
  savedReels: string[];
  /** Customer-written reel comments, keyed by reel id. */
  reelComments: Record<string, ReelComment[]>;
  /** Which kitchen the vendor app is signed in as. */
  vendorRestaurantId: string;
  /** Dishes the kitchen added on top of the catalogue. */
  customItems: MenuItem[];
  /** Price edits made by the kitchen, keyed by item id. */
  priceOverrides: Record<string, number>;
  /** Catalogue dishes this kitchen has taken off the menu. */
  removedItemIds: string[];
  /** Breakdowns a delivery partner has reported. */
  breakdowns: DeliveryBreakdown[];
  /** Partner progress per order. */
  courierSteps: Record<string, CourierStep>;
};


const COURIERS: Courier[] = [
  { name: 'Ravi Solanki', phone: '9900112233', rating: 4.9, vehicle: 'Bike', plate: 'GJ-03 KL 4471' },
  { name: 'Mehul Chauhan', phone: '9900445566', rating: 4.8, vehicle: 'Scooter', plate: 'GJ-03 MN 2210' },
  { name: 'Kiran Bhatt', phone: '9900778899', rating: 4.7, vehicle: 'Bike', plate: 'GJ-03 PQ 7788' },
];

/**
 * Demo history for the seeded kitchen (r1, Shree Krishna Tiffin).
 *
 * The vendor app is a real vendor's view of real orders, so it needs orders to
 * show. These are ordinary orders in the same shape `placeOrder` produces — one
 * still on the road, one delivered, one cancelled — so every vendor screen and
 * every customer order state is demonstrable on first launch. A fresh install
 * still starts from empty for anything the customer creates themselves.
 */
const hoursAgo = (h: number) => Date.now() - h * 60 * 60 * 1000;

const SEED_ORDERS: Order[] = [
  {
    id: 'VB-4821',
    createdAt: hoursAgo(1.2),
    status: 'out_for_delivery',
    timeline: {
      placed: hoursAgo(1.2),
      confirmed: hoursAgo(1.15),
      preparing: hoursAgo(1.0),
      packed: hoursAgo(0.6),
      picked_up: hoursAgo(0.45),
      out_for_delivery: hoursAgo(0.4),
    },
    restaurantId: 'r1',
    restaurantName: 'Shree Krishna Tiffin',
    restaurantNameGu: 'શ્રી કૃષ્ણ ટિફિન',
    lines: [
      { id: 'l1', name: 'Gujarati Thali', nameGu: 'ગુજરાતી થાળી', unitPrice: 140, quantity: 2 },
      { id: 'l2', name: 'Buttermilk', nameGu: 'છાશ', unitPrice: 25, quantity: 2 },
    ],
    bill: computeBill(330, undefined),
    paymentMethod: 'upi',
    address: SEED_ADDRESSES[0],
    courier: COURIERS[0],
    etaMins: 12,
    deliveryOtp: '4821',
    slot: 'evening',
  },
  {
    id: 'VB-4790',
    createdAt: hoursAgo(26),
    status: 'delivered',
    timeline: {
      placed: hoursAgo(26),
      confirmed: hoursAgo(25.9),
      preparing: hoursAgo(25.7),
      packed: hoursAgo(25.3),
      picked_up: hoursAgo(25.1),
      out_for_delivery: hoursAgo(25),
      delivered: hoursAgo(24.6),
    },
    restaurantId: 'r1',
    restaurantName: 'Shree Krishna Tiffin',
    restaurantNameGu: 'શ્રી કૃષ્ણ ટિફિન',
    lines: [{ id: 'l3', name: 'Mini Gujarati Thali', nameGu: 'મિની ગુજરાતી થાળી', unitPrice: 99, quantity: 1 }],
    bill: computeBill(99, 'FIRST50'),
    paymentMethod: 'cod',
    address: SEED_ADDRESSES[0],
    courier: COURIERS[1],
    etaMins: 25,
    deliveryOtp: '4790',
    instructions: 'Less spicy, please.',
  },
  {
    id: 'VB-4762',
    createdAt: hoursAgo(50),
    status: 'cancelled',
    timeline: { placed: hoursAgo(50), confirmed: hoursAgo(49.9), cancelled: hoursAgo(49.7) },
    restaurantId: 'r1',
    restaurantName: 'Shree Krishna Tiffin',
    restaurantNameGu: 'શ્રી કૃષ્ણ ટિફિન',
    lines: [{ id: 'l4', name: 'Undhiyu (seasonal)', nameGu: 'ઊંધિયું', unitPrice: 160, quantity: 1 }],
    bill: computeBill(160, undefined),
    paymentMethod: 'wallet',
    address: SEED_ADDRESSES[0],
    etaMins: 30,
    deliveryOtp: '4762',
  },
];

const initialState: PersistedState = {
  user: null,
  addresses: SEED_ADDRESSES,
  cart: [],
  couponCode: undefined,
  orders: SEED_ORDERS,
  subscriptions: [],
  walletBalance: 250,
  walletTxns: [
    {
      id: 'txn-welcome',
      kind: 'cashback',
      amount: 250,
      note: 'Welcome cashback',
      noteGu: 'સ્વાગત કેશબેક',
      createdAt: Date.now() - 1000 * 60 * 60 * 24 * 3,
    },
  ],
  reviews: [],
  tickets: [],
  chat: [],
  favourites: [],
  slot: undefined,
  instructions: undefined,
  soldOutItemIds: [],
  courierOnline: true,
  reduceMotion: false,
  likedReels: [],
  savedReels: [],
  reelComments: {},
  vendorRestaurantId: 'r1',
  customItems: [],
  priceOverrides: {},
  removedItemIds: [],
  breakdowns: [],
  courierSteps: {},
};


const newId = (prefix: string) => `${prefix}-${Math.random().toString(36).slice(2, 9)}`;

type AppStoreValue = {
  ready: boolean;

  // --- auth ---
  user: User | null;
  isAuthed: boolean;
  signIn: (phone: string, name?: string) => void;
  signOut: () => void;
  updateUser: (patch: Partial<User>) => void;

  // --- addresses ---
  addresses: Address[];
  selectedAddress: Address | undefined;
  addAddress: (address: Omit<Address, 'id'>) => Address;
  selectAddress: (id: string) => void;

  // --- cart ---
  cart: CartLine[];
  cartCount: number;
  itemTotal: number;
  bill: Bill;
  couponCode?: string;
  /** Adds a dish. `note` carries a customisation summary (customised thali, add-on bundle). */
  addItem: (item: MenuItem, quantity?: number, note?: { en: string; gu: string }) => void;
  addPlan: (plan: TiffinPlan) => void;
  setQuantity: (lineId: string, quantity: number) => void;
  removeLine: (lineId: string) => void;
  clearCart: () => void;
  applyCoupon: (code: string) => boolean;
  removeCoupon: () => void;

  // --- orders ---
  orders: Order[];
  activeOrders: Order[];
  pastOrders: Order[];
  placeOrder: (method: PaymentMethod) => Order;
  advanceOrder: (orderId: string) => void;
  cancelOrder: (orderId: string) => void;
  /** Re-adds a past order's lines to the cart. */
  reorder: (orderId: string) => void;

  // --- subscriptions ---
  subscriptions: Subscription[];
  activeSubscription: Subscription | undefined;
  /** Returns null when the wallet cannot cover the plan (the UI routes to top-up). */
  subscribeToPlan: (plan: TiffinPlan) => Subscription | null;
  setSubscriptionStatus: (id: string, status: Subscription['status']) => void;
  skipNextDelivery: (id: string) => void;

  // --- wallet ---
  walletBalance: number;
  walletTxns: WalletTxn[];
  addMoney: (amount: number) => void;

  // --- saved items / vendor ops / preferences ---
  favourites: string[];
  toggleFavourite: (restaurantId: string) => void;
  slot?: TiffinSlot;
  setSlot: (slot: TiffinSlot) => void;
  instructions?: string;
  setInstructions: (value: string) => void;
  soldOutItemIds: string[];
  toggleSoldOut: (itemId: string) => void;
  courierOnline: boolean;
  setCourierOnline: (online: boolean) => void;
  reduceMotion: boolean;
  setReduceMotion: (value: boolean) => void;

  // --- reels ---
  likedReels: string[];
  savedReels: string[];
  toggleReelLike: (reelId: string) => void;
  toggleReelSave: (reelId: string) => void;
  reelComments: Record<string, ReelComment[]>;
  /** Appends the customer's own comment to a reel and returns it. */
  addReelComment: (reelId: string, text: string) => ReelComment;

  // --- vendor ---
  vendorRestaurantId: string;
  setVendorRestaurant: (restaurantId: string) => void;
  /** The kitchen moves an order along its own fulfilment flow. */
  setOrderStatus: (orderId: string, status: OrderStatus) => void;
  /** Orders belonging to the signed-in kitchen, newest first. */
  vendorOrders: Order[];
  customItems: MenuItem[];
  /** Adds a dish to the kitchen's own menu and returns it. */
  addMenuItem: (input: { name: string; nameGu: string; price: number; category: string; description?: string }) => MenuItem;
  priceOverrides: Record<string, number>;
  setItemPrice: (itemId: string, price: number) => void;
  removedItemIds: string[];
  /** Takes a dish off the menu (custom dishes are deleted outright). */
  removeMenuItem: (itemId: string) => void;
  restoreMenuItem: (itemId: string) => void;
  /** Catalogue items + kitchen additions, with edits, sold-out and removal applied. */
  vendorMenu: MenuItem[];
  /** Every dish this kitchen has ever listed, menu or not — for "put it back". */
  allVendorItems: MenuItem[];

  // --- delivery partner ---
  /** Orders out for delivery, plus delivered ones for the ledger. */
  deliveryQueue: Order[];
  /** Claims an order for the signed-in partner. */
  acceptDelivery: (orderId: string) => void;
  breakdowns: DeliveryBreakdown[];
  /** Reports a breakdown and returns the logged entry. */
  reportBreakdown: (input: { orderId?: string; reason: string }) => DeliveryBreakdown;
  courierSteps: Record<string, CourierStep>;
  /** Advance the partner's own step; the order status follows it. */
  setCourierStep: (orderId: string, step: CourierStep) => void;
  /** Orders this partner has completed, newest first. */
  completedDeliveries: Order[];

  // --- support ---
  tickets: SupportTicket[];
  /** Creates a support ticket and returns its reference id. */
  submitTicket: (input: { topic: SupportTopic; message: string }) => SupportTicket;
  chat: ChatMessage[];
  /** Appends the customer's message and returns the agent's scripted reply. */
  sendChatMessage: (text: string) => ChatMessage;

  // --- reviews ---
  reviews: Review[];
  submitReview: (input: {
    orderId: string;
    restaurantId?: string;
    restaurantName: string;
    restaurantNameGu: string;
    rating: number;
    foodRating: number;
    deliveryRating: number;
    text: string;
    image?: number;
  }) => void;
};

const AppStoreContext = createContext<AppStoreValue | null>(null);

export function AppStoreProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<PersistedState>(initialState);
  const [ready, setReady] = useState(false);
  const hydrated = useRef(false);

  // --- hydrate ------------------------------------------------------------
  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (!raw) return;
        const parsed = JSON.parse(raw) as Partial<PersistedState>;
        setState((prev) => ({ ...prev, ...parsed }));
      })
      .catch(() => undefined)
      .finally(() => {
        hydrated.current = true;
        setReady(true);
      });
  }, []);

  // --- persist ------------------------------------------------------------
  useEffect(() => {
    if (!hydrated.current) return;
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state)).catch(() => undefined);
  }, [state]);

  // ---------------------------------------------------------------- helpers
  // ------------------------------------------------------------- vendor views
  /** Orders for the signed-in kitchen, newest first. */
  const vendorOrders = useMemo(
    () => state.orders.filter((order) => order.restaurantId === state.vendorRestaurantId).sort((a, b) => b.createdAt - a.createdAt),
    [state.orders, state.vendorRestaurantId],
  );

  /** Catalogue dishes for this kitchen + its own additions, with edits applied. */
  const allVendorItems = useMemo(() => {
    const own = SEED_MENU.filter((item) => item.restaurantId === state.vendorRestaurantId);
    const extra = state.customItems.filter((item) => item.restaurantId === state.vendorRestaurantId);
    return [...own, ...extra].map((item) => ({
      ...item,
      price: state.priceOverrides[item.id] ?? item.price,
      available: !state.soldOutItemIds.includes(item.id),
    }));
  }, [state.vendorRestaurantId, state.customItems, state.priceOverrides, state.soldOutItemIds]);

  const vendorMenu = useMemo(
    () => allVendorItems.filter((item) => !state.removedItemIds.includes(item.id)),
    [allVendorItems, state.removedItemIds],
  );

  /** Deliveries this partner has finished — the earnings ledger. */
  const completedDeliveries = useMemo(
    () => state.orders.filter((order) => order.status === 'delivered').sort((a, b) => b.createdAt - a.createdAt),
    [state.orders],
  );

  /** Deliveries a partner can take or track: everything already on the road. */
  const deliveryQueue = useMemo(
    () =>
      state.orders
        .filter((order) => order.status === 'packed' || order.status === 'picked_up' || order.status === 'out_for_delivery' || order.status === 'delivered')
        .sort((a, b) => b.createdAt - a.createdAt),
    [state.orders],
  );

  const patch = useCallback((updater: (prev: PersistedState) => PersistedState) => {
    setState((prev) => updater(prev));
  }, []);

  const pushTxn = (prev: PersistedState, txn: Omit<WalletTxn, 'id' | 'createdAt'>): PersistedState => {
    const full: WalletTxn = { ...txn, id: newId('txn'), createdAt: Date.now() };
    const delta = txn.kind === 'debit' ? -txn.amount : txn.amount;
    return { ...prev, walletTxns: [full, ...prev.walletTxns], walletBalance: Math.max(0, prev.walletBalance + delta) };
  };

  // ------------------------------------------------------------------- auth
  const signIn = useCallback(
    (phone: string, name = 'Jay Patel') => {
      patch((prev) => ({
        ...prev,
        user: {
          id: prev.user?.id ?? newId('user'),
          name,
          phone,
          role: 'customer',
          memberSince: prev.user?.memberSince ?? new Date().toISOString(),
          savedTotal: prev.user?.savedTotal ?? 0,
        },
      }));
    },
    [patch],
  );

  const signOut = useCallback(() => patch((prev) => ({ ...prev, user: null })), [patch]);

  const updateUser = useCallback(
    (userPatch: Partial<User>) =>
      patch((prev) => (prev.user ? { ...prev, user: { ...prev.user, ...userPatch } } : prev)),
    [patch],
  );

  // -------------------------------------------------------------- addresses
  const addAddress = useCallback(
    (address: Omit<Address, 'id'>) => {
      const full: Address = { ...address, id: newId('addr') };
      // A newly added address becomes the default so checkout picks it up
      // without the customer having to select it again.
      patch((prev) => ({
        ...prev,
        addresses: [...prev.addresses.map((a) => ({ ...a, isDefault: false })), { ...full, isDefault: true }],
      }));
      return full;
    },
    [patch],
  );

  const selectAddress = useCallback(
    (id: string) =>
      patch((prev) => ({
        ...prev,
        addresses: prev.addresses.map((a) => ({ ...a, isDefault: a.id === id })),
      })),
    [patch],
  );

  // ------------------------------------------------------------------- cart
  const addItem = useCallback(
    (item: MenuItem, quantity = 1, note?: { en: string; gu: string }) =>
      patch((prev) => {
        // Lines merge only when they are the same dish *and* the same customisation.
        const existing = prev.cart.find(
          (l) => l.kind === 'item' && l.refId === item.id && (l.note ?? undefined) === note?.en,
        );
        if (existing) {
          return {
            ...prev,
            cart: prev.cart.map((l) =>
              l.id === existing.id ? { ...l, quantity: l.quantity + quantity } : l,
            ),
          };
        }
        return {
          ...prev,
          cart: [
            ...prev.cart,
            {
              id: newId('line'),
              kind: 'item',
              refId: item.id,
              name: item.name,
              nameGu: item.nameGu,
              unitPrice: item.price,
              mrp: item.mrp,
              quantity,
              image: item.image,
              restaurantId: item.restaurantId,
              ...(note ? { note: note.en, noteGu: note.gu } : null),
            },
          ],
        };
      }),
    [patch],
  );

  const addPlan = useCallback(
    (plan: TiffinPlan) =>
      patch((prev) => {
        const existing = prev.cart.find((l) => l.kind === 'plan' && l.refId === plan.id);
        if (existing) {
          return {
            ...prev,
            cart: prev.cart.map((l) =>
              l.id === existing.id ? { ...l, quantity: l.quantity + 1 } : l,
            ),
          };
        }
        return {
          ...prev,
          cart: [
            ...prev.cart,
            {
              id: newId('line'),
              kind: 'plan',
              refId: plan.id,
              name: plan.name,
              nameGu: plan.nameGu,
              unitPrice: plan.price,
              mrp: plan.mrp,
              quantity: 1,
            },
          ],
        };
      }),
    [patch],
  );

  const setQuantity = useCallback(
    (lineId: string, quantity: number) =>
      patch((prev) => ({
        ...prev,
        // Quantity 0 removes the line — one code path for both actions.
        cart: quantity <= 0 ? prev.cart.filter((l) => l.id !== lineId) : prev.cart.map((l) => (l.id === lineId ? { ...l, quantity } : l)),
      })),
    [patch],
  );

  const removeLine = useCallback(
    (lineId: string) => patch((prev) => ({ ...prev, cart: prev.cart.filter((l) => l.id !== lineId) })),
    [patch],
  );

  const clearCart = useCallback(() => patch((prev) => ({ ...prev, cart: [], couponCode: undefined })), [patch]);

  const applyCoupon = useCallback(
    (code: string) => {
      const total = state.cart.reduce((sum, l) => sum + l.unitPrice * l.quantity, 0);
      const bill = computeBill(total, code.toUpperCase());
      if (!bill.couponCode) return false;
      patch((prev) => ({ ...prev, couponCode: bill.couponCode }));
      return true;
    },
    [patch, state.cart],
  );

  const removeCoupon = useCallback(() => patch((prev) => ({ ...prev, couponCode: undefined })), [patch]);

  // ----------------------------------------------------------------- orders
  const itemTotal = useMemo(
    () => state.cart.reduce((sum, line) => sum + line.unitPrice * line.quantity, 0),
    [state.cart],
  );
  const bill = useMemo(() => computeBill(itemTotal, state.couponCode), [itemTotal, state.couponCode]);

  const placeOrder = useCallback(
    (method: PaymentMethod) => {
      const now = Date.now();
      const address = state.addresses.find((a) => a.isDefault) ?? state.addresses[0];
      const restaurantId = state.cart.find((l) => l.kind === 'item')?.restaurantId;
      const order: Order = {
        id: String(1000 + Math.floor(Math.random() * 8999)),
        createdAt: now,
        status: 'placed',
        timeline: { placed: now },
        restaurantId,
        restaurantName: 'Shree Krishna Tiffin',
        restaurantNameGu: 'શ્રી કૃષ્ણ ટિફિન',
        lines: state.cart.map((l) => ({
          id: l.id,
          name: l.name,
          nameGu: l.nameGu,
          unitPrice: l.unitPrice,
          quantity: l.quantity,
          image: l.image,
          ...(l.note ? { note: l.note, noteGu: l.noteGu } : null),
        })),
        bill,
        paymentMethod: method,
        address,
        courier: method === 'cod' ? COURIERS[0] : COURIERS[Math.floor(Math.random() * COURIERS.length)],
        etaMins: 28,
        deliveryOtp: String(1000 + Math.floor(Math.random() * 8999)),
        ...(state.instructions ? { instructions: state.instructions } : null),
        ...(state.slot ? { slot: state.slot } : null),
      };

      patch((prev) => {
        let next: PersistedState = {
          ...prev,
          orders: [order, ...prev.orders],
          cart: [],
          couponCode: undefined,
          user: prev.user ? { ...prev.user, savedTotal: prev.user.savedTotal + order.bill.discount } : prev.user,
        };
        if (method === 'wallet') {
          next = pushTxn(next, {
            kind: 'debit',
            amount: order.bill.total,
            note: `Paid for order #${order.id}`,
            noteGu: `ઓર્ડર #${order.id} ની ચુકવણી`,
            orderId: order.id,
          });
        }
        if (method === 'upi' || method === 'card') {
          next = pushTxn(next, {
            kind: 'cashback',
            amount: Math.round(order.bill.total * 0.02),
            note: `2% cashback on order #${order.id}`,
            noteGu: `ઓર્ડર #${order.id} પર 2% કેશબેક`,
            orderId: order.id,
          });
        }
        return next;
      });

      return order;
    },
    [bill, patch, state.addresses, state.cart, state.instructions, state.slot],
  );

  const advanceOrder = useCallback(
    (orderId: string) =>
      patch((prev) => ({
        ...prev,
        orders: prev.orders.map((order) => {
          if (order.id !== orderId || order.status === 'delivered' || order.status === 'cancelled') return order;
          const flow: OrderStatus[] = ['placed', 'confirmed', 'preparing', 'packed', 'picked_up', 'out_for_delivery', 'delivered'];
          const index = flow.indexOf(order.status);
          const nextStatus = flow[Math.min(index + 1, flow.length - 1)];
          return {
            ...order,
            status: nextStatus,
            timeline: { ...order.timeline, [nextStatus]: Date.now() },
            etaMins: Math.max(0, order.etaMins - 4),
          };
        }),
      })),
    [patch],
  );

  const cancelOrder = useCallback(
    (orderId: string) =>
      patch((prev) => {
        const order = prev.orders.find((o) => o.id === orderId);
        if (!order) return prev;
        const next: PersistedState = {
          ...prev,
          orders: prev.orders.map((o) =>
            o.id === orderId ? { ...o, status: 'cancelled' as OrderStatus, timeline: { ...o.timeline, cancelled: Date.now() } } : o,
          ),
        };
        // Refund to wallet — matches what Support tells the customer.
        return pushTxn(next, {
          kind: 'refund',
          amount: order.bill.total,
          note: `Refund for order #${order.id}`,
          noteGu: `ઓર્ડર #${order.id} નું રિફંડ`,
          orderId: order.id,
        });
      }),
    [patch],
  );

  /** Re-adds a past order's lines to the cart (the "Order again" action). */
  const reorder = useCallback(
    (orderId: string) => {
      const order = state.orders.find((o) => o.id === orderId);
      if (!order) return;
      patch((prev) => {
        const nextLines = order.lines.map((line) => {
          const existing = prev.cart.find((l) => l.kind === 'item' && l.name === line.name);
          return existing
            ? { ...existing, quantity: existing.quantity + line.quantity }
            : {
                id: newId('line'),
                kind: 'item' as const,
                refId: line.id,
                name: line.name,
                nameGu: line.nameGu,
                unitPrice: line.unitPrice,
                quantity: line.quantity,
                image: line.image,
                restaurantId: order.restaurantId,
                ...(line.note ? { note: line.note, noteGu: line.noteGu } : null),
              };
        });
        // Merge any duplicated lines so the cart never shows the same dish twice.
        const merged = nextLines.reduce<typeof prev.cart>((acc, line) => {
          const dup = acc.find((l) => l.name === line.name && l.unitPrice === line.unitPrice);
          if (dup) return acc;
          const quantity = nextLines
            .filter((l) => l.name === line.name && l.unitPrice === line.unitPrice)
            .reduce((sum, l) => sum + l.quantity, 0);
          return [...acc, { ...line, quantity }];
        }, []);
        return { ...prev, cart: [...prev.cart, ...merged.filter((m) => !prev.cart.some((c) => c.name === m.name))] };
      });
    },
    [patch, state.orders],
  );

  // ---------------------------------------------------------- subscriptions
  const subscribeToPlan = useCallback(
    (plan: TiffinPlan) => {
      // pushTxn clamps the balance at zero, so an unaffordable plan would silently
      // eat the shortfall. Refuse instead and let the caller send them to top up.
      if (state.walletBalance < plan.price) return null;
      const now = Date.now();
      // Plan length in days — the four cadences map to 3 / 7 / 15 / 30 days.
      const days = plan.cadence === 'trial' ? 3 : plan.cadence === 'weekly' ? 7 : plan.cadence === 'fortnight' ? 15 : 30;
      const subscription: Subscription = {
        id: newId('sub'),
        planId: plan.id,
        planName: plan.name,
        planNameGu: plan.nameGu,
        status: 'active',
        startedAt: now,
        renewsAt: now + days * 86400000,
        mealsTotal: plan.meals,
        mealsUsed: 0,
        nextDeliveryAt: now + 86400000,
      };
      patch((prev) => {
        let next: PersistedState = { ...prev, subscriptions: [subscription, ...prev.subscriptions] };
        next = pushTxn(next, {
          kind: 'debit',
          amount: plan.price,
          note: `Subscribed to ${plan.name}`,
          noteGu: `${plan.nameGu} સબસ્ક્રાઇબ કર્યું`,
        });
        return next;
      });
      return subscription;
    },
    [patch, state.walletBalance],
  );

  const setSubscriptionStatus = useCallback(
    (id: string, status: Subscription['status']) =>
      patch((prev) => ({
        ...prev,
        subscriptions: prev.subscriptions.map((s) => (s.id === id ? { ...s, status } : s)),
      })),
    [patch],
  );

  const skipNextDelivery = useCallback(
    (id: string) =>
      patch((prev) => ({
        ...prev,
        subscriptions: prev.subscriptions.map((s) =>
          s.id === id ? { ...s, nextDeliveryAt: s.nextDeliveryAt + 86400000 } : s,
        ),
      })),
    [patch],
  );

  // ----------------------------------------------------------------- wallet
  const addMoney = useCallback(
    (amount: number) =>
      patch((prev) =>
        pushTxn(prev, { kind: 'credit', amount, note: 'Added to wallet', noteGu: 'વોલેટમાં ઉમેર્યું' }),
      ),
    [patch],
  );

  // ---------------------------------------------------------------- reviews
  const toggleFavourite = useCallback(
    (restaurantId: string) =>
      patch((prev) => ({
        ...prev,
        favourites: prev.favourites.includes(restaurantId)
          ? prev.favourites.filter((id) => id !== restaurantId)
          : [...prev.favourites, restaurantId],
      })),
    [patch],
  );

  const setSlot = useCallback((slot: TiffinSlot) => patch((prev) => ({ ...prev, slot })), [patch]);

  const setInstructions = useCallback(
    (value: string) => patch((prev) => ({ ...prev, instructions: value.trim() ? value.trim() : undefined })),
    [patch],
  );

  /** Vendor menu management: take a dish off the menu (and put it back). */
  const toggleSoldOut = useCallback(
    (itemId: string) =>
      patch((prev) => ({
        ...prev,
        soldOutItemIds: prev.soldOutItemIds.includes(itemId)
          ? prev.soldOutItemIds.filter((id) => id !== itemId)
          : [...prev.soldOutItemIds, itemId],
      })),
    [patch],
  );

  const setCourierOnline = useCallback(
    (online: boolean) => patch((prev) => ({ ...prev, courierOnline: online })),
    [patch],
  );

  const setReduceMotion = useCallback(
    (value: boolean) => patch((prev) => ({ ...prev, reduceMotion: value })),
    [patch],
  );

  // -------------------------------------------------------------------- reels
  const toggleReelLike = useCallback(
    (reelId: string) =>
      patch((prev) => ({
        ...prev,
        likedReels: prev.likedReels.includes(reelId)
          ? prev.likedReels.filter((id) => id !== reelId)
          : [...prev.likedReels, reelId],
      })),
    [patch],
  );

  const toggleReelSave = useCallback(
    (reelId: string) =>
      patch((prev) => ({
        ...prev,
        savedReels: prev.savedReels.includes(reelId)
          ? prev.savedReels.filter((id) => id !== reelId)
          : [...prev.savedReels, reelId],
      })),
    [patch],
  );

  // ------------------------------------------------------------------- vendor
  const setVendorRestaurant = useCallback(
    (restaurantId: string) => patch((prev) => ({ ...prev, vendorRestaurantId: restaurantId })),
    [patch],
  );

  const setOrderStatus = useCallback(
    (orderId: string, status: OrderStatus) =>
      patch((prev) => ({
        ...prev,
        orders: prev.orders.map((order) =>
          order.id === orderId
            ? { ...order, status, timeline: { ...order.timeline, [status]: order.timeline[status] ?? Date.now() } }
            : order,
        ),
      })),
    [patch],
  );

  const addMenuItem = useCallback(
    (input: { name: string; nameGu: string; price: number; category: string; description?: string }) => {
      const restaurantId = state.vendorRestaurantId;
      const item: MenuItem = {
        id: newId('vi'),
        restaurantId,
        name: input.name,
        nameGu: input.nameGu,
        description: input.description ?? '',
        descriptionGu: input.description ?? '',
        price: input.price,
        diet: ['veg'],
        category: input.category,
        available: true,
      };
      patch((prev) => ({ ...prev, customItems: [item, ...prev.customItems] }));
      return item;
    },
    [patch, state.vendorRestaurantId],
  );

  const setItemPrice = useCallback(
    (itemId: string, price: number) =>
      patch((prev) => ({ ...prev, priceOverrides: { ...prev.priceOverrides, [itemId]: price } })),
    [patch],
  );

  const removeMenuItem = useCallback(
    (itemId: string) =>
      patch((prev) => ({
        ...prev,
        customItems: prev.customItems.filter((item) => item.id !== itemId),
        removedItemIds: prev.customItems.some((item) => item.id === itemId)
          ? prev.removedItemIds
          : [...prev.removedItemIds, itemId],
      })),
    [patch],
  );

  const restoreMenuItem = useCallback(
    (itemId: string) => patch((prev) => ({ ...prev, removedItemIds: prev.removedItemIds.filter((id) => id !== itemId) })),
    [patch],
  );

  const acceptDelivery = useCallback(
    (orderId: string) =>
      patch((prev) => ({
        ...prev,
        orders: prev.orders.map((order) =>
          order.id === orderId
            ? {
                ...order,
                courier: order.courier ?? COURIERS[Math.floor(Math.random() * COURIERS.length)],
                status: order.status === 'placed' || order.status === 'confirmed' ? 'packed' : order.status,
              }
            : order,
        ),
      })),
    [patch],
  );

  /** The order status each partner step implies, so both apps agree. */
  const STEP_STATUS: Record<CourierStep, OrderStatus | null> = {
    assigned: 'packed',
    reachedVendor: null,
    received: 'picked_up',
    reachedCustomer: 'out_for_delivery',
    delivered: 'delivered',
  };

  const setCourierStep = useCallback(
    (orderId: string, step: CourierStep) =>
      patch((prev) => {
        const nextStatus = STEP_STATUS[step];
        return {
          ...prev,
          courierSteps: { ...prev.courierSteps, [orderId]: step },
          orders: nextStatus
            ? prev.orders.map((order) =>
                order.id === orderId
                  ? { ...order, status: nextStatus, timeline: { ...order.timeline, [nextStatus]: order.timeline[nextStatus] ?? Date.now() } }
                  : order,
              )
            : prev.orders,
        };
      }),
    [patch],
  );

  const reportBreakdown = useCallback(
    (input: { orderId?: string; reason: string }) => {
      const entry: DeliveryBreakdown = {
        id: newId('bd'),
        orderId: input.orderId,
        reason: input.reason.trim(),
        at: Date.now(),
      };
      patch((prev) => ({ ...prev, breakdowns: [entry, ...prev.breakdowns] }));
      return entry;
    },
    [patch],
  );

  const addReelComment = useCallback(
    (reelId: string, text: string) => {
      const comment: ReelComment = {
        id: newId('rc'),
        author: state.user?.name ?? 'You',
        text: text.trim(),
        at: Date.now(),
        mine: true,
      };
      patch((prev) => ({
        ...prev,
        reelComments: { ...prev.reelComments, [reelId]: [...(prev.reelComments[reelId] ?? []), comment] },
      }));
      return comment;
    },
    [patch, state.user?.name],
  );

  const submitTicket = useCallback(
    (input: { topic: SupportTopic; message: string }) => {
      const now = Date.now();
      // Deterministic reference so a customer can quote something support can trace.
      const ticket: SupportTicket = {
        id: `VB-${String(now).slice(-6)}`,
        topic: input.topic,
        message: input.message,
        createdAt: now,
        status: 'open',
      };
      patch((prev) => ({ ...prev, tickets: [ticket, ...prev.tickets] }));
      return ticket;
    },
    [patch],
  );

  /**
   * Support chat.
   *
   * Replies are scripted locally from the customer's real state — there is no
   * backend and no third-party model call, so the screen cannot claim a human
   * answered. Keeping the reply deterministic also makes it testable.
   */
  const sendChatMessage = useCallback(
    (text: string) => {
      const now = Date.now();
      const mine: ChatMessage = { id: newId('msg'), from: 'me', text, at: now };
      const newestOrder = state.orders[0];
      const activeSub = state.subscriptions.find((sub) => sub.status === 'active');
      const reply: ChatMessage = {
        id: newId('msg'),
        from: 'agent',
        text: newestOrder
          ? `Thanks — I can see order #${newestOrder.id}. It is currently "${newestOrder.status.replace(/_/g, ' ')}". I have flagged this for the kitchen team.`
          : activeSub
            ? `Thanks — I can see your ${activeSub.planName} plan. I have noted this and our tiffin team will follow up.`
            : 'Thanks for writing in. Our support team will get back to you here shortly.',
        at: now + 1,
      };
      patch((prev) => ({ ...prev, chat: [...prev.chat, mine, reply] }));
      return reply;
    },
    [patch, state.orders, state.subscriptions],
  );

  const submitReview = useCallback(
    (input: {
      orderId: string;
      restaurantId?: string;
      restaurantName: string;
      restaurantNameGu: string;
      rating: number;
      foodRating: number;
      deliveryRating: number;
      text: string;
      image?: number;
    }) =>
      patch((prev) => ({
        ...prev,
        reviews: [{ ...input, id: newId('review'), createdAt: Date.now() }, ...prev.reviews],
        orders: prev.orders.map((o) => (o.id === input.orderId ? { ...o, reviewed: true } : o)),
      })),
    [patch],
  );

  // ------------------------------------------------------------------ value
  const value = useMemo<AppStoreValue>(() => {
    const activeOrders = state.orders.filter((o) => o.status !== 'delivered' && o.status !== 'cancelled');
    const pastOrders = state.orders.filter((o) => o.status === 'delivered' || o.status === 'cancelled');
    return {
      ready,
      user: state.user,
      isAuthed: Boolean(state.user),
      signIn,
      signOut,
      updateUser,

      addresses: state.addresses,
      selectedAddress: state.addresses.find((a) => a.isDefault) ?? state.addresses[0],
      addAddress,
      selectAddress,

      cart: state.cart,
      cartCount: state.cart.reduce((sum, l) => sum + l.quantity, 0),
      itemTotal,
      bill,
      couponCode: state.couponCode,
      addItem,
      addPlan,
      setQuantity,
      removeLine,
      clearCart,
      applyCoupon,
      removeCoupon,

      orders: state.orders,
      activeOrders,
      pastOrders,
      placeOrder,
      advanceOrder,
      cancelOrder,
      reorder,

      subscriptions: state.subscriptions,
      activeSubscription: state.subscriptions.find((s) => s.status === 'active'),
      subscribeToPlan,
      setSubscriptionStatus,
      skipNextDelivery,

      walletBalance: state.walletBalance,
      walletTxns: state.walletTxns,
      addMoney,

      reviews: state.reviews,
      submitReview,

      favourites: state.favourites,
      toggleFavourite,
      slot: state.slot,
      setSlot,
      instructions: state.instructions,
      setInstructions,
      soldOutItemIds: state.soldOutItemIds,
      toggleSoldOut,
      courierOnline: state.courierOnline,
      setCourierOnline,
      reduceMotion: state.reduceMotion,
      setReduceMotion,

      likedReels: state.likedReels,
      savedReels: state.savedReels,
      toggleReelLike,
      toggleReelSave,
      reelComments: state.reelComments,
      addReelComment,

      vendorRestaurantId: state.vendorRestaurantId,
      setVendorRestaurant,
      setOrderStatus,
      vendorOrders,
      customItems: state.customItems,
      addMenuItem,
      priceOverrides: state.priceOverrides,
      setItemPrice,
      removedItemIds: state.removedItemIds,
      removeMenuItem,
      restoreMenuItem,
      vendorMenu,
      allVendorItems,

      deliveryQueue,
      acceptDelivery,
      breakdowns: state.breakdowns,
      reportBreakdown,
      courierSteps: state.courierSteps,
      setCourierStep,
      completedDeliveries,

      tickets: state.tickets,
      submitTicket,
      chat: state.chat,
      sendChatMessage,
    };
  }, [
    ready, state, itemTotal, bill, signIn, signOut, updateUser, addAddress, selectAddress,
    addItem, addPlan, setQuantity, removeLine, clearCart, applyCoupon, removeCoupon,
    placeOrder, advanceOrder, cancelOrder, reorder, subscribeToPlan, setSubscriptionStatus,
    skipNextDelivery, addMoney, submitReview, submitTicket, sendChatMessage,
    toggleReelLike, toggleReelSave, addReelComment, toggleFavourite, setSlot, setInstructions,
    setVendorRestaurant, setOrderStatus, addMenuItem, setItemPrice, vendorOrders, vendorMenu,
    removeMenuItem, restoreMenuItem, allVendorItems, acceptDelivery, reportBreakdown, deliveryQueue,
    setCourierStep, completedDeliveries,
    toggleSoldOut, setCourierOnline, setReduceMotion,
  ]);

  return <AppStoreContext.Provider value={value}>{children}</AppStoreContext.Provider>;
}

export function useAppStore(): AppStoreValue {
  const ctx = useContext(AppStoreContext);
  if (!ctx) throw new Error('useAppStore must be used inside <AppStoreProvider>');
  return ctx;
}

/** Cart badge helper so the tab bar can subscribe to just the count. */
export function useCartCount(): number {
  return useAppStore().cartCount;
}
