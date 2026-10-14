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
    <header className="sticky top-0 z-40 w-full bg-space-950/85 backdrop-blur-xl border-b border-cyan-500/20 px-4 pt-[calc(env(safe-area-inset-top,0px)+12px)] pb-3 shadow-lg">
      <div className="max-w-2xl mx-auto flex items-center justify-between">
        
        {/* Brand / Logo */}
        <div className="flex items-center space-x-2.5">
          <div className="relative flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500/20 to-violet-500/20 border border-cyan-400/40 shadow-neon-cyan">
            <Zap className="w-5 h-5 text-cyan-400 animate-pulse" />
            <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping opacity-75" />
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="font-mono text-xs tracking-wider font-extrabold uppercase bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-sky-300 to-violet-400">
                NEXUS
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
                LEDGER
              </span>
            </div>
            <div className="flex items-center space-x-2 text-[10px] text-slate-400 font-mono">
              <span className="flex items-center space-x-1">
                <span className={`w-1.5 h-1.5 rounded-full ${
                  currentUser 
                    ? 'bg-emerald-400 shadow-[0_0_8px_#10B981]' 
                    : isOnline ? 'bg-cyan-400 shadow-[0_0_8px_#06B6D4]' : 'bg-rose-400'
                }`} />
                <span>{currentUser ? 'CLOUD SYNC' : (isOnline ? 'LOCAL' : 'OFFLINE')}</span>
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
            className="hidden sm:flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-space-850/80 border border-cyan-500/20 text-xs font-mono text-cyan-300 hover:border-cyan-400/50 transition-all"
            title="Monthly Telemetry"
          >
            <span className="text-[10px] text-slate-400 uppercase">MO:</span>
            <span className="font-semibold">{currency}{totalMonth.toFixed(0)}</span>
          </button>

          {/* Cloud Sync Button */}
          <button
            onClick={() => handleClick(onOpenAuth)}
            className={`flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-mono transition-all ${
              currentUser
                ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/25'
                : 'bg-cyan-500/15 border-cyan-500/40 text-cyan-300 hover:bg-cyan-500/25 shadow-sm'
            }`}
            title={currentUser ? `Synced: ${currentUser.email}` : "Connect Cloud Sync (Phone + Laptop)"}
          >
            <span className="relative flex h-2 w-2">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${currentUser ? 'bg-emerald-400' : 'bg-cyan-400'}`} />
              <span className={`relative inline-flex rounded-full h-2 w-2 ${currentUser ? 'bg-emerald-500' : 'bg-cyan-500'}`} />
            </span>
            <span className="text-[11px] font-semibold">{currentUser ? 'SYNCED' : 'SYNC'}</span>
          </button>

          {/* Install to Home Screen Button */}
          {!isPwaInstalled && (
            <button
              onClick={() => handleClick(onOpenInstall)}
              className="flex items-center space-x-1 px-2.5 py-1.5 rounded-lg bg-gradient-to-r from-cyan-500/20 to-violet-500/20 border border-cyan-400/40 text-cyan-300 text-xs font-medium hover:brightness-125 transition-all shadow-sm"
              title="Add to Home Screen"
            >
              <Download className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden xs:inline">App</span>
            </button>
          )}

          {/* Analytics Modal Button */}
          <button
            onClick={() => handleClick(onOpenAnalytics)}
            className="p-2 rounded-lg bg-space-850/80 border border-slate-700/60 text-slate-300 hover:text-cyan-400 hover:border-cyan-500/40 transition-colors"
            title="Spending Telemetry"
          >
            <BarChart3 className="w-4 h-4" />
          </button>

          {/* Settings Modal Button */}
          <button
            onClick={() => handleClick(onOpenSettings)}
            className="p-2 rounded-lg bg-space-850/80 border border-slate-700/60 text-slate-300 hover:text-cyan-400 hover:border-cyan-500/40 transition-colors"
            title="Settings & AI Config"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>

      </div>
    </header>
  );
}
