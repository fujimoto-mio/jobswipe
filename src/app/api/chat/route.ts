import { NextResponse } from "next/server";
import { API_ERRORS } from "@/lib/api-errors";
import {
  addChatMessage,
  getChatMessages,
  getChatThreadsForSeeker,
  getChatThreadsForStaff,
  getCompanyUnreadTotal,
  getSeekerUnreadTotal,
  markCompanyChatRead,
  markSeekerChatRead,
} from "@/lib/db";
import { requireSeekerSession, getSeekerSession } from "@/lib/auth/seeker";
import { requireStaffUser, getStaffUser } from "@/lib/auth/admin";
import { seekerCanAccessApplication, staffCanAccessApplication } from "@/lib/db/access";
import {
  broadcastChatMessage,
  broadcastCompanyChatInbox,
  broadcastSeekerChatInbox,
} from "@/lib/chat/realtime";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const applicationId = searchParams.get("applicationId");

  if (applicationId) {
    const staff = await getStaffUser();
    if (staff) {
      const allowed = await staffCanAccessApplication(applicationId, staff);
      if (!allowed) {
        return NextResponse.json({ error: API_ERRORS.forbidden }, { status: 403 });
      }
      return NextResponse.json({ messages: await getChatMessages(applicationId) });
    }

    const session = await getSeekerSession();
    if (!session) {
      return NextResponse.json({ error: API_ERRORS.unauthorized }, { status: 401 });
    }

    const allowed = await seekerCanAccessApplication(applicationId, session.seekerId);
    if (!allowed) {
      return NextResponse.json({ error: API_ERRORS.forbidden }, { status: 403 });
    }

    return NextResponse.json({ messages: await getChatMessages(applicationId) });
  }

  const session = await getSeekerSession();
  if (session) {
    const [threads, unreadTotal] = await Promise.all([
      getChatThreadsForSeeker(session.seekerId),
      getSeekerUnreadTotal(session.seekerId),
    ]);
    return NextResponse.json({ threads, unreadTotal });
  }

  const staff = await getStaffUser();
  if (!staff) {
    return NextResponse.json({ error: API_ERRORS.unauthorized }, { status: 401 });
  }

  const companyId = staff.role === "company" ? staff.companyId : null;
  const threads = await getChatThreadsForStaff(companyId);
  const unreadTotal = companyId ? await getCompanyUnreadTotal(companyId) : 0;
  return NextResponse.json({ threads, unreadTotal });
}

export async function PATCH(request: Request) {
  try {
    const { applicationId } = (await request.json()) as { applicationId?: string };
    if (!applicationId) {
      return NextResponse.json({ error: API_ERRORS.applicationIdRequired }, { status: 400 });
    }

    const staff = await getStaffUser();
    if (staff) {
      if (!staff.companyId) {
        return NextResponse.json({ error: API_ERRORS.forbidden }, { status: 403 });
      }
      const allowed = await staffCanAccessApplication(applicationId, staff);
      if (!allowed) {
        return NextResponse.json({ error: API_ERRORS.forbidden }, { status: 403 });
      }

      await markCompanyChatRead(applicationId, staff.companyId);
      const unreadTotal = await getCompanyUnreadTotal(staff.companyId);
      return NextResponse.json({ success: true, unreadTotal });
    }

    const session = await requireSeekerSession();
    if (session instanceof NextResponse) return session;

    const allowed = await seekerCanAccessApplication(applicationId, session.seekerId);
    if (!allowed) {
      return NextResponse.json({ error: API_ERRORS.forbidden }, { status: 403 });
    }

    await markSeekerChatRead(applicationId, session.seekerId);
    const unreadTotal = await getSeekerUnreadTotal(session.seekerId);
    return NextResponse.json({ success: true, unreadTotal });
  } catch (error) {
    console.error("[PATCH /api/chat]", error);
    const message = error instanceof Error ? error.message : API_ERRORS.invalidJson;
    return NextResponse.json({ error: message }, { status: 400 });
  }
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
        { error: API_ERRORS.applicationIdAndContentRequired },
        { status: 400 }
      );
    }

    let senderMeta: { name: string; avatarUrl: string | null } | undefined;

    if (sender === "company") {
      const staff = await requireStaffUser();
      if (staff instanceof NextResponse) return staff;
      const allowed = await staffCanAccessApplication(applicationId, staff);
      if (!allowed) {
        return NextResponse.json({ error: API_ERRORS.forbidden }, { status: 403 });
      }

      const account = await prisma.account.findUnique({
        where: { id: staff.id },
        include: { company: true },
      });
      senderMeta = {
        name: account?.name?.trim() || account?.company?.name || "担当者",
        avatarUrl: account?.avatarUrl ?? null,
      };
    } else {
      const session = await requireSeekerSession();
      if (session instanceof NextResponse) return session;
      const allowed = await seekerCanAccessApplication(applicationId, session.seekerId);
      if (!allowed) {
        return NextResponse.json({ error: API_ERRORS.forbidden }, { status: 403 });
      }
    }

    const message = await addChatMessage(
      applicationId,
      sender ?? "seeker",
      content.trim(),
      senderMeta
    );
    void broadcastChatMessage(applicationId, message);

    const application = await prisma.application.findUnique({
      where: { id: applicationId },
      select: { seekerId: true, jobId: true, job: { select: { companyId: true } } },
    });

    if ((sender ?? "seeker") === "company") {
      if (application?.seekerId) {
        void broadcastSeekerChatInbox(application.seekerId, message);
      }
    } else if (application?.job.companyId) {
      void broadcastCompanyChatInbox(application.job.companyId, {
        ...message,
        jobId: application.jobId,
      });
    }

    return NextResponse.json({ success: true, message }, { status: 201 });
  } catch (error) {
    console.error("[POST /api/chat]", error);
    const message = error instanceof Error ? error.message : API_ERRORS.invalidJson;
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
