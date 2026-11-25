import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { addAudit, getTransactions, writeDb } from "@/lib/store";
import { generateId } from "@/lib/utils";

export async function GET() {
  try {
    const user = await requireUser();
    const txns = getTransactions(user.id);
    return NextResponse.json({ transactions: txns });
  } catch (e: any) {
    if (e.message === "UNAUTHORIZED") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    return NextResponse.json({ error: e.message || "Error" }, { status: 400 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireUser();
    const body = await req.json();
    const kind = body.kind === "expense" ? "expense" : "income";
    const category = String(body.category || "Other").trim();
    const description = String(body.description || "").trim();
    const amount = Math.max(0, Number(body.amount) || 0);
    const date = body.date ? new Date(body.date).toISOString() : new Date().toISOString();
    const now = new Date().toISOString();
    const txn = {
      id: generateId("txn"),
      userId: user.id,
      kind,
      category,
      description: description || category,
      amount,
      date,
      createdAt: now,
    };
    writeDb((db) => {
      db.transactions.push(txn as any);
      db.notifications.push({
        id: generateId("notif"),
        userId: user.id,
        title: kind === "income" ? "Income Added" : "Expense Added",
        message: `${kind === "income" ? "+" : "-"}₹${amount} • ${category}`,
        kind: "money",
        read: false,
        createdAt: now,
      });
    });
    addAudit(user.id, user.name, "money.transaction", `${kind} ${amount} ${category}`, req.headers.get("x-forwarded-for") || "127.0.0.1");
    return NextResponse.json({ ok: true, transaction: txn });
  } catch (e: any) {
    if (e.message === "UNAUTHORIZED") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    return NextResponse.json({ error: e.message || "Error" }, { status: 400 });
  }
}
