"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Download, Share, Smartphone } from "lucide-react";
import { usePwaInstallOptional } from "@/components/pwa/PwaInstallProvider";
import { ButtonSpinner } from "@/components/ui/LoadingSpinner";

type PwaInstallConfirmModalProps = {
  open: boolean;
  onClose: () => void;
};

type Step = "confirm" | "ios-guide" | "android-fallback" | "desktop-guide";

export default function PwaInstallConfirmModal({ open, onClose }: PwaInstallConfirmModalProps) {
  const pwa = usePwaInstallOptional();
  const [step, setStep] = useState<Step>("confirm");
  const [installing, setInstalling] = useState(false);

  useEffect(() => {
    if (!open) {
      setStep("confirm");
      setInstalling(false);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !installing) onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onClose, installing]);

  const handleConfirm = async () => {
    if (!pwa) return;

    if (pwa.canNativeInstall) {
      setInstalling(true);
      try {
        const accepted = await pwa.promptInstall();
        if (accepted) onClose();
      } finally {
        setInstalling(false);
      }
      return;
    }

    if (pwa.platform === "ios") {
      setStep("ios-guide");
      return;
    }

    if (pwa.platform === "android") {
      setStep("android-fallback");
      return;
    }

    setStep("desktop-guide");
  };

  if (!open || !pwa) return null;

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[90] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
          onClick={installing ? undefined : onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ type: "spring", damping: 28, stiffness: 320 }}
            className="w-full max-w-sm overflow-hidden rounded-2xl border border-white/10 bg-[#161823] text-white shadow-2xl"
            onClick={(event) => event.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="pwa-install-modal-title"
          >
            <div className="p-6">
              {step === "confirm" ? (
                <>
                  <div className="mb-5 flex flex-col items-center text-center">
                    <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10">
                      <Download className="h-7 w-7 text-white" strokeWidth={2} />
                    </div>
                    <h2 id="pwa-install-modal-title" className="text-lg font-bold">
                      ホーム画面に追加
                    </h2>
                    <p className="mt-2 text-sm leading-relaxed text-white/75">
                      ホーム画面に追加すると、アプリのようにすぐに開けて、ブラウザの表示なしで利用できます。
                    </p>
                  </div>

                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={onClose}
                      disabled={installing}
                      className="flex-1 rounded-full border border-white/20 py-2.5 text-sm font-semibold text-white/90 transition hover:bg-white/10 disabled:opacity-50"
                    >
                      キャンセル
                    </button>
                    <button
                      type="button"
                      onClick={() => void handleConfirm()}
                      disabled={installing}
                      className="flex flex-1 items-center justify-center gap-2 rounded-full bg-[#fe2c55] py-2.5 text-sm font-bold text-white transition active:scale-[0.98] disabled:opacity-70"
                    >
                      {installing ? <ButtonSpinner /> : "追加する"}
                    </button>
                  </div>
                </>
              ) : null}

              {step === "ios-guide" ? (
                <>
                  <div className="mb-5 flex flex-col items-center text-center">
                    <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10">
                      <Share className="h-7 w-7 text-white" strokeWidth={2} />
                    </div>
                    <h2 id="pwa-install-modal-title" className="text-lg font-bold">
                      ホーム画面に追加
                    </h2>
                    <ol className="mt-3 space-y-2 text-left text-sm leading-relaxed text-white/80">
                      <li className="flex gap-2">
                        <span className="font-bold text-white">1.</span>
                        <span>
                          画面下の
                          <Share className="mx-0.5 inline h-4 w-4 align-text-bottom" aria-hidden />
                          共有ボタンをタップ
                        </span>
                      </li>
                      <li className="flex gap-2">
                        <span className="font-bold text-white">2.</span>
                        <span>「ホーム画面に追加」を選択</span>
                      </li>
                      <li className="flex gap-2">
                        <span className="font-bold text-white">3.</span>
                        <span>右上の「追加」をタップ</span>
                      </li>
                    </ol>
                  </div>
                  <button
                    type="button"
                    onClick={onClose}
                    className="w-full rounded-full bg-[#fe2c55] py-2.5 text-sm font-bold text-white transition active:scale-[0.98]"
                  >
                    OK
                  </button>
                </>
              ) : null}

              {step === "android-fallback" ? (
                <>
                  <div className="mb-5 flex flex-col items-center text-center">
                    <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10">
                      <Smartphone className="h-7 w-7 text-white" strokeWidth={2} />
                    </div>
                    <h2 id="pwa-install-modal-title" className="text-lg font-bold">
                      ブラウザから追加
                    </h2>
                    <p className="mt-2 text-sm leading-relaxed text-white/75">
                      ブラウザ右上のメニュー（⋮）から「アプリをインストール」または「ホーム画面に追加」を選んでください。
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={onClose}
                    className="w-full rounded-full bg-[#fe2c55] py-2.5 text-sm font-bold text-white transition active:scale-[0.98]"
                  >
                    OK
                  </button>
                </>
              ) : null}

              {step === "desktop-guide" ? (
                <>
                  <div className="mb-5 flex flex-col items-center text-center">
                    <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10">
                      <Download className="h-7 w-7 text-white" strokeWidth={2} />
                    </div>
                    <h2 id="pwa-install-modal-title" className="text-lg font-bold">
                      アプリをインストール
                    </h2>
                    <ol className="mt-3 space-y-2 text-left text-sm leading-relaxed text-white/80">
                      <li className="flex gap-2">
                        <span className="font-bold text-white">1.</span>
                        <span>Chrome または Edge のアドレスバー右側にあるインストールアイコンをクリック</span>
                      </li>
                      <li className="flex gap-2">
                        <span className="font-bold text-white">2.</span>
                        <span>表示されない場合は、ブラウザ右上のメニュー（⋮）から「インストール」を選択</span>
                      </li>
                      <li className="flex gap-2">
                        <span className="font-bold text-white">3.</span>
                        <span>スマホで使う場合は、同じURLをスマホのブラウザで開いてホーム画面に追加</span>
                      </li>
                    </ol>
                  </div>
                  <button
                    type="button"
                    onClick={onClose}
                    className="w-full rounded-full bg-[#fe2c55] py-2.5 text-sm font-bold text-white transition active:scale-[0.98]"
                  >
                    OK
                  </button>
                </>
              ) : null}
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
