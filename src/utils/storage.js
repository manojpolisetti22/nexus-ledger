import { INITIAL_EXPENSES, DEFAULT_SETTINGS, CATEGORIES } from '../types.js';

const EXPENSES_KEY = 'nexus_expenses_v1';
const SETTINGS_KEY = 'nexus_settings_v1';
const CATEGORIES_KEY = 'nexus_categories_v1';
const LEARNED_RULES_KEY = 'nexus_learned_rules_v1';
const CURRENCY_INIT_KEY = 'nexus_currency_initialized_v2';

// -------------------------------------------------------------
// EXPENSES STORAGE
// -------------------------------------------------------------
export function loadExpenses() {
  if (typeof window === 'undefined') return INITIAL_EXPENSES;
  try {
    const data = localStorage.getItem(EXPENSES_KEY);
    if (!data) {
      localStorage.setItem(EXPENSES_KEY, JSON.stringify(INITIAL_EXPENSES));
      return INITIAL_EXPENSES;
    }
    return JSON.parse(data);
  } catch (err) {
    console.error('Failed to load expenses from storage', err);
    return INITIAL_EXPENSES;
  }
}

export function saveExpenses(expenses) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(EXPENSES_KEY, JSON.stringify(expenses));
  } catch (err) {
    console.error('Failed to save expenses to storage', err);
  }
}

// -------------------------------------------------------------
// SETTINGS STORAGE
// -------------------------------------------------------------
export function loadSettings() {
  if (typeof window === 'undefined') return DEFAULT_SETTINGS;
  try {
    const data = localStorage.getItem(SETTINGS_KEY);
    const hasInitCurrency = localStorage.getItem(CURRENCY_INIT_KEY);

    if (!data) {
      localStorage.setItem(CURRENCY_INIT_KEY, 'true');
      return DEFAULT_SETTINGS;
    }

    const parsed = JSON.parse(data);
    let currency = parsed.currency;

    // Migrate old settings: default to INR (₹) if not explicitly set
    if (!hasInitCurrency) {
      currency = '₹';
      localStorage.setItem(CURRENCY_INIT_KEY, 'true');
    } else if (currency !== '₹' && currency !== '$') {
      currency = '₹';
    }

    let aiModel = parsed.aiModel;
    if (!aiModel || aiModel.includes('2.5') || aiModel.includes('1.5')) {
      aiModel = 'gemini-3.8-flash';
    }

    return { ...DEFAULT_SETTINGS, ...parsed, currency, aiModel };
  } catch (err) {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(settings) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    localStorage.setItem(CURRENCY_INIT_KEY, 'true');
  } catch (err) {
    console.error('Failed to save settings', err);
  }
}

// -------------------------------------------------------------
// CATEGORIES STORAGE
// -------------------------------------------------------------
export function loadCategories() {
  if (typeof window === 'undefined') return CATEGORIES;
  try {
    const data = localStorage.getItem(CATEGORIES_KEY);
    if (!data) {
      localStorage.setItem(CATEGORIES_KEY, JSON.stringify(CATEGORIES));
      return CATEGORIES;
    }
    const parsed = JSON.parse(data);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : CATEGORIES;
  } catch (err) {
    console.error('Failed to load categories', err);
    return CATEGORIES;
  }
}

export function saveCategories(categories) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(CATEGORIES_KEY, JSON.stringify(categories));
  } catch (err) {
    console.error('Failed to save categories', err);
  }
}

// -------------------------------------------------------------
// ADAPTIVE AI LEARNING / USER RULES STORAGE
// -------------------------------------------------------------
export function loadLearnedRules() {
  if (typeof window === 'undefined') return [];
  try {
    const data = localStorage.getItem(LEARNED_RULES_KEY);
    if (!data) return [];
    return JSON.parse(data);
  } catch (err) {
    console.error('Failed to load learned rules', err);
    return [];
  }
}

export function saveLearnedRules(rules) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(LEARNED_RULES_KEY, JSON.stringify(rules));
  } catch (err) {
    console.error('Failed to save learned rules', err);
  }
}

/**
 * Learn and remember when a user edits an expense category.
 * Matches future inputs containing this payee or distinct keywords!
 */
export function learnCategoryMapping(payee, category, rawInput = '') {
  if (!payee || !category) return;
  const cleanPayee = payee.trim().toLowerCase();
  if (!cleanPayee || cleanPayee === 'expense' || cleanPayee === 'quick expense') return;

  const existingRules = loadLearnedRules();
  
  // Extract key patterns to associate
  const patternsToLearn = [cleanPayee];

  // If raw input has meaningful brand keywords, also check for single significant words
  if (rawInput) {
    const words = rawInput.toLowerCase()
      .replace(/[^a-z0-9\s]/g, ' ')
      .split(/\s+/)
      .filter(w => w.length > 3 && !['paid', 'spent', 'cost', 'yesterday', 'today', 'dollars', 'bucks', 'rupees', 'from', 'with'].includes(w));
    
    // If the payee matches one of the distinct words, ensure it is prioritized
    words.forEach(w => {
      if (cleanPayee.includes(w) && !patternsToLearn.includes(w)) {
        patternsToLearn.push(w);
      }
    });
  }

  let updatedRules = [...existingRules];

  patternsToLearn.forEach(pattern => {
    // Remove existing rule for this pattern if any
    updatedRules = updatedRules.filter(r => r.pattern !== pattern);
    // Prepend new learned rule
    updatedRules.unshift({
      id: `rule_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      pattern,
      payee: cleanPayee,
      category,
      learnedAt: Date.now()
    });
  });

  // Limit max learned rules to 200
  if (updatedRules.length > 200) {
    updatedRules = updatedRules.slice(0, 200);
  }

  saveLearnedRules(updatedRules);
  console.log(`[Nexus AI Learning] Learned mapping: "${cleanPayee}" -> "${category}"`);
  return updatedRules;
}

export function removeLearnedRule(id) {
  const existingRules = loadLearnedRules();
  const filtered = existingRules.filter(r => r.id !== id);
  saveLearnedRules(filtered);
  return filtered;
}

export function clearAllLearnedRules() {
  saveLearnedRules([]);
}

// -------------------------------------------------------------
// EXPORT & BACKUP
// -------------------------------------------------------------
export function exportToCSV(expenses, currency = '₹') {
  if (!expenses || expenses.length === 0) return;

  const headers = ['Date', `Amount (${currency})`, 'Payee / Merchant', 'Category', 'Payment Method', 'Notes', 'Original Voice/Text Prompt'];
  const rows = expenses.map(exp => [
    exp.date || '',
    Number(exp.amount || 0).toFixed(2),
    `"${(exp.payee || '').replace(/"/g, '""')}"`,
    `"${(exp.category || '').replace(/"/g, '""')}"`,
    `"${(exp.paymentMethod || '').replace(/"/g, '""')}"`,
    `"${(exp.notes || '').replace(/"/g, '""')}"`,
    `"${(exp.rawInput || '').replace(/"/g, '""')}"`,
  ]);

  const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `nexus_ledger_export_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function exportBackup(expenses, settings, categories = null) {
  const payload = {
    version: '1.2',
    exportDate: new Date().toISOString(),
    expenses,
    settings,
    categories: categories || loadCategories(),
    learnedRules: loadLearnedRules()
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `nexus_backup_${new Date().toISOString().split('T')[0]}.json`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
