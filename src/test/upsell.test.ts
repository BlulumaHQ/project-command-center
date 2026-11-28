import { describe, expect, it } from "vitest";
import { pickLadder, upsellFor } from "@/data/upsell";
import type { ClientRow } from "@/data/hq2";

const base: ClientRow = {
  id: "x",
  name: "Test Co",
  contact_name: null,
  phone: null,
  email: null,
  website: null,
  brand: "Sonykun",
  services: [],
  accounts: null,
  renewals: [],
  notes: null,
  since: null,
  status: "Live",
  sort: 0,
};
const today = "2026-11-27";

describe("upsell ladder", () => {
  it("skips clients with no services, prospects and 不用理 clients", () => {
    expect(upsellFor(base, today)).toBeNull();
    expect(upsellFor({ ...base, services: ["網站設計"], status: "報價" }, today)).toBeNull();
    expect(
      upsellFor({ ...base, name: "Chinese Culture Festival", services: ["Hosting"] }, today),
    ).toBeNull();
  });
  it("standard: hosting client → 第二語言 next", () => {
    const u = upsellFor({ ...base, services: ["網站設計", "Managed Hosting"] }, today);
    expect(u?.next).toBe("第二語言");
    expect(u?.now).toBe(true);
  });
  it("Bluluma dental with SEO → Patient Flow next", () => {
    const c = {
      ...base,
      name: "Tsai Orthodontics",
      brand: "Bluluma",
      services: ["Domain + Hosting", "SEO project"],
    };
    expect(pickLadder(c)).toBe("healthcare");
    expect(upsellFor(c, today)?.next).toBe("Patient Flow");
  });
  it("Sonykun wellness stays on the standard ladder", () => {
    expect(
      pickLadder({ ...base, name: "AccuQi Wellness", services: ["網站設計（中英雙語）"] }),
    ).toBe("standard");
  });
  it("realtor → Housvis; renewal within 30 days means now", () => {
    const u = upsellFor(
      {
        ...base,
        name: "Eric Kim Realty",
        brand: "Bluluma",
        services: ["Domain + Hosting"],
        status: "Live",
        renewals: [{ date: "2026-12-10", title: "Hosting" }],
      },
      today,
    );
    expect(u?.next).toBe("Housvis");
    expect(u?.when).toContain("續約前");
  });
  it("delivered less than 30 days ago waits", () => {
    const u = upsellFor(
      { ...base, services: ["網站設計"], since: "2026-11-20", status: "進行中" },
      today,
    );
    expect(u?.now).toBe(false);
    expect(u?.when).toContain("12/20");
  });
});
