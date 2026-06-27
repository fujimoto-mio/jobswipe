import { NextResponse } from "next/server";
import { requireStaffUser } from "@/lib/auth/admin";
import {
  getApplicationsForStaff,
  getApplicationWithSeeker,
  updateApplicationStatus,
} from "@/lib/db";
import { staffCanAccessApplication } from "@/lib/db/access";
import type { ApplicationStatus } from "@/lib/types";

export async function GET(request: Request) {
  const staff = await requireStaffUser();
  if (staff instanceof NextResponse) return staff;

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  try {
    if (id) {
      const app = await getApplicationWithSeeker(id);
      if (!app) return NextResponse.json({ error: "Not found" }, { status: 404 });
      if (staff.role === "company") {
        const allowed = await staffCanAccessApplication(id, staff);
        if (!allowed) {
          return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }
      }
      return NextResponse.json({ application: app });
    }

    const applications = await getApplicationsForStaff(
      staff.role === "company" ? staff.companyId : null
    );
    return NextResponse.json({ applications, total: applications.length });
  } catch (error) {
    console.error("[GET /api/admin/applications]", error);
    return NextResponse.json(
      { error: "応募データの取得に失敗しました", applications: [], total: 0 },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  const staff = await requireStaffUser();
  if (staff instanceof NextResponse) return staff;

  try {
    const { id, status } = (await request.json()) as {
      id: string;
      status: ApplicationStatus;
    };

    if (!id || !status) {
      return NextResponse.json({ error: "id and status are required" }, { status: 400 });
    }

    const application = await updateApplicationStatus(
      id,
      status,
      staff.role === "company" ? staff.companyId : null
    );
    if (!application) {
      return NextResponse.json({ error: "Application not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, application });
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }
}
