import { eq } from "drizzle-orm";
import { db } from "~/db";
import { usersTable } from "~/db/schema";

/** User row type inferred from schema */
type UserRow = typeof usersTable.$inferSelect;

/** User without passwordHash — safe to expose to client */
export type SafeUser = Omit<UserRow, "passwordHash">;

const safeUserColumns = {
  id: usersTable.id,
  name: usersTable.name,
  email: usersTable.email,
  createdAt: usersTable.createdAt,
} as const;

/** Find user by ID, excluding passwordHash */
export async function findUserById(userId: number): Promise<SafeUser | null> {
  const results = await db
    .select(safeUserColumns)
    .from(usersTable)
    .where(eq(usersTable.id, userId))
    .limit(1);
  return results[0] ?? null;
}

/** Find user by email, including passwordHash (for login verification) */
export async function findUserByEmail(email: string): Promise<UserRow | null> {
  const results = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.email, email))
    .limit(1);
  return results[0] ?? null;
}

/** Create a new user and return safe user data */
export async function createUser(data: {
  name: string;
  email: string;
  passwordHash: string;
}): Promise<SafeUser> {
  const results = await db
    .insert(usersTable)
    .values(data)
    .returning(safeUserColumns);
  return results[0];
}
