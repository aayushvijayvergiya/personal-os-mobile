import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Note } from "@/lib/types";
import { rows, toastError } from "./helpers";
import { keys } from "./keys";
import { supabase } from "./supabase";

/** Pinned first, then newest. */
export function useNotes() {
  return useQuery({
    queryKey: keys.notes.all,
    queryFn: async () =>
      rows<Note>(
        await supabase
          .from("notes")
          .select("*")
          .order("pinned", { ascending: false })
          .order("created_at", { ascending: false }),
      ),
  });
}

export function usePinnedNotes(limit = 5) {
  return useQuery({
    queryKey: [...keys.notes.all, "pinned", limit],
    queryFn: async () =>
      rows<Note>(
        await supabase
          .from("notes")
          .select("*")
          .eq("pinned", true)
          .order("created_at", { ascending: false })
          .limit(limit),
      ),
  });
}

export function useNoteMutations() {
  const qc = useQueryClient();
  const invalidate = () => qc.invalidateQueries({ queryKey: keys.notes.all });

  const create = useMutation({
    mutationFn: async (body: string) => {
      const { error } = await supabase.from("notes").insert({ body: body.trim() });
      if (error) throw new Error(error.message);
    },
    onSuccess: invalidate,
    onError: toastError,
  });

  const update = useMutation({
    mutationFn: async (note: Note) => {
      const { error } = await supabase
        .from("notes")
        .update({ title: note.title, body: note.body })
        .eq("id", note.id);
      if (error) throw new Error(error.message);
    },
    onSuccess: invalidate,
    onError: toastError,
  });

  const togglePin = useMutation({
    mutationFn: async (note: Note) => {
      const { error } = await supabase.from("notes").update({ pinned: !note.pinned }).eq("id", note.id);
      if (error) throw new Error(error.message);
    },
    onSuccess: invalidate,
    onError: toastError,
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("notes").delete().eq("id", id);
      if (error) throw new Error(error.message);
    },
    onSuccess: invalidate,
    onError: toastError,
  });

  return { create, update, togglePin, remove };
}
