import { prisma } from "~/db.server";

export async function createSingleProject({
  userId,
  projectName,
  githubUrl,
}: {
  userId: string;
  projectName: string;
  githubUrl: string;
}) {
  return prisma.project.create({
    data: {
      userId,
      projectName,
      githubUrl,
    },
  });
}

// Get view of all projects
export async function getProjectsForUser(userId: string) {
  return prisma.project.findMany({
    where: { userId },
  orderBy: { createdAt: "desc" },
  select: { id: true, projectName: true, githubUrl: true, createdAt: true },
  });
}

// Update a project
export async function updateProject(id: string, updates: {
  projectName?: string;
  githubUrl?: string;
  description?: string;
}) {
  return prisma.project.update({
    where: { id },
    data: updates,
  });
}

// Delete a project
export async function deleteProject(id: string) {
  return prisma.project.delete({
    where: { id },
  });
}
