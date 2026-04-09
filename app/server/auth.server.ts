import { getSession } from "./session.server";
import { findUserById } from "~/modules/auth/repository/auth-repository";
import type { SafeUser } from "~/modules/auth/repository/auth-repository";

export type { SafeUser };

export async function hashPassword(password: string): Promise<string> {
  return Bun.password.hash(password);
}

export async function verifyPassword(
  password: string,
  hash: string,
): Promise<boolean> {
  return Bun.password.verify(password, hash);
}

/** Get current user from session cookie. Returns null if not authenticated. */
export async function getCurrentUser(
  request: Request,
): Promise<SafeUser | null> {
  const session = await getSession(request.headers.get("Cookie"));
  const userId = session.get("userId");
  if (typeof userId !== "number") return null;
  return findUserById(userId);
}
