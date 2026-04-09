import { redirect } from "react-router";
import { getSession, destroySession } from "~/server/session.server";

export async function action({ request }: { request: Request }) {
  const session = await getSession(request.headers.get("Cookie"));
  return redirect("/auth/login", {
    headers: { "Set-Cookie": await destroySession(session) },
  });
}
