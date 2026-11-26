import { describe, expect, it } from "vitest";
import { choiceLabel, runHealth, undoPlan, type ProposalRow, type RunRow } from "@/data/autopilot";
import { normalizeAgentStatus } from "@/data/store";

const run = (p: Partial<RunRow>): RunRow => ({ id: "r", agent_id: "memo", summary: "", outcome: "ok", created_at: "2026-11-26T09:10:00Z", started_at: "2026-11-26T09:07:00Z", finished_at: "2026-11-26T09:40:00Z", task_ids: [], model: null, error: null, ...p });
const now = Date.parse("2026-11-26T14:00:00Z");

describe("autopilot health", () => {
  it("is ok when last night's runs finished", () => {
    expect(runHealth([run({}), run({ id: "a", agent_id: "atlas" })], now).ok).toBe(true);
  });
  it("flags broken and never-finished runs", () => {
    const h = runHealth([run({ outcome: "broken", error: "x" }), run({ id: "b", finished_at: null })], now);
    expect(h.ok).toBe(false);
    expect(h.problems).toHaveLength(2);
  });
  it("is not ok when nothing ran", () => {
    expect(runHealth([], now).ok).toBe(false);
  });
});

describe("agent status", () => {
  it("maps scheduler words onto HQ states", () => {
    expect(normalizeAgentStatus("running")).toBe("ok");
    expect(normalizeAgentStatus("error")).toBe("broken");
    expect(normalizeAgentStatus("check")).toBe("check");
    expect(normalizeAgentStatus("weird")).toBe("idle");
  });
});

describe("morning report undo", () => {
  const base: ProposalRow = { id: "p", project_id: "toyscope", kind: "decision", question: "Q", options: [{ key: "A", label: "100 位註冊", task_ids: ["t1"] }, { key: "B", label: "回訪率", task_ids: ["t2"] }], recommended: "A", reason: null, task_ids: ["t1", "t2"], choice: "B", sony_note: null, status: "answered", created_at: "", answered_at: "" };
  it("resets approval on every task a decision touched", () => {
    expect(undoPlan(base).resetApproval.sort()).toEqual(["t1", "t2"]);
    expect(undoPlan(base).reopenTasks).toEqual([]);
  });
  it("reopens tasks only when a confirm was answered yes", () => {
    const c: ProposalRow = { ...base, kind: "confirm_done", options: [], task_ids: ["t9"], choice: "yes" };
    expect(undoPlan(c).reopenTasks).toEqual(["t9"]);
    expect(undoPlan({ ...c, choice: "no" }).reopenTasks).toEqual([]);
  });
  it("labels the chosen option", () => {
    expect(choiceLabel(base)).toBe("B · 回訪率");
    expect(choiceLabel({ ...base, choice: "skip" })).toBe("先不要");
  });
});
