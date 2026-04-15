import { ArrowRight, Eye, EyeOff, LockKeyhole, Mail, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { Form, Link, redirect, useNavigation } from "react-router";
import { defineApi } from "react-router-define-api";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { findUserByEmail } from "~/modules/auth/repository/auth-repository";
import { loginSchema } from "~/modules/auth/validation/auth-schemas";
import { userContext } from "~/server/auth-context.server";
import { verifyPassword } from "~/server/auth.server";
import { createUserSession } from "~/server/session.server";
import { cn } from "~/lib/utils";
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
  const [showPassword, setShowPassword] = useState(false);

  const emailInvalid = Boolean(errors?.email?.length);
  const passwordInvalid = Boolean(errors?.password?.length);

  return (
    <div className="relative -mx-4 -mt-4 flex min-h-[calc(100vh-65px)] items-center justify-center overflow-hidden px-4 py-10">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,var(--color-muted),transparent_60%)] dark:bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,0.06),transparent_60%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-px bg-linear-to-r from-transparent via-border to-transparent"
      />

      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="mb-4 flex size-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-sm ring-1 ring-foreground/10">
            <ShieldCheck className="size-6" />
          </div>
          <h1 className="font-heading text-2xl font-semibold tracking-tight">
            Welcome back
          </h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Sign in to your account to continue
          </p>
        </div>

        <div className="rounded-2xl border bg-card p-6 shadow-sm ring-1 ring-foreground/5">
          <Form method="post" className="space-y-5">
            {errors?._form && (
              <div
                role="alert"
                className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive"
              >
                <span className="mt-0.5 inline-block size-1.5 shrink-0 rounded-full bg-destructive" />
                <span>{errors._form[0]}</span>
              </div>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  placeholder="you@example.com"
                  defaultValue={values?.email as string}
                  aria-invalid={emailInvalid || undefined}
                  aria-describedby={emailInvalid ? "email-error" : undefined}
                  className="h-10 pl-8"
                />
              </div>
              {emailInvalid && (
                <p id="email-error" className="text-sm text-destructive">
                  {errors?.email?.[0]}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link
                  to="/auth/forgot-password"
                  className="text-xs text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <LockKeyhole className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  aria-invalid={passwordInvalid || undefined}
                  aria-describedby={passwordInvalid ? "password-error" : undefined}
                  className="h-10 px-8"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className={cn(
                    "absolute right-1 top-1/2 flex size-8 -translate-y-1/2 items-center justify-center rounded-md",
                    "text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
                  )}
                >
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
              {passwordInvalid && (
                <p id="password-error" className="text-sm text-destructive">
                  {errors?.password?.[0]}
                </p>
              )}
            </div>

            <Button
              type="submit"
              size="lg"
              disabled={isSubmitting}
              className="w-full gap-2"
            >
              {isSubmitting ? "Signing in..." : "Sign in"}
              {!isSubmitting && <ArrowRight className="size-4" />}
            </Button>
          </Form>
        </div>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Don't have an account?{" "}
          <Link
            to="/auth/register"
            className="font-medium text-foreground underline underline-offset-4 hover:text-primary"
          >
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}
