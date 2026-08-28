import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

/** Returns the current server session (or null). */
export async function getSession() {
  return getServerSession(authOptions);
}

/** Throws-friendly guard: returns session or null if not authenticated. */
export async function requireUser() {
  const session = await getSession();
  if (!session?.user) return null;
  return session.user;
}

/** Returns the user only if they are an admin, else null. */
export async function requireAdmin() {
  const session = await getSession();
  if (session?.user?.role !== "admin") return null;
  return session.user;
}
