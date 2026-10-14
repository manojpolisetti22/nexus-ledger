import React, { useState, useRef, useEffect } from 'react';
import { 
  Mic, 
  MicOff, 
  Send, 
  Sparkles, 
  Loader2, 
  ArrowUpRight, 
  CheckCircle2, 
  AlertCircle,
  HelpCircle,
  Edit3
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { startSpeechRecognition, stopSpeechRecognition, isSpeechSupported } from '../utils/speech';
import { playCyberBeep, playVoicePulse, playLaserClick } from '../utils/sound';
import { triggerHaptic } from '../utils/haptics';

const QUICK_CHIPS = [
  "Paid 150 for office supplies",
  "Gas $48 at Chevron",
  "Client lunch $65 yesterday",
  "Software subscription $29"
];

export function ExpenseInputBar({ 
  onLogExpense, 
  onEditRecent,
  soundEnabled = true, 
  hapticsEnabled = true,
  currency = '$'
}) {
  const [inputText, setInputText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [interimText, setInterimText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [recentLogged, setRecentLogged] = useState(null);
  const [statusMessage, setStatusMessage] = useState('');
  const inputRef = useRef(null);

  const speechAvailable = isSpeechSupported();

  // Clear auto-confirm toast after 5 seconds
  useEffect(() => {
    if (recentLogged) {
      const timer = setTimeout(() => {
        setRecentLogged(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [recentLogged]);

  const handleSubmit = async (textToProcess = inputText) => {
    const query = textToProcess.trim();
    if (!query) return;

    setIsProcessing(true);
    setStatusMessage('Parsing financial vectors...');
    playLaserClick(soundEnabled);
    triggerHaptic(20, hapticsEnabled);

    try {
      const newExpense = await onLogExpense(query);

      // Trigger satisfying audio & haptic delight
      playCyberBeep(soundEnabled);
      triggerHaptic([30, 50, 30], hapticsEnabled);

      // Micro Confetti Burst
      try {
        confetti({
          particleCount: 28,
          spread: 45,
          origin: { y: 0.9 },
          colors: ['#00F0FF', '#A855F7', '#10B981', '#38BDF8']
        });
      } catch {}

      setRecentLogged(newExpense);
      setInputText('');
      setInterimText('');
      setStatusMessage('');
    } catch (err) {
      console.error(err);
      setStatusMessage(err.message || 'Parsing failed. Check your input.');
      setTimeout(() => setStatusMessage(''), 4000);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleVoiceToggle = () => {
    if (isListening) {
      stopSpeechRecognition();
      setIsListening(false);
      setInterimText('');
      playLaserClick(soundEnabled);
      triggerHaptic(15, hapticsEnabled);
      return;
    }

    playVoicePulse(soundEnabled);
    triggerHaptic(25, hapticsEnabled);
    setIsListening(true);
    setInterimText('Listening... Speak now (e.g. "Paid 150 for office supplies")');

    startSpeechRecognition({
      onStart: () => {
        setIsListening(true);
      },
      onInterim: (text) => {
        setInterimText(text);
      },
      onResult: (finalTranscript) => {
        setIsListening(false);
        setInterimText('');
        setInputText(finalTranscript);
        // Automatically submit the voice query
        handleSubmit(finalTranscript);
      },
      onError: (errMsg) => {
        setIsListening(false);
        setInterimText('');
        setStatusMessage(errMsg);
        setTimeout(() => setStatusMessage(''), 4000);
      },
      onEnd: () => {
        setIsListening(false);
      }
    });
  };

  const handleChipClick = (chip) => {
    playLaserClick(soundEnabled);
    triggerHaptic(10, hapticsEnabled);
    setInputText(chip);
    handleSubmit(chip);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-30 pointer-events-none">
      <div className="max-w-2xl mx-auto px-3 pb-[calc(env(safe-area-inset-bottom,14px)+8px)] pt-2 pointer-events-auto">
        
        {/* Recent Logged Confirmation Toast */}
        {recentLogged && (
          <div className="mb-2 p-2.5 rounded-xl glass-panel glow-border-emerald bg-emerald-950/40 flex items-center justify-between text-xs animate-in fade-in slide-in-from-bottom duration-300">
            <div className="flex items-center space-x-2 truncate">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <div className="truncate">
                <span className="font-mono font-bold text-emerald-300">{currency}{recentLogged.amount.toFixed(2)}</span>
                <span className="text-slate-300 mx-1.5">•</span>
                <span className="text-slate-200">{recentLogged.category}</span>
                <span className="text-slate-400 mx-1 text-[11px]">({recentLogged.payee})</span>
              </div>
            </div>
            <button
              onClick={() => {
                onEditRecent(recentLogged);
                setRecentLogged(null);
              }}
              className="flex items-center space-x-1 px-2 py-1 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[11px] font-mono hover:bg-emerald-500/30 shrink-0 ml-2"
            >
              <Edit3 className="w-3 h-3" />
              <span>Edit</span>
            </button>
          </div>
        )}

        {/* Live Speech Recognition Waveform / Interim Banner */}
        {isListening && (
          <div className="mb-2 p-2.5 rounded-xl glass-panel glow-border-cyan bg-cyan-950/40 flex items-center justify-between space-x-3 text-xs animate-pulse">
            <div className="flex items-center space-x-2 truncate">
              <div className="flex items-center space-x-1 h-5 px-1">
                <div className="w-1 bg-cyan-400 rounded-full sound-wave-bar" />
                <div className="w-1 bg-cyan-400 rounded-full sound-wave-bar" />
                <div className="w-1 bg-cyan-400 rounded-full sound-wave-bar" />
                <div className="w-1 bg-cyan-400 rounded-full sound-wave-bar" />
                <div className="w-1 bg-cyan-400 rounded-full sound-wave-bar" />
              </div>
              <span className="text-cyan-200 font-mono italic truncate">
                {interimText || 'Listening...'}
              </span>
            </div>
            <button
              onClick={handleVoiceToggle}
              className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 text-[10px] font-mono border border-cyan-500/40 uppercase"
            >
              Cancel
            </button>
          </div>
        )}

        {/* Error / Status message */}
        {statusMessage && !isListening && (
          <div className="mb-2 p-2 rounded-xl glass-panel border-amber-500/40 bg-amber-950/40 flex items-center space-x-2 text-xs text-amber-300">
            <AlertCircle className="w-4 h-4 shrink-0 text-amber-400" />
            <span className="font-mono text-[11px]">{statusMessage}</span>
          </div>
        )}

        {/* Quick Suggestion Chips (horizontal scroll on mobile) */}
        <div className="flex items-center space-x-1.5 overflow-x-auto pb-1.5 mb-1.5 scrollbar-none no-scrollbar">
          <span className="text-[10px] font-mono uppercase text-slate-500 px-1 shrink-0 flex items-center">
            Presets:
          </span>
          {QUICK_CHIPS.map((chip, idx) => (
            <button
              key={idx}
              onClick={() => handleChipClick(chip)}
              className="text-[11px] font-mono px-2.5 py-1 rounded-full glass-panel hover:border-cyan-400/40 text-slate-300 hover:text-cyan-300 whitespace-nowrap shrink-0 transition-all flex items-center space-x-1 active:scale-95"
            >
              <span>{chip}</span>
              <ArrowUpRight className="w-3 h-3 text-cyan-400/60" />
            </button>
          ))}
        </div>

        {/* Main Floating Input Station */}
        <div className="glass-panel rounded-2xl p-1.5 flex items-center space-x-2 border-cyan-500/25 shadow-2xl relative bg-space-900/90 backdrop-blur-xl">
          
          {/* Voice Mic Button */}
          <button
            type="button"
            onClick={handleVoiceToggle}
            className={`relative flex items-center justify-center w-11 h-11 rounded-xl transition-all duration-200 shrink-0 ${
              isListening 
                ? 'bg-rose-500 text-white shadow-[0_0_20px_#F43F5E] animate-pulse' 
                : 'bg-gradient-to-br from-cyan-500/20 to-violet-500/20 border border-cyan-400/40 text-cyan-300 hover:border-cyan-300 hover:shadow-neon-cyan active:scale-90'
            }`}
            title={speechAvailable ? "Hands-Free Voice Dictation" : "Voice recording"}
          >
            {isListening ? (
              <MicOff className="w-5 h-5 text-white" />
            ) : (
              <Mic className="w-5 h-5 text-cyan-300" />
            )}
            
            {/* Pulsating Radar Rings when listening */}
            {isListening && (
              <span className="absolute inset-0 rounded-xl border-2 border-rose-400 animate-ping opacity-75 pointer-events-none" />
            )}
          </button>

          {/* Text Input */}
          <div className="relative flex-1">
            <input
              ref={inputRef}
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleSubmit();
                }
              }}
              disabled={isProcessing}
              placeholder="Type e.g. 'Paid 150 for office supplies'..."
              className="w-full bg-space-950/60 border border-slate-700/50 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-400/70 focus:ring-1 focus:ring-cyan-400/30 transition-all font-sans"
            />
          </div>

          {/* Submit / Process Button */}
          <button
            type="button"
            onClick={() => handleSubmit()}
            disabled={isProcessing || (!inputText.trim() && !isListening)}
            className={`flex items-center justify-center w-11 h-11 rounded-xl font-medium transition-all duration-200 shrink-0 ${
              inputText.trim()
                ? 'bg-gradient-to-r from-cyan-500 to-violet-600 text-white shadow-neon-cyan hover:brightness-110 active:scale-90'
                : 'bg-space-800 text-slate-600 border border-slate-800 cursor-not-allowed'
            }`}
            title="Log Expense with AI"
          >
            {isProcessing ? (
              <Loader2 className="w-5 h-5 animate-spin text-cyan-300" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </button>

        </div>

      </div>
    </div>
  );
}
