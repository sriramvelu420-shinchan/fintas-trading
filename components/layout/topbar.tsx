"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import styles from "./topbar.module.css";

export function Topbar() {
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    try {
      const t = localStorage.getItem("fintas-theme") as "dark" | "light" | null;
      if (t) setTheme(t);
      else setTheme("dark");
    } catch {
      setTheme("dark");
    }
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => setUser(d.user))
      .catch(() => setUser(null));
  }, []);

  function toggleTheme() {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    try {
      localStorage.setItem("fintas-theme", next);
      document.documentElement.setAttribute("data-theme", next);
    } catch {}
  }

  return (
    <header className={styles.topbar}>
      <div className={styles.left}>
        <div className={styles.search}>
          <span>🔍</span>
          <input placeholder="Search stocks, symbols or pages..." />
        </div>
        <span className={styles.pill}>⚠️ Simulated • Paper Trading Only • No Real Money</span>
      </div>
      <div className={styles.right}>
        <Link href="/ai" className={styles.aiLink}>AI Mode</Link>
        <Button variant="ghost" size="sm" onClick={toggleTheme}>
          {theme === "dark" ? "☀️ Light" : "🌙 Dark"}
        </Button>
        <Link href="/notifications" className={styles.iconBtn}>
          🔔
        </Link>
        {user ? (
          <Link href="/account" className={styles.user}>
            <div className={styles.avatar} style={{ background: user.avatarColor || "#22d3ee" }}>
              {(user.name || "U")
                .split(" ")
                .map((x: string) => x[0])
                .slice(0, 2)
                .join("")}
            </div>
            <div className={styles.userInfo}>
              <div className={styles.userName}>{user.name}</div>
              <div className={styles.userRole}>{user.role}</div>
            </div>
          </Link>
        ) : (
          <Link href="/auth/login">
            <Button variant="outline" size="sm">
              Login / Sign Up
            </Button>
          </Link>
        )}
      </div>
    </header>
  );
}
