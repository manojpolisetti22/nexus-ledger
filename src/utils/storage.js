import { INITIAL_EXPENSES, DEFAULT_SETTINGS } from '../types.js';

const EXPENSES_KEY = 'nexus_expenses_v1';
const SETTINGS_KEY = 'nexus_settings_v1';

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

export function loadSettings() {
  if (typeof window === 'undefined') return DEFAULT_SETTINGS;
  try {
    const data = localStorage.getItem(SETTINGS_KEY);
    if (!data) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...JSON.parse(data) };
  } catch (err) {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(settings) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (err) {
    console.error('Failed to save settings', err);
  }
}

// Export to CSV formatted file
export function exportToCSV(expenses, currency = '$') {
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

// Backup & Restore
export function exportBackup(expenses, settings) {
  const payload = {
    version: '1.0',
    exportDate: new Date().toISOString(),
    expenses,
    settings
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
