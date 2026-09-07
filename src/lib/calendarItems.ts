import type { CalendarPalette } from "./calendarColors";
import { horizonLabel } from "./horizons";
import type { Book, Goal, Task } from "./types";

export interface CalItem {
  id: string;
  date: string;
  label: string;
  color: string;
  done: boolean;
}

export interface CalBanner {
  id: string;
  label: string;
  color: string;
}

/**
 * Flattens the three dated sources into calendar cells.
 * Only dated goals land on a day; month, quarter and year goals become banners instead.
 */
export function calendarItems(
  input: { tasks: Task[]; goals: Goal[]; articles: Book[] },
  palette: CalendarPalette,
): CalItem[] {
  return [
    ...input.tasks
      .filter((t) => t.due_date)
      .map((t) => ({
        id: t.id,
        date: t.due_date!,
        label: t.title,
        done: t.status === "done",
        color: t.priority === 1 ? palette.taskUrgent : palette.task,
      })),
    ...input.goals
      .filter((g) => g.horizon_type === "date")
      .map((g) => ({
        id: g.id,
        date: g.horizon_value,
        label: `🎯 ${g.title}`,
        done: g.status === "done",
        color: palette.goal,
      })),
    ...input.articles
      .filter((a) => a.due_date)
      .map((a) => ({
        id: a.id,
        date: a.due_date!,
        label: `📰 ${a.title}`,
        done: a.status === "finished",
        color: palette.article,
      })),
  ];
}

/**
 * Unfinished month, quarter and year goals whose period contains the anchor date. These sit in a
 * strip above the grid because they belong to a range, not a day.
 */
export function periodGoalBanners(goals: Goal[], anchorIso: string, color: string): CalBanner[] {
  const [year, month] = anchorIso.split("-").map(Number);
  const wanted: Record<string, string> = {
    month: `${year}-${String(month).padStart(2, "0")}`,
    quarter: `${year}-Q${Math.ceil(month / 3)}`,
    year: String(year),
  };
  return goals
    .filter((g) => g.status !== "done")
    .filter((g) => g.horizon_type !== "date" && g.horizon_value === wanted[g.horizon_type])
    .map((g) => ({
      id: g.id,
      label: `${g.title} (${horizonLabel(g.horizon_type, g.horizon_value)})`,
      color,
    }));
}
