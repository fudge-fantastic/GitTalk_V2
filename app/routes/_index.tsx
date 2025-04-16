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

      <h1 className="text-2xl font-bold underline">
        Hello world!
      </h1>
    </div>
  );
}