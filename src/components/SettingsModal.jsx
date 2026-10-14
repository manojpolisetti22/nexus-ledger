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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 pt-[calc(env(safe-area-inset-top,0px)+16px)] pb-[calc(env(safe-area-inset-bottom,0px)+16px)] bg-space-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="w-full max-w-lg glass-panel bg-space-900 border border-cyan-500/30 rounded-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between bg-space-950/40">
          <div className="flex items-center space-x-2">
            <Settings className="w-5 h-5 text-cyan-400" />
            <h2 className="font-mono text-xs uppercase tracking-wider text-slate-200 font-bold">
              System Parameters // Settings
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

        {/* Form Body */}
        <div className="p-5 space-y-5 overflow-y-auto">
          
          {/* Gemini AI API Configuration */}
          <div className="p-4 rounded-xl bg-space-950/70 border border-cyan-500/20 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                <h3 className="text-xs font-mono font-bold uppercase text-slate-200">
                  Gemini Flash AI Engine
                </h3>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                Optional
              </span>
            </div>

            <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
              The app includes a <strong className="text-slate-200">smart offline parser</strong> out of the box. Adding a free Gemini API key unlocks deeper nuance, relative dates ("last tuesday"), multi-currency handling, and complex itemization.
            </p>

            <div>
              <label className="block text-[10px] font-mono uppercase text-slate-400 mb-1">
                Gemini API Key
              </label>
              <div className="flex space-x-2">
                <input
                  type="password"
                  value={formData.apiKey}
                  onChange={(e) => handleChange('apiKey', e.target.value)}
                  placeholder="AIzaSy..."
                  className="flex-1 bg-space-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 font-mono focus:outline-none focus:border-cyan-400"
                />
                <button
                  onClick={handleTestKey}
                  disabled={isTesting || !formData.apiKey}
                  className="px-3 py-2 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 text-xs font-mono hover:bg-cyan-500/30 transition-all shrink-0"
                >
                  {isTesting ? 'Testing...' : 'Test'}
                </button>
              </div>
              {testStatus && (
                <div className="text-[11px] font-mono mt-1 text-cyan-400">
                  {testStatus}
                </div>
              )}
            </div>

            {/* Model Selector */}
            <div>
              <label className="block text-[10px] font-mono uppercase text-slate-400 mb-1">
                AI Model Tier
              </label>
              <select
                value={formData.aiModel}
                onChange={(e) => handleChange('aiModel', e.target.value)}
                className="w-full bg-space-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 font-mono focus:outline-none focus:border-cyan-400"
              >
                <option value="gemini-2.5-flash">Gemini 2.5 Flash (Fastest & Recommended)</option>
                <option value="gemini-1.5-flash">Gemini 1.5 Flash</option>
                <option value="gemini-1.5-pro">Gemini 1.5 Pro (Deep Reasoning)</option>
              </select>
            </div>
          </div>

          {/* Preferences */}
          <div className="space-y-3">
            <h3 className="text-xs font-mono uppercase tracking-wider text-slate-400">
              User Experience & Locale
            </h3>

            {/* Currency Selector */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-space-950/60 border border-slate-800">
              <span className="text-xs text-slate-200 font-medium">Default Currency</span>
              <select
                value={formData.currency}
                onChange={(e) => handleChange('currency', e.target.value)}
                className="bg-space-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-cyan-300 font-mono focus:outline-none"
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
              <div className="flex items-center justify-between p-3 rounded-xl bg-cyan-950/20 border border-cyan-500/30">
                <div className="flex items-center space-x-2.5">
                  <SlidersHorizontal className="w-4 h-4 text-cyan-400 shrink-0" />
                  <div>
                    <div className="text-xs font-semibold text-slate-200">Category & AI Memory Taxonomy</div>
                    <div className="text-[10px] text-slate-400">Add, edit, remove categories & inspect learned rules</div>
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
                  className="px-3 py-1.5 text-xs font-mono font-medium text-cyan-300 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/40 rounded-lg transition-colors shrink-0"
                >
                  Manage
                </button>
              </div>
            )}

            {/* Audio Toggle */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-space-950/60 border border-slate-800">
              <div className="flex items-center space-x-2">
                {formData.soundEnabled ? (
                  <Volume2 className="w-4 h-4 text-cyan-400" />
                ) : (
                  <VolumeX className="w-4 h-4 text-slate-500" />
                )}
                <div>
                  <div className="text-xs font-semibold text-slate-200">Cybernetic Audio Effects</div>
                  <div className="text-[10px] text-slate-500">Synthesized audio cues on speech & logging</div>
                </div>
              </div>
              <input
                type="checkbox"
                checked={formData.soundEnabled}
                onChange={(e) => handleChange('soundEnabled', e.target.checked)}
                className="w-4 h-4 accent-cyan-400 rounded cursor-pointer"
              />
            </div>

            {/* Haptics Toggle */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-space-950/60 border border-slate-800">
              <div className="flex items-center space-x-2">
                <Smartphone className="w-4 h-4 text-cyan-400" />
                <div>
                  <div className="text-xs font-semibold text-slate-200">Haptic Vibration</div>
                  <div className="text-[10px] text-slate-500">Tactile pulse on phone button taps</div>
                </div>
              </div>
              <input
                type="checkbox"
                checked={formData.hapticsEnabled}
                onChange={(e) => handleChange('hapticsEnabled', e.target.checked)}
                className="w-4 h-4 accent-cyan-400 rounded cursor-pointer"
              />
            </div>
          </div>

          {/* Backup & Danger Zone */}
          <div className="space-y-3 pt-2 border-t border-slate-800">
            <h3 className="text-xs font-mono uppercase tracking-wider text-slate-400">
              Data Management & Backup
            </h3>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => exportBackup(expenses, formData)}
                className="py-2.5 px-3 rounded-xl bg-space-850 border border-slate-700 text-xs text-slate-200 hover:border-cyan-400 flex items-center justify-center space-x-1.5 transition-colors font-mono"
              >
                <Download className="w-3.5 h-3.5 text-cyan-400" />
                <span>JSON Backup</span>
              </button>

              <label className="py-2.5 px-3 rounded-xl bg-space-850 border border-slate-700 text-xs text-slate-200 hover:border-cyan-400 flex items-center justify-center space-x-1.5 transition-colors font-mono cursor-pointer text-center">
                <Upload className="w-3.5 h-3.5 text-cyan-400" />
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
                className="flex-1 py-2 px-3 rounded-xl border border-slate-800 text-[11px] text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors font-mono"
              >
                Reload Demo Data
              </button>

              <button
                onClick={() => {
                  if (confirm('Are you sure you want to purge all expenses? This cannot be undone.')) {
                    onResetExpenses([]);
                  }
                }}
                className="py-2 px-3 rounded-xl border border-rose-500/30 text-[11px] text-rose-400 hover:bg-rose-500/10 transition-colors font-mono"
              >
                Clear Ledger
              </button>
            </div>
          </div>

          {/* Version Info */}
          <div className="text-center text-[10px] font-mono text-slate-500 pt-1">
            NEXUS EXPENSE PWA v1.0 • QUANTUM LOCAL-FIRST STORAGE
          </div>

        </div>

      </div>
    </div>
  );
}
