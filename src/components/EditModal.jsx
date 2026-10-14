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
  categories = CATEGORIES,
  onCategoryLearned,
  currency = '₹',
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

    const updated = {
      ...formData,
      amount: parseFloat(formData.amount) || 0
    };

    // Trigger adaptive learning if category was updated
    if (expense && expense.category && formData.category && expense.category.toLowerCase() !== formData.category.toLowerCase()) {
      if (onCategoryLearned) {
        onCategoryLearned(formData.payee, formData.category, formData.rawInput || expense.rawInput || '');
      }
    }

    onSave(updated);
    onClose();
  };

  const handleDelete = () => {
    playDeleteGlitch(soundEnabled);
    triggerHaptic(40, hapticsEnabled);
    onDelete(formData.id);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 pt-[calc(env(safe-area-inset-top,0px)+16px)] pb-[calc(env(safe-area-inset-bottom,0px))] bg-black/30 backdrop-blur-sm animate-in fade-in duration-200">
      
      {/* Modal / Bottom Drawer Container */}
      <div 
        className="w-full sm:max-w-lg bg-white/80 sm:bg-white/85 backdrop-blur-2xl border-t sm:border border-white/60 rounded-t-3xl sm:rounded-3xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header Bar */}
        <div className="px-6 py-4 border-b border-gray-200/60 flex items-center justify-between bg-white/40">
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            <h2 className="text-sm uppercase tracking-wider text-gray-900 font-bold">
              Edit Expense
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

        {/* Scrollable Form Body */}
        <form onSubmit={handleSave} className="p-6 space-y-4 overflow-y-auto">
          
          {/* Amount Large Display */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5 flex items-center justify-between">
              <span>Amount Logged</span>
              <span className="text-gray-500 text-[10px] font-medium">Tap to edit</span>
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl font-extrabold text-gray-900">
                {currency}
              </span>
              <input
                type="number"
                step="0.01"
                required
                value={formData.amount}
                onChange={(e) => handleChange('amount', e.target.value)}
                className="w-full bg-white/60 focus:bg-white/85 border border-white/50 rounded-2xl pl-10 pr-4 py-3 text-2xl font-extrabold text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900 shadow-inner"
              />
            </div>
          </div>

          {/* Payee / Merchant */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5 flex items-center gap-1.5">
              <Store className="w-3.5 h-3.5 text-gray-600" />
              <span>Person / Merchant Paid</span>
            </label>
            <input
              type="text"
              required
              value={formData.payee}
              onChange={(e) => handleChange('payee', e.target.value)}
              placeholder="e.g. Staples, Dave, Chevron, Starbucks"
              className="w-full bg-white/60 focus:bg-white/85 border border-white/50 rounded-xl px-4 py-2.5 text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900"
            />
          </div>

          {/* Category Selector (Visual Grid) */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5 flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-gray-600" />
              <span>Category Allocation</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
              {categories.map((cat) => {
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
                    className={`px-3 py-2 rounded-xl text-left text-xs font-medium transition-all flex flex-col justify-between border ${
                      isSelected
                        ? 'bg-gray-900 text-white shadow-md border-gray-900'
                        : 'border-white/50 bg-white/40 text-gray-800 hover:bg-white/65'
                    }`}
                  >
                    <span className="w-2 h-2 rounded-full mb-1" style={{ backgroundColor: cat.color }} />
                    <span className="truncate text-xs font-semibold">{cat.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Date & Payment Method Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Date */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-gray-600" />
                <span>Date</span>
              </label>
              <input
                type="date"
                required
                value={formData.date}
                onChange={(e) => handleChange('date', e.target.value)}
                className="w-full bg-white/60 focus:bg-white/85 border border-white/50 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900"
              />
            </div>

            {/* Payment Method */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5 flex items-center gap-1.5">
                <CreditCard className="w-3.5 h-3.5 text-gray-600" />
                <span>Payment Method</span>
              </label>
              <select
                value={formData.paymentMethod}
                onChange={(e) => handleChange('paymentMethod', e.target.value)}
                className="w-full bg-white/60 focus:bg-white/85 border border-white/50 rounded-xl px-3 py-2.5 text-xs font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900"
              >
                {PAYMENT_METHODS.map((pm) => (
                  <option key={pm} value={pm} className="bg-white text-gray-900">
                    {pm}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Additional Notes */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-gray-600" />
              <span>Notes & Itemization</span>
            </label>
            <textarea
              rows={2}
              value={formData.notes}
              onChange={(e) => handleChange('notes', e.target.value)}
              placeholder="e.g. Printer ink, printer paper, client meeting purpose"
              className="w-full bg-white/60 focus:bg-white/85 border border-white/50 rounded-xl px-3.5 py-2 text-xs text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-900 resize-none font-sans"
            />
          </div>

          {/* Original Raw Prompt info */}
          {formData.rawInput && (
            <div className="p-2.5 rounded-xl bg-white/40 border border-white/50 text-[11px] text-gray-700">
              <span className="font-bold text-gray-900 uppercase">Input text: </span>
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
                  className="p-3 rounded-xl border border-red-300 text-red-700 bg-white/40 hover:bg-red-50 transition-colors shadow-xs"
                  title="Delete Expense"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 px-4 rounded-xl bg-gray-900 text-white font-bold text-xs tracking-wider uppercase hover:bg-black active:scale-98 transition-all shadow-md flex items-center justify-center space-x-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>Save Changes</span>
                </button>
              </>
            ) : (
              <div className="w-full p-2.5 rounded-xl border border-red-300 bg-red-50 flex items-center justify-between animate-in fade-in">
                <div className="flex items-center space-x-2 text-xs text-red-900 font-semibold">
                  <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                  <span>Delete this record permanently?</span>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => setShowDeleteConfirm(false)}
                    className="px-3 py-1.5 rounded-lg bg-white border border-gray-300 text-gray-800 text-xs font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleDelete}
                    className="px-3 py-1.5 rounded-lg bg-red-600 text-white text-xs font-bold hover:bg-red-700"
                  >
                    Delete
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
