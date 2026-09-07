import { monthRange, weekRange } from "./dates";

export type TaskTab = "today" | "week" | "month" | "all" | "done";

/** What a Tasks tab means as a database filter. Pure, so it can be tested without Supabase. */
export interface TaskQueryFilter {
  /** Keep rows whose `due_date` is on or before this ISO date. Undefined means "no date bound". */
  dueLte?: string;
  /** Keep only completed rows. */
  onlyDone: boolean;
  /** Drop completed rows. */
  excludeDone: boolean;
}

export const TASK_TABS: { key: TaskTab; label: string }[] = [
  { key: "today", label: "Today" },
  { key: "week", label: "This Week" },
  { key: "month", label: "This Month" },
  { key: "all", label: "All" },
  { key: "done", label: "Done" },
];

/**
 * Mirrors the web app's Tasks query exactly:
 * the Done tab shows completed rows only; every other tab optionally hides completed rows and
 * bounds the due date by today, the end of the ISO week, or the end of the month.
 */
export function taskFilterFor(tab: TaskTab, showDone: boolean, todayIso: string): TaskQueryFilter {
  if (tab === "done") return { onlyDone: true, excludeDone: false };

  const excludeDone = !showDone;
  if (tab === "today") return { dueLte: todayIso, onlyDone: false, excludeDone };
  if (tab === "week") return { dueLte: weekRange(todayIso).end, onlyDone: false, excludeDone };
  if (tab === "month") return { dueLte: monthRange(todayIso).end, onlyDone: false, excludeDone };
  return { onlyDone: false, excludeDone };
}
