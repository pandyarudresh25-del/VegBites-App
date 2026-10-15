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
    id: 'plan-7',
    name: '7 Days Plan',
    nameGu: '૭ દિવસ પ્લાન',
    cadence: 'weekly',
    price: 699,
    meals: 7,
    diet: ['veg'],
    includes: ['1 full tiffin a day', 'Free delivery', 'Cancel anytime'],
    includesGu: ['દિવસમાં ૧ પૂરું ટિફિન', 'મફત ડિલિવરી', 'ક્યારેય રદ કરો'],
  },
  {
    id: 'plan-15',
    name: '15 Days Plan',
    nameGu: '૧૫ દિવસ પ્લાન',
    cadence: 'fortnight',
    price: 1499,
    mrp: 1650,
    meals: 15,
    diet: ['veg'],
    includes: ['1 full tiffin a day', 'Free delivery', '1 free add-on a week'],
    includesGu: ['દિવસમાં ૧ પૂરું ટિફિન', 'મફત ડિલિવરી', 'અઠવાડિયે ૧ મફત એડ-ઓન'],
  },
  {
    id: 'plan-30',
    name: 'Monthly Plan',
    nameGu: 'માસિક પ્લાન',
    cadence: 'monthly',
    price: 2799,
    mrp: 3300,
    meals: 30,
    diet: ['veg'],
    includes: ['1 full tiffin a day', 'Free delivery', '2 free add-ons a week'],
    includesGu: ['દિવસમાં ૧ પૂરું ટિફિન', 'મફત ડિલિવરી', 'અઠવાડિયે ૨ મફત એડ-ઓન'],
    isPopular: true,
  },
  {
    id: 'plan-jain-30',
    name: 'Jain Monthly Plan',
    nameGu: 'જૈન માસિક પ્લાન',
    cadence: 'monthly',
    price: 2999,
    meals: 30,
    diet: ['veg', 'jain', 'noOnionGarlic'],
    includes: ['No onion, no garlic, no root veg', 'Free delivery', 'Separate Jain kitchen'],
    includesGu: ['કાંદો, લસણ, કંદમૂળ વગર', 'મફત ડિલિવરી', 'અલગ જૈન રસોડું'],
  },
];

export const SEED_REELS: Reel[] = [
  { id: 'reel1', kitchenName: 'Shree Krishna Tiffin', kitchenNameGu: 'શ્રી કૃષ્ણ ટિફિન', restaurantId: 'r1', caption: 'Today’s thali, straight off the flame', captionGu: 'આજની થાળી, સીધી ગેસ પરથી', image: IMAGES.gujaratiThali, likes: 1240, commentsCount: 38, views: 18400, itemId: 'r1i1' },
  { id: 'reel2', kitchenName: 'Maa ni Rasoi', kitchenNameGu: 'મા ની રસોઈ', restaurantId: 'r2', caption: 'Jain thali, zero onion-garlic', captionGu: 'જૈન થાળી, કાંદો-લસણ વગર', image: IMAGES.jainFood, likes: 890, commentsCount: 21, views: 11200, itemId: 'r2i1' },
  { id: 'reel3', kitchenName: 'Anna’s South Indian', kitchenNameGu: 'અન્ના સાઉથ ઇન્ડિયન', restaurantId: 'r3', caption: 'Dosa crisping in real time', captionGu: 'ડોસા કડક થાય છે, લાઇવ', image: IMAGES.southIndian, likes: 2310, commentsCount: 64, views: 32100, itemId: 'r3i1' },
  { id: 'reel4', kitchenName: 'Punjabi Haveli', kitchenNameGu: 'પંજાબી હવેલી', restaurantId: 'r4', caption: 'Butter naan, tandoor fresh', captionGu: 'બટર નાન, તંદૂરમાંથી તાજી', image: IMAGES.punjabiThali, likes: 640, commentsCount: 12, views: 8700, itemId: 'r4i2' },
];

/**
 * Components of a build-your-own thali.
 *
 * `defaultCount` is what the vendor's base thali already includes — raising a count
 * above it adds `extraPrice` per extra portion to the cart line. This keeps the
 * builder honest: the total always matches what the customer pays.
 */
export type ThaliComponent = {
  id: string;
  name: string;
  nameGu: string;
  defaultCount: number;
  extraPrice: number;
};

export const THALI_COMPONENTS: ThaliComponent[] = [
  { id: 'rotli', name: 'Rotli', nameGu: 'રોટલી', defaultCount: 4, extraPrice: 8 },
  { id: 'sabji', name: 'Sabji', nameGu: 'શાક', defaultCount: 2, extraPrice: 30 },
  { id: 'dal', name: 'Dal', nameGu: 'દાળ', defaultCount: 1, extraPrice: 25 },
  { id: 'rice', name: 'Rice', nameGu: 'ભાત', defaultCount: 1, extraPrice: 30 },
  { id: 'kadhi', name: 'Kadhi', nameGu: 'કઢી', defaultCount: 1, extraPrice: 25 },
  { id: 'farsan', name: 'Farsan', nameGu: 'ફરસાણ', defaultCount: 1, extraPrice: 35 },
];

/**
 * Optional extras offered after building a thali. These are ordinary MenuItems so
 * they flow through the normal cart, checkout and order pipeline unchanged.
 */
export const SEED_ADDONS: import('../domain/types').MenuItem[] = [
  { id: 'a1', restaurantId: 'r1', name: 'Buttermilk', nameGu: 'છાશ', description: 'Chilled chaas with roasted cumin', descriptionGu: 'ભુકા જીરા સાથે ઠંડી છાશ', price: 25, image: IMAGES.southIndian, diet: ['veg'], category: 'Add-ons', available: true },
  { id: 'a2', restaurantId: 'r1', name: 'Green Salad', nameGu: 'ગ્રીન સલાડ', description: 'Cucumber, tomato, carrot, lemon', descriptionGu: 'કાકડી, ટામેટા, ગાજર, લીંબુ', price: 30, image: IMAGES.jainFood, diet: ['veg'], category: 'Add-ons', available: true },
  { id: 'a3', restaurantId: 'r1', name: 'Roasted Papad', nameGu: 'શેકેલું પાપડ', description: 'Crisp papad, roasted not fried', descriptionGu: 'કડક પાપડ, તળેલું નહીં, શેકેલું', price: 15, image: IMAGES.gujaratiThali, diet: ['veg'], category: 'Add-ons', available: true },
  { id: 'a4', restaurantId: 'r1', name: 'Shrikhand', nameGu: 'શ્રીખંડ', description: 'Saffron hung curd, chilled', descriptionGu: 'કેસરવાળું શ્રીખંડ, ઠંડું', price: 45, image: IMAGES.gujaratiThali, diet: ['veg'], category: 'Add-ons', available: true },
  { id: 'a5', restaurantId: 'r1', name: 'Extra Rotli (2 pcs)', nameGu: 'વધારાની રોટલી (૨ નંગ)', description: 'Two more phulka rotli', descriptionGu: 'બે વધારાની ફૂલકા રોટલી', price: 20, image: IMAGES.gujaratiThali, diet: ['veg'], category: 'Add-ons', available: true },
  { id: 'a6', restaurantId: 'r1', name: 'Mango Pickle', nameGu: 'આથાણું', description: 'Sun-cured Gujarati mango athanu', descriptionGu: 'તડકામાં સુકાયેલું ગુજરાતી આથાણું', price: 15, image: IMAGES.jainFood, diet: ['veg'], category: 'Add-ons', available: true },
  { id: 'a7', restaurantId: 'r1', name: 'Gulab Jamun (2 pcs)', nameGu: 'ગુલાબ જામુન (૨ નંગ)', description: 'Warm milk dumplings in syrup', descriptionGu: 'ગરમ દૂધના ગુલાબ જામુન, રસમાં', price: 40, image: IMAGES.punjabiThali, diet: ['veg'], category: 'Dessert', available: true },
  { id: 'a8', restaurantId: 'r1', name: 'Aam Ras', nameGu: 'આમ રસ', description: 'Seasonal sweet mango pulp', descriptionGu: 'મોસમી ગળો કેરી રસ', price: 50, image: IMAGES.punjabiThali, diet: ['veg'], category: 'Dessert', available: true },
];

/**
 * Tiffin component menu.
 *
 * The build spec fixes these categories: Full Tiffin, Rotli/Rotla, Sabji,
 * Dal/Rice, Kathol, Salad, Buttermilk and Add-ons. They are shared across the
 * tiffin kitchens (home-style kitchens cook the same menu), so `restaurantId`
 * is the shared 'tiffin' scope rather than a single vendor id.
 */
export const SEED_TIFFIN_MENU: import('../domain/types').MenuItem[] = [
  { id: 't1', restaurantId: 'tiffin', name: 'Full Tiffin', nameGu: 'પૂરું ટિફિન', description: '4 rotli, 2 sabji, dal, rice, kathol, salad, chaas', descriptionGu: '૪ રોટલી, ૨ શાક, દાળ, ભાત, કઠોળ, સલાડ, છાશ', price: 140, mrp: 170, image: IMAGES.gujaratiThali, diet: ['veg'], isBestseller: true, category: 'Full Tiffin', available: true },
  { id: 't2', restaurantId: 'tiffin', name: 'Mini Tiffin', nameGu: 'મિની ટિફિન', description: '2 rotli, 1 sabji, dal, rice, salad', descriptionGu: '૨ રોટલી, ૧ શાક, દાળ, ભાત, સલાડ', price: 99, image: IMAGES.gujaratiThali, diet: ['veg'], category: 'Full Tiffin', available: true },
  { id: 't3', restaurantId: 'tiffin', name: 'Rotli (2 pcs)', nameGu: 'રોટલી (૨ નંગ)', description: 'Soft phulka rotli, ghee brushed', descriptionGu: 'માખણ લગાવેલી નરમ ફૂલકા રોટલી', price: 20, image: IMAGES.gujaratiThali, diet: ['veg'], category: 'Rotli/Rotla', available: true },
  { id: 't4', restaurantId: 'tiffin', name: 'Bhakhri (2 pcs)', nameGu: 'ભાખરી (૨ નંગ)', description: 'Thick wheat bhakhri, stays warm', descriptionGu: 'જાડી ઘઉંની ભાખરી, ગરમ રહે છે', price: 30, image: IMAGES.gujaratiThali, diet: ['veg'], category: 'Rotli/Rotla', available: true },
  { id: 't5', restaurantId: 'tiffin', name: 'Sev Tameta nu Shaak', nameGu: 'સેવ ટામેટા નું શાક', description: 'Tangy tomato gravy with sev', descriptionGu: 'ખાટી ટામેટા ગ્રેવીમાં સેવ', price: 70, image: IMAGES.gujaratiThali, diet: ['veg'], isSpicy: true, category: 'Sabji', available: true },
  { id: 't6', restaurantId: 'tiffin', name: 'Ringan no Olo', nameGu: 'રીંગણ નો ઓળો', description: 'Smoked brinjal mash, Kathiyawadi style', descriptionGu: 'ધુમાડિયું રીંગણ, કાઠિયાવાડી શૈલી', price: 80, image: IMAGES.gujaratiThali, diet: ['veg'], category: 'Sabji', available: true },
  { id: 't7', restaurantId: 'tiffin', name: 'Dal (300 ml)', nameGu: 'દાળ (૩૦૦ મિ.લી.)', description: 'Gujarati sweet dal, tempered', descriptionGu: 'ગુજરાતી ગળી દાળ, વઘારેલી', price: 60, image: IMAGES.gujaratiThali, diet: ['veg'], category: 'Dal/Rice', available: true },
  { id: 't8', restaurantId: 'tiffin', name: 'Jeera Rice', nameGu: 'જીરા ભાત', description: 'Basmati rice tempered with cumin', descriptionGu: 'જીરાથી વઘારેલો બાસમતી ભાત', price: 70, image: IMAGES.gujaratiThali, diet: ['veg'], category: 'Dal/Rice', available: true },
  { id: 't9', restaurantId: 'tiffin', name: 'Kathol', nameGu: 'કઠોળ', description: 'Mixed sprouted legumes, home style', descriptionGu: 'મિક્સ ફણગાવેલા કઠોળ, ઘરેલું', price: 70, image: IMAGES.jainFood, diet: ['veg', 'jain'], category: 'Kathol', available: true },
  { id: 't10', restaurantId: 'tiffin', name: 'Green Salad', nameGu: 'ગ્રીન સલાડ', description: 'Cucumber, tomato, carrot, lemon', descriptionGu: 'કાકડી, ટામેટા, ગાજર, લીંબુ', price: 30, image: IMAGES.jainFood, diet: ['veg'], category: 'Salad', available: true },
  { id: 't11', restaurantId: 'tiffin', name: 'Chaas (Buttermilk)', nameGu: 'છાશ', description: 'Chilled chaas with roasted cumin', descriptionGu: 'ભુકા જીરા સાથે ઠંડી છાશ', price: 25, image: IMAGES.southIndian, diet: ['veg'], category: 'Buttermilk', available: true },
  { id: 't12', restaurantId: 'tiffin', name: 'Extra Farsan', nameGu: 'વધારાનું ફરસાણ', description: 'Dhokla or khaman of the day', descriptionGu: 'દિવસનું ઢોકળા કે ખમણ', price: 35, image: IMAGES.gujaratiThali, diet: ['veg'], category: 'Add-ons', available: true },
];

/**
 * Seeded comment threads for the reels feed — the feed ships with real-looking
 * social context, and any comment the customer writes is appended in the store.
 */
export const SEED_REEL_COMMENTS: Record<
  string,
  { author: string; authorGu: string; text: string; textGu: string; minsAgo: number }[]
> = {
  reel1: [
    { author: 'Hetal P.', authorGu: 'હેતલ પ.', text: 'Same thali every Sunday for us. Never disappoints.', textGu: 'અમારા માટે દર રવિવારે એ જ થાળી. ક્યારેય નિરાશ નથી કર્યા.', minsAgo: 24 },
    { author: 'Rutvik M.', authorGu: 'રૂત્વિક એમ.', text: 'Ask for extra kadhi, thank me later.', textGu: 'વધારે કઢી માંગો, પછી મને યાદ કરશો.', minsAgo: 96 },
  ],
  reel2: [
    { author: 'Meera S.', authorGu: 'મીરા એસ.', text: 'Finally a Jain thali with real taste.', textGu: 'છેવટે સાચો સ્વાદ ધરાવતી જૈન થાળી.', minsAgo: 58 },
  ],
  reel3: [
    { author: 'Nikhil D.', authorGu: 'નિખિલ ડી.', text: 'Crispiest dosa in Rajkot, no contest.', textGu: 'રાજકોટમાં સૌથી કડક ડોસા, કોઈ સવાલ નહીં.', minsAgo: 12 },
    { author: 'Priya V.', authorGu: 'પ્રિયા વી.', text: 'Ordered after watching this reel. Worth it.', textGu: 'આ રીલ જોઈને ઓર્ડર કર્યો. વસૂલ.', minsAgo: 240 },
  ],
  reel4: [
    { author: 'Aman T.', authorGu: 'અમન ટી.', text: 'Naan + dal makhani combo is unbeatable.', textGu: 'નાન + દાળ મખનીનું કોમ્બો બેજોડ છે.', minsAgo: 33 },
  ],
};
