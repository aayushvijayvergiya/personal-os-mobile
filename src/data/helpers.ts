import { showToast } from "@/ui/Toast";

interface Result<T> {
  data: T;
  error: { message: string } | null;
}

/** Throw Supabase errors so TanStack Query can see them; return the rows otherwise. */
export function unwrap<T>(res: Result<T>): T {
  if (res.error) throw new Error(res.error.message);
  return res.data;
}

/** Same, for list queries where a null payload means "no rows". */
export function rows<T>(res: Result<T[] | null>): T[] {
  return unwrap(res) ?? [];
}

/** Every mutation reports failures the same way the web app did: a retro toast. */
export function toastError(error: unknown): void {
  showToast(error instanceof Error ? error.message : String(error));
}
