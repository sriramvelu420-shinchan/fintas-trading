import { AppShell } from "@/components/layout/app-shell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getSession } from "@/lib/auth";
import { getNotifications } from "@/lib/store";
import styles from "../money/money.module.css";


export default async function NotificationsPage() {
  const session = await getSession();
  const userId = session?.id;
  const notifs = userId ? getNotifications(userId) : [];

  return (
    <AppShell>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Notifications</h1>
          <p className={styles.subtitle}>Trades, alerts, money &amp; system updates</p>
        </div>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>All Notifications</CardTitle>
          <CardDescription>Recent activity</CardDescription>
        </CardHeader>
        <CardContent>
          {notifs.length === 0 ? (
            <div className={styles.empty}>No notifications</div>
          ) : (
            <div className={styles.txnList}>
              {notifs.map((n: any) => (
                <div key={n.id} className={styles.txnRow}>
                  <div>
                    <div className={styles.txnCat}>{n.title}</div>
                    <div className={styles.txnDesc}>
                      {n.message} • {new Date(n.createdAt).toLocaleString("en-IN")}
                    </div>
                  </div>
                  <span className={styles.kpiSub}>{n.kind}</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </AppShell>
  );
}
