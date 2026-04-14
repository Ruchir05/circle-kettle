import { describe, expect, it } from "vitest";
import {
  getCalendarDayISOInZone,
  getSlotStartsForCalendarDay,
  isValidSlotStart,
} from "@/lib/schedule";

describe("getSlotStartsForCalendarDay", () => {
  it("returns 30-min slots on event day in America/Chicago (1pm–5pm)", () => {
    const slots = getSlotStartsForCalendarDay("2026-04-18", "America/Chicago");
    expect(slots.length).toBe(8);
    expect(slots[0]).toMatch(/T/);
    const first = new Date(slots[0]);
    const second = new Date(slots[1]);
    expect(second.getTime() - first.getTime()).toBe(30 * 60 * 1000);
  });

  it("returns empty on any other day", () => {
    expect(getSlotStartsForCalendarDay("2026-04-19", "America/Chicago")).toEqual([]);
    expect(getSlotStartsForCalendarDay("2026-04-20", "America/Chicago")).toEqual([]);
  });
});

describe("isValidSlotStart", () => {
  it("accepts a generated slot on the event day", () => {
    const slots = getSlotStartsForCalendarDay("2026-04-18", "America/Chicago");
    expect(slots.length).toBeGreaterThan(0);
    expect(isValidSlotStart(slots[0])).toBe(true);
  });
});

describe("getCalendarDayISOInZone", () => {
  it("formats UTC instant in Chicago calendar day", () => {
    const d = new Date("2026-04-20T22:00:00.000Z");
    const day = getCalendarDayISOInZone(d, "America/Chicago");
    expect(day).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});
