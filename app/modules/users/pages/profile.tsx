import { defineApi } from "react-router-define-api";
import { userContext } from "~/server/auth-context.server";
import { requireAuthMiddleware } from "~/server/auth-middleware.server";
import type { Route } from "./+types/profile";

export const middleware: Route.MiddlewareFunction[] = [requireAuthMiddleware];

const api = defineApi()
  .get(({ context }) => {
    const user = context.get(userContext);
    return { user: user! };
  })
  .build();

export const loader = api.loader;

export default function ProfilePage({ loaderData }: Route.ComponentProps) {
  const { user } = loaderData;

  return (
    <div className="mx-auto mt-8 max-w-md">
      <h1 className="mb-6 text-2xl font-bold">Profile</h1>
      <dl className="space-y-4">
        <div>
          <dt className="text-sm text-gray-500">Name</dt>
          <dd className="text-lg">{user.name}</dd>
        </div>
        <div>
          <dt className="text-sm text-gray-500">Email</dt>
          <dd className="text-lg">{user.email}</dd>
        </div>
        <div>
          <dt className="text-sm text-gray-500">Member since</dt>
          <dd className="text-lg">
            {new Date(user.createdAt).toLocaleDateString()}
          </dd>
        </div>
      </dl>
    </div>
  );
}
