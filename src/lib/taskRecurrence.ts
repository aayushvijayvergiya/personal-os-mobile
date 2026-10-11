import { nextOccurrence } from "./recurrence";
import type { Task } from "./types";

export type NextTaskRow = Pick<Task, "title" | "description" | "priority" | "project_id" | "custom_fields" | "recurrence">
  & { status: "open"; due_date: string };

/** The row to insert after `t` is completed, or null if `t` doesn't repeat (or has no anchor date). */
export function nextTaskRow(t: Task, todayIso: string): NextTaskRow | null {
  if (!t.recurrence || !t.due_date) return null;
  // Walk the schedule forward from the due date (keeping its phase) until the date is in the future.
  let due = t.due_date;
  for (let i = 0; i < 5000; i++) {
    due = nextOccurrence(t.recurrence, due);
    if (due > todayIso) break;
  }
  return {
    title: t.title, description: t.description, priority: t.priority, project_id: t.project_id,
    custom_fields: t.custom_fields, recurrence: t.recurrence, status: "open",
    due_date: due,
  };
}
