import { NextResponse } from "next/server";
import {
  addChatMessage,
  getChatMessages,
  getChatThreadsForSeeker,
  getChatThreadsForStaff,
} from "@/lib/db";
import { requireSeekerSession } from "@/lib/auth/seeker";
import { requireStaffUser } from "@/lib/auth/admin";
import { seekerCanAccessApplication, staffCanAccessApplication } from "@/lib/db/access";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const applicationId = searchParams.get("applicationId");

  if (applicationId) {
    const staff = await requireStaffUser();
    if (!(staff instanceof NextResponse)) {
      const allowed = await staffCanAccessApplication(applicationId, staff);
      if (!allowed) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
      return NextResponse.json({ messages: await getChatMessages(applicationId) });
    }

    const session = await requireSeekerSession();
    if (session instanceof NextResponse) return session;

    const allowed = await seekerCanAccessApplication(applicationId, session.seekerId);
    if (!allowed) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json({ messages: await getChatMessages(applicationId) });
  }

  const session = await requireSeekerSession();
  if (session instanceof NextResponse) {
    const staff = await requireStaffUser();
    if (staff instanceof NextResponse) return staff;

    const threads = await getChatThreadsForStaff(
      staff.role === "company" ? staff.companyId : null
    );
    return NextResponse.json({ threads });
  }

  return NextResponse.json({ threads: await getChatThreadsForSeeker(session.seekerId) });
}

export async function POST(request: Request) {
  try {
    const { applicationId, content, sender } = (await request.json()) as {
      applicationId: string;
      content: string;
      sender: "seeker" | "company";
    };

    if (!applicationId || !content?.trim()) {
      return NextResponse.json(
        { error: "applicationId and content are required" },
        { status: 400 }
      );
    }

    if (sender === "company") {
      const staff = await requireStaffUser();
      if (staff instanceof NextResponse) return staff;
      const allowed = await staffCanAccessApplication(applicationId, staff);
      if (!allowed) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
    } else {
      const session = await requireSeekerSession();
      if (session instanceof NextResponse) return session;
      const allowed = await seekerCanAccessApplication(applicationId, session.seekerId);
      if (!allowed) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
    }

    const message = await addChatMessage(applicationId, sender ?? "seeker", content.trim());
    return NextResponse.json({ success: true, message }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }
}
