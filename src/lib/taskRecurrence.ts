import { nextOccurrence } from "./recurrence";
import type { Task } from "./types";

export type NextTaskRow = Pick<Task, "title" | "description" | "priority" | "project_id" | "custom_fields" | "recurrence">
  & { status: "open"; due_date: string };

/** The row to insert after `t` is completed, or null if `t` doesn't repeat (or has no anchor date). */
export function nextTaskRow(t: Task, todayIso: string): NextTaskRow | null {
  if (!t.recurrence || !t.due_date) return null;
  // Anchor on the schedule, but never produce a date that is already in the past.
  const base = t.due_date > todayIso ? t.due_date : todayIso;
  return {
    title: t.title, description: t.description, priority: t.priority, project_id: t.project_id,
    custom_fields: t.custom_fields, recurrence: t.recurrence, status: "open",
    due_date: nextOccurrence(t.recurrence, base),
  };
}
