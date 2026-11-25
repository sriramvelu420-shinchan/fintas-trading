import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { getDb } from "@/lib/store";

export async function GET() {
  try {
    await requireAdmin();
    const db = getDb();
    const users = db.users.map((u) => ({ ...u, passwordHash: undefined }));
    return NextResponse.json({ users });
  } catch (e: any) {
    if (e.message === "UNAUTHORIZED") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (e.message === "FORBIDDEN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    return NextResponse.json({ error: e.message || "Error" }, { status: 400 });
  }
}
