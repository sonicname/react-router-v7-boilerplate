import { Form, Link, redirect, useNavigation } from "react-router";
import { verifyPassword } from "~/server/auth.server";
import { userContext } from "~/server/auth-context.server";
import { findUserByEmail } from "~/modules/auth/repository/auth-repository";
import { createUserSession } from "~/server/session.server";
import { loginSchema } from "~/modules/auth/validation/auth-schemas";
import type { Route } from "./+types/login";

export function loader({ context }: Route.LoaderArgs) {
  const user = context.get(userContext);
  if (user) throw redirect("/");
  return null;
}

type ActionErrors = {
  _form?: string[];
  email?: string[];
  password?: string[];
};

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  const rawData = Object.fromEntries(formData);

  const result = loginSchema.safeParse(rawData);
  if (!result.success) {
    const fieldErrors = result.error.flatten().fieldErrors;
    const errors: ActionErrors = {
      email: fieldErrors.email,
      password: fieldErrors.password,
    };
    return { errors, values: rawData };
  }

  const { email, password } = result.data;

  const user = await findUserByEmail(email);
  if (!user) {
    return { errors: { _form: ["Invalid email or password"] } as ActionErrors, values: rawData };
  }

  const isValid = await verifyPassword(password, user.passwordHash);
  if (!isValid) {
    return { errors: { _form: ["Invalid email or password"] } as ActionErrors, values: rawData };
  }

  return createUserSession(user.id, "/");
}

export default function LoginPage({ actionData }: Route.ComponentProps) {
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  return (
    <div className="mx-auto mt-16 max-w-md">
      <h1 className="mb-6 text-2xl font-bold">Login</h1>

      <Form method="post" className="space-y-4">
        {actionData?.errors?._form && (
          <div role="alert" className="rounded-md bg-red-50 p-3 text-sm text-red-600">
            {actionData.errors._form[0]}
          </div>
        )}

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
          {isSubmitting ? "Logging in..." : "Login"}
        </button>
      </Form>

      <p className="mt-4 text-center text-sm">
        Don't have an account?{" "}
        <Link to="/auth/register" className="text-blue-600 underline">
          Register
        </Link>
      </p>
    </div>
  );
}
