// __tests__/newFilterOutExistingSessionTimes.test.ts
import { resolveSessionOverlaps } from "../src/utils/helper/resolveSessionOverlaps";
import { Tables } from "../src/types/db.types";

function makeSession(
  start: string,
  end: string,
  id: string = "1"
): Tables<"timer_session"> {
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
    payed: false,
    payout_id: null,
    real_start_time: null,
    salary: 0,
    time_fragments_interval: null,
  };
}

describe("resolveSessionOverlaps", () => {
  it("returns full new session if no overlaps", () => {
    const newSession = makeSession("10:00", "11:00");
    const result = resolveSessionOverlaps([], newSession);

    expect(result.adjustedTimeSpans).toEqual([newSession]);
    expect(result.overlappingSessions).toEqual([]);
  });

  it("cuts out a single overlap in the middle", () => {
    const newSession = makeSession("10:00", "11:00");
    const existing = [makeSession("10:20", "10:40")];

    const result = resolveSessionOverlaps(existing, newSession);

    expect(result.adjustedTimeSpans).toEqual([
      makeSession("10:00", "10:20"),
      makeSession("10:40", "11:00"),
    ]);
  });

  it("splits into three parts with two overlaps", () => {
    const newSession = makeSession("10:00", "11:00");
    const existing = [
      makeSession("10:20", "10:30", "a"),
      makeSession("10:40", "10:50", "b"),
    ];

    const result = resolveSessionOverlaps(existing, newSession);

    expect(result.adjustedTimeSpans).toEqual([
      makeSession("10:00", "10:20"),
      makeSession("10:30", "10:40"),
      makeSession("10:50", "11:00"),
    ]);
  });

  it("returns null if fully overlapped", () => {
    const newSession = makeSession("10:00", "11:00");
    const existing = [makeSession("09:00", "12:00")];

    const result = resolveSessionOverlaps(existing, newSession);

    expect(result.adjustedTimeSpans).toBeNull();
  });

  it("returns null if several sessions overlap completey time", () => {
    const newSession = makeSession("10:00", "11:00");
    const existing = [
      makeSession("10:00", "10:30"),
      makeSession("10:30", "11:00"),
    ];

    const result = resolveSessionOverlaps(existing, newSession);

    expect(result.adjustedTimeSpans).toBeNull();
  });

  it("returns null if exactly same time", () => {
    const newSession = makeSession("10:00", "11:00");
    const existing = [makeSession("10:00", "11:00")];

    const result = resolveSessionOverlaps(existing, newSession);

    expect(result.adjustedTimeSpans).toBeNull();
  });

  it("trims overlap at start", () => {
    const newSession = makeSession("10:00", "11:00");
    const existing = [makeSession("09:30", "10:15")];

    const result = resolveSessionOverlaps(existing, newSession);

    expect(result.adjustedTimeSpans).toEqual([makeSession("10:15", "11:00")]);
  });

  it("trims overlap at end", () => {
    const newSession = makeSession("10:00", "11:00");
    const existing = [makeSession("10:45", "11:30")];

    const result = resolveSessionOverlaps(existing, newSession);

    expect(result.adjustedTimeSpans).toEqual([makeSession("10:00", "10:45")]);
  });
});
