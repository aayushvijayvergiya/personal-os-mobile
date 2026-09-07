import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { todayISO } from "@/lib/dates";
import type { Book } from "@/lib/types";
import { rows, toastError } from "./helpers";
import { keys } from "./keys";
import { supabase } from "./supabase";

/** The whole shelf. Screens filter by `item_type` and `status`; sorting uses `sortReadingItems`. */
export function useBooks() {
  return useQuery({
    queryKey: keys.books.all,
    queryFn: async () =>
      rows<Book>(
        await supabase
          .from("books")
          .select("*")
          .order("sort_order")
          .order("created_at", { ascending: false }),
      ),
  });
}

export interface BookDraft {
  title: string;
  item_type: Book["item_type"];
  author?: string | null;
  link?: string | null;
  due_date?: string | null;
}

export function useBookMutations() {
  const qc = useQueryClient();
  const invalidate = () => qc.invalidateQueries({ queryKey: keys.books.all });

  const create = useMutation({
    mutationFn: async (draft: BookDraft) => {
      const { error } = await supabase.from("books").insert({
        title: draft.title.trim(),
        item_type: draft.item_type,
        author: draft.item_type === "book" ? (draft.author?.trim() || null) : null,
        link: draft.item_type === "article" ? (draft.link?.trim() || null) : null,
        due_date: draft.due_date || null,
      });
      if (error) throw new Error(error.message);
    },
    onSuccess: invalidate,
    onError: toastError,
  });

  /**
   * Shelf move. Entering `reading` stamps `started_at` once; entering `finished` stamps
   * `finished_at`; leaving `finished` clears both `finished_at` and the rating — as on the web.
   */
  const move = useMutation({
    mutationFn: async ({ item, status }: { item: Book; status: Book["status"] }) => {
      const patch: Partial<Book> = { status };
      if (status === "reading" && !item.started_at) patch.started_at = todayISO();
      if (status === "finished") patch.finished_at = todayISO();
      else if (item.status === "finished") {
        patch.finished_at = null;
        patch.rating = null;
      }
      const { error } = await supabase.from("books").update(patch).eq("id", item.id);
      if (error) throw new Error(error.message);
    },
    onSuccess: invalidate,
    onError: toastError,
  });

  const finish = useMutation({
    mutationFn: async ({
      id,
      rating,
      takeaways,
    }: {
      id: string;
      rating: number | null;
      takeaways: string | null;
    }) => {
      const { error } = await supabase
        .from("books")
        .update({ status: "finished", rating, takeaways, finished_at: todayISO() })
        .eq("id", id);
      if (error) throw new Error(error.message);
    },
    onSuccess: invalidate,
    onError: toastError,
  });

  const update = useMutation({
    mutationFn: async (item: Book) => {
      const { error } = await supabase
        .from("books")
        .update({
          title: item.title,
          author: item.author,
          link: item.link,
          due_date: item.due_date || null,
          rating: item.rating,
          takeaways: item.takeaways,
        })
        .eq("id", item.id);
      if (error) throw new Error(error.message);
    },
    onSuccess: invalidate,
    onError: toastError,
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("books").delete().eq("id", id);
      if (error) throw new Error(error.message);
    },
    onSuccess: invalidate,
    onError: toastError,
  });

  return { create, move, finish, update, remove };
}
