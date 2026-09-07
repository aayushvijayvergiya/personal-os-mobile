import { useQuery } from "@tanstack/react-query";
import { todayISO } from "@/lib/dates";
import { keys } from "./keys";
import { supabase } from "./supabase";

/**
 * The status-bar summary: "n tasks due · x/y habits done".
 * Same three head-counts the web app's StatusBar runs. Invalidated by task and habit mutations.
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
        supabase.from("habits").select("id", { count: "exact", head: true }).eq("active", true),
        supabase
          .from("habit_entries")
          .select("id", { count: "exact", head: true })
          .eq("date", today)
          .eq("checked", true),
      ]);
      return `${due.count ?? 0} tasks due · ${done.count ?? 0}/${habits.count ?? 0} habits done`;
    },
  });
  return data ?? null;
}
