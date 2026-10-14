import React, { useState, useEffect, useMemo } from 'react';
import { Header } from './components/Header';
import { QuickStats } from './components/QuickStats';
import { FilterBar } from './components/FilterBar';
import { ExpenseList } from './components/ExpenseList';
import { ExpenseInputBar } from './components/ExpenseInputBar';
import { EditModal } from './components/EditModal';
import { AnalyticsModal } from './components/AnalyticsModal';
import { SettingsModal } from './components/SettingsModal';
import { InstallPwaModal } from './components/InstallPwaModal';
import { loadExpenses, saveExpenses, loadSettings, saveSettings } from './utils/storage';
import { parseExpensePrompt } from './utils/aiParser';
import { 
  supabase, 
  fetchCloudExpenses, 
  insertCloudExpense, 
  updateCloudExpense, 
  deleteCloudExpense, 
  formatExpenseFromDB 
} from './utils/supabase';
import { AuthSyncModal } from './components/AuthSyncModal';

export function App() {
  const [expenses, setExpenses] = useState(() => loadExpenses());
  const [settings, setSettings] = useState(() => loadSettings());
  
  // Auth & Cloud Sync State
  const [currentUser, setCurrentUser] = useState(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  // UI Modal States
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [isAnalyticsOpen, setIsAnalyticsOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isInstallOpen, setIsInstallOpen] = useState(false);

  // Filter & Search States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [quickFilter, setQuickFilter] = useState('all'); // 'all' | 'today' | 'week' | 'month'

  // PWA Install Prompt state
  const [installPrompt, setInstallPrompt] = useState(null);
  const [isPwaInstalled, setIsPwaInstalled] = useState(false);

  // Sync expenses and settings to local storage as fallback/cache
  useEffect(() => {
    saveExpenses(expenses);
  }, [expenses]);

  useEffect(() => {
    saveSettings(settings);
  }, [settings]);

  // Check Supabase Auth session on mount and listen to changes
  useEffect(() => {
    if (!supabase) return;

    supabase.auth.getSession().then(({ data: { session } }) => {
      const user = session?.user || null;
      setCurrentUser(user);
      if (user) {
        fetchCloudExpenses(user.id).then(cloudExpenses => {
          if (cloudExpenses && cloudExpenses.length > 0) {
            setExpenses(cloudExpenses);
          }
        }).catch(err => console.warn('Cloud sync not yet initialized:', err.message));
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      const user = session?.user || null;
      setCurrentUser(user);
      if (user) {
        try {
          const cloudExpenses = await fetchCloudExpenses(user.id);
          if (cloudExpenses && cloudExpenses.length > 0) {
            setExpenses(cloudExpenses);
          }
        } catch (err) {
          console.warn('Failed to load cloud expenses:', err.message);
        }
      }
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  // Listen to Supabase Realtime channel for instant cross-device updates (phone <-> laptop)
  useEffect(() => {
    if (!supabase || !currentUser) return;

    const channel = supabase
      .channel(`realtime-expenses-${currentUser.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'expenses',
          filter: `user_id=eq.${currentUser.id}`,
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            const newExp = formatExpenseFromDB(payload.new);
            setExpenses(prev => {
              if (prev.some(e => e.id === newExp.id)) return prev;
              return [newExp, ...prev];
            });
          } else if (payload.eventType === 'UPDATE') {
            const updated = formatExpenseFromDB(payload.new);
            setExpenses(prev => prev.map(e => e.id === updated.id ? updated : e));
          } else if (payload.eventType === 'DELETE') {
            setExpenses(prev => prev.filter(e => e.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentUser]);

  // Listen for PWA Install prompt and standalone display mode
  useEffect(() => {
    const handleBeforeInstall = (e) => {
      e.preventDefault();
      setInstallPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    if (window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true) {
      setIsPwaInstalled(true);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, []);

  const handleTriggerInstall = async () => {
    if (!installPrompt) return;
    installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    if (outcome === 'accepted') {
      setIsPwaInstalled(true);
      setInstallPrompt(null);
    }
  };

  // Expense Actions with Optimistic UI + Cloud Persistence
  const handleLogExpense = async (naturalLanguageText) => {
    const parsed = await parseExpensePrompt(
      naturalLanguageText, 
      settings.apiKey, 
      settings.aiModel
    );

    const newExpense = {
      id: `exp_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      amount: parsed.amount,
      payee: parsed.payee || 'Expense',
      category: parsed.category || 'Miscellaneous',
      date: parsed.date || new Date().toISOString().split('T')[0],
      paymentMethod: parsed.paymentMethod || 'Company Card',
      notes: parsed.notes || '',
      rawInput: naturalLanguageText,
      timestamp: Date.now()
    };

    // Optimistically update local state immediately
    setExpenses(prev => [newExpense, ...prev]);

    // Push to Supabase if logged in
    if (currentUser) {
      insertCloudExpense(newExpense, currentUser.id).catch(err => {
        console.error('Failed to sync new expense to cloud:', err);
      });
    }

    return newExpense;
  };

  const handleSaveEditedExpense = (updatedExpense) => {
    setExpenses(prev => prev.map(e => e.id === updatedExpense.id ? updatedExpense : e));
    setSelectedExpense(null);

    if (currentUser) {
      updateCloudExpense(updatedExpense, currentUser.id).catch(err => {
        console.error('Failed to sync edited expense to cloud:', err);
      });
    }
  };

  const handleDeleteExpense = (id) => {
    setExpenses(prev => prev.filter(e => e.id !== id));
    setSelectedExpense(null);

    if (currentUser) {
      deleteCloudExpense(id, currentUser.id).catch(err => {
        console.error('Failed to delete expense from cloud:', err);
      });
    }
  };

  // Filtered and Sorted Expenses
  const filteredExpenses = useMemo(() => {
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(now.getDate() - 7);
    const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    return expenses.filter(exp => {
      // 1. Category Filter
      if (selectedCategory !== 'all' && exp.category.toLowerCase() !== selectedCategory.toLowerCase()) {
        return false;
      }

      // 2. Search Query (Payee, Notes, Category, Amount)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesPayee = (exp.payee || '').toLowerCase().includes(q);
        const matchesNotes = (exp.notes || '').toLowerCase().includes(q);
        const matchesCategory = (exp.category || '').toLowerCase().includes(q);
        const matchesAmount = String(exp.amount || '').includes(q);
        if (!matchesPayee && !matchesNotes && !matchesCategory && !matchesAmount) {
          return false;
        }
      }

      // 3. Quick Stats HUD Filter
      if (quickFilter === 'today') {
        return exp.date === todayStr;
      }
      if (quickFilter === 'week') {
        return new Date(exp.date + 'T00:00:00') >= sevenDaysAgo;
      }
      if (quickFilter === 'month') {
        return new Date(exp.date + 'T00:00:00') >= firstOfMonth;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'newest') {
        return (b.timestamp || new Date(b.date).getTime()) - (a.timestamp || new Date(a.date).getTime());
      }
      if (sortBy === 'oldest') {
        return (a.timestamp || new Date(a.date).getTime()) - (b.timestamp || new Date(b.date).getTime());
      }
      if (sortBy === 'highest') {
        return Number(b.amount || 0) - Number(a.amount || 0);
      }
      if (sortBy === 'lowest') {
        return Number(a.amount || 0) - Number(b.amount || 0);
      }
      return 0;
    });
  }, [expenses, selectedCategory, searchQuery, quickFilter, sortBy]);

  // Compute month total for header
  const totalMonth = useMemo(() => {
    const firstOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    return expenses
      .filter(e => new Date(e.date + 'T00:00:00') >= firstOfMonth)
      .reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
  }, [expenses]);

  return (
    <div className="min-h-screen bg-space-950 text-slate-100 bg-cyber-grid flex flex-col relative selection:bg-cyan-500 selection:text-black">
      
      {/* Futuristic Background Ambient Glows */}
      <div className="fixed top-0 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-[128px] pointer-events-none" />
      <div className="fixed bottom-1/4 right-1/4 w-96 h-96 bg-violet-600/10 rounded-full blur-[140px] pointer-events-none" />

      {/* Main App Header */}
      <Header
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenAnalytics={() => setIsAnalyticsOpen(true)}
        onOpenInstall={() => setIsInstallOpen(true)}
        onOpenAuth={() => setIsAuthOpen(true)}
        currentUser={currentUser}
        isPwaInstalled={isPwaInstalled}
        soundEnabled={settings.soundEnabled}
        hapticsEnabled={settings.hapticsEnabled}
        totalMonth={totalMonth}
        currency={settings.currency}
      />

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-2xl mx-auto px-3 sm:px-4 pt-2">
        
        {/* Quick HUD Telemetry Cards */}
        <QuickStats
          expenses={expenses}
          currency={settings.currency}
          activeFilter={quickFilter}
          onFilterChange={(filterKey) => setQuickFilter(filterKey)}
        />

        {/* Search, Filter Pills & Sort */}
        <FilterBar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
          sortBy={sortBy}
          onSortChange={setSortBy}
          soundEnabled={settings.soundEnabled}
          hapticsEnabled={settings.hapticsEnabled}
        />

        {/* Feed of Logged Expenses */}
        <ExpenseList
          expenses={filteredExpenses}
          onSelectExpense={(expense) => setSelectedExpense(expense)}
          currency={settings.currency}
          soundEnabled={settings.soundEnabled}
          hapticsEnabled={settings.hapticsEnabled}
          searchQuery={searchQuery}
          selectedCategory={selectedCategory}
        />

      </main>

      {/* Ergonomic Floating Bottom Voice & Input Bar */}
      <ExpenseInputBar
        onLogExpense={handleLogExpense}
        onEditRecent={(expense) => setSelectedExpense(expense)}
        soundEnabled={settings.soundEnabled}
        hapticsEnabled={settings.hapticsEnabled}
        currency={settings.currency}
      />

      {/* Holographic Edit Drawer Modal */}
      <EditModal
        expense={selectedExpense}
        isOpen={!!selectedExpense}
        onClose={() => setSelectedExpense(null)}
        onSave={handleSaveEditedExpense}
        onDelete={handleDeleteExpense}
        currency={settings.currency}
        soundEnabled={settings.soundEnabled}
        hapticsEnabled={settings.hapticsEnabled}
      />

      {/* Spending Analytics Modal */}
      <AnalyticsModal
        isOpen={isAnalyticsOpen}
        onClose={() => setIsAnalyticsOpen(false)}
        expenses={expenses}
        currency={settings.currency}
        soundEnabled={settings.soundEnabled}
        hapticsEnabled={settings.hapticsEnabled}
      />

      {/* Settings & AI Configuration Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onSaveSettings={(newSettings) => setSettings(newSettings)}
        expenses={expenses}
        onResetExpenses={(newExpenses) => setExpenses(newExpenses)}
        onRestoreExpenses={(restored) => setExpenses(restored)}
        soundEnabled={settings.soundEnabled}
        hapticsEnabled={settings.hapticsEnabled}
      />

      {/* PWA Home Screen Installation Modal */}
      <InstallPwaModal
        isOpen={isInstallOpen}
        onClose={() => setIsInstallOpen(false)}
        installPrompt={installPrompt}
        onTriggerInstall={handleTriggerInstall}
        soundEnabled={settings.soundEnabled}
      />

      {/* Cloud Authentication & Sync Modal */}
      <AuthSyncModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        currentUser={currentUser}
        expenses={expenses}
        onSyncComplete={async () => {
          if (currentUser) {
            const fresh = await fetchCloudExpenses(currentUser.id);
            if (fresh?.length) setExpenses(fresh);
          }
        }}
        soundEnabled={settings.soundEnabled}
        hapticsEnabled={settings.hapticsEnabled}
      />

    </div>
  );
}
