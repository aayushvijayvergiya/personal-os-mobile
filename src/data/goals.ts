import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Category, Goal, GoalStatus } from "@/lib/types";
import { rows, toastError } from "./helpers";
import { keys } from "./keys";
import { supabase } from "./supabase";

export function useGoals() {
  return useQuery({
    queryKey: keys.goals.all,
    queryFn: async () => rows<Goal>(await supabase.from("goals").select("*").order("created_at")),
  });
}

export function useCategories() {
  return useQuery({
    queryKey: keys.categories.all,
    queryFn: async () => rows<Category>(await supabase.from("categories").select("*").order("name")),
  });
}

const NEXT_STATUS: Record<GoalStatus, GoalStatus> = {
  not_started: "in_progress",
  in_progress: "done",
  done: "not_started",
};

export function useGoalMutations() {
  const qc = useQueryClient();
  const invalidate = () => {
    qc.invalidateQueries({ queryKey: keys.goals.all });
    qc.invalidateQueries({ queryKey: keys.vision.all });
  };

  const save = useMutation({
    mutationFn: async (draft: Partial<Goal>) => {
      const row = {
        title: (draft.title ?? "").trim(),
        description: draft.description || null,
        horizon_type: draft.horizon_type,
        horizon_value: draft.horizon_value,
        category_id: draft.category_id ?? null,
        status: draft.status ?? "not_started",
        custom_fields: draft.custom_fields ?? {},
      };
      const { error } = draft.id
        ? await supabase.from("goals").update(row).eq("id", draft.id)
        : await supabase.from("goals").insert(row);
      if (error) throw new Error(error.message);
    },
    onSuccess: invalidate,
    onError: toastError,
  });

  const cycleStatus = useMutation({
    mutationFn: async (goal: Goal) => {
      const { error } = await supabase
        .from("goals")
        .update({ status: NEXT_STATUS[goal.status] })
        .eq("id", goal.id);
      if (error) throw new Error(error.message);
    },
    onSuccess: invalidate,
    onError: toastError,
  });

  /** Deleting a goal first removes any vision-board card pinned to it, as the web app does. */
  const remove = useMutation({
    mutationFn: async (id: string) => {
      const cards = await supabase
        .from("vision_items")
        .delete()
        .eq("item_type", "goal")
        .contains("content", { goal_id: id });
      if (cards.error) throw new Error(cards.error.message);
      const { error } = await supabase.from("goals").delete().eq("id", id);
      if (error) throw new Error(error.message);
    },
    onSuccess: invalidate,
    onError: toastError,
  });

  return { save, cycleStatus, remove };
}

export function useCategoryMutations() {
  const qc = useQueryClient();
  const invalidate = () => qc.invalidateQueries({ queryKey: keys.categories.all });

  const create = useMutation({
    mutationFn: async ({ name, color }: { name: string; color: string }) => {
      const { error } = await supabase.from("categories").insert({ name: name.trim(), color });
      if (error) throw new Error(error.message);
    },
    onSuccess: invalidate,
    onError: toastError,
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("categories").delete().eq("id", id);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      invalidate();
      qc.invalidateQueries({ queryKey: keys.goals.all });
    },
    onError: toastError,
  });

  return { create, remove };
}
