import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { VisionItem } from "@/lib/types";
import { rows, toastError } from "./helpers";
import { keys } from "./keys";
import { supabase } from "./supabase";

export function useVisionItems() {
  return useQuery({
    queryKey: keys.vision.all,
    queryFn: async () =>
      rows<VisionItem>(await supabase.from("vision_items").select("*").order("z_index")),
  });
}

export function useVisionMutations() {
  const qc = useQueryClient();
  const invalidate = () => qc.invalidateQueries({ queryKey: keys.vision.all });

  const create = useMutation({
    mutationFn: async (item: {
      item_type: VisionItem["item_type"];
      content: VisionItem["content"];
      pos_x: number;
      pos_y: number;
      rotation: number;
      z_index: number;
    }) => {
      const { error } = await supabase.from("vision_items").insert(item);
      if (error) throw new Error(error.message);
    },
    onSuccess: invalidate,
    onError: toastError,
  });

  /**
   * Persists a drag. Optimistic and without invalidation on success: the card is already where the
   * finger left it, and a refetch would make it jump.
   */
  const move = useMutation({
    mutationFn: async ({
      id,
      pos_x,
      pos_y,
      z_index,
    }: {
      id: string;
      pos_x: number;
      pos_y: number;
      z_index: number;
    }) => {
      const { error } = await supabase.from("vision_items").update({ pos_x, pos_y, z_index }).eq("id", id);
      if (error) throw new Error(error.message);
    },
    onMutate: async (next) => {
      await qc.cancelQueries({ queryKey: keys.vision.all });
      const previous = qc.getQueryData<VisionItem[]>(keys.vision.all);
      if (previous) {
        qc.setQueryData(
          keys.vision.all,
          previous.map((it) => (it.id === next.id ? { ...it, ...next } : it)),
        );
      }
      return { previous };
    },
    onError: (error, _vars, context) => {
      if (context?.previous) qc.setQueryData(keys.vision.all, context.previous);
      toastError(error);
    },
  });

  const updateContent = useMutation({
    mutationFn: async ({ id, content }: { id: string; content: VisionItem["content"] }) => {
      const { error } = await supabase.from("vision_items").update({ content }).eq("id", id);
      if (error) throw new Error(error.message);
    },
    onSuccess: invalidate,
    onError: toastError,
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("vision_items").delete().eq("id", id);
      if (error) throw new Error(error.message);
    },
    onSuccess: invalidate,
    onError: toastError,
  });

  return { create, move, updateContent, remove };
}
