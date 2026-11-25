import { AppShell } from "@/components/layout/app-shell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getSession } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import styles from "../money/money.module.css";
import Link from "next/link";
import LogoutButton from "./logout-button";


export default async function AccountPage() {
  const session = await getSession();

  return (
    <AppShell>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Account</h1>
          <p className={styles.subtitle}>Profile, settings &amp; security</p>
        </div>
      </div>
      <div className={styles.gridTwo}>
        <Card>
          <CardHeader>
            <CardTitle>Profile</CardTitle>
            <CardDescription>Your details</CardDescription>
          </CardHeader>
          <CardContent>
            {session ? (
              <div className={styles.form}>
                <div className={styles.txnRow}>
                  <span>Name</span>
                  <span>{session.name}</span>
                </div>
                <div className={styles.txnRow}>
                  <span>Email</span>
                  <span>{session.email}</span>
                </div>
                <div className={styles.txnRow}>
                  <span>Role</span>
                  <span>{session.role}</span>
                </div>
                <div className={styles.txnRow}>
                  <span>Status</span>
                  <span>{session.status}</span>
                </div>
                <div className={styles.txnRow}>
                  <span>Member Since</span>
                  <span>{new Date(session.createdAt).toLocaleDateString("en-IN")}</span>
                </div>
                <LogoutButton />
              </div>
            ) : (
              <div>
                <div className={styles.empty}>Not logged in</div>
                <div style={{ marginTop: 12 }}>
                  <Link href="/auth/login">
                    <Button>Login</Button>
                  </Link>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Preferences</CardTitle>
            <CardDescription>Notifications &amp; theme</CardDescription>
          </CardHeader>
          <CardContent>
            <div className={styles.form}>
              <div className={styles.txnRow}>
                <span>Email Alerts</span>
                <span>{session?.preferences?.emailAlerts ? "Enabled" : "Disabled"}</span>
              </div>
              <div className={styles.txnRow}>
                <span>Price Alerts</span>
                <span>{session?.preferences?.priceAlerts ? "Enabled" : "Disabled"}</span>
              </div>
              <div className={styles.txnRow}>
                <span>Weekly Digest</span>
                <span>{session?.preferences?.weeklyDigest ? "Enabled" : "Disabled"}</span>
              </div>
              <div className={styles.txnRow}>
                <span>Theme</span>
                <span>{session?.preferences?.theme || "dark"}</span>
              </div>
              <div className={styles.kpiSub}>Use the theme toggle in the top bar to switch dark/light.</div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
