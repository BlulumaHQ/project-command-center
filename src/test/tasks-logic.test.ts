import { describe, expect, it } from "vitest";
import { dueTone, filterCounts, filterTasks, sortTasks, storedTaskFilter, vancouverDate, type TableTask } from "@/data/tasks";

const today = "2026-11-16";
const t = (id: string, o: Partial<TableTask> = {}): TableTask => ({ id, projectId: "p1", projectName: "P1", projectSort: 0, sort: 0, title: id, grp: "next", status: "todo", dueDate: null, doneAt: null, updatedAt: null, ...o });

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
  it("現在要做 includes only open next tasks", () => {
    expect(filterTasks([...list, t("later", { grp: "later" })], "next", today).map((x) => x.id)).toEqual(["due", "doing", "waiting", "open"]);
  });
  it("之後 includes only open later tasks", () => {
    expect(filterTasks([t("later", { grp: "later" }), t("next"), t("done", { grp: "later", status: "done" })], "later", today).map((x) => x.id)).toEqual(["later"]);
  });
  it("migrates stored all and defaults to next", () => {
    expect(storedTaskFilter("all")).toBe("next");
    expect(storedTaskFilter(null)).toBe("next");
    expect(storedTaskFilter("later")).toBe("later");
  });
  it("status, due and done-today filters include both groups", () => {
    for (const grp of ["next", "later"] as const) {
      const rows = [t("doing", { grp, status: "doing" }), t("waiting", { grp, status: "waiting" }), t("due", { grp, dueDate: "2026-11-20" }), t("done", { grp, status: "done", doneAt: "2026-11-16T20:00:00Z" })];
      expect(filterTasks(rows, "doing", today).map((x) => x.id)).toEqual(["doing"]);
      expect(filterTasks(rows, "waiting", today).map((x) => x.id)).toEqual(["waiting"]);
      expect(filterTasks(rows, "due", today).map((x) => x.id)).toEqual(["due"]);
      expect(filterTasks(rows, "doneToday", today).map((x) => x.id)).toEqual(["done"]);
    }
  });
  it("今天完成 uses Vancouver day of done_at", () => { expect(filterTasks(list, "doneToday", today).map((x) => x.id)).toEqual(["doneToday"]); });
  it("counts each filter and respects the project filter", () => {
    expect(filterCounts(list, today)).toEqual({ next: 4, later: 0, doing: 1, waiting: 1, due: 1, doneToday: 1, cancelled: 0 });
    expect(filterTasks(list, "next", today, "p2").map((x) => x.id)).toEqual(["waiting"]);
  });
  it("marks overdue red and within 7 days orange", () => {
    expect(dueTone("2026-11-15", today)).toBe("overdue");
    expect(dueTone("2026-11-23", today)).toBe("soon");
    expect(dueTone("2026-11-24", today)).toBe("none");
  });
  it("computes Vancouver today", () => { expect(vancouverDate(new Date("2026-11-16T06:00:00Z"))).toBe("2026-11-15"); });
});
