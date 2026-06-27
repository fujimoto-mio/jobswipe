import { redirect } from "next/navigation";
import { getStaffUser } from "@/lib/auth/admin";
import StaffPanelClient from "@/components/staff/StaffPanelClient";
import { COMPANY_PANEL } from "@/lib/staff/paths";

export default async function CompanyPanelLayout({ children }: { children: React.ReactNode }) {
  const staff = await getStaffUser();

  if (!staff) {
    redirect("/company/login");
  }

  if (staff.role === "admin") {
    redirect("/admin");
  }

  return <StaffPanelClient config={COMPANY_PANEL}>{children}</StaffPanelClient>;
}
