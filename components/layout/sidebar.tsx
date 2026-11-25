"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import styles from "./sidebar.module.css";

const nav = [
  { href: "/dashboard", label: "Dashboard", icon: "▦" },
  { href: "/market", label: "Stock Market", icon: "📈" },
  { href: "/trading", label: "Paper Trading", icon: "💹" },
  { href: "/portfolio", label: "Portfolio", icon: "🧺" },
  { href: "/money", label: "Money Management", icon: "💸" },
  { href: "/watchlist", label: "Watchlist", icon: "★" },
  { href: "/alerts", label: "Price Alerts", icon: "🔔" },
  { href: "/notifications", label: "Notifications", icon: "📬" },
  { href: "/account", label: "Account", icon: "👤" },
];

const adminNav = [
  { href: "/admin", label: "Admin Dashboard", icon: "⚙️" },
  { href: "/admin/users", label: "Users", icon: "👥" },
  { href: "/admin/trades", label: "Trading Monitor", icon: "📊" },
  { href: "/admin/audit", label: "Audit Logs", icon: "🧾" },
];

export function Sidebar() {
  const pathname = usePathname();
  return (
    <aside className={styles.sidebar}>
      <div className={styles.brand}>
        <div className={styles.logoDot} />
        <div>
          <div className={styles.brandName}>FinTas Trading</div>
          <div className={styles.brandSub}>Paper Trading • Money Mgmt</div>
        </div>
      </div>
      <nav className={styles.nav}>
        <div className={styles.sectionLabel}>Main</div>
        {nav.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link key={item.href} href={item.href} className={cn(styles.link, active && styles.active)}>
              <span className={styles.icon}>{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          );
        })}
        <div className={styles.sectionLabel}>Admin</div>
        {adminNav.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link key={item.href} href={item.href} className={cn(styles.link, active && styles.active)}>
              <span className={styles.icon}>{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
      <div className={styles.footer}>
        <div className={styles.simulated}>Simulated Market Data • Paper Trading Only</div>
      </div>
    </aside>
  );
}
