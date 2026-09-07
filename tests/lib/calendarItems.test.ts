import { calendarItems, periodGoalBanners } from "@/lib/calendarItems";
import { makeBook, makeGoal, makeTask } from "../helpers/fixtures";

const palette = { taskUrgent: "#red", task: "#navy", goal: "#008080", article: "#800080" };

describe("calendarItems", () => {
  it("colours priority-1 tasks differently from the rest", () => {
    const items = calendarItems(
      {
        tasks: [
          makeTask({ id: "a", due_date: "2026-07-19", priority: 1 }),
          makeTask({ id: "b", due_date: "2026-07-19", priority: 2 }),
        ],
        goals: [],
        articles: [],
      },
      palette,
    );
    expect(items.map((i) => i.color)).toEqual(["#red", "#navy"]);
  });

  it("drops undated rows", () => {
    const items = calendarItems(
      {
        tasks: [makeTask({ due_date: null })],
        goals: [],
        articles: [makeBook({ item_type: "article", due_date: null })],
      },
      palette,
    );
    expect(items).toHaveLength(0);
  });

  it("places dated goals on their day and marks completion", () => {
    const items = calendarItems(
      {
        tasks: [],
        goals: [
          makeGoal({ id: "g", horizon_type: "date", horizon_value: "2026-07-19", status: "done" }),
          makeGoal({ id: "m", horizon_type: "month", horizon_value: "2026-07" }),
        ],
        articles: [],
      },
      palette,
    );
    expect(items).toHaveLength(1);
    expect(items[0]).toMatchObject({ id: "g", date: "2026-07-19", done: true, color: "#008080" });
    expect(items[0].label).toContain("🎯");
  });

  it("marks finished articles as done", () => {
    const items = calendarItems(
      {
        tasks: [],
        goals: [],
        articles: [makeBook({ item_type: "article", due_date: "2026-07-19", status: "finished" })],
      },
      palette,
    );
    expect(items[0]).toMatchObject({ done: true, color: "#800080" });
  });
});

describe("periodGoalBanners", () => {
  const goals = [
    makeGoal({ id: "m", horizon_type: "month", horizon_value: "2026-07" }),
    makeGoal({ id: "q", horizon_type: "quarter", horizon_value: "2026-Q3" }),
    makeGoal({ id: "y", horizon_type: "year", horizon_value: "2026" }),
    makeGoal({ id: "other", horizon_type: "month", horizon_value: "2026-08" }),
    makeGoal({ id: "dated", horizon_type: "date", horizon_value: "2026-07-19" }),
    makeGoal({ id: "done", horizon_type: "month", horizon_value: "2026-07", status: "done" }),
  ];

  it("keeps only unfinished period goals covering the anchor", () => {
    const banners = periodGoalBanners(goals, "2026-07-19", "#008080");
    expect(banners.map((b) => b.id).sort()).toEqual(["m", "q", "y"]);
  });

  it("follows the anchor into another quarter", () => {
    expect(periodGoalBanners(goals, "2026-10-05", "#008080").map((b) => b.id)).toEqual(["y"]);
  });

  it("labels the banner with the period", () => {
    const [first] = periodGoalBanners(goals, "2026-07-19", "#008080");
    expect(first.label).toContain("July 2026");
  });
});
