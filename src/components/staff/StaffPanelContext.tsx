"use client";

import { createContext, useContext } from "react";
import type { StaffPanelConfig } from "@/lib/staff/paths";

const StaffPanelContext = createContext<StaffPanelConfig | null>(null);

export function StaffPanelProvider({
  config,
  children,
}: {
  config: StaffPanelConfig;
  children: React.ReactNode;
}) {
  return <StaffPanelContext.Provider value={config}>{children}</StaffPanelContext.Provider>;
}

export function useStaffPanel(): StaffPanelConfig {
  const ctx = useContext(StaffPanelContext);
  if (!ctx) {
    throw new Error("useStaffPanel must be used within StaffPanelProvider");
  }
  return ctx;
}
