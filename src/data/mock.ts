export const MOCK_DATA = {
  user: {
    name: 'Jay Patel',
    phone: '98765 43210',
    location: 'Ahmedabad, Gujarat',
    walletBalance: 245.50,
    loyaltyPoints: 120,
  },
  vendors: [
    { id: 'v1', name: 'Shree Krishna Tiffin', rating: 4.8, reviews: 1280, time: '20 mins', vegOnly: true },
    { id: 'v2', name: 'Maa ni Rasoi', rating: 4.7, reviews: 800, time: '35 mins', vegOnly: true },
    { id: 'v3', name: 'Home Style Tiffin', rating: 4.6, reviews: 760, time: '30 mins', vegOnly: true },
  ],
  subscriptions: [
    { id: 's1', name: '7 Days Plan', price: 699, duration: '1 Week' },
    { id: 's2', name: '15 Days Plan', price: 1299, duration: '2 Weeks' },
    { id: 's3', name: 'Monthly Plan', price: 1999, duration: '1 Month' },
  ],
  cart: {
    items: [
      { id: 'c1', name: 'Gujarati Thali', quantity: 1, price: 120 },
      { id: 'c2', name: 'Buttermilk', quantity: 1, price: 20 },
      { id: 'c3', name: 'Papad', quantity: 1, price: 15 },
    ],
    total: 155,
  }
};
