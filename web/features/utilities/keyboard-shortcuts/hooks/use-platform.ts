/**
 * Detects the user's platform (Mac or Windows/Linux)
 */
export function usePlatform() {
  if (typeof window === 'undefined') {
    return 'other';
  }

  const platform = navigator.platform.toLowerCase();
  const userAgent = navigator.userAgent.toLowerCase();

  if (platform.includes('mac') || userAgent.includes('mac')) {
    return 'mac';
  }

  if (platform.includes('win') || userAgent.includes('windows')) {
    return 'windows';
  }

  return 'other';
}

/**
 * Gets the modifier key symbol for the current platform
 */
export function getModifierKey(): string {
  if (typeof window === 'undefined') {
    return 'Ctrl';
  }

  const platform = navigator.platform.toLowerCase();
  const userAgent = navigator.userAgent.toLowerCase();

  if (platform.includes('mac') || userAgent.includes('mac')) {
    return '⌘';
  }

  return 'Ctrl';
}
