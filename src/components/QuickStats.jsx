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
        className={`glass-panel-interactive p-3 rounded-xl cursor-pointer relative overflow-hidden ${
          activeFilter === 'today' ? 'border-cyan-400 bg-cyan-950/30' : 'hover:border-cyan-500/30'
        }`}
      >
        <div className="flex items-center justify-between mb-1">
          <span className="text-[10px] font-mono tracking-wider uppercase text-slate-400 flex items-center gap-1">
            <Flame className="w-3 h-3 text-cyan-400" />
            Today
          </span>
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
        </div>
        <div className="font-mono text-lg font-bold text-slate-100 tracking-tight">
          {currency}{spentToday.toFixed(2)}
        </div>
        <div className="text-[10px] text-cyan-400/80 font-mono mt-0.5">
          {expenses.filter(e => e.date === todayStr).length} logged
        </div>
      </div>

      {/* 7 Days HUD Card */}
      <div 
        onClick={() => onFilterChange && onFilterChange(activeFilter === 'week' ? 'all' : 'week')}
        className={`glass-panel-interactive p-3 rounded-xl cursor-pointer relative overflow-hidden ${
          activeFilter === 'week' ? 'border-violet-400 bg-violet-950/30' : 'hover:border-violet-500/30'
        }`}
      >
        <div className="flex items-center justify-between mb-1">
          <span className="text-[10px] font-mono tracking-wider uppercase text-slate-400 flex items-center gap-1">
            <Calendar className="w-3 h-3 text-violet-400" />
            7 Days
          </span>
        </div>
        <div className="font-mono text-lg font-bold text-slate-100 tracking-tight">
          {currency}{spentWeek.toFixed(2)}
        </div>
        <div className="text-[10px] text-violet-400/80 font-mono mt-0.5">
          Weekly burn
        </div>
      </div>

      {/* Month HUD Card */}
      <div 
        onClick={() => onFilterChange && onFilterChange(activeFilter === 'month' ? 'all' : 'month')}
        className={`glass-panel-interactive p-3 rounded-xl cursor-pointer relative overflow-hidden ${
          activeFilter === 'month' ? 'border-sky-400 bg-sky-950/30' : 'hover:border-sky-500/30'
        }`}
      >
        <div className="flex items-center justify-between mb-1">
          <span className="text-[10px] font-mono tracking-wider uppercase text-slate-400 flex items-center gap-1">
            <TrendingUp className="w-3 h-3 text-sky-400" />
            This Month
          </span>
        </div>
        <div className="font-mono text-lg font-bold text-slate-100 tracking-tight">
          {currency}{spentMonth.toFixed(2)}
        </div>
        <div className="text-[10px] text-sky-400/80 font-mono mt-0.5">
          Billing cycle
        </div>
      </div>

      {/* Average / Log HUD Card */}
      <div 
        onClick={() => onFilterChange && onFilterChange('all')}
        className="glass-panel-interactive p-3 rounded-xl cursor-pointer relative overflow-hidden hover:border-emerald-500/30"
      >
        <div className="flex items-center justify-between mb-1">
          <span className="text-[10px] font-mono tracking-wider uppercase text-slate-400 flex items-center gap-1">
            <Activity className="w-3 h-3 text-emerald-400" />
            Avg / Log
          </span>
        </div>
        <div className="font-mono text-lg font-bold text-emerald-400 tracking-tight">
          {currency}{avgSpend.toFixed(2)}
        </div>
        <div className="text-[10px] text-emerald-400/80 font-mono mt-0.5">
          {expenses.length} total entries
        </div>
      </div>
    </div>
  );
}
