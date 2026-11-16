import { describe, expect, it } from "vitest";
import { dueTone, filterCounts, filterTasks, sortTasks, vancouverDate, type TableTask } from "@/data/tasks";

const today = "2026-11-16";
const t = (id: string, o: Partial<TableTask> = {}): TableTask => ({ id, projectId: "p1", projectName: "P1", projectSort: 0, sort: 0, title: id, status: "todo", dueDate: null, doneAt: null, updatedAt: null, ...o });

describe("/tasks sort order", () => {
  it("orders overdue, then due soonest, then doing, waiting, todo", () => {
    const list = [t("todo"), t("waiting", { status: "waiting" }), t("doing", { status: "doing" }), t("due-late", { dueDate: "2026-12-01" }), t("due-soon", { dueDate: "2026-11-18" }), t("overdue", { dueDate: "2026-11-10" })];
    expect(sortTasks(list, today).map((x) => x.id)).toEqual(["overdue", "due-soon", "due-late", "doing", "waiting", "todo"]);
  });
  it("breaks ties by project sort then task sort", () => {
    const list = [t("b2", { projectSort: 1, sort: 2 }), t("a2", { sort: 2 }), t("b1", { projectSort: 1, sort: 1 }), t("a1", { sort: 1 })];
    expect(sortTasks(list, today).map((x) => x.id)).toEqual(["a1", "a2", "b1", "b2"]);
  });
});

describe("/tasks filters", () => {
  const list = [t("open"), t("doing", { status: "doing" }), t("waiting", { status: "waiting", projectId: "p2" }), t("due", { dueDate: "2026-11-20" }),
    t("doneToday", { status: "done", doneAt: "2026-11-16T20:00:00Z" }), t("doneYesterday", { status: "done", doneAt: "2026-11-16T07:00:00Z" })];
  it("全部 hides completed tasks", () => { expect(filterTasks(list, "all", today).map((x) => x.id)).not.toContain("doneToday"); });
  it("今天完成 uses Vancouver day of done_at", () => { expect(filterTasks(list, "doneToday", today).map((x) => x.id)).toEqual(["doneToday"]); });
  it("counts each filter and respects the project filter", () => {
    expect(filterCounts(list, today)).toEqual({ all: 4, doing: 1, waiting: 1, due: 1, doneToday: 1 });
    expect(filterTasks(list, "all", today, "p2").map((x) => x.id)).toEqual(["waiting"]);
  });
  it("marks overdue red and within 7 days orange", () => {
    expect(dueTone("2026-11-15", today)).toBe("overdue");
    expect(dueTone("2026-11-23", today)).toBe("soon");
    expect(dueTone("2026-11-24", today)).toBe("none");
  });
  it("computes Vancouver today", () => { expect(vancouverDate(new Date("2026-11-16T06:00:00Z"))).toBe("2026-11-15"); });
});
