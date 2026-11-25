import { AppShell } from "@/components/layout/app-shell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { requireAdmin } from "@/lib/auth";
import { getDb } from "@/lib/store";
import { formatCurrency } from "@/lib/utils";
import styles from "../../money/money.module.css";


export default async function AdminTradesPage() {
  try {
    await requireAdmin();
  } catch {}
  const db = getDb();
  const orders = [...db.orders].reverse().slice(0, 100);

  return (
    <AppShell>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Trading Monitor</h1>
          <p className={styles.subtitle}>Simulated trading activity</p>
        </div>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Recent Orders</CardTitle>
          <CardDescription>All users</CardDescription>
        </CardHeader>
        <CardContent>
          <div className={styles.txnList}>
            {orders.map((o) => {
              const u = db.users.find((x) => x.id === o.userId);
              return (
                <div key={o.id} className={styles.txnRow}>
                  <div>
                    <div className={styles.txnCat}>
                      {o.symbol} • {o.side.toUpperCase()} {o.qty} qty • {o.status}
                    </div>
                    <div className={styles.txnDesc}>
                      User: {u?.name || o.userId} • {new Date(o.createdAt).toLocaleString("en-IN")}
                    </div>
                  </div>
                  <span>{o.total ? formatCurrency(o.total) : "-"}</span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </AppShell>
  );
}
