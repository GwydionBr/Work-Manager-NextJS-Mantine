// __tests__/newFilterOutExistingSessionTimes.test.ts
import { resolveSessionOverlaps } from "../src/utils/helper/resolveSessionOverlaps";
import { TimeSpan } from "../src/types/work.types";
import { Tables } from "../src/types/db.types";

function makeSession(start: string, end: string): TimeSpan {
  return {
    start_time: new Date(`2023-01-01T${start}:00Z`).getTime(),
    end_time: new Date(`2023-01-01T${end}:00Z`).getTime(),
  };
}

function makeExistingSession(
  start: string,
  end: string,
  id: string = "1"
): Tables<"timer_session"> {
  return {
    id,
    user_id: "1",
    project_id: "1",
    start_time: new Date(`2023-01-01T${start}:00Z`).toISOString(),
    end_time: new Date(`2023-01-01T${end}:00Z`).toISOString(),
    true_end_time: new Date(`2023-01-01T${end}:00Z`).toISOString(),
    active_seconds: 0,
    paused_seconds: 0,
    created_at: new Date().toISOString(),
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
    const existing = [makeExistingSession("10:20", "10:40")];

    const result = resolveSessionOverlaps(existing, newSession);

    expect(result.adjustedTimeSpans).toEqual([
      makeSession("10:00", "10:20"),
      makeSession("10:40", "11:00"),
    ]);
  });

  it("splits into three parts with two overlaps", () => {
    const newSession = makeSession("10:00", "11:00");
    const existing = [
      makeExistingSession("10:20", "10:30", "a"),
      makeExistingSession("10:40", "10:50", "b"),
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
    const existing = [makeExistingSession("09:00", "12:00")];

    const result = resolveSessionOverlaps(existing, newSession);

    expect(result.adjustedTimeSpans).toBeNull();
  });

  it("trims overlap at start", () => {
    const newSession = makeSession("10:00", "11:00");
    const existing = [makeExistingSession("09:30", "10:15")];

    const result = resolveSessionOverlaps(existing, newSession);

    expect(result.adjustedTimeSpans).toEqual([makeSession("10:15", "11:00")]);
  });

  it("trims overlap at end", () => {
    const newSession = makeSession("10:00", "11:00");
    const existing = [makeExistingSession("10:45", "11:30")];

    const result = resolveSessionOverlaps(existing, newSession);

    expect(result.adjustedTimeSpans).toEqual([makeSession("10:00", "10:45")]);
  });
});
