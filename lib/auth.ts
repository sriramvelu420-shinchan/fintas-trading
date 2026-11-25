import { cookies } from "next/headers";
import { getUserById, toSessionUser } from "./store";
import { SessionUser } from "./types";

const SESSION_COOKIE = "fintas_session";

export async function getSession(): Promise<SessionUser | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE)?.value;
    if (!token) return null;
    const user = getUserById(token);
    if (!user || user.status !== "active") return null;
    return toSessionUser(user);
  } catch {
    return null;
  }
}

export async function requireUser(): Promise<SessionUser> {
  const session = await getSession();
  if (!session) {
    throw new Error("UNAUTHORIZED");
  }
  return session;
}

export async function requireAdmin(): Promise<SessionUser> {
  const session = await requireUser();
  if (session.role !== "admin") {
    throw new Error("FORBIDDEN");
  }
  return session;
}

export async function setSession(userId: string) {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, userId, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });
}

export async function clearSession() {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}
