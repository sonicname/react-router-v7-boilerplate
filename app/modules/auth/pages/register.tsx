import { Form, Link, redirect, useNavigation } from "react-router";
import { defineApi } from "react-router-define-api";
import { createUser, findUserByEmail } from "~/modules/auth/repository/auth-repository";
import { registerSchema } from "~/modules/auth/validation/auth-schemas";
import { userContext } from "~/server/auth-context.server";
import { hashPassword } from "~/server/auth.server";
import type { Route } from "./+types/register";

const api = defineApi()
  .get(({ context }) => {
    const user = context.get(userContext);
    if (user) throw redirect("/");
    return null;
  })
  .post(async ({ request }) => {
    const formData = await request.formData();
    const rawData = Object.fromEntries(formData);

    const result = registerSchema.safeParse(rawData);
    if (!result.success) {
      return { errors: result.error.flatten().fieldErrors, values: rawData };
    }

    const { name, email, password } = result.data;

    const existing = await findUserByEmail(email);
    if (existing) {
      return {
        errors: { email: ["An account with this email already exists"] },
        values: rawData,
      };
    }

    const passwordHash = await hashPassword(password);
    await createUser({ name, email, passwordHash });

    return redirect("/auth/login");
  })
  .build();

export const loader = api.loader;
export const action = api.action;

export default function RegisterPage({ actionData }: Route.ComponentProps) {
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  return (
    <div className="mx-auto mt-16 max-w-md">
      <h1 className="mb-6 text-2xl font-bold">Register</h1>

      <Form method="post" className="space-y-4">
        <div>
          <label htmlFor="name" className="mb-1 block text-sm font-medium">
            Name
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            defaultValue={actionData?.values?.name as string}
            className="w-full rounded-md border px-3 py-2"
          />
          {actionData?.errors?.name && (
            <p className="mt-1 text-sm text-red-600">{actionData.errors.name[0]}</p>
          )}
        </div>

        <div>
          <label htmlFor="email" className="mb-1 block text-sm font-medium">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            defaultValue={actionData?.values?.email as string}
            className="w-full rounded-md border px-3 py-2"
          />
          {actionData?.errors?.email && (
            <p className="mt-1 text-sm text-red-600">{actionData.errors.email[0]}</p>
          )}
        </div>

        <div>
          <label htmlFor="password" className="mb-1 block text-sm font-medium">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            minLength={8}
            className="w-full rounded-md border px-3 py-2"
          />
          {actionData?.errors?.password && (
            <p className="mt-1 text-sm text-red-600">{actionData.errors.password[0]}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-md bg-black px-4 py-2 text-white disabled:opacity-50"
        >
          {isSubmitting ? "Creating account..." : "Register"}
        </button>
      </Form>

      <p className="mt-4 text-center text-sm">
        Already have an account?{" "}
        <Link to="/auth/login" className="text-blue-600 underline">
          Login
        </Link>
      </p>
    </div>
  );
}
