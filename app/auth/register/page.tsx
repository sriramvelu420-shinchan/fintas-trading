"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import styles from "../auth.module.css";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Registration failed");
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
            <CardTitle>Create your FinTas account</CardTitle>
            <CardDescription>Get ₹10,00,000 virtual cash instantly</CardDescription>
          </CardHeader>
          <CardContent>
            <form className={styles.form} onSubmit={onSubmit}>
              <Input label="Full Name" value={name} onChange={(e) => setName(e.target.value)} required />
              <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
              <Input label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} hint="Minimum 6 characters" required />
              {error ? <div className={styles.error}>{error}</div> : null}
              <Button type="submit" disabled={loading} fullWidth>
                {loading ? "Creating account..." : "Create Account"}
              </Button>
            </form>
            <div className={styles.switch}>
              Already have an account? <Link href="/auth/login">Sign in</Link>
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
