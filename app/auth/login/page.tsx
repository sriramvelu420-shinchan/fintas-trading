"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import styles from "../auth.module.css";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("demo@fintastrading.app");
  const [password, setPassword] = useState("demo123");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Login failed");
      router.push("/dashboard");
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className={styles.authMain}>
      <div className={styles.authCardWrap}>
        <Card>
          <CardHeader>
            <CardTitle>Sign in to FinTas Trading</CardTitle>
            <CardDescription>Access your paper trading dashboard</CardDescription>
          </CardHeader>
          <CardContent>
            <form className={styles.form} onSubmit={onSubmit}>
              <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
              <Input label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
              {error ? <div className={styles.error}>{error}</div> : null}
              <Button type="submit" disabled={loading} fullWidth>
                {loading ? "Signing in..." : "Sign In"}
              </Button>
            </form>
            <div className={styles.hint}>
              Demo: demo@fintastrading.app / demo123 • Admin: admin@fintastrading.app / admin123
            </div>
            <div className={styles.switch}>
              Don't have an account? <Link href="/auth/register">Create one</Link>
            </div>
          </CardContent>
        </Card>
        <div className={styles.backLink}>
          <Link href="/">← Back to home</Link>
        </div>
      </div>
    </main>
  );
}
