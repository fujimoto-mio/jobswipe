import { NextResponse } from "next/server";
import { requireSeekerSession, getSeekerSession } from "@/lib/auth/seeker";
import { requireStaffUser, getStaffUser } from "@/lib/auth/admin";
import {
  createApplication,
  getApplicationsForSeeker,
  getApplicationsForStaff,
  getApplicationWithSeeker,
  updateApplicationStatus,
} from "@/lib/db";
import { staffCanAccessApplication } from "@/lib/db/access";
import type { ApplicationStatus } from "@/lib/types";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  try {
    const staff = await getStaffUser();
    if (staff) {
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
    }

    const session = await getSeekerSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const applications = await getApplicationsForSeeker(session.seekerId);
    return NextResponse.json({ applications, total: applications.length });
  } catch (error) {
    console.error("[GET /api/applications]", error);
    return NextResponse.json(
      { error: "応募データの取得に失敗しました", applications: [], total: 0 },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const session = await requireSeekerSession();
  if (session instanceof NextResponse) return session;

  try {
    const body = await request.json();
    const {
      jobId,
      message,
      applicantName,
      applicantEmail,
      applicantBirthday,
      applicantArea,
      applicantJobType,
    } = body;

    if (!jobId) {
      return NextResponse.json({ error: "jobId is required" }, { status: 400 });
    }

    let application = await createApplication(
      session.seekerId,
      {
        jobId,
        message,
        applicantName,
        applicantEmail,
        applicantBirthday,
        applicantArea,
        applicantJobType,
      },
      session.profile
    );

    return NextResponse.json({ success: true, application }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Invalid request";
    return NextResponse.json({ error: message }, { status: 400 });
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
