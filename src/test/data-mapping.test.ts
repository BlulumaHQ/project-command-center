import { describe, expect, it } from "vitest";
import { formatDate, getProgress, latestSync, mapProject, type ProjectRow, type TaskRow } from "@/data/mapping";

const project: ProjectRow = {
  id: "one", name: "One", brand: "Brand", category: "client", status: "done", pct: 80,
  next_step: "Next", open_count: 7, description: null, now_title: null, now_note: null,
  handoff: null, decisions: null, links: null, phases: null, undecided: null, updated_at: "2026-11-16T06:32:00Z",
};
const task = (id: string, grp: "next" | "later", done: boolean): TaskRow => ({ id, project_id: "one", title: id, note: null, grp, done, updated_at: "2026-11-16T07:00:00Z", status: done ? "done" : "todo", due_date: null, done_at: null, sort: 0 });

describe("Existing dashboard data rules", () => {
  it("groups completed next and later tasks together, leaving unfinished groups intact", () => {
    const mapped = mapProject(project, [task("a", "next", false), task("b", "later", false), task("c", "next", true), task("d", "later", true)]);
    expect(mapped.detail?.tasks.map((t) => t.group)).toEqual(["next", "later", "done", "done"]);
  });
  it("computes percentage and open count from tasks when they exist", () => {
    expect(getProgress(mapProject(project, [task("a", "next", false), task("b", "later", true)]))).toEqual({ done: 1, total: 2, pct: 50, open: 1 });
  });
  it("uses project percentage and count when there are no tasks", () => {
    expect(getProgress(mapProject(project, []))).toEqual({ done: 0, total: 0, pct: 80, open: 7 });
  });
  it("creates detail only for a now title or any task", () => {
    expect(mapProject(project, []).detail).toBeUndefined();
    expect(mapProject({ ...project, now_title: "Now" }, []).detail?.now.title).toBe("Now");
    expect(mapProject(project, [task("a", "next", false)]).detail?.tasks).toHaveLength(1);
  });
  it("maps status, due date and done time onto tasks; status done means completed", () => {
    const mapped = mapProject(project, [{ ...task("a", "next", false), status: "done", due_date: "2026-11-20", done_at: "2026-11-16T07:00:00Z" }]);
    expect(mapped.detail?.tasks[0]).toMatchObject({ status: "done", done: true, group: "done", dueDate: "2026-11-20", doneAt: "2026-11-16T07:00:00Z" });
  });
  it("formats dates in Vancouver", () => {
    expect(formatDate("2026-11-16T06:32:00Z")).toBe("11/15");
    expect(formatDate("2026-11-16T06:32:00Z", true)).toBe("11/15 22:32");
  });
  it("uses the latest project or task update as the sync time", () => {
    expect(latestSync([project], [task("a", "next", false)])).toBe("11/15 23:00");
  });
});