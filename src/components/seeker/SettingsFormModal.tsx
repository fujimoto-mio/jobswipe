"use client";

import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { X } from "lucide-react";

type SettingsFormModalProps = {
  title: string;
  onClose: () => void;
  children: ReactNode;
};

export default function SettingsFormModal({ title, onClose, children }: SettingsFormModalProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/50 backdrop-blur-sm sm:items-center sm:p-4"
    >
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 30, stiffness: 300 }}
        className="modal-sheet p-6"
      >
        <div className="mb-1 flex justify-center sm:hidden">
          <div className="h-1 w-10 rounded-full bg-slate-200" />
        </div>

        <div className="mb-5 mt-2 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900">{title}</h2>
          <button type="button" onClick={onClose} className="btn-icon btn-icon-muted" aria-label="閉じる">
            <X className="h-5 w-5" />
          </button>
        </div>

        {children}
      </motion.div>
    </motion.div>
  );
}
