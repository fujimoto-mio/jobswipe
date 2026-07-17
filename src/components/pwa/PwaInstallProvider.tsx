"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  type BeforeInstallPromptEvent,
  isAndroidDevice,
  isIosDevice,
  isStandalonePwa,
  PWA_INSTALL_UI_ENABLED,
  registerServiceWorker,
} from "@/lib/pwa";
import PwaInstallConfirmModal from "@/components/pwa/PwaInstallConfirmModal";

type PwaInstallContextValue = {
  showInstallUi: boolean;
  platform: "ios" | "android" | null;
  canNativeInstall: boolean;
  installModalOpen: boolean;
  openInstallModal: () => void;
  closeInstallModal: () => void;
  promptInstall: () => Promise<boolean>;
};

const PwaInstallContext = createContext<PwaInstallContextValue | null>(null);

export function PwaInstallProvider({ children }: { children: ReactNode }) {
  const installPromptRef = useRef<BeforeInstallPromptEvent | null>(null);
  const [showInstallUi, setShowInstallUi] = useState(false);
  const [platform, setPlatform] = useState<"ios" | "android" | null>(null);
  const [canNativeInstall, setCanNativeInstall] = useState(false);
  const [installModalOpen, setInstallModalOpen] = useState(false);

  const openInstallModal = useCallback(() => {
    if (!PWA_INSTALL_UI_ENABLED) return;
    setInstallModalOpen(true);
  }, []);
  const closeInstallModal = useCallback(() => setInstallModalOpen(false), []);

  const syncVisibility = useCallback(() => {
    if (!PWA_INSTALL_UI_ENABLED || isStandalonePwa()) {
      setShowInstallUi(false);
      setCanNativeInstall(false);
      installPromptRef.current = null;
      return;
    }

    if (isIosDevice()) {
      setPlatform("ios");
      setShowInstallUi(true);
      return;
    }

    if (isAndroidDevice()) {
      setPlatform("android");
      setShowInstallUi(true);
      return;
    }

    setPlatform(null);
    setShowInstallUi(false);
  }, []);

  useEffect(() => {
    void registerServiceWorker();
    syncVisibility();

    const onBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      installPromptRef.current = event as BeforeInstallPromptEvent;
      if (!PWA_INSTALL_UI_ENABLED) return;
      setPlatform("android");
      setCanNativeInstall(true);
      setShowInstallUi(true);
    };

    const onDisplayModeChange = () => syncVisibility();

    window.addEventListener("beforeinstallprompt", onBeforeInstallPrompt);
    window.matchMedia("(display-mode: standalone)").addEventListener("change", onDisplayModeChange);

    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstallPrompt);
      window.matchMedia("(display-mode: standalone)").removeEventListener("change", onDisplayModeChange);
    };
  }, [syncVisibility]);

  const promptInstall = useCallback(async () => {
    if (!PWA_INSTALL_UI_ENABLED) return false;
    const prompt = installPromptRef.current;
    if (!prompt) return false;

    await prompt.prompt();
    const choice = await prompt.userChoice;
    installPromptRef.current = null;
    setCanNativeInstall(false);

    if (choice.outcome === "accepted") {
      setShowInstallUi(false);
      return true;
    }

    return false;
  }, []);

  return (
    <PwaInstallContext.Provider
      value={{
        showInstallUi: PWA_INSTALL_UI_ENABLED && showInstallUi,
        platform,
        canNativeInstall: PWA_INSTALL_UI_ENABLED && canNativeInstall,
        installModalOpen: PWA_INSTALL_UI_ENABLED && installModalOpen,
        openInstallModal,
        closeInstallModal,
        promptInstall,
      }}
    >
      {children}
      {PWA_INSTALL_UI_ENABLED ? (
        <PwaInstallConfirmModal open={installModalOpen} onClose={closeInstallModal} />
      ) : null}
    </PwaInstallContext.Provider>
  );
}

export function usePwaInstall(): PwaInstallContextValue {
  const ctx = useContext(PwaInstallContext);
  if (!ctx) {
    throw new Error("usePwaInstall must be used within PwaInstallProvider");
  }
  return ctx;
}

export function usePwaInstallOptional(): PwaInstallContextValue | null {
  return useContext(PwaInstallContext);
}
