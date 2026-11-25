import { AppShell } from "@/components/layout/app-shell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { requireAdmin } from "@/lib/auth";
import { getDb } from "@/lib/store";
import styles from "../../money/money.module.css";


export default async function AdminUsersPage() {
  try {
    await requireAdmin();
  } catch {}
  const db = getDb();
  const users = db.users;

  return (
    <AppShell>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Users</h1>
          <p className={styles.subtitle}>Manage registered users</p>
        </div>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>All Users</CardTitle>
          <CardDescription>User accounts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className={styles.txnList}>
            {users.map((u) => (
              <div key={u.id} className={styles.txnRow}>
                <div>
                  <div className={styles.txnCat}>
                    {u.name} • {u.email}
                  </div>
                  <div className={styles.txnDesc}>
                    Role: {u.role} • Status: {u.status} • Joined: {new Date(u.createdAt).toLocaleDateString("en-IN")}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </AppShell>
  );
}
