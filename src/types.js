export const CATEGORIES = [
  { id: 'office', name: 'Office Supplies', color: '#00F0FF', icon: 'Briefcase', bg: 'rgba(0, 240, 255, 0.12)', border: 'rgba(0, 240, 255, 0.3)' },
  { id: 'meals', name: 'Meals & Dining', color: '#F59E0B', icon: 'Utensils', bg: 'rgba(245, 158, 11, 0.12)', border: 'rgba(245, 158, 11, 0.3)' },
  { id: 'travel', name: 'Travel & Fuel', color: '#38BDF8', icon: 'Fuel', bg: 'rgba(56, 189, 248, 0.12)', border: 'rgba(56, 189, 248, 0.3)' },
  { id: 'tech', name: 'Tech & Software', color: '#A855F7', icon: 'Cpu', bg: 'rgba(168, 85, 247, 0.12)', border: 'rgba(168, 85, 247, 0.3)' },
  { id: 'services', name: 'Utilities & Services', color: '#10B981', icon: 'Zap', bg: 'rgba(16, 185, 129, 0.12)', border: 'rgba(16, 185, 129, 0.3)' },
  { id: 'marketing', name: 'Marketing & Ads', color: '#E879F9', icon: 'Megaphone', bg: 'rgba(232, 121, 249, 0.12)', border: 'rgba(232, 121, 249, 0.3)' },
  { id: 'health', name: 'Health & Safety', color: '#F43F5E', icon: 'Shield', bg: 'rgba(244, 63, 94, 0.12)', border: 'rgba(244, 63, 94, 0.3)' },
  { id: 'misc', name: 'Miscellaneous', color: '#94A3B8', icon: 'Tag', bg: 'rgba(148, 163, 184, 0.12)', border: 'rgba(148, 163, 184, 0.3)' },
];

export const PAYMENT_METHODS = [
  'Company Card',
  'Personal Card',
  'Cash',
  'Bank Transfer (ACH)',
  'Digital Wallet (Apple/Google Pay)'
];

export const DEFAULT_SETTINGS = {
  currency: '₹',
  apiKey: '',
  aiModel: 'gemini-2.5-flash',
  soundEnabled: true,
  hapticsEnabled: true,
  autoConfirmSeconds: 4,
};

export const INITIAL_EXPENSES = [
  {
    id: 'exp_001',
    amount: 150.00,
    payee: 'Staples Office Store',
    category: 'Office Supplies',
    date: new Date().toISOString().split('T')[0],
    notes: 'Printer ink, heavy paper reams & pens',
    paymentMethod: 'Company Card',
    rawInput: 'Paid 150 for office supplies at Staples',
    timestamp: Date.now() - 3600000 * 2
  },
  {
    id: 'exp_002',
    amount: 48.75,
    payee: 'Chevron Gas Station',
    category: 'Travel & Fuel',
    date: new Date().toISOString().split('T')[0],
    notes: 'Full tank for client route delivery',
    paymentMethod: 'Company Card',
    rawInput: '48.75 for gas at Chevron',
    timestamp: Date.now() - 3600000 * 5
  },
  {
    id: 'exp_003',
    amount: 62.40,
    payee: 'Bistro Verde',
    category: 'Meals & Dining',
    date: new Date(Date.now() - 86400000).toISOString().split('T')[0],
    notes: 'Lunch meeting with contractor Marcus',
    paymentMethod: 'Personal Card',
    rawInput: 'Spent 62.40 on client lunch with Marcus at Bistro Verde yesterday',
    timestamp: Date.now() - 86400000 * 1.2
  },
  {
    id: 'exp_004',
    amount: 29.00,
    payee: 'GitHub Copilot',
    category: 'Tech & Software',
    date: new Date(Date.now() - 86400000 * 3).toISOString().split('T')[0],
    notes: 'Monthly dev subscription',
    paymentMethod: 'Company Card',
    rawInput: 'GitHub subscription 29 dollars',
    timestamp: Date.now() - 86400000 * 3.5
  }
];
