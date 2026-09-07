import { useQuery } from "@tanstack/react-query";
import { supabase } from "./supabase";

/**
 * Head-counts for the Control Panel tiles ("n items"). One `head: true` request per table, the
 * same approach the web app's settings grid uses.
 */
export function useTableCounts(tables: string[]) {
  return useQuery({
    queryKey: ["counts", ...tables],
    queryFn: async () => {
      const results = await Promise.all(
        tables.map((table) => supabase.from(table).select("id", { count: "exact", head: true })),
      );
      const counts: Record<string, number> = {};
      tables.forEach((table, i) => {
        if (results[i].count != null) counts[table] = results[i].count!;
      });
      return counts;
    },
  });
}
