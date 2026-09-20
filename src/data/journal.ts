import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ensureDefaultQuestions } from "@/lib/journalDefaults";
import { todayISO, weekStart } from "@/lib/dates";
import type { JournalEntry, JournalQuestion, JournalType } from "@/lib/types";
import { rows, toastError, unwrap } from "./helpers";
import { keys } from "./keys";
import { supabase } from "./supabase";

/** Active prompts for one journal type. Seeds the default set once if the table is empty. */
export function useJournalQuestions(type: JournalType) {
  return useQuery({
    queryKey: keys.journal.questions(type),
    queryFn: async () => {
      await ensureDefaultQuestions(supabase);
      return rows<JournalQuestion>(
        await supabase
          .from("journal_questions")
          .select("*")
          .eq("journal_type", type)
          .eq("active", true)
          .order("sort_order"),
      );
    },
  });
}

/** Every currently-live question including disabled ones — the Settings panel. */
export function useAllJournalQuestions() {
  return useQuery({
    queryKey: [...keys.journal.questions("daily"), "all"],
    queryFn: async () =>
      rows<JournalQuestion>(
        await supabase
          .from("journal_questions")
          .select("*")
          .is("retired_on", null)
          .order("journal_type")
          .order("sort_order"),
      ),
  });
}

/**
 * The entry for a date, created lazily on first open exactly as the web app does.
 * `journal_entries` is unique on (user_id, date, type); `user_id` defaults to auth.uid().
 */
export function useJournalEntry(type: JournalType, date: string) {
  return useQuery({
    queryKey: keys.journal.entry(type, date),
    queryFn: async () => {
      const existing = await supabase
        .from("journal_entries")
        .select("*")
        .eq("date", date)
        .eq("type", type)
        .maybeSingle();
      if (existing.error) throw new Error(existing.error.message);
      if (existing.data) return existing.data as JournalEntry;

      const created = await supabase
        .from("journal_entries")
        .upsert({ date, type }, { onConflict: "user_id,date,type" })
        .select()
        .single();
      return unwrap(created) as JournalEntry;
    },
  });
}

export function useJournalMutations(type: JournalType, date: string) {
  const qc = useQueryClient();

  /**
   * Write-through save. Deliberately does NOT invalidate: the screen owns the draft while the
   * user types, and a refetch mid-keystroke would clobber it.
   */
  const save = useMutation({
    mutationFn: async (entry: JournalEntry) => {
      const { error } = await supabase
        .from("journal_entries")
        .update({ answers: entry.answers, notes: entry.notes, day_rating: entry.day_rating })
        .eq("id", entry.id);
      if (error) throw new Error(error.message);
      return entry;
    },
    onSuccess: (entry) => qc.setQueryData(keys.journal.entry(type, date), entry),
    onError: toastError,
  });

  return { save };
}

export function useJournalQuestionMutations() {
  const qc = useQueryClient();
  const invalidate = () => qc.invalidateQueries({ queryKey: keys.journal.all });

  const create = useMutation({
    mutationFn: async ({
      prompt,
      journalType,
      sortOrder,
    }: {
      prompt: string;
      journalType: JournalType;
      sortOrder: number;
    }) => {
      const { error } = await supabase
        .from("journal_questions")
        .insert({ prompt: prompt.trim(), journal_type: journalType, sort_order: sortOrder, created_on: todayISO() });
      if (error) throw new Error(error.message);
    },
    onSuccess: invalidate,
    onError: toastError,
  });

  const setActive = useMutation({
    mutationFn: async ({ id, active }: { id: string; active: boolean }) => {
      const { error } = await supabase.from("journal_questions").update({ active }).eq("id", id);
      if (error) throw new Error(error.message);
    },
    onSuccess: invalidate,
    onError: toastError,
  });

  /** Soft-retire: keeps the row (and its past answers) but stops it showing from today on. */
  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("journal_questions").update({ retired_on: todayISO() }).eq("id", id);
      if (error) throw new Error(error.message);
    },
    onSuccess: invalidate,
    onError: toastError,
  });

  /**
   * Retires the old row and inserts a new one instead of updating `prompt` in place, so the
   * reworded text only shows from today onward. If today's (or this week's) entry already has
   * an answer under the old question, that answer is carried over to the new question's id.
   */
  const edit = useMutation({
    mutationFn: async ({ question, prompt }: { question: JournalQuestion; prompt: string }) => {
      const newPrompt = prompt.trim();
      const today = todayISO();
      const retire = await supabase.from("journal_questions").update({ retired_on: today }).eq("id", question.id);
      if (retire.error) throw new Error(retire.error.message);
      const created = await supabase
        .from("journal_questions")
        .insert({
          prompt: newPrompt,
          journal_type: question.journal_type,
          sort_order: question.sort_order,
          created_on: today,
        })
        .select()
        .single();
      if (created.error) throw new Error(created.error.message);
      const newQuestion = created.data as JournalQuestion;

      const currentDate = question.journal_type === "weekly" ? weekStart(today) : today;
      const existing = await supabase
        .from("journal_entries")
        .select("*")
        .eq("date", currentDate)
        .eq("type", question.journal_type)
        .maybeSingle();
      if (existing.error) toastError(existing.error); // best-effort: the rename already succeeded, this only affects carry-over
      const entry = existing.data as JournalEntry | null;
      const value = entry?.answers[question.id];
      if (entry && value) {
        const answers = { ...entry.answers };
        delete answers[question.id];
        answers[newQuestion.id] = value;
        const carryOver = await supabase.from("journal_entries").update({ answers }).eq("id", entry.id);
        if (carryOver.error) toastError(carryOver.error);
      }
    },
    // onSettled (not onSuccess): if retire succeeded but the insert or carry-over step failed
    // partway through, the query cache must still refresh so the list reflects the row that
    // was in fact retired, instead of going stale showing a question no longer live.
    onSettled: invalidate,
    onError: toastError,
  });

  return { create, setActive, remove, edit };
}
