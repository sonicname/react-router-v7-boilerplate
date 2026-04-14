import { Form, Link, Outlet } from "react-router";
import { defineApi } from "react-router-define-api";
import { userContext } from "~/server/auth-context.server";
import { loadUserMiddleware } from "~/server/auth-middleware.server";
import type { Route } from "./+types/__root";

export const middleware: Route.MiddlewareFunction[] = [loadUserMiddleware];

export const { loader } = defineApi()
  .get(({ context }) => {
    const user = context.get(userContext);
    return { user };
  })
  .build();

export default function RootLayout({ loaderData }: Route.ComponentProps) {
  const { user } = loaderData;

  return (
    <div className="min-h-screen">
      <nav className="flex items-center justify-between border-b p-4">
        <Link to="/" className="font-bold">
          Home
        </Link>
        <div className="flex items-center gap-4">
          {user ? (
            <>
              <Link to="/users/profile" className="text-sm">
                {user.name}
              </Link>
              <Form method="post" action="/api/auth/logout">
                <button type="submit" className="text-sm text-gray-600 hover:text-black">
                  Logout
                </button>
              </Form>
            </>
          ) : (
            <>
              <Link to="/auth/login" className="text-sm">
                Login
              </Link>
              <Link
                to="/auth/register"
                className="rounded-md bg-black px-3 py-1.5 text-sm text-white"
              >
                Register
              </Link>
            </>
          )}
        </div>
      </nav>
      <main className="container mx-auto p-4">
        <Outlet />
      </main>
    </div>
  );
}
