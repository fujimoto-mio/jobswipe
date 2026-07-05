"use client";

import { Search } from "lucide-react";
import type { ReactNode } from "react";

type PaginatedTableToolbarProps = {
  searchValue: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
  filter?: ReactNode;
};

export default function PaginatedTableToolbar({
  searchValue,
  onSearchChange,
  searchPlaceholder = "検索...",
  filter,
}: PaginatedTableToolbarProps) {
  return (
    <div className="table-toolbar">
      <div className="table-toolbar-search">
        <Search className="table-toolbar-search-icon" aria-hidden />
        <input
          type="search"
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={searchPlaceholder}
          className="input-field w-full text-sm"
          aria-label={searchPlaceholder}
        />
      </div>
      {filter && <div className="table-toolbar-filter">{filter}</div>}
    </div>
  );
}
