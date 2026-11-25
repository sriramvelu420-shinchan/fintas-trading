import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { getOrders } from "@/lib/store";

export async function GET() {
  try {
    const user = await requireUser();
    const orders = getOrders(user.id);
    return NextResponse.json({ orders });
  } catch (e: any) {
    if (e.message === "UNAUTHORIZED") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    return NextResponse.json({ error: e.message || "Error" }, { status: 400 });
  }
}
