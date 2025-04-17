import { json, Link, redirect } from "@remix-run/react";
import { GalleryVerticalEnd } from "lucide-react";
import ModeToggle from "~/components/darkModeToggle";
import LoginForm from "~/components/login-form";
import prisma from "~/lib/prisma";
import { getSession, setSession } from "~/session";

export async function action({ request }: { request: Request }) {
  const body = await request.formData();
  const email = body.get("email") as string;
  const password = body.get("password") as string;
  // console.log(email, password)

  if (!email || !password) {
    return json({ error: "Email and password are required" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user || user.password !== password) {
    return json({ error: "Invalid email or password" }, { status: 401 });
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

export default function LoginPage() {
  return (
    <div className="p-3 min-h-screen">
      <div className="flex flex-row items-center justify-between">
        <Link to="/" className="flex flex-row items-center gap-[7px] font-semibold">
          <div><GalleryVerticalEnd className="size-5" /></div>
          GitTalk
        </Link>
        <ModeToggle />
      </div>
      <div className="flex flex-row items-center justify-center mt-10">
        <LoginForm />
      </div>
    </div>
  )
}