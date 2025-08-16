import { prisma } from "~/db.server";

// Simple in-memory cache for local dev (single-user). Not suitable for multi-instance deployments.
export type EnvMap = Record<string, string>;
let cache: { map: EnvMap; loadedAt: number } | null = null;

const CACHE_TTL_MS = 60_000; // 1 minute

export async function getEnvVars() {
  return prisma.envVar.findMany({ orderBy: { createdAt: "asc" } });
}

export async function getEnvVar(key: string) {
  return prisma.envVar.findUnique({ where: { key } });
}

export async function requireEnvVar(key: string) {
  const v = await getEnvVar(key);
  if (!v) throw new Error(`Missing EnvVar: ${key}`);
  return v.value;
}

export async function getEnvMap(opts?: { force?: boolean }): Promise<EnvMap> {
  if (!opts?.force && cache && Date.now() - cache.loadedAt < CACHE_TTL_MS) return cache.map;
  const rows = await getEnvVars();
  const map: EnvMap = {};
  for (const r of rows) map[r.key] = r.value;
  cache = { map, loadedAt: Date.now() };
  return map;
}

export function invalidateEnvCache() {
  cache = null;
}

// Convenience: fetch a subset of keys, returning undefined if absent (no throw)
export async function pickEnvVars(keys: string[]) {
  const map = await getEnvMap();
  const out: EnvMap = {};
  for (const k of keys) if (k in map) out[k] = map[k];
  return out;
}

// Example usage patterns for LLM / API modules:
// const { GEMINI_API_KEY } = await pickEnvVars(["GEMINI_API_KEY"]);
// or const githubToken = await requireEnvVar("GITHUB_TOKEN");
