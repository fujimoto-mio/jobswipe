import { redirect } from "next/navigation";
import { getStaffUser } from "@/lib/auth/admin";
import StaffPanelClient from "@/components/staff/StaffPanelClient";
import { ADMIN_PANEL } from "@/lib/staff/paths";

export default async function AdminPanelLayout({ children }: { children: React.ReactNode }) {
  const staff = await getStaffUser();

  if (!staff) {
    redirect("/admin/login");
  }

  if (staff.role === "company") {
    redirect("/company");
  }

  return <StaffPanelClient config={ADMIN_PANEL}>{children}</StaffPanelClient>;
}
