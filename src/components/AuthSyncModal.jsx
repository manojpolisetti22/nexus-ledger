import React, { useState } from 'react';
import { 
  X, 
  Cloud, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  LogOut, 
  Smartphone, 
  Laptop, 
  ArrowRightLeft,
  Mail,
  Lock,
  Sparkles,
  ShieldCheck
} from 'lucide-react';
import { playLaserClick, playCashChime } from '../utils/sound';
import { triggerHaptic } from '../utils/haptics';
import { signInWithEmail, signUpWithEmail, signOutUser, syncLocalToCloud } from '../utils/supabase';

export function AuthSyncModal({
  isOpen,
  onClose,
  currentUser,
  expenses,
  onSyncComplete,
  soundEnabled,
  hapticsEnabled
}) {
  const [tab, setTab] = useState('signin'); // 'signin' | 'signup'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  const handleAction = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setLoading(true);
    triggerHaptic(15, hapticsEnabled);

    try {
      if (tab === 'signup') {
        const data = await signUpWithEmail(email, password);
        playCashChime(soundEnabled);
        if (data?.session) {
          setSuccessMsg('Account created! Connected to cloud sync.');
        } else {
          setSuccessMsg('Account created! Check your email to confirm if verification is enabled.');
        }
      } else {
        await signInWithEmail(email, password);
        playCashChime(soundEnabled);
        setSuccessMsg('Successfully signed in! Synchronizing your ledger...');
      }
    } catch (err) {
      setErrorMsg(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleManualSync = async () => {
    if (!currentUser) return;
    setSyncing(true);
    setErrorMsg('');
    setSuccessMsg('');
    try {
      const synced = await syncLocalToCloud(expenses, currentUser.id);
      playCashChime(soundEnabled);
      setSuccessMsg(`Successfully synced ${synced.length} expenses to cloud!`);
      if (onSyncComplete) onSyncComplete();
    } catch (err) {
      setErrorMsg(err.message || 'Failed to sync local data to cloud.');
    } finally {
      setSyncing(false);
    }
  };

  const handleSignOut = async () => {
    triggerHaptic(20, hapticsEnabled);
    try {
      await signOutUser();
      playLaserClick(soundEnabled);
      setSuccessMsg('');
    } catch (err) {
      setErrorMsg(err.message || 'Failed to sign out');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 pt-[calc(env(safe-area-inset-top,0px)+16px)] pb-[calc(env(safe-area-inset-bottom,0px)+16px)] bg-black/30 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="w-full max-w-md bg-white/80 sm:bg-white/85 backdrop-blur-2xl border border-white/60 rounded-3xl p-5 sm:p-6 shadow-2xl relative overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-gray-200/60">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-gray-900 flex items-center justify-center text-amber-400 shadow-sm">
              <Cloud className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-900">
                Cloud Sync & Auth
              </h3>
              <p className="text-[11px] text-gray-600 font-medium">
                Real-Time Multi-Device Sync
              </p>
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

        {/* Device Sync Illustration Banner */}
        <div className="mt-4 p-3 rounded-2xl bg-white/40 border border-white/50 flex items-center justify-between">
          <div className="flex items-center space-x-2 text-gray-800">
            <Smartphone className="w-4 h-4 text-amber-600" />
            <span className="text-xs font-semibold">Phone</span>
          </div>
          <div className="flex items-center space-x-1.5 text-amber-600">
            <div className="w-2 h-0.5 bg-amber-500/40" />
            <ArrowRightLeft className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
            <div className="w-2 h-0.5 bg-amber-500/40" />
          </div>
          <div className="flex items-center space-x-2 text-gray-800">
            <Laptop className="w-4 h-4 text-orange-600" />
            <span className="text-xs font-semibold">Laptop</span>
          </div>
        </div>

        {/* Alerts */}
        {errorMsg && (
          <div className="mt-3 p-3 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center space-x-2 text-red-800 text-xs font-medium">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-700" />
            <span>{errorMsg}</span>
          </div>
        )}
        {successMsg && (
          <div className="mt-3 p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center space-x-2 text-emerald-800 text-xs font-medium">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-700" />
            <span>{successMsg}</span>
          </div>
        )}

        {currentUser ? (
          /* Logged In State */
          <div className="mt-4 space-y-4">
            <div className="p-4 rounded-2xl bg-white/40 border border-white/50">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-600 font-medium">Connected User</span>
                <span className="flex items-center space-x-1.5 text-[11px] font-bold text-emerald-700">
                  <span className="w-2 h-2 rounded-full bg-emerald-600 animate-ping" />
                  <span>ONLINE & SYNCED</span>
                </span>
              </div>
              <p className="mt-1 text-sm font-bold text-gray-900 truncate">
                {currentUser.email}
              </p>
              <p className="mt-1 text-[11px] text-gray-600 font-medium">
                Any changes made here or on your phone update immediately in real-time.
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <button
                onClick={handleManualSync}
                disabled={syncing}
                className="w-full flex items-center justify-center space-x-2 py-3 px-4 rounded-xl bg-gray-900 hover:bg-black text-white font-bold text-xs tracking-wider uppercase transition-all shadow-md active:scale-98 disabled:opacity-50"
              >
                {syncing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Synchronizing...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <span>Push Local Expenses to Cloud</span>
                  </>
                )}
              </button>

              <button
                onClick={handleSignOut}
                className="w-full flex items-center justify-center space-x-1.5 py-2.5 px-3 rounded-xl bg-white/40 hover:bg-red-500/10 border border-white/50 hover:border-red-500/30 text-gray-700 hover:text-red-700 text-xs font-semibold transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        ) : (
          /* Logged Out / Auth Forms */
          <div className="mt-4">
            {/* Tabs */}
            <div className="grid grid-cols-2 p-1 rounded-2xl bg-white/40 border border-white/50 mb-4">
              <button
                type="button"
                onClick={() => {
                  setTab('signin');
                  setErrorMsg('');
                  setSuccessMsg('');
                }}
                className={`py-2 rounded-xl text-xs font-semibold transition-all ${
                  tab === 'signin'
                    ? 'bg-gray-900 text-white shadow-md'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => {
                  setTab('signup');
                  setErrorMsg('');
                  setSuccessMsg('');
                }}
                className={`py-2 rounded-xl text-xs font-semibold transition-all ${
                  tab === 'signup'
                    ? 'bg-gray-900 text-white shadow-md'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Create Account
              </button>
            </div>

            <form onSubmit={handleAction} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 w-4 h-4 text-gray-500" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-white/70 focus:bg-white/95 border border-white/60 text-gray-900 text-xs placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-900 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 w-4 h-4 text-gray-500" />
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-white/70 focus:bg-white/95 border border-white/60 text-gray-900 text-xs placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-900 transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 flex items-center justify-center space-x-2 py-3 px-4 rounded-xl bg-gray-900 hover:bg-black text-white font-bold text-xs tracking-wider uppercase transition-all shadow-md active:scale-98 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4 text-amber-400" />
                    <span>{tab === 'signin' ? 'Sign In & Sync' : 'Create & Link'}</span>
                  </>
                )}
              </button>
            </form>

            <div className="mt-4 pt-3 border-t border-gray-200/60 text-center">
              <p className="text-[11px] text-gray-600 font-medium">
                Log in with the same email on your phone and laptop to share the same live ledger.
              </p>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
