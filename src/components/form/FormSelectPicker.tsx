"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Check, ChevronDown } from "lucide-react";
import { useStaffThemeOptional } from "@/components/staff/StaffThemeProvider";

type FormSelectPickerProps = {
  id?: string;
  name: string;
  value: string;
  options: readonly string[];
  placeholder?: string;
  title?: string;
  error?: boolean;
  touched?: boolean;
  compact?: boolean;
  allowClear?: boolean;
  menuClassName?: string;
  onChange: (value: string) => void;
  onBlur: () => void;
};

function useMobileSheet() {
  const [mobile, setMobile] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 639px)");
    const update = () => setMobile(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  return mobile;
}

export default function FormSelectPicker({
  id,
  name,
  value,
  options,
  placeholder = "選択",
  title,
  error,
  touched,
  compact = false,
  allowClear = true,
  menuClassName = "",
  onChange,
  onBlur,
}: FormSelectPickerProps) {
  const fallbackId = useId();
  const fieldId = id ?? fallbackId;
  const rootRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const mobile = useMobileSheet();
  const staffTheme = useStaffThemeOptional();
  const staff = staffTheme !== null;

  const close = useCallback(() => {
    setOpen(false);
    onBlur();
  }, [onBlur]);

  const select = useCallback(
    (next: string) => {
      onChange(next);
      setOpen(false);
      queueMicrotask(onBlur);
    },
    [onChange, onBlur]
  );

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open || mobile) return;

    const onPointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) close();
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open, mobile, close]);

  useEffect(() => {
    if (!open || !mobile) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open, mobile]);

  const triggerClass = [
    "select-picker-trigger input-field select-field w-full text-left",
    compact ? "select-picker-trigger-compact" : "",
    !value ? "select-empty" : "",
    error && touched ? "ring-1 ring-red-300" : "",
  ]
    .filter(Boolean)
    .join(" ");

  const optionRows = (
    <>
      {allowClear && (
        <OptionRow
          label={placeholder}
          selected={!value}
          onSelect={() => select("")}
          muted
          staff={staff}
        />
      )}
      {options.map((option) => (
        <OptionRow
          key={option}
          label={option}
          selected={value === option}
          onSelect={() => select(option)}
          staff={staff}
        />
      ))}
    </>
  );

  return (
    <div
      ref={rootRef}
      className={`select-wrap select-picker relative ${compact ? "select-picker-compact" : ""} ${staff ? "select-picker--staff" : ""}`}
    >
      <button
        type="button"
        id={fieldId}
        name={name}
        aria-haspopup="listbox"
        aria-expanded={open}
        className={triggerClass}
        onClick={() => setOpen((v) => !v)}
      >
        <span className={`whitespace-nowrap ${compact ? "pr-4" : "truncate pr-6"}`}>
          {value || placeholder}
        </span>
        <ChevronDown
          className={`pointer-events-none absolute top-1/2 -translate-y-1/2 text-slate-500 transition-transform duration-200 ${compact ? "right-2 h-3.5 w-3.5" : "right-3.5 h-4 w-4"} ${open ? "rotate-180" : ""}`}
        />
      </button>

      <AnimatePresence>
        {open && !mobile && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            className={`select-picker-menu absolute left-0 right-0 top-[calc(100%+0.375rem)] z-50 ${staff ? "select-picker-menu--staff" : ""} ${menuClassName}`.trim()}
            role="listbox"
            aria-labelledby={fieldId}
          >
            {optionRows}
          </motion.div>
        )}
      </AnimatePresence>

      {mounted &&
        createPortal(
          <AnimatePresence>
            {open && mobile && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="select-picker-sheet fixed inset-0 z-[70] flex items-end justify-center bg-slate-900/45 backdrop-blur-[2px]"
                onClick={close}
              >
                <motion.div
                  initial={{ y: "100%" }}
                  animate={{ y: 0 }}
                  exit={{ y: "100%" }}
                  transition={{ type: "spring", damping: 32, stiffness: 340 }}
                  className={`select-picker-sheet-panel w-full ${staff ? "select-picker-sheet-panel--staff" : ""}`}
                  role="listbox"
                  aria-labelledby={fieldId}
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="select-picker-sheet-handle" />
                  <p className="select-picker-sheet-title">{title ?? placeholder}</p>
                  <div className="select-picker-sheet-list">{optionRows}</div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>,
          document.body
        )}
    </div>
  );
}

function OptionRow({
  label,
  selected,
  onSelect,
  muted,
  staff = false,
}: {
  label: string;
  selected: boolean;
  onSelect: () => void;
  muted?: boolean;
  staff?: boolean;
}) {
  return (
    <button
      type="button"
      role="option"
      aria-selected={selected}
      onClick={onSelect}
      className={`select-picker-option ${selected ? "select-picker-option-selected" : ""} ${muted ? "select-picker-option-muted" : ""}`}
    >
      <span>{label}</span>
      {selected && (
        <Check
          className={`h-4 w-4 shrink-0 ${staff ? "text-[var(--staff-primary)]" : "text-slate-700"}`}
          strokeWidth={2.5}
        />
      )}
    </button>
  );
}
