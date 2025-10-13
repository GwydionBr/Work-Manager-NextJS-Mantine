// __tests__/newFilterOutExistingSessionTimes.test.ts
import { resolveTimeEntryOverlaps } from "../src/utils/helper/resolveTimeEntryOverlaps";
import { WorkTimeEntry } from "@/types/work.types";

function makeTimeEntry(
  start: string,
  end: string,
  id: string = "1"
): WorkTimeEntry {
  const startDate = new Date(`2023-01-01T${start}:00Z`);
  const endDate = new Date(`2023-01-01T${end}:00Z`);
  return {
    id,
    user_id: "1",
    project_id: "1",
    start_time: startDate.toISOString(),
    end_time: endDate.toISOString(),
    true_end_time: new Date(0).toISOString(),
    active_seconds: Math.round(
      (endDate.getTime() - startDate.getTime()) / 1000
    ),
    paused_seconds: 0,
    created_at: new Date(0).toISOString(),
    currency: "USD",
    hourly_payment: false,
    memo: "Test Description",
    payout_id: null,
    single_cash_flow_id: null,
    real_start_time: null,
    salary: 0,
    time_fragments_interval: null,
  };
}

describe("resolveTimeEntryOverlaps", () => {
  it("returns full new session if no overlaps", () => {
    const newTimeEntry = makeTimeEntry("10:00", "11:00");
    const result = resolveTimeEntryOverlaps([], newTimeEntry);

    expect(result.adjustedTimeSpans).toEqual([newTimeEntry]);
    expect(result.overlappingTimeEntries).toEqual([]);
  });

  it("cuts out a single overlap in the middle", () => {
    const newTimeEntry = makeTimeEntry("10:00", "11:00");
    const existing = [makeTimeEntry("10:20", "10:40")];

    const result = resolveTimeEntryOverlaps(existing, newTimeEntry);

    expect(result.adjustedTimeSpans).toEqual([
      makeTimeEntry("10:00", "10:20"),
      makeTimeEntry("10:40", "11:00"),
    ]);
  });

  it("splits into three parts with two overlaps", () => {
    const newTimeEntry = makeTimeEntry("10:00", "11:00");
    const existing = [
      makeTimeEntry("10:20", "10:30", "a"),
      makeTimeEntry("10:40", "10:50", "b"),
    ];

    const result = resolveTimeEntryOverlaps(existing, newTimeEntry);

    expect(result.adjustedTimeSpans).toEqual([
      makeTimeEntry("10:00", "10:20"),
      makeTimeEntry("10:30", "10:40"),
      makeTimeEntry("10:50", "11:00"),
    ]);
  });

  it("returns null if fully overlapped", () => {
    const newTimeEntry = makeTimeEntry("10:00", "11:00");
    const existing = [makeTimeEntry("09:00", "12:00")];

    const result = resolveTimeEntryOverlaps(existing, newTimeEntry);

    expect(result.adjustedTimeSpans).toBeNull();
  });

  it("returns null if several sessions overlap completey time", () => {
    const newTimeEntry = makeTimeEntry("10:00", "11:00");
    const existing = [
      makeTimeEntry("10:00", "10:30"),
      makeTimeEntry("10:30", "11:00"),
    ];

    const result = resolveTimeEntryOverlaps(existing, newTimeEntry);

    expect(result.adjustedTimeSpans).toBeNull();
  });

  it("returns null if exactly same time", () => {
    const newTimeEntry = makeTimeEntry("10:00", "11:00");
    const existing = [makeTimeEntry("10:00", "11:00")];

    const result = resolveTimeEntryOverlaps(existing, newTimeEntry);

    expect(result.adjustedTimeSpans).toBeNull();
  });

  it("trims overlap at start", () => {
    const newTimeEntry = makeTimeEntry("10:00", "11:00");
    const existing = [makeTimeEntry("09:30", "10:15")];

    const result = resolveTimeEntryOverlaps(existing, newTimeEntry);

    expect(result.adjustedTimeSpans).toEqual([makeTimeEntry("10:15", "11:00")]);
  });

  it("trims overlap at end", () => {
    const newTimeEntry = makeTimeEntry("10:00", "11:00");
    const existing = [makeTimeEntry("10:45", "11:30")];

    const result = resolveTimeEntryOverlaps(existing, newTimeEntry);

    expect(result.adjustedTimeSpans).toEqual([makeTimeEntry("10:00", "10:45")]);
  });
});
