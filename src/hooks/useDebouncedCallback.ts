import { useCallback, useEffect, useRef } from "react";

/**
 * Calls `fn` at most once per `delay` ms of quiet. Used by the journal's autosave so typing
 * doesn't fire a write per keystroke. Flushes nothing on unmount by design — the caller keeps
 * the latest value in local state and the next mount re-reads from the server.
 */
export function useDebouncedCallback<A extends unknown[]>(fn: (...args: A) => void, delay: number) {
  const latest = useRef(fn);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    latest.current = fn;
  }, [fn]);

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  return useCallback(
    (...args: A) => {
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => latest.current(...args), delay);
    },
    [delay],
  );
}
