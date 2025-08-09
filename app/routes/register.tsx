import { json, redirect } from "@remix-run/node";
import { createUser } from "~/models/user.server";
import { Form, Link, useActionData } from "@remix-run/react";
import { Logo } from "~/components/brand/logo";
import ModeToggle from "~/components/darkModeToggle";
import { cn } from "~/lib/utils";
import { Label } from "~/components/ui/label";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { FaGithubAlt } from "react-icons/fa";

export const action = async ({ request }: { request: Request }) => {
    const body = await request.formData();
    const email = body.get("email") as string;
    const password = body.get("password") as string;
    const username = body.get("username") as string;

    if (!email || !password || !username) {
        return json({ error: "Missing fields" }, { status: 400 });
    }

    try {
        await createUser({ email, password, username });
        console.log("User created", { email, password, username });
        // Returning to the Login Page to ensure if the account is created
        return redirect("/login");
    } catch (error) {
        console.error(error);
        return json({ error: "Failed to register" }, { status: 500 });
    }
};

export default function RegisterPage({ ...props }) {
    const actionData = useActionData<typeof action>();

    return (
        <>
            <div className="relative min-h-svh lg:grid lg:grid-cols-2 dark:bg-zinc-950 bg-zinc-50">
                <div className="flex flex-col gap-4 px-5 pt-4">
                    <div className="flex flex-row items-center justify-between">
                        <Logo size="sm" />
                        <ModeToggle />
                    </div>
                    <div className="flex flex-1 items-center justify-center pb-10">
                        <div className="w-full max-w-sm">
                            <Form method="post" className={cn("flex flex-col gap-8 bg-white dark:bg-zinc-900 rounded-xl p-8 shadow-sm border border-zinc-200 dark:border-zinc-800")} {...props}>
                                {/* Heading */}
                                <div className="flex flex-col items-center gap-1 text-center">
                                    <h1 className="text-xl font-semibold tracking-tight">Create your account</h1>
                                    <p className="text-xs text-muted-foreground">Start conversing with your repos</p>
                                </div>

                                {/* Error Message */}
                                {actionData?.error && (
                                    <div className="rounded-md bg-red-500/10 text-red-600 dark:text-red-400 text-xs px-3 py-2 border border-red-500/30 text-center">{actionData.error}</div>
                                )}

                                {/* Form Fields */}
                                <div className="grid gap-5">

                                    {/* Name Input */}
                                    <div className="grid gap-1">
                                        <Label htmlFor="name" className="text-xs font-medium text-zinc-600 dark:text-zinc-300">Full Name</Label>
                                        <Input
                                            id="name"
                                            name="username"
                                            type="text"
                                            placeholder="John Doe"
                                            required
                                            className="h-9"
                                        />
                                    </div>
                                    {/* Email Input */}
                                    <div className="grid gap-1">
                                        <Label htmlFor="email" className="text-xs font-medium text-zinc-600 dark:text-zinc-300">Email</Label>
                                        <Input
                                            id="email"
                                            name="email"
                                            type="email"
                                            placeholder="johndoe@example.com"
                                            required
                                            className="h-9"
                                        />
                                    </div>

                                    {/* Password Input */}
                                    <div className="grid gap-1">
                                        <div className="flex items-center justify-between">
                                            <Label htmlFor="password" className="text-xs font-medium text-zinc-600 dark:text-zinc-300">Password</Label>
                                        </div>
                                        <Input
                                            id="password"
                                            name="password"
                                            type="password"
                                            required
                                            className="h-9"
                                            placeholder="Enter your password"
                                        />
                                    </div>

                                    {/* Submit Button */}
                                    <Button type="submit" className="w-full h-9">
                                        Sign Up
                                    </Button>

                                    {/* Divider */}
                                    <div className="relative text-center text-[11px] after:absolute after:inset-0 after:top-1/2 after:flex after:items-center after:border-t after:border-border">
                                        <span className="relative z-10 bg-white dark:bg-zinc-900 px-2 text-muted-foreground">
                                            Or
                                        </span>
                                    </div>

                                    {/* GitHub Login Button */}
                                    <button className="text-xs w-full flex items-center gap-2 justify-center h-9 rounded-md border border-dashed border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100/60 dark:hover:bg-zinc-800/60 transition text-zinc-700 dark:text-zinc-300">
                                        <FaGithubAlt className="h-4 w-4" />
                                        Sign up with GitHub
                                    </button>
                                </div>

                                {/* Signup Link */}
                                <div className="text-center text-[11px] text-muted-foreground">
                                    Have an account? <Link to="/login" className="text-blue-600 dark:text-blue-400 hover:underline">Sign in</Link>
                                </div>
                            </Form>
                        </div>
                    </div>
                </div>
                <div className="relative hidden bg-muted lg:block">
                    <img
                        src="/download.jpg"
                        // src="/public/download.jpg"
                        alt="someimage"
                        className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
                    />
                </div>
            </div>
        </>
    );
}
