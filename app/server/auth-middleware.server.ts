import { redirect, type MiddlewareFunction } from "react-router";
import { getCurrentUser } from "./auth.server";
import { userContext } from "./auth-context.server";

type ServerMiddleware = MiddlewareFunction<Response>;

/** Middleware that loads current user into context (no redirect if unauthenticated) */
export const loadUserMiddleware: ServerMiddleware = async ({
  request,
  context,
}) => {
  const user = await getCurrentUser(request);
  context.set(userContext, user);
};

/** Middleware that requires authentication — redirects to login if not authenticated */
export const requireAuthMiddleware: ServerMiddleware = async ({
  request,
  context,
}) => {
  const user = await getCurrentUser(request);
  if (!user) {
    throw redirect("/auth/login");
  }
  context.set(userContext, user);
};
