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

export function PwaInstallProvider({
  children,
  alwaysShowInstallUi = false,
}: {
  children: ReactNode;
  alwaysShowInstallUi?: boolean;
}) {
  const installPromptRef = useRef<BeforeInstallPromptEvent | null>(null);
  const [showInstallUi, setShowInstallUi] = useState(false);
  const [platform, setPlatform] = useState<"ios" | "android" | null>(null);
  const [canNativeInstall, setCanNativeInstall] = useState(false);
  const [installModalOpen, setInstallModalOpen] = useState(false);

  const openInstallModal = useCallback(() => setInstallModalOpen(true), []);
  const closeInstallModal = useCallback(() => setInstallModalOpen(false), []);

  const syncVisibility = useCallback(() => {
    if (isStandalonePwa()) {
      setShowInstallUi(false);
      setCanNativeInstall(false);
      installPromptRef.current = null;
      return;
    }

    if (alwaysShowInstallUi) {
      if (isIosDevice()) {
        setPlatform("ios");
      } else if (isAndroidDevice()) {
        setPlatform("android");
      } else {
        setPlatform(null);
      }
      setShowInstallUi(true);
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
  }, [alwaysShowInstallUi]);

  useEffect(() => {
    void registerServiceWorker();
    syncVisibility();

    const onBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      installPromptRef.current = event as BeforeInstallPromptEvent;
      if (isIosDevice()) {
        setPlatform("ios");
      } else if (isAndroidDevice()) {
        setPlatform("android");
      } else {
        setPlatform(null);
      }
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
        showInstallUi,
        platform,
        canNativeInstall,
        installModalOpen,
        openInstallModal,
        closeInstallModal,
        promptInstall,
      }}
    >
      {children}
      <PwaInstallConfirmModal open={installModalOpen} onClose={closeInstallModal} />
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
