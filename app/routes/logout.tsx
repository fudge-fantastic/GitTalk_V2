// logout.tsx
import { redirect } from "@remix-run/node";
import { destroySession, getSession } from "~/session.server";

export async function action ({ request }: { request: Request }) {
  const session = await getSession(request.headers.get("Cookie"));
  return redirect("/login", {
    headers: {
      "Set-Cookie": await destroySession(session), // Ensure this function works as intended
    },
  });
}
