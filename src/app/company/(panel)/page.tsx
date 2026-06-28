import type { Metadata } from "next";
import CompanyDashboard from "@/components/company/CompanyDashboard";

export const metadata: Metadata = {
  title: "採用ダッシュボード",
};

export default function CompanyDashboardPage() {
  return <CompanyDashboard />;
}
