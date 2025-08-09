import { Link } from "@remix-run/react";
import { GalleryVerticalEnd } from "lucide-react";
import { cn } from "~/lib/utils";

interface LogoProps {
	className?: string;
	size?: "xs" | "sm" | "md" | "lg";
	withText?: boolean;
	to?: string;
}

const sizeMap: Record<NonNullable<LogoProps["size"]>, { icon: string; text: string }> = {
	xs: { icon: "size-4", text: "text-sm" },
	sm: { icon: "size-5", text: "text-base" },
	md: { icon: "size-6", text: "text-lg" },
	lg: { icon: "size-8", text: "text-2xl" },
};

export function Logo({ className, size = "sm", withText = true, to = "/" }: LogoProps) {
	const s = sizeMap[size];
	const content = (
		<span
			className={cn(
				"inline-flex items-center gap-2 font-semibold tracking-tight text-zinc-900 dark:text-zinc-100",
				"select-none",
				className
			)}
		>
			{/* Flat icon, no background wrapper */}
			<GalleryVerticalEnd className={cn(s.icon, "text-zinc-900 dark:text-zinc-100")}/>
			{withText && <span className={cn(s.text, "leading-none")}>GitTalk</span>}
		</span>
	);
	if (!to) return content;
	return (
		<Link
			to={to}
			prefetch="intent"
			aria-label="GitTalk Home"
			className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/60 rounded-md"
		>
			{content}
		</Link>
	);
}

export default Logo;
