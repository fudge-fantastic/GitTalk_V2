// routes/dashboard.projects._index.tsx
import { Form, Link, useOutletContext } from "@remix-run/react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu"
import { BsThreeDotsVertical } from "react-icons/bs";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "~/components/ui/dialog";
import { ActionFunction, redirect } from "@remix-run/node";
import { prisma } from "~/db.server";
import { deleteProjectFromCollection } from "~/models/qdrant.server";
import { formatDate } from "~/utils/someFunctions";
import { ProjectData } from "~/utils/interfacesAndTypes";

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const action = formData.get("_action");
  const projectId = formData.get("projectId");

  if (action === "delete" && typeof projectId === "string") {
    await prisma.project.delete({
      where: { id: projectId },
    });

    await deleteProjectFromCollection(projectId);
    return redirect("/dashboard/projects");
  }
  return null;
};

function ProjectCard({ project }: { project: ProjectData }) {
  return (
    <Dialog>
      <div className="block hover:shadow-md transition-shadow outline-none">
        <div className="bg-zinc-100 dark:bg-zinc-900 dark:border dark:hover:border-zinc-700 dark:text-white text-zinc-950 py-3 px-3.5 rounded-md shadow-sm shadow-zinc-400 dark:shadow-none flex flex-col justify-between h-full transition">
          <div className="flex items-center justify-between">
            <div className="text-lg font-semibold">{project.projectName}</div>
            <DropdownMenu>
              <DropdownMenuTrigger className="p-1.5 rounded-md outline-none dark:hover:bg-zinc-700 transition">
                <BsThreeDotsVertical className="w-4.5 h-4.5" />
              </DropdownMenuTrigger>
              <DropdownMenuContent className="font-medium">
                <DropdownMenuItem asChild>
                  <Link
                    to={`/dashboard/projects/${project.id}`}
                    className="w-full"
                  >
                    View
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem>Edit</DropdownMenuItem>
                <DialogTrigger className="w-full">
                  <DropdownMenuItem>Delete</DropdownMenuItem>
                </DialogTrigger>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <p className="text-sm text-muted-foreground">{formatDate(project.createdAt)}</p>
          <p className="text-sm text-zinc-400 mt-2">
            {project.description || "No description provided."}
          </p>
        </div>
      </div>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Are you sure?</DialogTitle>
          <DialogDescription>
            This action will delete your project.
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-end gap-3 mt-1">
          <DialogClose asChild>
            <button className="px-2 py-0.5 text-xs shadow-sm dark:shadow-none hover:shadow-md shadow-zinc-400 hover:shadow-zinc-400 dark:bg-zinc-800 border dark:hover:border-zinc-700 rounded-md font-semibold duration-150">
              Cancel
            </button>
          </DialogClose>
          <Form method="post">
            <input type="hidden" name="projectId" value={project.id} />
            <button type="submit" name="_action" value="delete"
              className="px-3 py-2 text-xs font-semibold bg-red-600 shadow-sm hover:shadow-md hover:shadow-red-500 shadow-red-500 text-white rounded-md duration-150">
              Delete
            </button>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function ProjectsIndex() {
  const { projects } = useOutletContext<{ projects: ProjectData[] }>();
  return (
    <div className="grid md:grid-cols-3 sm:grid-cols-2 grid-cols-1 gap-3">
      {/* New Project Card */}
      <Link to="/dashboard/projects/createProject" className="gap-2 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-950 dark:hover:bg-zinc-900 transition rounded-md flex items-center justify-center text-center py-10 px-5 font-semibold text-zinc-600 dark:text-zinc-300 border border-dashed border-zinc-400">
        <p className="md:text-lg text-sm">Create New Project</p>
      </Link>
      {projects.map((project) => (
        <ProjectCard key={project.id} project={project} />
      ))}
    </div>
  );
}