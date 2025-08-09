import { Link } from "@remix-run/react";
import ModeToggle from "~/components/darkModeToggle";
import { Button } from "~/components/ui/button";
import { Logo } from "~/components/brand/logo";

export default function NavBar() {
    return (
        <nav className="fixed top-0 inset-x-0 z-50 pt-3 px-4 md:px-6">
            <div className="mx-auto max-w-7xl">
                <div className="flex pl-4 h-14 md:h-16 items-center justify-between rounded-xl border border-zinc-200/70 dark:border-zinc-800/70 bg-white/70 dark:bg-zinc-900/60 backdrop-blur-md shadow-sm">
                    <Logo size="sm" />
                    <div className="flex items-center gap-2 pr-3 md:gap-3">
                        <Button asChild size="sm" variant="ghost" className="hidden sm:inline-flex">
                            <Link to="/login">Login</Link>
                        </Button>
                        <Button asChild size="sm" className="hidden sm:inline-flex">
                            <Link to="/register">Sign Up</Link>
                        </Button>
                        <div className="mx-1 h-5 w-px bg-zinc-300/60 dark:bg-zinc-700/60" />
                        <ModeToggle />
                    </div>
                </div>
            </div>
        </nav>
    );
}
