import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Habit, HabitEntry } from "@/lib/types";
import { rows, toastError } from "./helpers";
import { keys } from "./keys";
import { supabase } from "./supabase";

/** All habits including retired ones, in sort order. Screens filter by `active` themselves. */
export function useHabits() {
  return useQuery({
    queryKey: keys.habits.all,
    queryFn: async () => rows<Habit>(await supabase.from("habits").select("*").order("sort_order")),
  });
}

export function useHabitEntries(from: string, to: string) {
  return useQuery({
    queryKey: keys.habitEntries.range(from, to),
    queryFn: async () =>
      rows<HabitEntry>(
        await supabase.from("habit_entries").select("*").gte("date", from).lte("date", to),
      ),
  });
}

export function useHabitMutations() {
  const qc = useQueryClient();
  const invalidateHabits = () => qc.invalidateQueries({ queryKey: keys.habits.all });
  const invalidateEntries = () => {
    qc.invalidateQueries({ queryKey: keys.habitEntries.all });
    qc.invalidateQueries({ queryKey: keys.stats });
  };

  /**
   * Optimistic check/uncheck. `habit_entries` is unique on (habit_id, date), so an upsert on that
   * constraint is safe whether or not a row exists — the same call the web app makes.
   */
  const toggle = useMutation({
    mutationFn: async ({
      habitId,
      date,
      checked,
    }: {
      habitId: string;
      date: string;
      checked: boolean;
    }) => {
      const { error } = await supabase
        .from("habit_entries")
        .upsert({ habit_id: habitId, date, checked }, { onConflict: "habit_id,date" });
      if (error) throw new Error(error.message);
    },
    onMutate: async ({ habitId, date, checked }) => {
      await qc.cancelQueries({ queryKey: keys.habitEntries.all });
      const snapshot = qc.getQueriesData<HabitEntry[]>({ queryKey: keys.habitEntries.all });
      for (const [key, list] of snapshot) {
        if (!Array.isArray(list)) continue;
        const existing = list.find((e) => e.habit_id === habitId && e.date === date);
        qc.setQueryData(
          key,
          existing
            ? list.map((e) => (e === existing ? { ...e, checked } : e))
            : [...list, { id: `optimistic:${habitId}:${date}`, habit_id: habitId, date, checked }],
        );
      }
      return { snapshot };
    },
    onError: (error, _vars, context) => {
      context?.snapshot.forEach(([key, data]) => qc.setQueryData(key, data));
      toastError(error);
    },
    onSettled: invalidateEntries,
  });

  const create = useMutation({
    mutationFn: async ({ name, sortOrder }: { name: string; sortOrder: number }) => {
      const { error } = await supabase.from("habits").insert({ name: name.trim(), sort_order: sortOrder });
      if (error) throw new Error(error.message);
    },
    onSuccess: invalidateHabits,
    onError: toastError,
  });

  const rename = useMutation({
    mutationFn: async ({ id, name }: { id: string; name: string }) => {
      const { error } = await supabase.from("habits").update({ name: name.trim() }).eq("id", id);
      if (error) throw new Error(error.message);
    },
    onSuccess: invalidateHabits,
    onError: toastError,
  });

  const setActive = useMutation({
    mutationFn: async ({ id, active }: { id: string; active: boolean }) => {
      const { error } = await supabase.from("habits").update({ active }).eq("id", id);
      if (error) throw new Error(error.message);
    },
    onSuccess: invalidateHabits,
    onError: toastError,
  });

  /** Swap two habits' sort_order, the same two-write move the web app uses. */
  const swapOrder = useMutation({
    mutationFn: async ({ a, b }: { a: Habit; b: Habit }) => {
      const [r1, r2] = await Promise.all([
        supabase.from("habits").update({ sort_order: b.sort_order }).eq("id", a.id),
        supabase.from("habits").update({ sort_order: a.sort_order }).eq("id", b.id),
      ]);
      if (r1.error) throw new Error(r1.error.message);
      if (r2.error) throw new Error(r2.error.message);
    },
    onSuccess: invalidateHabits,
    onError: toastError,
  });

  return { toggle, create, rename, setActive, swapOrder };
}
