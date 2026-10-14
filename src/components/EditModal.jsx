import React, { useState, useEffect } from 'react';
import { 
  X, 
  Trash2, 
  Check, 
  Calendar, 
  DollarSign, 
  Tag, 
  CreditCard, 
  FileText, 
  ShieldCheck, 
  AlertTriangle,
  Sparkles,
  Store
} from 'lucide-react';
import { CATEGORIES, PAYMENT_METHODS } from '../types';
import { playLaserClick, playDeleteGlitch, playCyberBeep } from '../utils/sound';
import { triggerHaptic } from '../utils/haptics';

export function EditModal({ 
  expense, 
  isOpen, 
  onClose, 
  onSave, 
  onDelete, 
  currency = '$',
  soundEnabled = true,
  hapticsEnabled = true
}) {
  const [formData, setFormData] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (expense) {
      setFormData({
        ...expense,
        amount: Number(expense.amount || 0).toFixed(2),
        date: expense.date || new Date().toISOString().split('T')[0],
        payee: expense.payee || '',
        category: expense.category || 'Miscellaneous',
        paymentMethod: expense.paymentMethod || 'Company Card',
        notes: expense.notes || ''
      });
      setShowDeleteConfirm(false);
    }
  }, [expense]);

  if (!isOpen || !formData) return null;

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = (e) => {
    e.preventDefault();
    playCyberBeep(soundEnabled);
    triggerHaptic([20, 40], hapticsEnabled);

    onSave({
      ...formData,
      amount: parseFloat(formData.amount) || 0
    });
    onClose();
  };

  const handleDelete = () => {
    playDeleteGlitch(soundEnabled);
    triggerHaptic(40, hapticsEnabled);
    onDelete(formData.id);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-space-950/80 backdrop-blur-md animate-in fade-in duration-200">
      
      {/* Modal / Bottom Drawer Container */}
      <div 
        className="w-full sm:max-w-lg glass-panel bg-space-900 border-t sm:border border-cyan-500/30 rounded-t-3xl sm:rounded-2xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header Bar */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between bg-space-950/40">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            <h2 className="font-mono text-xs uppercase tracking-wider text-slate-300 font-bold">
              Holographic Inspector // Edit Entry
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

        {/* Scrollable Form Body */}
        <form onSubmit={handleSave} className="p-5 space-y-4 overflow-y-auto">
          
          {/* Amount Large Display */}
          <div>
            <label className="block text-[11px] font-mono uppercase tracking-wider text-slate-400 mb-1.5 flex items-center justify-between">
              <span>Amount Logged</span>
              <span className="text-cyan-400 text-[10px]">TAP TO OVERWRITE</span>
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-mono text-xl font-bold text-cyan-400">
                {currency}
              </span>
              <input
                type="number"
                step="0.01"
                required
                value={formData.amount}
                onChange={(e) => handleChange('amount', e.target.value)}
                className="w-full bg-space-950/80 border border-cyan-500/30 rounded-xl pl-9 pr-4 py-3 font-mono text-2xl font-bold text-slate-100 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 shadow-inner"
              />
            </div>
          </div>

          {/* Payee / Merchant */}
          <div>
            <label className="block text-[11px] font-mono uppercase tracking-wider text-slate-400 mb-1.5 flex items-center gap-1.5">
              <Store className="w-3.5 h-3.5 text-slate-400" />
              <span>Person / Merchant Paid</span>
            </label>
            <input
              type="text"
              required
              value={formData.payee}
              onChange={(e) => handleChange('payee', e.target.value)}
              placeholder="e.g. Staples, Dave, Chevron, Starbucks"
              className="w-full bg-space-950/60 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400"
            />
          </div>

          {/* Category Selector (Visual Cyber Grid) */}
          <div>
            <label className="block text-[11px] font-mono uppercase tracking-wider text-slate-400 mb-1.5 flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-slate-400" />
              <span>Category Allocation</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
              {CATEGORIES.map((cat) => {
                const isSelected = formData.category.toLowerCase() === cat.name.toLowerCase();
                return (
                  <button
                    type="button"
                    key={cat.id}
                    onClick={() => {
                      playLaserClick(soundEnabled);
                      triggerHaptic(10, hapticsEnabled);
                      handleChange('category', cat.name);
                    }}
                    className={`px-2.5 py-2 rounded-xl text-left text-xs font-medium transition-all flex flex-col justify-between border ${
                      isSelected
                        ? 'border-cyan-400 bg-cyan-950/40 text-cyan-200 shadow-[0_0_12px_rgba(0,240,255,0.2)]'
                        : 'border-slate-800 bg-space-950/40 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full mb-1" style={{ backgroundColor: cat.color }} />
                    <span className="truncate text-[11px]">{cat.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Date & Payment Method Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Date */}
            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-slate-400 mb-1.5 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>Date</span>
              </label>
              <input
                type="date"
                required
                value={formData.date}
                onChange={(e) => handleChange('date', e.target.value)}
                className="w-full bg-space-950/60 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 font-mono focus:outline-none focus:border-cyan-400"
              />
            </div>

            {/* Payment Method */}
            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-slate-400 mb-1.5 flex items-center gap-1.5">
                <CreditCard className="w-3.5 h-3.5 text-slate-400" />
                <span>Payment Method</span>
              </label>
              <select
                value={formData.paymentMethod}
                onChange={(e) => handleChange('paymentMethod', e.target.value)}
                className="w-full bg-space-950/60 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-cyan-400"
              >
                {PAYMENT_METHODS.map((pm) => (
                  <option key={pm} value={pm} className="bg-space-900 text-slate-100">
                    {pm}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Additional Notes */}
          <div>
            <label className="block text-[11px] font-mono uppercase tracking-wider text-slate-400 mb-1.5 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-slate-400" />
              <span>Notes & Itemization</span>
            </label>
            <textarea
              rows={2}
              value={formData.notes}
              onChange={(e) => handleChange('notes', e.target.value)}
              placeholder="e.g. Printer ink, printer paper, client meeting purpose"
              className="w-full bg-space-950/60 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-100 focus:outline-none focus:border-cyan-400 resize-none font-sans"
            />
          </div>

          {/* Original Raw Prompt info */}
          {formData.rawInput && (
            <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 text-[10px] font-mono text-slate-400">
              <span className="text-slate-500 uppercase">Input Stream: </span>
              "{formData.rawInput}"
            </div>
          )}

          {/* Action Buttons */}
          <div className="pt-2 flex items-center space-x-2">
            {!showDeleteConfirm ? (
              <>
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(true)}
                  className="p-3 rounded-xl border border-rose-500/30 text-rose-400 hover:bg-rose-500/10 transition-colors"
                  title="Delete Expense"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-violet-600 text-white font-medium text-xs font-mono tracking-wider uppercase hover:brightness-110 active:scale-98 transition-all shadow-neon-cyan flex items-center justify-center space-x-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>Commit Updates</span>
                </button>
              </>
            ) : (
              <div className="w-full p-2.5 rounded-xl border border-rose-500/40 bg-rose-950/30 flex items-center justify-between animate-in fade-in">
                <div className="flex items-center space-x-2 text-xs text-rose-300 font-mono">
                  <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>Confirm purge record?</span>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => setShowDeleteConfirm(false)}
                    className="px-2.5 py-1 rounded bg-slate-800 text-slate-300 text-xs font-mono"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleDelete}
                    className="px-2.5 py-1 rounded bg-rose-600 text-white text-xs font-mono font-bold"
                  >
                    Purge
                  </button>
                </div>
              </div>
            )}
          </div>

        </form>

      </div>
    </div>
  );
}
