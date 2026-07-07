"use client";

import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Check, ChevronDown, Search, X } from "lucide-react";
import { JOB_TAGS, jobTagLabel } from "@/lib/job-tags";
import { useStaffThemeOptional } from "@/components/staff/StaffThemeProvider";

export type TagPickerProps = {
  id?: string;
  value: string[];
  onChange: (tags: string[]) => void;
  onBlur?: () => void;
  readOnly?: boolean;
  label?: string;
  placeholder?: string;
  searchPlaceholder?: string;
  sheetTitle?: string;
  emptyMessage?: string;
  options?: readonly string[];
  error?: boolean;
  touched?: boolean;
  showLabel?: boolean;
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

function TagOptionRow({
  label,
  selected,
  onSelect,
}: {
  label: string;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      role="option"
      aria-selected={selected}
      onClick={onSelect}
      className={`select-picker-option ${selected ? "select-picker-option-selected" : ""}`}
    >
      <span>{label}</span>
      {selected && <Check className="h-4 w-4 shrink-0 text-[var(--accent)]" aria-hidden />}
    </button>
  );
}

export default function TagPicker({
  id,
  value,
  onChange,
  onBlur,
  readOnly = false,
  label = "タグ",
  placeholder = "タグを選択",
  searchPlaceholder = "タグを検索",
  sheetTitle = "タグを選択",
  emptyMessage = "該当するタグがありません",
  options = JOB_TAGS,
  error = false,
  touched = false,
  showLabel = true,
}: TagPickerProps) {
  const fallbackId = useId();
  const fieldId = id ?? fallbackId;
  const rootRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [mounted, setMounted] = useState(false);
  const mobile = useMobileSheet();
  const staffTheme = useStaffThemeOptional();
  const staff = staffTheme !== null;

  const close = useCallback(() => {
    setOpen(false);
    setQuery("");
    onBlur?.();
  }, [onBlur]);

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

  const filteredTags = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options.filter((tag) => jobTagLabel(tag).toLowerCase().includes(q));
  }, [options, query]);

  const toggleTag = (tag: string) => {
    if (readOnly) return;
    const next = value.includes(tag) ? value.filter((item) => item !== tag) : [...value, tag];
    onChange(next);
  };

  const removeTag = (tag: string) => {
    if (readOnly) return;
    onChange(value.filter((item) => item !== tag));
  };

  const pickerBody = (
    <div className="tag-picker-body">
      <div className="tag-picker-search border-b border-slate-200 p-3">
        <div className="table-toolbar-search">
          <Search className="table-toolbar-search-icon" aria-hidden />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={searchPlaceholder}
            className="input-field w-full text-sm"
            autoFocus={open}
          />
        </div>
      </div>
      <div className="tag-picker-list">
        {filteredTags.length === 0 ? (
          <p className="px-4 py-6 text-center text-sm text-slate-500">{emptyMessage}</p>
        ) : (
          filteredTags.map((tag) => (
            <TagOptionRow
              key={tag}
              label={jobTagLabel(tag)}
              selected={value.includes(tag)}
              onSelect={() => toggleTag(tag)}
            />
          ))
        )}
      </div>
    </div>
  );

  return (
    <div className="block">
      {showLabel && (
        <span className="mb-1.5 block text-sm font-medium text-[var(--foreground)]">{label}</span>
      )}

      {value.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-2">
          {value.map((tag) => (
            <span key={tag} className="badge badge-blue inline-flex items-center gap-1">
              {jobTagLabel(tag)}
              {!readOnly && (
                <button
                  type="button"
                  className="rounded-full p-0.5 hover:bg-blue-100"
                  aria-label={`${jobTagLabel(tag)} を外す`}
                  onClick={() => removeTag(tag)}
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </span>
          ))}
        </div>
      )}

      {!readOnly && (
        <div ref={rootRef} className={`select-wrap select-picker relative ${staff ? "select-picker--staff" : ""}`}>
          <button
            type="button"
            id={fieldId}
            aria-haspopup="listbox"
            aria-expanded={open}
            className={`select-picker-trigger input-field select-field w-full text-left ${touched && error ? "ring-1 ring-red-300" : ""}`}
            onClick={() => setOpen((current) => !current)}
          >
            <span className="truncate pr-6">
              {value.length > 0 ? `${value.length}件選択中` : placeholder}
            </span>
            <ChevronDown
              className={`pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
            />
          </button>

          <AnimatePresence>
            {open && !mobile && (
              <motion.div
                initial={{ opacity: 0, y: -4, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -4, scale: 0.98 }}
                transition={{ duration: 0.15 }}
                className={`select-picker-menu select-picker-menu--tags absolute left-0 right-0 top-[calc(100%+0.375rem)] z-50 ${staff ? "select-picker-menu--staff" : ""}`}
                role="listbox"
                aria-labelledby={fieldId}
                aria-multiselectable
              >
                {pickerBody}
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
                      className={`select-picker-sheet-panel select-picker-sheet-panel--tags w-full ${staff ? "select-picker-sheet-panel--staff" : ""}`}
                      role="listbox"
                      aria-labelledby={fieldId}
                      aria-multiselectable
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="select-picker-sheet-handle" />
                      <p className="select-picker-sheet-title">{sheetTitle}</p>
                      <div className="select-picker-sheet-list">{pickerBody}</div>
                      <div className="border-t border-slate-200 p-3">
                        <button type="button" className="btn-primary w-full" onClick={close}>
                          完了
                        </button>
                      </div>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>,
              document.body,
            )}
        </div>
      )}
    </div>
  );
}
