import type { JournalType } from "@/lib/types";
import type { TaskTab } from "@/lib/taskFilters";

export interface TaskListKey {
  tab: TaskTab;
  showDone: boolean;
}

/**
 * Query-key factory. Every hook in `src/data` takes its keys from here, and every key is prefixed
 * with its table name so one `invalidateQueries({ queryKey: keys.<table>.all })` refreshes them all.
 */
export const keys = {
  tasks: {
    all: ["tasks"] as const,
    list: (k: TaskListKey) => ["tasks", "list", k.tab, k.showDone] as const,
    dueOn: (date: string) => ["tasks", "dueOn", date] as const,
    dueUpTo: (date: string) => ["tasks", "dueUpTo", date] as const,
    completedOn: (date: string) => ["tasks", "completedOn", date] as const,
    range: (from: string, to: string) => ["tasks", "range", from, to] as const,
    project: ["tasks", "project"] as const,
  },
  projects: { all: ["projects"] as const },
  goals: { all: ["goals"] as const },
  categories: { all: ["categories"] as const },
  habits: { all: ["habits"] as const },
  habitEntries: {
    all: ["habit_entries"] as const,
    range: (from: string, to: string) => ["habit_entries", from, to] as const,
  },
  journal: {
    all: ["journal"] as const,
    questions: (t: JournalType) => ["journal", "questions", t] as const,
    entry: (t: JournalType, d: string) => ["journal", "entry", t, d] as const,
  },
  notes: { all: ["notes"] as const },
  books: { all: ["books"] as const },
  fieldDefs: {
    all: ["field_definitions"] as const,
    forEntity: (entity: "task" | "goal") => ["field_definitions", entity] as const,
  },
  vision: { all: ["vision_items"] as const },
  stats: ["stats"] as const,
};
