import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Project } from "@/lib/types";
import { rows, toastError } from "./helpers";
import { keys } from "./keys";
import { supabase } from "./supabase";

/** Non-archived projects, oldest first — the same list the web app's Projects pane shows. */
export function useProjects() {
  return useQuery({
    queryKey: keys.projects.all,
    queryFn: async () =>
      rows<Project>(
        await supabase.from("projects").select("*").neq("status", "archived").order("created_at"),
      ),
  });
}

export function useProjectMutations() {
  const qc = useQueryClient();
  const invalidate = () => {
    qc.invalidateQueries({ queryKey: keys.projects.all });
    qc.invalidateQueries({ queryKey: keys.tasks.all });
  };

  const save = useMutation({
    mutationFn: async (draft: Partial<Project>) => {
      const row = {
        name: (draft.name ?? "").trim(),
        description: draft.description || null,
        color: draft.color ?? "#000080",
        status: draft.status ?? "active",
        target_date: draft.target_date || null,
      };
      const { error } = draft.id
        ? await supabase.from("projects").update(row).eq("id", draft.id)
        : await supabase.from("projects").insert(row);
      if (error) throw new Error(error.message);
    },
    onSuccess: invalidate,
    onError: toastError,
  });

  return { save };
}
