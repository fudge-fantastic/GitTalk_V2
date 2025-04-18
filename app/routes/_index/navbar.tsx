import { Link } from "@remix-run/react";
import { GalleryVerticalEnd } from "lucide-react";
import ModeToggle from "~/components/darkModeToggle";

export default function NavBar() {
    const buttonStyleLogin = "px-2.5 py-1.5 dark:bg-zinc-900 bg-zinc-200 hover:bg-zinc-300 dark:hover:bg-zinc-800 rounded-md text-sm font-semibold"
    return (
        <div className="flex flex-row items-center justify-between px-5 py-3">
            <h1 className="font-semibold text-xl flex flex-row items-center gap-1.5"><GalleryVerticalEnd /> GitTalk</h1>
            <div className="flex flex-row items-center gap-2.5">
                <Link to="/login"><button className={buttonStyleLogin}>Login</button></Link>
                <Link to="/register"><button className={buttonStyleLogin}>SignUp</button></Link>
                <ModeToggle />
            </div>
        </div>
    )
}