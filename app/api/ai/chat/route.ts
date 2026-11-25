import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { buildAiContext, generateAiAnswer } from "@/lib/ai";

export async function POST(req: NextRequest) {
  try {
    const user = await requireUser();
    const body = await req.json();
    const question = String(body.message || "").trim();
    if (!question) {
      return NextResponse.json({ error: "Ask a question first." }, { status: 400 });
    }
    if (question.length > 800) {
      return NextResponse.json({ error: "Question must be under 800 characters." }, { status: 400 });
    }
    const context = buildAiContext(user.id, user.name);
    const answer = await generateAiAnswer(question, context);
    return NextResponse.json({ answer, mode: process.env.OPENAI_API_KEY ? "connected" : "demo" });
  } catch (e: any) {
    if (e.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Please log in to use AI Mode." }, { status: 401 });
    }
    return NextResponse.json({ error: e.message || "AI request failed." }, { status: 400 });
  }
}
