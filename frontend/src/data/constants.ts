export const SUBSCRIPTIONS = [
  { name: 'Netflix', price: '$15.99', color: '#E50914', members: 4 },
  { name: 'Spotify Family', price: '$16.99', color: '#1DB954', members: 5 },
  { name: 'ChatGPT Plus', price: '$20.00', color: '#10A37F', members: 2 },
  { name: 'Amazon Prime', price: '$14.99', color: '#FF9900', members: 3 },
  { name: 'iCloud 2TB', price: '$9.99', color: '#007AFF', members: 4 },
  { name: 'YouTube Premium', price: '$22.99', color: '#FF0000', members: 4 },
];

export const FAQ_ITEMS = [
  {
    q: 'Does SubSplit read all my emails?',
    a: 'No, only billing confirmation emails matching known subscription patterns.',
  },
  {
    q: 'What payment methods does it support?',
    a: "SubSplit sends Venmo, PayPal, and UPI links based on your group's preferences.",
  },
  {
    q: 'What if the charge amount changes?',
    a: 'It detects the change and flags it to the group before updating balances.',
  },
  {
    q: 'Is my Gmail data stored?',
    a: 'Only the billing line-items are stored, never email content or personal data.',
  },
  {
    q: 'Can I use this without Gmail?',
    a: 'Manual entry is supported, but Gmail sync is the magic.',
  },
];
