import React, { useState, useEffect } from 'react';
import { 
  Zap, 
  Settings, 
  BarChart3, 
  Download, 
  Sparkles,
  Wifi,
  ShieldCheck
} from 'lucide-react';
import { playLaserClick } from '../utils/sound';
import { triggerHaptic } from '../utils/haptics';

export function Header({ 
  onOpenSettings, 
  onOpenAnalytics, 
  onOpenInstall, 
  onOpenAuth,
  currentUser,
  isPwaInstalled, 
  soundEnabled, 
  hapticsEnabled,
  totalMonth,
  currency = '$'
}) {
  const [time, setTime] = useState('');
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      clearInterval(interval);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleClick = (callback) => {
    playLaserClick(soundEnabled);
    triggerHaptic(12, hapticsEnabled);
    if (callback) callback();
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-white/45 backdrop-blur-xl border-b border-white/40 px-4 pt-[calc(env(safe-area-inset-top,0px)+12px)] pb-3 shadow-sm">
      <div className="max-w-2xl mx-auto flex items-center justify-between">
        
        {/* Brand / Logo */}
        <div className="flex items-center space-x-2.5">
          <div className="relative flex items-center justify-center w-9 h-9 rounded-2xl bg-gray-900 text-white shadow-md">
            <Zap className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="text-sm font-extrabold tracking-tight text-gray-900 uppercase">
                Nexus
              </span>
              <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded-full bg-white/45 text-gray-800 border border-white/50">
                Ledger
              </span>
            </div>
            <div className="flex items-center space-x-2 text-[11px] text-gray-700 font-medium">
              <span className="flex items-center space-x-1">
                <span className={`w-1.5 h-1.5 rounded-full ${
                  currentUser 
                    ? 'bg-emerald-600' 
                    : isOnline ? 'bg-amber-500' : 'bg-red-600'
                }`} />
                <span>{currentUser ? 'Cloud Synced' : (isOnline ? 'Local' : 'Offline')}</span>
              </span>
              <span>•</span>
              <span>{time}</span>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-1.5 sm:space-x-2">
          {/* Quick Month Pill */}
          <button 
            onClick={() => handleClick(onOpenAnalytics)}
            className="hidden sm:flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-white/35 hover:bg-white/55 border border-white/45 text-xs text-gray-900 font-semibold shadow-sm transition-all"
            title="Monthly Summary"
          >
            <span className="text-[10px] text-gray-600 uppercase font-medium">Month:</span>
            <span className="font-bold text-gray-900">{currency}{totalMonth.toFixed(0)}</span>
          </button>

          {/* Cloud Sync Button */}
          <button
            onClick={() => handleClick(onOpenAuth)}
            className={`flex items-center space-x-1.5 px-2.5 py-1.5 rounded-full border text-xs font-semibold shadow-sm transition-all ${
              currentUser
                ? 'bg-emerald-500/20 border-emerald-700/25 text-emerald-900 hover:bg-emerald-500/30'
                : 'bg-white/35 hover:bg-white/55 border-white/45 text-gray-900'
            }`}
            title={currentUser ? `Synced: ${currentUser.email}` : "Connect Cloud Sync (Phone + Laptop)"}
          >
            <span className="relative flex h-2 w-2">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${currentUser ? 'bg-emerald-500' : 'bg-amber-400'}`} />
              <span className={`relative inline-flex rounded-full h-2 w-2 ${currentUser ? 'bg-emerald-600' : 'bg-amber-500'}`} />
            </span>
            <span className="text-[11px] font-bold">{currentUser ? 'Synced' : 'Sync'}</span>
          </button>

          {/* Install to Home Screen Button */}
          {!isPwaInstalled && (
            <button
              onClick={() => handleClick(onOpenInstall)}
              className="flex items-center space-x-1 px-2.5 py-1.5 rounded-full bg-white/35 hover:bg-white/55 border border-white/45 text-gray-900 text-xs font-semibold shadow-sm transition-all"
              title="Add to Home Screen"
            >
              <Download className="w-3.5 h-3.5 text-gray-800" />
              <span className="hidden xs:inline">App</span>
            </button>
          )}

          {/* Analytics Modal Button */}
          <button
            onClick={() => handleClick(onOpenAnalytics)}
            className="p-2 rounded-xl bg-white/35 hover:bg-white/55 border border-white/45 text-gray-800 hover:text-black shadow-sm transition-all"
            title="Spending Analytics"
          >
            <BarChart3 className="w-4 h-4" />
          </button>

          {/* Settings Modal Button */}
          <button
            onClick={() => handleClick(onOpenSettings)}
            className="p-2 rounded-xl bg-white/35 hover:bg-white/55 border border-white/45 text-gray-800 hover:text-black shadow-sm transition-all"
            title="Settings"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>

      </div>
    </header>
  );
}
