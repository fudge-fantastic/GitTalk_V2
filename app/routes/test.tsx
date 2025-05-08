// app/routes/test.tsx
import { json, LoaderFunction } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";

export const loader: LoaderFunction = async () => {
  // Simulate network delay
  await new Promise((r) => setTimeout(r, 2000));

  return json({
    user: {
      name: "Jane Doe",
      bio: "Frontend developer and design nerd.",
    },
  });
};

// app/routes/test.tsx (continued)
import { useEffect, useState } from "react";

export default function TestPage() {
  const data = useLoaderData<typeof loader>();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Assume loader data triggers component mount (simulate loading state)
    const timeout = setTimeout(() => setLoading(false), 5000); // just for UI effect
    return () => clearTimeout(timeout);
  }, []);

  return (
    <div className="p-6 max-w-md mx-auto">
      <h1 className="text-xl font-bold mb-4">User Profile</h1>
      {loading ? (
        <div className="animate-pulse flex flex-col gap-2">
          <div className="h-6 bg-zinc-300 dark:bg-zinc-700 rounded w-3/4"></div>
          <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded w-full"></div>
          <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded w-5/6"></div>
        </div>
      ) : (
        <div>
          <p className="text-lg font-semibold">{data.user.name}</p>
          <p className="text-muted-foreground">{data.user.bio}</p>
        </div>
      )}
    </div>
  );
}
