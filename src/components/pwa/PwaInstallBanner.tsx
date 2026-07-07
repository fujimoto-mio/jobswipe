"use client";

import { useCallback, useEffect, useState } from "react";
import { Download, Share, X } from "lucide-react";
import { dismissPwaInstallPrompt, isPwaInstallDismissed, isStandalonePwa } from "@/lib/pwa";
import { usePwaInstallOptional } from "@/components/pwa/PwaInstallProvider";

type PwaInstallBannerProps = {
  alwaysShowInstallUi?: boolean;
};

export default function PwaInstallBanner({ alwaysShowInstallUi = false }: PwaInstallBannerProps) {
  const pwa = usePwaInstallOptional();
  const [visible, setVisible] = useState(false);
  const canShow = alwaysShowInstallUi ? !isStandalonePwa() : Boolean(pwa?.showInstallUi);

  useEffect(() => {
    if (!canShow || isPwaInstallDismissed()) return;

    const delay = pwa?.platform === "ios" ? 2500 : 4000;
    const timer = window.setTimeout(() => {
      if (!isStandalonePwa()) setVisible(true);
    }, delay);

    return () => window.clearTimeout(timer);
  }, [canShow, pwa?.platform]);

  useEffect(() => {
    if (isStandalonePwa()) setVisible(false);
  }, [canShow]);

  const handleDismiss = useCallback(() => {
    dismissPwaInstallPrompt();
    setVisible(false);
  }, []);

  const handleInstall = useCallback(() => {
    pwa?.openInstallModal();
    setVisible(false);
  }, [pwa]);

  if (!visible || !canShow || isStandalonePwa()) return null;

  return (
    <div
      className="pwa-install-banner pointer-events-none fixed inset-x-0 z-[80] px-4 pb-[calc(0.75rem+env(safe-area-inset-bottom,0px))]"
      style={{ bottom: "var(--pwa-install-banner-bottom, 5.5rem)" }}
      role="region"
      aria-label="アプリのインストール"
    >
      <div className="pointer-events-auto mx-auto flex max-w-md items-start gap-3 rounded-2xl border border-white/15 bg-black/88 p-4 text-white shadow-2xl backdrop-blur-md">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/10">
          <Download className="h-5 w-5" aria-hidden />
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold leading-snug">アプリをインストール</p>
          {pwa?.platform === "ios" ? (
            <p className="mt-1 text-xs leading-relaxed text-white/80">
              ホーム画面に追加するには、
              <Share className="mx-0.5 inline h-3.5 w-3.5 align-text-bottom" aria-hidden />
              共有 →「ホーム画面に追加」をタップしてください。
            </p>
          ) : pwa?.platform === null ? (
            <p className="mt-1 text-xs leading-relaxed text-white/80">
              PCではブラウザからインストールできます。スマホではホーム画面に追加して利用できます。
            </p>
          ) : (
            <p className="mt-1 text-xs leading-relaxed text-white/80">
              ホーム画面に追加すると、アプリのようにすぐに開いて利用できます。
            </p>
          )}

          {pwa?.platform !== "ios" ? (
            <button
              type="button"
              onClick={() => void handleInstall()}
              className="mt-3 rounded-full bg-[#fe2c55] px-4 py-2 text-xs font-bold text-white transition active:scale-95"
            >
              {pwa?.canNativeInstall ? "インストール" : "インストール方法"}
            </button>
          ) : null}
        </div>

        <button
          type="button"
          onClick={handleDismiss}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-white/70 transition hover:bg-white/10 hover:text-white"
          aria-label="閉じる"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
