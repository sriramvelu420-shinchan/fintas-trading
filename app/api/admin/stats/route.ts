import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { getDb } from "@/lib/store";

export async function GET() {
  try {
    await requireAdmin();
    const db = getDb();
    const users = db.users.length;
    const activeUsers = db.users.filter((u) => u.status === "active").length;
    const orders = db.orders.length;
    const completed = db.orders.filter((o) => o.status === "completed").length;
    const holdings = db.holdings.length;
    const totalCash = db.accounts.reduce((s, a) => s + a.cash, 0);
    const totalStart = db.accounts.reduce((s, a) => s + a.startingCash, 0);
    const totalPnl = totalCash + db.holdings.reduce((s, h) => {
      const q = db.quotes.find((qq) => qq.symbol === h.symbol);
      if (!q) return s;
      return s + h.qty * q.price;
    }, 0) - totalStart;
    return NextResponse.json({
      users,
      activeUsers,
      orders,
      completed,
      holdings,
      totalCash,
      totalStart,
      totalPnl,
      lastTickAt: db.lastTickAt,
    });
  } catch (e: any) {
    if (e.message === "UNAUTHORIZED") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (e.message === "FORBIDDEN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    return NextResponse.json({ error: e.message || "Error" }, { status: 400 });
  }
}
