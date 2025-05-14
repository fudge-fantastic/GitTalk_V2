import type { MetaFunction } from "@remix-run/node";
import { Link } from "@remix-run/react";
import NavBar from "./navbar";
import { FaArrowRightLong } from "react-icons/fa6";

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
      <div className="p-4 mt-12 md:w-3/5">
        <h1 className="text-6xl font-thin mb-1">Welcome to <span className="font-serif font-semibold">GitTalk</span></h1>
        <p className="tracking-tight font-light mb-3">
          Lorem ipsum, dolor sit amet consectetur adipisicing elit. Eius rerum at, quibusdam laboriosam et molestiae officia minus suscipit quis optio ad accusamus? Laudantium temporibus delectus, impedit aspernatur fuga totam perspiciatis.
          Lorem ipsum, dolor sit amet consectetur adipisicing elit. Eius rerum at, quibusdam laboriosam et molestiae officia minus suscipit quis optio ad accusamus? Laudantium temporibus delectus, impedit aspernatur fuga totam perspiciatis.
        </p>
        <button>
          <Link to="/dashboard" className="px-4 py-2 rounded-xl dark:bg-zinc-900 dark:hover:bg-zinc-800 bg-zinc-200 hover:bg-zinc-300 flex items-center gap-2 transition">
            <p className="text-sm">Get Started!</p>
            <FaArrowRightLong className="w-4 h-4 inline-block" />
          </Link>
        </button>
      </div>
    </div>
  );
}