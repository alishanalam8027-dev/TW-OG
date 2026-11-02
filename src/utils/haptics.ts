export const Haptics = {
  vibrate(pattern: number | number[], enabled = true) {
    if (!enabled) return;
    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(pattern);
      } catch {
        // Silently catch browsers that deny permission
      }
    }
  },

  tap(enabled = true) {
    this.vibrate(25, enabled);
  },

  success(enabled = true) {
    this.vibrate([35, 40, 50], enabled);
  },

  error(enabled = true) {
    this.vibrate([80, 50, 80], enabled);
  },

  lifeline(enabled = true) {
    this.vibrate([45, 30, 45], enabled);
  },

  victory(enabled = true) {
    this.vibrate([80, 60, 100, 60, 200], enabled);
  },
};
