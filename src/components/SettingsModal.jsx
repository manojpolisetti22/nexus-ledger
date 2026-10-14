import React, { useState } from 'react';
import { 
  X, 
  Settings, 
  Key, 
  Cpu, 
  Volume2, 
  VolumeX, 
  Smartphone, 
  Download, 
  Upload, 
  Trash2, 
  RotateCcw, 
  Check, 
  ExternalLink,
  ShieldAlert,
  Sparkles,
  Info,
  SlidersHorizontal
} from 'lucide-react';
import { exportToCSV, exportBackup } from '../utils/storage';
import { INITIAL_EXPENSES } from '../types';
import { playLaserClick, playCyberBeep } from '../utils/sound';
import { triggerHaptic } from '../utils/haptics';

const CURRENCIES = [
  { symbol: '₹', label: 'INR (₹)' },
  { symbol: '$', label: 'USD ($)' },
];

export function SettingsModal({
  isOpen,
  onClose,
  settings,
  onSaveSettings,
  expenses,
  onResetExpenses,
  onRestoreExpenses,
  onOpenCategories,
  soundEnabled,
  hapticsEnabled
}) {
  const [formData, setFormData] = useState({ ...settings });
  const [testStatus, setTestStatus] = useState('');
  const [isTesting, setIsTesting] = useState(false);

  if (!isOpen) return null;

  const handleChange = (field, value) => {
    const updated = { ...formData, [field]: value };
    setFormData(updated);
    onSaveSettings(updated);
  };

  const handleTestKey = async () => {
    if (!formData.apiKey) {
      setTestStatus('Please enter an API key first.');
      return;
    }
    setIsTesting(true);
    setTestStatus('Validating Gemini quantum vector...');

    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${formData.aiModel}:generateContent?key=${formData.apiKey.trim()}`;
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: 'Respond with valid JSON: {"status": "ok"}' }] }],
          generationConfig: { responseMimeType: 'application/json' }
        })
      });

      if (res.ok) {
        setTestStatus('Success! Gemini API connected and ready.');
        playCyberBeep(soundEnabled);
        triggerHaptic([20, 40], hapticsEnabled);
      } else {
        const err = await res.text();
        setTestStatus(`Connection error (${res.status}): Verify your key.`);
      }
    } catch (err) {
      setTestStatus('Network failed or invalid endpoint.');
    } finally {
      setIsTesting(false);
    }
  };

  const handleRestoreFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target.result);
        if (Array.isArray(data.expenses)) {
          onRestoreExpenses(data.expenses);
          if (data.settings) onSaveSettings(data.settings);
          alert('Backup restored successfully!');
        } else {
          alert('Invalid backup file structure.');
        }
      } catch (err) {
        alert('Could not parse JSON backup file.');
      }
    };
    reader.readAsText(file);
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
            <Settings className="w-5 h-5 text-gray-800" />
            <h2 className="text-sm uppercase tracking-wider text-gray-900 font-bold">
              Settings & Preferences
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

        {/* Form Body */}
        <div className="p-6 space-y-5 overflow-y-auto">
          
          {/* Gemini AI API Configuration */}
          <div className="p-4 rounded-2xl bg-white/50 border border-white/60 space-y-3 shadow-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-amber-600" />
                <h3 className="text-xs font-bold uppercase text-gray-900 tracking-wider">
                  Gemini Flash AI Engine
                </h3>
              </div>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-white/60 text-gray-700 border border-white/60">
                Optional
              </span>
            </div>

            <p className="text-xs text-gray-700 leading-relaxed font-sans">
              The app includes a <strong className="text-gray-900">smart offline parser</strong> out of the box. Adding a free Gemini API key unlocks deeper nuance, relative dates ("last tuesday"), multi-currency handling, and complex itemization.
            </p>

            <div>
              <label className="block text-[11px] font-bold uppercase text-gray-700 mb-1">
                Gemini API Key
              </label>
              <div className="flex space-x-2">
                <input
                  type="password"
                  value={formData.apiKey}
                  onChange={(e) => handleChange('apiKey', e.target.value)}
                  placeholder="AIzaSy..."
                  className="flex-1 bg-white/70 focus:bg-white/90 border border-white/60 rounded-xl px-3.5 py-2 text-xs text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-900"
                />
                <button
                  onClick={handleTestKey}
                  disabled={isTesting || !formData.apiKey}
                  className="px-3.5 py-2 rounded-xl bg-gray-900 hover:bg-black text-white text-xs font-semibold shadow-sm transition-all shrink-0 disabled:opacity-50"
                >
                  {isTesting ? 'Testing...' : 'Test'}
                </button>
              </div>
              {testStatus && (
                <div className="text-xs font-semibold mt-1 text-emerald-800">
                  {testStatus}
                </div>
              )}
            </div>

            {/* Model Selector */}
            <div>
              <label className="block text-[11px] font-bold uppercase text-gray-700 mb-1">
                AI Model Tier
              </label>
              <select
                value={formData.aiModel}
                onChange={(e) => handleChange('aiModel', e.target.value)}
                className="w-full bg-white/70 border border-white/60 rounded-xl px-3.5 py-2 text-xs font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900"
              >
                <option value="gemini-2.5-flash">Gemini 2.5 Flash (Fastest & Recommended)</option>
                <option value="gemini-1.5-flash">Gemini 1.5 Flash</option>
                <option value="gemini-1.5-pro">Gemini 1.5 Pro (Deep Reasoning)</option>
              </select>
            </div>
          </div>

          {/* Preferences */}
          <div className="space-y-3">
            <h3 className="text-xs uppercase tracking-wider font-bold text-gray-800">
              User Experience & Locale
            </h3>

            {/* Currency Selector */}
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-white/40 border border-white/50 shadow-xs">
              <span className="text-xs text-gray-900 font-bold">Default Currency</span>
              <select
                value={formData.currency}
                onChange={(e) => handleChange('currency', e.target.value)}
                className="bg-white/70 border border-white/60 rounded-xl px-3 py-1.5 text-xs text-gray-900 font-bold focus:outline-none focus:ring-2 focus:ring-gray-900"
              >
                {CURRENCIES.map(c => (
                  <option key={c.symbol} value={c.symbol}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Category Taxonomy & AI Memory Button */}
            {onOpenCategories && (
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-white/40 border border-white/50 shadow-xs">
                <div className="flex items-center space-x-2.5">
                  <SlidersHorizontal className="w-4 h-4 text-gray-800 shrink-0" />
                  <div>
                    <div className="text-xs font-bold text-gray-900">Categories & AI Memory</div>
                    <div className="text-[11px] text-gray-600 font-medium">Add, edit, remove categories & inspect learned rules</div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    playLaserClick(soundEnabled);
                    triggerHaptic(15, hapticsEnabled);
                    onClose();
                    onOpenCategories();
                  }}
                  className="px-3.5 py-1.5 text-xs font-bold text-white bg-gray-900 hover:bg-black rounded-xl transition-all shadow-sm shrink-0"
                >
                  Manage
                </button>
              </div>
            )}

            {/* Audio Toggle */}
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-white/40 border border-white/50 shadow-xs">
              <div className="flex items-center space-x-2.5">
                {formData.soundEnabled ? (
                  <Volume2 className="w-4 h-4 text-amber-600" />
                ) : (
                  <VolumeX className="w-4 h-4 text-gray-400" />
                )}
                <div>
                  <div className="text-xs font-bold text-gray-900">Audio Feedback</div>
                  <div className="text-[11px] text-gray-600 font-medium">Sound cues on speech dictation & expense logging</div>
                </div>
              </div>
              <input
                type="checkbox"
                checked={formData.soundEnabled}
                onChange={(e) => handleChange('soundEnabled', e.target.checked)}
                className="w-4 h-4 accent-gray-900 rounded cursor-pointer"
              />
            </div>

            {/* Haptics Toggle */}
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-white/40 border border-white/50 shadow-xs">
              <div className="flex items-center space-x-2.5">
                <Smartphone className="w-4 h-4 text-amber-600" />
                <div>
                  <div className="text-xs font-bold text-gray-900">Haptic Vibration</div>
                  <div className="text-[11px] text-gray-600 font-medium">Tactile pulse on phone button taps</div>
                </div>
              </div>
              <input
                type="checkbox"
                checked={formData.hapticsEnabled}
                onChange={(e) => handleChange('hapticsEnabled', e.target.checked)}
                className="w-4 h-4 accent-gray-900 rounded cursor-pointer"
              />
            </div>
          </div>

          {/* Backup & Data Management */}
          <div className="space-y-3 pt-2 border-t border-gray-200/60">
            <h3 className="text-xs uppercase tracking-wider font-bold text-gray-800">
              Data Management & Backup
            </h3>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => exportBackup(expenses, formData)}
                className="py-2.5 px-3 rounded-xl bg-white/50 hover:bg-white/70 border border-white/60 text-xs font-bold text-gray-900 flex items-center justify-center space-x-1.5 transition-colors shadow-xs"
              >
                <Download className="w-3.5 h-3.5 text-gray-800" />
                <span>JSON Backup</span>
              </button>

              <label className="py-2.5 px-3 rounded-xl bg-white/50 hover:bg-white/70 border border-white/60 text-xs font-bold text-gray-900 flex items-center justify-center space-x-1.5 transition-colors shadow-xs cursor-pointer text-center">
                <Upload className="w-3.5 h-3.5 text-gray-800" />
                <span>Restore JSON</span>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleRestoreFile}
                  className="hidden"
                />
              </label>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => {
                  if (confirm('Reset to initial sample business expenses?')) {
                    onResetExpenses(INITIAL_EXPENSES);
                  }
                }}
                className="flex-1 py-2 px-3 rounded-xl bg-white/40 hover:bg-white/65 border border-white/50 text-xs text-gray-800 font-semibold transition-colors"
              >
                Reload Demo Data
              </button>

              <button
                onClick={() => {
                  if (confirm('Are you sure you want to purge all expenses? This cannot be undone.')) {
                    onResetExpenses([]);
                  }
                }}
                className="py-2 px-3 rounded-xl border border-red-300 text-xs text-red-700 bg-white/40 hover:bg-red-50 font-semibold transition-colors"
              >
                Clear Ledger
              </button>
            </div>
          </div>

          {/* Version Info */}
          <div className="text-center text-xs text-gray-600 font-medium pt-1">
            Nexus Ledger PWA • Local-First & Cloud Synchronized
          </div>

        </div>

      </div>
    </div>
  );
}
