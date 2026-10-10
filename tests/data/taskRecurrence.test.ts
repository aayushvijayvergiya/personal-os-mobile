import { spawnNext } from "@/data/taskRecurrence";
import { makeTask } from "../helpers/fixtures";

const mockInserted: unknown[] = [];
let mockExisting: unknown[] = [];

jest.mock("@/data/supabase", () => {
  // Minimal chainable stand-in for the supabase-js query builder.
  const q: Record<string, unknown> = {};
  for (const m of ["select", "eq", "neq", "is"]) q[m] = () => q;
  q.limit = () => Promise.resolve({ data: mockExisting, error: null });
  q.insert = (row: unknown) => {
    mockInserted.push(row);
    return Promise.resolve({ error: null });
  };
  return { supabase: { from: () => q } };
});

const repeating = makeTask({
  title: "Water plants",
  due_date: "2026-10-05",
  status: "done",
  recurrence: { freq: "weekly", interval: 1, days: [0] },
});

describe("spawnNext", () => {
  beforeEach(() => {
    mockInserted.length = 0;
    mockExisting = [];
  });

  it("inserts the next occurrence", async () => {
    await spawnNext(repeating, "2026-10-05");
    expect(mockInserted).toHaveLength(1);
  });

  it("skips when an identical open occurrence already exists (complete → reopen → complete)", async () => {
    mockExisting = [{ id: "already-there" }];
    await spawnNext(repeating, "2026-10-05");
    expect(mockInserted).toHaveLength(0);
  });
});
