// __tests__/getTimeFragmentSession.test.ts
import { getTimeFragmentSession } from "../src/utils/helper";
import { TablesInsert } from "../src/types/db.types";

function makeBaseSession(): TablesInsert<"timer_session"> {
  return {
    id: "1",
    user_id: "u1",
    project_id: "p1",
    start_time: new Date().toISOString(),
    end_time: new Date().toISOString(),
    created_at: new Date().toISOString(),
    true_end_time: new Date().toISOString(),
    active_seconds: 0,
    paused_seconds: 0,
    currency: "USD",
    hourly_payment: false,
    memo: "",
    payed: false,
    payout_id: null,
    real_start_time: null,
    salary: 0,
    time_fragments_interval: null,
  };
}

describe("getTimeFragmentSession", () => {
  it("aligns start and end to the nearest 10min blocks", () => {
    const start = new Date("2023-01-01T17:17:00Z");
    const end = new Date("2023-01-01T17:36:00Z");
    const session = getTimeFragmentSession(10, {
      ...makeBaseSession(),
      start_time: start.toISOString(),
      end_time: end.toISOString(),
    });

    expect(session.start_time).toBe("2023-01-01T17:10:00.000Z");
    expect(session.end_time).toBe("2023-01-01T17:40:00.000Z");
    expect(session.active_seconds).toBe(30 * 60); // 30 minutes
    expect(session.time_fragments_interval).toBe(10);
  });

  it("extends end time if start and end land in the same block", () => {
    const start = new Date("2023-01-01T17:02:00Z");
    const end = new Date("2023-01-01T17:03:00Z");
    const session = getTimeFragmentSession(5, {
      ...makeBaseSession(),
      start_time: start.toISOString(),
      end_time: end.toISOString(),
    });

    expect(session.start_time).toBe("2023-01-01T17:00:00.000Z");
    expect(session.end_time).toBe("2023-01-01T17:05:00.000Z");
    expect(session.active_seconds).toBe(300); // 5 minutes
  });

  it("handles exact block boundaries", () => {
    const start = new Date("2023-01-01T18:00:00Z");
    const end = new Date("2023-01-01T19:00:00Z");
    const session = getTimeFragmentSession(30, {
      ...makeBaseSession(),
      start_time: start.toISOString(),
      end_time: end.toISOString(),
    });

    expect(session.start_time).toBe("2023-01-01T18:00:00.000Z");
    expect(session.end_time).toBe("2023-01-01T19:00:00.000Z");
    expect(session.active_seconds).toBe(60 * 60); // 1 hour
  });
});
