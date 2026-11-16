export type Category = "client" | "product" | "system";
export type Status = "progress" | "waiting" | "deadline" | "almost" | "done";
export type StepState = "done" | "now" | "locked";
export type TaskGroup = "next" | "later" | "done";

export interface Task { id: string; title: string; note?: string | undefined; group: TaskGroup; done: boolean; status: import("./tasks").TaskStatus; dueDate: string | null; doneAt: string | null; }
export interface Phase { title: string; detail?: string; state: StepState; }
export interface LinkRow { label: string; value: string; }
export interface ProjectDetail {
  description: string;
  phases: Phase[];
  now: { title: string; note: string };
  tasks: Task[];
  handoff: string;
  decisions: string[];
  links: LinkRow[];
  undecided: string;
}
export interface Project {
  id: string; name: string; brand: string; category: Category; status: Status;
  pct: number; next: string; open: number; updated: string; detail?: ProjectDetail;
}
export interface Deadline { title: string; detail: string; when: string; level: "hot" | "soft"; }
export interface ChainStep { title: string; unlocks: string; state: StepState; }
export interface WaitingItem { initials: string; who: string; project: string; what: string; }
export interface Seed {
  lastSynced: string; resumeProjectId: string; secondaryNext: string;
  projects: Project[]; deadlines: Deadline[]; chain: ChainStep[]; waiting: WaitingItem[];
}
