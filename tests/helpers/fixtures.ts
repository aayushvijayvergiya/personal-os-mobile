import type { Book, Goal, Habit, HabitEntry, Note, Project, Task } from "@/lib/types";

/** Shape of a TanStack Query result, trimmed to what the screens actually read. */
export function queryStub<T>(data: T, overrides: Record<string, unknown> = {}) {
  return {
    data,
    isLoading: false,
    isRefetching: false,
    isError: false,
    error: null,
    refetch: jest.fn(),
    ...overrides,
  };
}

/** Shape of a TanStack mutation, trimmed the same way. */
export function mutationsStub() {
  return { mutate: jest.fn(), mutateAsync: jest.fn(), isPending: false };
}

export function makeTask(over: Partial<Task> = {}): Task {
  return {
    id: "task-1",
    title: "A task",
    description: null,
    due_date: null,
    priority: 2,
    status: "open",
    completed_at: null,
    project_id: null,
    custom_fields: {},
    created_at: "2026-07-01T00:00:00Z",
    ...over,
  };
}

export function makeHabit(over: Partial<Habit> = {}): Habit {
  return { id: "habit-1", name: "Read", icon: "📚", active: true, sort_order: 0, ...over };
}

export function makeHabitEntry(over: Partial<HabitEntry> = {}): HabitEntry {
  return { id: "entry-1", habit_id: "habit-1", date: "2026-07-19", checked: true, ...over };
}

export function makeGoal(over: Partial<Goal> = {}): Goal {
  return {
    id: "goal-1",
    title: "Run a half marathon",
    description: null,
    horizon_type: "month",
    horizon_value: "2026-07",
    category_id: null,
    status: "not_started",
    custom_fields: {},
    created_at: "2026-07-01T00:00:00Z",
    ...over,
  };
}

export function makeProject(over: Partial<Project> = {}): Project {
  return {
    id: "project-1",
    name: "Kitchen remodel",
    description: null,
    color: "#000080",
    status: "active",
    target_date: null,
    ...over,
  };
}

export function makeNote(over: Partial<Note> = {}): Note {
  return {
    id: "note-1",
    title: null,
    body: "Remember the milk",
    pinned: false,
    created_at: "2026-07-01T00:00:00Z",
    ...over,
  };
}

export function makeBook(over: Partial<Book> = {}): Book {
  return {
    id: "book-1",
    title: "Deep Work",
    author: "Cal Newport",
    item_type: "book",
    status: "reading",
    rating: null,
    takeaways: null,
    link: null,
    started_at: null,
    finished_at: null,
    due_date: null,
    sort_order: 0,
    ...over,
  };
}
