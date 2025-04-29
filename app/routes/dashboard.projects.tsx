// dashboard.projects.tsx: layout
import { json, LoaderFunctionArgs } from "@remix-run/node";
import { Outlet, useLoaderData } from "@remix-run/react";
import { getProjectsForUser } from "~/models/project.server";
import { getSession } from "~/session.server";

export interface ProjectData {
  id: string;
  projectName: string;
  description: string;
  createdAt: string;
}

interface LoaderData {
  projects: ProjectData[];
}

export async function loader({ request }: LoaderFunctionArgs) {
  const session = await getSession(request.headers.get("Cookie"));
  const userId = session.get("userId");

  if (!userId) {
    throw new Response("Unauthorized User", { status: 401 });
  }

  const projects = await getProjectsForUser(userId);
  return json({ projects });
}

export default function ProjectsLayout() {
  const {projects}  = useLoaderData<LoaderData>();

  return (
    <div className="mx-1">
      <Outlet context={{projects}}/>
    </div>
  );
}
