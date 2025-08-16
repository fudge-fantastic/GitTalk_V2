import { prisma } from "~/db.server";
import { extractOwnerRepo } from "~/utils/someFunctions";

// Create a project while ensuring a shared Repo record exists (connect or create)
export async function createSingleProject({
  projectName,
  githubUrl,
  description,
}: {
  projectName: string;
  githubUrl: string;
  description?: string | null;
}) {
  const parsed = extractOwnerRepo(githubUrl);
  const name = parsed ? `${parsed.owner}/${parsed.repo}` : githubUrl.split("/").slice(-1)[0] || githubUrl;
  // Ensure repo exists (connectOrCreate manually because schema types may not yet expose nested create for relation direction)
  const repo = await prisma.repo.upsert({
    where: { githubUrl },
    update: {},
    create: { githubUrl, name },
  });
  const project = await prisma.project.create({
    data: {
      projectName,
      description: description ?? null,
      repoId: repo.id,
    },
  });
  return { ...project, githubUrl: repo.githubUrl };
}

// Get view of all projects (include repo to expose githubUrl derived field) - single user so no filter
export async function getAllProjects() {
  const projects = await prisma.project.findMany({
    orderBy: { createdAt: "desc" },
    include: { repo: { select: { githubUrl: true } } },
  });
  return projects.map(p => ({
    id: p.id,
    projectName: p.projectName,
    description: p.description ?? "",
    createdAt: p.createdAt,
    githubUrl: p.repo.githubUrl,
  }));
}

// Update a project. If githubUrl provided, reconnect to the appropriate Repo (creating if necessary).
export async function updateProject(id: string, updates: {
  projectName?: string;
  githubUrl?: string;
  description?: string | null;
}) {
  const { githubUrl, ...rest } = updates;
  const data: any = { ...rest };
  if (githubUrl) {
    const parsed = extractOwnerRepo(githubUrl);
    const name = parsed ? `${parsed.owner}/${parsed.repo}` : githubUrl.split("/").slice(-1)[0] || githubUrl;
    data.repo = {
      connectOrCreate: {
        where: { githubUrl },
        create: { githubUrl, name },
      },
    };
  }
  const project = await prisma.project.update({
    where: { id },
    data,
  });
  // Load repo to attach githubUrl for consumer convenience
  const repo = await prisma.repo.findUnique({ where: { id: project.repoId }, select: { githubUrl: true } });
  return { ...project, githubUrl: repo?.githubUrl || "" };
}

// Delete a project
export async function deleteProject(id: string) {
  return prisma.project.delete({ where: { id } });
}
