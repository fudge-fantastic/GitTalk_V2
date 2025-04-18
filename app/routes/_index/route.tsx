import type { MetaFunction } from "@remix-run/node";
import { Link } from "@remix-run/react";
import NavBar from "./navbar";

export const meta: MetaFunction = () => {
  return [
    { title: "GitTalk_V2" },
    { name: "description", content: "Welcome to Another Version of GitTalk!" },
  ];
};

export default function Index() {
  return (
    <div className="min-h-screen dark:bg-zinc-950">
      <NavBar />
      <Link to="/dashboard" className="text-2xl font-bold underline flex flex-row items-center justify-center mt-40">
        Head to Dashboard! 
      </Link>
    </div>
  );
}