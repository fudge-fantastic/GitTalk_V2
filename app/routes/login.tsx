/* eslint-disable @typescript-eslint/no-explicit-any */
import { Form, json, Link, redirect, useActionData } from "@remix-run/react";
import bcrypt from "bcryptjs";
import { GalleryVerticalEnd } from "lucide-react";
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

  // console.log(user)

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

type ActionResponse = {
  error?: string;
};

export default function LoginPage(props: any) {
  const actionData = useActionData<ActionResponse>()
  return (
    <div className="p-3.5 px-5 min-h-screen dark:bg-zinc-950">
      <div className="flex flex-row items-center justify-between">
        <Link to="/" className="font-semibold text-xl flex flex-row items-center gap-1.5"><GalleryVerticalEnd /> GitTalk</Link>
        <ModeToggle />
      </div>
      <div className="flex flex-col items-center justify-center mt-8">
        <Form method="post" className={cn("flex flex-col gap-10")} {...props}>
          {/* Heading */}
          <div className="flex flex-col items-center gap-0 text-center">
            <h1 className="text-[22px] font-bold">Login to your account</h1>
            <p className="text-sm text-muted-foreground">
              Enter your email below to login to your account
            </p>
          </div>

          {actionData?.error && (
            <p className="text-red-500 text-center">{actionData.error}</p>
          )}

          {/* Form Fields */}
          <div className="grid gap-6">
            {/* Email Input */}
            <div className="grid gap-1">
              <label htmlFor="email" className="text-sm flex flex-row gap-2 items-center">
                Email
                
              </label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="johndoe@example.com"
                required
              />
            </div>

            {/* Password Input */}
            <div className="grid gap-1">
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="text-sm">Password
                  
                </label>
                <Link
                  to="/forgot-password"
                  className="text-xs underline-offset-3 hover:underline"
                >
                  Forgot your password?
                </Link>
              </div>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="Enter your password"
                required
              />
            </div>

            {/* Submit Button */}
            <Button type="submit" className="w-full">
              Login
            </Button>

            {/* Divider */}
            <div className="text-center text-sm relative z-10 my-2 text-muted-foreground">
              Or continue with
            </div>

            {/* GitHub Login Button */}
            <button className="text-sm w-full flex items-center gap-2 dark:bg-zinc-900 justify-center py-1.5 rounded-md shadow-lg dark:border-none border border-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800">
              <FaGithubAlt className="h-5 w-5" />
              Login with GitHub
            </button>
          </div>

          {/* Signup Link */}
          <div className="text-center text-sm">
            Don&apos;t have an account?{" "}
            <Link to="/register" className="underline underline-offset-2">
              Sign up
            </Link>
          </div>
        </Form>
      </div>
    </div>
  )
}