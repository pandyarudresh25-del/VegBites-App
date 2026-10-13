/**
 * Seed catalogue for the demo build.
 *
 * Everything the Customer app renders comes from here through `AppStore`, so
 * swapping this file for real API calls later needs no screen changes. Names
 * carry both English and Gujarati so the UI never has to fall back to English
 * for Gujarati users.
 *
 * Money is in whole rupees.
 */
import type { Address, Reel, Restaurant, TiffinPlan } from '../domain/types';

export const IMAGES = {
  gujaratiThali: require('../../assets/images/gujarati_thali.jpg'),
  punjabiThali: require('../../assets/images/punjabi_thali.jpg'),
  southIndian: require('../../assets/images/south_indian.jpg'),
  jainFood: require('../../assets/images/jain_food.jpg'),
} as const;

export const SEED_ADDRESSES: Address[] = [
  {
    id: 'addr-home',
    label: 'home',
    name: 'Jay Patel',
    phone: '9876543210',
    line1: 'B-402, Shivam Apartment',
    line2: 'Kalawad Road, Near Nana Mava Circle',
    city: 'Rajkot',
    pincode: '360005',
    isDefault: true,
  },
  {
    id: 'addr-work',
    label: 'work',
    name: 'Jay Patel',
    phone: '9876543210',
    line1: '2nd Floor, Ravi Tower',
    line2: 'Gondal Road, Opp. Big Bazaar',
    city: 'Rajkot',
    pincode: '360004',
  },
];

export const SEED_RESTAURANTS: Restaurant[] = [
  {
    id: 'r1',
    name: 'Shree Krishna Tiffin',
    nameGu: 'શ્રી કૃષ્ણ ટિફિન',
    cuisines: ['gujarathi', 'kathiyawadi'],
    rating: 4.8,
    ratingCount: 1280,
    deliveryMins: 22,
    distanceKm: 1.8,
    minOrder: 99,
    costForTwo: 240,
    pureVeg: true,
    isOpen: true,
    image: IMAGES.gujaratiThali,
    offerText: '20% off on first order',
    heroItemIds: ['r1i1', 'r1i2'],
  },
  {
    id: 'r2',
    name: 'Maa ni Rasoi',
    nameGu: 'મા ની રસોઈ',
    cuisines: ['gujarathi', 'jain'],
    rating: 4.7,
    ratingCount: 864,
    deliveryMins: 31,
    distanceKm: 3.4,
    minOrder: 149,
    costForTwo: 300,
    pureVeg: true,
    isOpen: true,
    image: IMAGES.jainFood,
    offerText: 'Free buttermilk',
    heroItemIds: ['r2i1', 'r2i2'],
  },
  {
    id: 'r3',
    name: 'Anna\'s South Indian',
    nameGu: 'અન્ના સાઉથ ઇન્ડિયન',
    cuisines: ['southIndian'],
    rating: 4.6,
    ratingCount: 2110,
    deliveryMins: 18,
    distanceKm: 1.2,
    minOrder: 79,
    costForTwo: 200,
    pureVeg: true,
    isOpen: true,
    image: IMAGES.southIndian,
    heroItemIds: ['r3i1', 'r3i2'],
  },
  {
    id: 'r4',
    name: 'Punjabi Haveli',
    nameGu: 'પંજાબી હવેલી',
    cuisines: ['punjabi'],
    rating: 4.4,
    ratingCount: 640,
    deliveryMins: 38,
    distanceKm: 4.6,
    minOrder: 199,
    costForTwo: 380,
    pureVeg: true,
    isOpen: true,
    image: IMAGES.punjabiThali,
    heroItemIds: ['r4i1'],
  },
  {
    id: 'r5',
    name: 'Kathiyawadi Dhaba',
    nameGu: 'કાઠિયાવાડી ધાબા',
    cuisines: ['kathiyawadi', 'gujarathi'],
    rating: 4.5,
    ratingCount: 402,
    deliveryMins: 42,
    distanceKm: 5.8,
    minOrder: 129,
    costForTwo: 260,
    pureVeg: true,
    isOpen: false,
    image: IMAGES.gujaratiThali,
    heroItemIds: [],
  },
];

export const SEED_MENU: import('../domain/types').MenuItem[] = [
  // Shree Krishna Tiffin
  { id: 'r1i1', restaurantId: 'r1', name: 'Gujarati Thali', nameGu: 'ગુજરાતી થાળી', description: 'Rotli, 2 sabji, dal, rice, kadhi, salad, farsan', descriptionGu: 'રોટલી, ૨ શાક, દાળ, ભાત, કઢી, સલાડ, ફરસાણ', price: 140, mrp: 170, image: IMAGES.gujaratiThali, diet: ['veg'], isBestseller: true, category: 'Thali', available: true },
  { id: 'r1i2', restaurantId: 'r1', name: 'Mini Gujarati Thali', nameGu: 'મિની ગુજરાતી થાળી', description: 'Rotli, 1 sabji, dal, rice, salad', descriptionGu: 'રોટલી, ૧ શાક, દાળ, ભાત, સલાડ', price: 99, image: IMAGES.gujaratiThali, diet: ['veg'], category: 'Thali', available: true },
  { id: 'r1i3', restaurantId: 'r1', name: 'Undhiyu (seasonal)', nameGu: 'ઊંધિયું', description: 'Slow-cooked winter special with muthiya', descriptionGu: 'મુઠિયા સાથે ધીમે રાંધેલું શિયાળુ વિશેષ', price: 160, image: IMAGES.gujaratiThali, diet: ['veg'], isSpicy: true, category: 'Specials', available: true },
  { id: 'r1i4', restaurantId: 'r1', name: 'Buttermilk', nameGu: 'છાશ', description: 'Chilled chaas with roasted cumin', descriptionGu: 'ભુકા જીરા સાથે ઠંડી છાશ', price: 25, image: IMAGES.southIndian, diet: ['veg'], category: 'Beverages', available: true },

  // Maa ni Rasoi
  { id: 'r2i1', restaurantId: 'r2', name: 'Jain Thali', nameGu: 'જૈન થાળી', description: 'No onion, no garlic, no root vegetables', descriptionGu: 'કાંદો, લસણ અને કંદમૂળ વગર', price: 150, image: IMAGES.jainFood, diet: ['veg', 'jain', 'noOnionGarlic'], isBestseller: true, category: 'Thali', available: true },
  { id: 'r2i2', restaurantId: 'r2', name: 'Dal Baati Churma', nameGu: 'દાળ બાટી ચૂરમા', description: 'Baked baati, panchmel dal, sweet churma', descriptionGu: 'બેક કરેલી બાટી, પંચમેળ દાળ, ગળ્યું ચૂરમા', price: 180, image: IMAGES.punjabiThali, diet: ['veg'], category: 'Specials', available: true },
  { id: 'r2i3', restaurantId: 'r2', name: 'Sabudana Khichdi', nameGu: 'સાબુદાણા ખીચડી', description: 'Light, festive and Jain-friendly', descriptionGu: 'હલકી, તહેવારોની અને જૈન માટે યોગ્ય', price: 90, image: IMAGES.jainFood, diet: ['veg', 'jain'], category: 'Snacks', available: true },

  // Anna's South Indian
  { id: 'r3i1', restaurantId: 'r3', name: 'Masala Dosa', nameGu: 'મસાલા ડોસા', description: 'Crisp dosa, potato masala, 3 chutneys', descriptionGu: 'કડક ડોસા, બટાકા મસાલા, ૩ ચટણી', price: 120, image: IMAGES.southIndian, diet: ['veg'], isBestseller: true, category: 'Dosa', available: true },
  { id: 'r3i2', restaurantId: 'r3', name: 'Idli Sambar (3 pcs)', nameGu: 'ઇડલી સાંભાર (૩ નંગ)', description: 'Steamed idli with piping hot sambar', descriptionGu: 'ગરમ સાંભાર સાથે વરાળમાં બાફેલી ઇડલી', price: 80, image: IMAGES.southIndian, diet: ['veg'], category: 'Idli', available: true },
  { id: 'r3i3', restaurantId: 'r3', name: 'Filter Coffee', nameGu: 'ફિલ્ટર કોફી', description: 'Traditional decoction, frothy', descriptionGu: 'પરંપરાગત ડેકોક્શન, ફીણવાળી', price: 45, image: IMAGES.southIndian, diet: ['veg'], category: 'Beverages', available: true },

  // Punjabi Haveli
  { id: 'r4i1', restaurantId: 'r4', name: 'Paneer Butter Masala', nameGu: 'પનીર બટર મસાલા', description: 'Creamy tomato gravy, soft paneer', descriptionGu: 'મલાઈદાર ટામેટા ગ્રેવી, નરમ પનીર', price: 220, image: IMAGES.punjabiThali, diet: ['veg'], isBestseller: true, category: 'Curries', available: true },
  { id: 'r4i2', restaurantId: 'r4', name: 'Butter Naan (2 pcs)', nameGu: 'બટર નાન (૨ નંગ)', description: 'Tandoor naan brushed with butter', descriptionGu: 'માખણ લગાવેલી તંદૂર નાન', price: 70, image: IMAGES.punjabiThali, diet: ['veg'], category: 'Breads', available: true },
];

export const SEED_PLANS: TiffinPlan[] = [
  {
    id: 'plan-trial',
    name: '3-Day Trial',
    nameGu: '૩ દિવસનું ટ્રાયલ',
    cadence: 'trial',
    price: 299,
    meals: 3,
    diet: ['veg'],
    includes: ['2 rotli, 1 sabji, dal, rice', 'Free delivery', 'Cancel anytime'],
    includesGu: ['૨ રોટલી, ૧ શાક, દાળ, ભાત', 'મફત ડિલિવરી', 'ક્યારેય રદ કરો'],
  },
  {
    id: 'plan-weekly',
    name: 'Weekly Plan',
    nameGu: 'સાપ્તાહિક પ્લાન',
    cadence: 'weekly',
    price: 699,
    mrp: 840,
    meals: 7,
    diet: ['veg'],
    includes: ['Rotating daily menu', 'Lunch or dinner slot', 'Pause up to 2 days'],
    includesGu: ['રોજ બદલાતું મેનૂ', 'લંચ કે ડિનર સ્લોટ', '૨ દિવસ થોભાવો'],
  },
  {
    id: 'plan-monthly',
    name: 'Monthly Plan',
    nameGu: 'માસિક પ્લાન',
    cadence: 'monthly',
    price: 2200,
    mrp: 2800,
    meals: 26,
    diet: ['veg'],
    includes: ['Full thali every day', 'Free delivery', 'Skip days when travelling', 'Priority support'],
    includesGu: ['રોજ પૂરી થાળી', 'મફત ડિલિવરી', 'મુસાફરીમાં દિવસ સ્કિપ કરો', 'પ્રાયોરિટી સપોર્ટ'],
    isPopular: true,
  },
  {
    id: 'plan-jain',
    name: 'Jain Monthly Plan',
    nameGu: 'જૈન માસિક પ્લાન',
    cadence: 'monthly',
    price: 2400,
    meals: 26,
    diet: ['veg', 'jain', 'noOnionGarlic'],
    includes: ['Strictly no onion-garlic', 'No root vegetables', 'Separate kitchen line'],
    includesGu: ['કાંદો-લસણ વગર', 'કંદમૂળ વગર', 'અલગ રસોઈ લાઇન'],
  },
];

export const SEED_REELS: Reel[] = [
  { id: 'reel1', kitchenName: 'Shree Krishna Tiffin', kitchenNameGu: 'શ્રી કૃષ્ણ ટિફિન', restaurantId: 'r1', caption: 'Today’s thali, straight off the flame', captionGu: 'આજની થાળી, સીધી ગેસ પરથી', image: IMAGES.gujaratiThali, likes: 1240, commentsCount: 38, views: 18400, itemId: 'r1i1' },
  { id: 'reel2', kitchenName: 'Maa ni Rasoi', kitchenNameGu: 'મા ની રસોઈ', restaurantId: 'r2', caption: 'Jain thali, zero onion-garlic', captionGu: 'જૈન થાળી, કાંદો-લસણ વગર', image: IMAGES.jainFood, likes: 890, commentsCount: 21, views: 11200, itemId: 'r2i1' },
  { id: 'reel3', kitchenName: 'Anna’s South Indian', kitchenNameGu: 'અન્ના સાઉથ ઇન્ડિયન', restaurantId: 'r3', caption: 'Dosa crisping in real time', captionGu: 'ડોસા કડક થાય છે, લાઇવ', image: IMAGES.southIndian, likes: 2310, commentsCount: 64, views: 32100, itemId: 'r3i1' },
  { id: 'reel4', kitchenName: 'Punjabi Haveli', kitchenNameGu: 'પંજાબી હવેલી', restaurantId: 'r4', caption: 'Butter naan, tandoor fresh', captionGu: 'બટર નાન, તંદૂરમાંથી તાજી', image: IMAGES.punjabiThali, likes: 640, commentsCount: 12, views: 8700, itemId: 'r4i2' },
];
