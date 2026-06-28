import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSeekerSession } from "@/lib/auth/seeker";
import { seekerSettingsPatchSchema, type SeekerSettingsPatchValues } from "@/lib/validation/schemas";
import { validateBody } from "@/lib/validation/validate-body";
import type { SeekerSettings } from "@/lib/types";

function mapSettings(row: { notifyHiredEmail: boolean; notifyChatEmail: boolean }): SeekerSettings {
  return {
    notifyHiredEmail: row.notifyHiredEmail,
    notifyChatEmail: row.notifyChatEmail,
  };
}

export async function GET() {
  const session = await requireSeekerSession();
  if (session instanceof NextResponse) return session;

  const row = await prisma.seekerProfile.findUnique({
    where: { id: session.seekerId },
    select: { notifyHiredEmail: true, notifyChatEmail: true },
  });

  if (!row) {
    return NextResponse.json({ error: "データが見つかりません" }, { status: 404 });
  }

  return NextResponse.json({ settings: mapSettings(row) });
}

export async function PATCH(request: Request) {
  const session = await requireSeekerSession();
  if (session instanceof NextResponse) return session;

  try {
    const raw = await request.json();
    const validated = await validateBody<SeekerSettingsPatchValues>(seekerSettingsPatchSchema, raw);
    if (!validated.ok) {
      return NextResponse.json({ error: validated.error }, { status: validated.status });
    }

    const row = await prisma.seekerProfile.update({
      where: { id: session.seekerId },
      data: validated.data,
      select: { notifyHiredEmail: true, notifyChatEmail: true },
    });

    return NextResponse.json({ success: true, settings: mapSettings(row) });
  } catch (err) {
    return NextResponse.json({ error: "リクエストの形式が正しくありません" }, { status: 400 });
  }
}
