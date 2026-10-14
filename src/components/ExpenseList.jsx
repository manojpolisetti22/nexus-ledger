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
        <div className="flex items-center justify-between px-1 mb-2.5">
          <div className="flex items-center space-x-2">
            <span className="w-1.5 h-3 rounded-full bg-amber-500" />
            <h3 className="text-xs uppercase tracking-wider text-gray-100 font-bold">
              {title}
            </h3>
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-white/15 text-gray-200 border border-white/20">
              {count}
            </span>
          </div>
          <span className="text-xs font-bold text-gray-100">
            {currency}{total.toFixed(2)}
          </span>
        </div>

        {/* Expense Items List */}
        <div className="space-y-2.5">
          {items.map((exp) => {
            const catMeta = getCategoryMeta(exp.category);
            const IconComponent = ICON_MAP[catMeta.icon] || Tag;

            return (
              <div
                key={exp.id}
                onClick={() => handleItemClick(exp)}
                className="bg-white/45 backdrop-blur-md border border-white/50 rounded-2xl p-4 cursor-pointer relative overflow-hidden group hover:bg-white/60 transition-all duration-200 shadow-sm"
              >
                {/* Subtle Left Category Accent Bar */}
                <div 
                  className="absolute left-0 top-0 bottom-0 w-1.5 transition-all group-hover:w-2"
                  style={{ backgroundColor: catMeta.color }}
                />

                <div className="flex items-center justify-between pl-1">
                  
                  {/* Left: Category Icon + Merchant & Notes */}
                  <div className="flex items-center space-x-3.5 truncate mr-2">
                    <div 
                      className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 border border-white/40 shadow-xs"
                      style={{ 
                        backgroundColor: 'rgba(255, 255, 255, 0.45)',
                        color: catMeta.color 
                      }}
                    >
                      <IconComponent className="w-5 h-5" />
                    </div>

                    <div className="truncate">
                      <div className="flex items-center space-x-1.5">
                        <h4 className="font-bold text-sm text-gray-900 truncate group-hover:text-black transition-colors">
                          {exp.payee || 'Expense'}
                        </h4>
                      </div>

                      <div className="flex items-center space-x-2 text-xs text-gray-700 font-medium mt-0.5 truncate">
                        <span style={{ color: catMeta.color }} className="font-semibold shrink-0">
                          {exp.category}
                        </span>
                        <span className="text-gray-400">•</span>
                        <span className="truncate text-gray-700">{exp.notes || exp.date}</span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Amount & Chevron */}
                  <div className="flex items-center space-x-2 shrink-0">
                    <div className="text-right">
                      <div className="text-base font-extrabold text-gray-900 tracking-tight group-hover:text-black transition-colors">
                        {currency}{Number(exp.amount || 0).toFixed(2)}
                      </div>
                      <div className="text-[10px] font-medium text-gray-600">
                        {exp.paymentMethod ? exp.paymentMethod.replace(' (ACH)', '').replace(' (Apple/Google Pay)', '') : 'Card'}
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-500 group-hover:text-gray-900 group-hover:translate-x-0.5 transition-all" />
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
      <div className="my-10 bg-white/45 backdrop-blur-md border border-white/50 rounded-3xl p-8 text-center shadow-sm">
        <div className="w-12 h-12 rounded-2xl bg-white/60 border border-white/60 flex items-center justify-center mx-auto mb-3 text-gray-900 shadow-sm">
          <Inbox className="w-6 h-6" />
        </div>
        <h3 className="text-sm font-bold uppercase text-gray-900 tracking-wider">
          No Expenses Recorded
        </h3>
        <p className="text-xs text-gray-700 font-medium max-w-xs mx-auto mt-1 font-sans">
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
