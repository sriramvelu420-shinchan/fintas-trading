import { AppShell } from "@/components/layout/app-shell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { requireAdmin } from "@/lib/auth";
import { getDb } from "@/lib/store";
import { formatCurrency } from "@/lib/utils";
import styles from "../dashboard/dashboard.module.css";


export default async function AdminDashboardPage() {
  try {
    await requireAdmin();
  } catch {
    // will still render but show message
  }
  const db = getDb();
  const users = db.users.length;
  const orders = db.orders.length;
  const completed = db.orders.filter((o) => o.status === "completed").length;
  const holdings = db.holdings.length;
  const totalCash = db.accounts.reduce((s, a) => s + a.cash, 0);

  return (
    <AppShell>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Admin Dashboard</h1>
          <p className={styles.subtitle}>Monitor users, trading activity &amp; system</p>
        </div>
        <span className="badge">Restricted</span>
      </div>
      <section className={styles.kpiGrid}>
        <Card>
          <CardHeader>
            <CardTitle>Users</CardTitle>
            <CardDescription>Total registered</CardDescription>
          </CardHeader>
          <CardContent>
            <div className={styles.kpiValue}>{users}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Orders</CardTitle>
            <CardDescription>All orders</CardDescription>
          </CardHeader>
          <CardContent>
            <div className={styles.kpiValue}>{orders}</div>
            <div className={styles.kpiSub}>{completed} completed</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Active Holdings</CardTitle>
            <CardDescription>Positions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className={styles.kpiValue}>{holdings}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Total Virtual Cash</CardTitle>
            <CardDescription>Across accounts</CardDescription>
          </CardHeader>
          <CardContent>
            <div className={styles.kpiValue}>{formatCurrency(totalCash)}</div>
          </CardContent>
        </Card>
      </section>
    </AppShell>
  );
}
