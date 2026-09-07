import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { FieldDefinition } from "@/lib/types";
import { rows, toastError } from "./helpers";
import { keys } from "./keys";
import { supabase } from "./supabase";

export function useFieldDefinitions(entity: "task" | "goal") {
  return useQuery({
    queryKey: keys.fieldDefs.forEntity(entity),
    queryFn: async () =>
      rows<FieldDefinition>(
        await supabase.from("field_definitions").select("*").eq("entity", entity).order("sort_order"),
      ),
  });
}

/** Both entities at once — the Settings panel lists them together. */
export function useAllFieldDefinitions() {
  return useQuery({
    queryKey: [...keys.fieldDefs.all, "list"],
    queryFn: async () =>
      rows<FieldDefinition>(
        await supabase.from("field_definitions").select("*").order("entity").order("sort_order"),
      ),
  });
}

export function useFieldDefinitionMutations() {
  const qc = useQueryClient();
  const invalidate = () => qc.invalidateQueries({ queryKey: keys.fieldDefs.all });

  const create = useMutation({
    mutationFn: async (def: {
      entity: "task" | "goal";
      name: string;
      field_type: FieldDefinition["field_type"];
      options: string[] | null;
      sort_order: number;
    }) => {
      const { error } = await supabase
        .from("field_definitions")
        .insert({ ...def, name: def.name.trim() });
      if (error) throw new Error(error.message);
    },
    onSuccess: invalidate,
    onError: toastError,
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("field_definitions").delete().eq("id", id);
      if (error) throw new Error(error.message);
    },
    onSuccess: invalidate,
    onError: toastError,
  });

  return { create, remove };
}
