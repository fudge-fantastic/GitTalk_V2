import type { MetaFunction } from "@remix-run/node";

export const meta: MetaFunction = () => {
  return [
    { title: "GitTalk_V2" },
    { name: "description", content: "Welcome to Another Version of GitTalk!" },
  ];
};

export default function Index() {
  return (
    <div className="flex h-screen items-center justify-center">
      Hello World
    </div>
  );
}