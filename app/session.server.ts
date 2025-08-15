import { createCookieSessionStorage, redirect } from "@remix-run/node";
import { ensureLocalUser, LOCAL_USER_ID } from "~/models/user.server";

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


// setSession(...) sets the cookie and redirects
export async function setSession(userId: string, userName: string, userEmail: string, redirectTo = "/projects") {
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

// requireUserSession(...) protects routes
export async function requireUserSession(request: Request) {
  const LOCAL_MODE = process.env.LOCAL_MODE === "1";
  if (LOCAL_MODE) {
    // Ensure user exists and synthesize a session-like object
    const user = await ensureLocalUser();
    return { userId: user.id, userName: user.username, userEmail: user.email } satisfies SessionData;
  }
  const session = await getSession(request.headers.get("Cookie"));
  if (!session.has("userId")) {
    throw redirect("/login");
  }
  return session.data as SessionData;
}

// logout(...) destroys session and redirects
export async function logout(request: Request) {
  const LOCAL_MODE = process.env.LOCAL_MODE === "1";
  if (LOCAL_MODE) {
    // In local mode, logout can just redirect to dashboard (no real session) or optionally do nothing
    return redirect("/dashboard");
  }
  const session = await getSession(request.headers.get("Cookie"));
  return redirect("/login", {
    headers: {
      "Set-Cookie": await destroySession(session),
    },
  });
}

export { getSession, commitSession, destroySession };
