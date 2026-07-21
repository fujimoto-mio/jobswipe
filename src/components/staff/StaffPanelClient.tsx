"use client";

import StaffAuthGuard from "@/components/auth/StaffAuthGuard";
import { CompanyBadgeProvider } from "@/components/staff/CompanyBadgeProvider";
import { StaffPanelProvider } from "@/components/staff/StaffPanelContext";
import StaffPanelShell from "@/components/staff/StaffPanelShell";
import { StaffThemeProvider } from "@/components/staff/StaffThemeProvider";
import type { StaffPanelConfig } from "@/lib/staff/paths";

type StaffPanelClientProps = {
  config: StaffPanelConfig;
  children: React.ReactNode;
};

export default function StaffPanelClient({ config, children }: StaffPanelClientProps) {
  return (
    <StaffPanelProvider config={config}>
      <StaffThemeProvider>
        <StaffAuthGuard expectedRole={config.role} loginPath={config.loginPath}>
          {config.role === "company" ? (
            <CompanyBadgeProvider>
              <StaffPanelShell>{children}</StaffPanelShell>
            </CompanyBadgeProvider>
          ) : (
            <StaffPanelShell>{children}</StaffPanelShell>
          )}
        </StaffAuthGuard>
      </StaffThemeProvider>
    </StaffPanelProvider>
  );
}
