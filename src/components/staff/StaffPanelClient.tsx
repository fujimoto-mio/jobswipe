"use client";

import StaffAuthGuard from "@/components/auth/StaffAuthGuard";
import { StaffPanelProvider } from "@/components/staff/StaffPanelContext";
import StaffPanelShell from "@/components/staff/StaffPanelShell";
import type { StaffPanelConfig } from "@/lib/staff/paths";

type StaffPanelClientProps = {
  config: StaffPanelConfig;
  children: React.ReactNode;
};

export default function StaffPanelClient({ config, children }: StaffPanelClientProps) {
  return (
    <StaffAuthGuard expectedRole={config.role} loginPath={config.loginPath}>
      <StaffPanelProvider config={config}>
        <StaffPanelShell>{children}</StaffPanelShell>
      </StaffPanelProvider>
    </StaffAuthGuard>
  );
}
