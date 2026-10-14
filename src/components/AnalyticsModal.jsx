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
  categories = CATEGORIES,
  currency = '₹',
  soundEnabled = true,
  hapticsEnabled = true
}) {
  if (!isOpen) return null;

  const totalAmount = expenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
  const avgAmount = expenses.length > 0 ? (totalAmount / expenses.length) : 0;

  // Compute breakdown by category dynamically
  const categoryTotals = categories.map(cat => {
    const sum = expenses
      .filter(e => (e.category || '').toLowerCase() === cat.name.toLowerCase())
      .reduce((s, e) => s + (Number(e.amount) || 0), 0);
    const count = expenses.filter(e => (e.category || '').toLowerCase() === cat.name.toLowerCase()).length;
    const percent = totalAmount > 0 ? Math.round((sum / totalAmount) * 100) : 0;
    return { ...cat, sum, count, percent };
  }).filter(c => c.count > 0).sort((a, b) => b.sum - a.sum);

  const handleExportCSV = () => {
    playCyberBeep(soundEnabled);
    triggerHaptic(20, hapticsEnabled);
    exportToCSV(expenses, currency);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 pt-[calc(env(safe-area-inset-top,0px)+16px)] pb-[calc(env(safe-area-inset-bottom,0px)+16px)] bg-black/30 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="w-full max-w-lg bg-white/80 sm:bg-white/85 backdrop-blur-2xl border border-white/60 rounded-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200/60 flex items-center justify-between bg-white/40">
          <div className="flex items-center space-x-2">
            <BarChart3 className="w-5 h-5 text-gray-800" />
            <h2 className="text-sm uppercase tracking-wider text-gray-900 font-bold">
              Spending Analytics
            </h2>
          </div>
          <button
            onClick={() => {
              playLaserClick(soundEnabled);
              onClose();
            }}
            className="p-1.5 rounded-full text-gray-600 hover:text-black hover:bg-white/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5 overflow-y-auto">
          
          {/* Top Stats Cards */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-4 rounded-2xl bg-white/40 border border-white/50 shadow-xs">
              <span className="text-[11px] font-bold uppercase tracking-wider text-gray-700">Total Outflow</span>
              <div className="text-2xl font-extrabold text-gray-900 mt-0.5">
                {currency}{totalAmount.toFixed(2)}
              </div>
              <span className="text-xs text-gray-600 font-medium">{expenses.length} transactions</span>
            </div>

            <div className="p-4 rounded-2xl bg-white/40 border border-white/50 shadow-xs">
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800">Average Entry</span>
              <div className="text-2xl font-extrabold text-emerald-800 mt-0.5">
                {currency}{avgAmount.toFixed(2)}
              </div>
              <span className="text-xs text-emerald-700 font-medium">Per transaction</span>
            </div>
          </div>

          {/* Category Breakdown Bars */}
          <div>
            <h3 className="text-xs uppercase tracking-wider font-bold text-gray-800 mb-3 flex items-center justify-between">
              <span>Category Distribution</span>
              <span className="text-gray-600 text-xs font-semibold">{categoryTotals.length} Active Categories</span>
            </h3>

            {categoryTotals.length === 0 ? (
              <div className="text-center py-6 text-xs text-gray-600 font-medium">
                No transactions recorded yet.
              </div>
            ) : (
              <div className="space-y-3.5">
                {categoryTotals.map(cat => (
                  <div key={cat.id} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center space-x-2">
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: cat.color }} />
                        <span className="text-gray-900 font-bold">{cat.name}</span>
                        <span className="text-xs text-gray-500 font-medium">({cat.count})</span>
                      </div>
                      <div className="text-xs font-extrabold text-gray-900">
                        {currency}{cat.sum.toFixed(2)} <span className="text-gray-600 font-medium text-[11px]">({cat.percent}%)</span>
                      </div>
                    </div>
                    {/* Progress Bar */}
                    <div className="w-full h-2 rounded-full bg-black/10 overflow-hidden">
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
          <div className="pt-2 border-t border-gray-200/60">
            <button
              onClick={handleExportCSV}
              className="w-full py-3 px-4 rounded-xl bg-gray-900 hover:bg-black text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center space-x-2 transition-all shadow-md active:scale-98"
            >
              <FileSpreadsheet className="w-4 h-4 text-white" />
              <span>Export Ledger to CSV / Excel</span>
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}
