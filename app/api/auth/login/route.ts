import { NextRequest, NextResponse } from "next/server";
import { addAudit, getUserByEmail, getDb } from "@/lib/store";
import { setSession } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const email = String(body.email || "").trim().toLowerCase();
    const password = String(body.password || "");
    const user = getUserByEmail(email);
    if (!user || user.passwordHash !== password + "hash") {
      // our seed uses password + "hash" pattern
      // also allow exact match as fallback
      if (!(user && user.passwordHash === password)) {
        return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
      }
    }
    if (user!.status !== "active") {
      return NextResponse.json({ error: "Account suspended" }, { status: 403 });
    }
    await setSession(user!.id);
    addAudit(user!.id, user!.name, "auth.login", "User logged in", req.headers.get("x-forwarded-for") || "127.0.0.1");
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Error" }, { status: 400 });
  }
}
