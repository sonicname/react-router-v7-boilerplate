import { redirect } from "react-router";
import { defineApi } from "react-router-define-api";
import { destroySession, getSession } from "~/server/session.server";

export const { action } = defineApi()
  .post(async ({ request }) => {
    const session = await getSession(request.headers.get("Cookie"));
    return redirect("/auth/login", {
      headers: { "Set-Cookie": await destroySession(session) },
    });
  })
  .build();
