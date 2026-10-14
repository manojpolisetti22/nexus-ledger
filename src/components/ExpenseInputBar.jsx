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
          <div className="mb-2 p-3 rounded-2xl bg-white/70 backdrop-blur-xl border border-white/60 shadow-lg flex items-center justify-between text-xs animate-in fade-in slide-in-from-bottom duration-300">
            <div className="flex items-center space-x-2 truncate">
              <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
              <div className="truncate text-gray-900">
                <span className="font-extrabold text-gray-900">{currency}{recentLogged.amount.toFixed(2)}</span>
                <span className="text-gray-400 mx-1.5">•</span>
                <span className="font-semibold text-gray-800">{recentLogged.category}</span>
                <span className="text-gray-600 mx-1 text-xs">({recentLogged.payee})</span>
              </div>
            </div>
            <button
              onClick={() => {
                onEditRecent(recentLogged);
                setRecentLogged(null);
              }}
              className="flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-gray-900 text-white font-medium text-xs hover:bg-black transition-all shrink-0 ml-2 shadow-xs"
            >
              <Edit3 className="w-3 h-3" />
              <span>Edit</span>
            </button>
          </div>
        )}

        {/* Live Speech Recognition Waveform / Interim Banner */}
        {isListening && (
          <div className="mb-2 p-3 rounded-2xl bg-white/70 backdrop-blur-xl border border-white/60 shadow-lg flex items-center justify-between space-x-3 text-xs animate-pulse">
            <div className="flex items-center space-x-2 truncate">
              <div className="flex items-center space-x-1 h-5 px-1">
                <div className="w-1 bg-amber-500 rounded-full sound-wave-bar" />
                <div className="w-1 bg-amber-500 rounded-full sound-wave-bar" />
                <div className="w-1 bg-amber-500 rounded-full sound-wave-bar" />
                <div className="w-1 bg-amber-500 rounded-full sound-wave-bar" />
                <div className="w-1 bg-amber-500 rounded-full sound-wave-bar" />
              </div>
              <span className="text-gray-900 font-medium italic truncate">
                {interimText || 'Listening...'}
              </span>
            </div>
            <button
              onClick={handleVoiceToggle}
              className="px-2.5 py-1 rounded-lg bg-gray-900 text-white text-xs font-semibold uppercase tracking-wider"
            >
              Cancel
            </button>
          </div>
        )}

        {/* Error / Status message */}
        {statusMessage && !isListening && (
          <div className="mb-2 p-2.5 rounded-2xl bg-white/75 backdrop-blur-xl border border-amber-500/40 shadow-md flex items-center space-x-2 text-xs text-amber-900">
            <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
            <span className="text-xs font-medium">{statusMessage}</span>
          </div>
        )}

        {/* Quick Suggestion Chips (horizontal scroll on mobile) */}
        <div className="flex items-center space-x-1.5 overflow-x-auto pb-1.5 mb-1.5 scrollbar-none no-scrollbar">
          <span className="text-[10px] font-bold uppercase text-gray-700 px-1 shrink-0 flex items-center tracking-wider">
            Quick:
          </span>
          {QUICK_CHIPS.map((chip, idx) => (
            <button
              key={idx}
              onClick={() => handleChipClick(chip)}
              className="text-xs font-semibold px-3 py-1 rounded-full bg-white/35 hover:bg-white/55 border border-white/45 text-gray-800 hover:text-black whitespace-nowrap shrink-0 transition-all flex items-center space-x-1 active:scale-95 shadow-xs"
            >
              <span>{chip}</span>
              <ArrowUpRight className="w-3 h-3 text-gray-600" />
            </button>
          ))}
        </div>

        {/* Main Floating Input Station */}
        <div className="bg-white/50 backdrop-blur-xl border border-white/50 rounded-2xl p-2 flex items-center space-x-2 shadow-2xl relative">
          
          {/* Voice Mic Button */}
          <button
            type="button"
            onClick={handleVoiceToggle}
            className={`relative flex items-center justify-center w-11 h-11 rounded-xl transition-all duration-200 shrink-0 shadow-sm ${
              isListening 
                ? 'bg-red-600 text-white shadow-lg animate-pulse' 
                : 'bg-white/60 hover:bg-white/85 border border-white/60 text-gray-800 active:scale-90'
            }`}
            title={speechAvailable ? "Hands-Free Voice Dictation" : "Voice recording"}
          >
            {isListening ? (
              <MicOff className="w-5 h-5 text-white" />
            ) : (
              <Mic className="w-5 h-5 text-gray-800" />
            )}
            
            {/* Pulsating Ring when listening */}
            {isListening && (
              <span className="absolute inset-0 rounded-xl border-2 border-red-500 animate-ping opacity-75 pointer-events-none" />
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
              className="w-full bg-white/60 focus:bg-white/85 border border-white/50 rounded-xl px-4 py-2.5 text-sm text-gray-900 placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-900 transition-all font-sans"
            />
          </div>

          {/* Submit / Process Button */}
          <button
            type="button"
            onClick={() => handleSubmit()}
            disabled={isProcessing || (!inputText.trim() && !isListening)}
            className={`flex items-center justify-center w-11 h-11 rounded-xl font-medium transition-all duration-200 shrink-0 shadow-md ${
              inputText.trim()
                ? 'bg-gray-900 text-white hover:bg-black active:scale-90'
                : 'bg-gray-400/40 text-gray-500 border border-transparent cursor-not-allowed'
            }`}
            title="Log Expense"
          >
            {isProcessing ? (
              <Loader2 className="w-5 h-5 animate-spin text-white" />
            ) : (
              <Send className="w-4 h-4 text-white" />
            )}
          </button>

        </div>

      </div>
    </div>
  );
}
