import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { getBudgets, getGoals, getTransactions } from "@/lib/store";
import { computeMoneySummary } from "@/lib/finance";

export async function GET() {
  try {
    const user = await requireUser();
    const txns = getTransactions(user.id);
    const budgets = getBudgets(user.id);
    const goals = getGoals(user.id);
    const summary = computeMoneySummary(txns, budgets, goals);
    return NextResponse.json(summary);
  } catch (e: any) {
    if (e.message === "UNAUTHORIZED") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    return NextResponse.json({ error: e.message || "Error" }, { status: 400 });
  }
}
