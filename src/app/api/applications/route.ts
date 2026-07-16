import { NextResponse } from "next/server";
import { requireSeekerSession } from "@/lib/auth/seeker";
import { requireStaffUser, getStaffUser } from "@/lib/auth/admin";
import { API_ERRORS } from "@/lib/api-errors";
import {
  createApplication,
  getApplicationsForSeeker,
  getApplicationsForStaff,
  getApplicationWithSeeker,
  updateApplicationStatus,
} from "@/lib/db";
import { staffCanAccessApplication } from "@/lib/db/access";
import { applySchema } from "@/lib/validation/schemas";
import type { ApplicationStatus } from "@/lib/types";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  try {
    const staff = await getStaffUser();
    if (staff) {
      if (id) {
        const app = await getApplicationWithSeeker(id);
        if (!app) return NextResponse.json({ error: API_ERRORS.notFound }, { status: 404 });
        if (staff.role === "company") {
          const allowed = await staffCanAccessApplication(id, staff);
          if (!allowed) {
            return NextResponse.json({ error: API_ERRORS.forbidden }, { status: 403 });
          }
        }
        return NextResponse.json({ application: app });
      }
      const applications = await getApplicationsForStaff(
        staff.role === "company" ? staff.companyId : null
      );
      return NextResponse.json({ applications, total: applications.length });
    }

    const session = await requireSeekerSession();
    if (session instanceof NextResponse) return session;

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
      return NextResponse.json({ error: API_ERRORS.jobIdRequired }, { status: 400 });
    }

    const validated = await applySchema.validate(
      {
        name: applicantName ?? session.profile.name,
        birthday: applicantBirthday ?? session.profile.birthday,
        area: applicantArea ?? session.profile.area,
        jobType: applicantJobType ?? session.profile.desiredJobType,
        email: applicantEmail ?? session.profile.email,
        message: message ?? "",
      },
      { stripUnknown: true }
    );

    const application = await createApplication(
      session.seekerId,
      {
        jobId,
        message: validated.message,
        applicantName: validated.name,
        applicantEmail: validated.email,
        applicantBirthday: validated.birthday,
        applicantArea: validated.area,
        applicantJobType: validated.jobType,
      },
      session.profile
    );

    return NextResponse.json({ success: true, application }, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === "JOB_NOT_AVAILABLE") {
      return NextResponse.json({ error: "この求人は現在応募できません" }, { status: 404 });
    }
    const message = error instanceof Error ? error.message : API_ERRORS.invalidRequest;
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
      return NextResponse.json({ error: API_ERRORS.idAndStatusRequired }, { status: 400 });
    }

    const application = await updateApplicationStatus(
      id,
      status,
      staff.role === "company" ? staff.companyId : null
    );
    if (!application) {
      return NextResponse.json({ error: API_ERRORS.applicationNotFound }, { status: 404 });
    }

    return NextResponse.json({ success: true, application });
  } catch {
    return NextResponse.json({ error: API_ERRORS.invalidJson }, { status: 400 });
  }
}
