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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div 
        className="w-full max-w-md bg-space-900 border border-cyan-500/30 rounded-2xl p-5 shadow-2xl relative overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Holographic Top Glow */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-400 via-sky-400 to-violet-500" />
        <div className="absolute -top-16 -right-16 w-32 h-32 bg-cyan-500/20 rounded-full blur-2xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-cyan-500/15">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/15 border border-cyan-400/40 flex items-center justify-center text-cyan-400">
              <Cloud className="w-4 h-4 animate-pulse" />
            </div>
            <div>
              <h3 className="font-mono text-sm font-bold text-white tracking-wide uppercase">
                Cloud Sync & Auth
              </h3>
              <p className="text-[11px] text-slate-400 font-mono">
                Real-Time Multi-Device Sync
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              playLaserClick(soundEnabled);
              onClose();
            }}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-space-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Device Sync Illustration Banner */}
        <div className="mt-4 p-3 rounded-xl bg-space-850/80 border border-slate-700/50 flex items-center justify-between">
          <div className="flex items-center space-x-2 text-slate-300">
            <Smartphone className="w-4 h-4 text-cyan-400" />
            <span className="text-xs font-mono">Phone</span>
          </div>
          <div className="flex items-center space-x-1.5 text-cyan-400">
            <div className="w-2 h-0.5 bg-cyan-500/40" />
            <ArrowRightLeft className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
            <div className="w-2 h-0.5 bg-cyan-500/40" />
          </div>
          <div className="flex items-center space-x-2 text-slate-300">
            <Laptop className="w-4 h-4 text-violet-400" />
            <span className="text-xs font-mono">Laptop</span>
          </div>
        </div>

        {/* Alerts */}
        {errorMsg && (
          <div className="mt-3 p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 flex items-center space-x-2 text-rose-300 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{errorMsg}</span>
          </div>
        )}
        {successMsg && (
          <div className="mt-3 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center space-x-2 text-emerald-300 text-xs">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            <span>{successMsg}</span>
          </div>
        )}

        {currentUser ? (
          /* Logged In State */
          <div className="mt-4 space-y-4">
            <div className="p-3.5 rounded-xl bg-cyan-950/20 border border-cyan-500/30">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400 font-mono">Connected User</span>
                <span className="flex items-center space-x-1.5 text-[11px] font-mono text-emerald-400">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#10B981] animate-ping" />
                  <span>ONLINE & SYNCED</span>
                </span>
              </div>
              <p className="mt-1 text-sm font-medium text-white truncate font-mono">
                {currentUser.email}
              </p>
              <p className="mt-1 text-[11px] text-slate-400">
                Any changes made here or on your phone update immediately in real-time.
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <button
                onClick={handleManualSync}
                disabled={syncing}
                className="w-full flex items-center justify-center space-x-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-sky-500 hover:from-cyan-400 hover:to-sky-400 text-black font-semibold text-xs tracking-wide uppercase transition-all shadow-neon-cyan disabled:opacity-50"
              >
                {syncing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Synchronizing...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Push Local Expenses to Cloud</span>
                  </>
                )}
              </button>

              <button
                onClick={handleSignOut}
                className="w-full flex items-center justify-center space-x-1.5 py-2 px-3 rounded-xl bg-space-800 hover:bg-space-750 border border-slate-700 text-slate-300 hover:text-rose-400 text-xs font-mono transition-colors"
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
            <div className="grid grid-cols-2 p-1 rounded-xl bg-space-850 border border-slate-800 mb-4">
              <button
                type="button"
                onClick={() => {
                  setTab('signin');
                  setErrorMsg('');
                  setSuccessMsg('');
                }}
                className={`py-1.5 rounded-lg text-xs font-mono font-medium transition-all ${
                  tab === 'signin'
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
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
                className={`py-1.5 rounded-lg text-xs font-mono font-medium transition-all ${
                  tab === 'signup'
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Create Account
              </button>
            </div>

            <form onSubmit={handleAction} className="space-y-3">
              <div>
                <label className="block text-[11px] font-mono text-slate-400 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-space-850 border border-slate-700 text-slate-100 text-xs placeholder:text-slate-600 focus:outline-none focus:border-cyan-400 transition-colors font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-mono text-slate-400 mb-1">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-space-850 border border-slate-700 text-slate-100 text-xs placeholder:text-slate-600 focus:outline-none focus:border-cyan-400 transition-colors font-mono"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 flex items-center justify-center space-x-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-sky-500 hover:from-cyan-400 hover:to-sky-400 text-black font-semibold text-xs tracking-wider uppercase transition-all shadow-neon-cyan disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>{tab === 'signin' ? 'Sign In & Sync' : 'Create & Link'}</span>
                  </>
                )}
              </button>
            </form>

            <div className="mt-4 pt-3 border-t border-slate-800 text-center">
              <p className="text-[11px] text-slate-400">
                Log in with the same email on your phone and laptop to share the same live ledger.
              </p>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
