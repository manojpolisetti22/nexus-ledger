import React from 'react';
import { 
  X, 
  Smartphone, 
  Share, 
  PlusSquare, 
  MoreVertical, 
  CheckCircle, 
  Download,
  Zap,
  ShieldCheck,
  WifiOff
} from 'lucide-react';
import { playLaserClick } from '../utils/sound';

export function InstallPwaModal({ 
  isOpen, 
  onClose, 
  installPrompt, 
  onTriggerInstall, 
  soundEnabled = true 
}) {
  if (!isOpen) return null;

  const isIOS = typeof navigator !== 'undefined' && /iPad|iPhone|iPod/.test(navigator.userAgent);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 pt-[calc(env(safe-area-inset-top,0px)+16px)] pb-[calc(env(safe-area-inset-bottom,0px)+16px)] bg-space-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="w-full max-w-md glass-panel bg-space-900 border border-cyan-500/30 rounded-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between bg-space-950/40">
          <div className="flex items-center space-x-2">
            <Smartphone className="w-5 h-5 text-cyan-400" />
            <h2 className="font-mono text-xs uppercase tracking-wider text-slate-200 font-bold">
              Dedicated Home Screen App
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

        {/* Modal Content */}
        <div className="p-5 space-y-4 overflow-y-auto">
          
          <div className="text-center pb-2">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-violet-500/20 border border-cyan-400/40 shadow-neon-cyan flex items-center justify-center mx-auto mb-2.5">
              <Zap className="w-7 h-7 text-cyan-400" />
            </div>
            <h3 className="font-mono font-bold text-base text-slate-100">
              Install Nexus to Home Screen
            </h3>
            <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
              Get an instant full-screen app on your phone with zero app store hassle and offline support.
            </p>
          </div>

          {/* Native 1-Tap Install Button (if Chrome / Android provides prompt) */}
          {installPrompt && (
            <button
              onClick={() => {
                onTriggerInstall();
                onClose();
              }}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-violet-600 text-white font-mono text-xs uppercase tracking-wider font-bold shadow-neon-cyan flex items-center justify-center space-x-2 hover:brightness-110 active:scale-98 transition-all"
            >
              <Download className="w-4 h-4" />
              <span>1-Tap Install App Now</span>
            </button>
          )}

          {/* Step-by-Step Instructions */}
          <div className="space-y-3 pt-2">
            
            {/* iOS Safari Guide */}
            <div className={`p-3.5 rounded-xl border ${isIOS ? 'border-cyan-500/40 bg-cyan-950/20' : 'border-slate-800 bg-space-950/40'}`}>
              <div className="flex items-center space-x-2 mb-2 font-mono text-xs font-bold text-cyan-300">
                <span className="w-5 h-5 rounded-full bg-cyan-500/20 flex items-center justify-center text-[10px] text-cyan-300 border border-cyan-500/40">
                  iOS
                </span>
                <span>iPhone / iPad (Safari)</span>
              </div>
              <ol className="text-xs text-slate-300 space-y-2 list-decimal list-inside font-sans pl-1">
                <li className="flex items-center space-x-2">
                  <span>1. Tap the</span>
                  <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-slate-800 text-cyan-300 font-mono text-[11px] border border-slate-700">
                    <Share className="w-3 h-3 mr-1" /> Share
                  </span>
                  <span>button in Safari</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span>2. Scroll down and tap</span>
                  <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-slate-800 text-cyan-300 font-mono text-[11px] border border-slate-700">
                    <PlusSquare className="w-3 h-3 mr-1" /> Add to Home Screen
                  </span>
                </li>
                <li>
                  <span>3. Tap <strong className="text-cyan-300">"Add"</strong> in the top-right corner</span>
                </li>
              </ol>
            </div>

            {/* Android Chrome Guide */}
            <div className={`p-3.5 rounded-xl border ${!isIOS ? 'border-cyan-500/40 bg-cyan-950/20' : 'border-slate-800 bg-space-950/40'}`}>
              <div className="flex items-center space-x-2 mb-2 font-mono text-xs font-bold text-violet-300">
                <span className="w-5 h-5 rounded-full bg-violet-500/20 flex items-center justify-center text-[10px] text-violet-300 border border-violet-500/40">
                  AND
                </span>
                <span>Android (Chrome / Brave / Edge)</span>
              </div>
              <ol className="text-xs text-slate-300 space-y-2 list-decimal list-inside font-sans pl-1">
                <li className="flex items-center space-x-2">
                  <span>1. Tap the</span>
                  <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-slate-800 text-violet-300 font-mono text-[11px] border border-slate-700">
                    <MoreVertical className="w-3 h-3 mr-1" /> Menu
                  </span>
                  <span>(three dots)</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span>2. Select</span>
                  <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-slate-800 text-violet-300 font-mono text-[11px] border border-slate-700">
                    <Download className="w-3 h-3 mr-1" /> Install App
                  </span>
                  <span>or "Add to Home"</span>
                </li>
              </ol>
            </div>

          </div>

          {/* Benefits Grid */}
          <div className="grid grid-cols-2 gap-2 pt-2 text-[11px] font-mono text-slate-400">
            <div className="flex items-center space-x-1.5 p-2 rounded-lg bg-space-950/40">
              <WifiOff className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <span>Full Offline Caching</span>
            </div>
            <div className="flex items-center space-x-1.5 p-2 rounded-lg bg-space-950/40">
              <Zap className="w-3.5 h-3.5 text-violet-400 shrink-0" />
              <span>Instant Home Launch</span>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
