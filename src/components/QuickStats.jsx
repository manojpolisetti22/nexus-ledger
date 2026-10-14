import React from 'react';
import { TrendingUp, Calendar, Flame, Activity } from 'lucide-react';

export function QuickStats({ expenses, currency = '$', onFilterChange, activeFilter }) {
  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];

  // Calculate 7 days ago
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(now.getDate() - 7);

  // Calculate first day of this month
  const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  let spentToday = 0;
  let spentWeek = 0;
  let spentMonth = 0;
  let totalAll = 0;

  expenses.forEach(exp => {
    const val = Number(exp.amount) || 0;
    totalAll += val;

    const expDate = new Date(exp.date + 'T00:00:00');

    if (exp.date === todayStr) {
      spentToday += val;
    }
    if (expDate >= sevenDaysAgo) {
      spentWeek += val;
    }
    if (expDate >= firstOfMonth) {
      spentMonth += val;
    }
  });

  const avgSpend = expenses.length > 0 ? (totalAll / expenses.length) : 0;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 my-3">
      {/* Today HUD Card */}
      <div 
        onClick={() => onFilterChange && onFilterChange(activeFilter === 'today' ? 'all' : 'today')}
        className={`glass-panel-interactive p-3.5 rounded-2xl cursor-pointer relative overflow-hidden transition-all ${
          activeFilter === 'today' 
            ? 'bg-white/60 border-gray-900/40 ring-2 ring-gray-900/10 shadow-md' 
            : 'border-white/40'
        }`}
      >
        <div className="flex items-center justify-between mb-1">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-700 flex items-center gap-1.5">
            <Flame className="w-3.5 h-3.5 text-amber-600" />
            Today
          </span>
          <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
        </div>
        <div className="text-xl font-extrabold text-gray-900 tracking-tight">
          {currency}{spentToday.toFixed(2)}
        </div>
        <div className="text-[11px] text-gray-700 font-medium mt-0.5">
          {expenses.filter(e => e.date === todayStr).length} logged
        </div>
      </div>

      {/* 7 Days HUD Card */}
      <div 
        onClick={() => onFilterChange && onFilterChange(activeFilter === 'week' ? 'all' : 'week')}
        className={`glass-panel-interactive p-3.5 rounded-2xl cursor-pointer relative overflow-hidden transition-all ${
          activeFilter === 'week' 
            ? 'bg-white/60 border-gray-900/40 ring-2 ring-gray-900/10 shadow-md' 
            : 'border-white/40'
        }`}
      >
        <div className="flex items-center justify-between mb-1">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-700 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-orange-600" />
            7 Days
          </span>
        </div>
        <div className="text-xl font-extrabold text-gray-900 tracking-tight">
          {currency}{spentWeek.toFixed(2)}
        </div>
        <div className="text-[11px] text-gray-700 font-medium mt-0.5">
          Weekly burn
        </div>
      </div>

      {/* Month HUD Card */}
      <div 
        onClick={() => onFilterChange && onFilterChange(activeFilter === 'month' ? 'all' : 'month')}
        className={`glass-panel-interactive p-3.5 rounded-2xl cursor-pointer relative overflow-hidden transition-all ${
          activeFilter === 'month' 
            ? 'bg-white/60 border-gray-900/40 ring-2 ring-gray-900/10 shadow-md' 
            : 'border-white/40'
        }`}
      >
        <div className="flex items-center justify-between mb-1">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-700 flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5 text-amber-700" />
            This Month
          </span>
        </div>
        <div className="text-xl font-extrabold text-gray-900 tracking-tight">
          {currency}{spentMonth.toFixed(2)}
        </div>
        <div className="text-[11px] text-gray-700 font-medium mt-0.5">
          Billing cycle
        </div>
      </div>

      {/* Average / Log HUD Card */}
      <div 
        onClick={() => onFilterChange && onFilterChange('all')}
        className={`glass-panel-interactive p-3.5 rounded-2xl cursor-pointer relative overflow-hidden transition-all ${
          activeFilter === 'all'
            ? 'bg-white/60 border-gray-900/40 ring-2 ring-gray-900/10 shadow-md'
            : 'border-white/40'
        }`}
      >
        <div className="flex items-center justify-between mb-1">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-700 flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-emerald-700" />
            Avg / Log
          </span>
        </div>
        <div className="text-xl font-extrabold text-gray-900 tracking-tight">
          {currency}{avgSpend.toFixed(2)}
        </div>
        <div className="text-[11px] text-gray-700 font-medium mt-0.5">
          {expenses.length} total entries
        </div>
      </div>
    </div>
  );
}
