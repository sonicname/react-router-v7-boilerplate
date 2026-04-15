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
  const errors = actionData?.errors;
  const values = actionData?.values;

  return (
    <div className="mx-auto mt-16 max-w-md">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Create an account</CardTitle>
          <CardDescription>Enter your details to get started.</CardDescription>
        </CardHeader>

        <Form method="post">
          <CardContent className="space-y-4">
            <AuthFormField
              id="name"
              name="name"
              label="Name"
              required
              autoComplete="name"
              defaultValue={values?.name as string}
              errors={errors?.name}
            />

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
              minLength={8}
              autoComplete="new-password"
              errors={errors?.password}
            />
          </CardContent>

          <CardFooter className="flex flex-col gap-3">
            <Button type="submit" disabled={isSubmitting} className="w-full">
              {isSubmitting ? "Creating account..." : "Register"}
            </Button>
            <p className="text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link to="/auth/login" className="font-medium text-foreground underline">
                Login
              </Link>
            </p>
          </CardFooter>
        </Form>
      </Card>
    </div>
  );
}
