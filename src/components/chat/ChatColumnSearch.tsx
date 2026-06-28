"use client";

import { Search, X } from "lucide-react";

type ChatColumnSearchProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  disabled?: boolean;
};

export default function ChatColumnSearch({
  value,
  onChange,
  placeholder,
  disabled = false,
}: ChatColumnSearchProps) {
  return (
    <div className="chat-column-search">
      <Search className="chat-column-search-icon" strokeWidth={2} aria-hidden />
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className="input-field w-full"
        aria-label={placeholder}
        enterKeyHint="search"
      />
      {value.length > 0 && !disabled && (
        <button
          type="button"
          onClick={() => onChange("")}
          className="chat-column-search-clear"
          aria-label="検索をクリア"
        >
          <X className="h-3.5 w-3.5" strokeWidth={2} />
        </button>
      )}
    </div>
  );
}
