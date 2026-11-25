"use client";

import { FormEvent, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import styles from "./ai.module.css";

interface Message {
  id: string;
  role: "assistant" | "user";
  text: string;
}

export default function AiClient({
  userName,
  suggestions,
  mode,
}: {
  userName: string;
  suggestions: string[];
  mode: "demo" | "connected";
}) {
  const greeting: Message = {
    id: "greeting",
    role: "assistant",
    text: `Hi ${userName.split(" ")[0]}! I am FinTas AI. I can explain your virtual portfolio, simulated market data, paper orders, budgets and savings goals. What would you like to explore?`,
  };
  const [messages, setMessages] = useState<Message[]>([greeting]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function ask(question: string) {
    const text = question.trim();
    if (!text || loading) return;
    setError("");
    setInput("");
    setMessages((prev) => [...prev, { id: `u-${Date.now()}`, role: "user", text }]);
    setLoading(true);
    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "AI request failed.");
      setMessages((prev) => [...prev, { id: `a-${Date.now()}`, role: "assistant", text: data.answer }]);
    } catch (e: any) {
      setError(e.message || "AI request failed.");
    } finally {
      setLoading(false);
    }
  }

  function submit(e: FormEvent) {
    e.preventDefault();
    ask(input);
  }

  return (
    <Card className={styles.chatCard}>
      <CardHeader>
        <CardTitle>FinTas AI Assistant</CardTitle>
        <CardDescription>
          {mode === "connected" ? "Connected assistant with your demo context" : "Rule-based demo engine using your current data"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className={styles.messages} aria-live="polite">
          {messages.map((message) => (
            <div key={message.id} className={`${styles.message} ${styles[message.role]}`}>
              <div className={styles.avatar}>{message.role === "assistant" ? "AI" : "You"}</div>
              <div className={styles.bubble}>{message.text}</div>
            </div>
          ))}
          {loading ? (
            <div className={`${styles.message} ${styles.assistant}`}>
              <div className={styles.avatar}>AI</div>
              <div className={`${styles.bubble} ${styles.typing}`}>Thinking...</div>
            </div>
          ) : null}
        </div>

        <div className={styles.suggestions}>
          {suggestions.map((s) => (
            <button key={s} type="button" className={styles.chip} onClick={() => ask(s)} disabled={loading}>
              {s}
            </button>
          ))}
        </div>

        {error ? <div className={styles.error}>{error}</div> : null}

        <form className={styles.composer} onSubmit={submit}>
          <input
            className={styles.input}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about your portfolio, budgets, orders or the simulated market..."
            aria-label="Ask FinTas AI"
            maxLength={800}
          />
          <Button type="submit" disabled={loading || !input.trim()}>
            {loading ? "Thinking..." : "Ask AI"}
          </Button>
        </form>
        <div className={styles.footnote}>AI Mode is educational. It never places real trades or moves real money.</div>
      </CardContent>
    </Card>
  );
}
