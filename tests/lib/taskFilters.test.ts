import { taskFilterFor } from "@/lib/taskFilters";

const TODAY = "2026-07-19"; // a Sunday: ISO week ends the same day, month ends 2026-07-31

describe("taskFilterFor", () => {
  it("Done tab shows only completed rows and ignores due dates", () => {
    expect(taskFilterFor("done", false, TODAY)).toEqual({ onlyDone: true, excludeDone: false });
    // showDone is irrelevant on the Done tab
    expect(taskFilterFor("done", true, TODAY)).toEqual({ onlyDone: true, excludeDone: false });
  });

  it("Today bounds by today", () => {
    expect(taskFilterFor("today", false, TODAY)).toEqual({
      dueLte: "2026-07-19",
      onlyDone: false,
      excludeDone: true,
    });
  });

  it("This Week bounds by the end of the ISO week", () => {
    expect(taskFilterFor("week", false, TODAY).dueLte).toBe("2026-07-19");
    expect(taskFilterFor("week", false, "2026-07-13").dueLte).toBe("2026-07-19");
  });

  it("This Month bounds by the end of the month", () => {
    expect(taskFilterFor("month", false, TODAY).dueLte).toBe("2026-07-31");
  });

  it("All applies no date bound", () => {
    expect(taskFilterFor("all", false, TODAY)).toEqual({ onlyDone: false, excludeDone: true });
  });

  it("showDone stops completed rows being excluded", () => {
    for (const tab of ["today", "week", "month", "all"] as const) {
      expect(taskFilterFor(tab, true, TODAY).excludeDone).toBe(false);
      expect(taskFilterFor(tab, false, TODAY).excludeDone).toBe(true);
    }
  });
});
