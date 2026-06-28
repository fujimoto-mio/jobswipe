import { NextResponse } from "next/server";
import { requireAdminUser } from "@/lib/auth/admin";
import { listCompanies } from "@/lib/db/companies";

export async function GET() {
  const staff = await requireAdminUser();
  if (staff instanceof NextResponse) return staff;

  const companies = await listCompanies();
  return NextResponse.json({ companies });
}
