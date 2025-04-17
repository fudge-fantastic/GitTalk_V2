import type { MetaFunction } from "@remix-run/node";
import { Link } from "@remix-run/react";

export const meta: MetaFunction = () => {
  return [
    { title: "GitTalk_V2" },
    { name: "description", content: "Welcome to Another Version of GitTalk!" },
  ];
};

export default function Index() {
  return (
    <div className="flex h-screen items-center justify-center">
      <Link to="/dashboard" className="text-2xl font-bold underline">
        Head to Dashboard! 
      </Link>
    </div>
  );
}