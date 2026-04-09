import { createContext } from "react-router";
import type { SafeUser } from "./auth.server";

/** Type-safe context for the authenticated user, set by auth middleware */
export const userContext = createContext<SafeUser | null>(null);
