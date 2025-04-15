import { Link } from "@remix-run/react";
import { GalleryVerticalEnd } from "lucide-react";
import ModeToggle from "~/components/darkModeToggle";
import LoginForm from "~/components/login-form";

export async function action({ request }: { request: Request }) {
    const body = await request.formData();
    const email = body.get("email") as string;
    const password = body.get("password") as string;
    console.log(email, password)
    
  }

export async function loader({request}: {request: Request}) {
    console.log(request.headers)
    return null
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