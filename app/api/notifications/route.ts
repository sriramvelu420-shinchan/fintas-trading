import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { getNotifications, writeDb } from "@/lib/store";

export async function GET() {
  try {
    const user = await requireUser();
    const notifications = getNotifications(user.id);
    return NextResponse.json({ notifications });
  } catch (e: any) {
    if (e.message === "UNAUTHORIZED") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    return NextResponse.json({ error: e.message || "Error" }, { status: 400 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireUser();
    const body = await req.json();
    const markAll = body.markAll;
    writeDb((db) => {
      for (const n of db.notifications) {
        if (n.userId === user.id && (markAll || n.id === body.id)) {
          (n as any).read = true;
        }
      }
    });
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    if (e.message === "UNAUTHORIZED") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    return NextResponse.json({ error: e.message || "Error" }, { status: 400 });
  }
}
