// routes/dashboard.projects._index.tsx
import { Link } from "@remix-run/react";
import { FaPlus } from "react-icons/fa";

export default function ProjectsIndex() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Projects List</h2>
        <Link
          to="new"
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center gap-2"
        >
          <FaPlus />
          <span>Add Project</span>
        </Link>
      </div>
      <div className="text-muted-foreground">
        {/* Replace with your actual project listing */}
        You have no projects yet.
      </div>
    </div>
  );
}