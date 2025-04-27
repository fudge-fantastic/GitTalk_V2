import { json, redirect } from "@remix-run/node";
import { createUser } from "~/models/user.server";
import { Form, Link, useActionData } from "@remix-run/react";
import { GalleryVerticalEnd } from "lucide-react";
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
            <div className="grid min-h-svh lg:grid-cols-2 dark:bg-zinc-950">
                <div className="flex flex-col gap-4 p-3.5 px-5">
                    <div className="flex flex-row items-center justify-between">
                        <Link to="/" className="font-semibold text-xl flex flex-row items-center gap-1.5"><GalleryVerticalEnd /> GitTalk</Link>
                        <ModeToggle />
                    </div>
                    <div className="flex flex-1 items-center justify-center">
                        <div className="w-full max-w-xs">
                            <Form method="post" className={cn("flex flex-col gap-8")} {...props}>
                                {/* Heading */}
                                <div className="flex flex-col items-center gap-0 text-center">
                                    <h1 className="text-[20px] font-bold">Sign up your account</h1>
                                    <p className="text-xs text-muted-foreground">
                                        Enter your email below to sign up
                                    </p>
                                </div>

                                {/* Error Message */}
                                {actionData?.error && (
                                    <p className="text-red-500 text-center">{actionData.error}</p>
                                )}

                                {/* Form Fields */}
                                <div className="grid gap-5">

                                    {/* Name Input */}
                                    <div className="grid gap-0.5">
                                        <Label htmlFor="name" className="text-[13px]">Full Name</Label>
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
                                    <div className="grid gap-0.5">
                                        <Label htmlFor="email" className="text-[13px]">Email</Label>
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
                                    <div className="grid gap-0.5">
                                        <div className="flex items-center justify-between">
                                            <Label htmlFor="password" className="text-[13px]">Password</Label>
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
                                    <Button type="submit" className="w-full">
                                        SignUp
                                    </Button>

                                    {/* Divider */}
                                    <div className="relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-border">
                                        <span className="relative z-10 bg-background px-2 text-muted-foreground">
                                            Or continue with
                                        </span>
                                    </div>

                                    {/* GitHub Login Button */}
                                    <button className="text-sm w-full flex items-center gap-2 dark:bg-zinc-900 justify-center py-1.5 rounded-md shadow-lg dark:border-none border border-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800">
                                        <FaGithubAlt className="h-5 w-5" />
                                        SignUp with GitHub
                                    </button>
                                </div>

                                {/* Signup Link */}
                                <div className="text-center text-sm">
                                    Already have an account?{" "}
                                    <Link to="/login" className="underline underline-offset-2">
                                        Login
                                    </Link>
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
