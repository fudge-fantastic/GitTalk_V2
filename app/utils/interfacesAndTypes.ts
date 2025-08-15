export interface SingleProjectData {
  id: string;
  projectName: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  githubUrl: string; // Derived from related Repo
}

export interface ProjectData {
  id: string;
  projectName: string;
  description: string;
  createdAt: string;
}

export type CommitResponse = {
  commitHash: string;
  commitMessage: string;
  commitUrl: string;
  authorName?: string;
  authorAvatarUrl?: string;
  authorUrl?: string;
  committedAt?: string;
};