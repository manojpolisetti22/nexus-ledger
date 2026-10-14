// Mobile vibration haptics helper
export function triggerHaptic(pattern = 15, enabled = true) {
  if (!enabled) return;
  if (typeof window !== 'undefined' && 'navigator' in window && 'vibrate' in navigator) {
    try {
      navigator.vibrate(pattern);
    } catch {
      // Ignore vibration error if blocked by OS policy
    }
  }
}
