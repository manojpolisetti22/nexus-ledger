import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseKey);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : null;

// Auth helper functions
export async function signUpWithEmail(email, password) {
  if (!supabase) throw new Error('Supabase client is not configured');
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });
  if (error) throw error;
  return data;
}

export async function signInWithEmail(email, password) {
  if (!supabase) throw new Error('Supabase client is not configured');
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error) throw error;
  return data;
}

export async function signOutUser() {
  if (!supabase) return;
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function getCurrentUser() {
  if (!supabase) return null;
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

// Convert DB snake_case row to frontend camelCase expense
export function formatExpenseFromDB(row) {
  return {
    id: row.id,
    amount: Number(row.amount),
    payee: row.payee || '',
    category: row.category || 'Miscellaneous',
    date: row.date || new Date().toISOString().split('T')[0],
    notes: row.notes || '',
    paymentMethod: row.payment_method || 'Company Card',
    rawInput: row.raw_input || '',
    timestamp: row.timestamp ? Number(row.timestamp) : (row.created_at ? new Date(row.created_at).getTime() : Date.now()),
  };
}

// Convert frontend camelCase expense to DB snake_case row
export function formatExpenseForDB(exp, userId) {
  return {
    id: exp.id,
    user_id: userId,
    amount: Number(exp.amount),
    payee: exp.payee,
    category: exp.category,
    date: exp.date,
    notes: exp.notes || '',
    payment_method: exp.paymentMethod || 'Company Card',
    raw_input: exp.rawInput || '',
    timestamp: exp.timestamp || Date.now(),
  };
}

// Cloud Expense API operations
export async function fetchCloudExpenses(userId) {
  if (!supabase || !userId) return [];
  const { data, error } = await supabase
    .from('expenses')
    .select('*')
    .eq('user_id', userId)
    .order('date', { ascending: false });

  if (error) {
    console.error('Error fetching expenses from cloud:', error);
    throw error;
  }
  return (data || []).map(formatExpenseFromDB);
}

export async function insertCloudExpense(expense, userId) {
  if (!supabase || !userId) return null;
  const payload = formatExpenseForDB(expense, userId);
  const { data, error } = await supabase
    .from('expenses')
    .upsert(payload)
    .select()
    .single();

  if (error) {
    console.error('Error inserting cloud expense:', error);
    throw error;
  }
  return formatExpenseFromDB(data);
}

export async function updateCloudExpense(expense, userId) {
  if (!supabase || !userId) return null;
  const payload = formatExpenseForDB(expense, userId);
  const { data, error } = await supabase
    .from('expenses')
    .update(payload)
    .eq('id', expense.id)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) {
    console.error('Error updating cloud expense:', error);
    throw error;
  }
  return formatExpenseFromDB(data);
}

export async function deleteCloudExpense(id, userId) {
  if (!supabase || !userId) return;
  const { error } = await supabase
    .from('expenses')
    .delete()
    .eq('id', id)
    .eq('user_id', userId);

  if (error) {
    console.error('Error deleting cloud expense:', error);
    throw error;
  }
}

// Bulk Sync Local Expenses to Cloud when logging in
export async function syncLocalToCloud(localExpenses, userId) {
  if (!supabase || !userId || !localExpenses?.length) return [];
  const payloads = localExpenses.map(exp => formatExpenseForDB(exp, userId));
  const { data, error } = await supabase
    .from('expenses')
    .upsert(payloads, { onConflict: 'id' })
    .select();

  if (error) {
    console.error('Error syncing local expenses to cloud:', error);
    throw error;
  }
  return (data || []).map(formatExpenseFromDB);
}
