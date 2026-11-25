import { NextRequest, NextResponse } from "next/server";
import { addAudit, getUserByEmail, writeDb } from "@/lib/store";
import { setSession } from "@/lib/auth";
import { generateId } from "@/lib/utils";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const name = String(body.name || "").trim();
    const email = String(body.email || "").trim().toLowerCase();
    const password = String(body.password || "");
    if (!name || !email || password.length < 6) {
      return NextResponse.json({ error: "Invalid details" }, { status: 400 });
    }
    if (getUserByEmail(email)) {
      return NextResponse.json({ error: "Email already registered" }, { status: 409 });
    }
    const now = new Date().toISOString();
    const user = {
      id: generateId("usr"),
      name,
      email,
      passwordHash: password + "hash",
      role: "user" as const,
      status: "active" as const,
      createdAt: now,
      avatarColor: ["#22d3ee", "#34d399", "#f59e0b", "#a78bfa", "#f43f5e"][Math.floor(Math.random() * 5)],
      preferences: {
        theme: "dark" as const,
        emailAlerts: true,
        priceAlerts: true,
        weeklyDigest: false,
      },
    };
    writeDb((db) => {
      db.users.push(user);
      db.accounts.push({
        userId: user.id,
        startingCash: 1000000,
        cash: 1000000,
        createdAt: now,
        updatedAt: now,
      });
      db.watchlists.push({
        id: generateId("wlist"),
        userId: user.id,
        name: "My Watchlist",
        symbols: ["RELIANCE", "TCS", "HDFCBANK"],
        createdAt: now,
      });
      db.notifications.push({
        id: generateId("notif"),
        userId: user.id,
        title: "Welcome to FinTas Trading",
        message: "Your virtual account is funded with ₹10,00,000. Start trading responsibly with simulated data.",
        kind: "system",
        read: false,
        createdAt: now,
      });
    });
    await setSession(user.id);
    addAudit(user.id, user.name, "auth.register", "User registered", req.headers.get("x-forwarded-for") || "127.0.0.1");
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Error" }, { status: 400 });
  }
}
