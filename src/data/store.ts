// Single access point for all data. Swap internals to Supabase later; keep signatures.
import { useEffect, useSyncExternalStore } from "react";
import { seed } from "./seed";
import type { Project, Status } from "./types";

const KEY = "pcc.taskState.v1";
let overrides: Record<string, boolean> = {};
let version = 0;
let loaded = false;
const listeners = new Set<() => void>();
const emit = () => { version++; listeners.forEach((l) => l()); };

function load() {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  try { overrides = JSON.parse(localStorage.getItem(KEY) || "{}"); } catch { overrides = {}; }
  emit();
}

function withState(p: Project): Project {
  if (!p.detail) return p;
  return { ...p, detail: { ...p.detail, tasks: p.detail.tasks.map((t) => {
    const k = `${p.id}:${t.id}`;
    return k in overrides ? { ...t, done: overrides[k] } : t;
  }) } };
}

export const getMeta = () => ({ lastSynced: seed.lastSynced, resumeProjectId: seed.resumeProjectId, secondaryNext: seed.secondaryNext });
export const getProjects = (): Project[] => seed.projects.map(withState);
export const getProject = (id: string): Project | undefined => getProjects().find((p) => p.id === id);
export const getDeadlines = () => seed.deadlines;
export const getChain = () => seed.chain;
export const getWaiting = () => seed.waiting;

export function toggleTask(projectId: string, taskId: string) {
  const t = getProject(projectId)?.detail?.tasks.find((x) => x.id === taskId);
  if (!t) return;
  overrides = { ...overrides, [`${projectId}:${taskId}`]: !t.done };
  try { localStorage.setItem(KEY, JSON.stringify(overrides)); } catch { /* ignore */ }
  emit();
}

export function getProgress(p: Project) {
  const tasks = p.detail?.tasks ?? [];
  const done = tasks.filter((t) => t.done).length;
  const pct = tasks.length ? Math.round((done / tasks.length) * 100) : p.pct;
  const open = tasks.length ? tasks.length - done : p.open;
  return { done, total: tasks.length, pct, open };
}

export const statusLabel: Record<Status, string> = { progress: "進行中", waiting: "等待中", deadline: "有時限", almost: "快完成" };

/** Re-render on store changes; loads localStorage after hydration. */
export function useStore() {
  useEffect(load, []);
  return useSyncExternalStore((l) => { listeners.add(l); return () => listeners.delete(l); }, () => version, () => 0);
}
