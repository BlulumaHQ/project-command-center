import { describe, expect, it } from "vitest";
import { runHealth, type RunRow } from "@/data/autopilot";
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
