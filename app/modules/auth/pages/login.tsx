import { Form, Link, redirect, useNavigation } from "react-router";
import { defineApi } from "react-router-define-api";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { AuthFormField } from "~/modules/auth/components/auth-form-field";
import { findUserByEmail } from "~/modules/auth/repository/auth-repository";
import { loginSchema } from "~/modules/auth/validation/auth-schemas";
import { userContext } from "~/server/auth-context.server";
import { verifyPassword } from "~/server/auth.server";
import { createUserSession } from "~/server/session.server";
import type { Route } from "./+types/login";

type ActionErrors = {
  _form?: string[];
  email?: string[];
  password?: string[];
};

const api = defineApi()
  .get(({ context }) => {
    const user = context.get(userContext);
    if (user) throw redirect("/");
    return null;
  })
  .post(async ({ request }) => {
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
      return {
        errors: { _form: ["Invalid email or password"] } as ActionErrors,
        values: rawData,
      };
    }

    const isValid = await verifyPassword(password, user.passwordHash);
    if (!isValid) {
      return {
        errors: { _form: ["Invalid email or password"] } as ActionErrors,
        values: rawData,
      };
    }

    return createUserSession(user.id, "/");
  })
  .build();

export const loader = api.loader;
export const action = api.action;

export default function LoginPage({ actionData }: Route.ComponentProps) {
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";
  const errors = actionData?.errors;
  const values = actionData?.values;

  return (
    <div className="mx-auto mt-16 max-w-md">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Welcome back</CardTitle>
          <CardDescription>Sign in to continue to your account.</CardDescription>
        </CardHeader>

        <Form method="post">
          <CardContent className="space-y-4">
            {errors?._form && (
              <div
                role="alert"
                className="rounded-md border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive"
              >
                {errors._form[0]}
              </div>
            )}

            <AuthFormField
              id="email"
              name="email"
              label="Email"
              type="email"
              required
              autoComplete="email"
              defaultValue={values?.email as string}
              errors={errors?.email}
            />

            <AuthFormField
              id="password"
              name="password"
              label="Password"
              type="password"
              required
              autoComplete="current-password"
              errors={errors?.password}
            />
          </CardContent>

          <CardFooter className="flex flex-col gap-3">
            <Button type="submit" disabled={isSubmitting} className="w-full">
              {isSubmitting ? "Logging in..." : "Login"}
            </Button>
            <p className="text-center text-sm text-muted-foreground">
              Don't have an account?{" "}
              <Link to="/auth/register" className="font-medium text-foreground underline">
                Register
              </Link>
            </p>
          </CardFooter>
        </Form>
      </Card>
    </div>
  );
}
