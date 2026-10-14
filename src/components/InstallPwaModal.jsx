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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 pt-[calc(env(safe-area-inset-top,0px)+16px)] pb-[calc(env(safe-area-inset-bottom,0px)+16px)] bg-black/30 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="w-full max-w-md bg-white/80 sm:bg-white/85 backdrop-blur-2xl border border-white/60 rounded-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200/60 flex items-center justify-between bg-white/40">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-gray-900 flex items-center justify-center text-amber-400 shadow-sm">
              <Smartphone className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-gray-900">
                Dedicated App
              </h2>
              <p className="text-[11px] text-gray-600 font-medium">Home Screen Installation</p>
            </div>
          </div>
          <button
            onClick={() => {
              playLaserClick(soundEnabled);
              onClose();
            }}
            className="p-1.5 rounded-xl text-gray-500 hover:text-gray-900 hover:bg-white/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-5 sm:p-6 space-y-4 overflow-y-auto">
          
          <div className="text-center pb-2">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400/20 to-orange-500/20 border border-amber-500/30 shadow-md flex items-center justify-center mx-auto mb-3">
              <Zap className="w-7 h-7 text-amber-600" />
            </div>
            <h3 className="font-bold text-base text-gray-900">
              Install Nexus to Home Screen
            </h3>
            <p className="text-xs text-gray-600 mt-1 max-w-xs mx-auto leading-relaxed">
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
              className="w-full py-3 px-4 rounded-xl bg-gray-900 text-white font-bold text-xs uppercase tracking-wider shadow-md flex items-center justify-center space-x-2 hover:bg-black active:scale-98 transition-all"
            >
              <Download className="w-4 h-4" />
              <span>1-Tap Install App Now</span>
            </button>
          )}

          {/* Step-by-Step Instructions */}
          <div className="space-y-3 pt-2">
            
            {/* iOS Safari Guide */}
            <div className={`p-4 rounded-2xl border transition-all ${isIOS ? 'border-amber-500/40 bg-amber-500/10 shadow-sm' : 'border-white/50 bg-white/40'}`}>
              <div className="flex items-center space-x-2 mb-2.5 text-xs font-bold text-gray-900">
                <span className="w-5 h-5 rounded-full bg-amber-500/20 flex items-center justify-center text-[10px] text-amber-800 border border-amber-500/30 font-bold">
                  iOS
                </span>
                <span>iPhone / iPad (Safari)</span>
              </div>
              <ol className="text-xs text-gray-700 space-y-2 list-decimal list-inside font-medium pl-1">
                <li className="flex items-center space-x-2">
                  <span>1. Tap the</span>
                  <span className="inline-flex items-center px-2 py-0.5 rounded-lg bg-white/80 text-gray-900 text-[11px] font-semibold border border-gray-200 shadow-sm">
                    <Share className="w-3 h-3 mr-1 text-gray-700" /> Share
                  </span>
                  <span>button in Safari</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span>2. Scroll down and tap</span>
                  <span className="inline-flex items-center px-2 py-0.5 rounded-lg bg-white/80 text-gray-900 text-[11px] font-semibold border border-gray-200 shadow-sm">
                    <PlusSquare className="w-3 h-3 mr-1 text-gray-700" /> Add to Home Screen
                  </span>
                </li>
                <li>
                  <span>3. Tap <strong className="text-gray-900 font-bold">"Add"</strong> in the top-right corner</span>
                </li>
              </ol>
            </div>

            {/* Android Chrome Guide */}
            <div className={`p-4 rounded-2xl border transition-all ${!isIOS ? 'border-amber-500/40 bg-amber-500/10 shadow-sm' : 'border-white/50 bg-white/40'}`}>
              <div className="flex items-center space-x-2 mb-2.5 text-xs font-bold text-gray-900">
                <span className="w-5 h-5 rounded-full bg-orange-500/20 flex items-center justify-center text-[10px] text-orange-800 border border-orange-500/30 font-bold">
                  AND
                </span>
                <span>Android (Chrome / Brave / Edge)</span>
              </div>
              <ol className="text-xs text-gray-700 space-y-2 list-decimal list-inside font-medium pl-1">
                <li className="flex items-center space-x-2">
                  <span>1. Tap the</span>
                  <span className="inline-flex items-center px-2 py-0.5 rounded-lg bg-white/80 text-gray-900 text-[11px] font-semibold border border-gray-200 shadow-sm">
                    <MoreVertical className="w-3 h-3 mr-1 text-gray-700" /> Menu
                  </span>
                  <span>(three dots)</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span>2. Select</span>
                  <span className="inline-flex items-center px-2 py-0.5 rounded-lg bg-white/80 text-gray-900 text-[11px] font-semibold border border-gray-200 shadow-sm">
                    <Download className="w-3 h-3 mr-1 text-gray-700" /> Install App
                  </span>
                  <span>or "Add to Home"</span>
                </li>
              </ol>
            </div>

          </div>

          {/* Benefits Grid */}
          <div className="grid grid-cols-2 gap-2 pt-2 text-xs font-semibold text-gray-700">
            <div className="flex items-center space-x-2 p-2.5 rounded-xl bg-white/40 border border-white/50">
              <WifiOff className="w-4 h-4 text-gray-800 shrink-0" />
              <span>Offline Caching</span>
            </div>
            <div className="flex items-center space-x-2 p-2.5 rounded-xl bg-white/40 border border-white/50">
              <Zap className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Instant Launch</span>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
