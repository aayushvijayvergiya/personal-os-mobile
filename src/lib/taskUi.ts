export const PRIORITY_OPTS = [
  { value: "1", label: "P1" },
  { value: "2", label: "P2" },
  { value: "3", label: "P3" },
];

/** Which `Txt` variant a priority badge should use. Mirrors the web's `priorityClass`. */
export function priorityTone(p: number): "danger" | "muted" | "body" {
  return p === 1 ? "danger" : p === 3 ? "muted" : "body";
}
