import React from 'react';
import { 
  Briefcase, 
  Utensils, 
  Fuel, 
  Cpu, 
  Zap, 
  Megaphone, 
  Shield, 
  Tag,
  CreditCard,
  DollarSign,
  Calendar,
  ChevronRight,
  ShieldCheck,
  Clock,
  Sparkles,
  Inbox
} from 'lucide-react';
import { CATEGORIES } from '../types';
import { playLaserClick } from '../utils/sound';
import { triggerHaptic } from '../utils/haptics';

// Map icon strings to Lucide components
import { 
  Coffee, 
  ShoppingBag, 
  Heart, 
  Plane, 
  Home, 
  Film, 
  Dumbbell 
} from 'lucide-react';

const ICON_MAP = {
  Briefcase,
  Utensils,
  Fuel,
  Cpu,
  Zap,
  Megaphone,
  Shield,
  Tag,
  Coffee,
  ShoppingBag,
  Heart,
  Plane,
  Home,
  Film,
  Dumbbell
};

export function ExpenseList({ 
  expenses, 
  onSelectExpense, 
  categories = CATEGORIES,
  currency = '₹',
  soundEnabled = true,
  hapticsEnabled = true,
  searchQuery = '',
  selectedCategory = 'all'
}) {
  const handleItemClick = (expense) => {
    playLaserClick(soundEnabled);
    triggerHaptic(12, hapticsEnabled);
    onSelectExpense(expense);
  };

  // Group expenses by Date relative to today
  const todayStr = new Date().toISOString().split('T')[0];
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];

  const firstOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);

  const groups = {
    today: [],
    yesterday: [],
    thisMonth: [],
    older: []
  };

  expenses.forEach(exp => {
    const dStr = exp.date;
    const dObj = new Date(exp.date + 'T00:00:00');

    if (dStr === todayStr) {
      groups.today.push(exp);
    } else if (dStr === yesterdayStr) {
      groups.yesterday.push(exp);
    } else if (dObj >= firstOfMonth) {
      groups.thisMonth.push(exp);
    } else {
      groups.older.push(exp);
    }
  });

  const getCategoryMeta = (catName) => {
    const found = categories.find(c => c.name.toLowerCase() === (catName || '').toLowerCase());
    return found || { id: 'misc', name: catName || 'Miscellaneous', color: '#94A3B8', icon: 'Tag', bg: 'rgba(148, 163, 184, 0.12)', border: 'rgba(148, 163, 184, 0.3)' };
  };

  const renderGroup = (title, items, count, total) => {
    if (items.length === 0) return null;

    return (
      <div key={title} className="mb-6">
        {/* Section Header */}
        <div className="flex items-center justify-between px-1 mb-2">
          <div className="flex items-center space-x-2">
            <span className="w-1.5 h-3 rounded-full bg-cyan-400" />
            <h3 className="font-mono text-xs uppercase tracking-wider text-slate-400 font-semibold">
              {title}
            </h3>
            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-slate-800 text-slate-400">
              {count}
            </span>
          </div>
          <span className="font-mono text-xs font-semibold text-cyan-300">
            {currency}{total.toFixed(2)}
          </span>
        </div>

        {/* Expense Items List */}
        <div className="space-y-2">
          {items.map((exp) => {
            const catMeta = getCategoryMeta(exp.category);
            const IconComponent = ICON_MAP[catMeta.icon] || Tag;

            return (
              <div
                key={exp.id}
                onClick={() => handleItemClick(exp)}
                className="glass-panel-interactive p-3.5 rounded-xl cursor-pointer relative overflow-hidden group hover:border-cyan-500/40"
              >
                {/* Subtle Left Category Accent Bar */}
                <div 
                  className="absolute left-0 top-0 bottom-0 w-1 transition-all group-hover:w-1.5"
                  style={{ backgroundColor: catMeta.color }}
                />

                <div className="flex items-center justify-between pl-1.5">
                  
                  {/* Left: Category Icon + Merchant & Notes */}
                  <div className="flex items-center space-x-3 truncate mr-2">
                    <div 
                      className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border"
                      style={{ 
                        backgroundColor: catMeta.bg,
                        borderColor: catMeta.border,
                        color: catMeta.color 
                      }}
                    >
                      <IconComponent className="w-5 h-5" />
                    </div>

                    <div className="truncate">
                      <div className="flex items-center space-x-1.5">
                        <h4 className="font-semibold text-sm text-slate-100 truncate group-hover:text-cyan-300 transition-colors">
                          {exp.payee || 'Expense'}
                        </h4>
                      </div>

                      <div className="flex items-center space-x-2 text-[11px] text-slate-400 mt-0.5 truncate">
                        <span style={{ color: catMeta.color }} className="font-medium shrink-0">
                          {exp.category}
                        </span>
                        <span>•</span>
                        <span className="truncate">{exp.notes || exp.date}</span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Amount & Chevron */}
                  <div className="flex items-center space-x-2 shrink-0">
                    <div className="text-right">
                      <div className="font-mono text-base font-bold text-slate-100 tracking-tight group-hover:text-cyan-400 transition-colors">
                        {currency}{Number(exp.amount || 0).toFixed(2)}
                      </div>
                      <div className="text-[10px] font-mono text-slate-500">
                        {exp.paymentMethod ? exp.paymentMethod.replace(' (ACH)', '').replace(' (Apple/Google Pay)', '') : 'Card'}
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-cyan-400 group-hover:translate-x-0.5 transition-all" />
                  </div>

                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const groupTotal = (items) => items.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);

  if (expenses.length === 0) {
    return (
      <div className="my-10 glass-panel rounded-2xl p-8 text-center border-dashed border-slate-700/80">
        <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center mx-auto mb-3 text-cyan-400">
          <Inbox className="w-6 h-6" />
        </div>
        <h3 className="font-mono text-sm font-semibold uppercase text-slate-300 tracking-wider">
          Ledger Vector Empty
        </h3>
        <p className="text-xs text-slate-400 max-w-xs mx-auto mt-1 font-sans">
          {searchQuery || selectedCategory !== 'all' 
            ? 'No expenses matched your filter criteria.'
            : 'Tap the mic or type e.g. "Paid 150 for office supplies" below to log your first expense.'}
        </p>
      </div>
    );
  }

  return (
    <div className="pb-32">
      {renderGroup('Today', groups.today, groups.today.length, groupTotal(groups.today))}
      {renderGroup('Yesterday', groups.yesterday, groups.yesterday.length, groupTotal(groups.yesterday))}
      {renderGroup('Earlier This Month', groups.thisMonth, groups.thisMonth.length, groupTotal(groups.thisMonth))}
      {renderGroup('Archived Records', groups.older, groups.older.length, groupTotal(groups.older))}
    </div>
  );
}
