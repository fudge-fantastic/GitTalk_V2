import { createCookieSessionStorage, redirect } from "@remix-run/node";

export type SessionData = {
  userId: string;  // Changed from number to string to match Prisma UUID
  userName: string;
  userEmail: string;
};

type SessionFlashData = {
  error?: string;
};

// MAIN - BASE
const { getSession, commitSession, destroySession } =
  createCookieSessionStorage<SessionData, SessionFlashData>({
    cookie: {
      name: "GT_session",
      domain: "localhost", // Change this to our domain in production
      httpOnly: true,
      maxAge: 60 * 60, // 1 hour
      path: "/",
      sameSite: "lax",
      secrets: [process.env.SESSION_SECRET ?? "default-secret"],
      secure: process.env.NODE_ENV === "production",
    },
  });

export async function setSession(userId: string, userName: string, userEmail: string, redirectTo = "/dashboard") {
  const session = await getSession();
  session.set("userId", userId);
  session.set("userName", userName);
  session.set("userEmail", userEmail);

  return redirect(redirectTo, {
    headers: {
      "Set-Cookie": await commitSession(session),
    },
  });
}

export async function requireUserSession(request: Request) {
  const session = await getSession(request.headers.get("Cookie"));
  if (!session.has("userId")) {
    throw redirect("/login");
  }

  return session.data as SessionData;
}

export async function logout(request: Request) {
  const session = await getSession(request.headers.get("Cookie"));

  return redirect("/login", {
    headers: {
      "Set-Cookie": await destroySession(session),
    },
  });
}

export { getSession, commitSession, destroySession };
