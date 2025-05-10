// dashboard.projects.$id.tsx
import { useParams, useOutletContext, Link } from "@remix-run/react";
import { FaGithub } from "react-icons/fa";
import { Textarea } from "~/components/ui/textarea";
import { AiOutlineDelete } from "react-icons/ai";
import { FaCodeCommit } from "react-icons/fa6";
import { ScrollArea } from "~/components/ui/scroll-area";

export interface SingleProjectData {
    id: string;
    projectName: string;
    description: string;
    createdAt: string;
    updatedAt: string;
    githubUrl: string;

}

export default function ProjectDetailsRoute() {
    const { id } = useParams();
    const { projects } = useOutletContext<{ projects: SingleProjectData[] }>();

    const project = projects.find((p) => p.id === id);

    if (!project) { return <p className="text-red-500 text-center text-lg">Project not found.</p>; }

    return (
        <div>
            <div className="flex items-center justify-between gap-2 dark:bg-zinc-900 bg-zinc-100 p-2 rounded-md shadow-sm shadow-zinc-400 dark:shadow-none">
                <div className="flex items-center gap-2">
                    <FaGithub className="w-8 h-8 inline-block" />
                    <h1 className="text-lg font-semibold">{project.projectName}</h1>
                    <p className="md:text-base text-sm">linked to <Link to={project.githubUrl} target="_blank" rel="noreferrer">👉<span className="hover:underline font-semibold">this repository</span>👈</Link></p>
                </div>
                <AiOutlineDelete className="w-6 h-6 inline-block mr-2" />
            </div>
            <div className="flex flex-row w-full gap-3 mt-3">
                <div className="p-4 dark:bg-zinc-900 bg-zinc-100 rounded-md shadow-sm shadow-zinc-400 dark:shadow-none w-[60%]">
                    <h1 className="text-lg font-semibold">Ask a question</h1>
                    <p className="text-muted-foreground text-sm mb-2">GitTalk has knowledge to your codebase</p>
                    <Textarea
                        placeholder="Which part of the codebase do you need help with?"
                        className="bg-white dark:bg-zinc-950 rounded-md h-28"
                    />
                    <button className="mt-4 px-2.5 py-1.5 dark:bg-white dark:text-black dark:hover:bg-zinc-200 bg-zinc-950 text-white hover:bg-zinc-900 rounded-md text-sm font-semibold transition">Submit</button>
                </div>
                <div className="py-4 pl-4 dark:bg-zinc-900 bg-zinc-100 rounded-md shadow-sm shadow-zinc-400 dark:shadow-none w-[40%] text-justify">
                    <h1 className="text-lg font-semibold mb-1">Description</h1>
                        <ScrollArea className="font-medium text-muted-foreground tracking-tight text-sm h-44 overflow-auto pr-4">
                            Lorem ipsum dolor sit amet consectetur adipisicing elit. Iusto ex rerum repellat labore. Ipsa blanditiis adipisci, autem porro, at dolorum saepe animi iusto ratione molestiae et tempore? Ullam, animi consectetur! Lorem ipsum dolor sit amet consectetur adipisicing elit. Molestiae similique, architecto nobis eaque officia iusto eos possimus deserunt
                            Lorem ipsum dolor sit amet consectetur adipisicing elit. Iusto ex rerum repellat labore. Ipsa blanditiis adipisci, autem porro, at dolorum saepe animi iusto ratione molestiae et tempore? Ullam, animi consectetur! Lorem ipsum dolor sit amet consectetur adipisicing elit. Molestiae similique, architecto nobis eaque officia iusto eos possimus deserunt
                        </ScrollArea>
                </div>
            </div>
            <div className="mt-3">
                <div className="flex gap-2 items-center">
                    <FaCodeCommit className="w-7 h-7" />
                    <h1 className="font-semibold text-2xl">Recent Commits</h1>
                </div>
                <div>
                    Lorem ipsum dolor sit amet, consectetur adipisicing elit. Assumenda autem itaque, asperiores fugit molestias magni animi quidem illo porro accusantium ullam architecto qui, dolorem, dolorum nihil libero hic perspiciatis sapiente!
                </div>
            </div>
        </div>
    );
}
