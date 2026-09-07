/**
 * The two calendar colours that are not theme tokens. Goals and articles need to stay
 * distinguishable from tasks in every theme, so they are fixed — the same teal and purple the
 * web app uses.
 */
export const CALENDAR_FIXED = {
  goal: "#008080",
  article: "#800080",
} as const;

export interface CalendarPalette {
  /** Priority-1 tasks. */
  taskUrgent: string;
  /** All other tasks. */
  task: string;
  goal: string;
  article: string;
}
