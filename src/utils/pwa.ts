export function isIOS() {
  if (typeof window === 'undefined') return false;
  
  // Check userAgent
  const userAgent = window.navigator.userAgent || window.navigator.vendor || (window as any).opera;
  const isIOSUserAgent = /iphone|ipad|ipod/i.test(userAgent);
  
  // Check iPad Safari / iOS 13+ iPad spoofing as Mac
  const isIPadOS = navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1;
  
  return isIOSUserAgent || isIPadOS;
}

export function isStandalone() {
  if (typeof window === 'undefined') return false;
  
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as any).standalone === true
  );
}
