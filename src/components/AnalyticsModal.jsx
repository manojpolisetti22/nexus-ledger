import React from 'react';
import { 
  X, 
  BarChart3, 
  FileSpreadsheet
} from 'lucide-react';
import { CATEGORIES } from '../types';
import { exportToCSV } from '../utils/storage';
import { playLaserClick, playCyberBeep } from '../utils/sound';
import { triggerHaptic } from '../utils/haptics';

export function AnalyticsModal({ 
  isOpen, 
  onClose, 
  expenses, 
  currency = '$',
  soundEnabled = true,
  hapticsEnabled = true
}) {
  if (!isOpen) return null;

  const totalAmount = expenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
  const avgAmount = expenses.length > 0 ? (totalAmount / expenses.length) : 0;

  // Compute breakdown by category
  const categoryTotals = CATEGORIES.map(cat => {
    const sum = expenses
      .filter(e => e.category.toLowerCase() === cat.name.toLowerCase())
      .reduce((s, e) => s + (Number(e.amount) || 0), 0);
    const count = expenses.filter(e => e.category.toLowerCase() === cat.name.toLowerCase()).length;
    const percent = totalAmount > 0 ? Math.round((sum / totalAmount) * 100) : 0;
    return { ...cat, sum, count, percent };
  }).filter(c => c.count > 0).sort((a, b) => b.sum - a.sum);

  const handleExportCSV = () => {
    playCyberBeep(soundEnabled);
    triggerHaptic(20, hapticsEnabled);
    exportToCSV(expenses, currency);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 pt-[calc(env(safe-area-inset-top,0px)+16px)] pb-[calc(env(safe-area-inset-bottom,0px)+16px)] bg-space-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="w-full max-w-lg glass-panel bg-space-900 border border-cyan-500/30 rounded-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between bg-space-950/40">
          <div className="flex items-center space-x-2">
            <BarChart3 className="w-5 h-5 text-cyan-400" />
            <h2 className="font-mono text-xs uppercase tracking-wider text-slate-200 font-bold">
              Spending Telemetry // Analytics
            </h2>
          </div>
          <button
            onClick={() => {
              playLaserClick(soundEnabled);
              onClose();
            }}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 space-y-5 overflow-y-auto">
          
          {/* Top Stats Cards */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3.5 rounded-xl bg-space-950/60 border border-slate-800">
              <span className="text-[10px] font-mono uppercase text-slate-400">Total Outflow</span>
              <div className="text-xl font-mono font-bold text-cyan-400 mt-0.5">
                {currency}{totalAmount.toFixed(2)}
              </div>
              <span className="text-[10px] text-slate-500 font-mono">{expenses.length} transactions</span>
            </div>

            <div className="p-3.5 rounded-xl bg-space-950/60 border border-emerald-500/20">
              <span className="text-[10px] font-mono uppercase text-emerald-400">Average Entry</span>
              <div className="text-xl font-mono font-bold text-emerald-300 mt-0.5">
                {currency}{avgAmount.toFixed(2)}
              </div>
              <span className="text-[10px] text-emerald-500/80 font-mono">Per transaction</span>
            </div>
          </div>

          {/* Category Breakdown Bars */}
          <div>
            <h3 className="text-xs font-mono uppercase tracking-wider text-slate-400 mb-3 flex items-center justify-between">
              <span>Category Distribution</span>
              <span className="text-cyan-400 text-[10px]">{categoryTotals.length} Active Categories</span>
            </h3>

            {categoryTotals.length === 0 ? (
              <div className="text-center py-6 text-xs text-slate-500 font-mono">
                No telemetry recorded yet.
              </div>
            ) : (
              <div className="space-y-3">
                {categoryTotals.map(cat => (
                  <div key={cat.id} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center space-x-2">
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: cat.color }} />
                        <span className="text-slate-200 font-medium">{cat.name}</span>
                        <span className="text-[10px] font-mono text-slate-500">({cat.count})</span>
                      </div>
                      <div className="font-mono text-xs font-semibold text-slate-100">
                        {currency}{cat.sum.toFixed(2)} <span className="text-slate-500 text-[10px]">({cat.percent}%)</span>
                      </div>
                    </div>
                    {/* Progress Bar */}
                    <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                      <div 
                        className="h-full rounded-full transition-all duration-500"
                        style={{ 
                          width: `${cat.percent}%`,
                          backgroundColor: cat.color 
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Export Actions */}
          <div className="pt-2 border-t border-slate-800">
            <button
              onClick={handleExportCSV}
              className="w-full py-2.5 px-4 rounded-xl bg-space-850 hover:bg-space-800 border border-cyan-500/30 text-cyan-300 text-xs font-mono flex items-center justify-center space-x-2 transition-all hover:border-cyan-400 active:scale-98"
            >
              <FileSpreadsheet className="w-4 h-4 text-cyan-400" />
              <span>Export Ledger to CSV / Excel</span>
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}
