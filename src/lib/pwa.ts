export const PWA_INSTALL_DISMISS_KEY = "jobswipe_pwa_install_dismissed";
export const PWA_INSTALL_DISMISS_DAYS = 14;

type NavigatorWithStandalone = Navigator & { standalone?: boolean };

export type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
};

export function isIosDevice(): boolean {
  if (typeof navigator === "undefined") return false;
  return /iPad|iPhone|iPod/.test(navigator.userAgent);
}

export function isAndroidDevice(): boolean {
  if (typeof navigator === "undefined") return false;
  return /Android/i.test(navigator.userAgent);
}

export function isStandalonePwa(): boolean {
  if (typeof window === "undefined") return false;

  const nav = window.navigator as NavigatorWithStandalone;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    window.matchMedia("(display-mode: fullscreen)").matches ||
    nav.standalone === true
  );
}

export function canRegisterServiceWorker(): boolean {
  return typeof window !== "undefined" && "serviceWorker" in navigator;
}

export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (!canRegisterServiceWorker()) return null;

  try {
    return await navigator.serviceWorker.register("/sw.js", {
      scope: "/",
      updateViaCache: "none",
    });
  } catch {
    return null;
  }
}

export function isPwaInstallDismissed(): boolean {
  if (typeof window === "undefined") return true;

  try {
    const raw = localStorage.getItem(PWA_INSTALL_DISMISS_KEY);
    if (!raw) return false;
    const dismissedAt = Number(raw);
    if (!Number.isFinite(dismissedAt)) return false;
    const ms = PWA_INSTALL_DISMISS_DAYS * 24 * 60 * 60 * 1000;
    return Date.now() - dismissedAt < ms;
  } catch {
    return false;
  }
}

export function dismissPwaInstallPrompt(): void {
  try {
    localStorage.setItem(PWA_INSTALL_DISMISS_KEY, String(Date.now()));
  } catch {
    // ignore storage failures
  }
}

export function shouldOfferPwaInstall(): boolean {
  if (typeof window === "undefined") return false;
  if (isStandalonePwa()) return false;
  if (isPwaInstallDismissed()) return false;
  return isIosDevice() || isAndroidDevice() || "BeforeInstallPromptEvent" in window;
}
