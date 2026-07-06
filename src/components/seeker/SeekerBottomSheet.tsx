"use client";

import { useEffect, type ReactNode } from "react";
import { motion } from "framer-motion";
import {
  seekerSheetBackdropMotion,
  seekerSheetPanelMotion,
} from "@/lib/seeker-sheet-motion";

type SeekerBottomSheetProps = {
  onClose: () => void;
  children: ReactNode;
  panelClassName?: string;
  overlayClassName?: string;
  allowOverlayClose?: boolean;
};

export default function SeekerBottomSheet({
  onClose,
  children,
  panelClassName = "",
  overlayClassName = "",
  allowOverlayClose = true,
}: SeekerBottomSheetProps) {
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [onClose]);

  return (
    <motion.div
      {...seekerSheetBackdropMotion}
      className={`fixed inset-0 z-50 flex items-end justify-center bg-black/55 backdrop-blur-[2px] ${overlayClassName}`.trim()}
      onClick={allowOverlayClose ? onClose : undefined}
    >
      <motion.div
        {...seekerSheetPanelMotion}
        className={`seeker-bottom-sheet-panel w-full will-change-transform ${panelClassName}`.trim()}
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        {children}
      </motion.div>
    </motion.div>
  );
}
