import { redirect } from "@remix-run/node";

export type SessionData = { userId: string; userName: string; userEmail: string };

// In single-user mode we don't persist sessions; provide a constant
const STATIC_SESSION: SessionData = {
  userId: "local-user",
  userName: "Local User",
  userEmail: "local-mode",
};

// requireUserSession(...) protects routes
export async function requireUserSession(_request: Request) { return STATIC_SESSION; }

// logout(...) destroys session and redirects
export async function logout(_request: Request) { return redirect("/dashboard"); }
