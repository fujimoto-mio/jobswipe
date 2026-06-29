"use client";

import { Search } from "lucide-react";

type SeekerSearchBarProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
};

export default function SeekerSearchBar({
  value,
  onChange,
  placeholder = "検索...",
}: SeekerSearchBarProps) {
  return (
    <div className="seeker-search-bar">
      <Search className="seeker-search-bar-icon" aria-hidden />
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="input-field seeker-search-bar-input"
        aria-label={placeholder}
      />
    </div>
  );
}
