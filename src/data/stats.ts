import { useQuery } from "@tanstack/react-query";
import { todayISO } from "@/lib/dates";
import { isScheduled, withSchedule } from "@/lib/recurrence";
import { keys } from "./keys";
import { supabase } from "./supabase";

/**
 * The status-bar summary: "n tasks due · x/y habits done".
 * Same head-counts the web app's StatusBar runs; the habit counts cover habits scheduled today.
 * Invalidated by task and habit mutations.
 */
export function useStats(): string | null {
  const { data } = useQuery({
    queryKey: keys.stats,
    queryFn: async () => {
      const today = todayISO();
      const [due, habits, done] = await Promise.all([
        supabase
          .from("tasks")
          .select("id", { count: "exact", head: true })
          .is("project_id", null)
          .neq("status", "done")
          .lte("due_date", today),
        supabase.from("habits").select("id, schedule_days").eq("active", true),
        supabase.from("habit_entries").select("habit_id").eq("date", today).eq("checked", true),
      ]);
      const scheduled = new Set(
        ((habits.data ?? []) as { id: string; schedule_days?: number[] }[])
          .filter((h) => isScheduled(withSchedule(h).schedule_days, today))
          .map((h) => h.id),
      );
      const habitsDone = ((done.data ?? []) as { habit_id: string }[]).filter((e) => scheduled.has(e.habit_id)).length;
      return `${due.count ?? 0} tasks due · ${habitsDone}/${scheduled.size} habits done`;
    },
  });
  return data ?? null;
}
