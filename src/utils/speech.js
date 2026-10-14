/**
 * Web Speech API Voice Recognizer for Hands-Free Mobile Logging
 */

export function isSpeechSupported() {
  if (typeof window === 'undefined') return false;
  return !!(window.SpeechRecognition || window.webkitSpeechRecognition);
}

let activeRecognition = null;

export function startSpeechRecognition({ onResult, onInterim, onError, onStart, onEnd }) {
  if (!isSpeechSupported()) {
    if (onError) onError('Speech recognition is not supported in this browser. You can use your mobile keyboard microphone!');
    return null;
  }

  // Stop any previous instance
  stopSpeechRecognition();

  const SpeechRecognitionClass = window.SpeechRecognition || window.webkitSpeechRecognition;
  const recognition = new SpeechRecognitionClass();

  recognition.continuous = false;
  recognition.interimResults = true;
  recognition.lang = 'en-US';
  recognition.maxAlternatives = 1;

  recognition.onstart = () => {
    if (onStart) onStart();
  };

  recognition.onresult = (event) => {
    let interimText = '';
    let finalText = '';

    for (let i = event.resultIndex; i < event.results.length; ++i) {
      const transcript = event.results[i][0].transcript;
      if (event.results[i].isFinal) {
        finalText += transcript;
      } else {
        interimText += transcript;
      }
    }

    if (interimText && onInterim) {
      onInterim(interimText);
    }

    if (finalText && onResult) {
      onResult(finalText);
    }
  };

  recognition.onerror = (event) => {
    console.warn('Speech recognition error:', event.error);
    if (onError) {
      if (event.error === 'not-allowed') {
        onError('Microphone access was denied. Please allow microphone permission in browser settings.');
      } else if (event.error === 'no-speech') {
        onError('No speech detected. Please try again.');
      } else {
        onError(`Voice recognition: ${event.error}`);
      }
    }
  };

  recognition.onend = () => {
    activeRecognition = null;
    if (onEnd) onEnd();
  };

  try {
    recognition.start();
    activeRecognition = recognition;
    return recognition;
  } catch (err) {
    if (onError) onError('Could not initialize microphone.');
    return null;
  }
}

export function stopSpeechRecognition() {
  if (activeRecognition) {
    try {
      activeRecognition.stop();
    } catch {
      // Ignore
    }
    activeRecognition = null;
  }
}
