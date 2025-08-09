/* eslint-disable @typescript-eslint/no-explicit-any */
import { Form, json, Link, redirect, useActionData } from "@remix-run/react";
import bcrypt from "bcryptjs";
import { Logo } from "~/components/brand/logo";
import { FaGithubAlt } from "react-icons/fa6";
import ModeToggle from "~/components/darkModeToggle";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { cn } from "~/lib/utils";
import { getUserByEmail } from "~/models/user.server";
import { getSession, setSession } from "~/session.server";

export async function action({ request }: { request: Request }) {
  const body = await request.formData();
  const email = body.get("email") as string;
  const password = body.get("password") as string;

  // Calling the getUserByEmail function from the user.server (Prisma!)
  const user = await getUserByEmail(email);

  // Check if field is empty
  if (!email) {
    return json({ error: "Email is required" }, { status: 400 });
  }

  if (!password) {
    return json({ error: "Password is required" }, { status: 400 });
  }

  if (!user) {
    return json({ error: "Email not found, please sign up" }, { status: 401 });
  }

  const isValidPassword = await bcrypt.compare(password, user.password);
  if (!isValidPassword) {
    return json({ error: "Incorrect Password" }, { status: 401 });
  }

  return await setSession(user.id, user.username, user.email, "/dashboard");
}

export async function loader({ request }: { request: Request }) {
  const session = await getSession(request.headers.get("Cookie"));
  if (session.has("userId")) {
    return redirect("/dashboard");
  }
  return null;
}

export type ActionResponse = {
  error?: string;
};

export default function LoginPage(props: any) {
  const actionData = useActionData<ActionResponse>()
  return (
  <div className="relative min-h-screen dark:bg-zinc-950 bg-zinc-50">
      <div className="flex flex-row items-center justify-between px-5 pt-4">
        <Logo size="sm" />
        <ModeToggle />
      </div>
      <div className="flex flex-col items-center justify-center px-4 py-10">
        <Form method="post" className={cn("w-full max-w-sm flex flex-col gap-8 bg-white dark:bg-zinc-900 rounded-xl p-8 shadow-sm border border-zinc-200 dark:border-zinc-800")} {...props}>
          {/* Heading */}
          <div className="flex flex-col items-center gap-1 text-center">
            <h1 className="text-xl font-semibold tracking-tight">Welcome back</h1>
            <p className="text-xs text-muted-foreground">Access your GitTalk dashboard</p>
          </div>

          {actionData?.error && (
            <div className="rounded-md bg-red-500/10 text-red-600 dark:text-red-400 text-xs px-3 py-2 border border-red-500/30 text-center">{actionData.error}</div>
          )}

          {/* Form Fields */}
          <div className="grid gap-5">
            {/* Email Input */}
            <div className="grid gap-1">
              <label htmlFor="email" className="text-xs font-medium text-zinc-600 dark:text-zinc-300">Email</label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="johndoe@example.com"
              />
            </div>

            {/* Password Input */}
            <div className="grid gap-1">
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="text-xs font-medium text-zinc-600 dark:text-zinc-300">Password</label>
                <Link to="/forgot-password" className="text-[10px] underline-offset-2 hover:underline text-blue-600 dark:text-blue-400">Forgot?</Link>
              </div>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="Enter your password"
              />
            </div>

            {/* Submit Button */}
            <Button type="submit" className="w-full h-9">Sign In</Button>

            {/* Divider */}
            <div className="relative text-center text-[11px] after:absolute after:inset-0 after:top-1/2 after:flex after:items-center after:border-t after:border-border">
              <span className="relative z-10 bg-white dark:bg-zinc-900 px-2 text-muted-foreground">Or</span>
            </div>

            {/* GitHub Login Button */}
            <button className="text-xs w-full flex items-center gap-2 justify-center h-9 rounded-md border border-dashed border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100/60 dark:hover:bg-zinc-800/60 transition text-zinc-700 dark:text-zinc-300">
              <FaGithubAlt className="h-4 w-4" />
              Sign in with GitHub
            </button>
          </div>

          {/* Signup Link */}
          <div className="text-center text-[11px] text-muted-foreground">
            No account? <Link to="/register" className="text-blue-600 dark:text-blue-400 hover:underline">Create one</Link>
          </div>
        </Form>
      </div>
    </div>
  )
}